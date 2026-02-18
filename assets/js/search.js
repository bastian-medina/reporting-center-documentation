// Search implementation - Native JavaScript
document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("search-input");
  const searchResults = document.getElementById("search-results");

  if (!searchInput) {
    console.warn("Elemento search-input no encontrado");
    return;
  }

  if (!searchResults) {
    console.warn("Elemento search-results no encontrado");
    return;
  }

  // Variable para almacenar los datos de búsqueda
  let searchData = [];
  let searchLoaded = false;
  let searchError = false;

  // Intentar diferentes rutas para el archivo JSON
  const searchPaths = [
    "/search-data.json",
    "/search-data-static.json",
    "./search-data.json",
    "./search-data-static.json",
    "../search-data.json",
    "../../search-data.json"
  ];

  // Cargar datos de búsqueda
  async function loadSearchData() {
    for (const path of searchPaths) {
      try {
        const response = await fetch(path);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            searchData = data.filter(item => item && item.title && item.url);
            searchLoaded = true;
            searchError = false;
            console.log(`✓ Índice de búsqueda cargado: ${searchData.length} páginas desde ${path}`);
            return;
          }
        }
      } catch (error) {
        console.log(`Intento fallido con ${path}:`, error.message);
      }
    }
    
    searchError = true;
    console.error("No se pudo cargar el índice de búsqueda desde ninguna ruta");
  }

  loadSearchData();

  // Función para normalizar texto (remover acentos y convertir a minúsculas)
  function normalizeText(text) {
    if (!text) return "";
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  // Función de búsqueda nativa
  function performSearch(query) {
    if (!searchData || searchData.length === 0) return [];

    const normalizedQuery = normalizeText(query);
    const queryTerms = normalizedQuery.split(/\s+/).filter(term => term.length > 0);

    const results = searchData
      .map((page) => {
        const normalizedTitle = normalizeText(page.title || "");
        const normalizedContent = normalizeText(page.content || "");
        
        let score = 0;
        let matchedInTitle = false;
        let matchedInContent = false;

        // Calcular score basado en coincidencias
        queryTerms.forEach(term => {
          // Búsqueda en título (peso mayor)
          if (normalizedTitle.includes(term)) {
            score += 10;
            matchedInTitle = true;
          }
          // Búsqueda en contenido
          if (normalizedContent.includes(term)) {
            score += 1;
            matchedInContent = true;
          }
        });

        // Bonus si coincide la búsqueda exacta
        if (normalizedTitle.includes(normalizedQuery)) {
          score += 20;
        }
        if (normalizedContent.includes(normalizedQuery)) {
          score += 5;
        }

        return {
          page,
          score,
          matched: matchedInTitle || matchedInContent
        };
      })
      .filter(result => result.matched && result.score > 0)
      .sort((a, b) => b.score - a.score);

    return results;
  }

  // Event listener para búsqueda
  searchInput.addEventListener("input", function (e) {
    const query = e.target.value.trim();

    if (query.length < 2) {
      searchResults.innerHTML = "";
      searchResults.classList.add("hidden");
      return;
    }

    if (searchError) {
      searchResults.innerHTML =
        '<div class="search-result"><div class="result-title">⚠️ Error: No se pudo cargar el índice de búsqueda</div><div class="result-context">Asegúrate de que el sitio esté compilado con Jekyll.</div></div>';
      searchResults.classList.remove("hidden");
      return;
    }

    if (!searchLoaded) {
      searchResults.innerHTML =
        '<div class="search-result"><div class="result-title">⏳ Cargando índice de búsqueda...</div></div>';
      searchResults.classList.remove("hidden");
      return;
    }

    // Realizar búsqueda
    const results = performSearch(query);

    if (results.length === 0) {
      searchResults.innerHTML =
        `<div class="search-result"><div class="result-title">❌ No se encontraron resultados para "${query}"</div></div>`;
      searchResults.classList.remove("hidden");
      return;
    }

    // Mostrar resultados
    const resultHTML = `
      <div class="search-result-header">
        <small>Encontrados ${results.length} resultado${results.length !== 1 ? 's' : ''}</small>
      </div>
    ` + results
      .slice(0, 10)
      .map((result) => {
        const page = result.page;
        const contentPreview = (page.content || "")
          .substring(0, 120)
          .replace(/\s+/g, ' ')
          .trim();

        return `
        <a href="${page.url}" class="search-result">
          <div class="result-title">📄 ${page.title}</div>
          ${contentPreview ? `<div class="result-context">${contentPreview}...</div>` : ''}
        </a>
      `;
      })
      .join("");

    searchResults.innerHTML = resultHTML;
    searchResults.classList.remove("hidden");
  });

  // Cerrar resultados al hacer clic fuera
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".navbar-search")) {
      searchResults.classList.add("hidden");
    }
  });

  // Soporte para navegación con teclado
  searchInput.addEventListener("keydown", function(e) {
    if (e.key === "Escape") {
      searchResults.classList.add("hidden");
      searchInput.blur();
    }
  });
});

// Theme toggle
const themeToggle = document.getElementById("theme-toggle");
if (themeToggle) {
  themeToggle.addEventListener("click", function () {
    const isDark = document.body.classList.contains("dark-mode");

    if (isDark) {
      document.body.classList.remove("dark-mode");
      document.body.classList.add("light-mode");
      localStorage.setItem("theme", "light");
      document.getElementById("theme-icon").textContent = "☀️";
    } else {
      document.body.classList.add("dark-mode");
      document.body.classList.remove("light-mode");
      localStorage.setItem("theme", "dark");
      document.getElementById("theme-icon").textContent = "🌙";
    }
  });

  // Cargar tema guardado
  const savedTheme = localStorage.getItem("theme") || "dark";
  if (savedTheme === "light") {
    document.body.classList.remove("dark-mode");
    document.body.classList.add("light-mode");
    document.getElementById("theme-icon").textContent = "☀️";
  }
}

// Mobile menu toggle
const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
const sidebar = document.querySelector(".sidebar");

if (mobileMenuToggle && sidebar) {
  mobileMenuToggle.addEventListener("click", function () {
    sidebar.style.display = sidebar.style.display === "none" ? "block" : "none";
  });
}

// Syntax highlighting
if (typeof hljs !== "undefined") {
  hljs.highlightAll();
}

// Smooth scroll para enlaces internos
document.addEventListener("click", function (e) {
  if (e.target.tagName === "A" && e.target.hash) {
    const element = document.querySelector(e.target.hash);
    if (element) {
      e.preventDefault();
      element.scrollIntoView({ behavior: "smooth" });
    }
  }
});

// Table of contents generation (opcional) - DESHABILITADO
// Ya existe "Tabla de contenido" en los archivos markdown
/*
function generateTableOfContents() {
  const content = document.querySelector(".content");
  if (!content) return;

  const headings = content.querySelectorAll("h2, h3");
  if (headings.length === 0) return;

  const toc = document.createElement("nav");
  toc.className = "table-of-contents";
  toc.innerHTML = "<h3>En esta página</h3><ul></ul>";

  const list = toc.querySelector("ul");

  headings.forEach((heading, index) => {
    if (!heading.id) {
      heading.id = `heading-${index}`;
    }

    const li = document.createElement("li");
    const level = parseInt(heading.tagName[1]);
    li.style.marginLeft = `${(level - 2) * 15}px`;

    const a = document.createElement("a");
    a.href = `#${heading.id}`;
    a.textContent = heading.textContent;

    li.appendChild(a);
    list.appendChild(li);
  });

  if (list.children.length > 0) {
    content.insertBefore(toc, content.firstChild);
  }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", generateTableOfContents);
} else {
  generateTableOfContents();
}
*/
