import { createContext, useContext, useReducer, useRef, useCallback } from 'react'
import { startStatusPolling } from '../lib/supabase'

const ProductionContext = createContext()

const initialState = {
    status: 'ready', // ready | sending | producing | done | error
    outputUrl: null,
    currentJob: null,
    currentRecordId: null,
    error: null
}

function productionReducer(state, action) {
    switch (action.type) {
        case 'SET_STATUS':
            return { ...state, status: action.payload }
        case 'SET_OUTPUT':
            return { ...state, outputUrl: action.payload, status: 'done' }
        case 'SET_ERROR':
            return { ...state, error: action.payload, status: 'error' }
        case 'START_JOB':
            return {
                ...state,
                status: 'sending',
                currentJob: action.payload.job,
                currentRecordId: action.payload.recordId,
                error: null
            }
        case 'RESET':
            return initialState
        default:
            return state
    }
}

// Map Supabase status to app status
function mapSupabaseStatus(supabaseStatus) {
    const normalizedStatus = supabaseStatus?.trim()?.toUpperCase()
    console.log('🔄 mapSupabaseStatus - Input:', JSON.stringify(supabaseStatus), 'Normalized:', normalizedStatus)

    switch (normalizedStatus) {
        case 'IN PROGRESS':
        case 'IN_PROGRESS':
        case 'PROCESSING':
            return 'producing'
        case 'DONE':
        case 'COMPLETED':
        case 'SUCCESS':
            return 'done'
        case 'ERROR':
        case 'FAILED':
            return 'error'
        default:
            console.log('⚠️ Unknown status, defaulting to producing:', JSON.stringify(supabaseStatus))
            return 'producing' // Default to producing if unknown status
    }
}

export function ProductionProvider({ children }) {
    const [state, dispatch] = useReducer(productionReducer, initialState)
    const stopPollingRef = useRef(null)

    const setStatus = (status) => dispatch({ type: 'SET_STATUS', payload: status })
    const setOutput = (url) => dispatch({ type: 'SET_OUTPUT', payload: url })
    const setError = (error) => dispatch({ type: 'SET_ERROR', payload: error })

    const startJob = (job, recordId) => dispatch({
        type: 'START_JOB',
        payload: { job, recordId }
    })

    const reset = useCallback(() => {
        // Stop any active polling
        if (stopPollingRef.current) {
            stopPollingRef.current()
            stopPollingRef.current = null
        }
        dispatch({ type: 'RESET' })
    }, [])

    // Start polling Supabase for status updates
    const startPolling = useCallback((recordId, editorEmail = null) => {
        // Stop any existing polling
        if (stopPollingRef.current) {
            stopPollingRef.current()
        }

        console.log('🚀 Starting status polling for record:', recordId, '| Editor:', editorEmail)

        // Immediately set status to "producing" since INSERT already happened with "IN PROGRESS"
        setStatus('producing')

        stopPollingRef.current = startStatusPolling(
            recordId,
            // onStatusChange callback
            (supabaseStatus, outputUrl) => {
                console.log('📊 Supabase status:', supabaseStatus, '| Output URL:', outputUrl)
                const appStatus = mapSupabaseStatus(supabaseStatus)
                console.log('🔄 Status update:', supabaseStatus, '→', appStatus)

                if (appStatus === 'done') {
                    console.log('✅ Production complete!')
                    setOutput(outputUrl)
                } else if (appStatus === 'error') {
                    console.log('❌ Production failed!')
                    setError('Production failed')
                } else {
                    setStatus(appStatus)
                }
            },
            {
                interval: 3000,      // Poll every 3 seconds
                timeout: 300000,     // Timeout after 5 minutes
                editorEmail,         // For fallback polling
                onTimeout: () => {
                    console.log('⏰ Polling timeout reached')
                    setError('Production timeout - exceeded 5 minutes')
                },
                onError: (error) => {
                    console.error('🔴 Polling error:', error)
                    // Don't set error state for polling errors, just log
                }
            }
        )
    }, [])

    // Legacy simulate function (for demo/testing)
    const simulateProduction = async (jobData) => {
        startJob(jobData, null)

        // Sending phase
        await new Promise(resolve => setTimeout(resolve, 1500))
        setStatus('producing')

        // Producing phase
        await new Promise(resolve => setTimeout(resolve, 3000))

        // Random success/fail for demo
        if (Math.random() > 0.1) {
            setOutput('https://example.com/output/demo.jpg')
        } else {
            setError('Production failed. Please try again.')
        }
    }

    return (
        <ProductionContext.Provider value={{
            ...state,
            setStatus,
            setOutput,
            setError,
            startJob,
            reset,
            startPolling,
            simulateProduction
        }}>
            {children}
        </ProductionContext.Provider>
    )
}

export function useProduction() {
    const context = useContext(ProductionContext)
    if (!context) {
        throw new Error('useProduction must be used within ProductionProvider')
    }
    return context
}
