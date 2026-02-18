import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTemplatesForMedia } from '../data/mediaData'

export default function Draft() {
    const navigate = useNavigate()
    const [drafts, setDrafts] = useState([])
    const [selectedDraft, setSelectedDraft] = useState(null)

    // Map tool names to routes
    const getToolRoute = (toolName) => {
        const routes = {
            'SinglePost': '/single-post',
            'CarouselTools': '/carousel-tools',
            'ClipperTools': '/clipper-tools',
            'OneClick': '/one-click'
        }
        return routes[toolName] || '/'
    }

    // Load drafts from localStorage
    useEffect(() => {
        const savedDrafts = localStorage.getItem('drafts')
        if (savedDrafts) {
            try {
                setDrafts(JSON.parse(savedDrafts))
            } catch (e) {
                console.error('Error loading drafts:', e)
            }
        }
    }, [])

    // Delete draft
    const handleDelete = (draftId) => {
        const updatedDrafts = drafts.filter(d => d.id !== draftId)
        setDrafts(updatedDrafts)
        localStorage.setItem('drafts', JSON.stringify(updatedDrafts))
        if (selectedDraft?.id === draftId) {
            setSelectedDraft(null)
        }
    }

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Draft</h1>
                <p className="page-subtitle">Your saved production materials (stored locally)</p>
            </div>

            {drafts.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">📝</div>
                        <p className="empty-state-title">No Drafts Yet</p>
                        <p className="empty-state-text">
                            Drafts will appear here when you save your work in progress
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-3">
                    {/* Draft List */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Saved Drafts</h2>
                            <span className="badge badge-info">{drafts.length}</span>
                        </div>

                        <div className="draft-list">
                            {drafts.map(draft => (
                                <div
                                    key={draft.id}
                                    className={`draft-item ${selectedDraft?.id === draft.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedDraft(draft)}
                                >
                                    <div className="draft-item-header">
                                        <span className="draft-title">{draft.title || 'Untitled'}</span>
                                        <button
                                            className="draft-delete"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleDelete(draft.id)
                                            }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                    <div className="draft-meta">
                                        <span className="badge badge-info" style={{ fontSize: 10 }}>{draft.tool}</span>
                                        <span className="draft-date">{formatDate(draft.savedAt)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Draft Preview */}
                    <div className="card" style={{ gridColumn: 'span 2' }}>
                        <div className="card-header">
                            <h2 className="card-title">Preview</h2>
                        </div>

                        {selectedDraft ? (
                            <div className="draft-preview">
                                <div className="preview-header">
                                    <h3>{selectedDraft.title || 'Untitled Draft'}</h3>
                                    <div className="preview-meta">
                                        <span className="badge badge-info">{selectedDraft.tool}</span>
                                        <span className="badge badge-warning">{selectedDraft.media}</span>
                                    </div>
                                </div>

                                <div className="preview-content">
                                    {selectedDraft.data ? (
                                        <div className="preview-fields">
                                            {/* Media & Type Info */}
                                            {selectedDraft.data.selectedMedia && (
                                                <div className="preview-field">
                                                    <span className="field-label">Media:</span>
                                                    <span className="field-value">{selectedDraft.data.selectedMedia}</span>
                                                </div>
                                            )}
                                            {selectedDraft.data.selectedContentType && (
                                                <div className="preview-field">
                                                    <span className="field-label">Content Type:</span>
                                                    <span className="field-value">{selectedDraft.data.selectedContentType}</span>
                                                </div>
                                            )}
                                            {selectedDraft.data.selectedTemplateId && (() => {
                                                const templates = selectedDraft.data.selectedMedia ? getTemplatesForMedia(selectedDraft.data.selectedMedia) : []
                                                const template = templates.find(t => t.id === selectedDraft.data.selectedTemplateId)
                                                return (
                                                    <div className="preview-field">
                                                        <span className="field-label">Template:</span>
                                                        <span className="field-value">{template?.display_name || selectedDraft.data.selectedTemplateId}</span>
                                                    </div>
                                                )
                                            })()}

                                            {/* Form Fields */}
                                            {selectedDraft.data.formData && Object.keys(selectedDraft.data.formData).length > 0 && (
                                                <>
                                                    <div className="preview-divider"></div>
                                                    {Object.entries(selectedDraft.data.formData).map(([key, value]) => {
                                                        if (!value || !value.trim()) return null

                                                        // Convert field key to readable label
                                                        let label = key
                                                            .replace(/_/g, ' ')
                                                            .replace(/\b\w/g, l => l.toUpperCase())

                                                        // Detect if it's a URL
                                                        const isUrl = value.startsWith('http://') || value.startsWith('https://')

                                                        return (
                                                            <div key={key} className="preview-field">
                                                                <span className="field-label">{label}:</span>
                                                                {isUrl ? (
                                                                    <a
                                                                        href={value}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="field-value field-link"
                                                                    >
                                                                        {value.length > 50 ? value.substring(0, 50) + '...' : value}
                                                                    </a>
                                                                ) : (
                                                                    <span className="field-value">{value}</span>
                                                                )}
                                                            </div>
                                                        )
                                                    })}
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-muted">No preview data available</p>
                                    )}
                                </div>

                                <div className="preview-actions mt-lg">
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => {
                                            const route = getToolRoute(selectedDraft.tool)
                                            navigate(`${route}?draft=${selectedDraft.id}`)
                                        }}
                                    >
                                        Continue Editing
                                    </button>
                                    <button
                                        className="btn btn-error"
                                        onClick={() => handleDelete(selectedDraft.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="empty-state">
                                <p className="text-muted">Select a draft to preview</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style>{`
        .draft-list {
        }
        
        .draft-item {
          padding: var(--spacing-md);
          border-bottom: 1px solid var(--color-surface-border);
          cursor: pointer;
          transition: background var(--transition-fast);
        }
        
        .draft-item:hover {
          background: var(--color-bg-tertiary);
        }
        
        .draft-item.selected {
          background: var(--color-primary-light);
          border-left: 3px solid var(--color-primary);
        }
        
        .draft-item-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: var(--spacing-xs);
        }
        
        .draft-title {
          font-weight: 500;
          font-size: var(--font-size-sm);
        }
        
        .draft-delete {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--color-error-bg);
          color: var(--color-error);
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity var(--transition-fast);
        }
        
        .draft-item:hover .draft-delete {
          opacity: 1;
        }
        
        .draft-meta {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }
        
        .draft-date {
          font-size: var(--font-size-xs);
          color: var(--color-text-muted);
        }
        
        .draft-preview {
          padding: var(--spacing-md);
        }
        
        .preview-header {
          margin-bottom: var(--spacing-lg);
        }
        
        .preview-header h3 {
          font-size: var(--font-size-lg);
          margin-bottom: var(--spacing-sm);
        }
        
        .preview-meta {
          display: flex;
          gap: var(--spacing-sm);
        }
        
        .preview-content {
          border-radius: var(--radius-md);
          padding: var(--spacing-sm);
        }
        
        .preview-content pre {
          font-size: var(--font-size-xs);
          font-family: monospace;
          white-space: pre-wrap;
          margin: 0;
        }

        .preview-fields {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .preview-field {
          display: flex;
          gap: var(--spacing-sm);
          padding: 6px var(--spacing-sm);
          background: var(--color-bg-secondary);
          border-radius: var(--radius-sm);
        }

        .field-label {
          font-weight: 600;
          color: var(--color-text-secondary);
          min-width: 120px;
          flex-shrink: 0;
        }

        .field-value {
          color: var(--color-text-primary);
          word-break: break-word;
        }

        .field-link {
          color: var(--color-primary);
          text-decoration: none;
        }

        .field-link:hover {
          text-decoration: underline;
        }

        .template-id {
          font-family: monospace;
          font-size: var(--font-size-xs);
          background: var(--color-bg-tertiary);
          padding: 2px 6px;
          border-radius: 4px;
        }

        .preview-divider {
          height: 1px;
          background: var(--color-surface-border);
          margin: var(--spacing-sm) 0;
        }
        
        .preview-actions {
          display: flex;
          gap: var(--spacing-md);
        }
        
        .empty-state {
          padding: var(--spacing-2xl);
          text-align: center;
        }
        
        .empty-state-icon {
          font-size: 48px;
          margin-bottom: var(--spacing-md);
        }
      `}</style>
        </div>
    )
}
