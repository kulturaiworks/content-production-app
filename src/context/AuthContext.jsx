import { createContext, useContext, useState, useEffect } from 'react'
import { supabaseSignIn, supabaseSignUp, supabaseSignOut, supabaseGetUser, supabaseUpdateUser, supabaseResetPasswordForEmail } from '../lib/supabase'

const AuthContext = createContext()

const SESSION_KEY = 'supabase_session'

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    // Restore session on mount
    useEffect(() => {
        const restoreSession = async () => {
            try {
                const saved = localStorage.getItem(SESSION_KEY)
                if (saved) {
                    const session = JSON.parse(saved)
                    const userData = await supabaseGetUser(session.access_token)
                    if (userData && userData.id) {
                        setUser({
                            id: userData.id,
                            email: userData.email,
                            name: userData.user_metadata?.name || userData.email?.split('@')[0],
                            slackMemberId: userData.user_metadata?.slack_member_id || localStorage.getItem('slack_member_id') || '',
                            photoURL: userData.user_metadata?.avatar_url || userData.user_metadata?.photo_url || '',
                            accessToken: session.access_token
                        })
                    } else {
                        localStorage.removeItem(SESSION_KEY)
                    }
                }
            } catch (e) {
                console.error('Session restore failed:', e)
                localStorage.removeItem(SESSION_KEY)
            }
            setLoading(false)
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
