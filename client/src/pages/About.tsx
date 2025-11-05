import { useState } from "react";
import Navbar from "@/components/Navbar";

export default function About() {
  const [language, setLanguage] = useState<"en" | "ar">("en");

  const content = language === "en" ? {
    title: "About Artinyxus",
    subtitle: "Where Art Becomes Legacy",
    story: [
      "Artinyxus was founded on the belief that original art should be accessible to discerning collectors who value authenticity, craftsmanship, and emotional resonance.",
      "Each piece in our collection is carefully curated to embody a unique story—capturing moments of inspiration, cultural heritage, and the artist's vision. We specialize in limited editions and unique artworks that transform spaces into sanctuaries of beauty and contemplation.",
      "Our commitment extends beyond the artwork itself. We offer a seamless purchasing experience, transparent pricing, and a 100% money-back guarantee, ensuring that every collector feels confident in their investment."
    ],
    mission: {
      title: "Our Mission",
      text: "To connect passionate collectors with extraordinary artworks that enrich their lives and become cherished legacies for generations to come."
    },
    values: {
      title: "Our Values",
      items: [
        {
          title: "Authenticity",
          description: "Every artwork is original, hand-crafted, and comes with a certificate of authenticity."
        },
        {
          title: "Excellence",
          description: "We maintain the highest standards in curation, presentation, and customer service."
        },
        {
          title: "Trust",
          description: "Transparent pricing, secure transactions, and a 7-day trial period with no questions asked."
        }
      ]
    }
  } : {
    title: "عن Artinyxus",
    subtitle: "حيث يصبح الفن إرثاً",
    story: [
      "تأسست Artinyxus على الإيمان بأن الفن الأصلي يجب أن يكون متاحًا لهواة الجمع المميزين الذين يقدرون الأصالة والحرفية والرنين العاطفي.",
      "كل قطعة في مجموعتنا منتقاة بعناية لتجسد قصة فريدة - تلتقط لحظات الإلهام والتراث الثقافي ورؤية الفنان. نحن متخصصون في الطبعات المحدودة والأعمال الفنية الفريدة التي تحول المساحات إلى ملاذات من الجمال والتأمل.",
      "التزامنا يمتد إلى ما هو أبعد من العمل الفني نفسه. نقدم تجربة شراء سلسة وتسعيرًا شفافًا وضمانًا لاسترداد الأموال بنسبة 100٪، مما يضمن شعور كل جامع بالثقة في استثماره."
    ],
    mission: {
      title: "مهمتنا",
      text: "ربط هواة الجمع المتحمسين بأعمال فنية استثنائية تثري حياتهم وتصبح إرثًا عزيزًا للأجيال القادمة."
    },
    values: {
      title: "قيمنا",
      items: [
        {
          title: "الأصالة",
          description: "كل عمل فني أصلي ومصنوع يدويًا ويأتي مع شهادة أصالة."
        },
        {
          title: "التميز",
          description: "نحافظ على أعلى المعايير في التنسيق والعرض وخدمة العملاء."
        },
        {
          title: "الثقة",
          description: "تسعير شفاف ومعاملات آمنة وفترة تجريبية لمدة 7 أيام دون أي أسئلة."
        }
      ]
    }
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
            <p className="text-xl text-muted-foreground italic">
              {content.subtitle}
            </p>
          </div>

          <div className="prose prose-lg max-w-none mb-16">
            {content.story.map((paragraph, index) => (
              <p key={index} className="text-lg leading-relaxed mb-6 text-foreground">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mb-16 p-8 bg-card border border-card-border rounded-lg">
            <h2 className="font-serif text-3xl font-bold mb-4 gold-metallic">
              {content.mission.title}
            </h2>
            <p className="text-lg leading-relaxed text-foreground">
              {content.mission.text}
            </p>
          </div>

          <div className="mb-16">
            <h2 className="font-serif text-3xl font-bold mb-8 text-center gold-metallic">
              {content.values.title}
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {content.values.items.map((value, index) => (
                <div key={index} className="p-6 bg-card border border-card-border rounded-lg">
                  <h3 className="font-serif text-xl font-bold mb-3 gold-metallic">
                    {value.title}
                  </h3>
                  <p className="text-foreground leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
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
