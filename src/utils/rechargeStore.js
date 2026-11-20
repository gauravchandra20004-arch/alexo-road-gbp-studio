/**
 * ALEXO Recharge & Subscription Store
 * Official UPI ID: fino.7799587585@finobank
 * Plans Range: Low ₹499 to High ₹1499 Category-Wise
 */

const RECHARGE_STORAGE_KEY = 'alexo_recharge_plan_v1';
export const OFFICIAL_UPI_ID = 'fino.7799587585@finobank';
export const OFFICIAL_QR_PATH = '/payment_qr.jpg';

export const RECHARGE_PLANS = [
  {
    id: 'starter_shop',
    category: 'सिंगल शॉप / रीटेल कैटेगरी',
    name: 'Single Shop Starter Plan',
    price: 499,
    originalPrice: 999,
    durationDays: 30,
    credits: 50,
    badge: 'Starting Plan',
    popular: false,
    features: [
      '1 Google Business Profile',
      '50 Geo-Tagged Road Photos (Mini Map + Arrow)',
      'Dual-Pin Road Entrance Navigation',
      'Gemini AI 750-Char Local SEO',
      '30 दिन की पूरी वैधता'
    ]
  },
  {
    id: 'pro_business',
    category: 'मल्टी-बिज़नेस / कमर्शियल कैटेगरी',
    name: 'Pro Commercial Business Plan',
    price: 899,
    originalPrice: 1999,
    durationDays: 90,
    credits: 250,
    badge: 'सबसे लोकप्रिय (Recommended)',
    popular: true,
    features: [
      '5 Google Business Profiles',
      'Unlimited Road Photos with Mini Map & Arrow',
      'Phone Camera Live AR Viewfinder',
      'Google Video Verification Pass Checklist',
      '90 दिन (3 महीने) की वैधता'
    ]
  },
  {
    id: 'agency_highest',
    category: 'एजेंसी व एंटरप्राइज कैटेगरी (Highest)',
    name: 'Enterprise / Agency Master Plan',
    price: 1499,
    originalPrice: 3999,
    durationDays: 365,
    credits: 9999,
    badge: 'Highest VIP Plan',
    popular: false,
    features: [
      'अनलिमिटेड प्रोफाइल्स व क्लाइंट्स',
      'Master Admin Vault फुल एक्सेस',
      'CSV / Excel अनलिमिटेड क्लाइंट डेटा एक्सपोर्ट',
      'Firebase 5-in-1 Backend Suite इंटीग्रेशन',
      '365 दिन (1 साल) की फुल VIP वैधता'
    ]
  }
];

export function getRechargeStatus() {
  try {
    const raw = localStorage.getItem(RECHARGE_STORAGE_KEY);
    if (!raw) return { isRecharged: false, plan: null };

    const data = JSON.parse(raw);
    const now = new Date().getTime();
    const expiry = new Date(data.expiryDate).getTime();

    if (now > expiry) {
      return { isRecharged: false, expired: true, plan: data };
    }

    const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    return {
      isRecharged: true,
      plan: data,
      daysLeft,
      credits: data.credits || 100
    };
  } catch {
    return { isRecharged: false, plan: null };
  }
}

export function activateRecharge(planId, utrNumber = '') {
  const selectedPlan = RECHARGE_PLANS.find(p => p.id === planId) || RECHARGE_PLANS[0];
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + selectedPlan.durationDays);

  const payload = {
    planId: selectedPlan.id,
    planName: selectedPlan.name,
    category: selectedPlan.category,
    price: selectedPlan.price,
    credits: selectedPlan.credits,
    utrNumber: utrNumber || ('UTR' + Date.now().toString().slice(-8)),
    activatedAt: new Date().toISOString(),
    expiryDate: expiryDate.toISOString()
  };

  localStorage.setItem(RECHARGE_STORAGE_KEY, JSON.stringify(payload));
  return { success: true, plan: payload };
}

export function clearRecharge() {
  localStorage.removeItem(RECHARGE_STORAGE_KEY);
}
