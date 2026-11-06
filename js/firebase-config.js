/**
 * cloudStr — Firebase Configuration
 * Products live in Firestore collection `products` (see js/products.js).
 * Cart still uses localStorage.
 *
 * Requires, before this file:
 *   firebase-app-compat.js
 *   firebase-analytics-compat.js
 * Firestore compat is loaded here if the page did not include it.
 */

window.USE_FIREBASE = true;

window.firebaseConfig = {
  apiKey: "AIzaSyCPBaDHqdv5a-MjQvj18My4-i5-zFK_CWk",
  authDomain: "cloudstr-27fdc.firebaseapp.com",
  projectId: "cloudstr-27fdc",
  storageBucket: "cloudstr-27fdc.firebasestorage.app",
  messagingSenderId: "100941999984",
  appId: "1:100941999984:web:55c81c5b323ac2485be9b5",
  measurementId: "G-DWJYXY20E5",
};

let firebaseApp = null;
let firebaseAnalytics = null;

if (window.USE_FIREBASE && window.firebase && typeof window.firebase.initializeApp === "function") {
  try {
    firebaseApp = window.firebase.initializeApp(window.firebaseConfig);
    if (typeof window.firebase.analytics === "function") {
      firebaseAnalytics = window.firebase.analytics();
    }
  } catch (err) {
    console.warn("[cloudStr] Firebase init failed:", err);
    window.USE_FIREBASE = false;
  }
} else if (window.USE_FIREBASE) {
  console.warn("[cloudStr] Firebase SDK missing on this page.");
  window.USE_FIREBASE = false;
}

function loadFirestoreSdk() {
  if (window.firebase && typeof window.firebase.firestore === "function") {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load Firestore SDK"));
    document.head.appendChild(script);
  });
}

window.CloudStrDB = {
  isFirebaseEnabled: () => window.USE_FIREBASE === true,
  getApp: () => firebaseApp,
  getAnalytics: () => firebaseAnalytics,
  db: null,
};

window.cloudstrFirestoreReady = (async () => {
  if (!window.USE_FIREBASE || !firebaseApp) return false;
  await loadFirestoreSdk();
  window.CloudStrDB.db = window.firebase.firestore();
  return true;
})().catch((err) => {
  console.warn("[cloudStr] Firestore unavailable:", err);
  return false;
});
