import ArtworkGallery from "../ArtworkGallery";
import artwork1 from "@assets/generated_images/Artwork_sample_golden_flow_124dae8c.png";
import artwork2 from "@assets/generated_images/Artwork_sample_geometric_beige_0755f19f.png";
import artwork3 from "@assets/generated_images/Artwork_sample_dramatic_black_e009691a.png";

const mockArtworks = [
  {
    id: "1",
    title: "Golden Flow",
    image: artwork1,
    priceFrom: 4800,
    type: "limited" as const,
    status: "available" as const,
  },
  {
    id: "2",
    title: "Geometric Serenity",
    image: artwork2,
    priceFrom: 6500,
    type: "limited" as const,
    status: "available" as const,
  },
  {
    id: "3",
    title: "Midnight Essence",
    image: artwork3,
    priceFrom: 12000,
    type: "unique" as const,
    status: "available" as const,
  },
];

export default function ArtworkGalleryExample() {
  return (
    <ArtworkGallery
      artworks={mockArtworks}
      title="Available Now"
      onArtworkClick={(id) => console.log("Clicked artwork:", id)}
    />
  );
}
