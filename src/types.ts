export interface WebsiteTemplate {
  id: string;
  title: string;
  category: "medical" | "hospital" | "garment" | "restaurant" | "realestate" | "other";
  description: string;
  longDescription: string;
  price: number;
  features: string[];
  image: string; // Tailwind SVG thumbnail key or custom URL
  rating: number;
  salesCount: number;
  colors: {
    primary: string; // hex or tailwind color class
    secondary: string;
  };
  demoPages: {
    title: string;
    sections: {
      type: "hero" | "features" | "products" | "appointment" | "gallery" | "contact";
      title: string;
      subtitle?: string;
      items?: any[];
    }[];
  }[];
}

export interface Order {
  id: string;
  templateId: string;
  templateTitle: string;
  customerName: string;
  customerEmail: string;
  purchaseDate: string;
  price: number;
  status: "pending" | "requirements_review" | "in_development" | "delivered";
  licenseKey: string;
  customRequirements?: string;
}

export interface SupportMessage {
  id: string;
  customerEmail: string;
  customerName: string;
  message: string;
  timestamp: string;
  sender: "customer" | "admin";
  replied?: boolean;
}

export interface PortalConfig {
  heroTitle: string;
  heroTagline: string;
  sumitBio: string;
  sumitAvatar: string;
  portalHeroImage?: string;
  skills: string[];
  contactEmail: string;
  contactPhone: string;
  experienceYears: number;
  totalClients: number;
  noticeText?: string;
}
