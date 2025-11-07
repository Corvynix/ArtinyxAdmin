import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MessageCircle, Clock, Calendar } from "lucide-react";
import Navbar from "@/components/Navbar";
import ScarcityBadge from "@/components/ScarcityBadge";
import PriceDisplay from "@/components/PriceDisplay";
import SEO from "@/components/SEO";
import { artworksAPI, ordersAPI, analyticsAPI } from "@/lib/api";

export default function ArtworkPage() {
  const [, params] = useRoute("/artworks/:slug");
  const slug = params?.slug || "";
  
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [storyExpanded, setStoryExpanded] = useState(false);
  const [selectedSizeKey, setSelectedSizeKey] = useState("");

  const { data: artwork, isLoading } = useQuery({
    queryKey: ["/api/artworks", slug],
    queryFn: () => artworksAPI.getBySlug(slug),
    enabled: !!slug
  });

  const { data: capacityInfo } = useQuery({
    queryKey: ["/api/capacity/availability"],
    queryFn: async () => {
      const response = await fetch("/api/capacity/availability");
      if (!response.ok) return null;
      return response.json();
    }
  });

  const createOrderMutation = useMutation({
    mutationFn: ordersAPI.create,
    onSuccess: (data) => {
      // Track analytics
      analyticsAPI.track({
        eventType: "order_created",
        artworkId: artwork?.id,
        meta: { size: selectedSizeKey }
      });
      
      // Open WhatsApp
      if (data.whatsappUrl) {
        window.open(data.whatsappUrl, "_blank");
      }
    }
  });

  useEffect(() => {
    if (artwork) {
      const sizes = Object.keys(artwork.sizes);
      if (sizes.length > 0 && !selectedSizeKey) {
        setSelectedSizeKey(sizes[0]);
      }
      
      // Track page view
      analyticsAPI.track({
        eventType: "page_view",
        artworkId: artwork.id
      });
    }
  }, [artwork]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-serif text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-serif text-muted-foreground">Artwork not found</div>
      </div>
    );
  }

  const sizes = Object.entries(artwork.sizes);
  const currentSize = selectedSizeKey ? artwork.sizes[selectedSizeKey] : sizes[0]?.[1];
  const images = artwork.images;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const getTypeLabel = () => {
    if (language === "en") {
      return artwork.type === "unique" ? "Unique" : artwork.type === "limited" ? "Limited Edition" : "Live Auction";
    }
    return artwork.type === "unique" ? "فريدة" : artwork.type === "limited" ? "طبعة محدودة" : "مزاد مباشر";
  };

  const handleWhatsAppOrder = () => {
    if (!currentSize) return;
    
    createOrderMutation.mutate({
      artworkId: artwork.id,
      size: selectedSizeKey,
      priceCents: currentSize.price_cents
    });

    analyticsAPI.track({
      eventType: "whatsapp_click",
      artworkId: artwork.id,
      meta: { size: selectedSizeKey }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={artwork.title}
        description={artwork.shortDescription || `${artwork.title} - Limited edition canvas art at Artinyxus. ${artwork.type === "unique" ? "Unique piece" : "Limited copies available"}. Order via WhatsApp today.`}
        ogImage={artwork.images[0]}
        ogType="product"
      />
      <Navbar currentLang={language} onLanguageChange={setLanguage} />
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <Card className="overflow-hidden">
                <div className="relative aspect-square bg-muted">
                  <img
                    src={images[currentImageIndex]}
                    alt={`${artwork.title} - ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                    data-testid="img-artwork-main"
                  />
                  
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm p-2 rounded-full hover-elevate active-elevate-2"
                        data-testid="button-prev-image"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm p-2 rounded-full hover-elevate active-elevate-2"
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
                        data-testid={`button-image-indicator-${index}`}
                      />
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div>
                <Badge className="mb-3 bg-primary/90 text-primary-foreground border-primary-border" data-testid="badge-type">
                  {getTypeLabel()}
                </Badge>
                <h1 className="font-serif text-4xl font-bold mb-4" data-testid="text-artwork-title">
                  {artwork.title}
                </h1>
                <p className="text-lg leading-relaxed text-muted-foreground" data-testid="text-description">
                  {artwork.shortDescription}
                </p>
              </div>

              {artwork.type !== "auction" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2" data-testid="label-size">
                      {language === "en" ? "Select Size" : "اختر المقاس"}
                    </label>
                    <Select value={selectedSizeKey} onValueChange={setSelectedSizeKey}>
                      <SelectTrigger data-testid="select-size">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sizes.map(([key, size]) => (
                          <SelectItem key={key} value={key} data-testid={`option-size-${key}`}>
                            {key} - {(size.price_cents / 100).toLocaleString()} EGP
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {currentSize && (
                    <>
                      <PriceDisplay
                        price={currentSize.price_cents / 100}
                        referencePrice={Math.round((currentSize.price_cents / 100) * 1.35)}
                        language={language}
                      />

                      <ScarcityBadge
                        remaining={currentSize.remaining}
                        total={currentSize.total_copies}
                        language={language}
                      />

                      <div className="space-y-3">
                        {capacityInfo && capacityInfo.available && (
                          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              <span className="font-medium text-blue-700 dark:text-blue-300">
                                {language === "en"
                                  ? capacityInfo.daysUntilStart === 0
                                    ? "Available today!"
                                    : `Available in ${capacityInfo.daysUntilStart} day${capacityInfo.daysUntilStart > 1 ? 's' : ''}`
                                  : capacityInfo.daysUntilStart === 0
                                    ? "متاح اليوم!"
                                    : `متاح خلال ${capacityInfo.daysUntilStart} يوم`}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <Calendar className="w-3 h-3" />
                              <span>
                                {language === "en"
                                  ? `Estimated completion: ${capacityInfo.estimatedCompletion} days`
                                  : `الوقت المتوقع للتسليم: ${capacityInfo.estimatedCompletion} يوم`}
                              </span>
                            </div>
                          </div>
                        )}

                        <Button
                          size="lg"
                          onClick={handleWhatsAppOrder}
                          disabled={createOrderMutation.isPending || currentSize.remaining === 0}
                          className="w-full bg-primary hover:bg-primary text-primary-foreground text-lg px-8 py-6 rounded-2xl flex items-center justify-center gap-2"
                          data-testid="button-whatsapp-order"
                        >
                          <MessageCircle className="w-5 h-5" />
                          {language === "en" ? "Order via WhatsApp" : "طلب عبر واتساب"}
                        </Button>
                        
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                          <span className="text-green-600 font-semibold">💰</span>
                          <span data-testid="text-guarantee">
                            {language === "en" 
                              ? "100% Money-Back Guarantee — 7-Day Trial, No Questions Asked"
                              : "ضمان استرجاع 100% — تجربة 7 أيام بلا أسئلة"}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground text-center" data-testid="text-shipping-note">
                        {language === "en" 
                          ? "Price does not include shipping costs."
                          : "السعر لا يشمل تكاليف الشحن."}
                      </p>
                    </>
                  )}
                </>
              )}

              {artwork.story && (
                <div>
                  <h3 className="font-serif text-2xl font-semibold mb-3" data-testid="text-story-title">
                    {language === "en" ? "The Story" : "القصة"}
                  </h3>
                  <div className={`text-muted-foreground leading-relaxed ${!storyExpanded && "line-clamp-4"}`} data-testid="text-story">
                    {artwork.story}
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
              )}

              <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground italic" data-testid="text-social-proof">
                  {language === "en" 
                    ? "🎨 Recently acquired by collectors in Cairo, Alexandria, and Dubai" 
                    : "🎨 تم الاستحواذ عليها مؤخرًا من قبل جامعين في القاهرة والإسكندرية ودبي"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
