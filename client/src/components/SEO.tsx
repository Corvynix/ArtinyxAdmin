import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  ogImage?: string;
  ogType?: string;
}

export default function SEO({ title, description, ogImage, ogType = "website" }: SEOProps) {
  useEffect(() => {
    document.title = `${title} | Artinyxus`;
    
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? "property" : "name";
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute("content", content);
    };
    
    updateMetaTag("description", description);
    
    updateMetaTag("og:title", `${title} | Artinyxus`, true);
    updateMetaTag("og:description", description, true);
    updateMetaTag("og:type", ogType, true);
    
    if (ogImage) {
      updateMetaTag("og:image", ogImage, true);
    }
    
    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", `${title} | Artinyxus`);
    updateMetaTag("twitter:description", description);
    
    if (ogImage) {
      updateMetaTag("twitter:image", ogImage);
    }
  }, [title, description, ogImage, ogType]);
  
  return null;
}
