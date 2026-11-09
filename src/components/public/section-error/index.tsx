"use client"

import Link from "next/link"
import { catchError, type ErrorInfo } from "next/error"
import { RotateCw } from "lucide-react"
import { Button } from "@/components/ui/button"

// Error boundary por sección de la portada (research R10).
// Nunca muestra `error.message`: el detalle técnico no llega a la UI (constitución, Principio III).

type Props = {
  title: string
  message: string
}

function SectionErrorFallback({ title, message }: Props, { retry }: ErrorInfo) {
  return (
    <section className="py-12 sm:py-16" aria-live="polite">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
        <div className="mt-6 flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-10 text-center">
          <p className="text-sm text-muted-foreground">{message}</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button className="h-11 px-4" onClick={() => retry()}>
              <RotateCw className="size-4" aria-hidden="true" />
              Reintentar
            </Button>
            <Button variant="ghost" className="h-11 px-4" asChild>
              <Link href="/catalogo">Ver el catálogo</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default catchError(SectionErrorFallback)
