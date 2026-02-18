#!/usr/bin/env node
/**
 * Genera el archivo search-data.json para el buscador
 * Sin necesidad de compilar Jekyll
 */

const fs = require("fs");
const path = require("path");

// Función para leer archivos markdown recursivamente
function readMarkdownFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Recursivamente leer subdirectorios
      readMarkdownFiles(filePath, fileList);
    } else if (file.endsWith(".md")) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Función para extraer frontmatter y contenido
function parseMarkdownFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");

  let frontmatter = {};
  let bodyContent = "";
  let inFrontmatter = false;
  let frontmatterEnd = 0;

  // Detectar frontmatter
  if (lines[0] === "---") {
    inFrontmatter = true;
    let i = 1;

    while (i < lines.length && lines[i] !== "---") {
      const line = lines[i];
      const match = line.match(/^(\w+):\s*(.+)$/);
      if (match) {
        frontmatter[match[1]] = match[2].replace(/^["']|["']$/g, "");
      }
      i++;
    }

    frontmatterEnd = i + 1;
  }

  // Obtener contenido sin frontmatter
  bodyContent = lines.slice(frontmatterEnd).join("\n");

  // Limpiar contenido: remover markdown y HTML
  bodyContent = bodyContent
    .replace(/^---+$/gm, "") // Remover separadores
    .replace(/^#+\s+/gm, "") // Remover headers
    .replace(/!\[.*?\]\(.*?\)/g, "") // Remover imágenes
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1") // Remover links pero mantener texto
    .replace(/`{1,3}[^`]*`{1,3}/g, "") // Remover código
    .replace(/<[^>]+>/g, "") // Remover HTML
    .replace(/\*\*([^*]+)\*\*/g, "$1") // Remover bold
    .replace(/\*([^*]+)\*/g, "$1") // Remover italic
    .replace(/_{2}([^_]+)_{2}/g, "$1") // Remover underline
    .replace(/\n\s*\n/g, "\n") // Remover líneas vacías múltiples
    .replace(/\s+/g, " ") // Normalizar espacios
    .trim();

  // Generar URL relativa
  const relativePath = filePath
    .replace(/^.*\/docs\//, "/docs/")
    .replace(/index\.md$/, "")
    .replace(/\.md$/, "");

  return {
    url: relativePath,
    title: frontmatter.title || path.basename(filePath, ".md"),
    content: bodyContent.substring(0, 500), // Limitar a 500 caracteres
  };
}

// Main
try {
  console.log("🔍 Generando índice de búsqueda...");

  const docsDir = path.join(__dirname, "docs");
  const markdownFiles = readMarkdownFiles(docsDir);

  console.log(`📄 Encontrados ${markdownFiles.length} archivos markdown`);

  const searchData = markdownFiles
    .map((file) => {
      try {
        return parseMarkdownFile(file);
      } catch (error) {
        console.warn(`⚠️  Error procesando ${file}:`, error.message);
        return null;
      }
    })
    .filter((item) => item !== null);

  // Agregar index.md si existe
  const indexPath = path.join(__dirname, "index.md");
  if (fs.existsSync(indexPath)) {
    try {
      const indexData = parseMarkdownFile(indexPath);
      indexData.url = "/";
      searchData.unshift(indexData);
    } catch (error) {
      console.warn("⚠️  Error procesando index.md:", error.message);
    }
  }

  // Escribir archivo JSON
  const outputPath = path.join(__dirname, "search-data-generated.json");
  fs.writeFileSync(outputPath, JSON.stringify(searchData, null, 2));

  console.log(`✅ Índice generado exitosamente: ${searchData.length} páginas`);
  console.log(`📦 Archivo creado: ${outputPath}`);
} catch (error) {
  console.error("❌ Error:", error.message);
  process.exit(1);
}
