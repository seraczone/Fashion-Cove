import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import type { Json } from "@/lib/supabase/database.types";

export type AdminResourceTable =
  | "admin_users"
  | "roles"
  | "permissions"
  | "brands"
  | "collections"
  | "warehouses"
  | "suppliers"
  | "inventory_items"
  | "customers"
  | "returns"
  | "refunds"
  | "payments"
  | "shipping_methods"
  | "reviews"
  | "coupons"
  | "discounts"
  | "gift_cards"
  | "cms_pages"
  | "media_assets"
  | "advertisements"
  | "homepage_sections"
  | "marketing_campaigns"
  | "notifications"
  | "store_settings"
  | "audit_logs";

export type ResourceValue = string | number | boolean | null | Json;

export type AdminResourceRecord = {
  id?: string;
  key?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
} & Record<string, ResourceValue | undefined>;

type ResourceDatabase = {
  public: {
    Tables: {
      [Table in AdminResourceTable]: {
        Row: AdminResourceRecord;
        Insert: AdminResourceRecord;
        Update: AdminResourceRecord;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

const resourceSupabase = supabase as unknown as SupabaseClient<ResourceDatabase>;

export interface ResourceField {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "select" | "boolean" | "json" | "datetime";
  required?: boolean;
  options?: string[];
}

export interface ResourceModule {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  table: AdminResourceTable;
  primaryLabel: string;
  fields: ResourceField[];
  readOnly?: boolean;
}

export type SortDirection = "asc" | "desc";

export interface ResourceListParams {
  page: number;
  pageSize: number;
  sortKey: string;
  sortDirection: SortDirection;
  search: string;
  searchKeys: string[];
  filters: Record<string, string>;
}

export interface ResourceListResult {
  rows: AdminResourceRecord[];
  count: number;
}

export const resourceKeys = {
  list: (table: AdminResourceTable, params?: ResourceListParams) => ["admin", "resource", table, params] as const,
};

export function getRecordId(record: AdminResourceRecord): string {
  const id = record.id ?? record.key ?? record.user_id;
  if (!id) throw new Error("Resource record is missing an id or key.");
  return id;
}

export async function listResource(table: AdminResourceTable): Promise<AdminResourceRecord[]>;
export async function listResource(table: AdminResourceTable, params: ResourceListParams): Promise<ResourceListResult>;
export async function listResource(
  table: AdminResourceTable,
  params?: ResourceListParams,
): Promise<AdminResourceRecord[] | ResourceListResult> {
  if (!params) {
    const { data, error } = await resourceSupabase.from(table).select("*");
    if (error) throw error;
    return data as AdminResourceRecord[];
  }

  const from = Math.max(0, (params.page - 1) * params.pageSize);
  const to = from + params.pageSize - 1;
  let query = resourceSupabase
    .from(table)
    .select("*", { count: "exact" })
    .order(params.sortKey, { ascending: params.sortDirection === "asc" })
    .range(from, to);

  for (const [key, value] of Object.entries(params.filters)) {
    if (value && value !== "all") query = query.eq(key, value);
  }

  const search = params.search.trim();
  if (search) {
    const escaped = search.replaceAll("%", "\\%").replaceAll("_", "\\_");
    const searchColumns = params.searchKeys.filter(Boolean);
    if (searchColumns.length > 0) {
      query = query.or(searchColumns.map((key) => `${key}.ilike.%${escaped}%`).join(","));
    }
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { rows: data as AdminResourceRecord[], count: count ?? 0 };
}

export async function createResource(
  table: AdminResourceTable,
  input: AdminResourceRecord,
): Promise<AdminResourceRecord> {
  const { data, error } = await resourceSupabase.from(table).insert(input).select("*").single();
  if (error) throw error;
  return data as AdminResourceRecord;
}

export async function updateResource(
  table: AdminResourceTable,
  id: string,
  input: AdminResourceRecord,
): Promise<AdminResourceRecord> {
  const keyColumn = table === "store_settings" ? "key" : "id";
  const { data, error } = await resourceSupabase.from(table).update(input).eq(keyColumn, id).select("*").single();
  if (error) throw error;
  return data as AdminResourceRecord;
}

export async function deleteResource(table: AdminResourceTable, id: string): Promise<void> {
  const keyColumn = table === "store_settings" ? "key" : "id";
  const { error } = await resourceSupabase.from(table).delete().eq(keyColumn, id);
  if (error) throw error;
}

export function parseResourceValue(field: ResourceField, value: string | boolean): ResourceValue {
  if (field.type === "boolean") return Boolean(value);
  if (typeof value !== "string") return value;
  if (field.type === "number") return Number(value);
  if (field.type === "json") {
    const trimmed = value.trim();
    if (!trimmed) return field.key === "permissions" || field.key === "tags" ? [] : {};
    return JSON.parse(trimmed) as Json;
  }
  if (field.type === "datetime") return value.trim() || null;
  return value.trim();
}

export function formatResourceValue(value: ResourceValue | undefined): string {
  if (value == null) return "";
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
}
