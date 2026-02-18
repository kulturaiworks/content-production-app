import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_DOWNLOADER

export default function Downloader() {
    const { user } = useAuth()

    const [link, setLink] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState(null)
    const [copiedKey, setCopiedKey] = useState(null)
    const [rawResponse, setRawResponse] = useState(null)
    const [showRaw, setShowRaw] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false) // Safety flag

    // Detect platform from URL
    const detectPlatform = (url) => {
        if (url.includes('instagram')) return { name: 'Instagram', icon: '📸', color: '#E1306C' }
        if (url.includes('tiktok')) return { name: 'TikTok', icon: '🎵', color: '#00f2ea' }
        if (url.includes('twitter') || url.includes('x.com')) return { name: 'X / Twitter', icon: '𝕏', color: '#1DA1F2' }
        if (url.includes('facebook')) return { name: 'Facebook', icon: '📘', color: '#1877F2' }
        if (url.includes('threads')) return { name: 'Threads', icon: '🧵', color: '#000000' }
        if (url.includes('youtube') || url.includes('youtu.be')) return { name: 'YouTube', icon: '▶️', color: '#FF0000' }
        return { name: 'Unknown', icon: '🔗', color: '#6b7280' }
    }

    const handleDownload = async () => {
        if (!link.trim()) return

        setLoading(true)
        setError(null)
        setResult(null)

        const platform = detectPlatform(link)

        const payload = {
            source: 'downloader',
            social_link: link.trim(),
            platform: platform.name,
            run_date: new Date().toISOString(),
            editor: user?.email || user?.name || 'Unknown'
        }

        try {
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (!response.ok) throw new Error(`HTTP error: ${response.status}`)

            const data = await response.json()
            console.log('📦 Downloader response:', data)
            setRawResponse(data)

            // Parse response — handle array or single object
            const parsed = Array.isArray(data) ? data[0] : data

            // Extract a link from an object
            const extractLink = (obj) => {
                if (typeof obj === 'string') return obj.trim()
                if (!obj || typeof obj !== 'object') return null
                return obj.direct_link || obj.url || obj.link || obj.dropbox_link ||
                    obj.shared_link || obj.output_url || null
            }

            // Try to collect all Dropbox links
            let allLinks = []

            // Pattern 1: Array response — one item per file
            if (Array.isArray(data)) {
                allLinks = data.map(item => extractLink(item)).filter(Boolean)
            } else if (typeof parsed === 'object' && parsed !== null) {

                // Pattern 2: results/items/files array
                const resultsArr = parsed.results || parsed.items || parsed.files
                if (Array.isArray(resultsArr) && resultsArr.length > 0) {
                    allLinks = resultsArr.map(item => extractLink(item)).filter(Boolean)
                }

                // Pattern 3: output_for_sheet — string with multiple URLs (comma or newline separated)
                if (allLinks.length === 0 && parsed.output_for_sheet) {
                    const sheet = parsed.output_for_sheet
                    if (typeof sheet === 'string') {
                        allLinks = sheet.split(/[\n,]+/).map(s => s.trim()).filter(s => s.startsWith('http'))
                    } else if (Array.isArray(sheet)) {
                        allLinks = sheet.map(s => typeof s === 'string' ? s.trim() : extractLink(s)).filter(Boolean)
                    }
                }

                // Pattern 4: Numbered keys (direct_link_1, direct_link_2, url_1, url_2)
                if (allLinks.length === 0) {
                    for (let i = 1; i <= 10; i++) {
                        const l = parsed[`direct_link_${i}`] || parsed[`url_${i}`] || parsed[`link_${i}`]
                        if (l) allLinks.push(l)
                    }
                }

                // Pattern 5: Single link
                if (allLinks.length === 0) {
                    const single = extractLink(parsed)
                    if (single) allLinks.push(single)
                }
            }

            if (allLinks.length > 0) {
                const isVideo = link.includes('reels') || link.includes('video') || link.includes('tiktok')
                const mediaType = isVideo ? 'Video' : 'Image'

                const links = allLinks.map((dl, i) => ({
                    filename: `${mediaType} ${i + 1}`,
                    type: mediaType.toLowerCase(),
                    directLink: dl.includes('dl=0') ? dl.replace('dl=0', 'dl=1') : (dl.includes('dl=') ? dl : dl + (dl.includes('?') ? '&dl=1' : '?dl=1')),
                    viewLink: dl.includes('dl=1') ? dl.replace('dl=1', 'dl=0') : (dl.includes('dl=') ? dl : dl + (dl.includes('?') ? '&dl=0' : '?dl=0'))
                }))

                setResult({ platform, links, multi: links.length > 1 })
            } else {
                // Can't parse — show raw
                setResult({ platform, links: [], raw: parsed })
            }
        } catch (err) {
            console.error('Download error:', err)
            setError(err.message || 'Failed to download. Check the link and try again.')
        } finally {
            setLoading(false)
        }
    }

    // --- AUTOSAVE LOGIC ---
    // Load on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem('downloader_autosave')
            if (saved) {
                const data = JSON.parse(saved)
                if (data.link) setLink(data.link)
                if (data.result) setResult(data.result)
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

        if (result || link) {
            const dataToSave = {
                link,
                result,
                timestamp: Date.now()
            }
            localStorage.setItem('downloader_autosave', JSON.stringify(dataToSave))
        }
    }, [link, result, isLoaded])
    // ----------------------

    const handleCopy = (text, key) => {
        navigator.clipboard.writeText(text)
        setCopiedKey(key)
        setTimeout(() => setCopiedKey(null), 2000)
    }

    const handleReset = () => {
        setLink('')
        setResult(null)
        setError(null)
        setRawResponse(null)
        setShowRaw(false)
        setCopiedKey(null)

        localStorage.removeItem('downloader_autosave')
    }

    const platform = link ? detectPlatform(link) : null

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Image/Video Downloader</h1>
                <p className="page-subtitle">Download media from social platforms → get Dropbox direct links</p>
            </div>

            <div className="card" style={{ maxWidth: 600, margin: '0 auto' }}>
                {!result ? (
                    <>
                        <div className="platform-icons">
                            {[1, 2, 3].map(i => (
                                <svg key={i} width="48" height="48" viewBox="0 0 48 48" className="platform-icon">
                                    <defs>
                                        <linearGradient id={`downloadGradient${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#ef4444" />
                                            <stop offset="100%" stopColor="#a855f7" />
                                        </linearGradient>
                                    </defs>
                                    {/* Cloud */}
                                    <path d="M36 20c0-6.627-5.373-12-12-12-5.305 0-9.799 3.44-11.354 8.207C9.192 16.654 6 20.108 6 24.5 6 29.194 9.806 33 14.5 33H36c4.418 0 8-3.582 8-8s-3.582-8-8-8z"
                                        fill={`url(#downloadGradient${i})`} opacity="0.2" stroke={`url(#downloadGradient${i})`} strokeWidth="1.5" />
                                    {/* Arrow */}
                                    <path d="M24 18v14m0 0l-5-5m5 5l5-5"
                                        stroke={`url(#downloadGradient${i})`} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                    <line x1="16" y1="38" x2="32" y2="38"
                                        stroke={`url(#downloadGradient${i})`} strokeWidth="2.5" strokeLinecap="round" />
                                </svg>
                            ))}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Social Media Link</label>
                            <input
                                type="url"
                                className="form-input"
                                placeholder="Paste link di sini..."
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                            />
                            {platform && link.trim() && (
                                <div className="dl-platform-badge" style={{ borderColor: platform.color }}>
                                    <span>{platform.icon}</span>
                                    <span>{platform.name}</span>
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="dl-error mt-md">⚠️ {error}</div>
                        )}

                        <button
                            className="btn btn-primary btn-lg btn-full mt-md"
                            onClick={handleDownload}
                            disabled={!link.trim() || loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span>
                                    Downloading & uploading to Dropbox...
                                </>
                            ) : (
                                '⬇️ Download & Get Link'
                            )}
                        </button>

                        <div style={{
                            marginTop: 12,
                            padding: '10px 14px',
                            background: 'rgba(59, 130, 246, 0.1)', // Blue bg transparent
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            borderRadius: 8,
                            fontSize: 12,
                            color: '#60A5FA', // Light blue text
                            textAlign: 'center',
                            lineHeight: 1.4
                        }}>
                            <strong>NOTE:</strong> Sementara hanya bisa download dari Instagram & Tiktok. Soon: X, Facebook, Threads.
                        </div>
                    </>
                ) : (
                    <div className="dl-result-section">
                        {/* Header */}
                        <div className="dl-result-header">
                            <div className="result-icon">✓</div>
                            <h3>Download Complete!</h3>
                            <div className="dl-platform-badge-result" style={{ borderColor: result.platform.color }}>
                                <span style={{ fontSize: 20 }}>{result.platform.icon}</span>
                                <span>{result.platform.name}</span>
                            </div>
                        </div>

                        {/* Results */}
                        {result.links.length > 0 ? (
                            <div className="dl-links-list">
                                {result.links.map((item, i) => (
                                    <div key={i} className="dl-link-card">
                                        <div className="dl-link-card-header">
                                            <span className="dl-link-card-name">
                                                {item.type === 'video' ? '🎬' : '🖼️'} {item.filename}
                                            </span>
                                            <span className="badge" style={{
                                                background: item.type === 'video' ? '#7c3aed' : '#059669',
                                                color: 'white', fontSize: 10
                                            }}>
                                                {item.type}
                                            </span>
                                        </div>

                                        {item.raw ? (
                                            <pre style={{
                                                fontSize: 10, background: 'var(--color-bg-secondary)',
                                                padding: 8, borderRadius: 6, whiteSpace: 'pre-wrap'
                                            }}>
                                                {JSON.stringify(item.raw, null, 2)}
                                            </pre>
                                        ) : (
                                            <div className="dl-link-rows">
                                                <div className="dl-link-row">
                                                    <span className="badge badge-success" style={{ fontSize: 10 }}>dl=1</span>
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        value={item.directLink}
                                                        readOnly
                                                        style={{ fontSize: 11 }}
                                                    />
                                                    <button
                                                        className={`btn btn-sm ${copiedKey === `dl1_${i}` ? 'btn-success' : 'btn-primary'}`}
                                                        onClick={() => handleCopy(item.directLink, `dl1_${i}`)}
                                                    >
                                                        {copiedKey === `dl1_${i}` ? '✓' : 'Copy'}
                                                    </button>
                                                </div>
                                                <div className="dl-link-row">
                                                    <span className="badge badge-info" style={{ fontSize: 10 }}>dl=0</span>
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        value={item.viewLink}
                                                        readOnly
                                                        style={{ fontSize: 11 }}
                                                    />
                                                    <a
                                                        href={item.viewLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn btn-sm btn-secondary"
                                                        style={{ whiteSpace: 'nowrap' }}
                                                    >
                                                        View / Edit
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : result.raw ? (
                            <div>
                                <p className="text-muted text-sm" style={{ marginBottom: 8 }}>
                                    Could not parse Dropbox link. Raw response:
                                </p>
                                <pre style={{
                                    fontSize: 10, background: 'var(--color-bg-secondary)',
                                    padding: 10, borderRadius: 6, whiteSpace: 'pre-wrap', maxHeight: 200, overflowY: 'auto'
                                }}>
                                    {JSON.stringify(result.raw, null, 2)}
                                </pre>
                            </div>
                        ) : null}

                        {/* Debug */}
                        {rawResponse && (
                            <div style={{ marginTop: 12 }}>
                                <button
                                    className="dl-debug-toggle"
                                    onClick={() => setShowRaw(!showRaw)}
                                >
                                    {showRaw ? '▾ Hide' : '▸ Show'} raw n8n response (debug)
                                </button>
                                {showRaw && (
                                    <pre style={{
                                        fontSize: 10, background: 'var(--color-bg-secondary)',
                                        padding: 10, borderRadius: 6, whiteSpace: 'pre-wrap',
                                        maxHeight: 200, overflowY: 'auto', marginTop: 4
                                    }}>
                                        {JSON.stringify(rawResponse, null, 2)}
                                    </pre>
                                )}
                            </div>
                        )}

                        <button
                            className="btn btn-secondary btn-lg btn-full mt-lg"
                            onClick={handleReset}
                        >
                            Download Another
                        </button>
                    </div>
                )}
            </div>

            <style>{`
        .platform-icons {
          display: flex;
          justify-content: center;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-lg);
          padding: var(--spacing-md);
        }

        .platform-icon {
          opacity: 0.6;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: default;
        }

        .platform-icon:hover {
          opacity: 1;
          transform: scale(1.1) translateY(-2px);
        }

        .dl-platform-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 8px;
          padding: 4px 12px;
          border-radius: 20px;
          border: 1px solid;
          font-size: 12px;
          color: var(--color-text-secondary);
        }

        .dl-platform-badge-result {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 4px;
          padding: 6px 14px;
          border-radius: 20px;
          border: 1.5px solid;
          font-size: 13px;
          font-weight: 500;
          color: var(--color-text-primary);
        }

        .dl-error {
          background: color-mix(in srgb, var(--color-error) 10%, transparent);
          border: 1px solid var(--color-error);
          color: var(--color-error);
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--radius-md);
          font-size: var(--font-size-sm);
        }

        .dl-result-section {
          text-align: center;
        }

        .dl-result-header {
          margin-bottom: var(--spacing-lg);
        }

        .dl-result-header .result-icon {
          width: 56px;
          height: 56px;
          background: var(--color-success);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          margin: 0 auto var(--spacing-sm);
        }

        .dl-result-header h3 {
          font-size: var(--font-size-lg);
          margin-bottom: 4px;
        }

        .dl-links-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
          text-align: left;
        }

        .dl-link-card {
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-surface-border);
          border-radius: var(--radius-lg);
          padding: var(--spacing-md);
        }

        .dl-link-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--spacing-sm);
          padding-bottom: var(--spacing-sm);
          border-bottom: 1px solid var(--color-surface-border);
        }

        .dl-link-card-name {
          font-size: 12px;
          font-weight: 600;
          color: var(--color-text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .dl-link-rows {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .dl-link-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .dl-link-row .form-input {
          flex: 1;
          min-width: 0;
        }

        .dl-link-row .badge {
          flex-shrink: 0;
          min-width: 36px;
          text-align: center;
        }

        .dl-link-row .btn {
          flex-shrink: 0;
        }

        .dl-debug-toggle {
          background: none;
          border: none;
          color: var(--color-text-muted);
          font-size: 11px;
          cursor: pointer;
          padding: 2px 0;
        }

        .dl-debug-toggle:hover {
          color: var(--color-text-secondary);
        }
      `}</style>
        </div >
    )
}
