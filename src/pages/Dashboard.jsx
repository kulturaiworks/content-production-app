import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getDashboardData } from '../lib/supabase'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
    const { user } = useAuth()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user?.email) {
            setLoading(true)
            getDashboardData(user.email).then(d => {
                setData(d)
                setLoading(false)
            })
        }
    }, [user?.email])

    const total = data?.total || 0
    const done = data?.done || 0
    const completedToday = data?.completedToday || 0
    const totalImages = data?.totalImages || 0
    const totalVideos = data?.totalVideos || 0
    const mediaStats = data?.mediaStats || []
    const weeklyData = data?.weeklyData || []
    const recentProductions = data?.recent || []

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">Welcome back, {user?.name || 'Editor'}!</p>
            </div>

            {loading && <p className="text-muted" style={{ textAlign: 'center', padding: 40 }}>Loading dashboard data...</p>}

            {!loading && (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-4 mb-lg">
                        <div className="card stat-card">
                            <div className="stat-card-icon" style={{ background: 'var(--color-primary-light)' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                    <polyline points="21 15 16 10 5 21"></polyline>
                                </svg>
                            </div>
                            <div className="stat-card-content">
                                <p className="stat-card-label">Total Productions</p>
                                <p className="stat-card-value">{total}</p>
                                {done > 0 && <p className="stat-card-change positive">{done} completed</p>}
                            </div>
                        </div>

                        <div className="card stat-card">
                            <div className="stat-card-icon" style={{ background: 'var(--color-success-bg)' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                            <div className="stat-card-content">
                                <p className="stat-card-label">Completed Today</p>
                                <p className="stat-card-value">{completedToday}</p>
                            </div>
                        </div>

                        <div className="card stat-card">
                            <div className="stat-card-icon" style={{ background: 'var(--color-info-bg)' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-info)" strokeWidth="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                    <polyline points="21 15 16 10 5 21"></polyline>
                                </svg>
                            </div>
                            <div className="stat-card-content">
                                <p className="stat-card-label">Total Images</p>
                                <p className="stat-card-value">{totalImages}</p>
                                <p className="stat-card-change">{totalImages} done</p>
                            </div>
                        </div>

                        <div className="card stat-card">
                            <div className="stat-card-icon" style={{ background: 'var(--color-warning-bg)' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" strokeWidth="2">
                                    <polygon points="23 7 16 12 23 17 23 7"></polygon>
                                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                                </svg>
                            </div>
                            <div className="stat-card-content">
                                <p className="stat-card-label">Total Videos</p>
                                <p className="stat-card-value">{totalVideos}</p>
                                <p className="stat-card-change">{totalVideos} done</p>
                            </div>
                        </div>
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-3 mb-lg">
                        <div className="card" style={{ gridColumn: 'span 2' }}>
                            <div className="card-header">
                                <h2 className="card-title">Production Trend</h2>
                                <span className="text-secondary" style={{ fontSize: 14 }}>Last 7 days</span>
                            </div>
                            <div style={{ height: 280 }}>
                                {weeklyData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorProductions" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#1d9bf0" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#1d9bf0" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-border)" />
                                            <XAxis dataKey="day" stroke="var(--color-text-muted)" fontSize={12} />
                                            <YAxis stroke="var(--color-text-muted)" fontSize={12} />
                                            <Tooltip
                                                contentStyle={{
                                                    background: 'var(--color-surface)',
                                                    border: '1px solid var(--color-surface-border)',
                                                    borderRadius: 8
                                                }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="productions"
                                                stroke="#1d9bf0"
                                                strokeWidth={2}
                                                fillOpacity={1}
                                                fill="url(#colorProductions)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                        <p className="text-muted">No production data yet</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-header">
                                <h2 className="card-title">By Media</h2>
                            </div>
                            <div className="media-stats">
                                {mediaStats.length > 0 ? mediaStats.map((media, index) => (
                                    <div key={index} className="media-stat-item">
                                        <div className="media-stat-info">
                                            <span className="media-stat-dot" style={{ background: media.color }}></span>
                                            <span className="media-stat-name">{media.name}</span>
                                        </div>
                                        <span className="media-stat-count">{media.count}</span>
                                    </div>
                                )) : (
                                    <p className="text-muted" style={{ fontSize: 12 }}>No data yet</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recent Productions */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Recent Productions</h2>
                            <a href="/history" className="text-primary" style={{ fontSize: 14 }}>View All</a>
                        </div>
                        <div className="recent-table">
                            {recentProductions.length > 0 ? (
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Media</th>
                                            <th>Type</th>
                                            <th>Status</th>
                                            <th>Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentProductions.map(prod => (
                                            <tr key={prod.id}>
                                                <td>{prod.media}</td>
                                                <td>{prod.type}</td>
                                                <td>
                                                    <span className={`badge badge-${['DONE', 'COMPLETED'].includes(prod.status) ? 'success' : ['ERROR', 'FAILED'].includes(prod.status) ? 'error' : 'warning'}`}>
                                                        {['DONE', 'COMPLETED'].includes(prod.status) ? 'Completed' : ['ERROR', 'FAILED'].includes(prod.status) ? 'Failed' : 'In Progress'}
                                                    </span>
                                                </td>
                                                <td className="text-muted">{prod.time}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-muted" style={{ textAlign: 'center', padding: 20 }}>No productions yet. Start creating content!</p>
                            )}
                        </div>
                    </div>
                </>
            )}

            <style>{`
        .stat-card {
          display: flex;
          align-items: flex-start;
          gap: var(--spacing-md);
        }
        
        .stat-card-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        .stat-card-content {
          flex: 1;
        }
        
        .stat-card-label {
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
          margin-bottom: 4px;
        }
        
        .stat-card-value {
          font-size: var(--font-size-2xl);
          font-weight: 700;
          color: var(--color-text-primary);
        }
        
        .stat-card-change {
          font-size: var(--font-size-xs);
          color: var(--color-text-muted);
          margin-top: 4px;
        }
        
        .stat-card-change.positive {
          color: var(--color-success);
        }
        
        .stat-card-change.negative {
          color: var(--color-error);
        }
        
        .media-stats {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }
        
        .media-stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-sm) 0;
        }
        
        .media-stat-info {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }
        
        .media-stat-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        
        .media-stat-name {
          font-size: var(--font-size-sm);
          color: var(--color-text-primary);
        }
        
        .media-stat-count {
          font-size: var(--font-size-sm);
          font-weight: 600;
          color: var(--color-text-primary);
        }
        
        .recent-table {
          overflow-x: auto;
        }
        
        .recent-table table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .recent-table th {
          text-align: left;
          font-size: var(--font-size-xs);
          font-weight: 600;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: var(--spacing-sm) var(--spacing-md);
          border-bottom: 1px solid var(--color-surface-border);
        }
        
        .recent-table td {
          padding: var(--spacing-md);
          font-size: var(--font-size-sm);
          border-bottom: 1px solid var(--color-surface-border);
        }
        
        .recent-table tr:last-child td {
          border-bottom: none;
        }
      `}</style>
        </div>
    )
}
