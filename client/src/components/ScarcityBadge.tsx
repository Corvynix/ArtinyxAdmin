import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

interface ScarcityBadgeProps {
  remaining: number;
  total: number;
  language?: "en" | "ar";
  delay?: number;
}

export default function ScarcityBadge({ 
  remaining, 
  total, 
  language = "en",
  delay = 3000 
}: ScarcityBadgeProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (remaining === 0) {
    return (
      <Badge 
        variant="destructive" 
        className="text-sm font-semibold"
        data-testid="badge-sold-out"
      >
        {language === "en" ? "Sold Out" : "نفذت الكمية"}
      </Badge>
    );
  }

  const getBadgeColor = () => {
    if (remaining >= 5) return "bg-green-100 text-green-800 border-green-300";
    if (remaining >= 2) return "bg-orange-100 text-orange-800 border-orange-300";
    return "bg-red-100 text-red-800 border-red-300 animate-pulse";
  };

  const text = language === "en" 
    ? `${remaining} of ${total} left`
    : `${remaining} من ${total} متبقي`;

  return (
    <Badge
      className={`transition-opacity duration-300 text-sm font-semibold border ${getBadgeColor()} ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      data-testid="badge-scarcity"
    >
      {text}
    </Badge>
  );
}
