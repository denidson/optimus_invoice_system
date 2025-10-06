export default async function handler(req, res) {
  const targetUrl = "http://95.215.204.79:51500" + req.url.replace("/api/proxy", "");

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        ...(req.headers.authorization ? { Authorization: req.headers.authorization } : {}),
      },
      body: req.method !== "GET" ? JSON.stringify(req.body) : undefined,
    });

    // Responder según lo que devuelva el backend
    const text = await response.text();
    res.status(response.status).send(text);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ message: "Proxy error", error: error.message });
  }
}
