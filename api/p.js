// Product link page: zeenatjewels53.vercel.app/p/<product id>
// WhatsApp reads the og:image tag below and shows the product photo in the chat.
// People who tap the link are sent straight to that product on the website.
const SUPABASE_URL = 'https://hocifqrkneafbvbnfyuv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_E4kODCWXx1-C40kuR-PSpQ_qDiftUrl'; // publishable key, safe to be public

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

module.exports = async (req, res) => {
  const id = String((req.query && req.query.id) || '').toLowerCase();
  const host = 'https://' + (req.headers['x-forwarded-host'] || req.headers.host || 'zeenatjewels53.vercel.app');
  if (!/^[0-9a-f-]{36}$/.test(id)) { res.statusCode = 302; res.setHeader('Location', host + '/'); return res.end(); }

  let p = null;
  try {
    const r = await fetch(SUPABASE_URL + '/rest/v1/products?select=id,name,price,stone,metal,description,images&visible=eq.true&id=eq.' + id, {
      headers: { apikey: SUPABASE_KEY, Accept: 'application/json' }
    });
    if (r.ok) { const rows = await r.json(); p = rows && rows[0]; }
  } catch (e) { p = null; }

  const target = host + '/#p-' + id;
  if (!p) { res.statusCode = 302; res.setHeader('Location', host + '/'); return res.end(); }

  const price = p.price == null ? 'Price on request' : '₹ ' + Number(p.price).toLocaleString('en-IN');
  const title = p.name + ' · ' + price;
  const desc = (p.description || [p.stone, p.metal].filter(Boolean).join(' · ') || 'Zeenat Jewels: Rare Jewels, Timeless Elegance').slice(0, 180);
  const img = (p.images && p.images[0]) || '';

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');
  res.end(`<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>${esc(title)} | Zeenat Jewels</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta property="og:type" content="product">
<meta property="og:site_name" content="Zeenat Jewels">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(host + '/p/' + id)}">
${img ? `<meta property="og:image" content="${esc(img)}">
<meta property="og:image:width" content="1080"><meta property="og:image:height" content="1350">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="${esc(img)}">` : ''}
<meta http-equiv="refresh" content="0; url=${esc(target)}">
<link rel="canonical" href="${esc(target)}">
</head><body style="font-family:Georgia,serif;background:#F4E6DA;color:#3A2A1F;text-align:center;padding:40px 16px">
${img ? `<img src="${esc(img)}" alt="${esc(p.name)}" style="max-width:320px;width:100%">` : ''}
<h1 style="font-weight:600">${esc(p.name)}</h1><p>${esc(price)}</p>
<p><a href="${esc(target)}" style="color:#7A5C17">View on Zeenat Jewels</a></p>
<script>location.replace(${JSON.stringify(target)});</script>
</body></html>`);
};
