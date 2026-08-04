interface CatEntry {
  name: string
  hasWelfareConcern: boolean
  welfareNotes: string
}

interface AreaEntry {
  area: string
  cats: CatEntry[]
}

export interface ReportInput {
  areas: AreaEntry[]
  generalNotes: string
  allFoodToppedUp: boolean
  allWaterToppedUp: boolean
  roundType: 'morning' | 'evening'
}

export function generateReport(input: ReportInput): string {
  const date = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  const roundLabel = input.roundType === 'morning' ? 'Morning Round' : 'Evening Round'
  const foodType = input.roundType === 'morning' ? 'dry food' : 'wet food'

  const lines: string[] = [`🐱 Cat Feeding Report – ${roundLabel} – ${date}`, '']

  for (const area of input.areas) {
    if (area.cats.length === 0) continue
    lines.push(area.area)
    for (const cat of area.cats) {
      lines.push(cat.name)
    }
    lines.push('')
  }

  lines.push('General')
  if (input.allFoodToppedUp && input.allWaterToppedUp) {
    lines.push(`All stations topped up with ${foodType} and water.`)
  } else if (input.allFoodToppedUp) {
    lines.push(`All stations topped up with ${foodType}.`)
  } else if (input.allWaterToppedUp) {
    lines.push('All stations topped up with water.')
  }

  if (input.generalNotes.trim()) {
    lines.push(input.generalNotes.trim())
  }

  const concerns = input.areas
    .flatMap(a => a.cats.filter(c => c.hasWelfareConcern))

  if (concerns.length > 0) {
    lines.push('')
    lines.push('⚠️ Welfare concerns flagged:')
    for (const cat of concerns) {
      lines.push(`• ${cat.name}: ${cat.welfareNotes}`)
    }
  }

  return lines.join('\n').trim()
}
