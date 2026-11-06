(function () {
// Used by both the static build (Node) and the browser, so cards match everywhere.
const esc = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const base = (lang) => (lang === 'en' ? '/en' : '');

// Hosted site: paths stay as they are. Double-click version: relative paths ending in index.html.
const href = (p) => {
  const c = globalThis.DAHAB;
  if (!c || !c.local) return p;
  const m = p.match(/^\/?([^?#]*)(.*)$/);
  let file = m[1];
  if (!file || file.endsWith('/')) file += 'index.html';
  return c.root + file + m[2];
};

const TYPES = {
  'food-dry': ['طعام جاف', 'Dry food'],
  'food-wet': ['طعام رطب', 'Wet food'],
  treats: ['حلويات ومكافآت', 'Treats'],
  toys: ['ألعاب', 'Toys'],
  walking: ['مقاود وأحزمة', 'Leashes and harnesses'],
  bowls: ['أطباق وتغذية', 'Bowls and feeding'],
  grooming: ['عناية ونظافة', 'Grooming'],
  litter: ['رمل القطط', 'Cat litter'],
  carriers: ['حقائب وأقفاص', 'Carriers and crates'],
  health: ['صحة وعلاج', 'Health'],
  training: ['تدريب', 'Training'],
};
const PETS = { dog: ['كلاب', 'Dogs'], cat: ['قطط', 'Cats'], bird: ['طيور', 'Birds'], all: ['كل الحيوانات', 'All pets'] };
const typeName = (t, lang) => TYPES[t]?.[lang === 'en' ? 1 : 0] ?? t;
const petName = (t, lang) => PETS[t]?.[lang === 'en' ? 1 : 0] ?? t;

const SIZE_AR = [[/ per pack$/, ' قطع'], [/ pcs$/, ' قطعة'], [/ pack$/, ' عبوة'], [/ tablets$/, ' قرص'], [/ kg$/, ' كجم'], [/ gr$/, ' جم'], [/ ml$/, ' مل'], [/ L$/, ' لتر']];
function sizeLabel(size, lang) {
  if (lang === 'en') return size.replace(/ gr$/, ' g').replace(/ per pack$/, ' pieces').replace(/ pcs$/, ' pc').replace(/^1 tablets$/, '1 tablet');
  let s = size;
  for (const [re, ar] of SIZE_AR) s = s.replace(re, ar);
  return s.replace(' x ', ' × ');
}
const isSingle = (size) => /^1 (pcs|pack)$/.test(size);

function money(value, lang) {
  const n = Number.isInteger(value) ? value.toLocaleString('en-US') : value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return lang === 'en' ? `EGP ${n}` : `${n} ج.م`;
}

const productCount = (n, lang) => (lang === 'en' ? `${n} product${n === 1 ? '' : 's'}` : `${n} ${n >= 3 && n <= 10 ? 'منتجات' : 'منتج'}`);

const STR = {
  ar: { add: 'أضف للسلة', ask: 'اسأل عن السعر', egypt: 'صنع في مصر', fav: 'أضف للمفضلة' },
  en: { add: 'Add to cart', ask: 'Ask for price', egypt: 'Made in Egypt', fav: 'Add to wishlist' },
};

// p: { id, slug, ar, en, brand, size, price, egypt }
function card(p, lang) {
  const t = STR[lang];
  const name = lang === 'en' ? p.en : p.ar;
  const url = href(`${base(lang)}/p/${p.slug}/`);
  const size = isSingle(p.size) ? '' : `<span class="card-size">${esc(sizeLabel(p.size, lang))}</span>`;
  const add = p.price == null ? '' : `<button type="button" class="btn-add" data-add="${p.id}" aria-label="${esc(t.add)}: ${esc(name)}">${esc(t.add)}</button>`;
  const price = p.price == null ? `<a class="card-price card-ask" href="${url}">${t.ask}</a>` : `<span class="card-price">${money(p.price, lang)}</span>`;
  const brand = p.brand || p.egypt ? `<p class="card-brand">${esc(p.brand)}${p.egypt ? `<span class="flag">${t.egypt}</span>` : ''}</p>` : '';
  return `<article class="card"><div class="card-media"><a class="card-img" href="${url}" tabindex="-1" aria-hidden="true"><img src="${href(`/assets/products/${p.id}-400.webp`)}" alt="" width="400" height="400" loading="lazy" decoding="async"></a><button type="button" class="fav" data-fav="${p.id}" aria-pressed="false" aria-label="${esc(t.fav)}: ${esc(name)}"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 20.5s-8-4.9-8-11A4.6 4.6 0 0 1 12 6.6a4.6 4.6 0 0 1 8 2.9c0 6.1-8 11-8 11Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg></button>${add}</div><div class="card-body">${brand}<h3 class="card-name"><a href="${url}">${esc(name)}</a></h3><div class="card-line">${price}${size}</div></div></article>`;
}

// Arabic-aware search folding: أ/إ/آ to ا, ة to ه, ى to ي, no diacritics.
const fold = (t) => String(t).toLowerCase().replace(/[ً-ْـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');


const lang = document.documentElement.lang === 'en' ? 'en' : 'ar';
const cfg = window.DAHAB || { whatsapp: '' };
const T = lang === 'en'
  ? {
    cartEmpty: 'Your cart is empty. Add something your pet will love.', browse: 'Browse the shop', total: 'Total', checkout: 'Continue to order', remove: 'Remove', added: 'Added to cart',
    results: (n) => `${n} products`, none: 'No products match. Clear a filter or try another search.', more: 'Show more', clear: 'Clear filters',
    msgHead: 'New order from the Dahab Pets website', msgOrder: 'Order number', errMsg: 'Write your message.', errOrder: 'Enter your order number.', contactHead: 'Message from the Dahab Pets website', trackHead: 'I would like to know about my order', msgName: 'Name', msgPhone: 'Phone', msgArea: 'Governorate', msgAddress: 'Address', msgNotes: 'Notes', msgItems: 'Items', msgTotal: 'Total', msgPay: 'Payment: cash on delivery', msgFee: 'Please confirm the delivery fee.',
    errName: 'Enter your name.', errPhone: 'Enter an Egyptian mobile number, like 01012345678.', errArea: 'Choose your governorate.', errAddress: 'Enter your delivery address.', qty: 'Quantity', askMsg: 'Hello, what is the price of this product?',
  }
  : {
    cartEmpty: 'سلتك فاضية. اختار حاجة أليفك هيحبها.', browse: 'تصفّح المتجر', total: 'الإجمالي', checkout: 'كمّل الطلب', remove: 'احذف', added: 'اتضاف للسلة',
    results: (n) => `${n} منتج`, none: 'مفيش منتجات مطابقة. امسح فلتر أو جرّب كلمة تانية.', more: 'اعرض المزيد', clear: 'امسح الفلاتر',
    msgHead: 'طلب جديد من موقع دهب بتس', msgOrder: 'رقم الطلب', errMsg: 'اكتب رسالتك.', errOrder: 'اكتب رقم الطلب.', contactHead: 'رسالة من موقع دهب بتس', trackHead: 'عايز أعرف طلبي وصل لفين', msgName: 'الاسم', msgPhone: 'الموبايل', msgArea: 'المحافظة', msgAddress: 'العنوان', msgNotes: 'ملاحظات', msgItems: 'المنتجات', msgTotal: 'الإجمالي', msgPay: 'الدفع: كاش عند الاستلام', msgFee: 'برجاء تأكيد مصاريف التوصيل.',
    errName: 'اكتب اسمك.', errPhone: 'اكتب رقم موبايل مصري، زي 01012345678.', errArea: 'اختار محافظتك.', errAddress: 'اكتب عنوان التوصيل.', qty: 'الكمية', askMsg: 'أهلًا، سعر المنتج ده كام؟',
  };

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* Cart storage: falls back to memory where localStorage is blocked. */
let memCart = {};
const readCart = () => { try { return JSON.parse(localStorage.getItem('dahab-cart')) || {}; } catch { return memCart; } };
const writeCart = (c) => { memCart = c; try { localStorage.setItem('dahab-cart', JSON.stringify(c)); } catch { /* memory only */ } paint(); };
const countOf = (c) => Object.values(c).reduce((a, b) => a + b, 0);

let catalogP;
const loadRows = () => (cfg.local
  ? new Promise((resolve, reject) => {
    if (window.DAHAB_CATALOG) { resolve(window.DAHAB_CATALOG); return; }
    const tag = document.createElement('script');
    tag.src = `${cfg.root}catalog.js`;
    tag.onload = () => resolve(window.DAHAB_CATALOG);
    tag.onerror = reject;
    document.head.append(tag);
  })
  : fetch('/catalog.json').then((r) => r.json()));
const catalog = () => (catalogP ||= loadRows().then((rows) => {
  const list = rows.map(([id, slug, ar, en, brand, pet, type, size, price, egypt]) => ({ id, slug, ar, en, brand, pet, type, size, price, egypt: !!egypt, text: fold(`${ar} ${en} ${brand}`) }));
  return { list, byId: Object.fromEntries(list.map((p) => [p.id, p])) };
}));

const waUrl = (text) => `https://wa.me/${cfg.whatsapp || ''}?text=${encodeURIComponent(text)}`;

/* Cart drawer */
const drawer = $('#cart');
function openCart() { drawer.showModal(); paint(); }
async function paint() {
  const c = readCart();
  const n = countOf(c);
  $$('[data-count]').forEach((el) => { el.textContent = n; el.hidden = !n; });
  const body = $('#cart-body');
  if (!body || (!drawer.open && !$('#checkout'))) { if ($('#checkout')) paintCheckout(); return; }
  if (drawer.open) {
    if (!n) {
      body.innerHTML = `<p class="cart-empty">${T.cartEmpty}</p><a class="btn" href="${href(`${base(lang)}/shop/`)}">${T.browse}</a>`;
    } else {
      const { byId } = await catalog();
      let total = 0;
      const rows = Object.entries(c).map(([id, q]) => {
        const p = byId[id]; if (!p) return '';
        total += p.price * q;
        const name = lang === 'en' ? p.en : p.ar;
        return `<li class="line"><img src="${href(`/assets/products/${id}-400.webp`)}" alt="" width="72" height="72"><div class="line-main"><a href="${href(`${base(lang)}/p/${p.slug}/`)}">${esc(name)}</a>${isSingle(p.size) ? '' : `<span>${esc(sizeLabel(p.size, lang))}</span>`}<div class="qty"><button type="button" data-dec="${id}" aria-label="-">−</button><output aria-label="${T.qty}">${q}</output><button type="button" data-inc="${id}" aria-label="+">+</button></div></div><div class="line-end"><strong>${money(p.price * q, lang)}</strong><button type="button" class="link" data-del="${id}">${T.remove}</button></div></li>`;
      }).join('');
      body.innerHTML = `<ul class="lines">${rows}</ul><div class="cart-total"><span>${T.total}</span><strong>${money(Math.round(total * 100) / 100, lang)}</strong></div><a class="btn" href="${href(`${base(lang)}/checkout/`)}">${T.checkout}</a>`;
    }
  }
  if ($('#checkout')) paintCheckout();
}

let toastTimer;
function toast(msg) {
  const el = $('#toast'); if (!el) return;
  el.textContent = msg; el.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { el.hidden = true; }, 2200);
}

document.addEventListener('click', (e) => {
  const t = e.target.closest('button, a, [data-close]');
  if (e.target === drawer) { drawer.close(); return; }
  if (!t) return;
  const c = readCart();
  if (t.dataset.add) {
    const qty = +($('#qty-input')?.value || 1);
    c[t.dataset.add] = (c[t.dataset.add] || 0) + (t.dataset.pdp ? qty : 1);
    writeCart(c); toast(T.added);
    t.classList.remove('bump'); void t.offsetWidth; t.classList.add('bump');
  } else if (t.dataset.inc) { c[t.dataset.inc]++; writeCart(c); }
  else if (t.dataset.dec) { c[t.dataset.dec]--; if (c[t.dataset.dec] < 1) delete c[t.dataset.dec]; writeCart(c); }
  else if (t.dataset.del) { delete c[t.dataset.del]; writeCart(c); }
  else if (t.id === 'cart-open') { e.preventDefault(); openCart(); }
  else if (t.dataset.close !== undefined) drawer.close();
});

/* Product page quantity stepper */
const qtyInput = $('#qty-input');
if (qtyInput) {
  $('#qty-dec').addEventListener('click', () => { qtyInput.value = Math.max(1, +qtyInput.value - 1); });
  $('#qty-inc').addEventListener('click', () => { qtyInput.value = Math.min(99, +qtyInput.value + 1); });
}
const ask = $('[data-ask]');
if (ask) ask.href = waUrl(`${T.askMsg}\n${ask.dataset.ask}`);

/* Shop */
const shop = $('#shop');
if (shop) initShop();
async function initShop() {
  const PAGE = 24;
  const grid = $('#grid'), count = $('#result-count'), moreBtn = $('#more');
  const form = $('#filters');
  const { list } = await catalog();
  const q = new URLSearchParams(location.search);
  const st = { pet: q.get('pet') || '', type: q.get('type') || '', brand: q.get('brand') || '', q: q.get('q') || '', egypt: q.get('egypt') === '1', sort: q.get('sort') || '', max: q.get('max') || '' };
  let shown = PAGE;
  if (innerWidth <= 720 && !st.q && !st.brand && !st.sort && !st.egypt && !st.max) $('#filter-box').open = false;

  form.elements.q.value = st.q; form.elements.brand.value = st.brand; form.elements.sort.value = st.sort; form.elements.egypt.checked = st.egypt; form.elements.max.value = st.max;

  function results() {
    const words = fold(st.q).split(/\s+/).filter(Boolean);
    let r = list.filter((p) => (!st.pet || p.pet === st.pet || (p.pet === 'all' && st.pet !== 'bird'))
      && (!st.type || p.type === st.type) && (!st.brand || p.brand === st.brand) && (!st.egypt || p.egypt)
      && (!st.max || (p.price != null && p.price <= +st.max)) && words.every((w) => p.text.includes(w)));
    if (st.sort === 'low') r = [...r].sort((a, b) => (a.price ?? 1e9) - (b.price ?? 1e9));
    if (st.sort === 'high') r = [...r].sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
    return r;
  }
  function render(keepUrl) {
    const r = results();
    count.textContent = productCount(r.length, lang);
    grid.innerHTML = r.length ? r.slice(0, shown).map((p) => card(p, lang)).join('') : `<div class="none"><p>${T.none}</p><button type="button" class="btn btn-ghost" id="clear">${T.clear}</button></div>`;
    moreBtn.hidden = r.length <= shown;
    $$('[data-pet]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.pet === st.pet)));
    $$('[data-type]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.type === st.type)));
    if (!keepUrl) {
      const u = new URLSearchParams();
      for (const k of ['pet', 'type', 'brand', 'q', 'sort', 'max']) if (st[k]) u.set(k, st[k]);
      if (st.egypt) u.set('egypt', '1');
      try { history.replaceState(null, '', `${location.pathname}${u.size ? `?${u}` : ''}`); } catch { /* some browsers refuse this on file:// */ }
    }
  }
  shop.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.pet !== undefined) { st.pet = st.pet === b.dataset.pet ? '' : b.dataset.pet; shown = PAGE; render(); }
    else if (b.dataset.type !== undefined) { st.type = st.type === b.dataset.type ? '' : b.dataset.type; shown = PAGE; render(); }
    else if (b.id === 'more') { shown += PAGE; render(true); }
    else if (b.id === 'clear') { Object.assign(st, { pet: '', type: '', brand: '', q: '', egypt: false, sort: '', max: '' }); form.reset(); shown = PAGE; render(); }
  });
  form.addEventListener('input', () => {
    st.q = form.elements.q.value.trim(); st.brand = form.elements.brand.value; st.sort = form.elements.sort.value; st.egypt = form.elements.egypt.checked; st.max = form.elements.max.value;
    shown = PAGE; render();
  });
  form.addEventListener('submit', (e) => e.preventDefault());
  render(true);
}

/* Checkout: builds a WhatsApp message. Nothing is sent to any server. */
async function paintCheckout() {
  const c = readCart();
  const box = $('#order-summary');
  const form = $('#checkout');
  if (!countOf(c)) { box.innerHTML = `<p class="cart-empty">${T.cartEmpty}</p><a class="btn" href="${href(`${base(lang)}/shop/`)}">${T.browse}</a>`; form.hidden = true; return; }
  form.hidden = false;
  const { byId } = await catalog();
  let total = 0;
  const rows = Object.entries(c).map(([id, q]) => { const p = byId[id]; if (!p) return ''; total += p.price * q; return `<li><span>${q} × ${esc(lang === 'en' ? p.en : p.ar)}${isSingle(p.size) ? '' : ` (${esc(sizeLabel(p.size, lang))})`}</span><strong>${money(p.price * q, lang)}</strong></li>`; }).join('');
  box.innerHTML = `<ul class="summary">${rows}</ul><div class="cart-total"><span>${T.total}</span><strong>${money(Math.round(total * 100) / 100, lang)}</strong></div>`;
}
const checkoutForm = $('#checkout');
if (checkoutForm) {
  const after = $('#order-sent');
  checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = checkoutForm.elements;
    const phone = f.phone.value.replace(/[\s-]/g, '').replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
    const errors = [];
    if (!f.name.value.trim()) errors.push(['name', T.errName]);
    if (!/^01[0125]\d{8}$/.test(phone)) errors.push(['phone', T.errPhone]);
    if (!f.area.value) errors.push(['area', T.errArea]);
    if (!f.address.value.trim()) errors.push(['address', T.errAddress]);
    $$('.field-error', checkoutForm).forEach((el) => { el.textContent = ''; });
    $$('[aria-invalid]', checkoutForm).forEach((el) => el.removeAttribute('aria-invalid'));
    for (const [k, msg] of errors) { $(`#err-${k}`).textContent = msg; f[k].setAttribute('aria-invalid', 'true'); }
    if (errors.length) { f[errors[0][0]].focus(); return; }
    const { byId } = await catalog();
    const c = readCart();
    let total = 0;
    const lines = Object.entries(c).map(([id, q]) => { const p = byId[id]; if (!p) return ''; total += p.price * q; return `- ${q} × ${lang === 'en' ? p.en : p.ar}${isSingle(p.size) ? '' : ` (${sizeLabel(p.size, lang)})`}: ${money(p.price * q, lang)}`; }).filter(Boolean);
    const code = `DP-${Date.now().toString().slice(-6)}`;
    const text = [T.msgHead, `${T.msgOrder}: ${code}`, '', `${T.msgName}: ${f.name.value.trim()}`, `${T.msgPhone}: ${phone}`, `${T.msgArea}: ${f.area.value}`, `${T.msgAddress}: ${f.address.value.trim()}`, f.notes.value.trim() ? `${T.msgNotes}: ${f.notes.value.trim()}` : '', '', `${T.msgItems}:`, ...lines, '', `${T.msgTotal}: ${money(Math.round(total * 100) / 100, lang)}`, T.msgPay, T.msgFee].filter((l, i, a) => l !== '' || a[i - 1] !== '').join('\n');
    const url = waUrl(text);
    $('#wa-link').href = url;
    checkoutForm.hidden = true; after.hidden = false; after.focus();
    window.open(url, '_blank', 'noopener');
  });
  $('#order-done').addEventListener('click', () => { writeCart({}); location.href = `${href(`${base(lang)}/`)}`; });
  $('#order-back').addEventListener('click', () => { after.hidden = true; checkoutForm.hidden = false; });
}


/* Wishlist: saved on this device only */
let memFav = [];
const readFav = () => { try { return JSON.parse(localStorage.getItem('dahab-fav')) || []; } catch { return memFav; } };
const writeFav = (list) => { memFav = list; try { localStorage.setItem('dahab-fav', JSON.stringify(list)); } catch { /* memory only */ } };
function paintFav() {
  const list = readFav();
  $$('[data-fav-count]').forEach((el) => { el.hidden = !list.length; if (el.textContent !== String(list.length)) el.textContent = list.length; });
  $$('[data-fav]').forEach((b) => b.setAttribute('aria-pressed', String(list.includes(b.dataset.fav))));
}
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-fav]'); if (!b) return;
  const list = readFav(); const id = b.dataset.fav;
  writeFav(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  paintFav();
  if ($('#wish-grid')) paintWish();
});
for (const g of $$('#grid, #wish-grid')) new MutationObserver(paintFav).observe(g, { childList: true });
async function paintWish() {
  const grid = $('#wish-grid'); const list = readFav();
  $('#wish-empty').hidden = !!list.length;
  if (!list.length) { grid.innerHTML = ''; return; }
  const { byId } = await catalog();
  grid.innerHTML = list.map((id) => byId[id]).filter(Boolean).map((p) => card(p, lang)).join('');
}
if ($('#wish-grid')) paintWish();
paintFav();

/* Mobile menu */
const menu = $('#menu');
$('#menu-open')?.addEventListener('click', () => menu.showModal());
menu?.addEventListener('click', (e) => { if (e.target === menu || e.target.closest('[data-close-menu]')) menu.close(); });

/* Contact and order questions: open WhatsApp with the message written */
$$('[data-wa-form]').forEach((form) => form.addEventListener('submit', (e) => {
  e.preventDefault();
  const f = form.elements; const errs = [];
  const err = (el, msg) => { errs.push(el); el.setAttribute('aria-invalid', 'true'); el.closest('.field').querySelector('.field-error').textContent = msg; };
  $$('.field-error', form).forEach((x) => { x.textContent = ''; });
  $$('[aria-invalid]', form).forEach((x) => x.removeAttribute('aria-invalid'));
  const phone = f.phone.value.replace(/[\s-]/g, '').replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
  const isTrack = form.dataset.waForm === 'track';
  if (isTrack && !f.order.value.trim()) err(f.order, T.errOrder);
  if (!isTrack && !f.name.value.trim()) err(f.name, T.errName);
  if (!/^01[0125]\d{8}$/.test(phone)) err(f.phone, T.errPhone);
  if (!isTrack && !f.msg.value.trim()) err(f.msg, T.errMsg);
  if (errs.length) { errs[0].focus(); return; }
  const text = isTrack
    ? [T.trackHead, `${T.msgOrder}: ${f.order.value.trim()}`, `${T.msgPhone}: ${phone}`].join('\n')
    : [T.contactHead, `${T.msgName}: ${f.name.value.trim()}`, `${T.msgPhone}: ${phone}`, '', f.msg.value.trim()].join('\n');
  window.open(waUrl(text), '_blank', 'noopener');
}));

/* Hero slider */
const slider = $('#slider');
if (slider) {
  const slides = $$('.slide', slider); const dots = $$('[data-go]', slider);
  const HOLD = 7000; const OUT = 900;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let cur = 0; let timer; let paused = false; let busy = false;
  const show = (n) => {
    n = (n + slides.length) % slides.length;
    if (n === cur || busy) return;
    busy = true;
    const from = slides[cur]; const to = slides[n];
    from.classList.remove('is-in'); from.classList.add('is-out'); from.setAttribute('aria-hidden', 'true');
    setTimeout(() => { from.classList.remove('is-out'); busy = false; }, calm ? 0 : OUT);
    setTimeout(() => { to.classList.add('is-in'); to.removeAttribute('aria-hidden'); }, calm ? 0 : OUT * 0.4);
    dots.forEach((d, i) => (i === n ? d.setAttribute('aria-current', 'true') : d.removeAttribute('aria-current')));
    cur = n;
  };
  const arm = () => { clearTimeout(timer); timer = setTimeout(() => { if (!paused && !document.hidden) show(cur + 1); arm(); }, HOLD); };
  dots.forEach((d) => d.addEventListener('click', () => { show(+d.dataset.go); arm(); }));
  $('.s-prev', slider).addEventListener('click', () => { show(cur - 1); arm(); });
  $('.s-next', slider).addEventListener('click', () => { show(cur + 1); arm(); });
  slider.addEventListener('mouseenter', () => { paused = true; });
  slider.addEventListener('mouseleave', () => { paused = false; });
  slider.addEventListener('focusin', () => { paused = true; });
  slider.addEventListener('focusout', () => { paused = false; });
  let sx = null;
  slider.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
  slider.addEventListener('touchend', (e) => {
    if (sx == null) return;
    const dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) < 50) return;
    const forward = lang === 'en' ? dx < 0 : dx > 0;
    show(cur + (forward ? 1 : -1)); arm();
  });
  if (!calm) arm();
}

paint();

})();
