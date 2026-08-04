'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { fetchActiveRoutes } from '@/lib/supabase/services/routes'
import { useFeedingRoundStore } from '@/store/feeding-round-store'
import { useUser } from '@/hooks/use-user'

export default function RouteOverviewPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const { user } = useUser()
  const { data: routes } = useQuery({ queryKey: ['routes'], queryFn: fetchActiveRoutes })
  const { activeRound, startRound, openStation } = useFeedingRoundStore()

  const route = routes?.find(r => r.id === id)
  const isThisRouteActive = activeRound?.routeId === id && !activeRound.completedAt

  if (!route) {
    return (
      <div className="p-4 flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading route…</p>
      </div>
    )
  }

  function handleStartRound() {
    if (!user) return
    const roundId = startRound(route!.id, user.id)
    const firstStation = route!.route_stations[0]?.station
    if (firstStation) {
      openStation(firstStation.id)
      router.push(`/round/${roundId}/station/${firstStation.id}`)
    }
  }

  const hasDifferentActiveRound = activeRound && !activeRound.completedAt && activeRound.routeId !== id

  function handleContinueRound() {
    if (!activeRound) return
    const incomplete = route!.route_stations.find(rs =>
      !activeRound.stationStates[rs.station.id]?.completedAt
    )
    const target = incomplete?.station
    if (target) {
      openStation(target.id)
      router.push(`/round/${activeRound.id}/station/${target.id}`)
    } else {
      router.push(`/round/${activeRound.id}/complete`)
    }
  }

  const completedCount = isThisRouteActive
    ? route.route_stations.filter(rs =>
        activeRound?.stationStates[rs.station.id]?.completedAt
      ).length
    : 0

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="p-4 pt-6 pb-4 border-b border-border">
        <button onClick={() => router.back()} className="text-sm text-muted-foreground mb-3 flex items-center gap-1">
          ‹ Back
        </button>
        <h1 className="text-xl font-semibold">{route.name}</h1>
        {route.description && <p className="text-sm text-muted-foreground mt-1">{route.description}</p>}
        <p className="text-xs text-muted-foreground mt-2">{route.route_stations.length} stations</p>
      </div>

      {/* Start / continue button */}
      <div className="p-4">
        {isThisRouteActive ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-emerald-500">{completedCount} / {route.route_stations.length} complete</span>
            </div>
            <button
              onClick={handleContinueRound}
              className="w-full h-14 rounded-2xl bg-emerald-500 text-white font-semibold text-base active:scale-[0.98] transition-transform"
            >
              Continue round →
            </button>
            <button
              onClick={handleStartRound}
              className="w-full h-11 rounded-2xl border border-border text-muted-foreground font-medium text-sm active:scale-[0.98] transition-transform"
            >
              Start over
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {hasDifferentActiveRound && (
              <p className="text-xs text-amber-600 dark:text-amber-400 text-center pb-1">
                Starting this round will cancel the round in progress.
              </p>
            )}
            <button
              onClick={handleStartRound}
              disabled={!user}
              className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-semibold text-base active:scale-[0.98] transition-transform disabled:opacity-50"
            >
              Start round
            </button>
          </div>
        )}
      </div>

      {/* Station list */}
      <div className="px-4 space-y-2 pb-8">
        {route.route_stations.map((rs, index) => {
          const station = rs.station
          const stationState = activeRound?.stationStates[station.id]
          const isComplete = !!stationState?.completedAt
          const isVisited = !!stationState

          return (
            <div
              key={rs.id}
              className={`flex items-center gap-3 p-4 rounded-2xl border ${
                isComplete
                  ? 'border-emerald-500/40 bg-emerald-500/5'
                  : 'border-border bg-card'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                isComplete
                  ? 'bg-emerald-500 text-white'
                  : isVisited
                  ? 'bg-muted text-muted-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {isComplete ? '✓' : index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{station.name}</p>
                <p className="text-xs text-muted-foreground">{station.area}</p>
              </div>
              {isComplete && stationState && (
                <div className="text-xs text-muted-foreground flex gap-2">
                  {stationState.foodToppedUp && <span>🍽️</span>}
                  {stationState.waterToppedUp && <span>💧</span>}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
