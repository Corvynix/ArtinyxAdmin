// Static product data for Pikachu artwork
export interface ProductSize {
  size: string;
  price: number; // in EGP
  totalCopies: number;
  remaining: number;
  description?: string;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  titleEn?: string;
  shortDescription: string;
  shortDescriptionEn?: string;
  story: string;
  storyEn?: string;
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
    titleEn: "Pikachu Artwork",
    shortDescription: "تحفة فنية استثنائية تجسد روح شخصية Pikachu المحبوبة بألوان نابضة بالحياة وتكوين ديناميكي.",
    shortDescriptionEn: "An exceptional artistic masterpiece that embodies the beloved Pikachu character with vibrant colors and dynamic composition.",
    story: "هذه التحفة الفنية المذهلة تجسد جوهر شخصية Pikachu المحبوبة بألوان نابضة بالحياة وتكوين ديناميكي. كل قطعة مصنوعة يدويًا بعناية فائقة وتأتي مع شهادة أصالة. مثالية لأي معجب بـ Pokemon يبحث عن قطعة فريدة تضيف جمالًا وطاقة إلى أي مساحة.",
    storyEn: "This stunning artistic masterpiece captures the essence of the beloved Pikachu character with vibrant colors and dynamic composition. Each piece is meticulously handcrafted with exceptional care and comes with a certificate of authenticity. Perfect for any Pokemon fan looking for a unique piece that adds beauty and energy to any space.",
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
        remaining: 14
      },
      {
        size: "50×70 سم",
        price: 6800,
        totalCopies: 7,
        remaining: 7
      },
      {
        size: "70×100 سم",
        price: 13500,
        totalCopies: 1,
        remaining: 1
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
