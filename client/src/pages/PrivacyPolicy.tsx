import { useState } from "react";
import Navbar from "@/components/Navbar";

export default function PrivacyPolicy() {
  const [language, setLanguage] = useState<"en" | "ar">("en");

  const content = language === "en" ? {
    title: "Privacy Policy",
    lastUpdated: "Last updated: November 2025",
    sections: [
      {
        title: "Information We Collect",
        content: "We collect information that you provide directly to us, including your name, WhatsApp number, and payment information when you place an order or bid on an artwork."
      },
      {
        title: "How We Use Your Information",
        content: "We use the information we collect to process your orders, communicate with you about your purchases, send you updates about auctions and new artworks, and improve our services."
      },
      {
        title: "Information Sharing",
        content: "We do not sell, trade, or otherwise transfer your personal information to third parties. We may share your information only to complete transactions (e.g., with payment processors) or when required by law."
      },
      {
        title: "Data Security",
        content: "We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure."
      },
      {
        title: "Your Rights",
        content: "You have the right to access, correct, or delete your personal information. Contact us via WhatsApp to exercise these rights."
      },
      {
        title: "Contact Us",
        content: "If you have any questions about this Privacy Policy, please contact us via WhatsApp at +20 123 456 7890."
      }
    ]
  } : {
    title: "سياسة الخصوصية",
    lastUpdated: "آخر تحديث: نوفمبر 2025",
    sections: [
      {
        title: "المعلومات التي نجمعها",
        content: "نجمع المعلومات التي تقدمها لنا مباشرة، بما في ذلك اسمك ورقم الواتساب ومعلومات الدفع عند تقديم طلب أو المزايدة على عمل فني."
      },
      {
        title: "كيف نستخدم معلوماتك",
        content: "نستخدم المعلومات التي نجمعها لمعالجة طلباتك والتواصل معك بشأن مشترياتك وإرسال تحديثات حول المزادات والأعمال الفنية الجديدة وتحسين خدماتنا."
      },
      {
        title: "مشاركة المعلومات",
        content: "لا نبيع أو نتاجر أو ننقل معلوماتك الشخصية لأطراف ثالثة. قد نشارك معلوماتك فقط لإتمام المعاملات (مثل معالجات الدفع) أو عند الطلب بموجب القانون."
      },
      {
        title: "أمن البيانات",
        content: "نطبق التدابير الأمنية المناسبة لحماية معلوماتك الشخصية. ومع ذلك، لا توجد طريقة نقل عبر الإنترنت آمنة 100%."
      },
      {
        title: "حقوقك",
        content: "لك الحق في الوصول إلى معلوماتك الشخصية أو تصحيحها أو حذفها. اتصل بنا عبر الواتساب لممارسة هذه الحقوق."
      },
      {
        title: "اتصل بنا",
        content: "إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى الاتصال بنا عبر الواتساب على +20 123 456 7890."
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar currentLang={language} onLanguageChange={setLanguage} />
      
      <div className="pt-24 px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-center" data-testid="text-page-title">
            {content.title}
          </h1>
          <p className="text-center text-muted-foreground mb-12">
            {content.lastUpdated}
          </p>

          <div className="space-y-8">
            {content.sections.map((section, index) => (
              <div key={index} className="prose prose-lg max-w-none">
                <h2 className="font-serif text-2xl font-bold mb-3">
                  {section.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            {language === "en" 
              ? "© 2025 Artinyxus. All rights reserved." 
              : "© 2025 Artinyxus. جميع الحقوق محفوظة."}
          </p>
        </div>
      </footer>
    </div>
  );
}
