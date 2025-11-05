import ArtworkCard from "../ArtworkCard";
import artworkImage from "@assets/generated_images/Artwork_sample_golden_flow_124dae8c.png";

export default function ArtworkCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8">
      <ArtworkCard
        title="Golden Flow"
        image={artworkImage}
        priceFrom={4800}
        type="limited"
        status="available"
        onClick={() => console.log("Clicked Golden Flow")}
      />
      <ArtworkCard
        title="Midnight Essence"
        image={artworkImage}
        priceFrom={12000}
        type="unique"
        status="available"
        onClick={() => console.log("Clicked Midnight Essence")}
      />
      <ArtworkCard
        title="Whispers"
        image={artworkImage}
        priceFrom={3200}
        type="limited"
        status="coming_soon"
        onClick={() => console.log("Clicked Whispers")}
      />
    </div>
  );
}
