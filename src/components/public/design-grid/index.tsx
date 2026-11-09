import { DesignCard } from "@/components/public/design-card"
import type { DesignCardData } from "@/lib/presenters/design-card"

/** Grilla compartida con su skeleton (RecentDesignsSkeleton). */
export const designGridClass =
  "grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4"

interface Props {
  designs: DesignCardData[]
  emptyMessage?: string
  stagger?: boolean
}

export function DesignGrid({ designs, emptyMessage = "No hay recursos disponibles", stagger = false }: Props) {
  if (designs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 py-16 text-center">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={designGridClass}>
      {designs.map((d, i) => (
        <DesignCard
          key={d.slug}
          {...d}
          animationDelay={stagger ? i * 60 : undefined}
        />
      ))}
    </div>
  )
}
