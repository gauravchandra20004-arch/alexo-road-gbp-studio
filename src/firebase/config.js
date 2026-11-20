import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getMessaging, isSupported as isMessagingSupported } from 'firebase/messaging';
import { getAnalytics, isSupported as isAnalyticsSupported } from 'firebase/analytics';

// Load saved config or env
const getSavedFirebaseConfig = () => {
  try {
    const saved = localStorage.getItem('gbp_firebase_config');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn(e);
  }
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ""
  };
};

export const currentConfig = getSavedFirebaseConfig();

export let app = null;
export let db = null;
export let auth = null;
export let storage = null;
export let messaging = null;
export let analytics = null;
export let isFirebaseReady = false;

export async function initFirebase(config = currentConfig) {
  try {
    if (config.apiKey && config.projectId) {
      app = getApps().length > 0 ? getApp() : initializeApp(config);
      
      // 1. Database (Firestore)
      db = getFirestore(app);

      // 2. Authentication
      auth = getAuth(app);

      // 3. Storage
      storage = getStorage(app);

      // 4. Cloud Messaging (FCM)
      const messagingSupported = await isMessagingSupported();
      if (messagingSupported) {
        messaging = getMessaging(app);
      }

      // 5. Analytics
      const analyticsSupported = await isAnalyticsSupported();
      if (analyticsSupported && config.measurementId) {
        analytics = getAnalytics(app);
      }

      isFirebaseReady = true;
      return { 
        success: true, 
        app, 
        db, 
        auth, 
        storage, 
        messaging, 
        analytics 
      };
    }
  } catch (err) {
    console.error("Firebase init error:", err);
    isFirebaseReady = false;
    return { success: false, error: err.message };
  }
  isFirebaseReady = false;
  return { success: false, message: "Firebase keys not provided yet" };
}

// Auto-run init
initFirebase();
