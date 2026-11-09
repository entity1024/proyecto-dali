"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Plus, Pencil, Trash2 } from "lucide-react"
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  toggleCategoryAction,
} from "@/lib/actions/categories"
import { categorySchema, slugify, type CategoryInput } from "@/lib/db/queries/categories"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  displayOrder: number
  isActive: boolean
  _count: { designs: number }
}

function CategoryForm({
  defaultValues,
  onSubmit,
  loading,
}: {
  defaultValues?: Partial<CategoryInput>
  onSubmit: (data: CategoryInput) => void
  loading: boolean
}) {
  const form = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      displayOrder: 0,
      isActive: true,
      ...defaultValues,
    },
  })

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value
    form.setValue("name", name)
    if (!defaultValues?.slug) {
      form.setValue("slug", slugify(name))
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Nombre *</Label>
        <Input
          id="name"
          {...form.register("name")}
          onChange={handleNameChange}
          placeholder="Ej: Calendarios"
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
          placeholder="Ej: calendarios"
          className="font-mono text-sm"
        />
        {form.formState.errors.slug && (
          <p className="text-xs text-destructive">{form.formState.errors.slug.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          {...form.register("description")}
          placeholder="Descripción breve de la categoría"
          rows={3}
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="space-y-1.5">
          <Label htmlFor="displayOrder">Orden</Label>
          <Input
            id="displayOrder"
            type="number"
            min={0}
            className="w-24"
            {...form.register("displayOrder", { valueAsNumber: true })}
          />
        </div>

        <div className="flex items-center gap-2 pt-5">
          <Switch
            id="isActive"
            checked={form.watch("isActive")}
            onCheckedChange={(v) => form.setValue("isActive", v)}
          />
          <Label htmlFor="isActive">Activa</Label>
        </div>
      </div>

      <DialogFooter>
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Guardar"}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function CategoriesClient({ categories: initial }: { categories: Category[] }) {
  const [categories, setCategories] = useState(initial)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Category | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [isPending, startTransition] = useTransition()

  function openCreate() {
    setEditTarget(null)
    setDialogOpen(true)
  }

  function openEdit(cat: Category) {
    setEditTarget(cat)
    setDialogOpen(true)
  }

  function handleSubmit(data: CategoryInput) {
    startTransition(async () => {
      const result = editTarget
        ? await updateCategoryAction(editTarget.id, data)
        : await createCategoryAction(data)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success(editTarget ? "Categoría actualizada" : "Categoría creada")
      setDialogOpen(false)
      // Refresca la página para obtener datos actualizados del servidor
      window.location.reload()
    })
  }

  function handleDelete() {
    if (!deleteTarget) return
    startTransition(async () => {
      const result = await deleteCategoryAction(deleteTarget.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Categoría eliminada")
        setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id))
      }
      setDeleteTarget(null)
    })
  }

  function handleToggle(cat: Category, checked: boolean) {
    startTransition(async () => {
      const result = await toggleCategoryAction(cat.id, checked)
      if (result.error) {
        toast.error(result.error)
      } else {
        setCategories((prev) =>
          prev.map((c) => (c.id === cat.id ? { ...c, isActive: checked } : c))
        )
      }
    })
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={openCreate} size="sm" className="gap-1.5">
          <Plus className="size-4" />
          Nueva categoría
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">#</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="w-24 text-center">Diseños</TableHead>
              <TableHead className="w-24 text-center">Estado</TableHead>
              <TableHead className="w-24 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No hay categorías. Creá la primera.
                </TableCell>
              </TableRow>
            )}
            {categories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell className="text-muted-foreground text-sm">
                  {cat.displayOrder}
                </TableCell>
                <TableCell className="font-medium">{cat.name}</TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {cat.slug}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="secondary">{cat._count.designs}</Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Switch
                    checked={cat.isActive}
                    onCheckedChange={(v) => handleToggle(cat, v)}
                    disabled={isPending}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => openEdit(cat)}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(cat)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialog crear/editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editTarget ? "Editar categoría" : "Nueva categoría"}
            </DialogTitle>
          </DialogHeader>
          <CategoryForm
            defaultValues={
              editTarget
                ? {
                    name: editTarget.name,
                    slug: editTarget.slug,
                    description: editTarget.description ?? "",
                    displayOrder: editTarget.displayOrder,
                    isActive: editTarget.isActive,
                  }
                : undefined
            }
            onSubmit={handleSubmit}
            loading={isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Alert dialog eliminar */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a eliminar <strong>{deleteTarget?.name}</strong>. Esta acción no se
              puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
