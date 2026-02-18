---
layout: home
title: Reporting Center
---

Bienvenido a la documentación técnica oficial del **Reporting Center**. 

Una plataforma especializada en la gestión y generación de reportes, con enfoque en casos de uso específicos como Subpoenas para cumplimiento de requerimientos federales.

---

## 🚀 Para Empezar

### Si necesitas hacer un pase a producción

Sigue la sección **QSR** completa que contiene toda la información que necesitas:

1. [Índice QSR](docs/qsr/) - Punto de entrada
2. [Pipelines de Producción](docs/qsr/pipelines-produccion.md)
3. [Proceso de Deploy](docs/qsr/proceso-deploy.md)
4. [Checklist QSR](docs/qsr/checklist-qsr.md)
5. [Troubleshooting](docs/qsr/troubleshooting-produccion.md)

### Si necesitas entender la arquitectura

- [Arquitectura Backend](docs/arquitectura/) - Diseño completo del sistema
- [Backend](docs/backend/) - APIs y tecnologías
- [Frontend](docs/frontend/) - Componentes y UI

### Si necesitas configurar

- [Variables de Entorno](docs/general/variables_entorno.md)
- [Enums y Constantes](docs/general/enums.md)
- [Casos de Uso](docs/general/casos-uso/)

---

## 📚 Secciones Principales

### Documentación Técnica
- **QSR** - Procedimientos de pases a producción
- **Arquitectura** - Diseño del sistema y microservicios
- **Backend** - APIs REST, Spring Boot, Java 17
- **Frontend** - WebPortal y componentes
- **CI/CD** - Jenkins, pipelines, certificación
- **Infraestructura** - Docker, AWS, ECR, ECS

### Configuración y Referencia
- **Variables de Entorno** - Configuraciones por ambiente
- **Enums** - Constantes y valores del sistema
- **Casos de Uso** - Flujos de negocio principales

### Servicios
- **Funciones Lambda** - Describir funciones serverless
- **Subpoenas** - Documentación específica de subpoenas
- **New Relic** - Monitoreo y alertas

---

## 🛠️ Stack Tecnológico

### Backend
- **Java 17**
- **Spring Boot 2.7.3**
- **Spring WebFlux**
- **AWS SDK**

### Infraestructura
- **AWS** (ECR, ECS, Lambda, etc.)
- **Docker** - Containerización
- **Jenkins** - CI/CD

### Monitoreo
- **New Relic** - APM y observabilidad

---

## 💡 Tips de Navegación

📌 **Usa la barra lateral** para navegar entre secciones  
🔍 **Usa el buscador** en la parte superior para encontrar contenido rápidamente  
🌙 **Cambia el tema** con el botón en la esquina superior derecha  
📱 **Responsive** - Funciona en móviles, tablets y desktop

---

## 🔍 Búsqueda Rápida

Usa la barra de búsqueda en la parte superior para encontrar rápidamente:
- Documentación técnica
- Procedimientos
- Variables de configuración
- Enums y constantes

---

**Última actualización:** {{ site.time | date: "%d de %B de %Y" }}
