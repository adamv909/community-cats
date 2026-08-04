export type UserRole = 'volunteer' | 'admin'

export type CatStatus = 'active' | 'missing' | 'homed' | 'hospital' | 'deceased'

export type RoundStatus = 'in_progress' | 'completed' | 'abandoned'

export type SyncStatus = 'synced' | 'pending_push' | 'conflict'

// ── Profiles ──────────────────────────────────────────
export interface UserProfile {
  id: string
  displayName: string
  role: UserRole
  isActive: boolean
  createdAt: string
}

// ── Stations ──────────────────────────────────────────
export interface Station {
  id: string
  name: string
  area: string
  latitude: number
  longitude: number
  accessNotes: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ── Cats ──────────────────────────────────────────────
export interface Cat {
  id: string
  name: string
  photoUrl: string | null
  description: string | null
  primaryStationId: string | null
  status: CatStatus
  healthNotes: string | null
  lastSeenAt: string | null
  isActive: boolean
  isProvisional: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
  // Populated from cat_known_locations join
  knownStationIds?: string[]
}

// ── Routes ────────────────────────────────────────────
export interface Route {
  id: string
  name: string
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface RouteStation {
  id: string
  routeId: string
  stationId: string
  orderIndex: number
}

// A route with its ordered stations expanded
export interface RouteWithStations extends Route {
  stations: (RouteStation & { station: Station })[]
}

// ── Feeding Rounds ─────────────────────────────────────
export interface FeedingRound {
  id: string             // Client-generated UUID — exists before sync
  routeId: string | null
  volunteerId: string
  startedAt: string
  completedAt: string | null
  status: RoundStatus
  notes: string | null
  createdAt: string
  updatedAt: string
  syncStatus: SyncStatus
}

// ── Station Visits ─────────────────────────────────────
export interface StationVisit {
  id: string
  feedingRoundId: string
  stationId: string
  visitedAt: string
  completedAt: string | null
  foodToppedUp: boolean
  waterToppedUp: boolean
  notes: string | null
  syncStatus: SyncStatus
}

// ── Sightings ──────────────────────────────────────────
export interface Sighting {
  id: string
  stationVisitId: string
  catId: string
  stationId: string
  volunteerId: string
  seenAt: string
  notes: string | null
  photoUrl: string | null
  localPhotoPath: string | null  // Temporary local path before upload
  hasWelfareConcern: boolean
  welfareNotes: string | null
  syncStatus: SyncStatus
}

// ── Report ─────────────────────────────────────────────
export interface ReportEntry {
  area: string
  cats: string[]
}

export interface ReportData {
  date: string
  volunteerName: string
  entries: ReportEntry[]
  generalNotes: string | null
  welfareConcerns: { catName: string; notes: string }[]
}
