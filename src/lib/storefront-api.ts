import { supabase } from "@/lib/supabase/client";
import {
  categories as fallbackCategories,
  products as fallbackProducts,
  type Category,
  type Product,
} from "@/lib/shop-data";
import type { CategoryRow, ProductRow } from "@/lib/supabase/database.types";

export const storefrontKeys = {
  catalog: ["storefront", "catalog"] as const,
  homepage: ["storefront", "homepage"] as const,
};

export interface StorefrontCatalog {
  categories: Category[];
  products: Product[];
}

export interface HomepageSection {
  title: string;
  sectionType: string;
  content: Record<string, unknown>;
}

export interface HomepageContent {
  hero: {
    eyebrow: string;
    title: string;
    highlight: string;
    body: string;
    primaryLabel: string;
    secondaryLabel: string;
    imageUrl: string | null;
  };
  collections: {
    eyebrow: string;
    title: string;
    subtitle: string;
  };
  newArrivals: {
    eyebrow: string;
    title: string;
  };
  bestSellers: {
    eyebrow: string;
    title: string;
  };
  promise: {
    eyebrow: string;
    title: string;
    items: Array<{ title: string; body: string }>;
  };
  videos: {
    eyebrow: string;
    title: string;
    subtitle: string;
    captions: string[];
  };
  testimonials: {
    eyebrow: string;
    title: string;
    items: Array<{ name: string; text: string }>;
  };
  instagram: {
    eyebrow: string;
    title: string;
    subtitle: string;
    url: string;
  };
  newsletter: {
    eyebrow: string;
    title: string;
    body: string;
    buttonLabel: string;
    successMessage: string;
  };
}

export interface StorefrontHome {
  catalog: StorefrontCatalog;
  content: HomepageContent;
}

const defaultHomepageContent: HomepageContent = {
  hero: {
    eyebrow: "Atelier of Luxury",
    title: "Effortless elegance,",
    highlight: "curated for you.",
    body: "Premium atamfa, lace, intimates, bags, shoes, veils and signature perfumes - hand-picked, beautifully packaged, delivered to your door.",
    primaryLabel: "Shop Now",
    secondaryLabel: "View Collections",
    imageUrl: null,
  },
  collections: {
    eyebrow: "Collections",
    title: "Shop by category",
    subtitle: "From handwoven atamfa to whisper-light veils - each piece chosen with intention.",
  },
  newArrivals: {
    eyebrow: "Fresh",
    title: "New arrivals",
  },
  bestSellers: {
    eyebrow: "Loved",
    title: "Best sellers",
  },
  promise: {
    eyebrow: "The Cove promise",
    title: "Why customers stay",
    items: [
      { title: "Premium quality", body: "Sourced and inspected piece by piece." },
      { title: "Considered pricing", body: "Luxury that respects your budget." },
      { title: "Fast delivery", body: "Beautifully packaged, swiftly dispatched." },
      { title: "Trusted service", body: "Real people, real care, every order." },
    ],
  },
  videos: {
    eyebrow: "Product videos",
    title: "See the details in motion",
    subtitle: "Short product clips for texture, scale and finish before you order.",
    captions: ["Product showcase", "Close-up details", "New product clip", "Style preview"],
  },
  testimonials: {
    eyebrow: "Kind words",
    title: "From our community",
    items: [
      { name: "Adaeze O.", text: "The atamfa was even more beautiful in person. Tailor's eyes lit up." },
      { name: "Ifeoma N.", text: "Packaging felt like a gift to myself. Will buy again - already have." },
      { name: "Zainab A.", text: "Cove Noir is now my signature scent. Compliments every single day." },
    ],
  },
  instagram: {
    eyebrow: "@thefashioncove",
    title: "Follow the atelier",
    subtitle: "Daily inspiration, fresh arrivals and behind-the-scenes.",
    url: "https://instagram.com",
  },
  newsletter: {
    eyebrow: "The list",
    title: "First looks, private pricing",
    body: "Subscribe for new drops, restocks and members-only offers.",
    buttonLabel: "Join",
    successMessage: "Thank you - you're on the list.",
  },
};

export async function getStorefrontCatalog(): Promise<StorefrontCatalog> {
  const [categoriesResult, productsResult] = await Promise.all([
    supabase
      .from("categories")
      .select("id, slug, name, blurb, image_url, sort_order, created_at, updated_at")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase
      .from("products")
      .select("*")
      .eq("status", "active")
      .order("updated_at", { ascending: false }),
  ]);

  if (categoriesResult.error || productsResult.error) {
    return { categories: fallbackCategories, products: fallbackProducts };
  }

  const categories = (categoriesResult.data ?? []).map(mapCategory);
  const categoryRows = categoriesResult.data ?? [];
  const categoryById = new Map(categoryRows.map((category) => [category.id, category]));
  const products = (productsResult.data ?? []).map((product) => mapProduct(product, categoryById));

  return {
    categories: categories.length > 0 ? categories : fallbackCategories,
    products: products.length > 0 ? products : fallbackProducts,
  };
}

export async function getStorefrontHome(): Promise<StorefrontHome> {
  const [catalog, content] = await Promise.all([getStorefrontCatalog(), getHomepageContent()]);
  return { catalog, content };
}

export async function getHomepageContent(): Promise<HomepageContent> {
  const { data, error } = await supabase
    .from("homepage_sections")
    .select("title, section_type, content, sort_order")
    .eq("status", "published")
    .order("sort_order", { ascending: true });

  if (error || !data) return defaultHomepageContent;

  return mergeHomepageContent(
    defaultHomepageContent,
    data.map((section) => ({
      title: String(section.title ?? ""),
      sectionType: String(section.section_type ?? ""),
      content: isRecord(section.content) ? section.content : {},
    })),
  );
}

export async function getStorefrontProduct(slugOrId: string): Promise<Product | null> {
  const catalog = await getStorefrontCatalog();
  return catalog.products.find((product) => product.id === slugOrId) ?? null;
}

export async function getStorefrontCategory(slug: string): Promise<{ category: Category; products: Product[] } | null> {
  const catalog = await getStorefrontCatalog();
  const category = catalog.categories.find((item) => item.slug === slug);
  if (!category) return null;
  return {
    category,
    products: catalog.products.filter((product) => product.category === category.slug),
  };
}

function mapCategory(category: Pick<CategoryRow, "slug" | "name" | "blurb" | "image_url">): Category {
  const fallback = fallbackCategories.find((item) => item.slug === category.slug);
  return {
    slug: category.slug,
    name: category.name,
    blurb: category.blurb,
    image: category.image_url || fallback?.image || "",
  };
}

function mapProduct(product: ProductRow, categoryById: Map<string, CategoryRow>): Product {
  const fallback = fallbackProducts.find((item) => item.id === product.slug);
  const category = product.category_id ? categoryById.get(product.category_id) : null;
  return {
    id: product.slug,
    name: product.name,
    price: product.price,
    category: category?.slug ?? fallback?.category ?? "uncategorized",
    image: product.image_url || fallback?.image || "",
    description: product.description,
    featured: product.is_featured,
    bestseller: product.is_bestseller,
    newArrival: product.is_new_arrival,
    inStock: product.stock_quantity > 0,
  };
}

function mergeHomepageContent(defaults: HomepageContent, sections: HomepageSection[]): HomepageContent {
  const byType = new Map(sections.map((section) => [section.sectionType, section]));

  return {
    hero: {
      ...defaults.hero,
      ...pickStringFields(byType.get("hero")?.content, ["eyebrow", "title", "highlight", "body", "primaryLabel", "secondaryLabel", "imageUrl"]),
    },
    collections: {
      ...defaults.collections,
      title: byType.get("collections")?.title || defaults.collections.title,
      ...pickStringFields(byType.get("collections")?.content, ["eyebrow", "title", "subtitle"]),
    },
    newArrivals: {
      ...defaults.newArrivals,
      title: byType.get("new_arrivals")?.title || defaults.newArrivals.title,
      ...pickStringFields(byType.get("new_arrivals")?.content, ["eyebrow", "title"]),
    },
    bestSellers: {
      ...defaults.bestSellers,
      title: byType.get("best_sellers")?.title || defaults.bestSellers.title,
      ...pickStringFields(byType.get("best_sellers")?.content, ["eyebrow", "title"]),
    },
    promise: {
      ...defaults.promise,
      title: byType.get("promise")?.title || defaults.promise.title,
      ...pickStringFields(byType.get("promise")?.content, ["eyebrow", "title"]),
      items: readContentItems(byType.get("promise")?.content, defaults.promise.items),
    },
    videos: {
      ...defaults.videos,
      title: byType.get("videos")?.title || defaults.videos.title,
      ...pickStringFields(byType.get("videos")?.content, ["eyebrow", "title", "subtitle"]),
      captions: readStringArray(byType.get("videos")?.content?.captions, defaults.videos.captions),
    },
    testimonials: {
      ...defaults.testimonials,
      title: byType.get("testimonials")?.title || defaults.testimonials.title,
      ...pickStringFields(byType.get("testimonials")?.content, ["eyebrow", "title"]),
      items: readContentItems(byType.get("testimonials")?.content, defaults.testimonials.items, "name", "text"),
    },
    instagram: {
      ...defaults.instagram,
      title: byType.get("instagram")?.title || defaults.instagram.title,
      ...pickStringFields(byType.get("instagram")?.content, ["eyebrow", "title", "subtitle", "url"]),
    },
    newsletter: {
      ...defaults.newsletter,
      title: byType.get("newsletter")?.title || defaults.newsletter.title,
      ...pickStringFields(byType.get("newsletter")?.content, ["eyebrow", "title", "body", "buttonLabel", "successMessage"]),
    },
  };
}

function pickStringFields<T extends string>(content: Record<string, unknown> | undefined, keys: T[]): Partial<Record<T, string>> {
  const values: Partial<Record<T, string>> = {};
  if (!content) return values;
  for (const key of keys) {
    const value = content[key];
    if (typeof value === "string" && value.trim()) values[key] = value;
  }
  return values;
}

function readContentItems(
  content: Record<string, unknown> | undefined,
  fallback: Array<{ title: string; body: string }>,
): Array<{ title: string; body: string }>;
function readContentItems(
  content: Record<string, unknown> | undefined,
  fallback: Array<{ name: string; text: string }>,
  titleKey: "name",
  bodyKey: "text",
): Array<{ name: string; text: string }>;
function readContentItems(
  content: Record<string, unknown> | undefined,
  fallback: Array<{ title: string; body: string }> | Array<{ name: string; text: string }>,
  titleKey: "title" | "name" = "title",
  bodyKey: "body" | "text" = "body",
) {
  const rawItems = content?.items;
  if (!Array.isArray(rawItems)) return fallback;

  const items = rawItems
    .filter(isRecord)
    .map((item) => ({
      [titleKey]: typeof item[titleKey] === "string" ? item[titleKey] : "",
      [bodyKey]: typeof item[bodyKey] === "string" ? item[bodyKey] : "",
    }))
    .filter((item) => item[titleKey] && item[bodyKey]);

  return items.length > 0 ? items : fallback;
}

function readStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  const items = value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  return items.length > 0 ? items : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
