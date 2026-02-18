#!/usr/bin/env node
/**
 * Fix image and file paths to use Jekyll relative_url filter
 * This makes paths work both locally and on GitHub Pages
 */

const fs = require("fs");
const path = require("path");

// Function to recursively read markdown files
function readMarkdownFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      readMarkdownFiles(filePath, fileList);
    } else if (file.endsWith(".md")) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Function to fix paths in a file
function fixPathsInFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  let modified = false;

  // Fix image paths: /images/ -> {{ '/images/...' | relative_url }}
  const imagePattern = /!\[([^\]]*)\]\(\/images\/([^\)]+)\)/g;
  if (content.match(imagePattern)) {
    content = content.replace(
      imagePattern,
      "![$1]({{ '/images/$2' | relative_url }})",
    );
    modified = true;
  }

  // Fix file paths: /files/ -> {{ '/files/...' | relative_url }}
  const filePattern = /\[([^\]]+)\]\(\/files\/([^\)]+)\)/g;
  if (content.match(filePattern)) {
    content = content.replace(
      filePattern,
      "[$1]({{ '/files/$2' | relative_url }})",
    );
    modified = true;
  }

  // Fix backtick file references: `/files/...` -> `{{ '/files/...' | relative_url }}`
  const backtickFilePattern = /`\/files\/([^`]+)`/g;
  if (content.match(backtickFilePattern)) {
    content = content.replace(
      backtickFilePattern,
      "`{{ '/files/$1' | relative_url }}`",
    );
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, "utf8");
    return true;
  }

  return false;
}

// Main
try {
  console.log("🔧 Actualizando rutas para GitHub Pages...\n");

  const docsDir = path.join(__dirname, "..", "docs");
  const indexFile = path.join(__dirname, "..", "index.md");
  const readmeFile = path.join(__dirname, "..", "README.md");

  let markdownFiles = readMarkdownFiles(docsDir);

  // Add index.md and README.md if they exist
  if (fs.existsSync(indexFile)) markdownFiles.push(indexFile);
  if (fs.existsSync(readmeFile)) markdownFiles.push(readmeFile);

  console.log(`📄 Procesando ${markdownFiles.length} archivos markdown...\n`);

  let modifiedCount = 0;

  markdownFiles.forEach((file) => {
    const modified = fixPathsInFile(file);
    if (modified) {
      modifiedCount++;
      const relativePath = file.replace(path.join(__dirname, "..") + "/", "");
      console.log(`  ✓ ${relativePath}`);
    }
  });

  console.log("");
  if (modifiedCount > 0) {
    console.log(`✅ Se actualizaron ${modifiedCount} archivos`);
  } else {
    console.log("✅ Todas las rutas ya están correctas");
  }
  console.log("");
  console.log("📝 Las rutas ahora funcionarán en:");
  console.log("   - GitHub Pages (con baseurl)");
  console.log("   - Desarrollo local");
} catch (error) {
  console.error("❌ Error:", error.message);
  process.exit(1);
}
