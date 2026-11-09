import { z } from "zod"

// Módulo: Validaciones — parámetros de búsqueda públicos del catálogo (/catalogo)
// Valores inválidos de `pagina` caen en 1; los válidos no cambian de resultado.

export const catalogSearchParamsSchema = z.object({
  q: z.string().optional().catch(undefined),
  categoria: z.string().optional().catch(undefined),
  pagina: z.coerce.number().int().min(1).catch(1),
})

export type CatalogSearchParams = z.infer<typeof catalogSearchParamsSchema>
