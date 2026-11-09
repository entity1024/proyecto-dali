import { categoryItemClass, categoryListClass } from "@/components/public/category-section"
import { designGridClass } from "@/components/public/design-grid"

// Fallbacks de <Suspense> con la misma forma que el contenido final, para evitar CLS (research R3).

const pulse = "animate-pulse rounded-md bg-muted motion-reduce:animate-none"

function SectionHeaderSkeleton() {
  return (
    <div className="mb-6 space-y-2 sm:mb-8">
      <div className={`${pulse} h-8 w-40`} />
      <div className={`${pulse} h-4 w-56`} />
    </div>
  )
}

export function CategorySectionSkeleton() {
  return (
    <section className="py-12 sm:py-16" aria-hidden="true">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeaderSkeleton />
        <ul className={categoryListClass}>
          {Array.from({ length: 12 }, (_, i) => (
            <li key={i} className={categoryItemClass}>
              <div className="flex flex-col items-center gap-2 p-3">
                <div className={`${pulse} size-14 rounded-full`} />
                <div className={`${pulse} h-4 w-20`} />
                <div className={`${pulse} h-3 w-14`} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function RecentDesignsSkeleton() {
  return (
    <section className="bg-muted/30 py-12 sm:py-16" aria-hidden="true">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeaderSkeleton />
        <div className={designGridClass}>
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className={`${pulse} aspect-4/3 w-full rounded-xl`} />
              <div className={`${pulse} h-4 w-3/4`} />
              <div className={`${pulse} h-3 w-1/3`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
