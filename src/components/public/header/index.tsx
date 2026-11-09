"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState, useRef, useEffect, useCallback, Suspense } from "react"
import { Search, X, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { buildCatalogHref } from "@/lib/catalog-url"

const NAV_LINKS = [
  { href: "/", label: "Inicio", isActive: (p: string) => p === "/" },
  { href: "/catalogo", label: "Catálogo", isActive: (p: string) => p.startsWith("/catalogo") },
]

const iconButtonClass =
  "flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 md:size-9"

function SearchBox() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(searchParams.get("q") ?? "")
  const inputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (open) {
      // Pequeño delay para que la animación de expansión arranque antes de hacer focus
      const t = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
  }, [open])

  // Cerrar al clickear fuera
  useEffect(() => {
    if (!open) return
    function onClickOutside(e: MouseEvent) {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [open])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    router.push(buildCatalogHref({ q: value }))
    setOpen(false)
  }

  return (
    <div className="relative flex items-center">
      {/* Botón lupa — visible mientras el input está cerrado */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Buscar"
        aria-expanded={open}
        className={cn(iconButtonClass, open && "pointer-events-none absolute opacity-0")}
      >
        <Search className="size-5" aria-hidden="true" />
      </button>

      {/* Input expandible */}
      <form
        ref={formRef}
        role="search"
        onSubmit={handleSubmit}
        className={cn(
          "flex items-center overflow-hidden rounded-full border bg-background transition-all duration-300 ease-out focus-within:border-primary focus-within:ring-3 focus-within:ring-ring/30",
          open ? "w-56 border-border opacity-100 sm:w-72" : "w-0 border-transparent opacity-0"
        )}
        aria-hidden={!open}
      >
        <Search className="ml-3 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          enterKeyHint="search"
          autoComplete="off"
          aria-label="Buscar recursos"
          tabIndex={open ? 0 : -1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          placeholder="Buscar recursos..."
          className="h-10 min-w-0 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
        />
        {value && (
          <button
            type="button"
            tabIndex={open ? 0 : -1}
            onClick={() => { setValue(""); inputRef.current?.focus() }}
            aria-label="Limpiar búsqueda"
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-3.5" aria-hidden="true" />
          </button>
        )}
        <button
          type="button"
          tabIndex={open ? 0 : -1}
          onClick={() => setOpen(false)}
          aria-label="Cerrar búsqueda"
          className="mr-1 flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </form>
    </div>
  )
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()

  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div id="mobile-menu" className="border-t border-border bg-background px-4 py-2 sm:hidden">
      <nav aria-label="Principal" className="flex flex-col">
        {NAV_LINKS.map(({ href, label, isActive }) => {
          const active = isActive(pathname)
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center rounded-lg px-2 text-base font-medium transition-colors hover:bg-muted",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              {label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

/**
 * Navegación de escritorio. Lee `usePathname()` para marcar la página actual, así que se renderiza
 * dentro de <Suspense> (en rutas dinámicas el pathname solo existe en runtime, research R3).
 * `pathname` en null = fallback del prerender: mismos enlaces, sin marca de activo (sin CLS).
 */
function DesktopNavLinks({ pathname }: { pathname: string | null }) {
  return (
    <>
      {NAV_LINKS.map(({ href, label, isActive }) => {
        const active = pathname !== null && isActive(pathname)
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-full px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              active ? "text-primary" : "text-muted-foreground"
            )}
          >
            {label}
          </Link>
        )
      })}
    </>
  )
}

function DesktopNav() {
  return <DesktopNavLinks pathname={usePathname()} />
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const closeMenu = useCallback(() => setMobileOpen(false), [])

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4 sm:px-6">
        {/* Marca */}
        <Link
          href="/"
          className="flex min-h-11 shrink-0 items-center rounded-lg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span className="text-xl font-bold tracking-tight text-primary">Plantillarte</span>
        </Link>

        {/* Navegación escritorio */}
        <nav aria-label="Principal" className="ml-6 hidden items-center gap-1 sm:flex">
          <Suspense fallback={<DesktopNavLinks pathname={null} />}>
            <DesktopNav />
          </Suspense>
        </nav>

        <div className="flex-1" />

        {/* Búsqueda */}
        <Suspense fallback={<div className="size-11 md:size-9" />}>
          <SearchBox />
        </Suspense>

        {/* Menú móvil */}
        <button
          type="button"
          className={cn(iconButtonClass, "sm:hidden")}
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
        >
          {mobileOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
        </button>
      </div>

      <Suspense fallback={null}>
        <MobileMenu open={mobileOpen} onClose={closeMenu} />
      </Suspense>
    </header>
  )
}
