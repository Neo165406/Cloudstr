/**
 * VOLT//VOID — Firebase Configuration (prototype)
 * --------------------------------------------------
 * This project is architected to eventually run on Firebase
 * (Firestore for data, Auth for admin login, Storage for media).
 *
 * IMPORTANT: No real credentials are included. Replace the
 * placeholder values below with your own Firebase project config
 * when you're ready to go live, then flip USE_FIREBASE to true.
 *
 * Until then, the app runs entirely on local mock data defined in
 * js/products.js — every page works with zero backend configured.
 */

// Toggle this to `true` once real Firebase credentials are supplied
// and the Firebase SDK scripts are included in the HTML.
window.USE_FIREBASE = false;

window.firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

/**
 * Planned Firestore collection shape (for future implementation):
 *
 * /products/{productId}
 *    name, slug, category, description, specs{}, images[],
 *    price, rating, reviewCount, stock, featured, isNew, createdAt
 *
 * /categories/{categoryId}
 *    name, slug, description, sortOrder
 *
 * /users/{userId}
 *    email, role ("admin" | "customer"), wishlist[], createdAt
 *
 * /orders/{orderId}
 *    userId, items[], status, createdAt
 *    NOTE: order/checkout logic is intentionally NOT implemented
 *    in this prototype — see README notes in admin.js.
 *
 * Data access layer: js/products.js exposes getProducts(), getProductBySlug()
 * etc. that read from local mock data today. Swapping USE_FIREBASE to true
 * and wiring those functions to Firestore queries (getDocs, onSnapshot, etc.)
 * should require no changes to the pages that call them.
 */
window.VoltVoidDB = {
  isFirebaseEnabled: () => window.USE_FIREBASE === true,
};
