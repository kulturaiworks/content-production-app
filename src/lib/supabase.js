// Supabase REST API Client
// Using fetch instead of SDK to avoid additional dependencies

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// Headers for Supabase API
const getHeaders = () => ({
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
})

// Validate that a record ID looks like a valid UUID or numeric ID
function isValidRecordId(recordId) {
    if (!recordId || typeof recordId !== 'string') return false
    // Check for n8n expression remnants
    if (recordId.includes('$json') || recordId.includes('{{') || recordId.includes('}}')) return false
    if (recordId.startsWith('=')) return false
    // Should be a UUID or a numeric ID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const numericRegex = /^\d+$/
    return uuidRegex.test(recordId.trim()) || numericRegex.test(recordId.trim())
}

// Fetch a single row by ID
export async function getProductionStatus(recordId) {
    try {
        const cleanId = recordId?.trim()
        const url = `${SUPABASE_URL}/rest/v1/content_queue?id=eq.${cleanId}&select=id,status,output_url`

        console.log('📡 Fetching:', url)

        const response = await fetch(url, { headers: getHeaders() })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('❌ Supabase HTTP error:', response.status, errorText)
            throw new Error(`Supabase error: ${response.status} - ${errorText}`)
        }

        const data = await response.json()
        console.log('📡 Supabase returned:', data)
        return data[0] || null
    } catch (error) {
        console.error('Error fetching production status:', error)
        return null
    }
}

// Fetch the most recent record (fallback when record_id is invalid)
export async function getMostRecentRecord(editorEmail) {
    try {
        const url = `${SUPABASE_URL}/rest/v1/content_queue?order=created_at.desc&limit=1&select=id,status,output_url,created_at`
            + (editorEmail ? `&editor_email=eq.${encodeURIComponent(editorEmail)}` : '')

        console.log('📡 Fetching most recent record:', url)

        const response = await fetch(url, { headers: getHeaders() })

        if (!response.ok) {
            throw new Error(`Supabase error: ${response.status}`)
        }

        const data = await response.json()
        console.log('📡 Most recent record:', data)
        return data[0] || null
    } catch (error) {
        console.error('Error fetching most recent record:', error)
        return null
    }
}

// Poll for status changes (Production / Render)
export function startStatusPolling(recordId, onStatusChange, options = {}) {
    const {
        interval = 3000,        // Poll every 3 seconds
        timeout = 300000,       // Timeout after 5 minutes
        onTimeout = null,
        onError = null,
        editorEmail = null      // For fallback polling
    } = options

    let pollCount = 0
    const maxPolls = Math.ceil(timeout / interval)
    let intervalId = null
    let useFallback = false
    let fallbackRecordId = null

    // Check if recordId is valid
    const validId = isValidRecordId(String(recordId))
    if (!validId) {
        console.warn('⚠️ Invalid record_id detected:', JSON.stringify(recordId), '- Will use fallback polling by most recent record')
        useFallback = true
    } else {
        console.log('✅ Valid record_id:', recordId)
    }

    const poll = async () => {
        try {
            pollCount++
            if (pollCount > maxPolls) {
                console.warn('⏳ Polling timed out')
                stopPolling()
                if (onTimeout) onTimeout()
                return
            }

            let statusData = null

            if (useFallback) {
                // Poll most recent record
                statusData = await getMostRecentRecord(editorEmail)
                // If found, lock onto this ID
                if (statusData && statusData.id) {
                    if (!fallbackRecordId) {
                        console.log('🔒 Locking onto record ID:', statusData.id)
                        fallbackRecordId = statusData.id
                    } else if (fallbackRecordId !== statusData.id) {
                        // Ignore other records
                        statusData = null
                    }
                }
            } else {
                // Standard poll by ID
                statusData = await getProductionStatus(recordId)
            }

            if (statusData) {
                // Call callback with status
                onStatusChange(statusData.status, statusData.output_url)

                // Stop if completed or failed
                if (['DONE', 'ERROR', 'FAILED', 'COMPLETED'].includes(statusData.status?.toUpperCase())) {
                    console.log('✅ Job finished:', statusData.status)
                    stopPolling()
                }
            }
        } catch (err) {
            console.error('Polling error:', err)
            if (onError) onError(err)
        }
    }

    // Start polling
    console.log('🚀 Starting polling...')
    intervalId = setInterval(poll, interval)
    poll() // Initial check

    const stopPolling = () => {
        if (intervalId) {
            console.log('🛑 Stopping polling')
            clearInterval(intervalId)
            intervalId = null
        }
    }

    return stopPolling
}

// ==========================================
// NEW: Clipper Analysis Polling (Job Buffer)
// ==========================================

// Fetch Clipper Job Status
export async function getClipperJob(jobId) {
    try {
        const cleanId = jobId?.trim()
        // Select status, clips_result, and potential error message
        const url = `${SUPABASE_URL}/rest/v1/clipper_analysis_jobs?id=eq.${cleanId}&select=id,status,clips_result,error_message`

        const response = await fetch(url, { headers: getHeaders() })

        if (!response.ok) throw new Error(`Supabase error: ${response.status}`)

        const data = await response.json()
        return data[0] || null
    } catch (error) {
        console.error('Error fetching clipper job:', error)
        return null
    }
}

// Poll Clipper Job until Completed
export function pollClipperJob(jobId, onComplete, onError) {
    const interval = 3000 // 3 seconds
    const timeout = 600000 // 10 minutes timeout (Analysis can be slow)
    let pollCount = 0
    const maxPolls = Math.ceil(timeout / interval)
    let intervalId = null

    console.log('🚀 Starting Clipper Analysis Polling for Job:', jobId)

    const poll = async () => {
        pollCount++
        if (pollCount > maxPolls) {
            stop()
            onError(new Error('Analysis timed out (10 mins limit). Please check Supabase manually.'))
            return
        }

        const job = await getClipperJob(jobId)

        if (job) {
            const status = job.status?.toUpperCase()
            console.log(`📡 Job ${jobId} status: ${status}`)

            if (status === 'COMPLETED') {
                stop()
                onComplete(job.clips_result) // Return the JSON result
            } else if (status === 'FAILED' || status === 'ERROR') {
                stop()
                onError(new Error(job.error_message || 'Analysis failed on server.'))
            }
            // If ANALYZING, continue polling
        } else {
            // Job not found yet? (Might be replication lag)
            console.warn(`Job ${jobId} not found, retrying...`)
        }
    }

    intervalId = setInterval(poll, interval)
    poll() // Initial check

    const stop = () => {
        if (intervalId) clearInterval(intervalId)
    }

    return stop // Return cancel function
}

// ==========================================
// Data Fetching Functions (Dashboard, History, Profile)
// ==========================================

// Dashboard: aggregated stats for a user
export async function getDashboardData(editorEmail) {
    try {
        const url = `${SUPABASE_URL}/rest/v1/content_queue?select=id,status,content_type,ip_media,output_url,created_at`
            + (editorEmail ? `&editor_email=eq.${encodeURIComponent(editorEmail)}` : '')
            + '&order=created_at.desc&limit=500'

        const response = await fetch(url, { headers: getHeaders() })
        if (!response.ok) throw new Error(`Supabase error: ${response.status}`)
        const rows = await response.json()

        const total = rows.length
        const done = rows.filter(r => ['DONE', 'COMPLETED'].includes(r.status?.toUpperCase())).length
        const today = new Date().toDateString()
        const completedToday = rows.filter(r =>
            ['DONE', 'COMPLETED'].includes(r.status?.toUpperCase()) &&
            new Date(r.created_at).toDateString() === today
        ).length
        const totalImages = rows.filter(r => {
            const ct = (r.content_type || '').toLowerCase()
            return ct === 'image' || ct.includes('image') || ct === 'article'
        }).length
        const totalVideos = rows.filter(r => {
            const ct = (r.content_type || '').toLowerCase()
            return ct === 'video' || ct.includes('video') || ct === 'clipper'
        }).length

        // Media breakdown
        const mediaCounts = {}
        const colors = ['#1d9bf0', '#f91880', '#00ba7c', '#ffd400', '#7856ff', '#ff6b35']
        rows.forEach(r => {
            const m = r.ip_media || 'Unknown'
            mediaCounts[m] = (mediaCounts[m] || 0) + 1
        })
        const mediaStats = Object.entries(mediaCounts).map(([name, count], i) => ({
            name, count, color: colors[i % colors.length]
        }))

        // Weekly data (last 7 days)
        const weeklyData = []
        for (let i = 6; i >= 0; i--) {
            const d = new Date()
            d.setDate(d.getDate() - i)
            const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' })
            const dateStr = d.toDateString()
            const productions = rows.filter(r => new Date(r.created_at).toDateString() === dateStr).length
            weeklyData.push({ day: dayStr, productions })
        }

        // Recent 5
        const recent = rows.slice(0, 5).map(r => ({
            id: r.id, media: r.ip_media || '-', type: r.content_type || '-',
            status: r.status, time: new Date(r.created_at).toLocaleString('id-ID')
        }))

        return { total, done, completedToday, totalImages, totalVideos, mediaStats, weeklyData, recent }
    } catch (error) {
        console.error('Error fetching dashboard data:', error)
        return null
    }
}

// History: paginated production records
export async function getProductionHistory(editorEmail, limit = 100) {
    try {
        const url = `${SUPABASE_URL}/rest/v1/content_queue?select=id,status,content_type,ip_media,output_url,created_at`
            + (editorEmail ? `&editor_email=eq.${encodeURIComponent(editorEmail)}` : '')
            + `&order=created_at.desc&limit=${limit}`

        const response = await fetch(url, { headers: getHeaders() })
        if (!response.ok) throw new Error(`Supabase error: ${response.status}`)
        return await response.json()
    } catch (error) {
        console.error('Error fetching production history:', error)
        return []
    }
}

// Profile: user statistics
export async function getUserStats(editorEmail) {
    try {
        const url = `${SUPABASE_URL}/rest/v1/content_queue?select=id,status,content_type`
            + (editorEmail ? `&editor_email=eq.${encodeURIComponent(editorEmail)}` : '')

        const response = await fetch(url, { headers: getHeaders() })
        if (!response.ok) throw new Error(`Supabase error: ${response.status}`)
        const rows = await response.json()

        const total = rows.length
        const done = rows.filter(r => ['DONE', 'COMPLETED'].includes(r.status?.toUpperCase())).length
        const inProgress = rows.filter(r => !['DONE', 'COMPLETED', 'ERROR', 'FAILED'].includes(r.status?.toUpperCase())).length
        const error = rows.filter(r => ['ERROR', 'FAILED'].includes(r.status?.toUpperCase())).length

        const byContentType = {}
        rows.forEach(r => {
            const ct = r.content_type || 'Unknown'
            byContentType[ct] = (byContentType[ct] || 0) + 1
        })

        return { total, done, inProgress, error, byContentType }
    } catch (error) {
        console.error('Error fetching user stats:', error)
        return null
    }
}

// ==========================================
// Authentication Functions
// ==========================================================

export async function supabaseSignIn(email, password) {
    const url = `${SUPABASE_URL}/auth/v1/token?grant_type=password`
    const response = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, password })
    })

    if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error_description || err.msg || 'Login failed')
    }

    return await response.json()
}

export async function supabaseRefreshToken(refreshToken) {
    const url = `${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`
    const headers = getHeaders()

    const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ refresh_token: refreshToken })
    })

    if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error_description || err.msg || 'Token refresh failed')
    }

    return await response.json()
}

export async function supabaseSignUp(email, password, name, slackMemberId) {
    const url = `${SUPABASE_URL}/auth/v1/signup`
    const body = {
        email,
        password,
        data: {
            name: name || email.split('@')[0],
            slack_member_id: slackMemberId || ''
        }
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body)
    })

    if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error_description || err.msg || 'Signup failed')
    }

    return await response.json()
}

export async function supabaseSignOut(accessToken) {
    const url = `${SUPABASE_URL}/auth/v1/logout`
    const headers = {
        ...getHeaders(),
        'Authorization': `Bearer ${accessToken}`
    }

    await fetch(url, { method: 'POST', headers })
    return { success: true }
}

export async function supabaseGetUser(accessToken) {
    const url = `${SUPABASE_URL}/auth/v1/user`
    const headers = {
        ...getHeaders(),
        'Authorization': `Bearer ${accessToken}`
    }

    const response = await fetch(url, { headers })

    if (!response.ok) return null
    return await response.json()
}

export async function supabaseUpdateUser(accessToken, updates) {
    const url = `${SUPABASE_URL}/auth/v1/user`
    const headers = {
        ...getHeaders(),
        'Authorization': `Bearer ${accessToken}`
    }

    // Map common updates to Supabase structure
    const body = { data: {} }
    if (updates.name) body.data.name = updates.name
    if (updates.slackMemberId) body.data.slack_member_id = updates.slackMemberId
    // Fix: Persist avatar/photo
    if (updates.photoURL) body.data.avatar_url = updates.photoURL
    if (updates.avatar_url) body.data.avatar_url = updates.avatar_url

    const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body)
    })

    if (!response.ok) {
        // const err = await response.json()
        throw new Error('Update failed')
    }

    return await response.json()
}

export async function supabaseResetPasswordForEmail(email) {
    const url = `${SUPABASE_URL}/auth/v1/recover`
    const headers = {
        ...getHeaders(),
    }

    const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email })
    })

    // Supabase returns 200 even if email doesn't exist (security)
    if (!response.ok) {
        throw new Error('Failed to send reset email')
    }

    return { success: true }
}

