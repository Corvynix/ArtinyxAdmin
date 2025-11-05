interface PriceDisplayProps {
  price: number;
  referencePrice?: number;
  currency?: string;
  language?: "en" | "ar";
}

export default function PriceDisplay({ 
  price, 
  referencePrice, 
  currency = "EGP",
  language = "en" 
}: PriceDisplayProps) {
  const formatPrice = (amount: number) => {
    return amount.toLocaleString(language === "en" ? "en-US" : "ar-EG");
  };

  return (
    <div className="flex items-baseline gap-3" data-testid="price-display">
      <span className="text-3xl md:text-4xl font-bold gold-metallic" data-testid="text-price">
        {formatPrice(price)} {currency}
      </span>
      {referencePrice && referencePrice > price && (
        <span 
          className="text-lg text-muted-foreground line-through"
          data-testid="text-reference-price"
        >
          {formatPrice(referencePrice)} {currency}
        </span>
      )}
    </div>
  );
}
