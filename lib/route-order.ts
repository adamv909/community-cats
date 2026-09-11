// Reconciles a volunteer's saved custom station order (from usePreferencesStore) against the
// route's current canonical order (route_stations.order_index, as returned by
// fetchActiveRoutes). Used by both the route overview ("Edit order") and the station page.
//
// - Anything the volunteer removed from the route disappears from the result.
// - Anything still on the route keeps the volunteer's chosen relative order.
// - Anything newly added to the route (not in the saved order at all) is spliced in right
//   after its nearest canonical predecessor, so it lands next to where it actually belongs
//   instead of always being dumped at the end.
// Deterministic and idempotent — re-running this on an already-reconciled order is a no-op.
export function reconcileStationOrder<T extends { station: { id: string } }>(
  savedOrder: string[],
  canonical: T[]
): T[] {
  const canonicalIds = canonical.map(item => item.station.id)
  const canonicalSet = new Set(canonicalIds)
  const byId = new Map(canonical.map(item => [item.station.id, item]))

  const order = savedOrder.filter(id => canonicalSet.has(id))

  let lastPlacedIndex = -1
  for (const id of canonicalIds) {
    const existingIndex = order.indexOf(id)
    if (existingIndex !== -1) {
      lastPlacedIndex = existingIndex
      continue
    }
    lastPlacedIndex += 1
    order.splice(lastPlacedIndex, 0, id)
  }

  return order.map(id => byId.get(id)!).filter(Boolean)
}
