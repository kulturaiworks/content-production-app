import { useState, useEffect } from 'react'
import { useProduction } from '../context/ProductionContext'
import { useAuth } from '../context/AuthContext'

import { MEDIA_LIST, FIXED_CONTENT_TYPES } from '../data/mediaData'
import { pollClipperJob } from '../lib/supabase'

// n8n Webhook URL
const WEBHOOK_RENDER = import.meta.env.VITE_WEBHOOK_CLIPPER // For rendering (production)
const WEBHOOK_ANALYZE_URL = import.meta.env.VITE_WEBHOOK_CLIPPER_ANALYZE // For analysis (scouting)

export default function ClipperTools() {
    const { status, setStatus, setOutput, setError, reset, startPolling, startJob } = useProduction()
    const { user, incrementWorkCount } = useAuth()

    const [selectedMedia, setSelectedMedia] = useState('')
    const [youtubeLink, setYoutubeLink] = useState('')
    const [clips, setClips] = useState([])
    const [phase, setPhase] = useState(1) // 1: Analyze, 2: Render
    const [selectedClips, setSelectedClips] = useState([])
    const [isAnalyzing, setIsAnalyzing] = useState(false) // Loading state for analysis

    // --- AUTO-SAVE LOGIC ---
    // Load saved state on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem('clipper_autosave')
            if (saved) {
                const data = JSON.parse(saved)
                if (data.selectedMedia) setSelectedMedia(data.selectedMedia)
                if (data.youtubeLink) setYoutubeLink(data.youtubeLink)
                if (data.clips && Array.isArray(data.clips)) {
                    // Re-map saved clips to ensure all fields exist
                    const validClips = data.clips.map((c, idx) => ({
                        id: c.id || idx + 1,
                        title: c.title || c.clip_title || `Clip ${idx + 1}`,
                        dialog: c.dialog || (Array.isArray(c.preview_lines) ? c.preview_lines.join(' ') : ''),
                        timecode_start: c.timecode_start || c.start_timecode || '00:00:00',
                        timecode_end: c.timecode_end || c.end_timecode || '00:00:00',
                        duration: c.duration || c.est_duration || '-',
                        virality_score: c.virality_score || 0,
                        reason: c.reason || '',
                        preview_lines: c.preview_lines || []
                    }))
                    setClips(validClips)
                    // Only restore selectedClips that match valid clip IDs
                    const validIds = validClips.map(c => c.id)
                    const validSelected = (data.selectedClips || []).filter(id => validIds.includes(id))
                    setSelectedClips(validSelected)
                }
                // Never restore phase 2 (sending state) — always start at phase 1
                // Phase is intentionally NOT restored
            }
        } catch (e) {
            console.error('Failed to load autosave:', e)
            localStorage.removeItem('clipper_autosave')
        }
    }, [])

    // Save state on change
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const dataToSave = {
                selectedMedia,
                youtubeLink,
                clips,
                selectedClips,
                timestamp: Date.now()
            }
            localStorage.setItem('clipper_autosave', JSON.stringify(dataToSave))
        }, 1000)

        return () => clearTimeout(timeoutId)
    }, [selectedMedia, youtubeLink, clips, selectedClips])
    // -----------------------

    // Open YouTube at specific timestamp (new tab)
    const getYoutubeTimestampUrl = (timecode) => {
        // Extract video ID from various YouTube URL formats
        const match = youtubeLink.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/)
        const videoId = match?.[1]
        if (videoId && timecode) {
            // Convert HH:MM:SS or MM:SS to seconds
            const parts = timecode.split(':').map(Number)
            let seconds = 0
            if (parts.length === 3) seconds = parts[0] * 3600 + parts[1] * 60 + parts[2]
            else if (parts.length === 2) seconds = parts[0] * 60 + parts[1]
            else seconds = parts[0] || 0
            return `https://www.youtube.com/watch?v=${videoId}&t=${seconds}s`
        }
        return youtubeLink
    }

    // Phase 1: Analyze content
    const handleAnalyze = async () => {
        if (!youtubeLink || !selectedMedia) return

        setIsAnalyzing(true)
        setClips([]) // Clear previous results

        try {
            const payload = {
                content_type: FIXED_CONTENT_TYPES.clipper_tools, // "Clipper"
                template_type: 'clipper_analyze',
                text_1: youtubeLink, // Sama dengan format lama (text_1 = YouTube URL)
                text_2: '',
                ip_media: selectedMedia,
                status: 'READY',
                run_date: new Date().toISOString(),
                editor: user?.email || user?.name || 'Unknown',
                source: 'clipper_tools_ui'
            }

            console.log('[Clipper] Starting analysis...', payload)

            const response = await fetch(WEBHOOK_ANALYZE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (!response.ok) throw new Error(`Analysis request failed: ${response.statusText}`)

            const result = await response.json()
            console.log('[Clipper] Polling Job Initialized:', result)

            // Expecting { job_id: "..." } from N8N now
            const jobId = result.job_id || result.id

            if (jobId) {
                // Return promise to wrap polling
                // polling will handle success/error state updates
                pollClipperJob(jobId,
                    (clipsResult) => {
                        // Success Callback
                        console.log('[Clipper] Analysis Completed!', clipsResult)

                        let rawClips = []
                        // Handle different result structures
                        if (Array.isArray(clipsResult)) {
                            rawClips = clipsResult
                        } else if (clipsResult.clips && Array.isArray(clipsResult.clips)) {
                            rawClips = clipsResult.clips
                        } else {
                            rawClips = [clipsResult] // Fallback
                        }

                        if (rawClips.length === 0) {
                            alert('AI finished but found NO clips suitable for content.')
                        }

                        // Map N8N fields to UI fields
                        const finalClips = rawClips.map((c, idx) => ({
                            id: idx + 1,
                            title: c.clip_title || c.title || `Clip ${idx + 1}`,
                            dialog: Array.isArray(c.preview_lines) ? c.preview_lines.join(' ') : (c.dialog || c.preview_lines || ''),
                            timecode_start: c.start_timecode || c.timecode_start || '00:00:00',
                            timecode_end: c.end_timecode || c.timecode_end || '00:00:00',
                            duration: c.est_duration || c.duration || '-',
                            virality_score: c.virality_score || 0,
                            reason: c.reason || '',
                            preview_lines: c.preview_lines || []
                        }))

                        setClips(finalClips)
                        setIsAnalyzing(false)
                    },
                    (error) => {
                        // Error Callback
                        console.error('Polling Error:', error)
                        alert('Analysis Error: ' + error.message)
                        setIsAnalyzing(false)
                    }
                )
            } else {
                // Fallback for direct response (if N8N not updated yet)
                // This keeps backward compatibility for testing
                console.warn('No job_id returned, assuming direct response...')
                const resultData = result.clips || result.data || result

                if (Array.isArray(resultData)) {
                    // ... formatting logic duplicated for direct response fallback ...
                    // Actually better just to alert user to update N8N
                    throw new Error('N8N workflow did not return a job_id. Please update N8N to use the polling mechanism (Respond to Webhook with job_id).')
                } else {
                    throw new Error('Invalid response from N8N (No job_id found).')
                }
            }

        } catch (error) {
            console.error('Analysis Request Error:', error)
            alert('Analysis Request Failed: ' + error.message)
            setIsAnalyzing(false)
        }
    }

    // Toggle clip selection
    const toggleClipSelection = (clipId) => {
        setSelectedClips(prev =>
            prev.includes(clipId)
                ? prev.filter(id => id !== clipId)
                : [...prev, clipId]
        )
    }

    // Send selected clips to Joy via Slack
    const sendToJoy = async () => {
        const SLACK_WEBHOOK = import.meta.env.VITE_SLACK_CLIPPER_WEBHOOK
        if (!SLACK_WEBHOOK) {
            alert('Missing VITE_SLACK_CLIPPER_WEBHOOK env variable')
            return
        }

        const selected = clips.filter(c => selectedClips.includes(c.id))
        setPhase(2)
        setStatus('sending')

        try {
            const clipLines = selected.map((clip, i) =>
                `*Clip ${i + 1}: ${clip.title}*\n⏱ ${clip.timecode_start} → ${clip.timecode_end} (${clip.duration})\n🔥 Virality: ${clip.virality_score}/10`
            ).join('\n\n')

            const userMention = user?.slackMemberId ? `<@${user.slackMemberId}>` : (user?.email || 'Unknown')

            await fetch(SLACK_WEBHOOK, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: `🎬 *CLIP REQUEST*\n\n📺 *Video:* ${youtubeLink}\n🏷️ *Media:* ${selectedMedia}\n👤 *Requester:* ${userMention}\n\n${clipLines}\n\ncc: <@U0AD664M60J>`
                })
            })

            // no-cors = opaque response, tapi request tetap terkirim
            setStatus('done')
        } catch (error) {
            console.error('Slack webhook error:', error)
            setError(error.message)
            setStatus('error')
        }
    }

    // Reset all
    const handleReset = () => {
        reset()
        setSelectedMedia('')
        setYoutubeLink('')
        setClips([])
        setPhase(1)
        setSelectedClips([])
    }

    return (
        <div className="clipper-container">
            <div className="page-header">
                <h1 className="page-title">Clipper Tools</h1>
                <p className="page-subtitle">Analyze and clip YouTube videos for content</p>
            </div>

            {/* Phase Indicator */}
            <div className="phase-indicator mb-lg">
                <div className={`phase-item ${phase === 1 ? 'active' : phase > 1 ? 'completed' : ''}`}>
                    <span className="phase-number">1</span>
                    <span className="phase-label-desktop">Analyze Content</span>
                    <span className="phase-label-mobile" style={{ display: 'none' }}>Analyze</span>
                </div>
                <div className="phase-connector"></div>
                <div className={`phase-item ${phase === 2 ? 'active' : ''}`}>
                    <span className="phase-number">2</span>
                    <span className="phase-label-desktop">Send to Joy</span>
                    <span className="phase-label-mobile" style={{ display: 'none' }}>Send</span>
                </div>
            </div>

            <div className="card">
                {/* Phase 1: Analyze */}
                {phase === 1 && (
                    <>
                        <div className="card-header">
                            <h2 className="card-title">Phase 1: Analyze Content</h2>
                        </div>

                        <div className="grid grid-cols-2 mb-lg">
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
                                <label className="form-label">YouTube Link</label>
                                <input
                                    type="url"
                                    className="form-input"
                                    placeholder="https://youtube.com/watch?v=..."
                                    value={youtubeLink}
                                    onChange={(e) => setYoutubeLink(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Process Actions (Moved Up) */}
                        {clips.length > 0 && (
                            <div className="analyze-result-header mb-lg p-md" style={{ background: 'var(--color-surface)', borderRadius: '12px' }}>
                                <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                                    Found <strong style={{ color: 'var(--color-text-primary)' }}>{clips.length}</strong> potential clips. Select the ones you want to send.
                                </div>
                                <div className="result-actions flex gap-md">
                                    <button
                                        className="btn btn-secondary mobile-full-btn"
                                        onClick={() => setClips([])}
                                        style={{ padding: '10px 20px' }}
                                    >
                                        ↻ Re-analyze
                                    </button>
                                    <button
                                        className="btn btn-primary mobile-full-btn"
                                        onClick={sendToJoy}
                                        disabled={selectedClips.length === 0}
                                        style={{
                                            padding: '10px 24px',
                                            fontSize: '15px',
                                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <span>🤖</span> Send {selectedClips.length} Clip{selectedClips.length !== 1 ? 's' : ''}
                                    </button>
                                </div>
                            </div>
                        )}

                        {clips.length === 0 ? (
                            <button
                                className="btn btn-primary btn-lg"
                                onClick={handleAnalyze}
                                disabled={!selectedMedia || !youtubeLink || isAnalyzing}
                            >
                                {isAnalyzing ? 'Analyzing Video...' : 'Analyze Content'}
                            </button>
                        ) : isAnalyzing ? (
                            <div className="render-loading">
                                <div className="spinner" style={{ width: 48, height: 48 }}></div>
                                <p className="mt-md">Analyzing video content...</p>
                                <p className="text-muted">This may take 1-2 minutes.</p>
                            </div>
                        ) : (
                            <>
                                {/* Clips Preview */}
                                <div className="clips-grid">
                                    {clips.map(clip => (
                                        <div
                                            key={clip.id}
                                            className={`clip-card ${selectedClips.includes(clip.id) ? 'selected' : ''}`}
                                        >
                                            <div className="clip-header">
                                                <div
                                                    className="clip-checkbox"
                                                    onClick={() => toggleClipSelection(clip.id)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {selectedClips.includes(clip.id) && '✓'}
                                                </div>
                                                <span className="clip-title-text" style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{clip.title}</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    {clip.virality_score > 0 && (
                                                        <span className={`badge ${clip.virality_score >= 8 ? 'badge-success' : clip.virality_score >= 6 ? 'badge-warning' : 'badge-info'}`}
                                                            style={{ fontSize: 11, padding: '2px 8px' }}
                                                        >
                                                            🔥 {clip.virality_score}/10
                                                        </span>
                                                    )}
                                                    <a
                                                        href={getYoutubeTimestampUrl(clip.timecode_start)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="clip-youtube-btn"
                                                        onClick={(e) => e.stopPropagation()}
                                                        title={`Preview on YouTube at ${clip.timecode_start}`}
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                                                            <path d="M8 5v14l11-7z" />
                                                        </svg>
                                                    </a>
                                                </div>
                                            </div>

                                            {clip.reason && (
                                                <div className="clip-reason" style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 8, fontStyle: 'italic', lineHeight: 1.4 }}>
                                                    💡 {clip.reason}
                                                </div>
                                            )}

                                            <div className="clip-dialog">
                                                {clip.preview_lines && clip.preview_lines.length > 0 ? (
                                                    clip.preview_lines.map((line, idx) => (
                                                        <div key={idx} style={{ marginBottom: 3, fontSize: 13, color: 'var(--color-text-primary)' }}>
                                                            "{line}"
                                                        </div>
                                                    ))
                                                ) : clip.dialog ? (
                                                    clip.dialog.split(/(?<=[.!?])\s+/).map((sentence, idx) => (
                                                        <div key={idx} style={{ marginBottom: 3 }}>
                                                            {sentence}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span className="text-muted">No dialog text available</span>
                                                )}
                                            </div>

                                            <div className="clip-meta">
                                                <span className="clip-duration">⏱ {clip.duration}</span>
                                                <span className="clip-timecode">🎬 {clip.timecode_start} → {clip.timecode_end}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                            </>
                        )}
                    </>
                )}

                {/* Phase 2: Render */}
                {phase === 2 && (
                    <>
                        <div className="card-header">
                            <h2 className="card-title">Phase 2: Send to Joy</h2>
                        </div>

                        {status === 'done' ? (
                            <div className="render-success">
                                <div className="success-icon" style={{ fontSize: 48 }}>🤖</div>
                                <h4>Sent to Joy!</h4>
                                <p className="text-secondary">{selectedClips.length} clip(s) sent via Slack. Joy will process them shortly.</p>

                                <div className="sent-clips-list mt-lg" style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: 500, margin: '0 auto' }}>
                                    {clips.filter(c => selectedClips.includes(c.id)).map((clip, i) => (
                                        <div key={clip.id} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            background: 'var(--color-surface)',
                                            border: '1px solid var(--color-surface-border)',
                                            borderRadius: '10px',
                                            padding: '12px 16px',
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>#{i + 1}</span>
                                                <span style={{ fontWeight: 500 }}>{clip.title}</span>
                                            </div>
                                            <span className="badge badge-success">Sent ✓</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-md mt-lg justify-center">
                                    <button
                                        className="btn btn-secondary btn-lg"
                                        onClick={() => { setPhase(1); reset() }}
                                    >
                                        ← Back to Analysis
                                    </button>
                                    <button
                                        className="btn btn-primary btn-lg"
                                        onClick={handleReset}
                                    >
                                        + Create New
                                    </button>
                                </div>
                            </div>
                        ) : status === 'error' ? (
                            <div className="render-error">
                                <div className="error-icon">✕</div>
                                <h4>Failed to Send</h4>
                                <p className="text-secondary">Could not reach Joy. Please try again.</p>

                                <div className="flex gap-md mt-lg justify-center">
                                    <button
                                        className="btn btn-error btn-lg"
                                        onClick={() => { reset(); sendToJoy() }}
                                    >
                                        ↻ Retry
                                    </button>
                                    <button
                                        className="btn btn-secondary btn-lg"
                                        onClick={handleReset}
                                    >
                                        Start Over
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="render-loading">
                                <div className="spinner" style={{ width: 48, height: 48 }}></div>
                                <p className="mt-md">Sending {selectedClips.length} clip(s) to Joy...</p>
                                <p className="text-muted">Joy will reply in Slack when done</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            <style>{`
        .phase-indicator {
          display: flex;
          align-items: center;
          background: var(--color-surface);
          padding: var(--spacing-md);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-surface-border);
        }
        
        .phase-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--radius-md);
          color: var(--color-text-muted);
        }
        
        .phase-item.active {
          background: var(--color-primary-light);
          color: var(--color-primary);
        }
        
        .phase-item.completed {
          color: var(--color-success);
        }
        
        .phase-number {
          width: 28px;
          height: 28px;
          background: var(--color-bg-tertiary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
        }
        
        .phase-item.active .phase-number {
          background: var(--color-primary);
          color: white;
        }
        
        .phase-connector {
          flex: 1;
          height: 2px;
          background: var(--color-surface-border);
          margin: 0 var(--spacing-md);
        }
        
        .clips-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-lg);
        }

        @media (max-width: 768px) {
          .clips-grid {
            grid-template-columns: 1fr;
            gap: var(--spacing-md);
          }
          
          /* Mobile UI Adjustments */
          .phase-label-desktop { display: none; }
          .phase-label-mobile { display: inline !important; }
          
          .analyze-result-header {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-md);
            text-align: center;
          }
          
          .result-actions {
            width: 100%;
            flex-direction: column;
          }
          
          .mobile-full-btn {
            width: 100%;
            justify-content: center;
          }
          
          /* Mobile container width */
          .clipper-container {
            max-width: 100%;
            padding: 0 12px;
          }
          
          /* Adjust card padding on mobile to fit content */
          .clipper-container .card {
            padding: 16px;
          }

          /* Align steps left on mobile */
          .phase-connector {
             display: none; /* Hide connector completely on mobile to stick them together */
          }
          .phase-indicator {
             justify-content: flex-start;
             gap: 12px; /* Small gap between Step 1 and 2 */
             padding: 12px;
          }
          .phase-item {
             padding: 6px 10px; 
             background: transparent; /* Remove bg to save space? or keep */
             border: 1px solid var(--color-surface-border);
          }
          .phase-item.active {
             background: var(--color-primary-light);
             border-color: var(--color-primary);
          }
        }
        
        /* Desktop Defaults */
        .clipper-container {
            max-width: 70%;
            margin: 0 auto;
        }
        .analyze-result-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        
        .clip-card {
          background: var(--color-bg-secondary);
          border: 2px solid var(--color-surface-border);
          border-radius: var(--radius-lg);
          padding: var(--spacing-lg); /* Increased padding */
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        
        .clip-card:hover {
          border-color: var(--color-primary);
        }
        
        .clip-card.selected {
          border-color: var(--color-primary);
          background: var(--color-primary-light);
        }
        
        .clip-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-sm);
        }
        
        .clip-checkbox {
          width: 24px;
          height: 24px;
          border: 2px solid var(--color-surface-border);
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: var(--color-primary);
        }
        
        .clip-card.selected .clip-checkbox {
          background: var(--color-primary);
          border-color: var(--color-primary);
          color: white;
        }
        
        .clip-number {
          font-weight: 600;
          flex: 1;
        }
        
        .clip-youtube-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #ff0000;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform var(--transition-fast), box-shadow 0.2s;
          text-decoration: none;
          flex-shrink: 0;
          box-shadow: 0 2px 6px rgba(255, 0, 0, 0.3);
        }
        
        .clip-youtube-btn:hover {
          transform: scale(1.15);
          box-shadow: 0 4px 12px rgba(255, 0, 0, 0.5);
        }
        
        .clip-dialog {
          font-size: var(--font-size-md); /* Increased size for readability */
          color: var(--color-text-primary);
          margin-bottom: var(--spacing-sm);
          line-height: 1.6;
          white-space: pre-wrap;
        }
        
        .clip-meta {
          display: flex;
          gap: var(--spacing-md);
          font-size: var(--font-size-xs);
          color: var(--color-text-muted);
        }
        
        .render-success, .render-error, .render-loading {
          text-align: center;
          padding: var(--spacing-xl);
        }
        
        .success-icon, .error-icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          margin: 0 auto var(--spacing-md);
          color: white;
        }
        
        .success-icon {
          background: var(--color-success);
        }
        
        .error-icon {
          background: var(--color-error);
        }
        
        .rendered-clips {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
          max-width: 300px;
          margin: 0 auto;
        }
        
        .rendered-clip-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-sm) var(--spacing-md);
          background: var(--color-bg-secondary);
          border-radius: var(--radius-md);
        }
      `}</style>
        </div>
    )
}
