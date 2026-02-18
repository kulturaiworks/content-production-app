import { useState, useEffect } from 'react'
import { MEDIA_LIST, MEDIA_PERSONAS, LLM_MODELS } from '../data/mediaData'
import { useProduction } from '../context/ProductionContext'
import { useAuth } from '../context/AuthContext'

const SLACK_WEBHOOK = import.meta.env.VITE_SLACK_COPYWRITING_WEBHOOK

export default function CopywritingTools() {
    const { user } = useAuth()
    const { startPolling } = useProduction()

    const [selectedMedia, setSelectedMedia] = useState('')
    const [selectedFormat, setSelectedFormat] = useState('Single Post (Headline + Caption)')
    const [inputType, setInputType] = useState('article') // article or link
    const [inputValue, setInputValue] = useState('')
    const [generated, setGenerated] = useState(null)
    const [loading, setLoading] = useState(false)
    const [sendStatus, setSendStatus] = useState(null) // null | 'sending' | 'sent' | 'error'

    // --- AUTO-SAVE LOGIC ---
    // Load saved state on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem('copywriting_autosave')
            if (saved) {
                const data = JSON.parse(saved)
                if (data.selectedMedia) setSelectedMedia(data.selectedMedia)
                if (data.selectedFormat) setSelectedFormat(data.selectedFormat)
                if (data.inputType) setInputType(data.inputType)
                if (data.inputValue) setInputValue(data.inputValue)
                if (data.generated) setGenerated(data.generated)
            }
        } catch (e) {
            console.error('Failed to load autosave:', e)
        }
    }, [])

    // Save state on change
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const dataToSave = {
                selectedMedia,
                selectedFormat,
                inputType,
                inputValue,
                generated,
                timestamp: Date.now()
            }
            localStorage.setItem('copywriting_autosave', JSON.stringify(dataToSave))
        }, 1000)

        return () => clearTimeout(timeoutId)
    }, [selectedMedia, selectedFormat, inputType, inputValue, generated])
    // -----------------------

    // Send copywriting request to Joy via Slack
    const handleSendToJoy = async () => {
        if (!SLACK_WEBHOOK) {
            alert('Missing VITE_SLACK_CLIPPER_WEBHOOK env variable')
            return
        }

        setSendStatus('sending')
        setLoading(true)

        try {

            const userMention = user?.slackMemberId ? `<@${user.slackMemberId}>` : (user?.email || 'Unknown')
            const contentPreview = inputValue.length > 300 ? inputValue.substring(0, 300) + '...' : inputValue

            await fetch(SLACK_WEBHOOK, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: `✍️ *COPYWRITING REQUEST*\n\n🏷️ *Media:* ${selectedMedia}\n🎯 *Output:* ${selectedFormat}\n📝 *Input Type:* ${inputType === 'article' ? 'Article' : 'Social Link'}\n👤 *Requester:* ${userMention}\n\n📄 *Content:*\n${inputType === 'link' ? inputValue : contentPreview}\n\ncc: <@U0AD664M60J>`
                })
            })

            setSendStatus('sent')
        } catch (error) {
            console.error('Slack webhook error:', error)
            setSendStatus('error')
        } finally {
            setLoading(false)
        }
    }

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text)
        // Could add toast notification here
    }

    const handleReset = () => {
        setSelectedMedia('')
        setInputValue('')
        setGenerated(null)
    }

    return (
        <div style={{ maxWidth: '70%', margin: '0 auto' }}>
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
                            <option value="Carousel (Headlines + 4 Slides)">Carousel (Headlines + 4 Slides)</option>
                            <option value="Headlines Only (3 Options)">Headlines Only (3 Options)</option>
                            <option value="Caption Only (2 Options)">Caption Only (2 Options)</option>
                        </select>
                    </div>



                    <div className="form-group">
                        <label className="form-label">Input Type</label>
                        <div className="input-type-toggle">
                            <button
                                className={`toggle-btn ${inputType === 'article' ? 'active' : ''}`}
                                onClick={() => setInputType('article')}
                            >
                                Article
                            </button>
                            <button
                                className={`toggle-btn ${inputType === 'link' ? 'active' : ''}`}
                                onClick={() => setInputType('link')}
                            >
                                Social Link
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            {inputType === 'article' ? 'Article Content' : 'Social Media Link'}
                        </label>
                        {inputType === 'article' ? (
                            <textarea
                                className="form-input form-textarea"
                                placeholder="Paste your article here..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                rows={10}
                            />
                        ) : (
                            <input
                                type="url"
                                className="form-input"
                                placeholder="https://instagram.com/p/..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                            />
                        )}
                    </div>

                    <button
                        className="btn btn-full"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: 'white', border: 'none' }}
                        onClick={handleSendToJoy}
                        disabled={!selectedMedia || !inputValue.trim() || loading || sendStatus === 'sent'}
                    >
                        {loading ? (
                            <>
                                <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span>
                                Sending to Joy...
                            </>
                        ) : sendStatus === 'sent' ? (
                            '✓ Sent to Joy!'
                        ) : (
                            '🤖 Send to Joy'
                        )}
                    </button>
                    {sendStatus === 'sent' && (
                        <button
                            className="btn btn-secondary btn-full"
                            onClick={() => { setSendStatus(null); setInputValue(''); setGenerated(null) }}
                            style={{ marginTop: 8 }}
                        >
                            ↻ New Request
                        </button>
                    )}
                    {sendStatus === 'error' && (
                        <div className="alert alert-error mt-sm" style={{ fontSize: 13 }}>
                            Failed to send. <button className="login-switch" onClick={handleSendToJoy}>Retry</button>
                        </div>
                    )}
                </div>

                {/* Status Section */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Status</h2>
                    </div>

                    {sendStatus === 'sent' ? (
                        <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                            <div style={{ fontSize: 48 }}>🤖</div>
                            <h4 style={{ marginTop: 12 }}>Sent to Joy!</h4>
                            <p className="text-secondary" style={{ fontSize: 13, marginTop: 8 }}>
                                Request sent to Slack. Joy will generate copywriting and reply in the channel.
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
                                <div><strong>Input:</strong> {inputType === 'article' ? 'Article' : 'Social Link'}</div>
                            </div>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">✍️</div>
                            <p className="empty-state-title">No Request Yet</p>
                            <p className="empty-state-text">Fill in the input form and click Send to Joy</p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
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
        
        .generated-content {
          max-height: 500px;
          overflow-y: auto;
        }
        
        .generated-section {
          margin-bottom: var(--spacing-lg);
        }
        
        .generated-section-title {
          font-size: var(--font-size-sm);
          font-weight: 600;
          color: var(--color-text-secondary);
          margin-bottom: var(--spacing-sm);
        }
        
        .generated-item {
          background: var(--color-bg-secondary);
          border-radius: var(--radius-md);
          padding: var(--spacing-md);
          margin-bottom: var(--spacing-sm);
        }
        
        .generated-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-sm);
        }
        
        .item-number {
          width: 24px;
          height: 24px;
          background: var(--color-primary);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
        }
        
        .generated-item p {
          font-size: var(--font-size-sm);
          color: var(--color-text-primary);
          margin: 0;
          line-height: 1.6;
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
