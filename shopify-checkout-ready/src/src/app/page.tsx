"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import {
  ShoppingBag,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  Info,
  Loader2,
  Smartphone,
  Lock,
  CreditCard,
  PartyPopper,
  Sparkles
} from "lucide-react";

export default function CheckoutPage() {
  const [step, setStep] = useState<"details" | "payment" | "success">("details");
  const cartTotal = 500.00;

  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);

  // Dynamic Settings from server
  const [upiId, setUpiId] = useState("merchant@upi");
  const [merchantName, setMerchantName] = useState("YourBrand");
  const [razorpayEnabled, setRazorpayEnabled] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  });

  const [orderId, setOrderId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setValidationError("");
  };

  const handleContinueToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.firstName || !formData.phone || !formData.address) {
      setValidationError("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          originalAmount: cartTotal
        }),
      });

      const resData = await res.json();

      if (res.ok) {
        setOrderId(resData.id);
        setDiscountAmount(resData.discountAmount);
        setFinalAmount(resData.finalAmount);
        setUpiId(resData.upiId || "merchant@upi");
        setMerchantName(resData.merchantName || "Store Name");
        setRazorpayEnabled(resData.razorpayEnabled || false);
        setStep("payment");
      } else {
        setValidationError("Failed to create order. Please try again.");
      }

    } catch (error) {
      setValidationError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col font-sans selection:bg-indigo-100">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-inner">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">YourBrand</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-100">
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Secure Checkout</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col lg:flex-row gap-8 lg:gap-12">
        <div className="w-full lg:w-3/5 order-2 lg:order-1">
          <div className="flex items-center text-sm text-gray-500 mb-8 overflow-hidden whitespace-nowrap">
            <span className="text-indigo-600 font-medium">Cart</span>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            <span className={step === "details" ? "text-indigo-600 font-medium" : "text-gray-900 font-medium"}>Information</span>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            <span className={step === "payment" ? "text-indigo-600 font-medium" : "text-gray-500"}>Payment</span>
          </div>

          <AnimatePresence mode="wait">
            {step === "details" && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact & Shipping Info</h2>

                  {validationError && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2 text-sm">
                      {validationError}
                    </div>
                  )}

                  <form onSubmit={handleContinueToPayment} className="space-y-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">Contact</h3>
                      <div>
                        <input
                          type="email"
                          name="email"
                          placeholder="Email address"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-600 outline-none transition-all duration-200"
                        />
                      </div>
                    </div>

                    <div className="space-y-4 pt-6">
                      <h3 className="text-xl font-semibold text-gray-900">Delivery details</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          name="firstName"
                          placeholder="First name"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3.5 bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all duration-200 shadow-sm placeholder:text-gray-400"
                        />
                        <input
                          type="text"
                          name="lastName"
                          placeholder="Last name"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3.5 bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all duration-200 shadow-sm placeholder:text-gray-400"
                        />
                      </div>
                      <input
                        type="text"
                        name="address"
                        placeholder="Complete Address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3.5 bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all duration-200 shadow-sm placeholder:text-gray-400"
                      />
                      <div className="grid grid-cols-3 gap-4">
                        <input
                          type="text"
                          name="city"
                          placeholder="City"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="col-span-1 w-full px-4 py-3.5 bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all duration-200 shadow-sm placeholder:text-gray-400"
                        />
                        <input
                          type="text"
                          name="state"
                          placeholder="State"
                          value={formData.state}
                          onChange={handleInputChange}
                          className="col-span-1 w-full px-4 py-3.5 bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all duration-200 shadow-sm placeholder:text-gray-400"
                        />
                        <input
                          type="text"
                          name="pincode"
                          placeholder="PIN code"
                          value={formData.pincode}
                          onChange={handleInputChange}
                          className="col-span-1 w-full px-4 py-3.5 bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all duration-200 shadow-sm placeholder:text-gray-400"
                        />
                      </div>

                      <div className="relative">
                        <input
                          type="tel"
                          name="phone"
                          placeholder="Phone number"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full pl-4 pr-10 py-3.5 bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all duration-200 shadow-sm placeholder:text-gray-400"
                        />
                        <div className="absolute right-3 top-4 text-gray-400">
                          <Smartphone className="w-5 h-5" />
                        </div>
                      </div>
                    </div>

                    <div className="pt-8">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-lg rounded-xl transition-all duration-200 shadow-[0_4px_14px_0_rgb(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed group disabled:hover:translate-y-0"
                      >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Continue to Payment"}
                        {!isSubmitting && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-6 mt-8 border-t border-gray-200 pt-6">
                      <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                        <Lock className="w-4 h-4 text-emerald-600" />
                        256-bit Encryption
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                        <CreditCard className="w-4 h-4 text-indigo-600" />
                        Safe & Fast
                      </div>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {step === "payment" && orderId && (
              <PaymentSection
                finalAmount={finalAmount}
                orderId={orderId}
                upiId={upiId}
                merchantName={merchantName}
                razorpayEnabled={razorpayEnabled}
                customerPhone={formData.phone}
                customerEmail={formData.email}
                onBack={() => setStep("details")}
                onSuccess={() => setStep("success")}
              />
            )}

            {step === "success" && (
              <SuccessSection email={formData.email} orderId={orderId} />
            )}
          </AnimatePresence>
        </div>

        <div className="w-full lg:w-2/5 order-1 lg:order-2">
          <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-200 shadow-sm sticky top-24">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>

            <div className="space-y-4 mb-6 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg shrink-0 relative flex items-center justify-center overflow-hidden border border-gray-200">
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-500 text-white text-xs rounded-full flex items-center justify-center font-medium z-10 border-2 border-white">
                    1
                  </div>
                  <ShoppingBag className="w-6 h-6 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 font-medium truncate">Premium Wireless Headphones</p>
                  <p className="text-sm text-gray-500">Matte Black</p>
                </div>
                <div className="text-gray-900 font-medium">₹500.00</div>
              </div>
            </div>

            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-gray-900 font-medium">₹500.00</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-emerald-600 uppercase font-medium text-xs tracking-wider bg-emerald-50 px-2 py-1 rounded">Free</span>
              </div>

              <AnimatePresence>
                {step !== "details" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 12, delay: 0.1 }}
                    className="relative overflow-hidden flex flex-col p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 rounded-xl mt-4 mb-2 border border-emerald-100/50 shadow-sm"
                  >
                    {/* Animated Shine Effect */}
                    <motion.div
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ repeat: Infinity, duration: 2.5, ease: "linear", repeatDelay: 1 }}
                      className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-12"
                    />

                    <div className="flex justify-between items-center z-10">
                      <div className="flex flex-col">
                        <span className="flex items-center gap-1.5 text-emerald-700 font-bold text-sm">
                          <PartyPopper className="w-4 h-4 text-emerald-600 animate-bounce" />
                          UPI Offer Unlocked!
                        </span>
                        <span className="text-emerald-600/80 text-[10px] uppercase tracking-wider font-bold mt-0.5">Special System Reward</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-emerald-700 font-extrabold text-lg">- ₹{discountAmount.toFixed(2)}</span>
                        <motion.span
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                          className="flex items-center gap-1 text-[10px] font-bold text-white bg-emerald-500 px-1.5 py-0.5 rounded shadow-sm"
                        >
                          <Sparkles className="w-2.5 h-2.5" /> APPLIED
                        </motion.span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="pt-4 mt-4 border-t border-gray-200 flex justify-between items-end">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <div className="text-right">
                  <span className="text-xs text-gray-500 mr-1">INR</span>
                  <span className="text-2xl font-bold text-gray-900">
                    ₹{step === "details" ? cartTotal.toFixed(2) : finalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

function PaymentSection({
  finalAmount,
  orderId,
  upiId,
  merchantName,
  razorpayEnabled,
  customerPhone,
  customerEmail,
  onBack,
  onSuccess
}: {
  finalAmount: number,
  orderId: string,
  upiId: string,
  merchantName: string,
  razorpayEnabled: boolean,
  customerPhone: string,
  customerEmail: string,
  onBack: () => void,
  onSuccess: () => void
}) {
  const [timeLeft, setTimeLeft] = useState(600);
  const [isProcessingRzp, setIsProcessingRzp] = useState(false);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0; // Or handle expiration
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Polling for success from admin
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();
        if (data.status === 'SUCCESS') {
          clearInterval(interval);
          onSuccess();
        }
      } catch (err) { }
    }, 3000);

    return () => clearInterval(interval);
  }, [orderId, onSuccess]);


  useEffect(() => {
    if (razorpayEnabled) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);

      // Auto open after a short delay
      const t = setTimeout(() => { if (!isProcessingRzp) openRazorpay(); }, 1500);
      return () => clearTimeout(t);
    }
  }, [razorpayEnabled]);

  const openRazorpay = async () => {
    if (!(window as any).Razorpay) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    setIsProcessingRzp(true);
    try {
      const res = await fetch('/api/rzp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalAmount, receipt: `rcpt_${orderId}` })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: merchantName,
        description: "Order Checkout",
        order_id: data.id,
        prefill: {
          contact: customerPhone || "9999999999",
          email: customerEmail || "test@test.com",
          method: "upi"
        },
        handler: async function (response: any) {
          const verifyRes = await fetch('/api/rzp-verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderId
            })
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            onSuccess();
          } else {
            alert("Payment Verification Failed!");
            setIsProcessingRzp(false);
          }
        },
        theme: {
          color: "#4f46e5"
        },
        modal: {
          ondismiss: function () {
            setIsProcessingRzp(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        alert("Payment failed: " + response.error.description);
      });
      rzp.open();
    } catch (e) {
      alert("Could not initiate payment gateway.");
      setIsProcessingRzp(false);
    }
  };

  return (
    <motion.div
      key="payment"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
      className="space-y-4"
    >
      <div className="w-full max-w-md mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 font-medium transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Information
        </button>

        {/* UPI Payments Card (Matches user screenshot) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] overflow-hidden mb-4">
          <div className="p-4 sm:p-5 flex items-center justify-between border-b border-gray-50">
            <div className="flex items-center gap-3 text-gray-900 font-bold">
              <div className="w-6 h-6 rounded flex items-center justify-center">
                <img src="https://cdn.iconscout.com/icon/free/png-256/free-upi-2085056-1747946.png" className="w-full h-full object-contain opacity-80" alt="UPI" />
              </div>
              <span className="text-[17px]">UPI</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="line-through text-gray-400 text-xs sm:text-sm font-medium">₹{(finalAmount + (500 - finalAmount)).toFixed(0)}</span>
              <span className="font-extrabold text-gray-900 text-base sm:text-lg">₹{finalAmount.toFixed(0)}</span>
              <ChevronRight className="w-5 h-5 text-gray-500 -rotate-90 origin-center" />
            </div>
          </div>

          <div className="p-4 sm:p-5 pt-3">
            {/* Green Discount Banner */}
            <div className="bg-[#f0fdf4] text-[#16a34a] text-xs sm:text-sm font-bold text-center py-2.5 rounded-lg border border-[#bbf7d0] mb-5 font-sans">
              Save ₹{(500 - finalAmount).toFixed(0)} with UPI
            </div>

            {/* Horizontal Grid of 4 Apps */}
            <div className="grid grid-cols-4 gap-2 sm:gap-4">
              <button
                disabled={isProcessingRzp}
                onClick={() => razorpayEnabled ? openRazorpay() : window.location.assign(`upi://pay?pa=${upiId}&am=${finalAmount}&cu=INR&tn=Order${orderId}`)}
                className="flex flex-col items-center justify-start gap-2 p-2 px-1 border border-gray-100 rounded-xl hover:border-indigo-100 hover:shadow-md transition-all active:scale-95 bg-white shadow-sm"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center p-1">
                  <img src="https://download.logo.wine/logo/PhonePe/PhonePe-Logo.wine.png" className="w-full h-full object-contain scale-[1.3]" alt="PhonePe" />
                </div>
                <span className="text-[10px] sm:text-xs text-gray-600 font-medium text-center leading-tight">Phone pe</span>
              </button>

              <button
                disabled={isProcessingRzp}
                onClick={() => razorpayEnabled ? openRazorpay() : window.location.assign(`upi://pay?pa=${upiId}&am=${finalAmount}&cu=INR&tn=Order${orderId}`)}
                className="flex flex-col items-center justify-start gap-2 p-2 px-1 border border-gray-100 rounded-xl hover:border-indigo-100 hover:shadow-md transition-all active:scale-95 bg-white shadow-sm"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center p-2">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg" className="w-full h-full object-contain" alt="Paytm" />
                </div>
                <span className="text-[10px] sm:text-xs text-gray-600 font-medium text-center leading-tight">Paytm</span>
              </button>

              <button
                disabled={isProcessingRzp}
                onClick={() => razorpayEnabled ? openRazorpay() : window.location.assign(`upi://pay?pa=${upiId}&am=${finalAmount}&cu=INR&tn=Order${orderId}`)}
                className="flex flex-col items-center justify-start gap-2 p-2 px-1 border border-gray-100 rounded-xl hover:border-indigo-100 hover:shadow-md transition-all active:scale-95 bg-white shadow-sm"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center p-1.5">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/c/c5/Google_Pay_%28GPay%29_Logo.svg" className="w-full h-full object-contain scale-110" alt="GPay" />
                </div>
                <span className="text-[10px] sm:text-xs text-gray-600 font-medium text-center leading-tight">Gpay</span>
              </button>

              <button
                disabled={isProcessingRzp}
                onClick={() => razorpayEnabled ? openRazorpay() : window.location.assign(`upi://pay?pa=${upiId}&am=${finalAmount}&cu=INR&tn=Order${orderId}`)}
                className="flex flex-col items-center justify-start gap-2 p-2 px-1 border border-gray-100 rounded-xl hover:border-indigo-100 hover:shadow-md transition-all active:scale-95 bg-white shadow-sm"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-400 font-light text-2xl -mt-1">+</div>
                </div>
                <span className="text-[10px] sm:text-xs text-gray-600 font-medium text-center leading-tight sm:whitespace-nowrap">Add UPI ID</span>
              </button>
            </div>

            {isProcessingRzp ? (
              <div className="mt-5 pt-4 border-t border-gray-100 flex justify-center text-[#4f46e5] text-xs font-bold items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Opening Razorpay Secure Gateway...
              </div>
            ) : (
              <div className="mt-5 pt-4 border-t border-gray-100 flex justify-center text-xs text-gray-400 gap-1 items-center font-medium">
                Awaiting Confirmation... <Clock className="w-3 h-3 ml-1" /> {formatTime(timeLeft)}
              </div>
            )}
          </div>
        </div>

        {/* COD Option Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] overflow-hidden mb-6 opacity-60 cursor-not-allowed">
          <div className="p-4 sm:p-5 flex items-center justify-between">
            <div className="flex items-center gap-4 text-gray-900 font-medium">
              <div className="w-7 h-7 border border-gray-300 rounded flex items-center justify-center shrink-0">
                <span className="text-gray-400 text-xs font-bold">₹</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[15px] font-semibold text-gray-800">Cash on delivery</span>
                <span className="text-xs text-gray-500 mt-0.5">+₹50 COD charge included</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900 text-base sm:text-lg">₹{(finalAmount + 50).toFixed(0)}</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

function SuccessSection({ email, orderId }: { email: string, orderId: string | null }) {
  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: "spring" }}
      className="bg-white rounded-3xl border border-emerald-100 p-8 sm:p-10 text-center shadow-lg shadow-emerald-50/50"
    >
      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-600" />
        </motion.div>
      </div>

      <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4">Payment Successful!</h2>
      <p className="text-gray-600 mb-8 max-w-sm mx-auto text-sm sm:text-base">
        Your order <span className="font-bold text-gray-900">#{orderId?.substring(0, 6).toUpperCase()}</span> has been confirmed.
        We've sent an email with the details to <span className="font-medium text-gray-900">{email}</span>.
      </p>

      <div className="bg-gray-50 rounded-2xl p-5 sm:p-6 text-left max-w-sm mx-auto mb-8 border border-gray-100">
        <h3 className="font-semibold text-gray-900 border-b border-gray-200 pb-3 mb-3 text-sm sm:text-base">Order Updates</h3>
        <ul className="space-y-3 relative before:absolute before:inset-y-0 before:left-[11px] before:w-[2px] before:bg-gray-200">
          <li className="flex gap-4 relative">
            <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shrink-0 z-10 border-[3px] border-gray-50">
              <CheckCircle2 className="w-3 h-3 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Payment Verified ✅</p>
              <p className="text-xs text-gray-500">Just now</p>
            </div>
          </li>
          <li className="flex gap-4 relative pt-1">
            <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shrink-0 z-10 border-[3px] border-gray-50">
              <CheckCircle2 className="w-3 h-3 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Order Ready to Process</p>
              <p className="text-xs text-gray-500">Just now</p>
            </div>
          </li>
        </ul>
      </div>

      <button onClick={() => window.location.reload()} className="px-8 py-4 bg-gray-900 hover:bg-black text-white font-semibold rounded-xl transition-colors shadow-lg w-full sm:w-auto">
        Return to Store
      </button>
    </motion.div>
  );
}
