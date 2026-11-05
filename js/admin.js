/**
 * cloudStr — Admin Dashboard
 * ----------------------------
 * Product CRUD (saved to localStorage via saveProducts in products.js,
 * so the storefront sees the changes), a real Orders panel reading
 * whatever has actually been placed through checkout.html, and
 * admin-managed, localStorage-backed panels that drive the homepage:
 * the Best/New Products slider and the Models collage (see
 * js/featured.js).
 */

let adminProducts = [];

/* app.js is not loaded on admin.html — provide a local toast fallback. */
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
let editingModelId = null;
let editingHeroId = null;

/* Persist the current admin catalog so the storefront picks it up. */
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
  renderBestPanel();
  renderHeroPanel();
  renderModelsPanel();
  renderOrders();
  bindAdminUI();
  bindFeaturedUI();
  bindHeroUI();
  bindImageResizer();
  bindImgBBUI();
  bindReelsAdmin();
  bindBackgroundDecorAdmin();
  document.getElementById("add-image-btn")?.addEventListener("click", () => addImageInput());
});

const CLOUDSTR_DECOR_KEY = "cloudstr_background_decor";
let editingDecorId = null;
function readBackgroundDecor() { try { const v=JSON.parse(localStorage.getItem(CLOUDSTR_DECOR_KEY)||"[]"); return Array.isArray(v)?v:[]; } catch(e) { return []; } }
function saveBackgroundDecor(items) { try { localStorage.setItem(CLOUDSTR_DECOR_KEY,JSON.stringify(items)); return true; } catch(e) { showToast("Could not save decor in this browser.","error"); return false; } }
function renderAdminDecor() {
  const body=document.getElementById("admin-decor-body"); if(!body)return; const items=readBackgroundDecor();
  body.innerHTML=items.length?items.map(item=>"<tr><td><img src=\""+escapeHtml(item.url)+"\" alt=\"\" style=\"width:58px;height:58px;object-fit:contain;background:#0d120f;border-radius:8px;\"></td><td>"+Number(item.x)+"% / "+Number(item.y)+"% · "+Number(item.width)+"px</td><td>"+(item.layer==="front"?"Above background":"Behind content")+"</td><td><button type=\"button\" class=\"btn btn-sm btn-ghost\" data-decor-edit=\""+item.id+"\">Edit</button> <button type=\"button\" class=\"btn btn-sm btn-ghost\" data-decor-delete=\""+item.id+"\">Delete</button></td></tr>").join(""):"<tr><td colspan=\"4\" style=\"color:var(--muted);\">No background decor added.</td></tr>";
}
function bindBackgroundDecorAdmin() {
  const form=document.getElementById("decor-form"); if(!form)return;
  const get=id=>document.getElementById("decor-"+id), submit=get("submit"), cancel=get("cancel");
  get("upload-btn").addEventListener("click",async()=>{ const file=get("image-file").files&&get("image-file").files[0], status=get("upload-status"); if(!file){status.textContent="Choose an image first.";return;} const btn=get("upload-btn");btn.disabled=true;status.textContent="Uploading…";try{get("image-url").value=await uploadImageToImgBB(file);status.textContent="Upload complete.";}catch(e){status.textContent=e.message;}finally{btn.disabled=false;} });
  form.addEventListener("submit",event=>{ event.preventDefault(); let parsed;try{parsed=new URL(get("image-url").value.trim());}catch(e){} if(!parsed||!(parsed.protocol==="https:"||parsed.protocol==="http:")){showToast("Enter a valid image URL or upload an image first.","error");return;}
    const item={id:editingDecorId||"decor-"+Date.now(),url:parsed.href,x:Math.max(0,Math.min(100,Number(get("x").value)||0)),y:Math.max(0,Math.min(100,Number(get("y").value)||0)),width:Math.max(40,Math.min(700,Number(get("width").value)||180)),opacity:Math.max(5,Math.min(100,Number(get("opacity").value)||85)),rotation:Math.max(-180,Math.min(180,Number(get("rotation").value)||0)),layer:get("layer").value==="front"?"front":"back"};
    const items=readBackgroundDecor(),at=items.findIndex(v=>v.id===editingDecorId);if(at>=0)items[at]=item;else items.push(item);if(!saveBackgroundDecor(items))return;editingDecorId=null;form.reset();get("x").value=8;get("y").value=22;get("width").value=180;get("opacity").value=85;get("rotation").value=-12;get("layer").value="back";submit.textContent="Add decor image";cancel.hidden=true;renderAdminDecor();showToast("Background decor saved.");
  });
  cancel.addEventListener("click",()=>{editingDecorId=null;form.reset();submit.textContent="Add decor image";cancel.hidden=true;});
  document.getElementById("admin-decor-body").addEventListener("click",event=>{const edit=event.target.closest("[data-decor-edit]"),del=event.target.closest("[data-decor-delete]"),items=readBackgroundDecor();if(edit){const v=items.find(row=>row.id===edit.dataset.decorEdit);if(!v)return;editingDecorId=v.id;get("image-url").value=v.url;["x","y","width","opacity","rotation","layer"].forEach(k=>get(k).value=v[k]);submit.textContent="Save changes";cancel.hidden=false;form.scrollIntoView({behavior:"smooth",block:"center"});}if(del&&confirm("Remove this background decor image?")){saveBackgroundDecor(items.filter(row=>row.id!==del.dataset.decorDelete));renderAdminDecor();showToast("Decor image removed.");}});
  renderAdminDecor();
}
const CLOUDSTR_REELS_KEY = "cloudstr_home_reels";
let editingReelId = null;
function readCloudstrReels() {
  try { const value = JSON.parse(localStorage.getItem(CLOUDSTR_REELS_KEY) || "[]"); return Array.isArray(value) ? value : []; }
  catch (error) { return []; }
}
function saveCloudstrReels(reels) {
  try { localStorage.setItem(CLOUDSTR_REELS_KEY, JSON.stringify(reels)); return true; }
  catch (error) { showToast("Could not save reels in this browser.", "error"); return false; }
}
function normalizeReelUrl(raw) {
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (/(^|\.)instagram\.com$/i.test(url.hostname)) {
      const match = url.pathname.match(/^\/(?:reel|reels|p)\/([A-Za-z0-9_-]+)/);
      return match ? { type: "instagram", url: "https://www.instagram.com/reel/" + match[1] + "/" } : null;
    }
    if (/\.(mp4|webm|ogg)$/i.test(url.pathname)) return { type: "video", url: url.href };
    return null;
  } catch (error) { return null; }
}
function renderAdminReels() {
  const body = document.getElementById("admin-reels-body");
  if (!body) return;
  const reels = readCloudstrReels();
  body.innerHTML = reels.length ? reels.map((reel) => `<tr><td>${escapeHtml(reel.title)}</td><td style="max-width:260px;overflow-wrap:anywhere;">${escapeHtml(reel.url)}</td><td><button type="button" class="btn btn-sm btn-ghost" data-reel-edit="${reel.id}">Edit</button> <button type="button" class="btn btn-sm btn-ghost" data-reel-delete="${reel.id}">Delete</button></td></tr>`).join("") : '<tr><td colspan="3" style="color:var(--muted);">No reels added yet.</td></tr>';
}
function bindReelsAdmin() {
  const form = document.getElementById("reel-form");
  if (!form) return;
  const title = document.getElementById("reel-title");
  const url = document.getElementById("reel-url");
  const submit = document.getElementById("reel-submit");
  const cancel = document.getElementById("reel-cancel");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const caption = title.value.trim();
    const parsed = normalizeReelUrl(url.value);
    if (!caption || !parsed) { showToast("Enter a title and a valid Instagram Reel or direct MP4 URL.", "error"); return; }
    const reels = readCloudstrReels();
    if (editingReelId) {
      const item = reels.find((entry) => entry.id === editingReelId);
      if (item) Object.assign(item, { title: caption, ...parsed });
    } else reels.unshift({ id: "reel-" + Date.now(), title: caption, ...parsed });
    if (!saveCloudstrReels(reels)) return;
    form.reset(); editingReelId = null; submit.textContent = "Add reel"; cancel.hidden = true;
    renderAdminReels(); showToast("Reel saved.");
  });
  cancel.addEventListener("click", () => { editingReelId = null; form.reset(); submit.textContent = "Add reel"; cancel.hidden = true; });
  document.getElementById("admin-reels-body")?.addEventListener("click", (event) => {
    const edit = event.target.closest("[data-reel-edit]");
    const remove = event.target.closest("[data-reel-delete]");
    const reels = readCloudstrReels();
    if (edit) {
      const item = reels.find((entry) => entry.id === edit.dataset.reelEdit);
      if (!item) return;
      editingReelId = item.id; title.value = item.title; url.value = item.url;
      submit.textContent = "Save changes"; cancel.hidden = false; form.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    if (remove) {
      if (!confirm("Delete this reel?")) return;
      saveCloudstrReels(reels.filter((entry) => entry.id !== remove.dataset.reelDelete));
      renderAdminReels(); showToast("Reel deleted.");
    }
  });
  renderAdminReels();
}

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
              <div class="admin-thumb-row">${p.images.slice(0, 3).map((src) => `<img src="${src}" alt="${p.name}">`).join("")}</div>
              <strong>${p.name}${p.images.length > 1 ? ` <span style="color:var(--muted-2);font-weight:400;font-size:0.74rem;">(${p.images.length} images)</span>` : ""}</strong>
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
   Hero banners panel
--------------------------------------------------------------- */
function renderHeroPanel() {
  const tbody = document.getElementById("admin-hero-body");
  if (!tbody) return;
  const banners = getHeroBanners();
  if (!banners.length) {
    tbody.innerHTML = `<tr><td colspan="3"><div class="empty-state">No banners yet.</div></td></tr>`;
    return;
  }
  tbody.innerHTML = banners
    .map(
      (b) => `
        <tr data-id="${b.id}">
          <td data-label="Banner"><img src="${b.image}" alt="${b.alt || ""}" style="width:64px;height:40px;object-fit:cover;border-radius:6px;"></td>
          <td data-label="Alt text">${b.alt || ""}</td>
          <td data-label="Actions">
            <div class="row-actions">
              <button class="edit-hero-btn" data-id="${b.id}" title="Edit" aria-label="Edit banner">${iconEdit()}</button>
              <button class="delete-hero-btn danger" data-id="${b.id}" title="Delete" aria-label="Delete banner">${iconTrash()}</button>
            </div>
          </td>
        </tr>`
    )
    .join("");
}

function openHeroModal(banner = null) {
  editingHeroId = banner ? banner.id : null;
  const scrim = document.getElementById("hero-modal-scrim");
  const form = document.getElementById("hero-form");
  if (!scrim || !form) return;
  form.reset();
  document.getElementById("hero-modal-title").textContent = banner ? "Edit banner" : "Add banner";
  if (banner) {
    form.elements["image"].value = banner.image;
    form.elements["alt"].value = banner.alt || "";
  }
  scrim.classList.add("open");
}
function closeHeroModal() {
  editingHeroId = null;
  document.getElementById("hero-modal-scrim")?.classList.remove("open");
}

function bindHeroUI() {
  document.getElementById("add-hero-btn")?.addEventListener("click", () => openHeroModal());
  document.getElementById("admin-hero-body")?.addEventListener("click", (e) => {
    const id = e.target.closest("button")?.dataset.id;
    if (!id) return;
    const banner = getHeroBanners().find((b) => b.id === id);
    if (!banner) return;
    if (e.target.closest(".edit-hero-btn")) openHeroModal(banner);
    if (e.target.closest(".delete-hero-btn")) {
      saveHeroBanners(getHeroBanners().filter((b) => b.id !== id));
      renderHeroPanel();
      showToast("Banner removed");
    }
  });
  document.getElementById("hero-modal-close")?.addEventListener("click", closeHeroModal);
  document.getElementById("hero-modal-scrim")?.addEventListener("click", (e) => {
    if (e.target.id === "hero-modal-scrim") closeHeroModal();
  });
  document.getElementById("hero-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.target;
    const values = {
      image: form.elements["image"].value.trim(),
      alt: form.elements["alt"].value.trim(),
    };
    if (!values.image) {
      showToast("Image URL is required", "error");
      return;
    }
    let banners = getHeroBanners();
    if (editingHeroId) {
      const banner = banners.find((b) => b.id === editingHeroId);
      Object.assign(banner, values);
      showToast("Banner updated");
    } else {
      banners = [...banners, { id: "h" + Date.now(), ...values }];
      showToast("Banner added");
    }
    saveHeroBanners(banners);
    renderHeroPanel();
    closeHeroModal();
  });
}

const IMGBB_KEY_STORAGE = "cloudstr_imgbb_api_key";

function getImgBBApiKey() {
  try { return localStorage.getItem(IMGBB_KEY_STORAGE) || ""; }
  catch (error) { return ""; }
}

async function uploadImageToImgBB(file) {
  const apiKey = getImgBBApiKey();
  if (!apiKey) throw new Error("Add and save your ImgBB API key in the ImgBB Upload panel first.");
  if (!file || !file.type.startsWith("image/")) throw new Error("Choose a valid image file.");
  if (file.size > 32 * 1024 * 1024) throw new Error("Image is larger than ImgBB's 32 MB upload limit.");

  const body = new FormData();
  body.append("image", file);
  body.append("name", file.name.replace(/\.[^.]+$/, "") || "cloudstr-image");

  const endpoint = "https://api.imgbb.com/1/upload?key=" + encodeURIComponent(apiKey);
  const response = await fetch(endpoint, { method: "POST", body });
  let result;
  try { result = await response.json(); }
  catch (error) { throw new Error("ImgBB returned an unreadable response. Check your API key and connection."); }

  if (!response.ok || !result.success || !result.data || !result.data.url) {
    throw new Error(result?.error?.message || "ImgBB upload failed. Check your API key and try again.");
  }
  return result.data.url;
}

function bindImgBBUploadControl(fileId, buttonId, urlId, statusId) {
  const fileInput = document.getElementById(fileId);
  const button = document.getElementById(buttonId);
  const urlInput = document.getElementById(urlId);
  const status = document.getElementById(statusId);
  if (!fileInput || !button || !urlInput) return;

  button.addEventListener("click", async () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) {
      if (status) status.textContent = "Choose an image first.";
      return;
    }
    button.disabled = true;
    const oldLabel = button.textContent;
    button.textContent = "Uploading…";
    if (status) status.textContent = "Uploading to ImgBB…";
    try {
      const url = await uploadImageToImgBB(file);
      urlInput.value = url;
      urlInput.dispatchEvent(new Event("input", { bubbles: true }));
      if (status) status.textContent = "Upload complete.";
      showToast("Image uploaded to ImgBB");
    } catch (error) {
      if (status) status.textContent = error.message;
      showToast(error.message, "error");
    } finally {
      button.disabled = false;
      button.textContent = oldLabel;
    }
  });
}

function bindImgBBUI() {
  const keyInput = document.getElementById("imgbb-api-key");
  const saveButton = document.getElementById("imgbb-save-key");
  const clearButton = document.getElementById("imgbb-clear-key");
  const keyStatus = document.getElementById("imgbb-key-status");

  if (keyInput && saveButton && clearButton) {
    const savedKey = getImgBBApiKey();
    keyInput.value = savedKey;
    if (keyStatus) keyStatus.textContent = savedKey ? "API key saved on this device." : "No API key saved.";

    saveButton.addEventListener("click", () => {
      const key = keyInput.value.trim();
      if (!key) {
        if (keyStatus) keyStatus.textContent = "Paste an API key first.";
        return;
      }
      try {
        localStorage.setItem(IMGBB_KEY_STORAGE, key);
        if (keyStatus) keyStatus.textContent = "API key saved on this device.";
        showToast("ImgBB API key saved");
      } catch (error) {
        if (keyStatus) keyStatus.textContent = "Could not save the key in this browser.";
        showToast("Could not save the ImgBB API key", "error");
      }
    });

    clearButton.addEventListener("click", () => {
      try { localStorage.removeItem(IMGBB_KEY_STORAGE); } catch (error) {}
      keyInput.value = "";
      if (keyStatus) keyStatus.textContent = "API key cleared from this device.";
      showToast("ImgBB API key cleared");
    });
  }

  bindImgBBUploadControl("m-image-file", "m-image-upload", "m-image", "m-image-upload-status");
  bindImgBBUploadControl("h-image-file", "h-image-upload", "h-image", "h-image-upload-status");

  const holder = document.getElementById("image-inputs");
  holder?.addEventListener("click", async (event) => {
    const button = event.target.closest(".imgbb-upload-btn");
    if (!button) return;
    const row = button.closest(".image-input-row");
    const fileInput = row?.querySelector(".imgbb-file-input");
    const urlInput = row?.querySelector(".product-image-input");
    const status = row?.querySelector(".imgbb-upload-status");
    const file = fileInput?.files?.[0];
    if (!file) {
      if (status) status.textContent = "Choose an image first.";
      return;
    }
    button.disabled = true;
    const oldLabel = button.textContent;
    button.textContent = "Uploading…";
    if (status) status.textContent = "Uploading…";
    try {
      const url = await uploadImageToImgBB(file);
      urlInput.value = url;
      urlInput.dispatchEvent(new Event("input", { bubbles: true }));
      if (status) status.textContent = "Uploaded";
      showToast("Product image uploaded to ImgBB");
    } catch (error) {
      if (status) status.textContent = error.message;
      showToast(error.message, "error");
    } finally {
      button.disabled = false;
      button.textContent = oldLabel;
    }
  });
}

/* ---------------------------------------------------------------
   Product image inputs (multiple images)
--------------------------------------------------------------- */
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?q=80&w=800&auto=format&fit=crop";

function addImageInput(value = "") {
  const holder = document.getElementById("image-inputs");
  if (!holder) return;
  const row = document.createElement("div");
  row.className = "image-input-row";
  row.style.cssText = "display:flex;flex-wrap:wrap;align-items:center;gap:.45rem;margin:.5rem 0;";
  const input = document.createElement("input");
  input.type = "url";
  input.className = "product-image-input";
  input.placeholder = "https://...";
  input.value = value;
  input.style.cssText = "flex:1 1 190px;min-width:0;";
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.className = "imgbb-file-input";
  fileInput.setAttribute("aria-label", "Choose image to upload to ImgBB");
  fileInput.style.cssText = "flex:1 1 145px;min-width:0;font-size:.72rem;";
  const upload = document.createElement("button");
  upload.type = "button";
  upload.className = "btn btn-sm btn-ghost imgbb-upload-btn";
  upload.textContent = "Upload";
  const status = document.createElement("span");
  status.className = "imgbb-upload-status";
  status.style.cssText = "font-size:.7rem;color:var(--muted);flex:1 0 100%;";
  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "image-remove-btn";
  remove.setAttribute("aria-label", "Remove this image");
  remove.textContent = "\u00d7";
  remove.addEventListener("click", () => {
    row.remove();
    if (!holder.querySelector(".image-input-row")) addImageInput();
  });
  row.appendChild(input);
  row.appendChild(fileInput);
  row.appendChild(upload);
  row.appendChild(remove);
  row.appendChild(status);
  holder.appendChild(row);
}

function setImageInputs(images) {
  const holder = document.getElementById("image-inputs");
  if (!holder) return;
  holder.innerHTML = "";
  const list = images && images.length ? images : [""];
  list.forEach((src) => addImageInput(src));
}

function readImageInputs() {
  return Array.from(document.querySelectorAll(".product-image-input"))
    .map((i) => i.value.trim())
    .filter(Boolean);
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
  document.getElementById("add-spec-btn")?.addEventListener("click", () => addSpecInput());

  document.getElementById("confirm-close")?.addEventListener("click", closeConfirmModal);
  document.getElementById("confirm-cancel")?.addEventListener("click", closeConfirmModal);
  document.getElementById("confirm-scrim")?.addEventListener("click", (e) => {
    if (e.target.id === "confirm-scrim") closeConfirmModal();
  });
  document.getElementById("confirm-delete-btn")?.addEventListener("click", () => {
    if (!pendingDeleteId) return;
    adminProducts = adminProducts.filter((p) => p.id !== pendingDeleteId);
    persistProducts();
    renderStatCards();
    renderAdminTable();
    renderBestPanel();
    showToast("Product removed");
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
  document.getElementById("confirm-text").textContent = `Delete "${product.name}"? This will remove it from the storefront.`;
  document.getElementById("confirm-scrim").classList.add("open");
}
function closeConfirmModal() {
  pendingDeleteId = null;
  document.getElementById("confirm-scrim")?.classList.remove("open");
}

function addSpecInput(key = "", value = "") {
  const holder = document.getElementById("spec-inputs");
  if (!holder) return;
  const row = document.createElement("div");
  row.className = "spec-input-row";
  row.style.cssText = "display:grid;grid-template-columns:1fr 1fr auto;gap:.5rem;margin:.5rem 0;";
  row.innerHTML = '<input type="text" class="spec-key" placeholder="Label (e.g. Capacity)" maxlength="60"><input type="text" class="spec-value" placeholder="Value" maxlength="120"><button type="button" class="btn btn-sm btn-ghost" aria-label="Remove specification">×</button>';
  row.querySelector(".spec-key").value = key;
  row.querySelector(".spec-value").value = value;
  row.querySelector("button").addEventListener("click", () => row.remove());
  holder.appendChild(row);
}
function setSpecInputs(specs = {}) {
  const holder = document.getElementById("spec-inputs");
  if (!holder) return;
  holder.innerHTML = "";
  Object.entries(specs || {}).forEach(([key, value]) => addSpecInput(key, value));
  if (!holder.children.length) addSpecInput();
}
function readSpecInputs() {
  const specs = {};
  document.querySelectorAll("#spec-inputs .spec-input-row").forEach((row) => {
    const key = row.querySelector(".spec-key").value.trim();
    const value = row.querySelector(".spec-value").value.trim();
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
    form.elements["description"].value = product.description;
    setImageInputs(product.images);
    setSpecInputs(product.specs || {});
  } else {
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
    specs: readSpecInputs(),
  };
  const images = readImageInputs();
  if (!values.name) {
    showToast("Product name is required", "error");
    return;
  }
  if (editingId) {
    const product = adminProducts.find((p) => p.id === editingId);
    Object.assign(product, values, { images: images.length ? images : product.images });
    showToast(`${product.name} updated`);
  } else {
    adminProducts.unshift({
      id: "p" + Date.now(), slug: values.name.toLowerCase().replace(/\s+/g, "-"),
      images: images.length ? images : [FALLBACK_IMAGE],
      compareAt: null, isNew: true, specs: {}, reviews: [], ...values,
    });
    showToast(`${values.name} added`);
  }
  persistProducts();
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


/* ---------------------------------------------------------------
   Local image resizer — preserves the source aspect ratio.
   Files are processed in-browser and are never uploaded.
--------------------------------------------------------------- */
function bindImageResizer() {
  const fileInput = document.getElementById("resizer-file");
  const widthInput = document.getElementById("resizer-width");
  const heightInput = document.getElementById("resizer-height");
  const formatInput = document.getElementById("resizer-format");
  const qualityInput = document.getElementById("resizer-quality");
  const qualityValue = document.getElementById("resizer-quality-value");
  const info = document.getElementById("resizer-info");
  const originalPreview = document.getElementById("resizer-original-preview");
  const outputPreview = document.getElementById("resizer-output-preview");
  const downloadButton = document.getElementById("resizer-download");
  if (!fileInput || !downloadButton) return;

  let sourceImage = null;
  let sourceUrl = "";
  let outputUrl = "";
  let outputBlob = null;
  let outputName = "cloudstr-resized.webp";
  let renderToken = 0;

  function clearOutput() {
    outputBlob = null;
    downloadButton.disabled = true;
    outputPreview.style.display = "none";
    outputPreview.removeAttribute("src");
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    outputUrl = "";
  }

  async function renderResizedImage() {
    const token = ++renderToken;
    clearOutput();
    if (!sourceImage) return;

    const maxWidth = Math.max(1, Math.min(12000, Number(widthInput.value) || 1200));
    const maxHeight = Math.max(1, Math.min(12000, Number(heightInput.value) || 1200));
    const scale = Math.min(maxWidth / sourceImage.naturalWidth, maxHeight / sourceImage.naturalHeight, 1);
    const width = Math.max(1, Math.round(sourceImage.naturalWidth * scale));
    const height = Math.max(1, Math.round(sourceImage.naturalHeight * scale));
    const format = formatInput.value;
    const quality = Math.max(0.4, Math.min(1, (Number(qualityInput.value) || 85) / 100));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
      info.textContent = "Your browser could not create an image canvas.";
      return;
    }
    if (format === "image/jpeg") {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
    }
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(sourceImage, 0, 0, width, height);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, format, quality));
    if (token !== renderToken) return;
    if (!blob) {
      info.textContent = "Could not process this image. Try another format.";
      return;
    }
    outputBlob = blob;
    outputUrl = URL.createObjectURL(blob);
    outputPreview.src = outputUrl;
    outputPreview.style.display = "block";
    const extension = blob.type === "image/jpeg" ? "jpg" : blob.type === "image/png" ? "png" : "webp";
    outputName = (fileInput.files[0]?.name || "image").replace(/\\.[^.]+$/, "") + "-resized." + extension;
    const originalSize = fileInput.files[0]?.size || 0;
    const saved = originalSize ? Math.round((1 - blob.size / originalSize) * 100) : 0;
    info.textContent = sourceImage.naturalWidth + " × " + sourceImage.naturalHeight + " → " + width + " × " + height +
      " px · " + (blob.size / 1024).toFixed(1) + " KB" +
      (originalSize ? " · " + (saved >= 0 ? saved + "% smaller" : Math.abs(saved) + "% larger") : "");
    downloadButton.disabled = false;
  }

  fileInput.addEventListener("change", () => {
    const file = fileInput.files && fileInput.files[0];
    sourceImage = null;
    clearOutput();
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    sourceUrl = "";
    if (!file) {
      originalPreview.style.display = "none";
      info.textContent = "No image selected.";
      return;
    }
    if (!file.type.startsWith("image/")) {
      info.textContent = "Please choose a valid image file.";
      fileInput.value = "";
      return;
    }
    sourceUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      sourceImage = image;
      originalPreview.src = sourceUrl;
      originalPreview.style.display = "block";
      info.textContent = "Original: " + image.naturalWidth + " × " + image.naturalHeight + " px";
      renderResizedImage();
    };
    image.onerror = () => {
      info.textContent = "This image could not be opened. Try another file.";
    };
    image.src = sourceUrl;
  });

  [widthInput, heightInput, formatInput, qualityInput].forEach((control) => {
    control.addEventListener("input", () => {
      qualityValue.textContent = qualityInput.value + "%";
      if (sourceImage) renderResizedImage();
    });
    control.addEventListener("change", () => {
      if (sourceImage) renderResizedImage();
    });
  });

  downloadButton.addEventListener("click", () => {
    if (!outputBlob || !outputUrl) return;
    const link = document.createElement("a");
    link.href = outputUrl;
    link.download = outputName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  });

  window.addEventListener("beforeunload", () => {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    if (outputUrl) URL.revokeObjectURL(outputUrl);
  });
}
