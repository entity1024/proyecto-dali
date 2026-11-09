import Link from "next/link"
import { ArrowRight, Download, Gift, UserX } from "lucide-react"
import { Button } from "@/components/ui/button"

// Sección complementaria (FR-002): solo contenido que ya existía en la portada y el pie.
const ITEMS = [
  {
    icon: Gift,
    title: "Gratis",
    text: "Recursos gráficos gratuitos para tus proyectos.",
  },
  {
    icon: UserX,
    title: "Sin registro",
    text: "Descargá sin crear una cuenta.",
  },
  {
    icon: Download,
    title: "Listos para usar",
    text: "Calendarios, tipografías, posters, invitaciones y plantillas editables.",
  },
]

export function ValueProps() {
  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8">
          {ITEMS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-4 sm:flex-col sm:gap-3">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{text}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex justify-center">
          <Button size="lg" className="h-11 px-5" asChild>
            <Link href="/catalogo">
              Explorar el catálogo
              <ArrowRight className="ml-1 size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
