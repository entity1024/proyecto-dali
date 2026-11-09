import { redirect } from "next/navigation"

// El dashboard redirige al listado de recursos
export default function AdminPage() {
  redirect("/admin/recursos")
}
