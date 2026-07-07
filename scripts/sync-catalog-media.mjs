import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as ts from "typescript";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const env = readEnv(resolve(root, ".env.local"));
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;
const email = process.env.SUPABASE_ADMIN_EMAIL;
const password = process.env.SUPABASE_ADMIN_PASSWORD;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local.");
}

if (!email || !password) {
  throw new Error("Set SUPABASE_ADMIN_EMAIL and SUPABASE_ADMIN_PASSWORD before running this script.");
}

class ServerNoopWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;
  CONNECTING = ServerNoopWebSocket.CONNECTING;
  OPEN = ServerNoopWebSocket.OPEN;
  CLOSING = ServerNoopWebSocket.CLOSING;
  CLOSED = ServerNoopWebSocket.CLOSED;
  readyState = ServerNoopWebSocket.CLOSED;
  protocol = "";
  binaryType = "blob";
  bufferedAmount = 0;
  extensions = "";
  onopen = null;
  onmessage = null;
  onclose = null;
  onerror = null;

  constructor(url) {
    this.url = url;
  }

  close() {}
  send() {
    throw new Error("Realtime is not used by the catalog media sync script.");
  }
  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() {
    return false;
  }
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
  realtime: { transport: ServerNoopWebSocket },
});

const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
if (signInError) throw signInError;

const catalog = readShopCatalog();
const imageUrls = new Map();
let uploadedCount = 0;

for (const item of getCatalogMedia()) {
  const localPath = resolve(root, item.source);
  if (!existsSync(localPath)) {
    console.warn(`Skipped missing file: ${item.source}`);
    continue;
  }

  const storagePath = item.storagePath;
  const body = readFileSync(localPath);
  const { error: uploadError } = await supabase.storage
    .from("product-media")
    .upload(storagePath, body, {
      contentType: contentTypeFor(localPath),
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("product-media").getPublicUrl(storagePath);
  const imageUrl = data.publicUrl;
  imageUrls.set(`${item.kind}:${item.slug}`, imageUrl);
  uploadedCount += 1;
  console.log(`uploaded ${item.kind}.${item.slug} -> ${storagePath}`);
}

const categoryRows = catalog.categories.map((category, index) => ({
  slug: category.slug,
  name: category.name,
  blurb: category.blurb,
  image_url: imageUrls.get(`category:${category.slug}`) ?? category.image ?? null,
  sort_order: index,
}));

const { data: categories, error: categoriesError } = await supabase
  .from("categories")
  .upsert(categoryRows, { onConflict: "slug" })
  .select("id, slug");

if (categoriesError) throw categoriesError;

const categoryIdBySlug = new Map((categories ?? []).map((category) => [category.slug, category.id]));
const productRows = catalog.products.map((product) => ({
  category_id: categoryIdBySlug.get(product.category) ?? null,
  slug: product.id,
  name: product.name,
  description: product.description,
  price: product.price,
  sku: product.id.toUpperCase(),
  image_url: imageUrls.get(`product:${product.id}`) ?? product.image ?? null,
  stock_quantity: product.inStock ? 20 : 0,
  is_featured: Boolean(product.featured),
  is_bestseller: Boolean(product.bestseller),
  is_new_arrival: Boolean(product.newArrival),
  status: product.inStock ? "active" : "draft",
}));

const { error: productsError } = await supabase
  .from("products")
  .upsert(productRows, { onConflict: "slug" });

if (productsError) throw productsError;

await supabase.auth.signOut();
console.log(`Synced ${uploadedCount} media files, ${categoryRows.length} categories, and ${productRows.length} products.`);

function readEnv(path) {
  return Object.fromEntries(
    readFileSync(path, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index), line.slice(index + 1)];
      }),
  );
}

function contentTypeFor(path) {
  const ext = extname(path).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return "application/octet-stream";
}

function readShopCatalog() {
  const path = resolve(root, "src/lib/shop-data.ts");
  const sourceText = readFileSync(path, "utf8");
  const sourceFile = ts.createSourceFile(path, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

  return {
    categories: evaluateExportedArray(sourceFile, "categories"),
    products: evaluateExportedArray(sourceFile, "products"),
  };
}

function evaluateExportedArray(sourceFile, name) {
  const initializer = findExportedInitializer(sourceFile, name);
  if (!initializer) {
    throw new Error(`Could not find exported ${name} array in src/lib/shop-data.ts.`);
  }

  const productMediaUrl = (path) => path;
  return Function("productMediaUrl", `"use strict"; return (${initializer.getText(sourceFile)});`)(productMediaUrl);
}

function findExportedInitializer(sourceFile, name) {
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    const isExported = statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
    if (!isExported) continue;

    for (const declaration of statement.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && declaration.name.text === name) {
        return declaration.initializer;
      }
    }
  }

  return null;
}

function getCatalogMedia() {
  return [
  { kind: "category", slug: "atamfa", source: "supabase/catalog-media/cat-atamfa.jpg", storagePath: "categories/atamfa.jpg" },
  { kind: "category", slug: "lace", source: "supabase/catalog-media/cat-lace.jpg", storagePath: "categories/lace.jpg" },
  { kind: "category", slug: "inner-wears", source: "supabase/catalog-media/cat-inner.jpg", storagePath: "categories/inner-wears.jpg" },
  { kind: "category", slug: "bags", source: "supabase/catalog-media/cat-bags.jpg", storagePath: "categories/bags.jpg" },
  { kind: "category", slug: "shoes", source: "supabase/catalog-media/cat-shoes.jpg", storagePath: "categories/shoes.jpg" },
  { kind: "category", slug: "veils", source: "supabase/catalog-media/cat-veils.jpg", storagePath: "categories/veils.jpg" },
  { kind: "category", slug: "perfumes", source: "supabase/catalog-media/cat-perfumes.jpg", storagePath: "categories/perfumes.jpg" },
  { kind: "product", slug: "atamfa-01", source: "supabase/catalog-media/atamfa/atamfa-01.jpeg", storagePath: "products/atamfa/atamfa-01.jpeg" },
  { kind: "product", slug: "atamfa-02", source: "supabase/catalog-media/atamfa/atamfa-02.jpeg", storagePath: "products/atamfa/atamfa-02.jpeg" },
  { kind: "product", slug: "atamfa-03", source: "supabase/catalog-media/atamfa/atamfa-03.jpeg", storagePath: "products/atamfa/atamfa-03.jpeg" },
  { kind: "product", slug: "atamfa-04", source: "supabase/catalog-media/atamfa/atamfa-04.jpeg", storagePath: "products/atamfa/atamfa-04.jpeg" },
  { kind: "product", slug: "atamfa-05", source: "supabase/catalog-media/atamfa/atamfa-05.jpeg", storagePath: "products/atamfa/atamfa-05.jpeg" },
  { kind: "product", slug: "atamfa-06", source: "supabase/catalog-media/atamfa/atamfa-06.jpeg", storagePath: "products/atamfa/atamfa-06.jpeg" },
  { kind: "product", slug: "atamfa-07", source: "supabase/catalog-media/atamfa/atamfa-07.jpeg", storagePath: "products/atamfa/atamfa-07.jpeg" },
  { kind: "product", slug: "atamfa-08", source: "supabase/catalog-media/atamfa/atamfa-08.jpeg", storagePath: "products/atamfa/atamfa-08.jpeg" },
  { kind: "product", slug: "lace-01", source: "supabase/catalog-media/lace/lace-01.jpeg", storagePath: "products/lace/lace-01.jpeg" },
  { kind: "product", slug: "lace-02", source: "supabase/catalog-media/lace/lace-02.jpeg", storagePath: "products/lace/lace-02.jpeg" },
  { kind: "product", slug: "lace-03", source: "supabase/catalog-media/lace/lace-03.jpeg", storagePath: "products/lace/lace-03.jpeg" },
  { kind: "product", slug: "lace-04", source: "supabase/catalog-media/lace/lace-04.jpeg", storagePath: "products/lace/lace-04.jpeg" },
  { kind: "product", slug: "lace-05", source: "supabase/catalog-media/lace/lace-05.jpeg", storagePath: "products/lace/lace-05.jpeg" },
  { kind: "product", slug: "lace-06", source: "supabase/catalog-media/lace/lace-06.jpeg", storagePath: "products/lace/lace-06.jpeg" },
  { kind: "product", slug: "lace-07", source: "supabase/catalog-media/lace/lace-07.jpeg", storagePath: "products/lace/lace-07.jpeg" },
  { kind: "product", slug: "lace-08", source: "supabase/catalog-media/lace/lace-08.jpeg", storagePath: "products/lace/lace-08.jpeg" },
  { kind: "product", slug: "lace-09", source: "supabase/catalog-media/lace/lace-09.jpeg", storagePath: "products/lace/lace-09.jpeg" },
  { kind: "product", slug: "lace-10", source: "supabase/catalog-media/lace/lace-10.jpeg", storagePath: "products/lace/lace-10.jpeg" },
  { kind: "product", slug: "lace-11", source: "supabase/catalog-media/lace/lace-11.jpeg", storagePath: "products/lace/lace-11.jpeg" },
  { kind: "product", slug: "lace-12", source: "supabase/catalog-media/lace/lace-12.jpeg", storagePath: "products/lace/lace-12.jpeg" },
  { kind: "product", slug: "lace-13", source: "supabase/catalog-media/lace/lace-13.jpeg", storagePath: "products/lace/lace-13.jpeg" },
  { kind: "product", slug: "lace-14", source: "supabase/catalog-media/lace/lace-14.jpeg", storagePath: "products/lace/lace-14.jpeg" },
  { kind: "product", slug: "lace-16", source: "supabase/catalog-media/lace/lace-16.jpeg", storagePath: "products/lace/lace-16.jpeg" },
  { kind: "product", slug: "inner-01", source: "supabase/catalog-media/inner/inner-01.jpeg", storagePath: "products/inner-wears/inner-01.jpeg" },
  { kind: "product", slug: "inner-02", source: "supabase/catalog-media/inner/inner-02.jpeg", storagePath: "products/inner-wears/inner-02.jpeg" },
  { kind: "product", slug: "inner-03", source: "supabase/catalog-media/inner/inner-03.jpeg", storagePath: "products/inner-wears/inner-03.jpeg" },
  { kind: "product", slug: "inner-04", source: "supabase/catalog-media/inner/inner-04.jpeg", storagePath: "products/inner-wears/inner-04.jpeg" },
  { kind: "product", slug: "inner-05", source: "supabase/catalog-media/inner/inner-05.jpeg", storagePath: "products/inner-wears/inner-05.jpeg" },
  { kind: "product", slug: "inner-06", source: "supabase/catalog-media/inner/inner-06.jpeg", storagePath: "products/inner-wears/inner-06.jpeg" },
  { kind: "product", slug: "inner-07", source: "supabase/catalog-media/inner/inner-07.jpeg", storagePath: "products/inner-wears/inner-07.jpeg" },
  { kind: "product", slug: "inner-08", source: "supabase/catalog-media/inner/inner-08.jpeg", storagePath: "products/inner-wears/inner-08.jpeg" },
  { kind: "product", slug: "inner-09", source: "supabase/catalog-media/inner/inner-09.jpeg", storagePath: "products/inner-wears/inner-09.jpeg" },
  { kind: "product", slug: "inner-10", source: "supabase/catalog-media/inner/inner-10.jpeg", storagePath: "products/inner-wears/inner-10.jpeg" },
  { kind: "product", slug: "inner-11", source: "supabase/catalog-media/inner/inner-11.jpeg", storagePath: "products/inner-wears/inner-11.jpeg" },
  { kind: "product", slug: "inner-12", source: "supabase/catalog-media/inner/inner-12.jpeg", storagePath: "products/inner-wears/inner-12.jpeg" },
  { kind: "product", slug: "inner-13", source: "supabase/catalog-media/inner/inner-13.jpeg", storagePath: "products/inner-wears/inner-13.jpeg" },
  { kind: "product", slug: "bag-01", source: "supabase/catalog-media/cat-bags.jpg", storagePath: "products/bags/bag-01.jpg" },
  { kind: "product", slug: "bag-02", source: "supabase/catalog-media/cat-bags.jpg", storagePath: "products/bags/bag-02.jpg" },
  { kind: "product", slug: "shoe-01", source: "supabase/catalog-media/cat-shoes.jpg", storagePath: "products/shoes/shoe-01.jpg" },
  { kind: "product", slug: "shoe-02", source: "supabase/catalog-media/cat-shoes.jpg", storagePath: "products/shoes/shoe-02.jpg" },
  { kind: "product", slug: "veil-01", source: "supabase/catalog-media/cat-veils.jpg", storagePath: "products/veils/veil-01.jpg" },
  { kind: "product", slug: "veil-02", source: "supabase/catalog-media/cat-veils.jpg", storagePath: "products/veils/veil-02.jpg" },
  { kind: "product", slug: "perfume-01", source: "supabase/catalog-media/perfumes/perfume-01.jpeg", storagePath: "products/perfumes/perfume-01.jpeg" },
  { kind: "product", slug: "perfume-02", source: "supabase/catalog-media/perfumes/perfume-02.jpeg", storagePath: "products/perfumes/perfume-02.jpeg" },
  { kind: "product", slug: "perfume-03", source: "supabase/catalog-media/perfumes/perfume-03.jpeg", storagePath: "products/perfumes/perfume-03.jpeg" },
  { kind: "product", slug: "perfume-04", source: "supabase/catalog-media/perfumes/perfume-04.jpeg", storagePath: "products/perfumes/perfume-04.jpeg" },
  { kind: "product", slug: "perfume-05", source: "supabase/catalog-media/perfumes/perfume-05.jpeg", storagePath: "products/perfumes/perfume-05.jpeg" },
  { kind: "product", slug: "perfume-06", source: "supabase/catalog-media/perfumes/perfume-06.jpeg", storagePath: "products/perfumes/perfume-06.jpeg" },
  { kind: "product", slug: "perfume-07", source: "supabase/catalog-media/perfumes/perfume-07.jpeg", storagePath: "products/perfumes/perfume-07.jpeg" },
  { kind: "product", slug: "perfume-08", source: "supabase/catalog-media/perfumes/perfume-08.jpeg", storagePath: "products/perfumes/perfume-08.jpeg" },
  { kind: "product", slug: "perfume-09", source: "supabase/catalog-media/perfumes/perfume-09.jpeg", storagePath: "products/perfumes/perfume-09.jpeg" },
  ];
}
