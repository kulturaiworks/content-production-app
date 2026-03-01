import { useState, useEffect, useRef } from 'react'

const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_DIRECT_LINK

const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff']
const VIDEO_EXTS = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv']

function getFileType(file) {
    const ext = file.name.split('.').pop().toLowerCase()
    if (IMAGE_EXTS.includes(ext)) return 'image'
    if (VIDEO_EXTS.includes(ext)) return 'video'
    return 'other'
}

// Sanitize filename: remove emojis, special chars, unicode — keep only safe ASCII
function sanitizeFileName(name) {
    const lastDot = name.lastIndexOf('.')
    const ext = lastDot !== -1 ? name.slice(lastDot) : ''
    const base = lastDot !== -1 ? name.slice(0, lastDot) : name

    // Remove emojis and non-ASCII, then strip special chars except - and _
    let clean = base
        .replace(/[\u{1F600}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F300}-\u{1F5FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}\u{E0020}-\u{E007F}\u{1F1E0}-\u{1F1FF}]/gu, '')
        .replace(/[^a-zA-Z0-9._\- ]/g, '')
        .replace(/\s+/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')
        .trim()

    // If nothing left after sanitize, use timestamp
    if (!clean) clean = `file_${Date.now()}`

    return clean + ext.toLowerCase()
}

// Create a new File with sanitized name
function createSanitizedFile(file) {
    const safeName = sanitizeFileName(file.name)
    if (safeName === file.name) return file // No change needed
    return new File([file], safeName, { type: file.type, lastModified: file.lastModified })
}

export default function DirectLink() {
    const [files, setFiles] = useState([])
    const [uploading, setUploading] = useState(false)
    const [results, setResults] = useState(null)
    const [rawResponse, setRawResponse] = useState(null)
    const [showRaw, setShowRaw] = useState(false)
    const [error, setError] = useState(null)
    const [notification, setNotification] = useState(null)
    const [copiedKey, setCopiedKey] = useState(null)
    const [dragActive, setDragActive] = useState(false)
    const [previews, setPreviews] = useState([])
    const [isLoaded, setIsLoaded] = useState(false) // Safety flag
    const fileInputRef = useRef(null)

    const showNotification = (msg, type = 'warning') => {
        setNotification({ msg, type })
        setTimeout(() => setNotification(null), 5000)
    }

    const validateAndAddFiles = (newFiles) => {
        const allFiles = [...files]
        const incoming = Array.from(newFiles)

        for (const f of incoming) {
            const fType = getFileType(f)

            // Check: video cannot mix with images
            if (fType === 'video') {
                if (allFiles.some(af => getFileType(af) === 'image')) {
                    showNotification('Video tidak bisa digabung dengan image. Pilih salah satu.', 'error')
                    return
                }
                if (allFiles.some(af => getFileType(af) === 'video')) {
                    showNotification('Maksimal 1 video saja.', 'error')
                    return
                }
            }

            if (fType === 'image') {
                if (allFiles.some(af => getFileType(af) === 'video')) {
                    showNotification('Image tidak bisa digabung dengan video. Pilih salah satu.', 'error')
                    return
                }
                const imageCount = allFiles.filter(af => getFileType(af) === 'image').length
                if (imageCount >= 3) {
                    showNotification('Maksimal 3 image. Hapus salah satu untuk menambah.', 'error')
                    return
                }
            }

            // Duplicate check
            if (allFiles.some(af => af.name === f.name && af.size === f.size)) {
                showNotification(`File "${f.name}" sudah ditambahkan.`, 'warning')
                continue
            }

            // Sanitize filename to prevent JSON/upload errors
            const sanitized = createSanitizedFile(f)
            if (sanitized.name !== f.name) {
                showNotification(`Nama file di-rename otomatis: "${f.name}" → "${sanitized.name}"`, 'warning')
            }

            allFiles.push(sanitized)
        }

        setFiles(allFiles)
        setError(null)

        // Generate previews for images
        const newPreviews = []
        allFiles.forEach((f, i) => {
            if (getFileType(f) === 'image') {
                const url = URL.createObjectURL(f)
                newPreviews[i] = url
            }
        })
        setPreviews(newPreviews)
    }

    const removeFile = (index) => {
        const newFiles = files.filter((_, i) => i !== index)
        setFiles(newFiles)
        // Regenerate previews
        const newPreviews = []
        newFiles.forEach((f, i) => {
            if (getFileType(f) === 'image') {
                newPreviews[i] = URL.createObjectURL(f)
            }
        })
        setPreviews(newPreviews)
    }

    const handleFileChange = (e) => {
        if (e.target.files?.length) {
            validateAndAddFiles(e.target.files)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const handleDrag = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        if (e.dataTransfer.files?.length) {
            validateAndAddFiles(e.dataTransfer.files)
        }
    }

    const handleUpload = async () => {
        if (files.length === 0) return

        setUploading(true)
        setError(null)
        setRawResponse(null)

        // 15s Timeout Controller
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000)

        try {
            const formData = new FormData()
            files.forEach((f, i) => {
                formData.append('file', f)
            })

            // Single attempt with timeout
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                body: formData,
                signal: controller.signal
            })

            clearTimeout(timeoutId)

            if (!response.ok) throw new Error(`Upload failed: ${response.status}`)

            const data = await response.json()
            console.log('📦 Direct Link raw response:', data)
            setRawResponse(data)

            // Robust parser: try multiple n8n response patterns
            let parsedResults = []

            // Helper to make a result object from a link + file index
            const makeResult = (link, fileIndex) => {
                const fileName = files[fileIndex]?.name || `File ${fileIndex + 1}`
                if (!link) return { fileName, raw: 'No link found', preview: previews[fileIndex] || null }

                const viewLink = link.replace(/[?&]dl=\d/, (m) => m.replace(/dl=\d/, 'dl=0'))
                const directLink = link.replace(/[?&]dl=\d/, (m) => m.replace(/dl=\d/, 'dl=1'))
                // If no dl= param, add it
                const finalDirect = directLink.includes('dl=1') ? directLink : link + (link.includes('?') ? '&dl=1' : '?dl=1')
                const finalView = viewLink.includes('dl=0') ? viewLink : link + (link.includes('?') ? '&dl=0' : '?dl=0')

                return {
                    fileName,
                    originalLink: finalView,
                    directLink: finalDirect,
                    preview: previews[fileIndex] || null
                }
            }

            // Helper to extract a link from an object
            const extractLink = (obj) => {
                if (typeof obj === 'string') return obj
                if (!obj || typeof obj !== 'object') return null
                return obj.url || obj.link || obj.dropbox_link || obj.shared_link ||
                    obj.direct_link || obj.originalLink || null
            }

            if (Array.isArray(data)) {
                // Pattern 1: Array of items, one per file
                parsedResults = data.map((item, i) => makeResult(extractLink(item), i))
            } else if (typeof data === 'object' && data !== null) {
                // Pattern 2: Single object — check for numbered keys (url_1, url_2, link_1, link_2)
                const numberedLinks = []
                for (let i = 1; i <= 10; i++) {
                    const link = data[`url_${i}`] || data[`link_${i}`] || data[`dropbox_link_${i}`] || data[`shared_link_${i}`]
                    if (link) numberedLinks.push(link)
                }

                if (numberedLinks.length > 0) {
                    parsedResults = numberedLinks.map((link, i) => makeResult(link, i))
                } else {
                    // Pattern 3: Single object with `urls` or `links` array
                    const linksArray = data.urls || data.links || data.results || data.shared_links
                    if (Array.isArray(linksArray)) {
                        parsedResults = linksArray.map((link, i) => makeResult(typeof link === 'string' ? link : extractLink(link), i))
                    } else {
                        // Pattern 4: Single object with one url (for single file upload)
                        const singleLink = extractLink(data)
                        if (singleLink) {
                            // If there are multiple files but only one link, show it for the first file
                            parsedResults = [makeResult(singleLink, 0)]
                            if (files.length > 1) {
                                showNotification(`n8n returned only 1 link for ${files.length} files. Check workflow.`, 'warning')
                            }
                        } else {
                            // Can't parse - show raw for each file
                            parsedResults = files.map((f, i) => ({
                                fileName: f.name,
                                raw: data,
                                preview: previews[i] || null
                            }))
                        }
                    }
                }
            }

            setResults(parsedResults)
        } catch (err) {
            console.error('Upload error:', err)
            if (timeoutId) clearTimeout(timeoutId)

            if (err.name === 'AbortError') {
                setError('Upload timed out (15s). Server busy.')
            } else {
                setError(err.message || 'Upload failed. Check webhook and try again.')
            }
        } finally {
            setUploading(false)
        }
    }

    // --- AUTOSAVE LOGIC ---
    // Load on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem('directlink_results')
            if (saved) {
                const data = JSON.parse(saved)
                if (data.results) setResults(data.results)
                if (data.count) {
                    // We can't restore File objects, but we can restore the UI state if needed
                    // But results view doesn't depend on 'files' state, only on 'results' state
                }
            }
        } catch (e) {
            console.error('Failed to load autosave:', e)
        } finally {
            setIsLoaded(true)
        }
    }, [])

    // Save results on change
    useEffect(() => {
        if (!isLoaded) return

        if (results) {
            const dataToSave = {
                results, // Contains links (serializable)
                timestamp: Date.now()
            }
            localStorage.setItem('directlink_results', JSON.stringify(dataToSave))
        } else {
            // If results cleared, remove save
            // localStorage.removeItem('directlink_results') 
            // Better: Don't remove here, let handleReset do it explicitly
        }
    }, [results, isLoaded])
    // ----------------------

    const handleCopy = (text, key) => {
        navigator.clipboard.writeText(text)
        setCopiedKey(key)
        setTimeout(() => setCopiedKey(null), 2000)
    }

    const handleReset = () => {
        // Revoke preview URLs
        previews.forEach(p => { if (p) URL.revokeObjectURL(p) })
        setFiles([])
        setPreviews([])
        setResults(null)
        setRawResponse(null)
        setShowRaw(false)
        setError(null)
        setCopiedKey(null)
        setNotification(null)
        if (fileInputRef.current) fileInputRef.current.value = ''

        // Clear autosave
        localStorage.removeItem('directlink_results')
    }

    const currentType = files.length > 0 ? getFileType(files[0]) : null
    const acceptAttr = currentType === 'video' ? 'video/*' : currentType === 'image' ? 'image/*' : 'image/*,video/*'
    const canAddMore = currentType === 'image' ? files.length < 3 : currentType === 'video' ? false : true

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Direct Link Generator</h1>
                <p className="page-subtitle">Upload images (max 3) or video (max 1) to Dropbox — get direct links</p>
            </div>

            {/* Notification toast */}
            {notification && (
                <div className={`dl-notification ${notification.type}`}>
                    {notification.type === 'error' ? '🚫' : '⚠️'} {notification.msg}
                </div>
            )}

            <div className="card" style={{ maxWidth: 640, margin: '0 auto' }}>
                {!results ? (
                    <>
                        {/* Upload zone */}
                        <div
                            className={`upload-zone ${dragActive ? 'drag-active' : ''} ${files.length > 0 ? 'has-file' : ''}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                id="file-upload"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept={acceptAttr}
                                multiple={currentType !== 'video'}
                                style={{ display: 'none' }}
                            />
                            <label htmlFor="file-upload" className="upload-label">
                                <div className="upload-icon">{files.length > 0 ? '➕' : '📁'}</div>
                                <p className="upload-text">
                                    {files.length > 0 ? 'Add more files' : 'Click or drag files here'}
                                </p>
                                <p className="upload-hint">
                                    Image: max 3 files &nbsp;|&nbsp; Video: max 1 file &nbsp;|&nbsp; Can't mix
                                </p>
                            </label>
                        </div>

                        {/* File list */}
                        {files.length > 0 && (
                            <div className="dl-file-list">
                                {files.map((f, i) => (
                                    <div key={`${f.name}-${i}`} className="dl-file-item">
                                        {previews[i] ? (
                                            <img src={previews[i]} alt={f.name} className="dl-file-thumb" />
                                        ) : (
                                            <div className="dl-file-thumb dl-file-thumb-video">🎬</div>
                                        )}
                                        <div className="dl-file-info">
                                            <span className="dl-file-name">{f.name}</span>
                                            <span className="dl-file-size">{(f.size / 1024 / 1024).toFixed(2)} MB</span>
                                        </div>
                                        <button
                                            className="dl-file-remove"
                                            onClick={() => removeFile(i)}
                                            title="Remove"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                                <div className="dl-file-counter">
                                    {currentType === 'image'
                                        ? `${files.length}/3 images`
                                        : `${files.length}/1 video`
                                    }
                                    {!canAddMore && (
                                        <span className="text-muted" style={{ marginLeft: 8 }}>(limit reached)</span>
                                    )}
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="dl-error mt-md">⚠️ {error}</div>
                        )}

                        <button
                            className={`btn btn-lg btn-full mt-lg ${error ? 'btn-primary' : 'btn-primary'}`}
                            onClick={handleUpload}
                            disabled={files.length === 0 || uploading}
                        >
                            {uploading ? (
                                <>
                                    <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span>
                                    Uploading {files.length} file{files.length > 1 ? 's' : ''} to Dropbox...
                                </>
                            ) : (
                                error ? '⟳ Retry Uploading' : `📤 Upload ${files.length > 0 ? files.length : ''} File${files.length !== 1 ? 's' : ''} to Dropbox`
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
                            <strong>NOTE:</strong> Upload file pertama biasanya error (karena server waking up).<br />
                            Jika gagal, sistem akan otomatis mencoba ulang 1x. Jika masih gagal, silakan reload page.
                        </div>
                    </>
                ) : (
                    <>
                        {/* Results */}
                        <div className="dl-results-header">
                            <div className="result-icon">✓</div>
                            <h3>Upload Complete!</h3>
                            <p className="text-secondary">{results.length} file{results.length > 1 ? 's' : ''} uploaded</p>
                        </div>

                        <div className="dl-results-list">
                            {results.map((res, i) => (
                                <div key={i} className="dl-result-card">
                                    {/* Header with thumbnail */}
                                    <div className="dl-result-card-header">
                                        {res.preview ? (
                                            <img src={res.preview} alt={res.fileName} className="dl-result-thumb" />
                                        ) : (
                                            <div className="dl-result-thumb dl-result-thumb-video">🎬</div>
                                        )}
                                        <div className="dl-result-meta">
                                            <span className="dl-result-filename">{res.fileName}</span>
                                            <span className="dl-result-index">File {i + 1} of {results.length}</span>
                                        </div>
                                    </div>

                                    {res.raw ? (
                                        /* Raw fallback */
                                        <div>
                                            <p className="text-muted text-sm" style={{ marginBottom: 8 }}>
                                                Could not parse Dropbox link. Raw response:
                                            </p>
                                            <pre style={{
                                                fontSize: 10, background: 'var(--color-bg-secondary)',
                                                padding: 8, borderRadius: 6, overflowX: 'auto', maxHeight: 120,
                                                whiteSpace: 'pre-wrap'
                                            }}>
                                                {JSON.stringify(res.raw, null, 2)}
                                            </pre>
                                        </div>
                                    ) : (
                                        <div className="dl-result-links">
                                            {/* Direct link (dl=1) */}
                                            <div className="dl-link-row">
                                                <span className="badge badge-success" style={{ fontSize: 10 }}>dl=1</span>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    value={res.directLink}
                                                    readOnly
                                                    style={{ fontSize: 11 }}
                                                />
                                                <button
                                                    className={`btn btn-sm ${copiedKey === `direct_${i}` ? 'btn-success' : 'btn-primary'}`}
                                                    onClick={() => handleCopy(res.directLink, `direct_${i}`)}
                                                >
                                                    {copiedKey === `direct_${i}` ? '✓ Copied' : 'Copy'}
                                                </button>
                                            </div>

                                            {/* View/Edit link (dl=0) */}
                                            <div className="dl-link-row">
                                                <span className="badge badge-info" style={{ fontSize: 10 }}>dl=0</span>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    value={res.originalLink}
                                                    readOnly
                                                    style={{ fontSize: 11 }}
                                                />
                                                <a
                                                    href={res.originalLink}
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

                        {/* Debug: raw response */}
                        {rawResponse && (
                            <div style={{ marginTop: 16 }}>
                                <button
                                    className="carousel-card-expand"
                                    onClick={() => setShowRaw(!showRaw)}
                                    style={{ fontSize: 11, color: 'var(--color-text-muted)' }}
                                >
                                    {showRaw ? '▾ Hide' : '▸ Show'} raw n8n response (debug)
                                </button>
                                {showRaw && (
                                    <pre style={{
                                        fontSize: 10, background: 'var(--color-bg-secondary)',
                                        padding: 10, borderRadius: 6, overflowX: 'auto', maxHeight: 200,
                                        whiteSpace: 'pre-wrap', marginTop: 4
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
                            Upload More Files
                        </button>
                    </>
                )}
            </div>

            <style>{`
        /* --- Notification toast --- */
        .dl-notification {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 9999;
          padding: 12px 24px;
          border-radius: var(--radius-md);
          font-size: 13px;
          font-weight: 500;
          animation: dl-slide-in 0.3s ease;
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }

        .dl-notification.warning {
          background: #78350f;
          color: #fef3c7;
          border: 1px solid #92400e;
        }

        .dl-notification.error {
          background: #7f1d1d;
          color: #fecaca;
          border: 1px solid #991b1b;
        }

        @keyframes dl-slide-in {
          from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        /* --- Upload zone --- */
        .upload-zone {
          border: 2px dashed var(--color-surface-border);
          border-radius: var(--radius-lg);
          padding: var(--spacing-xl);
          text-align: center;
          transition: all var(--transition-fast);
        }

        .upload-zone:hover,
        .upload-zone.drag-active {
          border-color: var(--color-primary);
          background: var(--color-primary-light);
        }

        .upload-zone.has-file {
          border-color: var(--color-success);
          border-style: solid;
          padding: var(--spacing-md);
        }

        .upload-label {
          cursor: pointer;
          display: block;
        }

        .upload-icon {
          font-size: 40px;
          margin-bottom: var(--spacing-sm);
        }

        .upload-text {
          font-size: var(--font-size-md);
          font-weight: 500;
          color: var(--color-text-primary);
          margin-bottom: var(--spacing-xs);
        }

        .upload-hint {
          font-size: 11px;
          color: var(--color-text-muted);
        }

        /* --- File list --- */
        .dl-file-list {
          margin-top: var(--spacing-md);
        }

        .dl-file-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: 8px 12px;
          background: var(--color-bg-secondary);
          border-radius: var(--radius-md);
          margin-bottom: 6px;
        }

        .dl-file-thumb {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-sm);
          object-fit: cover;
          flex-shrink: 0;
        }

        .dl-file-thumb-video {
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-surface-border);
          font-size: 20px;
        }

        .dl-file-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .dl-file-name {
          font-size: 12px;
          font-weight: 500;
          color: var(--color-text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .dl-file-size {
          font-size: 11px;
          color: var(--color-text-muted);
        }

        .dl-file-remove {
          background: none;
          border: none;
          color: var(--color-text-muted);
          font-size: 14px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
        }

        .dl-file-remove:hover {
          color: var(--color-error);
          background: color-mix(in srgb, var(--color-error) 10%, transparent);
        }

        .dl-file-counter {
          text-align: right;
          font-size: 11px;
          color: var(--color-text-muted);
          padding-top: 4px;
        }

        .dl-error {
          background: color-mix(in srgb, var(--color-error) 10%, transparent);
          border: 1px solid var(--color-error);
          color: var(--color-error);
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--radius-md);
          font-size: var(--font-size-sm);
        }

        /* --- Results --- */
        .dl-results-header {
          text-align: center;
          margin-bottom: var(--spacing-lg);
        }

        .dl-results-header .result-icon {
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

        .dl-results-header h3 {
          font-size: var(--font-size-lg);
          margin-bottom: 4px;
        }

        .dl-results-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .dl-result-card {
          background: var(--color-bg-secondary);
          border-radius: var(--radius-lg);
          padding: var(--spacing-md);
          border: 1px solid var(--color-surface-border);
        }

        .dl-result-card-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-md);
          padding-bottom: var(--spacing-sm);
          border-bottom: 1px solid var(--color-surface-border);
        }

        .dl-result-thumb {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-md);
          object-fit: cover;
          flex-shrink: 0;
          border: 1px solid var(--color-surface-border);
        }

        .dl-result-thumb-video {
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-surface-border);
          font-size: 24px;
        }

        .dl-result-meta {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .dl-result-filename {
          font-size: 13px;
          font-weight: 600;
          color: var(--color-text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .dl-result-index {
          font-size: 11px;
          color: var(--color-text-muted);
        }

        .dl-result-links {
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
          font-size: 11px;
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
      `}</style>
        </div>
    )
}
