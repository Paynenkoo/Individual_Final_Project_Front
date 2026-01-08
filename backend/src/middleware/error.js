export function notFound(_req, res) {
  res.status(404).json({ message: "Not found" });
}

export function errorHandler(err, _req, res, _next) {
  console.error("❌ API Error:", err);
  res.status(500).json({ message: "Server error" });
}
