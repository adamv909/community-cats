'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { fetchActiveRoutes } from '@/lib/supabase/services/routes'
import { useFeedingRoundStore } from '@/store/feeding-round-store'
import { usePreferencesStore } from '@/store/preferences-store'
import { useUser } from '@/hooks/use-user'

interface RouteStation {
  id: string
  station: { id: string; name: string; area: string }
}

function SortableStation({
  rs,
  index,
  isComplete,
  isEditing,
  stationState,
}: {
  rs: RouteStation
  index: number
  isComplete: boolean
  isEditing: boolean
  stationState: { completedAt: string | null; foodToppedUp: boolean; waterToppedUp: boolean } | undefined
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: rs.station.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-4 rounded-2xl border ${
        isComplete
          ? 'border-emerald-500/40 bg-emerald-500/5'
          : 'border-border bg-card'
      } ${isDragging ? 'shadow-lg' : ''}`}
    >
      {isEditing ? (
        <div
          {...attributes}
          {...listeners}
          className="w-8 h-8 flex items-center justify-center text-muted-foreground cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
          aria-label="Drag to reorder"
        >
          <svg width="16" height="20" viewBox="0 0 16 20" fill="currentColor">
            <circle cx="5" cy="4" r="1.8"/>
            <circle cx="11" cy="4" r="1.8"/>
            <circle cx="5" cy="10" r="1.8"/>
            <circle cx="11" cy="10" r="1.8"/>
            <circle cx="5" cy="16" r="1.8"/>
            <circle cx="11" cy="16" r="1.8"/>
          </svg>
        </div>
      ) : (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
          isComplete ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'
        }`}>
          {isComplete ? '✓' : index + 1}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{rs.station.name}</p>
        <p className="text-xs text-muted-foreground">{rs.station.area}</p>
      </div>
      {!isEditing && isComplete && stationState && (
        <div className="text-xs text-muted-foreground flex gap-2">
          {stationState.foodToppedUp && <span>🍽️</span>}
          {stationState.waterToppedUp && <span>💧</span>}
        </div>
      )}
    </div>
  )
}

export default function RouteOverviewPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const { user } = useUser()
  const { data: routes } = useQuery({ queryKey: ['routes'], queryFn: fetchActiveRoutes })
  const { activeRound, startRound, openStation } = useFeedingRoundStore()
  const { routeStationOrder, setStationOrder, clearStationOrder } = usePreferencesStore()

  const [isEditing, setIsEditing] = useState(false)
  const [draftOrder, setDraftOrder] = useState<string[] | null>(null)

  const route = routes?.find(r => r.id === id)
  const isThisRouteActive = activeRound?.routeId === id && !activeRound.completedAt
  const hasDifferentActiveRound = activeRound && !activeRound.completedAt && activeRound.routeId !== id

  const savedOrder = routeStationOrder[id] ?? null

  const orderedStations = useMemo(() => {
    if (!route) return []
    const order = isEditing ? draftOrder : savedOrder
    if (!order) return route.route_stations
    const map = new Map(route.route_stations.map(rs => [rs.station.id, rs]))
    const ordered = order.map(sid => map.get(sid)).filter(Boolean) as RouteStation[]
    // Append any new stations not in saved order
    const inOrder = new Set(order)
    route.route_stations.forEach(rs => {
      if (!inOrder.has(rs.station.id)) ordered.push(rs)
    })
    return ordered
  }, [route, savedOrder, draftOrder, isEditing])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
  )

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
    const firstStation = orderedStations[0]?.station
    if (firstStation) {
      openStation(firstStation.id)
      router.push(`/round/${roundId}/station/${firstStation.id}`)
    }
  }

  function handleContinueRound() {
    if (!activeRound) return
    const incomplete = orderedStations.find(rs =>
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

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const currentOrder = draftOrder ?? orderedStations.map(rs => rs.station.id)
    const oldIndex = currentOrder.indexOf(active.id as string)
    const newIndex = currentOrder.indexOf(over.id as string)
    setDraftOrder(arrayMove(currentOrder, oldIndex, newIndex))
  }

  function handleEditStart() {
    setDraftOrder(orderedStations.map(rs => rs.station.id))
    setIsEditing(true)
  }

  function handleSave() {
    if (draftOrder) setStationOrder(id, draftOrder)
    setIsEditing(false)
    setDraftOrder(null)
  }

  function handleCancel() {
    setIsEditing(false)
    setDraftOrder(null)
  }

  function handleReset() {
    clearStationOrder(id)
    setIsEditing(false)
    setDraftOrder(null)
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
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">{route.name}</h1>
            {route.description && <p className="text-sm text-muted-foreground mt-1">{route.description}</p>}
            <p className="text-xs text-muted-foreground mt-2">{route.route_stations.length} stations</p>
          </div>
          {!isEditing && (
            <button
              onClick={handleEditStart}
              className="text-sm text-muted-foreground underline underline-offset-2 mt-1 flex-shrink-0"
            >
              Edit order
            </button>
          )}
        </div>
      </div>

      {/* Start / continue button */}
      {!isEditing && (
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
      )}

      {/* Edit order header */}
      {isEditing && (
        <div className="px-4 py-3 flex items-center justify-between border-b border-border">
          <p className="text-sm text-muted-foreground">Drag to reorder stations</p>
          <div className="flex items-center gap-3">
            {savedOrder && (
              <button onClick={handleReset} className="text-sm text-muted-foreground">
                Reset
              </button>
            )}
            <button onClick={handleCancel} className="text-sm text-muted-foreground">
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="text-sm font-semibold text-emerald-500"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Station list */}
      <div className="px-4 space-y-2 pb-8 pt-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={orderedStations.map(rs => rs.station.id)}
            strategy={verticalListSortingStrategy}
          >
            {orderedStations.map((rs, index) => {
              const stationState = activeRound?.stationStates[rs.station.id]
              const isComplete = !!stationState?.completedAt

              return (
                <SortableStation
                  key={rs.station.id}
                  rs={rs}
                  index={index}
                  isComplete={isComplete}
                  isEditing={isEditing}
                  stationState={stationState}
                />
              )
            })}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  )
}
