import { useState, useEffect } from 'react'
import { MEDIA_LIST } from '../data/mediaData'
import { useAuth } from '../context/AuthContext'
import { getProductionHistory } from '../lib/supabase'

export default function History() {
    const { user } = useAuth()
    const [selectedMedia, setSelectedMedia] = useState('')
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user?.email) {
            setLoading(true)
            getProductionHistory(user.email, 100).then(data => {
                setHistory(data || [])
                setLoading(false)
            })
        }
    }, [user?.email])

    // Filter history by media
    const filteredHistory = selectedMedia
        ? history.filter(h => h.ip_media === selectedMedia)
        : history

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '-'
        const date = new Date(dateString)
        const now = new Date()
        const diff = now - date

        if (diff < 3600000) {
            const mins = Math.floor(diff / 60000)
            return `${mins} min ago`
        } else if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000)
            return `${hours} hour${hours > 1 ? 's' : ''} ago`
        } else {
            return date.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            })
        }
    }

    const getStatusBadge = (status) => {
        const s = status?.toUpperCase() || ''
        if (['DONE', 'COMPLETED'].includes(s)) return { cls: 'success', text: 'Completed' }
        if (['ERROR', 'FAILED'].includes(s)) return { cls: 'error', text: 'Failed' }
        return { cls: 'warning', text: 'In Progress' }
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Production History</h1>
                <p className="page-subtitle">Your production records from Supabase</p>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="form-group" style={{ marginBottom: 0, minWidth: 200 }}>
                        <select
                            className="form-input form-select"
                            value={selectedMedia}
                            onChange={(e) => setSelectedMedia(e.target.value)}
                        >
                            <option value="">All Media</option>
                            {MEDIA_LIST.map(media => (
                                <option key={media} value={media}>{media}</option>
                            ))}
                        </select>
                    </div>
                    <span className="badge badge-info">{filteredHistory.length} items</span>
                </div>

                {loading ? (
                    <p className="text-muted" style={{ textAlign: 'center', padding: 40 }}>Loading history...</p>
                ) : filteredHistory.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📋</div>
                        <p className="empty-state-title">No History</p>
                        <p className="empty-state-text">No production history {selectedMedia ? `for ${selectedMedia}` : ''} yet</p>
                    </div>
                ) : (
                    <div className="history-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Media</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th>Time</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredHistory.map(item => {
                                    const badge = getStatusBadge(item.status)
                                    return (
                                        <tr key={item.id}>
                                            <td>
                                                <span className="media-name">{item.ip_media || '-'}</span>
                                            </td>
                                            <td>{item.content_type || '-'}</td>
                                            <td>
                                                <span className={`badge badge-${badge.cls}`}>
                                                    {badge.text}
                                                </span>
                                            </td>
                                            <td className="text-muted">{formatDate(item.created_at)}</td>
                                            <td>
                                                {item.output_url && (
                                                    <a href={item.output_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-secondary">
                                                        View
                                                    </a>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <style>{`
        .history-table {
          overflow-x: auto;
        }
        
        .history-table table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .history-table th {
          text-align: left;
          font-size: var(--font-size-xs);
          font-weight: 600;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: var(--spacing-sm) var(--spacing-md);
          border-bottom: 1px solid var(--color-surface-border);
        }
        
        .history-table td {
          padding: var(--spacing-md);
          font-size: var(--font-size-sm);
          border-bottom: 1px solid var(--color-surface-border);
        }
        
        .history-table tr:hover {
          background: var(--color-bg-tertiary);
        }
        
        .history-table tr:last-child td {
          border-bottom: none;
        }
        
        .media-name {
          font-weight: 500;
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
