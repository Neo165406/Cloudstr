const seo = require('./_seo');

const HOME_TITLE = 'Vape Shop Bangladesh | Pods & Disposables | cloudStr';
const KEYWORDS = 'vape bangladesh, vape shop bd, disposable vape price in bangladesh, pod device price in bd, nic salt bd, e-liquid dhaka, cash on delivery vape';

function homeDescription(products) {
  const prices = products.map((p) => Number(p.price)).filter((n) => Number.isFinite(n) && n > 0);
  const from = prices.length ? ` from ৳${Math.min(...prices)}` : '';
  return seo.clip(
    `Shop vape devices${from} at cloudStr in Bangladesh. Disposables, pod kits, nic salts and e-liquid with BDT prices and cash on delivery. 18+ only.`,
    160
  );
}

function catalogHtml(products) {
  const items = products.slice(0, 24).map((product) => {
    const price = Number(product.price);
    const priceText = Number.isFinite(price) ? `৳${price.toLocaleString('en-US')}` : '';
    return `<li><a href="/product/${seo.esc(product.slug)}">${seo.esc(product.name)}</a>${priceText ? ` <span>— ${priceText}</span>` : ''}</li>`;
  }).join('');
  const cats = Object.values(seo.CATEGORIES).map((cat) => `<a href="${cat.path}">${seo.esc(cat.label)}</a>`).join('');
  return `<section class="seo-catalog" aria-label="Vape price list">
    <h2>Vape price list in Bangladesh</h2>
    <p class="seo-lede">Current cloudStr listings. Open a product for photos, specs and stock. Cash on delivery. Adults 18+ only.</p>
    <nav class="seo-cat-links" aria-label="Categories">${cats}</nav>
    <ul>${items}</ul>
  </section>`;
}

function graph(products, description) {
  const itemList = {
    '@type': 'ItemList',
    name: 'cloudStr vape catalog',
    itemListElement: products.slice(0, 24).map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${seo.SITE}/product/${product.slug}`,
      name: product.name
    }))
  };
  return {
    '@context': 'https://schema.org',
    '@graph': [
      seo.orgSchema(),
      {
        '@type': 'WebSite',
        name: 'cloudStr',
        url: seo.SITE + '/',
        description,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${seo.SITE}/shop?q={search_term_string}`,
          'query-input': 'required name=search_term_string'
        }
      },
      itemList,
      seo.faqSchema([
        ['Where can I buy a vape in Bangladesh?', 'cloudStr lists disposable vapes, pod devices, nic salts, coils and e-liquid with prices in BDT and cash on delivery.'],
        ['What is the vape price in BD?', 'Open any listing to see the current BDT price. The homepage price list shows the latest catalog.'],
        ['Do you offer cash on delivery?', 'Yes. Checkout is cash on delivery, including nationwide delivery.']
      ]),
      seo.breadcrumbSchema([{ name: 'Home', path: '/' }])
    ]
  };
}

module.exports = async function handler(req, res) {
  let html = seo.readTemplate('index.html');
  try {
    const products = await seo.fetchAllProducts();
    const description = homeDescription(products);
    html = seo.applyHead(html, {
      title: HOME_TITLE,
      description,
      url: seo.SITE + '/',
      keywords: KEYWORDS,
      imageAlt: 'cloudStr — vape devices, pods and e-liquid in Bangladesh',
      jsonLd: graph(products, description)
    });
    if (!html.includes('class="seo-h1"')) {
      html = html.replace(
        '<main class="storefront-main">\n    <div class="wrap">',
        `<main class="storefront-main">\n    <div class="wrap">\n      <h1 class="seo-h1">Vape Devices, Pods and E-liquid in Bangladesh</h1>\n      <p class="seo-lede">${seo.esc(description)}</p>`
      );
    }
    if (!html.includes('class="seo-catalog"')) {
      html = html.replace('<div id="category-rows"></div>', `<div id="category-rows"></div>\n      ${catalogHtml(products)}\n      ${seo.faqHtml([
        ['Where can I buy a vape in Bangladesh?', 'cloudStr lists disposable vapes, pod devices, nic salts, coils and e-liquid with prices in BDT and cash on delivery.'],
        ['What is the vape price in BD?', 'Open any listing to see the current BDT price. The price list on this page follows the live catalog.'],
        ['Do you offer cash on delivery?', 'Yes. Checkout is cash on delivery, including nationwide delivery. Adults 18+ only.']
      ])}`);
    }
  } catch (error) {
    console.error('home-page SEO fallback', error);
  }
  seo.sendHtml(res, html);
};
