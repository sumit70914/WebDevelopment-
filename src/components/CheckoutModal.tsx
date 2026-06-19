import React, { useState } from "react";
import { 
  X, 
  ShoppingBag, 
  CreditCard, 
  User, 
  Mail, 
  FileText, 
  CheckCircle, 
  ShieldCheck, 
  Clock, 
  Sparkles,
  ArrowRight
} from "lucide-react";
import { WebsiteTemplate, Order } from "../types";

interface CheckoutModalProps {
  template: WebsiteTemplate;
  onClose: () => void;
  onPurchaseComplete: (order: Order) => void;
  customerEmail?: string;
  customerName?: string;
}

export default function CheckoutModal({
  template,
  onClose,
  onPurchaseComplete,
  customerEmail = "",
  customerName = ""
}: CheckoutModalProps) {
  const [name, setName] = useState(customerName);
  const [email, setEmail] = useState(customerEmail);
  const [requirements, setRequirements] = useState("");
  const [step, setStep] = useState<"details" | "payment" | "success">("details");
  const [cardNumber, setCardNumber] = useState("4111 2222 3333 4444");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCVV, setCardCVV] = useState("729");
  const [selectedPlan, setSelectedPlan] = useState<"standard" | "plus" | "enterprise">("standard");
  const [processing, setProcessing] = useState(false);
  const [newOrder, setNewOrder] = useState<Order | null>(null);

  const getPlanMultiplier = () => {
    if (selectedPlan === "plus") return 1.4;
    if (selectedPlan === "enterprise") return 2.0;
    return 1.0;
  };

  const getPrice = () => {
    return Math.round(template.price * getPlanMultiplier());
  };

  const generateLicenseKey = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let segment = () => Array.from({length: 4}, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    return `${template.id.toUpperCase().slice(0, 5)}-${segment()}-${segment()}-SUMIT-X`;
  };

  const handleSubmitDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      return;
    }
    setStep("payment");
  };

  const handleProcessPayment = () => {
    setProcessing(true);
    setTimeout(() => {
      const generatedOrder: Order = {
        id: `SUB-${Math.floor(1000 + Math.random() * 9000)}`,
        templateId: template.id,
        templateTitle: template.title,
        customerName: name,
        customerEmail: email,
        purchaseDate: new Date().toISOString().split("T")[0],
        price: getPrice(),
        status: "requirements_review",
        licenseKey: generateLicenseKey(),
        customRequirements: requirements
      };

      setNewOrder(generatedOrder);
      onPurchaseComplete(generatedOrder);
      setProcessing(false);
      setStep("success");
    }, 1500); // realistic mock delay
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl transition-all">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
              <ShoppingBag className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-extrabold text-slate-100 text-base">Acquire Premium Website</h3>
              <p className="text-xs text-slate-400">Secure Checkout Portal</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Checkout Steps Body */}
        <div className="p-6">
          
          {/* STEP 1: CHOOSE PACKAGE & CUSTOMER DETAILS */}
          {step === "details" && (
            <form onSubmit={handleSubmitDetails} className="space-y-5">
              {/* Plan Choice Grid */}
              <div>
                <label className="text-[10px] font-black tracking-widest text-teal-400 uppercase block mb-2.5">
                  1. Select Launch Configuration Tier
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedPlan("standard")}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between h-28 ${selectedPlan === "standard" ? "border-teal-500 bg-teal-500/5 text-slate-100" : "border-slate-800 bg-slate-900 hover:border-slate-700 text-slate-400"}`}
                  >
                    <div>
                      <span className="font-bold text-xs block">Starter Pack</span>
                      <span className="text-[9px] text-slate-400 font-medium mt-0.5 line-clamp-2">Standard source files zip download.</span>
                    </div>
                    <span className="text-sm font-black text-slate-100 mt-2">₹{template.price}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPlan("plus")}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between h-28 ${selectedPlan === "plus" ? "border-teal-500 bg-teal-500/5 text-slate-100" : "border-slate-800 bg-slate-900 hover:border-slate-700 text-slate-400"}`}
                  >
                    <div>
                      <span className="font-bold text-xs flex items-center">
                        Pro Setup <Sparkles className="h-2.5 w-2.5 text-yellow-400 ml-1" />
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium mt-0.5 line-clamp-2">Includes free domain + Sumit custom setup.</span>
                    </div>
                    <span className="text-sm font-black text-slate-100 mt-2">₹{Math.round(template.price * 1.4)}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPlan("enterprise")}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between h-28 ${selectedPlan === "enterprise" ? "border-teal-500 bg-teal-500/5 text-slate-100" : "border-slate-800 bg-slate-900 hover:border-slate-700 text-slate-400"}`}
                  >
                    <div>
                      <span className="font-bold text-xs block">Enterprise Ultra</span>
                      <span className="text-[9px] text-slate-400 font-medium mt-0.5 line-clamp-2">Complete host-setup + 1 year free updates by Sumit.</span>
                    </div>
                    <span className="text-sm font-black text-slate-100 mt-2">₹{Math.round(template.price * 2.0)}</span>
                  </button>
                </div>
              </div>

              {/* Input Forms */}
              <div className="space-y-3 pt-1">
                <label className="text-[10px] font-black tracking-widest text-teal-400 uppercase block">
                  2. Contact & Delivery Email
                </label>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Full Name (e.g., Sumit Raj)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Delivery Email address"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition"
                  />
                </div>
              </div>

              {/* Requirement Text Box */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black tracking-widest text-teal-400 uppercase block">
                  3. Customize Requirements / Branding Remarks (Optional)
                </label>
                <div className="relative">
                  <div className="absolute top-2.5 left-3 text-slate-500">
                    <FileText className="h-4 w-4" />
                  </div>
                  <textarea
                    rows={2}
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    placeholder="e.g., Please change template colors to Dark Teal, change medical list values to ayurvedic medicines, host on my domain..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition resize-none"
                  />
                </div>
              </div>

              {/* Action */}
              <button
                type="submit"
                id="btn-checkout-details-next"
                className="w-full mt-4 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-slate-950 font-black text-xs uppercase tracking-widest py-3 rounded-xl shadow-lg shadow-teal-500/10 flex items-center justify-center space-x-2 transition"
              >
                <span>Proceed to Payment Verification</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {/* STEP 2: SECURE PAYMENT DEPOSIT */}
          {step === "payment" && (
            <div className="space-y-5">
              <div className="bg-slate-950 p-4 border border-slate-800 rounded-2xl flex justify-between items-center">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 block">SECURE REGISTRATION GATEWAY</span>
                  <span className="font-extrabold text-slate-100 text-lg">{template.title}</span>
                  <span className="text-xs text-slate-450 block font-mono capitalize">Config: {selectedPlan} package tier</span>
                </div>
                <div className="text-right">
                  <span className="text-teal-400 font-extrabold text-xl font-mono">₹{getPrice()}</span>
                  <span className="text-[9px] text-slate-400 block font-bold">INR</span>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <label className="text-[10px] font-black tracking-widest text-teal-400 uppercase block">
                  Secure Card Details
                </label>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-550">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="XXXX XXXX XXXX XXXX"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-slate-100 text-xs font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] text-slate-400 font-bold block mb-1 uppercase">Expiry</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400 font-bold block mb-1 uppercase">CVV Code</label>
                    <input
                      type="password"
                      value={cardCVV}
                      onChange={(e) => setCardCVV(e.target.value)}
                      placeholder="***"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="flex items-start space-x-2 p-2 bg-slate-950/40 rounded-lg border border-slate-850 text-[10px] text-slate-400 mt-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Secured via 256-bit AES SSL standard encryption. Credentials are authenticated over secure banking pipelines and deposited for contract launch.</span>
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setStep("details")}
                  className="w-1/3 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/30 text-slate-350 font-black text-xs uppercase tracking-wider py-3 rounded-xl transition"
                >
                  Back
                </button>
                <button
                  onClick={handleProcessPayment}
                  disabled={processing}
                  id="btn-confirm-payment"
                  className="w-2/3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-650 hover:to-emerald-700 text-slate-950 font-black text-xs uppercase tracking-widest py-3 rounded-xl shadow-lg shadow-teal-500/15 flex items-center justify-center space-x-2 transition disabled:opacity-50"
                >
                  {processing ? (
                    <>
                      <Clock className="h-4 w-4 animate-spin" />
                      <span>Validating Auth Gate...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>Complete Secure Payment</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: TRANSACTION SUCCESS & TICKET GENERATION */}
          {step === "success" && newOrder && (
            <div className="text-center py-4 space-y-4">
              <div className="h-14 w-14 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto animate-bounce mb-2">
                <CheckCircle className="h-8 w-8" />
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-100 tracking-tight">Purchase Authenticated!</h4>
                <p className="text-xs text-slate-400 mt-1">Your layout build package reservation has been secured successfully.</p>
              </div>

              {/* Order Receipt Details Card */}
              <div className="bg-slate-950 p-4 border border-slate-800 rounded-2xl text-left text-xs space-y-2 max-w-sm mx-auto font-mono">
                <div className="flex justify-between border-b border-slate-850 pb-2">
                  <span className="text-slate-450 uppercase text-[9px] font-bold">Transaction Reference</span>
                  <span className="text-teal-400 font-bold">{newOrder.id}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Product Option</span>
                  <span className="font-bold truncate text-slate-200">{newOrder.templateTitle}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Amount Credited</span>
                  <span className="text-teal-400">₹{newOrder.price}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Customer Email</span>
                  <span className="text-slate-200 truncate max-w-[160px]">{newOrder.customerEmail}</span>
                </div>
                <div className="pt-2 border-t border-slate-850">
                  <span className="text-[9px] text-slate-450 block uppercase font-bold tracking-wider">License Authentication Key</span>
                  <span className="text-emerald-400 font-bold block text-[10px] select-all tracking-wider mt-0.5">{newOrder.licenseKey}</span>
                </div>
              </div>

              <div className="p-3 bg-teal-900/10 border border-teal-500/20 rounded-2xl max-w-sm mx-auto text-center text-[10px] text-slate-300">
                ⭐ <strong className="text-teal-400">Account Ready:</strong> Log in with your email <span className="font-semibold text-teal-400 font-mono italic">{newOrder.customerEmail}</span> in the <strong>Customer Portal</strong> to view build states, submit custom guidelines, download code zip, or interact with Sumit directly!
              </div>

              <button
                onClick={onClose}
                className="w-full max-w-sm bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs uppercase tracking-widest py-2.5 rounded-xl transition"
              >
                Close Gateway & Return
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
