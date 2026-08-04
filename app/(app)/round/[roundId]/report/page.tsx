'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useFeedingRoundStore } from '@/store/feeding-round-store'
import { fetchActiveRoutes } from '@/lib/supabase/services/routes'
import { fetchCatsByIds } from '@/lib/supabase/services/cats'
import { generateReport } from '@/lib/report/generator'

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
}

export default function ReportPage() {
  const { roundId } = useParams() as { roundId: string }
  const router = useRouter()
  const { activeRound, clearRound } = useFeedingRoundStore()
  const [reportText, setReportText] = useState('')
  const [shared, setShared] = useState(false)
  const [photoShared, setPhotoShared] = useState(false)
  const [newCatPhotos, setNewCatPhotos] = useState<NewCatPhoto[]>([])

  const { data: routes } = useQuery({ queryKey: ['routes'], queryFn: fetchActiveRoutes })

  const allSeenCatIds = activeRound
    ? [...new Set(Object.values(activeRound.stationStates).flatMap(s => s.seenCatIds))]
    : []

  const { data: seenCats } = useQuery({
    queryKey: ['seen-cats', allSeenCatIds],
    queryFn: () => fetchCatsByIds(allSeenCatIds),
    enabled: allSeenCatIds.length > 0,
  })

  useEffect(() => {
    if (!activeRound || !routes) return
    if (allSeenCatIds.length > 0 && !seenCats) return

    const route = routes.find(r => r.id === activeRound.routeId)
    if (!route) return

    const areaMap = new Map<string, { name: string; hasWelfareConcern: boolean; welfareNotes: string }[]>()
    const photos: NewCatPhoto[] = []

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
        areaMap.get(station.area)!.push({ name: cat.name, hasWelfareConcern: false, welfareNotes: '' })
        if (cat.photoDataUrl) photos.push({ catName: cat.name, dataUrl: cat.photoDataUrl })
      }
    }

    setNewCatPhotos(photos)

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
    const files = newCatPhotos.map((p, i) =>
      dataUrlToFile(p.dataUrl, `new-cat-${i + 1}.jpg`)
    )
    try {
      await navigator.share({ files, title: 'New cats seen today' })
      setPhotoShared(true)
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setPhotoShared(true)
      }
    }
  }

  function handleDone() {
    clearRound()
    router.push('/home')
  }

  return (
    <div className="max-w-lg mx-auto p-4 pt-6 pb-8">
      <h1 className="text-xl font-semibold mb-1">Your report</h1>
      <p className="text-sm text-muted-foreground mb-4">Review and edit before sharing</p>

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
              <div key={i} className="relative">
                <img
                  src={p.dataUrl}
                  alt={p.catName}
                  className="w-20 h-20 rounded-xl object-cover border border-border"
                />
                <p className="text-xs text-muted-foreground mt-1 max-w-[80px] truncate">{p.catName}</p>
              </div>
            ))}
          </div>
          <button
            onClick={handleSharePhotos}
            className="w-full h-12 rounded-2xl border border-border text-foreground font-medium text-sm active:scale-[0.98] transition-transform"
          >
            {photoShared ? '✓ Photos shared' : `📷 Share ${newCatPhotos.length} photo${newCatPhotos.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      )}

      <div className="mt-4 space-y-3">
        <button
          onClick={handleShare}
          className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-semibold text-base active:scale-[0.98] transition-transform"
        >
          {shared ? '✓ Copied / shared' : '📤 Share report'}
        </button>
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
