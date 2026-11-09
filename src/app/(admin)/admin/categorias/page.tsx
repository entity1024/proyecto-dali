import type { Metadata } from "next"
import { getCategories } from "@/lib/db/queries/categories"
import { CategoriesClient } from "./categories-client"

export const metadata: Metadata = { title: "Categorías — Admin" }

export default async function AdminCategoriasPage() {
  const categories = await getCategories()
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Categorías</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {categories.length} categoría{categories.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
      <CategoriesClient categories={categories} />
    </div>
  )
}
