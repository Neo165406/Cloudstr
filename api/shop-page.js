const seo = require('./_seo');

function cards(products) {
  return products.map((product) => {
    const price = Number(product.price);
    const priceText = Number.isFinite(price) ? `৳${price.toLocaleString('en-US')}` : '';
    const image = Array.isArray(product.images) && product.images[0] ? product.images[0] : '';
    return `<article class="product-card" data-ssr="1">
      <div class="product-info">
        <h2 class="product-name"><a href="/product/${seo.esc(product.slug)}">${seo.esc(product.name)}</a></h2>
        <p>${priceText}</p>
        ${image ? `<img src="${seo.esc(image)}" alt="${seo.esc(product.name)}" loading="lazy">` : ''}
      </div>
    </article>`;
  }).join('');
}

module.exports = async function handler(req, res) {
  const key = String((req.query && req.query.category) || '');
  const cat = key ? seo.categoryByKey(key) : null;
  const page = cat || {
    path: '/shop',
    label: 'Shop',
    title: seo.SHOP_SEO.title,
    h1: seo.SHOP_SEO.h1,
    desc: seo.SHOP_SEO.desc,
    intro: seo.SHOP_SEO.intro,
    faq: seo.SHOP_SEO.faq
  };
  let html = seo.readTemplate('shop.html');
  let products = [];
  try { products = await seo.fetchAllProducts(); } catch (error) { console.error(error); }
  const visible = cat ? products.filter((p) => p.category === key) : products;
  const robots = cat && !visible.length ? 'noindex, follow' : 'index,follow,max-image-preview:large,max-snippet:-1';
  const url = seo.SITE + page.path;
  html = seo.applyHead(html, {
    title: page.title,
    description: page.desc,
    url,
    keywords: `${page.label.toLowerCase()} bangladesh, ${page.label.toLowerCase()} price in bd, vape shop bd, cash on delivery, cloudStr`,
    robots,
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        seo.orgSchema(),
        seo.breadcrumbSchema([{ name: 'Home', path: '/' }, { name: page.label, path: page.path }]),
        seo.faqSchema(page.faq),
        {
          '@type': 'ItemList',
          name: page.h1,
          itemListElement: visible.slice(0, 48).map((product, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `${seo.SITE}/product/${product.slug}`,
            name: product.name
          }))
        }
      ]
    }
  });
  html = html.replace(/<h1[^>]*>[\s\S]*?<\/h1>/, `<h1 style="margin-bottom:0.4rem;">${seo.esc(page.h1)}</h1>`);
  html = html.replace(/<p class="lede"[^>]*>[\s\S]*?<\/p>/, `<p class="seo-lede">${seo.esc(page.intro)}</p>`);
  if (visible.length) {
    html = html.replace('<div class="product-grid" id="product-grid"></div>', `<div class="product-grid" id="product-grid">${cards(visible)}</div>`);
  }
  if (!html.includes('data-seo-category')) {
    html = html.replace('<body>', `<body data-seo-category="${seo.esc(key || 'all')}">`);
  }
  if (!html.includes('class="seo-faq"')) {
    html = html.replace('</main>', `${seo.faqHtml(page.faq)}\n  </main>`);
  }
  seo.sendHtml(res, html);
};
