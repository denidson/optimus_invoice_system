export default async function handler(req, res) {
  try {
    // Separar path y query
    const [path, query] = req.url.replace("/api/proxy", "").split("?");
    // Eliminar barra final del path
    const cleanPath = path.replace(/\/$/, "");
    // Reconstruir URL completa
    const targetUrl = "https://optimusinvoice.ddns.net" + cleanPath + (query ? "?" + query : "");

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        ...(req.headers.authorization ? { Authorization: req.headers.authorization } : {}),
      },
      body: req.method !== "GET" ? JSON.stringify(req.body) : undefined,
    });

    const text = await response.text();
    res.status(response.status).send(text);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ message: "Proxy error", error: error.message });
  }
}
