import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import ArtworkGallery from "@/components/ArtworkGallery";
import { artworksAPI } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Gallery() {
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const [filter, setFilter] = useState<"all" | "unique" | "limited" | "auction">("all");

  const { data: allArtworks = [], isLoading } = useQuery({
    queryKey: ["/api/artworks"],
    queryFn: artworksAPI.getAll
  });

  const filteredArtworks = allArtworks
    .filter(a => a.status === "available")
    .filter(a => filter === "all" || a.type === filter)
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
      <Navbar currentLang={language} onLanguageChange={setLanguage} />
      
      <div className="pt-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 md:mb-0">
              {language === "en" ? "Art Gallery" : "معرض الفنون"}
            </h1>
            
            <div className="w-full md:w-64">
              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {language === "en" ? "All Artworks" : "جميع الأعمال"}
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
          </div>

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
