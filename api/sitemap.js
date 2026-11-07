const seo = require('./_seo');

function xmlEscape(value) {
  return String(value).replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"');
}

function urlTag(loc, priority, changefreq, lastmod) {
  return `  <url><loc>${xmlEscape(loc)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}<changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
}

const STATIC = [
  ['/', '1.0', 'daily'],
  ['/shop', '0.9', 'daily'],
  ['/about', '0.5', 'monthly'],
  ['/contact', '0.5', 'monthly'],
  ['/shipping', '0.4', 'monthly'],
  ['/returns', '0.4', 'monthly'],
  ['/terms', '0.3', 'yearly'],
  ['/privacy', '0.3', 'yearly']
];

module.exports = async function handler(req, res) {
  let products;
  try {
    products = await seo.fetchAllProducts();
  } catch (error) {
    console.error(error);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Retry-After', '120');
    res.status(503).send('Sitemap temporarily unavailable.');
    return;
  }
  const staticUrls = STATIC.map(([path, priority, freq]) => urlTag(seo.SITE + path, priority, freq));
  const categoryUrls = Object.entries(seo.CATEGORIES).map(([key, cat]) => {
    const matches = products.filter((product) => product.category === key);
    if (!matches.length) return '';
    const newest = matches.map((product) => product.updateTime || '').sort().pop();
    return urlTag(seo.SITE + cat.path, '0.8', 'daily', newest ? newest.slice(0, 10) : '');
  }).filter(Boolean);
  const productUrls = products.map((product) => {
    const images = (Array.isArray(product.images) ? product.images : []).filter((src) => /^https?:\/\//.test(String(src))).slice(0, 4);
    const imageTags = images.map((src) => `<image:image><image:loc>${xmlEscape(src)}</image:loc><image:title>${xmlEscape(product.name || '')}</image:title></image:image>`).join('');
    const lastmod = product.updateTime ? `<lastmod>${product.updateTime.slice(0, 10)}</lastmod>` : '';
    const priority = Number(product.stock) === 0 ? '0.4' : '0.6';
    return `  <url><loc>${xmlEscape(seo.SITE + '/product/' + product.slug)}</loc>${lastmod}${imageTags}<changefreq>weekly</changefreq><priority>${priority}</priority></url>`;
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${[...staticUrls, ...categoryUrls, ...productUrls].join('\n')}\n</urlset>\n`;
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  res.status(200).send(xml);
};
