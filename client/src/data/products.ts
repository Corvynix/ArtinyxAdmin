// Static product data for Pikachu artwork
export interface ProductSize {
  size: string;
  price: number; // in EGP
  totalCopies: number;
  remaining: number;
  tier: "Tier 1" | "Tier 2" | "Tier 3";
  description: string;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  story: string;
  images: string[];
  sizes: ProductSize[];
  type: "unique" | "limited";
  status: "available";
}

export const products: Product[] = [
  {
    id: "pikachu-artwork",
    slug: "pikachu-artwork",
    title: "Pikachu Artwork",
    shortDescription: "تحفة فنية استثنائية تجسد روح شخصية Pikachu المحبوبة بألوان نابضة بالحياة وتكوين ديناميكي.",
    story: "هذه التحفة الفنية المذهلة تجسد جوهر شخصية Pikachu المحبوبة بألوان نابضة بالحياة وتكوين ديناميكي. كل قطعة مصنوعة يدويًا بعناية فائقة وتأتي مع شهادة أصالة. مثالية لأي معجب بـ Pokemon يبحث عن قطعة فريدة تضيف جمالًا وطاقة إلى أي مساحة.",
    images: [
      "/uploads/artworks/Pickashu/product_1x0.jpg",
      "/uploads/artworks/Pickashu/product_1x1.jpg",
      "/uploads/artworks/Pickashu/product_1x2.jpg",
      "/uploads/artworks/Pickashu/product_1x3.jpg"
    ],
    sizes: [
      {
        size: "30×40 سم",
        price: 3400,
        totalCopies: 15,
        remaining: 15,
        tier: "Tier 1",
        description: "Tier 1 — Emotional Entry - للطبقة الطموحة (2,900 - 3,400 EGP)"
      },
      {
        size: "50×70 سم",
        price: 6800,
        totalCopies: 3,
        remaining: 3,
        tier: "Tier 2",
        description: "Tier 2 — Core Collector Edition - للباحثين عن الراحة والفخامة البسيطة (5,900 - 6,800 EGP)"
      },
      {
        size: "70×100 سم",
        price: 13500,
        totalCopies: 1,
        remaining: 1,
        tier: "Tier 3",
        description: "Tier 3 — Prestige Masterpiece - نسخة أصلية واحدة موقّعة (1/1) للباحثين عن الفخامة والهوية (10,500 - 13,500 EGP)"
      }
    ],
    type: "limited",
    status: "available"
  }
];

export const getProductBySlug = (slug: string): Product | undefined => {
  return products.find(p => p.slug === slug);
};

export const getAllProducts = (): Product[] => {
  return products;
};
