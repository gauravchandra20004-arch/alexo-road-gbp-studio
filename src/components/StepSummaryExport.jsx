import React, { useState, useEffect, useRef } from 'react';
import { 
  ExternalLink, 
  Copy, 
  Check, 
  Download, 
  Printer, 
  CheckCircle, 
  MapPin, 
  Phone, 
  Building, 
  Sparkles,
  Share2,
  QrCode,
  UploadCloud,
  MessageCircle,
  Star,
  Navigation,
  Palette
} from 'lucide-react';
import QRCode from 'qrcode';
import { fireCelebrationConfetti } from '../utils/confettiHelper';
import { playSuccessChime, playClickPop } from '../utils/audioFeedback';
import PostGbpQrStudio from './PostGbpQrStudio';

export default function StepSummaryExport({ formData, onPrev, onReset, onImportJson, isRecharged, onOpenPricing }) {
  const [copiedAll, setCopiedAll] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [showPostQrStudio, setShowPostQrStudio] = useState(false);
  const fileInputRef = useRef(null);

  const googleCreateUrl = `https://business.google.com/create?fp_name=${encodeURIComponent(formData.businessName || '')}`;
  const googleMapsUrl = `https://www.google.com/maps?q=${formData.latitude},${formData.longitude}`;

  // Fire celebratory JavaScript confetti when arriving at step 6!
  useEffect(() => {
    fireCelebrationConfetti();
    playSuccessChime();
  }, []);

  // Generate dynamic QR Code for Google Maps Link
  useEffect(() => {
    QRCode.toDataURL(googleMapsUrl, {
      width: 280,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error("QR Code error:", err));
  }, [googleMapsUrl]);

  const handleCopyAll = () => {
    playClickPop();
    const summaryText = `
=== GOOGLE BUSINESS PROFILE (GBP) SETUP PACK ===
Business Name: ${formData.businessName}
Category: ${formData.primaryCategory} (Secondary: ${formData.secondaryCategory || 'N/A'})
Phone: ${formData.contactNumber}
Email: ${formData.email || 'N/A'}
Website: ${formData.website || 'N/A'}
Address: ${formData.addressLine1}, ${formData.city}, ${formData.pincode}
Road/Entrance: ${formData.roadName || 'Main Road'}
Shop GPS Pin: ${formData.latitude}, ${formData.longitude}
Road Entrance Pin: ${formData.roadEntranceLat}, ${formData.roadEntranceLng}

Working Hours: ${formData.openingTime} - ${formData.closingTime} (${(formData.openDays || []).join(', ')})
Services: ${(formData.services || []).join(', ')}

--- SEO DESCRIPTION (750 chars) ---
${formData.seoDescription}
    `.trim();

    navigator.clipboard.writeText(summaryText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleDownloadJSON = () => {
    playClickPop();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(formData, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `${(formData.businessName || 'gbp_profile').replace(/\s+/g, '_')}_data.json`);
    dlAnchorElem.click();
  };

  // WhatsApp 1-Click Sharing (JavaScript API)
  const handleWhatsAppShare = () => {
    playClickPop();
    const message = `*Google Business Profile Details*\n\n` +
      `🏢 *Business:* ${formData.businessName || 'My Business'}\n` +
      `📍 *Address:* ${formData.addressLine1}, ${formData.city}\n` +
      `🛣️ *Road:* ${formData.roadName || 'Main Road'}\n` +
      `📞 *Phone:* ${formData.contactNumber}\n` +
      `🗺️ *Google Maps Link:* ${googleMapsUrl}\n\n` +
      `_Generated with ALEXO Road Map Studio_`;
    
    const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  // JSON File Import Handler
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (onImportJson) {
          onImportJson(parsed);
          alert("JSON प्रोफाइल सफलतापूर्वक लोड हो गई!");
        }
      } catch {
        alert("अमान्य JSON फ़ाइल!");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with celebratory gradient */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 text-white p-6 sm:p-7 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md text-xs font-bold rounded-full mb-2">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> प्रोफाइल 100% तैयार है!
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              {formData.businessName || 'आपकी Google Business Profile'}
            </h2>
            <p className="text-blue-100 text-sm mt-1 max-w-xl">
              सड़क की लोकेशन, Geo-Tagged तस्वीरें, और SEO विवरण तैयार हैं। Google पर लाइव करें या क्लाइंट को भेजें।
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href={isRecharged ? googleCreateUrl : "#"}
              target={isRecharged ? "_blank" : "_self"}
              rel="noopener noreferrer"
              onClick={(e) => {
                if (!isRecharged) {
                  e.preventDefault();
                  alert("⚠️ कृपया ध्यान दें: Google Business Profile लॉन्च और एक्सपोर्ट करने के लिए रिचार्ज आवश्यक है!");
                  if (onOpenPricing) onOpenPricing();
                  return;
                }
                fireCelebrationConfetti();
              }}
              className="px-5 py-3.5 bg-white hover:bg-blue-50 text-blue-700 rounded-2xl font-black text-sm shadow-lg shadow-black/10 transition-all flex items-center gap-2 transform active:scale-95"
            >
              <ExternalLink className="w-4 h-4" />
              {isRecharged ? 'Google पर प्रोफाइल बनाएं' : 'रिचार्ज करके प्रोफाइल बनाएं 🔒'}
            </a>
          </div>
        </div>
      </div>

      {/* GBP Post-Launch QR Suite Section (GBP बनने के बाद के लिए) */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-6 rounded-3xl border border-blue-800/40 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 uppercase tracking-wider">
                GBP बनने के बाद का स्पेशल टूल
              </span>
              <span className="text-xs text-blue-300 font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> 100% Free &amp; Ready
              </span>
            </div>
            <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <QrCode className="w-5 h-5 text-amber-400" />
              दुकान काउंटर स्टैंडी व Google 5-Star Review QR कोड
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Google Business Profile अप्रूव होने के बाद ग्राहकों से 5-Star रिव्यू लेने और सड़क से सीधी दिशा (Navigation) दिखाने के लिए रेडी-टू-प्रिंट QR स्टैंडी कार्ड डाउनलोड करें।
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-2.5">
            <button
              type="button"
              onClick={() => { playClickPop(); setShowPostQrStudio(true); }}
              className="w-full sm:w-auto px-5 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 rounded-2xl font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Palette className="w-4 h-4" />
              <span>QR कोड व काउंटर स्टैंडी बनाएं →</span>
            </button>
          </div>
        </div>

        {/* 3 Interactive Quick Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/10">
          <div 
            onClick={() => { playClickPop(); setShowPostQrStudio(true); }}
            className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition-all group"
          >
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs mb-1">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>1. Google 5-Star QR</span>
            </div>
            <p className="text-[11px] text-slate-300">
              ग्राहक स्कैन करते ही सीधे आपकी प्रोफाइल के "Write Review" पेज पर पहुंचेगा।
            </p>
          </div>

          <div 
            onClick={() => { playClickPop(); setShowPostQrStudio(true); }}
            className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition-all group"
          >
            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs mb-1">
              <Navigation className="w-4 h-4 fill-blue-400" />
              <span>2. Road Navigation QR</span>
            </div>
            <p className="text-[11px] text-slate-300">
              सड़क मोड़ और दुकान के GPS पिन तक टर्न-बाय-टर्न ड्राइविंग रास्ता खोलेगा।
            </p>
          </div>

          <div 
            onClick={() => { playClickPop(); setShowPostQrStudio(true); }}
            className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition-all group"
          >
            <div className="flex items-center gap-2 text-purple-400 font-bold text-xs mb-1">
              <Printer className="w-4 h-4" />
              <span>3. A5 प्रिंटेबल स्टैंडी</span>
            </div>
            <p className="text-[11px] text-slate-300">
              दुकान के काउंटर या टेबल पर रखने के लिए खूबसूरत 3 थीम में तैयार पोस्टर।
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons Toolbar with JS interactive tools */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
        <button
          onClick={handleCopyAll}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 active:scale-95"
        >
          {copiedAll ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          {copiedAll ? 'पूरा डेटा कॉपी हो गया!' : 'सारा डेटा कॉपी करें'}
        </button>

        <button
          onClick={() => { playClickPop(); setShowPostQrStudio(true); }}
          className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-black rounded-xl border border-amber-300 transition-all flex items-center gap-1.5 active:scale-95 shadow-xs"
        >
          <Palette className="w-4 h-4" /> 5-Star QR व स्टैंडी कार्ड
        </button>

        <button
          onClick={handleWhatsAppShare}
          className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 transition-all flex items-center gap-1.5 active:scale-95"
        >
          <MessageCircle className="w-4 h-4 text-emerald-600" /> WhatsApp पर शेयर करें
        </button>

        <button
          onClick={() => { playClickPop(); setShowQrModal(true); }}
          className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 transition-all flex items-center gap-1.5 active:scale-95"
        >
          <QrCode className="w-4 h-4 text-blue-600" /> Google Maps QR Code
        </button>

        <button
          onClick={handleDownloadJSON}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
        >
          <Download className="w-4 h-4" /> JSON डाउनलोड
        </button>

        <label className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer">
          <UploadCloud className="w-4 h-4" /> JSON फ़ाइल लोड करें
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleFileUpload}
          />
        </label>

        <button
          onClick={() => { playClickPop(); window.print(); }}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 ml-auto"
        >
          <Printer className="w-4 h-4" /> प्रिंट / PDF
        </button>
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Identity & Timings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
            <Building className="w-4 h-4 text-blue-600" /> बिज़नेस विवरण
          </h3>
          <div className="text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Business Name:</span>
              <span className="font-bold text-slate-800">{formData.businessName || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Primary Category:</span>
              <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{formData.primaryCategory}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Phone:</span>
              <span className="font-semibold text-slate-800">{formData.contactNumber || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Address:</span>
              <span className="font-medium text-slate-800 text-right">{formData.addressLine1}, {formData.city}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Hours:</span>
              <span className="font-medium text-slate-800">{formData.openingTime} - {formData.closingTime}</span>
            </div>
            <div className="pt-2">
              <span className="text-slate-500 block mb-1">Services:</span>
              <div className="flex flex-wrap gap-1">
                {(formData.services || []).map((s, idx) => (
                  <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Road & GPS Pin */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
            <MapPin className="w-4 h-4 text-red-500" /> सड़क व मैप स्थिति (Road & GPS)
          </h3>
          <div className="text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">सड़क का नाम:</span>
              <span className="font-bold text-slate-800">{formData.roadName || 'Main Road'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Shop Coordinates:</span>
              <span className="font-mono text-slate-700">{formData.latitude}, {formData.longitude}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Road Entrance Pin:</span>
              <span className="font-mono text-slate-700">{formData.roadEntranceLat}, {formData.roadEntranceLng}</span>
            </div>
          </div>

          {/* Stamped Photos preview */}
          <div className="pt-2">
            <span className="text-slate-500 block mb-2 font-semibold">तैयार की गई Geo-Tagged तस्वीरें:</span>
            <div className="grid grid-cols-4 gap-2">
              {['roadView', 'storefront', 'signboard', 'interior'].map((k) => {
                const photo = formData.photos?.[k];
                return (
                  <div key={k} className="aspect-square bg-slate-100 rounded-lg overflow-hidden border border-slate-200 relative group">
                    {photo?.stamped ? (
                      <img src={photo.stamped} alt={k} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-[10px] text-slate-400 p-1 text-center">
                        फ़ोटो नहीं
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* SEO Description Review */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600" /> तैयार किया गया Google Description (कॉपी करने के लिए तैयार)
        </h3>
        <p className="text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 leading-relaxed font-sans">
          {formData.seoDescription || 'विवरण खाली है।'}
        </p>
      </div>

      {/* QR Code Modal in Pure JS */}
      {showQrModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowQrModal(false)}
        >
          <div 
            className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <QrCode className="w-6 h-6" />
            </div>

            <div>
              <h4 className="font-black text-slate-900 text-base">Google Maps QR Code</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                ग्राहक इसे फोन से स्कैन करके सीधे आपकी दुकान का मैप नेविगेशन खोल सकते हैं।
              </p>
            </div>

            {qrDataUrl && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 inline-block">
                <img src={qrDataUrl} alt="Google Maps QR" className="w-56 h-56 mx-auto rounded-xl" />
              </div>
            )}

            <div className="flex gap-2">
              <a
                href={qrDataUrl}
                download={`${(formData.businessName || 'shop').replace(/\s+/g, '_')}_maps_qr.png`}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                QR इमेज डाउनलोड करें
              </a>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                बंद करें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post-GBP Launch QR Studio Modal (5-Star Review, Direct Road & Printable Standee) */}
      <PostGbpQrStudio
        isOpen={showPostQrStudio}
        onClose={() => setShowPostQrStudio(false)}
        formData={formData}
      />

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={onPrev}
          type="button"
          className="px-6 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-700 hover:bg-slate-100 transition-colors text-sm"
        >
          ← वापस जाएं (Checklist)
        </button>

        <button
          onClick={onReset}
          type="button"
          className="px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 text-xs font-semibold"
        >
          नयी प्रोफाइल शुरू करें (Reset)
        </button>
      </div>
    </div>
  );
}
