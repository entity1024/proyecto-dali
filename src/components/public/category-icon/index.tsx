import {
  BookOpen,
  Calendar,
  FileText,
  Flower2,
  Frame,
  Image,
  LayoutGrid,
  LayoutTemplate,
  Mail,
  Mountain,
  Palette,
  Shapes,
  Sparkles,
  Tag,
  Type,
  type LucideIcon,
} from "lucide-react"

// Ícono por categoría (research R2). Toda categoría fuera del mapa usa `LayoutGrid` (FR-009).
const ICONS: Record<string, LucideIcon> = {
  calendarios: Calendar,
  "tipografias-y-alfabetos": Type,
  "material-escolar": BookOpen,
  banners: Image,
  posters: Palette,
  invitaciones: Mail,
  "papeleria-digital": FileText,
  etiquetas: Tag,
  marcos: Frame,
  fondos: Mountain,
  patrones: Shapes,
  iconos: Sparkles,
  plantillas: LayoutTemplate,
  "elementos-decorativos": Flower2,
}

export function CategoryIcon({ slug, className }: { slug: string; className?: string }) {
  const Icon = ICONS[slug] ?? LayoutGrid
  return <Icon className={className} aria-hidden="true" />
}
