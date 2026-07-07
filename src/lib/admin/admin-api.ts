import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import type { AdminUserRow, CategoryRow, OrderItemRow, OrderRow, ProductRow } from "@/lib/supabase/database.types";

export const adminKeys = {
  session: ["admin", "session"] as const,
  profile: ["admin", "profile"] as const,
  overview: ["admin", "overview"] as const,
  categories: ["admin", "categories"] as const,
  products: ["admin", "products"] as const,
  orders: ["admin", "orders"] as const,
  order: (id: string) => ["admin", "orders", id] as const,
};

export interface CategoryInput {
  slug: string;
  name: string;
  blurb: string;
  image_url: string | null;
  sort_order: number;
}

export interface ProductInput {
  category_id: string | null;
  slug: string;
  name: string;
  description: string;
  price: number;
  sku: string | null;
  image_url: string | null;
  stock_quantity: number;
  is_featured: boolean;
  is_bestseller: boolean;
  is_new_arrival: boolean;
  status: ProductRow["status"];
}

export interface OrderInput {
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  delivery_address: string;
  status: OrderRow["status"];
  payment_status: OrderRow["payment_status"];
  subtotal: number;
  delivery_fee: number;
  total: number;
  notes: string | null;
}

export interface DashboardOverview {
  productCount: number;
  activeProductCount: number;
  categoryCount: number;
  orderCount: number;
  pendingOrderCount: number;
  revenue: number;
}

export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function signInAdmin(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signOutAdmin(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentAdmin(): Promise<AdminUserRow | null> {
  const session = await getSession();
  if (!session) return null;
  const { data, error } = await supabase
    .from("admin_users")
    .select("*")
    .eq("user_id", session.user.id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function listCategories(): Promise<CategoryRow[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw error;
  return data;
}

export async function createCategory(input: CategoryInput): Promise<CategoryRow> {
  const { data, error } = await supabase.from("categories").insert(input).select("*").single();
  if (error) throw error;
  return data;
}

export async function updateCategory(id: string, input: CategoryInput): Promise<CategoryRow> {
  const { data, error } = await supabase.from("categories").update(input).eq("id", id).select("*").single();
  if (error) throw error;
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}

export async function listProducts(): Promise<ProductRow[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createProduct(input: ProductInput): Promise<ProductRow> {
  const { data, error } = await supabase.from("products").insert(input).select("*").single();
  if (error) throw error;
  return data;
}

export async function updateProduct(id: string, input: ProductInput): Promise<ProductRow> {
  const { data, error } = await supabase.from("products").update(input).eq("id", id).select("*").single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

export async function listOrders(): Promise<OrderRow[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getOrderItems(orderId: string): Promise<OrderItemRow[]> {
  const { data, error } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function createOrder(input: OrderInput): Promise<OrderRow> {
  const { data, error } = await supabase.from("orders").insert(input).select("*").single();
  if (error) throw error;
  return data;
}

export async function updateOrder(id: string, input: OrderInput): Promise<OrderRow> {
  const { data, error } = await supabase.from("orders").update(input).eq("id", id).select("*").single();
  if (error) throw error;
  return data;
}

export async function deleteOrder(id: string): Promise<void> {
  const { error } = await supabase.from("orders").delete().eq("id", id);
  if (error) throw error;
}

export async function getOverview(): Promise<DashboardOverview> {
  const [products, categories, orders] = await Promise.all([
    listProducts(),
    listCategories(),
    listOrders(),
  ]);

  return {
    productCount: products.length,
    activeProductCount: products.filter((product) => product.status === "active").length,
    categoryCount: categories.length,
    orderCount: orders.length,
    pendingOrderCount: orders.filter((order) => order.status === "pending").length,
    revenue: orders
      .filter((order) => order.payment_status === "paid" && order.status !== "cancelled")
      .reduce((sum, order) => sum + order.total, 0),
  };
}

export function formatAdminDate(value: string): string {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
