// Proxy a la API de Veeqo para el portal de clientes de MyFullGuy.
// Seguridad: cada request trae el código de acceso en el header "x-portal-token".
// Se compara su SHA-256 contra clients.js y se devuelven SOLO los datos de ese cliente.
const crypto = require("crypto");
const CLIENTS = require("./clients");

const VEEQO_API_KEY = process.env.VEEQO_API_KEY;
const VEEQO_BASE = "https://api.veeqo.com";
const EXCLUDED_BRANDS = ["Generic", "Fujian Yueke New Material Co., LTD.", "Ruh Naturals"];
const ORDER_DAYS = 60;
const MAX_ORDER_PAGES = 15;
const MAX_PRODUCT_PAGES = 20;
const PARALLEL = 4;

const json = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  body: JSON.stringify(body),
});

const sha256 = (s) => crypto.createHash("sha256").update(s, "utf8").digest("hex");

function findClient(token) {
  if (!token) return null;
  const h = sha256(token.trim());
  return CLIENTS.find((c) => c.tokenHash && crypto.timingSafeEqual(Buffer.from(c.tokenHash), Buffer.from(h))) || null;
}

async function veeqo(path) {
  const res = await fetch(`${VEEQO_BASE}${path}`, {
    headers: { "x-api-key": VEEQO_API_KEY, "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`Veeqo ${res.status}`);
  return res.json();
}

// Trae páginas en tandas paralelas hasta que una página venga incompleta.
async function fetchAllPages(buildPath, maxPages, stopFn) {
  let all = [];
  for (let start = 1; start <= maxPages; start += PARALLEL) {
    const pages = [];
    for (let p = start; p < start + PARALLEL && p <= maxPages; p++) pages.push(p);
    const results = await Promise.all(pages.map((p) => veeqo(buildPath(p)).catch(() => [])));
    let done = false;
    for (const data of results) {
      if (!Array.isArray(data) || data.length === 0) { done = true; break; }
      all = all.concat(data);
      if (data.length < 100 || (stopFn && stopFn(data))) { done = true; break; }
    }
    if (done) break;
  }
  return all;
}

const lc = (s) => (s || "").toLowerCase();

function stockFor(sellable, type) {
  return (sellable.stock_entries || [])
    .filter((e) => {
      const n = lc(e.warehouse?.name);
      if (type === "mfg") return n.includes("myfullguy") || n.includes("magnolia");
      return n.includes("fba");
    })
    .reduce((s, e) => s + (e.available_stock_level ?? e.physical_stock_level ?? 0), 0);
}

function productMatches(p, client) {
  if (!client || client.admin) return true;
  return (client.brands || []).includes(p.brand?.name);
}

function orderMatches(o, client) {
  if (!client || client.admin) return true;
  const ch = lc(o.channel?.name);
  return (client.channels || []).some((c) => ch.includes(lc(c)));
}

async function getProducts(scope) {
  const raw = await fetchAllPages((p) => `/products?page_size=100&page=${p}`, MAX_PRODUCT_PAGES);
  const rows = [];
  for (const p of raw) {
    if (EXCLUDED_BRANDS.includes(p.brand?.name) || !productMatches(p, scope)) continue;
    for (const s of p.sellables || []) {
      const mfg = stockFor(s, "mfg");
      const fba = stockFor(s, "fba");
      const variant = s.sellable_title && s.sellable_title !== "Default" ? s.sellable_title : "";
      rows.push({ title: p.title || "–", variant, brand: p.brand?.name || "–", sku: s.sku_code || "–", mfg, fba, total: mfg + fba });
    }
  }
  return rows;
}

async function getOrders(scope) {
  const since = new Date(Date.now() - ORDER_DAYS * 86400000);
  const sinceIso = since.toISOString();
  const raw = await fetchAllPages(
    (p) => `/orders?page_size=100&page=${p}&created_at_min=${encodeURIComponent(sinceIso)}`,
    MAX_ORDER_PAGES,
    (page) => page.every((o) => new Date(o.created_at) < since)
  );
  const seen = new Set();
  return raw
    .filter((o) => new Date(o.created_at) >= since && orderMatches(o, scope))
    .filter((o) => (seen.has(o.id) ? false : seen.add(o.id)))
    .map((o) => {
      const lines = (o.line_items || []).map((li) => ({
        sku: li.sellable?.sku_code || "",
        title: li.sellable?.product_title || li.sellable?.full_title || "–",
        qty: li.quantity || 1,
        price: li.price_per_unit != null ? parseFloat(li.price_per_unit) : null,
      }));
      const name = [o.deliver_to?.first_name, o.deliver_to?.last_name].filter(Boolean).join(" ");
      return {
        number: o.number || String(o.id),
        status: o.status || "",
        channel: o.channel?.name || "–",
        customer: name || "",
        units: lines.reduce((s, l) => s + l.qty, 0),
        total: parseFloat(o.total_price || 0),
        created_at: o.created_at,
        lines,
      };
    });
}

exports.handler = async (event) => {
  if (!VEEQO_API_KEY) return json(500, { error: "Falta VEEQO_API_KEY" });

  const token = event.headers["x-portal-token"] || event.headers["X-Portal-Token"];
  const client = findClient(token);
  if (!client) return json(401, { error: "Código incorrecto" });

  const q = event.queryStringParameters || {};
  // El admin puede ver un cliente puntual; un cliente siempre ve solo lo suyo.
  let scope = client;
  if (client.admin && q.client) {
    scope = CLIENTS.find((c) => c.id === q.client && !c.admin) || client;
  }

  try {
    if (q.action === "session") {
      return json(200, {
        name: client.name,
        admin: !!client.admin,
        clients: client.admin ? CLIENTS.filter((c) => !c.admin).map((c) => ({ id: c.id, name: c.name })) : [],
      });
    }
    if (q.action === "data") {
      const [products, orders] = await Promise.all([getProducts(scope), getOrders(scope)]);
      return json(200, { products, orders, generatedAt: new Date().toISOString() });
    }
    return json(400, { error: "Acción inválida" });
  } catch (err) {
    return json(502, { error: err.message });
  }
};
