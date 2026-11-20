import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Camera, 
  Wand2, 
  ShieldCheck, 
  Rocket, 
  Sparkles, 
  RotateCcw, 
  Lock,
  Zap,
  QrCode,
  Menu,
  X,
  CreditCard
} from 'lucide-react';
import AppLogo from './AppLogo';

export const STEPS = [
  { id: 1, label: 'बिज़नेस जानकारी', short: 'बिज़नेस', icon: Building2 },
  { id: 2, label: 'मैप व सड़क पिन', short: 'रोड पिन', icon: MapPin },
  { id: 3, label: 'फ़ोटो व Geo-Tag', short: 'रोड फ़ोटो', icon: Camera },
  { id: 4, label: 'AI SEO विवरण', short: 'AI SEO', icon: Wand2 },
  { id: 5, label: 'वेरिफिकेशन ऑडिट', short: 'ऑडिट', icon: ShieldCheck },
  { id: 6, label: 'लॉन्च व एक्सपोर्ट', short: 'लॉन्च', icon: Rocket }
];

export default function Navbar({ 
  currentStep, 
  setStep, 
  onLoadDemo, 
  onReset, 
  onOpenFirebase, 
  onOpenAdmin,
  onOpenPricing,
  onOpenSafety,
  onOpenQrStudio,
  rechargeStatus,
  isFirebaseReady,
  safetyScore = 100
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isRecharged = rechargeStatus?.isRecharged;

  const handleMobileAction = (fn) => {
    setMobileMenuOpen(false);
    if (fn) fn();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-xs transition-all">
      <div className="max-w-6xl mx-auto px-3 sm:px-6">
        
        {/* Main Header Bar */}
        <div className="flex items-center justify-between h-14 sm:h-20 gap-2">
          
          {/* Brand Logo with AppLogo */}
          <div 
            onClick={() => { setStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="cursor-pointer group py-1 shrink-0"
          >
            <AppLogo withText={true} className="w-8 h-8 sm:w-11 sm:h-11" />
          </div>

          {/* MOBILE CONTROLS (Below md screen size) */}
          <div className="flex md:hidden items-center gap-1.5">
            {/* Direct Mobile Recharge / Payment Button */}
            <button
              onClick={onOpenPricing}
              type="button"
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-black shadow-xs transition-transform active:scale-95 ${
                isRecharged
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-amber-500/20 animate-pulse'
              }`}
              title="रिचार्ज व पेमेंट (Plans)"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{isRecharged ? 'Active' : '⚡ ₹499 पे'}</span>
            </button>

            {/* Mobile Safety Button */}
            <button
              onClick={onOpenSafety}
              type="button"
              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-300"
              title="Google Safety Shield"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{safetyScore}%</span>
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              aria-label="Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-slate-900" /> : <Menu className="w-5 h-5 text-slate-900" />}
            </button>
          </div>

          {/* DESKTOP CONTROLS (md and above) */}
          <div className="hidden md:flex items-center gap-2 sm:gap-2.5">
            
            {/* Google Safety Mode Shield Button */}
            <button
              onClick={onOpenSafety}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 shadow-xs transition-all active:scale-95"
              title="Google Safety Mode & Anti-Suspension Shield"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Safety</span>
              <span className="bg-emerald-200/80 text-emerald-900 text-[10px] px-1.5 py-0.2 rounded-md font-bold">{safetyScore}%</span>
            </button>

            {/* Post-GBP QR & Standee Suite Button */}
            <button
              onClick={onOpenQrStudio}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 shadow-xs transition-all active:scale-95"
              title="GBP पोस्ट-लॉन्च QR Code व स्टैंडी स्टूडियो"
            >
              <QrCode className="w-3.5 h-3.5 text-purple-600" />
              <span>QR टूल्स</span>
            </button>

            {/* Recharge & Price Board Pill Button */}
            <button
              onClick={onOpenPricing}
              type="button"
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black shadow-sm transition-all active:scale-95 ${
                isRecharged
                  ? 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-amber-500/20 animate-pulse'
              }`}
              title="रिचार्ज व प्राइस बोर्ड"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>
                {isRecharged 
                  ? `Active (${rechargeStatus.daysLeft}d)`
                  : '⚡ ₹499 डायरेक्ट रिचार्ज'}
              </span>
            </button>

            {/* Master Admin Vault Button */}
            <button
              onClick={onOpenAdmin}
              type="button"
              className="group relative inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-slate-900 to-slate-950 text-amber-400 hover:text-amber-300 border border-slate-800 shadow-md shadow-slate-950/20 hover:shadow-lg transition-all active:scale-95"
              title="मास्टर एडमिन बैकएंड वॉल्ट (प्राइवेट)"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>Admin</span>
            </button>

            {/* Load Demo Data Button */}
            <button
              onClick={onLoadDemo}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-blue-50/90 text-blue-700 hover:bg-blue-100 transition-all border border-blue-200/80 active:scale-95"
              title="सैंपल डेटा भरें"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>डेमो</span>
            </button>

            {/* Reset Button */}
            <button
              onClick={onReset}
              type="button"
              className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="नयी शुरुआत (Reset All)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* MOBILE SLIDE-DOWN DRAWER MENU */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 px-2 border-t border-slate-200/80 bg-white/95 backdrop-blur-xl animate-fadeIn space-y-1.5">
            <button
              onClick={() => handleMobileAction(onOpenPricing)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-black shadow-xs"
            >
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 fill-current" />
                <span>रिचार्ज व पेमेंट बोर्ड (₹499 - ₹1499)</span>
              </span>
              <span className="bg-slate-950 text-amber-400 text-[10px] px-2 py-0.5 rounded-md">
                {isRecharged ? 'Active' : 'पेमेंट करें'}
              </span>
            </button>

            <button
              onClick={() => handleMobileAction(onOpenSafety)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Google Safety Mode &amp; Shield</span>
              </span>
              <span className="font-black">{safetyScore}% Safe</span>
            </button>

            <button
              onClick={() => handleMobileAction(onOpenQrStudio)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-purple-50 text-purple-900 border border-purple-200 text-xs font-bold"
            >
              <span className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-purple-600" />
                <span>GBP पोस्ट-लॉन्च QR व काउंटर स्टैंडी</span>
              </span>
              <span className="text-[10px] text-purple-600">5-Star &amp; Maps</span>
            </button>

            <button
              onClick={() => handleMobileAction(onOpenAdmin)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900 text-amber-400 border border-slate-800 text-xs font-black"
            >
              <span className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>मास्टर एडमिन वॉल्ट (Protected)</span>
              </span>
              <span className="text-[10px] text-amber-300">डेटाबेस</span>
            </button>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => handleMobileAction(onLoadDemo)}
                className="flex-1 py-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>डेमो डेटा भरें</span>
              </button>
              <button
                onClick={() => handleMobileAction(onReset)}
                className="py-2 px-4 rounded-xl bg-red-50 text-red-600 border border-red-200 text-xs font-bold flex items-center justify-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>रीसेट</span>
              </button>
            </div>
          </div>
        )}

        {/* Step Navigation Tabs (Desktop & Tablet) */}
        <div className="hidden md:flex items-center justify-between gap-1 py-2.5 border-t border-slate-100/80">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isPast = currentStep > step.id;

              return (
                <button
                  key={step.id}
                  onClick={() => {
                    setStep(step.id);
                    window.scrollTo({ top: 380, behavior: 'smooth' });
                  }}
                  className={`group relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap select-none ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                      : isPast
                      ? 'bg-slate-100/90 text-slate-800 hover:bg-slate-200'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : isPast ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{step.id}. {step.label}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </header>
  );
}