import type { Metadata } from "next"
import { Open_Sans } from "next/font/google"
import { Providers } from "@/components/providers"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const openSans = Open_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "Plantillarte — Recursos Gráficos Digitales",
    template: "%s | Plantillarte",
  },
  description:
    "Descargá gratis calendarios, tipografías, posters, invitaciones y plantillas digitales editables.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={openSans.variable}>
      <body className="flex min-h-screen flex-col bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
