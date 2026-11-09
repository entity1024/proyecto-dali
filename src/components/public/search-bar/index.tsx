"use client"

import { useRef, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get("q") ?? "")
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setValue(searchParams.get("q") ?? "")
  }, [searchParams])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    const q = value.trim()
    if (q) { params.set("q", q) } else { params.delete("q") }
    params.delete("pagina")
    router.push(`/catalogo?${params.toString()}`)
  }

  function handleClear() {
    setValue("")
    const params = new URLSearchParams(searchParams.toString())
    params.delete("q")
    params.delete("pagina")
    router.push(`/catalogo?${params.toString()}`)
    inputRef.current?.focus()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "relative flex w-full items-center rounded-xl border bg-background transition-all duration-200",
        focused
          ? "border-primary shadow-[0_0_0_3px_oklch(0.55_0.22_250_/_0.15)]"
          : "border-border hover:border-primary/40"
      )}
    >
      <Search
        className={cn(
          "ml-3 size-4 shrink-0 transition-colors duration-200",
          focused ? "text-primary" : "text-muted-foreground"
        )}
      />
      <input
        ref={inputRef}
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
          className="mr-2 rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-3.5" />
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
