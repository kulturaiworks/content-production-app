import { useState, useEffect, useRef } from 'react'
import { useProduction } from '../context/ProductionContext'
import { useAuth } from '../context/AuthContext'
import { MEDIA_LIST, getTemplatesForMedia, getVisibleFields, getFieldLabel } from '../data/mediaData'
import { getProductionStatus } from '../lib/supabase'

// n8n Webhook URL
const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_ONE_CLICK
const DRAFT_GEN_WEBHOOK = import.meta.env.VITE_WEBHOOK_DRAFT_GEN
const SLACK_WEBHOOK = import.meta.env.VITE_SLACK_COPYWRITING_WEBHOOK

export default function OneClick() {
    const { status, setStatus, setOutput, setError, reset } = useProduction()
    const { user, incrementWorkCount } = useAuth()

    // State
    const [sendStatus, setSendStatus] = useState(null) // null | 'sending' | 'sent' | 'error'
    const [step, setStep] = useState(1)
    const [isLoaded, setIsLoaded] = useState(false) // Safety flag for autosave
    const [hasArticle, setHasArticle] = useState(false)
    const [postLink, setPostLink] = useState('')
    const [article, setArticle] = useState({ headline: '', body: '' })

    // Step 2 Selection
    const [selectedMedias, setSelectedMedias] = useState([])
    const [selectedContentType, setSelectedContentType] = useState('')

    // Step 3 Drafts
    const [contentCards, setContentCards] = useState([])

    // Resubmit mode
    // Resubmit mode
    const [resubmitCardId, setResubmitCardId] = useState(null)

    // --- POLLING & STATUS SYNC ---
    // Use ref to access latest state inside interval without resetting it
    const cardsRef = useRef(contentCards)
    useEffect(() => { cardsRef.current = contentCards }, [contentCards])

    useEffect(() => {
        const interval = setInterval(async () => {
            const currentCards = cardsRef.current
            const processingCards = currentCards.filter(c => c.status === 'processing' && c.recordId)

            // Sync global indicator
            const isAnyProcessing = currentCards.some(c => c.status === 'processing')
            if (isAnyProcessing) {
                setStatus('producing')
            } else if (step === 4 && currentCards.some(c => c.status === 'done')) {
                // If done and no processing left
                setStatus('ready')
            }

            if (processingCards.length > 0) {
                let updated = false
                const newCards = [...currentCards]

                for (let i = 0; i < newCards.length; i++) {
                    const card = newCards[i]
                    if (card.status === 'processing' && card.recordId) {
                        try {
                            const statusData = await getProductionStatus(card.recordId)
                            if (statusData) {
                                const s = statusData.status?.toUpperCase()
                                if (['DONE', 'COMPLETED', 'SUCCESS'].includes(s)) {
                                    console.log(`[Poll] Card ${card.id} DONE! URL: ${statusData.output_url}`)
                                    newCards[i] = {
                                        ...card,
                                        status: 'done',
                                        result: { output_url: statusData.output_url }
                                    }
                                    updated = true
                                    incrementWorkCount()
                                } else if (['ERROR', 'FAILED'].includes(s)) {
                                    console.log(`[Poll] Card ${card.id} FAILED`)
                                    newCards[i] = { ...card, status: 'error', error: 'Production failed' }
                                    updated = true
                                }
                            }
                        } catch (err) {
                            console.error('Poll error', err)
                        }
                    }
                }

                if (updated) setContentCards(newCards)
            }
        }, 3000)

        return () => clearInterval(interval)
    }, [step, setStatus, incrementWorkCount])

    // --- AUTO-SAVE LOGIC ---
    // --- AUTO-SAVE LOGIC ---
    // Load on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem('oneclick_batch_autosave')
            if (saved) {
                const data = JSON.parse(saved)
                // Restore state
                if (data.step) setStep(data.step)
                if (data.postLink) setPostLink(data.postLink)
                if (data.article) setArticle(data.article)
                if (data.selectedMedias) setSelectedMedias(data.selectedMedias)
                if (data.selectedContentType) setSelectedContentType(data.selectedContentType)
                if (data.contentCards) setContentCards(data.contentCards)
                console.log('Restored OneClick session')
            }
        } catch (e) {
            console.error('Failed to load autosave:', e)
        } finally {
            setIsLoaded(true)
        }
    }, [])

    // Save on change
    useEffect(() => {
        if (!isLoaded) return

        const timeoutId = setTimeout(() => {
            const dataToSave = {
                step,
                postLink,
                article,
                selectedMedias,
                selectedContentType,
                contentCards,
                timestamp: Date.now()
            }
            localStorage.setItem('oneclick_batch_autosave', JSON.stringify(dataToSave))
        }, 1000)
        return () => clearTimeout(timeoutId)
    }, [step, postLink, article, selectedMedias, selectedContentType, contentCards, isLoaded])
    // -----------------------

    const handleGenerateArticle = async () => {
        if (!postLink.trim()) {
            alert('Please enter a valid link')
            return
        }

        setSendStatus('sending')
        try {
            const userMention = user?.slackMemberId ? `<@${user.slackMemberId}>` : (user?.email || 'Unknown')

            await fetch(SLACK_WEBHOOK, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: `✍️ *COPYWRITING REQUEST*\n\n🎯 *Output:* Headline + Body Article\n📝 *Input Type:* Link\n👤 *Requester:* ${userMention}\n\n📄 *Content:*\n${postLink}\n\ncc: <@U0AD664M60J>`
                })
            })

            setSendStatus('sent')
        } catch (error) {
            console.error('Slack Error:', error)
            setSendStatus('error')
            alert('Failed to send to Slack')
        }
    }

    const handleSkipArticle = () => {
        setHasArticle(true)
        setArticle({ headline: '', body: '' })
        setStep(2)
    }

    const toggleMedia = (media) => {
        if (selectedMedias.includes(media)) {
            setSelectedMedias(prev => prev.filter(m => m !== media))
        } else {
            if (selectedMedias.length >= 5) {
                alert('Max 5 media allowed')
                return
            }
            setSelectedMedias(prev => [...prev, media])
        }
    }

    const handleGenerateDrafts = async () => {
        if (!article.headline.trim()) {
            alert('Headline is required')
            return
        }

        setStatus('producing')

        try {
            // PARALLEL REQUESTS: Fire one webhook per media to ensure distinct Persona processing
            const promises = selectedMedias.map(async (media) => {
                // Map Frontend Type to N8N Router Type (Title Case)
                let n8nType = 'Image'
                if (selectedContentType === 'image') n8nType = 'Image'
                if (selectedContentType === 'video') n8nType = 'Video'
                if (selectedContentType === 'carousel_image') n8nType = 'Carousel Image'
                if (selectedContentType === 'carousel_video') n8nType = 'Carousel Video'

                const response = await fetch(DRAFT_GEN_WEBHOOK, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'generate_content',
                        article: article,
                        media: media, // Send SINGLE media
                        medias: [media], // Legacy support (optional)
                        type: n8nType
                    })
                })

                if (!response.ok) throw new Error(`Failed for ${media}`)
                const rawData = await response.json()
                console.log(`[Generate] N8n Response for ${media}:`, rawData)

                // Robust Parsing: Handle Array/Object/Wrapper structures
                let cards = []
                // Normalize: If array of 1 wrapper object, unwrap it
                let rootData = Array.isArray(rawData) ? (rawData.length === 1 ? rawData[0] : rawData) : rawData

                if (rootData.cards && Array.isArray(rootData.cards)) {
                    cards = rootData.cards
                } else if (rootData.data && Array.isArray(rootData.data)) {
                    cards = rootData.data
                } else if (rootData.items && Array.isArray(rootData.items)) {
                    cards = rootData.items
                } else if (Array.isArray(rootData)) {
                    // Check if it's array of wrapper objects or array of cards
                    // Heuristic: If first item has 'cards' property, it's wrapper array
                    if (rootData[0] && rootData[0].cards) {
                        cards = rootData.flatMap(item => item.cards || [])
                    } else {
                        cards = rootData // Assume array of cards
                    }
                } else {
                    // Single object
                    cards = [rootData]
                }

                // CAROUSEL VIDEO LOGIC: Force 2 Cards (1 Cover Image + 1 Slide Video)
                if (selectedContentType === 'carousel_video') {
                    // Ensure minimum 2 cards (duplicate if needed to guarantee Slide exists)
                    if (cards.length < 2) {
                        cards.push({ ...cards[0] }) // Clone to ensure structure exists
                    }

                    // Take max 2 cards
                    cards = cards.slice(0, 2)

                    // Force specific types
                    cards.forEach((c, idx) => {
                        if (idx === 0) {
                            c.contentType = 'carousel_image' // Cover is Image
                            c.cardType = 'Headline'
                        } else {
                            c.contentType = 'carousel_video' // Slide is Video
                            c.cardType = 'Slide'
                            // Clear fields for the forced slide if it was cloned
                            if (!c.text_1 || c.text_1 === cards[0].text_1) c.text_1 = ''
                        }
                    })
                }

                return cards
            })

            const results = await Promise.all(promises)

            // INJECT MEDIA NAME FROM CONTEXT (Fixes "Unknown Media")
            const allCardsWithMedia = results.map((cards, i) => {
                const mediaName = selectedMedias[i]
                return cards.map(c => ({ ...c, media: mediaName }))
            }).flat()

            const newCards = allCardsWithMedia.map((card, index) => {
                console.log(`[Generate] Raw Card ${index} from N8n:`, card)

                // Intelligent Mapping: Handle various N8N return structures
                // Priority: card.fields > card.json > card > flat properties
                const rawData = card.fields || card.json || card || {}
                const finalFields = { ...rawData }

                // Helper: Case-insensitive search for value
                const findVal = (keys) => {
                    for (const key of keys) {
                        // 1. Exact match
                        if (rawData[key]) return rawData[key]
                        // 2. Case-insensitive match from object keys
                        const foundKey = Object.keys(rawData).find(k => k.toLowerCase() === key.toLowerCase())
                        if (foundKey && rawData[foundKey]) return rawData[foundKey]
                    }
                    return ''
                }

                // 1. Map Text 1 (Priority: text_1 -> headline -> title -> hook)
                if (!finalFields.text_1) {
                    finalFields.text_1 = findVal(['text_1', 'headline', 'title', 'hook', 'header', 'judul', 'short_text', 't1'])
                }

                // 2. Map Text 2 (Priority: text_2 -> caption -> body -> content)
                if (!finalFields.text_2) {
                    finalFields.text_2 = findVal(['text_2', 'caption', 'body', 'content', 'description', 'deskripsi', 'long_text', 'isi', 't2'])
                }

                // 3. Map Credit
                if (!finalFields.credit_text) {
                    finalFields.credit_text = findVal(['credit_text', 'credit', 'source'])
                }

                // Alert if completely empty (helps debugging)
                if (!finalFields.text_1 && !finalFields.text_2) {
                    console.warn('⚠️ Card mapped with EMPTY text content. Raw keys:', Object.keys(rawData))
                }

                // Determine media safely (Already injected above)
                const cardMedia = card.media
                // Helper to detect card type (Updated to respect manual injection)
                let cardType = card.cardType || card.card_type || 'Standard'

                return {
                    id: index + 1,
                    media: cardMedia,
                    status: 'draft',
                    templateId: '',
                    slideTemplateId: '',
                    contentType: card.contentType || selectedContentType, // IMPORTANT: Respect card-specific type override
                    cardType: cardType,
                    fields: {
                        ...finalFields,
                        // Store initial values for Template Swapping Logic
                        _initial_text_1: finalFields.text_1,
                        _initial_text_2: finalFields.text_2
                    } // Populated with text_1, text_2
                }
            })

            if (newCards.length === 0) throw new Error('No cards returned from backend')

            setContentCards(newCards)
            setStep(3)
        } catch (error) {
            console.error('Content Gen Error:', error)
            alert(`Failed to generate content: ${error.message}`)
        } finally {
            setStatus('idle')
        }
    }

    const handleCardFieldChange = (cardId, field, value) => {
        setContentCards(prev => prev.map(card => {
            if (card.id !== cardId) return card

            const newFields = { ...card.fields, [field]: value }

            // SYNC LOGIC: If in Single Text Mode (isSwapped), text_1 represents the Main Headline (text_2)
            // So if user edits text_1, we must also update text_2 to keep them in sync
            if (card.isSwapped && field === 'text_1') {
                newFields.text_2 = value
            }

            return { ...card, fields: newFields }
        }))
    }

    const handleCardTemplateChange = (cardId, templateId) => {
        setContentCards(prev => prev.map(card => {
            if (card.id !== cardId) return card

            const template = getTemplatesForMedia(card.media).find(t => t.id === templateId)
            const newFields = { ...card.fields }
            let isSwapped = card.isSwapped || false

            if (template) {
                const visible = getVisibleFields(template)
                // Count visible TEXT fields only
                const textFields = visible.filter(f => f === 'text_1' || f === 'text_2')

                // CRITICAL LOGIC: If template uses ONLY text_1 (Single Text Mode)
                if (textFields.length === 1 && textFields[0] === 'text_1') {
                    // User Request: Use MAIN HEADLINE (text_2) for Single Text templates
                    // Swap: text_1 gets text_2 content
                    const sourceContent = card.fields.text_2 || card.fields._initial_text_2 || ''

                    // Only swap if not already identical (avoid overwrite if user edited)
                    if (newFields.text_1 !== sourceContent) {
                        newFields.text_1 = sourceContent
                        isSwapped = true
                    }
                }
                // RESTORE LOGIC: If switching back to Multi-Text
                else if (textFields.length > 1) {
                    // Restore Original text_1 (Hook) if we previously swapped it
                    // Or simply ensure text_1 is NOT the Main Headline if possible
                    if (isSwapped && card.fields._initial_text_1) {
                        // Restore Initial Hook
                        newFields.text_1 = card.fields._initial_text_1
                        isSwapped = false
                    }
                }
            }

            return {
                ...card,
                templateId: templateId,
                fields: newFields,
                isSwapped
            }
        }))
    }

    const handleCardSlideTemplateChange = (cardId, templateId) => {
        setContentCards(prev => prev.map(card =>
            card.id === cardId
                ? { ...card, slideTemplateId: templateId }
                : card
        ))
    }

    // New Handler for Global Template Change (per Media Group)
    const handleGlobalSlideTemplateChange = (mediaName, templateId) => {
        setContentCards(prev => prev.map(card => {
            // Apply to all SLIDE cards for this media (exclude Cover/Headline)
            if (card.media === mediaName && card.cardType !== 'Cover' && card.cardType !== 'Headline' && (!card.contentType || card.contentType.includes('carousel'))) {
                return { ...card, templateId: templateId }
            }
            return card
        }))
    }

    const renderCardField = (card, fieldName, template) => {
        if (fieldName.startsWith('image_') || fieldName.startsWith('video_')) {
            return (
                <input
                    type="url"
                    className="form-input"
                    placeholder="https://..."
                    value={card.fields[fieldName] || ''}
                    onChange={(e) => handleCardFieldChange(card.id, fieldName, e.target.value)}
                    style={{ fontSize: 13, borderRadius: 12, padding: 10 }}
                />
            )
        } else {
            return (
                <textarea
                    className="form-input form-textarea"
                    value={card.fields[fieldName] || ''}
                    onChange={(e) => handleCardFieldChange(card.id, fieldName, e.target.value)}
                    rows={template?.type_category === 'Article' && fieldName === 'text_2' ? 15 : ((fieldName.includes('text_2') || fieldName.includes('caption') || fieldName.includes('body')) ? 6 : 3)}
                    style={{ fontSize: 13, borderRadius: 12, padding: 10, minHeight: '60px' }}
                />
            )
        }
    }

    const getCardTemplates = (media, specificType) => {
        // Derive category: 'Article' -> 'Article', 'Video' -> 'Video', else 'Image'
        // Use specificType if provided (e.g., for mixed Carousel Video), else global state
        const s = (specificType || selectedContentType || '').toLowerCase()
        const typeCategory = s.includes('article') ? 'Article' : (s.includes('video') ? 'Video' : 'Image')
        return getTemplatesForMedia(media).filter(t => t.type_category === typeCategory)
    }

    const handleSubmitAll = async () => {
        console.log('[Submit] Starting submission...', { resubmitCardId })

        // 1. VALIDATION STRICT
        // Only validate cards that are about to be processed
        const cardsToValidate = resubmitCardId
            ? contentCards.filter(c => c.id === resubmitCardId)
            : contentCards

        let incompleteCard = null
        let missingReason = ''

        for (const c of cardsToValidate) {
            if (!c.templateId) {
                incompleteCard = c; missingReason = 'Template belum dipilih'; break;
            }
            // Check visible fields
            const template = getTemplatesForMedia(c.media).find(t => t.id === c.templateId)
            if (template) {
                const visible = getVisibleFields(template)
                // Check if any visible field is empty string
                const emptyField = visible.find(f => !c.fields[f] || c.fields[f].trim() === '')
                if (emptyField) {
                    incompleteCard = c; missingReason = `Field '${getFieldLabel(emptyField)}' masih kosong`; break;
                }
            }
        }

        if (incompleteCard) {
            alert(`Media ${incompleteCard.media}: ${missingReason}. Mohon lengkapi data.`)
            return
        }

        // 2. MOVE TO STEP 4 IMMEDIATELY
        setStep(4)
        setStatus('producing') // Start global indicator

        // 3. SEQUENTIAL QUEUE PROCESSING
        // Filter cards that need processing
        const queue = resubmitCardId
            ? contentCards.filter(c => c.id === resubmitCardId)
            : contentCards.filter(c => c.status !== 'done')

        console.log('[Submit] Queue size:', queue.length)

        for (const card of queue) {
            // Set current card to processing (UI feedback)
            setContentCards(prev => prev.map(c =>
                c.id === card.id ? { ...c, status: 'processing', error: null } : c
            ))

            // Add 3s Delay to avoid race conditions (User Request: 3s)
            await new Promise(r => setTimeout(r, 3000))

            let timeoutId = null
            try {
                // Determine Webhook URL -- DEBUG LOG
                let targetWebhook = import.meta.env.VITE_WEBHOOK_SINGLE_POST // Default

                if (card.contentType?.toLowerCase().includes('carousel')) {
                    targetWebhook = import.meta.env.VITE_WEBHOOK_CAROUSEL_PRODUCTION
                }

                console.log(`[Submit] Card ${card.id}: Type=${card.contentType}, Webhook=${targetWebhook}`)

                if (!targetWebhook) {
                    const errMsg = 'Webhook URL not configured! Check .env file.'
                    alert(errMsg)
                    throw new Error(errMsg)
                }

                // MAP CONTENT TYPES SPECIFICALLY FOR N8N ROUTER (Title Case for Router Match)
                let finalType = 'Image' // fallback
                const cType = (card.contentType || '').toLowerCase()

                if (cType.includes('single') && cType.includes('image')) finalType = 'Image'
                else if (cType.includes('single') && cType.includes('video')) finalType = 'Video'
                else if (cType.includes('carousel') && cType.includes('image')) finalType = 'Carousel Image'
                else if (cType.includes('carousel') && cType.includes('video')) finalType = 'Carousel Video'
                else if (cType.includes('article')) finalType = 'Article'
                else {
                    // Legacy fallback
                    finalType = cType.includes('video') ? 'Video' : 'Image'
                }

                // Prepare Payload matching SinglePost structure
                const template = getTemplatesForMedia(card.media).find(t => t.id === card.templateId)

                // SAFETY: Force selection for Grid UI (e.g., Fox Populi characters) if empty
                if (template?.asset_config?.ui_style === 'grid' && template.asset_config.options?.length > 0) {
                    const pName = template.asset_config.param_name
                    if (!card.fields[pName]) {
                        // Use first option as default
                        card.fields[pName] = template.asset_config.options[0].url
                    }
                }

                // FILTER FIELDS: Only send fields that are visible/used by this template
                const visibleFields = getVisibleFields(template)

                // Construct clean payload (Visible Fields + Always Include 'credit_text')
                const cleanFields = {
                    credit_text: card.fields.credit_text || ''
                }

                visibleFields.forEach(key => {
                    cleanFields[key] = card.fields[key] || ''
                })

                // FORCE INCLUDE PARAM FOR GRID UI (Fox Populi Fix)
                if (template?.asset_config?.ui_style === 'grid' && template.asset_config.param_name) {
                    const pName = template.asset_config.param_name
                    // Ensure it's in the payload even if visibleFields missed it
                    cleanFields[pName] = card.fields[pName] || template.asset_config.options?.[0]?.url || ''
                }

                const payload = {
                    ip_media: card.media, // Matches SinglePost
                    content_type: finalType,
                    template_type: template?.backend_value || card.templateId, // Critical: Use backend_value
                    run_date: new Date().toISOString(),
                    status: 'IN PROGRESS',
                    editor: user?.email || user?.name || 'Unknown',
                    source: 'one_click_batch',
                    pk: card.id, // Keep tracking ID
                    // Spread ONLY CLEAN fields
                    ...cleanFields
                }

                console.log(`[Submit] Card ${card.id}: Type=${card.contentType}, Webhook=${targetWebhook}`, payload)

                // AUTO-TIMEOUT LOGIC: 200s for Video, 60s for Image/Others
                const isVideo = cType.includes('video')
                const timeoutMs = isVideo ? 200000 : 60000
                const controller = new AbortController()
                timeoutId = setTimeout(() => controller.abort(), timeoutMs)

                const response = await fetch(targetWebhook, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    signal: controller.signal
                })

                // Clear timeout immediately after response
                clearTimeout(timeoutId)

                if (!response.ok) {
                    const errText = await response.text()
                    throw new Error(`Webhook failed: ${response.status} ${errText}`)
                }

                const result = await response.json()
                const recordId = result.record_id || result.id

                // Determine if we start tracking or finish
                if (recordId) {
                    console.log(`[Batch] Card ${card.id} started tracking: ${recordId}`)
                    setContentCards(prev => prev.map(c =>
                        c.id === card.id ? { ...c, status: 'processing', recordId } : c
                    ))
                } else {
                    // Direct success (fallback)
                    console.log(`[Batch] Card ${card.id} finished immediately (no record_id)`)
                    setContentCards(prev => prev.map(c =>
                        c.id === card.id ? { ...c, status: 'done', result } : c
                    ))
                    incrementWorkCount()
                }

            } catch (error) {
                if (timeoutId) clearTimeout(timeoutId) // Ensure clear
                console.error(`[Batch] Error processing card ${card.id}:`, error)

                const errMsg = error.name === 'AbortError'
                    ? 'Timeout: Server took too long to respond'
                    : error.message

                setContentCards(prev => prev.map(c =>
                    c.id === card.id ? { ...c, status: 'error', error: errMsg } : c
                ))
            }
        }

        // 4. FINISH
        setStatus('idle')
        setResubmitCardId(null) // Reset resubmit mode if active
    }

    const handleResubmitCard = async (cardId) => {
        const card = contentCards.find(c => c.id === cardId)
        if (!card) return

        const template = getTemplatesForMedia(card.media).find(t => t.id === card.templateId)
        const slideTemplate = getTemplatesForMedia(card.media).find(t => t.id === card.slideTemplateId)

        const payload = {
            action: 'single_resubmit',
            source: 'one_click_batch',
            editor: user?.email || user?.name || 'Unknown',
            media: card.media,
            template_id: card.templateId,
            backend_value: template?.backend_value,
            slide_template_id: card.slideTemplateId,
            slide_template_backend_value: slideTemplate?.backend_value,
            fields: card.fields
        }

        setContentCards(prev => prev.map(c => c.id === cardId ? { ...c, status: 'sending' } : c))

        try {
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            if (!response.ok) throw new Error('Failed')

            setContentCards(prev => prev.map(c => c.id === cardId ? { ...c, status: 'done' } : c))

        } catch (e) {
            alert('Resubmit failed: ' + e.message)
            setContentCards(prev => prev.map(c => c.id === cardId ? { ...c, status: 'error' } : c))
        }
    }

    const handleGoToResubmit = (cardId) => {
        setResubmitCardId(cardId)
        setStep(3)
    }

    const handleUnlockCard = (cardId) => {
        setContentCards(prev => prev.map(c =>
            c.id === cardId ? { ...c, status: 'draft', result: null, error: null } : c
        ))
    }

    const handleBackToResults = () => {
        setResubmitCardId(null)
        setStep(4)
    }

    const handleReset = () => {
        reset()
        setStep(1)
        setHasArticle(false)
        setPostLink('')
        setArticle({ headline: '', body: '' })
        setSelectedMedias([])
        setSelectedContentType('')
        setContentCards([])
        setResubmitCardId(null)
    }

    // Step Styles
    const getStepColor = (index, isActive) => {
        if (!isActive && step <= index) return 'var(--color-surface-hover)' // Inactive
        // Colors for Active/Completed
        const colors = [
            '#3B82F6', // Blue (Source)
            '#8B5CF6', // Purple (Configure)
            '#F59E0B', // Orange (Review)
            '#10B981'  // Green (Production)
        ]
        return colors[index]
    }

    // --- HELPER RENDERING FUNCTIONS --- //

    // Grouped Layout for Step 3 (Review Drafts)
    const renderStep3 = () => {
        // GROUP CARDS BY MEDIA
        const groupedCards = {}
        contentCards.forEach(card => {
            if (!groupedCards[card.media]) groupedCards[card.media] = []
            groupedCards[card.media].push(card)
        })

        return (
            <div style={{ paddingBottom: 100 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h3 className="form-section-title mb-0" style={{ color: '#F59E0B' }}>3. Review Drafts</h3>
                    <button className="btn btn-secondary btn-sm" style={{ borderRadius: 8 }} onClick={() => setStep(2)}>Back to Config</button>
                </div>

                <div style={{ marginBottom: 24 }}>
                    <button
                        className="btn btn-primary"
                        onClick={() => handleSubmitAll()}
                        disabled={status === 'producing'}
                        style={{ width: '100%', padding: '12px', fontSize: 16, borderRadius: 12, fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}
                    >
                        {status === 'producing' ? (
                            <>
                                <span className="spinner" style={{ width: 16, height: 16, borderTopColor: '#fff' }}></span>
                                Production in Progress...
                            </>
                        ) : (
                            `Submit All to Production (${contentCards.length} Cards)`
                        )}
                    </button>
                </div>

                {/* RENDER GROUPS */}
                {Object.keys(groupedCards).map((mediaName) => {
                    const cards = groupedCards[mediaName]
                    const isCarousel = cards.some(c => c.contentType && c.contentType.includes('carousel'))

                    // Split Cover and Slides for Carousel
                    const coverCard = cards.find(c => c.cardType === 'Cover') || cards[0]
                    const slideCards = cards.filter(c => c.id !== coverCard.id)
                    const otherCards = cards // For non-carousel

                    // Get first slide template ID for global selector default
                    const firstSlideTemplate = slideCards[0]?.templateId || ''

                    return (
                        <div key={mediaName} style={{ marginBottom: 40, border: '1px solid var(--color-surface-border)', borderRadius: 16, padding: '20px 24px', background: 'rgba(29, 155, 240, 0.02)' }}>
                            {/* Media Header Label */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-primary)' }}></div>
                                <h4 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--color-primary)' }}>{mediaName}</h4>
                                <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', background: 'var(--color-surface)', padding: '2px 8px', borderRadius: 4, border: '1px solid var(--color-surface-border)' }}>
                                    {isCarousel ? 'Carousel Mode' : 'Standard Mode'}
                                </span>
                            </div>

                            <div>
                                {isCarousel && slideCards.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                        {/* BOX 1: COVER CARD */}
                                        <div>
                                            <div style={{ fontSize: 13, textTransform: 'uppercase', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 12, letterSpacing: 0.5 }}>
                                                Box 1: Headline / Cover
                                            </div>
                                            {renderDraftCard(coverCard, 0)}
                                        </div>

                                        {/* BOX 2: SLIDES (Grid) */}
                                        <div style={{ background: 'var(--color-surface)', padding: 20, borderRadius: 16, border: '1px solid var(--color-surface-border)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                                <div style={{ fontSize: 13, textTransform: 'uppercase', fontWeight: 700, color: 'var(--color-text-secondary)', letterSpacing: 0.5 }}>
                                                    Box 2: Narrative Slides ({slideCards.length})
                                                </div>

                                                {/* GLOBAL SLIDE TEMPLATE SELECTOR */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Apply to All Slides:</span>
                                                    <select
                                                        className="form-input"
                                                        value={firstSlideTemplate}
                                                        onChange={(e) => handleGlobalSlideTemplateChange(mediaName, e.target.value)}
                                                        style={{ padding: '6px 12px', fontSize: 12, borderRadius: 6, width: 200 }}
                                                    >
                                                        <option value="">-- Start with Template --</option>
                                                        {getCardTemplates(mediaName).map(t => (
                                                            <option key={t.id} value={t.id}>{t.display_name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                                                {slideCards.map((card, idx) => renderDraftCard(card, idx + 1, true))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* NON-CAROUSEL (Standard List) */
                                    <div style={{ display: 'grid', gap: 24 }}>
                                        {otherCards.map((card, idx) => renderDraftCard(card, idx))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }

    // Helper to render individual card (extracted for reuse)
    const renderDraftCard = (card, idx, isCompact = false) => {
        const template = getTemplatesForMedia(card.media).find(t => t.id === card.templateId)
        const visibleFields = template ? getVisibleFields(template) : []
        const isGrid = template?.asset_config?.ui_style === 'grid'

        const isProcessing = card.status === 'processing'
        const isDone = card.status === 'done'
        const isError = card.status === 'error'

        return (
            <div key={card.id} className="card" style={{
                borderRadius: 14,
                border: '1px solid var(--color-surface-border)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                opacity: isDone ? 0.8 : 1,
                position: 'relative',
                overflow: 'visible'
            }}>
                {/* Status Badge - HIDDEN IN COMPACT MODE unless Error/Done */}
                {!isCompact || isDone || isError || isProcessing ? (
                    <div style={{
                        position: 'absolute', top: -10, right: 16, zIndex: 10,
                        fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20,
                        background: isDone ? '#10B981' : isProcessing ? '#F59E0B' : isError ? '#EF4444' : 'var(--color-surface)',
                        color: isDone || isError || isProcessing ? '#fff' : 'var(--color-text-secondary)',
                        border: isDone || isError || isProcessing ? 'none' : '1px solid var(--color-surface-border)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}>
                        {isProcessing ? 'PRODUCING...' : isDone ? 'COMPLETED' : isError ? 'FAILED' : 'DRAFT'}
                    </div>
                ) : null}

                {/* Card Context (Compact Mode only shows ID) */}
                <div style={{ padding: isCompact ? '16px 16px 8px' : '20px 24px 8px', borderBottom: '1px solid var(--color-surface-border)', background: 'var(--color-surface-hover)', borderRadius: '14px 14px 0 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: isCompact ? 24 : 32, height: isCompact ? 24 : 32,
                            borderRadius: '50%', background: 'var(--color-primary-light)', color: 'var(--color-primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: isCompact ? 11 : 14
                        }}>
                            {idx + 1}
                        </div>
                        <div>
                            {!isCompact && (
                                <h4 style={{ fontWeight: 700, fontSize: 16, margin: 0, color: 'var(--color-text-primary)' }}>{card.media}</h4>
                            )}
                            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                                {card.cardType || card.contentType}
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ padding: isCompact ? 16 : 24 }}>
                    {/* Template Selection */}
                    <div className="form-group" style={{ marginBottom: 16 }}>
                        {!isCompact && <label className="form-label" style={{ fontSize: 12, marginBottom: 8, color: 'var(--color-text-secondary)' }}>Template</label>}
                        <select
                            className="form-input"
                            value={card.templateId}
                            onChange={(e) => handleCardTemplateChange(card.id, e.target.value)}
                            disabled={!['draft', 'error'].includes(card.status)}
                            style={{
                                padding: isCompact ? '8px 12px' : '10px 12px', fontSize: 13,
                                borderRadius: 8, borderColor: !card.templateId ? 'var(--color-warning)' : 'var(--color-surface-border)'
                            }}
                        >
                            <option value="">{isCompact ? 'Select Template...' : '-- Choose Template --'}</option>
                            {getCardTemplates(card.media, card.contentType).map(t => (
                                <option key={t.id} value={t.id}>
                                    {t.display_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Dynamic Fields */}
                    {card.templateId ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {visibleFields.map(fieldName => {
                                // Correct Label Call
                                let label = getFieldLabel(template, fieldName)
                                // Only override if getting raw field name (fallback), OR for Compact slide text specifically
                                if (isCompact && fieldName === 'text_1' && label === fieldName) label = "Narration / Text"
                                if (fieldName === 'text_1') label += ` (${card.fields[fieldName]?.length || 0} chars)`

                                return (
                                    <div key={fieldName} className="form-group" style={{ margin: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                            <label className="form-label" style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                                                {label}
                                            </label>
                                        </div>
                                        {renderCardField(card, fieldName, template)}
                                    </div>
                                )
                            })}

                            {/* Grid UI for Character Selection (Fox Populi, etc) */}
                            {isGrid && template.asset_config.options && (
                                <div style={{ marginTop: 16, borderTop: '1px solid var(--color-surface-border)', paddingTop: 12 }}>
                                    <label className="label-text" style={{ fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 8, display: 'block' }}>
                                        {template.asset_config.label || 'Select Character'}
                                    </label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                                        {template.asset_config.options.map(opt => (
                                            <div
                                                key={opt.name}
                                                onClick={() => handleCardFieldChange(card.id, template.asset_config.param_name, opt.url)}
                                                style={{
                                                    cursor: 'pointer', borderRadius: 8, border: '1px solid', padding: 4, transition: 'all 0.2s',
                                                    borderColor: card.fields[template.asset_config.param_name] === opt.url ? 'var(--color-primary)' : 'var(--color-surface-border)',
                                                    background: card.fields[template.asset_config.param_name] === opt.url ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                                    boxShadow: card.fields[template.asset_config.param_name] === opt.url ? '0 0 0 1px var(--color-primary)' : 'none'
                                                }}
                                            >
                                                <img src={opt.url} alt={opt.name} style={{ width: '100%', height: 'auto', objectFit: 'contain', maxHeight: 80 }} />
                                                <div style={{ fontSize: 9, textAlign: 'center', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{opt.name}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ padding: 20, textAlign: 'center', border: '1px dashed var(--color-surface-border)', borderRadius: 8, background: 'var(--color-bg-secondary)', color: 'var(--color-text-muted)', fontSize: 12 }}>
                            Select template to edit content
                        </div>
                    )}

                    {/* Resubmit Action */}
                    {(isDone || isError) && (
                        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--color-surface-border)', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                className="btn btn-sm btn-outline"
                                onClick={() => handleUnlockCard(card.id)}
                                style={{ fontSize: 12 }}
                            >
                                ✏️ Edit & Resubmit
                            </button>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="oneclick-container">
            <div className="page-header">
                <h1 className="page-title">Batch Content Generator</h1>
                <p className="page-subtitle">Generate content for multiple media outlets in one go</p>
            </div>

            {/* Step Indicator */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 32 }}>
                {[
                    { short: 'Input', long: 'Input Source Link' },
                    { short: 'Setup', long: 'QC Article & Media Setup' },
                    { short: 'Visual', long: 'QC Drafts & Input Image' },
                    { short: 'Output', long: 'Production & Revision' }
                ].map((s, index) => {
                    const isActive = step === index + 1
                    const isCompleted = step > index + 1
                    const color = getStepColor(index, isActive || isCompleted)

                    return (
                        <div
                            key={index}
                            style={{
                                background: isActive || isCompleted ? color : 'var(--color-surface-hover)',
                                borderRadius: 12,
                                padding: '10px 16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                                opacity: isActive || isCompleted ? 1 : 0.4,
                                color: isActive || isCompleted ? 'white' : 'var(--color-text-secondary)',
                                fontWeight: isActive ? 700 : 500,
                                fontSize: 13,
                                transition: 'all 0.3s ease',
                                textAlign: 'center'
                            }}
                        >
                            <span>{isCompleted ? '✓' : index + 1}</span>
                            <span className="step-label-desktop">{s.long}</span>
                            <span className="step-label-mobile" style={{ display: 'none' }}>{s.short}</span>
                        </div>
                    )
                })}
            </div>

            <div className="">

                {/* Step 1: Source */}
                {step === 1 && (
                    <div className="card step-content p-xl">
                        <h3 className="form-section-title mb-lg border-b pb-md" style={{ color: '#3B82F6' }}>1. Content Source</h3>

                        {!hasArticle ? (
                            <div className="max-w-xl mx-auto text-center py-lg">
                                <div className="form-group mb-lg text-left">
                                    <label className="form-label">Paste Link Dari Media Sosial</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="https://..."
                                        value={postLink}
                                        onChange={(e) => setPostLink(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleGenerateArticle()}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button
                                        onClick={handleGenerateArticle}
                                        disabled={!postLink.trim() || sendStatus === 'sending' || sendStatus === 'sent'}
                                        style={{
                                            flex: 1,
                                            padding: '10px 0',
                                            fontSize: 14,
                                            borderRadius: 10,
                                            background: sendStatus === 'sent' ? '#10B981' : 'linear-gradient(135deg, #7c3aed, #a855f7)',
                                            border: 'none',
                                            color: 'white',
                                            cursor: sendStatus === 'sent' ? 'default' : 'pointer'
                                        }}
                                    >
                                        {sendStatus === 'sending' ? (
                                            <>
                                                <span className="spinner" style={{ width: 16, height: 16, borderTopColor: '#fff', marginRight: 8, display: 'inline-block' }}></span>
                                                Sending to Joy...
                                            </>
                                        ) : sendStatus === 'sent' ? (
                                            '✓ Sent to Joy! Check Slack & Lanjutkan proses manual di bawah'
                                        ) : (
                                            '🤖 Send to Joy'
                                        )}
                                    </button>

                                    {sendStatus === 'sent' && (
                                        <button
                                            className="btn btn-outline"
                                            onClick={() => { setPostLink(''); setSendStatus(null) }}
                                            style={{ padding: '0 20px', borderRadius: 10, borderColor: '#ccc' }}
                                            title="Clear input"
                                        >
                                            ↺ Reset
                                        </button>
                                    )}
                                </div>

                                <div className="text-secondary text-sm" style={{ margin: '12px 0' }}>- OR -</div>

                                <button
                                    className="btn btn-secondary"
                                    onClick={handleSkipArticle}
                                    style={{ width: '100%', padding: '10px 0', fontSize: 12, borderRadius: 10 }}
                                >
                                    Use Existing / Manual Article
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-lg">
                                <p className="mb-md text-lg">📝 Manual Entry Mode Selected</p>
                                <button className="btn btn-secondary btn-sm" onClick={() => setHasArticle(false)}>Back to Link Import</button>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 2: Configure */}
                {
                    step === 2 && (
                        <div className="card p-xl animate-fade-in" style={{ maxWidth: 800, margin: '0 auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <h3 className="form-section-title mb-0" style={{ color: '#8B5CF6' }}>2. QC 1 & Generate Draft</h3>
                                <button className="btn btn-secondary btn-sm" style={{ borderRadius: 8 }} onClick={() => setStep(1)}>Back to Source</button>
                            </div>

                            {/* PRIMARY ACTION BUTTON (MOVED TO TOP) */}
                            <button
                                className="btn btn-primary"
                                onClick={handleGenerateDrafts}
                                style={{
                                    width: '100%',
                                    padding: '10px 0',
                                    fontSize: 14,
                                    borderRadius: 10,
                                    marginBottom: 24, // Space below button
                                    background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
                                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                                }}
                                disabled={selectedMedias.length === 0 || !selectedContentType || status === 'producing'}
                            >
                                {status === 'producing' ? (
                                    <>
                                        <span className="spinner-small" style={{ marginRight: 8 }}></span>
                                        Generating for {selectedMedias.length} medias...
                                    </>
                                ) : (
                                    `Generate Content for ${selectedMedias.length > 0 ? selectedMedias.length : '...'} Medias`
                                )}
                            </button>

                            <div className="form-group mb-lg">
                                <label className="form-label">Review Article Source</label>
                                <div style={{ display: 'grid', gap: 12 }}>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Article Headline"
                                        value={article.headline}
                                        onChange={(e) => setArticle({ ...article, headline: e.target.value })}
                                        style={{ fontWeight: 600, fontSize: 16 }}
                                    />
                                    <textarea
                                        className="form-input form-textarea"
                                        placeholder="Article Body"
                                        value={article.body}
                                        onChange={(e) => setArticle({ ...article, body: e.target.value })}
                                        rows={6}
                                    />
                                </div>
                            </div>

                            {/* Configuration Boxes */}
                            <div className="grid grid-cols-2 gap-lg mb-lg">
                                {/* Media Selection Box */}
                                <div className="card p-md border-2 border-surface-border rounded-lg relative overflow-hidden">
                                    <h4 className="form-label text-lg border-b pb-sm mb-md flex items-center justify-between">
                                        Target Media
                                        <span className="text-xs bg-primary-light text-primary px-2 py-1 rounded-full">{selectedMedias.length}/5</span>
                                    </h4>
                                    <div className="media-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
                                        {MEDIA_LIST.map(media => (
                                            <label key={media} className={`media-option p-sm border rounded cursor-pointer flex items-center gap-sm transition-all ${selectedMedias.includes(media) ? 'bg-primary-light border-primary shadow-sm' : 'hover:bg-surface-hover'}`}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedMedias.includes(media)}
                                                    onChange={() => toggleMedia(media)}
                                                    style={{ accentColor: 'var(--color-primary)' }}
                                                />
                                                <span className="text-sm font-medium">{media}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Content Type Box */}
                                <div className="card p-md border-2 border-surface-border rounded-lg relative overflow-hidden">
                                    <h4 className="form-label text-lg border-b pb-sm mb-md">Content Format</h4>
                                    <div className="flex flex-col gap-sm">
                                        {[
                                            { id: 'image', label: 'Single Post (Image)' },
                                            { id: 'video', label: 'Single Post (Video)' },
                                            { id: 'carousel_image', label: 'Carousel (Image)' },
                                            { id: 'carousel_video', label: 'Carousel (Video)' }
                                        ].map(type => (
                                            <label key={type.id} style={{ padding: '10px 14px', border: selectedContentType === type.id ? '1px solid var(--color-warning)' : '1px solid var(--color-surface-border)', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.2s ease', background: selectedContentType === type.id ? 'rgba(245,158,11,0.08)' : 'transparent' }}>
                                                <input
                                                    type="radio"
                                                    name="contentType"
                                                    value={type.id}
                                                    checked={selectedContentType === type.id}
                                                    onChange={(e) => setSelectedContentType(e.target.value)}
                                                    style={{ accentColor: 'var(--color-warning)' }}
                                                />
                                                <span style={{ fontWeight: 500, fontSize: 14 }}>{type.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <p className="form-hint">Select the output format for all generated content.</p>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* Step 3: Review Drafts - GROUPED LAYOUT */}
                {step === 3 && renderStep3()}

                {/* OLD Step 3: Review Drafts (Disabled) */}
                {
                    false && (
                        <div className="step-content">
                            <div style={{ position: 'sticky', top: 0, zIndex: 20, paddingTop: 12, paddingBottom: 16, marginBottom: 20 }}>
                                {resubmitCardId ? (
                                    /* Resubmit Mode Header */
                                    <>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                            <div>
                                                <h3 className="form-section-title mb-0" style={{ color: '#F59E0B' }}>Editing for Resubmit</h3>
                                                <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Edit the highlighted card below, then resubmit</span>
                                            </div>
                                            <button className="btn btn-secondary btn-sm" style={{ borderRadius: 8 }} onClick={handleBackToResults}>← Back to Results</button>
                                        </div>
                                        <button
                                            className="btn btn-primary"
                                            onClick={handleResubmitSingle}
                                            style={{ width: '100%', padding: '10px 0', fontSize: 14, borderRadius: 10, background: '#F59E0B' }}
                                        >
                                            ↻ Resubmit This Card
                                        </button>
                                    </>
                                ) : (
                                    /* Normal Mode Header */
                                    <>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                            <h3 className="form-section-title mb-0" style={{ color: '#F59E0B' }}>3. Review Drafts</h3>
                                            <button className="btn btn-secondary btn-sm" style={{ borderRadius: 8 }} onClick={() => setStep(2)}>Back to Config</button>
                                        </div>
                                        <button
                                            className="btn btn-primary"
                                            onClick={handleSubmitAll}
                                            style={{ width: '100%', padding: '10px 0', fontSize: 14, borderRadius: 10 }}
                                        >
                                            Submit All to Production
                                        </button>
                                    </>
                                )}
                            </div>

                            <div className="draft-cards-grid grid gap-xl pb-xl">
                                {contentCards
                                    .filter(card => !resubmitCardId || card.id === resubmitCardId)
                                    .map((card, index) => {
                                        const templates = getCardTemplates(card.media)
                                        const selectedTemplate = templates.find(t => t.id === card.templateId)
                                        const visibleFields = selectedTemplate ? getVisibleFields(selectedTemplate) : ['text_1', 'text_2']

                                        // Slide Template Logic
                                        const slideTemplate = templates.find(t => t.id === card.slideTemplateId)
                                        const slideVisibleFields = slideTemplate ? getVisibleFields(slideTemplate) : []

                                        const isResubmitTarget = resubmitCardId === card.id

                                        return (
                                            <div key={card.id} className="card overflow-hidden" style={{
                                                borderRadius: 14,
                                                border: isResubmitTarget ? '2px solid #F59E0B' : '1px solid var(--color-primary)',
                                                boxShadow: isResubmitTarget ? '0 0 20px rgba(245, 158, 11, 0.25)' : '0 4px 20px rgba(59, 130, 246, 0.15)'
                                            }}>
                                                {/* Card Header */}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--color-surface-hover)', borderBottom: '1px solid var(--color-surface-border)', borderRadius: '12px 12px 0 0' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: isResubmitTarget ? '#F59E0B' : 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>
                                                            {isResubmitTarget ? '↻' : index + 1}
                                                        </div>
                                                        <div>
                                                            <h4 style={{ fontWeight: 700, fontSize: 16, margin: 0 }}>{card.media}</h4>
                                                            <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>{selectedContentType.replace('_', ' ')}</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        {isResubmitTarget
                                                            ? <span style={{ fontSize: 11, fontWeight: 600, color: '#F59E0B', background: 'rgba(245,158,11,0.1)', padding: '4px 10px', borderRadius: 20 }}>Editing for Resubmit</span>
                                                            : <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Draft Mode</span>
                                                        }
                                                    </div>
                                                </div>

                                                <div className="p-lg">
                                                    {/* Template Selector */}
                                                    <div className="form-group mb-lg">
                                                        <label className="form-label">{selectedContentType.includes('carousel') ? 'Select Cover Template' : 'Select Template'}</label>
                                                        <select
                                                            className="form-input form-select"
                                                            value={card.templateId}
                                                            onChange={(e) => handleCardTemplateChange(card.id, e.target.value)}
                                                            style={{ fontSize: 14, padding: 10 }}
                                                        >
                                                            <option value="">-- Choose Template --</option>
                                                            {templates.map(t => (
                                                                <option key={t.id} value={t.id}>{t.display_name}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Grid UI */}
                                                    {selectedTemplate?.asset_config?.ui_style === 'grid' && selectedTemplate.asset_config.options && (
                                                        <div style={{ marginBottom: 20, padding: 14, border: '1px solid var(--color-surface-border)', borderRadius: 10, background: 'var(--color-surface-hover)' }}>
                                                            <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', fontWeight: 700, color: 'var(--color-primary)', marginBottom: 8 }}>
                                                                {selectedTemplate.asset_config.label || 'Select Option'}
                                                            </label>
                                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                                                                {selectedTemplate.asset_config.options.map(opt => {
                                                                    const paramName = selectedTemplate.asset_config.param_name
                                                                    const isSelected = card.fields[paramName] === opt.url
                                                                    return (
                                                                        <div
                                                                            key={opt.name}
                                                                            onClick={() => handleCardFieldChange(card.id, paramName, opt.url)}
                                                                            style={{
                                                                                border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-surface-border)',
                                                                                borderRadius: 8,
                                                                                padding: 4,
                                                                                cursor: 'pointer',
                                                                                background: isSelected ? 'rgba(29, 155, 240, 0.1)' : 'transparent',
                                                                                textAlign: 'center',
                                                                                transition: 'all 0.2s ease'
                                                                            }}
                                                                            title={opt.name}
                                                                        >
                                                                            <div style={{ width: '100%', height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 4 }}>
                                                                                <img src={opt.url} alt={opt.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                                                            </div>
                                                                            <div style={{ fontSize: 10, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{opt.name}</div>
                                                                        </div>
                                                                    )
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Fields */}
                                                    {selectedTemplate ? (
                                                        <div className="fields-container">
                                                            {selectedContentType.includes('carousel') ? (
                                                                /* Carousel Specific Inputs */
                                                                <div className="carousel-inputs grid gap-lg">
                                                                    {/* --- SECTION 1: COVER / HEADLINE --- */}
                                                                    <div className="mb-md" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: 24, padding: 24 }}>
                                                                        <div className="flex justify-between items-center mb-md border-b border-surface-border pb-sm">
                                                                            <label className="form-label text-sm uppercase font-bold text-primary">Cover Slide</label>
                                                                            <span className="text-xs text-secondary">Isi konten untuk slide pertama (Cover)</span>
                                                                        </div>

                                                                        {/* Headline */}
                                                                        <div className="form-group mb-md">
                                                                            <label className="form-label text-xs uppercase font-bold text-secondary mb-xs block">Headline / Judul Utama</label>
                                                                            <textarea
                                                                                className="form-input form-textarea font-bold text-lg w-full"
                                                                                value={card.fields.headline || ''}
                                                                                onChange={(e) => handleCardFieldChange(card.id, 'headline', e.target.value)}
                                                                                rows={2}
                                                                                placeholder="Tulis headline yang menarik..."
                                                                                style={{ borderRadius: 12, padding: 12 }}
                                                                            />
                                                                        </div>

                                                                        {/* Cover Assets (from Template) */}
                                                                        {visibleFields.filter(f => !f.startsWith('text_')).length > 0 && (
                                                                            <div className="grid gap-md">
                                                                                {visibleFields.filter(f => !f.startsWith('text_')).map(field => (
                                                                                    <div key={field} className="form-group">
                                                                                        <label className="form-label text-xs uppercase font-bold text-secondary mb-xs block">{getFieldLabel(selectedTemplate, field)} (Cover)</label>
                                                                                        {renderCardField(card, field, selectedTemplate)}
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* --- SECTION 2: SLIDES (NARASI) --- */}
                                                                    <div className="p-md bg-surface-hover rounded-lg border border-surface-border">
                                                                        <div className="mb-lg border-b border-surface-border pb-md">
                                                                            <label className="form-label text-sm uppercase font-bold text-secondary mb-xs block">Slide Template</label>
                                                                            <p className="text-xs text-secondary mb-sm">Pilih template untuk halaman slide narasi</p>
                                                                            <select
                                                                                className="form-input form-select"
                                                                                value={card.slideTemplateId}
                                                                                onChange={(e) => handleCardSlideTemplateChange(card.id, e.target.value)}
                                                                                style={{ fontSize: 13, padding: 8 }}
                                                                            >
                                                                                <option value="">-- Choose Slide Template --</option>
                                                                                {templates.map(t => (
                                                                                    <option key={t.id} value={t.id}>{t.display_name}</option>
                                                                                ))}
                                                                            </select>
                                                                        </div>

                                                                        <label className="form-label text-sm uppercase font-bold text-secondary mb-lg block border-b border-surface-border pb-sm">Slide Narasi (Content)</label>
                                                                        <div className="grid gap-sm">
                                                                            {[1, 2, 3, 4, 5].map((num) => {
                                                                                const isOdd = num % 2 !== 0
                                                                                return (
                                                                                    <div
                                                                                        key={`slide_${num}`}
                                                                                        className="slide-item border border-surface-border"
                                                                                        style={{
                                                                                            background: isOdd ? 'rgba(59, 130, 246, 0.12)' : 'rgba(59, 130, 246, 0.04)',
                                                                                            borderColor: 'rgba(59, 130, 246, 0.1)',
                                                                                            borderRadius: 24,
                                                                                            padding: 24,
                                                                                            marginBottom: 16
                                                                                        }}
                                                                                    >
                                                                                        <div className="flex gap-sm items-center mb-sm">
                                                                                            <span className="text-xs font-bold text-white bg-secondary px-2 py-0.5 rounded">Slide #{num}</span>
                                                                                        </div>

                                                                                        {/* Narrative Text */}
                                                                                        <div className="form-group mb-md">
                                                                                            <label className="form-label text-xs uppercase font-bold text-secondary mb-xs block">Narasi Text</label>
                                                                                            <textarea
                                                                                                className="form-input form-textarea flex-1 w-full"
                                                                                                value={card.fields[`slide_${num}_text`] || ''}
                                                                                                onChange={(e) => handleCardFieldChange(card.id, `slide_${num}_text`, e.target.value)}
                                                                                                rows={3}
                                                                                                placeholder={`Isi narasi slide ${num}...`}
                                                                                                style={{ fontSize: 13, borderRadius: 12, padding: 12 }}
                                                                                            />
                                                                                        </div>

                                                                                        {/* Slide Assets (Dynamic from Slide Template) */}
                                                                                        {slideVisibleFields.filter(f => !f.startsWith('text_')).length > 0 && (
                                                                                            <div className="grid gap-sm p-sm bg-black/20 rounded">
                                                                                                {slideVisibleFields.filter(f => !f.startsWith('text_')).map(field => {
                                                                                                    const slideFieldKey = `slide_${num}_${field}` // e.g., slide_1_image_1
                                                                                                    return (
                                                                                                        <div key={slideFieldKey} className="form-group">
                                                                                                            <label className="form-label text-[10px] uppercase font-bold text-secondary mb-xs block">{getFieldLabel(slideTemplate, field)} (Slide #{num})</label>
                                                                                                            <input
                                                                                                                type="url"
                                                                                                                className="form-input"
                                                                                                                placeholder="https://..."
                                                                                                                value={card.fields[slideFieldKey] || ''}
                                                                                                                onChange={(e) => handleCardFieldChange(card.id, slideFieldKey, e.target.value)}
                                                                                                                style={{ fontSize: 12, padding: 10, borderRadius: 12 }}
                                                                                                            />
                                                                                                        </div>
                                                                                                    )
                                                                                                })}
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                )
                                                                            })}
                                                                        </div>
                                                                    </div>

                                                                    {/* --- SECTION 3: CAPTION --- */}
                                                                    <div className="form-group mt-lg pt-md border-t border-surface-border">
                                                                        <div className="flex justify-between items-center mb-xs">
                                                                            <label className="form-label text-xs uppercase font-bold text-secondary block">Caption Instagram</label>
                                                                            <button
                                                                                className="text-xs text-primary hover:text-white flex items-center gap-1 transition-colors"
                                                                                onClick={() => {
                                                                                    navigator.clipboard.writeText(card.fields.caption || '')
                                                                                    // You might want to show a small toast here
                                                                                }}
                                                                                title="Copy to Clipboard"
                                                                            >
                                                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                                                                Copy
                                                                            </button>
                                                                        </div>
                                                                        <textarea
                                                                            className="form-input form-textarea"
                                                                            value={card.fields.caption || ''}
                                                                            onChange={(e) => handleCardFieldChange(card.id, 'caption', e.target.value)}
                                                                            rows={4}
                                                                            placeholder="Tulis caption postingan..."
                                                                        />
                                                                    </div>

                                                                    {/* Credit Text (Carousel) */}
                                                                    <div className="form-group mt-md">
                                                                        <label className="form-label text-xs uppercase font-bold text-secondary mb-xs block">Sumber / Credit</label>
                                                                        <input
                                                                            className="form-input text-xs w-full"
                                                                            placeholder="Courtesy of..."
                                                                            value={card.fields.credit_text || ''}
                                                                            onChange={(e) => handleCardFieldChange(card.id, 'credit_text', e.target.value)}
                                                                            style={{ padding: 10, borderRadius: 8 }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                /* Standard Inputs */
                                                                <div className="fields-grid grid gap-lg">
                                                                    {visibleFields.map(field => (
                                                                        <div key={field} className="form-group">
                                                                            <label className="form-label text-xs uppercase font-bold text-secondary mb-xs block">{getFieldLabel(selectedTemplate, field)}</label>
                                                                            {renderCardField(card, field, selectedTemplate)}
                                                                        </div>
                                                                    ))}
                                                                    {/* Credit Text (Standard) */}
                                                                    <div className="form-group col-span-full mt-md pt-md border-t border-surface-border">
                                                                        <label className="form-label text-xs uppercase font-bold text-secondary mb-xs block">Sumber / Credit</label>
                                                                        <input
                                                                            className="form-input text-xs w-full"
                                                                            placeholder="Courtesy of..."
                                                                            value={card.fields.credit_text || ''}
                                                                            onChange={(e) => handleCardFieldChange(card.id, 'credit_text', e.target.value)}
                                                                            style={{ padding: 10, borderRadius: 8 }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="p-xl bg-surface-hover rounded text-center text-secondary">
                                                            Please select a template to start editing
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                            </div>
                        </div>
                    )
                }

                {/* Step 4: Results */}
                {
                    step === 4 && (
                        <div className="card" style={{ padding: 24, borderRadius: 14 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <h3 className="form-section-title mb-0" style={{ color: '#10B981' }}>4. Production Status</h3>
                                <button className="btn btn-secondary btn-sm" style={{ borderRadius: 8 }} onClick={handleReset}>New Batch</button>
                            </div>

                            {/* Table Header */}
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr', gap: 12, padding: '10px 16px', borderRadius: 10, background: 'var(--color-surface-hover)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                                <span>Media</span>
                                <span>Template</span>
                                <span>Status</span>
                                <span style={{ textAlign: 'center' }}>Output</span>
                                <span style={{ textAlign: 'center' }}>Action</span>
                            </div>

                            {/* Result Rows */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {contentCards.map(card => {
                                    const typeCategory = card.contentType.includes('Article') ? 'Article' : (card.contentType.includes('Video') ? 'Video' : 'Image')
                                    const templates = getCardTemplates(card.media)
                                    const template = templates.find(t => t.id === card.templateId)
                                    return (
                                        <div
                                            key={card.id}
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr',
                                                gap: 12,
                                                padding: '14px 16px',
                                                borderRadius: 10,
                                                border: '1px solid var(--color-surface-border)',
                                                background: card.status === 'done' ? 'rgba(16, 185, 129, 0.05)' : card.status === 'error' ? 'rgba(239, 68, 68, 0.05)' : 'transparent',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <span style={{ fontWeight: 600 }}>{card.media}</span>
                                            <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{template?.display_name || '-'}</span>
                                            <span>
                                                <span style={{
                                                    display: 'inline-block',
                                                    fontSize: 11,
                                                    fontWeight: 600,
                                                    padding: '3px 10px',
                                                    borderRadius: 20,
                                                    background: card.status === 'done' ? 'rgba(16,185,129,0.15)' : card.status === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                                                    color: card.status === 'done' ? '#10B981' : card.status === 'error' ? '#EF4444' : '#F59E0B'
                                                }}>
                                                    {card.status === 'done' ? '✓ Completed' : card.status === 'error' ? '✕ Failed' : '⟳ Sending...'}
                                                </span>
                                            </span>
                                            <span style={{ textAlign: 'center' }}>
                                                {card.status === 'done' && (
                                                    <button
                                                        className="btn btn-sm"
                                                        style={{ fontSize: 12, padding: '4px 12px', borderRadius: 6, background: 'var(--color-primary)', color: 'white', border: 'none', cursor: 'pointer' }}
                                                        onClick={() => window.open(card.result?.output_url, '_blank')}
                                                    >
                                                        View ↗
                                                    </button>
                                                )}
                                            </span>
                                            <span style={{ textAlign: 'center' }}>
                                                {(card.status === 'done' || card.status === 'error') && (
                                                    <button
                                                        className="btn btn-sm btn-secondary"
                                                        style={{ fontSize: 12, padding: '4px 12px', borderRadius: 6 }}
                                                        onClick={() => handleGoToResubmit(card.id)}
                                                    >
                                                        ↻ Resubmit
                                                    </button>
                                                )}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>

                            {status === 'sending' && <div style={{ marginTop: 16, textAlign: 'center', color: 'var(--color-text-secondary)' }}>Processing batch... do not close window</div>}
                        </div>
                    )
                }
            </div >

            <style>{`
                .oneclick-container {
                    max-width: 70%;
                    margin: 0 auto;
                }
                
                @media (max-width: 768px) {
                    .oneclick-container {
                        max-width: 100%;
                        padding: 0 var(--spacing-sm);
                    }
                    /* Reduce padding for cards on mobile */
                    .step-content.p-xl {
                        padding: var(--spacing-md) !important;
                    }
                    .page-header {
                        padding: 0 var(--spacing-sm);
                    }
                    /* Grid columns for step indicator */
                    .step-label-desktop { display: none !important; }
                    .step-label-mobile { display: inline !important; }
                }
            `}</style>
        </div >
    )
}
