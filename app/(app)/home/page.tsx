'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { fetchActiveRoutes, type RouteStation } from '@/lib/supabase/services/routes'
import { useFeedingRoundStore } from '@/store/feeding-round-store'
import { usePreferencesStore } from '@/store/preferences-store'

export default function HomePage() {
  const router = useRouter()
  const [confirmCancel, setConfirmCancel] = useState(false)
  const { data: routes, isLoading, error } = useQuery({
    queryKey: ['routes'],
    queryFn: fetchActiveRoutes,
  })
  const { activeRound, clearRound } = useFeedingRoundStore()
  const { getStationOrder } = usePreferencesStore()

  const activeRoute = activeRound ? routes?.find(r => r.id === activeRound.routeId) : undefined

  function handleContinueTap() {
    if (!activeRound || !activeRoute) return
    const savedOrder = getStationOrder(activeRoute.id)
    let orderedStations: RouteStation[] = activeRoute.route_stations
    if (savedOrder) {
      const map = new Map(activeRoute.route_stations.map(rs => [rs.station.id, rs]))
      const ordered = savedOrder.map(sid => map.get(sid)).filter(Boolean) as RouteStation[]
      const inOrder = new Set(savedOrder)
      activeRoute.route_stations.forEach(rs => { if (!inOrder.has(rs.station.id)) ordered.push(rs) })
      orderedStations = ordered
    }
    // Walk the full route in order — covers stations never opened yet, not just
    // ones already in stationStates, so a partially-started round doesn't get
    // sent straight to the complete screen while stations remain unvisited.
    const incomplete = orderedStations.find(rs => !activeRound.stationStates[rs.station.id]?.completedAt)
    if (incomplete) {
      router.push(`/round/${activeRound.id}/station/${incomplete.station.id}`)
    } else {
      router.push(`/round/${activeRound.id}/complete`)
    }
  }

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="pt-4 pb-6">
        <p className="text-sm text-muted-foreground">{today}</p>
        <h1 className="text-2xl font-semibold mt-0.5">Feeding Rounds</h1>
      </div>

      {activeRound && !activeRound.completedAt && (
        <div className="mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 overflow-hidden">
          <div
            className="p-4 cursor-pointer"
            onClick={handleContinueTap}
          >
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-1">Round in progress</p>
            <p className="text-sm text-foreground">Tap to continue your current round →</p>
          </div>
          {confirmCancel ? (
            <div className="flex items-center gap-2 px-4 pb-4">
              <p className="text-xs text-muted-foreground flex-1">Cancel this round?</p>
              <button
                onClick={() => { clearRound(); setConfirmCancel(false) }}
                className="text-xs font-semibold text-red-500 px-3 py-1.5 rounded-lg border border-red-400/40"
              >
                Yes, cancel
              </button>
              <button
                onClick={() => setConfirmCancel(false)}
                className="text-xs text-muted-foreground px-3 py-1.5 rounded-lg border border-border"
              >
                Keep
              </button>
            </div>
          ) : (
            <div className="px-4 pb-3">
              <button
                onClick={() => setConfirmCancel(true)}
                className="text-xs text-muted-foreground underline underline-offset-2"
              >
                Cancel round
              </button>
            </div>
          )}
        </div>
      )}

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl border border-destructive/30 bg-destructive/10">
          <p className="text-sm text-destructive">Could not load routes. Check your connection.</p>
        </div>
      )}

      <div className="space-y-3">
        {routes?.map(route => {
          const stationCount = route.route_stations.length
          return (
            <button
              key={route.id}
              onClick={() => router.push(`/route/${route.id}`)}
              className="w-full text-left p-4 rounded-2xl border border-border bg-card active:scale-[0.98] transition-transform"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-base">{route.name}</h2>
                  {route.description && (
                    <p className="text-sm text-muted-foreground mt-0.5 truncate">{route.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {stationCount} station{stationCount !== 1 ? 's' : ''}
                  </p>
                </div>
                <span className="text-muted-foreground mt-0.5">›</span>
              </div>
            </button>
          )
        })}
      </div>

      {routes?.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">🗺️</p>
          <p className="text-muted-foreground text-sm">No active routes found.</p>
          <p className="text-muted-foreground text-xs mt-1">Ask your admin to set up a route.</p>
        </div>
      )}
    </div>
  )
}
