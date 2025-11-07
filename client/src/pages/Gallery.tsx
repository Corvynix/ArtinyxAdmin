import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import ArtworkGallery from "@/components/ArtworkGallery";
import SEO from "@/components/SEO";
import { artworksAPI } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Filter } from "lucide-react";

export default function Gallery() {
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const [typeFilter, setTypeFilter] = useState<"all" | "unique" | "limited" | "auction">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [showFilters, setShowFilters] = useState(false);

  const { data: allArtworks = [], isLoading } = useQuery({
    queryKey: ["/api/artworks"],
    queryFn: artworksAPI.getAll
  });

  const categories = Array.from(new Set(allArtworks.map(a => (a as any).category).filter(Boolean)));

  const filteredArtworks = allArtworks
    .filter(a => a.status === "available")
    .filter(a => typeFilter === "all" || a.type === typeFilter)
    .filter(a => {
      if (categoryFilter === "all") return true;
      return (a as any).category === categoryFilter;
    })
    .filter(a => {
      const prices = Object.values(a.sizes).map(s => s.price_cents);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      return minPrice >= priceRange[0] * 100 && maxPrice <= priceRange[1] * 100;
    })
    .map(a => ({
      id: a.id,
      title: a.title,
      image: a.images[0] || "",
      priceFrom: Math.min(...Object.values(a.sizes).map(s => s.price_cents)) / 100,
      type: a.type,
      status: a.status
    }));

  const handleArtworkClick = (id: string) => {
    const artwork = allArtworks.find(a => a.id === id);
    if (artwork) {
      window.location.href = `/artworks/${artwork.slug}`;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-serif text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={language === "en" ? "Art Gallery - Browse Exclusive Canvas Art" : "معرض الفنون - تصفح الفن الحصري"}
        description={language === "en" 
          ? "Browse our exclusive collection of unique and limited edition canvas art. Filter by style, price, and availability. Own a masterpiece today." 
          : "تصفح مجموعتنا الحصرية من الفن الفريد والمحدود الإصدار. فلتر حسب الأسلوب والسعر والتوفر. احصل على تحفة فنية اليوم."}
      />
      <Navbar currentLang={language} onLanguageChange={setLanguage} />
      
      <div className="pt-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start mb-12">
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 md:mb-0">
              {language === "en" ? "Art Gallery" : "معرض الفنون"}
            </h1>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-accent"
              data-testid="button-toggle-filters"
            >
              <Filter className="w-4 h-4" />
              {language === "en" ? "Filters" : "الفلاتر"}
            </button>
          </div>

          {showFilters && (
            <div className="bg-card border border-border rounded-lg p-6 mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === "en" ? "Type" : "النوع"}
                </label>
                <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
                  <SelectTrigger data-testid="select-type-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {language === "en" ? "All Types" : "جميع الأنواع"}
                    </SelectItem>
                    <SelectItem value="unique">
                      {language === "en" ? "Unique" : "فريدة"}
                    </SelectItem>
                    <SelectItem value="limited">
                      {language === "en" ? "Limited Edition" : "طبعة محدودة"}
                    </SelectItem>
                    <SelectItem value="auction">
                      {language === "en" ? "Auctions" : "مزادات"}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === "en" ? "Category" : "الفئة"}
                </label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger data-testid="select-category-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {language === "en" ? "All Categories" : "جميع الفئات"}
                    </SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat || ""}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === "en" ? `Price Range: ${priceRange[0]} - ${priceRange[1]} EGP` : `نطاق السعر: ${priceRange[0]} - ${priceRange[1]} ج.م`}
                </label>
                <Slider
                  min={0}
                  max={100000}
                  step={1000}
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                  className="mt-4"
                  data-testid="slider-price-range"
                />
              </div>
            </div>
          )}

          {filteredArtworks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArtworks.map((artwork) => (
                <div key={artwork.id} onClick={() => handleArtworkClick(artwork.id)}>
                  <div className="overflow-hidden cursor-pointer transition-transform duration-250 hover:scale-[1.03]">
                    <div className="relative aspect-square bg-card border border-card-border rounded-lg overflow-hidden">
                      <img
                        src={artwork.image}
                        alt={artwork.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3">
                        <span className="gold-metallic-bg border-2 border-yellow-600/40 font-semibold px-3 py-1 rounded-md text-sm">
                          {artwork.type === "unique" ? (language === "en" ? "Unique" : "فريدة") :
                           artwork.type === "limited" ? (language === "en" ? "Limited Edition" : "طبعة محدودة") :
                           (language === "en" ? "Auction" : "مزاد")}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-serif text-xl font-semibold mb-2">{artwork.title}</h3>
                      <p className="text-muted-foreground">
                        {language === "en" ? "from" : "من"} <span className="gold-metallic font-semibold text-lg">{artwork.priceFrom.toLocaleString()} EGP</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-2xl text-muted-foreground">
                {language === "en" ? "No artworks found" : "لا توجد أعمال فنية"}
              </p>
            </div>
          )}
        </div>
      </div>

      <footer className="bg-card border-t border-card-border py-12 px-4 mt-20">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-muted-foreground mb-4">
            {language === "en" 
              ? "© 2025 Artinyxus. All rights reserved."
              : "© 2025 Artinyxus. جميع الحقوق محفوظة."}
          </p>
        </div>
      </footer>
    </div>
  );
}
