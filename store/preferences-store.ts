import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PreferencesStore {
  routeStationOrder: Record<string, string[]> // routeId → ordered stationIds
  setStationOrder: (routeId: string, stationIds: string[]) => void
  clearStationOrder: (routeId: string) => void
  getStationOrder: (routeId: string) => string[] | null
}

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set, get) => ({
      routeStationOrder: {},

      setStationOrder: (routeId, stationIds) =>
        set(state => ({
          routeStationOrder: { ...state.routeStationOrder, [routeId]: stationIds },
        })),

      clearStationOrder: (routeId) =>
        set(state => {
          const next = { ...state.routeStationOrder }
          delete next[routeId]
          return { routeStationOrder: next }
        }),

      getStationOrder: (routeId) => get().routeStationOrder[routeId] ?? null,
    }),
    { name: 'cat-preferences' }
  )
)
