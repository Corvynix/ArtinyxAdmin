import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ArtworkCardProps {
  title: string;
  image: string;
  priceFrom: number;
  type: "unique" | "limited" | "auction";
  status: "available" | "coming_soon" | "sold";
  language?: "en" | "ar";
  onClick?: () => void;
}

export default function ArtworkCard({
  title,
  image,
  priceFrom,
  type,
  status,
  language = "en",
  onClick
}: ArtworkCardProps) {
  const getTypeLabel = () => {
    if (language === "en") {
      return type === "unique" ? "Unique" : type === "limited" ? "Limited Edition" : "Auction";
    }
    return type === "unique" ? "فريدة" : type === "limited" ? "طبعة محدودة" : "مزاد";
  };

  const getStatusLabel = () => {
    if (status === "sold") return language === "en" ? "Sold Out" : "نفذت";
    if (status === "coming_soon") return language === "en" ? "Coming Soon" : "قريباً";
    return null;
  };

  const statusLabel = getStatusLabel();

  return (
    <Card
      className="overflow-hidden cursor-pointer transition-transform duration-250 hover:scale-[1.03] hover-elevate active-elevate-2"
      onClick={onClick}
      data-testid={`card-artwork-${title.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div className="relative aspect-square">
        <img
          src={image}
          alt={title}
          className={`w-full h-full object-cover ${status === "coming_soon" ? "blur-sm" : ""}`}
          data-testid="img-artwork"
        />
        {statusLabel && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span 
              className={`text-lg px-4 py-2 rounded-md font-semibold ${
                status === "sold" 
                  ? "bg-red-900/90 text-white border-2 border-red-700" 
                  : "bg-yellow-900/90 text-yellow-100 border-2 border-yellow-700"
              }`}
              data-testid="badge-status"
            >
              {statusLabel}
            </span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge 
            className="gold-metallic-bg border-2 border-yellow-600/40 font-semibold"
            data-testid="badge-type"
          >
            {getTypeLabel()}
          </Badge>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-serif text-xl font-semibold mb-2 text-card-foreground" data-testid="text-title">
          {title}
        </h3>
        {status === "available" && (
          <p className="text-muted-foreground" data-testid="text-price-from">
            {language === "en" ? "from" : "من"} <span className="gold-metallic font-semibold text-lg">{priceFrom.toLocaleString()} EGP</span>
          </p>
        )}
      </div>
    </Card>
  );
}
