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
  CheckCheck
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
  };

  // Fast 1-Click Recharge & Auto Activation
  const handleConfirmRecharge = (planId = selectedPlanId, isFast1Click = false) => {
    playClickPop();
    setIsProcessing(true);
    setSuccessMsg('');

    const phone = customerPhone.trim() || formData.contactNumber || 'N/A';
    const bizName = customerName.trim() || formData.businessName || 'ALEXO Customer';
    const utr = utrInput.trim() || (isFast1Click ? `FAST_UPI_${Date.now().toString().slice(-8)}` : 'Direct UPI Paid');

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
          utrNumber: utr,
          customerPhone: phone,
          customerName: bizName,
          businessName: bizName,
          formData: formData,
          fastRecharge: isFast1Click
        })
      }).catch(err => console.warn("Backend payment push error:", err));

      if (formData.businessName) {
        const backendHost = window.location.hostname || 'localhost';
        fetch(`http://${backendHost}:5000/api/profiles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            paymentPlan: selectedPlan.name,
            paymentAmount: selectedPlan.price,
            paymentUtr: utr
          })
        }).catch(err => console.warn("Backend profile sync error:", err));
      }
    } catch (e) {
      console.warn("API dispatch error:", e);
    }

    setTimeout(() => {
      const res = activateRecharge(planId, utr);
      setIsProcessing(false);
      fireCelebrationConfetti();
      playSuccessChime();
      setSuccessMsg(`✓ बधाई हो! आपका ₹${res.plan.price} का रिचार्ज तुरंत सक्रिय हो गया है! सभी टूल्स अनलॉक हैं।`);
      setUtrInput('');
      if (onRechargeSuccess) {
        onRechargeSuccess(res.plan);
      }
    }, 500);
  };

  // Direct WhatsApp Receipt Sender
  const handleSendWhatsAppReceipt = () => {
    playClickPop();
    const phone = customerPhone.trim() || formData.contactNumber || '—';
    const bizName = customerName.trim() || formData.businessName || '—';
    const utr = utrInput.trim() || 'अभी UPI से भेजा गया';
    
    const msg = `*ALEXO STUDIO RECHARGE ORDER*\n\n` +
      `🏢 *दुकान/बिज़नेस:* ${bizName}\n` +
      `📞 *फोन नंबर:* ${phone}\n` +
      `💳 *प्लान:* ${selectedPlan.name} (₹${selectedPlan.price})\n` +
      `🔢 *UTR / Ref No:* ${utr}\n` +
      `🏦 *Fino UPI ID:* ${OFFICIAL_UPI_ID}\n\n` +
      `कृपया मेरा प्रोफाइल एक्टिवेट करें और सर्वर पर रिकॉर्ड चेक करें।`;

    window.open(`https://wa.me/917799587585?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Direct UPI Intent deep links for popular apps
  const baseUpiParams = `pa=${OFFICIAL_UPI_ID}&pn=ALEXO%20Studio&am=${selectedPlan.price}&cu=INR&tn=${encodeURIComponent(`ALEXO ${selectedPlan.name}`)}`;
  const upiIntentUniversal = `upi://pay?${baseUpiParams}`;
  const upiGPay = `tez://upi/pay?${baseUpiParams}`;
  const upiPhonePe = `phonepe://pay?${baseUpiParams}`;
  const upiPaytm = `paytmmp://pay?${baseUpiParams}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden max-h-[94vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>डायरेक्ट फास्ट रिचार्ज (1-Click Quick Pay)</span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950">
                    INSTANT UNLOCK
                  </span>
                </h3>
              </div>
              <p className="text-xs text-slate-300">
                सीधे UPI ऐप से पे करें या QR स्कैन करें • ₹499 (न्यूनतम) से ₹1499 (उच्चतम)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* Active Status Banner */}
          {currentStatus.isRecharged ? (
            <div className="p-3.5 sm:p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-extrabold text-emerald-950 text-sm block">
                    ✓ आपका रिचार्ज सक्रिय है ({currentStatus.plan.category} - ₹{currentStatus.plan.price})
                  </span>
                  <span className="text-emerald-800">
                    वैधता: <strong>{currentStatus.daysLeft} दिन शेष</strong> • सभी फीचर्स व Road Map स्टैम्प अनलॉक हैं।
                  </span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-[11px] shrink-0">
                Active
              </span>
            </div>
          ) : (
            <div className="p-3.5 sm:p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-900">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <span className="font-extrabold text-amber-950 text-xs sm:text-sm block">
                    रीचार्ज आवश्यक (Instant Fast Activation)
                  </span>
                  <span className="text-amber-800 text-[11px] sm:text-xs">
                    तुरंत नीचे दिए गए किसी भी UPI ऐप (GPay, PhonePe, Paytm) से पे करें और 1-क्लिक में शुरू करें।
                  </span>
                </div>
              </div>
              <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-amber-200 text-amber-900 font-extrabold text-[10px]">
                FAST 1-CLICK
              </span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 bg-emerald-600 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md flex items-center gap-2 animate-fadeIn">
              <CheckCheck className="w-5 h-5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* FAST DIRECT PLAN SWITCHER TABS (Top Bar for instant picking) */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
              1. तुरंत प्लान चुनें (Quick Select Plan):
            </span>
            <div className="grid grid-cols-3 gap-2">
              {RECHARGE_PLANS.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => handleDirectPlanSelect(plan.id)}
                    className={`p-2.5 sm:p-3 rounded-2xl border-2 text-left transition-all relative ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/80 shadow-md shadow-blue-500/10'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-2 right-2 px-1.5 py-0.2 rounded-md bg-blue-600 text-white text-[9px] font-black uppercase">
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
                    <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                      {plan.category.split('/')[0]}
                    </span>
                    <span className="text-[9px] text-emerald-600 font-bold block">
                      {plan.durationDays} दिन वैधता
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category-Wise Detailed Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {RECHARGE_PLANS.map((plan) => {
              const isSelected = selectedPlanId === plan.id;

              return (
                <div
                  key={plan.id}
                  onClick={() => handleDirectPlanSelect(plan.id)}
                  className={`p-4 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between relative ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/30 shadow-lg shadow-blue-500/10'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Category Label */}
                    <div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-blue-700 border border-slate-200 inline-block">
                        {plan.category}
                      </span>
                      <h4 className="font-black text-xs sm:text-sm text-slate-900 pt-1">{plan.name}</h4>
                    </div>

                    {/* Price Tag */}
                    <div className="flex items-baseline gap-2 pt-1 border-t border-slate-100">
                      <span className="text-2xl sm:text-3xl font-black text-slate-950">₹{plan.price}</span>
                      <span className="text-xs text-slate-400 line-through">₹{plan.originalPrice}</span>
                      <span className="text-[10px] font-bold text-emerald-600">
                        {Math.round(((plan.originalPrice - plan.price) / plan.originalPrice) * 100)}% OFF
                      </span>
                    </div>

                    {/* Features List */}
                    <ul className="space-y-1.5 text-[11px] text-slate-600 border-t border-slate-100 pt-2.5">
                      {plan.features.slice(0, 3).map((feat, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="leading-tight">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Direct Fast Pay Button inside card */}
                  <div className="mt-4 pt-2.5 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDirectPlanSelect(plan.id);
                      }}
                      className={`w-full py-2 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                          : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
                      <span>{isSelected ? `चयनित (₹${plan.price})` : `₹${plan.price} चुनें`}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* OFFICIAL FINO BANK QR & DIRECT FAST RECHARGE ACTION BOX */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-4 sm:p-6 rounded-3xl shadow-xl border border-slate-800 space-y-5">
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              
              {/* QR Image Column (5 cols) */}
              <div className="md:col-span-5 flex flex-col items-center text-center">
                <div className="relative p-3 bg-white rounded-3xl shadow-2xl border-4 border-amber-400 inline-block">
                  <img
                    src={OFFICIAL_QR_PATH}
                    alt="Fino Bank UPI Payment QR Code"
                    className="w-44 h-44 sm:w-52 sm:h-52 object-contain rounded-2xl"
                  />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md whitespace-nowrap">
                    ₹{selectedPlan.price} का भुगतान करें
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-300 font-bold">
                  <QrCode className="w-4 h-4 text-amber-400" />
                  <span>Fino Bank Official QR</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  किसी भी UPI स्कैनर से तुरंत स्कैन करें
                </span>
              </div>

              {/* Fast Payment Launchers & Customer Activation (7 cols) */}
              <div className="md:col-span-7 space-y-3.5 text-left">
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                      चयनित प्लान: {selectedPlan.category}
                    </span>
                    <h4 className="text-xl sm:text-2xl font-black text-white">
                      भुगतान राशि: <span className="text-emerald-400">₹{selectedPlan.price}</span>
                    </h4>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-white/10 text-slate-300 border border-white/15">
                    {selectedPlan.durationDays} दिन
                  </span>
                </div>

                {/* DIRECT UPI APP 1-CLICK LAUNCH BUTTONS */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>सीधे अपने फोन के UPI ऐप से पे करें (1-Click Direct Pay):</span>
                  </span>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {/* Google Pay */}
                    <a
                      href={upiGPay}
                      onClick={() => playClickPop()}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white flex flex-col items-center justify-center text-center transition-all active:scale-95 group"
                    >
                      <span className="text-xs font-black group-hover:text-amber-300">Google Pay</span>
                      <span className="text-[9px] text-slate-300">GPay Direct</span>
                    </a>

                    {/* PhonePe */}
                    <a
                      href={upiPhonePe}
                      onClick={() => playClickPop()}
                      className="p-2 rounded-xl bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 text-white flex flex-col items-center justify-center text-center transition-all active:scale-95 group"
                    >
                      <span className="text-xs font-black text-purple-200 group-hover:text-purple-100">PhonePe</span>
                      <span className="text-[9px] text-purple-300">PhonePe Direct</span>
                    </a>

                    {/* Paytm */}
                    <a
                      href={upiPaytm}
                      onClick={() => playClickPop()}
                      className="p-2 rounded-xl bg-cyan-900/40 hover:bg-cyan-900/60 border border-cyan-500/30 text-white flex flex-col items-center justify-center text-center transition-all active:scale-95 group"
                    >
                      <span className="text-xs font-black text-cyan-200 group-hover:text-cyan-100">Paytm</span>
                      <span className="text-[9px] text-cyan-300">Paytm Direct</span>
                    </a>

                    {/* Universal BHIM/UPI */}
                    <a
                      href={upiIntentUniversal}
                      onClick={() => playClickPop()}
                      className="p-2 rounded-xl bg-emerald-900/40 hover:bg-emerald-900/60 border border-emerald-500/30 text-white flex flex-col items-center justify-center text-center transition-all active:scale-95 group"
                    >
                      <span className="text-xs font-black text-emerald-200 group-hover:text-emerald-100">All UPI</span>
                      <span className="text-[9px] text-emerald-300">Any UPI App</span>
                    </a>
                  </div>
                </div>

                {/* Official UPI ID with 1-Click Copy */}
                <div className="p-3 rounded-2xl bg-white/10 border border-white/15 space-y-1">
                  <span className="text-[10px] text-slate-300 font-bold uppercase block">
                    Official Fino Bank UPI ID:
                  </span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-black text-amber-300 text-xs sm:text-sm break-all">
                      {OFFICIAL_UPI_ID}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 transition-all shrink-0 active:scale-95"
                    >
                      {copiedUpi ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedUpi ? 'कॉपी हुआ!' : 'कॉपी करें'}</span>
                    </button>
                  </div>
                </div>

                {/* Customer Details Form */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-white/10">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-300 mb-0.5">
                      दुकान / ग्राहक का नाम:
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="उदा: शर्मा प्रोविजन स्टोर"
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-300 mb-0.5">
                      ग्राहक का फोन नंबर:
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="उदा: 9876543210"
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono"
                    />
                  </div>
                </div>

                {/* FAST 1-CLICK INSTANT ACTIVATE ACTION (Primary Fast Option) */}
                <div className="pt-1 space-y-2">
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleConfirmRecharge(selectedPlanId, true)}
                    className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-600 hover:to-teal-500 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 border border-emerald-300"
                  >
                    <Zap className="w-5 h-5 fill-current text-slate-950" />
                    <span>
                      {isProcessing ? 'सत्यापित हो रहा है...' : `⚡ 1-क्लिक तुरंत एक्टिवेट करें (Fast Unlock ₹${selectedPlan.price})`}
                    </span>
                  </button>

                  {/* Optional UTR input toggle / field */}
                  <div className="flex gap-1.5 items-center">
                    <input
                      type="text"
                      value={utrInput}
                      onChange={(e) => setUtrInput(e.target.value)}
                      placeholder="वैकल्पिक: 12-अंक UTR नंबर (यदि आपके पास है)"
                      className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-amber-400 font-mono"
                    />
                    {utrInput && (
                      <button
                        type="button"
                        onClick={() => handleConfirmRecharge(selectedPlanId, false)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shrink-0"
                      >
                        UTR सेव करें
                      </button>
                    )}
                  </div>

                  {/* Send Direct WhatsApp Confirmation Button */}
                  <button
                    type="button"
                    onClick={handleSendWhatsAppReceipt}
                    className="w-full py-2 px-3 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-emerald-400/30 active:scale-95"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-200" />
                    <span>WhatsApp पर रसीद भेजें (+91 7799587585) →</span>
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
