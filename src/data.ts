import { WebsiteTemplate, PortalConfig, Order } from "./types";

export const INITIAL_PORTAL_CONFIG: PortalConfig = {
  heroTitle: "SumiTech Web Studio",
  heroTagline: "We design & launch stunning high-converting digital storefronts and systems crafted specifically for your business growth.",
  sumitBio: "Hi, I'm Sumit Rajpoot. I build bespoke, lightning-fast digital solutions. Over the last 5 years, I've designed and launched custom web applications for medical agencies, premium retail stores, corporate systems, and local boutiques. My goal is simple: deliver modern, charming, and highly secure web portals that turn visitors into paying customers.",
  sumitAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop", // placeholder modern portrait
  portalHeroImage: "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=600&auto=format&fit=crop", // high tech software agency team picture / portal banner
  skills: [
    "Full-Stack Web Development",
    "UI/UX Visual Design",
    "Tailwind CSS Pro",
    "React & Vite Architecture",
    "Enterprise Security & Auth",
    "E-Commerce & Payment Flows"
  ],
  contactEmail: "sumitrajpoot70914@gmail.com",
  contactPhone: "+91 98765 43210",
  experienceYears: 5,
  totalClients: 124,
  noticeText: "We have fully integrated our platform with secure **Firebase Authentication** and **Firestore** cloud database structures! All client requirements, licenses, and custom chat messages are instantly backed up with strict isolated rules. No unauthorized other user can access or read your information."
};

export const INITIAL_TEMPLATES: WebsiteTemplate[] = [
  {
    id: "medical-store",
    title: "PharmEase Digital Pharmacy",
    category: "medical",
    image: "medical-store-img",
    description: "A secure, lightning-fast e-pharmacy platform featuring prescription uploads, dynamic medicine search, and instant order routing.",
    longDescription: "PharmEase is a state-of-the-art solution designed for local medical stores and large pharmacy chains. It provides a clean, easily readable UI tailored for users seeking medicines quickly. Equipped with catalog sorting by illness, prescription image attachment uploads, and detailed dosage info, it bridges the gap between digital ordering and local healthcare.",
    price: 349,
    rating: 4.9,
    salesCount: 42,
    colors: {
      primary: "emerald",
      secondary: "teal"
    },
    features: [
      "Dynamic search engine with auto-suggestions",
      "Instant dosage list & ingredient breakdown",
      "Prescription file attachment upload validation",
      "WhatsApp automated quick order integration",
      "Interactive emergency support contact widgets",
      "Fully optimized mobile-first checkout workflow"
    ],
    demoPages: []
  },
  {
    id: "hospital-portal",
    title: "MedCare Clinic & Hospital Suite",
    category: "hospital",
    image: "hospital-portal-img",
    description: "An integrated healthcare portal for patient check-ins, medical department filtering, online doctor booking, and emergency updates.",
    longDescription: "MedCare is designed to elevate doctor-patient relationships. This platform includes robust booking state logic, an interactive roster of specialist physicians with reviews, contact maps, emergency alerts, and a streamlined layout that works perfectly across desktop, tablets, and phones.",
    price: 499,
    rating: 4.8,
    salesCount: 28,
    colors: {
      primary: "blue",
      secondary: "sky"
    },
    features: [
      "Instant medical department directory filtering",
      "Doctor roster with patient feedback/star ratings",
      "Online calendar room booking with instant confirmation",
      "One-click emergency helpline trigger",
      "Digital department schedules & FAQ widgets",
      "Privacy-compliant secure patient contact endpoints"
    ],
    demoPages: []
  },
  {
    id: "garment-shop",
    title: "VogueFit E-Commerce",
    category: "garment",
    image: "garment-shop-img",
    description: "A premium, glamorous digital boutique with interactive lookbooks, size guides, real-time product variations, and custom promotional banners.",
    longDescription: "VogueFit brings physical garment boutiques online with high-fidelity, grid layouts. Crafted to maximize conversions, it highlights active collection drops, accommodates product sizes (S, M, L, XL), enables live color filter selections, and handles a beautiful cart overlay drawer.",
    price: 399,
    rating: 4.7,
    salesCount: 56,
    colors: {
      primary: "rose",
      secondary: "pink"
    },
    features: [
      "Multi-image gallery zoom hover interactions",
      "Size chart helper modal with fit advice",
      "Interactive promo code activation layout",
      "Fluid slide-out cart drawer with cost recalculators",
      "Customer reviews with photo attachment blocks",
      "Social media Instagram and TikTok feed sync indicators"
    ],
    demoPages: []
  },
  {
    id: "restaurant-menu",
    title: "FlavorBistro Reservation & Menu",
    category: "restaurant",
    image: "restaurant-menu-img",
    description: "A modern culinary storefront offering table reservations, seasonal culinary filter tabs, interactive dishes menus, and dynamic cart operations.",
    longDescription: "Give epicures the digital standard they deserve. FlavorBistro combines a gorgeous, typographic menu display with real-time dish calorie and dietary tags (Vegan, Keto, Gluten-Free). An online reservation module lets customers secure tables from any gadget.",
    price: 299,
    rating: 4.9,
    salesCount: 19,
    colors: {
      primary: "amber",
      secondary: "orange"
    },
    features: [
      "Dietary allergen & spice-level filter indicators",
      "Interactive table booking scheduler with group size options",
      "Chef's specials animated carousel panels",
      "Local delivery range checking calculator",
      "Dynamic menu cart with custom notes option",
      "Beautiful typography and parallax scrolling themes"
    ],
    demoPages: []
  }
];

export const INITIAL_ORDERS: Order[] = [];
