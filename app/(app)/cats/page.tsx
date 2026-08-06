export default function CatsPage() {
  return (
    <div className="p-4 max-w-lg mx-auto pt-6">
      <h1 className="text-2xl font-semibold">Cat Directory</h1>
      <p className="text-muted-foreground text-sm mt-1 mb-6">
        Bios, photos, and adoption status for every cat in the community live on the main site.
      </p>

      <a
        href="https://dream-team-jlt.vercel.app/cats"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between w-full p-4 rounded-2xl bg-primary text-primary-foreground font-semibold active:scale-[0.98] transition-transform"
      >
        <span>Open cat directory</span>
        <span aria-hidden>↗</span>
      </a>

      <p className="text-xs text-muted-foreground mt-3">
        Opens in your browser — full stories, TNR status, and adoption info for every cat.
      </p>
    </div>
  )
}
