import React from 'react';
import { 
  MapPin, 
  Flame, 
  Smartphone, 
  ExternalLink, 
  ShieldCheck, 
  Globe, 
  Lock, 
  Sparkles, 
  ArrowUp,
  CheckCircle2,
  Database
} from 'lucide-react';
import AppLogo from './AppLogo';

export default function Footer({ onOpenFirebase, onOpenAdmin, isFirebaseReady }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gradient-to-b from-white via-slate-50/80 to-blue-50/30 text-slate-600 text-xs border-t border-slate-200/90 relative overflow-hidden">
      {/* Subtle bright ambient glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 relative z-10">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-10">
          
          {/* Brand Info (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <AppLogo withText={true} className="w-9 h-9" />
            <p className="text-slate-600 leading-relaxed text-xs max-w-sm">
              भारत के लोकल बिज़नेस के लिए खास तौर पर डिज़ाइन किया गया Google Business Profile (GBP) और Road View Assistant। सही लोकेशन, सड़क का पिन और Geo-Tagged तस्वीरें सेट करके ग्राहकों की कॉल और विज़िट्स बढ़ाएं।
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 font-semibold text-[11px] border border-emerald-200 shadow-2xs">
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" /> Android Studio: Ready (/android)
              </span>

              <button
                type="button"
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold text-[11px] border border-amber-200 shadow-2xs transition-all"
              >
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                Master Vault (Protected)
              </button>
            </div>
          </div>

          {/* Quick Links (3 cols) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-extrabold text-slate-900 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-600" /> Google Official Links
            </h4>
            <ul className="space-y-2 text-slate-600">
              <li>
                <a
                  href="https://business.google.com/create"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-blue-600 flex items-center gap-1.5 transition-colors font-medium"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" /> Google Business Profile
                </a>
              </li>
              <li>
                <a
                  href="https://support.google.com/business/answer/3038177"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-blue-600 flex items-center gap-1.5 transition-colors font-medium"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> GBP Guidelines &amp; Policies
                </a>
              </li>
              <li>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-blue-600 flex items-center gap-1.5 transition-colors font-medium"
                >
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> Google Maps Desktop
                </a>
              </li>
            </ul>
          </div>

          {/* Cloud & Master Backend (4 cols) */}
          <div className="md:col-span-4 space-y-3 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-md shadow-slate-900/5">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-900 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-amber-500" /> Master Admin Backend
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Live &amp; Secure
              </span>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed">
              काम का सारा डेटाबेस आपके कंप्यूटर में सुरक्षित है। केवल मास्टर एडमिन ऑथराइज्ड पासवर्ड से ही अनलॉक होगा।
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={onOpenAdmin}
                className="px-3.5 py-2 bg-gradient-to-r from-slate-900 to-slate-950 hover:bg-slate-800 text-amber-400 rounded-xl text-xs font-black shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" /> एडमिन बैकएंड खोलें
              </button>
              <button
                onClick={onOpenFirebase}
                className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 flex items-center gap-1.5 transition-colors active:scale-95"
              >
                <Flame className="w-3.5 h-3.5 text-amber-500" /> Firebase
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} ALEXO. All Rights Reserved. Built for Mobile &amp; Desktop.
          </div>
          <div className="flex items-center gap-3">
            <span className="font-medium text-slate-600">Vite • React 19 • Express • Capacitor Android</span>
            <button
              onClick={scrollToTop}
              className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors shadow-2xs"
              title="ऊपर जाएं"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
