// Syncs the Firestore catalog into Typesense. Firestore stays the source of truth.
// Env (Vercel): TYPESENSE_HOST, TYPESENSE_ADMIN_KEY, optional TYPESENSE_PROTOCOL, TYPESENSE_PORT, CRON_SECRET.
const seo = require('./_seo');

const COLLECTION = 'products';

const SCHEMA = {
  name: COLLECTION,
  fields: [
    { name: 'name', type: 'string' },
    { name: 'description', type: 'string', optional: true },
    { name: 'specs_text', type: 'string', optional: true },
    { name: 'category', type: 'string', facet: true },
    { name: 'price', type: 'float' },
    { name: 'stock', type: 'int32' },
    { name: 'in_stock', type: 'bool' },
    { name: 'is_new', type: 'bool' },
    { name: 'slug', type: 'string', index: false, optional: true },
    { name: 'image', type: 'string', index: false, optional: true }
  ]
};

function config() {
  const host = process.env.TYPESENSE_HOST;
  const key = process.env.TYPESENSE_ADMIN_KEY;
  if (!host || !key) return null;
  const protocol = process.env.TYPESENSE_PROTOCOL || 'https';
  const port = String(process.env.TYPESENSE_PORT || '443');
  const base = `${protocol}://${host}${port === '80' || port === '443' ? '' : ':' + port}`;
  return { base, key };
}

function call(cfg, path, options) {
  const opts = options || {};
  return fetch(cfg.base + path, Object.assign({}, opts, {
    headers: Object.assign({ 'X-TYPESENSE-API-KEY': cfg.key }, opts.headers || {}),
    signal: AbortSignal.timeout(20000)
  }));
}

async function ensureCollection(cfg) {
  const found = await call(cfg, `/collections/${COLLECTION}`);
  if (found.ok) return;
  if (found.status !== 404) throw new Error('Collection check failed: ' + found.status);
  const created = await call(cfg, '/collections', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(SCHEMA)
  });
  if (!created.ok) throw new Error('Collection create failed: ' + created.status + ' ' + (await created.text()));
}

function toDocument(product) {
  const images = (Array.isArray(product.images) ? product.images : []).filter((src) => /^https?:\/\//.test(String(src)));
  const specs = product.specs && typeof product.specs === 'object' && !Array.isArray(product.specs) ? product.specs : {};
  const stock = Math.max(0, Math.round(Number(product.stock) || 0));
  return {
    id: String(product.id),
    name: String(product.name || ''),
    description: seo.clip(product.description, 2000),
    specs_text: Object.entries(specs).map(([key, value]) => `${key} ${value}`).join(' '),
    category: String(product.category || ''),
    price: Number(product.price) || 0,
    stock,
    in_stock: stock > 0,
    is_new: Boolean(product.isNew),
    slug: String(product.slug || ''),
    image: images[0] || ''
  };
}

async function runSync(cfg) {
  const products = await seo.fetchAllProducts();
  if (!products.length) return { indexed: 0, note: 'Catalog is empty, index left unchanged' };
  await ensureCollection(cfg);

  const docs = products.map(toDocument);
  const imported = await call(cfg, `/collections/${COLLECTION}/documents/import?action=upsert`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: docs.map((doc) => JSON.stringify(doc)).join('\n')
  });
  const text = await imported.text();
  if (!imported.ok) throw new Error('Import failed: ' + imported.status + ' ' + text.slice(0, 300));
  const failed = text.split('\n').filter(Boolean).filter((line) => {
    try { return JSON.parse(line).success === false; } catch (e) { return true; }
  }).length;

  // Remove products that no longer exist in Firestore.
  const keep = docs.map((doc) => '`' + doc.id.replace(/`/g, '') + '`').join(',');
  const removed = await call(cfg, `/collections/${COLLECTION}/documents?filter_by=${encodeURIComponent('id:!=[' + keep + ']')}`, { method: 'DELETE' });
  if (!removed.ok) throw new Error('Cleanup failed: ' + removed.status);

  return { indexed: docs.length - failed, failed };
}

let running = false;
let rerun = false;

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const cfg = config();
  if (!cfg) {
    res.status(503).json({ error: 'Typesense is not configured' });
    return;
  }
  const fromCron = Boolean(process.env.CRON_SECRET) && req.headers.authorization === 'Bearer ' + process.env.CRON_SECRET;
  if (req.method !== 'POST' && !fromCron) {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Use POST' });
    return;
  }
  // If a sync is already running, ask it to run once more instead of starting a second one.
  if (running) {
    rerun = true;
    res.status(202).json({ queued: true });
    return;
  }
  running = true;
  try {
    let result = await runSync(cfg);
    while (rerun) {
      rerun = false;
      result = await runSync(cfg);
    }
    res.status(200).json(result);
  } catch (error) {
    console.error('Typesense sync failed:', error.message);
    res.status(502).json({ error: 'Sync failed' });
  } finally {
    running = false;
    rerun = false;
  }
};
