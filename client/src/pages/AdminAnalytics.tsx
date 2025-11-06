import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Eye, ShoppingCart, Gavel, TrendingUp } from "lucide-react";

export default function AdminAnalytics() {
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

  return <AdminAnalyticsContent language={language} setLanguage={setLanguage} />;
}

function AdminAnalyticsContent({ language, setLanguage }: { language: "en" | "ar"; setLanguage: (lang: "en" | "ar") => void }) {
  const { toast } = useToast();

  const { data: analytics, isLoading, isError, error } = useQuery<{
    pageViews: number;
    orders: number;
    bids: number;
    conversionRate: number;
  }>({
    queryKey: ["/api/admin/analytics"],
  });

  useEffect(() => {
    if (isError && error) {
      toast({
        title: "Error loading analytics",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  const stats = [
    {
      title: "Page Views",
      value: analytics?.pageViews || 0,
      icon: Eye,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Orders",
      value: analytics?.orders || 0,
      icon: ShoppingCart,
      color: "text-green-600",
      bgColor: "bg-green-500/10"
    },
    {
      title: "Bids Placed",
      value: analytics?.bids || 0,
      icon: Gavel,
      color: "text-purple-600",
      bgColor: "bg-purple-500/10"
    },
    {
      title: "Conversion Rate",
      value: `${(analytics?.conversionRate || 0).toFixed(2)}%`,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-500/10"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar currentLang={language} onLanguageChange={setLanguage} />
      
      <div className="pt-24 px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-serif text-4xl font-bold mb-8" data-testid="text-page-title">
            Analytics Dashboard
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <Card key={stat.title} className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold" data-testid={`stat-${stat.title.toLowerCase().replace(" ", "-")}`}>
                      {stat.value}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-12">
            <Card className="p-6">
              <h2 className="font-serif text-2xl font-bold mb-4">Overview</h2>
              <div className="space-y-3">
                <p className="text-sm">
                  <span className="font-medium">Total Engagement Events:</span> {(analytics?.pageViews || 0) + (analytics?.orders || 0) + (analytics?.bids || 0)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Analytics data is based on tracked events including page views, order creations, and bid placements.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
