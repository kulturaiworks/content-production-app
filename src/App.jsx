import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom'

// Context
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { ProductionProvider, useProduction } from './context/ProductionContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { TemplateProvider } from './context/TemplateContext'

// Pages
import Dashboard from './pages/Dashboard'
import OneClick from './pages/OneClick'
import SinglePost from './pages/SinglePost'
import CarouselTools from './pages/CarouselTools'
import ClipperTools from './pages/ClipperTools'
import CopywritingTools from './pages/CopywritingTools'
import DirectLink from './pages/DirectLink'
import Downloader from './pages/Downloader'
import Draft from './pages/Draft'
import History from './pages/History'
import HelpCenter from './pages/HelpCenter'
import Login from './pages/Login'
import Profile from './pages/Profile'

// Icons (using simple SVG components)
const Icons = {
    Dashboard: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="9"></rect>
            <rect x="14" y="3" width="7" height="5"></rect>
            <rect x="14" y="12" width="7" height="9"></rect>
            <rect x="3" y="16" width="7" height="5"></rect>
        </svg>
    ),
    Zap: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
    ),
    Image: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
    ),
    Layers: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
            <polyline points="2 17 12 22 22 17"></polyline>
            <polyline points="2 12 12 17 22 12"></polyline>
        </svg>
    ),
    Scissors: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="6" cy="6" r="3"></circle>
            <circle cx="6" cy="18" r="3"></circle>
            <line x1="20" y1="4" x2="8.12" y2="15.88"></line>
            <line x1="14.47" y1="14.48" x2="20" y2="20"></line>
            <line x1="8.12" y1="8.12" x2="12" y2="12"></line>
        </svg>
    ),
    FileText: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
        </svg>
    ),
    Link: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        </svg>
    ),
    Download: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
    ),
    Save: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
        </svg>
    ),
    Clock: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
    ),
    HelpCircle: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
    ),
    Sun: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
    ),
    Moon: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
    ),
    Check: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    ),
    X: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    ),
    ExternalLink: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
        </svg>
    ),
    User: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
        </svg>
    ),
    Menu: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
    ),
}

// Timeline Stepper Component
function TimelineStepper() {
    const { status } = useProduction()

    // Debug log to see current status
    console.log('🔵 TimelineStepper - Current status:', status)

    const steps = [
        { id: 'ready', label: 'Ready' },
        { id: 'sending', label: 'Sending' },
        { id: 'producing', label: 'Producing' },
        { id: 'done', label: 'Done' },
    ]

    const getStepState = (stepId) => {
        const stepOrder = ['ready', 'sending', 'producing', 'done']

        // If status is 'done', all steps should be completed
        if (status === 'done') {
            return 'completed'
        }

        // If status is 'error', treat it as done position but mark final step as error
        if (status === 'error') {
            const stepIndex = stepOrder.indexOf(stepId)
            if (stepId === 'done') return 'error'
            return 'completed' // All previous steps are completed
        }

        const currentIndex = stepOrder.indexOf(status)
        const stepIndex = stepOrder.indexOf(stepId)

        if (stepIndex < currentIndex) return 'completed'
        if (stepIndex === currentIndex) return 'active'
        return 'pending'
    }

    return (
        <div className="timeline-stepper">
            {steps.map((step, index) => (
                <div key={step.id} className="timeline-step">
                    <div className={`timeline-step-dot ${getStepState(step.id)}`}>
                        {getStepState(step.id) === 'completed' ? (
                            <Icons.Check />
                        ) : getStepState(step.id) === 'error' ? (
                            <Icons.X />
                        ) : (
                            index + 1
                        )}
                    </div>
                    <span className={`timeline-step-label ${getStepState(step.id)}`}>
                        {step.label}
                    </span>
                    {index < steps.length - 1 && (
                        <div className={`timeline-connector ${getStepState(step.id) === 'completed' ? 'completed' : ''}`} />
                    )}
                </div>
            ))}
        </div>
    )
}


// Status Indicator Component
function StatusIndicator() {
    const { status, outputUrl } = useProduction()

    const handleClick = () => {
        if (status === 'done' && outputUrl) {
            window.open(outputUrl, '_blank')
        }
    }

    const labels = {
        ready: 'Ready',
        sending: 'Sending...',
        producing: 'Producing...',
        done: 'DONE! Check Output Here',
        error: 'Error'
    }

    return (
        <div
            className={`status-indicator ${status}`}
            onClick={handleClick}
            title={status === 'done' ? 'Click to view output' : ''}
        >
            <span className="status-dot"></span>
            <span>{labels[status]}</span>
            {status === 'done' && <Icons.ExternalLink />}
        </div>
    )
}

// Sidebar Component
function Sidebar({ isOpen, onClose }) {
    const { user, logout } = useAuth()
    const location = useLocation()

    const navItems = [
        { path: '/', icon: Icons.Dashboard, label: 'Dashboard' },
        { section: 'Production Tools' },
        { path: '/one-click', icon: Icons.Zap, label: '1 Click' },
        { path: '/single-post', icon: Icons.Image, label: 'Single Post' },
        { path: '/carousel', icon: Icons.Layers, label: 'Carousel Tools' },
        { path: '/clipper', icon: Icons.Scissors, label: 'Clipper Tools' },
        { path: '/copywriting', icon: Icons.FileText, label: 'Copywriting' },
        { section: 'Utilities' },
        { path: '/direct-link', icon: Icons.Link, label: 'Direct Link' },
        { path: '/downloader', icon: Icons.Download, label: 'Downloader' },
        { section: 'Management' },
        { path: '/draft', icon: Icons.Save, label: 'Draft' },
        { path: '/history', icon: Icons.Clock, label: 'History' },
        { path: '/help', icon: Icons.HelpCircle, label: 'Help Center' },
    ]

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    {import.meta.env.VITE_APP_CLIENT === 'RW' ? (
                        <div style={{
                            width: '32px', height: '32px', backgroundColor: '#D32F2F', color: 'white',
                            fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            borderRadius: '6px', fontSize: '16px', marginRight: '12px', flexShrink: 0
                        }}>
                            RW
                        </div>
                    ) : (
                        <img
                            src="/g2-logo.png"
                            alt="G2 Logo"
                            className="sidebar-logo-icon"
                            style={{ padding: 0, background: 'transparent', objectFit: 'contain' }}
                        />
                    )}
                    <span className="sidebar-logo-text">
                        {import.meta.env.VITE_APP_CLIENT === 'RW' ? 'Editorial App' : 'Editorial V.2'}
                    </span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item, index) => {
                    if (item.section) {
                        return (
                            <div key={index} className="nav-section">
                                <div className="nav-section-title">{item.section}</div>
                            </div>
                        )
                    }

                    const Icon = item.icon
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                            onClick={onClose}
                        >
                            <span className="nav-item-icon"><Icon /></span>
                            <span>{item.label}</span>
                        </NavLink>
                    )
                })}
            </nav>

            <div className="sidebar-footer">
                <NavLink to="/profile" className="user-profile" onClick={onClose}>
                    <div className="user-avatar">
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt={user.name} />
                        ) : (
                            user?.name?.charAt(0)?.toUpperCase() || 'U'
                        )}
                    </div>
                    <div className="user-info">
                        <div className="user-name">{user?.name || 'Editor'}</div>
                        <div className="user-email">{user?.email || 'editor@example.com'}</div>
                    </div>
                </NavLink>
            </div>
        </aside>
    )
}

// Header Component
function Header({ onMenuClick }) {
    const { theme, toggleTheme } = useTheme()

    return (
        <header className="header">
            <div className="flex items-center gap-md">
                <button className="theme-toggle mobile-menu" onClick={onMenuClick}>
                    <Icons.Menu />
                </button>
                <TimelineStepper />
            </div>

            <div className="flex items-center gap-md">
                <StatusIndicator />
                <button className="theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
                    {theme === 'light' ? <Icons.Moon /> : <Icons.Sun />}
                </button>
            </div>
        </header>
    )
}

// Keep-Alive Pages: All pages stay mounted, only the active one is visible.
// This prevents in-flight requests from being cancelled when switching tabs.
const PAGE_MAP = [
    { path: '/', Component: Dashboard },
    { path: '/one-click', Component: OneClick },
    { path: '/single-post', Component: SinglePost },
    { path: '/carousel', Component: CarouselTools },
    { path: '/clipper', Component: ClipperTools },
    { path: '/copywriting', Component: CopywritingTools },
    { path: '/direct-link', Component: DirectLink },
    { path: '/downloader', Component: Downloader },
    { path: '/draft', Component: Draft },
    { path: '/history', Component: History },
    { path: '/help', Component: HelpCenter },
    { path: '/profile', Component: Profile },
]

function KeepAlivePages() {
    const location = useLocation()
    const [visited, setVisited] = useState(new Set(['/']))

    // Track visited pages so we only mount them on first visit (lazy mount)
    useEffect(() => {
        setVisited(prev => {
            if (prev.has(location.pathname)) return prev
            const next = new Set(prev)
            next.add(location.pathname)
            return next
        })
    }, [location.pathname])

    return (
        <>
            {PAGE_MAP.map(({ path, Component }) => {
                const isActive = location.pathname === path
                const wasVisited = visited.has(path)
                // Only mount a page once it's been visited (lazy)
                if (!wasVisited && !isActive) return null
                return (
                    <div key={path} style={{ display: isActive ? 'block' : 'none' }}>
                        <Component />
                    </div>
                )
            })}
        </>
    )
}

// Main App Layout
function AppLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const { user, loading } = useAuth()
    const location = useLocation()

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setSidebarOpen(false)
    }, [location])

    // Client Branding Logic (Favicon & Title)
    useEffect(() => {
        if (import.meta.env.VITE_APP_CLIENT === 'RW') {
            document.title = 'Editorial App'
            // Generate RW Favicon dynamically
            try {
                const canvas = document.createElement('canvas')
                canvas.width = 64; canvas.height = 64
                const ctx = canvas.getContext('2d')

                // Red Background
                ctx.fillStyle = '#D32F2F';
                ctx.fillRect(0, 0, 64, 64)

                // White Text
                ctx.fillStyle = 'white';
                ctx.font = 'bold 36px Arial, sans-serif'
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle'
                ctx.fillText('RW', 32, 34)

                // Set Favicon
                let link = document.querySelector("link[rel~='icon']")
                if (!link) {
                    link = document.createElement('link')
                    link.rel = 'icon'
                    document.head.appendChild(link)
                }
                link.href = canvas.toDataURL()
            } catch (e) {
                console.error('Failed to set brand favicon', e)
            }
        }
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center" style={{ height: '100vh' }}>
                <div className="spinner"></div>
            </div>
        )
    }

    if (!user) {
        return <Login />
    }

    return (
        <div className="app-layout">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="main-wrapper">
                <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
                <main className="main-content">
                    <KeepAlivePages />
                </main>
            </div>
        </div>
    )
}

// Root App
function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <TemplateProvider>
                    <ProductionProvider>
                        <Router>
                            <AppLayout />
                        </Router>
                    </ProductionProvider>
                </TemplateProvider>
            </AuthProvider>
        </ThemeProvider>
    )
}

export default App
