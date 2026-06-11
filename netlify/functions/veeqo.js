const VEEQO_API_KEY = process.env.VEEQO_API_KEY || "YOUR_API_KEY_HERE";
const VEEQO_BASE = "https://api.veeqo.com";
const ALLOWED = ["/products", "/orders", "/customers"];

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };

  const { endpoint, params } = event.queryStringParameters || {};
  if (!endpoint) return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing endpoint" }) };
  if (!ALLOWED.some(e => endpoint.startsWith(e))) return { statusCode: 403, headers, body: JSON.stringify({ error: "Forbidden" }) };

  try {
    // For orders, only fetch last 60 days, single page
    if (endpoint === '/orders') {
      const since = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
      const url = `${VEEQO_BASE}/orders?page_size=100&page=1&updated_at_min=${since}`;
      const res = await fetch(url, {
        headers: { "x-api-key": VEEQO_API_KEY, "Content-Type": "application/json" },
      });
      const data = await res.json();
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    // For products, fetch all pages
    let allData = [];
    let page = 1;
    const baseParams = params ? `${params}&` : "";
    while (true) {
      const url = `${VEEQO_BASE}${endpoint}?${baseParams}page_size=100&page=${page}`;
      const res = await fetch(url, {
        headers: { "x-api-key": VEEQO_API_KEY, "Content-Type": "application/json" },
      });
      if (!res.ok) { const text = await res.text(); return { statusCode: res.status, headers, body: text }; }
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) break;
      allData = allData.concat(data);
      if (data.length < 100) break;
      page++;
      if (page > 20) break;
    }
    return { statusCode: 200, headers, body: JSON.stringify(allData) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
