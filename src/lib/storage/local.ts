import path from "path"
import fs from "fs/promises"
import type { StorageProvider, UploadOptions } from "./index"

export class LocalStorageProvider implements StorageProvider {
  private basePath: string
  private baseUrl: string

  constructor() {
    this.basePath = process.env.STORAGE_LOCAL_PATH ?? "./storage"
    // URL relativa (mismo origen): no depende del puerto/host en que corre la app
    // y next/image la trata como imagen local, sin necesitar remotePatterns.
    this.baseUrl = "/api/files"
  }

  async upload(key: string, buffer: Buffer, _options: UploadOptions): Promise<void> {
    const filePath = path.join(this.basePath, ...key.split("/"))
    await fs.mkdir(path.dirname(filePath), { recursive: true })
    await fs.writeFile(filePath, buffer)
  }

  getPublicUrl(key: string): string {
    return `${this.baseUrl}/${key}`
  }

  async getSignedUrl(key: string, _expiresInSeconds: number): Promise<string> {
    // Local storage no requiere firma — devuelve la URL pública
    return this.getPublicUrl(key)
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(this.basePath, ...key.split("/"))
    await fs.unlink(filePath).catch(() => {
      // Ignorar si el archivo ya no existe
    })
  }

  async exists(key: string): Promise<boolean> {
    const filePath = path.join(this.basePath, ...key.split("/"))
    return fs
      .access(filePath)
      .then(() => true)
      .catch(() => false)
  }

  /** Ruta absoluta en disco — solo para streaming en dev */
  getLocalPath(key: string): string {
    return path.join(this.basePath, ...key.split("/"))
  }
}
