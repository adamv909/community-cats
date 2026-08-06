'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchAllCats } from '@/lib/supabase/services/cats'

const PLACEHOLDER_PALETTES = [
  { bg: '#FDECD2', fg: '#C2703C' },
  { bg: '#D6EAF8', fg: '#2471A3' },
  { bg: '#D5F5E3', fg: '#1E8449' },
  { bg: '#F9EBEA', fg: '#A93226' },
  { bg: '#EAE4F7', fg: '#6C3483' },
  { bg: '#FEF9E7', fg: '#B7950B' },
  { bg: '#E8F8F5', fg: '#148F77' },
  { bg: '#FDEDEC', fg: '#C0392B' },
]

function placeholderColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  return PLACEHOLDER_PALETTES[hash % PLACEHOLDER_PALETTES.length]
}

interface Props {
  excludeCatIds: string[]
  selectedCatIds: string[]
  onAdd: (catId: string) => void
  onRemove: (catId: string) => void
  onClose: () => void
}

export function GuestCatModal({ excludeCatIds, selectedCatIds, onAdd, onRemove, onClose }: Props) {
  const [search, setSearch] = useState('')

  const { data: allCats = [], isLoading } = useQuery({
    queryKey: ['all-cats'],
    queryFn: fetchAllCats,
  })

  const filtered = allCats
    .filter(c => !excludeCatIds.includes(c.id))
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card rounded-t-3xl shadow-xl flex flex-col" style={{ maxHeight: '80vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Cats from other stations</p>
            <h2 className="text-lg font-semibold">Add existing cat</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground text-xl leading-none px-2">✕</button>
        </div>

        {/* Search */}
        <div className="px-5 pb-3">
          <input
            autoFocus
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search cats…"
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Cat grid */}
        <div className="overflow-y-auto px-5 pb-8">
          {isLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">No cats found</div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {filtered.map(cat => {
                const selected = selectedCatIds.includes(cat.id)
                const palette = placeholderColor(cat.name)
                return (
                  <button
                    key={cat.id}
                    onClick={() => selected ? onRemove(cat.id) : onAdd(cat.id)}
                    className={`relative flex flex-col items-center gap-1.5 p-2 rounded-2xl border-2 text-center transition-all active:scale-[0.98] ${
                      selected
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-border bg-card'
                    }`}
                  >
                    {selected && (
                      <span className="absolute top-1 right-1 z-10 flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white text-xs">✓</span>
                    )}
                    {cat.photo_url ? (
                      <img
                        src={cat.photo_url}
                        alt={cat.name}
                        className="w-full aspect-square rounded-xl object-cover"
                      />
                    ) : (
                      <div
                        className="w-full aspect-square rounded-xl flex items-center justify-center"
                        style={{ background: palette.bg }}
                      >
                        <svg viewBox="0 0 40 40" width="60%" height="60%" xmlns="http://www.w3.org/2000/svg">
                          <polygon points="8,16 14,6 20,14" fill={palette.fg} opacity="0.9" />
                          <polygon points="32,16 26,6 20,14" fill={palette.fg} opacity="0.9" />
                          <ellipse cx="20" cy="24" rx="13" ry="11" fill={palette.fg} />
                          <circle cx="15" cy="23" r="2.2" fill={palette.bg} />
                          <circle cx="25" cy="23" r="2.2" fill={palette.bg} />
                          <ellipse cx="20" cy="27" rx="1.5" ry="1" fill={palette.bg} opacity="0.7" />
                        </svg>
                      </div>
                    )}
                    <p className={`font-semibold text-sm w-full truncate ${selected ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                      {cat.name}
                    </p>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
