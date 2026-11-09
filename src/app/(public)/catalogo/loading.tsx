import { designGridClass } from "@/components/public/design-grid"

export default function CatalogoLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Encabezado skeleton */}
      <div className="mb-6 space-y-2">
        <div className="h-9 w-32 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-48 animate-pulse rounded bg-muted" />
      </div>

      {/* Filtros skeleton */}
      <div className="mb-6 flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 w-24 animate-pulse rounded-full bg-muted" />
        ))}
      </div>

      {/* Grid skeleton */}
      {/* Misma grilla y forma que DesignGrid/DesignCard para evitar CLS */}
      <div className={designGridClass}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="aspect-4/3 animate-pulse rounded-xl bg-muted motion-reduce:animate-none" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted motion-reduce:animate-none" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-muted motion-reduce:animate-none" />
          </div>
        ))}
      </div>
    </div>
  )
}
