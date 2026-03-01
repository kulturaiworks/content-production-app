// ============================================================
// TemplateContext — Supabase-driven templates with hardcoded fallback
// ============================================================
// Flow:
// 1. App loads → state initialized from hardcoded mediaData.js (instant)
// 2. useEffect → fetch from Supabase
// 3. If Supabase has data → update state (re-renders all consumers)
// 4. If Supabase is empty → auto-seed from hardcoded data, then re-fetch
// 5. If Supabase fails → keep hardcoded data (already working)
// ============================================================

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
    TEMPLATES as FALLBACK_TEMPLATES,
    MEDIA_LIST as FALLBACK_MEDIA_LIST,
    MEDIA_PERSONAS as FALLBACK_PERSONAS,
    UNIVERSAL_TEMPLATES as FALLBACK_UNIVERSAL,
    getVisibleFields,
    getFieldLabel
} from '../data/mediaData'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

const TemplateContext = createContext(null)

const supaHeaders = (extra = {}) => ({
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    ...extra
})

// ---- Provider Component ----
export function TemplateProvider({ children }) {
    const [templates, setTemplates] = useState(FALLBACK_TEMPLATES)
    const [universalTemplates, setUniversalTemplates] = useState(FALLBACK_UNIVERSAL)
    const [mediaList, setMediaList] = useState(FALLBACK_MEDIA_LIST)
    const [mediaPersonas, setMediaPersonas] = useState(FALLBACK_PERSONAS)
    const [loading, setLoading] = useState(true)
    const [source, setSource] = useState('hardcoded')

    // Transform a Supabase row → app template format
    const rowToTemplate = (row) => ({
        id: row.template_id,
        display_name: row.display_name,
        backend_value: row.backend_value,
        type_category: row.type_category,
        preview_image: row.preview_image,
        asset_config: row.asset_config
    })

    // ---- Supabase Fetch Functions ----
    const fetchTemplatesFromDB = async () => {
        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/templates?select=*&order=sort_order`,
            { headers: supaHeaders() }
        )
        if (!res.ok) throw new Error(`Templates fetch failed: ${res.status}`)
        return await res.json()
    }

    const fetchMediaFromDB = async () => {
        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/media?select=*&order=sort_order`,
            { headers: supaHeaders() }
        )
        if (!res.ok) throw new Error(`Media fetch failed: ${res.status}`)
        return await res.json()
    }

    // ---- Process fetched data into state ----
    const processTemplateData = (rows) => {
        const grouped = {}
        const universal = []

        rows.forEach(row => {
            const t = rowToTemplate(row)
            if (row.is_universal) {
                universal.push(t)
            } else {
                if (!grouped[row.media_name]) grouped[row.media_name] = []
                grouped[row.media_name].push(t)
            }
        })

        setTemplates(grouped)
        setUniversalTemplates(universal)
        setSource('supabase')
    }

    const processMediaData = (rows) => {
        setMediaList(rows.map(m => m.name))
        const personas = {}
        rows.forEach(m => {
            if (m.voice || m.tone) {
                personas[m.name] = {
                    voice: m.voice || '',
                    tone: m.tone || '',
                    audience: m.audience || '',
                    style: m.style || '',
                    hashtag_style: m.hashtag_style || ''
                }
            }
        })
        if (Object.keys(personas).length > 0) setMediaPersonas(personas)
    }

    // ---- Seed to Supabase from hardcoded data ----
    const seedToSupabase = async () => {
        console.log('📦 Seeding data to Supabase from hardcoded mediaData.js...')

        // 1. Seed media
        const mediaRows = FALLBACK_MEDIA_LIST.map((name, idx) => ({
            name,
            voice: FALLBACK_PERSONAS[name]?.voice || null,
            tone: FALLBACK_PERSONAS[name]?.tone || null,
            audience: FALLBACK_PERSONAS[name]?.audience || null,
            style: FALLBACK_PERSONAS[name]?.style || null,
            hashtag_style: FALLBACK_PERSONAS[name]?.hashtag_style || null,
            sort_order: idx
        }))

        try {
            const mRes = await fetch(`${SUPABASE_URL}/rest/v1/media`, {
                method: 'POST',
                headers: supaHeaders({ 'Prefer': 'return=minimal' }),
                body: JSON.stringify(mediaRows)
            })
            console.log(`  Media seed: ${mRes.ok ? '✅' : '❌'} (${mediaRows.length} rows)`)
        } catch (e) {
            console.warn('  Media seed skipped:', e.message)
        }

        // 2. Seed templates
        const templateRows = []

        // Universal templates
        FALLBACK_UNIVERSAL.forEach((t, idx) => {
            templateRows.push({
                template_id: t.id,
                media_name: '__universal__',
                display_name: t.display_name,
                backend_value: t.backend_value,
                type_category: t.type_category,
                preview_image: t.preview_image || null,
                asset_config: t.asset_config || null,
                is_universal: true,
                sort_order: idx
            })
        })

        // Media-specific templates
        Object.entries(FALLBACK_TEMPLATES).forEach(([mediaName, tmpls]) => {
            tmpls.forEach((t, idx) => {
                templateRows.push({
                    template_id: t.id,
                    media_name: mediaName,
                    display_name: t.display_name,
                    backend_value: t.backend_value,
                    type_category: t.type_category,
                    preview_image: t.preview_image || null,
                    asset_config: t.asset_config || null,
                    is_universal: false,
                    sort_order: idx
                })
            })
        })

        const tRes = await fetch(`${SUPABASE_URL}/rest/v1/templates`, {
            method: 'POST',
            headers: supaHeaders({ 'Prefer': 'return=minimal' }),
            body: JSON.stringify(templateRows)
        })

        if (!tRes.ok) {
            const errText = await tRes.text()
            throw new Error(`Template seed failed: ${errText}`)
        }

        console.log(`  Templates seed: ✅ (${templateRows.length} rows)`)
        return { media: mediaRows.length, templates: templateRows.length }
    }

    // ---- Main load on mount ----
    useEffect(() => {
        const load = async () => {
            if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
                console.warn('⚠️ Supabase not configured, using hardcoded templates')
                setLoading(false)
                return
            }

            try {
                // Fetch templates
                let tData = await fetchTemplatesFromDB()

                // Auto-seed if table is empty
                if (tData.length === 0) {
                    console.log('📦 Empty templates table detected — auto-seeding...')
                    try {
                        await seedToSupabase()
                        tData = await fetchTemplatesFromDB()
                    } catch (seedErr) {
                        console.warn('⚠️ Auto-seed failed:', seedErr.message)
                        console.warn('  Make sure you ran the SQL setup first!')
                    }
                }

                if (tData.length > 0) {
                    processTemplateData(tData)
                    console.log(`✅ Loaded ${tData.length} templates from Supabase`)
                }

                // Fetch media
                try {
                    const mData = await fetchMediaFromDB()
                    if (mData.length > 0) {
                        processMediaData(mData)
                        console.log(`✅ Loaded ${mData.length} media from Supabase`)
                    }
                } catch (e) {
                    console.warn('⚠️ Media fetch failed, using hardcoded:', e.message)
                }

            } catch (err) {
                console.warn('⚠️ Template fetch failed, using hardcoded data:', err.message)
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [])

    // ---- Memoized getTemplatesForMedia ----
    const getTemplatesForMediaFn = useCallback((mediaName) => {
        const specific = templates[mediaName] || []
        return [...specific, ...universalTemplates]
    }, [templates, universalTemplates])

    // ---- Re-fetch (for manual refresh) ----
    const refreshFromDB = useCallback(async () => {
        try {
            setLoading(true)
            const tData = await fetchTemplatesFromDB()
            if (tData.length > 0) processTemplateData(tData)
            const mData = await fetchMediaFromDB()
            if (mData.length > 0) processMediaData(mData)
        } catch (e) {
            console.warn('Refresh failed:', e.message)
        } finally {
            setLoading(false)
        }
    }, [])

    const value = {
        // Data
        templates,
        mediaList,
        mediaPersonas,
        universalTemplates,
        // State
        loading,
        source,
        // Functions (same API as mediaData.js)
        getTemplatesForMedia: getTemplatesForMediaFn,
        getVisibleFields,
        getFieldLabel,
        // Admin
        seedToSupabase,
        refreshFromDB
    }

    return (
        <TemplateContext.Provider value={value}>
            {children}
        </TemplateContext.Provider>
    )
}

// ---- Hook ----
export function useTemplates() {
    const ctx = useContext(TemplateContext)
    if (!ctx) {
        // Fallback for components rendered outside provider
        console.warn('useTemplates() used outside TemplateProvider — using hardcoded data')
        return {
            templates: FALLBACK_TEMPLATES,
            mediaList: FALLBACK_MEDIA_LIST,
            mediaPersonas: FALLBACK_PERSONAS,
            universalTemplates: FALLBACK_UNIVERSAL,
            loading: false,
            source: 'hardcoded',
            getTemplatesForMedia: (name) => {
                const specific = FALLBACK_TEMPLATES[name] || []
                return [...specific, ...FALLBACK_UNIVERSAL]
            },
            getVisibleFields,
            getFieldLabel,
            seedToSupabase: () => Promise.reject('No provider'),
            refreshFromDB: () => Promise.reject('No provider')
        }
    }
    return ctx
}
