---
layout: page
title: QSR - Pases a Producción
---

Este directorio contiene toda la documentación relacionada con los Quality Service Requests (QSR) y los procesos de pase a producción del sistema Reporting Center.

## 📋 Contenido

**📖 Orden recomendado de lectura:**

1. [**🏗️ Pipelines de Producción**](./02-pipelines-produccion.md) - Conocer todos los pipelines disponibles
2. [**🚀 Proceso de Deploy**](./03-proceso-deploy.md) - Entender el proceso paso a paso
3. [**✅ Checklist QSR**](./04-checklist-qsr.md) - Ejecutar con lista de verificación
4. [**🚨 Troubleshooting**](./05-troubleshooting-produccion.md) - Resolver problemas comunes
5. [**📄 QSR-2666059 Reference**](./06-qsr-2666059-reference.md) - Referencia específica del QSR actual

## 🚀 Pipelines Disponibles

### Microservicios y APIs
- **DataFlow Pipeline** - Procesamiento de datos
- **Subpoenas Service** - Microservicio de citaciones
- **API Reports** - API de reportes
- **General Reports** - Reportes generales

### Infraestructura
- **Cognito Pipeline** - Gestión de usuarios
- **Docker Deployments** - Despliegues de contenedores
- **WebPortal** - Frontend del sistema

## 📞 Contactos

**DevOps Team**: Hector Granada  
**QSR Approval**: Requerida para todos los pases a producción

## 🔗 Enlaces Internos QSR

### Documentación Técnica

- [Ver todos los Pipelines →](./02-pipelines-produccion.md)
- [Seguir el Proceso de Deploy →](./03-proceso-deploy.md)
- [Usar el Checklist QSR →](./04-checklist-qsr.md)
- [Resolver Problemas →](./05-troubleshooting-produccion.md)
- [Consultar QSR-2666059 →](./06-qsr-2666059-reference.md)

### Referencias Externas

- [📖 Documentación CI/CD Principal](../04-cicd.md)
- [🏗️ Arquitectura del Sistema](../01-arquitectura-backend.md)
- [📁 Archivos QSR Originales](/files/qsr/)
- [🐳 Docker y AWS](../05-docker-aws.md)
- [📊 Monitoreo New Relic](../06-newrelic.md)

### Documentación por Área

- [Frontend](../03-frontend.md) - WebPortal y componentes UI
- [Backend](../02-backend.md) - APIs y microservicios
- [Variables de Entorno](../general/variables_entorno.md)
- [Casos de Uso](../general/casos-uso.md)

---

**Nota**: Todos los despliegues a producción requieren un QSR aprobado y seguimiento del proceso establecido.
