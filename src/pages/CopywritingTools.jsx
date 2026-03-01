import { useState, useEffect } from 'react'
import { useTemplates } from '../context/TemplateContext'
import { useAuth } from '../context/AuthContext'

const PRE_PRODS_WEBHOOK = import.meta.env.VITE_WEBHOOK_PRE_PRODS

// Map display labels to clean payload values
const OUTPUT_FORMAT_MAP = {
    'Single Post (Headline + Caption)': 'Single Post',
    'Carousel (Headline + 4 Slide)': 'Carousel',
    'Headline Only (3 Options)': 'Headline Only',
    'Caption Only (2 Options)': 'Caption Only'
}

// Helper: Extract key-value pairs (Headline, Caption, Slide, etc.) from a single block text
// Returns an array of { label, content }
function extractBlocks(text) {
    // Look for lines that start with a label ending in colon, e.g. "Headline:", "Hwadline 2:", "Caption 1:", "Option 2:"
    // AI can sometimes misspell, so we use H[a-z]+line and C[a-z]+tion to catch typos
    const regex = /^(Option\s+\d+|H[a-z]+line(?:\s+\d+)?|C[a-z]+tion(?:\s+\d+)?|Slide(?:\s+\d+)?):\s*/gmi

    const parts = []
    let match
    let lastIndex = 0
    let lastLabel = ''

    while ((match = regex.exec(text)) !== null) {
        if (lastIndex > 0 || lastLabel) {
            parts.push({
                label: lastLabel || 'Content',
                content: text.substring(lastIndex, match.index).trim()
            })
        } else if (match.index > 0) {
            // Text before the first matched label
            const pre = text.substring(0, match.index).trim()
            if (pre) parts.push({ label: 'Text', content: pre })
        }

        let foundLabel = match[1]
        // Auto-correct AI typos for the badge display (e.g., "Hwadline 2" -> "Headline 2")
        foundLabel = foundLabel.replace(/^H[a-z]+line/i, 'Headline')
        foundLabel = foundLabel.replace(/^C[a-z]+tion/i, 'Caption')

        lastLabel = foundLabel
        lastIndex = regex.lastIndex
    }

    if (lastLabel) {
        parts.push({
            label: lastLabel,
            content: text.substring(lastIndex).trim()
        })
    } else if (text.trim()) {
        parts.push({ label: 'Option 1', content: text.trim() }) // fallback
    }

    return parts
}

// Parse result text into individual cards based on output format
// Flexible handling: it automatically detects labels like "Headline 1", "Caption 2", "Slide 3", "Option 1"
// and splits them into distinct cards regardless of the selected `outputFormat`.
function parseResultCards(resultText) {
    if (!resultText) return []

    // If text has distinct double-newlines but NO labels at all, we could split by \n\n
    // But usually AI returns labels like "Caption 1:" or "Headline:"
    const blocks = extractBlocks(resultText)

    // Filter out empty blocks
    const validBlocks = blocks.filter(b => b.content)

    // If we couldn't parse any labels, just fallback to splitting by double newline
    if (validBlocks.length === 1 && validBlocks[0].label === 'Option 1' && !resultText.includes(':')) {
        return resultText.split(/\n\n+/).map((s, i) => ({
            label: `Option ${i + 1}`,
            content: s.trim()
        })).filter(b => b.content)
    }

    return validBlocks
}

// Detect if a URL is likely a video based strictly on extension/pattern
function isVideoUrl(url) {
    if (!url) return false
    try {
        const pathname = new URL(url).pathname.toLowerCase()
        return /\.(mp4|mov|webm|avi|mkv|m4v)$/.test(pathname)
    } catch {
        const lower = url.toLowerCase()
        return /\.(mp4|mov|webm|avi|mkv|m4v)/.test(lower)
    }
}

// Single media item — auto-detect image or video
function MediaItem({ url, mediaName, index }) {
    const [imgFailed, setImgFailed] = useState(false)
    const [downloading, setDownloading] = useState(false)
    const isVideo = isVideoUrl(url)

    const handleDownload = async () => {
        setDownloading(true)
        try {
            const res = await fetch(url)
            const blob = await res.blob()
            const ext = blob.type.split('/')[1]?.replace('jpeg', 'jpg') || (isVideo ? 'mp4' : 'jpg')
            const objUrl = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = objUrl
            a.download = `${mediaName || 'media'}_${index + 1}.${ext}`
            a.click()
            URL.revokeObjectURL(objUrl)
        } catch {
            window.open(url, '_blank')
        } finally {
            setDownloading(false)
        }
    }

    return (
        <div className="gallery-item">
            <div className="gallery-item-media">
                {isVideo ? (
                    <video
                        src={url}
                        className="gallery-video"
                        controls
                        playsInline
                        preload="metadata"
                    />
                ) : imgFailed ? (
                    <div className="gallery-img-fallback fallback-state">
                        <span style={{ fontSize: 40 }}>🖼️</span>
                        <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 8 }}>Preview not available</span>
                    </div>
                ) : (
                    <img
                        src={url}
                        alt={`Media ${index + 1}`}
                        className="gallery-img"
                        onError={() => setImgFailed(true)}
                        referrerPolicy="no-referrer"
                    />
                )}
                <div className="gallery-item-type-badge">
                    {isVideo ? '🎬 Video' : '🖼 Image'}
                </div>
            </div>
            <button
                className={`btn btn-secondary media-dl-btn ${downloading ? 'disabled' : ''}`}
                onClick={handleDownload}
                disabled={downloading}
            >
                {downloading ? 'Downloading…' : '⬇ Download'}
            </button>
        </div>
    )
}

// Media gallery — accepts string or array of URLs
function MediaGallery({ mediaUrl, mediaName, contentType }) {
    // Normalize to array
    const urls = Array.isArray(mediaUrl)
        ? mediaUrl.filter(Boolean)
        : mediaUrl ? [mediaUrl] : []

    if (urls.length === 0) return null

    return (
        <div className="media-gallery-wrapper">
            <div className="media-gallery-header">
                <div>
                    {mediaName && <div className="media-thumb-name">📰 {mediaName}</div>}
                    {contentType && <div className="media-thumb-type">{contentType}</div>}
                </div>
                <span className="result-count-badge">{urls.length} media</span>
            </div>
            <div className="media-gallery-scroll">
                {urls.map((url, i) => (
                    <MediaItem key={i} url={url} mediaName={mediaName} index={i} />
                ))}
            </div>
        </div>
    )
}

// Individual text card (copy only)
function TextCard({ cardData }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(cardData.content)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="result-card">
            <div className="result-card-body">
                <div className="result-card-header">
                    <div className="result-card-badge">{cardData.label}</div>
                </div>
                <p className="result-card-text">{cardData.content}</p>
                <button
                    className={`btn btn-secondary result-copy-btn ${copied ? 'copied' : ''}`}
                    onClick={handleCopy}
                >
                    {copied ? '✓ Copied!' : '📋 Copy'}
                </button>
            </div>
        </div>
    )
}

export default function CopywritingTools() {
    const { mediaList: MEDIA_LIST } = useTemplates()
    const { user } = useAuth()

    const [selectedMedia, setSelectedMedia] = useState('')
    const [selectedFormat, setSelectedFormat] = useState('Single Post (Headline + Caption)')
    const [inputValue, setInputValue] = useState('')
    const [results, setResults] = useState([]) // array of response items
    const [loading, setLoading] = useState(false)
    const [sendStatus, setSendStatus] = useState(null) // null | 'sending' | 'sent' | 'error'
    const [errorMsg, setErrorMsg] = useState('')

    // --- AUTO-SAVE LOGIC ---
    useEffect(() => {
        try {
            const saved = localStorage.getItem('copywriting_autosave')
            if (saved) {
                const data = JSON.parse(saved)
                if (data.selectedMedia) setSelectedMedia(data.selectedMedia)
                if (data.selectedFormat) setSelectedFormat(data.selectedFormat)
                if (data.inputValue) setInputValue(data.inputValue)
                if (data.results) setResults(data.results)
                if (data.sendStatus) setSendStatus(data.sendStatus)
            }
        } catch (e) {
            console.error('Failed to load autosave:', e)
        }
    }, [])

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            localStorage.setItem('copywriting_autosave', JSON.stringify({
                selectedMedia,
                selectedFormat,
                inputValue,
                results,
                sendStatus,
                timestamp: Date.now()
            }))
        }, 1000)
        return () => clearTimeout(timeoutId)
    }, [selectedMedia, selectedFormat, inputValue, results, sendStatus])
    // -----------------------

    const handleGenerate = async () => {
        if (!PRE_PRODS_WEBHOOK) {
            alert('Missing VITE_WEBHOOK_PRE_PRODS env variable')
            return
        }

        setSendStatus('sending')
        setLoading(true)
        setResults([])
        setErrorMsg('')

        try {
            const outputFormat = OUTPUT_FORMAT_MAP[selectedFormat] || selectedFormat

            const response = await fetch(PRE_PRODS_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ip_media: selectedMedia,
                    output_format: outputFormat,
                    link: inputValue
                })
            })

            if (!response.ok) throw new Error(`Request failed: ${response.statusText}`)

            // Parse JSON response from n8n
            const data = await response.json()
            // n8n returns an array
            const items = Array.isArray(data) ? data : [data]

            setResults(items)
            setSendStatus('sent')
        } catch (error) {
            console.error('Generate error:', error)
            setErrorMsg(error.message || 'Unknown error')
            setSendStatus('error')
        } finally {
            setLoading(false)
        }
    }

    const handleNewRequest = () => {
        setSendStatus(null)
        setResults([])
        setInputValue('')
        setErrorMsg('')
    }

    // Flatten result items into individual cards
    // The parseResultCards now outputs an array of { label, content }
    const allCards = results.flatMap(item => {
        const blocks = parseResultCards(item.result)
        return blocks.map(block => ({
            label: block.label,
            content: block.content,
            mediaUrl: item.mediaUrl,
            mediaName: item.mediaName,
            contentType: item.contentType,
        }))
    })

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div className="page-header">
                <h1 className="page-title">Copywriting Tools</h1>
                <p className="page-subtitle">Generate headlines and captions from articles or social posts</p>
            </div>

            <div className="grid grid-cols-2">
                {/* Input Section */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Input</h2>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Media Name</label>
                        <select
                            className="form-input form-select"
                            value={selectedMedia}
                            onChange={(e) => setSelectedMedia(e.target.value)}
                        >
                            <option value="">-- Choose Media --</option>
                            {MEDIA_LIST.map(media => (
                                <option key={media} value={media}>{media}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Select Output Format</label>
                        <select
                            className="form-input form-select"
                            value={selectedFormat}
                            onChange={(e) => setSelectedFormat(e.target.value)}
                        >
                            <option value="Single Post (Headline + Caption)">Single Post (Headline + Caption)</option>
                            <option value="Carousel (Headline + 4 Slide)">Carousel (Headline + 4 Slide)</option>
                            <option value="Headline Only (3 Options)">Headline Only (3 Options)</option>
                            <option value="Caption Only (2 Options)">Caption Only (2 Options)</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Link</label>
                        <input
                            type="url"
                            className="form-input"
                            placeholder="https://..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                    </div>

                    <button
                        className="btn btn-full"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: 'white', border: 'none' }}
                        onClick={handleGenerate}
                        disabled={!selectedMedia || !inputValue.trim() || loading || sendStatus === 'sent'}
                    >
                        {loading ? (
                            <>
                                <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span>
                                Generating...
                            </>
                        ) : sendStatus === 'sent' ? (
                            '✓ Generated!'
                        ) : (
                            '✨ Generate'
                        )}
                    </button>

                    {sendStatus === 'sent' && (
                        <button
                            className="btn btn-secondary btn-full"
                            onClick={handleNewRequest}
                            style={{ marginTop: 8 }}
                        >
                            ↻ New Request
                        </button>
                    )}

                    {sendStatus === 'error' && (
                        <div className="alert alert-error mt-sm" style={{ fontSize: 13 }}>
                            {errorMsg || 'Failed to generate.'}{' '}
                            <button className="login-switch" onClick={handleGenerate}>Retry</button>
                        </div>
                    )}
                </div>

                {/* Status / Summary Section */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Status</h2>
                    </div>

                    {sendStatus === 'sent' ? (
                        <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                            <div style={{ fontSize: 48 }}>✨</div>
                            <h4 style={{ marginTop: 12 }}>Generated!</h4>
                            <p className="text-secondary" style={{ fontSize: 13, marginTop: 8 }}>
                                {allCards.length} card{allCards.length !== 1 ? 's' : ''} ready below
                            </p>
                            <div style={{
                                background: 'var(--color-bg-secondary)',
                                borderRadius: 10,
                                padding: 16,
                                marginTop: 16,
                                textAlign: 'left',
                                fontSize: 13
                            }}>
                                <div><strong>Media:</strong> {selectedMedia}</div>
                                <div><strong>Output:</strong> {selectedFormat}</div>
                                <div><strong>Link:</strong> <a href={inputValue} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)', wordBreak: 'break-all' }}>{inputValue}</a></div>
                            </div>
                        </div>
                    ) : loading ? (
                        <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                            <span className="spinner" style={{ width: 36, height: 36, borderWidth: 3, display: 'inline-block' }}></span>
                            <p className="text-secondary" style={{ fontSize: 13, marginTop: 16 }}>Processing your request…</p>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">✍️</div>
                            <p className="empty-state-title">No Request Yet</p>
                            <p className="empty-state-text">Fill in the input form and click Generate</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Result Section */}
            {results.length > 0 && (() => {
                const firstItem = results[0]
                return (
                    <div style={{ marginTop: 32 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Results</h2>
                            <span className="result-count-badge">{allCards.length} card{allCards.length !== 1 ? 's' : ''}</span>
                        </div>

                        {/* Media Gallery */}
                        {firstItem.mediaUrl && (
                            <MediaGallery
                                mediaUrl={firstItem.mediaUrl}
                                mediaName={firstItem.mediaName}
                                contentType={firstItem.contentType}
                            />
                        )}

                        {/* Text Cards */}
                        <div className="result-cards-grid" style={{ marginTop: 20 }}>
                            {allCards.map((card, i) => (
                                <TextCard key={i} cardData={card} />
                            ))}
                        </div>
                    </div>
                )
            })()}

            <style>{`
        /* ===== Media Gallery ===== */
        .media-gallery-wrapper {
          background: var(--color-surface-hover);
          border: 1px solid var(--color-surface-border);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .media-gallery-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid var(--color-surface-border);
        }

        .media-thumb-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .media-thumb-type {
          font-size: 12px;
          color: var(--color-text-secondary);
          margin-top: 2px;
        }

        .media-gallery-scroll {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding: 16px;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
        }

        .media-gallery-scroll::-webkit-scrollbar {
          height: 4px;
        }

        .media-gallery-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .media-gallery-scroll::-webkit-scrollbar-thumb {
          background: var(--color-border);
          border-radius: 99px;
        }

        .gallery-item {
          flex-shrink: 0;
          width: 240px;
          scroll-snap-align: start;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .gallery-item-media {
          position: relative;
          width: 240px;
          height: 240px;
          border-radius: var(--radius-md);
          overflow: hidden;
          background: var(--color-bg-secondary);
        }

        .gallery-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.3s ease;
        }

        .gallery-item:hover .gallery-img {
          transform: scale(1.04);
        }

        .gallery-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .gallery-img-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: var(--color-bg-tertiary);
        }

        .gallery-item-type-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          font-size: 10px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 99px;
          background: rgba(0,0,0,0.55);
          color: white;
          backdrop-filter: blur(4px);
          letter-spacing: 0.4px;
        }

        .media-dl-btn {
          font-size: 12px;
          padding: 6px 0;
          white-space: nowrap;
          width: 100%;
          text-align: center;
          justify-content: center;
          background: var(--color-surface);
          border: 1px solid var(--color-surface-border);
          color: var(--color-text-primary);
        }

        .media-dl-btn:hover:not(.disabled) {
          background: var(--color-surface-hover);
        }

        .media-dl-btn.disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* ===== Result Cards (text only) ===== */
        .result-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 20px;
        }

        .result-card {
          background: var(--color-surface-hover);
          border: 1px solid var(--color-surface-border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .result-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        }

        .result-card-body {
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex: 1;
        }

        .result-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .result-card-badge {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          background: linear-gradient(135deg, #7c3aed22, #a855f722);
          color: var(--color-primary);
          border: 1px solid #7c3aed44;
          padding: 3px 10px;
          border-radius: 99px;
        }

        .result-card-media-name {
          font-size: 11px;
          color: var(--color-text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100px;
        }

        .result-card-text {
          font-size: 13px;
          color: var(--color-text-primary);
          line-height: 1.65;
          margin: 0;
          white-space: pre-line;
          flex: 1;
        }

        .result-copy-btn {
          font-size: 12px;
          padding: 6px 14px;
          border-radius: var(--radius-md);
          align-self: flex-start;
          transition: background 0.2s, color 0.2s;
        }

        .result-copy-btn.copied {
          background: linear-gradient(135deg, #059669, #10b981) !important;
          color: white !important;
          border-color: transparent !important;
        }

        .result-count-badge {
          font-size: 12px;
          font-weight: 600;
          padding: 3px 12px;
          border-radius: 99px;
          background: var(--color-bg-secondary);
          color: var(--color-text-secondary);
          border: 1px solid var(--color-border);
        }

        /* ===== Misc ===== */
        .input-type-toggle {
          display: flex;
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-md);
          padding: 4px;
        }

        .toggle-btn {
          flex: 1;
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--radius-sm);
          font-size: var(--font-size-sm);
          font-weight: 500;
          color: var(--color-text-secondary);
          transition: all var(--transition-fast);
        }

        .toggle-btn.active {
          background: var(--color-surface);
          color: var(--color-text-primary);
          box-shadow: var(--shadow-sm);
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
