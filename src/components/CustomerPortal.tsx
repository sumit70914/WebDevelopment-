import React, { useState } from "react";
import { 
  LogIn, 
  UserPlus, 
  Mail, 
  Key, 
  User, 
  ShoppingBag, 
  Download, 
  FileEdit, 
  MessageSquare, 
  Send, 
  Clock, 
  CheckCircle,
  HelpCircle,
  ExternalLink,
  Cpu
} from "lucide-react";
import { Order, SupportMessage } from "../types";
import { auth } from "../firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from "firebase/auth";

interface CustomerPortalProps {
  orders: Order[];
  messages: SupportMessage[];
  onSubmitCustomRequirements: (orderId: string, requirements: string) => void;
  onSendMessage: (customerEmail: string, customerName: string, message: string) => void;
  onLogoutCustomer: () => void;
  loggedInEmail: string | null;
  onLoginCustomer: (email: string, name: string) => void;
  adminEmail: string;
  adminPasswordHash: string;
  onNavigateToAdmin?: () => void;
}

export default function CustomerPortal({
  orders,
  messages,
  onSubmitCustomRequirements,
  onSendMessage,
  onLogoutCustomer,
  loggedInEmail,
  onLoginCustomer,
  adminEmail,
  adminPasswordHash,
  onNavigateToAdmin
}: CustomerPortalProps) {
  // Tabs & Forms
  const [isRegister, setIsRegister] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [activeTab, setActiveTab] = useState<"purchases" | "requests" | "chat">("purchases");
  
  // Customization Form
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [editReqText, setEditReqText] = useState("");
  const [saveReqSuccess, setSaveReqSuccess] = useState(false);

  // Chat message input
  const [chatText, setChatText] = useState("");

  // Firebase integration helper states
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [downloadingZipName, setDownloadingZipName] = useState<string | null>(null);

  // Handle genuine Firebase Auth or local fallback bypass
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailInput.trim().toLowerCase();
    const name = nameInput.trim();
    const password = passwordInput;

    if (!email) return;

    setLoading(true);
    setAuthError(null);

    // Safeguard reserved admin/owner email registration
    if (isRegister) {
      if (email === adminEmail.toLowerCase()) {
        setAuthError("This is a reserved administrator email address. Please proceed to log in instead of registering.");
        setLoading(false);
        return;
      }

      if (!name) {
        setAuthError("Please specify a user registration display name.");
        setLoading(false);
        return;
      }
      
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Success! Let's update display list profile
        await updateProfile(userCredential.user, { displayName: name });
        onLoginCustomer(email, name);
      } catch (err: any) {
        console.error("Firebase SignUp error:", err);
        let friendlyMessage = err.message;
        if (err.code === "auth/email-already-in-use") {
          friendlyMessage = "This email address is already registered. Try logging in instead.";
        } else if (err.code === "auth/weak-password") {
          friendlyMessage = "Standard password security requires at least 6 characters.";
        } else if (err.code === "auth/operation-not-allowed") {
          friendlyMessage = "Email/Password sign-ins are currently disabled on your project auth.";
        }
        
        setAuthError(friendlyMessage);
      } finally {
        setLoading(false);
      }
    } else {
      // 1. Check if it's the reserved admin email
      if (email === adminEmail.toLowerCase()) {
        if (password === adminPasswordHash) {
          onLoginCustomer(adminEmail, "Administrator");
          setLoading(false);
          return;
        } else {
          setAuthError("Invalid administrative credentials. If you are the owner, please check your secret master password key.");
          setLoading(false);
          return;
        }
      }

      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const displayName = userCredential.user.displayName || "Client User";
        const pastOrder = orders.find(o => o.customerEmail.toLowerCase() === email);
        const finalName = pastOrder ? pastOrder.customerName : displayName;
        onLoginCustomer(email, finalName);
      } catch (err: any) {
        console.error("Firebase Login error:", err);
        let friendlyMessage = err.message;
        if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
          friendlyMessage = "Invalid credentials. Please verify your email & password values.";
        } else if (err.code === "auth/operation-not-allowed") {
          friendlyMessage = "Email/Password auth is currently disabled in your cloud project.";
        }
        
        setAuthError(friendlyMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  // Get active user details
  const myOrders = orders.filter(o => o.customerEmail.toLowerCase() === loggedInEmail?.toLowerCase());
  const myName = myOrders.length > 0 ? myOrders[0].customerName : "Client";
  const myMessages = messages.filter(m => m.customerEmail.toLowerCase() === loggedInEmail?.toLowerCase());

  const handleSaveRequirements = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) {
      return;
    }
    onSubmitCustomRequirements(selectedOrderId, editReqText);
    setSaveReqSuccess(true);
    setTimeout(() => {
      setSaveReqSuccess(false);
    }, 3000);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatText.trim()) return;
    onSendMessage(loggedInEmail || "client@anonymous.com", myName, chatText.trim());
    setChatText("");
  };

  const handleDownloadZipSimulate = (title: string) => {
    setDownloadingZipName(title);
    setTimeout(() => {
      setDownloadingZipName(null);
    }, 2800);
  };

  // Render Login Layout if not authorized
  if (!loggedInEmail) {
    return (
      <div className="w-full max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
        <div className="text-center space-y-2 mb-6">
          <div className="h-12 w-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mx-auto border border-teal-500/20">
            <Cpu className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-100 tracking-tight">
            {isRegister ? "Launch Client Account" : "Access Customer Portal"}
          </h3>
          <p className="text-xs text-slate-400">
            {isRegister 
              ? "Register to receive custom domain configurations & order license logs." 
              : "Review downloads, track build status, or message Sumit Rajpoot."
            }
          </p>
        </div>

        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {authError && (
            <div className="bg-red-950/40 border border-red-500/10 text-red-300 rounded-xl p-3.5 text-[11px] leading-relaxed select-none">
              <p className="font-extrabold text-red-200 uppercase tracking-wider text-[9px] mb-1">Security Authentication Notice</p>
              <p>{authError}</p>
            </div>
          )}

          {isRegister && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-550">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Sumit Rajpoot"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 transition"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-550">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="customer@yourdomain.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Secure Alphanumeric Entry Password</span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-550">
                <Key className="h-4 w-4" />
              </div>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            id="btn-customer-auth-submit"
            className="w-full mt-4 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-slate-950 font-black text-xs uppercase tracking-widest py-3 rounded-xl shadow-lg transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Clock className="h-4 w-4 animate-spin text-slate-950" />
                <span>Contacting Firebase Auth server...</span>
              </>
            ) : (
              <span>{isRegister ? "Complete Account Signup" : "Validate Portal Credentials"}</span>
            )}
          </button>
        </form>

        <div className="text-center mt-5 pt-4 border-t border-slate-800 text-xs text-slate-400 flex flex-col space-y-2.5">
          {isRegister ? (
            <span>
              Already purchased a website?{" "}
              <button 
                onClick={() => {
                  setIsRegister(false);
                  setAuthError(null);
                }} 
                className="text-teal-400 hover:underline font-bold"
              >
                Access Account
              </button>
            </span>
          ) : (
            <span>
              New client?{" "}
              <button 
                onClick={() => {
                  setIsRegister(true);
                  setAuthError(null);
                }} 
                className="text-teal-450 hover:underline font-bold"
              >
                Launch Account
              </button>
              <p className="text-[10px] text-slate-500 mt-1">Authenticate utilizing verified registration credentials.</p>
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-900 border border-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[500px]">
      
      {/* Side Menu Navigation */}
      <div className="w-full md:w-64 bg-slate-950 p-6 border-r border-slate-850 flex flex-col justify-between">
        <div className="space-y-6">
          {/* User Bio */}
          <div>
            <span className="text-[10px] font-black tracking-widest text-teal-400 uppercase block mb-1">Authenticated Client</span>
            <h4 className="font-extrabold text-slate-100 text-base flex items-center tracking-tight truncate">{myName}</h4>
            <span className="text-[10px] text-slate-400 font-mono block truncate">{loggedInEmail}</span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("purchases")}
              id="tab-client-purchases"
              className={`w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-bold rounded-xl transition ${activeTab === "purchases" ? "bg-teal-500/10 text-teal-400" : "text-slate-400 hover:text-slate-200"}`}
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Purchased Web Packages</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("requests");
                if (myOrders.length > 0) {
                  setSelectedOrderId(myOrders[0].id);
                  setEditReqText(myOrders[0].customRequirements || "");
                }
              }}
              id="tab-client-requests"
              className={`w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-bold rounded-xl transition ${activeTab === "requests" ? "bg-teal-500/10 text-teal-400" : "text-slate-400 hover:text-slate-200"}`}
            >
              <FileEdit className="h-4 w-4" />
              <span>Submit Adjustments</span>
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              id="tab-client-chat"
              className={`w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-bold rounded-xl transition ${activeTab === "chat" ? "bg-teal-500/10 text-teal-400" : "text-slate-400 hover:text-slate-200"}`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Message Sumit ({myMessages.length})</span>
            </button>
          </nav>
        </div>

        {/* Logout */}
        <div className="pt-6 border-t border-slate-850 mt-6">
          <button
            onClick={onLogoutCustomer}
            className="w-full py-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/5 text-xs font-bold border border-slate-800 hover:border-red-500/20 text-center transition"
          >
            Sign Out of Portal
          </button>
        </div>
      </div>

      {/* Main Dashboard Panel Workspace */}
      <div className="flex-1 p-6 md:p-8">
        {loggedInEmail?.toLowerCase() === adminEmail.toLowerCase() && (
          <div className="bg-gradient-to-r from-teal-500/15 via-emerald-500/10 to-transparent border border-teal-500/30 p-5 rounded-2xl mb-6 space-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center space-x-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
              <p className="text-[10px] uppercase font-black tracking-widest text-teal-300 font-mono">
                Administrator Mode Unsealed
              </p>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Greetings <strong className="text-white font-extrabold">Sumit</strong>! You have successfully logged in with the official administration key (<strong className="text-white select-all font-mono">{adminEmail}</strong>). The hidden control panel and command cockpit are now unsealed and accessible.
            </p>
            {onNavigateToAdmin && (
              <div className="pt-1.5">
                <button
                  type="button"
                  id="btn-admin-auto-unseal-go"
                  onClick={onNavigateToAdmin}
                  className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider px-4 py-2 rounded-xl transition duration-300 shadow-md flex items-center gap-1.5"
                >
                  <Cpu className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '3s' }} />
                  <span>Enter Command Cockpit</span>
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* TAB 1: PURCHASABLE PACKS AND DOWNLOADS */}
        {activeTab === "purchases" && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-black text-slate-100 tracking-tight">My Active Digital Ownership</h4>
              <p className="text-xs text-slate-400">View code templates, license keys, and current launch setups by Sumit.</p>
            </div>

            {myOrders.length === 0 ? (
              <div className="border border-dashed border-slate-800 p-8 rounded-2xl text-center space-y-3">
                <ShoppingBag className="h-8 w-8 text-slate-500 mx-auto" />
                <h5 className="font-bold text-slate-300 text-sm">No Purchased Templates Detected</h5>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  If you recently bought a package, make sure you logged in with the matching email address.
                </p>
                <div className="pt-2 text-xs">
                  💡 <span className="text-teal-400">Demo Tip:</span> Go to the catalog, purchase a template with a mock card, and it will list here immediately!
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {myOrders.map(ord => (
                  <div key={ord.id} className="bg-slate-950 border border-slate-850 rounded-2xl p-5 hover:border-slate-800 transition">
                    <div className="flex flex-wrap justify-between items-start gap-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs uppercase bg-teal-500/10 text-teal-400 font-extrabold px-2 py-0.5 rounded font-mono">
                            {ord.id}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">{ord.purchaseDate}</span>
                        </div>
                        <h5 className="text-base font-black text-slate-100 mt-1.5">{ord.templateTitle}</h5>
                      </div>

                      {/* Build Status Indicator */}
                      <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-xs">
                        <span className={`h-2.5 w-2.5 rounded-full ${
                          ord.status === "delivered" ? "bg-emerald-500" :
                          ord.status === "in_development" ? "bg-amber-500 animate-pulse" :
                          "bg-blue-500"
                        }`}></span>
                        <span className="capitalize text-slate-300 font-semibold text-[11px]">
                          {ord.status === "delivered" ? "Deployed Live" :
                           ord.status === "in_development" ? "Sumit Customizing Code" :
                           "Analyzing Requirements"}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-850 rounded-xl p-3.5 mt-4 text-xs font-mono space-y-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between text-slate-400">
                        <span>Authentication license:</span>
                        <span className="text-teal-400 font-bold tracking-wider select-all">{ord.licenseKey}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between text-slate-400">
                        <span>Capital investment:</span>
                        <span className="font-bold text-slate-200">₹{ord.price} INR</span>
                      </div>
                    </div>

                    {ord.customRequirements && (
                      <div className="mt-3.5 p-3.5 bg-slate-900 border border-slate-850 rounded-xl text-xs text-slate-400 leading-relaxed">
                        <strong className="text-slate-300 text-[10px] uppercase font-bold block mb-1">Your Customize Guidelines:</strong>
                        <p className="italic">"{ord.customRequirements}"</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-850/50">
                      <button
                        onClick={() => handleDownloadZipSimulate(ord.templateTitle)}
                        disabled={downloadingZipName !== null}
                        className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-200 flex items-center space-x-1.5 transition disabled:opacity-50"
                      >
                        {downloadingZipName === ord.templateTitle ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping"></span>
                            <span className="animate-pulse">Packaging sources...</span>
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 text-teal-400" />
                            <span>Source Download (.zip)</span>
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => {
                          setActiveTab("requests");
                          setSelectedOrderId(ord.id);
                          setEditReqText(ord.customRequirements || "");
                        }}
                        className="bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 flex items-center space-x-1.5 transition"
                      >
                        <FileEdit className="h-4 w-4" />
                        <span>Update Custom Ask</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: EDIT CUSTOM REQUIREMENTS */}
        {activeTab === "requests" && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-black text-slate-100 tracking-tight">Direct Adjustments Portal</h4>
              <p className="text-xs text-slate-400">Sumit incorporates customized specifications directly. Edit your active template's notes.</p>
            </div>

            {myOrders.length === 0 ? (
              <div className="border border-dashed border-slate-800 p-8 rounded-2xl text-center space-y-3">
                <FileEdit className="h-8 w-8 text-slate-500 mx-auto" />
                <h5 className="font-bold text-slate-300 text-sm">No Website Templates Owned</h5>
                <p className="text-xs text-slate-400">Purchase a template to load the adjust options.</p>
              </div>
            ) : (
              <form onSubmit={handleSaveRequirements} className="space-y-4 max-w-xl">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Choose Web Package</label>
                  <select
                    value={selectedOrderId}
                    onChange={(e) => {
                      setSelectedOrderId(e.target.value);
                      const selected = myOrders.find(o => o.id === e.target.value);
                      setEditReqText(selected?.customRequirements || "");
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                  >
                    {myOrders.map(ord => (
                      <option key={ord.id} value={ord.id}>
                        {ord.templateTitle} ({ord.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Branding Specifications</label>
                  <p className="text-[11px] text-slate-400">Describe fonts, logo references, menu adjustments, colors, or emergency contact fields.</p>
                  <textarea
                    rows={6}
                    required
                    value={editReqText}
                    onChange={(e) => setEditReqText(e.target.value)}
                    placeholder="e.g., Change default Hospital doctor layout cards to include specific profile photos, change text fonts to high contrast serif, list our direct operational timeline..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-teal-500 resize-none font-sans"
                  />
                </div>

                {saveReqSuccess && (
                  <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Your customization data has been transmitted securely! Sumit will evaluate and update project states.</span>
                  </div>
                )}

                <button
                  type="submit"
                  id="btn-customer-save-requirements"
                  className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:bg-emerald-700 text-slate-950 font-black text-xs uppercase tracking-widest px-6 py-2.5 rounded-xl transition"
                >
                  Deliver Adjustments Text
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 3: CLIENT TO ADMIN SECURE MESSAGING */}
        {activeTab === "chat" && (
          <div className="space-y-4 flex flex-col h-[400px]">
            <div>
              <h4 className="text-base font-black text-slate-100 tracking-tight">Direct Conversation with Sumit</h4>
              <p className="text-[11px] text-slate-400">Ask deployment setup criteria, server credentials, or support questions.</p>
            </div>

            {/* Scrollable message box */}
            <div className="flex-1 bg-slate-950 border border-slate-850 rounded-2xl p-4 overflow-y-auto space-y-3.5">
              {myMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                  <MessageSquare className="h-8 w-8 text-slate-650" />
                  <p className="text-xs text-slate-400">No support transcripts recorded yet.</p>
                  <p className="text-[10px] text-slate-500">Send an initial request to start compiling setup answers directly with Sumit.</p>
                </div>
              ) : (
                myMessages.map(msg => (
                  <div 
                    key={msg.id} 
                    className={`flex flex-col max-w-[80%] ${msg.sender === "customer" ? "ml-auto items-end" : "mr-auto items-start"}`}
                  >
                    <span className="text-[9px] text-slate-450 font-bold mb-0.5 uppercase">
                      {msg.sender === "customer" ? myName : "Sumit Rajpoot (Lead)"}
                    </span>
                    <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === "customer" 
                        ? "bg-teal-500 text-slate-950 font-medium rounded-tr-none" 
                        : "bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700"
                    }`}>
                      {msg.message}
                    </div>
                    <span className="text-[8px] text-slate-500 font-mono mt-0.5">{msg.timestamp}</span>
                  </div>
                ))
              )}
            </div>

            {/* Send Message Form */}
            <form onSubmit={handleSendChat} className="flex gap-2">
              <input
                type="text"
                required
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                placeholder="Type your message about custom features, domains, or timeline..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-teal-500 transition"
              />
              <button
                type="submit"
                id="btn-customer-send-chat"
                className="bg-teal-500 hover:bg-teal-600 text-slate-950 p-2.5 rounded-xl transition"
                title="Send secure message"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
