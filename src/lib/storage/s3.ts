// Módulo: Storage — proveedor S3/MinIO (mismo SDK, distinto endpoint)
// Usa @aws-sdk/client-s3 + @aws-sdk/s3-request-presigner
import type { StorageProvider, UploadOptions } from "./index"

export class S3StorageProvider implements StorageProvider {
  async upload(_key: string, _buffer: Buffer, _options: UploadOptions): Promise<void> {
    throw new Error("Not implemented")
  }

  getPublicUrl(_key: string): string {
    throw new Error("Not implemented")
  }

  async getSignedUrl(_key: string, _expiresInSeconds: number): Promise<string> {
    throw new Error("Not implemented")
  }

  async delete(_key: string): Promise<void> {
    throw new Error("Not implemented")
  }
}
