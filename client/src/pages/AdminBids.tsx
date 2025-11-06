import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Bid } from "@shared/schema";

export default function AdminBids() {
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, isAdmin } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => { window.location.href = "/api/login"; }, 500);
    } else if (!authLoading && isAuthenticated && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges",
        variant: "destructive",
      });
      setTimeout(() => { window.location.href = "/"; }, 1000);
    }
  }, [isAuthenticated, authLoading, isAdmin, toast]);

  if (authLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated || !isAdmin) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Redirecting...</div>;
  }

  return <AdminBidsContent language={language} setLanguage={setLanguage} />;
}

function AdminBidsContent({ language, setLanguage }: { language: "en" | "ar"; setLanguage: (lang: "en" | "ar") => void }) {
  const { toast } = useToast();

  const { data: bids = [], isLoading, isError, error } = useQuery<Array<Bid & { artworkTitle?: string }>>({
    queryKey: ["/api/admin/bids"],
  });

  useEffect(() => {
    if (isError && error) {
      toast({
        title: "Error loading bids",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar currentLang={language} onLanguageChange={setLanguage} />
      
      <div className="pt-24 px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-serif text-4xl font-bold mb-8" data-testid="text-page-title">
            Bids Management
          </h1>

          <div className="grid gap-4">
            {bids.map((bid) => (
              <Card key={bid.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2" data-testid={`text-bid-id-${bid.id}`}>
                      Bid #{bid.id.substring(0, 8)}
                    </h3>
                    {bid.artworkTitle && (
                      <p className="text-sm mb-1">
                        <span className="font-medium">Artwork:</span> {bid.artworkTitle}
                      </p>
                    )}
                    <p className="text-sm mb-1">
                      <span className="font-medium">Bidder:</span> {bid.bidderName || "N/A"}
                    </p>
                    <p className="text-sm mb-1">
                      <span className="font-medium">WhatsApp:</span> {bid.whatsapp || "N/A"}
                    </p>
                    <p className="text-sm mb-1">
                      <span className="font-medium">Amount:</span> <span className="text-lg font-bold text-primary" data-testid={`text-amount-${bid.id}`}>
                        {(bid.amountCents / 100).toLocaleString()} EGP
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Placed: {new Date(bid.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
            {bids.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No bids found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
