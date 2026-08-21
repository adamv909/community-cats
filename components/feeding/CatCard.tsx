'use client'

const PLACEHOLDER_PALETTES = [
  { bg: '#FDECD2', fg: '#C2703C' },
  { bg: '#D6EAF8', fg: '#2471A3' },
  { bg: '#D5F5E3', fg: '#1E8449' },
  { bg: '#F9EBEA', fg: '#C0392B' },
  { bg: '#EAE4F7', fg: '#6C3483' },
  { bg: '#FEF9E7', fg: '#B7950B' },
  { bg: '#E8F8F5', fg: '#148F77' },
  { bg: '#FDEDEC', fg: '#A93226' },
]

function placeholderColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  return PLACEHOLDER_PALETTES[hash % PLACEHOLDER_PALETTES.length]
}

interface CatCardProps {
  cat: {
    id: string
    name: string
    photo_url: string | null
    health_notes?: string | null
    feeding_instructions?: string | null
    safety_notes?: string | null
  }
  seen: boolean
  hasWelfareConcern: boolean
  onToggle: () => void
  onWelfareConcern: () => void
}

export function CatCard({ cat, seen, hasWelfareConcern, onToggle, onWelfareConcern }: CatCardProps) {
  const palette = placeholderColor(cat.name)

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full">
        <button
          onClick={onToggle}
          className={`relative w-full aspect-square rounded-2xl overflow-hidden border-2 transition-all active:scale-95 ${
            seen
              ? 'border-emerald-500 ring-2 ring-emerald-500/30'
              : 'border-border'
          }`}
        >
          {cat.photo_url ? (
            <img
              src={cat.photo_url}
              alt={cat.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ backgroundColor: palette.bg }}
            >
              <svg viewBox="0 0 48 44" width="72" height="66" style={{ color: palette.fg }} fill="currentColor" aria-hidden>
                {/* ears */}
                <polygon points="6,18 12,4 18,18" />
                <polygon points="30,18 36,4 42,18" />
                {/* head */}
                <ellipse cx="24" cy="28" rx="18" ry="15" />
                {/* eyes */}
                <ellipse cx="17" cy="25" rx="2.5" ry="2.8" fill="white" opacity="0.9" />
                <ellipse cx="31" cy="25" rx="2.5" ry="2.8" fill="white" opacity="0.9" />
                <circle cx="17.6" cy="25.6" r="1.3" fill={palette.fg} />
                <circle cx="31.6" cy="25.6" r="1.3" fill={palette.fg} />
                {/* nose + mouth */}
                <ellipse cx="24" cy="30" rx="1.4" ry="1" fill="white" opacity="0.8" />
                <path d="M21 32 Q24 35 27 32" stroke="white" strokeWidth="1.3" fill="none" opacity="0.7" strokeLinecap="round" />
              </svg>
            </div>
          )}

          {seen && (
            <div className="absolute inset-0 bg-emerald-500/25 flex items-end justify-end p-2">
              <div className="bg-emerald-500 rounded-full w-7 h-7 flex items-center justify-center shadow">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          )}
        </button>

        {seen && (
          <button
            onClick={onWelfareConcern}
            className={`absolute top-1.5 right-1.5 w-8 h-8 rounded-full flex items-center justify-center text-sm shadow transition-colors ${
              hasWelfareConcern
                ? 'bg-amber-500 text-white'
                : 'bg-black/30 text-white hover:bg-amber-500'
            }`}
            title="Flag welfare concern"
          >
            ⚠️
          </button>
        )}
      </div>

      <span className="mt-1.5 text-sm font-medium text-center leading-tight truncate w-full px-1">
        {cat.name}
      </span>

      {cat.safety_notes && (
        <span className="mt-0.5 text-[10px] text-red-600 dark:text-red-400 font-medium text-center leading-tight px-1">
          ⚠️ {cat.safety_notes}
        </span>
      )}
      {cat.feeding_instructions && (
        <span className="mt-0.5 text-[10px] text-sky-600 dark:text-sky-400 font-medium text-center leading-tight px-1">
          ℹ️ {cat.feeding_instructions}
        </span>
      )}
      {cat.health_notes && (
        <span className="mt-0.5 text-[10px] text-amber-600 dark:text-amber-400 font-medium text-center leading-tight px-1">
          🩹 {cat.health_notes}
        </span>
      )}
      {hasWelfareConcern && (
        <span className="text-[10px] text-amber-500 font-semibold uppercase tracking-wide">Concern</span>
      )}
    </div>
  )
}
