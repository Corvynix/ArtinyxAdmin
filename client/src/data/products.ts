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
 shortDescription: "لوحة فنية محدودة تُعيد فيك الإحساس اللي كان زمان… لما كنا بنجري ورا اللي بنحبه من غير خوف.",
shortDescriptionEn: "A limited artwork that brings back the fearless feeling we once had—when we used to chase what we love without hesitation.",

story: `
أنا مكنتش برسم *بيكاتشو*…
أنا كنت برجع لوقت مكانش في حاجة بتخوفنا.

الوقت اللي كنا بنجري فيه ورا اللي بنحبه
من غير ما نسأل:
ده صح؟
ده غلط؟
هيودّي لفين؟

كبرنا…
وبقينا نفكر قبل ما نحس.
وبقينا نخاف قبل ما نتحرك.
وبدلّنا الحلم بالراحة.

وأنا برسم هنا… حسّيت نفس الإحساس القديم.
الإحساس اللي بيقول:
“إمشي… حتى لو الطريق طويل.”

وعشان كده كتبت:
**لا تبحث عن الراحة وأنت في عمر السعي.**

اللوحة دي مش للديكور.
دي للي لسه جواه طفل… لسه بيحلم… صوته واطي شوية.

لو حسّيت إن الكلام ده ليك — فهي ليك.
`,

storyEn: `
I wasn’t just painting *Pikachu*…
I was going back to a time when nothing scared us.

A time when we chased what we loved
without asking:
Is it right?
Is it wrong?
Where will it lead?

We grew up…
We started thinking before feeling.
We got scared before moving.
We traded dreams for comfort.

While painting this, I felt that old feeling again.
The one that whispers:
“Keep going… even if the road is long.”

That’s why I wrote:
**Do not seek comfort while you are in the age of striving.**

This artwork isn’t decoration.
It’s for the one who still has a child inside…
still dreaming… just quiet.

If you felt this — then it’s yours.
`,

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
