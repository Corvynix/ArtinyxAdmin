import { useState } from "react";
import Navbar from "@/components/Navbar";

export default function Terms() {
  const [language, setLanguage] = useState<"en" | "ar">("en");

  const content = language === "en" ? {
    title: "Terms & Conditions",
    lastUpdated: "Last updated: November 2025",
    sections: [
      {
        title: "Acceptance of Terms",
        content: "By accessing and using the Artinyxus website and services, you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services."
      },
      {
        title: "Artwork Authenticity",
        content: "All artworks sold on Artinyxus are original, hand-crafted pieces. Each artwork comes with a certificate of authenticity. We guarantee that all artworks are genuine and accurately described."
      },
      {
        title: "Pricing and Payment",
        content: "All prices are listed in Egyptian Pounds (EGP) and do not include shipping costs. Payment is accepted via Vodafone Cash or InstaPay. Full payment is required before artwork shipment."
      },
      {
        title: "Order Process",
        content: "When you click 'Order via WhatsApp', we create a pending order and hold the stock for 24 hours. You must confirm your order and provide payment proof within this period. If not confirmed, the hold will be released."
      },
      {
        title: "Auction Terms",
        content: "All auction bids are binding. The highest bidder at the end of the auction wins the artwork. Anti-sniping rules apply: bids placed in the final 60 seconds extend the auction by 120 seconds. All auction sales are final."
      },
      {
        title: "Shipping and Delivery",
        content: "Shipping costs are calculated separately and communicated via WhatsApp. We ship within Egypt and internationally. Delivery times vary based on location. Risk of loss transfers upon delivery."
      },
      {
        title: "Returns and Refunds",
        content: "We offer a 7-day money-back guarantee on all non-auction purchases. Please see our Refund Policy for complete details."
      },
      {
        title: "Intellectual Property",
        content: "All content on this website, including artwork images, descriptions, and branding, is the property of Artinyxus and protected by copyright law. Unauthorized use is prohibited."
      },
      {
        title: "Limitation of Liability",
        content: "Artinyxus is not liable for any indirect, incidental, or consequential damages arising from the use of our services or purchase of artworks. Our liability is limited to the purchase price of the artwork."
      },
      {
        title: "Changes to Terms",
        content: "We reserve the right to modify these Terms and Conditions at any time. Changes will be posted on this page with an updated date. Continued use of our services constitutes acceptance of the modified terms."
      },
      {
        title: "Governing Law",
        content: "These Terms and Conditions are governed by the laws of Egypt. Any disputes shall be resolved in Egyptian courts."
      },
      {
        title: "Contact Information",
        content: "For questions about these Terms and Conditions, contact us via WhatsApp at +20 123 456 7890."
      }
    ]
  } : {
    title: "الشروط والأحكام",
    lastUpdated: "آخر تحديث: نوفمبر 2025",
    sections: [
      {
        title: "قبول الشروط",
        content: "من خلال الوصول إلى واستخدام موقع Artinyxus والخدمات، فإنك تقبل وتوافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على هذه الشروط، يرجى عدم استخدام خدماتنا."
      },
      {
        title: "أصالة الأعمال الفنية",
        content: "جميع الأعمال الفنية المباعة على Artinyxus هي قطع أصلية مصنوعة يدويًا. يأتي كل عمل فني مع شهادة أصالة. نحن نضمن أن جميع الأعمال الفنية أصلية وموصوفة بدقة."
      },
      {
        title: "التسعير والدفع",
        content: "جميع الأسعار مدرجة بالجنيه المصري (EGP) ولا تشمل تكاليف الشحن. يتم قبول الدفع عبر Vodafone Cash أو InstaPay. الدفع الكامل مطلوب قبل شحن العمل الفني."
      },
      {
        title: "عملية الطلب",
        content: "عند النقر على 'طلب عبر واتساب'، نقوم بإنشاء طلب معلق ونحتفظ بالمخزون لمدة 24 ساعة. يجب عليك تأكيد طلبك وتقديم إثبات الدفع خلال هذه الفترة. إذا لم يتم التأكيد، سيتم إلغاء الحجز."
      },
      {
        title: "شروط المزاد",
        content: "جميع عروض المزاد ملزمة. أعلى مزايد في نهاية المزاد يفوز بالعمل الفني. تطبق قواعد مكافحة القنص: المزايدات الموضوعة في آخر 60 ثانية تمدد المزاد بـ 120 ثانية. جميع مبيعات المزاد نهائية."
      },
      {
        title: "الشحن والتسليم",
        content: "يتم حساب تكاليف الشحن بشكل منفصل والتواصل عبر الواتساب. نحن نشحن داخل مصر ودوليًا. تختلف أوقات التسليم بناءً على الموقع. ينتقل خطر الخسارة عند التسليم."
      },
      {
        title: "الإرجاع والاسترداد",
        content: "نحن نقدم ضمان استرداد الأموال لمدة 7 أيام على جميع المشتريات غير المزاد. يرجى الاطلاع على سياسة الاسترداد للحصول على التفاصيل الكاملة."
      },
      {
        title: "الملكية الفكرية",
        content: "جميع المحتويات على هذا الموقع، بما في ذلك صور الأعمال الفنية والأوصاف والعلامة التجارية، هي ملك لـ Artinyxus ومحمية بموجب قانون حقوق النشر. الاستخدام غير المصرح به محظور."
      },
      {
        title: "تحديد المسؤولية",
        content: "Artinyxus ليست مسؤولة عن أي أضرار غير مباشرة أو عرضية أو تبعية تنشأ عن استخدام خدماتنا أو شراء الأعمال الفنية. مسؤوليتنا محدودة بسعر شراء العمل الفني."
      },
      {
        title: "التغييرات على الشروط",
        content: "نحتفظ بالحق في تعديل هذه الشروط والأحكام في أي وقت. سيتم نشر التغييرات على هذه الصفحة مع تاريخ محدث. الاستخدام المستمر لخدماتنا يشكل قبولًا للشروط المعدلة."
      },
      {
        title: "القانون الحاكم",
        content: "تخضع هذه الشروط والأحكام لقوانين مصر. يتم حل أي نزاعات في المحاكم المصرية."
      },
      {
        title: "معلومات الاتصال",
        content: "للأسئلة حول هذه الشروط والأحكام، اتصل بنا عبر الواتساب على +20 123 456 7890."
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
