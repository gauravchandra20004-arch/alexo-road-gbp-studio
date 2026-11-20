import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  QrCode, 
  Download, 
  Printer, 
  Share2, 
  Star, 
  MapPin, 
  Navigation, 
  ExternalLink, 
  X, 
  Copy, 
  Check, 
  Sparkles,
  Palette,
  CheckCircle2,
  FileDown
} from 'lucide-react';
import { playClickPop, playSuccessChime } from '../utils/audioFeedback';

export default function PostGbpQrStudio({ isOpen, onClose, formData }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('review'); // 'review' | 'navigation' | 'standee'
  const [standeeTheme, setStandeeTheme] = useState('google'); // 'google' | 'gold' | 'royal'
  const [customReviewLink, setCustomReviewLink] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  
  const [reviewQrUrl, setReviewQrUrl] = useState('');
  const [navQrUrl, setNavQrUrl] = useState('');
  
  const canvasRef = useRef(null);

  const businessName = formData.businessName || 'आपकी दुकान / बिज़नेस';
  const roadName = formData.roadName || 'मुख्य सड़क';
  const city = formData.city || 'शहर';
  const lat = formData.latitude || 28.6139;
  const lng = formData.longitude || 77.2090;

  // URLs
  const defaultReviewUrl = customReviewLink.trim() || 
    `https://www.google.com/search?q=${encodeURIComponent(businessName + ' ' + city + ' reviews')}`;
  
  const navigationUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  // Generate QR code Data URLs
  useEffect(() => {
    QRCode.toDataURL(defaultReviewUrl, {
      width: 400,
      margin: 2,
      color: { dark: '#0f172a', light: '#ffffff' }
    }).then(setReviewQrUrl).catch(console.error);

    QRCode.toDataURL(navigationUrl, {
      width: 400,
      margin: 2,
      color: { dark: '#0f172a', light: '#ffffff' }
    }).then(setNavQrUrl).catch(console.error);
  }, [defaultReviewUrl, navigationUrl]);

  // Render High-Res Printable Counter Standee on Canvas
  useEffect(() => {
    if (activeTab !== 'standee') return;

    const qrUrl = activeTab === 'review' ? reviewQrUrl : (reviewQrUrl || navQrUrl);
    if (!qrUrl) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Standee Canvas dimensions (A5 portrait ratio: 800 x 1130 px)
    canvas.width = 800;
    canvas.height = 1130;

    // Background Themes
    if (standeeTheme === 'gold') {
      const grad = ctx.createLinearGradient(0, 0, 0, 1130);
      grad.addColorStop(0, '#090d16');
      grad.addColorStop(0.5, '#0f172a');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 800, 1130);

      // Gold Border
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 8;
      ctx.strokeRect(20, 20, 760, 1090);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      ctx.strokeRect(30, 30, 740, 1070);
    } else if (standeeTheme === 'royal') {
      const grad = ctx.createLinearGradient(0, 0, 800, 1130);
      grad.addColorStop(0, '#1e1b4b');
      grad.addColorStop(0.5, '#312e81');
      grad.addColorStop(1, '#1e293b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 800, 1130);

      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 8;
      ctx.strokeRect(20, 20, 760, 1090);
    } else {
      // Clean Google White Theme
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 800, 1130);

      // Soft Google 4-color top bar
      const barH = 14;
      ctx.fillStyle = '#4285F4'; ctx.fillRect(20, 20, 190, barH);
      ctx.fillStyle = '#EA4335'; ctx.fillRect(210, 20, 190, barH);
      ctx.fillStyle = '#FBBC05'; ctx.fillRect(400, 20, 190, barH);
      ctx.fillStyle = '#34A853'; ctx.fillRect(590, 20, 190, barH);

      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 4;
      ctx.strokeRect(20, 20, 760, 1090);
    }

    const isDark = standeeTheme !== 'google';

    // Header Pill: "GOOGLE VERIFIED PROFILE"
    ctx.fillStyle = isDark ? '#f59e0b' : '#2563eb';
    ctx.beginPath();
    ctx.roundRect(260, 60, 280, 42, 21);
    ctx.fill();

    ctx.fillStyle = isDark ? '#020617' : '#ffffff';
    ctx.font = 'bold 18px "Inter", "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GOOGLE VERIFIED', 400, 87);

    // Business Name
    ctx.fillStyle = isDark ? '#ffffff' : '#0f172a';
    ctx.font = 'bold 36px "Inter", "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    
    // Auto-fit name if long
    let displayTitle = businessName;
    if (displayTitle.length > 28) {
      displayTitle = displayTitle.substring(0, 26) + '...';
    }
    ctx.fillText(displayTitle, 400, 155);

    // Subtitle / Road location
    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.font = '500 20px "Inter", "Segoe UI", sans-serif';
    ctx.fillText(`📍 ${roadName}, ${city}`, 400, 195);

    // 5 Gold Stars Rating Iconography
    const starY = 240;
    const starGap = 48;
    const startX = 400 - (2 * starGap);
    for (let i = 0; i < 5; i++) {
      drawStar(ctx, startX + (i * starGap), starY, 18, 9, '#f59e0b');
    }

    // Call to Action Text
    ctx.fillStyle = isDark ? '#fbbf24' : '#1d4ed8';
    ctx.font = 'bold 26px "Inter", "Segoe UI", sans-serif';
    ctx.fillText('Google पर हमें 5-Star रेटिंग दें', 400, 305);

    ctx.fillStyle = isDark ? '#cbd5e1' : '#475569';
    ctx.font = '18px "Inter", "Segoe UI", sans-serif';
    ctx.fillText('अपने फोन का कैमरा खोलकर QR कोड स्कैन करें', 400, 340);

    // QR Code Container Box
    const qrBoxSize = 420;
    const qrBoxX = (800 - qrBoxSize) / 2;
    const qrBoxY = 380;

    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 28);
    ctx.fill();
    ctx.shadowBlur = 0; // reset shadow

    // Inner subtle border
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 3;
    ctx.strokeRect(qrBoxX + 10, qrBoxY + 10, qrBoxSize - 20, qrBoxSize - 20);

    // Draw QR Code Image into Canvas
    const qrImg = new Image();
    qrImg.onload = () => {
      const pad = 24;
      ctx.drawImage(qrImg, qrBoxX + pad, qrBoxY + pad, qrBoxSize - (pad * 2), qrBoxSize - (pad * 2));

      // Small center badge inside QR code (Google G Icon)
      const centerBadgeSize = 56;
      const cX = qrBoxX + (qrBoxSize / 2) - (centerBadgeSize / 2);
      const cY = qrBoxY + (qrBoxSize / 2) - (centerBadgeSize / 2);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cX + centerBadgeSize/2, cY + centerBadgeSize/2, centerBadgeSize/2 + 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#4285F4';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('G', cX + centerBadgeSize/2, cY + centerBadgeSize/2 + 2);
      ctx.textBaseline = 'alphabetic'; // reset

      // Bottom Footer in Standee
      ctx.fillStyle = isDark ? '#ffffff' : '#0f172a';
      ctx.font = 'bold 22px "Inter", "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('आपकी समीक्षा हमारे लिए अनमोल है!', 400, 850);

      // Contact & Direct Road Note
      ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
      ctx.font = '18px "Inter", "Segoe UI", sans-serif';
      ctx.fillText(`संपर्क: ${formData.contactNumber || '—'}  |  सड़क: ${roadName}`, 400, 890);

      // Bottom Brand Watermark
      ctx.fillStyle = isDark ? '#334155' : '#cbd5e1';
      ctx.fillRect(100, 940, 600, 2);

      ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
      ctx.font = 'bold 16px "Inter", "Segoe UI", sans-serif';
      ctx.fillText('POWERED BY ALEXO ROAD MAP STUDIO', 400, 980);
      
      ctx.fillStyle = isDark ? '#64748b' : '#94a3b8';
      ctx.font = '14px "Inter", "Segoe UI", sans-serif';
      ctx.fillText('काउंटर स्टैंडी कार्ड | टेबल या रिसेप्शन पर लगाने के लिए तैयार', 400, 1010);
    };
    qrImg.src = qrUrl;

  }, [activeTab, standeeTheme, reviewQrUrl, navQrUrl, businessName, roadName, city, formData.contactNumber]);

  // Star Drawing Helper for Canvas
  function drawStar(ctx, cx, cy, spikes, outerRadius, fill) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / 5;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < 5; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * (outerRadius * 0.45);
      y = cy + Math.sin(rot) * (outerRadius * 0.45);
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  }

  // Download Standee as PNG
  const handleDownloadStandee = () => {
    playClickPop();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${businessName.replace(/\s+/g, '_')}_Counter_Standee_Card.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    playSuccessChime();
  };

  // Print Standee
  const handlePrintStandee = () => {
    playClickPop();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>${businessName} - Google Standee Card</title>
          <style>
            body { margin: 0; display: flex; justify-content: center; align-items: center; background: #fff; height: 100vh; }
            img { max-height: 96vh; max-width: 96vw; object-fit: contain; box-shadow: 0 4px 20px rgba(0,0,0,0.15); border-radius: 12px; }
            @media print {
              body { margin: 0; }
              img { max-height: 100%; max-width: 100%; border-radius: 0; box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" onload="window.print();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleCopyLink = (text) => {
    playClickPop();
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden max-h-[94vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  GBP पोस्ट-लॉन्च QR Code व स्टैंडी स्टूडियो
                </h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950">
                  Ready to Print
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                Google Business Profile बनने के बाद ग्राहकों से 5-Star रिव्यू लेने और रोड नेविगेशन के लिए QR टूल्स
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-2">
          <button
            onClick={() => { playClickPop(); setActiveTab('review'); }}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-black border-b-2 transition-all ${
              activeTab === 'review'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>1. गूगल 5-Star रिव्यू QR</span>
          </button>

          <button
            onClick={() => { playClickPop(); setActiveTab('navigation'); }}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-black border-b-2 transition-all ${
              activeTab === 'navigation'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Navigation className="w-4 h-4 text-blue-600" />
            <span>2. रोड नेविगेशन GPS QR</span>
          </button>

          <button
            onClick={() => { playClickPop(); setActiveTab('standee'); }}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-black border-b-2 transition-all ${
              activeTab === 'standee'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Palette className="w-4 h-4 text-purple-600" />
            <span>3. दुकान काउंटर स्टैंडी कार्ड (A5 Print)</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: 5-STAR REVIEW QR */}
          {activeTab === 'review' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-5 flex flex-col items-center text-center p-6 bg-slate-50 rounded-3xl border border-slate-200">
                <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200">
                  {reviewQrUrl ? (
                    <img src={reviewQrUrl} alt="Review QR Code" className="w-56 h-56 mx-auto rounded-xl" />
                  ) : (
                    <div className="w-56 h-56 flex items-center justify-center text-xs text-slate-400">QR तैयार हो रहा है...</div>
                  )}
                </div>

                <div className="flex items-center gap-1 text-amber-500 mt-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                  <span className="text-xs font-black text-slate-900 ml-1.5">Google 5-Star Booster</span>
                </div>

                <div className="flex gap-2 w-full mt-4">
                  <a
                    href={reviewQrUrl}
                    download={`${businessName.replace(/\s+/g, '_')}_Google_Review_QR.png`}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-4 h-4" /> QR इमेज सेव करें
                  </a>
                  <button
                    onClick={() => { playClickPop(); setActiveTab('standee'); }}
                    className="px-3.5 py-2.5 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 font-bold text-xs rounded-xl transition-all"
                    title="स्टैंडी में देखें"
                  >
                    स्टैंडी देखें →
                  </button>
                </div>
              </div>

              <div className="md:col-span-7 space-y-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-black uppercase text-blue-600 tracking-wider">
                    Rating Growth Booster
                  </span>
                  <h4 className="text-lg font-black text-slate-900">
                    ग्राहकों से गूगल पर 5-स्टार रेटिंग व रिव्यू प्राप्त करें
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Google पर नई प्रोफाइल बनने के बाद सबसे ज़रूरी चीज़ होती है <strong>कस्टमर रिव्यूज</strong>। ग्राहक इस QR कोड को स्कैन करते ही सीधे आपकी प्रोफाइल के "Write a Review" पेज पर पहुंच जाएंगे।
                  </p>
                </div>

                {/* Custom Review Link Input */}
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800">
                      🔗 लाइव Google Maps या Review लिंक (दुकान रेडी होने के बाद मिला लिंक):
                    </label>
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(businessName + ' ' + city)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-blue-200 shadow-2xs"
                      title="Google पर दुकान खोजें और लिंक कॉपी करें"
                    >
                      <span>Google पर खोजें</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="उदा: https://maps.app.goo.gl/xyz या https://g.page/r/xyz/review"
                      value={customReviewLink}
                      onChange={(e) => setCustomReviewLink(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 bg-white rounded-xl border border-slate-300 text-xs text-slate-900 font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-inner"
                    />
                    {customReviewLink && (
                      <button
                        onClick={() => setCustomReviewLink('')}
                        className="px-3 text-xs text-slate-400 hover:text-slate-600 font-bold bg-white rounded-xl border border-slate-200"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    *जैसे ही आप लिंक पेस्ट करेंगे, आपका QR कोड और काउंटर स्टैंडी तुरंत ऑटो-अपडेट हो जाएंगे।
                  </p>
                </div>

                {/* Step-by-Step Guide Box for Shopkeepers */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <span className="font-extrabold text-slate-900 text-xs block">
                    📌 दुकान का GBP रेडी होने के बाद लिंक कैसे निकालें (3 आसान स्टेप्स):
                  </span>
                  <div className="space-y-1.5 text-slate-600 text-[11px]">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-black text-[10px] flex items-center justify-center shrink-0">1</span>
                      <span>अपने फ़ोन में <strong>Google Maps</strong> ऐप खोलें और अपनी दुकान का नाम सर्च करें।</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-black text-[10px] flex items-center justify-center shrink-0">2</span>
                      <span>दुकान की प्रोफाइल पर <strong>"Reviews" &gt; "Get more reviews"</strong> या <strong>"Share Profile"</strong> पर क्लिक करें।</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-black text-[10px] flex items-center justify-center shrink-0">3</span>
                      <span>कॉपी किया हुआ लिंक ऊपर वाले बॉक्स में पेस्ट कर दें — <strong>QR कोड तैयार!</strong></span>
                    </div>
                  </div>
                </div>

                {/* Quick Link Share & Copy */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="truncate max-w-[280px] font-mono text-slate-600">
                    {defaultReviewUrl}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleCopyLink(defaultReviewUrl)}
                      className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-lg border border-slate-200 flex items-center gap-1 shadow-2xs"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'कॉपी हुआ' : 'लिंक कॉपी'}</span>
                    </button>
                    <a
                      href={defaultReviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-white hover:bg-slate-100 text-blue-600 rounded-lg border border-slate-200 shadow-2xs"
                      title="खोल कर देखें"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Practical Tips */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-1 text-amber-900">
                  <p className="font-bold">💡 प्रो टिप (Pro Tip):</p>
                  <p className="text-amber-800 leading-relaxed">
                    इस QR कोड का प्रिंट आउट निकालकर दुकान के बिलिंग काउंटर पर रखें और हर संतुष्ट ग्राहक से बिल देते समय 1 सेकंड में स्कैन करवाएं। 2 हफ़्ते में 50+ रिव्यूज आ जाएंगे!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DIRECT ROAD NAVIGATION QR */}
          {activeTab === 'navigation' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-5 flex flex-col items-center text-center p-6 bg-slate-50 rounded-3xl border border-slate-200">
                <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200">
                  {navQrUrl ? (
                    <img src={navQrUrl} alt="Navigation QR Code" className="w-56 h-56 mx-auto rounded-xl" />
                  ) : (
                    <div className="w-56 h-56 flex items-center justify-center text-xs text-slate-400">QR तैयार हो रहा है...</div>
                  )}
                </div>

                <div className="flex items-center gap-1 text-blue-600 mt-3 font-black text-xs">
                  <Navigation className="w-4 h-4 fill-blue-600" />
                  <span>Direct Road Approach Route</span>
                </div>

                <div className="flex gap-2 w-full mt-4">
                  <a
                    href={navQrUrl}
                    download={`${businessName.replace(/\s+/g, '_')}_Road_Navigation_QR.png`}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-4 h-4" /> QR इमेज सेव करें
                  </a>
                  <a
                    href={navigationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all"
                  >
                    मैप खोलें ↗
                  </a>
                </div>
              </div>

              <div className="md:col-span-7 space-y-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-black uppercase text-emerald-600 tracking-wider">
                    Customer Road Arrival
                  </span>
                  <h4 className="text-lg font-black text-slate-900">
                    ग्राहकों को सीधे दुकान के सड़क मोड़ (Road Entrance) तक लाएं
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    यह QR कोड स्कैन करते ही ग्राहक के फोन में Google Maps का टर्न-बाय-टर्न ड्राइविंग नेविगेशन सीधे आपकी दुकान के सटीक GPS कोऑर्डिनेट्स पर खुल जाता है।
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">स्थान / सड़क:</span>
                    <span className="font-bold text-slate-800">{roadName}, {city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Shop GPS Coordinates:</span>
                    <span className="font-mono text-slate-800">{lat}, {lng}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Road Entrance Pin:</span>
                    <span className="font-mono text-slate-800">{formData.roadEntranceLat || lat}, {formData.roadEntranceLng || lng}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1 text-emerald-900">
                  <p className="font-bold">🛣️ Dual-Pin का फायदा:</p>
                  <p className="text-emerald-800 leading-relaxed">
                    डिलीवरी बॉय या नए ग्राहक किसी गलत पतली गली में नहीं भटकेंगे, वे मुख्य सड़क से सीधे आपकी दुकान के प्रवेश द्वार पर पहुंचेंगे।
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRINTABLE SHOP COUNTER STANDEE */}
          {activeTab === 'standee' && (
            <div className="space-y-5">
              
              {/* Standee Theme Selector & Action Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-700">स्टैंडी थीम चुनें:</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setStandeeTheme('google')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                        standeeTheme === 'google'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Google White
                    </button>
                    <button
                      onClick={() => setStandeeTheme('gold')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                        standeeTheme === 'gold'
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      VIP Gold
                    </button>
                    <button
                      onClick={() => setStandeeTheme('royal')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                        standeeTheme === 'royal'
                          ? 'bg-indigo-700 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Royal Blue
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleDownloadStandee}
                    className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <FileDown className="w-4 h-4" /> स्टैंडी कार्ड सेव करें (PNG)
                  </button>
                  <button
                    onClick={handlePrintStandee}
                    className="flex-1 sm:flex-none px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Printer className="w-4 h-4" /> प्रिंट करें (PDF)
                  </button>
                </div>
              </div>

              {/* Live Canvas Preview */}
              <div className="flex justify-center p-4 bg-slate-100 rounded-3xl border border-slate-200 overflow-x-auto">
                <canvas 
                  ref={canvasRef} 
                  className="rounded-2xl shadow-2xl max-w-full h-auto max-h-[560px] border border-slate-300"
                />
              </div>

              <div className="text-center text-xs text-slate-500">
                📌 यह स्टैंडी A5 / Table-top कार्ड साइज में डिज़ाइन की गई है। इसे रंगीन प्रिंट कराकर ऐक्रेलिक स्टैंड में लगाकर काउंटर पर रखें।
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>ALEXO Post-Launch Growth Suite • 100% Free &amp; Offline Compatible</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold transition-colors"
          >
            बंद करें
          </button>
        </div>

      </div>
    </div>
  );
}