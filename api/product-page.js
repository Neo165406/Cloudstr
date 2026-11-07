const seo = require('./_seo');

function productTitle(name) {
  const suffix = ' Price in Bangladesh | cloudStr';
  const clean = String(name || 'Vape').replace(/\s+/g, ' ').trim();
  const full = clean + suffix;
  if (full.length <= 65) return full;
  return clean.slice(0, Math.max(12, 64 - suffix.length)).trim() + suffix;
}

function productDesc(product) {
  const price = Number(product.price);
  const priceBit = Number.isFinite(price) ? ` Current price ৳${price}.` : '';
  return seo.clip(
    `Shop ${product.name} at cloudStr in Bangladesh.${priceBit} See photos and stock, with cash on delivery in Dhaka and nationwide. 18+ only.`,
    160
  );
}

function specsRows(specs) {
  if (!specs || typeof specs !== 'object' || Array.isArray(specs)) return '';
  return Object.entries(specs).map(([key, value]) => `<tr><td>${seo.esc(key)}</td><td>${seo.esc(value)}</td></tr>`).join('');
}

function render(product) {
  const cat = seo.CATEGORIES[product.category];
  const catLabel = cat ? cat.label : 'Shop';
  const catPath = cat ? cat.path : '/shop';
  const images = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
  const inStock = Number(product.stock) > 0;
  const price = Number(product.price);
  return `<div class="breadcrumbs"><a href="/">Home</a> / <a href="${catPath}">${seo.esc(catLabel)}</a> / <span>${seo.esc(product.name)}</span></div>
    <div class="product-detail">
      <div>
        ${images[0] ? `<div class="gallery-main"><img src="${seo.esc(images[0])}" alt="${seo.esc(product.name)}"></div>` : ''}
      </div>
      <div>
        <span class="badge-pill ${inStock ? 'badge-instock' : 'badge-outstock'}">${inStock ? 'In Stock' : 'Out of Stock'}</span>
        <h1 style="margin-top:0.6rem;">${seo.esc(product.name)} Price in BD</h1>
        ${product.hideDescription ? '' : `<p class="lede" style="margin-top:0.6rem;">${seo.esc(product.description || '')}</p>`}
        <div class="detail-price-row"><span class="detail-price">${Number.isFinite(price) ? `৳${price.toLocaleString('en-US')}.00` : ''}</span></div>
        <div class="notice-box"><span>18+ only. Nicotine products are addictive.</span></div>
        ${specsRows(product.specs) ? `<table class="spec-table">${specsRows(product.specs)}</table>` : ''}
      </div>
    </div>`;
}

function schema(product, url, description) {
  const images = (Array.isArray(product.images) ? product.images : []).filter((src) => /^https?:\/\//.test(String(src)));
  const price = Number(product.price);
  const cat = seo.CATEGORIES[product.category];
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        name: product.name,
        description,
        image: images,
        sku: product.id,
        brand: { '@type': 'Brand', name: 'cloudStr' },
        category: cat ? cat.label : product.category,
        offers: {
          '@type': 'Offer',
          url,
          priceCurrency: 'BDT',
          price: Number.isFinite(price) ? price.toFixed(2) : undefined,
          availability: Number(product.stock) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          areaServed: 'BD'
        }
      },
      seo.breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: cat ? cat.label : 'Shop', path: cat ? cat.path : '/shop' },
        { name: product.name, path: `/product/${product.slug}` }
      ])
    ]
  };
}

module.exports = async function handler(req, res) {
  const slug = String((req.query && (req.query.slug || '')) || '').trim();
  if (slug && req.url && req.url.indexOf('/product.html') !== -1) {
    res.statusCode = 301;
    res.setHeader('Location', `/product/${encodeURIComponent(slug)}`);
    res.end();
    return;
  }
  let products = [];
  try { products = await seo.fetchAllProducts(); } catch (error) { console.error(error); }
  const product = products.find((item) => item.slug === slug);
  let html = seo.readTemplate('product.html');
  if (!product) {
    html = seo.applyHead(html, {
      title: 'Product not found | cloudStr',
      description: 'That cloudStr product is not in the catalog. Browse disposables, pod devices, nic salts and e-liquid.',
      url: seo.SITE + '/shop',
      robots: 'noindex, follow'
    });
    seo.sendHtml(res, html, 404);
    return;
  }
  const url = `${seo.SITE}/product/${product.slug}`;
  const description = productDesc(product);
  html = seo.applyHead(html, {
    title: productTitle(product.name),
    description,
    url,
    type: 'product',
    image: (Array.isArray(product.images) && product.images[0]) || undefined,
    imageAlt: product.name,
    keywords: `${product.name}, ${product.name} price in bangladesh, vape price in bd, cloudStr`,
    jsonLd: schema(product, url, description)
  });
  html = html.replace(
    '<div class="wrap" id="product-root"></div>',
    `<div class="wrap" id="product-root">${render(product)}</div>`
  );
  seo.sendHtml(res, html);
};
