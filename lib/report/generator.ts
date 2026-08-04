interface CatEntry {
  name: string
  hasWelfareConcern: boolean
  welfareNotes: string
}

interface AreaEntry {
  area: string
  cats: CatEntry[]
}

interface StationFoodEntry {
  name: string
  foodLevel: 'empty' | 'medium' | 'full' | null
}

export interface ReportInput {
  areas: AreaEntry[]
  generalNotes: string
  allFoodToppedUp: boolean
  allWaterToppedUp: boolean
  roundType: 'morning' | 'evening'
  startedAt: string
  completedAt: string | null
  stationFoodLevels?: StationFoodEntry[]
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

  const lines: string[] = [
    `🐱 Cat Feeding Report – ${roundLabel} – ${date}`,
    completedTime ? `${startTime} – ${completedTime}` : `Started ${startTime}`,
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

  if (input.roundType === 'morning' && input.stationFoodLevels?.length) {
    const empty = input.stationFoodLevels.filter(s => s.foodLevel === 'empty')
    const medium = input.stationFoodLevels.filter(s => s.foodLevel === 'medium')
    const full = input.stationFoodLevels.filter(s => s.foodLevel === 'full')

    if (empty.length > 0) {
      lines.push(`⚠️ Empty on arrival: ${empty.map(s => s.name).join(', ')}`)
    }
    if (medium.length > 0) {
      lines.push(`Medium on arrival: ${medium.map(s => s.name).join(', ')}`)
    }
    if (full.length > 0) {
      lines.push(`Full on arrival: ${full.map(s => s.name).join(', ')}`)
    }
    if (input.allFoodToppedUp && input.allWaterToppedUp) {
      lines.push('All stations topped up with dry food and water.')
    } else if (input.allFoodToppedUp) {
      lines.push('All stations topped up with dry food.')
    } else if (input.allWaterToppedUp) {
      lines.push('All stations topped up with water.')
    }
  } else {
    if (input.allFoodToppedUp && input.allWaterToppedUp) {
      lines.push(`All stations topped up with ${foodType} and water.`)
    } else if (input.allFoodToppedUp) {
      lines.push(`All stations topped up with ${foodType}.`)
    } else if (input.allWaterToppedUp) {
      lines.push('All stations topped up with water.')
    }
  }

  if (input.generalNotes.trim()) {
    lines.push(input.generalNotes.trim())
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
