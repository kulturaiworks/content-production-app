import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { MEDIA_LIST, ONE_CLICK_TYPES, getTemplatesForMedia } from '../data/mediaData'

const SLACK_WEBHOOK = import.meta.env.VITE_WEBHOOK_SLACK_HELPDESK

export default function HelpCenter() {
    const { user } = useAuth()

    const [formData, setFormData] = useState({
        type: 'bug',
        media: '',
        contentType: '',
        template: '',
        description: ''
    })
    const [sending, setSending] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    // Get templates based on selected media
    const templates = formData.media ? getTemplatesForMedia(formData.media) : []

    const handleMediaChange = (value) => {
        setFormData(prev => ({ ...prev, media: value, contentType: '', template: '' }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSending(true)

        const reporter = user?.email || user?.name || 'Unknown User'
        const templateObj = templates.find(t => t.id === formData.template)

        // Build Slack message
        const typeEmoji = { bug: '🐛', feature: '✨', question: '❓', other: '📝' }
        const slackPayload = {
            text: `${typeEmoji[formData.type] || '📝'} *${formData.type.toUpperCase()} REPORT*\n\n` +
                `*Reporter:* ${reporter}\n` +
                `*Media:* ${formData.media || '-'}\n` +
                `*Content Type:* ${formData.contentType || '-'}\n` +
                `*Template:* ${templateObj?.display_name || formData.template || '-'}\n` +
                `*Description:*\n${formData.description}`
        }

        try {
            await fetch(SLACK_WEBHOOK, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify(slackPayload)
            })
        } catch (err) {
            console.error('Slack send error:', err)
        }

        setSending(false)
        setSubmitted(true)
        setFormData({ type: 'bug', media: '', contentType: '', template: '', description: '' })
        setTimeout(() => setSubmitted(false), 4000)
    }

    const isFormValid = formData.media && formData.contentType && formData.description.trim()

    const faqs = [
        {
            q: 'Bagaimana cara menggunakan 1 Click Tool?',
            a: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <p>Fitur ini memungkinkan Anda membuat konten massal dari satu sumber link:</p>
                    <ol style={{ paddingLeft: 20, margin: 0 }}>
                        <li style={{ marginBottom: 4 }}><strong>1. Input:</strong> Paste link (Postingan Media Sosial) di kolom input, klik "Send to Joy" untuk generate Article. Pilih Use Existing / Manual Article jika sudah memiliki bahan Artikel.</li>
                        <li style={{ marginBottom: 4 }}><strong>2. Setup:</strong> QC Article kemudian pilih Media tujuan dan Tipe Konten tujuan.</li>
                        <li style={{ marginBottom: 4 }}><strong>3. Visual:</strong> Review draft. Pilih template dari masing-masing media. Edit teks atau input Image/Video menyesuaikan Template yang dipilih.</li>
                        <li><strong>4. Output:</strong> Klik "Submit". Tunggu hingga status "Completed" dan download hasilnya. Klik Resubmit untuk revisi.</li>
                    </ol>
                </div>
            )
        },
        {
            q: 'Kenapa produksi saya gagal (error)?',
            a: 'Cek apakah semua field sudah terisi dengan benar. Pastikan URL gambar/video valid dan dapat diakses. Jika masih error, gunakan form Report Issue.'
        },
        {
            q: 'Bagaimana cara menyimpan draft?',
            a: 'Klik tombol "Save Draft" di halaman produksi. Draft tersimpan di browser lokal dan bisa di-load kembali dari tab Draft.'
        },
        {
            q: 'Apa bedanya dl=0 dan dl=1 di Dropbox?',
            a: 'dl=0 adalah link untuk view/edit di Dropbox. dl=1 adalah direct link untuk embedding (digunakan untuk produksi konten).'
        },
        {
            q: 'Bagaimana cara menghubungi tim support?',
            a: 'Isi form "Report Issue" di samping. Laporan akan dikirim langsung ke channel Slack support.'
        }
    ]

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Help Center</h1>
                <p className="page-subtitle">Get help and report issues</p>
            </div>

            <div className="grid grid-cols-2">
                {/* Report Issue Section */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Report Issue</h2>
                        <span className="badge badge-info">Slack</span>
                    </div>

                    {submitted ? (
                        <div className="success-message">
                            <div className="success-icon">✓</div>
                            <h4>Terima kasih!</h4>
                            <p className="text-secondary">Laporan Anda telah dikirim ke tim support via Slack.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            {/* Auto-filled Reporter */}
                            <div className="form-group">
                                <label className="form-label">Reporter</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={user?.email || user?.name || 'Unknown User'}
                                    disabled
                                    style={{ opacity: 0.6 }}
                                />
                            </div>

                            {/* Issue Type */}
                            <div className="form-group">
                                <label className="form-label">Issue Type</label>
                                <select
                                    className="form-input form-select"
                                    value={formData.type}
                                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                                >
                                    <option value="bug">🐛 Bug Report</option>
                                    <option value="feature">✨ Feature Request</option>
                                    <option value="question">❓ Question</option>
                                    <option value="other">📝 Other</option>
                                </select>
                            </div>

                            {/* Media Dropdown */}
                            <div className="form-group">
                                <label className="form-label">Nama Media *</label>
                                <select
                                    className="form-input form-select"
                                    value={formData.media}
                                    onChange={(e) => handleMediaChange(e.target.value)}
                                    required
                                >
                                    <option value="">-- Pilih Media --</option>
                                    {MEDIA_LIST.map(media => (
                                        <option key={media} value={media}>{media}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Content Type Dropdown */}
                            <div className="form-group">
                                <label className="form-label">Tipe Konten *</label>
                                <select
                                    className="form-input form-select"
                                    value={formData.contentType}
                                    onChange={(e) => setFormData(prev => ({ ...prev, contentType: e.target.value, template: '' }))}
                                    required
                                    disabled={!formData.media}
                                >
                                    <option value="">-- Pilih Tipe Konten --</option>
                                    {ONE_CLICK_TYPES.map(type => (
                                        <option key={type.id} value={type.id}>{type.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Template Dropdown */}
                            {formData.media && templates.length > 0 && (
                                <div className="form-group">
                                    <label className="form-label">Jenis Template</label>
                                    <select
                                        className="form-input form-select"
                                        value={formData.template}
                                        onChange={(e) => setFormData(prev => ({ ...prev, template: e.target.value }))}
                                    >
                                        <option value="">-- Pilih Template (opsional) --</option>
                                        {templates.map(t => (
                                            <option key={t.id} value={t.id}>{t.display_name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Description */}
                            <div className="form-group">
                                <label className="form-label">Deskripsi Keluhan *</label>
                                <textarea
                                    className="form-input form-textarea"
                                    placeholder="Jelaskan masalah atau keluhan secara detail..."
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    rows={5}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-lg btn-full"
                                disabled={!isFormValid || sending}
                            >
                                {sending ? (
                                    <>
                                        <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span>
                                        Sending...
                                    </>
                                ) : (
                                    'Send to Slack'
                                )}
                            </button>
                        </form>
                    )}
                </div>

                {/* FAQ Section */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Frequently Asked Questions</h2>
                    </div>

                    <div className="faq-list">
                        {faqs.map((faq, index) => (
                            <details key={index} className="faq-item">
                                <summary className="faq-question">{faq.q}</summary>
                                <div className="faq-answer">{faq.a}</div>
                            </details>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
        .faq-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }
        
        .faq-item {
          background: var(--color-bg-secondary);
          border-radius: var(--radius-md);
          padding: var(--spacing-md);
        }
        
        .faq-question {
          font-weight: 500;
          cursor: pointer;
          list-style: none;
        }
        
        .faq-question::-webkit-details-marker {
          display: none;
        }
        
        .faq-question::before {
          content: '▶ ';
          font-size: 10px;
          margin-right: var(--spacing-sm);
        }
        
        .faq-item[open] .faq-question::before {
          content: '▼ ';
        }
        
        .faq-answer {
          margin-top: var(--spacing-sm);
          padding-left: var(--spacing-md);
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
          line-height: 1.6;
        }
        
        .success-message {
          text-align: center;
          padding: var(--spacing-xl);
        }
        
        .success-icon {
          width: 64px;
          height: 64px;
          background: var(--color-success);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          margin: 0 auto var(--spacing-md);
        }
      `}</style>
        </div>
    )
}
