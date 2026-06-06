import atamfa01 from "@/assets/atamfa/atamfa-01.jpeg";
import atamfa02 from "@/assets/atamfa/atamfa-02.jpeg";
import atamfa03 from "@/assets/atamfa/atamfa-03.jpeg";
import atamfa04 from "@/assets/atamfa/atamfa-04.jpeg";
import atamfa05 from "@/assets/atamfa/atamfa-05.jpeg";
import atamfa06 from "@/assets/atamfa/atamfa-06.jpeg";
import atamfa07 from "@/assets/atamfa/atamfa-07.jpeg";
import atamfa08 from "@/assets/atamfa/atamfa-08.jpeg";
import lace01 from "@/assets/lace/lace-01.jpeg";
import lace02 from "@/assets/lace/lace-02.jpeg";
import lace03 from "@/assets/lace/lace-03.jpeg";
import lace04 from "@/assets/lace/lace-04.jpeg";
import lace05 from "@/assets/lace/lace-05.jpeg";
import lace06 from "@/assets/lace/lace-06.jpeg";
import lace07 from "@/assets/lace/lace-07.jpeg";
import lace08 from "@/assets/lace/lace-08.jpeg";
import lace09 from "@/assets/lace/lace-09.jpeg";
import lace10 from "@/assets/lace/lace-10.jpeg";
import lace11 from "@/assets/lace/lace-11.jpeg";
import lace12 from "@/assets/lace/lace-12.jpeg";
import lace13 from "@/assets/lace/lace-13.jpeg";
import lace14 from "@/assets/lace/lace-14.jpeg";
import lace16 from "@/assets/lace/lace-16.jpeg";
import inner01 from "@/assets/inner/inner-01.jpeg";
import inner02 from "@/assets/inner/inner-02.jpeg";
import inner03 from "@/assets/inner/inner-03.jpeg";
import inner04 from "@/assets/inner/inner-04.jpeg";
import inner05 from "@/assets/inner/inner-05.jpeg";
import inner06 from "@/assets/inner/inner-06.jpeg";
import inner07 from "@/assets/inner/inner-07.jpeg";
import inner08 from "@/assets/inner/inner-08.jpeg";
import inner09 from "@/assets/inner/inner-09.jpeg";
import inner10 from "@/assets/inner/inner-10.jpeg";
import inner11 from "@/assets/inner/inner-11.jpeg";
import inner12 from "@/assets/inner/inner-12.jpeg";
import inner13 from "@/assets/inner/inner-13.jpeg";
import bags from "@/assets/cat-bags.jpg";
import shoes from "@/assets/cat-shoes.jpg";
import veils from "@/assets/cat-veils.jpg";
import perfume01 from "@/assets/perfumes/perfume-01.jpeg";
import perfume02 from "@/assets/perfumes/perfume-02.jpeg";
import perfume03 from "@/assets/perfumes/perfume-03.jpeg";
import perfume04 from "@/assets/perfumes/perfume-04.jpeg";
import perfume05 from "@/assets/perfumes/perfume-05.jpeg";
import perfume06 from "@/assets/perfumes/perfume-06.jpeg";
import perfume07 from "@/assets/perfumes/perfume-07.jpeg";
import perfume08 from "@/assets/perfumes/perfume-08.jpeg";
import perfume09 from "@/assets/perfumes/perfume-09.jpeg";

export const BRAND = "The Fashion Cove";
export const PHONE_DISPLAY = "08106632672";
export const WHATSAPP_NUMBER = "2348106632672";
export const CONTACT_EMAIL = "thefashionCov1@gmail.com";
export const STORE_ADDRESS = "No. A69 Fafu reliable homes Abuja";

export type CategorySlug =
  | "atamfa" | "lace" | "inner-wears" | "bags" | "shoes" | "veils" | "perfumes";

export interface Category {
  slug: CategorySlug;
  name: string;
  blurb: string;
  image: string;
}

export const categories: Category[] = [
  { slug: "atamfa", name: "Atamfa", blurb: "Hand-picked premium wax prints.", image: atamfa01 },
  { slug: "lace", name: "Lace", blurb: "Delicate, intricate, timeless.", image: lace01 },
  { slug: "inner-wears", name: "Inner Wears", blurb: "Silk-soft everyday luxury.", image: inner01 },
  { slug: "bags", name: "Bags", blurb: "Crafted leather, gold accents.", image: bags },
  { slug: "shoes", name: "Shoes", blurb: "Statement heels and classics.", image: shoes },
  { slug: "veils", name: "Veils", blurb: "Bridal grace, embellished.", image: veils },
  { slug: "perfumes", name: "Perfumes", blurb: "Signature scents, lasting trails.", image: perfume01 },
];

export interface Product {
  id: string;
  name: string;
  price: number;       // in NGN
  category: CategorySlug;
  image: string;
  description: string;
  featured?: boolean;
  bestseller?: boolean;
  newArrival?: boolean;
  inStock: boolean;
}

export const products: Product[] = [
  { id: "atamfa-01", name: "Pink Bloom Vlisco Atamfa", price: 35000, category: "atamfa", image: atamfa01, description: "Premium wax print with vivid pink floral motifs and bright blue and yellow accents. Sold as a full fabric length for statement tailoring.", featured: true, bestseller: true, newArrival: true, inStock: true },
  { id: "atamfa-02", name: "Emerald Fan Vlisco Atamfa", price: 35000, category: "atamfa", image: atamfa02, description: "Green, navy and silver Vlisco-style wax print with bold fan motifs. Crisp color contrast for gowns, wrappers and tailored sets.", featured: true, newArrival: true, inStock: true },
  { id: "atamfa-03", name: "Wine Geometry Vlisco Atamfa", price: 35000, category: "atamfa", image: atamfa03, description: "Premium geometric atamfa in wine, navy, grey and fuchsia. A sharp print for polished traditional and modern looks.", bestseller: true, inStock: true },
  { id: "atamfa-04", name: "Indigo Star Vlisco Atamfa", price: 35000, category: "atamfa", image: atamfa04, description: "Indigo and beige wax print with flowing star and vine motifs. Strong pattern work with a refined neutral base.", inStock: true },
  { id: "atamfa-05", name: "Orange Leaf Vlisco Atamfa", price: 35000, category: "atamfa", image: atamfa05, description: "Orange, navy and white leaf-pattern wax print with graphic striping. A vibrant choice for standout outfits.", featured: true, inStock: true },
  { id: "atamfa-06", name: "Africana Ombre Atamfa", price: 35000, category: "atamfa", image: atamfa06, description: "Africana ombre wax print with green, orange and gold tones plus a richly textured reverse side.", newArrival: true, inStock: true },
  { id: "atamfa-07", name: "Bronze Vine Vlisco Atamfa", price: 35000, category: "atamfa", image: atamfa07, description: "Bronze and black vine motifs over a light patterned base. Elegant, grounded colors for classic occasion wear.", inStock: true },
  { id: "atamfa-08", name: "Fuchsia Geometry Vlisco Atamfa", price: 35000, category: "atamfa", image: atamfa08, description: "Fuchsia and navy geometric wax print with fine line details and a bright central accent.", inStock: true },
  { id: "lace-01", name: "Champagne Paisley Lace", price: 28000, category: "lace", image: lace01, description: "Champagne lace with paisley embroidery, rust vine details and a scalloped border.", featured: true, newArrival: true, inStock: true },
  { id: "lace-02", name: "Aqua Paisley Lace", price: 28000, category: "lace", image: lace02, description: "Aqua lace with black and pale blue paisley embroidery, finished with a scalloped edge.", featured: true, inStock: true },
  { id: "lace-03", name: "Blue Floral Border Lace", price: 32000, category: "lace", image: lace03, description: "Soft yellow lace with royal blue floral embroidery and a bold blue border.", bestseller: true, newArrival: true, inStock: true },
  { id: "lace-04", name: "Peach Daisy Lace", price: 30000, category: "lace", image: lace04, description: "Cream lace with peach, ivory and gold daisy embroidery and a gold scalloped border.", featured: true, inStock: true },
  { id: "lace-05", name: "Chocolate Gold Paisley Lace", price: 28000, category: "lace", image: lace05, description: "Chocolate lace with gold and silver paisley embroidery, vine motifs and embellished edging.", bestseller: true, inStock: true },
  { id: "lace-06", name: "Yellow Orchid Lace", price: 32000, category: "lace", image: lace06, description: "Bright yellow Swiss-style lace with purple vine embroidery and oversized floral border.", newArrival: true, inStock: true },
  { id: "lace-07", name: "Pink Silver Vine Lace", price: 32000, category: "lace", image: lace07, description: "Pink lace with silver vine embroidery, deep pink stems and large floral border.", featured: true, inStock: true },
  { id: "lace-08", name: "Rust Floral Lace", price: 32000, category: "lace", image: lace08, description: "Rust lace with pink and gold floral embroidery and an ornate looped border.", inStock: true },
  { id: "lace-09", name: "Blush Black Vine Lace", price: 32000, category: "lace", image: lace09, description: "Blush pink lace with black and silver vine embroidery plus a soft floral border.", inStock: true },
  { id: "lace-10", name: "Navy Blossom Lace", price: 32000, category: "lace", image: lace10, description: "Deep navy lace with gold vines, white blossom embroidery and pink floral edging.", bestseller: true, inStock: true },
  { id: "lace-11", name: "Lilac Mint Vine Lace", price: 32000, category: "lace", image: lace11, description: "Lilac lace with mint vine embroidery, black buds and purple floral border details.", newArrival: true, inStock: true },
  { id: "lace-12", name: "Aqua Paisley Lace II", price: 28000, category: "lace", image: lace12, description: "Aqua paisley lace with pale embroidery and a decorative scalloped hem.", inStock: true },
  { id: "lace-13", name: "Lilac Mint Vine Lace II", price: 32000, category: "lace", image: lace13, description: "Lilac lace with mint vine embroidery and black floral accents for elegant occasion wear.", inStock: true },
  { id: "lace-14", name: "Yellow Blue Floral Lace", price: 32000, category: "lace", image: lace14, description: "Yellow lace with royal blue floral embroidery and lacework border, suited for standout styles.", inStock: true },
  { id: "lace-16", name: "Black Aqua Floral Lace", price: 32000, category: "lace", image: lace16, description: "Black lace with aqua floral embroidery and a matching scalloped floral border.", featured: true, inStock: true },
  { id: "inner-01", name: "Ribbed Tank Inner Set", price: 18000, category: "inner-wears", image: inner01, description: "Assorted ribbed sleeveless inner tops in neutral, green, rust and white tones.", featured: true, newArrival: true, inStock: true },
  { id: "inner-02", name: "Pink Floral Bra Set", price: 18000, category: "inner-wears", image: inner02, description: "Assorted pink and floral bras with smooth cups, lace trims and adjustable straps.", featured: true, inStock: true },
  { id: "inner-03", name: "Neutral Smooth Bra Set", price: 18000, category: "inner-wears", image: inner03, description: "Everyday smooth bras in nude, grey, cream and blush shades with adjustable straps.", bestseller: true, newArrival: true, inStock: true },
  { id: "inner-04", name: "Black and White Bra Duo", price: 16000, category: "inner-wears", image: inner04, description: "Classic black and white bras with structured cups for clean daily support.", inStock: true },
  { id: "inner-05", name: "Bold Color Bra Set", price: 18000, category: "inner-wears", image: inner05, description: "Assorted padded bras in black, blue, fuchsia and purple tones.", featured: true, inStock: true },
  { id: "inner-06", name: "Ribbed Lace Trim Bra Set", price: 18000, category: "inner-wears", image: inner06, description: "Soft ribbed bras in peach and grey with lace trim and bow details.", newArrival: true, inStock: true },
  { id: "inner-07", name: "Color Pop Bra Set", price: 18000, category: "inner-wears", image: inner07, description: "Colorful padded bras in black, fuchsia, navy and purple for everyday wear.", inStock: true },
  { id: "inner-08", name: "Floral Lace Cup Bra Set", price: 18000, category: "inner-wears", image: inner08, description: "Padded bras with floral lace cup details in brown, pink, purple and dark tones.", bestseller: true, inStock: true },
  { id: "inner-09", name: "Satin Finish Bra Set", price: 18000, category: "inner-wears", image: inner09, description: "Satin-finish bras in burgundy, purple, black, pink and smoky shades.", inStock: true },
  { id: "inner-10", name: "Heather Everyday Bra Set", price: 18000, category: "inner-wears", image: inner10, description: "Heather-textured bras in charcoal, burgundy, blue and blush colors.", inStock: true },
  { id: "inner-11", name: "Lace Back Bra Set", price: 18000, category: "inner-wears", image: inner11, description: "Assorted bras with lace band details in nude, navy, black and fuchsia.", featured: true, inStock: true },
  { id: "inner-12", name: "Printed Boxer Brief Set", price: 12000, category: "inner-wears", image: inner12, description: "Assorted printed boxer briefs with playful waistbands and colorful patterns.", newArrival: true, inStock: true },
  { id: "inner-13", name: "Mesh Panel Bra Set", price: 18000, category: "inner-wears", image: inner13, description: "Structured bras with mesh panel details in brown, burgundy, black and purple tones.", inStock: true },
  { id: "bag-01", name: "Cocoa Leather Tote", price: 52000, category: "bags", image: bags, description: "Full-grain leather tote with gold-tone hardware. Roomy and refined.", featured: true, bestseller: true, inStock: true },
  { id: "bag-02", name: "Caramel Mini Crossbody", price: 38000, category: "bags", image: bags, description: "Compact crossbody in supple caramel leather. Day-to-night essential.", newArrival: true, inStock: true },
  { id: "shoe-01", name: "Gold Strappy Heels", price: 42000, category: "shoes", image: shoes, description: "Hand-finished strappy heels in metallic gold. 9cm stiletto.", featured: true, bestseller: true, newArrival: true, inStock: true },
  { id: "shoe-02", name: "Nude Classic Pump", price: 36000, category: "shoes", image: shoes, description: "A wardrobe staple in soft nude. Comfortable footbed.", inStock: true },
  { id: "veil-01", name: "Pearl-Beaded Cathedral Veil", price: 65000, category: "veils", image: veils, description: "Floor-length cathedral veil with hand-placed pearl beading.", featured: true, newArrival: true, inStock: true },
  { id: "veil-02", name: "Soft Tulle Fingertip Veil", price: 28000, category: "veils", image: veils, description: "Lightweight fingertip veil in soft ivory tulle.", inStock: true },
  { id: "perfume-01", name: "Fresh Breeze Peach Diffuser", price: 12000, category: "perfumes", image: perfume01, description: "Fresh Breeze peach reed diffuser, 160ml, for a soft fruity room fragrance.", featured: true, newArrival: true, inStock: true },
  { id: "perfume-02", name: "Air Magic Lemon Reed Diffuser", price: 12000, category: "perfumes", image: perfume02, description: "Air Magic lemon reed diffuser with a bright citrus scent.", featured: true, inStock: true },
  { id: "perfume-03", name: "Crown Breeze Diffuser", price: 12000, category: "perfumes", image: perfume03, description: "Crown Breeze reed diffuser, 160ml, with a clean home fragrance profile.", bestseller: true, inStock: true },
  { id: "perfume-04", name: "Era Agrume Reed Diffuser", price: 12000, category: "perfumes", image: perfume04, description: "Era Agrume reed diffuser with citrus-inspired notes.", inStock: true },
  { id: "perfume-05", name: "Lasgidi Crush Body Mist Set", price: 10000, category: "perfumes", image: perfume05, description: "Assorted Lasgidi Crush body mists in vanilla, pistachio, pinky and candy scents, 100ml each.", featured: true, bestseller: true, inStock: true },
  { id: "perfume-06", name: "Lasgidi Vanilla Crush Body Mist", price: 3500, category: "perfumes", image: perfume06, description: "Lasgidi Vanilla Crush body mist, 100ml, with a sweet vanilla scent.", newArrival: true, inStock: true },
  { id: "perfume-07", name: "Lasgidi Pistachio Crush Body Mist", price: 3500, category: "perfumes", image: perfume07, description: "Lasgidi Pistachio Crush body mist, 100ml, with a soft nutty sweet profile.", inStock: true },
  { id: "perfume-08", name: "Lasgidi Candy Crush Body Mist", price: 3500, category: "perfumes", image: perfume08, description: "Lasgidi Candy Crush body mist, 100ml, with a playful sweet fragrance.", inStock: true },
  { id: "perfume-09", name: "Chance No 9 Eau de Parfum", price: 15000, category: "perfumes", image: perfume09, description: "Chance No 9 Jinbadi eau de parfum, 110ml, with a romantic Be My Love profile.", featured: true, inStock: true },
];

export const formatNGN = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

export const findProduct = (id: string) => products.find(p => p.id === id);
export const productsByCategory = (slug: CategorySlug) => products.filter(p => p.category === slug);
export const categoryName = (slug: CategorySlug) =>
  categories.find(c => c.slug === slug)?.name ?? slug;

export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
