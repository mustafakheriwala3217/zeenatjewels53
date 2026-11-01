// Category link page: zeenatjewels53.com/c/gold-rings
// WhatsApp reads the og: tags below and shows the category photo in the chat.
// People who tap the link land on the shop with only that category showing.
const SUPABASE_URL = 'https://hocifqrkneafbvbnfyuv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_E4kODCWXx1-C40kuR-PSpQ_qDiftUrl'; // publishable key, safe to be public

// Friendly link names for the main categories (link name -> category id)
const SLUGS = {
  'gold-rings': 'gold', 'silver-rings': 'silver', 'kurta-buttons': 'buttons',
  'gem-stones': 'gems', 'gemstones': 'gems', 'takhti': 'bracelets', 'tasbih': 'tasbih'
};

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const get = async (path) => {
  try {
    const r = await fetch(SUPABASE_URL + '/rest/v1/' + path, { headers: { apikey: SUPABASE_KEY, Accept: 'application/json' } });
    return r.ok ? await r.json() : [];
  } catch (e) { return []; }
};

export async function onRequestGet({ params, request }) {
  const slug = String(params.slug || '').toLowerCase();
  const host = new URL(request.url).origin;
  if (!/^[a-z0-9-]{1,60}$/.test(slug)) return Response.redirect(host + '/', 302);
  const id = SLUGS[slug] || slug;

  const cats = await get('categories?select=id,name,image,description&visible=eq.true&id=eq.' + encodeURIComponent(id));
  const cat = cats[0];
  if (!cat) return Response.redirect(host + '/', 302);

  let img = cat.image || '';
  if (!img) {
    const prods = await get('products?select=images&visible=eq.true&category=eq.' + encodeURIComponent(id) + '&order=sort_order.asc&limit=5');
    const p = prods.find((x) => x.images && x.images[0]);
    img = p ? p.images[0] : '';
  }

  const target = host + '/?c=' + encodeURIComponent(id);
  const title = cat.name + ' | Zeenat Jewels';
  const desc = (cat.description || 'See our ' + cat.name + ' collection. Courier across India & International.').slice(0, 180);

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>${esc(title)}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Zeenat Jewels">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(host + '/c/' + slug)}">
${img ? `<meta property="og:image" content="${esc(img)}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="${esc(img)}">` : ''}
<meta http-equiv="refresh" content="0; url=${esc(target)}">
<link rel="canonical" href="${esc(target)}">
</head><body style="font-family:Georgia,serif;background:#F4E6DA;color:#3A2A1F;text-align:center;padding:40px 16px">
<h1 style="font-weight:600">${esc(cat.name)}</h1>
<p><a href="${esc(target)}" style="color:#7A5C17">View ${esc(cat.name)} on Zeenat Jewels</a></p>
<script>location.replace(${JSON.stringify(target)});</script>
</body></html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400' }
  });
}
