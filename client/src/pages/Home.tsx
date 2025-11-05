import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ArtworkGallery from "@/components/ArtworkGallery";
import { artworksAPI, analyticsAPI } from "@/lib/api";

export default function Home() {
  const [language, setLanguage] = useState<"en" | "ar">("en");

  const { data: allArtworks = [], isLoading } = useQuery({
    queryKey: ["/api/artworks"],
    queryFn: artworksAPI.getAll
  });

  const availableArtworks = allArtworks
    .filter(a => a.status === "available")
    .map(a => ({
      id: a.id,
      title: a.title,
      image: a.images[0] || "",
      priceFrom: Math.min(...Object.values(a.sizes).map(s => s.price_cents)) / 100,
      type: a.type,
      status: a.status
    }));

  const comingSoonArtworks = allArtworks
    .filter(a => a.status === "coming_soon")
    .map(a => ({
      id: a.id,
      title: a.title,
      image: a.images[0] || "",
      priceFrom: Math.min(...Object.values(a.sizes).map(s => s.price_cents)) / 100,
      type: a.type,
      status: a.status
    }));

  useEffect(() => {
    // Track page view
    analyticsAPI.track({
      eventType: "page_view",
      meta: { page: "home" }
    });
  }, []);

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
    <div className="min-h-screen">
      <Navbar currentLang={language} onLanguageChange={setLanguage} />
      <Hero language={language} />
      
      {availableArtworks.length > 0 && (
        <ArtworkGallery
          artworks={availableArtworks}
          title={language === "en" ? "Available Now" : "متاح الآن"}
          language={language}
          onArtworkClick={handleArtworkClick}
        />
      )}
      
      {comingSoonArtworks.length > 0 && (
        <ArtworkGallery
          artworks={comingSoonArtworks}
          title={language === "en" ? "Coming Soon" : "قريباً"}
          language={language}
          onArtworkClick={handleArtworkClick}
        />
      )}

      <footer className="bg-card border-t border-card-border py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-muted-foreground mb-4" data-testid="text-footer">
            {language === "en" 
              ? "© 2025 Artinyxus. All rights reserved."
              : "© 2025 Artinyxus. جميع الحقوق محفوظة."}
          </p>
          <div className="flex justify-center gap-6 text-sm">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-privacy">
              {language === "en" ? "Privacy Policy" : "سياسة الخصوصية"}
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-refund">
              {language === "en" ? "Refund Policy" : "سياسة الاسترجاع"}
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-terms">
              {language === "en" ? "Terms of Service" : "شروط الخدمة"}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
