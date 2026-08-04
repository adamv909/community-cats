'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useFeedingRoundStore } from '@/store/feeding-round-store'
import { fetchActiveRoutes } from '@/lib/supabase/services/routes'
import { fetchCatsByIds } from '@/lib/supabase/services/cats'
import { generateReport } from '@/lib/report/generator'

export default function ReportPage() {
  const { roundId } = useParams() as { roundId: string }
  const router = useRouter()
  const { activeRound, clearRound } = useFeedingRoundStore()
  const [reportText, setReportText] = useState('')
  const [shared, setShared] = useState(false)

  const { data: routes } = useQuery({ queryKey: ['routes'], queryFn: fetchActiveRoutes })

  // Collect all seen cat IDs across all stations
  const allSeenCatIds = activeRound
    ? [...new Set(Object.values(activeRound.stationStates).flatMap(s => s.seenCatIds))]
    : []

  const { data: seenCats } = useQuery({
    queryKey: ['seen-cats', allSeenCatIds],
    queryFn: () => fetchCatsByIds(allSeenCatIds),
    enabled: allSeenCatIds.length > 0,
  })

  useEffect(() => {
    if (!activeRound || !routes || !seenCats) return

    const route = routes.find(r => r.id === activeRound.routeId)
    if (!route) return

    // Build area → cats map from sightings
    const areaMap = new Map<string, { name: string; hasWelfareConcern: boolean; welfareNotes: string }[]>()

    for (const rs of route.route_stations) {
      const station = rs.station
      const stationState = activeRound.stationStates[station.id]
      if (!stationState) continue

      for (const catId of stationState.seenCatIds) {
        const cat = seenCats.find(c => c.id === catId)
        if (!cat) continue
        const area = station.area
        if (!areaMap.has(area)) areaMap.set(area, [])
        const welfareNotes = stationState.welfare[catId] ?? ''
        areaMap.get(area)!.push({
          name: cat.name,
          hasWelfareConcern: !!welfareNotes,
          welfareNotes,
        })
      }

      for (const cat of stationState.additionalCats ?? []) {
        const area = station.area
        if (!areaMap.has(area)) areaMap.set(area, [])
        areaMap.get(area)!.push({ name: cat.name, hasWelfareConcern: false, welfareNotes: '' })
      }
    }

    const stationStates = Object.values(activeRound.stationStates)
    const allFood = stationStates.every(s => s.foodToppedUp)
    const allWater = stationStates.every(s => s.waterToppedUp)
    const generalNotes = [
      activeRound.notes,
      ...stationStates.map(s => s.notes).filter(Boolean),
    ].filter(Boolean).join('\n')

    const stationFoodLevels = route.route_stations.map(rs => ({
      name: rs.station.name,
      foodLevel: (activeRound.stationStates[rs.station.id]?.foodLevel) ?? null,
    }))

    const text = generateReport({
      areas: [...areaMap.entries()].map(([area, cats]) => ({ area, cats })),
      generalNotes,
      allFoodToppedUp: allFood,
      allWaterToppedUp: allWater,
      roundType: route.round_type,
      startedAt: activeRound.startedAt,
      completedAt: activeRound.completedAt,
      stationFoodLevels,
    })

    setReportText(text)
  }, [activeRound, routes, seenCats])

  async function handleShare() {
    if (navigator.share) {
      await navigator.share({ text: reportText, title: 'Cat Feeding Report' })
      setShared(true)
    } else {
      await navigator.clipboard.writeText(reportText)
      setShared(true)
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
