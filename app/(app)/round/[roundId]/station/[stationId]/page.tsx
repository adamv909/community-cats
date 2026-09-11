'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { fetchActiveRoutes, fetchAreasForCluster } from '@/lib/supabase/services/routes'
import { reconcileStationOrder } from '@/lib/route-order'
import { fetchCatsByStation, fetchCatsByIds } from '@/lib/supabase/services/cats'
import { useFeedingRoundStore } from '@/store/feeding-round-store'
import { usePreferencesStore } from '@/store/preferences-store'
import { savePhoto, getPhotos, deletePhoto } from '@/lib/db/photo-store'
import { CatCard } from '@/components/feeding/CatCard'
import { WelfareConcernModal } from '@/components/feeding/WelfareConcernModal'
import { GuestCatModal } from '@/components/feeding/GuestCatModal'

export default function StationChecklistPage() {
  const { roundId, stationId } = useParams() as { roundId: string; stationId: string }
  const router = useRouter()
  const [welfareCatId, setWelfareCatId] = useState<string | null>(null)
  const [welfareAdditionalCatIndex, setWelfareAdditionalCatIndex] = useState<number | null>(null)
  const [showAddCat, setShowAddCat] = useState(false)
  const [showGuestModal, setShowGuestModal] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatPhoto, setNewCatPhoto] = useState<string | undefined>(undefined)
  const [addCatError, setAddCatError] = useState<string | null>(null)
  const [completionError, setCompletionError] = useState<string | null>(null)
  const [photoMap, setPhotoMap] = useState<Record<string, string>>({})
  const addCatInputRef = useRef<HTMLInputElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const addCatErrorRef = useRef<HTMLParagraphElement>(null)
  const completionErrorRef = useRef<HTMLParagraphElement>(null)

  // The bottom nav is fixed and can cover the tail end of the page — scroll error text into
  // the vertical center of the viewport rather than relying on it merely being in-flow above
  // the nav, since that clearance has been wrong before (see the pb-safe fix in globals.css).
  useEffect(() => {
    if (addCatError) addCatErrorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [addCatError])
  useEffect(() => {
    if (completionError) completionErrorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [completionError])

  const { data: routes } = useQuery({ queryKey: ['routes'], queryFn: fetchActiveRoutes })
  const { data: cats, isLoading: catsLoading } = useQuery({
    queryKey: ['cats', stationId],
    queryFn: () => fetchCatsByStation(stationId),
  })
  const {
    activeRound, hasHydrated, openStation, toggleCatSeen,
    setFoodToppedUp, setFoodLevel, setWaterToppedUp, setWetFoodToppedUp, setStationNotes,
    addAdditionalCat, removeAdditionalCat, setAdditionalCatWelfare,
    addGuestCat, removeGuestCat,
    setWelfareConcern, toggleAreaCovered, completeStation,
  } = useFeedingRoundStore()
  const { getStationOrder } = usePreferencesStore()

  // Ensure station is open in the store — done as an effect, not during render,
  // to avoid calling a state setter mid-render (React rule violation).
  useEffect(() => {
    if (activeRound && !activeRound.stationStates[stationId]) {
      openStation(stationId)
    }
  }, [activeRound, stationId, openStation])

  const stationState = activeRound?.stationStates[stationId]
  const guestCatIds = stationState?.guestCatIds ?? []
  const additionalCats = useMemo(() => stationState?.additionalCats ?? [], [stationState])

  const { data: guestCats = [] } = useQuery({
    queryKey: ['guest-cats', guestCatIds],
    queryFn: () => fetchCatsByIds(guestCatIds),
    enabled: guestCatIds.length > 0,
  })

  // Resolve additionalCats' photoKeys (IndexedDB) to displayable data URLs
  const photoKeys = useMemo(
    () => additionalCats.map(c => c.photoKey).filter((k): k is string => !!k),
    [additionalCats]
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

  // Find station info and route context
  const route = routes?.find(r => r.id === activeRound?.routeId)
  const isWetFoodRound = route?.round_type === 'evening'

  // Wet Food Round only — the "areas to cover" checklist for this cluster. Areas are
  // navigation prompts, not cat locations, so this is entirely separate from `cats` above.
  const { data: areas } = useQuery({
    queryKey: ['cluster-areas', stationId],
    queryFn: () => fetchAreasForCluster(stationId),
    enabled: isWetFoodRound,
  })
  const areasCovered = stationState?.areasCovered ?? []

  // Respect the volunteer's saved station order (route/[id] "Edit order"), not raw DB order
  const savedOrder = route ? getStationOrder(route.id) : null
  const orderedRouteStations = useMemo(() => {
    if (!route) return []
    if (!savedOrder) return route.route_stations
    return reconcileStationOrder(savedOrder, route.route_stations)
  }, [route, savedOrder])

  const currentIndex = orderedRouteStations.findIndex(rs => rs.station.id === stationId)
  // currentIndex === -1 means this station isn't part of the current route at all (e.g. the
  // route changed while this round was in progress). Every derived value below must stay
  // undefined/false in that case — in particular, orderedRouteStations[currentIndex + 1] at
  // currentIndex -1 would otherwise resolve to index 0, silently sending "Next" back to the
  // first station in the route.
  const stationNotInRoute = currentIndex === -1 && orderedRouteStations.length > 0
  const stationInfo = orderedRouteStations[currentIndex]?.station
  const prevStation = currentIndex === -1 ? undefined : orderedRouteStations[currentIndex - 1]?.station
  const nextStation = currentIndex === -1 ? undefined : orderedRouteStations[currentIndex + 1]?.station
  const isFirstStation = currentIndex <= 0
  const isLastStation = currentIndex !== -1 && currentIndex === orderedRouteStations.length - 1

  const expectedCatIds = (cats ?? []).map(c => c.id)
  const welfareCat = welfareCatId
    ? (cats?.find(c => c.id === welfareCatId) ?? guestCats.find(c => c.id === welfareCatId) ?? null)
    : null
  const welfareAdditionalCat = welfareAdditionalCatIndex !== null ? additionalCats[welfareAdditionalCatIndex] : null

  function handleCompleteStation() {
    // Current station isn't part of the route — nothing safe to validate, complete, or
    // advance to. See stationNotInRoute below, which fails safe in the UI for this case.
    if (currentIndex === -1) return
    if (route?.round_type === 'morning' && stationState!.foodLevel === null) {
      setCompletionError('Select the dry food level on arrival before continuing.')
      return
    }
    setCompletionError(null)
    // Wet Food Round has no separate food/water toggle — selecting a cat confirms both
    // were provided. Set the underlying flags here (still per-cluster, not per-cat) so
    // station_visits stays accurate: true if any cat was fed at this cluster, false if
    // the cluster was covered but nothing was seen.
    if (isWetFoodRound) {
      const anyCatSeen = stationState!.seenCatIds.length + (stationState!.additionalCats?.length ?? 0) > 0
      if (anyCatSeen) {
        setFoodToppedUp(stationId, true)
        setWaterToppedUp(stationId, true)
      }
    }
    completeStation(stationId)
    if (isLastStation) {
      router.push(`/round/${roundId}/complete`)
    } else if (nextStation) {
      openStation(nextStation.id)
      router.push(`/round/${roundId}/station/${nextStation.id}`)
    }
  }

  // Pure navigation — does not validate, complete, or otherwise touch feeding-round state.
  // openStation() is already a no-op for a station that's been visited before, so revisiting
  // preserves exactly what was there.
  function handlePrevious() {
    if (!prevStation) return
    openStation(prevStation.id)
    router.push(`/round/${roundId}/station/${prevStation.id}`)
  }

  async function handleAddCat() {
    const name = newCatName.trim()
    if (!name && !newCatPhoto) { setShowAddCat(false); return }
    if (!name) { setAddCatError('Add a name or short description for this cat.'); return }
    if (!newCatPhoto) { setAddCatError('Take a photo of this cat before adding it.'); return }
    setAddCatError(null)
    const photoKey = await savePhoto(newCatPhoto)
    addAdditionalCat(stationId, { name, photoKey })
    setNewCatName('')
    setNewCatPhoto(undefined)
    setShowAddCat(false)
  }

  async function handleRemoveAdditionalCat(index: number) {
    const cat = additionalCats[index]
    if (cat?.photoKey) await deletePhoto(cat.photoKey)
    removeAdditionalCat(stationId, index)
  }

  // Zustand's persist rehydrates localStorage asynchronously — on a cold load (PWA relaunch,
  // hard refresh) activeRound is briefly null even though the round is on disk, so wait for
  // hydration before showing "no round found" (which would otherwise flash incorrectly on
  // every refresh).
  if (!hasHydrated) {
    return (
      <div className="p-4 text-center pt-20">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    )
  }

  if (!activeRound) {
    return (
      <div className="p-4 text-center pt-20">
        <p className="text-muted-foreground">No active round found.</p>
        <button onClick={() => router.push('/home')} className="mt-4 text-primary text-sm">Go home</button>
      </div>
    )
  }

  if (!stationState) {
    return (
      <div className="p-4 text-center pt-20">
        <p className="text-muted-foreground text-sm">Loading station…</p>
      </div>
    )
  }

  // Route data has loaded and has stations, but this one isn't among them (e.g. the route
  // changed while this round was in progress). Fail safely rather than guessing a
  // destination — no auto-navigation, no validation, no completion.
  if (stationNotInRoute) {
    return (
      <div className="p-4 text-center pt-20">
        <p className="text-muted-foreground">This station isn&apos;t part of the current route anymore.</p>
        {route && (
          <button onClick={() => router.push(`/route/${route.id}`)} className="mt-4 text-primary text-sm">
            Back to route overview
          </button>
        )}
      </div>
    )
  }

  const totalSeen = stationState.seenCatIds.length + additionalCats.length

  return (
    <div className="max-w-lg mx-auto pb-16">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b border-border z-10 px-4 pt-4 pb-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground font-medium">
            {isWetFoodRound
              ? `Cluster ${currentIndex + 1} of ${orderedRouteStations.length}`
              : `${stationInfo?.area} · Station ${currentIndex + 1} of ${orderedRouteStations.length}`}
          </p>
          <h1 className="font-semibold text-base leading-tight mt-0.5 truncate">
            {stationInfo?.name ?? 'Loading…'}
          </h1>
        </div>

        {stationInfo?.access_notes && (
          <p className="text-xs text-muted-foreground mt-1.5 italic">{stationInfo.access_notes}</p>
        )}
      </div>

      <div className="px-4 pt-4 space-y-5">
        {/* Food & Water */}
        <div className="space-y-3">
          {route?.round_type === 'morning' ? (
            <>
              {/* Arrival food level */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  🍽️ Dry food on arrival <span className="text-red-500 normal-case">· required</span>
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {(['empty', 'medium', 'full'] as const).map(level => {
                    const selected = stationState.foodLevel === level
                    const colour = level === 'empty'
                      ? 'border-red-400 bg-red-500/10 text-red-600 dark:text-red-400'
                      : level === 'medium'
                      ? 'border-amber-400 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      : 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    return (
                      <button
                        key={level}
                        onClick={() => { setFoodLevel(stationId, selected ? null : level); setCompletionError(null) }}
                        className={`h-12 rounded-xl border-2 font-semibold text-sm capitalize transition-all active:scale-95 ${
                          selected ? colour : 'border-border bg-card text-muted-foreground'
                        }`}
                      >
                        {level}
                      </button>
                    )
                  })}
                </div>
              </div>
              {/* Topped up tiles */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Topped up</p>
                <div className={`grid gap-2 ${stationInfo?.requires_wet_food ? 'grid-cols-3' : 'grid-cols-2'}`}>
                  <button
                    onClick={() => setFoodToppedUp(stationId, !stationState.foodToppedUp)}
                    className={`h-16 rounded-2xl border-2 font-semibold text-sm flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                      stationState.foodToppedUp
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'border-border bg-card text-muted-foreground'
                    }`}
                  >
                    <span className="text-xl">🍽️</span>
                    <span>Dry food {stationState.foodToppedUp ? '✓' : ''}</span>
                  </button>
                  {stationInfo?.requires_wet_food && (
                    <button
                      onClick={() => setWetFoodToppedUp(stationId, !(stationState.wetFoodToppedUp ?? false))}
                      className={`h-16 rounded-2xl border-2 font-semibold text-sm flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                        stationState.wetFoodToppedUp
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'border-border bg-card text-muted-foreground'
                      }`}
                    >
                      <span className="text-xl">🥫</span>
                      <span>Wet food {stationState.wetFoodToppedUp ? '✓' : ''}</span>
                    </button>
                  )}
                  <button
                    onClick={() => setWaterToppedUp(stationId, !stationState.waterToppedUp)}
                    className={`h-16 rounded-2xl border-2 font-semibold text-sm flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                      stationState.waterToppedUp
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'border-border bg-card text-muted-foreground'
                    }`}
                  >
                    <span className="text-xl">💧</span>
                    <span>Water {stationState.waterToppedUp ? '✓' : ''}</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Areas to cover
                {areas && areas.length > 0 && (
                  <span className="ml-2 text-emerald-500 normal-case">
                    {areasCovered.length}/{areas.length} covered
                  </span>
                )}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(areas ?? []).map(area => {
                  const covered = areasCovered.includes(area.id)
                  return (
                    <button
                      key={area.id}
                      onClick={() => toggleAreaCovered(stationId, area.id)}
                      title={area.access_notes ?? undefined}
                      className={`h-14 rounded-2xl border-2 font-medium text-sm px-3 flex items-center justify-center text-center leading-tight transition-all active:scale-95 ${
                        covered
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'border-border bg-card text-muted-foreground'
                      }`}
                    >
                      {covered ? '✓ ' : ''}{area.name}
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-3 italic">
                Just a reminder of where to check — walk them in any order.
              </p>
            </div>
          )}
        </div>

        {/* Cats */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Cats seen
            {totalSeen > 0 && isWetFoodRound && (
              <span className="ml-2 text-emerald-500 normal-case">{totalSeen}/{cats?.length ?? 0} accounted for</span>
            )}
            {totalSeen > 0 && !isWetFoodRound && (
              <span className="ml-2 text-emerald-500">{totalSeen} seen</span>
            )}
          </p>

          {isWetFoodRound && (
            <p className="text-xs text-muted-foreground italic mb-3">
              Selecting a cat confirms that wet food and water have been provided.
            </p>
          )}

          {catsLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map(i => <div key={i} className="aspect-square rounded-2xl bg-muted animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {/* Expected cats */}
              {(cats ?? []).map(cat => (
                <CatCard
                  key={cat.id}
                  cat={cat}
                  seen={stationState.seenCatIds.includes(cat.id)}
                  hasWelfareConcern={!!stationState.welfare[cat.id]}
                  onToggle={() => toggleCatSeen(stationId, cat.id)}
                  onWelfareConcern={() => setWelfareCatId(cat.id)}
                />
              ))}

              {/* Guest cats (registered cats from other stations) */}
              {guestCats.map(cat => (
                <CatCard
                  key={cat.id}
                  cat={cat}
                  seen={true}
                  hasWelfareConcern={!!stationState.welfare[cat.id]}
                  onToggle={() => removeGuestCat(stationId, cat.id)}
                  onWelfareConcern={() => setWelfareCatId(cat.id)}
                />
              ))}

              {/* + tile to add an existing cat */}
              <button
                onClick={() => setShowGuestModal(true)}
                className="aspect-square rounded-2xl border-2 border-dashed border-border bg-card flex flex-col items-center justify-center gap-2 text-muted-foreground active:scale-95 transition-transform"
              >
                <span className="text-3xl font-light leading-none">+</span>
                <span className="text-xs font-medium">Add cat</span>
              </button>
            </div>
          )}
        </div>

        {/* New cats seen (no DB record) */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">New cats seen</p>

          {additionalCats.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {additionalCats.map((cat, i) => {
                // Rounds from before the IndexedDB rewrite may still carry the photo inline
                // as photoDataUrl instead of a photoKey — fall back so it still displays.
                const legacyUrl = (cat as { photoDataUrl?: string }).photoDataUrl
                const photoUrl = cat.photoKey ? photoMap[cat.photoKey] : legacyUrl
                const hasConcern = !!cat.welfareNotes
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-1.5 rounded-2xl overflow-hidden pr-2 py-1 pl-1 border ${
                      hasConcern ? 'bg-amber-500/10 border-amber-500/40' : 'bg-muted border-transparent'
                    }`}
                  >
                    {photoUrl ? (
                      <img src={photoUrl} alt={cat.name} className="w-8 h-8 rounded-xl object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-muted-foreground/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs">🐱</span>
                      </div>
                    )}
                    <span className="text-sm">{cat.name}</span>
                    <button
                      onClick={() => setWelfareAdditionalCatIndex(i)}
                      className={`text-sm leading-none px-0.5 ${hasConcern ? '' : 'opacity-50'}`}
                      aria-label="Flag welfare concern"
                      title="Flag welfare concern"
                    >
                      ⚠️
                    </button>
                    <button
                      onClick={() => handleRemoveAdditionalCat(i)}
                      className="text-muted-foreground text-base leading-none ml-0.5"
                      aria-label="Remove"
                    >
                      ✕
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {showAddCat ? (
            <div className="space-y-2">
              {/* Photo preview */}
              {newCatPhoto && (
                <div className="relative w-20 h-20">
                  <img src={newCatPhoto} alt="Cat photo" className="w-20 h-20 rounded-2xl object-cover" />
                  <button
                    onClick={() => setNewCatPhoto(undefined)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-foreground text-background rounded-full text-xs flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <input
                  ref={addCatInputRef}
                  value={newCatName}
                  onChange={e => { setNewCatName(e.target.value); setAddCatError(null) }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleAddCat()
                    if (e.key === 'Escape') { setNewCatName(''); setNewCatPhoto(undefined); setAddCatError(null); setShowAddCat(false) }
                  }}
                  placeholder="Name or short description…"
                  autoFocus
                  className="flex-1 rounded-xl border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {/* Camera button */}
                <button
                  onClick={() => photoInputRef.current?.click()}
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg flex-shrink-0 ${
                    !newCatPhoto && addCatError ? 'border-destructive' : 'border-border'
                  } bg-card`}
                  aria-label="Take photo"
                >
                  📷
                </button>
                <button
                  onClick={handleAddCat}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
                >
                  Add
                </button>
              </div>
              {addCatError && (
                <p ref={addCatErrorRef} className="text-xs text-destructive">{addCatError}</p>
              )}
              <p className="text-xs text-muted-foreground">Both a name and a photo are required.</p>
              {/* Hidden file input */}
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  e.target.value = ''
                  const img = new Image()
                  const url = URL.createObjectURL(file)
                  img.onload = () => {
                    URL.revokeObjectURL(url)
                    const MAX = 800
                    const scale = Math.min(1, MAX / Math.max(img.width, img.height))
                    const canvas = document.createElement('canvas')
                    canvas.width = Math.round(img.width * scale)
                    canvas.height = Math.round(img.height * scale)
                    canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
                    setNewCatPhoto(canvas.toDataURL('image/jpeg', 0.75))
                    setAddCatError(null)
                  }
                  img.src = url
                }}
              />
            </div>
          ) : (
            <button
              onClick={() => { setShowAddCat(true); setTimeout(() => addCatInputRef.current?.focus(), 50) }}
              className="flex items-center gap-2 text-sm text-primary border border-primary/30 rounded-xl px-4 py-2 active:scale-95 transition-transform"
            >
              <span className="text-lg font-light leading-none">+</span>
              <span>Add cat</span>
            </button>
          )}
        </div>

        {/* Notes */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Notes</p>
          <textarea
            value={stationState.notes}
            onChange={e => setStationNotes(stationId, e.target.value)}
            placeholder="Add your notes here…"
            className="w-full h-20 rounded-xl border border-border bg-card px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Navigate / Complete */}
        {completionError && (
          <p ref={completionErrorRef} className="text-sm text-destructive text-center">{completionError}</p>
        )}
        <div className="flex gap-2">
          <button
            onClick={handlePrevious}
            disabled={isFirstStation}
            aria-label="Previous"
            className="flex-shrink-0 w-28 h-14 rounded-2xl border border-border bg-card text-muted-foreground font-medium text-sm flex flex-col items-center justify-center gap-0.5 active:scale-[0.98] transition-transform disabled:opacity-50 disabled:pointer-events-none"
          >
            <span>← Previous</span>
            {prevStation && <span className="text-[11px] truncate max-w-full px-1">{prevStation.name}</span>}
          </button>
          <button
            onClick={handleCompleteStation}
            className="flex-1 h-14 rounded-2xl bg-primary text-primary-foreground font-semibold text-base active:scale-[0.98] transition-transform"
          >
            {isLastStation ? 'Complete round →' : `Next ${isWetFoodRound ? 'cluster' : 'station'} →`}
          </button>
        </div>
      </div>

      {/* Welfare modal — registered / guest cats */}
      {welfareCatId && welfareCat && (
        <WelfareConcernModal
          catName={welfareCat.name}
          existingNotes={stationState.welfare[welfareCatId] ?? ''}
          onSave={notes => { setWelfareConcern(stationId, welfareCatId, notes); setWelfareCatId(null) }}
          onClear={() => { setWelfareConcern(stationId, welfareCatId, null); setWelfareCatId(null) }}
          onClose={() => setWelfareCatId(null)}
        />
      )}

      {/* Welfare modal — newly-added cats with no DB record */}
      {welfareAdditionalCatIndex !== null && welfareAdditionalCat && (
        <WelfareConcernModal
          catName={welfareAdditionalCat.name}
          existingNotes={welfareAdditionalCat.welfareNotes ?? ''}
          onSave={notes => { setAdditionalCatWelfare(stationId, welfareAdditionalCatIndex, notes); setWelfareAdditionalCatIndex(null) }}
          onClear={() => { setAdditionalCatWelfare(stationId, welfareAdditionalCatIndex, null); setWelfareAdditionalCatIndex(null) }}
          onClose={() => setWelfareAdditionalCatIndex(null)}
        />
      )}

      {/* Guest cat picker modal */}
      {showGuestModal && (
        <GuestCatModal
          excludeCatIds={expectedCatIds}
          selectedCatIds={guestCatIds}
          onAdd={catId => addGuestCat(stationId, catId)}
          onRemove={catId => removeGuestCat(stationId, catId)}
          onClose={() => setShowGuestModal(false)}
        />
      )}
    </div>
  )
}
