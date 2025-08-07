const fs = require("fs");
const path = require("path");

const logPath = path.join(__dirname, "../logs.txt");

function logger(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const logEntry = `[${new Date().toISOString()}] ${req.method} ${
      req.originalUrl
    } ${res.statusCode} - ${duration}ms\n`;

    fs.appendFile(logPath, logEntry, (err) => {
    });
  });

  next();
}

module.exports = logger;
