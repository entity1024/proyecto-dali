"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { MoreHorizontal, Pencil, Trash2, Eye, EyeOff, Archive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteDesignAction, toggleDesignStatusAction } from "@/lib/actions/designs"

type Row = {
  id: string
  name: string
  slug: string
  status: string
  category: string
  categorySlug: string
  imagesCount: number
  filesCount: number
  downloadCount: number
  publishedAt: string | null
  createdAt: string
  thumbnailUrl: string | null
}

const STATUS_LABEL: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  published: { label: "Publicado", variant: "default" },
  draft: { label: "Borrador", variant: "secondary" },
  archived: { label: "Archivado", variant: "outline" },
}

export function RecursosClient({ rows }: { rows: Row[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteName, setDeleteName] = useState("")

  function confirmDelete(id: string, name: string) {
    setDeleteId(id)
    setDeleteName(name)
  }

  function handleDelete() {
    if (!deleteId) return
    startTransition(async () => {
      const result = await deleteDesignAction(deleteId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Recurso eliminado")
        router.refresh()
      }
      setDeleteId(null)
    })
  }

  function handleToggleStatus(id: string, current: string) {
    const next =
      current === "published" ? "draft" :
      current === "draft" ? "published" :
      "draft" // archived → draft

    startTransition(async () => {
      const result = await toggleDesignStatusAction(id, next as "draft" | "published" | "archived")
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(next === "published" ? "Recurso publicado" : "Recurso despublicado")
        router.refresh()
      }
    })
  }

  function handleArchive(id: string) {
    startTransition(async () => {
      const result = await toggleDesignStatusAction(id, "archived")
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Recurso archivado")
        router.refresh()
      }
    })
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 py-16 text-center">
        <p className="text-sm font-medium text-muted-foreground">No hay recursos todavía</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Creá el primer recurso con el botón de arriba
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Recurso</th>
              <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">
                Categoría
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Estado</th>
              <th className="hidden px-4 py-3 text-right font-medium text-muted-foreground md:table-cell">
                Descargas
              </th>
              <th className="w-10 px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => {
              const statusInfo = STATUS_LABEL[row.status] ?? STATUS_LABEL.draft
              return (
                <tr key={row.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {/* Thumbnail */}
                      <div className="relative size-10 shrink-0 overflow-hidden rounded bg-muted">
                        {row.thumbnailUrl ? (
                          <Image
                            src={row.thumbnailUrl}
                            alt={row.name}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                            —
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{row.name}</p>
                        <p className="truncate text-xs text-muted-foreground font-mono">
                          {row.slug}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                    {row.category}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusInfo.variant} className="text-xs">
                      {statusInfo.label}
                    </Badge>
                  </td>
                  <td className="hidden px-4 py-3 text-right tabular-nums text-muted-foreground md:table-cell">
                    {row.downloadCount.toLocaleString("es-AR")}
                  </td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          disabled={isPending}
                        >
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">Acciones</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/recursos/${row.id}/editar`}>
                            <Pencil className="mr-2 size-4" />
                            Editar
                          </Link>
                        </DropdownMenuItem>

                        {row.status !== "archived" && (
                          <DropdownMenuItem
                            onClick={() => handleToggleStatus(row.id, row.status)}
                          >
                            {row.status === "published" ? (
                              <>
                                <EyeOff className="mr-2 size-4" />
                                Despublicar
                              </>
                            ) : (
                              <>
                                <Eye className="mr-2 size-4" />
                                Publicar
                              </>
                            )}
                          </DropdownMenuItem>
                        )}

                        {row.status !== "archived" && (
                          <DropdownMenuItem onClick={() => handleArchive(row.id)}>
                            <Archive className="mr-2 size-4" />
                            Archivar
                          </DropdownMenuItem>
                        )}

                        {row.status === "archived" && (
                          <DropdownMenuItem
                            onClick={() => handleToggleStatus(row.id, row.status)}
                          >
                            <Eye className="mr-2 size-4" />
                            Restaurar como borrador
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => confirmDelete(row.id, row.name)}
                        >
                          <Trash2 className="mr-2 size-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar recurso?</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a eliminar <strong>{deleteName}</strong>. Esta acción borrará el recurso, sus
              imágenes y archivos del storage. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
