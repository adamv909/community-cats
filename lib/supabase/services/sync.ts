import { createClient } from '@/lib/supabase/client'
import { v4 as uuidv4 } from 'uuid'
import type { ActiveRound } from '@/store/feeding-round-store'

export async function syncCompletedRound(round: ActiveRound): Promise<void> {
  const supabase = createClient()

  // Idempotency guard — skip if already in DB
  const { data: existing } = await supabase
    .from('feeding_rounds')
    .select('id')
    .eq('id', round.id)
    .maybeSingle()

  if (existing) return

  // 1. Feeding round
  const { error: roundErr } = await supabase.from('feeding_rounds').insert({
    id: round.id,
    route_id: round.routeId,
    volunteer_id: round.volunteerId,
    started_at: round.startedAt,
    completed_at: round.completedAt,
    status: round.completedAt ? 'completed' : 'in_progress',
    notes: round.notes || null,
  })
  if (roundErr) throw roundErr

  // 2. Station visits + sightings
  for (const [stationId, state] of Object.entries(round.stationStates)) {
    const { error: visitErr } = await supabase.from('station_visits').insert({
      id: state.visitId,
      feeding_round_id: round.id,
      station_id: stationId,
      visited_at: state.visitedAt,
      completed_at: state.completedAt,
      food_topped_up: state.foodToppedUp,
      food_level: state.foodLevel ?? null,
      water_topped_up: state.waterToppedUp,
      notes: state.notes || null,
    })
    if (visitErr) throw visitErr

    for (const catId of state.seenCatIds) {
      const welfareNotes = state.welfare[catId] ?? null
      const { error: sightingErr } = await supabase.from('sightings').insert({
        id: uuidv4(),
        station_visit_id: state.visitId,
        cat_id: catId,
        station_id: stationId,
        volunteer_id: round.volunteerId,
        seen_at: state.visitedAt,
        has_welfare_concern: !!welfareNotes,
        welfare_notes: welfareNotes,
      })
      if (sightingErr) throw sightingErr
    }
  }
}
