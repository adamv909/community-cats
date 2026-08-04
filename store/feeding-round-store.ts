import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'

export type FoodLevel = 'empty' | 'medium' | 'full'
export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'failed'

export interface AdditionalCat {
  id: string                // client-generated — becomes the eventual cats.id (stable across sync retries)
  name: string
  photoKey?: string        // reference into lib/db/photo-store.ts (IndexedDB) — not the raw image
  welfareNotes?: string
}

export interface StationState {
  visitId: string
  stationId: string
  visitedAt: string
  completedAt: string | null
  foodToppedUp: boolean      // evening round (binary wet food toggle)
  foodLevel: FoodLevel | null // morning round (dry food level)
  waterToppedUp: boolean
  notes: string
  seenCatIds: string[]
  additionalCats: AdditionalCat[]  // new cats described by volunteer (no DB record)
  guestCatIds: string[]            // registered cats from other stations seen here
  welfare: Record<string, string>  // catId → welfare notes
}

export interface ActiveRound {
  id: string
  routeId: string
  volunteerId: string
  startedAt: string
  completedAt: string | null
  notes: string
  stationStates: Record<string, StationState>
  syncStatus: SyncStatus
}

interface FeedingRoundStore {
  activeRound: ActiveRound | null
  // Zustand's persist middleware reads localStorage asynchronously — on a cold page load
  // (PWA relaunch, hard refresh) activeRound is still null for the first render or two.
  // Pages that redirect away when activeRound is missing must wait for this to flip true
  // first, or they'll bounce the user to /home even though their round is sitting right
  // there in localStorage.
  hasHydrated: boolean
  setHasHydrated: (value: boolean) => void
  startRound: (routeId: string, volunteerId: string) => string
  openStation: (stationId: string) => void
  toggleCatSeen: (stationId: string, catId: string) => void
  setFoodToppedUp: (stationId: string, value: boolean) => void
  setFoodLevel: (stationId: string, level: FoodLevel | null) => void
  setWaterToppedUp: (stationId: string, value: boolean) => void
  setStationNotes: (stationId: string, notes: string) => void
  addAdditionalCat: (stationId: string, cat: Omit<AdditionalCat, 'id'>) => void
  removeAdditionalCat: (stationId: string, index: number) => void
  setAdditionalCatWelfare: (stationId: string, index: number, notes: string | null) => void
  addGuestCat: (stationId: string, catId: string) => void
  removeGuestCat: (stationId: string, catId: string) => void
  setWelfareConcern: (stationId: string, catId: string, notes: string | null) => void
  completeStation: (stationId: string) => void
  completeRound: (notes?: string, completedAt?: string) => void
  setSyncStatus: (status: SyncStatus) => void
  clearRound: () => void
}

export const useFeedingRoundStore = create<FeedingRoundStore>()(
  persist(
    (set) => ({
      activeRound: null,
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),

      startRound: (routeId, volunteerId) => {
        const id = uuidv4()
        set({
          activeRound: {
            id, routeId, volunteerId,
            startedAt: new Date().toISOString(),
            completedAt: null,
            notes: '',
            stationStates: {},
            syncStatus: 'idle',
          },
        })
        return id
      },

      openStation: (stationId) => set(state => {
        if (!state.activeRound) return state
        if (state.activeRound.stationStates[stationId]) return state
        return {
          activeRound: {
            ...state.activeRound,
            stationStates: {
              ...state.activeRound.stationStates,
              [stationId]: {
                visitId: uuidv4(),
                stationId,
                visitedAt: new Date().toISOString(),
                completedAt: null,
                foodToppedUp: false,
                foodLevel: null,
                waterToppedUp: false,
                notes: '',
                seenCatIds: [],
                additionalCats: [],
                guestCatIds: [],
                welfare: {},
              },
            },
          },
        }
      }),

      toggleCatSeen: (stationId, catId) => set(state => {
        if (!state.activeRound) return state
        const station = state.activeRound.stationStates[stationId]
        if (!station) return state
        const seen = station.seenCatIds.includes(catId)
        const seenCatIds = seen
          ? station.seenCatIds.filter(id => id !== catId)
          : [...station.seenCatIds, catId]
        const welfare = seen
          ? Object.fromEntries(Object.entries(station.welfare).filter(([k]) => k !== catId))
          : station.welfare
        return {
          activeRound: {
            ...state.activeRound,
            stationStates: {
              ...state.activeRound.stationStates,
              [stationId]: { ...station, seenCatIds, welfare },
            },
          },
        }
      }),

      setFoodToppedUp: (stationId, value) => set(state => {
        if (!state.activeRound) return state
        const station = state.activeRound.stationStates[stationId]
        if (!station) return state
        return {
          activeRound: {
            ...state.activeRound,
            stationStates: { ...state.activeRound.stationStates, [stationId]: { ...station, foodToppedUp: value } },
          },
        }
      }),

      setFoodLevel: (stationId, level) => set(state => {
        if (!state.activeRound) return state
        const station = state.activeRound.stationStates[stationId]
        if (!station) return state
        return {
          activeRound: {
            ...state.activeRound,
            stationStates: { ...state.activeRound.stationStates, [stationId]: { ...station, foodLevel: level } },
          },
        }
      }),

      setWaterToppedUp: (stationId, value) => set(state => {
        if (!state.activeRound) return state
        const station = state.activeRound.stationStates[stationId]
        if (!station) return state
        return {
          activeRound: {
            ...state.activeRound,
            stationStates: { ...state.activeRound.stationStates, [stationId]: { ...station, waterToppedUp: value } },
          },
        }
      }),

      setStationNotes: (stationId, notes) => set(state => {
        if (!state.activeRound) return state
        const station = state.activeRound.stationStates[stationId]
        if (!station) return state
        return {
          activeRound: {
            ...state.activeRound,
            stationStates: { ...state.activeRound.stationStates, [stationId]: { ...station, notes } },
          },
        }
      }),

      addAdditionalCat: (stationId, cat) => set(state => {
        if (!state.activeRound) return state
        const station = state.activeRound.stationStates[stationId]
        if (!station) return state
        return {
          activeRound: {
            ...state.activeRound,
            stationStates: {
              ...state.activeRound.stationStates,
              [stationId]: { ...station, additionalCats: [...(station.additionalCats ?? []), { ...cat, id: uuidv4() }] },
            },
          },
        }
      }),

      removeAdditionalCat: (stationId, index) => set(state => {
        if (!state.activeRound) return state
        const station = state.activeRound.stationStates[stationId]
        if (!station) return state
        return {
          activeRound: {
            ...state.activeRound,
            stationStates: {
              ...state.activeRound.stationStates,
              [stationId]: {
                ...station,
                additionalCats: (station.additionalCats ?? []).filter((_, i) => i !== index),
              },
            },
          },
        }
      }),

      setAdditionalCatWelfare: (stationId, index, notes) => set(state => {
        if (!state.activeRound) return state
        const station = state.activeRound.stationStates[stationId]
        if (!station) return state
        const additionalCats = (station.additionalCats ?? []).map((cat, i) =>
          i === index ? { ...cat, welfareNotes: notes ?? undefined } : cat
        )
        return {
          activeRound: {
            ...state.activeRound,
            stationStates: { ...state.activeRound.stationStates, [stationId]: { ...station, additionalCats } },
          },
        }
      }),

      addGuestCat: (stationId, catId) => set(state => {
        if (!state.activeRound) return state
        const station = state.activeRound.stationStates[stationId]
        if (!station) return state
        if ((station.guestCatIds ?? []).includes(catId)) return state
        return {
          activeRound: {
            ...state.activeRound,
            stationStates: {
              ...state.activeRound.stationStates,
              [stationId]: {
                ...station,
                guestCatIds: [...(station.guestCatIds ?? []), catId],
                seenCatIds: [...station.seenCatIds, catId],
              },
            },
          },
        }
      }),

      removeGuestCat: (stationId, catId) => set(state => {
        if (!state.activeRound) return state
        const station = state.activeRound.stationStates[stationId]
        if (!station) return state
        return {
          activeRound: {
            ...state.activeRound,
            stationStates: {
              ...state.activeRound.stationStates,
              [stationId]: {
                ...station,
                guestCatIds: (station.guestCatIds ?? []).filter(id => id !== catId),
                seenCatIds: station.seenCatIds.filter(id => id !== catId),
              },
            },
          },
        }
      }),

      setWelfareConcern: (stationId, catId, notes) => set(state => {
        if (!state.activeRound) return state
        const station = state.activeRound.stationStates[stationId]
        if (!station) return state
        const welfare = notes === null
          ? Object.fromEntries(Object.entries(station.welfare).filter(([k]) => k !== catId))
          : { ...station.welfare, [catId]: notes }
        return {
          activeRound: {
            ...state.activeRound,
            stationStates: { ...state.activeRound.stationStates, [stationId]: { ...station, welfare } },
          },
        }
      }),

      completeStation: (stationId) => set(state => {
        if (!state.activeRound) return state
        const station = state.activeRound.stationStates[stationId]
        if (!station) return state
        return {
          activeRound: {
            ...state.activeRound,
            stationStates: {
              ...state.activeRound.stationStates,
              [stationId]: { ...station, completedAt: new Date().toISOString() },
            },
          },
        }
      }),

      completeRound: (notes, completedAt) => set(state => {
        if (!state.activeRound) return state
        return {
          activeRound: {
            ...state.activeRound,
            completedAt: completedAt ?? new Date().toISOString(),
            notes: notes ?? state.activeRound.notes,
          },
        }
      }),

      setSyncStatus: (status) => set(state => {
        if (!state.activeRound) return state
        return { activeRound: { ...state.activeRound, syncStatus: status } }
      }),

      clearRound: () => set({ activeRound: null }),
    }),
    {
      name: 'feeding-round',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
