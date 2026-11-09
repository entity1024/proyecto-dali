import type { Metadata } from "next"
import { LoginForm } from "./login-form"

export const metadata: Metadata = {
  title: "Acceso — Plantillarte Admin",
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="inline-flex size-12 items-center justify-center rounded-xl bg-primary mb-3">
            <span className="text-xl font-bold text-primary-foreground">P</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Plantillarte
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Panel de administración</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold text-foreground">Iniciar sesión</h2>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
