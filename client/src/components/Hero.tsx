import { Button } from "@/components/ui/button";
import heroImage from "@assets/generated_images/Luxury_hero_background_art_f7857036.png";

interface HeroProps {
  language?: "en" | "ar";
}

export default function Hero({ language = "en" }: HeroProps) {
  const content = language === "en" 
    ? {
        quote: "Where Art Becomes Legacy",
        subtext: "Curated original artworks for discerning collectors",
        cta: "Explore Collection"
      }
    : {
        quote: "حيث يصبح الفن إرثاً",
        subtext: "أعمال فنية أصلية منتقاة لهواة الجمع المميزين",
        cta: "استكشف المجموعة"
      };

  return (
    <section 
      className="relative h-screen w-full flex items-center justify-center"
      style={{ marginTop: "-72px", paddingTop: "72px" }}
      data-testid="section-hero"
    >
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${heroImage})`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/60" />
      
      <div className="relative z-10 text-center px-4 max-w-4xl">
        <h1 
          className="font-serif text-hero-mobile md:text-hero-desktop font-bold text-white mb-6 leading-tight"
          data-testid="text-hero-title"
        >
          {content.quote}
        </h1>
        <p 
          className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto"
          data-testid="text-hero-subtitle"
        >
          {content.subtext}
        </p>
        <Button
          size="lg"
          onClick={() => {
            const element = document.getElementById("gallery");
            element?.scrollIntoView({ behavior: "smooth" });
          }}
          className="bg-primary/90 hover:bg-primary text-primary-foreground backdrop-blur-sm border border-primary-border text-lg px-8 py-6 rounded-2xl"
          data-testid="button-hero-cta"
        >
          {content.cta}
        </Button>
      </div>
    </section>
  );
}
