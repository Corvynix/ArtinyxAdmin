import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Order } from "@shared/schema";
import { CheckCircle2 } from "lucide-react";

export default function AdminOrders() {
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
      if (import.meta.env.DEV) {
        fetch("/api/auth/user", {
          headers: { "x-admin-api-key": "dev-admin-key-12345" },
          credentials: "include"
        }).then(() => window.location.reload()).catch(() => {
          toast({
            title: "Database Connection Required",
            description: "Please check your DATABASE_URL in .env file",
            variant: "destructive",
          });
        });
      } else {
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
      }
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

  return <AdminOrdersContent language={language} setLanguage={setLanguage} />;
}

function AdminOrdersContent({ language, setLanguage }: { language: "en" | "ar"; setLanguage: (lang: "en" | "ar") => void }) {
  const { toast } = useToast();

  const { data: orders = [], isLoading, isError, error } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
  });

  useEffect(() => {
    if (isError && error) {
      toast({
        title: "Error loading orders",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);

  const confirmOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return await apiRequest("POST", `/api/admin/orders/${orderId}/confirm`, {});
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Order confirmed successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        if (import.meta.env.DEV) {
        fetch("/api/auth/user", {
          headers: { "x-admin-api-key": "dev-admin-key-12345" },
          credentials: "include"
        }).then(() => window.location.reload()).catch(() => {
          toast({
            title: "Database Connection Required",
            description: "Please check your DATABASE_URL in .env file",
            variant: "destructive",
          });
        });
      } else {
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
      }
        return;
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "confirmed": return "bg-green-500/20 text-green-700";
      case "shipped": return "bg-blue-500/20 text-blue-700";
      case "cancelled": return "bg-red-500/20 text-red-700";
      case "refunded": return "bg-orange-500/20 text-orange-700";
      default: return "bg-yellow-500/20 text-yellow-700";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar currentLang={language} onLanguageChange={setLanguage} />
      
      <div className="pt-24 px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="font-serif text-4xl font-bold" data-testid="text-page-title">
              {language === "en" ? "Orders Management" : "إدارة الطلبيات"}
            </h1>
            <Button
              onClick={() => {
                window.open("/api/admin/orders/export", "_blank");
              }}
              variant="outline"
              data-testid="button-export-csv"
            >
              {language === "en" ? "Export CSV" : "تصدير CSV"}
            </Button>
          </div>

          <div className="grid gap-4">
            {orders.map((order) => (
              <Card key={order.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold" data-testid={`text-order-id-${order.id}`}>
                        Order #{order.id.substring(0, 8)}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(order.status)}`} data-testid={`badge-status-${order.id}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm mb-1">
                      <span className="font-medium">Buyer:</span> {order.buyerName || "N/A"}
                    </p>
                    <p className="text-sm mb-1">
                      <span className="font-medium">WhatsApp:</span> {order.whatsapp || "N/A"}
                    </p>
                    <p className="text-sm mb-1">
                      <span className="font-medium">Size:</span> {order.size}
                    </p>
                    <p className="text-sm mb-1">
                      <span className="font-medium">Price:</span> {(order.priceCents / 100).toLocaleString()} EGP
                    </p>
                    <p className="text-sm mb-1">
                      <span className="font-medium">Payment Method:</span> {order.paymentMethod || "N/A"}
                    </p>
                    {order.paymentProof && (
                      <p className="text-sm mb-1">
                        <span className="font-medium">Payment Proof:</span> {order.paymentProof}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Created: {new Date(order.createdAt).toLocaleString()}
                    </p>
                    {order.holdExpiresAt && order.status === "pending" && (
                      <p className="text-sm text-muted-foreground">
                        Hold expires: {new Date(order.holdExpiresAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                  {order.status === "pending" && (
                    <Button
                      onClick={() => confirmOrderMutation.mutate(order.id)}
                      disabled={confirmOrderMutation.isPending}
                      data-testid={`button-confirm-${order.id}`}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Confirm
                    </Button>
                  )}
                </div>
              </Card>
            ))}
            {orders.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No orders found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
