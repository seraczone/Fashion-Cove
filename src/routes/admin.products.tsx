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
  createProduct,
  deleteProduct,
  updateProduct,
  type ProductInput,
} from "@/lib/admin/admin-api";
import { useCategories, useProducts } from "@/lib/admin/admin-hooks";
import { createUploadId, slugify, sanitizeFileName } from "@/lib/slug";
import type { CategoryRow, ProductRow } from "@/lib/supabase/database.types";
import { storageBuckets, uploadAdminFile } from "@/lib/supabase/storage";
import { formatNGN } from "@/lib/shop-data";

export const Route = createFileRoute("/admin/products")({
  head: () => ({
    meta: [
      { title: "Products - Fashion Cove Admin" },
      { name: "description", content: "Manage Fashion Cove product catalog." },
    ],
  }),
  component: ProductsRoute,
});

const emptyProduct: ProductInput = {
  category_id: null,
  slug: "",
  name: "",
  description: "",
  price: 0,
  sku: null,
  image_url: null,
  stock_quantity: 0,
  is_featured: false,
  is_bestseller: false,
  is_new_arrival: false,
  status: "draft",
};

function ProductsRoute() {
  return (
    <AdminGuard>
      <AdminShell>
        <ProductsPage />
      </AdminShell>
    </AdminGuard>
  );
}

function ProductsPage() {
  const queryClient = useQueryClient();
  const products = useProducts();
  const categories = useCategories();
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const createMutation = useMutation({
    mutationFn: createProduct,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: adminKeys.products });
      const previous = queryClient.getQueryData<ProductRow[]>(adminKeys.products);
      const optimistic: ProductRow = {
        id: `optimistic-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...input,
      };
      queryClient.setQueryData<ProductRow[]>(adminKeys.products, (current = []) => [optimistic, ...current]);
      return { previous };
    },
    onError: (_error, _input, context) => {
      queryClient.setQueryData(adminKeys.products, context?.previous);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: adminKeys.products });
      await queryClient.invalidateQueries({ queryKey: adminKeys.overview });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: ProductInput }) => updateProduct(id, input),
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: adminKeys.products });
      const previous = queryClient.getQueryData<ProductRow[]>(adminKeys.products);
      queryClient.setQueryData<ProductRow[]>(adminKeys.products, (current = []) =>
        current.map((product) =>
          product.id === id ? { ...product, ...input, updated_at: new Date().toISOString() } : product,
        ),
      );
      return { previous };
    },
    onError: (_error, _input, context) => {
      queryClient.setQueryData(adminKeys.products, context?.previous);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: adminKeys.products });
      await queryClient.invalidateQueries({ queryKey: adminKeys.overview });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: adminKeys.products });
      const previous = queryClient.getQueryData<ProductRow[]>(adminKeys.products);
      queryClient.setQueryData<ProductRow[]>(adminKeys.products, (current = []) =>
        current.filter((product) => product.id !== id),
      );
      return { previous };
    },
    onError: (_error, _id, context) => {
      queryClient.setQueryData(adminKeys.products, context?.previous);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: adminKeys.products });
      await queryClient.invalidateQueries({ queryKey: adminKeys.overview });
    },
  });

  const categoryName = (id: string | null) =>
    categories.data?.find((category) => category.id === id)?.name ?? "Unassigned";
  const error = products.error ?? categories.error ?? createMutation.error ?? updateMutation.error ?? deleteMutation.error;

  return (
    <div>
      <AdminPageHeader
        eyebrow="Catalog"
        title="Products"
        description="Manage pricing, inventory, merchandising flags and publication status for every Fashion Cove product."
        actions={
          <Button
            type="button"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            New product
          </Button>
        }
      />

      {error ? (
        <div className="mb-4 border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error.message}
        </div>
      ) : null}

      {formOpen ? (
        <ProductForm
          product={editing}
          categories={categories.data ?? []}
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
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Stock</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(products.data ?? []).map((product) => (
                <tr key={product.id}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {product.image_url ? (
                        <img src={product.image_url} alt="" loading="lazy" decoding="async" className="h-12 w-12 object-cover" />
                      ) : (
                        <div className="h-12 w-12 bg-muted" />
                      )}
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">{categoryName(product.category_id)}</td>
                  <td className="px-5 py-4 capitalize">{product.status}</td>
                  <td className="px-5 py-4">{product.stock_quantity}</td>
                  <td className="px-5 py-4">{formatNGN(product.price)}</td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditing(product);
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
                          if (window.confirm(`Delete ${product.name}?`)) deleteMutation.mutate(product.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!products.isLoading && (products.data ?? []).length === 0 ? (
                <tr>
                  <td className="px-5 py-12 text-center text-muted-foreground" colSpan={6}>
                    Create your first Supabase-backed product.
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

function ProductForm({
  product,
  categories,
  isSaving,
  onCancel,
  onSubmit,
}: {
  product: ProductRow | null;
  categories: CategoryRow[];
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: (input: ProductInput) => void;
}) {
  const initial = useMemo<ProductInput>(() => {
    if (!product) return emptyProduct;
    return {
      category_id: product.category_id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      price: product.price,
      sku: product.sku,
      image_url: product.image_url,
      stock_quantity: product.stock_quantity,
      is_featured: product.is_featured,
      is_bestseller: product.is_bestseller,
      is_new_arrival: product.is_new_arrival,
      status: product.status,
    };
  }, [product]);
  const [form, setForm] = useState<ProductInput>(initial);
  const [slugTouched, setSlugTouched] = useState(Boolean(product?.slug));
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function submitProduct() {
    const nextSlug = slugify(form.slug || form.name);
    let imageUrl = form.image_url?.trim() ? form.image_url.trim() : null;

    if (imageFile) {
      setIsUploading(true);
      try {
        imageUrl = await uploadAdminFile(
          storageBuckets.productMedia,
          `products/${nextSlug}/${createUploadId()}-${sanitizeFileName(imageFile.name)}`,
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
      description: form.description.trim(),
      sku: form.sku?.trim() ? form.sku.trim() : null,
      image_url: imageUrl,
    });
  }

  return (
    <form
      className="mb-6 border bg-background p-5"
      onSubmit={(event) => {
        event.preventDefault();
        void submitProduct().catch((error: unknown) => {
          toast.error(error instanceof Error ? error.message : "Could not save product");
        });
      }}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl">{product ? "Edit product" : "New product"}</h2>
          <p className="mt-1 text-sm text-muted-foreground">Create and update products directly in Supabase.</p>
        </div>
        <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <TextField
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
        <TextField
          label="Slug"
          value={form.slug}
          required
          onChange={(value) => {
            setSlugTouched(true);
            setForm({ ...form, slug: slugify(value) });
          }}
        />
        <TextField label="SKU" value={form.sku ?? ""} onChange={(value) => setForm({ ...form, sku: value })} />
        <label>
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Category</span>
          <select
            value={form.category_id ?? ""}
            onChange={(event) => setForm({ ...form, category_id: event.target.value || null })}
            className="mt-2 h-10 w-full border bg-background px-3 text-sm outline-none focus:border-primary"
          >
            <option value="">Unassigned</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </label>
        <NumberField label="Price" value={form.price} onChange={(value) => setForm({ ...form, price: value })} />
        <NumberField label="Stock" value={form.stock_quantity} onChange={(value) => setForm({ ...form, stock_quantity: value })} />
        <div>
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Product image</span>
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
        <label>
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Status</span>
          <select
            value={form.status}
            onChange={(event) => setForm({ ...form, status: event.target.value as ProductRow["status"] })}
            className="mt-2 h-10 w-full border bg-background px-3 text-sm outline-none focus:border-primary"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <div className="flex flex-wrap items-end gap-4">
          <CheckField label="Featured" checked={form.is_featured} onChange={(value) => setForm({ ...form, is_featured: value })} />
          <CheckField label="Bestseller" checked={form.is_bestseller} onChange={(value) => setForm({ ...form, is_bestseller: value })} />
          <CheckField label="New arrival" checked={form.is_new_arrival} onChange={(value) => setForm({ ...form, is_new_arrival: value })} />
        </div>
        <label className="md:col-span-2 xl:col-span-3">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Description</span>
          <textarea
            required
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            className="mt-2 min-h-28 w-full border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </label>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSaving || isUploading}>
          {isSaving || isUploading ? "Saving..." : "Save product"}
        </Button>
      </div>
    </form>
  );
}

function TextField({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label>
      <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <input
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-10 w-full border bg-background px-3 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label>
      <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 h-10 w-full border bg-background px-3 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}

function CheckField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex h-10 items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-primary"
      />
      {label}
    </label>
  );
}
