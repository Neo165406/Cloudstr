/**
 * cloudStr — Firebase Configuration
 * --------------------------------------------------
 * Wired to the same real Firebase project used for the earlier
 * VOLT//VOID prototype (cloudstr-27fdc). Firestore/Storage/Auth
 * calls are NOT implemented yet — the storefront still runs on
 * local mock data (js/products.js) and cart/orders in localStorage
 * (js/cart.js) — but Firebase app + Analytics initialize on every
 * page.
 *
 * This file expects the Firebase compat SDK scripts loaded BEFORE
 * it on the page:
 *   <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>
 *   <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics-compat.js"></script>
 *   <script src="js/firebase-config.js"></script>
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
    console.warn("[cloudStr] Firebase init failed, falling back to mock data:", err);
    window.USE_FIREBASE = false;
  }
} else if (window.USE_FIREBASE) {
  console.warn("[cloudStr] USE_FIREBASE is true but the Firebase SDK wasn't found on this page — falling back to mock data.");
  window.USE_FIREBASE = false;
}

/**
 * Planned Firestore collection shape (future implementation):
 * /products/{id}, /categories/{id}, /orders/{id} (mirrors the
 * localStorage order objects written by js/cart.js), /users/{id}.
 * Swapping getAllProducts()/placeOrder() etc. to Firestore calls
 * should require no changes to the pages that call them.
 */
window.CloudStrDB = {
  isFirebaseEnabled: () => window.USE_FIREBASE === true,
  getApp: () => firebaseApp,
  getAnalytics: () => firebaseAnalytics,
};
