import { Link } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { User, LogOut, Settings } from "lucide-react";
import logoImage from "@assets/Logo_1762382111378.png";

interface NavbarProps {
  currentLang?: "en" | "ar";
  onLanguageChange?: (lang: "en" | "ar") => void;
}

export default function Navbar({ currentLang = "en", onLanguageChange }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, isAdmin, user } = useAuth();

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
    ? ["Home", "Gallery", "Auctions", "Wall of Fame", "About", "Contact"]
    : ["الرئيسية", "المعرض", "المزادات", "جدار الشرف", "من نحن", "اتصل بنا"];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "glass-black-strong" : "glass-black"
      }`}
      style={{ height: "72px" }}
      data-testid="navbar"
    >
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <Link href="/" data-testid="link-home">
          <img
            src={logoImage}
            alt="Artinyxus"
            className="h-12 w-auto cursor-pointer hover:scale-105 transition-transform duration-300 rounded-md p-1"
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
              <span className="text-white hover:gold-metallic transition-all duration-300 cursor-pointer font-medium tracking-wide">
                {link}
              </span>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleLanguage}
            className="text-2xl hover:scale-110 p-2 rounded-md transition-transform duration-300 text-white"
            aria-label="Toggle language"
            data-testid="button-language-toggle"
          >
            {currentLang === "en" ? "🇪🇬" : "🇺🇸"}
          </button>
          
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Link href="/admin/artworks">
                  <Button variant="outline" size="sm" className="border-white text-white hover:bg-white hover:text-black" data-testid="button-admin">
                    <Settings className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                </Link>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = "/api/logout"}
                className="border-white text-white hover:bg-white hover:text-black"
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = "/api/login"}
              className="border-white text-white hover:bg-white hover:text-black"
              data-testid="button-login"
            >
              <User className="w-4 h-4 mr-2" />
              Login
            </Button>
          )}
          
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
