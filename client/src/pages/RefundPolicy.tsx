import { useState } from "react";
import Navbar from "@/components/Navbar";

export default function RefundPolicy() {
  const [language, setLanguage] = useState<"en" | "ar">("en");

  const content = language === "en" ? {
    title: "Refund Policy",
    lastUpdated: "Last updated: November 2025",
    intro: "At Artinyxus, we want you to be completely satisfied with your purchase. We offer a 48-hour full refund period from the moment of payment.",
    sections: [
      {
        title: "48-Hour Refund Period",
        content: "You have 48 hours from the moment of payment to change your mind. If you decide not to proceed, you can request a full refund during this period."
      },
      {
        title: "After 48 Hours",
        content: "After the 48-hour period expires, artwork production begins. Since each piece is custom-made specifically for you, refunds are no longer available once production has started."
      },
      {
        title: "Refund Process",
        content: "To request a refund within the 48-hour window, contact us via WhatsApp with your order details. We'll process your refund within 5-7 business days to your original payment method."
      },
      {
        title: "Damaged or Defective Items",
        content: "If your artwork arrives damaged or defective, please contact us immediately with photos. We will arrange for a replacement or full refund, including shipping costs."
      },
      {
        title: "Auction Items",
        content: "All sales of auction items are final. Returns are not accepted for artworks purchased through auctions unless the item is significantly misrepresented or arrives damaged."
      },
      {
        title: "Contact for Returns",
        content: "To initiate a return or if you have questions, contact us via WhatsApp at +20 123 456 7890."
      }
    ]
  } : {
    title: "سياسة الاسترجاع",
    lastUpdated: "آخر تحديث: نوفمبر 2025",
    intro: "في Artinyxus، نريدك أن تكون راضيًا تمامًا عن عملية الشراء. عندك 48 ساعة كاملة من لحظة الدفع لاسترداد المبلغ بالكامل.",
    sections: [
      {
        title: "فترة استرداد 48 ساعة",
        content: "عندك 48 ساعة كاملة من لحظة الدفع لو غيرت رأيك. لو قررت إنك مش عايز تكمل، تقدر تطلب استرداد كامل المبلغ خلال الفترة دي."
      },
      {
        title: "بعد الـ 48 ساعة",
        content: "بعد انتهاء فترة الـ 48 ساعة، ببدأ تنفيذ اللوحة. لأن كل قطعة بتتعمل مخصوص ليك، ما بيكونش فيه استرداد بعد ما يبدأ التنفيذ."
      },
      {
        title: "عملية الاسترداد",
        content: "لطلب استرداد خلال فترة الـ 48 ساعة، اتصل بنا عبر الواتساب مع تفاصيل طلبك. هنعالج الاسترداد خلال 5-7 أيام عمل لطريقة الدفع الأصلية."
      },
      {
        title: "العناصر التالفة أو المعيبة",
        content: "إذا وصل عملك الفني تالفًا أو معيبًا، يرجى الاتصال بنا على الفور مع الصور. سنقوم بترتيب بديل أو استرداد كامل، بما في ذلك تكاليف الشحن."
      },
      {
        title: "عناصر المزاد",
        content: "جميع مبيعات عناصر المزاد نهائية. لا يتم قبول المرتجعات للأعمال الفنية المشتراة من خلال المزادات ما لم يكن العنصر مضللاً بشكل كبير أو يصل تالفًا."
      },
      {
        title: "اتصل للإرجاع",
        content: "لبدء الإرجاع أو إذا كانت لديك أسئلة، اتصل بنا عبر الواتساب على +20 123 456 7890."
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
          <p className="text-center text-muted-foreground mb-8">
            {content.lastUpdated}
          </p>

          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-12">
            <p className="text-lg font-semibold text-center">
              {content.intro}
            </p>
          </div>

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
