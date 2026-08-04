'use client'

import { useRef, useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { fetchActiveRoutes } from '@/lib/supabase/services/routes'
import { fetchCatsByStation, fetchCatsByIds } from '@/lib/supabase/services/cats'
import { useFeedingRoundStore } from '@/store/feeding-round-store'
import { CatCard } from '@/components/feeding/CatCard'
import { WelfareConcernModal } from '@/components/feeding/WelfareConcernModal'
import { GuestCatModal } from '@/components/feeding/GuestCatModal'

export default function StationChecklistPage() {
  const { roundId, stationId } = useParams() as { roundId: string; stationId: string }
  const router = useRouter()
  const [welfareCatId, setWelfareCatId] = useState<string | null>(null)
  const [showAddCat, setShowAddCat] = useState(false)
  const [showGuestModal, setShowGuestModal] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatPhoto, setNewCatPhoto] = useState<string | undefined>(undefined)
  const addCatInputRef = useRef<HTMLInputElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)

  const { data: routes } = useQuery({ queryKey: ['routes'], queryFn: fetchActiveRoutes })
  const { data: cats, isLoading: catsLoading } = useQuery({
    queryKey: ['cats', stationId],
    queryFn: () => fetchCatsByStation(stationId),
  })

  const {
    activeRound, openStation, toggleCatSeen,
    setFoodToppedUp, setFoodLevel, setWaterToppedUp, setStationNotes,
    addAdditionalCat, removeAdditionalCat,
    addGuestCat, removeGuestCat,
    setWelfareConcern, completeStation,
  } = useFeedingRoundStore()

  // Ensure station is open in the store
  if (activeRound && !activeRound.stationStates[stationId]) {
    openStation(stationId)
  }

  const stationState = activeRound?.stationStates[stationId]
  const guestCatIds = stationState?.guestCatIds ?? []

  const { data: guestCats = [] } = useQuery({
    queryKey: ['guest-cats', guestCatIds],
    queryFn: () => fetchCatsByIds(guestCatIds),
    enabled: guestCatIds.length > 0,
  })

  // Find station info and route context
  const route = routes?.find(r => r.id === activeRound?.routeId)
  const foodLabel = route?.round_type === 'morning' ? 'Dry food' : 'Wet food'
  const routeStations = route?.route_stations ?? []
  const currentIndex = routeStations.findIndex(rs => rs.station.id === stationId)
  const stationInfo = routeStations[currentIndex]?.station
  const nextStation = routeStations[currentIndex + 1]?.station
  const isLastStation = currentIndex === routeStations.length - 1

  const expectedCatIds = (cats ?? []).map(c => c.id)
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

  const totalSeen = stationState ? stationState.seenCatIds.length + (stationState.additionalCats ?? []).length : 0

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
        <div className="space-y-3">
          {route?.round_type === 'morning' ? (
            <>
              {/* Arrival food level */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">🍽️ Dry food on arrival</p>
                <div className="grid grid-cols-3 gap-2">
                  {(['empty', 'medium', 'full'] as const).map(level => {
                    const selected = stationState?.foodLevel === level
                    const colour = level === 'empty'
                      ? 'border-red-400 bg-red-500/10 text-red-600 dark:text-red-400'
                      : level === 'medium'
                      ? 'border-amber-400 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      : 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    return (
                      <button
                        key={level}
                        onClick={() => stationState && setFoodLevel(stationId, selected ? null : level)}
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
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => stationState && setFoodToppedUp(stationId, !stationState.foodToppedUp)}
                    className={`h-16 rounded-2xl border-2 font-semibold text-sm flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                      stationState?.foodToppedUp
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'border-border bg-card text-muted-foreground'
                    }`}
                  >
                    <span className="text-xl">🍽️</span>
                    <span>Dry food {stationState?.foodToppedUp ? '✓' : ''}</span>
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
              </div>
            </>
          ) : (
            <>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Topped up</p>
              <button
                onClick={() => stationState && setFoodToppedUp(stationId, !stationState.foodToppedUp)}
                className={`w-full h-16 rounded-2xl border-2 font-semibold text-sm flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
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
                className={`w-full h-16 rounded-2xl border-2 font-semibold text-sm flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                  stationState?.waterToppedUp
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'border-border bg-card text-muted-foreground'
                }`}
              >
                <span className="text-xl">💧</span>
                <span>Water {stationState?.waterToppedUp ? '✓' : ''}</span>
              </button>
            </>
          )}
        </div>

        {/* Cats */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Cats seen
            {totalSeen > 0 && (
              <span className="ml-2 text-emerald-500">{totalSeen} seen</span>
            )}
          </p>

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
                  seen={stationState?.seenCatIds.includes(cat.id) ?? false}
                  hasWelfareConcern={!!stationState?.welfare[cat.id]}
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
                  hasWelfareConcern={false}
                  onToggle={() => removeGuestCat(stationId, cat.id)}
                  onWelfareConcern={() => {}}
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

          {(stationState?.additionalCats ?? []).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {(stationState?.additionalCats ?? []).map((cat, i) => (
                <div key={i} className="flex items-center gap-2 bg-muted rounded-2xl overflow-hidden pr-2 py-1 pl-1">
                  {cat.photoDataUrl ? (
                    <img src={cat.photoDataUrl} alt={cat.name} className="w-8 h-8 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-muted-foreground/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs">🐱</span>
                    </div>
                  )}
                  <span className="text-sm">{cat.name}</span>
                  <button
                    onClick={() => removeAdditionalCat(stationId, i)}
                    className="text-muted-foreground text-base leading-none ml-1"
                    aria-label="Remove"
                  >
                    ✕
                  </button>
                </div>
              ))}
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
                  onChange={e => setNewCatName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && newCatName.trim()) {
                      addAdditionalCat(stationId, { name: newCatName.trim(), photoDataUrl: newCatPhoto })
                      setNewCatName(''); setNewCatPhoto(undefined); setShowAddCat(false)
                    }
                    if (e.key === 'Escape') { setNewCatName(''); setNewCatPhoto(undefined); setShowAddCat(false) }
                  }}
                  placeholder="Describe the cat…"
                  autoFocus
                  className="flex-1 rounded-xl border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {/* Camera button */}
                <button
                  onClick={() => photoInputRef.current?.click()}
                  className="w-10 h-10 rounded-xl border border-border bg-card flex items-center justify-center text-lg flex-shrink-0"
                  aria-label="Take photo"
                >
                  📷
                </button>
                <button
                  onClick={() => {
                    if (newCatName.trim()) {
                      addAdditionalCat(stationId, { name: newCatName.trim(), photoDataUrl: newCatPhoto })
                      setNewCatName(''); setNewCatPhoto(undefined)
                    }
                    setShowAddCat(false)
                  }}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
                >
                  Add
                </button>
              </div>
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
