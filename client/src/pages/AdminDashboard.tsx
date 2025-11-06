import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  TrendingUp, 
  ShoppingCart, 
  Gavel, 
  AlertTriangle,
  Download,
  CheckCircle,
  Upload
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const { toast } = useToast();

  const { data: orders = [] } = useQuery({
    queryKey: ['/api/admin/orders'],
    queryFn: async () => {
      const response = await fetch('/api/admin/orders');
      if (!response.ok) throw new Error("Failed to fetch orders");
      return response.json();
    }
  });

  const { data: bids = [] } = useQuery({
    queryKey: ['/api/admin/bids'],
    queryFn: async () => {
      const response = await fetch('/api/admin/bids');
      if (!response.ok) throw new Error("Failed to fetch bids");
      return response.json();
    }
  });

  const { data: artworks = [] } = useQuery({
    queryKey: ['/api/artworks'],
    queryFn: async () => {
      const response = await fetch('/api/artworks');
      if (!response.ok) throw new Error("Failed to fetch artworks");
      return response.json();
    }
  });

  const { data: inventoryAlerts = [] } = useQuery({
    queryKey: ['/api/admin/inventory-alerts'],
    queryFn: async () => {
      const response = await fetch('/api/admin/inventory-alerts');
      if (!response.ok) throw new Error("Failed to fetch inventory alerts");
      return response.json();
    }
  });

  const { data: revenueData } = useQuery({
    queryKey: ['/api/admin/analytics/revenue'],
    queryFn: async () => {
      const response = await fetch('/api/admin/analytics/revenue?period=month');
      if (!response.ok) throw new Error("Failed to fetch revenue data");
      return response.json();
    }
  });

  const { data: bestSelling = [] } = useQuery({
    queryKey: ['/api/admin/analytics/best-selling'],
    queryFn: async () => {
      const response = await fetch('/api/admin/analytics/best-selling?limit=5');
      if (!response.ok) throw new Error("Failed to fetch best selling");
      return response.json();
    }
  });

  const confirmOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const response = await fetch(`/api/admin/orders/${orderId}/confirm`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to confirm order');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
      toast({
        title: "Success",
        description: "Order confirmed successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to confirm order",
        variant: "destructive",
      });
    }
  });

  const generateInvoiceMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const response = await fetch(`/api/admin/orders/${orderId}/generate-invoice`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to generate invoice');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
      toast({
        title: "Success",
        description: "Invoice generated successfully",
      });
    }
  });

  const handleDownloadSalesReport = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);

      const response = await fetch(
        `/api/admin/reports/sales?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      if (!response.ok) throw new Error("Failed to download report");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sales-report-${startDate.toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Sales report downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download sales report",
        variant: "destructive",
      });
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('images', file);
    });

    try {
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload images");

      const data = await response.json();
      toast({
        title: "Success",
        description: `${data.paths.length} images uploaded successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload images",
        variant: "destructive",
      });
    }
  };

  const pendingOrders = orders.filter((o: any) => o.status === "pending");
  const confirmedOrders = orders.filter((o: any) => o.status === "confirmed" || o.status === "shipped");

  return (
    <div className="min-h-screen bg-background">
      <Navbar currentLang={language} onLanguageChange={setLanguage} />
      
      <div className="pt-24 px-4 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="font-serif text-4xl md:text-5xl font-bold">
              {language === "en" ? "Admin Dashboard" : "لوحة التحكم"}
            </h1>
            <Button 
              onClick={handleDownloadSalesReport}
              data-testid="button-download-sales-report"
            >
              <Download className="w-4 h-4 mr-2" />
              {language === "en" ? "Sales Report" : "تقرير المبيعات"}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {language === "en" ? "Total Revenue" : "إجمالي الإيرادات"}
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold gold-metallic" data-testid="text-total-revenue">
                  {revenueData ? (revenueData.totalRevenue / 100).toLocaleString() : 0} EGP
                </div>
                <p className="text-xs text-muted-foreground">
                  {language === "en" ? "Last 30 days" : "آخر 30 يوم"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {language === "en" ? "Total Orders" : "إجمالي الطلبات"}
                </CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-orders">
                  {orders.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {pendingOrders.length} {language === "en" ? "pending" : "قيد الانتظار"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {language === "en" ? "Active Artworks" : "الأعمال النشطة"}
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-active-artworks">
                  {artworks.filter((a: any) => a.status === "available").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {artworks.length} {language === "en" ? "total" : "إجمالي"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {language === "en" ? "Low Stock Alerts" : "تنبيهات المخزون"}
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500" data-testid="text-low-stock-alerts">
                  {inventoryAlerts.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {language === "en" ? "items need attention" : "عناصر تحتاج اهتمام"}
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="orders" className="space-y-4">
            <TabsList>
              <TabsTrigger value="orders" data-testid="tab-orders">
                {language === "en" ? "Orders" : "الطلبات"}
              </TabsTrigger>
              <TabsTrigger value="bids" data-testid="tab-bids">
                {language === "en" ? "Bids" : "المزايدات"}
              </TabsTrigger>
              <TabsTrigger value="analytics" data-testid="tab-analytics">
                {language === "en" ? "Analytics" : "التحليلات"}
              </TabsTrigger>
              <TabsTrigger value="inventory" data-testid="tab-inventory">
                {language === "en" ? "Inventory" : "المخزون"}
              </TabsTrigger>
              <TabsTrigger value="upload" data-testid="tab-upload">
                {language === "en" ? "Upload" : "رفع"}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="space-y-4">
              {pendingOrders.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {language === "en" ? "Pending Orders" : "الطلبات المعلقة"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {pendingOrders.map((order: any) => (
                      <div 
                        key={order.id} 
                        className="flex justify-between items-center p-4 border rounded-lg"
                        data-testid={`order-pending-${order.id}`}
                      >
                        <div>
                          <p className="font-medium">Order #{order.id.substring(0, 8)}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.buyerName} • {(order.priceCents / 100).toLocaleString()} EGP
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => confirmOrderMutation.mutate(order.id)}
                            data-testid={`button-confirm-order-${order.id}`}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {language === "en" ? "Confirm" : "تأكيد"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generateInvoiceMutation.mutate(order.id)}
                            data-testid={`button-generate-invoice-${order.id}`}
                          >
                            {language === "en" ? "Generate Invoice" : "إنشاء فاتورة"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === "en" ? "All Orders" : "جميع الطلبات"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {orders.slice(0, 10).map((order: any) => (
                      <div 
                        key={order.id} 
                        className="flex justify-between items-center p-3 border rounded"
                        data-testid={`order-${order.id}`}
                      >
                        <div>
                          <p className="text-sm font-medium">#{order.id.substring(0, 8)}</p>
                          <p className="text-xs text-muted-foreground">{order.buyerName}</p>
                        </div>
                        <Badge>{order.status}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bids">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === "en" ? "Recent Bids" : "المزايدات الأخيرة"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {bids.slice(0, 10).map((bid: any) => (
                      <div 
                        key={bid.id} 
                        className="flex justify-between items-center p-3 border rounded"
                        data-testid={`bid-${bid.id}`}
                      >
                        <div>
                          <p className="font-medium">{bid.artworkTitle}</p>
                          <p className="text-sm text-muted-foreground">{bid.bidderName}</p>
                        </div>
                        <p className="font-bold gold-metallic">
                          {(bid.amountCents / 100).toLocaleString()} EGP
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === "en" ? "Best Selling Artworks" : "الأعمال الأكثر مبيعاً"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {bestSelling.map((item: any, index: number) => (
                      <div 
                        key={item.artworkId} 
                        className="flex justify-between items-center p-3 border rounded"
                        data-testid={`best-selling-${index}`}
                      >
                        <div>
                          <p className="font-medium">#{index + 1}. {item.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.totalSales} {language === "en" ? "sales" : "مبيعة"}
                          </p>
                        </div>
                        <p className="font-bold gold-metallic">
                          {(item.revenue / 100).toLocaleString()} EGP
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="inventory">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === "en" ? "Low Stock Alerts" : "تنبيهات المخزون المنخفض"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {inventoryAlerts.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      {language === "en" ? "No low stock alerts" : "لا توجد تنبيهات مخزون"}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {inventoryAlerts.map((alert: any) => (
                        <div 
                          key={`${alert.artworkId}-${alert.size}`} 
                          className="flex justify-between items-center p-3 border border-red-200 rounded bg-red-50 dark:bg-red-950/20"
                          data-testid={`alert-${alert.artworkId}`}
                        >
                          <div>
                            <p className="font-medium">{alert.artworkTitle}</p>
                            <p className="text-sm text-muted-foreground">
                              Size: {alert.size}
                            </p>
                          </div>
                          <Badge variant="destructive">
                            {alert.remaining} {language === "en" ? "left" : "متبقي"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="upload">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === "en" ? "Upload Artwork Images" : "رفع صور الأعمال الفنية"}
                  </CardTitle>
                  <CardDescription>
                    {language === "en" 
                      ? "Upload images for artworks (max 10 files, JPG/PNG/WebP)" 
                      : "رفع صور للأعمال الفنية (حد أقصى 10 ملفات، JPG/PNG/WebP)"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                      data-testid="input-image-upload"
                    />
                    <label htmlFor="image-upload">
                      <Button asChild variant="outline">
                        <span>
                          {language === "en" ? "Select Images" : "اختر الصور"}
                        </span>
                      </Button>
                    </label>
                    <p className="text-sm text-muted-foreground mt-2">
                      {language === "en" ? "Click to select images" : "انقر لاختيار الصور"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
