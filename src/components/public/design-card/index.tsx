import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"

type Props = {
  slug: string
  name: string
  categoryName: string
  categorySlug: string
  thumbnailUrl: string | null
  animationDelay?: number
}

export function DesignCard({ slug, name, categoryName, thumbnailUrl, animationDelay }: Props) {
  return (
    <Link
      href={`/recurso/${slug}`}
      className="animate-fade-up group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
      style={animationDelay !== undefined ? { animationDelay: `${animationDelay}ms` } : undefined}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
            Sin imagen
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-primary/80 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <span className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-primary">
            Ver diseño
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1.5 p-3">
        <p className="line-clamp-2 text-sm font-semibold leading-snug">{name}</p>
        <Badge variant="secondary" className="w-fit text-xs">
          {categoryName}
        </Badge>
      </div>
    </Link>
  )
}
