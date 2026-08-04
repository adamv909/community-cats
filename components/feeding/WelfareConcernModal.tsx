'use client'

import { useState, useEffect } from 'react'

interface WelfareConcernModalProps {
  catName: string
  existingNotes: string
  onSave: (notes: string) => void
  onClear: () => void
  onClose: () => void
}

export function WelfareConcernModal({ catName, existingNotes, onSave, onClear, onClose }: WelfareConcernModalProps) {
  const [notes, setNotes] = useState(existingNotes)

  useEffect(() => {
    setNotes(existingNotes)
  }, [existingNotes])

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card rounded-t-3xl p-6 pb-10 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Welfare concern</p>
            <h2 className="text-lg font-semibold">{catName}</h2>
          </div>
        </div>

        <textarea
          autoFocus
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Describe the concern — injury, illness, behaviour, weight loss…"
          className="w-full h-28 rounded-xl border border-border bg-background px-4 py-3 text-base resize-none focus:outline-none focus:ring-2 focus:ring-ring"
        />

        <div className="flex gap-3 mt-4">
          {existingNotes && (
            <button
              onClick={onClear}
              className="flex-1 h-12 rounded-xl border border-border text-muted-foreground text-sm font-medium"
            >
              Clear flag
            </button>
          )}
          <button
            onClick={() => notes.trim() && onSave(notes.trim())}
            disabled={!notes.trim()}
            className="flex-1 h-12 rounded-xl bg-amber-500 text-white font-semibold disabled:opacity-40"
          >
            Save concern
          </button>
        </div>
      </div>
    </div>
  )
}
