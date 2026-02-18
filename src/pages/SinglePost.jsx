import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProduction } from '../context/ProductionContext'
import { useAuth } from '../context/AuthContext'
import { MEDIA_LIST, SINGLE_POST_TYPES, getTemplatesForMedia, getVisibleFields, getFieldLabel } from '../data/mediaData'

// n8n Webhook URL
const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_SINGLE_POST

export default function SinglePost() {
    const { status, setStatus, setOutput, setError, reset, startPolling, startJob } = useProduction()
    const { user, incrementWorkCount } = useAuth()

    const [searchParams, setSearchParams] = useSearchParams()

    // Form state
    const [selectedMedia, setSelectedMedia] = useState('')
    const [selectedContentType, setSelectedContentType] = useState('')
    const [selectedTemplate, setSelectedTemplate] = useState(null)
    const [formData, setFormData] = useState({})
    const [isLoaded, setIsLoaded] = useState(false) // Safety flag
    const [draftNotif, setDraftNotif] = useState(null)

    // Get templates for selected media, filtered by content type
    const allTemplates = selectedMedia ? getTemplatesForMedia(selectedMedia) : []
    const templates = selectedContentType
        ? allTemplates.filter(t => t.type_category?.toLowerCase() === selectedContentType.toLowerCase())
        : allTemplates

    // Get visible fields for selected template
    const visibleFields = selectedTemplate ? getVisibleFields(selectedTemplate) : []

    // Handle media change
    const handleMediaChange = (e) => {
        setSelectedMedia(e.target.value)
        setSelectedContentType('')
        setSelectedTemplate(null)
        setFormData({})
        reset()
    }

    // Handle content type change
    const handleContentTypeChange = (e) => {
        setSelectedContentType(e.target.value)
        setSelectedTemplate(null)
        setFormData({})
    }

    // Handle template change
    const handleTemplateChange = (e) => {
        const template = templates.find(t => t.id === e.target.value)
        setSelectedTemplate(template)
        setFormData({})
    }

    // Handle form input change
    const handleInputChange = (fieldName, value) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: value
        }))
    }

    // Handle submit - send to n8n webhook
    const handleSubmit = async () => {
        const payload = {
            ip_media: selectedMedia,
            content_type: selectedContentType,
            template_type: selectedTemplate.backend_value,
            run_date: new Date().toISOString(),
            status: 'IN PROGRESS',
            editor: user?.email || user?.name || 'Unknown',
            source: 'single_post',
            ...formData
        }

        try {
            // Update status to sending
            setStatus('sending')

            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const result = await response.json()

            // Get record_id from webhook response (n8n should return this after Supabase insert)
            const recordId = result.record_id || result.id

            if (recordId) {
                // Start polling Supabase for status updates
                console.log('Got record_id, starting polling:', recordId)
                startJob(payload, recordId)
                startPolling(recordId, payload.editor)
                incrementWorkCount()
            } else {
                // Fallback: no record_id returned, use old behavior
                console.log('No record_id returned, using direct response')
                if (result.success || result.status === 'ok') {
                    setOutput(result.output_url || result.url || null)
                    incrementWorkCount()
                } else {
                    throw new Error(result.message || 'Production failed')
                }
            }
        } catch (error) {
            console.error('Webhook error:', error)
            setError(error.message)
        }
    }

    // Handle retry
    const handleRetry = () => {
        reset()
        handleSubmit()
    }

    // Save draft
    const handleSaveDraft = () => {
        if (!selectedMedia && !selectedContentType && Object.keys(formData).length === 0) {
            setDraftNotif({ type: 'error', message: 'Nothing to save' })
            setTimeout(() => setDraftNotif(null), 3000)
            return
        }

        const draftData = {
            id: Date.now().toString(),
            title: `${selectedMedia || 'Untitled'} - ${selectedContentType || 'Draft'}`,
            tool: 'SinglePost',
            media: selectedMedia,
            data: {
                selectedMedia,
                selectedContentType,
                selectedTemplateId: selectedTemplate?.id,
                formData
            },
            savedAt: new Date().toISOString()
        }

        const existingDrafts = JSON.parse(localStorage.getItem('drafts') || '[]')
        localStorage.setItem('drafts', JSON.stringify([draftData, ...existingDrafts]))

        setDraftNotif({ type: 'success', message: '✓ Draft Saved' })
        setTimeout(() => setDraftNotif(null), 3000)
    }

    // Load draft from data object
    const loadDraft = (draftData) => {
        const { selectedMedia: draftMedia, selectedContentType: draftType, selectedTemplateId, formData: draftFormData } = draftData

        if (draftMedia) setSelectedMedia(draftMedia)
        if (draftType) setSelectedContentType(draftType)
        if (selectedTemplateId) {
            const template = getTemplatesForMedia(draftMedia).find(t => t.id === selectedTemplateId)
            if (template) setSelectedTemplate(template)
        }
        if (draftFormData) setFormData(draftFormData)
    }

    // --- AUTO-SAVE LOGIC ---
    // Load autosave if no draft ID in URL
    useEffect(() => {
        const draftId = searchParams.get('draft')
        if (draftId) {
            setIsLoaded(true)
            return
        }

        try {
            const saved = localStorage.getItem('singlepost_autosave')
            if (saved) {
                const data = JSON.parse(saved)
                loadDraft(data)
                // Optional: setDraftNotif({ type: 'info', message: 'Restored from autosave' })
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
                selectedContentType,
                selectedTemplateId: selectedTemplate?.id,
                formData,
                timestamp: Date.now()
            }
            localStorage.setItem('singlepost_autosave', JSON.stringify(dataToSave))
        }, 1000)

        return () => clearTimeout(timeoutId)
    }, [selectedMedia, selectedContentType, selectedTemplate, formData, isLoaded])
    // -----------------------

    // Check for draft param on mount
    useEffect(() => {
        const draftId = searchParams.get('draft')
        if (draftId) {
            const drafts = JSON.parse(localStorage.getItem('drafts') || '[]')
            const draft = drafts.find(d => d.id === draftId)
            if (draft && draft.tool === 'SinglePost') {
                loadDraft(draft.data)
                setDraftNotif({ type: 'info', message: '📝 Draft loaded' })
                setTimeout(() => setDraftNotif(null), 3000)
            }
            setSearchParams({}) // Clear URL param
        }
    }, [])

    // Check if form is valid
    const isFormValid = selectedMedia && selectedContentType && selectedTemplate &&
        visibleFields.every(field => formData[field]?.trim())

    return (
        <div style={{ maxWidth: '70%', margin: '0 auto' }}>
            <div className="page-header">
                <h1 className="page-title">Single Post</h1>
                <p className="page-subtitle">Create single content with your materials</p>
            </div>

            <div className="card">

                {/* Draft Notification */}
                {draftNotif && (
                    <div className={`draft-notif draft-notif-${draftNotif.type}`}>
                        {draftNotif.message}
                    </div>
                )}

                {/* Step 1: Select Media */}
                <div className="form-section">
                    <h3 className="form-section-title">1. Select Media</h3>
                    <div className="form-group">
                        <label className="form-label">Media Name</label>
                        <select
                            className="form-input form-select"
                            value={selectedMedia}
                            onChange={handleMediaChange}
                        >
                            <option value="">-- Choose Media --</option>
                            {MEDIA_LIST.map(media => (
                                <option key={media} value={media}>{media}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Step 2: Select Content Type */}
                {selectedMedia && (
                    <div className="form-section">
                        <h3 className="form-section-title">2. Select Content Type</h3>
                        <div className="form-group">
                            <label className="form-label">Content Type</label>
                            <select
                                className="form-input form-select"
                                value={selectedContentType}
                                onChange={handleContentTypeChange}
                            >
                                <option value="">-- Choose Content Type --</option>
                                {SINGLE_POST_TYPES.map(type => (
                                    <option key={type.id} value={type.id}>{type.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {/* Step 3: Select Template */}
                {selectedContentType && (
                    <div className="form-section">
                        <h3 className="form-section-title">3. Select Template</h3>
                        <div className="form-group">
                            <label className="form-label">Template</label>
                            <select
                                className="form-input form-select"
                                value={selectedTemplate?.id || ''}
                                onChange={handleTemplateChange}
                            >
                                <option value="">-- Choose Template --</option>
                                {templates.map(template => (
                                    <option key={template.id} value={template.id}>
                                        {template.display_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {/* Step 4: Fill Content */}
                {selectedTemplate && (
                    <div className="form-section">
                        <h3 className="form-section-title">4. Fill Content</h3>

                        {/* Grid UI for specific templates */}
                        {selectedTemplate?.asset_config?.ui_style === 'grid' && selectedTemplate.asset_config.options && (
                            <div className="carousel-card-grid mt-sm mb-md p-sm" style={{ border: '1px solid var(--color-surface-border)', borderRadius: 8, marginTop: 12, padding: 12, marginBottom: 24 }}>
                                <label className="form-label text-xs uppercase mb-sm" style={{ color: 'var(--color-primary)', fontWeight: 700, marginBottom: 8, display: 'block' }}>
                                    {selectedTemplate.asset_config.label || 'Select Option'}
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                                    {selectedTemplate.asset_config.options.map(opt => {
                                        const paramName = selectedTemplate.asset_config.param_name
                                        const isSelected = formData[paramName] === opt.url
                                        return (
                                            <div
                                                key={opt.name}
                                                onClick={() => handleInputChange(paramName, opt.url)}
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
                        <div className="content-fields">
                            {visibleFields.map(field => {
                                const fieldType = field.startsWith('text') || field === 'credit_text' ? 'text'
                                    : field.startsWith('image') ? 'image'
                                        : 'video'

                                return (
                                    <div key={field} className="form-group">
                                        <label className="form-label">
                                            {getFieldLabel(selectedTemplate, field)}
                                            <span className={`field-type-badge ${fieldType}`}>{fieldType}</span>
                                        </label>
                                        {fieldType === 'text' ? (
                                            <textarea
                                                className="form-input form-textarea"
                                                placeholder={`Enter ${getFieldLabel(selectedTemplate, field).toLowerCase()}...`}
                                                value={formData[field] || ''}
                                                onChange={(e) => handleInputChange(field, e.target.value)}
                                                rows={field === 'credit_text' ? 2 : 3}
                                            />
                                        ) : (
                                            <input
                                                type="url"
                                                className="form-input"
                                                placeholder={`Enter ${fieldType} URL...`}
                                                value={formData[field] || ''}
                                                onChange={(e) => handleInputChange(field, e.target.value)}
                                            />
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Submit Section */}
                {selectedTemplate && (
                    <div className="submit-section">
                        {status === 'error' ? (
                            <div className="flex gap-md">
                                <button
                                    className="btn btn-error btn-lg"
                                    onClick={handleRetry}
                                >
                                    ↻ Retry Submit
                                </button>
                                <button
                                    className="btn btn-secondary btn-lg"
                                    onClick={reset}
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : status === 'done' ? (
                            <div className="success-message" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <span className="badge badge-success" style={{ fontSize: 14, padding: '8px 16px' }}>
                                    ✓ Production Complete!
                                </span>
                                <button
                                    className="btn btn-primary btn-lg"
                                    onClick={() => {
                                        reset()
                                        setSelectedMedia('')
                                        setSelectedContentType('')
                                        setSelectedTemplate(null)
                                        setFormData({})
                                    }}
                                >
                                    Create New
                                </button>
                            </div>
                        ) : (
                            <div className="submit-actions">
                                <button
                                    className="btn btn-primary btn-sm submit-btn"
                                    onClick={handleSubmit}
                                    disabled={!isFormValid || status === 'sending' || status === 'producing'}
                                >
                                    {status === 'sending' || status === 'producing' ? (
                                        <>
                                            <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }}></span>
                                            Processing...
                                        </>
                                    ) : (
                                        'Submit to Production'
                                    )}
                                </button>
                                {(selectedMedia || selectedContentType || Object.keys(formData).length > 0) && (
                                    <div className="secondary-btns">
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => { setFormData({}); setSelectedTemplate(null); setSelectedContentType('') }}
                                            disabled={status === 'sending' || status === 'producing'}
                                            title="Reset Input"
                                        >
                                            ↻ Reset Input
                                        </button>
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={handleSaveDraft}
                                            disabled={status === 'sending' || status === 'producing'}
                                            title="Save Draft"
                                        >
                                            🔖 Save Draft
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style>{`
        .form-section {
          padding-bottom: var(--spacing-lg);
          margin-bottom: var(--spacing-lg);
          border-bottom: 1px solid var(--color-surface-border);
        }
        
        .form-section:last-of-type {
          border-bottom: none;
        }

        .draft-notif {
          position: fixed;
          top: 80px;
          right: 24px;
          padding: 12px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          animation: slideIn 0.3s ease-out;
          z-index: 1000;
        }

        .draft-notif-success {
          background: var(--color-success);
          color: white;
        }

        .draft-notif-error {
          background: var(--color-error);
          color: white;
        }

        .draft-notif-info {
          background: var(--color-primary);
          color: white;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        
        .form-section-title {
          font-size: var(--font-size-md);
          font-weight: 600;
          color: var(--color-text-primary);
          margin-bottom: var(--spacing-md);
        }
        
        .content-fields {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--spacing-md);
        }
        
        @media (max-width: 768px) {
          .content-fields {
            grid-template-columns: 1fr;
          }
        }
        
        .field-type-badge {
          display: inline-block;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          padding: 2px 6px;
          border-radius: 4px;
          margin-left: 8px;
        }
        
        .field-type-badge.text {
          background: var(--color-info-bg);
          color: var(--color-info);
        }
        
        .field-type-badge.image {
          background: var(--color-success-bg);
          color: var(--color-success);
        }
        
        .field-type-badge.video {
          background: var(--color-warning-bg);
          color: var(--color-warning);
        }
        
        .submit-section {
          padding-top: var(--spacing-lg);
          border-top: 1px solid var(--color-surface-border);
        }
        
        .success-message {
          text-align: center;
        }

        .submit-actions {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
          width: 100%;
        }

        .submit-btn {
          width: 100%;
          padding: 12px;
          order: 1; /* Submit button always first/top on mobile */
        }
        
        .secondary-btns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-sm);
          order: 2;
        }

        @media (min-width: 768px) {
          .submit-actions {
            flex-direction: row;
            align-items: center;
          }
          .submit-btn {
             flex: 1;
             width: auto;
             padding: var(--spacing-sm) var(--spacing-md);
             order: 1;
          }
          .secondary-btns {
             display: flex;
             gap: var(--spacing-sm);
             order: 2;
          }
        }
      `}</style>
        </div >
    )
}
