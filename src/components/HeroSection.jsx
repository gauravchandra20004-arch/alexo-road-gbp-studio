import React, { useState } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Navigation, 
  Camera, 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  CheckCircle2, 
  Star, 
  Compass,
  Layers,
  Search,
  Route,
  Zap,
  Check
} from 'lucide-react';
import { playClickPop } from '../utils/audioFeedback';

const GOOGLE_TECH_FEATURES = [
  {
    id: 'dual_pin',
    tag: 'Google Maps Engine',
    title: 'Dual-Pin Road Entrance',
    desc: 'दुकान और मुख्य सड़क (Road Entrance) का अलग-अलग GPS पिन, जिससे नेविगेशन सीधे दुकान के सामने पहुंचे।',
    icon: Route,
    color: 'from-blue-500 to-indigo-600',
    border: 'border-blue-200',
    bg: 'bg-blue-50/60'
  },
  {
    id: 'road_stamp',
    tag: 'AR Geo-Tag Stamper',
    title: 'Mini Road Map & Arrow',
    desc: 'फोटो पर इनबिल्ट मिनी रोड मैप, 3D डायरेक्शन एरो (Airo) और आधिकारिक नेम प्लेट स्टैम्प।',
    icon: Camera,
    color: 'from-emerald-500 to-teal-600',
    border: 'border-emerald-200',
    bg: 'bg-emerald-50/60'
  },
  {
    id: 'gemini_seo',
    tag: 'Gemini AI Assistant',
    title: '750-Char Local SEO',
    desc: 'Google 3-Pack में टॉप रैंक करने के लिए लोकल कीवर्ड्स और कॉल-टू-एक्शन से युक्त ऑटो विवरण।',
    icon: Sparkles,
    color: 'from-purple-500 to-indigo-600',
    border: 'border-purple-200',
    bg: 'bg-purple-50/60'
  },
  {
    id: 'suspension_shield',
    tag: 'Google Policy Audit',
    title: '100% Verification Shield',
    desc: 'Google Video Verification और दिशानिर्देशों का संपूर्ण चेकअप, ताकि प्रोफाइल कभी सस्पेंड न हो।',
    icon: ShieldCheck,
    color: 'from-amber-500 to-red-600',
    border: 'border-amber-200',
    bg: 'bg-amber-50/60'
  }
];

export default function HeroSection({ 
  onStartCreating, 
  onLoadDemo, 
  onOpenAdmin,
  currentStep,
  businessName = "Chandra Auto Spares & Garage"
}) {
  const [activeFeature, setActiveFeature] = useState('dual_pin');

  return (
    <section className="relative overflow-hidden pt-4 pb-10 sm:pb-14 border-b border-slate-200/60">
      
      {/* Google 4-Color Ambient Light Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-20 left-1/6 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-10 right-1/6 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -top-10 left-1/2 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/3 w-80 h-80 bg-red-400/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Top Google Technology Pill Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/90 border border-slate-200/90 shadow-sm backdrop-blur-md">
            {/* Google 4-Color Dots */}
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#4285F4]" />
              <span className="w-2 h-2 rounded-full bg-[#EA4335]" />
              <span className="w-2 h-2 rounded-full bg-[#FBBC05]" />
              <span className="w-2 h-2 rounded-full bg-[#34A853]" />
            </div>
            <span className="text-xs font-bold text-slate-800 tracking-tight">
              Google Maps Platform &amp; Gemini Technology Powered
            </span>
            <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-wider">
              Ultra Pro
            </span>
          </div>
        </div>

        {/* Main Headline & Intro */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 tracking-tight leading-[1.2]">
            Google Maps 3-Pack में{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 bg-clip-text text-transparent">
              #1 रैंकिंग
            </span>{' '}
            और सटीक Road GPS Studio
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            ग्राहकों को दुकान के सामने लाने के लिए <strong>Dual-Pin Road Technology</strong>, तस्वीरों पर ऑटो <strong>Mini Road Map + Direction Arrow</strong> स्टैम्प, और <strong>AI 750-Char Local SEO</strong> — सब कुछ एक प्लेटफॉर्म पर।
          </p>

          {/* Action CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => { playClickPop(); onStartCreating(); }}
              type="button"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white text-sm font-bold shadow-lg shadow-blue-600/25 hover:shadow-xl transition-all flex items-center gap-2 transform active:scale-95"
            >
              <span>अभी प्रोफाइल तैयार करें</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => { playClickPop(); onLoadDemo(); }}
              type="button"
              className="px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 text-sm font-bold border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex items-center gap-2 active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>1-क्लिक डेमो लोड करें</span>
            </button>

            <button
              onClick={() => { playClickPop(); onOpenAdmin(); }}
              type="button"
              className="px-4 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-400 text-sm font-bold shadow-md shadow-slate-950/20 transition-all flex items-center gap-2 active:scale-95"
              title="मास्टर एडमिन बैकएंड वॉल्ट"
            >
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Admin Vault</span>
            </button>
          </div>
        </div>

        {/* Interactive Feature Matrix (जिसमें फीचर्स बताएं) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {GOOGLE_TECH_FEATURES.map((feat) => {
            const Icon = feat.icon;
            const isActive = activeFeature === feat.id;

            return (
              <div
                key={feat.id}
                onClick={() => { playClickPop(); setActiveFeature(feat.id); }}
                className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  isActive
                    ? 'border-blue-600 bg-white shadow-xl shadow-blue-500/10 -translate-y-1'
                    : 'border-slate-200/80 bg-white/70 hover:bg-white hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${feat.color} text-white flex items-center justify-center shadow-md`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/70">
                      {feat.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">
                      {feat.desc}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                  <span className={isActive ? 'text-blue-600' : 'text-slate-400'}>
                    {isActive ? '● लाइव एक्टिव' : 'फीचर देखें'}
                  </span>
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-300'}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Google Technology Live Simulator Card */}
        <div className="bg-slate-950 text-white rounded-3xl p-5 sm:p-7 shadow-2xl border border-slate-800 relative overflow-hidden">
          {/* Top Google Search Bar Simulation */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-5 border-b border-slate-800">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
                <Search className="w-3.5 h-3.5 text-blue-400" />
                <span>Google Maps Search: "best verified shop near me"</span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
              <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                <Zap className="w-3.5 h-3.5" /> 3-Pack Rank #1
              </span>
              <span className="text-slate-400 font-mono text-[11px]">Lat: 28.5355° N | Lng: 77.2628° E</span>
            </div>
          </div>

          {/* Interactive Simulator Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6 items-center">
            
            {/* Left: Storefront Result & Navigation HUD (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    {businessName || "Chandra Auto Spares & Garage"}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Google Business Profile Verified
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Car repair and maintenance • Mathura Road (NH-19), New Delhi
                </p>
              </div>

              {/* Live Rating & Road Arrival Route */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Google Rating</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <span className="text-xs font-black text-white">5.0 (148+)</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-blue-400 font-bold uppercase block">Road Approach Pin</span>
                  <span className="text-xs font-black text-white mt-0.5 block truncate">
                    🛣️ Main Entrance (45m)
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase block">Verification Readiness</span>
                  <span className="text-xs font-black text-emerald-400 mt-0.5 block">
                    ✓ 100% Policy Safe
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                <p className="font-semibold text-white mb-0.5">💡 Google Technology Feature Advantage:</p>
                आम तौर पर लोग मैप पिन को सिर्फ दुकान की छत पर लगाते हैं, जिससे ग्राहकों की गाड़ी दूर किसी पीछे वाली गली में रुक जाती है। ALEXO का <strong>Road Map Dual-Pin Engine</strong> मुख्य सड़क (Road Approach) का अलग पिन बनाता है, जिससे ग्राहकों को बिना भटके डायरेक्ट टर्न मिलता है।
              </div>
            </div>

            {/* Right: Live Stamped Photo Simulation (5 cols) */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 shadow-xl">
                {/* Photo Simulation */}
                <div className="h-44 sm:h-48 bg-gradient-to-tr from-slate-900 via-blue-950 to-slate-800 p-4 flex flex-col justify-between relative">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-bold text-white border border-white/10">
                      📸 STOREFRONT &amp; ROAD VIEW
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                      ● EXIF GEO-TAGGED
                    </span>
                  </div>

                  {/* Embedded Mini Road Map Inset simulation */}
                  <div className="p-3 bg-slate-950/90 backdrop-blur-md rounded-xl border border-white/15 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-black text-white block">
                        📍 {businessName.slice(0, 24)}...
                      </span>
                      <span className="text-[10px] text-yellow-300 font-mono block">
                        🛣️ Mathura Road (NH-19)
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono block">
                        GPS: 28.5355° N, 77.2625° E
                      </span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        ➜
                      </div>
                      <span className="text-[9px] font-bold text-amber-400 mt-0.5">45m</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
