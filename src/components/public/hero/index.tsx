import { HeroSearch } from "@/components/public/hero-search"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background pt-8 pb-6 sm:pt-10 sm:pb-6">
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
        <p className="animate-fade-up delay-0 mb-2 text-xs font-semibold uppercase tracking-widest text-primary sm:text-sm">
          Recursos gráficos gratuitos
        </p>
        <h1 className="animate-fade-up delay-100 text-3xl font-extrabold tracking-tight text-balance sm:text-4xl md:text-5xl">
          Diseños listos para{" "}
          <span className="text-primary">descargar y usar</span>
        </h1>
        <p className="animate-fade-up delay-200 mx-auto mt-3 max-w-3xl text-base text-muted-foreground text-balance sm:mt-4 sm:text-lg">
          Calendarios, tipografías, posters, invitaciones y plantillas editables.
          Todo gratis, sin registro.
        </p>

        <div className="animate-fade-up delay-300 mt-5 sm:mt-6">
          <HeroSearch />
        </div>
      </div>
    </section>
  )
}
