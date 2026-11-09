import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HeroSearch } from "@/components/public/hero-search"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background pt-10 pb-4 sm:pt-16 sm:pb-6 md:pt-20 md:pb-8">
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
        <p className="animate-fade-up delay-0 mb-3 text-xs font-semibold uppercase tracking-widest text-primary sm:text-sm">
          Recursos gráficos gratuitos
        </p>
        <h1 className="animate-fade-up delay-100 text-3xl font-extrabold tracking-tight text-balance sm:text-5xl md:text-6xl">
          Diseños listos para{" "}
          <span className="text-primary">descargar y usar</span>
        </h1>
        <p className="animate-fade-up delay-200 mx-auto mt-4 max-w-2xl text-base text-muted-foreground text-balance sm:mt-6 sm:text-lg">
          Calendarios, tipografías, posters, invitaciones y plantillas editables.
          Todo gratis, sin registro.
        </p>

        <div className="animate-fade-up delay-300 mt-6 sm:mt-10">
          <HeroSearch />
        </div>

        <div className="animate-fade-up delay-300 mt-5 flex flex-wrap items-center justify-center gap-2 sm:mt-6">
          <Button variant="ghost" className="h-11 px-4" asChild>
            <Link href="/catalogo">
              Explorar recursos
              <ArrowRight className="ml-1 size-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button variant="ghost" className="h-11 px-4" asChild>
            <Link href="#categorias">Ver categorías</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
