import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface WhatsAppButtonProps {
  artworkTitle: string;
  size: string;
  price: number;
  language?: "en" | "ar";
  onOrderCreate?: () => void;
}

export default function WhatsAppButton({
  artworkTitle,
  size,
  price,
  language = "en",
  onOrderCreate
}: WhatsAppButtonProps) {
  const handleClick = () => {
    // TODO: remove mock functionality - call create-order API endpoint
    onOrderCreate?.();
    
    const message = language === "en"
      ? `Hello, I would like to order "${artworkTitle}" (Size: ${size}) - ${price} EGP. Please confirm availability.`
      : `مرحباً، أود طلب لوحة "${artworkTitle}" (المقاس: ${size}) — ${price} EGP. من فضلك أكد التوفر.`;
    
    const whatsappUrl = `https://wa.me/201234567890?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="space-y-3">
      <Button
        size="lg"
        onClick={handleClick}
        className="w-full bg-primary hover:bg-primary text-primary-foreground text-lg px-8 py-6 rounded-2xl flex items-center justify-center gap-2"
        data-testid="button-whatsapp-order"
      >
        <MessageCircle className="w-5 h-5" />
        {language === "en" ? "Order via WhatsApp" : "طلب عبر واتساب"}
      </Button>
      
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <span className="text-green-600 font-semibold">💰</span>
        <span data-testid="text-guarantee">
          {language === "en" 
            ? "100% Money-Back Guarantee — 7-Day Trial, No Questions Asked"
            : "ضمان استرجاع 100% — تجربة 7 أيام بلا أسئلة"}
        </span>
      </div>
    </div>
  );
}
