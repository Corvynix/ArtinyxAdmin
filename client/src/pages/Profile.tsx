import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Order, Artwork } from "@shared/schema";
import { Package, Clock, CheckCircle, XCircle, Truck } from "lucide-react";

const ordersAPI = {
  getUserOrders: async (whatsapp: string): Promise<Order[]> => {
    const response = await fetch(`/api/orders/user/${encodeURIComponent(whatsapp)}`);
    if (!response.ok) throw new Error("Failed to fetch orders");
    return response.json();
  },
  updateOrder: async (orderId: string, data: Partial<Order>) => {
    const response = await apiRequest("PATCH", `/api/orders/${orderId}`, data);
    return response.json();
  }
};

const artworksAPI = {
  getById: async (id: string): Promise<Artwork> => {
    const response = await fetch(`/api/artworks?id=${id}`);
    if (!response.ok) throw new Error("Failed to fetch artwork");
    const artworks = await response.json();
    return artworks.find((a: Artwork) => a.id === id);
  }
};

function OrderCard({ order, language, artworks }: { 
  order: Order; 
  language: "en" | "ar";
  artworks: Record<string, Artwork>;
}) {
  const [paymentMethod, setPaymentMethod] = useState<"vodafone_cash" | "instapay">(
    order.paymentMethod || "vodafone_cash"
  );
  const [paymentProof, setPaymentProof] = useState(order.paymentProof || "");
  const { toast } = useToast();

  const updateOrderMutation = useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: Partial<Order> }) =>
      ordersAPI.updateOrder(orderId, data),
    onSuccess: () => {
      toast({
        title: language === "en" ? "Updated!" : "تم التحديث!",
        description: language === "en" 
          ? "Payment information updated successfully" 
          : "تم تحديث معلومات الدفع بنجاح"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    }
  });

  const artwork = artworks[order.artworkId];
  if (!artwork) return null;

  const statusConfig = {
    pending: {
      icon: Clock,
      label: language === "en" ? "Pending Payment" : "في انتظار الدفع",
      color: "bg-yellow-500",
      textColor: "text-yellow-700 dark:text-yellow-400"
    },
    confirmed: {
      icon: CheckCircle,
      label: language === "en" ? "Confirmed" : "مؤكد",
      color: "bg-green-500",
      textColor: "text-green-700 dark:text-green-400"
    },
    scheduled: {
      icon: Clock,
      label: language === "en" ? "Scheduled" : "مجدول",
      color: "bg-purple-500",
      textColor: "text-purple-700 dark:text-purple-400"
    },
    shipped: {
      icon: Truck,
      label: language === "en" ? "Shipped" : "تم الشحن",
      color: "bg-blue-500",
      textColor: "text-blue-700 dark:text-blue-400"
    },
    cancelled: {
      icon: XCircle,
      label: language === "en" ? "Cancelled" : "ملغي",
      color: "bg-red-500",
      textColor: "text-red-700 dark:text-red-400"
    },
    refunded: {
      icon: Package,
      label: language === "en" ? "Refunded" : "تم الاسترداد",
      color: "bg-gray-500",
      textColor: "text-gray-700 dark:text-gray-400"
    }
  };

  const status = statusConfig[order.status];
  const StatusIcon = status.icon;

  const handleSubmitPayment = () => {
    updateOrderMutation.mutate({
      orderId: order.id,
      data: {
        paymentMethod,
        paymentProof
      }
    });
  };

  return (
    <Card className="p-6" data-testid={`card-order-${order.id}`}>
      <div className="flex gap-4">
        <img
          src={artwork.images[0]}
          alt={artwork.title}
          className="w-24 h-24 object-cover rounded-md"
          data-testid="img-artwork"
        />
        
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-serif text-xl font-bold" data-testid="text-artwork-title">
                {artwork.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === "en" ? "Size:" : "المقاس:"} {order.size}
              </p>
            </div>
            <Badge className={status.textColor} data-testid="badge-status">
              <StatusIcon className="w-4 h-4 mr-1" />
              {status.label}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
            <div>
              <span className="text-muted-foreground">{language === "en" ? "Price:" : "السعر:"}</span>
              <span className="ml-2 font-semibold gold-metallic" data-testid="text-price">
                {(order.priceCents / 100).toLocaleString()} {language === "en" ? "EGP" : "جنيه"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">{language === "en" ? "Order Date:" : "تاريخ الطلب:"}</span>
              <span className="ml-2 font-semibold">
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {order.status === "pending" && (
            <div className="mt-4 p-4 bg-muted rounded-md space-y-3">
              <h4 className="font-semibold">
                {language === "en" ? "Upload Payment Proof" : "تحميل إثبات الدفع"}
              </h4>
              
              <div className="space-y-2">
                <Label>{language === "en" ? "Payment Method" : "طريقة الدفع"}</Label>
                <Select value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)}>
                  <SelectTrigger data-testid="select-payment-method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vodafone_cash">Vodafone Cash</SelectItem>
                    <SelectItem value="instapay">InstaPay</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{language === "en" ? "Payment Reference / Screenshot URL" : "مرجع الدفع / رابط لقطة الشاشة"}</Label>
                <Input
                  placeholder={language === "en" ? "Enter payment reference or URL" : "أدخل مرجع الدفع أو الرابط"}
                  value={paymentProof}
                  onChange={(e) => setPaymentProof(e.target.value)}
                  data-testid="input-payment-proof"
                />
              </div>

              <Button
                onClick={handleSubmitPayment}
                disabled={!paymentProof || updateOrderMutation.isPending}
                data-testid="button-submit-payment"
              >
                {updateOrderMutation.isPending
                  ? (language === "en" ? "Submitting..." : "جاري الإرسال...")
                  : (language === "en" ? "Submit Payment Proof" : "إرسال إثبات الدفع")}
              </Button>

              {order.holdExpiresAt && new Date(order.holdExpiresAt) > new Date() && (
                <p className="text-xs text-muted-foreground">
                  {language === "en" ? "Hold expires:" : "تنتهي الحجز:"}
                  {" "}{new Date(order.holdExpiresAt).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {order.paymentProof && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
              <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                {language === "en" ? "Payment Proof Submitted" : "تم إرسال إثبات الدفع"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {language === "en" ? "Payment Method:" : "طريقة الدفع:"} {order.paymentMethod}
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function Profile() {
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const [whatsapp, setWhatsapp] = useState("");
  const [submittedWhatsapp, setSubmittedWhatsapp] = useState("");

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["/api/orders", "user", submittedWhatsapp],
    queryFn: () => ordersAPI.getUserOrders(submittedWhatsapp),
    enabled: !!submittedWhatsapp
  });

  const { data: artworks = {} } = useQuery({
    queryKey: ["/api/artworks", "lookup"],
    queryFn: async () => {
      const response = await fetch("/api/artworks");
      const allArtworks: Artwork[] = await response.json();
      return allArtworks.reduce((acc, artwork) => {
        acc[artwork.id] = artwork;
        return acc;
      }, {} as Record<string, Artwork>);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedWhatsapp(whatsapp);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar currentLang={language} onLanguageChange={setLanguage} />

      <div className="pt-24 px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-8 text-center" data-testid="text-page-title">
            {language === "en" ? "My Orders" : "طلباتي"}
          </h1>

          {!submittedWhatsapp ? (
            <Card className="p-8 max-w-md mx-auto">
              <h2 className="font-serif text-2xl font-bold mb-4 text-center">
                {language === "en" ? "View Your Orders" : "عرض طلباتك"}
              </h2>
              <p className="text-muted-foreground mb-6 text-center">
                {language === "en" 
                  ? "Enter your WhatsApp number to view your order history" 
                  : "أدخل رقم الواتساب الخاص بك لعرض سجل طلباتك"}
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="tel"
                  placeholder={language === "en" ? "WhatsApp Number" : "رقم الواتساب"}
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  required
                  data-testid="input-whatsapp"
                />
                <Button type="submit" className="w-full" data-testid="button-view-orders">
                  {language === "en" ? "View Orders" : "عرض الطلبات"}
                </Button>
              </form>
            </Card>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <p className="text-muted-foreground">
                  {language === "en" ? "Showing orders for:" : "عرض الطلبات لـ:"} {submittedWhatsapp}
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSubmittedWhatsapp("");
                    setWhatsapp("");
                  }}
                  data-testid="button-change-number"
                >
                  {language === "en" ? "Change Number" : "تغيير الرقم"}
                </Button>
              </div>

              {isLoading ? (
                <div className="text-center py-20">
                  <p className="text-xl text-muted-foreground">
                    {language === "en" ? "Loading orders..." : "جاري تحميل الطلبات..."}
                  </p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-20">
                  <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-xl text-muted-foreground">
                    {language === "en" ? "No orders found" : "لا توجد طلبات"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      language={language}
                      artworks={artworks}
                    />
                  ))}
                </div>
              )}
            </>
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
