import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  adminKeys,
  getCurrentAdmin,
  getOrderItems,
  getOverview,
  getSession,
  listCategories,
  listOrders,
  listProducts,
  signOutAdmin,
} from "@/lib/admin/admin-api";
import {
  listResource,
  resourceKeys,
  type AdminResourceRecord,
  type AdminResourceTable,
  type ResourceListParams,
} from "@/lib/admin/admin-resource-api";
import { supabase } from "@/lib/supabase/client";

type AdminRealtimeTable =
  | AdminResourceTable
  | "categories"
  | "products"
  | "orders"
  | "order_items";

export function useAdminSession() {
  return useQuery({
    queryKey: adminKeys.session,
    queryFn: getSession,
  });
}

export function useCurrentAdmin(enabled = true) {
  return useQuery({
    queryKey: adminKeys.profile,
    queryFn: getCurrentAdmin,
    enabled,
  });
}

export function useOverview() {
  useInvalidateOnTables(["products", "categories", "orders"], adminKeys.overview);
  return useQuery({
    queryKey: adminKeys.overview,
    queryFn: getOverview,
  });
}

export function useProducts() {
  useInvalidateOnTables(["products"], adminKeys.products);
  return useQuery({
    queryKey: adminKeys.products,
    queryFn: listProducts,
  });
}

export function useOrders() {
  useInvalidateOnTables(["orders"], adminKeys.orders);
  return useQuery({
    queryKey: adminKeys.orders,
    queryFn: listOrders,
  });
}

export function useCategories() {
  useInvalidateOnTables(["categories"], adminKeys.categories);
  return useQuery({
    queryKey: adminKeys.categories,
    queryFn: listCategories,
  });
}

export function useOrderItems(orderId: string, enabled = true) {
  useInvalidateOnTables(["order_items"], adminKeys.order(orderId), enabled);
  return useQuery({
    queryKey: adminKeys.order(orderId),
    queryFn: () => getOrderItems(orderId),
    enabled,
  });
}

export function useResourceRows(table: AdminResourceTable) {
  useInvalidateOnTables([table], resourceKeys.list(table));
  return useQuery({
    queryKey: resourceKeys.list(table),
    queryFn: () => listResource(table),
  });
}

export function useResourceList(table: AdminResourceTable, params: ResourceListParams) {
  useInvalidateOnTables([table], ["admin", "resource", table]);
  return useQuery({
    queryKey: resourceKeys.list(table, params),
    queryFn: () => listResource(table, params),
  });
}

export function useCustomers() {
  return useResourceRows("customers");
}

export function useInventory() {
  return useResourceRows("inventory_items");
}

export function usePayments() {
  return useResourceRows("payments");
}

export function useRefunds() {
  return useResourceRows("refunds");
}

export function useSignOutAdmin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signOutAdmin,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminKeys.session });
      await router.navigate({ to: "/admin/login" });
    },
  });
}

export function asResourceRows(data: AdminResourceRecord[] | undefined): AdminResourceRecord[] {
  return data ?? [];
}

function useInvalidateOnTables(tables: AdminRealtimeTable[], queryKey: readonly unknown[], enabled = true) {
  const queryClient = useQueryClient();
  const tablesKey = tables.join(",");
  const queryKeyHash = JSON.stringify(queryKey);

  useEffect(() => {
    if (!enabled) return;

    const channel = supabase.channel(`admin-query-sync:${tablesKey}:${queryKey.join(":")}`);
    for (const table of tables) {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => {
          void queryClient.invalidateQueries({ queryKey });
        },
      );
    }

    channel.subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [enabled, queryClient, queryKeyHash, tablesKey]);
}
