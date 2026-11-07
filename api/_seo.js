// Shared SEO helpers for cloudStr. Public Firestore read, same as the storefront.
const fs = require('fs');
const path = require('path');

const SITE = 'https://cloudstr.vercel.app';
const FIREBASE_API_KEY = 'AIzaSyCPBaDHqdv5a-MjQvj18My4-i5-zFK_CWk';
const PROJECT_ID = 'cloudstr-27fdc';
const OG_IMAGE = `${SITE}/assets/cloudstr-og.svg`;

const CATEGORIES = {
  disposables: {
    path: '/disposables',
    label: 'Disposables',
    title: 'Disposable Vape Price in BD | cloudStr',
    h1: 'Disposable Vapes in Bangladesh',
    desc: 'Shop disposable vapes in Bangladesh at cloudStr. Compare flavours and current BDT prices, with cash on delivery in Dhaka and nationwide. 18+ only.',
    intro: 'Browse disposable vapes at cloudStr. Each listing shows the current BDT price, photos and stock. Cash on delivery is available in Dhaka and nationwide. Nicotine products are for adults 18+ only.',
    faq: [
      ['What is the disposable vape price in Bangladesh?', 'Prices are listed in BDT on each product page and can change when the catalog is updated. Open a listing to see the current price.'],
      ['Do you deliver disposable vapes outside Dhaka?', 'The storefront offers nationwide delivery and cash on delivery. Confirm your area on WhatsApp before ordering.'],
      ['Are these products for adults only?', 'Yes. Nicotine vaping products are for adults 18 and older and are addictive.']
    ]
  },
  'nic-salts': {
    path: '/nic-salts',
    label: 'Nic Salts',
    title: 'Nic Salt Price in Bangladesh | cloudStr',
    h1: 'Nic Salts in Bangladesh',
    desc: 'Shop nic salts in Bangladesh at cloudStr. Compare strengths and current BDT prices, with cash on delivery in Dhaka and nationwide. Adults 18+ only.',
    intro: 'Browse nic salt e-liquid at cloudStr. Check the strength, flavour and current BDT price on each listing before you order. 18+ only. Nicotine is addictive.',
    faq: [
      ['What is the nic salt price in BD?', 'Each nic salt listing shows its current price in BDT. Compare them here, then open a product for photos and stock.'],
      ['Can I pay cash on delivery?', 'Yes. Checkout on cloudStr is cash on delivery.'],
      ['Who can buy nic salts?', 'Adults 18 and older only.']
    ]
  },
  'pod-devices': {
    path: '/pod-devices',
    label: 'Pod Devices',
    title: 'Pod Device Price in Bangladesh | cloudStr',
    h1: 'Pod Devices in Bangladesh',
    desc: 'Shop pod devices in Bangladesh at cloudStr. Compare kits and current BDT prices, with cash on delivery in Dhaka and nationwide. Adults 18+ only.',
    intro: 'Browse pod system kits at cloudStr. Compare device photos, specs and the current BDT price. Cash on delivery is available nationwide. 18+ only.',
    faq: [
      ['What is the pod device price in Bangladesh?', 'Open any pod device to see its current BDT price, photos and stock status.'],
      ['Do pod kits include coils?', 'Check the specification table on the product page. Coils and cartridges are also listed in their own category.'],
      ['Can I pay cash on delivery?', 'Yes. cloudStr checkout is cash on delivery.']
    ]
  },
  'podmod-devices': {
    path: '/podmod-devices',
    label: 'Podmod Devices',
    title: 'Pod Mod Kit Price in BD | cloudStr',
    h1: 'Pod Mod Devices in Bangladesh',
    desc: 'Shop pod mod kits in Bangladesh at cloudStr. Compare devices and current BDT prices, with cash on delivery nationwide. Adults 18+ only.',
    intro: 'Browse pod mod devices at cloudStr. Review power range, photos and the current BDT price on each listing before ordering.',
    faq: [
      ['What is the pod mod price in BD?', 'Each listing shows the current BDT price. Stock status is on the product page.'],
      ['Do you ship pod mods nationwide?', 'The storefront offers nationwide delivery and cash on delivery.'],
      ['Is there an age limit?', 'Yes. You must be 18 or older. Nicotine is addictive.']
    ]
  },
  'coils-cartridges': {
    path: '/coils',
    label: 'Coils & Cartridges',
    title: 'Vape Coils & Cartridges Price in BD | cloudStr',
    h1: 'Vape Coils and Cartridges in Bangladesh',
    desc: 'Shop vape coils and cartridges in Bangladesh at cloudStr. Check compatibility and current BDT prices, with cash on delivery. 18+ only.',
    intro: 'Browse replacement coils and cartridges at cloudStr. Match the coil to your device using the specs on each product page, then compare the current BDT price.',
    faq: [
      ['How do I choose a vape coil in Bangladesh?', 'Read the product specs for resistance and the device it fits, then compare the BDT price.'],
      ['Can I pay cash on delivery for coils?', 'Yes. Checkout is cash on delivery.'],
      ['Are coils sold to minors?', 'No. cloudStr is 18+ only.']
    ]
  },
  'freebase-eliquid': {
    path: '/e-liquid',
    label: 'Freebase E-liquid',
    title: 'E-liquid Price in Bangladesh | cloudStr',
    h1: 'Freebase E-liquid in Bangladesh',
    desc: 'Shop freebase e-liquid in Bangladesh at cloudStr. Compare flavours and current BDT prices, with cash on delivery nationwide. Adults 18+ only.',
    intro: 'Browse freebase e-liquid at cloudStr. Check bottle size, nicotine strength and the current BDT price on each listing. 18+ only.',
    faq: [
      ['What is the e-liquid price in Bangladesh?', 'Prices are in BDT on every listing and update with the catalog.'],
      ['Do you deliver e-liquid outside Dhaka?', 'Nationwide delivery and cash on delivery are offered at checkout.'],
      ['Who can purchase e-liquid?', 'Adults 18 and older only. Nicotine is addictive.']
    ]
  }
};

const SHOP_SEO = {
  title: 'Shop Vape in Bangladesh | Pods & Disposables | cloudStr',
  h1: 'Shop Vape Devices in Bangladesh',
  desc: 'Shop the cloudStr vape catalog in Bangladesh: disposables, pod devices, nic salts, coils and e-liquid. Current BDT prices and cash on delivery. 18+.',
  intro: 'Browse every cloudStr listing in one place. Filter by category, compare BDT prices and open a product for photos and stock. Cash on delivery. Adults 18+ only.',
  faq: [
    ['Where can I buy a vape in Bangladesh?', 'cloudStr lists disposables, pod devices, nic salts, coils and freebase e-liquid with prices in BDT.'],
    ['Can I pay cash on delivery?', 'Yes. Checkout is cash on delivery.'],
    ['Do you deliver nationwide?', 'The storefront offers nationwide delivery. Confirm your area on WhatsApp at 01870034368.']
  ]
};

function esc(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"');
}

function clip(raw, max) {
  const text = String(raw || '').replace(/\s+/g, ' ').trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1).replace(/\s+\S*$/, '');
  return (cut || text.slice(0, max - 1)).trim() + '…';
}

function decodeField(field) {
  if (!field || typeof field !== 'object') return null;
  if ('stringValue' in field) return field.stringValue;
  if ('integerValue' in field) return Number(field.integerValue);
  if ('doubleValue' in field) return Number(field.doubleValue);
  if ('booleanValue' in field) return field.booleanValue;
  if ('nullValue' in field) return null;
  if ('timestampValue' in field) return field.timestampValue;
  if ('arrayValue' in field) return (field.arrayValue.values || []).map(decodeField);
  if ('mapValue' in field) {
    const out = {};
    const fields = (field.mapValue && field.mapValue.fields) || {};
    Object.keys(fields).forEach((key) => { out[key] = decodeField(fields[key]); });
    return out;
  }
  return null;
}

async function fetchAllProducts() {
  const products = [];
  let pageToken = '';
  do {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/products?pageSize=300&key=${FIREBASE_API_KEY}`
      + (pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : '');
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error('Firestore fetch failed: ' + response.status);
    const data = await response.json();
    (data.documents || []).forEach((doc) => {
      const fields = doc.fields || {};
      const product = {};
      Object.keys(fields).forEach((key) => { product[key] = decodeField(fields[key]); });
      product.id = doc.name.split('/').pop();
      product.updateTime = doc.updateTime || '';
      if (!product.slug) return;
      products.push(product);
    });
    pageToken = data.nextPageToken || '';
  } while (pageToken);
  return products;
}

function readTemplate(name) {
  const candidates = [
    path.join(process.cwd(), name),
    path.join(__dirname, '..', name)
  ];
  for (const file of candidates) {
    if (fs.existsSync(file)) return fs.readFileSync(file, 'utf8');
  }
  throw new Error('Missing template ' + name);
}

function upsertTag(html, pattern, tag) {
  if (pattern.test(html)) return html.replace(pattern, tag);
  return html.replace('</head>', `  ${tag}\n</head>`);
}

function applyHead(html, seo) {
  const title = esc(seo.title);
  const description = esc(clip(seo.description, 160));
  const url = seo.url || SITE + '/';
  const image = seo.image || OG_IMAGE;
  const robots = seo.robots || 'index,follow,max-image-preview:large,max-snippet:-1';
  html = html.replace(/<title>[^<]*<\/title>/i, `<title>${title}</title>`);
  html = upsertTag(html, /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${description}">`);
  html = upsertTag(html, /<meta\s+name="keywords"\s+content="[^"]*"\s*\/?>/i, `<meta name="keywords" content="${esc(seo.keywords || '')}">`);
  html = upsertTag(html, /<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/i, `<meta name="robots" content="${esc(robots)}">`);
  html = upsertTag(html, /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${esc(url)}">`);
  html = upsertTag(html, /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:type" content="${esc(seo.type || 'website')}">`);
  html = upsertTag(html, /<meta\s+property="og:site_name"\s+content="[^"]*"\s*\/?>/i, '<meta property="og:site_name" content="cloudStr">');
  html = upsertTag(html, /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${title}">`);
  html = upsertTag(html, /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${description}">`);
  html = upsertTag(html, /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${esc(url)}">`);
  html = upsertTag(html, /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:image" content="${esc(image)}">`);
  html = upsertTag(html, /<meta\s+property="og:image:alt"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:image:alt" content="${esc(seo.imageAlt || 'cloudStr vape storefront')}">`);
  html = upsertTag(html, /<meta\s+name="twitter:card"\s+content="[^"]*"\s*\/?>/i, '<meta name="twitter:card" content="summary_large_image">');
  html = upsertTag(html, /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${title}">`);
  html = upsertTag(html, /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${description}">`);
  html = upsertTag(html, /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:image" content="${esc(image)}">`);
  if (!html.includes('<base href="/">')) {
    html = html.replace('<head>', '<head>\n  <base href="/">');
  }
  if (seo.jsonLd) {
    const block = `<script type="application/ld+json" id="cloudstr-seo-ld">${JSON.stringify(seo.jsonLd).replace(/</g, '\\u003c')}</script>`;
    html = html.includes('id="cloudstr-seo-ld"')
      ? html.replace(/<script type="application\/ld\+json" id="cloudstr-seo-ld">[\s\S]*?<\/script>/, block)
      : html.replace('</head>', `  ${block}\n</head>`);
  }
  return html;
}

function faqHtml(items) {
  return `<section class="seo-faq" aria-label="Questions">
    <h2>Questions</h2>
    ${items.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('\n')}
  </section>`;
}

function faqSchema(items) {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map(([q, a]) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a }
    }))
  };
}

function breadcrumbSchema(crumbs) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: SITE + crumb.path
    }))
  };
}

function orgSchema() {
  return {
    '@type': 'OnlineStore',
    name: 'cloudStr',
    url: SITE + '/',
    telephone: '+8801870034368',
    image: OG_IMAGE,
    areaServed: 'BD',
    currenciesAccepted: 'BDT'
  };
}

function sendHtml(res, html, status) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=86400');
  res.status(status || 200).send(html);
}

function categoryByKey(key) {
  return CATEGORIES[key] || null;
}

module.exports = {
  SITE, CATEGORIES, SHOP_SEO, esc, clip, fetchAllProducts, readTemplate,
  applyHead, faqHtml, faqSchema, breadcrumbSchema, orgSchema, sendHtml, categoryByKey, OG_IMAGE
};
