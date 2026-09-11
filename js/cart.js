/**
 * cloudStr — Cart & Checkout
 * ----------------------------
 * A fully working cart persisted to localStorage, plus a checkout
 * flow that collects shipping details and places an order.
 *
 * IMPORTANT: there is no real payment gateway wired up here. The
 * only payment method offered is Cash on Delivery, which is the
 * honest option for a static front-end with no backend — building
 * a fake "enter your card number" form with nowhere secure for that
 * data to go would be misleading, so that's intentionally not here.
 * Orders are written to localStorage and are visible in admin.html.
 */

const CART_KEY = "cs_cart";
const ORDERS_KEY = "cs_orders";

/* ---------------------------------------------------------------
   Cart state
--------------------------------------------------------------- */
function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(productId, qty = 1) {
  const cart = getCart();
  const existing = cart.find((item) => item.id === productId);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id: productId, qty });
  }
  saveCart(cart);
}

function updateCartQty(productId, qty) {
  let cart = getCart();
  if (qty <= 0) {
    cart = cart.filter((item) => item.id !== productId);
  } else {
    const item = cart.find((i) => i.id === productId);
    if (item) item.qty = qty;
  }
  saveCart(cart);
}

function removeFromCart(productId) {
  const cart = getCart().filter((item) => item.id !== productId);
  saveCart(cart);
}

function clearCart() {
  saveCart([]);
}

function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

function getCartDetails() {
  const cart = getCart();
  const allProducts = getAllProducts();
  const lines = cart
    .map((item) => {
      const product = allProducts.find((p) => p.id === item.id);
      if (!product) return null;
      return { product, qty: item.qty, lineTotal: product.price * item.qty };
    })
    .filter(Boolean);
  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const shipping = subtotal > 0 ? (subtotal >= 3000 ? 0 : 80) : 0;
  const total = subtotal + shipping;
  return { lines, subtotal, shipping, total };
}

function updateCartBadge() {
  const badge = document.getElementById("cart-count");
  if (!badge) return;
  const count = getCartCount();
  badge.textContent = count;
  badge.style.display = count > 0 ? "flex" : "none";
}

/* ---------------------------------------------------------------
   Add-to-cart button delegation (used on home/shop/product pages)
--------------------------------------------------------------- */
function initCartDelegation() {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add-to-cart]");
    if (!btn || btn.disabled) return;
    e.preventDefault();
    const id = btn.getAttribute("data-add-to-cart");
    const qty = Number(btn.getAttribute("data-qty")) || 1;
    addToCart(id, qty);
    showToast("Added to cart");
  });
}

/* ---------------------------------------------------------------
   Orders
--------------------------------------------------------------- */
function getOrders() {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
  } catch {
    return [];
  }
}

function placeOrder(shipping) {
  const { lines, subtotal, shipping: shippingCost, total } = getCartDetails();
  if (!lines.length) return null;

  const order = {
    id: "CS" + Date.now().toString().slice(-8),
    createdAt: new Date().toISOString(),
    status: "Pending",
    payment: "Cash on Delivery",
    shipping,
    items: lines.map((l) => ({ id: l.product.id, name: l.product.name, price: l.product.price, qty: l.qty, lineTotal: l.lineTotal })),
    subtotal,
    shippingCost,
    total,
  };

  const orders = getOrders();
  orders.unshift(order);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  clearCart();
  return order;
}

document.addEventListener("DOMContentLoaded", () => {
  initCartDelegation();
  updateCartBadge();
});
