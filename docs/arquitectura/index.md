---
layout: page
title: Arquitectura - Reporting Center
---

---
layout: page
title: Arquitectura del Sistema
---

# Arquitectura - Reporting Center

## Visión General del Sistema

El Reporting Center está diseñado como un sistema distribuido que maneja la generación y gestión de reportes Subpoenas para cumplimiento de requerimientos federales del gobierno de EEUU.

![Visión general del sistema](../images/backend/Untitled.png)

## Diagramas de Arquitectura

### Vista General de Arquitectura Limpia

![Vista general arquitectura limpia](../images/backend/Untitled%202.png)

### Relación de Componentes

![Relación de componentes arquitectura limpia](../images/backend/Untitled%201.png)

## Modelos de Datos

### Filtros de Búsqueda

```typescript
interface SearchFilters {
  attributeName?: string; // Opcional
  attributeValue?: string; // Opcional
}
```

**Ejemplo:**
```json
{
  "attributeName": "email",
  "attributeValue": "test@email.com"
}
```

### Eventos de Auditoría

```typescript
interface AuditEvent {
  email: string; // Requerido
  event_user: AdminUserEnum; // AdminUserEnum(CREATE, UPDATE, DELETE)
}
```

## Componentes del Sistema

### Microservicios
1. **Microservicio Principal**: Maneja la lógica de negocio principal
2. **Microservicio de Auditoría**: Gestiona los logs de auditoría
3. **Microservicio de Email**: Procesa el envío de correos electrónicos

### Servicios AWS
- **Amazon Redshift**: Base de datos para reportes
- **DynamoDB**: Almacenamiento de datos NoSQL
- **S3**: Almacenamiento de archivos
- **SQS**: Colas de mensajes
- **Lambda**: Funciones serverless
- **Cognito**: Autenticación y autorización
- **Secrets Manager**: Gestión de secretos

### Servicios Externos
- **SendGrid**: Servicio de envío de emails

## Flujos de Arquitectura AWS

### Flujo General del Sistema

El siguiente diagrama muestra la arquitectura completa del sistema con todos los componentes integrados:

![Flujo general del sistema](../images/arquitectura/Untitled.png)

Este diagrama ilustra cómo interactúan los diferentes componentes:
- **Frontend** se comunica con **API Gateway**
- **Lambda Functions** procesan las peticiones
- **Microservicios** manejan la lógica de negocio
- **Servicios AWS** proporcionan la infraestructura subyacente

### Flujo de Procesamiento de Datos

![Flujo de procesamiento de datos](../images/arquitectura/Untitled%201.png)

Este flujo muestra:
- **Ingesta de datos** desde múltiples fuentes
- **Procesamiento** a través de Lambda functions
- **Almacenamiento** en DynamoDB y Redshift
- **Generación de reportes** y notificaciones

### Flujo de Auditoría y Logging

![Flujo de auditoría](../images/arquitectura/Untitled%202.png)

Detalla el sistema de auditoría:
- **Captura de eventos** en tiempo real
- **Procesamiento asíncrono** via SQS
- **Almacenamiento de logs** en DynamoDB
- **Consulta y búsqueda** de registros de auditoría

### Flujo de Autenticación y Autorización

![Flujo de autenticación](../images/arquitectura/Untitled%203.png)

Muestra el proceso de autenticación:
- **Login de usuarios** a través de Cognito
- **Validación de tokens** JWT
- **Control de acceso** basado en roles
- **Gestión de sesiones** y refresh tokens

### Flujo de Generación de Reportes

![Flujo de reportes](../images/arquitectura/Untitled%204.png)

Describe el proceso completo de reportes:
- **Solicitud de reporte** desde el frontend
- **Validación de permisos** y parámetros
- **Consulta de datos** en Redshift
- **Generación y encriptación** del archivo
- **Almacenamiento en S3** y notificación al usuario

### Flujo de Notificaciones

![Flujo de notificaciones](../images/arquitectura/Untitled%205.png)

Explica el sistema de notificaciones:
- **Eventos del sistema** generan mensajes SQS
- **Procesamiento asíncrono** de notificaciones
- **Envío de emails** via SendGrid
- **Tracking y confirmación** de entrega

## Diagramas de Componentes Backend

*Los diagramas de arquitectura están disponibles como imágenes en el proyecto:*

- **Visión general del sistema** (`images/backend/Untitled.png`)
- **Vista general arquitectura limpia** (`images/backend/Untitled 1.png`)
- **Relación de componentes arquitectura limpia** (`images/backend/Untitled 2.png`)

## Consideraciones de Seguridad

- Encriptación de archivos en S3
- Uso de AWS Secrets Manager para credenciales
- Autenticación mediante AWS Cognito
- Auditoría completa de acciones del sistema

## Escalabilidad

- Arquitectura basada en microservicios y escalimento de replicas
- Uso de servicios serverless (Lambda)
- DynamoDB para escalabilidad automática
- SQS para desacoplar componentes

## 🔗 Referencias Relacionadas

### 📋 Documentación QSR - Pases a Producción

- [📋 Índice QSR]({{ '/docs/qsr/' | relative_url }}) - Documentación completa de pases a producción
- [🏗️ Pipelines de Producción]({{ '/docs/qsr/pipelines-produccion/' | relative_url }}) - Despliegue de microservicios
- [🚀 Proceso de Deploy]({{ '/docs/qsr/proceso-deploy/' | relative_url }}) - Implementación de arquitectura
- [🚨 Troubleshooting]({{ '/docs/qsr/troubleshooting-produccion/' | relative_url }}) - Problemas de infraestructura

### 🛠️ Implementación y Deploy

- [Backend]({{ '/docs/backend/' | relative_url }}) - Detalles técnicos de implementación
- [CI/CD]({{ '/docs/cicd/' | relative_url }}) - Pipelines de desarrollo y producción
- [Docker/AWS]({{ '/docs/cicd/docker-aws/' | relative_url }}) - Infraestructura y contenedores
- [New Relic]({{ '/docs/cicd/newrelic/' | relative_url }}) - Monitoreo de microservicios

### ⚙️ Configuración del Sistema

- [Variables de Entorno]({{ '/docs/general/variables_entorno/' | relative_url }}) - Configuraciones por ambiente
- [Casos de Uso]({{ '/docs/general/casos-uso/' | relative_url }}) - Flujos de negocio implementados
- [Frontend]({{ '/docs/frontend/' | relative_url }}) - Integración con APIs
- [Lambdas]({{ '/docs/lambdas/' | relative_url }}) - Funciones serverless
