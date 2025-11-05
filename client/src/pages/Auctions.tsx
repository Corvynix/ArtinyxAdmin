import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Artwork, Bid } from "@shared/schema";

const artworksAPI = {
  getAll: async (): Promise<Artwork[]> => {
    const response = await fetch("/api/artworks");
    if (!response.ok) throw new Error("Failed to fetch artworks");
    return response.json();
  }
};

const bidsAPI = {
  getByArtwork: async (artworkId: string): Promise<Bid[]> => {
    const response = await fetch(`/api/artworks/${artworkId}/bids`);
    if (!response.ok) throw new Error("Failed to fetch bids");
    return response.json();
  },
  place: async (data: { artworkId: string; bidderName?: string; whatsapp?: string; amountCents: number }) => {
    const response = await apiRequest("POST", "/api/bids", data);
    return response.json();
  }
};

function AuctionCountdown({ endTime }: { endTime: Date }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft("Auction Ended");
        clearInterval(timer);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <span className="font-mono font-bold text-lg" data-testid="text-countdown">
      {timeLeft}
    </span>
  );
}

function AuctionCard({ artwork, language }: { artwork: Artwork; language: "en" | "ar" }) {
  const [bidAmount, setBidAmount] = useState("");
  const { toast } = useToast();

  const { data: bids = [] } = useQuery({
    queryKey: ["/api/artworks", artwork.id, "bids"],
    queryFn: () => bidsAPI.getByArtwork(artwork.id),
    refetchInterval: 5000
  });

  const placeBidMutation = useMutation({
    mutationFn: bidsAPI.place,
    onSuccess: () => {
      toast({
        title: language === "en" ? "Bid Placed!" : "تم وضع المزايدة!",
        description: language === "en" 
          ? "Your bid has been recorded successfully" 
          : "تم تسجيل مزايدتك بنجاح"
      });
      setBidAmount("");
      queryClient.invalidateQueries({ queryKey: ["/api/artworks", artwork.id, "bids"] });
      queryClient.invalidateQueries({ queryKey: ["/api/artworks"] });
    },
    onError: (error: any) => {
      toast({
        title: language === "en" ? "Error" : "خطأ",
        description: error.message || (language === "en" ? "Failed to place bid" : "فشل وضع المزايدة"),
        variant: "destructive"
      });
    }
  });

  const isLive = artwork.auctionStart && artwork.auctionEnd &&
    new Date() >= new Date(artwork.auctionStart) &&
    new Date() < new Date(artwork.auctionEnd);

  const hasEnded = artwork.auctionEnd && new Date() >= new Date(artwork.auctionEnd);
  
  const currentBid = artwork.currentBidCents || 0;
  const minIncrement = artwork.minIncrementCents || 50000;
  const minNextBid = currentBid + minIncrement;

  const handlePlaceBid = () => {
    const amount = parseInt(bidAmount);
    if (!amount || amount * 100 < minNextBid) {
      toast({
        title: language === "en" ? "Invalid Bid" : "مزايدة غير صالحة",
        description: language === "en"
          ? `Minimum bid is ${minNextBid / 100} EGP`
          : `الحد الأدنى للمزايدة هو ${minNextBid / 100} جنيه`,
        variant: "destructive"
      });
      return;
    }

    placeBidMutation.mutate({
      artworkId: artwork.id,
      amountCents: amount * 100
    });
  };

  return (
    <Card className="overflow-hidden" data-testid={`card-auction-${artwork.slug}`}>
      <div className="relative aspect-square">
        <img
          src={artwork.images[0]}
          alt={artwork.title}
          className="w-full h-full object-cover"
          data-testid="img-artwork"
        />
        {hasEnded && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Badge className="bg-red-900 text-white text-lg px-4 py-2" data-testid="badge-ended">
              {language === "en" ? "Auction Closed" : "المزاد منتهي"}
            </Badge>
          </div>
        )}
        {isLive && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-green-600 text-white animate-pulse" data-testid="badge-live">
              {language === "en" ? "LIVE" : "مباشر"}
            </Badge>
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="font-serif text-2xl font-bold mb-2" data-testid="text-title">
          {artwork.title}
        </h3>
        
        {artwork.shortDescription && (
          <p className="text-muted-foreground mb-4 line-clamp-2" data-testid="text-description">
            {artwork.shortDescription}
          </p>
        )}

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {language === "en" ? "Current Bid:" : "المزايدة الحالية:"}
            </span>
            <span className="gold-metallic font-bold text-xl" data-testid="text-current-bid">
              {(currentBid / 100).toLocaleString()} {language === "en" ? "EGP" : "جنيه"}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {language === "en" ? "Total Bids:" : "عدد المزايدات:"}
            </span>
            <span className="font-semibold" data-testid="text-bid-count">
              {bids.length}
            </span>
          </div>

          {isLive && artwork.auctionEnd && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {language === "en" ? "Time Left:" : "الوقت المتبقي:"}
              </span>
              <AuctionCountdown endTime={new Date(artwork.auctionEnd)} />
            </div>
          )}

          {hasEnded && (
            <div className="text-center py-2 bg-muted rounded-md">
              <span className="font-semibold">
                {language === "en" ? "Auction Ended" : "انتهى المزاد"}
              </span>
            </div>
          )}

          {isLive && (
            <div className="flex gap-2 mt-4">
              <Input
                type="number"
                placeholder={language === "en" ? `Min: ${minNextBid / 100} EGP` : `الحد الأدنى: ${minNextBid / 100}`}
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                className="flex-1"
                data-testid="input-bid-amount"
              />
              <Button
                onClick={handlePlaceBid}
                disabled={placeBidMutation.isPending}
                data-testid="button-place-bid"
              >
                {placeBidMutation.isPending 
                  ? (language === "en" ? "Placing..." : "جاري الإرسال...") 
                  : (language === "en" ? "Place Bid" : "زايد")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function Auctions() {
  const [language, setLanguage] = useState<"en" | "ar">("en");

  const { data: allArtworks = [], isLoading } = useQuery({
    queryKey: ["/api/artworks"],
    queryFn: artworksAPI.getAll,
    refetchInterval: 10000
  });

  const auctionArtworks = allArtworks.filter(a => a.type === "auction");
  const liveAuctions = auctionArtworks.filter(a => 
    a.auctionStart && a.auctionEnd &&
    new Date() >= new Date(a.auctionStart) &&
    new Date() < new Date(a.auctionEnd)
  );
  const upcomingAuctions = auctionArtworks.filter(a =>
    a.auctionStart && new Date() < new Date(a.auctionStart)
  );
  const endedAuctions = auctionArtworks.filter(a =>
    a.auctionEnd && new Date() >= new Date(a.auctionEnd)
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-serif text-muted-foreground">
          {language === "en" ? "Loading auctions..." : "جاري تحميل المزادات..."}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar currentLang={language} onLanguageChange={setLanguage} />

      <div className="pt-24 px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4" data-testid="text-page-title">
              {language === "en" ? "Art Auctions" : "مزادات الفنون"}
            </h1>
            <p className="text-xl text-muted-foreground">
              {language === "en" 
                ? "Bid on exclusive artworks and become a collector" 
                : "زايد على أعمال فنية حصرية وكن جامعًا"}
            </p>
          </div>

          {liveAuctions.length > 0 && (
            <section className="mb-16">
              <h2 className="font-serif text-3xl font-bold mb-6 text-center" data-testid="text-live-section">
                {language === "en" ? "🔴 Live Auctions" : "🔴 مزادات مباشرة"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {liveAuctions.map(artwork => (
                  <AuctionCard key={artwork.id} artwork={artwork} language={language} />
                ))}
              </div>
            </section>
          )}

          {upcomingAuctions.length > 0 && (
            <section className="mb-16">
              <h2 className="font-serif text-3xl font-bold mb-6 text-center">
                {language === "en" ? "Upcoming Auctions" : "مزادات قادمة"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingAuctions.map(artwork => (
                  <AuctionCard key={artwork.id} artwork={artwork} language={language} />
                ))}
              </div>
            </section>
          )}

          {endedAuctions.length > 0 && (
            <section className="mb-16">
              <h2 className="font-serif text-3xl font-bold mb-6 text-center">
                {language === "en" ? "Past Auctions" : "مزادات سابقة"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {endedAuctions.map(artwork => (
                  <AuctionCard key={artwork.id} artwork={artwork} language={language} />
                ))}
              </div>
            </section>
          )}

          {auctionArtworks.length === 0 && (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground">
                {language === "en" 
                  ? "No auctions available at the moment. Check back soon!" 
                  : "لا توجد مزادات متاحة حاليًا. تحقق مرة أخرى قريبًا!"}
              </p>
            </div>
          )}
        </div>
      </div>

      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            {language === "en" 
              ? "© 2025 Artinyxus. All rights reserved." 
              : "© 2025 Artinyxus. جميع الحقوق محفوظة."}
          </p>
        </div>
      </footer>
    </div>
  );
}
