import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ArtworkGallery from "@/components/ArtworkGallery";
import SEO from "@/components/SEO";
import { artworksAPI, analyticsAPI } from "@/lib/api";

export default function Home() {
  const [language, setLanguage] = useState<"en" | "ar">("en");

  const { data: allArtworks = [], isLoading } = useQuery({
    queryKey: ["/api/artworks"],
    queryFn: artworksAPI.getAll
  });

  const availableArtworks = allArtworks
    .filter(a => a.status === "available")
    .map(a => ({
      id: a.id,
      title: a.title,
      image: a.images[0] || "",
      priceFrom: Math.min(...Object.values(a.sizes).map(s => s.price_cents)) / 100,
      type: a.type,
      status: "available" as const
    }));

  const comingSoonArtworks = allArtworks
    .filter(a => a.status === "coming_soon")
    .map(a => ({
      id: a.id,
      title: a.title,
      image: a.images[0] || "",
      priceFrom: Math.min(...Object.values(a.sizes).map(s => s.price_cents)) / 100,
      type: a.type,
      status: "coming_soon" as const
    }));

  useEffect(() => {
    // Track page view
    analyticsAPI.track({
      eventType: "page_view",
      meta: { page: "home" }
    });
  }, []);

  const handleArtworkClick = (id: string) => {
    const artwork = allArtworks.find(a => a.id === id);
    if (artwork) {
      window.location.href = `/artworks/${artwork.slug}`;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-serif text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SEO
        title={language === "en" ? "Home - Exclusive Art on Canvas" : "الرئيسية - فن حصري على القماش"}
        description={language === "en" 
          ? "Discover exclusive limited edition canvas art at Artinyxus. Own your unique piece today with our 7-day money-back guarantee." 
          : "اكتشف الفن الحصري المحدود الإصدار في Artinyxus. احصل على قطعتك الفريدة اليوم مع ضمان استرجاع 7 أيام."}
      />
      <Navbar currentLang={language} onLanguageChange={setLanguage} />
      <Hero language={language} />
      
      {availableArtworks.length > 0 && (
        <ArtworkGallery
          artworks={availableArtworks}
          title={language === "en" ? "Available Now" : "متاح الآن"}
          language={language}
          onArtworkClick={handleArtworkClick}
        />
      )}
      
      {comingSoonArtworks.length > 0 && (
        <ArtworkGallery
          artworks={comingSoonArtworks}
          title={language === "en" ? "Coming Soon" : "قريباً"}
          language={language}
          onArtworkClick={handleArtworkClick}
        />
      )}

      {/* Custom Commissions Section */}
      <section className="py-20 px-4 bg-background" id="custom-commissions">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-serif text-center mb-6 text-foreground" data-testid="heading-custom-commissions">
            {language === "en" ? "Custom Commissions" : "طلبات خاصة"}
          </h2>
          <p className="text-center text-xl text-muted-foreground mb-12 max-w-3xl mx-auto" data-testid="text-commission-description">
            {language === "en" 
              ? "Transform your vision into a unique masterpiece. Our artists create bespoke artworks tailored to your preferences and space."
              : "حوّل رؤيتك إلى تحفة فنية فريدة. يقوم فنانونا بإنشاء أعمال فنية مخصصة تناسب تفضيلاتك ومساحتك."}
          </p>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground" data-testid="text-personalized-art">
                    {language === "en" ? "Personalized Art" : "فن شخصي"}
                  </h3>
                  <p className="text-muted-foreground">
                    {language === "en" 
                      ? "Work directly with our artists to create something truly unique for your home or office."
                      : "اعمل مباشرة مع فنانينا لإنشاء شيء فريد حقًا لمنزلك أو مكتبك."}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground" data-testid="text-quality-guaranteed">
                    {language === "en" ? "Quality Guaranteed" : "جودة مضمونة"}
                  </h3>
                  <p className="text-muted-foreground">
                    {language === "en" 
                      ? "Premium materials and expert craftsmanship in every piece."
                      : "مواد فاخرة وحرفية متقنة في كل قطعة."}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-card border border-card-border rounded-lg p-8 text-center">
              <div className="mb-6">
                <p className="text-sm text-muted-foreground mb-2" data-testid="text-starting-from">
                  {language === "en" ? "Starting From" : "يبدأ من"}
                </p>
                <p className="text-5xl font-bold text-primary" data-testid="text-commission-price">
                  {language === "en" ? "2,000 EGP" : "٢٬٠٠٠ جنيه"}
                </p>
              </div>
              <p className="text-muted-foreground mb-6">
                {language === "en" 
                  ? "Price varies based on size, complexity, and materials"
                  : "يختلف السعر حسب الحجم والتعقيد والمواد"}
              </p>
              <a 
                href="/contact" 
                className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-md font-semibold transition-all"
                data-testid="button-request-commission"
              >
                {language === "en" ? "Request a Commission" : "اطلب عمل مخصص"}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Coming Soon Products Section */}
      <section className="py-20 px-4 bg-card" id="coming-soon-products">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-serif mb-6 text-foreground" data-testid="heading-coming-soon-products">
            {language === "en" ? "More Products Coming Soon" : "منتجات أخرى قادمة"}
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto" data-testid="text-coming-soon-description">
            {language === "en" 
              ? "We're expanding our collection with wearable art and lifestyle products."
              : "نقوم بتوسيع مجموعتنا بفن يمكن ارتداؤه ومنتجات نمط الحياة."}
          </p>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-background border border-border rounded-lg p-6 hover:border-primary transition-all">
              <div className="bg-muted rounded-lg h-48 flex items-center justify-center mb-4">
                <svg className="w-24 h-24 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-2 text-foreground" data-testid="text-hoodies">
                {language === "en" ? "Hoodies" : "سويتشيرت"}
              </h3>
              <p className="text-muted-foreground">
                {language === "en" 
                  ? "Premium cotton hoodies featuring exclusive artwork designs"
                  : "سويتشيرت قطني فاخر يحمل تصميمات فنية حصرية"}
              </p>
              <div className="mt-4 inline-block bg-primary/20 text-primary px-4 py-1 rounded-full text-sm font-medium" data-testid="badge-coming-soon">
                {language === "en" ? "Coming Soon" : "قريباً"}
              </div>
            </div>
            <div className="bg-background border border-border rounded-lg p-6 hover:border-primary transition-all">
              <div className="bg-muted rounded-lg h-48 flex items-center justify-center mb-4">
                <svg className="w-24 h-24 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-2 text-foreground" data-testid="text-baby-shirts">
                {language === "en" ? "Baby Shirts" : "قمصان أطفال"}
              </h3>
              <p className="text-muted-foreground">
                {language === "en" 
                  ? "Soft, comfortable baby clothing with adorable art prints"
                  : "ملابس أطفال ناعمة ومريحة مع طباعات فنية جميلة"}
              </p>
              <div className="mt-4 inline-block bg-primary/20 text-primary px-4 py-1 rounded-full text-sm font-medium" data-testid="badge-coming-soon-2">
                {language === "en" ? "Coming Soon" : "قريباً"}
              </div>
            </div>
            <div className="bg-background border border-border rounded-lg p-6 hover:border-primary transition-all">
              <div className="bg-muted rounded-lg h-48 flex items-center justify-center mb-4">
                <svg className="w-24 h-24 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-2 text-foreground" data-testid="text-accessories">
                {language === "en" ? "More Products" : "منتجات أخرى"}
              </h3>
              <p className="text-muted-foreground">
                {language === "en" 
                  ? "T-shirts, tote bags, phone cases, and more"
                  : "تيشيرتات، حقائب، أغطية هواتف، والمزيد"}
              </p>
              <div className="mt-4 inline-block bg-primary/20 text-primary px-4 py-1 rounded-full text-sm font-medium" data-testid="badge-coming-soon-3">
                {language === "en" ? "Coming Soon" : "قريباً"}
              </div>
            </div>
          </div>
          <p className="text-muted-foreground">
            {language === "en" 
              ? "Be the first to know when we launch. Follow us on social media or sign up for our newsletter."
              : "كن أول من يعلم عند الإطلاق. تابعنا على وسائل التواصل الاجتماعي أو اشترك في نشرتنا الإخبارية."}
          </p>
        </div>
      </section>

      <footer className="bg-card border-t border-card-border py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-muted-foreground mb-4" data-testid="text-footer">
            {language === "en" 
              ? "© 2025 Artinyxus. All rights reserved."
              : "© 2025 Artinyxus. جميع الحقوق محفوظة."}
          </p>
          <div className="flex justify-center gap-6 text-sm">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-privacy">
              {language === "en" ? "Privacy Policy" : "سياسة الخصوصية"}
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-refund">
              {language === "en" ? "Refund Policy" : "سياسة الاسترجاع"}
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-terms">
              {language === "en" ? "Terms of Service" : "شروط الخدمة"}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
