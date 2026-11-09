import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding example designs...")

  // Obtener categorías
  const cats = await prisma.category.findMany()
  const bySlug = Object.fromEntries(cats.map((c) => [c.slug, c.id]))

  const now = new Date()

  const designs = [
    // ── Calendarios (5) ──────────────────────────────────────────────────────
    {
      name: "Calendario 2025 Minimalista",
      slug: "calendario-2025-minimalista",
      description: "Calendario anual 2025 con diseño minimalista en blanco y negro. Ideal para imprimir en A4.",
      categorySlug: "calendarios",
      tags: ["2025", "minimalista", "blanco y negro", "imprimible"],
    },
    {
      name: "Calendario 2025 Acuarela",
      slug: "calendario-2025-acuarela",
      description: "Calendario mensual 2025 con ilustraciones en acuarela. Perfecto para decorar tu espacio.",
      categorySlug: "calendarios",
      tags: ["2025", "acuarela", "colorido", "mensual"],
    },
    {
      name: "Calendario Escolar 2025",
      slug: "calendario-escolar-2025",
      description: "Planificador escolar con fechas importantes, feriados y espacio para notas.",
      categorySlug: "calendarios",
      tags: ["2025", "escolar", "planificador", "educación"],
    },
    {
      name: "Calendario de Adviento",
      slug: "calendario-de-adviento",
      description: "Calendario de adviento imprimible con 24 casilleros para personalizar.",
      categorySlug: "calendarios",
      tags: ["navidad", "adviento", "diciembre", "imprimible"],
    },
    {
      name: "Planner Semanal 2025",
      slug: "planner-semanal-2025",
      description: "Planificador semanal con secciones para tareas, hábitos y notas. Estilo moderno.",
      categorySlug: "calendarios",
      tags: ["planner", "semanal", "organización", "2025"],
    },

    // ── Tipografías (3) ──────────────────────────────────────────────────────
    {
      name: "Alfabeto Acuarela Floral",
      slug: "alfabeto-acuarela-floral",
      description: "Letras decorativas en acuarela con motivos florales. Ideal para tarjetas y carteles.",
      categorySlug: "tipografias-y-alfabetos",
      tags: ["alfabeto", "acuarela", "floral", "lettering"],
    },
    {
      name: "Letras Boho Estampado",
      slug: "letras-boho-estampado",
      description: "Tipografía bohemia con texturas y estampados étnicos. Perfecta para decoración.",
      categorySlug: "tipografias-y-alfabetos",
      tags: ["boho", "lettering", "estampado", "decoración"],
    },
    {
      name: "Monogramas Clásicos",
      slug: "monogramas-clasicos",
      description: "Set de monogramas elegantes en estilo clásico para personalizar tus proyectos.",
      categorySlug: "tipografias-y-alfabetos",
      tags: ["monograma", "clásico", "elegante", "personalización"],
    },

    // ── Material Escolar (3) ─────────────────────────────────────────────────
    {
      name: "Etiquetas para Útiles Escolares",
      slug: "etiquetas-utiles-escolares",
      description: "Pack de etiquetas imprimibles para útiles y cuadernos con diseño divertido.",
      categorySlug: "material-escolar",
      tags: ["etiquetas", "útiles", "imprimible", "niños"],
    },
    {
      name: "Carátulas para Materias",
      slug: "caratulas-para-materias",
      description: "10 carátulas coloridas para las materias escolares más comunes. Listas para imprimir.",
      categorySlug: "material-escolar",
      tags: ["carátulas", "materias", "escuela", "colorido"],
    },
    {
      name: "Diplomas y Certificados",
      slug: "diplomas-y-certificados",
      description: "Plantillas de diplomas y certificados editables para premiar logros escolares.",
      categorySlug: "material-escolar",
      tags: ["diploma", "certificado", "premio", "escuela"],
    },

    // ── Invitaciones (3) ─────────────────────────────────────────────────────
    {
      name: "Invitación Cumpleaños Floral",
      slug: "invitacion-cumpleanos-floral",
      description: "Invitación de cumpleaños con diseño floral en tonos rosados y verdes.",
      categorySlug: "invitaciones",
      tags: ["cumpleaños", "floral", "rosado", "invitación"],
    },
    {
      name: "Invitación Baby Shower Celeste",
      slug: "invitacion-baby-shower-celeste",
      description: "Pack de invitaciones para baby shower con diseño tierno en azul y blanco.",
      categorySlug: "invitaciones",
      tags: ["baby shower", "celeste", "bebé", "invitación"],
    },
    {
      name: "Invitación Casamiento Elegante",
      slug: "invitacion-casamiento-elegante",
      description: "Tarjeta de casamiento minimalista y elegante en blanco y dorado.",
      categorySlug: "invitaciones",
      tags: ["casamiento", "elegante", "boda", "dorado"],
    },

    // ── Posters (3) ──────────────────────────────────────────────────────────
    {
      name: "Poster Motivacional Minimalista",
      slug: "poster-motivacional-minimalista",
      description: "Set de 3 posters motivacionales con frases inspiradoras y diseño minimalista.",
      categorySlug: "posters",
      tags: ["motivacional", "minimalista", "frases", "decoración"],
    },
    {
      name: "Poster Botánico para Cocina",
      slug: "poster-botanico-para-cocina",
      description: "Ilustraciones botánicas de hierbas y especias para imprimir y decorar la cocina.",
      categorySlug: "posters",
      tags: ["botánico", "cocina", "hierbas", "decoración"],
    },
    {
      name: "Poster Mapa de Argentina",
      slug: "poster-mapa-de-argentina",
      description: "Mapa artístico de Argentina con provincias en colores. Ideal para enmarcar.",
      categorySlug: "posters",
      tags: ["mapa", "argentina", "provincias", "artístico"],
    },

    // ── Plantillas (2) ───────────────────────────────────────────────────────
    {
      name: "CV Moderno Profesional",
      slug: "cv-moderno-profesional",
      description: "Plantilla de currículum vitae con diseño moderno y profesional. Fácil de editar.",
      categorySlug: "plantillas",
      tags: ["cv", "currículum", "trabajo", "profesional"],
    },
    {
      name: "Menú para Restaurant",
      slug: "menu-para-restaurant",
      description: "Plantilla editable de menú para restaurantes y cafeterías. Incluye portada y secciones.",
      categorySlug: "plantillas",
      tags: ["menú", "restaurant", "gastronomía", "editable"],
    },

    // ── Elementos Decorativos (1) ────────────────────────────────────────────
    {
      name: "Pack Cliparts Florales",
      slug: "pack-cliparts-florales",
      description: "Colección de 30 cliparts florales en PNG con fondo transparente para tus diseños.",
      categorySlug: "elementos-decorativos",
      tags: ["clipart", "floral", "png", "transparente"],
    },
  ]

  let created = 0
  for (const d of designs) {
    const categoryId = bySlug[d.categorySlug]
    if (!categoryId) {
      console.warn(`⚠ Categoría no encontrada: ${d.categorySlug}`)
      continue
    }

    const existing = await prisma.design.findUnique({ where: { slug: d.slug } })
    if (existing) {
      console.log(`– Ya existe: ${d.name}`)
      continue
    }

    await prisma.design.create({
      data: {
        name: d.name,
        slug: d.slug,
        description: d.description,
        categoryId,
        status: "published",
        tags: d.tags,
        publishedAt: new Date(now.getTime() - created * 60 * 60 * 1000), // escalonados en el tiempo
        downloadCount: Math.floor(Math.random() * 300),
      },
    })
    console.log(`✓ ${d.name}`)
    created++
  }

  console.log(`\n${created} diseños creados.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
