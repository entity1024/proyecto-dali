"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createDesignAction, updateDesignAction } from "@/lib/actions/designs"
import { designFormSchema, slugify, type DesignFormInput, type ImageItem, type FileItem } from "@/lib/db/queries/designs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ImageUploader } from "@/components/admin/image-uploader"
import { FileUploader } from "@/components/admin/file-uploader"

type Category = { id: string; name: string }

interface Props {
  designId?: string
  defaultValues?: Partial<DesignFormInput>
  categories: Category[]
}

export function DesignForm({ designId, defaultValues, categories }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [images, setImages] = useState<ImageItem[]>(defaultValues?.images ?? [])
  const [files, setFiles] = useState<FileItem[]>(defaultValues?.files ?? [])
  const [tagsInput, setTagsInput] = useState(
    (defaultValues?.tags ?? []).join(", ")
  )

  const form = useForm<DesignFormInput>({
    resolver: zodResolver(designFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      categoryId: "",
      status: "draft",
      tags: [],
      images: [],
      files: [],
      ...defaultValues,
    },
  })

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value
    form.setValue("name", name)
    if (!designId) {
      form.setValue("slug", slugify(name))
    }
  }

  function handleSubmit(data: DesignFormInput) {
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)

    const payload: DesignFormInput = { ...data, tags, images, files }

    startTransition(async () => {
      const result = designId
        ? await updateDesignAction(designId, payload)
        : await createDesignAction(payload)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success(designId ? "Diseño actualizado" : "Diseño creado")
      router.push("/admin/recursos")
      router.refresh()
    })
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">

      {/* ── Información básica ─────────────────────────────────────────────── */}
      <section className="space-y-5">
        <div>
          <h2 className="text-base font-semibold text-foreground">Información</h2>
          <p className="text-sm text-muted-foreground">Datos principales del recurso</p>
        </div>
        <Separator />

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              {...form.register("name")}
              onChange={handleNameChange}
              placeholder="Ej: Calendario 2025 Floral"
            />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              {...form.register("slug")}
              placeholder="calendario-2025-floral"
              className="font-mono text-sm"
            />
            {form.formState.errors.slug && (
              <p className="text-xs text-destructive">{form.formState.errors.slug.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="categoryId">Categoría *</Label>
            <Select
              defaultValue={defaultValues?.categoryId}
              onValueChange={(v) => form.setValue("categoryId", v)}
            >
              <SelectTrigger id="categoryId">
                <SelectValue placeholder="Seleccioná una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.categoryId && (
              <p className="text-xs text-destructive">
                {form.formState.errors.categoryId.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Describí el recurso: formatos, usos, características..."
              rows={4}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tags">
              Etiquetas{" "}
              <span className="text-muted-foreground font-normal">(separadas por coma)</span>
            </Label>
            <Input
              id="tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="floral, 2025, imprimible"
            />
            {tagsInput && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tagsInput.split(",").map((t) => t.trim()).filter(Boolean).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="status">Estado</Label>
            <Select
              defaultValue={defaultValues?.status ?? "draft"}
              onValueChange={(v) =>
                form.setValue("status", v as "draft" | "published" | "archived")
              }
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Borrador</SelectItem>
                <SelectItem value="published">Publicado</SelectItem>
                <SelectItem value="archived">Archivado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* ── Imágenes ───────────────────────────────────────────────────────── */}
      <section className="space-y-5">
        <div>
          <h2 className="text-base font-semibold text-foreground">Imágenes de previsualización</h2>
          <p className="text-sm text-muted-foreground">
            La primera imagen marcada como principal se muestra en el catálogo
          </p>
        </div>
        <Separator />
        <ImageUploader images={images} onChange={setImages} />
      </section>

      {/* ── Archivos ───────────────────────────────────────────────────────── */}
      <section className="space-y-5">
        <div>
          <h2 className="text-base font-semibold text-foreground">Archivos descargables</h2>
          <p className="text-sm text-muted-foreground">
            PDF, PSD, EPS, AI, ZIP — cada archivo tiene su botón de descarga individual
          </p>
        </div>
        <Separator />
        <FileUploader files={files} onChange={setFiles} />
      </section>

      {/* ── Acciones ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Guardando..." : designId ? "Guardar cambios" : "Crear recurso"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/recursos")}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
