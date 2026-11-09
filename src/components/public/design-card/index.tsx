import Link from "next/link"
import Image from "next/image"
import { ImageOff } from "lucide-react"
import type { DesignCardData } from "@/lib/presenters/design-card"

type Props = DesignCardData & {
  animationDelay?: number
}

export function DesignCard({ slug, name, categoryName, thumbnailUrl, animationDelay }: Props) {
  return (
    <Link
      href={`/recurso/${slug}`}
      className="animate-fade-up group flex flex-col gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      style={animationDelay !== undefined ? { animationDelay: `${animationDelay}ms` } : undefined}
    >
      {/* Vista previa: protagonista de la tarjeta */}
      <div className="relative aspect-4/3 overflow-hidden rounded-xl bg-muted">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageOff className="size-6" aria-hidden="true" />
            <span className="text-xs">Sin imagen</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-0.5 px-0.5">
        <p className="line-clamp-2 text-sm font-semibold leading-snug underline-offset-2 group-hover:underline sm:text-base">
          {name}
        </p>
        <p className="text-sm text-muted-foreground">{categoryName}</p>
      </div>
    </Link>
  )
}
