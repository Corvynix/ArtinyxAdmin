import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface WhatsAppButtonProps {
  artworkId: string;
  artworkTitle: string;
  size: string;
  price: number;
  language?: "en" | "ar";
}

const WHATSAPP_NUMBER = "+201551498838";

export default function WhatsAppButton({
  artworkTitle,
  size,
  price,
  language = "ar"
}: WhatsAppButtonProps) {
  const handleClick = () => {
    const message = language === "ar"
      ? `مرحباً، أريد طلب: ${artworkTitle}\nالمقاس: ${size}\nالسعر: ${price.toLocaleString()} جنيه`
      : `Hello, I would like to order: ${artworkTitle}\nSize: ${size}\nPrice: ${price.toLocaleString()} EGP`;
    
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="space-y-3">
      <Button
        size="lg"
        onClick={handleClick}
        className="w-full text-lg px-8 py-6 rounded-2xl flex items-center justify-center gap-2"
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
