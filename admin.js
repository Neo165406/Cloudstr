/**
 * VOLT//VOID — Admin Dashboard
 * -----------------------------
 * Prototype CRUD interactions over an in-memory copy of the mock
 * catalog (see products.js). Nothing here talks to a real backend —
 * when USE_FIREBASE is flipped on in firebase-config.js, these
 * functions are the layer to rewire to Firestore writes.
 */

let adminProducts = [];

document.addEventListener("DOMContentLoaded", () => {
  adminProducts = getAllProducts();
  renderStatCards();
  renderAdminTable();
  bindAdminUI();
});

function renderStatCards() {
  const total = adminProducts.length;
  const featured = adminProducts.filter((p) => p.featured).length;
  const lowStock = adminProducts.filter((p) => p.stock > 0 && p.stock <= 8).length;
  const newItems = adminProducts.filter((p) => p.isNew).length;

  setText("stat-total", total);
  setText("stat-featured", featured);
  setText("stat-low-stock", lowStock);
  setText("stat-new", newItems);
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function renderAdminTable() {
  const tbody = document.getElementById("admin-product-body");
  if (!tbody) return;

  if (!adminProducts.length) {
    tbody.innerHTML = `<tr><td colspan="5">
      <div class="empty-state">No products yet. Use "Add product" to create your first item.</div>
    </td></tr>`;
    return;
  }

  tbody.innerHTML = adminProducts
    .map((p) => {
      const status = stockStatus(p.stock);
      return `
        <tr data-id="${p.id}">
          <td data-label="Product">
            <div class="admin-product-cell">
              <img src="${p.images[0]}" alt="${p.name}">
              <div>
                <strong>${p.name}</strong>
                ${p.featured ? '<div class="tag tag-purple" style="margin-top:4px;display:inline-block;">Featured</div>' : ""}
              </div>
            </div>
          </td>
          <td data-label="Category">${CATEGORY_LABELS[p.category]}</td>
          <td data-label="Status"><span class="status-pill ${status.cls}">${status.label}</span></td>
          <td data-label="Price">$${p.price.toFixed(2)}</td>
          <td data-label="Actions">
            <div class="row-actions">
              <button class="edit-btn" data-id="${p.id}" title="Edit" aria-label="Edit ${p.name}">${iconEdit()}</button>
              <button class="feature-btn" data-id="${p.id}" title="${p.featured ? "Unfeature" : "Feature"}" aria-label="Toggle feature for ${p.name}">${iconStar()}</button>
              <button class="delete-btn danger" data-id="${p.id}" title="Delete" aria-label="Delete ${p.name}">${iconTrash()}</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function bindAdminUI() {
  document.getElementById("add-product-btn")?.addEventListener("click", () => openProductModal());

  const tbody = document.getElementById("admin-product-body");
  tbody?.addEventListener("click", (e) => {
    const id = e.target.closest("button")?.dataset.id;
    if (!id) return;
    const product = adminProducts.find((p) => p.id === id);
    if (!product) return;

    if (e.target.closest(".edit-btn")) openProductModal(product);
    if (e.target.closest(".feature-btn")) toggleFeature(id);
    if (e.target.closest(".delete-btn")) confirmDelete(product);
  });

  document.getElementById("modal-close")?.addEventListener("click", closeProductModal);
  document.getElementById("modal-scrim")?.addEventListener("click", (e) => {
    if (e.target.id === "modal-scrim") closeProductModal();
  });
  document.getElementById("product-form")?.addEventListener("submit", handleFormSubmit);

  document.getElementById("confirm-close")?.addEventListener("click", closeConfirmModal);
  document.getElementById("confirm-scrim")?.addEventListener("click", (e) => {
    if (e.target.id === "confirm-scrim") closeConfirmModal();
  });
  document.getElementById("confirm-cancel")?.addEventListener("click", closeConfirmModal);
}

/* ---------------------------------------------------------------
   Feature / unfeature
--------------------------------------------------------------- */
function toggleFeature(id) {
  const product = adminProducts.find((p) => p.id === id);
  if (!product) return;
  product.featured = !product.featured;
  renderStatCards();
  renderAdminTable();
  showToast(product.featured ? `${product.name} marked as featured` : `${product.name} removed from featured`);
}

/* ---------------------------------------------------------------
   Delete (with confirm modal)
--------------------------------------------------------------- */
let pendingDeleteId = null;

function confirmDelete(product) {
  pendingDeleteId = product.id;
  document.getElementById("confirm-text").textContent =
    `Delete "${product.name}"? This only affects this prototype session — nothing is sent to a server.`;
  document.getElementById("confirm-scrim").classList.add("open");
}

function closeConfirmModal() {
  pendingDeleteId = null;
  document.getElementById("confirm-scrim")?.classList.remove("open");
}

document.addEventListener("click", (e) => {
  if (e.target.id === "confirm-delete-btn" && pendingDeleteId) {
    adminProducts = adminProducts.filter((p) => p.id !== pendingDeleteId);
    renderStatCards();
    renderAdminTable();
    showToast("Product removed (prototype session only)");
    closeConfirmModal();
  }
});

/* ---------------------------------------------------------------
   Add / edit modal
--------------------------------------------------------------- */
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
    form.elements["featured"].checked = product.featured;
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
    featured: form.elements["featured"].checked,
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
      id: `p${Date.now()}`,
      slug: values.name.toLowerCase().replace(/\s+/g, "-"),
      images: ["https://images.unsplash.com/photo-1585386959984-a4155224a1ad?q=80&w=800&auto=format&fit=crop"],
      rating: 0,
      reviewCount: 0,
      isNew: true,
      specs: {},
      reviews: [],
      ...values,
    });
    showToast(`${values.name} added (prototype session only)`);
  }

  renderStatCards();
  renderAdminTable();
  closeProductModal();
}

/* ---------------------------------------------------------------
   Icons
--------------------------------------------------------------- */
function iconEdit() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>';
}
function iconStar() {
  return '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 1l2.6 6.3 6.4.5-5 4.4 1.6 6.6-5.6-3.6-5.6 3.6 1.6-6.6-5-4.4 6.4-.5z"/></svg>';
}
function iconTrash() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>';
}
