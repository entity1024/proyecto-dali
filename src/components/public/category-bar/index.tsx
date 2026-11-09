"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { buildCatalogHref } from "@/lib/catalog-url"

type Category = {
  id: string
  name: string
  slug: string
}

interface Props {
  categories: Category[]
}

export function CategoryBar({ categories }: Props) {
  const searchParams = useSearchParams()
  const active = searchParams.get("categoria") ?? ""
  const q = searchParams.get("q") ?? ""

  const trackRef = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  function buildHref(slug: string) {
    return buildCatalogHref({ categoria: slug, q })
  }

  const updateArrows = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setCanPrev(el.scrollLeft > 4)
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    updateArrows()
    el.addEventListener("scroll", updateArrows, { passive: true })
    const ro = new ResizeObserver(updateArrows)
    ro.observe(el)
    return () => {
      el.removeEventListener("scroll", updateArrows)
      ro.disconnect()
    }
  }, [updateArrows])

  function scroll(dir: "prev" | "next") {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: dir === "next" ? 200 : -200, behavior: "smooth" })
  }

  const pillClass = (isActive: boolean) =>
    cn(
      "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors whitespace-nowrap",
      isActive
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
    )

  return (
    <div className="relative flex items-center gap-1">
      {/* Flecha anterior */}
      <button
        type="button"
        onClick={() => scroll("prev")}
        disabled={!canPrev}
        className={cn(
          "shrink-0 rounded-full border border-border p-1.5 text-muted-foreground transition-all hover:border-primary/40 hover:text-primary",
          !canPrev && "pointer-events-none opacity-0"
        )}
        aria-label="Categorías anteriores"
      >
        <ChevronLeft className="size-4" />
      </button>

      {/* Track */}
      <div
        ref={trackRef}
        className="flex flex-1 gap-2 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: "none" }}
      >
        <Link href={buildHref("")} className={pillClass(!active)}>
          Todos
        </Link>
        {categories.map((cat) => (
          <Link key={cat.id} href={buildHref(cat.slug)} className={pillClass(active === cat.slug)}>
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Flecha siguiente */}
      <button
        type="button"
        onClick={() => scroll("next")}
        disabled={!canNext}
        className={cn(
          "shrink-0 rounded-full border border-border p-1.5 text-muted-foreground transition-all hover:border-primary/40 hover:text-primary",
          !canNext && "pointer-events-none opacity-0"
        )}
        aria-label="Más categorías"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  )
}
