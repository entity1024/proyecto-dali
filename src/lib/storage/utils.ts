import path from "path"
import { randomUUID } from "crypto"

// ─── MIME types ───────────────────────────────────────────────────────────────

export const ALLOWED_IMAGE_MIME_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
}

export const ALLOWED_FILE_MIME_TYPES: Record<string, string> = {
  "application/pdf": ".pdf",
  "image/vnd.adobe.photoshop": ".psd",
  "application/postscript": ".eps",
  "application/illustrator": ".ai",
  "application/x-photoshop": ".psd",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "application/zip": ".zip",
  "application/x-zip-compressed": ".zip",
}

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024  // 10 MB
export const MAX_FILE_SIZE = 200 * 1024 * 1024  // 200 MB

// ─── Filename sanitization ────────────────────────────────────────────────────

export function sanitizeFilename(filename: string): string {
  const ext = path.extname(filename).toLowerCase()
  const base = path.basename(filename, ext)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "file"
  return `${base}${ext}`
}

// ─── Storage key generation ───────────────────────────────────────────────────

export function generateImageKey(originalFilename: string): string {
  const sanitized = sanitizeFilename(originalFilename)
  const uuid = randomUUID()
  return `previews/${uuid}/${uuid}-${sanitized}`
}

export function generateThumbnailKey(imageKey: string): string {
  const dir = path.dirname(imageKey)
  const uuid = dir.split("/")[1]
  return `thumbnails/${uuid}/thumb.webp`
}

export function generateFileKey(originalFilename: string): string {
  const sanitized = sanitizeFilename(originalFilename)
  const uuid = randomUUID()
  return `downloads/${uuid}/${uuid}-${sanitized}`
}

// ─── Format detection ─────────────────────────────────────────────────────────

export function detectFileFormat(mimeType: string, filename: string): string {
  const ext = path.extname(filename).toLowerCase().replace(".", "")
  const mimeMap: Record<string, string> = {
    "application/pdf": "pdf",
    "image/vnd.adobe.photoshop": "psd",
    "application/x-photoshop": "psd",
    "application/postscript": "eps",
    "application/illustrator": "ai",
    "image/jpeg": "jpg",
    "image/png": "png",
    "application/zip": "zip",
    "application/x-zip-compressed": "zip",
  }
  return mimeMap[mimeType] ?? ext ?? "unknown"
}

// ─── Content-Type mapping for file serving ────────────────────────────────────

export function getContentType(ext: string): string {
  const map: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".pdf": "application/pdf",
    ".psd": "image/vnd.adobe.photoshop",
    ".eps": "application/postscript",
    ".ai": "application/illustrator",
    ".zip": "application/zip",
  }
  return map[ext.toLowerCase()] ?? "application/octet-stream"
}
