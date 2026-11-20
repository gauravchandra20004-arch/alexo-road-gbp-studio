import React from 'react';

export default function AppLogo({ className = "w-10 h-10", withText = false }) {
  return (
    <div className="flex items-center gap-3 select-none">
      <div className={`relative ${className} shrink-0`}>
        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-blue-500 rounded-2xl blur-md opacity-40 group-hover:opacity-75 transition-opacity" />
        
        {/* Crisp Vector Icon Container */}
        <div className="relative w-full h-full rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-blue-700 p-1.5 shadow-lg shadow-blue-500/25 border border-white/20 flex items-center justify-center overflow-hidden">
          {/* Subtle grid pattern inside */}
          <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:8px_8px] opacity-20" />
          
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full relative z-10">
            {/* Road Trapezoid */}
            <polygon points="36,36 64,36 78,92 22,92" fill="#1e293b" stroke="#334155" strokeWidth="2" />
            <line x1="50" y1="40" x2="50" y2="52" stroke="#facc15" strokeWidth="3" strokeLinecap="round" />
            <line x1="50" y1="58" x2="50" y2="72" stroke="#facc15" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="50" y1="78" x2="50" y2="90" stroke="#facc15" strokeWidth="4" strokeLinecap="round" />

            {/* Glowing Map Pin */}
            <path
              d="M50 14 C37 14 27 24 27 37 C27 52 50 74 50 74 C50 74 73 52 73 37 C73 24 63 14 50 14 Z"
              fill="url(#logoPinGrad)"
              stroke="#ffffff"
              strokeWidth="2.5"
            />
            {/* Lens aperture inner */}
            <circle cx="50" cy="35" r="9" fill="#ffffff" />
            <circle cx="50" cy="35" r="5" fill="#0f172a" />
            <circle cx="50" cy="35" r="2.5" fill="#38bdf8" />

            {/* Star Sparkle */}
            <path d="M74 20 Q78 20 78 16 Q78 20 82 20 Q78 20 78 24 Q78 20 74 20 Z" fill="#f59e0b" />

            <defs>
              <linearGradient id="logoPinGrad" x1="27" y1="14" x2="73" y2="74" gradientUnits="userSpaceOnUse">
                <stop stopColor="#f87171" />
                <stop offset="0.5" stopColor="#ef4444" />
                <stop offset="1" stopColor="#dc2626" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {withText && (
        <div className="flex flex-col text-left">
          {/* Main Permanent Company Name: ALEXO */}
          <div className="flex items-center gap-2">
            <span className="font-black text-lg md:text-2xl tracking-wider text-slate-950 font-sans">
              ALEXO
            </span>
            {/* Small Road Map Product Badge */}
            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide bg-blue-100 text-blue-700 border border-blue-200">
              Road Map
            </span>
          </div>
          {/* Subtitle */}
          <span className="text-[11px] font-semibold text-slate-500 tracking-normal hidden sm:inline">
            Google Business Profile &amp; Road Picture Engine
          </span>
        </div>
      )}
    </div>
  );
}
