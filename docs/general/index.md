---
layout: page
title: General - Configuración y Referencia
---

# ⚙️ Configuración General

Esta sección contiene información de configuración, constantes y casos de uso generales del sistema Reporting Center.

---

## 📑 Contenidos

### [🔧 Variables de Entorno](variables_entorno.md)

Todas las variables de configuración necesarias por ambiente (desarrollo, staging, producción).

Incluye:
- Configuración de Base de Datos
- Credenciales AWS
- Variables de Aplicación
- Endpoints y URLs

### [📝 Enums y Constantes](enums.md)

Valores constantes, enumeraciones y tipos del sistema.

Incluye:
- Account Types
- Report Status
- Transaction Types
- Error Codes

### [📋 Casos de Uso](casos-uso/)

Documentación detallada de todos los casos de uso del sistema Reporting Center.

**Casos de uso de Reportes**:
- Reportes de Clientes Personales
- Reportes de Clientes Negativos
- Reportes de Transacciones
- Reportes de Auditoría

---

## 🚀 Quick Links

- [Ver Variables de Entorno →](variables_entorno.md)
- [Ver Enums →](enums.md)
- [Explorar Casos de Uso →](casos-uso/)

---

## 📌 Información General

### Microservicios Principales

| Servicio | Descripción |
|----------|-----------|
| **Reportes Generales** | Reportes de clientes y transacciones |
| **Subpoenas** | Generación de citaciones |
| **API Gateway** | Gateway único de acceso |
| **Admin Service** | Gestión administrativa |

### Tecnologías

- **Java 17** - Lenguaje principal
- **Spring Boot 2.7.3** - Framework
- **Spring WebFlux** - Programación reactiva
- **DynamoDB** - Base de datos NoSQL
- **AWS Lambda** - Funciones serverless

### Stack Infraestructura

- **AWS ECS** - Container orchestration
- **AWS ECR** - Container registry  
- **AWS Lambda** - Funciones
- **DynamoDB** - Base de datos
- **SQS** - Colas de mensajes
- **SNS** - Notificaciones

---

## 🔗 Enlaces Relacionados

### Documentación Técnica

- [🏛️ Arquitectura del Sistema](/docs/arquitectura/)
- [⚙️ Backend](/docs/backend/)
- [🖥️ Frontend](/docs/frontend/)
- [🔄 CI/CD](/docs/cicd/)

### Procedimientos

- [⭐ QSR - Pases a Producción](/docs/qsr/)
- [🚀 Lambdas](/docs/lambdas/)
- [📊 Subpoenas](/docs/subpoenas/)

---

**Última actualización:** {{ site.time | date: "%d de %B de %Y" }}
