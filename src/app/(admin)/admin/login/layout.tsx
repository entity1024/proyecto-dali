// Override del admin layout para la página de login — sin AdminNav
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-muted">{children}</div>
}
