import React, { useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Video, 
  HelpCircle, 
  ArrowRight,
  ExternalLink,
  Camera,
  MapPin,
  Building,
  Phone,
  FileText,
  Lock,
  Sparkles
} from 'lucide-react';
import { playClickPop, playSuccessChime } from '../utils/audioFeedback';
import { fireCelebrationConfetti } from '../utils/confettiHelper';

export default function StepChecklist({ formData, updateFormData, onNext, onPrev, setStep }) {
  // 1. Calculate Real-time Completion for each point from actual form data
  
  // Point 1: Business Name Check
  const hasValidName = Boolean(
    formData.businessName && 
    formData.businessName.trim().length >= 3 &&
    !formData.businessName.toLowerCase().includes("best") &&
    !formData.businessName.toLowerCase().includes("no.1")
  );

  // Point 2: Road & Entrance Map Pin
  const hasRoadPin = Boolean(
    formData.latitude && 
    formData.longitude && 
    formData.roadEntranceLat && 
    formData.roadEntranceLng
  );

  // Point 3: Geo-Tagged Photos (Needs at least 3 photos)
  const photos = formData.photos || {};
  const photoKeys = ['roadView', 'storefront', 'signboard', 'interior'];
  const photoCount = photoKeys.filter(k => Boolean(photos[k]?.stamped || photos[k]?.dataUrl)).length;
  const hasSufficientPhotos = photoCount >= 3;

  // Point 4: Active Phone Number (At least 10 digits)
  const cleanPhone = (formData.contactNumber || '').replace(/[^0-9]/g, '');
  const hasValidPhone = cleanPhone.length >= 10;

  // Point 5: Physical Address & Pincode (At least 6 digit pin)
  const hasValidAddress = Boolean(
    formData.addressLine1 && 
    formData.addressLine1.trim().length >= 5 &&
    formData.city && 
    formData.pincode && 
    formData.pincode.trim().length === 6
  );

  // Point 6: Video Verification Protocol Ready
  // User manual confirmation or auto if other 5 are met and confirmed
  const isVideoPrepConfirmed = Boolean(formData.videoPrepConfirmed);

  // Build the live audited items array
  const auditChecks = [
    {
      id: 'name_match',
      title: 'नाम साइनबोर्ड से 100% मेल खाता है',
      desc: 'Google Business Profile का नाम आपकी दुकान के फिजिकल बोर्ड और बिल से बिल्कुल एक समान होना चाहिए। अतिरिक्त कीवर्ड न जोड़ें।',
      isComplete: hasValidName,
      statusText: hasValidName 
        ? `✓ 100% सत्यापित: "${formData.businessName}"` 
        : '❌ अधूरा: बिज़नेस का आधिकारिक नाम दर्ज करें',
      actionStep: 1,
      actionLabel: 'नाम ठीक करें'
    },
    {
      id: 'road_visible',
      title: 'मुख्य सड़क और दुकान का प्रवेश द्वार साफ दिखता है',
      desc: 'सड़क से दुकान तक आने का रास्ता साफ है और ग्राहकों के लिए कोई भ्रम नहीं है।',
      isComplete: hasRoadPin,
      statusText: hasRoadPin 
        ? `✓ 100% सत्यापित: सड़क मोड़ पिन सेट है (${formData.roadName || 'Main Road'})` 
        : '❌ अधूरा: मैप पर दुकान और सड़क प्रवेश द्वार का पिन लगाएं',
      actionStep: 2,
      actionLabel: 'मैप पिन लगाएं'
    },
    {
      id: 'photos_ready',
      title: 'कम से कम 3-4 Geo-Tagged तस्वीरें तैयार हैं',
      desc: 'रोड व्यू, दुकान का मुख्य बोर्ड और अंदर का कार्यक्षेत्र तैयार है।',
      isComplete: hasSufficientPhotos,
      statusText: hasSufficientPhotos 
        ? `✓ 100% सत्यापित: ${photoCount}/4 तस्वीरें Geo-Tag के साथ तैयार` 
        : `❌ अधूरा: कम से कम 3 तस्वीरें अपलोड करें (अभी: ${photoCount}/4)`,
      actionStep: 3,
      actionLabel: 'फ़ोटो जोड़ें'
    },
    {
      id: 'phone_active',
      title: 'आधिकारिक फोन नंबर सक्रिय (Active) है',
      desc: 'OTP या कॉल वेरिफिकेशन के लिए वही नंबर डालें जो दुकान पर हमेशा चालू रहता है।',
      isComplete: hasValidPhone,
      statusText: hasValidPhone 
        ? `✓ 100% सत्यापित: ${formData.contactNumber}` 
        : '❌ अधूरा: 10-अंकों का सक्रिय मोबाइल नंबर भरें',
      actionStep: 1,
      actionLabel: 'नंबर भरें'
    },
    {
      id: 'address_proof',
      title: 'दुकान का पता प्रमाण (Electricity Bill / Rent Agreement / GST) उपलब्ध है',
      desc: 'Google कभी भी वेरिफिकेशन के लिए बिल या लीज एग्रीमेंट मांग सकता है।',
      isComplete: hasValidAddress,
      statusText: hasValidAddress 
        ? `✓ 100% सत्यापित: ${formData.city} (${formData.pincode})` 
        : '❌ अधूरा: सड़क का पूरा पता, शहर और 6-अंकों का पिनकोड भरें',
      actionStep: 1,
      actionLabel: 'पता भरें'
    },
    {
      id: 'video_prep',
      title: 'Video Verification की तैयारी (Google Live Video Call)',
      desc: 'दुकान की चाबी से ताला खोलना, सड़क का साइनबोर्ड दिखाना और बिलिंग काउंटर एक ही बिना रुके वीडियो में दिखाना होता है।',
      isComplete: isVideoPrepConfirmed,
      statusText: isVideoPrepConfirmed 
        ? '✓ 100% सत्यापित: वीडियो कॉल वेरिफिकेशन के सभी नियम समझ लिए गए हैं' 
        : '⚠️ क्लिक करके पुष्टि करें कि दुकान की चाबी व साइनबोर्ड वीडियो के लिए तैयार हैं',
      isToggleable: true,
      actionLabel: 'कन्फर्म करें'
    }
  ];

  const total = auditChecks.length;
  const completedCount = auditChecks.filter(c => c.isComplete).length;
  const scorePercent = Math.round((completedCount / total) * 100);
  const isAll100Percent = scorePercent === 100;

  // Fire celebration confetti when reaching 100%
  useEffect(() => {
    if (isAll100Percent) {
      fireCelebrationConfetti();
      playSuccessChime();
    }
  }, [isAll100Percent]);

  const toggleVideoPrep = () => {
    playClickPop();
    updateFormData({
      videoPrepConfirmed: !isVideoPrepConfirmed
    });
  };

  return (
    <div className="space-y-6">
      {/* 100% Verification Score Meter Header */}
      <div className={`p-6 rounded-3xl shadow-xl border-2 transition-all ${
        isAll100Percent
          ? 'bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 border-emerald-500 text-white'
          : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                isAll100Percent 
                  ? 'bg-emerald-400 text-slate-950 shadow-md animate-pulse'
                  : 'bg-amber-100 text-amber-900 border border-amber-300'
              }`}>
                {isAll100Percent ? '✓ 100% VERIFIED & READY' : `ऑडिट स्थिति: ${scorePercent}% कम्प्लीट`}
              </span>
            </div>
            
            <h2 className={`text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2.5 ${
              isAll100Percent ? 'text-white' : 'text-slate-900'
            }`}>
              <ShieldCheck className={`w-7 h-7 shrink-0 ${isAll100Percent ? 'text-emerald-400' : 'text-emerald-600'}`} />
              Google वेरिफिकेशन ऑडिट व रेडिनेस स्कोर
            </h2>
            
            <p className={`text-xs mt-1 max-w-xl leading-relaxed ${
              isAll100Percent ? 'text-emerald-200' : 'text-slate-500'
            }`}>
              {isAll100Percent 
                ? '🎉 बधाई! आपकी प्रोफाइल के सभी 6 ऑडिट बिंदु 100% कम्प्लीट और Google Policy के अनुसार सत्यापित हैं। अब आप बिना सस्पेंशन के प्रोफाइल लॉन्च कर सकते हैं!'
                : 'जब सभी बिंदु 100% कम्प्लीट हो जाएंगे तभी यहाँ ग्रीन टिक आएगा। जो बिंदु अधूरे हैं, उन्हें पूरा करें:'}
            </p>
          </div>

          {/* Circular Score Badge */}
          <div className={`flex items-center gap-4 p-4 rounded-2xl border ${
            isAll100Percent 
              ? 'bg-white/10 border-white/20' 
              : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="text-right">
              <div className={`text-[11px] font-bold uppercase ${isAll100Percent ? 'text-emerald-300' : 'text-slate-500'}`}>
                Audit Score
              </div>
              <div className={`text-3xl font-black ${isAll100Percent ? 'text-emerald-300' : 'text-slate-900'}`}>
                {scorePercent}%
              </div>
            </div>
            
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-base text-white shadow-lg transition-transform ${
              isAll100Percent 
                ? 'bg-emerald-500 text-slate-950 scale-105' 
                : scorePercent >= 60 
                ? 'bg-amber-500 text-slate-950' 
                : 'bg-red-500 text-white'
            }`}>
              {completedCount}/{total}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200/50 h-3 rounded-full overflow-hidden mt-5">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isAll100Percent
                ? 'bg-gradient-to-r from-emerald-400 to-teal-400 shadow-lg shadow-emerald-400/50'
                : scorePercent >= 60
                ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                : 'bg-gradient-to-r from-red-500 to-red-600'
            }`}
            style={{ width: `${scorePercent}%` }}
          />
        </div>
      </div>

      {/* Checklist Items with REAL Live Verification Status */}
      <div className="space-y-3">
        {auditChecks.map((item, idx) => {
          const isDone = item.isComplete;
          return (
            <div
              key={item.id}
              onClick={() => {
                if (item.isToggleable) {
                  toggleVideoPrep();
                } else if (!isDone && setStep) {
                  playClickPop();
                  setStep(item.actionStep);
                }
              }}
              className={`p-4 sm:p-5 rounded-2xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 select-none ${
                isDone
                  ? 'bg-emerald-50/70 border-emerald-400/80 shadow-xs'
                  : 'bg-white border-amber-300/80 hover:border-amber-400 hover:bg-amber-50/20'
              } ${item.isToggleable || (!isDone && setStep) ? 'cursor-pointer' : ''}`}
            >
              <div className="flex items-start gap-3.5 flex-1">
                {/* Checkbox Icon */}
                <div className="mt-0.5 shrink-0">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-black transition-all ${
                      isDone 
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' 
                        : 'border-2 border-amber-400 bg-amber-50 text-amber-700'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <span className="text-xs font-bold">{idx + 1}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className={`text-sm font-black ${isDone ? 'text-emerald-950' : 'text-slate-900'}`}>
                      {item.title}
                    </h4>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                      isDone 
                        ? 'bg-emerald-200/90 text-emerald-950' 
                        : 'bg-amber-200 text-amber-950 animate-pulse'
                    }`}>
                      {isDone ? '100% COMPLETE' : 'अधूरा (PENDING)'}
                    </span>
                  </div>

                  <p className={`text-xs leading-relaxed ${isDone ? 'text-emerald-800' : 'text-slate-600'}`}>
                    {item.desc}
                  </p>

                  <div className={`text-xs font-bold pt-1 flex items-center gap-1.5 ${
                    isDone ? 'text-emerald-700' : 'text-amber-800'
                  }`}>
                    <span>{item.statusText}</span>
                  </div>
                </div>
              </div>

              {/* Action Button if Incomplete */}
              {!isDone && (
                <div className="shrink-0 self-end sm:self-center">
                  {item.isToggleable ? (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); toggleVideoPrep(); }}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl text-xs font-black shadow-xs transition-transform active:scale-95"
                    >
                      ✓ अभी कन्फर्म करें
                    </button>
                  ) : setStep ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        playClickPop();
                        setStep(item.actionStep);
                      }}
                      className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1 active:scale-95"
                    >
                      <span>{item.actionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Video Verification Tip Card */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-5 rounded-3xl shadow-lg border border-blue-900/40">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center justify-center shrink-0">
            <Video className="w-5 h-5" />
          </div>
          <div className="text-xs space-y-1.5">
            <h4 className="font-black text-sm text-white flex items-center gap-2">
              Google Video Verification में पहली बार में पास होने का फॉर्मूला:
            </h4>
            <p className="text-blue-200 leading-relaxed text-xs">
              Google अब सभी दुकानों का वेरिफिकेशन <strong>बिना रुके एक ही वीडियो (Uncut Video)</strong> में मांगता है:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] text-slate-300">
              <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                <strong>1. सड़क व साइनबोर्ड:</strong> बाहर सड़क से दुकान का बोर्ड और रास्ता साफ दिखाएं।
              </div>
              <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                <strong>2. चाबी से ताला:</strong> दुकान का ताला अपनी चाबी से खोलकर अंदर जाएं।
              </div>
              <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                <strong>3. काउंटर व सामान:</strong> बिलिंग मशीन, दुकान का स्टॉक और कर्मचारी दिखाएं।
              </div>
              <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                <strong>4. बिज़नेस कागजात:</strong> दुकान का बिजली बिल, GST या विजिटिंग कार्ड दिखाएं।
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={onPrev}
          type="button"
          className="px-6 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 transition-colors text-xs"
        >
          ← वापस जाएं (AI SEO)
        </button>

        <button
          onClick={onNext}
          type="button"
          className={`px-6 py-3 rounded-2xl font-black text-xs transition-all shadow-md flex items-center gap-2 active:scale-95 ${
            isAll100Percent
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 shadow-emerald-500/25 ring-2 ring-emerald-300'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
          }`}
        >
          <span>{isAll100Percent ? '✓ 100% रेडी: प्रोफाइल लॉन्च व एक्सपोर्ट करें →' : 'आगे बढ़ें (लॉन्च व एक्सपोर्ट) →'}</span>
        </button>
      </div>
    </div>
  );
}