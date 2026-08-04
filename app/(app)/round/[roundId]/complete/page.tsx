'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useFeedingRoundStore } from '@/store/feeding-round-store'
import { syncCompletedRound } from '@/lib/supabase/services/sync'

type SyncState = 'idle' | 'syncing' | 'done' | 'error'

export default function RoundCompletePage() {
  const { roundId } = useParams() as { roundId: string }
  const router = useRouter()
  const { activeRound, completeRound } = useFeedingRoundStore()
  const [notes, setNotes] = useState(activeRound?.notes ?? '')
  const [syncState, setSyncState] = useState<SyncState>('idle')

  if (!activeRound || activeRound.id !== roundId) {
    router.replace('/home')
    return null
  }

  const stationStates = Object.values(activeRound.stationStates)
  const totalSeen = stationStates.reduce((acc, s) => acc + s.seenCatIds.length, 0)
  const welfareFlagged = stationStates.reduce(
    (acc, s) => acc + Object.keys(s.welfare).length, 0
  )
  const allFood = stationStates.every(s => s.foodToppedUp)
  const allWater = stationStates.every(s => s.waterToppedUp)

  async function handleFinish() {
    const completedAt = new Date().toISOString()
    const completedRound = { ...activeRound!, completedAt, notes: notes || activeRound!.notes }
    completeRound(notes)
    setSyncState('syncing')
    try {
      await syncCompletedRound(completedRound)
      setSyncState('done')
    } catch (err) {
      console.error('Sync failed:', err)
      setSyncState('error')
    }
    router.push(`/round/${roundId}/report`)
  }

  return (
    <div className="max-w-lg mx-auto p-4 pt-8">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🎉</div>
        <h1 className="text-2xl font-semibold">Round complete!</h1>
        <p className="text-muted-foreground text-sm mt-1">Here&apos;s your summary</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-card border border-border rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-primary">{totalSeen}</p>
          <p className="text-xs text-muted-foreground mt-1">cats seen</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold">{stationStates.length}</p>
          <p className="text-xs text-muted-foreground mt-1">stations visited</p>
        </div>
        <div className={`border rounded-2xl p-4 text-center ${allFood ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-card border-border'}`}>
          <p className="text-2xl">🍽️</p>
          <p className="text-xs text-muted-foreground mt-1">{allFood ? 'All food topped up' : 'Some food outstanding'}</p>
        </div>
        <div className={`border rounded-2xl p-4 text-center ${allWater ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-card border-border'}`}>
          <p className="text-2xl">💧</p>
          <p className="text-xs text-muted-foreground mt-1">{allWater ? 'All water topped up' : 'Some water outstanding'}</p>
        </div>
      </div>

      {welfareFlagged > 0 && (
        <div className="mb-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
          <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
            ⚠️ {welfareFlagged} welfare concern{welfareFlagged !== 1 ? 's' : ''} flagged
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">These will be included in your report.</p>
        </div>
      )}

      {/* General notes */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">General notes (optional)</p>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Any general observations for the group…"
          className="w-full h-24 rounded-xl border border-border bg-card px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <button
        onClick={handleFinish}
        disabled={syncState === 'syncing'}
        className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-semibold text-base active:scale-[0.98] transition-transform disabled:opacity-70"
      >
        {syncState === 'syncing' ? 'Saving…' : 'Generate report →'}
      </button>
      {syncState === 'error' && (
        <p className="text-xs text-center text-amber-600 dark:text-amber-400 mt-2">
          Could not sync to server — your report is still available.
        </p>
      )}
    </div>
  )
}
