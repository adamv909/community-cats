interface CatEntry {
  name: string
  hasWelfareConcern: boolean
  welfareNotes: string
}

interface AreaEntry {
  area: string
  cats: CatEntry[]
}

export interface StationFoodEntry {
  name: string
  foodLevel: 'empty' | 'medium' | 'full' | null
  foodToppedUp: boolean
  waterToppedUp: boolean
}

export interface StationNote {
  stationName: string
  note: string
}

export interface ReportInput {
  areas: AreaEntry[]
  roundNotes: string
  stationNotes: StationNote[]
  roundType: 'morning' | 'evening'
  startedAt: string
  completedAt: string | null
  stationEntries: StationFoodEntry[]
}

export function generateReport(input: ReportInput): string {
  const date = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  const roundLabel = input.roundType === 'morning' ? 'Morning Round' : 'Evening Round'
  const foodType = input.roundType === 'morning' ? 'dry food' : 'wet food'

  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

  const startTime = fmt(input.startedAt)
  const completedTime = input.completedAt ? fmt(input.completedAt) : null

  const allCats = input.areas.flatMap(a => a.cats)
  const totalCats = allCats.length
  const totalWelfare = allCats.filter(c => c.hasWelfareConcern).length

  const summary = [
    `${totalCats} cat${totalCats !== 1 ? 's' : ''} seen`,
    totalWelfare > 0 ? `${totalWelfare} welfare concern${totalWelfare !== 1 ? 's' : ''}` : null,
  ].filter(Boolean).join(' · ')

  const lines: string[] = [
    `🐱 Cat Feeding Report – ${roundLabel} – ${date}`,
    completedTime ? `${startTime} – ${completedTime}` : `Started ${startTime}`,
    summary,
  ]
  lines.push('')

  for (const area of input.areas) {
    if (area.cats.length === 0) continue
    lines.push(area.area)
    for (const cat of area.cats) {
      lines.push(cat.name)
    }
    lines.push('')
  }

  lines.push('General')

  const { stationEntries, roundType } = input

  if (roundType === 'morning' && stationEntries.length) {
    // Food levels on arrival
    const empty = stationEntries.filter(s => s.foodLevel === 'empty')
    const medium = stationEntries.filter(s => s.foodLevel === 'medium')
    const full = stationEntries.filter(s => s.foodLevel === 'full')

    if (empty.length > 0) lines.push(`⚠️ Empty on arrival: ${empty.map(s => s.name).join(', ')}`)
    if (medium.length > 0) lines.push(`Medium on arrival: ${medium.map(s => s.name).join(', ')}`)
    if (full.length > 0) lines.push(`Full on arrival: ${full.map(s => s.name).join(', ')}`)

    // Outstanding (needed topping up but wasn't done)
    const needsAttention = (s: StationFoodEntry) => s.foodLevel === 'empty' || s.foodLevel === 'medium'
    const foodOutstanding = stationEntries.filter(s => needsAttention(s) && !s.foodToppedUp)
    const waterOutstanding = stationEntries.filter(s => needsAttention(s) && !s.waterToppedUp)

    if (foodOutstanding.length > 0) {
      lines.push(`⚠️ Dry food not topped up: ${foodOutstanding.map(s => s.name).join(', ')}`)
    }
    if (waterOutstanding.length > 0) {
      lines.push(`⚠️ Water not topped up: ${waterOutstanding.map(s => s.name).join(', ')}`)
    }

    if (foodOutstanding.length === 0 && waterOutstanding.length === 0) {
      lines.push('All stations topped up with dry food and water.')
    }
  } else {
    // Evening round — topped up is binary
    const foodOutstanding = stationEntries.filter(s => !s.foodToppedUp)
    const waterOutstanding = stationEntries.filter(s => !s.waterToppedUp)

    if (foodOutstanding.length > 0) {
      lines.push(`⚠️ ${foodType.charAt(0).toUpperCase() + foodType.slice(1)} not topped up: ${foodOutstanding.map(s => s.name).join(', ')}`)
    }
    if (waterOutstanding.length > 0) {
      lines.push(`⚠️ Water not topped up: ${waterOutstanding.map(s => s.name).join(', ')}`)
    }

    if (foodOutstanding.length === 0 && waterOutstanding.length === 0) {
      lines.push(`All stations topped up with ${foodType} and water.`)
    }
  }

  if (input.stationNotes.length > 0) {
    lines.push('')
    lines.push('Station notes:')
    for (const { stationName, note } of input.stationNotes) {
      lines.push(`• ${stationName}: ${note.trim()}`)
    }
  }

  if (input.roundNotes.trim()) {
    lines.push('')
    lines.push(`Round notes: ${input.roundNotes.trim()}`)
  }

  const concerns = input.areas.flatMap(a => a.cats.filter(c => c.hasWelfareConcern))
  if (concerns.length > 0) {
    lines.push('')
    lines.push('⚠️ Welfare concerns flagged:')
    for (const cat of concerns) {
      lines.push(`• ${cat.name}: ${cat.welfareNotes}`)
    }
  }

  return lines.join('\n').trim()
}
