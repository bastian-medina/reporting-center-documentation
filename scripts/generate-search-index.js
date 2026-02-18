#!/usr/bin/env node
/**
 * Genera el índice de búsqueda desde los archivos markdown
 * Sin dependencias de Jekyll
 */

const fs = require("fs");
const path = require("path");

const DOCS_DIR = path.join(__dirname, "..", "docs");
const OUTPUT_FILE = path.join(__dirname, "..", "_site", "search-data.json");
const MAX_CONTENT_LENGTH = 500;

/**
 * Parse markdown file and extract metadata
 */
function parseMarkdownFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");

    // Extract frontmatter
    const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
    const match = content.match(frontmatterRegex);

    let title = "";
    let permalink = "";
    let layout = "";

    if (match) {
      const frontmatter = match[1];
      const titleMatch = frontmatter.match(/title:\s*["']?([^"'\n]+)["']?/);
      const permalinkMatch = frontmatter.match(
        /permalink:\s*["']?([^"'\n]+)["']?/,
      );
      const layoutMatch = frontmatter.match(/layout:\s*["']?([^"'\n]+)["']?/);

      if (titleMatch) title = titleMatch[1].trim();
      if (permalinkMatch) permalink = permalinkMatch[1].trim();
      if (layoutMatch) layout = layoutMatch[1].trim();
    }

    // Extract content (remove frontmatter and clean markdown)
    let textContent = content.replace(frontmatterRegex, "");

    // Remove markdown syntax
    textContent = textContent
      .replace(/!\[([^\]]*)\]\([^\)]+\)/g, "$1") // Remove images
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1") // Remove links
      .replace(/`{3}[\s\S]*?`{3}/g, "") // Remove code blocks
      .replace(/`[^`]+`/g, "") // Remove inline code
      .replace(/^#{1,6}\s+/gm, "") // Remove headers
      .replace(/\*\*([^*]+)\*\*/g, "$1") // Remove bold
      .replace(/\*([^*]+)\*/g, "$1") // Remove italic
      .replace(/^\s*[-*+]\s+/gm, "") // Remove list markers
      .replace(/^\s*\d+\.\s+/gm, "") // Remove numbered lists
      .replace(/\n{3,}/g, "\n\n") // Collapse multiple newlines
      .trim();

    // Limit content length
    if (textContent.length > MAX_CONTENT_LENGTH) {
      textContent = textContent.substring(0, MAX_CONTENT_LENGTH) + "...";
    }

    // Generate URL from file path if no permalink
    if (!permalink) {
      const relativePath = path.relative(DOCS_DIR, filePath);
      permalink =
        "/" +
        relativePath
          .replace(/\\/g, "/")
          .replace(/\.md$/, ".html")
          .replace(/\/index\.html$/, "/");
    }

    return {
      url: permalink,
      title: title || path.basename(filePath, ".md"),
      content: textContent,
      layout: layout,
    };
  } catch (error) {
    console.error(`❌ Error al procesar ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Recursively find all markdown files
 */
function findMarkdownFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findMarkdownFiles(filePath, fileList);
    } else if (file.endsWith(".md")) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Main function
 */
function generateSearchIndex() {
  console.log("📚 Generando índice de búsqueda...");
  console.log("");

  // Find all markdown files
  const markdownFiles = findMarkdownFiles(DOCS_DIR);
  console.log(`📄 Encontrados ${markdownFiles.length} archivos markdown`);

  // Process files
  const searchData = [];
  markdownFiles.forEach((file) => {
    const data = parseMarkdownFile(file);
    if (data && data.title && data.content) {
      searchData.push(data);
    }
  });

  console.log(`✓ Procesados ${searchData.length} documentos`);

  // Ensure _site directory exists
  const siteDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(siteDir)) {
    fs.mkdirSync(siteDir, { recursive: true });
  }

  // Write output
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(searchData, null, 2), "utf8");

  console.log("");
  console.log(`✅ Índice generado: ${OUTPUT_FILE}`);
  console.log(`   Total de páginas: ${searchData.length}`);
  console.log("");
}

// Run
try {
  generateSearchIndex();
} catch (error) {
  console.error("❌ Error fatal:", error);
  process.exit(1);
}
