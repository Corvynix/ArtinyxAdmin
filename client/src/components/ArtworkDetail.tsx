import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PriceDisplay from "./PriceDisplay";
import WhatsAppButton from "./WhatsAppButton";

interface Size {
  name: string;
  price: number;
  remaining: number;
  total: number;
}

interface ArtworkDetailProps {
  title: string;
  shortDescription: string;
  story: string;
  images: string[];
  sizes: Size[];
  type: "unique" | "limited" | "auction";
  language?: "en" | "ar";
}

export default function ArtworkDetail({
  title,
  shortDescription,
  story,
  images,
  sizes,
  type,
  language = "en"
}: ArtworkDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(sizes[0]?.name || "");
  const [storyExpanded, setStoryExpanded] = useState(false);

  const currentSize = sizes.find(s => s.name === selectedSize) || sizes[0];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const getTypeLabel = () => {
    if (language === "en") {
      return type === "unique" ? "Unique" : type === "limited" ? "Limited Edition" : "Live Auction";
    }
    return type === "unique" ? "فريدة" : type === "limited" ? "طبعة محدودة" : "مزاد مباشر";
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 px-4" data-testid="artwork-detail">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Image Section - 60% */}
          <div className="lg:col-span-3">
            <Card className="overflow-hidden">
              <div className="relative aspect-square bg-muted">
                <img
                  src={images[currentImageIndex]}
                  alt={`${title} - ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                  data-testid="img-artwork-main"
                />
                
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm p-2 rounded-full hover-elevate active-elevate-2"
                      aria-label="Previous image"
                      data-testid="button-prev-image"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm p-2 rounded-full hover-elevate active-elevate-2"
                      aria-label="Next image"
                      data-testid="button-next-image"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
                
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex ? "bg-primary w-6" : "bg-background/60"
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                      data-testid={`button-image-indicator-${index}`}
                    />
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Details Section - 40% */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <Badge className="mb-3 bg-primary/90 text-primary-foreground border-primary-border" data-testid="badge-type">
                {getTypeLabel()}
              </Badge>
              <h1 className="font-serif text-4xl font-bold mb-4" data-testid="text-artwork-title">
                {title}
              </h1>
              <p className="text-lg leading-relaxed text-muted-foreground" data-testid="text-description">
                {shortDescription}
              </p>
            </div>

            {type !== "auction" && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2" data-testid="label-size">
                    {language === "en" ? "Select Size" : "اختر المقاس"}
                  </label>
                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger data-testid="select-size">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sizes.map((size) => (
                        <SelectItem key={size.name} value={size.name} data-testid={`option-size-${size.name}`}>
                          {size.name} - {size.price.toLocaleString()} EGP
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <PriceDisplay
                  price={currentSize.price}
                  language={language}
                />

                <WhatsAppButton
                  artworkId=""
                  artworkTitle={title}
                  size={selectedSize}
                  price={currentSize.price}
                  language={language}
                />

                <p className="text-sm text-muted-foreground text-center flex items-center justify-center gap-1" data-testid="text-shipping-note">
                  <span className="text-green-600">✓</span>
                  {language === "en" 
                    ? "Price includes shipping cost"
                    : "السعر يشمل تكلفة الشحن"}
                </p>
              </>
            )}

            <div>
              <h3 className="font-serif text-2xl font-semibold mb-3" data-testid="text-story-title">
                {language === "en" ? "The Story" : "القصة"}
              </h3>
              <div className={`text-muted-foreground leading-relaxed ${!storyExpanded && "line-clamp-4"}`} data-testid="text-story">
                {story}
              </div>
              <button
                onClick={() => setStoryExpanded(!storyExpanded)}
                className="text-primary font-medium mt-2 hover:underline"
                data-testid="button-toggle-story"
              >
                {storyExpanded 
                  ? (language === "en" ? "Show less" : "إظهار أقل")
                  : (language === "en" ? "Read more" : "اقرأ المزيد")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
