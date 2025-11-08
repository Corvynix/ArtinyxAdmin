import { Button } from "@/components/ui/button";
import canvasTexture from "@assets/stock_images/dark_charcoal_black__7af5e2e8.jpg";

interface HeroProps {
  language?: "en" | "ar";
}

export default function Hero({ language = "en" }: HeroProps) {
  const content = language === "en" 
    ? {
        quote: "Art is not an image… Art is a message that speaks when understood",
        cta: "Explore Artworks"
      }
    : {
        quote: "الفن مش صورة… الفن رسالة بتنطق لما حد يفهم.",
        cta: "اكتشف الأعمال"
      };

  return (
    <section 
      className="relative h-screen w-full flex items-center justify-center overflow-hidden"
      style={{ marginTop: "-72px", paddingTop: "72px" }}
      data-testid="section-hero"
    >
      {/* Dark Canvas Texture Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${canvasTexture})`,
          backgroundBlendMode: "multiply",
        }}
      />
      
      {/* Soft Spotlight Effect - Radial gradient from center */}
      <div 
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, rgba(218, 165, 32, 0.08) 0%, rgba(0, 0, 0, 0.6) 40%, rgba(0, 0, 0, 0.85) 100%)",
        }}
      />
      
      {/* Subtle gold shimmer overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          background: "linear-gradient(135deg, transparent 0%, rgba(218, 165, 32, 0.3) 50%, transparent 100%)",
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl">
        <h1 
          className={`font-serif text-4xl md:text-6xl lg:text-7xl font-light text-white mb-12 leading-relaxed tracking-wide ${language === "ar" ? "font-arabic" : ""}`}
          data-testid="text-hero-title"
          style={{
            textShadow: "0 4px 20px rgba(0, 0, 0, 0.7), 0 0 40px rgba(218, 165, 32, 0.15)",
            letterSpacing: language === "ar" ? "0.02em" : "0.05em",
          }}
        >
          {content.quote}
        </h1>
        
        <Button
          size="lg"
          onClick={() => {
            const element = document.getElementById("gallery");
            element?.scrollIntoView({ behavior: "smooth" });
          }}
          className="text-lg px-10 py-7 rounded-full bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-black font-semibold shadow-2xl hover:shadow-amber-500/50 transition-all duration-300 border border-amber-400/30"
          data-testid="button-hero-cta"
        >
          {content.cta}
        </Button>
      </div>
    </section>
  );
}
