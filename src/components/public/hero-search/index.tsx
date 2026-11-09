"use client"

import { useId, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, X } from "lucide-react"
import { buildCatalogHref } from "@/lib/catalog-url"

export function HeroSearch() {
  const router = useRouter()
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    router.push(buildCatalogHref({ q: value }))
  }

  function handleClear() {
    setValue("")
    inputRef.current?.focus()
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="mx-auto flex min-h-14 w-full max-w-2xl items-center gap-1 rounded-full border border-border bg-background p-1.5 pl-5 shadow-md transition-shadow focus-within:border-primary focus-within:ring-3 focus-within:ring-ring/30 hover:shadow-lg"
    >
      <label htmlFor={inputId} className="sr-only">
        Buscar recursos
      </label>
      <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
      <input
        ref={inputRef}
        id={inputId}
        type="text"
        enterKeyHint="search"
        autoComplete="off"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Buscá un recurso"
        className="h-11 min-w-0 flex-1 bg-transparent px-2 text-base outline-none placeholder:text-muted-foreground"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Limpiar búsqueda"
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      )}
      <button
        type="submit"
        className="flex h-11 shrink-0 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Search className="size-4" aria-hidden="true" />
        Buscar
      </button>
    </form>
  )
}
