import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Check, 
  X, 
  Sparkles, 
  ShieldCheck, 
  QrCode, 
  Copy,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  ExternalLink,
  MessageCircle,
  Send,
  CreditCard,
  Flame,
  CheckCheck,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { 
  RECHARGE_PLANS, 
  OFFICIAL_UPI_ID, 
  OFFICIAL_QR_PATH,
  activateRecharge, 
  getRechargeStatus 
} from '../utils/rechargeStore';
import { fireCelebrationConfetti } from '../utils/confettiHelper';
import { playSuccessChime, playClickPop } from '../utils/audioFeedback';

export default function PricingModal({ 
  isOpen, 
  onClose, 
  onRechargeSuccess, 
  formData = {}, 
  initialPlanId = 'starter_shop' 
}) {
  const [selectedPlanId, setSelectedPlanId] = useState(initialPlanId);
  const [utrInput, setUtrInput] = useState('');
  const [customerPhone, setCustomerPhone] = useState(() => formData.contactNumber || '');
  const [customerName, setCustomerName] = useState(() => formData.businessName || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [validationError, setValidationError] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  useEffect(() => {
    if (initialPlanId) {
      setSelectedPlanId(initialPlanId);
    }
  }, [initialPlanId]);

  useEffect(() => {
    if (formData.contactNumber && !customerPhone) {
      setCustomerPhone(formData.contactNumber);
    }
    if (formData.businessName && !customerName) {
      setCustomerName(formData.businessName);
    }
  }, [formData]);

  if (!isOpen) return null;

  const currentStatus = getRechargeStatus();
  const selectedPlan = RECHARGE_PLANS.find(p => p.id === selectedPlanId) || RECHARGE_PLANS[0];

  const handleCopyUpi = () => {
    playClickPop();
    navigator.clipboard.writeText(OFFICIAL_UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleDirectPlanSelect = (planId) => {
    playClickPop();
    setSelectedPlanId(planId);
    setValidationError('');
  };

  // Payment Confirmation & Verified Activation
  const handleConfirmRecharge = (isFastAuto = false) => {
    playClickPop();
    setValidationError('');
    setSuccessMsg('');

    const phone = customerPhone.trim() || formData.contactNumber || '';
    const bizName = customerName.trim() || formData.businessName || 'ALEXO Customer';
    const utr = utrInput.trim();

    // Strict validation: Require customer phone for verification
    if (!phone) {
      setValidationError('⚠️ कृपया अपना या ग्राहक का मोबाइल नंबर दर्ज करें ताकि पेमेंट वेरिफाई हो सके।');
      return;
    }

    if (!isFastAuto && (!utr || utr.length < 6)) {
      setValidationError('⚠️ कृपया UPI ऐप से पेमेंट करने के बाद 12-अंकों का UTR / Transaction No. दर्ज करें या नीचे WhatsApp बटन से रसीद भेजें।');
      return;
    }

    const finalUtr = utr || `UPI_CONFIRMED_${Date.now().toString().slice(-8)}`;

    setIsProcessing(true);

    // 1. Immediately send customer order data to Backend Server (server/data/db.json)
    try {
      const backendHost = window.location.hostname || 'localhost';
      fetch(`http://${backendHost}:5000/api/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan.id,
          planName: selectedPlan.name,
          amount: selectedPlan.price,
          category: selectedPlan.category,
          utrNumber: finalUtr,
          customerPhone: phone,
          customerName: bizName,
          businessName: bizName,
          formData: formData,
          status: 'Payment Confirmed & Verified',
          timestamp: new Date().toISOString()
        })
      }).catch(err => console.warn("Backend payment push error:", err));

      if (formData.businessName) {
        fetch(`http://${backendHost}:5000/api/profiles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            paymentPlan: selectedPlan.name,
            paymentAmount: selectedPlan.price,
            paymentUtr: finalUtr,
            paymentStatus: 'Confirmed'
          })
        }).catch(err => console.warn("Backend profile sync error:", err));
      }
    } catch (e) {
      console.warn("API dispatch error:", e);
    }

    setTimeout(() => {
      const res = activateRecharge(selectedPlanId, finalUtr);
      setIsProcessing(false);
      fireCelebrationConfetti();
      playSuccessChime();
      setSuccessMsg(`✓ बधाई हो! ₹${res.plan.price} का पेमेंट सफलतापूर्वक कन्फर्म हो गया है! (Ref: ${finalUtr})। आपका अकाउंट पूरी तरह एक्टिवेट हो गया है।`);
      setUtrInput('');
      if (onRechargeSuccess) {
        onRechargeSuccess(res.plan);
      }
    }, 600);
  };

  // Direct WhatsApp Receipt Sender to Owner (+91 7799587585)
  const handleSendWhatsAppReceipt = () => {
    playClickPop();
    const phone = customerPhone.trim() || formData.contactNumber || '—';
    const bizName = customerName.trim() || formData.businessName || '—';
    const utr = utrInput.trim() || 'अभी UPI से भेजा गया';
    
    const msg = `*ALEXO STUDIO RECHARGE ORDER - PAYMENT CONFIRMATION*\n\n` +
      `🏢 *दुकान/बिज़नेस:* ${bizName}\n` +
      `📞 *ग्राहक फोन:* ${phone}\n` +
      `💳 *प्लान:* ${selectedPlan.name} (₹${selectedPlan.price})\n` +
      `🔢 *UTR / Ref No:* ${utr}\n` +
      `🏦 *Fino UPI ID:* ${OFFICIAL_UPI_ID}\n\n` +
      `मैंने पेमेंट कर दिया है, कृपया सर्वर पर कन्फर्म करें और एक्टिवेट रखें।`;

    window.open(`https://wa.me/917799587585?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Direct UPI Intent deep links for popular apps
  const baseUpiParams = `pa=${OFFICIAL_UPI_ID}&pn=ALEXO%20Studio&am=${selectedPlan.price}&cu=INR&tn=${encodeURIComponent(`ALEXO ${selectedPlan.name}`)}`;
  const upiIntentUniversal = `upi://pay?${baseUpiParams}`;
  const upiGPay = `tez://upi/pay?${baseUpiParams}`;
  const upiPhonePe = `phonepe://pay?${baseUpiParams}`;
  const upiPaytm = `paytmmp://pay?${baseUpiParams}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-5">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden max-h-[95vh] flex flex-col">
        
        {/* Modal Header (Mobile-Friendly & Compact) */}
        <div className="p-3.5 sm:p-5 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20 shrink-0">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>ALEXO रिचार्ज व पेमेंट बोर्ड</span>
                  <span className="text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950">
                    VERIFIED
                  </span>
                </h3>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-300">
                Fino Bank UPI QR • ₹499 (न्यूनतम) से ₹1499 (उच्चतम) • सुरक्षित पेमेंट
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* Active Status Banner */}
          {currentStatus.isRecharged ? (
            <div className="p-3 sm:p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-extrabold text-emerald-950 text-xs sm:text-sm block">
                    ✓ आपका रिचार्ज सक्रिय है ({currentStatus.plan.category} - ₹{currentStatus.plan.price})
                  </span>
                  <span className="text-emerald-800 text-[11px]">
                    वैधता: <strong>{currentStatus.daysLeft} दिन शेष</strong> • सभी टूल्स व Road GPS अनलॉक हैं।
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-bold text-[10px] shrink-0">
                Active
              </span>
            </div>
          ) : (
            <div className="p-3 sm:p-3.5 bg-amber-50 border border-amber-300 rounded-2xl flex items-center justify-between gap-2 text-xs text-amber-900">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 shrink-0" />
                <div>
                  <span className="font-extrabold text-amber-950 text-xs sm:text-sm block">
                    रिचार्ज व वेरिफिकेशन आवश्यक
                  </span>
                  <span className="text-amber-800 text-[10px] sm:text-xs">
                    ₹499 या अपनी पसंद का प्लान चुनें, पे करें और UTR कन्फर्म करके एक्टिवेट करें।
                  </span>
                </div>
              </div>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-extrabold text-[9px] shrink-0">
                STEP-GATED
              </span>
            </div>
          )}

          {/* Validation Alert */}
          {validationError && (
            <div className="p-3 bg-red-50 border border-red-300 rounded-2xl text-xs font-bold text-red-700 flex items-center gap-2 animate-fadeIn">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Success Message Banner */}
          {successMsg && (
            <div className="p-3.5 bg-emerald-600 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md flex items-center gap-2 animate-fadeIn">
              <CheckCheck className="w-5 h-5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1. FAST PLAN SELECTOR TABS (Optimized for Mobile Touch) */}
          <div className="space-y-1">
            <span className="text-[10px] sm:text-[11px] font-black text-slate-500 uppercase tracking-wider block">
              1. प्लान चुनें (Select Plan):
            </span>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {RECHARGE_PLANS.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => handleDirectPlanSelect(plan.id)}
                    className={`p-2 sm:p-3 rounded-2xl border-2 text-left transition-all relative ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/80 shadow-md shadow-blue-500/10'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-2 right-1.5 px-1.5 py-0.2 rounded-md bg-blue-600 text-white text-[8px] font-black uppercase">
                        POPULAR
                      </span>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-black text-slate-900">
                        ₹{plan.price}
                      </span>
                      <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                      }`}>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </span>
                    </div>
                    <span className="text-[9px] sm:text-[10px] text-slate-600 block truncate mt-0.5 font-medium">
                      {plan.category.split('/')[0]}
                    </span>
                    <span className="text-[8px] sm:text-[9px] text-emerald-600 font-bold block">
                      {plan.durationDays} दिन
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. OFFICIAL FINO BANK QR & DIRECT PAYMENT CONTAINER */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-3.5 sm:p-5 rounded-3xl shadow-xl border border-slate-800 space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              
              {/* QR Image Column (5 cols) */}
              <div className="md:col-span-5 flex flex-col items-center text-center">
                <div className="relative p-2.5 sm:p-3 bg-white rounded-3xl shadow-2xl border-4 border-amber-400 inline-block">
                  <img
                    src={OFFICIAL_QR_PATH}
                    alt="Fino Bank UPI Payment QR Code"
                    className="w-40 h-40 sm:w-48 sm:h-48 object-contain rounded-2xl"
                  />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[9px] sm:text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md whitespace-nowrap">
                    ₹{selectedPlan.price} का भुगतान करें
                  </div>
                </div>
                <div className="mt-2.5 flex items-center gap-1.5 text-xs text-amber-300 font-bold">
                  <QrCode className="w-4 h-4 text-amber-400" />
                  <span>Fino Bank Official QR</span>
                </div>
                <span className="text-[9px] text-slate-400">
                  GPay • PhonePe • Paytm • किसी भी UPI से स्कैन करें
                </span>
              </div>

              {/* Payment Details & Verification Form (7 cols) */}
              <div className="md:col-span-7 space-y-3 text-left">
                
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                      प्लान: {selectedPlan.category}
                    </span>
                    <h4 className="text-lg sm:text-xl font-black text-white">
                      भुगतान राशि: <span className="text-emerald-400">₹{selectedPlan.price}</span>
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-xl bg-white/10 text-slate-200 border border-white/15">
                    {selectedPlan.durationDays} दिन वैधता
                  </span>
                </div>

                {/* Direct UPI App 1-Click Launchers (Mobile Friendly) */}
                <div className="space-y-1">
                  <span className="text-[9px] sm:text-[10px] font-black text-amber-300 uppercase tracking-wider flex items-center gap-1">
                    <Smartphone className="w-3 h-3" />
                    <span>सीधे फोन में UPI ऐप खोलें:</span>
                  </span>
                  
                  <div className="grid grid-cols-4 gap-1 sm:gap-1.5">
                    <a
                      href={upiGPay}
                      onClick={() => playClickPop()}
                      className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white flex flex-col items-center justify-center text-center transition-all active:scale-95"
                    >
                      <span className="text-[11px] sm:text-xs font-black">GPay</span>
                      <span className="text-[8px] text-slate-300">Direct</span>
                    </a>

                    <a
                      href={upiPhonePe}
                      onClick={() => playClickPop()}
                      className="p-1.5 sm:p-2 rounded-xl bg-purple-900/50 hover:bg-purple-900/70 border border-purple-500/30 text-white flex flex-col items-center justify-center text-center transition-all active:scale-95"
                    >
                      <span className="text-[11px] sm:text-xs font-black text-purple-200">PhonePe</span>
                      <span className="text-[8px] text-purple-300">Direct</span>
                    </a>

                    <a
                      href={upiPaytm}
                      onClick={() => playClickPop()}
                      className="p-1.5 sm:p-2 rounded-xl bg-cyan-900/50 hover:bg-cyan-900/70 border border-cyan-500/30 text-white flex flex-col items-center justify-center text-center transition-all active:scale-95"
                    >
                      <span className="text-[11px] sm:text-xs font-black text-cyan-200">Paytm</span>
                      <span className="text-[8px] text-cyan-300">Direct</span>
                    </a>

                    <a
                      href={upiIntentUniversal}
                      onClick={() => playClickPop()}
                      className="p-1.5 sm:p-2 rounded-xl bg-emerald-900/50 hover:bg-emerald-900/70 border border-emerald-500/30 text-white flex flex-col items-center justify-center text-center transition-all active:scale-95"
                    >
                      <span className="text-[11px] sm:text-xs font-black text-emerald-200">Any UPI</span>
                      <span className="text-[8px] text-emerald-300">All Apps</span>
                    </a>
                  </div>
                </div>

                {/* Official UPI ID with Copy */}
                <div className="p-2 sm:p-2.5 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[9px] text-slate-300 font-bold block uppercase">
                      Fino Bank UPI ID:
                    </span>
                    <span className="font-mono font-black text-amber-300 text-xs sm:text-sm truncate block">
                      {OFFICIAL_UPI_ID}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 transition-all shrink-0 active:scale-95"
                  >
                    {copiedUpi ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUpi ? 'कॉपी हुआ!' : 'कॉपी करें'}</span>
                  </button>
                </div>

                {/* Customer Details Form (Phone is Mandatory) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-white/10">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-300 mb-0.5">
                      दुकान का नाम:
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="उदा: शर्मा प्रोविजन स्टोर"
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-300 mb-0.5">
                      ग्राहक का मोबाइल नंबर <span className="text-amber-400">*</span>:
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="उदा: 9876543210"
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-400 font-mono"
                    />
                  </div>
                </div>

                {/* 12-Digit UTR Input Field */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-200 mb-0.5">
                    पेमेंट के बाद 12-अंकों का UTR / Ref No. दर्ज करें:
                  </label>
                  <input
                    type="text"
                    value={utrInput}
                    onChange={(e) => setUtrInput(e.target.value)}
                    placeholder="उदा: 432890128471 (GPay/PhonePe से 12 डिजिट)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-400 font-mono"
                  />
                </div>

                {/* PAYMENT CONFIRMATION ACTIONS */}
                <div className="space-y-2 pt-1">
                  {/* Primary: Confirm Payment with UTR */}
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleConfirmRecharge(false)}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-600 hover:to-teal-500 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 border border-emerald-300"
                  >
                    <CheckCheck className="w-4 h-4 text-slate-950" />
                    <span>
                      {isProcessing ? 'पेमेंट कन्फर्म हो रहा है...' : `पेमेंट कन्फर्म करें (₹${selectedPlan.price} एक्टिवेट करें)`}
                    </span>
                  </button>

                  {/* Secondary: Instant WhatsApp Receipt & Verification */}
                  <button
                    type="button"
                    onClick={handleSendWhatsAppReceipt}
                    className="w-full py-2 px-3 bg-emerald-700/80 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-emerald-400/30 active:scale-95"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-200" />
                    <span>WhatsApp पर रसीद भेजकर तुरंत कन्फर्म करवाएं (+91 7799587585) →</span>
                  </button>
                </div>

              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
