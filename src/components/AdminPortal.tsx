import React, { useState } from "react";
import { 
  Lock, 
  Unlock, 
  Cpu, 
  Sparkles, 
  Sliders, 
  Plus, 
  Trash2, 
  Edit3, 
  Database, 
  IndianRupee, 
  Mail, 
  Phone, 
  Info, 
  Users, 
  ShoppingBag, 
  MessageSquare, 
  Send, 
  Settings, 
  FileText, 
  TrendingUp, 
  X, 
  Check, 
  Undo2,
  RefreshCw
} from "lucide-react";
import { WebsiteTemplate, PortalConfig, Order, SupportMessage } from "../types";

const getPrimaryColorClass = (color: string) => {
  switch (color) {
    case "emerald": return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
    case "blue": return "bg-blue-500/10 border-blue-500/20 text-blue-400";
    case "rose": return "bg-rose-500/10 border-rose-500/20 text-rose-400";
    case "amber": return "bg-amber-500/10 border-amber-500/20 text-amber-400";
    default: return "bg-indigo-500/10 border-indigo-500/20 text-indigo-400";
  }
};

interface AdminPortalProps {
  templates: WebsiteTemplate[];
  config: PortalConfig;
  orders: Order[];
  messages: SupportMessage[];
  adminPasswordHash: string;
  adminEmail: string;
  onUpdateAdminEmail: (newEmail: string) => void;
  onUpdateConfig: (newConfig: PortalConfig) => void;
  onUpdateTemplates: (updatedTemplates: WebsiteTemplate[]) => void;
  onUpdateOrders: (updatedOrders: Order[]) => void;
  onUpdateAdminPassword: (newPass: string) => void;
  onSendMessage: (customerEmail: string, customerName: string, message: string) => void;
  onResetDatabase: () => void;
}

export default function AdminPortal({
  templates,
  config,
  orders,
  messages,
  adminPasswordHash,
  adminEmail,
  onUpdateAdminEmail,
  onUpdateConfig,
  onUpdateTemplates,
  onUpdateOrders,
  onUpdateAdminPassword,
  onSendMessage,
  onResetDatabase
}: AdminPortalProps) {
  // Authentication Form state
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(false);

  // Sub-navigation tabs
  const [activeTab, setActiveTab] = useState<"dashboard" | "catalog" | "settings" | "orders" | "chat">("dashboard");

  // Edit states
  const [editingTemplate, setEditingTemplate] = useState<WebsiteTemplate | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  
  // Local states for editing template values
  const [tempId, setTempId] = useState("");
  const [tempTitle, setTempTitle] = useState("");
  const [tempCategory, setTempCategory] = useState<any>("medical");
  const [tempDescription, setTempDescription] = useState("");
  const [tempLongDescription, setTempLongDescription] = useState("");
  const [tempPrice, setTempPrice] = useState(299);
  const [tempFeatures, setTempFeatures] = useState<string>("");
  const [tempPrimaryColor, setTempPrimaryColor] = useState("emerald");
  const [tempImage, setTempImage] = useState("");

  // Portal settings local states
  const [setHero, setSetHero] = useState(config.heroTitle);
  const [setTagline, setSetTagline] = useState(config.heroTagline);
  const [setBio, setSetBio] = useState(config.sumitBio);
  const [setEmail, setSetEmail] = useState(config.contactEmail);
  const [setPhone, setSetPhone] = useState(config.contactPhone);
  const [setClientsCount, setSetClientsCount] = useState(config.totalClients);
  const [setExp, setSetExp] = useState(config.experienceYears);
  const [avatar, setAvatar] = useState(config.sumitAvatar);
  const [heroImage, setHeroImage] = useState(config.portalHeroImage || "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=600&auto=format&fit=crop");
  const [noticeText, setNoticeText] = useState(config.noticeText || "");
  const [securingPassword, setSecuringPassword] = useState(adminPasswordHash);
  const [securingEmail, setSecuringEmail] = useState(adminEmail);
  const [transferOwnerEmail, setTransferOwnerEmail] = useState("");
  const [showTransferConfirm, setShowTransferConfirm] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [seedSuccess, setSeedSuccess] = useState(false);

  // Active chat thread customer selecting
  const [selectedChatUser, setSelectedChatUser] = useState<string>("");
  const [adminReplyText, setAdminReplyText] = useState("");

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim().toLowerCase() === adminEmail.toLowerCase() && passwordInput === adminPasswordHash) {
      setIsAuthenticated(true);
      setAuthError(false);
      setPasswordInput("");
    } else {
      setAuthError(true);
      setTimeout(() => setAuthError(false), 3000);
    }
  };

  const handleSavePortalSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsError(null);
    
    if (securingEmail.trim().toLowerCase() !== adminEmail.toLowerCase()) {
      const emailToUpdate = securingEmail.trim().toLowerCase();
      if (!emailToUpdate) {
        setSettingsError("Admin Email Address cannot be blank!");
        return;
      }
      onUpdateAdminEmail(emailToUpdate);
    }

    onUpdateConfig({
      ...config,
      heroTitle: setHero,
      heroTagline: setTagline,
      sumitBio: setBio,
      sumitAvatar: avatar,
      portalHeroImage: heroImage,
      contactEmail: setEmail,
      contactPhone: setPhone,
      totalClients: Number(setClientsCount),
      experienceYears: Number(setExp),
      noticeText: noticeText
    });
    
    if (securingPassword !== adminPasswordHash) {
      if (securingPassword.length < 6) {
        setSettingsError("Security alphanumeric password must be at least 6 characters!");
        return;
      }
      onUpdateAdminPassword(securingPassword);
    }
    setSettingsSuccess(true);
    setTimeout(() => setSettingsSuccess(false), 3000);
  };

  // Open Edit Template Modal
  const startEditTemplate = (t: WebsiteTemplate) => {
    setEditingTemplate(t);
    setIsCreatingNew(false);
    setTempId(t.id);
    setTempTitle(t.title);
    setTempCategory(t.category);
    setTempDescription(t.description);
    setTempLongDescription(t.longDescription);
    setTempPrice(t.price);
    setTempFeatures(t.features.join("\n"));
    setTempPrimaryColor(t.colors.primary);
    setTempImage(t.image || "");
  };

  // Start Create Template State
  const startCreateNewTemplate = () => {
    setEditingTemplate(null);
    setIsCreatingNew(true);
    setTempId("new-site-type-" + Math.floor(100 + Math.random() * 900));
    setTempTitle("");
    setTempCategory("medical");
    setTempDescription("");
    setTempLongDescription("");
    setTempPrice(299);
    setTempFeatures("Fast landing index setup\nFully responsive viewport components\nGoogle maps coordinates tag\nActive reservation logic widget");
    setTempPrimaryColor("emerald");
    setTempImage("https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=400&auto=format&fit=crop");
  };

  const handleSaveTemplateData = (e: React.FormEvent) => {
    e.preventDefault();
    setCatalogError(null);
    if (!tempTitle.trim() || !tempDescription.trim()) {
      setCatalogError("Please provide the website template title and basic catalog description!");
      return;
    }

    const compiledFeatures = tempFeatures.split("\n").map(f => f.trim()).filter(f => f.length > 0);

    const updatedTemplateItem: WebsiteTemplate = {
      id: tempId,
      title: tempTitle,
      category: tempCategory,
      description: tempDescription,
      longDescription: tempLongDescription,
      price: Number(tempPrice),
      features: compiledFeatures,
      image: tempImage || "placeholder_imagekey",
      rating: editingTemplate ? editingTemplate.rating : 4.8,
      salesCount: editingTemplate ? editingTemplate.salesCount : 0,
      colors: {
        primary: tempPrimaryColor,
        secondary: tempPrimaryColor === "emerald" ? "teal" : tempPrimaryColor === "blue" ? "sky" : tempPrimaryColor === "rose" ? "pink" : "orange"
      },
      demoPages: []
    };

    if (isCreatingNew) {
      onUpdateTemplates([...templates, updatedTemplateItem]);
    } else {
      onUpdateTemplates(templates.map(t => t.id === tempId ? updatedTemplateItem : t));
    }

    setIsCreatingNew(false);
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm("Are you absolutely sure you want to delete this website catalog template from SumiTech Studio? This action is irreversible.")) {
      onUpdateTemplates(templates.filter(t => t.id !== id));
    }
  };

  const handleUpdateOrderStatus = (orderId: string, status: any) => {
    const updated = orders.map(o => o.id === orderId ? { ...o, status } : o);
    onUpdateOrders(updated);
  };

  const handleAdminSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminReplyText.trim() || !selectedChatUser) return;
    
    // Find matching user metrics to append name
    const activeMessages = messages.filter(m => m.customerEmail === selectedChatUser);
    const resolvedName = activeMessages.length > 0 ? activeMessages[0].customerName : "Client";
    
    onSendMessage(selectedChatUser, resolvedName, adminReplyText.trim());
    setAdminReplyText("");
  };

  // Group messages list by unique emails for sidebar layout
  const chatThreads = Array.from(new Set(messages.map(m => m.customerEmail))).map(email => {
    const userMessages = messages.filter(m => m.customerEmail === email);
    const lastMsg = userMessages[userMessages.length - 1];
    return {
      email,
      name: lastMsg.customerName,
      lastText: lastMsg.message,
      timestamp: lastMsg.timestamp,
      count: userMessages.length
    };
  });

  const aggregateRevenue = orders.reduce((total, o) => total + o.price, 0);

  // Dynamic monthly revenue calculated purely from actual non-dummy customer orders
  const getMonthlyRevenue = (yearMonth: string) => {
    return orders
      .filter(o => o.purchaseDate && o.purchaseDate.startsWith(yearMonth))
      .reduce((sum, o) => sum + o.price, 0);
  };

  const diagnosticsData = [
    { label: "Feb", value: getMonthlyRevenue("2026-02") },
    { label: "Mar", value: getMonthlyRevenue("2026-03") },
    { label: "Apr", value: getMonthlyRevenue("2026-04") },
    { label: "May", value: getMonthlyRevenue("2026-05") },
    { label: "Jun", value: getMonthlyRevenue("2026-06") }
  ];

  const maxVal = Math.max(...diagnosticsData.map(d => d.value), 1000);

  // SECURE GATE RENDER
  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-sm mx-auto bg-slate-900 border border-slate-850 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden my-6">
        {/* Glow Decor */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-10 bg-teal-500/10 blur-xl rounded-full"></div>
        
        <div className="text-center space-y-2.5 mb-6">
          <div className="h-14 w-14 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-550/25 flex items-center justify-center mx-auto shadow-sm">
            <Lock className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h4 className="text-lg font-black text-slate-100 tracking-tight flex items-center justify-center">
              Sumit's Secure Vault
            </h4>
            <p className="text-[11px] text-slate-450 mt-1 uppercase font-mono tracking-widest font-bold">Admin Level Authorization</p>
          </div>
        </div>

        <form onSubmit={handleAdminAuth} className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 tracking-wider">
              <span>Admin Email Address</span>
            </div>
            <input
              type="email"
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="e.g. sumitrajpoot70914@gmail.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-650 focus:outline-none focus:border-teal-500 transition"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 tracking-wider">
              <span>Enter Alphanumeric Master Password</span>
            </div>
            <input
              type="password"
              required
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="••••••••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-650 focus:outline-none focus:border-teal-500 transition font-mono tracking-widest"
            />
          </div>

          {authError && (
            <p className="text-[10px] font-semibold text-red-400 text-center bg-red-900/10 border border-red-500/20 py-2 rounded-lg font-sans">
              ❌ Invalid Email or Password. Access Denied.
            </p>
          )}

          <button
            type="submit"
            id="btn-admin-vault-unlock"
            className="w-full bg-gradient-to-r from-teal-400 to-emerald-500 text-slate-950 font-black text-xs uppercase tracking-widest py-3 rounded-xl shadow-lg transition flex items-center justify-center space-x-2 animate-pulse hover:animate-none"
          >
            <Unlock className="h-4 w-4" />
            <span>Unseal Control Cockpit</span>
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-900 border border-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col min-h-[560px]">
      
      {/* Top Admin Controls ribbon */}
      <div className="bg-slate-950 px-6 py-4 border-b border-slate-850 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center space-x-3">
          <span className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-550/20">
            <Sliders className="h-5 w-5" />
          </span>
          <div>
            <h4 className="font-black text-slate-100 text-base tracking-tight">SumiTech Studio Master Deck</h4>
            <p className="text-[10px] text-teal-400 font-mono font-bold tracking-widest uppercase">Admin Role: Sumit Rajpoot</p>
          </div>
        </div>

        {/* Action Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${activeTab === "dashboard" ? "bg-teal-500 text-slate-950" : "text-slate-400 bg-slate-900 border border-slate-800 hover:text-slate-200"}`}
          >
            Dashboard Overview
          </button>
          <button
            onClick={() => setActiveTab("catalog")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${activeTab === "catalog" ? "bg-teal-500 text-slate-950" : "text-slate-400 bg-slate-900 border border-slate-800 hover:text-slate-200"}`}
          >
            Edit All Catalog Items ({templates.length})
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${activeTab === "settings" ? "bg-teal-500 text-slate-950" : "text-slate-400 bg-slate-900 border border-slate-800 hover:text-slate-200"}`}
          >
            Customize Landing Portal
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${activeTab === "orders" ? "bg-teal-500 text-slate-950" : "text-slate-400 bg-slate-900 border border-slate-800 hover:text-slate-200"}`}
          >
            Configure Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${activeTab === "chat" ? "bg-teal-500 text-slate-950" : "text-slate-400 bg-slate-900 border border-slate-800 hover:text-slate-200"}`}
          >
            Reply Messages ({chatThreads.length})
          </button>
          <button
            onClick={() => {
              if (confirm("Reset current database state? This will restore mock templates, catalog layout, bio settings to initial defaults, clearing edits.")) {
                onResetDatabase();
                setIsAuthenticated(false);
              }
            }}
            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-900 rounded-lg transition"
            title="Reset Store Database"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Primary Workspace Panels */}
      <div className="p-6 md:p-8 flex-1">

        {/* 1. ADMINISTRATION OVERVIEW DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <h4 className="text-lg font-black text-slate-100 tracking-tight">Showroom Diagnostics & Flow</h4>
                <p className="text-xs text-slate-400">Review revenue metrics, active contracts, and software pipeline statistics.</p>
              </div>
              <div className="bg-slate-950/60 text-slate-400 font-mono text-[10px] px-3.5 py-1.5 rounded-full border border-slate-800">
                🔒 SECURITY INTEGRITY COMPLIANT: SSL ACTIVE
              </div>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-950 p-4 border border-slate-850 rounded-2xl">
                <span className="text-[9px] font-black text-slate-450 uppercase block">Total Net Volume</span>
                <span className="text-lg md:text-xl font-mono font-black text-teal-400 block mt-1">₹{aggregateRevenue} INR</span>
                <span className="text-[9px] text-emerald-400 font-mono flex items-center mt-0.5 font-bold">
                  <TrendingUp className="h-3 w-3 mr-0.5" />
                  +12.8% Since last week
                </span>
              </div>
              <div className="bg-slate-950 p-4 border border-slate-850 rounded-2xl">
                <span className="text-[9px] font-black text-slate-450 uppercase block">Contracts Managed</span>
                <span className="text-lg md:text-xl font-mono font-black text-slate-150 block mt-1">{orders.length} Templates</span>
                <span className="text-[9px] text-slate-400 block mt-0.5 font-medium">All customer packages</span>
              </div>
              <div className="bg-slate-950 p-4 border border-slate-850 rounded-2xl">
                <span className="text-[9px] font-black text-slate-450 uppercase block">Registered Users</span>
                <span className="text-lg md:text-xl font-mono font-black text-slate-150 block mt-1">
                  {Array.from(new Set(orders.map(o => o.customerEmail))).length} Clients
                </span>
                <span className="text-[9px] text-teal-400 block mt-0.5 font-bold">Verified license logs</span>
              </div>
              <div className="bg-slate-950 p-4 border border-slate-850 rounded-2xl">
                <span className="text-[9px] font-black text-slate-450 uppercase block">Showroom Items</span>
                <span className="text-lg md:text-xl font-mono font-black text-slate-150 block mt-1">{templates.length} Categories</span>
                <span className="text-[9px] text-pink-400 block mt-0.5 font-semibold">Medical, Garments, Hospital...</span>
              </div>
            </div>

            {/* Graphical representation (Custom Gorgeous SVG Bar Chart) */}
            <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl">
              <h5 className="text-xs uppercase font-extrabold tracking-wider text-slate-200 mb-4 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1 text-teal-400" />
                SumiTech Revenue Velocity Diagnostics
              </h5>
              
              <div className="h-32 flex items-end justify-between gap-2.5 pt-4 border-b border-slate-800">
                {diagnosticsData.map((item, idx) => {
                  const heightPercent = Math.min(100, Math.round((item.value / maxVal) * 100));
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center group">
                      <span className="text-[9px] font-mono text-teal-400 opacity-0 group-hover:opacity-100 transition duration-200">
                        ₹{item.value}
                      </span>
                      <div 
                        style={{ height: `${heightPercent || 10}%` }} 
                        className="w-full bg-gradient-to-t from-teal-500/20 to-teal-400/80 rounded-t-lg group-hover:from-teal-500/30 group-hover:to-teal-500 transition duration-300 relative border border-teal-400/40"
                      ></div>
                      <span className="text-[10px] text-slate-400 mt-2 font-mono font-bold uppercase">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 2. WEBSITE TEMPLATE CATALOG REGISTRY (CRUD) */}
        {activeTab === "catalog" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-3">
              <div>
                <h4 className="text-lg font-black text-slate-100 tracking-tight">Configure Showroom Catalog Templates</h4>
                <p className="text-xs text-slate-400">Sumit can insert new designs, override prices, features lists, or primary design themes.</p>
              </div>
              <button
                onClick={startCreateNewTemplate}
                id="btn-admin-add-template"
                className="bg-teal-500 hover:bg-teal-600 text-slate-950 font-black text-xs uppercase tracking-wider px-4 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-md shadow-teal-500/10"
              >
                <Plus className="h-4 w-4" />
                <span>Publish New Template</span>
              </button>
            </div>

            {/* Edit / Create Form */}
            {(editingTemplate || isCreatingNew) && (
              <form onSubmit={handleSaveTemplateData} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-850 pb-3">
                  <span className="text-xs font-black uppercase text-teal-400">
                    {isCreatingNew ? "✦ Draft New Website Definition" : `✏️ Edit Content Details: ${editingTemplate?.title}`}
                  </span>
                  <button 
                    type="button" 
                    onClick={() => {
                      setEditingTemplate(null);
                      setIsCreatingNew(false);
                    }} 
                    className="text-slate-400 hover:text-slate-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Template ID (Unique, alphanumeric)</label>
                    <input
                      type="text"
                      disabled={!isCreatingNew}
                      value={tempId}
                      onChange={(e) => setTempId(e.target.value)}
                      placeholder="medical-store"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500 disabled:opacity-40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Template Title Name</label>
                    <input
                      type="text"
                      required
                      value={tempTitle}
                      onChange={(e) => setTempTitle(e.target.value)}
                      placeholder="e.g., PharmEase Healthcare"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Business Category</label>
                    <select
                      value={tempCategory}
                      onChange={(e) => setTempCategory(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                    >
                      <option value="medical">Medical Store</option>
                      <option value="hospital">Hospital Portal</option>
                      <option value="garment">Garment Shop / Retail</option>
                      <option value="restaurant">Restaurant / Eatery</option>
                      <option value="realestate">Real Estate Agent</option>
                      <option value="other">General Agency Portfolio</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Standard Price (₹ Rupee)</label>
                    <input
                      type="number"
                      required
                      value={tempPrice}
                      onChange={(e) => setTempPrice(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Color Palette Theme Accent</label>
                    <select
                      value={tempPrimaryColor}
                      onChange={(e) => setTempPrimaryColor(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
                    >
                      <option value="emerald">Emerald Green (Ideal for Pharmacies)</option>
                      <option value="blue">Blue Azure (Ideal for Hospitals & Tech)</option>
                      <option value="rose">Rose Fuchsia (Ideal for Garments/Creative)</option>
                      <option value="amber">Amber Orange (Ideal for Cafes/Cuisine)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Template Cover Image URL</label>
                  <input
                    type="text"
                    required
                    value={tempImage}
                    onChange={(e) => setTempImage(e.target.value)}
                    placeholder="e.g., https://images.unsplash.com/... or local key"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Short Card Subtitle Description</label>
                  <input
                    type="text"
                    required
                    value={tempDescription}
                    onChange={(e) => setTempDescription(e.target.value)}
                    placeholder="Short summary for the hover slides"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Detailed Spec Info Sheet</label>
                  <textarea
                    rows={3}
                    required
                    value={tempLongDescription}
                    onChange={(e) => setTempLongDescription(e.target.value)}
                    placeholder="Provide full description of why this template works, hosting recommendations, code architecture..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500 resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Unique Features List (One line per feature)</label>
                    <span className="text-[9px] text-slate-450">Separate with paragraph returns</span>
                  </div>
                  <textarea
                    rows={4}
                    required
                    value={tempFeatures}
                    onChange={(e) => setTempFeatures(e.target.value)}
                    placeholder="Interactive patient intake portal&#10;WhatsApp quick redirection&#10;Live address mapping pins"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-teal-500"
                  />
                </div>

                {catalogError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center space-x-2">
                    <span className="font-bold text-red-200">⚠️ {catalogError}</span>
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTemplate(null);
                      setIsCreatingNew(false);
                      setCatalogError(null);
                    }}
                    className="border border-slate-850 hover:bg-slate-900 text-slate-400 font-bold px-4 py-2 rounded-xl text-xs transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="btn-admin-save-template"
                    className="bg-gradient-to-r from-teal-400 to-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider px-6 py-2 rounded-xl transition"
                  >
                    Save Changes to Registry
                  </button>
                </div>
              </form>
            )}

            {/* List layout of Templates with Edit/Delete controls */}
            <div className="space-y-3.5">
              {templates.map(temp => (
                <div key={temp.id} className="bg-slate-950 border border-slate-850 rounded-2xl p-4 md:p-5 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center space-x-3.5 flex-1 min-w-[240px]">
                    <div className={`h-11 w-11 rounded-xl border flex items-center justify-center shrink-0 ${getPrimaryColorClass(temp.colors.primary)}`}>
                      <Database className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-extrabold text-slate-100 block">{temp.title}</span>
                        <span className="text-[9px] text-slate-450 font-mono italic">({temp.id})</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block line-clamp-1 truncate">{temp.description}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">Showroom price</span>
                      <span className="text-xs font-mono font-black text-teal-400">₹{temp.price} INR</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => startEditTemplate(temp)}
                        className="p-2 text-slate-400 hover:text-teal-400 hover:bg-slate-900 rounded-lg transition"
                        title="Edit Website Template Settings"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(temp.id)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-lg transition"
                        title="Delete Website Template Catalog record"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. PORTAL CONFIG MASTER (EDIT EVERYTHING IN PORTAL) */}
        {activeTab === "settings" && (
          <form onSubmit={handleSavePortalSettings} className="space-y-6 max-w-2xl bg-slate-950 border border-slate-850 rounded-2xl p-6 md:p-8">
            <div>
              <h4 className="text-base font-black text-slate-100 tracking-tight">Full Showroom Appearance Customizer</h4>
              <p className="text-xs text-slate-400">Directly modify global titles, landing copy, diagnostics thresholds, bio summaries, and support credentials.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Landing Headline Name</label>
                <input
                  type="text"
                  required
                  value={setHero}
                  onChange={(e) => setSetHero(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Interactive Tagline Subtitle</label>
                <input
                  type="text"
                  required
                  value={setTagline}
                  onChange={(e) => setSetTagline(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Support Email Node</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={setEmail}
                    onChange={(e) => setSetEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Secure Helpline Phone</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={setPhone}
                    onChange={(e) => setSetPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Total Completed Clients Metric</label>
                <input
                  type="number"
                  required
                  value={setClientsCount}
                  onChange={(e) => setSetClientsCount(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Full Professional EXP (Years)</label>
                <input
                  type="number"
                  required
                  value={setExp}
                  onChange={(e) => setSetExp(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                Homepage Live Red Notice Board Message
              </label>
              <textarea
                rows={3}
                required
                value={noticeText}
                onChange={(e) => setNoticeText(e.target.value)}
                placeholder="Alert text displayed inside the live red notice board container..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-sans leading-relaxed focus:outline-none focus:border-red-500 transition duration-300"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Sumit Biography Statement</label>
              <textarea
                rows={4}
                required
                value={setBio}
                onChange={(e) => setSetBio(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 resize-none font-sans leading-relaxed"
              />
            </div>

            <div className="space-y-4 border-t border-slate-850/60 pt-4">
              <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">Portal Media & Pictures Customizer</h5>
              <p className="text-[11px] text-slate-400">Directly edit the picture of whole portal and admin representative avatar. Provide external secure image paths.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Admin Representative Portrait URL</label>
                    <span className="text-[9px] text-slate-550 font-mono">Avatar Image</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="Secure profile image link"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                  {avatar && (
                    <div className="mt-2 flex items-center space-x-2.5 bg-slate-900/50 border border-slate-850 p-2 rounded-xl">
                      <img src={avatar} alt="Admin Preview" className="w-10 h-10 object-cover rounded-lg border border-slate-800" referrerPolicy="no-referrer" />
                      <span className="text-[9px] text-slate-500 truncate flex-1">{avatar.slice(0, 48)}...</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Whole Portal Hero Banner URL</label>
                    <span className="text-[9px] text-slate-550 font-mono">Showcase Image</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={heroImage}
                    onChange={(e) => setHeroImage(e.target.value)}
                    placeholder="Secure global banner link"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                  {heroImage && (
                    <div className="mt-2 flex items-center space-x-2.5 bg-slate-900/50 border border-slate-850 p-2 rounded-xl">
                      <img src={heroImage} alt="Hero Preview" className="w-10 h-10 object-cover rounded-lg border border-slate-800" referrerPolicy="no-referrer" />
                      <span className="text-[9px] text-slate-500 truncate flex-1">{heroImage.slice(0, 48)}...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-1.5 border-t border-slate-850/60 pt-4">
              <label className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">Security Control: Alphanumeric Vault Password</label>
              <p className="text-[11px] text-slate-450 block">Modify the master alphanumeric entry key. Make sure to choose a strong password containing letters and numbers.</p>
              <input
                type="text"
                required
                value={securingPassword}
                onChange={(e) => setSecuringPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-mono tracking-widest"
              />
            </div>

            <div className="space-y-1.5 border-t border-slate-850/60 pt-4">
              <label className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block">Security Control: Admin Level Access Email</label>
              <p className="text-[11px] text-slate-450 block">Modify the official email used to access this Security Cockpit. Access is strictly isolated to this email address.</p>
              <input
                type="email"
                required
                value={securingEmail}
                onChange={(e) => setSecuringEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-mono"
              />
            </div>

            <div className="space-y-3 border-t border-slate-850/60 pt-4 bg-rose-950/10 p-4 rounded-2xl border border-rose-500/10">
              <label className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">Transfer Studio Ownership</label>
              <p className="text-[11px] text-slate-400 block">Transfer absolute cockpit control ownership to a new administrator's email. This will immediately log you out and require the new owner's email to unseal the vault.</p>
              
              {!showTransferConfirm ? (
                <div className="flex gap-3">
                  <input
                    type="email"
                    placeholder="new-admin-owner@example.com"
                    value={transferOwnerEmail}
                    onChange={(e) => {
                      setTransferOwnerEmail(e.target.value);
                      setTransferError(null);
                    }}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-150 font-mono focus:outline-none focus:border-rose-500"
                  />
                  <button
                    type="button"
                    id="btn-trigger-transfer-confirm"
                    onClick={() => {
                      const cleanEmail = transferOwnerEmail.trim().toLowerCase();
                      if (!cleanEmail || !cleanEmail.includes("@") || cleanEmail.length < 5) {
                        setTransferError("Please enter a valid administrative email address!");
                        return;
                      }
                      setTransferError(null);
                      setShowTransferConfirm(true);
                    }}
                    className="bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:bg-rose-500 hover:text-white px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition duration-300"
                  >
                    Initiate Transfer
                  </button>
                </div>
              ) : (
                <div className="bg-slate-950 p-4 border border-rose-500/30 rounded-xl space-y-3">
                  <p className="text-xs text-red-400 font-bold leading-relaxed">
                    🚨 CONFIRMATION REQUIRED: Are you absolutely sure you want to transfer full SumiTech Control Ownership to <span className="text-white underline font-mono select-all font-extrabold">{transferOwnerEmail.trim().toLowerCase()}</span>?
                  </p>
                  <p className="text-[11px] text-slate-450 leading-relaxed">
                    You will be logged out of this session immediately and only <span className="text-white font-mono">{transferOwnerEmail.trim().toLowerCase()}</span> with the password key will be able to log in.
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      id="btn-confirm-transfer-submit"
                      onClick={() => {
                        const targetEmail = transferOwnerEmail.trim().toLowerCase();
                        onUpdateAdminEmail(targetEmail);
                        setSecuringEmail(targetEmail);
                        setIsAuthenticated(false);
                        setShowTransferConfirm(false);
                        setTransferOwnerEmail("");
                        setEmailInput("");
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors"
                    >
                      Yes, Transfer Ownership now & Log Out
                    </button>
                    <button
                      type="button"
                      id="btn-cancel-transfer"
                      onClick={() => {
                        setShowTransferConfirm(false);
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-medium tracking-wider transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {transferError && (
                <p className="text-[10px] text-red-400 font-bold font-sans">⚠️ {transferError}</p>
              )}
            </div>

            {settingsSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl flex items-center space-x-2">
                <Check className="h-4 w-4" />
                <span>Portal configuration updated successfully! Changes applied immediately.</span>
              </div>
            )}

            {settingsError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center space-x-2">
                <span className="font-bold text-red-200">⚠️ {settingsError}</span>
              </div>
            )}

            <button
              type="submit"
              id="btn-admin-save-settings"
              className="bg-gradient-to-r from-teal-400 to-emerald-500 text-slate-950 font-black text-xs uppercase tracking-widest px-6 py-3 rounded-xl shadow-lg transition"
            >
              Apply All Real-Time Updates
            </button>
          </form>
        )}

        {/* 4. ORDERS PIPELINE MANAGER */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-black text-slate-100 tracking-tight">Active Client Project Flow</h4>
              <p className="text-xs text-slate-400">Configure delivery statuses, review custom branding asks, and verify unique license codes.</p>
            </div>

            {orders.length === 0 ? (
              <div className="border border-dashed border-slate-800 text-center py-10 rounded-2xl">
                <p className="text-xs text-slate-400">No client transactions recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(ord => (
                  <div key={ord.id} className="bg-slate-950 border border-slate-850 rounded-2xl p-5 space-y-3">
                    <div className="flex flex-wrap justify-between items-start gap-2 border-b border-slate-900 pb-3">
                      <div>
                        <div className="flex items-center space-x-1.5 flex-wrap">
                          <span className="text-xs uppercase bg-teal-500/10 text-teal-400 font-extrabold px-1.5 rounded font-mono">{ord.id}</span>
                          <span className="text-xs text-slate-100 font-bold">{ord.customerName}</span>
                          <span className="text-xs text-slate-450">({ord.customerEmail})</span>
                        </div>
                        <h5 className="text-sm font-black text-slate-300 mt-1">{ord.templateTitle}</h5>
                      </div>

                      <div className="space-y-1 text-right">
                        <span className="text-teal-400 font-bold block text-sm">₹{ord.price} INR</span>
                        <span className="text-[10px] text-slate-400 font-mono block">Acquired: {ord.purchaseDate}</span>
                      </div>
                    </div>

                    {/* Specifications */}
                    {ord.customRequirements ? (
                      <div className="p-3 bg-slate-900/60 border border-slate-850 rounded-xl text-xs text-slate-400 leading-relaxed">
                        <strong className="text-slate-300 font-bold text-[10px] uppercase block mb-1">Branding Guidelines:</strong>
                        <p className="italic">"{ord.customRequirements}"</p>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-medium italic block">No custom instructions written. Default deployment setup.</span>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="text-xs font-mono text-slate-450 flex items-center space-x-1">
                        <span>License Key:</span>
                        <span className="text-emerald-400 select-all font-semibold">{ord.licenseKey}</span>
                      </div>

                      {/* Status select trigger */}
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Process State:</span>
                        <select
                          value={ord.status}
                          onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as any)}
                          className="bg-slate-900 border border-slate-805 text-slate-200 text-xs rounded px-2 py-1 focus:outline-none focus:border-teal-500"
                        >
                          <option value="pending">Review Requirement</option>
                          <option value="requirements_review">Analyzing Codebase</option>
                          <option value="in_development">In Custom Development</option>
                          <option value="delivered">Deployed & Activated</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. ADMIN MESSAGING SUPPORT PANEL */}
        {activeTab === "chat" && (
          <div className="grid grid-cols-1 md:grid-cols-3 bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden min-h-[420px]">
            {/* List of client threads */}
            <div className="border-r border-slate-850 bg-slate-950/60 flex flex-col">
              <div className="p-4 border-b border-slate-850">
                <span className="text-[10px] uppercase font-black tracking-widest text-teal-400 block">Customer Inquiries</span>
                <p className="text-[11px] text-slate-450">Active message sessions</p>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-slate-900">
                {chatThreads.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No active support tickets.
                  </div>
                ) : (
                  chatThreads.map(thr => (
                    <button
                      key={thr.email}
                      onClick={() => setSelectedChatUser(thr.email)}
                      className={`w-full p-4 text-left transition ${selectedChatUser === thr.email ? "bg-slate-900 text-slate-200" : "hover:bg-slate-900/50 text-slate-400"}`}
                    >
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-xs font-bold truncate pr-1 text-slate-200 block">{thr.name}</span>
                        <span className="text-[9px] text-slate-500 font-mono shrink-0">{thr.timestamp}</span>
                      </div>
                      <p className="text-[10px] truncate max-w-[200px] text-slate-400 italic">"{thr.lastText}"</p>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Chat Workspace */}
            <div className="md:col-span-2 flex flex-col bg-slate-950">
              {selectedChatUser ? (
                <div className="flex flex-col h-full p-4 space-y-4">
                  <div className="border-b border-slate-850 pb-2">
                    <span className="text-xs font-black text-slate-200 block">Active channel: {selectedChatUser}</span>
                    <p className="text-[10px] text-slate-450">Direct support thread secure gateway</p>
                  </div>

                  {/* Messaging scroll area */}
                  <div className="flex-1 overflow-y-auto space-y-3 min-h-[220px] max-h-[300px] pr-2">
                    {messages
                      .filter(m => m.customerEmail === selectedChatUser)
                      .map(msg => (
                        <div 
                          key={msg.id} 
                          className={`flex flex-col max-w-[80%] ${msg.sender === "admin" ? "ml-auto items-end" : "mr-auto items-start"}`}
                        >
                          <span className="text-[9px] text-slate-450 font-bold mb-0.5 uppercase">
                            {msg.sender === "admin" ? "Sumit (Admin)" : msg.customerName}
                          </span>
                          <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                            msg.sender === "admin" 
                              ? "bg-teal-500 text-slate-950 font-bold rounded-tr-none" 
                              : "bg-slate-850 text-slate-200 rounded-tl-none border border-slate-700"
                          }`}>
                            {msg.message}
                          </div>
                          <span className="text-[8px] text-slate-500 font-mono mt-0.5">{msg.timestamp}</span>
                        </div>
                      ))}
                  </div>

                  {/* Input Reply */}
                  <form onSubmit={handleAdminSendChat} className="flex gap-2 border-t border-slate-850 pt-3">
                    <input
                      type="text"
                      required
                      value={adminReplyText}
                      onChange={(e) => setAdminReplyText(e.target.value)}
                      placeholder={`Reply directly to client email ${selectedChatUser}...`}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 tracking-wide focus:outline-none focus:border-teal-500"
                    />
                    <button
                      type="submit"
                      id="btn-admin-send-chat"
                      className="bg-teal-500 hover:bg-teal-600 text-slate-950 p-2.5 rounded-xl transition"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3 bg-slate-950">
                  <MessageSquare className="h-8 w-8 text-slate-700" />
                  <p className="text-xs text-slate-400">Select a thread email from the left sidebar panel to load message log history and begin active replies.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
