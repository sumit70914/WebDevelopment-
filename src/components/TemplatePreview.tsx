import { useState, useEffect } from "react";
import { 
  Laptop, 
  Tablet, 
  Smartphone, 
  ExternalLink, 
  Search, 
  ShoppingCart, 
  Plus, 
  Check, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  User, 
  ShieldAlert, 
  Upload, 
  Tag, 
  Star, 
  ChevronRight,
  Filter
} from "lucide-react";

interface TemplatePreviewProps {
  templateId: string;
  primaryColor: string; // e.g., 'emerald', 'blue', 'rose', 'amber'
  customTitle?: string;
  customDescription?: string;
  customPrice?: number;
  customFeatures?: string[];
}

export default function TemplatePreview({
  templateId,
  primaryColor = "emerald",
  customTitle,
  customDescription,
  customPrice,
  customFeatures
}: TemplatePreviewProps) {
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [cart, setCart] = useState<Array<{ id: string; name: string; price: number; quantity: number }>>([]);
  const [isPrescriptionUploaded, setIsPrescriptionUploaded] = useState(false);
  const [bookingStep, setBookingStep] = useState<"idle" | "form" | "success">("idle");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [bookingName, setBookingName] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedColor, setSelectedColor] = useState("Default");
  const [notification, setNotification] = useState<{ message: string; type: "success" | "info" } | null>(null);

  // Auto-fades notification banner
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Reset local interactive state when template changes
  useEffect(() => {
    setCart([]);
    setIsPrescriptionUploaded(false);
    setBookingStep("idle");
    setSelectedDoctor("");
  }, [templateId]);

  // Color helper to return Tailwind utility classes depending on active template color variables
  const getColorClasses = (c: string) => {
    switch (c) {
      case "emerald":
        return {
          bg: "bg-emerald-600",
          text: "text-emerald-600",
          border: "border-emerald-600",
          hover: "hover:bg-emerald-700",
          focus: "focus:ring-emerald-500",
          lightBg: "bg-emerald-50",
          accentText: "text-emerald-500",
          gradient: "from-emerald-500 to-teal-600",
          ring: "ring-emerald-500"
        };
      case "blue":
        return {
          bg: "bg-blue-600",
          text: "text-blue-600",
          border: "border-blue-600",
          hover: "hover:bg-blue-700",
          focus: "focus:ring-blue-500",
          lightBg: "bg-blue-50",
          accentText: "text-blue-500",
          gradient: "from-blue-500 to-sky-600",
          ring: "ring-blue-500"
        };
      case "rose":
        return {
          bg: "bg-rose-600",
          text: "text-rose-600",
          border: "border-rose-600",
          hover: "hover:bg-rose-700",
          focus: "focus:ring-rose-500",
          lightBg: "bg-rose-50",
          accentText: "text-rose-500",
          gradient: "from-rose-500 to-pink-600",
          ring: "ring-rose-500"
        };
      case "amber":
        return {
          bg: "bg-amber-600",
          text: "text-amber-600",
          border: "border-amber-600",
          hover: "hover:bg-amber-700",
          focus: "focus:ring-amber-500",
          lightBg: "bg-amber-50",
          accentText: "text-amber-500",
          gradient: "from-amber-500 to-orange-600",
          ring: "ring-amber-500"
        };
      default:
        return {
          bg: "bg-indigo-600",
          text: "text-indigo-600",
          border: "border-indigo-600",
          hover: "hover:bg-indigo-700",
          focus: "focus:ring-indigo-500",
          lightBg: "bg-indigo-50",
          accentText: "text-indigo-500",
          gradient: "from-indigo-500 to-purple-600",
          ring: "ring-indigo-500"
        };
    }
  };

  const activeColors = getColorClasses(primaryColor);

  // Cart operations
  const addToCart = (id: string, name: string, price: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === id);
      if (existing) {
        return prev.map(item => item.id === id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { id, name, price, quantity: 1 }];
    });
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getDeviceWidth = () => {
    if (device === "mobile") return "max-w-xs md:max-w-sm";
    if (device === "tablet") return "max-w-2xl";
    return "max-w-full";
  };

  return (
    <div className="w-full flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Sandbox Header / Simulator Controls */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex flex-wrap justify-between items-center gap-3">
        {/* Device select buttons */}
        <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-850">
          <button
            onClick={() => setDevice("desktop")}
            id="toggle-device-desktop"
            className={`p-2 rounded-md transition-all ${device === "desktop" ? "bg-slate-800 text-teal-400" : "text-slate-400 hover:text-slate-200"}`}
            title="Desktop Resolution Mode"
          >
            <Laptop className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDevice("tablet")}
            id="toggle-device-tablet"
            className={`p-2 rounded-md transition-all ${device === "tablet" ? "bg-slate-800 text-teal-400" : "text-slate-400 hover:text-slate-200"}`}
            title="Tablet Resolution Mode"
          >
            <Tablet className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDevice("mobile")}
            id="toggle-device-mobile"
            className={`p-2 rounded-md transition-all ${device === "mobile" ? "bg-slate-800 text-teal-400" : "text-slate-400 hover:text-slate-200"}`}
            title="Mobile Resolution Mode"
          >
            <Smartphone className="h-4 w-4" />
          </button>
        </div>

        {/* Demo Status Badge */}
        <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Live Digital Layout Preview</span>
        </div>

        {/* Browser Mock URL bar */}
        <div className="flex-1 max-w-md mx-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-450 flex items-center justify-between">
          <span className="truncate">https://preview.sumitech.studio/{templateId}</span>
          <ExternalLink className="h-3 w-3 text-slate-500 ml-1 shrink-0" />
        </div>
      </div>

      {/* Simulator Viewing Stage */}
      <div className="bg-slate-900 p-3 md:p-6 flex justify-center items-start min-h-[460px] max-h-[680px] overflow-y-auto transition-all duration-300">
        <div className={`w-full bg-white text-slate-800 rounded-xl shadow-lg border border-slate-300 transition-all duration-350 ${getDeviceWidth()} relative`}>
          
          {notification && (
            <div className="absolute top-3 left-3 right-3 z-50 bg-slate-950 border border-teal-500/40 text-slate-100 rounded-xl p-3 shadow-2xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center space-x-2.5">
                <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse"></span>
                <p className="text-[11px] font-bold tracking-tight">{notification.message}</p>
              </div>
              <button 
                onClick={() => setNotification(null)}
                className="text-slate-450 hover:text-white text-xs font-black px-1 transition"
              >
                ✕
              </button>
            </div>
          )}
          
          {/* ==================== 1. MEDICAL STORE TEMPLATE PREVIEW ==================== */}
          {templateId === "medical-store" && (
            <div className="font-sans text-slate-800">
              {/* Virtual Top Bar */}
              <div className={`${activeColors.bg} text-white px-3 py-1 text-center text-xs font-medium`}>
                ⚡ Emergency Lifesaving Medicines Delivered on Call: +91 99000-HEALTH
              </div>
              
              {/* Virtual Header */}
              <div className="p-3 border-b flex justify-between items-center bg-slate-50">
                <div className="flex items-center space-x-2">
                  <span className={`p-1.5 rounded-lg ${activeColors.bg} text-white`}>
                    <ShieldAlert className="h-5 w-5" />
                  </span>
                  <span className="font-bold text-gray-900 tracking-tight text-sm md:text-base">
                    {customTitle || "PharmEase Pharmacy"}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg text-slate-600 relative">
                      <ShoppingCart className="h-5 w-5" />
                      {cart.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] h-4 w-4 rounded-full flex items-center justify-center font-bold">
                          {cart.reduce((qty, item) => qty + item.quantity, 0)}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Main Banner */}
              <div className={`${activeColors.lightBg} p-4 text-center border-b`}>
                <h4 className={`text-md font-extrabold ${activeColors.text}`}>
                  Looking for Specific Salts?
                </h4>
                <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                  {customDescription || "Upload prescription to let our registered pharmacy process, verify, and pack your dosage accurately."}
                </p>
                
                {/* Simulated search */}
                <div className="mt-3 flex max-w-sm mx-auto bg-white rounded-lg border shadow-sm overflow-hidden text-xs">
                  <div className="p-2 text-slate-400 flex items-center">
                    <Search className="h-3.5 w-3.5" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Search Paracetamol, Insulin, inhalers..." 
                    disabled 
                    className="flex-1 bg-transparent border-0 outline-none p-2 text-slate-500 text-xs"
                  />
                  <button className={`${activeColors.bg} text-white px-3 font-semibold`}>Go</button>
                </div>
              </div>

              {/* Demo categories pills */}
              <div className="px-3 py-2 border-b flex gap-1.5 overflow-x-auto bg-white text-[11px] font-medium text-slate-600 scrollbar-none">
                {["all", "fever", "supplements", "first-aid"].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 rounded-full whitespace-nowrap capitalize ${activeTab === tab ? `${activeColors.bg} text-white` : "bg-gray-100 hover:bg-gray-200"}`}
                  >
                    {tab === "all" ? "All Medicines" : tab === "fever" ? "Fever & Cold" : tab === "supplements" ? "Vitamins" : "First Aid Kit"}
                  </button>
                ))}
              </div>

              {/* Dynamic Simulated Catalog */}
              <div className="p-3 grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: "p1", name: "Paracetamol 650mg", price: 1.20, category: "fever", spec: "Fever reliever, Pack of 10" },
                  { id: "p2", name: "Vitamin C Zinc Duo", price: 2.80, category: "supplements", spec: "Daily immunity booster tablets" },
                  { id: "p3", name: "Antibacterial Ointment", price: 3.49, category: "first-aid", spec: "Soothes burns & heals cuts" },
                  { id: "p4", name: "Cough Relief Syrup", price: 4.10, category: "fever", spec: "Instant throat cooling effect" }
                ]
                .filter(item => activeTab === "all" || item.category === activeTab)
                .map(med => (
                  <div key={med.id} className="border rounded-lg p-2.5 bg-white flex flex-col justify-between hover:shadow-md transition">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-slate-900 truncate pr-1">{med.name}</span>
                        <span className="text-[10px] font-mono font-bold text-slate-500">₹{med.price.toFixed(2)}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{med.spec}</p>
                    </div>
                    <button
                      onClick={() => addToCart(med.id, med.name, med.price)}
                      className={`w-full mt-2 py-1 text-[10px] font-medium rounded text-white flex items-center justify-center space-x-1 transition ${activeColors.bg} ${activeColors.hover}`}
                    >
                      <Plus className="h-3 w-3" />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Prescription Upload Portal */}
              <div className="mx-3 my-2 border border-dashed rounded-lg p-3 bg-slate-50 flex flex-col items-center">
                <Upload className={`h-6 w-6 text-slate-400 mb-1 ${isPrescriptionUploaded ? activeColors.text : "text-slate-400"}`} />
                <span className="text-[11px] font-semibold text-slate-800">Prescription Upload</span>
                <p className="text-[10px] text-slate-500 text-center mt-1">Secure end-to-end encrypted medical review</p>
                <button
                  onClick={() => {
                    setIsPrescriptionUploaded(!isPrescriptionUploaded);
                    setNotification({
                      message: !isPrescriptionUploaded ? "Prescription document uploaded and verified successfully by medical review." : "Prescription document removed.",
                      type: "success"
                    });
                  }}
                  className={`mt-2 px-3 py-1 text-[10px] font-semibold rounded shadow-sm ${isPrescriptionUploaded ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-white text-slate-700 border"}`}
                >
                  {isPrescriptionUploaded ? "✓ Verified Successfully!" : "Upload Scan"}
                </button>
              </div>

              {/* Mini Cart checkout panel */}
              {cart.length > 0 && (
                <div className="p-3 border-t bg-slate-50 mt-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-900">
                    <span>Selected ({cart.reduce((s, c) => s + c.quantity, 0)} items)</span>
                    <span>Total: ₹{getCartTotal().toFixed(2)}</span>
                  </div>
                  <button 
                    onClick={() => {
                      setNotification({
                        message: `Checkout complete! Order routed successfully. Cart Total: ₹${getCartTotal().toFixed(2)}.`,
                        type: "success"
                      });
                      setCart([]);
                    }}
                    className={`w-full mt-2 py-1.5 rounded text-white text-xs font-extrabold shadow-sm ${activeColors.bg} ${activeColors.hover}`}
                  >
                    Place Standard Order & Fast Route
                  </button>
                </div>
              )}
            </div>
          )}


          {/* ==================== 2. HOSPITAL PORTAL PREVIEW ==================== */}
          {templateId === "hospital-portal" && (
            <div className="font-sans text-slate-800">
              {/* Emergency Banner */}
              <div className="bg-red-600 text-white px-3 py-1 text-center text-[10px] font-black uppercase flex items-center justify-center space-x-1">
                <span>⚠️ Emergency Support Hotline Enabled: (080) 4410-9999</span>
              </div>

              {/* Interactive Hospital Header */}
              <div className="p-3 border-b flex justify-between items-center bg-white shadow-sm">
                <div className="flex items-center space-x-2">
                  <span className={`p-1.5 rounded-lg ${activeColors.bg} text-white`}>
                    <Calendar className="h-5 w-5" />
                  </span>
                  <div className="leading-tight">
                    <span className="font-bold text-gray-900 tracking-tight text-sm block">
                      {customTitle || "MedCare Multispeciality"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Sumit Webcraft Premium Edition</span>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setBookingStep("form");
                    setSelectedDoctor("Dr. Sumit R. (Cardiologist)");
                  }}
                  className={`px-3 py-1.5 text-xs text-white font-bold rounded-lg transition-all ${activeColors.bg} ${activeColors.hover}`}
                >
                  Book OPD Appointment
                </button>
              </div>

              {/* Department Quick Filter */}
              <div className="p-3 bg-slate-50 border-b">
                <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Explore Departments</span>
                <div className="flex gap-1 overflow-x-auto scrollbar-none pb-1">
                  {["All", "Cardiology", "Neurology", "Pediatrics"].map(dept => (
                    <button
                      key={dept}
                      onClick={() => setActiveTab(dept.toLowerCase())}
                      className={`px-2.5 py-1 text-[10px] font-semibold rounded-md ${activeTab === dept.toLowerCase() ? `${activeColors.bg} text-white` : "bg-white border text-slate-600 hover:bg-slate-100"}`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </div>

              {/* Doctor Directory List */}
              <div className="p-3">
                <span className="text-[10px] font-bold text-slate-400 block uppercase mb-2">Available Specialist Roster</span>
                
                <div className="space-y-2">
                  {[
                    { name: "Dr. Sumit Rajpoot", dept: "cardiology", rating: 5, timing: "10:00 AM - 02:00 PM", fee: 400, img: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=150&auto=format&fit=crop" },
                    { name: "Dr. Aisha Patel", dept: "neurology", rating: 4.9, timing: "01:00 PM - 05:00 PM", fee: 500, img: "https://images.unsplash.com/photo-1594824813573-246434de83fb?q=80&w=150&auto=format&fit=crop" },
                    { name: "Dr. Rohit Sharma", dept: "pediatrics", rating: 4.8, timing: "09:00 AM - 12:00 PM", fee: 350, img: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=150&auto=format&fit=crop" }
                  ]
                  .filter(doc => activeTab === "all" || doc.dept === activeTab)
                  .map((doc, idx) => (
                    <div key={idx} className="border rounded-lg p-2.5 flex items-center justify-between hover:border-slate-400 transition bg-white shadow-sm">
                      <div className="flex items-center space-x-2.5">
                        <img 
                          src={doc.img} 
                          alt={doc.name} 
                          className="h-9 w-9 rounded-full object-cover border border-slate-200" 
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <h5 className="text-xs font-bold text-slate-900">{doc.name}</h5>
                          <span className={`text-[9px] font-mono uppercase bg-slate-100 px-1.5 py-0.5 rounded text-gray-600 font-medium`}>
                            {doc.dept}
                          </span>
                          <div className="flex items-center space-x-2 text-[10px] text-slate-500 mt-0.5">
                            <span className="flex items-center text-amber-500 font-semibold">
                              <Star className="h-3 w-3 fill-amber-500 mr-0.5" />
                              {doc.rating}
                            </span>
                            <span>• Fee: ₹{doc.fee}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedDoctor(doc.name);
                          setBookingStep("form");
                        }}
                        className={`px-2 py-1 text-[10px] font-bold text-white rounded ${activeColors.bg} ${activeColors.hover}`}
                      >
                        Book Slot
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* General Hospital Stats */}
              <div className="p-3 bg-slate-50 border-t grid grid-cols-3 text-center gap-1">
                <div className="border-r">
                  <span className={`text-xs font-bold ${activeColors.text}`}>24 / 7</span>
                  <span className="text-[8px] text-slate-400 block uppercase font-mono">OPD & Trauma</span>
                </div>
                <div className="border-r">
                  <span className={`text-xs font-bold ${activeColors.text}`}>25 mins</span>
                  <span className="text-[8px] text-slate-400 block uppercase font-mono">Average Wait</span>
                </div>
                <div>
                  <span className={`text-xs font-bold ${activeColors.text}`}>100%</span>
                  <span className="text-[8px] text-slate-400 block uppercase font-mono">Care Grade</span>
                </div>
              </div>

              {/* Doctor Booking Modal Form */}
              {bookingStep === "form" && (
                <div className="p-4 bg-slate-100 border-t text-xs">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-extrabold text-slate-900">Virtual Appointment Setup</span>
                    <button onClick={() => setBookingStep("idle")} className="text-slate-500">×</button>
                  </div>
                  <p className="text-[10px] text-slate-600 mb-2">Booking diagnostic consultancy with: <strong>{selectedDoctor}</strong></p>
                  
                  <div className="space-y-1.5">
                    <div>
                      <label className="text-[9px] font-bold text-slate-500 block">PATIENT FULL NAME</label>
                      <input 
                        type="text" 
                        value={bookingName}
                        onChange={(e) => setBookingName(e.target.value)}
                        placeholder="Sumit Rajpoot"
                        className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-500 block">DESIRED DATE</label>
                      <input 
                        type="date" 
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!bookingName || !bookingDate) {
                        setNotification({
                          message: "Please fill in both the patient's name and the desired appointment date to confirm the reservation vacancy.",
                          type: "info"
                        });
                        return;
                      }
                      setBookingStep("success");
                    }}
                    className={`w-full mt-3 py-1 text-[11px] text-white font-bold rounded ${activeColors.bg} ${activeColors.hover}`}
                  >
                    Confirm Appointment Ticket
                  </button>
                </div>
              )}

              {/* Doctor Booking Appointment Success */}
              {bookingStep === "success" && (
                <div className="p-4 bg-emerald-50 border-t border-emerald-300 text-center text-xs">
                  <span className="font-bold text-emerald-800 block">✓ Appointment Securely Registered!</span>
                  <p className="text-[10px] text-emerald-600 mt-1">Patient <strong>{bookingName}</strong> is aligned for consultation with <strong>{selectedDoctor}</strong> on <strong>{bookingDate}</strong>.</p>
                  <button 
                    onClick={() => {
                      setBookingStep("idle");
                      setBookingName("");
                      setBookingDate("");
                    }} 
                    className="mt-2 text-[10px] underline font-semibold text-emerald-700"
                  >
                    Register Another Slot
                  </button>
                </div>
              )}
            </div>
          )}


          {/* ==================== 3. GARMENT SHOP TEMPLATE PREVIEW ==================== */}
          {templateId === "garment-shop" && (
            <div className="font-sans text-slate-800">
              {/* Promotion Header Bar */}
              <div className="bg-slate-900 text-white text-[10px] py-1 text-center font-semibold">
                🔥 SUMIT SUMMERCRAFT FESTIVAL: Use Code <span className="text-yellow-400 font-bold">SUMIT25</span> for 25% Off Storewide!
              </div>

              {/* Garment Store Header */}
              <div className="p-3 border-b flex justify-between items-center bg-white shadow-xs">
                <div className="flex items-center space-x-1.5">
                  <span className="font-black text-gray-900 tracking-wide text-xs md:text-sm uppercase italic">
                    {customTitle || "VogueFit Outfitters"}
                  </span>
                </div>

                <div className="flex gap-3 text-xs text-slate-500 font-medium">
                  <span className="hover:text-pink-600 cursor-pointer hidden sm:inline">Men</span>
                  <span className="hover:text-pink-600 cursor-pointer hidden sm:inline">Women</span>
                  <span className="hover:text-pink-600 cursor-pointer text-pink-600 font-semibold underline">Collections</span>
                </div>

                <button className="flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-lg text-slate-700 relative">
                  <ShoppingCart className="h-4 w-4" />
                  <span className="text-[10px] font-bold">({cart.reduce((qty, item) => qty + item.quantity, 0)})</span>
                </button>
              </div>

              {/* Gorgeous Interactive Category Tabs styled with active color gradients */}
              <div className="px-3 py-1.5 bg-slate-50 border-b flex justify-between items-center whitespace-nowrap overflow-x-auto gap-4">
                <div className="flex gap-1">
                  {["all", "hoodies", "summer", "jackets"].map(tag => (
                    <button
                      key={tag}
                      onClick={() => setActiveTab(tag)}
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase ${activeTab === tag ? `${activeColors.bg} text-white` : "bg-white border hover:bg-slate-150"}`}
                    >
                      {tag === "all" ? "BestSellers" : tag === "hoodies" ? "Hoodies" : tag === "summer" ? "Dresses" : "Jackets"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mini Catalog display */}
              <div className="p-3 grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: "g1", name: "Premium French Terry Hoodie", price: 54.00, tag: "hoodies", img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=150&auto=format&fit=crop" },
                  { id: "g2", name: "Floral Summer Cotton Dress", price: 42.00, tag: "summer", img: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=150&auto=format&fit=crop" },
                  { id: "g3", name: "Heavyweight Denim Trucker Jacket", price: 79.00, tag: "jackets", img: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=150&auto=format&fit=crop" },
                  { id: "g4", name: "Relaxed Fit Cotton T-Shirt", price: 22.00, tag: "summer", img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=150&auto=format&fit=crop" }
                ]
                .filter(item => activeTab === "all" || item.tag === activeTab)
                .map(clothing => {
                  const isInCart = cart.some(c => c.id === clothing.id);
                  return (
                    <div key={clothing.id} className="border bg-white rounded-lg overflow-hidden group hover:shadow-md transition">
                      <div className="relative bg-slate-100 h-28 flex items-center justify-center overflow-hidden">
                        <img 
                          src={clothing.img} 
                          alt={clothing.name} 
                          className="h-full w-full object-cover group-hover:scale-105 transition duration-300" 
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute top-1 right-1 bg-black text-white text-[8px] font-black uppercase px-1 rounded-sm">
                          Free Shipping
                        </span>
                      </div>
                      
                      <div className="p-2 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] text-slate-900 block font-semibold truncate leading-tight">{clothing.name}</span>
                          <span className="text-pink-600 font-bold block mt-0.5 text-[10px]">₹{clothing.price.toFixed(2)}</span>
                        </div>

                        {/* Custom visual selection tools */}
                        <div className="flex gap-1 justify-between items-center mt-1 text-[8px] text-slate-400">
                          <span className="border px-1 rounded hover:bg-slate-50 cursor-pointer font-bold">Size: {selectedSize}</span>
                          <span className={`h-2.5 w-2.5 rounded-full ${activeColors.bg}`} title="Primary Theme Color Selection"></span>
                        </div>

                        <button
                          onClick={() => addToCart(clothing.id, clothing.name, clothing.price)}
                          className={`w-full mt-1.5 py-1 text-[9px] font-extrabold uppercase tracking-wider rounded text-white flex items-center justify-center space-x-1 ${activeColors.bg} transition ${activeColors.hover}`}
                        >
                          <ShoppingCart className="h-2.5 w-2.5 mr-0.5" />
                          <span>{isInCart ? "Add Another" : "Quick Add"}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Shopping Cart Side panel panel */}
              {cart.length > 0 && (
                <div className="p-3 bg-slate-50 border-t">
                  <div className="flex justify-between items-center text-[11px] font-bold text-slate-800">
                    <span>Order Items Swatch ({cart.reduce((s, c) => s + c.quantity, 0)} Items)</span>
                    <span className="text-pink-600 font-black">₹{getCartTotal().toFixed(2)}</span>
                  </div>
                  
                  <div className="mt-2 grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => setSelectedSize(selectedSize === "M" ? "L" : selectedSize === "L" ? "XL" : "M")}
                      className="border border-slate-300 rounded bg-white py-1 text-[9px] font-semibold text-slate-700 block text-center"
                    >
                      Change Size (Active: {selectedSize})
                    </button>
                    <button
                      onClick={() => {
                        setNotification({
                          message: `Order submitted successfully for ₹${getCartTotal().toFixed(2)} with sizing format ${selectedSize}.`,
                          type: "success"
                        });
                        setCart([]);
                      }}
                      className={`rounded text-white py-1 text-[9px] font-black uppercase tracking-widest block text-center ${activeColors.bg} ${activeColors.hover}`}
                    >
                      Instant Purchase
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}


          {/* ==================== 4. RESTAURANT MENU PREVIEW ==================== */}
          {templateId === "restaurant-menu" && (
            <div className="font-sans text-slate-800 bg-amber-50/20">
              {/* Restaurant Header */}
              <div className="p-3 border-b flex justify-between items-center bg-white">
                <div className="flex items-center space-x-1">
                  <span className={`p-1.5 rounded-full ${activeColors.bg} text-white`}>
                    <Clock className="h-4 w-4" />
                  </span>
                  <div className="leading-tight">
                    <span className="font-serif font-black text-amber-970 text-xs md:text-sm block">
                      {customTitle || "FlavorBistro Elegante"}
                    </span>
                    <span className="text-[8px] text-amber-600 uppercase tracking-widest font-bold">Sumit Gastronomy</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">Open Till 11:30 PM</span>
                  <button 
                    onClick={() => {
                      setNotification({
                        message: "Table reservation successfully secured for 2 guests this Friday at 7:30 PM.",
                        type: "success"
                      });
                    }}
                    className={`px-2.5 py-1 text-[10px] text-white font-bold rounded-full ${activeColors.bg} ${activeColors.hover}`}
                  >
                    Res. Table
                  </button>
                </div>
              </div>

              {/* Culinary Categories */}
              <div className="px-3 py-1.5 bg-amber-50/50 border-b flex gap-1.5 overflow-x-auto scrollbar-none">
                {["all", "mains", "dessert", "drinks"].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setActiveTab(tag)}
                    className={`text-[9px] font-semibold px-2.5 py-0.5 rounded-full ${activeTab === tag ? `${activeColors.bg} text-white` : "bg-white border border-amber-200 text-slate-700"}`}
                  >
                    {tag === "all" ? "Interactive Menu" : tag === "mains" ? "Chef Specials" : tag === "dessert" ? "Desserts" : "Wines & Beverages"}
                  </button>
                ))}
              </div>

              {/* Menu items list */}
              <div className="p-3 space-y-1.5">
                {[
                  { name: "Sizzling Garlic noodles with Chili Crunch", price: 12.99, desc: "Hand-pulled wheat noodles, crisp shallots, microgreens & spice dry mix.", cat: "mains", tag: "Spicy • Vegan" },
                  { name: "Charred Truffle Butter Burger & Fries", price: 16.50, desc: "Aged Angus patty, melted Gouda cheese, black garlic spread on toasted brioche.", cat: "mains", tag: "Signature" },
                  { name: "Double Chocolate Lava Fudge Fondant", price: 8.99, desc: "Warm molten cocoa centre, Madagascar vanilla bean gelato scoop.", cat: "dessert", tag: "Chef Rec" },
                  { name: "Saffron Lime Mint Sparker (Non-Alc)", price: 6.00, desc: "Cold-pressed citrus, muddled peppermint, botanical extraction.", cat: "drinks", tag: "Organic" }
                ]
                .filter(dish => activeTab === "all" || dish.cat === activeTab)
                .map((dish, i) => (
                  <div key={i} className="border border-amber-100 p-2.5 rounded-lg bg-white flex justify-between items-start hover:shadow-xs transition">
                    <div className="flex-1 pr-2">
                      <div className="flex items-center space-x-1">
                        <span className="text-xs font-serif font-black text-slate-900">{dish.name}</span>
                        <span className="text-[8px] bg-amber-100 text-amber-800 px-1 rounded-sm uppercase tracking-wider font-bold shrink-0">{dish.tag}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2 leading-snug">{dish.desc}</p>
                    </div>

                    <div className="text-right shrink-0 flex flex-col items-end">
                      <span className="text-xs font-mono font-bold text-slate-800">₹{dish.price.toFixed(2)}</span>
                      <button
                        onClick={() => addToCart(dish.name, dish.name, dish.price)}
                        className={`mt-1.5 px-2 py-0.5 text-[9px] font-bold text-white rounded ${activeColors.bg} hover:scale-105 transition`}
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order summary bar */}
              {cart.length > 0 && (
                <div className="p-3 bg-white border-t border-amber-100 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">MEAL SELECTIONS</span>
                    <span className="font-bold text-slate-800">{cart.reduce((sum, item) => sum + item.quantity, 0)} Items Added</span>
                  </div>
                  <button
                    onClick={() => {
                      setNotification({
                        message: `Delicious gourmet selection complete! Your ticket for ₹${getCartTotal().toFixed(2)} is routed to the kitchen.`,
                        type: "success"
                      });
                      setCart([]);
                    }}
                    className={`px-4 py-1.5 text-xs font-bold text-white rounded-lg shadow-xs ${activeColors.bg} ${activeColors.hover}`}
                  >
                    Confirm Food Order
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
