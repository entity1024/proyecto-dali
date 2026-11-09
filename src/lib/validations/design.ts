import { z } from "zod"

// Módulo: Validaciones — esquemas Zod para diseños
// Se expanden al implementar el módulo admin

export const createDesignSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  categoryId: z.string().uuid(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  tags: z.array(z.string()).default([]),
})

export type CreateDesignInput = z.infer<typeof createDesignSchema>
