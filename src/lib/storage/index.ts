import { LocalStorageProvider } from "./local"

export interface UploadOptions {
  contentType: string
  /** true = acceso público (imágenes de previsualización) */
  public?: boolean
}

export interface StorageProvider {
  upload(key: string, buffer: Buffer, options: UploadOptions): Promise<void>
  getPublicUrl(key: string): string
  getSignedUrl(key: string, expiresInSeconds: number): Promise<string>
  delete(key: string): Promise<void>
}

let _instance: StorageProvider | null = null

/** Singleton — devuelve el proveedor según STORAGE_PROVIDER env var */
export function getStorageProvider(): StorageProvider {
  if (_instance) return _instance

  const provider = process.env.STORAGE_PROVIDER ?? "local"

  if (provider === "local") {
    _instance = new LocalStorageProvider()
    return _instance
  }

  if (provider === "s3" || provider === "minio") {
    // Se implementa en módulo de storage cloud
    throw new Error("S3/MinIO storage provider not implemented yet")
  }

  throw new Error(`Unknown STORAGE_PROVIDER: "${provider}"`)
}
