---
layout: page
title: Funciones Lambda - Reporting Center
---

Este directorio contiene la documentación de las funciones Lambda de los repositorios del proyecto Reporting Center, utilizando Serverless Framework v3.

## 📁 Estructura de Repositorios

### 1. API Reports Repository - `athm-dev-anl-api-reports` 📊

Contiene 5 funciones Lambda para gestión de usuarios, auditoría y datos maestros:

- **[Admin Users Handler](./admin-users.md)** ✅ - Crear, actualizar y deshabilitar usuarios administrativos
- **[List Cognito Users](./list-cognito-users.md)** ✅ - Listar usuarios con paginación y filtros
- **[Search Audit Logs](./search-audit-logs.md)** ✅ - Buscar logs de auditoría con filtros avanzados
- **[Business Categories](./business-categories.md)** ✅ - Obtener categorías de negocio con filtros por estado
- **[Financial Institutions](./financial-institutions.md)** ✅ - Obtener instituciones financieras por ID
- **[Status List](./status-list.md)** ✅ - Obtener listas de estados por tipo

### 2. DataFlow Repository - `athm-dev-anl-dataflow` 🔄

Contiene 2 funciones Lambda para procesamiento de datos y notificaciones:

- **[Create Audit Logs](./create-audit-logs.md)** ✅ - Procesamiento de eventos SQS para crear logs de auditoría
- **[Send Mail](./send-mail.md)** ✅ - Envío de emails mediante SendGrid desde eventos SQS

### 3. Cognito Repository - `athm-dev-anl-cognito` 🔐

Funciones Lambda para autenticación y gestión de usuarios (por documentar):

- **User Authentication** 🔄 - Autenticación de usuarios con JWT
- **User Registration** 🔄 - Registro de nuevos usuarios

## 🚀 Configuraciones Serverless Framework v3

### API Reports

```yaml
service: athm-dev-anl-api-reports
frameworkVersion: "3"
provider:
  name: aws
  runtime: nodejs16.x
  region: us-east-1
```

### DataFlow

```yaml
service: athm-dev-anl-dataflow
frameworkVersion: "3"
provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
```

## 📊 Patrones de Arquitectura

### Clean Architecture

- **Use Cases**: Lógica de negocio específica
- **Data Layer**: Acceso a datos (Cognito, DynamoDB, Redshift)
- **Models**: DTOs y interfaces TypeScript
- **Adapters**: Integración con servicios AWS
- **Factories**: Configuración de dependencias

### Event-Driven Architecture

- **SQS Events**: Procesamiento asíncrono de eventos
- **Dead Letter Queues**: Manejo de mensajes fallidos
- **Retry Logic**: Reintentos automáticos
- **Batch Processing**: Procesamiento por lotes

### Patrón Strategy

- **Strategy Factory**: Selección de estrategia según parámetros
- **Action Strategy**: Implementación de lógica específica
- **Entry Points**: Configuración de dependencias

## 🔧 Servicios AWS Integrados

### Bases de Datos
- **DynamoDB**: Almacenamiento de logs de auditoría
- **Redshift**: Data warehouse para consultas analíticas

### Mensajería
- **SQS**: Colas para procesamiento asíncrono
- **SNS**: Notificaciones y alertas

### Autenticación
- **Cognito User Pools**: Gestión de usuarios
- **JWT**: Tokens de autenticación

### Comunicaciones
- **SendGrid**: Servicio de email transaccional
- **SES**: Amazon Simple Email Service (backup)

### Seguridad
- **Secrets Manager**: Gestión segura de credenciales
- **IAM Roles**: Permisos granulares por función

## 📚 Enlaces Relacionados

- [Documentación de Backend](../backend.md)
- [Arquitectura del Sistema](../arquitectura.md)
- [CI/CD Pipeline](../cicd.md)

---

**Nota**: Las funciones marcadas con ✅ están completamente documentadas con parámetros, ejemplos y casos de uso. Las marcadas con 🔄 están pendientes de documentación.
