import { db } from "../db/index";
import { artworks, adminSettings } from "@shared/schema";

async function seed() {
  console.log("🌱 Seeding database...");

  // Seed artworks
  const artworksData = [
    {
      slug: "golden-flow",
      title: "Golden Flow",
      shortDescription: "A mesmerizing dance of golden brushstrokes across a deep canvas, capturing the essence of movement and light.",
      story: "This piece was born from a moment of pure inspiration during a quiet evening in the artist's studio. The flowing gold represents the journey of life - sometimes bold and confident, sometimes delicate and uncertain, but always moving forward with grace. Each brushstroke was carefully placed to create a sense of rhythm and harmony, inviting the viewer to lose themselves in the golden paths that wind across the canvas.",
      images: [
        "attached_assets/generated_images/Artwork_sample_golden_flow_124dae8c.png",
        "attached_assets/generated_images/Artwork_sample_geometric_beige_0755f19f.png"
      ],
      sizes: {
        "Small (40x50 cm)": { price_cents: 320000, total_copies: 5, remaining: 3 },
        "Medium (60x80 cm)": { price_cents: 480000, total_copies: 3, remaining: 2 },
        "Large (90x120 cm)": { price_cents: 750000, total_copies: 2, remaining: 1 }
      },
      type: "limited" as const,
      status: "available" as const
    },
    {
      slug: "geometric-serenity",
      title: "Geometric Serenity",
      shortDescription: "Clean lines and warm tones create a sanctuary of calm in this sophisticated minimalist composition.",
      story: "Inspired by the ancient philosophy of finding balance through simplicity, this artwork represents the modern quest for peace in a chaotic world. The geometric shapes create a visual meditation, while the warm beige and gold tones evoke feelings of comfort and tranquility.",
      images: [
        "attached_assets/generated_images/Artwork_sample_geometric_beige_0755f19f.png"
      ],
      sizes: {
        "Medium (70x90 cm)": { price_cents: 650000, total_copies: 4, remaining: 4 },
        "Large (100x130 cm)": { price_cents: 950000, total_copies: 2, remaining: 2 }
      },
      type: "limited" as const,
      status: "available" as const
    },
    {
      slug: "midnight-essence",
      title: "Midnight Essence",
      shortDescription: "A powerful original piece that captures the mystery and depth of the darkest hour.",
      story: "Created during a solitary night in the mountains, this unique artwork embodies the artist's exploration of shadow and light. The dramatic contrast speaks to the duality of existence, while subtle gold accents hint at the promise of dawn. This is a singular piece that will never be replicated.",
      images: [
        "attached_assets/generated_images/Artwork_sample_dramatic_black_e009691a.png"
      ],
      sizes: {
        "Unique (120x150 cm)": { price_cents: 1200000, total_copies: 1, remaining: 1 }
      },
      type: "unique" as const,
      status: "available" as const
    },
    {
      slug: "warm-elegance",
      title: "Warm Elegance",
      shortDescription: "Soft beige tones with delicate gold leaf details create an atmosphere of refined luxury.",
      story: "Coming soon - A celebration of understated elegance, this piece will showcase the artist's mastery of texture and tone. Gold leaf details catch the light, creating an ever-changing visual experience throughout the day.",
      images: [
        "attached_assets/generated_images/Artwork_sample_warm_elegance_43c1770c.png"
      ],
      sizes: {
        "Medium (60x80 cm)": { price_cents: 550000, total_copies: 5, remaining: 5 }
      },
      type: "limited" as const,
      status: "coming_soon" as const
    }
  ];

  for (const artwork of artworksData) {
    await db.insert(artworks).values([artwork]);
    console.log(`✓ Created artwork: ${artwork.title}`);
  }

  // Seed admin settings
  await db.insert(adminSettings).values([
    { key: "stock_alert_threshold", value: 2 },
    { key: "admin_email", value: "admin@artinyxus.com" },
    { key: "whatsapp_number", value: "+201234567890" }
  ]);
  console.log("✓ Created admin settings");

  console.log("✅ Seeding complete!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
