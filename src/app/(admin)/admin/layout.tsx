import { Suspense } from "react"
import { AdminNav } from "@/components/admin/admin-nav"

// Con `cacheComponents: true`, toda lectura no cacheada (Prisma, etc.) tiene que
// estar dentro de un <Suspense>. El admin siempre necesita datos frescos, así que
// la nav va en el shell estático y el contenido de cada página se streamea al request.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminNav />
      <div className="flex flex-1 flex-col">
        <main className="flex-1 p-6">
          <Suspense fallback={<AdminPageSkeleton />}>{children}</Suspense>
        </main>
      </div>
    </div>
  )
}

function AdminPageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-40 rounded-md bg-muted" />
        <div className="h-4 w-24 rounded-md bg-muted" />
      </div>
      <div className="h-64 rounded-xl bg-muted" />
    </div>
  )
}
