import type { Metadata } from "next"
import { Suspense } from "react"
import { Hero } from "@/components/public/hero"
import { CategorySection } from "@/components/public/category-section"
import { RecentDesigns } from "@/components/public/recent-designs"
import { ValueProps } from "@/components/public/value-props"
import SectionError from "@/components/public/section-error"
import {
  CategorySectionSkeleton,
  RecentDesignsSkeleton,
} from "@/components/public/section-skeletons"

export const metadata: Metadata = {
  title: "Plantillarte — Recursos Gráficos Digitales",
}

// Orden de secciones: FR-001. Cada sección con datos tiene carga, vacío y error propios (research R3, R10).
export default function HomePage() {
  return (
    <>
      <Hero />

      <SectionError title="Categorías" message="No pudimos cargar las categorías">
        <Suspense fallback={<CategorySectionSkeleton />}>
          <CategorySection />
        </Suspense>
      </SectionError>

      <SectionError title="Novedades" message="No pudimos cargar las novedades">
        <Suspense fallback={<RecentDesignsSkeleton />}>
          <RecentDesigns />
        </Suspense>
      </SectionError>

      <ValueProps />
    </>
  )
}
