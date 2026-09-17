/**
 * cloudStr — Admin Dashboard
 * ----------------------------
 * Product CRUD over an in-memory copy of the mock catalog, a real
 * Orders panel reading whatever has actually been placed through
 * checkout.html, and two admin-managed, localStorage-backed panels
 * that drive the homepage: the Best/New Products slider and the
 * Models collage (see js/featured.js).
 */

let adminProducts = [];
let editingModelId = null;

document.addEventListener("DOMContentLoaded", () => {
  adminProducts = getAllProducts();
  renderStatCards();
  renderAdminTable();
  renderBestPanel();
  renderModelsPanel();
  renderOrders();
  bindAdminUI();
  bindFeaturedUI();
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

/* ---------------------------------------------------------------
   Best / New Products slider panel
--------------------------------------------------------------- */
function renderBestPanel() {
  const tbody = document.getElementById("admin-best-body");
  if (!tbody) return;
  const bestIds = getBestProductIds();
  tbody.innerHTML = adminProducts
    .map(
      (p) => `
        <tr>
          <td data-label="Product">
            <div class="admin-product-cell">
              <img src="${p.images[0]}" alt="${p.name}">
              <strong>${p.name}</strong>
            </div>
          </td>
          <td data-label="Category">${CATEGORY_LABELS[p.category]}</td>
          <td data-label="Featured"><input type="checkbox" class="best-toggle" data-id="${p.id}" ${bestIds.includes(p.id) ? "checked" : ""}></td>
        </tr>`
    )
    .join("");
}

/* ---------------------------------------------------------------
   Models collage panel
--------------------------------------------------------------- */
function renderModelsPanel() {
  const tbody = document.getElementById("admin-models-body");
  if (!tbody) return;
  const models = getModels();
  if (!models.length) {
    tbody.innerHTML = `<tr><td colspan="4"><div class="empty-state">No photos yet.</div></td></tr>`;
    return;
  }
  tbody.innerHTML = models
    .map(
      (m) => `
        <tr data-id="${m.id}">
          <td data-label="Photo"><img src="${m.image}" alt="${m.name}" style="width:44px;height:44px;object-fit:cover;border-radius:6px;"></td>
          <td data-label="Name">${m.name}</td>
          <td data-label="Caption">${m.caption || ""}</td>
          <td data-label="Actions">
            <div class="row-actions">
              <button class="edit-model-btn" data-id="${m.id}" title="Edit" aria-label="Edit ${m.name}">${iconEdit()}</button>
              <button class="delete-model-btn danger" data-id="${m.id}" title="Delete" aria-label="Delete ${m.name}">${iconTrash()}</button>
            </div>
          </td>
        </tr>`
    )
    .join("");
}

function openModelModal(model = null) {
  editingModelId = model ? model.id : null;
  const scrim = document.getElementById("model-modal-scrim");
  const form = document.getElementById("model-form");
  if (!scrim || !form) return;
  form.reset();
  document.getElementById("model-modal-title").textContent = model ? `Edit ${model.name}` : "Add photo";
  if (model) {
    form.elements["name"].value = model.name;
    form.elements["image"].value = model.image;
    form.elements["caption"].value = model.caption || "";
  }
  scrim.classList.add("open");
}
function closeModelModal() {
  editingModelId = null;
  document.getElementById("model-modal-scrim")?.classList.remove("open");
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
    renderBestPanel();
    showToast("Product removed (this session only)");
    closeConfirmModal();
  });
}

/* ---------------------------------------------------------------
   Best Slider + Models UI bindings
--------------------------------------------------------------- */
function bindFeaturedUI() {
  document.getElementById("admin-best-body")?.addEventListener("change", (e) => {
    if (!e.target.classList.contains("best-toggle")) return;
    const id = e.target.dataset.id;
    let ids = getBestProductIds();
    ids = e.target.checked ? [...new Set([...ids, id])] : ids.filter((x) => x !== id);
    setBestProductIds(ids);
    showToast("Best Products slider updated");
  });

  document.getElementById("add-model-btn")?.addEventListener("click", () => openModelModal());

  document.getElementById("admin-models-body")?.addEventListener("click", (e) => {
    const id = e.target.closest("button")?.dataset.id;
    if (!id) return;
    const model = getModels().find((m) => m.id === id);
    if (!model) return;
    if (e.target.closest(".edit-model-btn")) openModelModal(model);
    if (e.target.closest(".delete-model-btn")) {
      saveModels(getModels().filter((m) => m.id !== id));
      renderModelsPanel();
      showToast("Photo removed");
    }
  });

  document.getElementById("model-modal-close")?.addEventListener("click", closeModelModal);
  document.getElementById("model-modal-scrim")?.addEventListener("click", (e) => {
    if (e.target.id === "model-modal-scrim") closeModelModal();
  });
  document.getElementById("model-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.target;
    const values = {
      name: form.elements["name"].value.trim(),
      image: form.elements["image"].value.trim(),
      caption: form.elements["caption"].value.trim(),
    };
    if (!values.name || !values.image) {
      showToast("Name and image URL are required", "error");
      return;
    }
    let models = getModels();
    if (editingModelId) {
      const model = models.find((m) => m.id === editingModelId);
      Object.assign(model, values);
      showToast(`${model.name} updated`);
    } else {
      models = [{ id: "m" + Date.now(), ...values }, ...models];
      showToast(`${values.name} added`);
    }
    saveModels(models);
    renderModelsPanel();
    closeModelModal();
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
  renderBestPanel();
  closeProductModal();
}

function iconEdit() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>';
}
function iconTrash() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>';
}
