import { 
  db, 
  auth, 
  storage, 
  messaging, 
  analytics, 
  isFirebaseReady 
} from './config';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { getToken } from 'firebase/messaging';
import { logEvent } from 'firebase/analytics';

const LOCAL_CLOUD_STORE_KEY = 'gbp_firebase_mock_cloud_store';
const LOCAL_USER_KEY = 'alexo_firebase_user_session';

// ==========================================
// 1. FIREBASE AUTHENTICATION MODULE
// ==========================================

export async function loginWithGoogle() {
  if (isFirebaseReady && auth) {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      return { success: true, user: result.user, mode: 'firebase_live' };
    } catch (err) {
      console.warn("Firebase Google login error:", err);
      return { success: false, error: err.message };
    }
  }

  // Fallback Dev / Offline user simulation
  const mockUser = {
    uid: 'mock_google_' + Date.now().toString(36),
    displayName: 'Alexo Partner User',
    email: 'admin@alexostudio.com',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    mode: 'dev_sandbox'
  };
  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(mockUser));
  return { success: true, user: mockUser, mode: 'dev_sandbox' };
}

export async function loginWithEmailPassword(email, password) {
  if (isFirebaseReady && auth) {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: cred.user, mode: 'firebase_live' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // Fallback Dev
  const mockUser = {
    uid: 'mock_email_' + Date.now().toString(36),
    displayName: email.split('@')[0],
    email: email,
    mode: 'dev_sandbox'
  };
  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(mockUser));
  return { success: true, user: mockUser, mode: 'dev_sandbox' };
}

export async function registerWithEmailPassword(email, password, displayName = '') {
  if (isFirebaseReady && auth) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(cred.user, { displayName });
      }
      return { success: true, user: cred.user, mode: 'firebase_live' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  const mockUser = {
    uid: 'mock_user_' + Date.now().toString(36),
    displayName: displayName || email.split('@')[0],
    email: email,
    mode: 'dev_sandbox'
  };
  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(mockUser));
  return { success: true, user: mockUser, mode: 'dev_sandbox' };
}

export async function logoutUser() {
  if (isFirebaseReady && auth) {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn(e);
    }
  }
  localStorage.removeItem(LOCAL_USER_KEY);
  return { success: true };
}

export function getCurrentUser() {
  if (isFirebaseReady && auth?.currentUser) {
    return auth.currentUser;
  }
  try {
    const raw = localStorage.getItem(LOCAL_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ==========================================
// 2. FIREBASE DATABASE (FIRESTORE) MODULE
// ==========================================

function getLocalMockStore() {
  try {
    const raw = localStorage.getItem(LOCAL_CLOUD_STORE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalMockStore(items) {
  try {
    localStorage.setItem(LOCAL_CLOUD_STORE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn(e);
  }
}

export async function saveProfileToBackend(profileData) {
  const payload = {
    ...profileData,
    updatedAt: new Date().toISOString()
  };

  // Track Analytics
  trackEvent('profile_saved', { name: profileData.businessName });

  // 1. Post to Express backend
  try {
    fetch('/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {});
  } catch {}

  // 2. Real Firestore
  if (isFirebaseReady && db) {
    try {
      const docRef = await addDoc(collection(db, "gbp_profiles"), {
        ...payload,
        createdAt: serverTimestamp()
      });
      return { success: true, id: docRef.id, mode: 'firebase_live' };
    } catch (err) {
      console.warn("Firestore fallback:", err);
    }
  }

  // 3. Fallback cache
  const existing = getLocalMockStore();
  const newId = profileData.id || 'cloud_' + Date.now().toString(36);
  const newEntry = { id: newId, ...payload, mode: 'local_cloud_cache' };
  saveLocalMockStore([newEntry, ...existing.filter(e => e.id !== newId)]);

  return { success: true, id: newId, mode: 'local_cloud_cache' };
}

export async function fetchProfilesFromBackend() {
  if (isFirebaseReady && db) {
    try {
      const q = query(collection(db, "gbp_profiles"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (list.length > 0) return { success: true, data: list, mode: 'firebase_live' };
    } catch (err) {
      console.warn(err);
    }
  }

  // Check Express or local
  try {
    const res = await fetch('/api/profiles');
    if (res.ok) {
      const json = await res.json();
      if (json.data && json.data.length > 0) {
        return { success: true, data: json.data, mode: 'express_backend' };
      }
    }
  } catch {}

  const list = getLocalMockStore();
  return { success: true, data: list, mode: 'local_cloud_cache' };
}

// ==========================================
// 3. FIREBASE CLOUD STORAGE MODULE
// ==========================================

export async function uploadPhotoToCloudStorage(dataUrl, pathName = 'road_photos') {
  if (!dataUrl) return { success: false, error: 'No data URL provided' };

  if (isFirebaseReady && storage) {
    try {
      const fileName = `${pathName}/${Date.now()}_geo.jpg`;
      const storageRef = ref(storage, fileName);
      await uploadString(storageRef, dataUrl, 'data_url');
      const downloadUrl = await getDownloadURL(storageRef);
      trackEvent('photo_uploaded', { path: fileName });
      return { success: true, url: downloadUrl, mode: 'firebase_live' };
    } catch (err) {
      console.warn("Storage upload error:", err);
    }
  }

  // Local dataUrl fallback
  return { success: true, url: dataUrl, mode: 'local_storage_cached' };
}

// ==========================================
// 4. FIREBASE CLOUD MESSAGING (FCM) MODULE
// ==========================================

export async function requestPushPermission() {
  if (!("Notification" in window)) {
    return { success: false, message: "Browser does not support notifications" };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      let fcmToken = null;
      if (isFirebaseReady && messaging) {
        try {
          fcmToken = await getToken(messaging, {
            vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || ""
          });
        } catch (e) {
          console.warn("FCM Token fetch skipped:", e);
        }
      }
      return { 
        success: true, 
        token: fcmToken || 'token_sample_' + Date.now().toString(36), 
        permission: 'granted' 
      };
    }
    return { success: false, permission };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export function sendLocalAppNotification(title, body) {
  if (!("Notification" in window) || Notification.permission !== 'granted') {
    return false;
  }
  try {
    new Notification(title, {
      body,
      icon: '/favicon.svg',
      badge: '/favicon.svg'
    });
    return true;
  } catch {
    return false;
  }
}

// ==========================================
// 5. FIREBASE ANALYTICS MODULE
// ==========================================

export function trackEvent(eventName, params = {}) {
  try {
    if (isFirebaseReady && analytics) {
      logEvent(analytics, eventName, params);
    }
    // Also log in debug console
    console.debug(`[ALEXO Analytics Event] ${eventName}:`, params);
  } catch (err) {
    console.debug(err);
  }
}
