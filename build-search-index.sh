#!/bin/bash
# Script para regenerar el índice de búsqueda

echo "🔍 Generando índice de búsqueda..."

# Generar el archivo JSON
node generate-search-index.js

if [ $? -eq 0 ]; then
  # Copiar a las ubicaciones necesarias
  echo "📦 Copiando archivos..."
  
  # Crear directorio _site si no existe
  mkdir -p _site
  
  # Copiar a _site para el sitio servido
  cp search-data-generated.json _site/search-data.json
  
  # También copiar a la raíz como fallback
  cp search-data-generated.json search-data-static.json
  
  echo "✅ Índice de búsqueda generado y copiado exitosamente"
  echo ""
  echo "📍 Ubicaciones:"
  echo "   - _site/search-data.json"
  echo "   - search-data-static.json"
  echo "   - search-data-generated.json"
else
  echo "❌ Error al generar el índice de búsqueda"
  exit 1
fi
