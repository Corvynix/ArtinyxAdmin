import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Package, Clock, CheckCircle, XCircle, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function CustomerDashboard() {
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const [whatsapp, setWhatsapp] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['/api/orders/user', searchQuery],
    queryFn: async () => {
      const response = await fetch(`/api/orders/user/${searchQuery}`);
      if (!response.ok) throw new Error("Failed to fetch orders");
      return response.json();
    },
    enabled: !!searchQuery,
  });

  const handleSearch = () => {
    if (!whatsapp) {
      toast({
        title: "Error",
        description: "Please enter your WhatsApp number",
        variant: "destructive",
      });
      return;
    }
    setSearchQuery(whatsapp);
  };

  const handleDownloadInvoice = async (orderId: string) => {
    try {
      const response = await fetch(`/api/invoices/${orderId}`);
      if (!response.ok) throw new Error("Failed to download invoice");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Invoice downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download invoice",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "shipped":
        return <Package className="w-5 h-5 text-blue-500" />;
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "pending":
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      confirmed: "default",
      shipped: "secondary",
      cancelled: "destructive",
      scheduled: "secondary",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const uploadPaymentProofMutation = useMutation({
    mutationFn: async ({ orderId, data }: { orderId: string; data: any }) => {
      const response = await fetch(`/api/orders/${orderId}/payment`, {
        method: "PATCH",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error("Failed to upload payment proof");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders/user', searchQuery] });
      toast({
        title: "Success",
        description: language === "en" 
          ? "Payment proof uploaded successfully" 
          : "تم إرسال إثبات الدفع بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: language === "en" 
          ? "Failed to upload payment proof" 
          : "فشل إرسال إثبات الدفع",
        variant: "destructive",
      });
    },
  });

  const PaymentProofUpload = ({ orderId }: { orderId: string }) => {
    const [paymentMethod, setPaymentMethod] = useState("");
    const [referenceNumber, setReferenceNumber] = useState("");
    const [screenshot, setScreenshot] = useState("");

    const handleUpload = () => {
      if (!paymentMethod || !referenceNumber) {
        toast({
          title: "Error",
          description: language === "en" 
            ? "Please fill all fields" 
            : "يرجى ملء جميع الحقول",
          variant: "destructive",
        });
        return;
      }

      uploadPaymentProofMutation.mutate({
        orderId,
        data: {
          paymentMethod,
          paymentReferenceNumber: referenceNumber,
          paymentProof: screenshot || "pending"
        }
      });
    };

    return (
      <div className="mt-4 p-4 border rounded-lg bg-muted/30">
        <h4 className="font-medium mb-3">
          {language === "en" ? "Upload Payment Proof" : "إرسال إثبات الدفع"}
        </h4>
        <div className="space-y-3">
          <div>
            <Label>{language === "en" ? "Payment Method" : "طريقة الدفع"}</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger data-testid={`select-payment-method-${orderId}`}>
                <SelectValue placeholder={language === "en" ? "Select method" : "اختر الطريقة"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vodafone_cash">Vodafone Cash</SelectItem>
                <SelectItem value="instapay">InstaPay</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{language === "en" ? "Reference Number" : "رقم المرجع"}</Label>
            <Input
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder={language === "en" ? "Enter reference number" : "أدخل رقم المرجع"}
              data-testid={`input-reference-${orderId}`}
            />
          </div>
          <div>
            <Label>{language === "en" ? "Screenshot (Optional)" : "لقطة الشاشة (اختياري)"}</Label>
            <Input
              value={screenshot}
              onChange={(e) => setScreenshot(e.target.value)}
              placeholder={language === "en" ? "Screenshot URL (optional)" : "رابط لقطة الشاشة (اختياري)"}
              data-testid={`input-screenshot-${orderId}`}
            />
          </div>
          <Button
            onClick={handleUpload}
            disabled={uploadPaymentProofMutation.isPending}
            className="w-full"
            data-testid={`button-upload-proof-${orderId}`}
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploadPaymentProofMutation.isPending 
              ? (language === "en" ? "Uploading..." : "جاري الإرسال...")
              : (language === "en" ? "Submit Payment Proof" : "إرسال إثبات الدفع")}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar currentLang={language} onLanguageChange={setLanguage} />
      
      <div className="pt-24 px-4 pb-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-8">
            {language === "en" ? "My Orders" : "طلباتي"}
          </h1>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {language === "en" ? "Find Your Orders" : "ابحث عن طلباتك"}
              </CardTitle>
              <CardDescription>
                {language === "en" 
                  ? "Enter your WhatsApp number to view your order history" 
                  : "أدخل رقم الواتساب الخاص بك لعرض سجل طلباتك"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input
                  type="text"
                  placeholder={language === "en" ? "WhatsApp Number" : "رقم الواتساب"}
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1"
                  data-testid="input-whatsapp-search"
                />
                <Button 
                  onClick={handleSearch}
                  data-testid="button-search-orders"
                >
                  {language === "en" ? "Search" : "بحث"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {isLoading && (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">
                {language === "en" ? "Loading..." : "جاري التحميل..."}
              </p>
            </div>
          )}

          {!isLoading && searchQuery && orders.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-lg text-muted-foreground">
                  {language === "en" 
                    ? "No orders found for this WhatsApp number" 
                    : "لا توجد طلبات لهذا الرقم"}
                </p>
              </CardContent>
            </Card>
          )}

          {orders.length > 0 && (
            <div className="space-y-4">
              {orders.map((order: any) => (
                <Card key={order.id} data-testid={`card-order-${order.id}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(order.status)}
                        <div>
                          <CardTitle className="text-lg">
                            {language === "en" ? "Order" : "طلب"} #{order.id.substring(0, 8)}
                          </CardTitle>
                          <CardDescription>
                            {new Date(order.createdAt).toLocaleDateString(
                              language === "en" ? "en-US" : "ar-EG",
                              { year: "numeric", month: "long", day: "numeric" }
                            )}
                          </CardDescription>
                        </div>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {language === "en" ? "Size" : "المقاس"}
                        </p>
                        <p className="font-medium">{order.size}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {language === "en" ? "Price" : "السعر"}
                        </p>
                        <p className="font-medium gold-metallic">
                          {(order.priceCents / 100).toLocaleString()} EGP
                        </p>
                      </div>
                      {order.paymentMethod && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {language === "en" ? "Payment Method" : "طريقة الدفع"}
                          </p>
                          <p className="font-medium">
                            {order.paymentMethod === "vodafone_cash" 
                              ? "Vodafone Cash" 
                              : "InstaPay"}
                          </p>
                        </div>
                      )}
                      {order.invoiceNumber && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {language === "en" ? "Invoice Number" : "رقم الفاتورة"}
                          </p>
                          <p className="font-medium">{order.invoiceNumber}</p>
                        </div>
                      )}
                    </div>

                    {order.status === "confirmed" || order.status === "shipped" ? (
                      <Button
                        onClick={() => handleDownloadInvoice(order.id)}
                        variant="outline"
                        className="w-full md:w-auto"
                        data-testid={`button-download-invoice-${order.id}`}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {language === "en" ? "Download Invoice" : "تحميل الفاتورة"}
                      </Button>
                    ) : order.status === "scheduled" ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-green-600">
                          {language === "en"
                            ? `Queue Position: ${order.queuePosition || "TBD"}`
                            : `المركز في قائمة الانتظار: ${order.queuePosition || "غير محدد"}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {language === "en"
                            ? `Production starts: ${order.scheduledStartDate ? new Date(order.scheduledStartDate).toLocaleDateString() : "TBD"}`
                            : `يبدأ التنفيذ: ${order.scheduledStartDate ? new Date(order.scheduledStartDate).toLocaleDateString('ar-EG') : "غير محدد"}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {language === "en"
                            ? `Estimated completion: ${order.estimatedCompletionDate ? new Date(order.estimatedCompletionDate).toLocaleDateString() : "TBD"}`
                            : `الوقت المتوقع للتسليم: ${order.estimatedCompletionDate ? new Date(order.estimatedCompletionDate).toLocaleDateString('ar-EG') : "غير محدد"}`}
                        </p>
                      </div>
                    ) : order.status === "pending" ? (
                      <>
                        <p className="text-sm text-muted-foreground mb-2">
                          {language === "en"
                            ? "Your order is pending confirmation. You have 24 hours to complete payment."
                            : "طلبك قيد الانتظار. لديك 24 ساعة لإكمال الدفع."}
                        </p>
                        {!order.paymentProof && <PaymentProofUpload orderId={order.id} />}
                        {order.paymentProof && (
                          <p className="text-sm font-medium text-green-600">
                            {language === "en"
                              ? "Payment proof submitted. Waiting for admin confirmation."
                              : "تم إرسال إثبات الدفع. في انتظار تأكيد الإدارة."}
                          </p>
                        )}
                      </>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
