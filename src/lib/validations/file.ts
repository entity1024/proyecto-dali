import { z } from "zod"

// Módulo: Validaciones — esquemas Zod para uploads de archivos

const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const
const FILE_MIME_TYPES = [
  "application/pdf",
  "image/vnd.adobe.photoshop",
  "application/postscript",
  "image/jpeg",
  "image/png",
  "application/zip",
] as const

export const imageUploadSchema = z.object({
  mimeType: z.enum(IMAGE_MIME_TYPES),
  sizeBytes: z.number().max(10 * 1024 * 1024, "Máximo 10MB por imagen"),
})

export const fileUploadSchema = z.object({
  mimeType: z.enum(FILE_MIME_TYPES),
  sizeBytes: z.number().max(200 * 1024 * 1024, "Máximo 200MB por archivo"),
  displayName: z.string().min(1).max(255).optional(),
})
