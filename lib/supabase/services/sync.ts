import { createClient } from '@/lib/supabase/client'
import { v5 as uuidv5 } from 'uuid'
import type { ActiveRound } from '@/store/feeding-round-store'
import { insertProvisionalCat, uploadCatPhoto } from '@/lib/supabase/services/cats'
import { getPhoto } from '@/lib/db/photo-store'

// Fixed namespace for deriving deterministic sighting ids from (visitId, catId) pairs, so
// retrying a failed/partial sync never creates duplicate sighting rows.
const SIGHTING_NAMESPACE = '9f7f3f6a-4b3e-4f0a-8c1a-6b2e9d5f0a11'

function sightingId(visitId: string, catId: string): string {
  return uuidv5(`${visitId}:${catId}`, SIGHTING_NAMESPACE)
}

export async function syncCompletedRound(round: ActiveRound): Promise<void> {
  // SKIP_AUTH only bypasses the sign-in redirect (see proxy.ts) — it never creates a real
  // Supabase session, so any RLS-protected write (this whole function) will be rejected as
  // an anonymous request. Fail fast with a clear message instead of a confusing DB error.
  if (process.env.NEXT_PUBLIC_SKIP_AUTH === 'true') {
    throw new Error(
      'Sync skipped: SKIP_AUTH mode has no real Supabase session, so RLS will reject this write. Sign in normally to test syncing.'
    )
  }

  const supabase = createClient()

  // Every write below is `ON CONFLICT DO NOTHING` on a client-generated id — the whole
  // function is safe to call again after a partial failure (e.g. network drop halfway
  // through a round with many stations) without creating duplicate rows.

  // 1. Feeding round
  const { error: roundErr } = await supabase.from('feeding_rounds').upsert({
    id: round.id,
    route_id: round.routeId,
    volunteer_id: round.volunteerId,
    started_at: round.startedAt,
    completed_at: round.completedAt,
    status: round.completedAt ? 'completed' : 'in_progress',
    notes: round.notes || null,
  }, { onConflict: 'id', ignoreDuplicates: true })
  if (roundErr) throw roundErr

  // 2. Station visits + sightings
  for (const [stationId, state] of Object.entries(round.stationStates)) {
    const { error: visitErr } = await supabase.from('station_visits').upsert({
      id: state.visitId,
      feeding_round_id: round.id,
      station_id: stationId,
      visited_at: state.visitedAt,
      completed_at: state.completedAt,
      food_topped_up: state.foodToppedUp,
      food_level: state.foodLevel ?? null,
      water_topped_up: state.waterToppedUp,
      notes: state.notes || null,
    }, { onConflict: 'id', ignoreDuplicates: true })
    if (visitErr) throw visitErr

    // Registered cats (expected + guest) seen at this station
    for (const catId of state.seenCatIds) {
      const welfareNotes = state.welfare[catId] ?? null
      const { error: sightingErr } = await supabase.from('sightings').upsert({
        id: sightingId(state.visitId, catId),
        station_visit_id: state.visitId,
        cat_id: catId,
        station_id: stationId,
        volunteer_id: round.volunteerId,
        seen_at: state.visitedAt,
        has_welfare_concern: !!welfareNotes,
        welfare_notes: welfareNotes,
      }, { onConflict: 'id', ignoreDuplicates: true })
      if (sightingErr) throw sightingErr
    }

    // New cats described (and optionally photographed) by the volunteer, with no prior
    // DB record — create a provisional cat, then a sighting against it.
    for (const cat of state.additionalCats ?? []) {
      let photoUrl: string | null = null
      if (cat.photoKey) {
        const dataUrl = await getPhoto(cat.photoKey)
        if (dataUrl) photoUrl = await uploadCatPhoto(dataUrl, cat.photoKey)
      }

      await insertProvisionalCat({
        id: cat.id,
        name: cat.name,
        description: null,
        primaryStationId: stationId,
        createdBy: round.volunteerId,
        photoUrl,
      })

      const welfareNotes = cat.welfareNotes ?? null
      const { error: sightingErr } = await supabase.from('sightings').upsert({
        id: sightingId(state.visitId, cat.id),
        station_visit_id: state.visitId,
        cat_id: cat.id,
        station_id: stationId,
        volunteer_id: round.volunteerId,
        seen_at: state.visitedAt,
        has_welfare_concern: !!welfareNotes,
        welfare_notes: welfareNotes,
        photo_url: photoUrl,
      }, { onConflict: 'id', ignoreDuplicates: true })
      if (sightingErr) throw sightingErr
    }
  }
}
