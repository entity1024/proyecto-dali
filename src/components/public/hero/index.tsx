import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center">
        <p className="animate-fade-up delay-0 mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
          Recursos gráficos gratuitos
        </p>
        <h1 className="animate-fade-up delay-100 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
          Diseños listos para{" "}
          <span className="text-primary">descargar y usar</span>
        </h1>
        <p className="animate-fade-up delay-200 mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          Calendarios, tipografías, posters, invitaciones y plantillas editables.
          Todo gratis, sin registro.
        </p>
        <div className="animate-fade-up delay-300 mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/catalogo">
              Explorar recursos
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="#categorias">Ver categorías</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
