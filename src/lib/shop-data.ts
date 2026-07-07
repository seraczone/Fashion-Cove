const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const productMediaBase = supabaseUrl
  ? `${supabaseUrl}/storage/v1/object/public/product-media`
  : "";

const productMediaUrl = (path: string) =>
  productMediaBase ? `${productMediaBase}/${path}` : `/product-media/${path}`;

export const BRAND = "The Fashion Cove";
export const PHONE_DISPLAY = "08106632672";
export const WHATSAPP_NUMBER = "2348106632672";
export const CONTACT_EMAIL = "thefashionCov1@gmail.com";
export const STORE_ADDRESS = "No. A69 Fafu reliable homes Abuja";

export type CategorySlug = string;

export interface Category {
  slug: CategorySlug;
  name: string;
  blurb: string;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: CategorySlug;
  image: string;
  description: string;
  featured?: boolean;
  bestseller?: boolean;
  newArrival?: boolean;
  inStock: boolean;
}

export const categories: Category[] = [
  { slug: "atamfa", name: "Atamfa", blurb: "Hand-picked premium wax prints.", image: productMediaUrl("categories/atamfa.jpg") },
  { slug: "lace", name: "Lace", blurb: "Delicate, intricate, timeless.", image: productMediaUrl("categories/lace.jpg") },
  { slug: "inner-wears", name: "Inner Wears", blurb: "Silk-soft everyday luxury.", image: productMediaUrl("categories/inner-wears.jpg") },
  { slug: "bags", name: "Bags", blurb: "Crafted leather, gold accents.", image: productMediaUrl("categories/bags.jpg") },
  { slug: "shoes", name: "Shoes", blurb: "Statement heels and classics.", image: productMediaUrl("categories/shoes.jpg") },
  { slug: "veils", name: "Veils", blurb: "Bridal grace, embellished.", image: productMediaUrl("categories/veils.jpg") },
  { slug: "perfumes", name: "Perfumes", blurb: "Signature scents, lasting trails.", image: productMediaUrl("categories/perfumes.jpg") },
];

export const products: Product[] = [
  { id: "atamfa-01", name: "Pink Bloom Vlisco Atamfa", price: 35000, category: "atamfa", image: productMediaUrl("products/atamfa/atamfa-01.jpeg"), description: "Premium wax print with vivid pink floral motifs and bright blue and yellow accents. Sold as a full fabric length for statement tailoring.", featured: true, bestseller: true, newArrival: true, inStock: true },
  { id: "atamfa-02", name: "Emerald Fan Vlisco Atamfa", price: 35000, category: "atamfa", image: productMediaUrl("products/atamfa/atamfa-02.jpeg"), description: "Green, navy and silver Vlisco-style wax print with bold fan motifs. Crisp color contrast for gowns, wrappers and tailored sets.", featured: true, newArrival: true, inStock: true },
  { id: "atamfa-03", name: "Wine Geometry Vlisco Atamfa", price: 35000, category: "atamfa", image: productMediaUrl("products/atamfa/atamfa-03.jpeg"), description: "Premium geometric atamfa in wine, navy, grey and fuchsia. A sharp print for polished traditional and modern looks.", bestseller: true, inStock: true },
  { id: "atamfa-04", name: "Indigo Star Vlisco Atamfa", price: 35000, category: "atamfa", image: productMediaUrl("products/atamfa/atamfa-04.jpeg"), description: "Indigo and beige wax print with flowing star and vine motifs. Strong pattern work with a refined neutral base.", inStock: true },
  { id: "atamfa-05", name: "Orange Leaf Vlisco Atamfa", price: 35000, category: "atamfa", image: productMediaUrl("products/atamfa/atamfa-05.jpeg"), description: "Orange, navy and white leaf-pattern wax print with graphic striping. A vibrant choice for standout outfits.", featured: true, inStock: true },
  { id: "atamfa-06", name: "Africana Ombre Atamfa", price: 35000, category: "atamfa", image: productMediaUrl("products/atamfa/atamfa-06.jpeg"), description: "Africana ombre wax print with green, orange and gold tones plus a richly textured reverse side.", newArrival: true, inStock: true },
  { id: "atamfa-07", name: "Bronze Vine Vlisco Atamfa", price: 35000, category: "atamfa", image: productMediaUrl("products/atamfa/atamfa-07.jpeg"), description: "Bronze and black vine motifs over a light patterned base. Elegant, grounded colors for classic occasion wear.", inStock: true },
  { id: "atamfa-08", name: "Fuchsia Geometry Vlisco Atamfa", price: 35000, category: "atamfa", image: productMediaUrl("products/atamfa/atamfa-08.jpeg"), description: "Fuchsia and navy geometric wax print with fine line details and a bright central accent.", inStock: true },
  { id: "lace-01", name: "Champagne Paisley Lace", price: 28000, category: "lace", image: productMediaUrl("products/lace/lace-01.jpeg"), description: "Champagne lace with paisley embroidery, rust vine details and a scalloped border.", featured: true, newArrival: true, inStock: true },
  { id: "lace-02", name: "Aqua Paisley Lace", price: 28000, category: "lace", image: productMediaUrl("products/lace/lace-02.jpeg"), description: "Aqua lace with black and pale blue paisley embroidery, finished with a scalloped edge.", featured: true, inStock: true },
  { id: "lace-03", name: "Blue Floral Border Lace", price: 32000, category: "lace", image: productMediaUrl("products/lace/lace-03.jpeg"), description: "Soft yellow lace with royal blue floral embroidery and a bold blue border.", bestseller: true, newArrival: true, inStock: true },
  { id: "lace-04", name: "Peach Daisy Lace", price: 30000, category: "lace", image: productMediaUrl("products/lace/lace-04.jpeg"), description: "Cream lace with peach, ivory and gold daisy embroidery and a gold scalloped border.", featured: true, inStock: true },
  { id: "lace-05", name: "Chocolate Gold Paisley Lace", price: 28000, category: "lace", image: productMediaUrl("products/lace/lace-05.jpeg"), description: "Chocolate lace with gold and silver paisley embroidery, vine motifs and embellished edging.", bestseller: true, inStock: true },
  { id: "lace-06", name: "Yellow Orchid Lace", price: 32000, category: "lace", image: productMediaUrl("products/lace/lace-06.jpeg"), description: "Bright yellow Swiss-style lace with purple vine embroidery and oversized floral border.", newArrival: true, inStock: true },
  { id: "lace-07", name: "Pink Silver Vine Lace", price: 32000, category: "lace", image: productMediaUrl("products/lace/lace-07.jpeg"), description: "Pink lace with silver vine embroidery, deep pink stems and large floral border.", featured: true, inStock: true },
  { id: "lace-08", name: "Rust Floral Lace", price: 32000, category: "lace", image: productMediaUrl("products/lace/lace-08.jpeg"), description: "Rust lace with pink and gold floral embroidery and an ornate looped border.", inStock: true },
  { id: "lace-09", name: "Blush Black Vine Lace", price: 32000, category: "lace", image: productMediaUrl("products/lace/lace-09.jpeg"), description: "Blush pink lace with black and silver vine embroidery plus a soft floral border.", inStock: true },
  { id: "lace-10", name: "Navy Blossom Lace", price: 32000, category: "lace", image: productMediaUrl("products/lace/lace-10.jpeg"), description: "Deep navy lace with gold vines, white blossom embroidery and pink floral edging.", bestseller: true, inStock: true },
  { id: "lace-11", name: "Lilac Mint Vine Lace", price: 32000, category: "lace", image: productMediaUrl("products/lace/lace-11.jpeg"), description: "Lilac lace with mint vine embroidery, black buds and purple floral border details.", newArrival: true, inStock: true },
  { id: "lace-12", name: "Aqua Paisley Lace II", price: 28000, category: "lace", image: productMediaUrl("products/lace/lace-12.jpeg"), description: "Aqua paisley lace with pale embroidery and a decorative scalloped hem.", inStock: true },
  { id: "lace-13", name: "Lilac Mint Vine Lace II", price: 32000, category: "lace", image: productMediaUrl("products/lace/lace-13.jpeg"), description: "Lilac lace with mint vine embroidery and black floral accents for elegant occasion wear.", inStock: true },
  { id: "lace-14", name: "Yellow Blue Floral Lace", price: 32000, category: "lace", image: productMediaUrl("products/lace/lace-14.jpeg"), description: "Yellow lace with royal blue floral embroidery and lacework border, suited for standout styles.", inStock: true },
  { id: "lace-16", name: "Black Aqua Floral Lace", price: 32000, category: "lace", image: productMediaUrl("products/lace/lace-16.jpeg"), description: "Black lace with aqua floral embroidery and a matching scalloped floral border.", featured: true, inStock: true },
  { id: "inner-01", name: "Ribbed Tank Inner Set", price: 18000, category: "inner-wears", image: productMediaUrl("products/inner-wears/inner-01.jpeg"), description: "Assorted ribbed sleeveless inner tops in neutral, green, rust and white tones.", featured: true, newArrival: true, inStock: true },
  { id: "inner-02", name: "Pink Floral Bra Set", price: 18000, category: "inner-wears", image: productMediaUrl("products/inner-wears/inner-02.jpeg"), description: "Assorted pink and floral bras with smooth cups, lace trims and adjustable straps.", featured: true, inStock: true },
  { id: "inner-03", name: "Neutral Smooth Bra Set", price: 18000, category: "inner-wears", image: productMediaUrl("products/inner-wears/inner-03.jpeg"), description: "Everyday smooth bras in nude, grey, cream and blush shades with adjustable straps.", bestseller: true, newArrival: true, inStock: true },
  { id: "inner-04", name: "Black and White Bra Duo", price: 16000, category: "inner-wears", image: productMediaUrl("products/inner-wears/inner-04.jpeg"), description: "Classic black and white bras with structured cups for clean daily support.", inStock: true },
  { id: "inner-05", name: "Bold Color Bra Set", price: 18000, category: "inner-wears", image: productMediaUrl("products/inner-wears/inner-05.jpeg"), description: "Assorted padded bras in black, blue, fuchsia and purple tones.", featured: true, inStock: true },
  { id: "inner-06", name: "Ribbed Lace Trim Bra Set", price: 18000, category: "inner-wears", image: productMediaUrl("products/inner-wears/inner-06.jpeg"), description: "Soft ribbed bras in peach and grey with lace trim and bow details.", newArrival: true, inStock: true },
  { id: "inner-07", name: "Color Pop Bra Set", price: 18000, category: "inner-wears", image: productMediaUrl("products/inner-wears/inner-07.jpeg"), description: "Colorful padded bras in black, fuchsia, navy and purple for everyday wear.", inStock: true },
  { id: "inner-08", name: "Floral Lace Cup Bra Set", price: 18000, category: "inner-wears", image: productMediaUrl("products/inner-wears/inner-08.jpeg"), description: "Padded bras with floral lace cup details in brown, pink, purple and dark tones.", bestseller: true, inStock: true },
  { id: "inner-09", name: "Satin Finish Bra Set", price: 18000, category: "inner-wears", image: productMediaUrl("products/inner-wears/inner-09.jpeg"), description: "Satin-finish bras in burgundy, purple, black, pink and smoky shades.", inStock: true },
  { id: "inner-10", name: "Heather Everyday Bra Set", price: 18000, category: "inner-wears", image: productMediaUrl("products/inner-wears/inner-10.jpeg"), description: "Heather-textured bras in charcoal, burgundy, blue and blush colors.", inStock: true },
  { id: "inner-11", name: "Lace Back Bra Set", price: 18000, category: "inner-wears", image: productMediaUrl("products/inner-wears/inner-11.jpeg"), description: "Assorted bras with lace band details in nude, navy, black and fuchsia.", featured: true, inStock: true },
  { id: "inner-12", name: "Printed Boxer Brief Set", price: 12000, category: "inner-wears", image: productMediaUrl("products/inner-wears/inner-12.jpeg"), description: "Assorted printed boxer briefs with playful waistbands and colorful patterns.", newArrival: true, inStock: true },
  { id: "inner-13", name: "Mesh Panel Bra Set", price: 18000, category: "inner-wears", image: productMediaUrl("products/inner-wears/inner-13.jpeg"), description: "Structured bras with mesh panel details in brown, burgundy, black and purple tones.", inStock: true },
  { id: "bag-01", name: "Cocoa Leather Tote", price: 52000, category: "bags", image: productMediaUrl("products/bags/bag-01.jpg"), description: "Full-grain leather tote with gold-tone hardware. Roomy and refined.", featured: true, bestseller: true, inStock: true },
  { id: "bag-02", name: "Caramel Mini Crossbody", price: 38000, category: "bags", image: productMediaUrl("products/bags/bag-02.jpg"), description: "Compact crossbody in supple caramel leather. Day-to-night essential.", newArrival: true, inStock: true },
  { id: "shoe-01", name: "Gold Strappy Heels", price: 42000, category: "shoes", image: productMediaUrl("products/shoes/shoe-01.jpg"), description: "Hand-finished strappy heels in metallic gold. 9cm stiletto.", featured: true, bestseller: true, newArrival: true, inStock: true },
  { id: "shoe-02", name: "Nude Classic Pump", price: 36000, category: "shoes", image: productMediaUrl("products/shoes/shoe-02.jpg"), description: "A wardrobe staple in soft nude. Comfortable footbed.", inStock: true },
  { id: "veil-01", name: "Pearl-Beaded Cathedral Veil", price: 65000, category: "veils", image: productMediaUrl("products/veils/veil-01.jpg"), description: "Floor-length cathedral veil with hand-placed pearl beading.", featured: true, newArrival: true, inStock: true },
  { id: "veil-02", name: "Soft Tulle Fingertip Veil", price: 28000, category: "veils", image: productMediaUrl("products/veils/veil-02.jpg"), description: "Lightweight fingertip veil in soft ivory tulle.", inStock: true },
  { id: "perfume-01", name: "Fresh Breeze Peach Diffuser", price: 12000, category: "perfumes", image: productMediaUrl("products/perfumes/perfume-01.jpeg"), description: "Fresh Breeze peach reed diffuser, 160ml, for a soft fruity room fragrance.", featured: true, newArrival: true, inStock: true },
  { id: "perfume-02", name: "Air Magic Lemon Reed Diffuser", price: 12000, category: "perfumes", image: productMediaUrl("products/perfumes/perfume-02.jpeg"), description: "Air Magic lemon reed diffuser with a bright citrus scent.", featured: true, inStock: true },
  { id: "perfume-03", name: "Crown Breeze Diffuser", price: 12000, category: "perfumes", image: productMediaUrl("products/perfumes/perfume-03.jpeg"), description: "Crown Breeze reed diffuser, 160ml, with a clean home fragrance profile.", bestseller: true, inStock: true },
  { id: "perfume-04", name: "Era Agrume Reed Diffuser", price: 12000, category: "perfumes", image: productMediaUrl("products/perfumes/perfume-04.jpeg"), description: "Era Agrume reed diffuser with citrus-inspired notes.", inStock: true },
  { id: "perfume-05", name: "Lasgidi Crush Body Mist Set", price: 10000, category: "perfumes", image: productMediaUrl("products/perfumes/perfume-05.jpeg"), description: "Assorted Lasgidi Crush body mists in vanilla, pistachio, pinky and candy scents, 100ml each.", featured: true, bestseller: true, inStock: true },
  { id: "perfume-06", name: "Lasgidi Vanilla Crush Body Mist", price: 3500, category: "perfumes", image: productMediaUrl("products/perfumes/perfume-06.jpeg"), description: "Lasgidi Vanilla Crush body mist, 100ml, with a sweet vanilla scent.", newArrival: true, inStock: true },
  { id: "perfume-07", name: "Lasgidi Pistachio Crush Body Mist", price: 3500, category: "perfumes", image: productMediaUrl("products/perfumes/perfume-07.jpeg"), description: "Lasgidi Pistachio Crush body mist, 100ml, with a soft nutty sweet profile.", inStock: true },
  { id: "perfume-08", name: "Lasgidi Candy Crush Body Mist", price: 3500, category: "perfumes", image: productMediaUrl("products/perfumes/perfume-08.jpeg"), description: "Lasgidi Candy Crush body mist, 100ml, with a playful sweet fragrance.", inStock: true },
  { id: "perfume-09", name: "Chance No 9 Eau de Parfum", price: 15000, category: "perfumes", image: productMediaUrl("products/perfumes/perfume-09.jpeg"), description: "Chance No 9 Jinbadi eau de parfum, 110ml, with a romantic Be My Love profile.", featured: true, inStock: true },
];

export const formatNGN = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

export const findProduct = (id: string, source: Product[] = products) => source.find((p) => p.id === id);
export const productsByCategory = (slug: CategorySlug, source: Product[] = products) =>
  source.filter((p) => p.category === slug);
export const categoryName = (slug: CategorySlug, source: Category[] = categories) =>
  source.find((c) => c.slug === slug)?.name ?? slug;

export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
