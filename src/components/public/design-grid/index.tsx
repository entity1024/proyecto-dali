import { DesignCard } from "@/components/public/design-card"

type Design = {
  slug: string
  name: string
  categoryName: string
  categorySlug: string
  thumbnailUrl: string | null
}

interface Props {
  designs: Design[]
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
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
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
