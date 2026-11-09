"use client"

import { Suspense } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { LayoutGrid, Tags, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navItems = [
  { href: "/admin/recursos", label: "Recursos", icon: LayoutGrid },
  { href: "/admin/categorias", label: "Categorías", icon: Tags },
]

export function AdminNav() {
  return (
    <aside className="flex w-56 flex-col border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-border px-4">
        <Link href="/admin/recursos" className="text-sm font-semibold text-foreground">
          Plantillarte
          <span className="ml-1.5 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            Admin
          </span>
        </Link>
      </div>

      {/* Nav items — usePathname() espera al request en rutas con params dinámicos
          (ej. /admin/recursos/[id]/editar), por eso va dentro de su propio Suspense.
          El fallback muestra los mismos links sin estado activo. */}
      <nav className="flex-1 space-y-0.5 p-2">
        <Suspense fallback={<NavLinks pathname={null} />}>
          <ActiveNavLinks />
        </Suspense>
      </nav>

      {/* Logout */}
      <div className="border-t border-border p-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2.5 text-sm text-muted-foreground hover:text-foreground"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
        >
          <LogOut className="size-4" />
          Cerrar sesión
        </Button>
      </div>
    </aside>
  )
}

function ActiveNavLinks() {
  const pathname = usePathname()
  return <NavLinks pathname={pathname} />
}

function NavLinks({ pathname }: { pathname: string | null }) {
  return (
    <>
      {navItems.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            pathname?.startsWith(href)
              ? "bg-sidebar-primary text-sidebar-primary-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          <Icon className="size-4" />
          {label}
        </Link>
      ))}
    </>
  )
}
