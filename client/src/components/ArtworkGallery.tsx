import ArtworkCard from "./ArtworkCard";

interface Artwork {
  id: string;
  title: string;
  image: string;
  priceFrom: number;
  type: "unique" | "limited" | "auction";
  status: "available" | "coming_soon" | "sold";
}

interface ArtworkGalleryProps {
  artworks: Artwork[];
  title: string;
  language?: "en" | "ar";
  onArtworkClick?: (id: string) => void;
}

export default function ArtworkGallery({
  artworks,
  title,
  language = "en",
  onArtworkClick
}: ArtworkGalleryProps) {
  return (
    <section className="py-20 px-4" id="gallery" data-testid="section-gallery">
      <div className="max-w-7xl mx-auto">
        <h2 
          className="font-serif text-4xl md:text-5xl font-bold text-center mb-12"
          data-testid="text-gallery-title"
        >
          {title}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artworks.map((artwork) => (
            <ArtworkCard
              key={artwork.id}
              title={artwork.title}
              image={artwork.image}
              priceFrom={artwork.priceFrom}
              type={artwork.type}
              status={artwork.status}
              language={language}
              onClick={() => onArtworkClick?.(artwork.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
