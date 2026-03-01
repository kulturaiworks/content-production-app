import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
    const { login, signup, resetPassword } = useAuth()
    const navigate = useNavigate()
    const [isLogin, setIsLogin] = useState(true)
    const [isForgot, setIsForgot] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        slackMemberId: ''
    })
    const [error, setError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccessMessage('')
        setLoading(true)

        try {
            if (isForgot) {
                if (!formData.email) {
                    setError('Please enter your email')
                    setLoading(false)
                    return
                }
                const result = await resetPassword(formData.email)
                if (result.success) {
                    setSuccessMessage('✅ Password reset link sent! Check your email.')
                    // Don't switch back immediately so user sees message
                } else {
                    setError(result.error || 'Failed to send reset email')
                }
            } else if (isLogin) {
                await login(formData.email, formData.password)
                navigate('/')
            } else {
                if (!formData.name.trim()) {
                    setError('Name is required')
                    setLoading(false)
                    return
                }
                if (!formData.slackMemberId.trim()) {
                    setError('Slack Member ID is required')
                    setLoading(false)
                    return
                }
                if (!/^[UW][A-Z0-9]+$/.test(formData.slackMemberId.trim().toUpperCase())) {
                    setError('Invalid Slack Member ID format (usually starts with U or W)')
                    setLoading(false)
                    return
                }
                const result = await signup(formData.email, formData.password, formData.name, formData.slackMemberId)
                if (result.needsConfirmation) {
                    setSuccessMessage('✅ Check your email to confirm your account, then login.')
                    setIsLogin(true)
                    setLoading(false)
                    return
                }
            }
        } catch (err) {
            setError(err.message || 'An error occurred')
        }

        setLoading(false)
    }

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="login-logo">
                        {import.meta.env.VITE_APP_CLIENT === 'RW' ? (
                            <div style={{
                                width: '64px', height: '64px', backgroundColor: '#D32F2F', color: 'white',
                                fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                borderRadius: '12px', fontSize: '28px'
                            }}>
                                RW
                            </div>
                        ) : (
                            <img
                                src="/favicon.png"
                                alt="G2 Logo"
                                style={{ width: 64, height: 64, objectFit: 'contain' }}
                            />
                        )}
                    </div>
                    <h1 className="login-title">
                        {isForgot ? 'Reset Password' : (isLogin ? 'Welcome Back' : 'Create Account')}
                    </h1>
                    <p className="login-subtitle">
                        {isForgot
                            ? 'Enter your email to receive reset instructions'
                            : (isLogin
                                ? (import.meta.env.VITE_APP_CLIENT === 'RW' ? 'Sign in to RW Editorial App' : 'Sign in to G2 Web App')
                                : (import.meta.env.VITE_APP_CLIENT === 'RW' ? 'Get started with RW Editorial App' : 'Get started with G2 Web App')
                            )}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {!isLogin && !isForgot && (
                        <>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-input"
                                    placeholder="Enter your name"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Slack Member ID <span style={{ color: 'var(--color-error)' }}>*</span></label>
                                <input
                                    type="text"
                                    name="slackMemberId"
                                    className="form-input"
                                    placeholder="e.g. U0AD664M60J"
                                    value={formData.slackMemberId}
                                    onChange={handleChange}
                                    required
                                />
                                <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
                                    Slack → Profile → ⋮ → Copy member ID
                                </p>
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {!isForgot && (
                        <div className="form-group">
                            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                Password
                                {isLogin && (
                                    <button
                                        type="button"
                                        className="login-switch"
                                        style={{ fontSize: 12 }}
                                        onClick={() => { setIsForgot(true); setError(''); setSuccessMessage(''); }}
                                    >
                                        Forgot Password?
                                    </button>
                                )}
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    className="form-input"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    style={{ paddingRight: 40 }}
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    style={{
                                        position: 'absolute',
                                        right: 10,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: 'var(--color-text-muted)',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                    title={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                            <line x1="1" y1="1" x2="23" y2="23"></line>
                                        </svg>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="login-error">{error}</div>
                    )}

                    {successMessage && (
                        <div className="login-error" style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
                            {successMessage}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg btn-full"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></span>
                        ) : (
                            isForgot ? 'Send Reset Link' : (isLogin ? 'Sign In' : 'Create Account')
                        )}
                    </button>

                    {isForgot && (
                        <button
                            type="button"
                            className="btn btn-outline btn-lg btn-full"
                            style={{ mt: 2 }}
                            onClick={() => { setIsForgot(false); setError(''); setSuccessMessage(''); }}
                        >
                            Back to Login
                        </button>
                    )}
                </form>

                {!isForgot && (
                    <div className="login-footer">
                        <p>
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <button
                                type="button"
                                className="login-switch"
                                onClick={() => setIsLogin(!isLogin)}
                            >
                                {isLogin ? 'Sign up' : 'Sign in'}
                            </button>
                        </p>
                    </div>
                )}
            </div>

            <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-bg-primary);
          padding: var(--spacing-lg);
        }
        
        .login-card {
          width: 100%;
          max-width: 420px;
          background: var(--color-surface);
          border-radius: var(--radius-xl);
          padding: var(--spacing-xl);
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--color-surface-border);
        }
        
        .login-header {
          text-align: center;
          margin-bottom: var(--spacing-xl);
        }
        
        .login-logo {
          display: flex;
          justify-content: center;
          margin-bottom: var(--spacing-md);
        }
        
        .login-title {
          font-size: var(--font-size-2xl);
          font-weight: 700;
          color: var(--color-text-primary);
          margin-bottom: var(--spacing-xs);
        }
        
        .login-subtitle {
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
        }
        
        .login-form {
          margin-bottom: var(--spacing-lg);
        }
        
        .login-error {
          background: var(--color-error-bg);
          color: var(--color-error);
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--radius-md);
          font-size: var(--font-size-sm);
          margin-bottom: var(--spacing-md);
        }
        
        .login-footer {
          text-align: center;
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
        }
        
        .login-switch {
          color: var(--color-primary);
          font-weight: 500;
          background: none;
          border: none;
          cursor: pointer;
        }
        
        .login-switch:hover {
          text-decoration: underline;
        }
      `}</style>
        </div>
    )
}
