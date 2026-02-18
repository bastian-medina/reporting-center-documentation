# 📚 Reporting Center - Documentación Oficial

Documentación técnica completa del **Reporting Center**, una plataforma especializada en gestión y generación de reportes con énfasis en procedimientos de Subpoenas.

🌐 **Sitio en vivo:** [https://yourusername.github.io/reporting-center](https://yourusername.github.io/reporting-center)

---

## ✨ Características

- 🌙 **Tema Dark** por defecto (con toggle a modo claro)
- 📱 **Responsive** - Funciona en móviles, tablets y desktop
- 🔍 **Búsqueda integrada** con Lunr.js
- 📌 **Navegación sidebar** fija y organizada
- ⚡ **Jekyll + GitHub Pages** - Despliegue automático
- 🎨 **Estética moderna** y profesional
- 🚀 **Pipeline CI/CD** con GitHub Actions

---

## 📖 Estructura del Proyecto

```
docs/          # Documentación principal
images/        # Imágenes y assets
_includes/     # Componentes reutilizables
_layouts/      # Plantillas HTML
_sass/         # Estilos SCSS
assets/        # CSS, JS
.github/       # GitHub Actions
```

---

## 🚀 Guía Rápida

### Instalar dependencias

```bash
bundle install
```

### Servir localmente

```bash
bundle exec jekyll serve
```

Accede a http://localhost:4000

---

## 📝 Estructura de Documentación

### 🎯 QSR - Pases a Producción
- Índice QSR
- Pipelines
- Proceso de Deploy
- Checklist QSR
- Troubleshooting
- Referencias

### 🏗️ Arquitectura y Diseño
- Arquitectura Backend
- Backend (APIs)
- Frontend

### 🚀 CI/CD e Infraestructura
- CI/CD
- Docker y AWS
- New Relic

### ⚙️ Configuración
- Variables de Entorno
- Enums y Constantes
- Casos de Uso

### 🔧 Servicios
- Funciones Lambda
- Subpoenas

---

## Tecnologías Principales

- **Backend:** Spring Boot 2.7.3, Java 17
- **Frontend:** React, TypeScript
- **Infraestructura:** AWS (Lambda, ECS, DynamoDB)
- **Monitoreo:** New Relic
- **Documentación:** Jekyll + GitHub Pages

---

Para más información, consulta la documentación dentro del sitio.
