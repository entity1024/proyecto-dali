import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCategories } from "@/lib/db/queries/categories"
import { DesignForm } from "@/components/admin/design-form"

export const metadata: Metadata = {
  title: "Nuevo Recurso — Admin",
}

export default async function NuevoRecursoPage() {
  const categories = await getCategories()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/recursos">
            <ChevronLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nuevo recurso</h1>
          <p className="text-sm text-muted-foreground">Creá un nuevo diseño descargable</p>
        </div>
      </div>

      <DesignForm
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  )
}
