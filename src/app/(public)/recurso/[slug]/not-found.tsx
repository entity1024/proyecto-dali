import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function RecursoNotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-6xl font-bold text-primary">404</p>
      <h1 className="mt-4 text-2xl font-bold">Recurso no encontrado</h1>
      <p className="mt-2 text-muted-foreground">
        Este recurso no existe o fue eliminado.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild>
          <Link href="/catalogo">Ver catálogo</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    </div>
  )
}
