/**
 * cloudStr — Admin Dashboard
 * ----------------------------
 * Product CRUD over an in-memory copy of the mock catalog, plus a
 * real Orders panel reading whatever has actually been placed
 * through checkout.html (stored in localStorage by js/cart.js).
 */

let adminProducts = [];

document.addEventListener("DOMContentLoaded", () => {
  adminProducts = getAllProducts();
  renderStatCards();
  renderAdminTable();
  renderOrders();
  bindAdminUI();
});

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function renderStatCards() {
  const orders = getOrders();
  setText("stat-total", adminProducts.length);
  setText("stat-low-stock", adminProducts.filter((p) => p.stock > 0 && p.stock <= 10).length);
  setText("stat-out-stock", adminProducts.filter((p) => p.stock === 0).length);
  setText("stat-orders", orders.length);
}

function renderAdminTable() {
  const tbody = document.getElementById("admin-product-body");
  if (!tbody) return;
  if (!adminProducts.length) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state">No products yet.</div></td></tr>`;
    return;
  }
  tbody.innerHTML = adminProducts
    .map((p) => {
      const inStock = p.stock > 0;
      return `
        <tr data-id="${p.id}">
          <td data-label="Product">
            <div class="admin-product-cell">
              <img src="${p.images[0]}" alt="${p.name}">
              <strong>${p.name}</strong>
            </div>
          </td>
          <td data-label="Category">${CATEGORY_LABELS[p.category]}</td>
          <td data-label="Status"><span class="badge-pill ${inStock ? "badge-instock" : "badge-outstock"}">${inStock ? "In Stock" : "Out of Stock"}</span></td>
          <td data-label="Price">${formatPrice(p.price)}</td>
          <td data-label="Actions">
            <div class="row-actions">
              <button class="edit-btn" data-id="${p.id}" title="Edit" aria-label="Edit ${p.name}">${iconEdit()}</button>
              <button class="delete-btn danger" data-id="${p.id}" title="Delete" aria-label="Delete ${p.name}">${iconTrash()}</button>
            </div>
          </td>
        </tr>`;
    })
    .join("");
}

function renderOrders() {
  const tbody = document.getElementById("admin-orders-body");
  if (!tbody) return;
  const orders = getOrders();
  if (!orders.length) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state">No orders placed yet — try checking out from the storefront.</div></td></tr>`;
    return;
  }
  tbody.innerHTML = orders
    .map((o) => {
      const date = new Date(o.createdAt);
      return `
        <tr data-order="${o.id}">
          <td data-label="Order">#${o.id}</td>
          <td data-label="Customer">${o.shipping.name}<br><span style="color:var(--muted-2);font-size:0.76rem;">${o.shipping.phone}</span></td>
          <td data-label="Items">${o.items.reduce((n, i) => n + i.qty, 0)} item(s)</td>
          <td data-label="Total">${formatPrice(o.total)}</td>
          <td data-label="Status"><span class="badge-pill badge-new">${o.status}</span></td>
        </tr>`;
    })
    .join("");
}

function bindAdminUI() {
  document.getElementById("add-product-btn")?.addEventListener("click", () => openProductModal());

  document.getElementById("admin-product-body")?.addEventListener("click", (e) => {
    const id = e.target.closest("button")?.dataset.id;
    if (!id) return;
    const product = adminProducts.find((p) => p.id === id);
    if (!product) return;
    if (e.target.closest(".edit-btn")) openProductModal(product);
    if (e.target.closest(".delete-btn")) confirmDelete(product);
  });

  document.getElementById("modal-close")?.addEventListener("click", closeProductModal);
  document.getElementById("modal-scrim")?.addEventListener("click", (e) => {
    if (e.target.id === "modal-scrim") closeProductModal();
  });
  document.getElementById("product-form")?.addEventListener("submit", handleFormSubmit);

  document.getElementById("confirm-close")?.addEventListener("click", closeConfirmModal);
  document.getElementById("confirm-cancel")?.addEventListener("click", closeConfirmModal);
  document.getElementById("confirm-scrim")?.addEventListener("click", (e) => {
    if (e.target.id === "confirm-scrim") closeConfirmModal();
  });
  document.getElementById("confirm-delete-btn")?.addEventListener("click", () => {
    if (!pendingDeleteId) return;
    adminProducts = adminProducts.filter((p) => p.id !== pendingDeleteId);
    renderStatCards();
    renderAdminTable();
    showToast("Product removed (this session only)");
    closeConfirmModal();
  });
}

let pendingDeleteId = null;
function confirmDelete(product) {
  pendingDeleteId = product.id;
  document.getElementById("confirm-text").textContent = `Delete "${product.name}"? This only affects this session.`;
  document.getElementById("confirm-scrim").classList.add("open");
}
function closeConfirmModal() {
  pendingDeleteId = null;
  document.getElementById("confirm-scrim")?.classList.remove("open");
}

function openProductModal(product = null) {
  const scrim = document.getElementById("modal-scrim");
  const form = document.getElementById("product-form");
  const title = document.getElementById("modal-title");
  if (!scrim || !form) return;
  form.reset();
  form.dataset.editingId = product ? product.id : "";
  title.textContent = product ? `Edit ${product.name}` : "Add product";
  if (product) {
    form.elements["name"].value = product.name;
    form.elements["category"].value = product.category;
    form.elements["price"].value = product.price;
    form.elements["stock"].value = product.stock;
    form.elements["description"].value = product.description;
  }
  scrim.classList.add("open");
}
function closeProductModal() {
  document.getElementById("modal-scrim")?.classList.remove("open");
}

function handleFormSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const editingId = form.dataset.editingId;
  const values = {
    name: form.elements["name"].value.trim(),
    category: form.elements["category"].value,
    price: parseFloat(form.elements["price"].value) || 0,
    stock: parseInt(form.elements["stock"].value, 10) || 0,
    description: form.elements["description"].value.trim(),
  };
  if (!values.name) {
    showToast("Product name is required", "error");
    return;
  }
  if (editingId) {
    const product = adminProducts.find((p) => p.id === editingId);
    Object.assign(product, values);
    showToast(`${product.name} updated`);
  } else {
    adminProducts.unshift({
      id: "p" + Date.now(), slug: values.name.toLowerCase().replace(/\s+/g, "-"),
      images: ["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?q=80&w=800&auto=format&fit=crop"],
      compareAt: null, isNew: true, specs: {}, reviews: [], ...values,
    });
    showToast(`${values.name} added (this session only)`);
  }
  renderStatCards();
  renderAdminTable();
  closeProductModal();
}

function iconEdit() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>';
}
function iconTrash() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>';
}
