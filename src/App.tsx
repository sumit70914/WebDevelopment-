import { useState, useEffect } from "react";
import { 
  Cpu, 
  Layers, 
  Lock, 
  User, 
  Check, 
  ShoppingBag, 
  Sparkles, 
  Code, 
  Zap, 
  Workflow, 
  ShieldAlert, 
  Phone, 
  Mail, 
  Star, 
  ChevronRight, 
  ArrowRight,
  ShieldCheck,
  Heart,
  ExternalLink,
  MessageSquare,
  BadgeAlert,
  Sliders,
  DollarSign
} from "lucide-react";

import { WebsiteTemplate, PortalConfig, Order, SupportMessage } from "./types";
import { INITIAL_PORTAL_CONFIG, INITIAL_TEMPLATES, INITIAL_ORDERS } from "./data";
import TemplatePreview from "./components/TemplatePreview";
import CheckoutModal from "./components/CheckoutModal";
import CustomerPortal from "./components/CustomerPortal";
import AdminPortal from "./components/AdminPortal";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { 
  saveUserProfile, 
  saveOrderToFirestore, 
  fetchOrdersFromFirestore, 
  saveSupportMessageToFirestore, 
  fetchSupportMessagesFromFirestore 
} from "./lib/firestoreService";

export default function App() {
  // Navigation active tab
  const [activeRoute, setActiveRoute] = useState<"home" | "showroom" | "pricing" | "client" | "admin">("home");

  // Main Storage Core (Persisted in localStorage)
  const [templates, setTemplates] = useState<WebsiteTemplate[]>([]);
  const [config, setConfig] = useState<PortalConfig>(INITIAL_PORTAL_CONFIG);
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [adminPasswordHash, setAdminPasswordHash] = useState("SumitAdmin123!");
  const [adminEmail, setAdminEmail] = useState("sumitrajpoot70914@gmail.com");

  // Client session state
  const [loggedInCustomerEmail, setLoggedInCustomerEmail] = useState<string | null>(null);
  const [loggedInCustomerName, setLoggedInCustomerName] = useState<string | null>(null);

  // Focus inspection state (Showroom inspection)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [checkoutTemplate, setCheckoutTemplate] = useState<WebsiteTemplate | null>(null);

  // Custom feedback notification states (original styling)
  const [quoteFeedback, setQuoteFeedback] = useState<string | null>(null);
  const [globalFeedback, setGlobalFeedback] = useState<string | null>(null);

  // Auto-fades global billing/setup notification flags
  useEffect(() => {
    if (globalFeedback) {
      const timer = setTimeout(() => {
        setGlobalFeedback(null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [globalFeedback]);

  // Quote customizer state variables
  const [quotePages, setQuotePages] = useState<number>(5);
  const [quoteDbIntegration, setQuoteDbIntegration] = useState<boolean>(false);
  const [quoteLogoDesign, setQuoteLogoDesign] = useState<boolean>(false);
  const [quoteYearSupport, setQuoteYearSupport] = useState<boolean>(false);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const storedTemplates = localStorage.getItem("sumitech_templates");
      const storedConfig = localStorage.getItem("sumitech_config");
      const storedOrders = localStorage.getItem("sumitech_orders");
      const storedMessages = localStorage.getItem("sumitech_messages");
      const storedPassword = localStorage.getItem("sumitech_admin_password");

      if (storedTemplates) {
        setTemplates(JSON.parse(storedTemplates));
      } else {
        setTemplates(INITIAL_TEMPLATES);
        localStorage.setItem("sumitech_templates", JSON.stringify(INITIAL_TEMPLATES));
      }

      if (storedConfig) {
        const parsed = JSON.parse(storedConfig);
        if (!parsed.noticeText) {
          parsed.noticeText = INITIAL_PORTAL_CONFIG.noticeText;
        }
        setConfig(parsed);
      } else {
        setConfig(INITIAL_PORTAL_CONFIG);
        localStorage.setItem("sumitech_config", JSON.stringify(INITIAL_PORTAL_CONFIG));
      }

      if (storedOrders) {
        let loadedOrders = JSON.parse(storedOrders);
        // Clean out any previously loaded dummy orders
        loadedOrders = loadedOrders.filter(
          (o: any) => o.id !== "SUB-8021" && o.id !== "SUB-8144" && o.id !== "SUB-9022"
        );
        setOrders(loadedOrders);
        localStorage.setItem("sumitech_orders", JSON.stringify(loadedOrders));
      } else {
        setOrders(INITIAL_ORDERS);
        localStorage.setItem("sumitech_orders", JSON.stringify(INITIAL_ORDERS));
      }

      if (storedMessages) {
        let loadedMessages = JSON.parse(storedMessages);
        // Clean out any previously loaded dummy messages
        loadedMessages = loadedMessages.filter(
          (m: any) => m.id !== "msg-101" && m.id !== "msg-102" && m.id !== "msg-103"
        );
        setMessages(loadedMessages);
        localStorage.setItem("sumitech_messages", JSON.stringify(loadedMessages));
      } else {
        const initialMsgs: SupportMessage[] = [];
        setMessages(initialMsgs);
        localStorage.setItem("sumitech_messages", JSON.stringify(initialMsgs));
      }

      if (storedPassword) {
        setAdminPasswordHash(storedPassword);
      } else {
        localStorage.setItem("sumitech_admin_password", "SumitAdmin123!");
      }

      const storedAdminEmail = localStorage.getItem("sumitech_admin_email");
      if (storedAdminEmail) {
        setAdminEmail(storedAdminEmail);
      } else {
        localStorage.setItem("sumitech_admin_email", "sumitrajpoot70914@gmail.com");
      }

      // Pre-set focus inspect template
      const defaultId = storedTemplates ? JSON.parse(storedTemplates)[0]?.id : INITIAL_TEMPLATES[0].id;
      setSelectedTemplateId(defaultId);

    } catch (error) {
      console.error("Failed loading local storage", error);
      // Fallback
      setTemplates(INITIAL_TEMPLATES);
      setConfig(INITIAL_PORTAL_CONFIG);
      setOrders(INITIAL_ORDERS);
      setSelectedTemplateId(INITIAL_TEMPLATES[0].id);
    }
  }, []);

  // Listen to Firebase Authenticated User sessions & fetch their secure records in real time
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.email) {
        const clientEmail = user.email.toLowerCase();
        const clientName = user.displayName || "Client User";
        
        setLoggedInCustomerEmail(clientEmail);
        setLoggedInCustomerName(clientName);

        // 1. Save user profile metadata to secure Firestore isolated collection
        await saveUserProfile(user.uid, clientName, clientEmail);

        // 2. Fetch real orders from Firestore
        const dbOrders = await fetchOrdersFromFirestore(clientEmail);
        if (dbOrders && dbOrders.length > 0) {
          setOrders(prev => {
            const merged = [...dbOrders];
            prev.forEach(p => {
              if (!merged.some(m => m.id === p.id)) {
                merged.push(p);
              }
            });
            localStorage.setItem("sumitech_orders", JSON.stringify(merged));
            return merged;
          });
        }

        // 3. Fetch real messages from Firestore
        const dbMessages = await fetchSupportMessagesFromFirestore(clientEmail);
        if (dbMessages && dbMessages.length > 0) {
          setMessages(prev => {
            const merged = [...dbMessages];
            prev.forEach(p => {
              if (!merged.some(m => m.id === p.id)) {
                merged.push(p);
              }
            });
            localStorage.setItem("sumitech_messages", JSON.stringify(merged));
            return merged;
          });
        }
      } else {
        setLoggedInCustomerEmail(null);
        setLoggedInCustomerName(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Save setters
  const handleUpdateConfig = (newCfg: PortalConfig) => {
    setConfig(newCfg);
    localStorage.setItem("sumitech_config", JSON.stringify(newCfg));
  };

  const handleUpdateTemplates = (updatedTps: WebsiteTemplate[]) => {
    setTemplates(updatedTps);
    localStorage.setItem("sumitech_templates", JSON.stringify(updatedTps));
    if (updatedTps.length > 0 && !updatedTps.some(t => t.id === selectedTemplateId)) {
      setSelectedTemplateId(updatedTps[0].id);
    }
  };

  const handleUpdateOrders = (newOrds: Order[]) => {
    setOrders(newOrds);
    localStorage.setItem("sumitech_orders", JSON.stringify(newOrds));
    // Persist status and detail updates directly to Firestore
    newOrds.forEach(async (ord) => {
      await saveOrderToFirestore(ord, auth.currentUser?.uid);
    });
  };

  const handleUpdateAdminPassword = (newPass: string) => {
    setAdminPasswordHash(newPass);
    localStorage.setItem("sumitech_admin_password", newPass);
  };

  const handleUpdateAdminEmail = (newEmail: string) => {
    setAdminEmail(newEmail);
    localStorage.setItem("sumitech_admin_email", newEmail);
  };

  const handleSendMessage = async (customerEmail: string, customerName: string, messageText: string, senderRole: "customer" | "admin" = "customer") => {
    const formattedTimestamp = new Date().toISOString().replace("T", " ").substring(0, 16);
    const newMsg: SupportMessage = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 900)}`,
      customerEmail: customerEmail.toLowerCase(),
      customerName,
      message: messageText,
      timestamp: formattedTimestamp,
      sender: senderRole
    };
    
    const updated = [...messages, newMsg];
    setMessages(updated);
    localStorage.setItem("sumitech_messages", JSON.stringify(updated));

    // Save support message history row natively to Firestore cloud database
    await saveSupportMessageToFirestore(newMsg, auth.currentUser?.uid);
  };

  // Submit custom notes directly to matching order list
  const handleSubmitCustomRequirements = async (orderId: string, customRequirementsText: string) => {
    const updatedOrders = orders.map(o => o.id === orderId ? { ...o, customRequirements: customRequirementsText } : o);
    setOrders(updatedOrders);
    localStorage.setItem("sumitech_orders", JSON.stringify(updatedOrders));

    // Persist changes to Firestore
    const orderToSave = updatedOrders.find(o => o.id === orderId);
    if (orderToSave) {
      await saveOrderToFirestore(orderToSave, auth.currentUser?.uid);
    }
  };

  // Reset helper
  const handleResetDatabaseToDefault = () => {
    localStorage.removeItem("sumitech_templates");
    localStorage.removeItem("sumitech_config");
    localStorage.removeItem("sumitech_orders");
    localStorage.removeItem("sumitech_messages");
    localStorage.removeItem("sumitech_admin_password");
    
    setTemplates(INITIAL_TEMPLATES);
    setConfig(INITIAL_PORTAL_CONFIG);
    setOrders(INITIAL_ORDERS);
    setMessages([]);
    setAdminPasswordHash("SumitAdmin123!");
    setSelectedTemplateId(INITIAL_TEMPLATES[0].id);
  };

  // Calculate customized instant quotation estimated fee
  const calculateCustomQuoteFee = () => {
    let price = 150; // base landing index setup
    price += quotePages * 40; // $40 per additional dynamic interface page
    if (quoteDbIntegration) price += 180; // $180 specialized SQL/NoSQL secure integration
    if (quoteLogoDesign) price += 60; // vector graphics brand logo package asset
    if (quoteYearSupport) price += 120; // 365 days cloud monitoring + dev support
    return price;
  };

  // Retrieve current inspecting template object
  const activeInspectTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-slate-950 selection:font-bold">
      
      {globalFeedback && (
        <div className="bg-gradient-to-r from-teal-950/90 to-emerald-950/90 border-b border-emerald-500/30 text-emerald-300 text-xs px-6 py-3.5 flex items-center justify-between shadow-xl font-mono animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center space-x-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold">{globalFeedback}</span>
          </div>
          <button 
            onClick={() => setGlobalFeedback(null)} 
            className="text-slate-400 hover:text-white font-bold ml-4 text-xs transition"
          >
            ✕
          </button>
        </div>
      )}
      
      {/* 1. SECURE GLOWING NAV-BAR HEADER */}
      <header className="sticky top-4 z-40 max-w-7xl w-full mx-auto my-4 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl px-6 py-4 flex items-center justify-between shadow-[0_0_35px_rgba(99,102,241,0.06)]">
        {/* Brand visual pairing */}
        <div 
          onClick={() => setActiveRoute("home")}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-[0_0_20px_rgba(99,102,241,0.4)] text-white group-hover:scale-105 transition duration-300 select-none">
            S
          </div>
          <div>
            <div className="flex items-center space-x-1">
              <span className="font-extrabold text-base tracking-tight text-white font-display">Sumit<span className="text-indigo-400">Sphere</span></span>
              <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
            </div>
            <span className="text-[10px] text-slate-500 block font-mono">Precision Webcraft Solutions by Sumit</span>
          </div>
        </div>

        {/* Desktop route selectors */}
        <div className="hidden lg:flex items-center space-x-1.5 font-display">
          {[
            { id: "home", label: "Home" },
            { id: "showroom", label: "Marketplace" },
            { id: "pricing", label: "Inspect Samples" },
            { id: "client", label: "Documentation" }
          ].map(route => (
            <button
              key={route.id}
              onClick={() => setActiveRoute(route.id as any)}
              id={`nav-btn-${route.id}`}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeRoute === route.id ? "text-indigo-400 bg-indigo-500/10 font-bold" : "text-slate-400 hover:text-white"}`}
            >
              {route.label}
              {route.id === "client" && loggedInCustomerEmail && (
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 inline-block ml-1"></span>
              )}
            </button>
          ))}
        </div>

        {/* Admin control bypass button on right header side, only shown when administrator is logged in */}
        {loggedInCustomerEmail?.toLowerCase() === adminEmail.toLowerCase() && (
          <div className="flex items-center space-x-2 animate-bounce hover:animate-none">
            <button
              onClick={() => setActiveRoute("admin")}
              id="nav-btn-admin"
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                activeRoute === "admin"
                  ? "bg-indigo-600 text-white shadow-indigo-600/30"
                  : "bg-teal-950/40 hover:bg-teal-900/60 border border-teal-500/30 text-teal-300 hover:text-white"
              }`}
              title="Sumit's Secure Admin Cockpit Area"
            >
              <span className="flex items-center space-x-1.5 font-mono">
                <Lock className="h-3.5 w-3.5 text-teal-400" />
                <span>Unsealed Cockpit</span>
              </span>
            </button>
          </div>
        )}
      </header>

      {/* MOBILE LOWER TABS (Responsive flow Helper) */}
      <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-md border-t border-slate-900 grid ${loggedInCustomerEmail?.toLowerCase() === adminEmail.toLowerCase() ? "grid-cols-5" : "grid-cols-4"} p-2 text-center text-[10px] font-bold`}>
        {[
          { id: "home", label: "Home" },
          { id: "showroom", label: "Catalog" },
          { id: "pricing", label: "Quote" },
          { id: "client", label: "Portal" }
        ].map(route => (
          <button
            key={route.id}
            onClick={() => setActiveRoute(route.id as any)}
            className={`py-1.5 flex flex-col items-center justify-center rounded-lg ${activeRoute === route.id || (route.id === "client" && activeRoute === "admin") ? "text-indigo-400 bg-slate-900" : "text-slate-400"}`}
          >
            {route.label}
          </button>
        ))}
        {loggedInCustomerEmail?.toLowerCase() === adminEmail.toLowerCase() && (
          <button
            onClick={() => setActiveRoute("admin")}
            className={`py-1.5 flex flex-col items-center justify-center rounded-lg ${activeRoute === "admin" ? "text-teal-400 bg-slate-900" : "text-slate-400"}`}
          >
            Cockpit
          </button>
        )}
      </div>


      {/* 2. CORE VIEWPORT CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 pb-20 lg:pb-12 space-y-12">
        
        {/* ==================== SCREEN A: LANDING PAGE INFO ==================== */}
        {activeRoute === "home" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Bento Card 1: Hero & Welcome (Col span 8, row span 3) */}
            <div className="col-span-12 lg:col-span-8 bg-gradient-to-br from-slate-900 to-indigo-950/90 border border-indigo-500/35 rounded-3xl p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row gap-6 justify-between items-center shadow-[0_0_50px_rgba(99,102,241,0.05)]">
              {/* Background gradient flares */}
              <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="relative z-10 space-y-6 flex-1">
                {/* Micro tech tagline */}
                <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-full text-[10px] text-indigo-400 font-bold tracking-wider uppercase font-mono">
                  <Cpu className="h-3 w-3 animate-spin" style={{ animationDuration: '3s' }} />
                  <span>Empowered by SumiTech Agency v3.2</span>
                </div>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight font-display">
                  Forge Your Digital <br/>Presence with Sumit.
                </h1>
                
                <p className="text-slate-450 text-xs md:text-sm max-w-xl leading-relaxed">
                  {config.heroTagline}
                </p>

                <div className="flex flex-wrap items-center gap-3 md:gap-4 pt-4">
                  <button
                    onClick={() => setActiveRoute("showroom")}
                    id="btn-hero-explore"
                    className="bg-white text-slate-950 px-5 py-2.5 rounded-xl font-bold text-xs shadow-xl hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap"
                  >
                    Explore Web Showroom
                  </button>
                  <button
                    onClick={() => setActiveRoute("pricing")}
                    id="btn-hero-quote"
                    className="border border-slate-700 bg-slate-900/50 px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-800 hover:text-white transition-all whitespace-nowrap"
                  >
                    Custom Quote Calculator
                  </button>
                </div>
              </div>

              {/* Whole Portal Showcase Picture Frame */}
              <div className="relative z-10 w-full md:w-52 lg:w-60 h-44 md:h-52 shrink-0 rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl">
                <img 
                  src={config.portalHeroImage || "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=600&auto=format&fit=crop"} 
                  alt="SumiTech Showroom Portal"
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/10 to-transparent"></div>
                <div className="absolute bottom-3 left-3 bg-indigo-600/90 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-bold text-white tracking-wider uppercase font-mono">
                  SumiTech Studio
                </div>
              </div>
            </div>

            {/* Bento Card 2: Website Categories (Col span 4, row span 4) */}
            <div className="col-span-12 lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between hover:border-indigo-500 transition duration-300">
              <div>
                <h3 className="text-xs font-bold mb-4 text-slate-400 tracking-wider uppercase font-mono">Templates by Industry</h3>
                <div className="space-y-3">
                  {templates.map(temp => (
                    <div 
                      key={temp.id}
                      onClick={() => {
                        setSelectedTemplateId(temp.id);
                        setActiveRoute("showroom");
                      }}
                      className="flex items-center p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl hover:border-indigo-500 hover:bg-slate-800/80 transition duration-200 cursor-pointer group"
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 text-sm select-none shrink-0 ${
                        temp.category === 'medical' ? 'bg-rose-550/20 text-rose-400' :
                        temp.category === 'hospital' ? 'bg-emerald-500/20 text-emerald-400' :
                        temp.category === 'garment' ? 'bg-amber-500/20 text-amber-500' :
                        'bg-sky-500/20 text-sky-400'
                      }`}>
                        {temp.category === 'medical' ? '🏥' :
                         temp.category === 'hospital' ? '🏢' :
                         temp.category === 'garment' ? '👕' : '🍽️'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-extrabold text-xs text-slate-205 group-hover:text-indigo-400 transition truncate">{temp.title}</p>
                        <p className="text-[9px] text-slate-500 font-medium truncate mt-0.5 capitalize">{temp.category} • Inspect Live</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white transition-all shrink-0 ml-1" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 mt-4 text-[9px] text-slate-500 font-mono text-center">
                Click any template above to live-test in showroom.
              </div>
            </div>

            {/* Live Red Notice Board */}
            <div className="col-span-12 bg-gradient-to-r from-red-950/40 via-red-900/10 to-transparent border border-red-500/30 rounded-3xl p-5 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_0_20px_rgba(239,68,68,0.05)]">
              {/* Decorative side shine */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="flex items-center space-x-3 shrink-0">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </div>
                <div className="bg-red-500/15 border border-red-500/30 px-3 py-1 rounded-full flex items-center space-x-1.5">
                  <BadgeAlert className="h-3.5 w-3.5 text-red-400 animate-pulse" />
                  <span className="text-[10px] font-black text-red-400 tracking-wider uppercase font-mono">
                    Live Notice Board
                  </span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-300 leading-relaxed font-sans text-center md:text-left">
                  <span className="text-red-400 font-extrabold mr-1.5">🚨 LATEST BROADCAST:</span> 
                  {(config.noticeText || "").split("**").map((part, index) => {
                    if (index % 2 === 1) {
                      return <strong key={index} className="text-white font-extrabold">{part}</strong>;
                    }
                    return part;
                  })}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[9px] text-slate-550 font-mono uppercase tracking-wider bg-slate-950 border border-slate-900 px-2.5 py-1 rounded-md">
                  Active Connection
                </span>
              </div>
            </div>

            {/* Bento Card 3: About Sumit Biography (Col span 12) */}
            <div className="col-span-12 lg:col-span-12 bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl flex flex-col md:flex-row gap-6 items-start hover:border-slate-700 transition duration-300 relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
              
              <img 
                src={config.sumitAvatar} 
                alt="Sumit Rajpoot Portrait representation" 
                className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover border-2 border-indigo-500/20 shrink-0 shadow-lg shadow-indigo-500/10 mx-auto md:mx-0 relative z-10"
                referrerPolicy="no-referrer"
              />
              
              <div className="space-y-4 text-center md:text-left flex-1 relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="text-[9px] font-black text-indigo-400 tracking-widest uppercase font-mono block">Lead Technologist</span>
                    <h3 className="text-xl font-black text-white mt-0.5 font-display">Sumit Rajpoot</h3>
                    <span className="text-[10px] text-slate-400 block font-mono">Full Stack Software Crafter</span>
                  </div>

                  <div className="flex gap-4 justify-center md:justify-end font-mono">
                    <div className="bg-slate-950/60 border border-slate-850 px-3 py-1.5 rounded-xl text-center min-w-[85px]">
                      <span className="text-sm font-black text-white block">{config.totalClients}+</span>
                      <span className="text-[8px] uppercase font-bold text-slate-500 tracking-wider">Licenses</span>
                    </div>
                    <div className="bg-slate-950/60 border border-slate-850 px-3 py-1.5 rounded-xl text-center min-w-[85px]">
                      <span className="text-sm font-black text-white block">{config.experienceYears} Yrs</span>
                      <span className="text-[8px] uppercase font-bold text-slate-500 tracking-wider">Software Eng</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  {config.sumitBio}
                </p>

                <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
                  {config.skills.map(sk => (
                    <span key={sk} className="bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-md text-[9px] text-indigo-300 font-bold uppercase tracking-wider font-mono">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bento Card 5: Inspect Live Section (Col span 4) */}
            <div className="col-span-12 lg:col-span-4 bg-indigo-600 rounded-3xl p-6 flex flex-col justify-between text-white relative overflow-hidden group shadow-lg shadow-indigo-600/15 min-h-[220px]">
              <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-white/5 rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition duration-500"></div>
              
              <div>
                <h3 className="text-2.5xl font-bold text-white font-display">Inspect Live</h3>
                <p className="text-indigo-150 text-xs mt-2 leading-relaxed">
                  Interact with full-screen responsive templates before check out.
                </p>
              </div>

              <div className="flex items-end justify-between mt-6">
                <div className="flex -space-x-2.5">
                  <div className="w-8 h-8 rounded-full border-2 border-indigo-600 bg-slate-300 flex items-center justify-center text-[11px] select-none">🏥</div>
                  <div className="w-8 h-8 rounded-full border-2 border-indigo-600 bg-slate-400 flex items-center justify-center text-[11px] select-none">👕</div>
                  <div className="w-8 h-8 rounded-full border-2 border-indigo-600 bg-indigo-800 flex items-center justify-center text-[9px] text-white font-bold select-none">
                    +12
                  </div>
                </div>

                <button 
                  onClick={() => setActiveRoute("showroom")}
                  className="p-3 bg-white/20 rounded-2xl hover:bg-white/30 hover:scale-105 transition-all text-white"
                  title="Open Interactive Simulator"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Bento Card 6: Buy Section / Recent Deal (Col span 4) */}
            <div className="col-span-12 lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between hover:border-slate-700 transition duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-slate-500 text-[10px] font-black uppercase tracking-widest font-mono">Recent Deal</h4>
                  <p className="text-lg font-black text-white mt-1 font-display">MediSync Pro</p>
                </div>
                <span className="text-indigo-400 font-mono font-black text-lg">₹{templates.find(t => t.id === "medical-store")?.price || 249}</span>
              </div>
              
              <button 
                onClick={() => {
                  const starterTemplate = templates.find(t => t.id === "medical-store") || templates[0];
                  if (starterTemplate) {
                    setCheckoutTemplate(starterTemplate);
                  }
                }}
                className="w-full mt-6 py-3 bg-slate-805 border border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 hover:text-white transition-colors text-slate-300"
              >
                Instant Purchase
              </button>
            </div>

            {/* Bento Card 7: Featured Designs showcase block (Col span 4) */}
            <div className="col-span-12 lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between hover:border-slate-700 transition duration-300">
              <div>
                <h4 className="text-slate-500 text-[10px] font-black uppercase tracking-widest font-mono">Active Showcase</h4>
                <p className="text-lg font-black text-white mt-1 font-display">Sovereign Designs</p>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Sumit offers 4 full-stack ready-to-deploy, modern pixel template license packs.
                </p>
              </div>
              <button 
                onClick={() => setActiveRoute("showroom")}
                className="w-full mt-6 py-3 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-600/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition"
              >
                Launch Catalog Viewer
              </button>
            </div>

            {/* Bento Card 8: Delivery Protocol (Col span 12) */}
            <div className="col-span-12 bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-[36px] space-y-6 hover:border-slate-700 transition duration-300">
              <div className="text-center max-w-md mx-auto space-y-1">
                <span className="text-[9px] font-black tracking-widest text-indigo-400 uppercase font-mono">Delivery Protocol</span>
                <h3 className="text-lg font-black text-white tracking-tight font-display">How Sumit Ships Your Web Systems</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center text-xs">
                {[
                  { step: "01", title: "Explore & Book", desc: "Browse Medical Stores, Clothing Outlets, or Bistro menus. Inspect live screens and buy standard template source logs." },
                  { step: "02", title: "Submit Specifications", desc: "Log in inside the client workspace and input local branding specifications, logo uploads, and phone numbers." },
                  { step: "03", title: "Development & Adjusts", desc: "Sumit configures custom features, layouts, colors, and integrates specific medication/apparel catalogs." },
                  { step: "04", title: "Deploy & Deliver", desc: "Sumit unseals and points database files to your custom domain, handing over clean administrative panels." }
                ].map((item, index) => (
                  <div key={index} className="space-y-2 p-4 bg-slate-950/40 rounded-2xl border border-slate-850 hover:border-indigo-620/20 transition-all">
                    <div className="h-9 w-9 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center font-mono font-black text-indigo-400 mx-auto text-xs">
                      {item.step}
                    </div>
                    <h5 className="font-bold text-slate-205">{item.title}</h5>
                    <p className="text-[10px] text-slate-450 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Designs Showcase Header and Mini Grid */}
            <div className="col-span-12 space-y-4 pt-4">
              <div className="flex justify-between items-baseline flex-wrap gap-2">
                <div>
                  <span className="text-[9px] font-black text-indigo-400 tracking-widest uppercase font-mono">Showroom Selection</span>
                  <h3 className="text-lg font-black text-white tracking-tight mt-0.5 font-display">Pre-tested Website Templates Available Today</h3>
                </div>
                <button 
                  onClick={() => setActiveRoute("showroom")}
                  className="text-xs text-indigo-400 hover:text-white transition-colors font-bold flex items-center space-x-1"
                >
                  <span>Launch full showroom viewer</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {templates.slice(0, 4).map(temp => (
                  <div 
                    key={temp.id}
                    onClick={() => {
                      setSelectedTemplateId(temp.id);
                      setActiveRoute("showroom");
                    }}
                    className="bg-slate-900 border border-slate-800 hover:border-indigo-500 rounded-3xl p-5 cursor-pointer hover:shadow-xl transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                          temp.category === 'medical' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/25' :
                          temp.category === 'hospital' ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/25' :
                          temp.category === 'garment' ? 'bg-amber-500/15 text-amber-500 border border-amber-500/25' :
                          'bg-sky-550/15 text-sky-400 border border-sky-550/25'
                        }`}>
                          {temp.category}
                        </span>

                        <span className="text-[10px] text-amber-450 font-bold flex items-center shrink-0">
                          <Star className="h-3 w-3 fill-amber-500 text-amber-500 mr-0.5" />
                          {temp.rating}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-slate-100 mt-4 text-xs group-hover:text-indigo-400 transition font-display">
                        {temp.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {temp.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-800 mt-4 flex items-center justify-between">
                      <span className="text-indigo-400 font-mono font-black text-xs">₹{temp.price} INR</span>
                      <span className="text-[10px] text-slate-500 group-hover:text-white flex items-center transition-colors font-bold">
                        <span>Inspect Live</span>
                        <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}


        {/* ==================== SCREEN B: SHOWROOM TEMPLATE CATALOG & INSPECTOR ==================== */}
        {activeRoute === "showroom" && (
          <div className="space-y-8">
            <div className="border-b border-slate-900 pb-4">
              <h3 className="text-xl font-extrabold text-white tracking-tight">Interactive Platform Showroom</h3>
              <p className="text-xs text-slate-400">Click any published template to toggle resolutions and test responsive client sandboxes before checkout.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Category sidebar selector */}
              <div className="lg:col-span-4 space-y-3.5">
                <span className="text-[10px] font-black uppercase text-teal-400 tracking-wider block mb-1">Select Design Template</span>
                
                {templates.map(temp => (
                  <button
                    key={temp.id}
                    onClick={() => setSelectedTemplateId(temp.id)}
                    className={`w-full text-left p-4 rounded-2xl border text-xs transition flex flex-col justify-between ${
                      selectedTemplateId === temp.id 
                        ? `bg-teal-500/5 ${temp.id === 'medical-store' ? 'border-emerald-500' : temp.id === 'hospital-portal' ? 'border-blue-500' : 'border-rose-500'}` 
                        : "bg-slate-950/50 border-slate-900 hover:border-slate-800"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-450 uppercase pb-1">
                        <span>Category: {temp.category}</span>
                        <span className="font-mono text-teal-400 font-semibold">₹{temp.price} INR</span>
                      </div>
                      <h4 className="font-black text-slate-100 text-sm tracking-tight">{temp.title}</h4>
                      <p className="text-[11px] text-slate-400 font-sans line-clamp-2 leading-relaxed">{temp.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-3">
                      {temp.features.slice(0, 3).map(feat => (
                        <span key={feat} className="text-[8px] bg-slate-900 border border-slate-850 px-1.5 py-0.5 rounded text-slate-450 truncate whitespace-nowrap">
                          ✓ {feat}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>

              {/* Master virtual browser simulation inspect pane and detail cards */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Virtual Browser mount */}
                {activeInspectTemplate && (
                  <TemplatePreview 
                    templateId={activeInspectTemplate.id} 
                    primaryColor={activeInspectTemplate.colors.primary}
                    customTitle={activeInspectTemplate.title}
                    customDescription={activeInspectTemplate.description}
                    customPrice={activeInspectTemplate.price}
                    customFeatures={activeInspectTemplate.features}
                  />
                )}

                {/* Info and Purchase Trigger cards */}
                {activeInspectTemplate && (
                  <div className="bg-slate-950 border border-slate-900 rounded-[28px] p-6 space-y-5">
                    <div className="flex justify-between items-start flex-wrap gap-4 border-b border-slate-900 pb-4">
                      <div>
                        <h4 className="text-lg font-black text-white tracking-tight">{activeInspectTemplate.title} Setup Pack</h4>
                        <span className="text-[10px] text-teal-400 font-mono block mt-0.5 uppercase tracking-wider">
                          Full layout customizable by Sumit Rajpoot
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-xl font-mono font-black text-teal-400 block">₹{activeInspectTemplate.price} INR</span>
                        <span className="text-[9px] text-slate-450 block font-bold">Standard Single Deployment Code Pack</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-black text-teal-450 uppercase tracking-widest block">Detailed Specifications & Architecture</span>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {activeInspectTemplate.longDescription}
                      </p>
                    </div>

                    {/* Features checklist Grid */}
                    <div className="space-y-3">
                      <span className="text-[10px] font-black text-teal-450 uppercase tracking-widest block">Standard Features Built-in</span>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                        {activeInspectTemplate.features.map(feat => (
                          <div key={feat} className="flex items-center space-x-2 text-slate-300">
                            <span className="h-4 w-4 rounded bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
                              <Check className="h-3 w-3" />
                            </span>
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Trigger Buy action */}
                    <div className="pt-4 border-t border-slate-900 flex justify-between items-center flex-wrap gap-4">
                      <div className="text-slate-450 text-[11px] leading-snug">
                        ⚡ Includes developer code download (.zip), environment examples, and setup instructions.
                      </div>

                      <button
                        onClick={() => {
                          setCheckoutTemplate(activeInspectTemplate);
                        }}
                        id="btn-trigger-buy-catalog"
                        className="bg-gradient-to-r from-teal-450 to-emerald-500 hover:from-teal-500 hover:to-emerald-600 text-slate-950 font-black text-xs uppercase tracking-widest px-8 py-3.5 rounded-2xl shadow-lg transition"
                      >
                        Initiate Website Purchase Flow
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}


        {/* ==================== SCREEN C: PACKAGES COMPARISON & ACCURATE QUOTE ==================== */}
        {activeRoute === "pricing" && (
          <div className="space-y-12">
            
            <div className="border-b border-slate-900 pb-4 text-center max-w-md mx-auto">
              <h3 className="text-xl font-extrabold text-white tracking-tight">Flexible Delivery Setup Options</h3>
              <p className="text-xs text-slate-400">Opt for rapid source download, custom hosting support, or full database custom coding.</p>
            </div>

            {/* Pricing Config cards comparison */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-slate-950 border border-slate-900 rounded-[28px] p-6 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <span className="text-[10px] font-black text-slate-450 uppercase block">Code Package Tier</span>
                  <h4 className="text-lg font-black text-slate-100">Starter Single Code Pack</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Obtain raw code documents immediately. Contains premium styled components, layout matrices, local states, and asset guides.
                  </p>
                  
                  <div className="py-2">
                    <span className="text-2xl font-black font-mono text-slate-100">₹299 - ₹499</span>
                    <span className="text-[10px] block text-slate-500">One-time template investment</span>
                  </div>
                </div>

                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center space-x-2">
                    <Check className="h-3.5 w-3.5 text-teal-400" />
                    <span>Clean modular React 19 codebase</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="h-3.5 w-3.5 text-teal-400" />
                    <span>Tailwind CSS v4 layouts docs</span>
                  </li>
                  <li className="flex items-center space-x-2 text-slate-500 line-through">
                    <span>Free custom domain hosting</span>
                  </li>
                  <li className="flex items-center space-x-2 text-slate-500 line-through">
                    <span>Sumit custom features coding</span>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-950 border-2 border-teal-500/20 rounded-[28px] p-6 space-y-6 flex flex-col justify-between relative shadow-lg shadow-teal-500/5">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-500 text-slate-950 px-3 py-1 rounded-full text-[9px] font-black tracking-wider uppercase font-mono">
                  ★ SUMIT RECOMMENDED
                </span>
                
                <div className="space-y-4 pt-1">
                  <span className="text-[10px] font-black text-teal-400 uppercase block">Full Custom Setup Tier</span>
                  <h4 className="text-lg font-black text-white">Advanced Growth Setup</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Sumit takes complete responsibility. Includes custom medical/apparel database population, branding details customization, and landing titles.
                  </p>
                  
                  <div className="py-2">
                    <span className="text-2xl font-black font-mono text-teal-400">Template Price + ₹140</span>
                    <span className="text-[10px] block text-slate-500">Full integration package</span>
                  </div>
                </div>

                <ul className="space-y-2 text-xs text-slate-350">
                  <li className="flex items-center space-x-2">
                    <Check className="h-3.5 w-3.5 text-teal-400" />
                    <span>Logo & direct branding incorporation</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="h-3.5 w-3.5 text-teal-400" />
                    <span>Product category catalogs load</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="h-3.5 w-3.5 text-teal-400" />
                    <span>Full domain deployment configuration</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="h-3.5 w-3.5 text-teal-400" />
                    <span>WhatsApp and secure helpline route</span>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-950 border border-slate-900 rounded-[28px] p-6 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <span className="text-[10px] font-black text-slate-450 uppercase block">Full Enterprise Core IP</span>
                  <h4 className="text-lg font-black text-slate-100">Enterprise Scale Custom</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Designed for heavy relational databases. Complete table reservations, prescription OCR pipelines, doctor rosters, and 12 months maintenance support.
                  </p>
                  
                  <div className="py-2">
                    <span className="text-2xl font-black font-mono text-slate-150">Template Price + ₹399</span>
                    <span className="text-[10px] block text-slate-500">SaaS infrastructure</span>
                  </div>
                </div>

                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center space-x-2">
                    <Check className="h-3.5 w-3.5 text-teal-400" />
                    <span>Unlimited server deployments</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="h-3.5 w-3.5 text-teal-400" />
                    <span>Custom relational SQL configurations</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="h-3.5 w-3.5 text-teal-400" />
                    <span>Monthly optimization speed tests</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="h-3.5 w-3.5 text-teal-400" />
                    <span>1 year of direct edits and updates</span>
                  </li>
                </ul>
              </div>

            </section>

            {/* Testimonials */}
            <section className="bg-slate-950 border border-slate-900 rounded-[36px] p-6 md:p-8 space-y-6">
              <span className="text-[10px] font-black uppercase text-teal-400 block tracking-widest text-center">Past Customer Acclaims</span>
              <h4 className="text-lg font-black text-center text-slate-100 tracking-tight">Trust SumiTech WebCraft Code</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs max-w-4xl mx-auto">
                <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-900 space-y-3.5">
                  <p className="italic text-slate-400 leading-relaxed">
                    "PharmEase worked perfectly for my generic medicine store in Indore. Sumit customized the brand colors, added prescription scans upload routing, and linked it with our delivery dispatch helpline within 48 hours. Strongly recommended!"
                  </p>
                  <div>
                    <strong className="text-slate-155 text-xs block">Dr. Alok Verma</strong>
                    <span className="text-[10px] text-slate-500 font-mono italic">Owner, PharmEase Life Indore</span>
                  </div>
                </div>

                <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-900 space-y-3.5">
                  <p className="italic text-slate-400 leading-relaxed">
                    "The garment store e-commerce template is gorgeous. We had specific requirements about sizes S/M/L and promotional code overlays and Sumit wrote the logic in standard Javascript instantly. Very modern responsive template designs."
                  </p>
                  <div>
                    <strong className="text-slate-155 text-xs block">Riya Sen</strong>
                    <span className="text-[10px] text-slate-500 font-mono italic">Creative, Vogue boutiques India</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Interactive custom quote estimator */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-slate-950/80 border border-slate-900 p-6 md:p-8 rounded-[36px] items-center">
              
              <div className="lg:col-span-6 space-y-4">
                <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest block">Interactive Quotation System</span>
                <h3 className="text-lg font-black text-white tracking-tight leading-snug">Don't Want Templates? Calculate a Bespoke Setup Fee From Scratch</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Sumit can design entirely bespoke web systems (e.g., custom inventory databases, specialized client records, real-time calendars). Toggle requirements sliders to evaluate standard software estimates.
                </p>

                <div className="text-xs space-y-2 border-t border-slate-900 pt-3">
                  <h4 className="font-bold text-slate-300">Deliverables include:</h4>
                  <ul className="grid grid-cols-2 gap-2 text-slate-400 text-[11px]">
                    <li className="flex items-center space-x-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-400"></span>
                      <span>Secure Admin Login</span>
                    </li>
                    <li className="flex items-center space-x-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-400"></span>
                      <span>SSL deployment files</span>
                    </li>
                    <li className="flex items-center space-x-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-400"></span>
                      <span>Express JS API server</span>
                    </li>
                    <li className="flex items-center space-x-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-400"></span>
                      <span>Standard UI adjustments</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Quotation Calculator block */}
              <div className="lg:col-span-6 bg-slate-950 border border-slate-850 p-6 rounded-3xl space-y-5">
                
                {/* 1. Size Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-mono text-xs text-slate-400">
                    <span>ESTIMATED PAGES/RESOURCES ({quotePages})</span>
                    <span className="font-bold text-slate-100">₹{quotePages * 40} INR</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={quotePages}
                    onChange={(e) => setQuotePages(Number(e.target.value))}
                    className="w-full accent-teal-400 bg-slate-900 h-1.5 rounded"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                    <span>1 Land Page</span>
                    <span>20 Advanced Views</span>
                  </div>
                </div>

                {/* Checks */}
                <div className="space-y-2.5 pt-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase block">Configuration Accompanying Pack</label>
                  
                  <label className="flex items-center space-x-2.5 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={quoteDbIntegration}
                      onChange={(e) => setQuoteDbIntegration(e.target.checked)}
                      className="accent-teal-400 rounded h-3.5 w-3.5 cursor-pointer bg-slate-900 border-0"
                    />
                    <span>Secured SQL/NoSQL Database Pipeline setup (+ ₹180)</span>
                  </label>

                  <label className="flex items-center space-x-2.5 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={quoteLogoDesign}
                      onChange={(e) => setQuoteLogoDesign(e.target.checked)}
                      className="accent-teal-400 rounded h-3.5 w-3.5 cursor-pointer bg-slate-900 border-0"
                    />
                    <span>Vector Brand Logo design files (+ ₹60)</span>
                  </label>

                  <label className="flex items-center space-x-2.5 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={quoteYearSupport}
                      onChange={(e) => setQuoteYearSupport(e.target.checked)}
                      className="accent-teal-400 rounded h-3.5 w-3.5 cursor-pointer bg-slate-900 border-0"
                    />
                    <span>1 Year Server Maintenance & Admin Dev support (+ ₹120)</span>
                  </label>
                </div>

                {/* Real-time sum result display card */}
                <div className="bg-slate-900 border border-slate-850 p-4 rounded-2xl flex justify-between items-center mt-3">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 block tracking-wider uppercase">Estimated Direct Quote</span>
                    <span className="font-serif font-black text-white text-md">Bespoke Custom Build</span>
                    <span className="text-[9px] text-teal-400 font-mono font-medium block mt-0.5">Deployment Ready in 4-6 Days</span>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-teal-400 font-black text-xl font-mono block">₹{calculateCustomQuoteFee()}</span>
                    <span className="text-[9px] tracking-wider uppercase text-slate-500 font-mono">INR Approx</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setQuoteFeedback(`Quotations submitted successfully! Please access the Customer Portal or email us at ${config.contactEmail} citing standard calculated rate of ₹${calculateCustomQuoteFee()} for premium build custom dispatch.`);
                  }}
                  className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-100 font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl transition"
                >
                  Acquire Custom Estimate Code
                </button>

                {quoteFeedback && (
                  <div className="bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 rounded-xl p-3 text-[11px] mt-3 space-y-1">
                    <p className="font-extrabold text-white text-center">✓ Custom Proposal Logged</p>
                    <p className="leading-relaxed text-center">{quoteFeedback}</p>
                    <button 
                      onClick={() => setQuoteFeedback(null)} 
                      className="text-[10px] text-emerald-400 hover:text-white font-bold block mx-auto pt-1"
                    >
                      Dismiss Feedback
                    </button>
                  </div>
                )}
              </div>

            </section>
          </div>
        )}


        {/* ==================== SCREEN D: CLIENT DASHBOARD MOUNT ==================== */}
        {activeRoute === "client" && (
          <div className="space-y-6">
            <div className="border-b border-slate-900 pb-4">
              <h3 className="text-xl font-extrabold text-white tracking-tight">Digital Client Workspace</h3>
              <p className="text-xs text-slate-400">Log in using purchase credentials to monitor builds, download templates zip, and schedule direct edits with Sumit.</p>
            </div>

            <CustomerPortal 
              orders={orders}
              messages={messages}
              onSubmitCustomRequirements={handleSubmitCustomRequirements}
              onSendMessage={(email, name, text) => handleSendMessage(email, name, text, "customer")}
              onLogoutCustomer={() => {
                setLoggedInCustomerEmail(null);
                setLoggedInCustomerName(null);
                if (activeRoute === "admin") {
                  setActiveRoute("home");
                }
              }}
              loggedInEmail={loggedInCustomerEmail}
              onLoginCustomer={(email, name) => {
                setLoggedInCustomerEmail(email);
                setLoggedInCustomerName(name);
              }}
              adminEmail={adminEmail}
              adminPasswordHash={adminPasswordHash}
              onNavigateToAdmin={() => setActiveRoute("admin")}
            />
          </div>
        )}


        {/* ==================== SCREEN E: SUMIT PORTAL MASTER ADMIN BOARD ==================== */}
        {activeRoute === "admin" && (
          loggedInCustomerEmail?.toLowerCase() === adminEmail.toLowerCase() ? (
            <div className="space-y-6">
              <div className="border-b border-slate-900 pb-4 flex justify-between items-baseline flex-wrap gap-2">
                <div>
                  <h3 className="text-xl font-extrabold text-white tracking-tight">Security Unsealed Cockpit</h3>
                  <p className="text-xs text-slate-400">Manage digital catalog items, project pipeline progression states, and reply back to client messages.</p>
                </div>

                {/* Reset to initial trigger */}
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to reset current workspace presets back to original factory configurations? All custom layouts and logged builds will revert.")) {
                      handleResetDatabaseToDefault();
                      setGlobalFeedback("Database profiles and secure catalog parameters successfully reset to default formats.");
                      setActiveRoute("home");
                    }
                  }}
                  className="text-xs text-slate-500 hover:text-red-400 hover:underline flex items-center space-x-1 transition"
                  title="Reset Database Defaults"
                >
                  <span>Reset Seed Logs</span>
                </button>
              </div>

              <AdminPortal 
                templates={templates}
                config={config}
                orders={orders}
                messages={messages}
                adminPasswordHash={adminPasswordHash}
                adminEmail={adminEmail}
                onUpdateAdminEmail={handleUpdateAdminEmail}
                onUpdateConfig={handleUpdateConfig}
                onUpdateTemplates={handleUpdateTemplates}
                onUpdateOrders={handleUpdateOrders}
                onUpdateAdminPassword={handleUpdateAdminPassword}
                onSendMessage={(email, name, text) => handleSendMessage(email, name, text, "admin")}
                onResetDatabase={handleResetDatabaseToDefault}
              />
            </div>
          ) : (
            <div className="max-w-md mx-auto text-center py-16 px-6 bg-slate-900/40 border border-slate-800 rounded-3xl space-y-5 my-8 relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-10 bg-red-500/10 blur-xl rounded-full"></div>
              <div className="h-16 w-16 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-red-500/5">
                <Lock className="h-8 w-8 animate-pulse" />
              </div>
              <h3 className="text-lg font-black text-white tracking-tight uppercase">Access Protected</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                The administrative control cockpit is strictly isolated. To unseal this panel, you must log in with the administrator email inside the <span className="text-indigo-400 font-bold underline cursor-pointer hover:text-indigo-300 transition" onClick={() => setActiveRoute("client")}>Client Entrance Portal</span> first.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setActiveRoute("client")}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl transition duration-300 shadow-md inline-block"
                >
                  Go to Client Entrance Portal
                </button>
              </div>
            </div>
          )
        )}

      </main>


      {/* 3. PLATFORM STATUS BAR */}
      <footer className="max-w-7xl w-full mx-auto px-6 py-4 text-[10px] text-slate-500 font-mono border-t border-slate-900 mt-12 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex gap-4 flex-wrap justify-center sm:justify-start">
          <span>PLATFORM VERSION 2.0.4-LATEST</span>
          <span>SESSION: ADMIN_SUMIT_001</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
          <span>ALL SYSTEMS OPERATIONAL</span>
        </div>
      </footer>

      {/* 4. PROFESSIONAL SUBTLE FOOTER */}
      <footer className="bg-slate-950 px-4 md:px-8 py-8 border-t border-slate-900 mt-auto text-slate-400 text-xs">
        <div className="max-w-7xl w-full mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col text-center md:text-left gap-1">
            <span className="font-extrabold text-white tracking-tight font-display">Sumit<span className="text-indigo-400">Sphere</span></span>
            <span className="text-[11px] text-slate-500 font-mono">Bespoke Enterprise Webcraft Portfolio Engine by Sumit Rajpoot</span>
            <p className="mt-2 text-[10px] text-slate-500 font-mono">© 2026 Sumitech Digital Solutions. Secure control panel unsealed. Port-ingress bound.</p>
          </div>

          {/* Social node handles */}
          <div className="flex flex-col items-center md:items-end gap-1.5 font-mono">
            <div className="flex items-center space-x-3 text-[11px] text-slate-400">
              <span className="hover:text-indigo-400 transition cursor-pointer flex items-center">
                <Mail className="h-3.5 w-3.5 mr-1 text-indigo-400" />
                {config.contactEmail}
              </span>
              <span className="hover:text-indigo-400 transition cursor-pointer flex items-center">
                <Phone className="h-3.5 w-3.5 mr-1 text-indigo-400" />
                {config.contactPhone}
              </span>
            </div>
            
            <div className="flex space-x-3 text-[10px] pt-1.5 border-t border-slate-900 w-full justify-center md:justify-end text-slate-500">
              {loggedInCustomerEmail?.toLowerCase() === adminEmail.toLowerCase() && (
                <>
                  <span className="cursor-pointer text-teal-400 hover:text-teal-300 font-mono font-bold" onClick={() => setActiveRoute("admin")}>[ Unsealed Cockpit ]</span>
                  <span>•</span>
                </>
              )}
              <span className="cursor-pointer hover:text-slate-300" onClick={() => {
                setActiveRoute("client");
              }}>Client Entrance</span>
            </div>
          </div>
        </div>
      </footer>

      {/* 4. MAIN CHECKOUT MODAL FRAME */}
      {checkoutTemplate && (
        <CheckoutModal 
          template={checkoutTemplate}
          onClose={() => setCheckoutTemplate(null)}
          onPurchaseComplete={async (newOrder) => {
            const updated = [...orders, newOrder];
            setOrders(updated);
            localStorage.setItem("sumitech_orders", JSON.stringify(updated));
            
            // Persist checkout order record securely in Firestore
            await saveOrderToFirestore(newOrder, auth.currentUser?.uid);

            // Log user in automatically!
            setLoggedInCustomerEmail(newOrder.customerEmail);
            setLoggedInCustomerName(newOrder.customerName);
            setActiveRoute("client");
            setCheckoutTemplate(null);
          }}
          customerEmail={loggedInCustomerEmail || ""}
          customerName={loggedInCustomerName || ""}
        />
      )}

    </div>
  );
}
