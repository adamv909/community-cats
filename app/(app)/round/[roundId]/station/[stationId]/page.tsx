'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { fetchActiveRoutes } from '@/lib/supabase/services/routes'
import { fetchCatsByStation } from '@/lib/supabase/services/cats'
import { useFeedingRoundStore } from '@/store/feeding-round-store'
import { CatCard } from '@/components/feeding/CatCard'
import { WelfareConcernModal } from '@/components/feeding/WelfareConcernModal'

export default function StationChecklistPage() {
  const { roundId, stationId } = useParams() as { roundId: string; stationId: string }
  const router = useRouter()
  const [welfareCatId, setWelfareCatId] = useState<string | null>(null)

  const { data: routes } = useQuery({ queryKey: ['routes'], queryFn: fetchActiveRoutes })
  const { data: cats, isLoading: catsLoading } = useQuery({
    queryKey: ['cats', stationId],
    queryFn: () => fetchCatsByStation(stationId),
  })

  const {
    activeRound, openStation, toggleCatSeen,
    setFoodToppedUp, setWaterToppedUp, setStationNotes,
    setWelfareConcern, completeStation,
  } = useFeedingRoundStore()

  // Ensure station is open in the store
  if (activeRound && !activeRound.stationStates[stationId]) {
    openStation(stationId)
  }

  const stationState = activeRound?.stationStates[stationId]

  // Find station info and route context
  const route = routes?.find(r => r.id === activeRound?.routeId)
  const foodLabel = route?.round_type === 'morning' ? 'Dry food' : 'Wet food'
  const routeStations = route?.route_stations ?? []
  const currentIndex = routeStations.findIndex(rs => rs.station.id === stationId)
  const stationInfo = routeStations[currentIndex]?.station
  const nextStation = routeStations[currentIndex + 1]?.station
  const isLastStation = currentIndex === routeStations.length - 1

  const welfareCat = welfareCatId ? cats?.find(c => c.id === welfareCatId) : null

  function handleCompleteStation() {
    completeStation(stationId)
    if (isLastStation) {
      router.push(`/round/${roundId}/complete`)
    } else if (nextStation) {
      openStation(nextStation.id)
      router.push(`/round/${roundId}/station/${nextStation.id}`)
    }
  }

  function openInMaps() {
    if (!stationInfo) return
    const url = `https://maps.google.com/?q=${stationInfo.latitude},${stationInfo.longitude}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (!activeRound) {
    return (
      <div className="p-4 text-center pt-20">
        <p className="text-muted-foreground">No active round found.</p>
        <button onClick={() => router.push('/home')} className="mt-4 text-primary text-sm">Go home</button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto pb-8">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b border-border z-10 px-4 pt-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground font-medium">
              {stationInfo?.area} · Station {currentIndex + 1} of {routeStations.length}
            </p>
            <h1 className="font-semibold text-base leading-tight mt-0.5 truncate">
              {stationInfo?.name ?? 'Loading…'}
            </h1>
          </div>
          <button
            onClick={openInMaps}
            className="flex-shrink-0 flex items-center gap-1 text-xs text-primary border border-primary/30 rounded-lg px-2.5 py-1.5 mt-0.5"
          >
            Maps ↗
          </button>
        </div>

        {stationInfo?.access_notes && (
          <p className="text-xs text-muted-foreground mt-1.5 italic">{stationInfo.access_notes}</p>
        )}
      </div>

      <div className="px-4 pt-4 space-y-5">
        {/* Food & Water */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => stationState && setFoodToppedUp(stationId, !stationState.foodToppedUp)}
            className={`h-16 rounded-2xl border-2 font-semibold text-sm flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
              stationState?.foodToppedUp
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'border-border bg-card text-muted-foreground'
            }`}
          >
            <span className="text-xl">🍽️</span>
            <span>{foodLabel} {stationState?.foodToppedUp ? '✓' : ''}</span>
          </button>
          <button
            onClick={() => stationState && setWaterToppedUp(stationId, !stationState.waterToppedUp)}
            className={`h-16 rounded-2xl border-2 font-semibold text-sm flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
              stationState?.waterToppedUp
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'border-border bg-card text-muted-foreground'
            }`}
          >
            <span className="text-xl">💧</span>
            <span>Water {stationState?.waterToppedUp ? '✓' : ''}</span>
          </button>
        </div>

        {/* Cats */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Expected cats
            {stationState && stationState.seenCatIds.length > 0 && (
              <span className="ml-2 text-emerald-500">{stationState.seenCatIds.length} seen</span>
            )}
          </p>

          {catsLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map(i => <div key={i} className="aspect-square rounded-2xl bg-muted animate-pulse" />)}
            </div>
          ) : cats && cats.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {cats.map(cat => (
                <CatCard
                  key={cat.id}
                  cat={cat}
                  seen={stationState?.seenCatIds.includes(cat.id) ?? false}
                  hasWelfareConcern={!!stationState?.welfare[cat.id]}
                  onToggle={() => toggleCatSeen(stationId, cat.id)}
                  onWelfareConcern={() => setWelfareCatId(cat.id)}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-2">No cats assigned to this station yet.</p>
          )}
        </div>

        {/* Notes */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Notes</p>
          <textarea
            value={stationState?.notes ?? ''}
            onChange={e => setStationNotes(stationId, e.target.value)}
            placeholder="Any observations about this station…"
            className="w-full h-20 rounded-xl border border-border bg-card px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Complete */}
        <button
          onClick={handleCompleteStation}
          className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-semibold text-base active:scale-[0.98] transition-transform"
        >
          {isLastStation ? 'Complete round →' : 'Next station →'}
        </button>
      </div>

      {/* Welfare modal */}
      {welfareCatId && welfareCat && (
        <WelfareConcernModal
          catName={welfareCat.name}
          existingNotes={stationState?.welfare[welfareCatId] ?? ''}
          onSave={notes => { setWelfareConcern(stationId, welfareCatId, notes); setWelfareCatId(null) }}
          onClear={() => { setWelfareConcern(stationId, welfareCatId, null); setWelfareCatId(null) }}
          onClose={() => setWelfareCatId(null)}
        />
      )}
    </div>
  )
}
