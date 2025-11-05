import { Link } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import logoImage from "@assets/Logo_1762382111378.png";

interface NavbarProps {
  currentLang?: "en" | "ar";
  onLanguageChange?: (lang: "en" | "ar") => void;
}

export default function Navbar({ currentLang = "en", onLanguageChange }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleLanguage = () => {
    const newLang = currentLang === "en" ? "ar" : "en";
    onLanguageChange?.(newLang);
  };

  const navLinks = currentLang === "en"
    ? ["Home", "Gallery", "Auctions", "About", "Contact"]
    : ["الرئيسية", "المعرض", "المزادات", "من نحن", "اتصل بنا"];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/80 backdrop-blur-md shadow-md" : "bg-background"
      }`}
      style={{ height: "72px" }}
      data-testid="navbar"
    >
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <Link href="/" data-testid="link-home">
          <img
            src={logoImage}
            alt="Artinyxus"
            className="h-12 w-auto cursor-pointer hover-elevate rounded-md p-1"
            data-testid="img-logo"
          />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link, index) => (
            <Link
              key={link}
              href={index === 0 ? "/" : `/${link.toLowerCase().replace(/\s+/g, "-")}`}
              data-testid={`link-${link.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <span className="text-foreground hover:text-primary transition-colors cursor-pointer font-medium">
                {link}
              </span>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleLanguage}
            className="text-2xl hover-elevate p-2 rounded-md transition-transform"
            aria-label="Toggle language"
            data-testid="button-language-toggle"
          >
            {currentLang === "en" ? "🇪🇬" : "🇺🇸"}
          </button>
          
          <Button
            onClick={() => {
              const element = document.getElementById("gallery");
              element?.scrollIntoView({ behavior: "smooth" });
            }}
            className="hidden md:block"
            data-testid="button-explore"
          >
            {currentLang === "en" ? "Explore Artworks" : "استكشف الأعمال"}
          </Button>
        </div>
      </div>
    </nav>
  );
}
