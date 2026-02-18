#!/usr/bin/env node
/**
 * Servidor simple para desarrollo local
 * Sirve el sitio estático de Jekyll
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 4000;
const SITE_DIR = path.join(__dirname, "_site");
const FALLBACK_DIR = __dirname;

// MIME types
const mimeTypes = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const server = http.createServer((req, res) => {
  console.log(`${new Date().toLocaleTimeString()} - ${req.method} ${req.url}`);

  // Normalizar URL
  let filePath = req.url === "/" ? "/index.html" : req.url;

  // Si no tiene extensión y no termina en /, agregar /index.html
  if (!path.extname(filePath) && !filePath.endsWith("/")) {
    filePath += "/index.html";
  } else if (filePath.endsWith("/")) {
    filePath += "index.html";
  }

  // Intentar servir desde _site primero
  let fullPath = path.join(SITE_DIR, filePath);

  // Si no existe en _site, intentar desde raíz (para archivos estáticos)
  if (!fs.existsSync(fullPath)) {
    fullPath = path.join(FALLBACK_DIR, filePath);
  }

  // Si aún no existe, intentar sin /index.html
  if (!fs.existsSync(fullPath) && filePath.endsWith("/index.html")) {
    fullPath = path.join(SITE_DIR, filePath.replace("/index.html", ".html"));
  }

  // Leer archivo
  fs.readFile(fullPath, (err, content) => {
    if (err) {
      if (err.code === "ENOENT") {
        // 404
        res.writeHead(404, { "Content-Type": "text/html" });
        res.end("<h1>404 - Página no encontrada</h1>", "utf-8");
      } else {
        // 500
        res.writeHead(500);
        res.end(`Error del servidor: ${err.code}`, "utf-8");
      }
    } else {
      // Éxito
      const ext = path.extname(fullPath);
      const contentType = mimeTypes[ext] || "application/octet-stream";

      res.writeHead(200, {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*", // CORS para desarrollo
      });
      res.end(content, "utf-8");
    }
  });
});

server.listen(PORT, () => {
  console.log("");
  console.log("🚀 Servidor de desarrollo iniciado");
  console.log("");
  console.log(`   📡 URL local:     http://localhost:${PORT}`);
  console.log(`   📁 Directorio:    ${SITE_DIR}`);
  console.log("");
  console.log("💡 Presiona Ctrl+C para detener el servidor");
  console.log("");
});
