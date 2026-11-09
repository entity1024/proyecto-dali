"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState, useRef, useEffect, Suspense } from "react"
import { Search, X, Menu } from "lucide-react"
import { cn } from "@/lib/utils"

function SearchBox() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
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
        setFocused(false)
      }
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [open])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = value.trim()
    router.push(q ? `/catalogo?q=${encodeURIComponent(q)}` : "/catalogo")
    setOpen(false)
    setFocused(false)
  }

  return (
    <div className="relative flex items-center">
      {/* Botón lupa — siempre visible, desaparece cuando el input está abierto */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Buscar"
        className={cn(
          "rounded-full p-1.5 text-muted-foreground transition-all duration-200 hover:text-primary",
          open ? "pointer-events-none opacity-0 scale-75" : "opacity-100 scale-100"
        )}
        style={{ position: open ? "absolute" : "relative" }}
      >
        <Search className="size-5" />
      </button>

      {/* Input animado */}
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className={cn(
          "flex items-center overflow-hidden rounded-full border bg-background transition-all duration-300 ease-out",
          open ? "w-56 opacity-100 sm:w-72" : "w-0 opacity-0 border-transparent",
          focused ? "border-primary shadow-[0_0_0_3px_oklch(0.55_0.22_250_/_0.15)]" : "border-border"
        )}
        style={{ transformOrigin: "right center" }}
      >
        <Search className="ml-3 size-4 shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Buscar recursos..."
          className="h-9 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
        />
        {value && (
          <button
            type="button"
            onClick={() => { setValue(""); inputRef.current?.focus() }}
            className="mr-1 rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={() => { setOpen(false); setFocused(false) }}
          className="mr-2 rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Cerrar búsqueda"
        >
          <X className="size-4" />
        </button>
      </form>
    </div>
  )
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()

  if (!open) return null

  return (
    <div className="border-t border-border bg-background px-4 py-4 sm:hidden">
      <nav className="flex flex-col gap-3">
        <Link
          href="/"
          onClick={onClose}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === "/" ? "text-primary" : "text-muted-foreground"
          )}
        >
          Inicio
        </Link>
        <Link
          href="/catalogo"
          onClick={onClose}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname.startsWith("/catalogo") ? "text-primary" : "text-muted-foreground"
          )}
        >
          Catálogo
        </Link>
      </nav>
    </div>
  )
}

export function Header() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-lg font-bold tracking-tight text-primary">Plantillarte</span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden sm:flex items-center gap-6 ml-4">
          <Link
            href="/"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/" ? "text-primary" : "text-muted-foreground"
            )}
          >
            Inicio
          </Link>
          <Link
            href="/catalogo"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname.startsWith("/catalogo") ? "text-primary" : "text-muted-foreground"
            )}
          >
            Catálogo
          </Link>
        </nav>

        <div className="flex-1" />

        {/* Search */}
        <Suspense fallback={<div className="size-8" />}>
          <SearchBox />
        </Suspense>

        {/* Mobile menu button */}
        <button
          className="sm:hidden rounded p-1.5 text-muted-foreground hover:text-foreground"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Menú"
        >
          <Menu className="size-5" />
        </button>
      </div>

      {/* Mobile nav */}
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  )
}
