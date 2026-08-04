import Dexie, { type EntityTable } from 'dexie'
import type {
  Cat,
  Station,
  Route,
  RouteStation,
  FeedingRound,
  StationVisit,
  Sighting,
  UserProfile,
} from '@/types'

// Local versions add syncStatus to track what needs pushing to Supabase
type LocalCat = Cat & { syncStatus: string }
type LocalStation = Station & { syncStatus: string }
type LocalRoute = Route & { syncStatus: string }
type LocalRouteStation = RouteStation & { syncStatus: string }
type LocalFeedingRound = FeedingRound
type LocalStationVisit = StationVisit
type LocalSighting = Sighting

const db = new Dexie('community-cats') as Dexie & {
  profiles:      EntityTable<UserProfile,     'id'>
  cats:          EntityTable<LocalCat,         'id'>
  stations:      EntityTable<LocalStation,     'id'>
  routes:        EntityTable<LocalRoute,       'id'>
  routeStations: EntityTable<LocalRouteStation,'id'>
  feedingRounds: EntityTable<LocalFeedingRound,'id'>
  stationVisits: EntityTable<LocalStationVisit,'id'>
  sightings:     EntityTable<LocalSighting,    'id'>
}

// Version 1 — initial schema
// The string after each table name lists the indexed fields.
// '&id' means id is unique. Other fields listed here can be searched efficiently.
db.version(1).stores({
  profiles:      '&id',
  cats:          '&id, primaryStationId, status, isActive, syncStatus',
  stations:      '&id, area, isActive, syncStatus',
  routes:        '&id, isActive, syncStatus',
  routeStations: '&id, routeId, stationId',
  feedingRounds: '&id, volunteerId, status, syncStatus, startedAt',
  stationVisits: '&id, feedingRoundId, stationId, syncStatus',
  sightings:     '&id, stationVisitId, catId, stationId, volunteerId, syncStatus, hasWelfareConcern',
})

export { db }
