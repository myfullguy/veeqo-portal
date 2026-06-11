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
    // Fetch all pages automatically
    let allData = [];
    let page = 1;
    const baseParams = params ? `${params}&` : "";

    while (true) {
      const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
const timeFilter = endpoint === '/orders' ? `&updated_at_min=${since}` : '';
const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
const timeFilter = endpoint === '/orders' ? `&updated_at_min=${since}` : '';
const url = `${VEEQO_BASE}${endpoint}?${baseParams}page_size=100&page=${page}${timeFilter}`;
      const res = await fetch(url, {
        headers: { "x-api-key": VEEQO_API_KEY, "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const text = await res.text();
        return { statusCode: res.status, headers, body: text };
      }
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) break;
      allData = allData.concat(data);
      if (data.length < 100) break; // last page
      page++;
      if (page > 20) break; // safety limit (2000 items max)
    }

    return { statusCode: 200, headers, body: JSON.stringify(allData) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
