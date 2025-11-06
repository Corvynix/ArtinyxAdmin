import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { MessageCircle, Instagram } from "lucide-react";

export default function Contact() {
  const [language, setLanguage] = useState<"en" | "ar">("en");

  const content = language === "en" ? {
    title: "Get in Touch",
    subtitle: "We'd love to hear from you",
    description: "Have questions about our artworks or the ordering process? Reach out to us through WhatsApp or follow us on Instagram to stay updated with our latest collections.",
    whatsapp: {
      title: "WhatsApp",
      description: "Chat with us directly for immediate assistance",
      button: "Message Us"
    },
    instagram: {
      title: "Instagram",
      description: "Follow us for behind-the-scenes content and new arrivals",
      button: "Follow @artinyxus"
    },
    hours: {
      title: "Response Time",
      text: "We typically respond within 2-4 hours during business hours (9 AM - 8 PM EET)"
    }
  } : {
    title: "تواصل معنا",
    subtitle: "يسعدنا التواصل معك",
    description: "لديك أسئلة حول أعمالنا الفنية أو عملية الطلب؟ تواصل معنا عبر واتساب أو تابعنا على إنستجرام للبقاء على اطلاع بأحدث مجموعاتنا.",
    whatsapp: {
      title: "واتساب",
      description: "تحدث معنا مباشرة للحصول على المساعدة الفورية",
      button: "راسلنا"
    },
    instagram: {
      title: "إنستجرام",
      description: "تابعنا للحصول على محتوى من وراء الكواليس والإصدارات الجديدة",
      button: "تابع @artinyxus"
    },
    hours: {
      title: "وقت الاستجابة",
      text: "نحن عادة نرد خلال 2-4 ساعات خلال ساعات العمل (9 صباحًا - 8 مساءً بتوقيت القاهرة)"
    }
  };

  const handleWhatsApp = () => {
    const message = language === "en"
      ? "Hello! I have a question about Artinyxus."
      : "مرحباً! لدي سؤال حول Artinyxus.";
    window.open(`https://wa.me/201234567890?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleInstagram = () => {
    window.open("https://instagram.com/artinyxus", "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar currentLang={language} onLanguageChange={setLanguage} />
      
      <div className="pt-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              {content.title}
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              {content.subtitle}
            </p>
            <p className="text-lg leading-relaxed max-w-2xl mx-auto">
              {content.description}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="p-8 bg-card border border-card-border rounded-lg hover:border-[#25D366]/50 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(37, 211, 102, 0.1)' }}>
                  <MessageCircle className="w-8 h-8" style={{ color: '#25D366' }} />
                </div>
                <h2 className="font-serif text-2xl font-bold">
                  {content.whatsapp.title}
                </h2>
              </div>
              <p className="text-muted-foreground mb-6">
                {content.whatsapp.description}
              </p>
              <Button
                onClick={handleWhatsApp}
                className="w-full text-white hover:opacity-90"
                style={{ backgroundColor: '#25D366' }}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                {content.whatsapp.button}
              </Button>
            </div>

            <div className="p-8 bg-card border border-card-border rounded-lg hover:border-[#E1306C]/50 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(225, 48, 108, 0.1)' }}>
                  <Instagram className="w-8 h-8" style={{ color: '#E1306C' }} />
                </div>
                <h2 className="font-serif text-2xl font-bold">
                  {content.instagram.title}
                </h2>
              </div>
              <p className="text-muted-foreground mb-6">
                {content.instagram.description}
              </p>
              <Button
                onClick={handleInstagram}
                className="w-full text-white hover:opacity-90"
                style={{ 
                  background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)'
                }}
              >
                <Instagram className="w-5 h-5 mr-2" />
                {content.instagram.button}
              </Button>
            </div>
          </div>

          <div className="p-8 bg-card border border-card-border rounded-lg text-center">
            <h3 className="font-serif text-xl font-bold mb-3 gold-metallic">
              {content.hours.title}
            </h3>
            <p className="text-foreground">
              {content.hours.text}
            </p>
          </div>
        </div>
      </div>

      <footer className="bg-card border-t border-card-border py-12 px-4 mt-20">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-muted-foreground mb-4">
            {language === "en" 
              ? "© 2025 Artinyxus. All rights reserved."
              : "© 2025 Artinyxus. جميع الحقوق محفوظة."}
          </p>
        </div>
      </footer>
    </div>
  );
}
