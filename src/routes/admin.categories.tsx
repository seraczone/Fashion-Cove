import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ImagePlus, Pencil, Plus, Trash2, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import {
  adminKeys,
  createCategory,
  deleteCategory,
  updateCategory,
  type CategoryInput,
} from "@/lib/admin/admin-api";
import { useCategories } from "@/lib/admin/admin-hooks";
import { createUploadId, slugify, sanitizeFileName } from "@/lib/slug";
import type { CategoryRow } from "@/lib/supabase/database.types";
import { storageBuckets, uploadAdminFile } from "@/lib/supabase/storage";

export const Route = createFileRoute("/admin/categories")({
  head: () => ({
    meta: [
      { title: "Categories - Fashion Cove Admin" },
      { name: "description", content: "Manage Fashion Cove product categories." },
    ],
  }),
  component: CategoriesRoute,
});

const emptyCategory: CategoryInput = {
  slug: "",
  name: "",
  blurb: "",
  image_url: null,
  sort_order: 0,
};

function CategoriesRoute() {
  return (
    <AdminGuard>
      <AdminShell>
        <CategoriesPage />
      </AdminShell>
    </AdminGuard>
  );
}

function CategoriesPage() {
  const queryClient = useQueryClient();
  const categories = useCategories();
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const createMutation = useMutation({
    mutationFn: createCategory,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: adminKeys.categories });
      const previous = queryClient.getQueryData<CategoryRow[]>(adminKeys.categories);
      const optimistic: CategoryRow = {
        id: `optimistic-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...input,
      };
      queryClient.setQueryData<CategoryRow[]>(adminKeys.categories, (current = []) => [...current, optimistic]);
      return { previous };
    },
    onError: (_error, _input, context) => {
      queryClient.setQueryData(adminKeys.categories, context?.previous);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: adminKeys.categories });
      await queryClient.invalidateQueries({ queryKey: adminKeys.overview });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: CategoryInput }) => updateCategory(id, input),
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: adminKeys.categories });
      const previous = queryClient.getQueryData<CategoryRow[]>(adminKeys.categories);
      queryClient.setQueryData<CategoryRow[]>(adminKeys.categories, (current = []) =>
        current.map((category) =>
          category.id === id ? { ...category, ...input, updated_at: new Date().toISOString() } : category,
        ),
      );
      return { previous };
    },
    onError: (_error, _input, context) => {
      queryClient.setQueryData(adminKeys.categories, context?.previous);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: adminKeys.categories });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: adminKeys.categories });
      const previous = queryClient.getQueryData<CategoryRow[]>(adminKeys.categories);
      queryClient.setQueryData<CategoryRow[]>(adminKeys.categories, (current = []) =>
        current.filter((category) => category.id !== id),
      );
      return { previous };
    },
    onError: (_error, _id, context) => {
      queryClient.setQueryData(adminKeys.categories, context?.previous);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: adminKeys.categories });
      await queryClient.invalidateQueries({ queryKey: adminKeys.overview });
    },
  });

  const error = categories.error ?? createMutation.error ?? updateMutation.error ?? deleteMutation.error;

  return (
    <div>
      <AdminPageHeader
        eyebrow="Catalog"
        title="Categories"
        description="Create and organize the category taxonomy that powers the storefront and admin product filters."
        actions={
          <Button
            type="button"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            New category
          </Button>
        }
      />

      {error ? (
        <div className="mb-4 border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error.message}
        </div>
      ) : null}

      {formOpen ? (
        <CategoryForm
          category={editing}
          isSaving={createMutation.isPending || updateMutation.isPending}
          onCancel={() => {
            setEditing(null);
            setFormOpen(false);
          }}
          onSubmit={(input) => {
            if (editing) updateMutation.mutate({ id: editing.id, input });
            else createMutation.mutate(input);
            setEditing(null);
            setFormOpen(false);
          }}
        />
      ) : null}

      <section className="border bg-background">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-[0.16em] text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Slug</th>
                <th className="px-5 py-3 font-medium">Sort</th>
                <th className="px-5 py-3 font-medium">Blurb</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(categories.data ?? []).map((category) => (
                <tr key={category.id}>
                  <td className="px-5 py-4 font-medium">{category.name}</td>
                  <td className="px-5 py-4 text-muted-foreground">{category.slug}</td>
                  <td className="px-5 py-4">{category.sort_order}</td>
                  <td className="max-w-md px-5 py-4 text-muted-foreground">{category.blurb}</td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditing(category);
                          setFormOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (window.confirm(`Delete ${category.name}?`)) deleteMutation.mutate(category.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!categories.isLoading && (categories.data ?? []).length === 0 ? (
                <tr>
                  <td className="px-5 py-12 text-center text-muted-foreground" colSpan={5}>
                    Create your first category to start organizing products.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function CategoryForm({
  category,
  isSaving,
  onCancel,
  onSubmit,
}: {
  category: CategoryRow | null;
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: (input: CategoryInput) => void;
}) {
  const initial = useMemo<CategoryInput>(() => {
    if (!category) return emptyCategory;
    return {
      slug: category.slug,
      name: category.name,
      blurb: category.blurb,
      image_url: category.image_url,
      sort_order: category.sort_order,
    };
  }, [category]);
  const [form, setForm] = useState<CategoryInput>(initial);
  const [slugTouched, setSlugTouched] = useState(Boolean(category?.slug));
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function submitCategory() {
    const nextSlug = slugify(form.slug || form.name);
    let imageUrl = form.image_url?.trim() ? form.image_url.trim() : null;

    if (imageFile) {
      setIsUploading(true);
      try {
        imageUrl = await uploadAdminFile(
          storageBuckets.productMedia,
          `categories/${nextSlug}-${createUploadId()}-${sanitizeFileName(imageFile.name)}`,
          imageFile,
        );
      } finally {
        setIsUploading(false);
      }
    }

    onSubmit({
      ...form,
      slug: nextSlug,
      name: form.name.trim(),
      blurb: form.blurb.trim(),
      image_url: imageUrl,
    });
  }

  return (
    <form
      className="mb-6 border bg-background p-5"
      onSubmit={(event) => {
        event.preventDefault();
        void submitCategory().catch((error: unknown) => {
          toast.error(error instanceof Error ? error.message : "Could not save category");
        });
      }}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl">{category ? "Edit category" : "New category"}</h2>
          <p className="mt-1 text-sm text-muted-foreground">Changes are saved directly to Supabase.</p>
        </div>
        <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <AdminField
          label="Name"
          value={form.name}
          required
          onChange={(value) =>
            setForm({
              ...form,
              name: value,
              slug: slugTouched ? form.slug : slugify(value),
            })
          }
        />
        <AdminField
          label="Slug"
          value={form.slug}
          required
          onChange={(value) => {
            setSlugTouched(true);
            setForm({ ...form, slug: slugify(value) });
          }}
        />
        <div>
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Category image</span>
          <div className="mt-2 flex items-center gap-3">
            {imageFile || form.image_url ? (
              <div className="h-16 w-16 overflow-hidden border bg-muted">
                <img
                  src={imageFile ? URL.createObjectURL(imageFile) : form.image_url ?? ""}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-16 w-16 items-center justify-center border bg-muted text-muted-foreground">
                <ImagePlus className="h-5 w-5" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
              />
              <Button type="button" variant="outline" disabled={isUploading} onClick={() => fileInputRef.current?.click()}>
                <ImagePlus className="h-4 w-4" />
                {imageFile ? "Change image" : "Upload image"}
              </Button>
              <p className="mt-2 truncate text-xs text-muted-foreground">
                {imageFile?.name ?? form.image_url ?? "Saved to Supabase Storage when you save."}
              </p>
            </div>
          </div>
        </div>
        <AdminField
          label="Sort order"
          type="number"
          value={String(form.sort_order)}
          onChange={(value) => setForm({ ...form, sort_order: Number(value) })}
        />
        <label className="md:col-span-2">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Blurb</span>
          <textarea
            required
            value={form.blurb}
            onChange={(event) => setForm({ ...form, blurb: event.target.value })}
            className="mt-2 min-h-24 w-full border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </label>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSaving || isUploading}>
          {isSaving || isUploading ? "Saving..." : "Save category"}
        </Button>
      </div>
    </form>
  );
}

function AdminField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "number";
  required?: boolean;
}) {
  return (
    <label>
      <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-10 w-full border bg-background px-3 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}
