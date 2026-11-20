import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Unlock, 
  Key, 
  ShieldCheck, 
  Database, 
  Download, 
  Trash2, 
  Search, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Clock, 
  X, 
  MapPin, 
  Phone, 
  Building, 
  RefreshCw, 
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';

const AUTH_STORAGE_KEY = 'gbp_admin_backend_token';

export default function AdminPortal({ isOpen, onClose, onLoadProfile }) {
  const [token, setToken] = useState(() => {
    return sessionStorage.getItem(AUTH_STORAGE_KEY) || '';
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Data states
  const [profiles, setProfiles] = useState([]);
  const [payments, setPayments] = useState([]);
  const [activeAdminTab, setActiveAdminTab] = useState('profiles'); // 'profiles' or 'payments'
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProfile, setSelectedProfile] = useState(null);

  // Fetch profiles & payments when logged in
  const fetchAllData = async (authToken = token) => {
    if (!authToken) return;
    setIsLoadingData(true);
    try {
      const [resProfiles, resPayments] = await Promise.all([
        fetch('/api/admin/profiles', {
          headers: { 'Authorization': `Bearer ${authToken}` }
        }),
        fetch('/api/admin/payments', {
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      ]);
      const jsonProfiles = await resProfiles.json();
      const jsonPayments = await resPayments.json();

      if (jsonProfiles.success) {
        setProfiles(jsonProfiles.data || []);
      }
      if (jsonPayments.success) {
        setPayments(jsonPayments.data || []);
      }
      if (resProfiles.status === 401 || resProfiles.status === 403) {
        handleLogout();
      }
    } catch (err) {
      console.error("Backend fetch error:", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (isOpen && token) {
      fetchAllData(token);
    }
  }, [isOpen, token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password.trim()) return;
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() })
      });
      const data = await res.json();

      if (data.success && data.token) {
        sessionStorage.setItem(AUTH_STORAGE_KEY, data.token);
        setToken(data.token);
        setPassword('');
        fetchAllData(data.token);
      } else {
        setLoginError(data.error || "गलत पासवर्ड! कृपया सही पासवर्ड दर्ज करें।");
      }
    } catch {
      setLoginError("सर्वर से कनेक्ट करने में समस्या आई।");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    setToken('');
    setProfiles([]);
    setSelectedProfile(null);
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/admin/profiles/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const json = await res.json();
      if (json.success) {
        setProfiles(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`क्या आप सचमुच "${name}" की प्रोफाइल डेटाबेस से हटाना चाहते हैं?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/profiles/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const json = await res.json();
      if (json.success) {
        setProfiles(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadCsv = () => {
    window.open('/api/admin/export/csv', '_blank');
  };

  if (!isOpen) return null;

  // Filtered profiles
  const filteredProfiles = profiles.filter(p => {
    const matchesSearch = (p.businessName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.city || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.contactNumber || '').includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-slate-900 text-slate-100 rounded-3xl shadow-2xl border border-slate-800 w-full max-w-5xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg text-white tracking-tight">
                  Master Backend Vault
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                  Private & Encrypted
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                काम का सारा गोपनीय डेटाबेस • केवल ऑथराइज्ड एडमिन एक्सेस
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {token && (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-red-400 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <Lock className="w-3.5 h-3.5" /> लॉक करें (Logout)
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 bg-slate-900/90 space-y-5">
          {/* If NOT logged in: Show Password Gate */}
          {!token ? (
            <div className="max-w-md mx-auto py-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                <Key className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-xl font-black text-white">एडमिन ऑथेंटिकेशन आवश्यक</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  यह डेटाबेस केवल आपके लिए सुरक्षित है। एक्सेस करने के लिए अपना मास्टर पासवर्ड दर्ज करें।
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Master Admin Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="पासवर्ड दर्ज करें..."
                      className="w-full pl-4 pr-11 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {loginError && (
                  <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-xl text-xs text-red-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                >
                  <Unlock className="w-4 h-4" />
                  {isLoggingIn ? "जांच रहे हैं..." : "डेटाबेस अनलॉक करें (Unlock)"}
                </button>
              </form>
            </div>
          ) : (
            /* Logged in: Master Database Dashboard */
            <div className="space-y-5">
              {/* Stats Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-bold block uppercase">कुल प्रोफाइल्स (Leads)</span>
                  <span className="text-2xl font-black text-white mt-1 block">{profiles.length}</span>
                </div>
                <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[11px] text-amber-400 font-bold block uppercase">कुल पेमेंट्स (Orders)</span>
                  <span className="text-2xl font-black text-amber-400 mt-1 block">
                    {payments.length}
                  </span>
                </div>
                <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[11px] text-emerald-400 font-bold block uppercase">Live on Google Maps</span>
                  <span className="text-2xl font-black text-emerald-400 mt-1 block">
                    {profiles.filter(p => p.status === 'Live on Google Maps').length}
                  </span>
                </div>
                <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[11px] text-blue-400 font-bold block uppercase">Total Road Pins</span>
                  <span className="text-2xl font-black text-blue-400 mt-1 block">
                    {profiles.filter(p => p.roadEntranceLat).length}
                  </span>
                </div>
              </div>

              {/* Tab Selector: Profiles vs Payments */}
              <div className="flex gap-2 border-b border-slate-800 pb-2">
                <button
                  type="button"
                  onClick={() => setActiveAdminTab('profiles')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                    activeAdminTab === 'profiles'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  📁 कस्टमर प्रोफाइल्स व लीड्स ({profiles.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveAdminTab('payments')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                    activeAdminTab === 'payments'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-black'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  💰 पेमेंट्स व UTR ऑर्डर्स ({payments.length})
                </button>
              </div>

              {/* Action & Filter Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                <div className="flex-1 flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="बिज़नेस नाम, शहर या फोन नंबर से खोजें..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  {activeAdminTab === 'profiles' && (
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none"
                    >
                      <option value="all">सभी स्टेटस</option>
                      <option value="Pending Verification">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Live on Google Maps">Live on Maps</option>
                    </select>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchAllData()}
                    className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-700 transition-colors"
                    title="रिफ्रेश करें"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin' : ''}`} />
                  </button>

                  <button
                    onClick={handleDownloadCsv}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                  >
                    <FileSpreadsheet className="w-4 h-4" /> Excel/CSV एक्सपोर्ट
                  </button>
                </div>
              </div>

              {/* VIEW 1: PAYMENTS TAB */}
              {activeAdminTab === 'payments' && (
                <div className="space-y-3">
                  {payments.length === 0 ? (
                    <div className="py-12 text-center border-2 border-dashed border-slate-800 rounded-2xl">
                      <p className="text-sm font-semibold text-slate-400">
                        अभी कोई नया पेमेंट या रिचार्ज रिकॉर्ड नहीं आया है।
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        जैसे ही कोई ग्राहक Fino QR स्कैन करके UTR दर्ज करेगा, वह तुरंत यहाँ लाइव दिखेगा।
                      </p>
                    </div>
                  ) : (
                    payments.map((p) => (
                      <div key={p.id} className="p-4 bg-slate-950/80 rounded-2xl border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-black text-amber-400">₹{p.amount}</span>
                            <span className="text-xs font-bold text-white">{p.businessName || p.customerName}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              {p.planName}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 flex flex-wrap gap-x-4">
                            <span>📞 {p.customerPhone}</span>
                            <span className="font-mono text-amber-300">UTR: {p.utrNumber}</span>
                            <span className="text-slate-500">{new Date(p.createdAt).toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={`https://wa.me/${(p.customerPhone || '').replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all"
                          >
                            WhatsApp पर संपर्क करें
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* VIEW 2: PROFILES TAB */}
              {activeAdminTab === 'profiles' && (filteredProfiles.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-slate-800 rounded-2xl">
                  <Database className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-400">
                    {searchTerm ? "सर्च से मेल खाने वाला कोई रिकॉर्ड नहीं मिला।" : "अभी बैकएंड में कोई प्रोफाइल सेव नहीं है।"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    ऐप के किसी भी फॉर्म से प्रोफाइल सेव करें, वह तुरंत यहाँ दिखाई देगी।
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredProfiles.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 bg-slate-950/80 hover:bg-slate-950 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-sm text-white">
                            {item.businessName || 'अनाम बिज़नेस'}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            {item.primaryCategory}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === 'Live on Google Maps'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            ● {item.status || 'Pending Verification'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                          {item.contactNumber && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-500" /> {item.contactNumber}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-red-400" />
                            {item.roadName || 'Main Road'}, {item.city || 'N/A'} ({item.pincode || ''})
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">
                            GPS: {item.latitude}, {item.longitude}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <select
                          value={item.status || 'Pending Verification'}
                          onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                          className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-medium text-slate-200"
                        >
                          <option value="Pending Verification">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Live on Google Maps">Live on Maps</option>
                        </select>

                        <button
                          onClick={() => {
                            onLoadProfile(item);
                            onClose();
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors"
                        >
                          एडिट करें
                        </button>

                        <button
                          onClick={() => handleDelete(item.id, item.businessName)}
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="हटाएं"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
