import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getUserStats } from '../lib/supabase'

export default function Profile() {
    const { user, updateProfile, logout } = useAuth()
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        slackMemberId: user?.slackMemberId || ''
    })
    const [saved, setSaved] = useState(false)
    const fileInputRef = useRef(null)
    const [stats, setStats] = useState(null)

    useEffect(() => {
        if (user?.email) {
            getUserStats(user.email).then(s => setStats(s))
        }
    }, [user?.email])

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
        setSaved(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const result = await updateProfile(formData)
        if (result.success) {
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        } else {
            alert('Update failed: ' + result.error)
        }
    }

    const handlePhotoChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                updateProfile({ photoURL: reader.result })
            }
            reader.readAsDataURL(file)
        }
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Profile Settings</h1>
                <p className="page-subtitle">Manage your account information</p>
            </div>

            <div className="grid grid-cols-3">
                <div className="card" style={{ gridColumn: 'span 2' }}>
                    <div className="card-header">
                        <h2 className="card-title">Personal Information</h2>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="profile-photo-section">
                            <div className="user-avatar" style={{ width: 80, height: 80, fontSize: 28 }}>
                                {user?.photoURL ? (
                                    <img src={user.photoURL} alt={user.name} />
                                ) : (
                                    user?.name?.charAt(0)?.toUpperCase() || 'U'
                                )}
                            </div>
                            <div className="profile-photo-actions">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    Change Photo
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    style={{ display: 'none' }}
                                />
                                <p className="text-muted" style={{ fontSize: 12, marginTop: 8 }}>
                                    JPG, PNG or GIF. Max 2MB.
                                </p>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                className="form-input"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                className="form-input"
                                value={formData.email}
                                onChange={handleChange}
                                disabled
                            />
                            <p className="text-muted" style={{ fontSize: 12, marginTop: 4 }}>
                                Email cannot be changed
                            </p>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Slack Member ID</label>
                            <input
                                type="text"
                                name="slackMemberId"
                                className="form-input"
                                value={formData.slackMemberId}
                                onChange={handleChange}
                                placeholder="e.g. U0AD664M60J"
                            />
                            <p className="text-muted" style={{ fontSize: 12, marginTop: 4 }}>
                                Required for Joy integration
                            </p>
                        </div>

                        <div className="flex gap-sm">
                            <button type="submit" className="btn btn-primary">
                                {saved ? '✓ Saved!' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Statistics</h2>
                    </div>

                    <div className="stats-list">
                        <div className="stat-item">
                            <span className="stat-label">Total Productions</span>
                            <span className="stat-value">{stats?.total || 0}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Completed</span>
                            <span className="stat-value">{stats?.done || 0}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">In Progress</span>
                            <span className="stat-value">{stats?.inProgress || 0}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Errors</span>
                            <span className="stat-value">{stats?.error || 0}</span>
                        </div>
                    </div>

                    {/* Media Breakdown */}
                    <div className="media-breakdown">
                        <h4 className="breakdown-title">Production by Media</h4>
                        <div className="breakdown-list">
                            {stats?.byContentType && Object.entries(stats.byContentType).length > 0 ? (
                                Object.entries(stats.byContentType)
                                    .sort((a, b) => b[1] - a[1])
                                    .map(([media, count], idx) => (
                                        <div key={idx} className="breakdown-item">
                                            <span className="breakdown-media">{media}</span>
                                            <span className="breakdown-count">{count}</span>
                                        </div>
                                    ))
                            ) : (
                                <p className="text-muted" style={{ fontSize: 12 }}>No production data yet</p>
                            )}
                        </div>
                    </div>

                    <div className="mt-lg">
                        <button
                            className="btn btn-outline btn-full"
                            onClick={logout}
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
        .profile-photo-section {
          display: flex;
          align-items: center;
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-lg);
          padding-bottom: var(--spacing-lg);
          border-bottom: 1px solid var(--color-surface-border);
        }
        
        .profile-photo-actions {
          flex: 1;
        }
        
        .stats-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }
        
        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .stat-label {
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
        }
        
        .stat-value {
          font-size: var(--font-size-lg);
          font-weight: 600;
          color: var(--color-text-primary);
        }
        
        .media-breakdown {
          margin-top: var(--spacing-lg);
          padding-top: var(--spacing-lg);
          border-top: 1px solid var(--color-surface-border);
        }
        
        .breakdown-title {
          font-size: var(--font-size-sm);
          font-weight: 600;
          color: var(--color-text-primary);
          margin-bottom: var(--spacing-sm);
        }
        
        .breakdown-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
          max-height: 200px;
          overflow-y: auto;
        }
        
        .breakdown-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-xs) var(--spacing-sm);
          background: var(--color-bg-secondary);
          border-radius: var(--radius-sm);
          font-size: var(--font-size-xs);
        }
        
        .breakdown-media {
          color: var(--color-text-secondary);
        }
        
        .breakdown-count {
          font-weight: 600;
          color: var(--color-primary);
        }
      `}</style>
        </div>
    )
}
