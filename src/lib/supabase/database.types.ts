export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  blurb: string;
  image_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ProductRow = {
  id: string;
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
  status: "draft" | "active" | "archived";
  created_at: string;
  updated_at: string;
};

export type OrderRow = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  delivery_address: string;
  status: "pending" | "confirmed" | "fulfilled" | "cancelled";
  payment_status: "unpaid" | "paid" | "refunded";
  subtotal: number;
  delivery_fee: number;
  total: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
};

export type AdminUserRow = {
  user_id: string;
  email: string;
  full_name: string | null;
  role: "owner" | "manager" | "staff";
  created_at: string;
};

export type HomepageSectionRow = {
  id: string;
  title: string;
  section_type: string;
  content: Json;
  sort_order: number;
  status: "draft" | "published" | "archived";
  created_at: string;
  updated_at: string;
};

export interface Database {
  public: {
    Tables: {
      admin_users: {
        Row: AdminUserRow;
        Insert: {
          user_id: string;
          email: string;
          full_name?: string | null;
          role?: AdminUserRow["role"];
          created_at?: string;
        };
        Update: Partial<AdminUserRow>;
        Relationships: [];
      };
      categories: {
        Row: CategoryRow;
        Insert: {
          id?: string;
          slug: string;
          name: string;
          blurb?: string;
          image_url?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<CategoryRow>;
        Relationships: [];
      };
      products: {
        Row: ProductRow;
        Insert: {
          id?: string;
          category_id?: string | null;
          slug: string;
          name: string;
          description?: string;
          price: number;
          sku?: string | null;
          image_url?: string | null;
          stock_quantity?: number;
          is_featured?: boolean;
          is_bestseller?: boolean;
          is_new_arrival?: boolean;
          status?: ProductRow["status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<ProductRow>;
        Relationships: [];
      };
      orders: {
        Row: OrderRow;
        Insert: {
          id?: string;
          order_number?: string;
          customer_name: string;
          customer_email?: string | null;
          customer_phone: string;
          delivery_address?: string;
          status?: OrderRow["status"];
          payment_status?: OrderRow["payment_status"];
          subtotal?: number;
          delivery_fee?: number;
          total?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<OrderRow>;
        Relationships: [];
      };
      order_items: {
        Row: OrderItemRow;
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          product_name: string;
          quantity: number;
          unit_price: number;
          subtotal: number;
          created_at?: string;
        };
        Update: Partial<OrderItemRow>;
        Relationships: [];
      };
      homepage_sections: {
        Row: HomepageSectionRow;
        Insert: {
          id?: string;
          title: string;
          section_type?: string;
          content?: Json;
          sort_order?: number;
          status?: HomepageSectionRow["status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<HomepageSectionRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
