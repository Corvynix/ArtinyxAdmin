import ArtworkDetail from "../ArtworkDetail";
import artwork1 from "@assets/generated_images/Artwork_sample_golden_flow_124dae8c.png";
import artwork2 from "@assets/generated_images/Artwork_sample_geometric_beige_0755f19f.png";

const mockSizes = [
  { name: "Small (40x50 cm)", price: 3200, remaining: 3, total: 5 },
  { name: "Medium (60x80 cm)", price: 4800, remaining: 2, total: 3 },
  { name: "Large (90x120 cm)", price: 7500, remaining: 1, total: 2 },
];

export default function ArtworkDetailExample() {
  return (
    <ArtworkDetail
      title="Golden Flow"
      shortDescription="A mesmerizing dance of golden brushstrokes across a deep canvas, capturing the essence of movement and light."
      story="This piece was born from a moment of pure inspiration during a quiet evening in the artist's studio. The flowing gold represents the journey of life - sometimes bold and confident, sometimes delicate and uncertain, but always moving forward with grace. Each brushstroke was carefully placed to create a sense of rhythm and harmony, inviting the viewer to lose themselves in the golden paths that wind across the canvas. The contrast between the deep background and the luminous gold creates a dialogue between shadow and light, between stillness and motion."
      images={[artwork1, artwork2]}
      sizes={mockSizes}
      type="limited"
    />
  );
}
