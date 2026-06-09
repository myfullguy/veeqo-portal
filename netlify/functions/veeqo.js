const VEEQO_API_KEY = process.env.VEEQO_API_KEY || "YOUR_API_KEY_HERE";
const VEEQO_BASE = "https://api.veeqo.com";

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  const { endpoint, params } = event.queryStringParameters || {};

  if (!endpoint) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing endpoint param" }) };
  }

  const allowedEndpoints = ["/products", "/orders", "/customers"];
  const isAllowed = allowedEndpoints.some((e) => endpoint.startsWith(e));
  if (!isAllowed) {
    return { statusCode: 403, headers, body: JSON.stringify({ error: "Endpoint not allowed" }) };
  }

  try {
    const queryString = params ? `?${params}` : "";
    const url = `${VEEQO_BASE}${endpoint}${queryString}`;

    const response = await fetch(url, {
      headers: {
        "x-api-key": VEEQO_API_KEY,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return { statusCode: response.status, headers, body: JSON.stringify(data) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
