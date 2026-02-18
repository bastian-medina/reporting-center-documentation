#!/bin/bash
# Copia todos los recursos estáticos al directorio _site

echo "📦 Copiando recursos estáticos a _site..."
echo ""

# Crear directorios si no existen
mkdir -p _site/images
mkdir -p _site/files
mkdir -p _site/assets/css
mkdir -p _site/assets/js

# Copiar imágenes
if [ -d "images" ]; then
  echo "🖼️  Copiando imágenes..."
  cp -r images/* _site/images/ 2>/dev/null || true
  IMG_COUNT=$(find _site/images -type f | wc -l | tr -d ' ')
  echo "   ✓ $IMG_COUNT archivos copiados"
fi

# Copiar archivos (documentos, etc)
if [ -d "files" ]; then
  echo "📄 Copiando archivos..."
  cp -r files/* _site/files/ 2>/dev/null || true
  FILE_COUNT=$(find _site/files -type f | wc -l | tr -d ' ')
  echo "   ✓ $FILE_COUNT archivos copiados"
fi

# Copiar CSS
if [ -d "assets/css" ]; then
  echo "🎨 Copiando CSS..."
  cp -r assets/css/* _site/assets/css/ 2>/dev/null || true
  echo "   ✓ CSS copiado"
fi

# Copiar JavaScript
if [ -d "assets/js" ]; then
  echo "📜 Copiando JavaScript..."
  cp -r assets/js/* _site/assets/js/ 2>/dev/null || true
  echo "   ✓ JavaScript copiado"
fi

echo ""
echo "✅ Recursos copiados exitosamente"
echo ""
