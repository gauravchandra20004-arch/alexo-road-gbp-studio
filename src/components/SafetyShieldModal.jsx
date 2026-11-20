import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Wand2, 
  ExternalLink,
  Video,
  FileText,
  Lock,
  Sparkles
} from 'lucide-react';
import { auditGoogleSafety, cleanBusinessName } from '../utils/googleSafetyGuard';
import { playClickPop, playSuccessChime } from '../utils/audioFeedback';

export default function SafetyShieldModal({ isOpen, onClose, formData, updateFormData }) {
  if (!isOpen) return null;

  const audit = auditGoogleSafety(formData);

  const handleAutoCleanName = () => {
    playClickPop();
    const cleaned = cleanBusinessName(formData.businessName);
    updateFormData({ businessName: cleaned });
    playSuccessChime();
    alert(`नाम साफ़ कर दिया गया: "${cleaned}" (Google Guidelines के अनुसार)`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black shadow-lg ${
              audit.isSafe ? 'bg-emerald-500 text-slate-950' : 'bg-amber-500 text-slate-950'
            }`}>
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  Google Safety Mode &amp; Suspension Shield
                </h3>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  audit.isSafe ? 'bg-emerald-400 text-slate-950' : 'bg-amber-400 text-slate-950'
                }`}>
                  {audit.safetyModeStatus}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Google Business Profile की आधिकारिक पॉलिसियों और सस्पेंशन शील्ड की लाइव जांच
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
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Safety Score Meter */}
          <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                Google Trust &amp; Safety Compliance Score
              </span>
              <div className="flex items-baseline gap-2 justify-center sm:justify-start">
                <span className="text-3xl sm:text-4xl font-black text-slate-950">{audit.score}%</span>
                <span className={`text-xs font-bold ${audit.isSafe ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {audit.isSafe ? '● 100% Google Policy Safe' : '● कुछ सुधार की आवश्यकता है'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                यह स्कोर जितना अधिक होगा, Google Maps पर आपकी दुकान उतनी ही सुरक्षित रहेगी और कभी सस्पेंड नहीं होगी।
              </p>
            </div>

            {/* Score Ring / Badge */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-500 text-white flex flex-col items-center justify-center font-black shadow-lg shadow-blue-500/20 shrink-0">
              <span className="text-lg leading-none">{audit.score}</span>
              <span className="text-[9px] uppercase font-bold text-blue-100">Score</span>
            </div>
          </div>

          {/* Policy Issues List (if any) */}
          {audit.issues.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                सुधार के लिए आवश्यक बिंदु ({audit.issues.length}):
              </h4>

              <div className="space-y-2.5">
                {audit.issues.map((issue, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-extrabold text-amber-950 text-sm flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        {issue.title}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-200 text-amber-900">
                        {issue.severity}
                      </span>
                    </div>

                    <p className="text-amber-800 leading-relaxed">
                      {issue.desc}
                    </p>

                    {issue.suggestion && (
                      <div className="pt-1 flex items-center justify-between bg-white/70 p-2.5 rounded-xl border border-amber-200/60">
                        <span className="text-slate-600 font-medium text-[11px]">
                          अनुशंसित साफ़ नाम: <strong>"{issue.suggestion}"</strong>
                        </span>
                        <button
                          type="button"
                          onClick={handleAutoCleanName}
                          className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 shadow-2xs transition-colors"
                        >
                          <Wand2 className="w-3 h-3" /> ऑटो-फ़िक्स करें
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Passed Policy Checks */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              सफलतापूर्वक पास किए गए सुरक्षा नियम ({audit.passed.length}):
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {audit.passed.map((p, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs flex items-center gap-2 text-emerald-900"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{p.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Google Suspension Shield Rules Box */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white space-y-3">
            <h4 className="text-sm font-black flex items-center gap-2 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
              Google Safety Mode: सस्पेंशन से बचने के 4 सुनहरे नियम
            </h4>

            <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-400 shrink-0">1.</span>
                <span><strong>नाम में कोई अतिरिक्त शब्द न जोड़ें:</strong> दुकान का नाम वही रखें जो आपके फिजिकल बोर्ड पर है (उदा: "Chandra Spares", न कि "Best Car Spares Shop In Delhi")।</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-400 shrink-0">2.</span>
                <span><strong>सड़क से आने वाला रास्ता साफ दिखाएं:</strong> Google वेरिफिकेशन में सबसे पहले यह देखता है कि सड़क से दुकान में प्रवेश आसान है या नहीं।</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-400 shrink-0">3.</span>
                <span><strong>दस्तावेज़ तैयार रखें:</strong> बिजली का बिल, जीएसटी प्रमाण पत्र या दुकान का किरायानामा (Rent Agreement) हमेशा तैयार रखें।</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-400 shrink-0">4.</span>
                <span><strong>वीडियो कॉल वेरिफिकेशन:</strong> एक ही अनकट वीडियो में सड़क का बोर्ड, चाबी से ताला खोलना और अंदर का काउंटर दिखाएं।</span>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}
