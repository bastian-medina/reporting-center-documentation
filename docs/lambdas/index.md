---
layout: page
title: AWS Lambda Functions
---

Documentación de todas las funciones AWS Lambda utilizadas en el sistema Reporting Center.

---

## 📋 Funciones Disponibles

### Gestión de Usuarios

**[Admin Users]({{ 'admin-users/' | relative_url }})**
- Crear, actualizar y eliminar usuarios administrativos
- Gestión de roles y permisos

**[List Cognito Users]({{ 'list-cognito-users/' | relative_url }})**
- Listar usuarios de AWS Cognito
- Filtros y búsqueda

### Datos de Referencia

**[Business Categories]({{ 'business-categories/' | relative_url }})**
- Gestión de categorías de negocio
- Sincronización de datos

**[Financial Institutions]({{ 'financial-institutions/' | relative_url }})**
- Información de instituciones financieras
- Actualización de catálogos

**[Status List]({{ 'status-list/' | relative_url }})**
- Listados de estados del sistema
- Valores permitidos

### Auditoría y Notificaciones

**[Create Audit Logs]({{ 'create-audit-logs/' | relative_url }})**
- Registrar eventos de auditoría
- Trazabilidad de operaciones

**[Search Audit Logs]({{ 'search-audit-logs/' | relative_url }})**
- Búsqueda en logs de auditoría
- Filtrado por fecha, usuario, acción

**[Send Mail]({{ 'send-mail/' | relative_url }})**
- Envío de notificaciones por email
- Integración con SendGrid

---

## 🏗️ Características Comunes

- **Runtime**: Node.js 18.x
- **Autenticación**: AWS IAM
- **Monitoreo**: AWS CloudWatch
- **Logs**: CloudWatch Logs

---

## 📌 Mejores Prácticas

1. **Async/Await** - Usa async/await en lugar de callbacks
2. **Error Handling** - Implementa manejo robusto de errores
3. **Logging** - Log detalles para debugging
4. **Environment Variables** - Configura variables por ambiente
5. **Timeouts** - Define timeouts apropiados
6. **Cold Starts** - Optimiza para cold starts

---

## 🔗 Enlaces Relacionados

- [CI/CD Pipeline](/docs/cicd/)
- [Docker y AWS](/docs/cicd/docker-aws.md)
- [Variables de Entorno](/docs/general/variables_entorno.md)
- [Monitoreo New Relic](/docs/cicd/newrelic.md)

---

**Última actualización:** {{ site.time | date: "%d de %B de %Y" }}
