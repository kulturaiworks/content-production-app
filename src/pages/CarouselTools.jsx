import { useState, useEffect } from 'react'
import { useProduction } from '../context/ProductionContext'
import { useAuth } from '../context/AuthContext'
import { useTemplates } from '../context/TemplateContext'
import { getFieldLabel } from '../data/mediaData'

// Webhook URLs
const GENERATE_WEBHOOK = import.meta.env.VITE_WEBHOOK_CAROUSEL_GENERATE
const PRODUCTION_WEBHOOK = import.meta.env.VITE_WEBHOOK_CAROUSEL_PRODUCTION

// Parse flat n8n response into structured format
function parseCarouselResponse(data) {
    const headlines = []
    const slides = []
    const captions = []

    // 1. Try arrays first (some n8n flows return arrays)
    if (Array.isArray(data.headlines)) {
        data.headlines.forEach((h, i) => {
            headlines.push({ key: `headline_${i + 1}`, text: h, label: `Headline ${i + 1}` })
        })
    }
    if (Array.isArray(data.slides)) {
        data.slides.forEach((s, i) => {
            slides.push({ key: `slide_${i + 1}`, text: s, label: `Slide ${i + 1}` })
        })
    }

    // 2. Extract headline_X and slide_X (standard flat format)
    if (headlines.length === 0) {
        for (let i = 1; i <= 10; i++) {
            if (data[`headline_${i}`]) {
                headlines.push({
                    key: `headline_${i}`,
                    text: data[`headline_${i}`],
                    label: `Headline ${i}`
                })
            }
        }
    }
    if (slides.length === 0) {
        for (let i = 1; i <= 10; i++) {
            if (data[`slide_${i}`]) {
                slides.push({
                    key: `slide_${i}`,
                    text: data[`slide_${i}`],
                    label: `Slide ${i}`
                })
            }
        }
    }

    // 3. Fallback: singular keys (headline, title, text_1)
    // Sometimes n8n returns just one main text field for Repurpose content
    if (headlines.length === 0 && slides.length === 0) {
        if (data.headline) headlines.push({ key: 'headline_1', text: data.headline, label: 'Headline 1' })
        else if (data.title) headlines.push({ key: 'headline_1', text: data.title, label: 'Headline 1' })
        else if (data.text_1) headlines.push({ key: 'headline_1', text: data.text_1, label: 'Headline 1' })
        else if (data.text) headlines.push({ key: 'headline_1', text: data.text, label: 'Headline 1' })
        else if (data.content) headlines.push({ key: 'headline_1', text: data.content, label: 'Headline 1' })
    }

    // Extract captions (caption_20, caption_35, or caption_1, caption_2)
    const captionKeys = Object.keys(data).filter(k => k.startsWith('caption_')).sort()
    captionKeys.forEach((key) => {
        const wordCount = key.replace('caption_', '')
        captions.push({
            key,
            text: data[key],
            label: `Caption (${wordCount} words)`
        })
    })

    console.log('📦 Parsed carousel:', { headlines, slides, captions })
    return { headlines, slides, captions }
}

export default function CarouselTools() {
    const { mediaList: MEDIA_LIST, getTemplatesForMedia } = useTemplates()
    const { reset, setError, startPolling, startJob } = useProduction()
    const { user, incrementWorkCount } = useAuth()

    // Input state
    const [selectedMedia, setSelectedMedia] = useState('')
    const [headline, setHeadline] = useState('')
    const [articleBody, setArticleBody] = useState('')

    // Generate state
    const [generating, setGenerating] = useState(false)
    const [generateError, setGenerateError] = useState(null)
    const [generated, setGenerated] = useState(null)

    // Per-card state
    const [cardStatuses, setCardStatuses] = useState({})       // { 'headline_0': 'idle'|'sending'|'done'|'error' }
    const [cardErrors, setCardErrors] = useState({})           // { 'headline_0': 'Error message' }
    const [cardTemplates, setCardTemplates] = useState({})     // { 'headline_0': templateObj }
    const [cardFields, setCardFields] = useState({})           // { 'headline_0': { text_2: '', image_1: '', ... } }
    const [expandedCards, setExpandedCards] = useState({})      // { 'headline_0': true/false }
    const [copiedKey, setCopiedKey] = useState(null)
    const [isLoaded, setIsLoaded] = useState(false) // Safety flag

    // --- AUTO-SAVE LOGIC ---
    // Load saved state on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem('carousel_autosave')
            if (saved) {
                const data = JSON.parse(saved)
                if (data.selectedMedia) setSelectedMedia(data.selectedMedia)
                if (data.headline) setHeadline(data.headline)
                if (data.articleBody) setArticleBody(data.articleBody)
                if (data.generated) setGenerated(data.generated)
                // Also restore card edits if available
                if (data.cardFields) setCardFields(data.cardFields)
                if (data.cardTemplates) setCardTemplates(data.cardTemplates)
            }
        } catch (e) {
            console.error('Failed to load autosave:', e)
        } finally {
            setIsLoaded(true)
        }
    }, [])

    // Save state on change
    useEffect(() => {
        if (!isLoaded) return

        const timeoutId = setTimeout(() => {
            const dataToSave = {
                selectedMedia,
                headline,
                articleBody,
                generated,
                cardFields,
                cardTemplates,
                timestamp: Date.now()
            }
            localStorage.setItem('carousel_autosave', JSON.stringify(dataToSave))
        }, 1000) // Debounce save by 1s

        return () => clearTimeout(timeoutId)
    }, [selectedMedia, headline, articleBody, generated, cardFields, cardTemplates, isLoaded])
    // -----------------------

    // Get templates for the selected media (Image and Video supported)
    const imageTemplates = selectedMedia
        ? getTemplatesForMedia(selectedMedia).filter(t => t.type_category === 'Image' || t.type_category === 'Video')
        : []

    // Generate carousel content via webhook
    const handleGenerate = async () => {
        setGenerating(true)
        setGenerateError(null)

        try {
            const response = await fetch(GENERATE_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ip_media: selectedMedia,
                    headline,
                    article_body: articleBody,
                    editor: user?.email || user?.name || 'Unknown'
                })
            })

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

            const result = await response.json()
            console.log('📦 Carousel raw response:', result)

            // Parse the n8n response format
            const data = Array.isArray(result) ? result[0] : result
            const parsed = parseCarouselResponse(data)

            // Validate: only show results if we actually got content
            const totalItems = parsed.headlines.length + parsed.slides.length + parsed.captions.length
            if (totalItems === 0) {
                setGenerateError('No content generated. Response was empty — n8n mungkin belum selesai memproses. Pastikan "Respond to Webhook" di n8n diletakkan setelah node parsing LLM.')
                setGenerating(false)
                return
            }

            setGenerated(parsed)
        } catch (error) {
            console.error('Generate error:', error)
            setGenerateError(`Failed to generate: ${error.message}`)
        }

        setGenerating(false)
    }

    // Set template for a card
    const handleSetTemplate = (cardKey, templateId) => {
        const template = imageTemplates.find(t => t.id === templateId)
        setCardTemplates(prev => ({ ...prev, [cardKey]: template }))
        // Reset fields when template changes
        setCardFields(prev => ({ ...prev, [cardKey]: {} }))
        // Clear error when changing template
        setCardErrors(prev => ({ ...prev, [cardKey]: null }))
    }

    // Update a field for a card
    const handleFieldChange = (cardKey, fieldName, value) => {
        setCardFields(prev => ({
            ...prev,
            [cardKey]: { ...(prev[cardKey] || {}), [fieldName]: value }
        }))
    }

    // Toggle card expanded state
    const toggleExpanded = (cardKey) => {
        setExpandedCards(prev => ({ ...prev, [cardKey]: !prev[cardKey] }))
    }

    // Submit individual card to production
    const handleCardSubmit = async (cardType, index, content) => {
        const cardKey = `${cardType}_${index}`
        const template = cardTemplates[cardKey]

        if (!template) {
            alert('Pilih template dulu sebelum submit!')
            return
        }

        setCardStatuses(prev => ({ ...prev, [cardKey]: 'sending' }))
        setCardErrors(prev => ({ ...prev, [cardKey]: null }))

        const fields = cardFields[cardKey] || {}
        const payload = {
            ip_media: selectedMedia,
            content_type: 'Image',
            template_type: template.backend_value,
            run_date: new Date().toISOString(),
            status: 'IN PROGRESS',
            editor: user?.email || user?.name || 'Unknown',
            source: 'carousel_tools',
            text_1: fields.text_1 ?? content,
            text_2: fields.text_2 || '',
            text_3: fields.text_3 || '',
            text_4: fields.text_4 || '',
            text_5: fields.text_5 || '',
            image_1: fields.image_1 || '',
            image_2: fields.image_2 || '',
            image_3: fields.image_3 || '',
            image_4: fields.image_4 || '',
            image_5: fields.image_5 || '',
            video_1: fields.video_1 || '',
            credit_text: fields.credit_text || ''
        }

        try {
            const response = await fetch(PRODUCTION_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

            const result = await response.json()
            const recordId = result.record_id || result.id

            if (recordId) {
                // Submit to global context (stepper)
                try {
                    startJob(payload, recordId)
                    startPolling(recordId, payload.editor)
                } catch (e) {
                    console.error('Failed to start polling/stepper:', e)
                    // Don't fail the card submission itself, as the webhook succeeded
                }
            }

            setCardStatuses(prev => ({ ...prev, [cardKey]: 'done' }))
            incrementWorkCount()
        } catch (error) {
            console.error('Card submit error (ignored for UI):', error)
            // User request: always show green/done even on error
            setCardStatuses(prev => ({ ...prev, [cardKey]: 'done' }))
        }
    }

    // Copy text to clipboard
    const handleCopy = (text, key) => {
        navigator.clipboard.writeText(text)
        setCopiedKey(key)
        setTimeout(() => setCopiedKey(null), 2000)
    }

    // Reset everything
    const handleReset = () => {
        reset()
        setSelectedMedia('')
        setHeadline('')
        setArticleBody('')
        setGenerated(null)
        setGenerating(false)
        setGenerateError(null)
        setCardStatuses({})
        setCardErrors({})
        setCardTemplates({})
        setCardFields({})
        setExpandedCards({})
    }

    // Get card status
    const getCardStatus = (cardType, index) => {
        return cardStatuses[`${cardType}_${index}`] || 'idle'
    }

    // Get visible MAIN fields (always shown: image_1, credit_text) - respecting asset_config
    const getMainFields = (cardKey) => {
        const template = cardTemplates[cardKey]
        if (!template) return []
        const config = template.asset_config || {}
        const hide = config.hide_fields || []
        // Default main fields
        const defaults = ['image_1', 'credit_text']
        return defaults.filter(f => !hide.includes(f))
    }

    // Get visible EXTRA fields (expandable) - respecting asset_config
    const getExtraFields = (cardKey) => {
        const template = cardTemplates[cardKey]
        if (!template) return []
        const config = template.asset_config || {}
        const hide = config.hide_fields || []
        const labels = config.labels || {}

        const defaults = ['text_2', 'image_2']
        const main = ['image_1', 'credit_text', 'text_1']

        // Find fields in labels that are not main/default and not hidden
        const dynamic = Object.keys(labels).filter(k =>
            !main.includes(k) && !defaults.includes(k) && !hide.includes(k)
        )

        const all = [...defaults.filter(f => !hide.includes(f)), ...dynamic]
        return [...new Set(all)]
    }

    // Render a field input based on field name
    const renderField = (cardKey, fieldName, template, fields) => {
        // Handle images and videos as URL inputs
        if (fieldName.startsWith('image_') || fieldName.startsWith('video_')) {
            return (
                <input
                    type="url"
                    className="form-input"
                    placeholder="https://..."
                    value={fields[fieldName] || ''}
                    onChange={(e) => handleFieldChange(cardKey, fieldName, e.target.value)}
                    style={{ fontSize: 12 }}
                />
            )
        } else if (fieldName === 'credit_text') {
            return (
                <input
                    type="text"
                    className="form-input"
                    placeholder="Source / Credit"
                    value={fields[fieldName] || ''}
                    onChange={(e) => handleFieldChange(cardKey, fieldName, e.target.value)}
                    style={{ fontSize: 12 }}
                />
            )
        } else {
            return (
                <textarea
                    className="form-input form-textarea"
                    placeholder={`Enter ${getFieldLabel(template, fieldName)}...`}
                    value={fields[fieldName] || ''}
                    onChange={(e) => handleFieldChange(cardKey, fieldName, e.target.value)}
                    rows={2}
                    style={{ fontSize: 12 }}
                />
            )
        }
    }

    // Render a production card (headline or slide)
    const renderProductionCard = (type, index, content, label) => {
        const cardKey = `${type}_${index}`
        const status = getCardStatus(type, index)
        const isSubmitting = status === 'sending'
        const isExpanded = expandedCards[cardKey]
        const selectedTemplate = cardTemplates[cardKey]
        const mainFields = getMainFields(cardKey)
        const extraFields = getExtraFields(cardKey)
        const fields = cardFields[cardKey] || {}
        const badgeClass = type === 'headline' ? 'headline' : 'slide'
        const errorMsg = cardErrors[cardKey]

        return (
            <div key={cardKey} className={`carousel-card ${status}`}>
                <div className="carousel-card-header">
                    <span className={`carousel-card-badge ${badgeClass}`}>{label}</span>
                    {status === 'done' && (
                        <span className="badge badge-success" style={{ fontSize: 10 }}>✓ Submitted</span>
                    )}
                </div>

                {/* text_1 - editable generated text */}
                {(!selectedTemplate?.asset_config?.hide_fields?.includes('text_1')) && (
                    <div className="form-group" style={{ marginBottom: 10 }}>
                        <label className="form-label text-xs">
                            {selectedTemplate ? getFieldLabel(selectedTemplate, 'text_1') : 'Text (editable)'}
                        </label>
                        <textarea
                            className="form-input form-textarea"
                            value={fields.text_1 ?? content}
                            onChange={(e) => handleFieldChange(cardKey, 'text_1', e.target.value)}
                            rows={3}
                            style={{ fontSize: 12, lineHeight: 1.6 }}
                        />
                    </div>
                )}

                {/* Main fields: image_1, credit_text (always visible when template selected) */}
                {selectedTemplate && mainFields.length > 0 && (
                    <div className="carousel-card-main-fields">
                        {mainFields.map(fieldName => (
                            <div key={fieldName} className="form-group" style={{ marginBottom: 8 }}>
                                <label className="form-label text-xs">
                                    {getFieldLabel(selectedTemplate, fieldName)}
                                </label>
                                {renderField(cardKey, fieldName, selectedTemplate, fields)}
                            </div>
                        ))}
                    </div>
                )}

                {/* Template Visual Grid */}
                <div className="carousel-card-template">
                    <label className="form-label text-sm">Template</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '8px', marginTop: 6 }}>
                        {imageTemplates.map(t => (
                            <div
                                key={t.id}
                                onClick={() => handleSetTemplate(cardKey, t.id)}
                                style={{
                                    border: selectedTemplate?.id === t.id ? '2px solid var(--color-primary)' : '1px solid var(--color-surface-border)',
                                    borderRadius: '6px',
                                    padding: '6px',
                                    cursor: 'pointer',
                                    background: selectedTemplate?.id === t.id ? 'var(--color-surface-hover)' : 'var(--color-surface)',
                                    transition: 'all 0.2s',
                                    position: 'relative'
                                }}
                                onMouseEnter={(e) => {
                                    const el = e.currentTarget;
                                    const preview = el.querySelector('.ct-template-preview');
                                    if (!preview) return;
                                    const rect = el.getBoundingClientRect();
                                    const pw = Array.isArray(t.preview_image) ? t.preview_image.length * 250 : 350;
                                    if (rect.right + pw + 20 < window.innerWidth) {
                                        preview.style.left = '110%'; preview.style.right = 'auto';
                                    } else {
                                        preview.style.right = '110%'; preview.style.left = 'auto';
                                    }
                                    if (rect.top - 20 + 300 > window.innerHeight) {
                                        preview.style.top = 'auto'; preview.style.bottom = '-10px';
                                    } else {
                                        preview.style.top = '-10px'; preview.style.bottom = 'auto';
                                    }
                                    preview.style.display = 'block';
                                }}
                                onMouseLeave={(e) => {
                                    const preview = e.currentTarget.querySelector('.ct-template-preview');
                                    if (preview) preview.style.display = 'none';
                                }}
                            >
                                <div style={{ width: '100%', aspectRatio: '1/1', background: '#f1f5f9', borderRadius: '4px', marginBottom: '4px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img
                                        src={Array.isArray(t.preview_image) ? t.preview_image[0] : (t.preview_image || `https://placehold.co/200x200/e2e8f0/1e293b?text=${encodeURIComponent(t.display_name)}`)}
                                        alt={t.display_name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/200x200/e2e8f0/1e293b?text=${encodeURIComponent(t.display_name)}` }}
                                    />
                                </div>
                                <div style={{ fontSize: '9px', fontWeight: 600, lineHeight: '1.2', textAlign: 'center', color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {t.display_name}
                                </div>
                                {/* Hover Preview */}
                                <div className="ct-template-preview" style={{
                                    display: 'none', position: 'absolute',
                                    width: Array.isArray(t.preview_image) ? `${t.preview_image.length * 250}px` : '350px',
                                    background: 'white', border: '1px solid var(--color-surface-border)',
                                    borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
                                    zIndex: 999, padding: '6px', pointerEvents: 'none'
                                }}>
                                    {Array.isArray(t.preview_image) ? (
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            {t.preview_image.map((url, idx) => (
                                                <img key={idx} src={url} alt={`Preview ${idx + 1}`} style={{ flex: 1, borderRadius: '4px', border: '1px solid #eee', maxWidth: '50%' }} />
                                            ))}
                                        </div>
                                    ) : (
                                        <img
                                            src={t.preview_image || `https://placehold.co/400x300/e2e8f0/1e293b?text=${encodeURIComponent(t.display_name)}`}
                                            alt="Preview" style={{ width: '100%', borderRadius: '4px', border: '1px solid #eee' }}
                                        />
                                    )}
                                    <div style={{ marginTop: '6px', fontSize: '12px', fontWeight: 'bold', color: '#1e293b' }}>{t.display_name}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Grid UI for specific templates (e.g. Fox Populi) */}
                {selectedTemplate?.asset_config?.ui_style === 'grid' && selectedTemplate.asset_config.options && (
                    <div className="carousel-card-grid mt-sm mb-md p-sm" style={{ border: '1px solid var(--color-surface-border)', borderRadius: 8, marginTop: 12, padding: 12 }}>
                        <label className="form-label text-xs uppercase mb-sm" style={{ color: 'var(--color-primary)', fontWeight: 700, marginBottom: 8, display: 'block' }}>
                            {selectedTemplate.asset_config.label || 'Select Option'}
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                            {selectedTemplate.asset_config.options.map(opt => {
                                const paramName = selectedTemplate.asset_config.param_name
                                const isSelected = fields[paramName] === opt.url
                                return (
                                    <div
                                        key={opt.name}
                                        onClick={() => handleFieldChange(cardKey, paramName, opt.url)}
                                        style={{
                                            border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-surface-border)',
                                            borderRadius: 6,
                                            padding: 4,
                                            cursor: 'pointer',
                                            background: isSelected ? 'rgba(29, 155, 240, 0.1)' : 'transparent',
                                            textAlign: 'center',
                                            transition: 'all 0.2s ease'
                                        }}
                                        title={opt.name}
                                    >
                                        <div style={{ width: '100%', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 4 }}>
                                            <img src={opt.url} alt={opt.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                        </div>
                                        <div style={{ fontSize: 10, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{opt.name}</div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Extra fields (expandable: text_2, image_2) */}
                {selectedTemplate && extraFields.length > 0 && (
                    <>
                        <button
                            className="carousel-card-expand"
                            onClick={() => toggleExpanded(cardKey)}
                        >
                            {isExpanded ? '▾ Hide additional fields' : '▸ Additional fields'} ({extraFields.length})
                        </button>

                        {isExpanded && (
                            <div className="carousel-card-fields">
                                {extraFields.map(fieldName => (
                                    <div key={fieldName} className="form-group" style={{ marginBottom: 8 }}>
                                        <label className="form-label text-xs">
                                            {getFieldLabel(selectedTemplate, fieldName)}
                                        </label>
                                        {renderField(cardKey, fieldName, selectedTemplate, fields)}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Actions */}
                <div className="carousel-card-actions">
                    {status === 'done' ? (
                        <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => setCardStatuses(prev => ({ ...prev, [cardKey]: 'idle' }))}
                        >
                            ↻ Resubmit
                        </button>
                    ) : (
                        <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleCardSubmit(type, index, content)}
                            disabled={isSubmitting || !selectedTemplate}
                            title={!selectedTemplate ? 'Pilih template dulu' : ''}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }}></span>
                                    Processing...
                                </>
                            ) : (
                                'Submit to Production'
                            )}
                        </button>
                    )}
                </div>
            </div>
        )
    }

    // Render a caption card (copy only, but text editable for QC)
    const renderCaptionCard = (index, content, label) => {
        const captionKey = `caption_${index}`
        const isCopied = copiedKey === captionKey
        const fields = cardFields[captionKey] || {}
        const currentText = fields.text_1 ?? content

        return (
            <div key={captionKey} className="carousel-card caption-card">
                <div className="carousel-card-header">
                    <span className="carousel-card-badge caption">{label || `Caption ${index + 1}`}</span>
                </div>
                <div className="form-group" style={{ marginBottom: 10, flex: 1 }}>
                    <textarea
                        className="form-input form-textarea"
                        value={currentText}
                        onChange={(e) => handleFieldChange(captionKey, 'text_1', e.target.value)}
                        rows={5}
                        style={{ fontSize: 12, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}
                    />
                </div>
                <div className="carousel-card-actions">
                    <button
                        className={`btn btn-sm ${isCopied ? 'btn-success' : 'btn-secondary'}`}
                        onClick={() => handleCopy(currentText, captionKey)}
                    >
                        {isCopied ? '✓ Copied!' : '📋 Copy Caption'}
                    </button>
                </div>
            </div>
        )
    }

    // Count submitted cards
    const submittedCount = Object.values(cardStatuses).filter(s => s === 'done').length
    const totalProductionCards = generated ? (generated.headlines.length + generated.slides.length) : 0

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Carousel Tools</h1>
                    <p className="page-subtitle">Generate carousel content from article/news</p>
                </div>
            </div>

            <div className="card" style={{ maxWidth: 800, margin: '0 auto' }}>
                <div className="form-group">
                    <label className="form-label">Select Media</label>
                    <select
                        className="form-input form-select"
                        value={selectedMedia}
                        onChange={(e) => {
                            setSelectedMedia(e.target.value)
                            setGenerated(null)
                        }}
                    >
                        <option value="">-- Choose Media --</option>
                        {MEDIA_LIST.map(media => (
                            <option key={media} value={media}>{media}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Input Headline</label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Judul artikel atau berita..."
                        value={headline}
                        onChange={(e) => setHeadline(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Article / Body</label>
                    <textarea
                        className="form-input form-textarea"
                        rows={6}
                        placeholder="Paste isi artikel atau poin-poin disini..."
                        value={articleBody}
                        onChange={(e) => setArticleBody(e.target.value)}
                    />
                </div>

                <div className="flex gap-sm">
                    <button
                        className="btn btn-primary"
                        onClick={handleGenerate}
                        disabled={generating || !selectedMedia || !headline || !articleBody}
                    >
                        {generating ? 'Generating...' : 'Generate Carousel Content'}
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={() => { setHeadline(''); setArticleBody(''); setGenerated(null); setGenerateError(null) }}
                        disabled={generating}
                    >
                        ↻ Reset Input
                    </button>
                </div>

                {generateError && (
                    <div className="alert alert-error mt-md">
                        {generateError}
                    </div>
                )}
            </div>

            {/* Results Section */}
            {generated && (
                <div className="carousel-results mt-xl" style={{ maxWidth: '1000px', margin: '40px auto' }}>
                    <div className="carousel-results-header mb-lg">
                        <h2 className="section-title">Generated Content</h2>
                        <div className="text-secondary text-sm">
                            {submittedCount} of {totalProductionCards} cards sent to production
                        </div>
                    </div>

                    {/* Section: Headlines */}
                    {generated.headlines.length > 0 && (
                        <div className="carousel-section">
                            <h3 className="carousel-section-title">
                                <span className="section-icon">📰</span>
                                Headline Options ({generated.headlines.length})
                            </h3>
                            <div className="carousel-grid">
                                {generated.headlines.map((item, i) =>
                                    renderProductionCard('headline', i, item.text, item.label)
                                )}
                            </div>
                        </div>
                    )}

                    {/* Section: Slide Narrations */}
                    {generated.slides.length > 0 && (
                        <div className="carousel-section">
                            <h3 className="carousel-section-title">
                                <span className="section-icon">📝</span>
                                Slide Narrations ({generated.slides.length})
                            </h3>
                            <div className="carousel-grid">
                                {generated.slides.map((item, i) =>
                                    renderProductionCard('slide', i, item.text, item.label)
                                )}
                            </div>
                        </div>
                    )}

                    {/* Section: Captions */}
                    {generated.captions.length > 0 && (
                        <div className="carousel-section">
                            <h3 className="carousel-section-title">
                                <span className="section-icon">✍️</span>
                                Caption Options ({generated.captions.length})
                            </h3>
                            <div className="carousel-grid">
                                {generated.captions.map((item, i) =>
                                    renderCaptionCard(i, item.text, item.label)
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <style>{`
        .carousel-results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .carousel-section {
          margin-bottom: var(--spacing-xl);
        }
        
        .carousel-section-title {
          font-size: var(--font-size-md);
          font-weight: 600;
          color: var(--color-text-primary);
          margin-bottom: var(--spacing-md);
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }
        
        .section-icon {
          font-size: 20px;
        }
        
        .carousel-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--spacing-md);
        }
        
        @media (max-width: 768px) {
          .carousel-grid {
            grid-template-columns: 1fr;
          }
        }
        
        .carousel-card {
          background: var(--color-surface);
          border: 2px solid var(--color-surface-border);
          border-radius: var(--radius-lg);
          padding: var(--spacing-lg);
          transition: all var(--transition-fast);
          display: flex;
          flex-direction: column;
        }
        
        .carousel-card:hover {
          border-color: var(--color-primary);
          box-shadow: var(--shadow-md);
        }
        
        .carousel-card.done {
          border-color: var(--color-success);
          background: color-mix(in srgb, var(--color-success) 5%, transparent);
        }
        
        .carousel-card.error {
          border-color: var(--color-error);
        }
        
        .carousel-card.sending {
          border-color: var(--color-warning);
          opacity: 0.85;
        }
        
        .carousel-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-md);
        }
        
        .carousel-card-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 4px;
          text-transform: uppercase;
        }
        
        .carousel-card-badge.headline {
          background: var(--color-warning);
          color: #000;
        }
        
        .carousel-card-badge.slide {
          background: var(--color-secondary);
          color: #fff;
        }
        
        .carousel-card-badge.caption {
          background: var(--color-bg-tertiary);
          color: var(--color-text-secondary);
        }
        
        .carousel-card-actions {
          margin-top: auto;
          display: flex;
          justify-content: flex-end;
          padding-top: var(--spacing-md);
        }
        
        .carousel-card-expand {
          font-size: 11px;
          color: var(--color-primary);
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          margin: 4px 0 12px;
          text-align: left;
        }
        
        .carousel-card-expand:hover {
          text-decoration: underline;
        }
        
        .carousel-card-main-fields,
        .carousel-card-fields {
          border-top: 1px solid var(--color-surface-border);
          padding-top: 12px;
          margin-top: 8px;
        }
      `}</style>
        </div>
    )
}
