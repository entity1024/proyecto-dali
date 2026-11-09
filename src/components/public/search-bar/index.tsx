"use client"

import { useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { buildCatalogHref } from "@/lib/catalog-url"

export function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentQ = searchParams.get("q") ?? ""
  const [value, setValue] = useState(currentQ)
  const [syncedQ, setSyncedQ] = useState(currentQ)
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sincroniza el input cuando cambia `q` en la URL (navegación), sin efecto
  if (currentQ !== syncedQ) {
    setSyncedQ(currentQ)
    setValue(currentQ)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    router.push(buildCatalogHref({ q: value, base: searchParams }))
  }

  function handleClear() {
    setValue("")
    router.push(buildCatalogHref({ q: "", base: searchParams }))
    inputRef.current?.focus()
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={cn(
        "relative flex w-full items-center rounded-xl border bg-background transition-all duration-200",
        focused
          ? "border-primary ring-3 ring-ring/30"
          : "border-border hover:border-primary/40"
      )}
    >
      <Search
        aria-hidden="true"
        className={cn(
          "ml-3 size-4 shrink-0 transition-colors duration-200",
          focused ? "text-primary" : "text-muted-foreground"
        )}
      />
      <input
        ref={inputRef}
        type="text"
        enterKeyHint="search"
        autoComplete="off"
        aria-label="Buscar recursos"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Buscar recursos..."
        className="h-10 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Limpiar búsqueda"
          className="mr-1 flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-3.5" aria-hidden="true" />
        </button>
      )}
      <button
        type="submit"
        className={cn(
          "mr-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200",
          focused
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}
      >
        Buscar
      </button>
    </form>
  )
}
