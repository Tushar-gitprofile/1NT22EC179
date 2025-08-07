const express = require("express");
const app = express();
const logger = require("./Middleware/logger.js");
const store = require("./data/store.js");
const shorturlRoutes = require("./routes/shorturl.js");

app.use(express.json());
app.use(logger);
app.use("/shorturls", shorturlRoutes);

app.get("/:code", (req, res) => {
  const code = req.params.code;
  const entry = store.urls[code];

  if (!entry) {
    return res.status(404).send("Short link not found.");
  }

  const now = new Date();
  if (new Date(entry.expiry) < now) {
    return res.status(410).send("Short link has expired.");
  }

  entry.clicks.push({
    timestamp: new Date().toISOString(),
    source: req.get("Referer") || "Direct",
    location: req.ip || "Unknown",
  });

  res.redirect(entry.url);
});

const PORT = 5000
app.listen(PORT,()=>{
    console.log(`server started on the PORT ${PORT}`)
});
