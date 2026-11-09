import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

async function main() {
  console.log("Seeding database...")

  // ─── Admin user ────────────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: "admin@plantillarte.com" },
    update: { passwordHash: await hashPassword("admin1234") },
    create: {
      email: "admin@plantillarte.com",
      passwordHash: await hashPassword("admin1234"),
      name: "Administrador",
      role: "admin",
    },
  })
  console.log(`✓ Admin user: ${admin.email}`)

  // ─── Categorías ────────────────────────────────────────────────────────────
  const categories = [
    {
      name: "Calendarios",
      slug: "calendarios",
      description: "Calendarios para imprimir y digitales en distintos formatos y estilos.",
      displayOrder: 1,
    },
    {
      name: "Tipografías y Alfabetos",
      slug: "tipografias-y-alfabetos",
      description: "Alfabetos gráficos, lettering y tipografías decorativas.",
      displayOrder: 2,
    },
    {
      name: "Material Escolar",
      slug: "material-escolar",
      description: "Recursos educativos, carpetas, etiquetas y material para el aula.",
      displayOrder: 3,
    },
    {
      name: "Banners",
      slug: "banners",
      description: "Banners y encabezados para redes sociales, blogs y presentaciones.",
      displayOrder: 4,
    },
    {
      name: "Posters",
      slug: "posters",
      description: "Afiches y posters para imprimir o compartir digitalmente.",
      displayOrder: 5,
    },
    {
      name: "Invitaciones",
      slug: "invitaciones",
      description: "Invitaciones para cumpleaños, casamientos, eventos y celebraciones.",
      displayOrder: 6,
    },
    {
      name: "Plantillas",
      slug: "plantillas",
      description: "Plantillas editables para distintos usos y ocasiones.",
      displayOrder: 7,
    },
    {
      name: "Elementos Decorativos",
      slug: "elementos-decorativos",
      description: "Cliparts, marcos, fondos y recursos gráficos para tus diseños.",
      displayOrder: 8,
    },
  ]

  for (const category of categories) {
    const result = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    })
    console.log(`✓ Categoría: ${result.name}`)
  }

  console.log("\nSeed completado.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
