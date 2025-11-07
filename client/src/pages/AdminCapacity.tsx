import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar, Settings, TrendingUp, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function AdminCapacity() {
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const [dailyCapacity, setDailyCapacity] = useState(3);
  const [daysToView, setDaysToView] = useState(7);
  const { toast } = useToast();

  const { data: capacityData = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/capacity', daysToView],
    queryFn: async () => {
      const response = await fetch(`/api/admin/capacity?days=${daysToView}`);
      if (!response.ok) throw new Error("Failed to fetch capacity data");
      return response.json();
    }
  });

  const updateCapacityMutation = useMutation({
    mutationFn: async (newCapacity: number) => {
      const response = await fetch('/api/admin/capacity/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dailyCapacity: newCapacity })
      });
      if (!response.ok) throw new Error("Failed to update capacity");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/capacity'] });
      toast({
        title: "Success",
        description: language === "en" 
          ? "Daily capacity updated successfully" 
          : "تم تحديث السعة اليومية بنجاح"
      });
      refetch();
    },
    onError: () => {
      toast({
        title: "Error",
        description: language === "en" 
          ? "Failed to update capacity" 
          : "فشل تحديث السعة",
        variant: "destructive"
      });
    }
  });

  const handleUpdateCapacity = () => {
    if (dailyCapacity < 1 || dailyCapacity > 20) {
      toast({
        title: "Error",
        description: language === "en" 
          ? "Capacity must be between 1 and 20" 
          : "السعة يجب أن تكون بين 1 و 20",
        variant: "destructive"
      });
      return;
    }
    updateCapacityMutation.mutate(dailyCapacity);
  };

  const getCapacityStatus = (available: number, total: number) => {
    const percentage = (available / total) * 100;
    if (percentage === 0) return { label: "Full", color: "bg-red-500" };
    if (percentage < 50) return { label: "Limited", color: "bg-yellow-500" };
    return { label: "Available", color: "bg-green-500" };
  };

  const totalCapacity = capacityData.reduce((sum: number, day: any) => sum + day.total, 0);
  const totalReserved = capacityData.reduce((sum: number, day: any) => sum + day.reserved, 0);
  const totalAvailable = totalCapacity - totalReserved;
  const utilizationRate = totalCapacity > 0 ? ((totalReserved / totalCapacity) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar currentLang={language} onLanguageChange={setLanguage} />
      
      <div className="pt-24 px-4 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="font-serif text-4xl md:text-5xl font-bold">
              {language === "en" ? "Production Capacity Management" : "إدارة السعة الإنتاجية"}
            </h1>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  {language === "en" ? "Utilization Rate" : "معدل الاستخدام"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{utilizationRate}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {language === "en" ? `${totalReserved} of ${totalCapacity} slots reserved` : `${totalReserved} من ${totalCapacity} محجوز`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-500" />
                  {language === "en" ? "Available Slots" : "الأماكن المتاحة"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalAvailable}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {language === "en" ? `Next ${daysToView} days` : `خلال ${daysToView} أيام`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  {language === "en" ? "Reserved Slots" : "الأماكن المحجوزة"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalReserved}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {language === "en" ? "Confirmed orders" : "طلبات مؤكدة"}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  {language === "en" ? "Capacity Settings" : "إعدادات السعة"}
                </CardTitle>
                <CardDescription>
                  {language === "en" 
                    ? "Adjust the maximum number of pieces you can produce per day" 
                    : "اضبط الحد الأقصى للقطع التي يمكنك إنتاجها يومياً"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>{language === "en" ? "Daily Capacity (1-20)" : "السعة اليومية (1-20)"}</Label>
                    <Input
                      type="number"
                      min="1"
                      max="20"
                      value={dailyCapacity}
                      onChange={(e) => setDailyCapacity(parseInt(e.target.value))}
                      className="mt-2"
                      data-testid="input-daily-capacity"
                    />
                  </div>
                  <Button
                    onClick={handleUpdateCapacity}
                    disabled={updateCapacityMutation.isPending}
                    className="w-full"
                    data-testid="button-update-capacity"
                  >
                    {updateCapacityMutation.isPending 
                      ? (language === "en" ? "Updating..." : "جاري التحديث...")
                      : (language === "en" ? "Update Capacity" : "تحديث السعة")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {language === "en" ? "View Range" : "نطاق العرض"}
                </CardTitle>
                <CardDescription>
                  {language === "en" 
                    ? "Select how many days ahead to display" 
                    : "اختر عدد الأيام القادمة للعرض"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  {[7, 14, 30].map((days) => (
                    <Button
                      key={days}
                      variant={daysToView === days ? "default" : "outline"}
                      onClick={() => setDaysToView(days)}
                      data-testid={`button-days-${days}`}
                    >
                      {days} {language === "en" ? "days" : "يوم"}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>
                {language === "en" ? "Capacity Schedule" : "جدول السعة"}
              </CardTitle>
              <CardDescription>
                {language === "en" 
                  ? `Production capacity for the next ${daysToView} days` 
                  : `السعة الإنتاجية للأيام ${daysToView} القادمة`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-center py-8 text-muted-foreground">
                  {language === "en" ? "Loading..." : "جاري التحميل..."}
                </p>
              ) : (
                <div className="space-y-3">
                  {capacityData.map((day: any, index: number) => {
                    const status = getCapacityStatus(day.available, day.total);
                    const date = new Date(day.date);
                    const isToday = date.toDateString() === new Date().toDateString();
                    
                    return (
                      <div
                        key={day.date}
                        className={`p-4 border rounded-lg ${isToday ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800' : ''}`}
                        data-testid={`capacity-day-${index}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${status.color}`} />
                            <div>
                              <p className="font-medium">
                                {date.toLocaleDateString(language === "en" ? "en-US" : "ar-EG", { 
                                  weekday: 'long', 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                                {isToday && (
                                  <Badge variant="secondary" className="ml-2">
                                    {language === "en" ? "Today" : "اليوم"}
                                  </Badge>
                                )}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {day.reserved} {language === "en" ? "reserved" : "محجوز"} • {day.available} {language === "en" ? "available" : "متاح"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={day.available > 0 ? "default" : "destructive"}>
                              {status.label}
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-1">
                              {((day.reserved / day.total) * 100).toFixed(0)}% {language === "en" ? "utilized" : "مستخدم"}
                            </p>
                          </div>
                        </div>

                        {day.reserved > 0 && (
                          <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all"
                              style={{ width: `${(day.reserved / day.total) * 100}%` }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
