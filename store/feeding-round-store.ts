import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'

export interface StationState {
  visitId: string
  stationId: string
  visitedAt: string
  completedAt: string | null
  foodToppedUp: boolean
  waterToppedUp: boolean
  notes: string
  seenCatIds: string[]
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
}

interface FeedingRoundStore {
  activeRound: ActiveRound | null
  startRound: (routeId: string, volunteerId: string) => string
  openStation: (stationId: string) => void
  toggleCatSeen: (stationId: string, catId: string) => void
  setFoodToppedUp: (stationId: string, value: boolean) => void
  setWaterToppedUp: (stationId: string, value: boolean) => void
  setStationNotes: (stationId: string, notes: string) => void
  setWelfareConcern: (stationId: string, catId: string, notes: string | null) => void
  completeStation: (stationId: string) => void
  completeRound: (notes?: string) => void
  clearRound: () => void
}

export const useFeedingRoundStore = create<FeedingRoundStore>()(
  persist(
    (set) => ({
      activeRound: null,

      startRound: (routeId, volunteerId) => {
        const id = uuidv4()
        set({
          activeRound: {
            id, routeId, volunteerId,
            startedAt: new Date().toISOString(),
            completedAt: null,
            notes: '',
            stationStates: {},
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
                waterToppedUp: false,
                notes: '',
                seenCatIds: [],
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

      completeRound: (notes) => set(state => {
        if (!state.activeRound) return state
        return {
          activeRound: {
            ...state.activeRound,
            completedAt: new Date().toISOString(),
            notes: notes ?? state.activeRound.notes,
          },
        }
      }),

      clearRound: () => set({ activeRound: null }),
    }),
    { name: 'feeding-round' }
  )
)
