import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import PriceDisplay from "@/components/PriceDisplay";
import WhatsAppButton from "@/components/WhatsAppButton";
import SEO from "@/components/SEO";
import { getProductBySlug } from "@/data/products";

export default function ArtworkPage() {
  const [, params] = useRoute("/artworks/:slug");
  const slug = params?.slug || "";
  
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [storyExpanded, setStoryExpanded] = useState(false);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);

  const product = getProductBySlug(slug);

  useEffect(() => {
    if (product && product.sizes.length > 0) {
      setSelectedSizeIndex(0);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-serif text-muted-foreground">
          {language === "en" ? "Product not found" : "المنتج غير موجود"}
        </div>
      </div>
    );
  }

  const currentSize = product.sizes[selectedSizeIndex];
  const images = product.images;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const getTypeLabel = () => {
    if (language === "en") {
      return product.type === "unique" ? "Unique" : "Limited Edition";
    }
    return product.type === "unique" ? "فريدة" : "طبعة محدودة";
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={product.title}
        description={product.shortDescription || `${product.title} - Limited edition canvas art at Artinyxus. Order via WhatsApp today.`}
        ogImage={product.images[0]}
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
                    alt={`${product.title} - ${currentImageIndex + 1}`}
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
                  {language === "en" ? (product.titleEn || product.title) : product.title}
                </h1>
                <p className="text-lg leading-relaxed text-muted-foreground" data-testid="text-description">
                  {language === "en" ? (product.shortDescriptionEn || product.shortDescription) : product.shortDescription}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" data-testid="label-size">
                  {language === "en" ? "Select Size" : "اختر المقاس"}
                </label>
                <Select 
                  value={selectedSizeIndex.toString()} 
                  onValueChange={(value) => setSelectedSizeIndex(parseInt(value))}
                >
                  <SelectTrigger data-testid="select-size">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {product.sizes.map((size, index) => (
                      <SelectItem key={index} value={index.toString()} data-testid={`option-size-${index}`}>
                        {size.size} - {size.price.toLocaleString()} {language === "en" ? "EGP" : "جنيه"}
                        {size.remaining > 0 && (
                          <span className="text-muted-foreground text-xs ml-2">
                            ({language === "en" ? `${size.remaining} of ${size.totalCopies} available` : `${size.remaining} من ${size.totalCopies} متاحة`})
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {currentSize && (
                <>
                  <div className="space-y-4">
                    <PriceDisplay
                      price={currentSize.price}
                      language={language}
                    />

                    <div className="p-4 bg-red-50 dark:bg-red-950/30 border-2 border-red-300 dark:border-red-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">⚠️</span>
                        <p className="text-sm font-bold text-red-800 dark:text-red-300">
                          {language === "en" ? "Limited Edition - Very Scarce!" : "نسخ محدودة جداً - ندرة استثنائية!"}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-red-700 dark:text-red-400">
                            {language === "en" ? "Available copies:" : "النسخ المتاحة:"}
                          </span>
                          <span className="text-lg font-bold text-red-900 dark:text-red-200">
                            {currentSize.remaining} {language === "en" ? `of ${currentSize.totalCopies}` : `من ${currentSize.totalCopies}`}
                          </span>
                        </div>
                        <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">
                          {language === "en" 
                            ? "⚡ Once sold out, this artwork will never be available again. Secure your copy now!"
                            : "⚡ بمجرد نفاد الكمية، لن تتوفر هذه اللوحة مرة أخرى أبداً. احجز نسختك الآن!"}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2">
                        {language === "en" ? "📋 Order Terms" : "📋 شروط الطلب"}
                      </p>
                      <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-1 list-disc list-inside">
                        <li>
                          {language === "en" 
                            ? "🔒 Pre-payment required to confirm reservation"
                            : "🔒 الدفع مقدّم لتأكيد الحجز"}
                        </li>
                        <li>
                          {language === "en" 
                            ? "🕒 48-hour full refund from delivery (if you change your mind, return as received)"
                            : "🕒 يمكنك استرجاع المبلغ كاملاً خلال 48 ساعة من الاستلام (بشرط إعادة اللوحة كما استلمتها)"}
                        </li>
                        <li>
                          {language === "en" 
                            ? "🎨 Each piece is handcrafted exclusively for you - value and uniqueness guaranteed"
                            : "🎨 كل قطعة مصنوعة يدوياً خصيصاً لك - القيمة والتفرد مضمونان"}
                        </li>
                      </ul>
                    </div>

                    <WhatsAppButton
                      artworkId={product.id}
                      artworkTitle={product.title}
                      size={currentSize.size}
                      price={currentSize.price}
                      language={language}
                    />

                    <p className="text-sm text-muted-foreground text-center" data-testid="text-shipping-note">
                      {language === "en" 
                        ? "✓ Price includes shipping cost"
                        : "✓ السعر يشمل تكلفة الشحن"}
                    </p>
                  </div>
                </>
              )}

              {product.story && (
                <div>
                  <h3 className="font-serif text-2xl font-semibold mb-3" data-testid="text-story-title">
                    {language === "en" ? "The Story" : "القصة"}
                  </h3>
                  <div className={`text-muted-foreground leading-relaxed ${!storyExpanded && "line-clamp-4"}`} data-testid="text-story">
                    {language === "en" ? (product.storyEn || product.story) : product.story}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
