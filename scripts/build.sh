#!/bin/bash
# Script maestro para preparar el sitio para desarrollo o despliegue

echo "🚀 Preparando Reporting Center Documentation..."
echo ""

# 1. Arreglar rutas de imágenes
echo "1️⃣  Corrigiendo rutas de imágenes..."
node scripts/fix-image-paths.js
if [ $? -ne 0 ]; then
  echo "❌ Error al corregir rutas de imágenes"
  exit 1
fi
echo ""

# 2. Generar índice de búsqueda
echo "2️⃣  Generando índice de búsqueda..."
node scripts/generate-search-index.js
if [ $? -ne 0 ]; then
  echo "❌ Error al generar índice de búsqueda"
  exit 1
fi
echo ""

# 3. Copiar recursos estáticos
echo "3️⃣  Copiando recursos estáticos..."
./scripts/setup-assets.sh
if [ $? -ne 0 ]; then
  echo "❌ Error al copiar recursos"
  exit 1
fi
echo ""

# 4. Verificar estructura
echo "4️⃣  Verificando estructura..."
if [ -d "_site/images" ]; then
  IMG_COUNT=$(find _site/images -type f | wc -l | tr -d ' ')
  echo "   ✓ Imágenes: $IMG_COUNT archivos"
fi

if [ -d "_site/files" ]; then
  FILE_COUNT=$(find _site/files -type f | wc -l | tr -d ' ')
  echo "   ✓ Archivos: $FILE_COUNT documentos"
fi

if [ -f "_site/search-data.json" ]; then
  echo "   ✓ Índice de búsqueda: generado"
fi

if [ -d "_site/assets/css" ]; then
  echo "   ✓ CSS: copiado"
fi

if [ -d "_site/assets/js" ]; then
  echo "   ✓ JavaScript: copiado"
fi

echo ""
echo "✅ ¡Sitio preparado exitosamente!"
echo ""
echo "📖 Para iniciar el servidor de desarrollo:"
echo "   node scripts/serve.js"
echo ""
echo "   Luego abre http://localhost:4000 en tu navegador"
echo ""
