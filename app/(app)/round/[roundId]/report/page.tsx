'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useFeedingRoundStore } from '@/store/feeding-round-store'
import { fetchActiveRoutes } from '@/lib/supabase/services/routes'
import { fetchCatsByIds } from '@/lib/supabase/services/cats'
import { generateReport } from '@/lib/report/generator'
import { syncCompletedRound } from '@/lib/supabase/services/sync'
import { getPhotos, deletePhotos } from '@/lib/db/photo-store'

function dataUrlToFile(dataUrl: string, filename: string): File {
  const [header, data] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg'
  const bytes = atob(data)
  const arr = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
  return new File([arr], filename, { type: mime })
}

interface NewCatPhoto {
  catName: string
  dataUrl: string
  photoKey: string
}

// Rounds started before the IndexedDB rewrite stored the photo directly as a data URL on
// the cat record. Old localStorage data with that shape can still be sitting on a device —
// fall back to it so in-progress rounds from before the update don't silently lose photos.
type LegacyAdditionalCat = { photoDataUrl?: string }

export default function ReportPage() {
  const { roundId } = useParams() as { roundId: string }
  const router = useRouter()
  const { activeRound, hasHydrated, clearRound, setSyncStatus } = useFeedingRoundStore()
  const [reportText, setReportText] = useState('')
  const [shared, setShared] = useState(false)
  const [photoShared, setPhotoShared] = useState(false)
  const [photoShareError, setPhotoShareError] = useState(false)
  const [photoMap, setPhotoMap] = useState<Record<string, string>>({})
  const [retrying, setRetrying] = useState(false)

  const { data: routes } = useQuery({ queryKey: ['routes'], queryFn: fetchActiveRoutes })

  const allSeenCatIds = activeRound
    ? [...new Set(Object.values(activeRound.stationStates).flatMap(s => s.seenCatIds))]
    : []

  const { data: seenCats, error: seenCatsError, refetch: refetchSeenCats } = useQuery({
    queryKey: ['seen-cats', allSeenCatIds],
    queryFn: () => fetchCatsByIds(allSeenCatIds),
    enabled: allSeenCatIds.length > 0,
  })

  // additionalCats normally carry a photoKey (IndexedDB reference) — resolve to data URLs
  // for display/share. Cats from a pre-rewrite round may only have a legacy photoDataUrl.
  const additionalCatsWithPhotos = useMemo(() => {
    if (!activeRound) return []
    return Object.values(activeRound.stationStates).flatMap(s =>
      (s.additionalCats ?? []).filter(c => c.photoKey || (c as LegacyAdditionalCat).photoDataUrl)
    )
  }, [activeRound])
  const photoKeys = useMemo(
    () => additionalCatsWithPhotos.filter(c => c.photoKey).map(c => c.photoKey!).sort(),
    [additionalCatsWithPhotos]
  )

  useEffect(() => {
    // Nothing to fetch — downstream lookups are keyed off the current additionalCats list,
    // so a stale/unset photoMap for an empty key set is harmless.
    if (photoKeys.length === 0) return
    let cancelled = false
    getPhotos(photoKeys).then(map => { if (!cancelled) setPhotoMap(map) })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoKeys.join(',')])

  const newCatPhotos: NewCatPhoto[] = additionalCatsWithPhotos
    .map(c => {
      const dataUrl = c.photoKey ? photoMap[c.photoKey] : (c as LegacyAdditionalCat).photoDataUrl
      return dataUrl ? { catName: c.name, dataUrl, photoKey: c.photoKey ?? c.id } : null
    })
    .filter((p): p is NewCatPhoto => p !== null)

  const shareFiles = useMemo(
    () => newCatPhotos.map((p, i) => dataUrlToFile(p.dataUrl, `new-cat-${i + 1}.jpg`)),
    [newCatPhotos]
  )

  // Safe to touch `navigator` unguarded here: shareFiles is only non-empty once photos have
  // loaded from IndexedDB (an effect-driven, client-only state update), so this branch can
  // never run during server rendering or the first client render.
  const canCombinedShare = shareFiles.length > 0 && !!navigator.share &&
    (!navigator.canShare || navigator.canShare({ text: reportText, files: shareFiles, title: 'Cat Feeding Report' }))

  useEffect(() => {
    if (!activeRound || !routes) return
    if (allSeenCatIds.length > 0 && !seenCats) return

    const route = routes.find(r => r.id === activeRound.routeId)
    if (!route) return

    const areaMap = new Map<string, { name: string; hasWelfareConcern: boolean; welfareNotes: string }[]>()

    for (const rs of route.route_stations) {
      const station = rs.station
      const stationState = activeRound.stationStates[station.id]
      if (!stationState) continue

      for (const catId of stationState.seenCatIds) {
        const cat = seenCats?.find(c => c.id === catId)
        if (!cat) continue
        if (!areaMap.has(station.area)) areaMap.set(station.area, [])
        const welfareNotes = stationState.welfare[catId] ?? ''
        areaMap.get(station.area)!.push({ name: cat.name, hasWelfareConcern: !!welfareNotes, welfareNotes })
      }

      for (const cat of stationState.additionalCats ?? []) {
        if (!areaMap.has(station.area)) areaMap.set(station.area, [])
        const welfareNotes = cat.welfareNotes ?? ''
        areaMap.get(station.area)!.push({ name: cat.name, hasWelfareConcern: !!welfareNotes, welfareNotes })
      }
    }

    const stationEntries = route.route_stations.map(rs => {
      const state = activeRound.stationStates[rs.station.id]
      return {
        name: rs.station.name,
        foodLevel: state?.foodLevel ?? null,
        foodToppedUp: state?.foodToppedUp ?? false,
        waterToppedUp: state?.waterToppedUp ?? false,
      }
    })

    const stationNotes = route.route_stations.flatMap(rs => {
      const note = activeRound.stationStates[rs.station.id]?.notes?.trim()
      return note ? [{ stationName: rs.station.name, note }] : []
    })

    const text = generateReport({
      areas: [...areaMap.entries()].map(([area, cats]) => ({ area, cats })),
      roundNotes: activeRound.notes?.trim() ?? '',
      stationNotes,
      roundType: route.round_type,
      startedAt: activeRound.startedAt,
      completedAt: activeRound.completedAt,
      stationEntries,
    })

    setReportText(text)
  }, [activeRound, routes, seenCats])

  const roundMissing = hasHydrated && (!activeRound || activeRound.id !== roundId)

  // Redirect from an effect, not during render — calling router.replace() directly in the
  // render body triggers React's "Cannot update a component while rendering a different
  // component" error, since it synchronously updates the router outside this component.
  useEffect(() => {
    if (roundMissing) router.replace('/home')
  }, [roundMissing, router])

  // Guarded after all hooks. Zustand's persist rehydrates localStorage asynchronously — on a
  // cold load (PWA relaunch, hard refresh) activeRound is briefly null even though the round
  // is on disk, so wait for hydration before deciding there's really nothing here.
  if (!hasHydrated || roundMissing || !activeRound) {
    return (
      <div className="p-4 text-center pt-20">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    )
  }

  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({ text: reportText, title: 'Cat Feeding Report' })
      } else {
        await navigator.clipboard.writeText(reportText)
      }
      setShared(true)
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        await navigator.clipboard.writeText(reportText).catch(() => {})
        setShared(true)
      }
    }
  }

  async function handleSharePhotos() {
    setPhotoShareError(false)
    const canUseWebShare = !!navigator.share && (!navigator.canShare || navigator.canShare({ files: shareFiles }))

    if (!canUseWebShare) {
      // No Web Share API (or it can't take files) — fall back to individual downloads
      // rather than silently claiming success.
      try {
        for (const file of shareFiles) {
          const url = URL.createObjectURL(file)
          const a = document.createElement('a')
          a.href = url
          a.download = file.name
          a.click()
          URL.revokeObjectURL(url)
        }
        setPhotoShared(true)
      } catch (err) {
        console.error('Photo download fallback failed:', err)
        setPhotoShareError(true)
      }
      return
    }

    try {
      await navigator.share({ files: shareFiles, title: 'New cats seen today' })
      setPhotoShared(true)
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      console.error('Photo share failed:', err)
      setPhotoShareError(true)
    }
  }

  // Attempts a single share carrying both the report text and the photos — feature-detected
  // via canCombinedShare, computed from the platform's own canShare() check. Falls back to
  // the two separate share buttons (handleShare / handleSharePhotos above) on any device that
  // doesn't support combining them, so this is purely additive.
  async function handleShareReportAndPhotos() {
    setPhotoShareError(false)
    try {
      await navigator.share({ text: reportText, files: shareFiles, title: 'Cat Feeding Report' })
      setShared(true)
      setPhotoShared(true)
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      console.error('Combined share failed:', err)
      setPhotoShareError(true)
    }
  }

  async function handleRetrySync() {
    setRetrying(true)
    setSyncStatus('syncing')
    try {
      await syncCompletedRound(activeRound!)
      setSyncStatus('synced')
    } catch (err) {
      console.error('Retry sync failed:', err)
      setSyncStatus('failed')
    }
    setRetrying(false)
  }

  async function handleDone() {
    const allPhotoKeys = Object.values(activeRound!.stationStates)
      .flatMap(s => (s.additionalCats ?? []).map(c => c.photoKey))
      .filter((k): k is string => !!k)
    await deletePhotos(allPhotoKeys)
    clearRound()
    router.push('/home')
  }

  return (
    <div className="max-w-lg mx-auto p-4 pt-6 pb-8">
      <h1 className="text-xl font-semibold mb-1">Your report</h1>
      <p className="text-sm text-muted-foreground mb-4">Review and edit before sharing</p>

      {activeRound.syncStatus === 'failed' && (
        <div className="mb-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
          <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
            ⚠️ This round hasn&apos;t saved to the server
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 mb-3">
            Your report text below is safe to share now — but the underlying data (cat sightings, food levels) is only on this device until sync succeeds.
          </p>
          <button
            onClick={handleRetrySync}
            disabled={retrying}
            className="text-xs font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/40 rounded-lg px-3 py-1.5 disabled:opacity-50"
          >
            {retrying ? 'Retrying…' : 'Retry sync'}
          </button>
        </div>
      )}

      {seenCatsError && (
        <div className="mb-4 p-4 rounded-2xl bg-destructive/10 border border-destructive/30">
          <p className="text-sm font-semibold text-destructive">Couldn&apos;t load cat names</p>
          <p className="text-xs text-muted-foreground mt-0.5 mb-3">
            The report below may be missing some cats seen this round. Check your connection and try again.
          </p>
          <button
            onClick={() => refetchSeenCats()}
            className="text-xs font-semibold text-destructive border border-destructive/40 rounded-lg px-3 py-1.5"
          >
            Retry
          </button>
        </div>
      )}

      <textarea
        value={reportText}
        onChange={e => setReportText(e.target.value)}
        className="w-full rounded-2xl border border-border bg-card px-4 py-4 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-ring"
        style={{ minHeight: '340px' }}
      />

      {newCatPhotos.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            New cat photos
          </p>
          <div className="flex gap-2 flex-wrap mb-3">
            {newCatPhotos.map((p, i) => (
              <div key={p.photoKey ?? i} className="relative">
                <img
                  src={p.dataUrl}
                  alt={p.catName}
                  className="w-20 h-20 rounded-xl object-cover border border-border"
                />
                <p className="text-xs text-muted-foreground mt-1 max-w-[80px] truncate">{p.catName}</p>
              </div>
            ))}
          </div>
          {!canCombinedShare && (
            <>
              <button
                onClick={handleSharePhotos}
                className="w-full h-12 rounded-2xl border border-border text-foreground font-medium text-sm active:scale-[0.98] transition-transform"
              >
                {photoShared ? '✓ Photos shared' : `📷 Share ${newCatPhotos.length} photo${newCatPhotos.length !== 1 ? 's' : ''}`}
              </button>
              {photoShareError && (
                <p className="text-xs text-destructive mt-1.5">Couldn&apos;t share photos — try again.</p>
              )}
            </>
          )}
        </div>
      )}

      <div className="mt-4 space-y-3">
        {canCombinedShare ? (
          <>
            <button
              onClick={handleShareReportAndPhotos}
              className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-semibold text-base active:scale-[0.98] transition-transform"
            >
              {shared && photoShared ? '✓ Shared' : `📤 Share report + ${newCatPhotos.length} photo${newCatPhotos.length !== 1 ? 's' : ''}`}
            </button>
            {photoShareError && (
              <p className="text-xs text-destructive text-center -mt-2">Couldn&apos;t share — try again.</p>
            )}
          </>
        ) : (
          <button
            onClick={handleShare}
            className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-semibold text-base active:scale-[0.98] transition-transform"
          >
            {shared ? '✓ Copied / shared' : '📤 Share report'}
          </button>
        )}
        <button
          onClick={handleDone}
          className="w-full h-12 rounded-2xl border border-border text-muted-foreground font-medium text-sm active:scale-[0.98] transition-transform"
        >
          Done — back to home
        </button>
      </div>
    </div>
  )
}
