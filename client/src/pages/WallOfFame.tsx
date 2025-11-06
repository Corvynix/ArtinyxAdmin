import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Crown } from "lucide-react";

interface TopBuyer {
  buyerName: string;
  whatsapp: string;
  artworkTitle: string;
  size: string;
  priceCents: number;
  createdAt: Date;
}

export default function WallOfFame() {
  const [language, setLanguage] = useState<"en" | "ar">("en");

  const { data: topBuyers = [], isLoading } = useQuery<TopBuyer[]>({
    queryKey: ["/api/wall-of-fame"],
    queryFn: async () => {
      const response = await fetch("/api/wall-of-fame?limit=10");
      if (!response.ok) throw new Error("Failed to fetch Wall of Fame");
      return response.json();
    }
  });

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="w-8 h-8 text-yellow-500" data-testid="icon-rank-1" />;
      case 1:
        return <Medal className="w-7 h-7 text-gray-400" data-testid="icon-rank-2" />;
      case 2:
        return <Award className="w-6 h-6 text-amber-600" data-testid="icon-rank-3" />;
      default:
        return <Trophy className="w-5 h-5 text-primary" data-testid={`icon-rank-${index + 1}`} />;
    }
  };

  const getRankBadge = (index: number) => {
    const labels = {
      0: { en: "Champion Collector", ar: "جامع بطل" },
      1: { en: "Elite Patron", ar: "راعي النخبة" },
      2: { en: "Distinguished Buyer", ar: "مشتري مميز" },
    };

    if (index <= 2) {
      return (
        <Badge variant="default" className="text-xs" data-testid={`badge-rank-${index + 1}`}>
          {language === "en" ? labels[index as 0 | 1 | 2].en : labels[index as 0 | 1 | 2].ar}
        </Badge>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar currentLang={language} onLanguageChange={setLanguage} />
        <div className="pt-24 flex items-center justify-center">
          <div className="text-2xl font-serif text-muted-foreground" data-testid="text-loading">
            {language === "en" ? "Loading..." : "جاري التحميل..."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar currentLang={language} onLanguageChange={setLanguage} />
      
      <div className="pt-24 px-4 pb-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <Trophy className="w-16 h-16 text-primary" data-testid="icon-trophy-hero" />
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-foreground" data-testid="heading-wall-of-fame">
              {language === "en" ? "Wall of Fame" : "جدار الشرف"}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="text-description">
              {language === "en" 
                ? "Celebrating our most distinguished collectors who invested in the finest artworks"
                : "احتفالاً بأبرز جامعينا الذين استثمروا في أجود الأعمال الفنية"}
            </p>
          </div>

          {/* Top Buyers List */}
          {topBuyers.length === 0 ? (
            <Card className="p-12 text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" data-testid="icon-empty" />
              <p className="text-xl text-muted-foreground" data-testid="text-no-collectors">
                {language === "en" 
                  ? "Be the first collector to join our Wall of Fame!"
                  : "كن أول جامع ينضم إلى جدار الشرف!"}
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {topBuyers.map((buyer, index) => (
                <Card 
                  key={index}
                  className={`p-6 transition-all hover:shadow-lg ${
                    index === 0 ? "border-yellow-500 border-2 bg-gradient-to-r from-yellow-50 to-transparent dark:from-yellow-950 dark:to-transparent" :
                    index === 1 ? "border-gray-400 border-2 bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-900 dark:to-transparent" :
                    index === 2 ? "border-amber-600 border-2 bg-gradient-to-r from-amber-50 to-transparent dark:from-amber-950 dark:to-transparent" :
                    ""
                  }`}
                  data-testid={`card-buyer-${index + 1}`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="flex flex-col items-center min-w-[60px]">
                      {getRankIcon(index)}
                      <span className="text-2xl font-bold mt-2 text-foreground" data-testid={`text-rank-${index + 1}`}>
                        #{index + 1}
                      </span>
                    </div>

                    {/* Buyer Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold text-foreground" data-testid={`text-buyer-name-${index + 1}`}>
                          {buyer.buyerName}
                        </h3>
                        {getRankBadge(index)}
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-muted-foreground" data-testid={`text-artwork-${index + 1}`}>
                          <span className="font-medium">
                            {language === "en" ? "Artwork: " : "العمل الفني: "}
                          </span>
                          {buyer.artworkTitle}
                        </p>
                        
                        <div className="flex gap-4 text-sm">
                          <p className="text-muted-foreground" data-testid={`text-size-${index + 1}`}>
                            <span className="font-medium">
                              {language === "en" ? "Size: " : "المقاس: "}
                            </span>
                            {buyer.size}
                          </p>
                          
                          <p className="text-primary font-bold" data-testid={`text-price-${index + 1}`}>
                            {(buyer.priceCents / 100).toLocaleString()} 
                            {language === "en" ? " EGP" : " جنيه"}
                          </p>
                        </div>
                        
                        <p className="text-xs text-muted-foreground" data-testid={`text-date-${index + 1}`}>
                          {language === "en" ? "Purchased on " : "تم الشراء في "}
                          {new Date(buyer.createdAt).toLocaleDateString(language === "en" ? "en-US" : "ar-EG", {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Call to Action */}
          <div className="mt-12 text-center">
            <Card className="p-8 bg-card">
              <h2 className="text-2xl font-serif font-bold mb-3 text-foreground" data-testid="heading-join-cta">
                {language === "en" ? "Join Our Elite Collectors" : "انضم إلى جامعينا النخبة"}
              </h2>
              <p className="text-muted-foreground mb-6" data-testid="text-join-description">
                {language === "en" 
                  ? "Invest in premium artworks and secure your place among Egypt's most distinguished art collectors"
                  : "استثمر في الأعمال الفنية الفاخرة وضمن مكانك بين أبرز جامعي الفن في مصر"}
              </p>
              <a 
                href="/gallery" 
                className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-md font-semibold transition-all"
                data-testid="button-explore-gallery"
              >
                {language === "en" ? "Explore Gallery" : "استكشف المعرض"}
              </a>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
