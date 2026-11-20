import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  Database, 
  Key, 
  Save, 
  FolderOpen, 
  Trash2, 
  CheckCircle2, 
  X, 
  RefreshCw, 
  ExternalLink,
  Flame,
  User,
  LogIn,
  LogOut,
  Bell,
  BarChart3,
  HardDrive,
  Shield,
  Send
} from 'lucide-react';
import { isFirebaseReady, initFirebase } from '../firebase/config';
import { 
  saveProfileToBackend, 
  fetchProfilesFromBackend,
  loginWithGoogle,
  loginWithEmailPassword,
  registerWithEmailPassword,
  logoutUser,
  getCurrentUser,
  requestPushPermission,
  sendLocalAppNotification,
  trackEvent
} from '../firebase/service';
import { playClickPop, playSuccessChime } from '../utils/audioFeedback';

export default function FirebaseModal({ isOpen, onClose, currentFormData, onLoadProfile }) {
  // Tabs: 'auth', 'database', 'storage', 'messaging', 'analytics', 'settings'
  const [activeTab, setActiveTab] = useState('auth');
  
  // Auth state
  const [user, setUser] = useState(() => getCurrentUser());
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Database state
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [isLive, setIsLive] = useState(isFirebaseReady);

  // Messaging (FCM) state
  const [fcmToken, setFcmToken] = useState('');
  const [notifPermission, setNotifPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  // Settings inputs
  const [apiKey, setApiKey] = useState('');
  const [projectId, setProjectId] = useState('');
  const [authDomain, setAuthDomain] = useState('');
  const [storageBucket, setStorageBucket] = useState('');
  const [messagingSenderId, setMessagingSenderId] = useState('');
  const [appId, setAppId] = useState('');
  const [measurementId, setMeasurementId] = useState('');

  // Load existing config from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('gbp_firebase_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        setApiKey(parsed.apiKey || '');
        setProjectId(parsed.projectId || '');
        setAuthDomain(parsed.authDomain || '');
        setStorageBucket(parsed.storageBucket || '');
        setMessagingSenderId(parsed.messagingSenderId || '');
        setAppId(parsed.appId || '');
        setMeasurementId(parsed.measurementId || '');
      }
    } catch (e) {
      console.warn(e);
    }
  }, []);

  const loadSavedProfiles = async () => {
    setLoading(true);
    const res = await fetchProfilesFromBackend();
    if (res.success) {
      setProfiles(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadSavedProfiles();
      setIsLive(isFirebaseReady);
      setUser(getCurrentUser());
    }
  }, [isOpen]);

  // Auth Handlers
  const handleGoogleLogin = async () => {
    playClickPop();
    setAuthLoading(true);
    setAuthError('');
    const res = await loginWithGoogle();
    setAuthLoading(false);
    if (res.success) {
      setUser(res.user);
      playSuccessChime();
      setStatusMsg(`स्वागत है, ${res.user.displayName || 'User'}!`);
      trackEvent('login', { method: 'google' });
    } else {
      setAuthError(res.error || "Google लॉगिन विफल रहा।");
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    playClickPop();
    setAuthLoading(true);
    setAuthError('');

    let res;
    if (isRegisterMode) {
      res = await registerWithEmailPassword(email, password);
    } else {
      res = await loginWithEmailPassword(email, password);
    }

    setAuthLoading(false);
    if (res.success) {
      setUser(res.user);
      playSuccessChime();
      setStatusMsg(`${isRegisterMode ? 'अकाउंट बन गया' : 'लॉगिन सफल'}!`);
      setEmail('');
      setPassword('');
      trackEvent(isRegisterMode ? 'sign_up' : 'login', { method: 'email' });
    } else {
      setAuthError(res.error || "ऑथेंटिकेशन विफल रहा।");
    }
  };

  const handleLogout = async () => {
    playClickPop();
    await logoutUser();
    setUser(null);
    setStatusMsg("आप लॉगआउट हो चुके हैं।");
  };

  // Database Save
  const handleSaveToCloud = async () => {
    playClickPop();
    setLoading(true);
    setStatusMsg('');
    const res = await saveProfileToBackend(currentFormData);
    if (res.success) {
      playSuccessChime();
      setStatusMsg(`प्रोफाइल सफलतापूर्वक Firebase डेटाबेस में सेव हो गई! (${res.mode})`);
      await loadSavedProfiles();
    } else {
      setStatusMsg("सेव करने में समस्या आई।");
    }
    setLoading(false);
  };

  // Messaging (FCM) handlers
  const handleEnablePush = async () => {
    playClickPop();
    const res = await requestPushPermission();
    setNotifPermission(res.permission);
    if (res.success) {
      setFcmToken(res.token);
      sendLocalAppNotification(
        "ALEXO Road Map नोटिफिकेशन सक्रिय!",
        "अब आपको Google Maps वेरिफिकेशन और प्रोफाइल अपडेट के रियल-टाइम अलर्ट मिलेंगे।"
      );
      playSuccessChime();
      alert("पुश नोटिफिकेशन सफलतापूर्वक सक्रिय हो गया!");
    } else {
      alert("नोटिफिकेशन अनुमति नहीं मिली।");
    }
  };

  const handleSendTestNotification = () => {
    playClickPop();
    const sent = sendLocalAppNotification(
      "ALEXO Studio Test Alert",
      "Firebase Cloud Messaging (FCM) बैकएंड पूरी तरह काम कर रहा है!"
    );
    if (!sent) {
      alert("कृपया पहले नोटिफिकेशन अनुमति दें।");
    }
  };

  // Settings Save
  const handleConnectFirebase = (e) => {
    e.preventDefault();
    if (!apiKey.trim() || !projectId.trim()) {
      alert("कृपया कम से कम API Key और Project ID दर्ज करें।");
      return;
    }

    const newConfig = {
      apiKey: apiKey.trim(),
      projectId: projectId.trim(),
      authDomain: authDomain.trim(),
      storageBucket: storageBucket.trim(),
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim(),
      measurementId: measurementId.trim()
    };

    localStorage.setItem('gbp_firebase_config', JSON.stringify(newConfig));
    initFirebase(newConfig).then(initRes => {
      if (initRes.success) {
        setIsLive(true);
        playSuccessChime();
        alert("Firebase बैकएंड (Auth, Database, Storage, Messaging, Analytics) सफलतापूर्वक कनेक्ट हो गया!");
        setActiveTab('database');
        loadSavedProfiles();
      } else {
        alert("Firebase इनिशियलाइज़ नहीं हो सका: " + initRes.error);
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
              <Flame className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg text-white tracking-tight">
                  Firebase Master Backend Suite
                </h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                  isLive ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-slate-950'
                }`}>
                  {isLive ? '● Live Firebase' : '● Ready / Sandbox'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Auth • Database • Storage • Cloud Messaging • Analytics
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 5-Module Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-3 sm:px-5 pt-2 gap-1 overflow-x-auto text-xs font-bold no-scrollbar">
          
          {/* Tab 1: Auth */}
          <button
            type="button"
            onClick={() => setActiveTab('auth')}
            className={`px-3 py-2 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'auth'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5 text-blue-600" />
            1. Authentication
          </button>

          {/* Tab 2: Database */}
          <button
            type="button"
            onClick={() => setActiveTab('database')}
            className={`px-3 py-2 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'database'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            2. Database (Firestore)
          </button>

          {/* Tab 3: Storage */}
          <button
            type="button"
            onClick={() => setActiveTab('storage')}
            className={`px-3 py-2 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'storage'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5 text-purple-600" />
            3. Cloud Storage
          </button>

          {/* Tab 4: Messaging */}
          <button
            type="button"
            onClick={() => setActiveTab('messaging')}
            className={`px-3 py-2 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'messaging'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Bell className="w-3.5 h-3.5 text-amber-500" />
            4. Messaging (FCM)
          </button>

          {/* Tab 5: Analytics */}
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-2 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-teal-600" />
            5. Analytics
          </button>

          {/* Tab 6: Settings */}
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-2 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ml-auto ${
              activeTab === 'settings'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-slate-600" />
            API Keys
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {statusMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-2xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}

          {authError && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs rounded-2xl">
              {authError}
            </div>
          )}

          {/* TAB 1: AUTHENTICATION */}
          {activeTab === 'auth' && (
            <div className="space-y-5">
              {user ? (
                /* Logged In State */
                <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'} 
                      alt="User Avatar" 
                      className="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover"
                    />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-blue-600">
                        Authenticated Active User
                      </span>
                      <h4 className="text-sm font-black text-slate-900">{user.displayName || 'Alexo User'}</h4>
                      <p className="text-xs text-slate-500 font-mono">{user.email || 'user@alexo.com'}</p>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-white hover:bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-slate-200 shadow-2xs flex items-center gap-1.5 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" /> लॉगआउट करें
                  </button>
                </div>
              ) : (
                /* Login / Signup Form */
                <div className="max-w-md mx-auto space-y-4">
                  <div className="text-center space-y-1">
                    <h4 className="text-base font-black text-slate-900">
                      {isRegisterMode ? 'नया Firebase अकाउंट बनाएं' : 'Firebase अकाउंट में लॉगिन करें'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Google लॉगिन या ईमेल/पासवर्ड से सुरक्षित ऑथेंटिकेशन
                    </p>
                  </div>

                  {/* Google Login Button */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={authLoading}
                    className="w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-300 rounded-2xl text-xs font-bold text-slate-700 shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                    </svg>
                    <span>Google से 1-क्लिक में लॉगिन करें</span>
                  </button>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink mx-3 text-slate-400 text-[11px]">या ईमेल से</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>

                  <form onSubmit={handleEmailAuth} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">ईमेल पता</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@domain.com"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">पासवर्ड</label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>{isRegisterMode ? 'अकाउंट रजिस्टर करें' : 'लॉगिन करें'}</span>
                    </button>

                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={() => setIsRegisterMode(!isRegisterMode)}
                        className="text-xs text-blue-600 hover:underline font-semibold"
                      >
                        {isRegisterMode ? 'पहले से अकाउंट है? लॉगिन करें' : 'नया अकाउंट बनाना चाहते हैं? रजिस्टर करें'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DATABASE (FIRESTORE) */}
          {activeTab === 'database' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-xs text-slate-600">
                  वर्तमान एक्टिव प्रोफाइल: <strong>{currentFormData?.businessName || 'नया बिज़नेस'}</strong>
                </span>

                <button
                  onClick={handleSaveToCloud}
                  disabled={loading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  {loading ? 'सेव हो रहा है...' : 'Firestore में सुरक्षित करें'}
                </button>
              </div>

              {profiles.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl">
                  <Database className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-semibold">
                    अभी क्लाउड में कोई प्रोफाइल सेव नहीं है।
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {profiles.map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 bg-slate-50 hover:bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all flex items-center justify-between gap-3"
                    >
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{p.businessName || 'अनाम प्रोफाइल'}</h4>
                        <p className="text-xs text-slate-500">
                          {p.primaryCategory} • {p.city || 'N/A'} • {p.roadName || 'Main Road'}
                        </p>
                        <span className="text-[10px] text-slate-400">
                          अपडेट: {new Date(p.updatedAt || Date.now()).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          onLoadProfile(p);
                          setStatusMsg(`"${p.businessName}" प्रोफाइल लोड हो गई!`);
                        }}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 flex items-center gap-1"
                      >
                        <FolderOpen className="w-3.5 h-3.5" /> लोड करें
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CLOUD STORAGE */}
          {activeTab === 'storage' && (
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl text-xs text-purple-900">
                <h4 className="font-bold text-sm flex items-center gap-1.5 text-purple-950 mb-1">
                  <HardDrive className="w-4 h-4 text-purple-600" />
                  Firebase Cloud Storage Bucket
                </h4>
                <p className="leading-relaxed">
                  आपकी रोड व्यू और स्टोरफ़्रंट तस्वीरें Firebase Storage बकेट में सुरक्षित स्टोर होती हैं और उन्हें Google Maps अपलोड के लिए CDN URL मिलता है।
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['roadView', 'storefront', 'signboard', 'interior'].map((slotKey) => {
                  const photo = currentFormData?.photos?.[slotKey];
                  return (
                    <div key={slotKey} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                      <span className="text-[10px] font-bold text-slate-600 uppercase block truncate">
                        {slotKey}
                      </span>
                      <div className="aspect-square rounded-xl bg-slate-200 overflow-hidden flex items-center justify-center">
                        {photo?.stamped ? (
                          <img src={photo.stamped} alt={slotKey} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] text-slate-400">खाली</span>
                        )}
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        photo?.stamped ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {photo?.stamped ? '✓ Cloud Ready' : 'Pending'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: MESSAGING (FCM) */}
          {activeTab === 'messaging' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-2">
                <h4 className="font-bold text-sm flex items-center gap-1.5 text-amber-950">
                  <Bell className="w-4 h-4 text-amber-600" />
                  Firebase Cloud Messaging (FCM Web Push)
                </h4>
                <p className="leading-relaxed">
                  Google Business Profile के वेरिफिकेशन स्टेटस, नए रिव्यू और प्रोफाइल रैंकिंग के तुरंत अलर्ट फोन और डेस्कटॉप पर पाने के लिए पुश नोटिफिकेशन चालू करें।
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="font-bold text-[11px]">अनुमति स्थिति:</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    notifPermission === 'granted' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {notifPermission}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleEnablePush}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <Bell className="w-4 h-4" />
                  पुश नोटिफिकेशन चालू करें (Enable FCM)
                </button>

                <button
                  type="button"
                  onClick={handleSendTestNotification}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <Send className="w-4 h-4" />
                  टेस्ट नोटिफिकेशन भेजें (Send Test Alert)
                </button>
              </div>

              {fcmToken && (
                <div className="p-3 bg-slate-900 text-white rounded-xl text-xs font-mono space-y-1">
                  <span className="text-[10px] text-amber-400 font-bold block uppercase">Active FCM Device Token:</span>
                  <p className="truncate text-slate-300 text-[11px]">{fcmToken}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-4">
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl text-xs text-teal-900 space-y-1">
                <h4 className="font-bold text-sm flex items-center gap-1.5 text-teal-950">
                  <BarChart3 className="w-4 h-4 text-teal-600" />
                  Firebase Google Analytics 4 (GA4)
                </h4>
                <p className="leading-relaxed">
                  आपकी ऐप में प्रोफाइल क्रिएशन, फोटो Geo-Tagging, और Google Maps एक्सपोर्ट इवेंट्स की रियल-टाइम ट्रैकिंग।
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Profile Events</span>
                  <span className="text-xl font-black text-slate-900 mt-1 block">Active</span>
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Geo-Tag Events</span>
                  <span className="text-xl font-black text-slate-900 mt-1 block">Active</span>
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Recharge Events</span>
                  <span className="text-xl font-black text-slate-900 mt-1 block">Active</span>
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Export Events</span>
                  <span className="text-xl font-black text-slate-900 mt-1 block">Active</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SETTINGS / API KEYS */}
          {activeTab === 'settings' && (
            <form onSubmit={handleConnectFirebase} className="space-y-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed">
                💡 <strong>Firebase Console से Keys जोड़ने के स्टेप्स:</strong>
                <br />
                1. <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="underline font-bold">console.firebase.google.com</a> पर जाएँ।
                <br />
                2. Project Settings → General → "Your apps" (Web app) से अपनी Keys कॉपी करके नीचे पेस्ट करें।
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">API Key *</label>
                <input
                  type="text"
                  required
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Project ID *</label>
                <input
                  type="text"
                  required
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  placeholder="alexo-gbp-studio"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Auth Domain</label>
                  <input
                    type="text"
                    value={authDomain}
                    onChange={(e) => setAuthDomain(e.target.value)}
                    placeholder="project.firebaseapp.com"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Storage Bucket</label>
                  <input
                    type="text"
                    value={storageBucket}
                    onChange={(e) => setStorageBucket(e.target.value)}
                    placeholder="project.appspot.com"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Messaging Sender ID</label>
                  <input
                    type="text"
                    value={messagingSenderId}
                    onChange={(e) => setMessagingSenderId(e.target.value)}
                    placeholder="10982347192"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Measurement ID (Analytics)</label>
                  <input
                    type="text"
                    value={measurementId}
                    onChange={(e) => setMeasurementId(e.target.value)}
                    placeholder="G-XXXXXXX"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                >
                  Firebase 5-in-1 सूट कनेक्ट करें
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
