/**
 * cloudStr — Admin Dashboard (product CRUD + hideDescription)
 */
let adminProducts = [];

if (typeof window.showToast !== "function") {
  window.showToast = function (message, type) {
    let region = document.getElementById("toast-region");
    if (!region) {
      region = document.createElement("div");
      region.id = "toast-region";
      region.setAttribute("aria-live", "polite");
      document.body.appendChild(region);
    }
    const toast = document.createElement("div");
    toast.className = "toast" + (type === "error" ? " error" : "");
    toast.textContent = message;
    region.appendChild(toast);
    setTimeout(() => {
      toast.style.transition = "opacity 0.3s ease";
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, 2600);
  };
}

function persistProducts() {
  if (!saveProducts(adminProducts)) {
    showToast("Couldn't save changes (browser storage unavailable)", "error");
    return false;
  }
  return true;
}

document.addEventListener("DOMContentLoaded", () => {
  adminProducts = getAllProducts();
  renderStatCards();
  renderAdminTable();
  bindAdminUI();
  document.getElementById("add-image-btn")?.addEventListener("click", () => addImageInput());
  document.getElementById("add-spec-btn")?.addEventListener("click", () => addSpecInput());
  document.addEventListener("cloudstr-products-updated", () => {
    adminProducts = getAllProducts();
    renderStatCards();
    renderAdminTable();
  });
});

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function renderStatCards() {
  const orders = typeof getOrders === "function" ? getOrders() : [];
  setText("stat-total", adminProducts.length);
  setText("stat-low-stock", adminProducts.filter((p) => p.stock > 0 && p.stock <= 10).length);
  setText("stat-out-stock", adminProducts.filter((p) => p.stock === 0).length);
  setText("stat-orders", orders.length);
}

function iconEdit() {
  return '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>';
}
function iconTrash() {
  return '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/></svg>';
}

function renderAdminTable() {
  const tbody = document.getElementById("admin-product-body");
  if (!tbody) return;
  if (!adminProducts.length) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state">No products yet.</div></td></tr>`;
    return;
  }
  tbody.innerHTML = adminProducts.map((p) => {
    const inStock = p.stock > 0;
    const hidden = p.hideDescription ? ' <span style="color:var(--muted);font-size:.72rem;">(desc hidden)</span>' : '';
    return `<tr data-id="${p.id}">
      <td data-label="Product"><div class="admin-product-cell"><strong>${p.name}</strong>${hidden}</div></td>
      <td data-label="Category">${(CATEGORY_LABELS && CATEGORY_LABELS[p.category]) || p.category}</td>
      <td data-label="Status"><span class="badge-pill ${inStock ? "badge-instock" : "badge-outstock"}">${inStock ? "In Stock" : "Out of Stock"}</span></td>
      <td data-label="Price">${formatPrice(p.price)}</td>
      <td data-label="Actions"><div class="row-actions">
        <button class="edit-btn" data-id="${p.id}" title="Edit">${iconEdit()}</button>
        <button class="delete-btn danger" data-id="${p.id}" title="Delete">${iconTrash()}</button>
      </div></td>
    </tr>`;
  }).join("");
}

function slugify(name) {
  return String(name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || ("item-" + Date.now());
}

function addImageInput(value = "") {
  const holder = document.getElementById("image-inputs");
  if (!holder) return;
  const row = document.createElement("div");
  row.className = "image-input-row";
  row.style.cssText = "display:flex;gap:.45rem;margin:.5rem 0;align-items:center;";
  const input = document.createElement("input");
  input.type = "url";
  input.className = "product-image-input";
  input.placeholder = "https://...";
  input.value = value;
  input.style.flex = "1";
  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "btn btn-sm btn-ghost";
  remove.textContent = "Remove";
  remove.addEventListener("click", () => row.remove());
  row.appendChild(input);
  row.appendChild(remove);
  holder.appendChild(row);
}

function setImageInputs(images) {
  const holder = document.getElementById("image-inputs");
  if (!holder) return;
  holder.innerHTML = "";
  (images && images.length ? images : [""]).forEach((src) => addImageInput(src));
}

function readImageInputs() {
  return Array.from(document.querySelectorAll(".product-image-input"))
    .map((el) => el.value.trim())
    .filter(Boolean);
}

function addSpecInput(key = "", value = "") {
  const holder = document.getElementById("spec-inputs");
  if (!holder) return;
  const row = document.createElement("div");
  row.className = "spec-input-row";
  row.style.cssText = "display:flex;gap:.45rem;margin:.4rem 0;";
  const k = document.createElement("input");
  k.placeholder = "Label";
  k.value = key;
  k.className = "spec-key";
  const v = document.createElement("input");
  v.placeholder = "Value";
  v.value = value;
  v.className = "spec-value";
  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "btn btn-sm btn-ghost";
  remove.textContent = "×";
  remove.addEventListener("click", () => row.remove());
  row.appendChild(k);
  row.appendChild(v);
  row.appendChild(remove);
  holder.appendChild(row);
}

function setSpecInputs(specs) {
  const holder = document.getElementById("spec-inputs");
  if (!holder) return;
  holder.innerHTML = "";
  const entries = Object.entries(specs || {});
  if (!entries.length) addSpecInput();
  else entries.forEach(([k, v]) => addSpecInput(k, v));
}

function readSpecInputs() {
  const specs = {};
  document.querySelectorAll(".spec-input-row").forEach((row) => {
    const key = row.querySelector(".spec-key")?.value.trim();
    const value = row.querySelector(".spec-value")?.value.trim();
    if (key && value) specs[key] = value;
  });
  return specs;
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
    form.elements["description"].value = product.description || "";
    if (form.elements["hideDescription"]) form.elements["hideDescription"].checked = !!product.hideDescription;
    setImageInputs(product.images);
    setSpecInputs(product.specs || {});
  } else {
    if (form.elements["hideDescription"]) form.elements["hideDescription"].checked = false;
    setImageInputs([]);
    setSpecInputs({});
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
    hideDescription: !!(form.elements["hideDescription"] && form.elements["hideDescription"].checked),
    specs: readSpecInputs(),
  };
  const images = readImageInputs();
  if (!values.name) {
    showToast("Product name is required", "error");
    return;
  }
  if (editingId) {
    const product = adminProducts.find((p) => p.id === editingId);
    if (!product) return;
    Object.assign(product, values, { images: images.length ? images : product.images });
    showToast("Product updated");
  } else {
    const id = "p" + Date.now();
    adminProducts.unshift({
      id,
      slug: slugify(values.name),
      isNew: true,
      compareAt: null,
      reviews: [],
      images: images.length ? images : ["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?q=80&w=800&auto=format&fit=crop"],
      ...values,
    });
    showToast("Product added");
  }
  if (!persistProducts()) return;
  renderStatCards();
  renderAdminTable();
  closeProductModal();
}

function bindAdminUI() {
  document.getElementById("add-product-btn")?.addEventListener("click", () => openProductModal());
  document.getElementById("modal-close")?.addEventListener("click", closeProductModal);
  document.getElementById("modal-scrim")?.addEventListener("click", (e) => {
    if (e.target.id === "modal-scrim") closeProductModal();
  });
  document.getElementById("product-form")?.addEventListener("submit", handleFormSubmit);
  document.getElementById("admin-product-body")?.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = btn.dataset.id;
    const product = adminProducts.find((p) => p.id === id);
    if (!product) return;
    if (btn.classList.contains("edit-btn")) openProductModal(product);
    if (btn.classList.contains("delete-btn")) {
      if (!confirm("Delete " + product.name + "?")) return;
      adminProducts = adminProducts.filter((p) => p.id !== id);
      if (!persistProducts()) return;
      renderStatCards();
      renderAdminTable();
      showToast("Product deleted");
    }
  });
}
