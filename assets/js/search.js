// Search implementation with Lunr.js
document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("search-input");
  const searchResults = document.getElementById("search-results");

  if (!searchInput) return;

  // Variable para almacenar el índice de búsqueda
  let searchIndex = null;
  let searchData = null;

  // Cargar datos de búsqueda
  fetch("/search-data.json")
    .then((response) => response.json())
    .then((data) => {
      searchData = data;
      // Crear índice de Lunr
      searchIndex = lunr(function () {
        this.field("title", { boost: 10 });
        this.field("content");
        this.field("url");

        data.forEach((page) => {
          this.add(page);
        });
      });
    })
    .catch((error) => console.log("Error loading search data:", error));

  // Event listener para búsqueda
  searchInput.addEventListener("input", function (e) {
    const query = e.target.value.trim();

    if (query.length < 2) {
      searchResults.innerHTML = "";
      searchResults.classList.add("hidden");
      return;
    }

    if (!searchIndex) {
      searchResults.innerHTML =
        '<div class="search-result"><div class="result-title">Índice de búsqueda cargando...</div></div>';
      searchResults.classList.remove("hidden");
      return;
    }

    // Realizar búsqueda
    const results = searchIndex.search(query);

    if (results.length === 0) {
      searchResults.innerHTML =
        '<div class="search-result"><div class="result-title">No se encontraron resultados</div></div>';
      searchResults.classList.remove("hidden");
      return;
    }

    // Mostrar resultados
    searchResults.innerHTML = results
      .slice(0, 8)
      .map((result) => {
        const page = searchData.find((p) => p.url === result.ref);
        if (!page) return "";

        return `
        <a href="${page.url}" class="search-result">
          <div class="result-title">${page.title}</div>
          <div class="result-context">${page.content.substring(0, 80)}...</div>
        </a>
      `;
      })
      .join("");

    searchResults.classList.remove("hidden");
  });

  // Cerrar resultados al hacer clic fuera
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".navbar-search")) {
      searchResults.classList.add("hidden");
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

// Table of contents generation (opcional)
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
