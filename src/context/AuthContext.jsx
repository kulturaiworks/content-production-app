import { createContext, useContext, useState, useEffect } from 'react'
import {
    supabaseSignIn,
    supabaseSignUp,
    supabaseSignOut,
    supabaseGetUser,
    supabaseUpdateUser,
    supabaseResetPasswordForEmail,
    supabaseRefreshToken
} from '../lib/supabase'

const AuthContext = createContext()

const SESSION_KEY = 'supabase_session'

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    // Restore session on mount
    useEffect(() => {
        const restoreSession = async () => {
            console.log('%c🔐 Auth: Initializing session restore...', 'color: #1d9bf0; font-weight: bold;')
            setLoading(true)

            try {
                const saved = localStorage.getItem(SESSION_KEY)
                if (!saved) {
                    console.log('🔐 Auth: No saved session found.')
                    setLoading(false)
                    return
                }

                let session = null
                try {
                    session = JSON.parse(saved)
                } catch (e) {
                    console.error('🔐 Auth: Session JSON parse error')
                    localStorage.removeItem(SESSION_KEY)
                    setLoading(false)
                    return
                }

                if (!session || !session.access_token) {
                    console.log('🔐 Auth: Session object invalid.')
                    localStorage.removeItem(SESSION_KEY)
                    setLoading(false)
                    return
                }

                console.log('🔐 Auth: Verifying session...')

                let userData = null
                let fetchError = false

                try {
                    userData = await supabaseGetUser(session.access_token)
                } catch (userErr) {
                    console.warn('🔐 Auth: User fetch failed (might be network):', userErr.message)
                    fetchError = true
                }

                // If token invalid (returns null) OR explicitly needs refresh, try it
                if (!userData && !fetchError && session.refresh_token) {
                    console.log('🔐 Auth: Access token expired, attempting refresh...')
                    try {
                        const refreshData = await supabaseRefreshToken(session.refresh_token)
                        console.log('%c🔐 Auth: Refresh successful! ✅', 'color: #22c55e')

                        // Update session
                        session = {
                            access_token: refreshData.access_token,
                            refresh_token: refreshData.refresh_token
                        }
                        localStorage.setItem(SESSION_KEY, JSON.stringify(session))

                        // Retry user fetch
                        userData = await supabaseGetUser(session.access_token)
                    } catch (refreshErr) {
                        console.error('🔐 Auth: Refresh failed:', refreshErr.message)
                        // If it's a 4xx error, session is truly dead
                        if (refreshErr.message.includes('invalid') || refreshErr.message.includes('expired')) {
                            localStorage.removeItem(SESSION_KEY)
                        }
                    }
                }

                if (userData && userData.id) {
                    console.log('%c🔐 Auth: User session active:', 'color: #22c55e', userData.email)
                    setUser({
                        id: userData.id,
                        email: userData.email,
                        name: userData.user_metadata?.name || userData.email?.split('@')[0],
                        slackMemberId: userData.user_metadata?.slack_member_id || localStorage.getItem('slack_member_id') || '',
                        photoURL: userData.user_metadata?.avatar_url || userData.user_metadata?.photo_url || '',
                        accessToken: session.access_token
                    })
                } else if (!fetchError) {
                    // Only clear if confirmed invalid by server (no network error)
                    console.log('🔐 Auth: Closing invalid session.')
                    localStorage.removeItem(SESSION_KEY)
                }

            } catch (e) {
                console.error('🔐 Auth: unexpected error:', e)
            } finally {
                setLoading(false)
            }
        }
        restoreSession()
    }, [])

    const login = async (email, password) => {
        const data = await supabaseSignIn(email, password)
        const userObj = {
            id: data.user?.id,
            email: data.user?.email,
            name: data.user?.user_metadata?.name || data.user?.email?.split('@')[0],
            slackMemberId: data.user?.user_metadata?.slack_member_id || localStorage.getItem('slack_member_id') || '',
            photoURL: data.user?.user_metadata?.avatar_url || data.user?.user_metadata?.photo_url || '',
            accessToken: data.access_token
        }
        setUser(userObj)
        localStorage.setItem(SESSION_KEY, JSON.stringify({
            access_token: data.access_token,
            refresh_token: data.refresh_token
        }))
        return { success: true }
    }

    const signup = async (email, password, name, slackMemberId) => {
        const data = await supabaseSignUp(email, password, name)
        // Store slack member ID locally
        if (slackMemberId) localStorage.setItem('slack_member_id', slackMemberId)
        // Supabase may require email confirmation
        if (data.user && data.access_token) {
            const userObj = {
                id: data.user.id,
                email: data.user.email,
                name: name || data.user.email?.split('@')[0],
                slackMemberId: slackMemberId || '',
                photoURL: data.user?.user_metadata?.avatar_url || '',
                accessToken: data.access_token
            }
            setUser(userObj)
            localStorage.setItem(SESSION_KEY, JSON.stringify({
                access_token: data.access_token,
                refresh_token: data.refresh_token
            }))
        }
        return { success: true, needsConfirmation: !data.access_token }
    }

    const logout = async () => {
        try {
            if (user?.accessToken) {
                await supabaseSignOut(user.accessToken)
            }
        } catch (e) {
            console.error('Logout error:', e)
        }
        setUser(null)
        localStorage.removeItem(SESSION_KEY)
    }

    const updateProfile = async (updates) => {
        try {
            await supabaseUpdateUser(user.accessToken, updates)
            if (updates.slackMemberId) localStorage.setItem('slack_member_id', updates.slackMemberId)

            const updatedUser = { ...user, ...updates }
            setUser(updatedUser)
            return { success: true }
        } catch (error) {
            console.error('Update profile error:', error)
            return { success: false, error: error.message }
        }
    }

    const resetPassword = async (email) => {
        try {
            await supabaseResetPasswordForEmail(email)
            return { success: true }
        } catch (error) {
            console.error('Reset password error:', error)
            return { success: false, error: error.message }
        }
    }

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            signup,
            logout,
            updateProfile,
            resetPassword,
            incrementWorkCount: () => console.log('Work count incremented') // Placeholder to prevent crash
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}
