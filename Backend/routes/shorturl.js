const express = require("express");
const router = express.Router();
const store = require("../data/store.js");

function generateShortcode(length = 5) {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

router.post("/", (req, res) => {
  const { url, validity, shortcode } = req.body;

  if (!url || typeof url !== "string" || !url.startsWith("http")) {
    return res.status(400).json({ error: "Invalid or missing URL." });
  }

  let code = shortcode || generateShortcode();

  if (store.urls[code]) {
    return res.status(409).json({ error: "Shortcode already exists." });
  }

  const createdAt = new Date();
  const minutes = Number.isInteger(validity) ? validity : 30;
  const expiry = new Date(createdAt.getTime() + minutes * 60 * 1000);

  store.urls[code] = {
    url,
    createdAt: createdAt.toISOString(),
    expiry: expiry.toISOString(),
    validity: minutes,
    clicks: [],
  };

  return res.status(201).json({
    shortLink: `http://localhost:5000/${code}`,
    expiry: expiry.toISOString(),
  });
});

router.get("/:code", (req, res) => {
  const code = req.params.code;
  const entry = store.urls[code];

  if (!entry) {
    return res.status(404).json({ error: "Shortcode not found." });
  }

  const now = new Date();
  if (new Date(entry.expiry) < now) {
    return res.status(410).json({ error: "Short link has expired." });
  }

  res.json({
    shortcode: code,
    originalUrl: entry.url,
    createdAt: entry.createdAt,
    expiry: entry.expiry,
    totalClicks: entry.clicks.length,
    clickData: entry.clicks,
  });
});

module.exports = router;
