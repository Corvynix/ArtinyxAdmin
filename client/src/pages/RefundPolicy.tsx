import { useState } from "react";
import Navbar from "@/components/Navbar";

export default function RefundPolicy() {
  const [language, setLanguage] = useState<"en" | "ar">("en");

  const content = language === "en" ? {
    title: "Refund Policy",
    lastUpdated: "Last updated: November 2025",
    intro: "At Artinyxus, we want you to be completely satisfied with your purchase. We offer a 7-day money-back guarantee on all artworks.",
    sections: [
      {
        title: "7-Day Trial Period",
        content: "You have 7 days from the delivery date to examine your artwork. If you're not completely satisfied, you can return it for a full refund, no questions asked."
      },
      {
        title: "Return Conditions",
        content: "The artwork must be returned in its original condition with all packaging materials. The artwork should not show any signs of damage, alteration, or mounting."
      },
      {
        title: "Refund Process",
        content: "To initiate a return, contact us via WhatsApp with your order details. Once we receive and inspect the artwork, we'll process your refund within 5-7 business days to your original payment method."
      },
      {
        title: "Shipping Costs",
        content: "Original shipping costs are non-refundable. Return shipping costs are the responsibility of the buyer unless the artwork arrived damaged or was sent in error."
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
    intro: "في Artinyxus، نريدك أن تكون راضيًا تمامًا عن عملية الشراء. نحن نقدم ضمان استرجاع المال لمدة 7 أيام على جميع الأعمال الفنية.",
    sections: [
      {
        title: "فترة تجريبية لمدة 7 أيام",
        content: "لديك 7 أيام من تاريخ التسليم لفحص عملك الفني. إذا لم تكن راضيًا تمامًا، يمكنك إرجاعه لاسترداد كامل المبلغ، بدون أسئلة."
      },
      {
        title: "شروط الإرجاع",
        content: "يجب إرجاع العمل الفني في حالته الأصلية مع جميع مواد التعبئة. يجب ألا يظهر العمل الفني أي علامات تلف أو تعديل أو تثبيت."
      },
      {
        title: "عملية الاسترداد",
        content: "لبدء الإرجاع، اتصل بنا عبر الواتساب مع تفاصيل طلبك. بمجرد استلام العمل الفني وفحصه، سنقوم بمعالجة استردادك خلال 5-7 أيام عمل إلى طريقة الدفع الأصلية."
      },
      {
        title: "تكاليف الشحن",
        content: "تكاليف الشحن الأصلية غير قابلة للاسترداد. تكاليف شحن الإرجاع هي مسؤولية المشتري ما لم يصل العمل الفني تالفًا أو تم إرساله بالخطأ."
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
