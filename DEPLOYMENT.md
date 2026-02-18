# 🚀 Instrucciones de Despliegue - Reporting Center

## ✅ Proyecto Completado

Tu documentación Jekyll está lista para ser desplegada en GitHub Pages con `git@github-personal`.

---

## 📋 Pasos Finales

### 1. Crear el repositorio en GitHub (Personal)

Crea un repositorio llamado `reporting-center` (o el nombre que prefieras) en tu cuenta personal.

```bash
# Ir a https://github.com/new
# Repository name: reporting-center
# Description: Documentación técnica del Reporting Center
# Public: Sí (para GitHub Pages)
# No inicializar con README
```

### 2. Inicializar Git con tu configuración personal

```bash
cd /Users/bastianmedina/Desktop/documentacion_backend

# Configurar git para usar git@github-personal
git init

# Establecer la configuración local (solo para este repo)
git config user.email "your-email@example.com"
git config user.name "Your Name"

# Ver la configuración
git config --list
```

### 3. Agregar el remoto usando git@github-personal

```bash
# Reemplaza 'yourusername' con tu usuario de GitHub
git remote add origin git@github-personal:yourusername/reporting-center.git

# Verificar
git remote -v
```

### 4. Hacer el primer commit

```bash
git add .
git commit -m "Initial commit: Reporting Center documentation with Jekyll + GitHub Pages"
```

### 5. Crear la rama main y hacer push

```bash
git branch -M main
git push -u origin main
```

### 6. Configurar GitHub Pages

1. Ve a **Settings** del repositorio en GitHub
2. Navega a **Pages** (en la sección "Code and automation")
3. Selecciona:
   - **Source**: Deploy from a branch
   - **Branch**: main
   - **Folder**: / (root)
4. Haz clic en **Save**

GitHub Actions iniciará automáticamente el build y despliegue.

### 7. Personalizar configuración

**Actualiza estos archivos:**

#### `_config.yml`
```yaml
title: Reporting Center  # Tu título
description: Documentación técnica del Reporting Center
url: "https://yourusername.github.io/reporting-center"  # Tu URL
baseurl: "/reporting-center"  # Nombre del repo
```

#### `docs/qsr/index.md` y otros
Actualiza los enlaces `source()` si es necesario.

---

## 🔍 Verificar que todo funciona

### Local Development

```bash
# Instalar dependencias
bundle install

# Servir localmente en http://localhost:4000
bundle exec jekyll serve

# O sin caché
bundle exec jekyll serve --no-cache
```

### Verificar GitHub Actions

1. Ve a **Actions** en tu repositorio
2. Deberías ver el workflow "Build and Deploy"
3. Espera a que termine (toma 1-2 minutos)
4. El sitio estará en: `https://yourusername.github.io/reporting-center`

---

## 📝 Hacer cambios y actualizaciones

```bash
# Editar archivo
nano docs/arquitectura/index.md

# Agregar cambios
git add docs/arquitectura/index.md

# Hacer commit
git commit -m "Update architecture documentation"

# Hacer push
git push origin main
```

GitHub Actions se ejecutará automáticamente y desplegará los cambios.

---

## 🎨 Personalización Adicional

### Cambiar tema de colores

Edita `_sass/main.scss`:

```scss
$primary-color: #6366f1;    // Indigo (actual)
$bg-dark: #0f0f0f;          // Negro (actual)
```

Opción: Usar colores diferentes:
```scss
// Purple theme
$primary-color: #a855f7;    // Purple
$accent-purple: #d946ef;    // Bright purple

// Blue theme
$primary-color: #3b82f6;    // Blue
```

### Agregar secciones nuevas

1. Crea una carpeta en `docs/nueva-seccion/`
2. Crea `docs/nueva-seccion/index.md` con frontmatter:

```markdown
---
layout: page
title: Mi Nueva Sección
---

# Mi Nueva Sección

Contenido aquí...
```

3. Actualiza `_includes/sidebar.html` para agregar el enlace

### Cambiar logo/emoji

En `_includes/navbar.html`:

```html
<span class="logo-icon">📚</span>  <!-- Cambiar emoji aquí -->
```

---

## 🐛 Troubleshooting

### El sitio no se ve correctamente

```bash
# Limpiar caché Jekyll
rm -rf _site .jekyll-cache

# Reconstruir
bundle exec jekyll build --verbose
```

### Los estilos no cargan

1. Verifica que los paths en `_config.yml` sean correctos
2. Limpia el caché del navegador (Ctrl+Shift+Supr)
3. Reconstruye: `bundle exec jekyll build`

### Error de bundler

```bash
# Actualizar Gemfile.lock
bundle update
bundle install
```

---

## 📚 URLs Útiles

- 📖 [Jekyll Documentation](https://jekyllrb.com/docs/)
- 🐙 [GitHub Pages Help](https://docs.github.com/en/pages)
- 🎨 [Markdown Guide](https://www.markdownguide.org/)
- 🔍 [Lunr.js Search](https://lunrjs.com/)

---

## 📌 Checklist Final

- [ ] Repositorio creado en GitHub Personal
- [ ] Git configurado con `git@github-personal`
- [ ] `_config.yml` actualizado con tu URL
- [ ] Primer push realizado
- [ ] GitHub Pages configuradas
- [ ] GitHub Actions ejecutado correctamente
- [ ] Sitio visible en tu URL de GitHub Pages
- [ ] Dark mode funciona
- [ ] Búsqueda funciona
- [ ] Navegación lateral funciona

---

**¡Tu documentación está lista para producción! 🚀**

Cualquier duda, puedes revisar el README.md o la documentación oficial de Jekyll.
