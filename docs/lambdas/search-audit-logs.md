---
layout: page
title: Search Audit Logs - Lambda
---

# Search Audit Logs - Lambda Function

## 📋 Descripción General

Función Lambda del repositorio `api-reports` que busca y consulta logs de auditoría almacenados en DynamoDB. Permite filtrar por usuario, acción, rango de fechas y proporciona paginación de resultados.

## 🔧 Configuración Serverless

```yaml
service: athm-dev-anl-api-reports
frameworkVersion: "3"

functions:
  searchAuditLogs:
    handler: lambdas/auditLogs/use-case/audit-logs.searchAuditLogsHandler
    runtime: nodejs16.x
    timeout: 30
    memorySize: 512
```

## 🔍 Parámetros de Entrada

### Query Parameters

```typescript
interface IEventSearchAuditLogs {
  // Filtros de búsqueda
  email?: string;           // Email del usuario que ejecutó la acción
  action?: string;          // Tipo de acción realizada ('CREATE', 'UPDATE', 'DISABLE', etc.)
  
  // Rango de fechas (requerido)
  dateFrom: string;         // Fecha de inicio (formato: YYYY-MM-DD o ISO)
  dateTo: string;           // Fecha de fin (formato: YYYY-MM-DD o ISO)
  
  // Paginación
  limit: number;            // Número máximo de resultados por página
  lastEvaluatedKey?: string; // Clave para continuar paginación de DynamoDB
  
  // Ordenamiento
  sortField?: string;       // Campo por el cual ordenar resultados
}
```

## 📊 Ejemplos de Uso

### Búsqueda Básica por Rango de Fechas

```http
GET /search-audit-logs?dateFrom=2024-01-01&dateTo=2024-01-31&limit=20
```

### Búsqueda por Usuario Específico

```http
GET /search-audit-logs?email=admin@company.com&dateFrom=2024-01-15&dateTo=2024-01-15&limit=10
```

### Búsqueda por Tipo de Acción

```http
GET /search-audit-logs?action=CREATE&dateFrom=2024-01-01&dateTo=2024-01-31&limit=50
```

### Búsqueda Completa con Filtros

```http
GET /search-audit-logs?email=admin@company.com&action=UPDATE&dateFrom=2024-01-10&dateTo=2024-01-20&limit=25&sortField=timestamp
```

### Paginación - Página Siguiente

```http
GET /search-audit-logs?dateFrom=2024-01-01&dateTo=2024-01-31&limit=20&lastEvaluatedKey=eyJrZXkiOiJ2YWx1ZSJ9
```

## 📊 Estructura de Respuesta

### Respuesta Exitosa

```json
{
  "statusCode": 200,
  "body": {
    "logs": [
      {
        "logId": "log_20240115_123456",
        "timestamp": "2024-01-15T10:30:00.000Z",
        "email": "admin@company.com",
        "action": "CREATE",
        "data": {
          "message": "User Created",
          "email": "juan.perez@company.com",
          "name": "Juan",
          "family_name": "Pérez",
          "role": "AdminRole"
        },
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      },
      {
        "logId": "log_20240115_123457",
        "timestamp": "2024-01-15T11:15:00.000Z",
        "email": "admin@company.com",
        "action": "UPDATE",
        "data": {
          "message": "User updated",
          "email": "maria.garcia@company.com",
          "name": "María Elena",
          "family_name": "García",
          "role": "UserRole"
        },
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    ],
    "pagination": {
      "count": 2,
      "scannedCount": 2,
      "lastEvaluatedKey": "eyJsb2dJZCI6ImxvZ18yMDI0MDExNV8xMjM0NTciLCJ0aW1lc3RhbXAiOiIyMDI0LTAxLTE1VDExOjE1OjAwLjAwMFoifQ==",
      "hasMoreResults": true
    },
    "searchCriteria": {
      "email": "admin@company.com",
      "dateFrom": "2024-01-15",
      "dateTo": "2024-01-15",
      "limit": 20
    }
  }
}
```

### Respuesta Sin Resultados

```json
{
  "statusCode": 200,
  "body": {
    "logs": [],
    "pagination": {
      "count": 0,
      "scannedCount": 0,
      "hasMoreResults": false
    },
    "searchCriteria": {
      "email": "nonexistent@company.com",
      "dateFrom": "2024-01-01",
      "dateTo": "2024-01-31",
      "limit": 20
    },
    "message": "No audit logs found for the specified criteria"
  }
}
```

### Respuesta de Error - Parámetros Obligatorios

```json
{
  "statusCode": 400,
  "body": {
    "error": "ValidationError",
    "message": "Request Error - Mandatory request parameters missing",
    "details": {
      "required": ["dateFrom", "dateTo", "limit"],
      "provided": ["dateFrom", "limit"]
    }
  }
}
```

## 🗃️ Estrategias de Búsqueda

### Patrón Strategy para Consultas

La función utiliza diferentes estrategias según los parámetros de búsqueda:

```typescript
interface ActionStrategy {
  execute(requestParameters: IEventSearchAuditLogs): Promise<APIGatewayProxyResult>;
}

// Selección de estrategia
const strategy: ActionStrategy = StrategyFactory.getStrategy(
  requestParameters, 
  logger, 
  dynamoAuditLogAdapter
);
```

### Tipos de Estrategias

1. **Email Search Strategy**: Búsqueda optimizada por índice de usuario
2. **Action Search Strategy**: Búsqueda optimizada por índice de acción
3. **Combined Search Strategy**: Búsqueda con múltiples filtros
4. **Date Range Strategy**: Búsqueda general por rango de fechas

## 📋 Tipos de Acciones de Auditoría

### Acciones Comunes

```typescript
enum AuditLogActionsEnum {
  CREATE = 'CREATE',        // Creación de usuarios
  UPDATE = 'UPDATE',        // Actualización de usuarios
  DISABLE = 'DISABLE',      // Deshabilitación de usuarios
  LOGIN = 'LOGIN',          // Inicio de sesión
  LOGOUT = 'LOGOUT',        // Cierre de sesión
  ACCESS = 'ACCESS',        // Acceso a recursos
  EXPORT = 'EXPORT',        // Exportación de datos
  IMPORT = 'IMPORT',        // Importación de datos
  DELETE = 'DELETE'         // Eliminación de recursos
}
```

### Estructura de Datos de Auditoría

```typescript
interface AuditLogEntry {
  logId: string;             // ID único del log
  timestamp: string;         // Timestamp ISO de la acción
  email: string;             // Usuario que ejecutó la acción
  action: string;            // Tipo de acción
  data: any;                 // Datos específicos de la acción
  ipAddress?: string;        // IP del usuario
  userAgent?: string;        // User agent del navegador
  sessionId?: string;        // ID de sesión
  resource?: string;         // Recurso afectado
  metadata?: any;            // Metadatos adicionales
}
```

## 🔍 Filtros Avanzados y Validaciones

### Validación de Fechas

```typescript
// Formatos aceptados
const validDateFormats = [
  'YYYY-MM-DD',              // 2024-01-15
  'YYYY-MM-DDTHH:mm:ss.sssZ' // 2024-01-15T10:30:00.000Z
];

// Validación de rango
const validateDateRange = (dateFrom: string, dateTo: string) => {
  const from = new Date(dateFrom);
  const to = new Date(dateTo);
  
  if (from > to) {
    throw new Error('dateFrom must be earlier than dateTo');
  }
  
  if (to > new Date()) {
    throw new Error('dateTo cannot be in the future');
  }
};
```

### Límites de Consulta

```typescript
const QUERY_LIMITS = {
  MIN_LIMIT: 1,
  MAX_LIMIT: 1000,
  DEFAULT_LIMIT: 50,
  MAX_DATE_RANGE_DAYS: 90
};
```

## 📊 Paginación con DynamoDB

### Manejo de lastEvaluatedKey

```typescript
// Para continuar paginación
const queryParams = {
  TableName: 'audit-logs-table',
  Limit: requestParameters.limit,
  ExclusiveStartKey: requestParameters.lastEvaluatedKey 
    ? JSON.parse(Buffer.from(requestParameters.lastEvaluatedKey, 'base64').toString())
    : undefined
};

// En la respuesta
const response = {
  logs: items,
  pagination: {
    count: items.length,
    scannedCount: result.ScannedCount,
    lastEvaluatedKey: result.LastEvaluatedKey 
      ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
      : undefined,
    hasMoreResults: !!result.LastEvaluatedKey
  }
};
```

## 🚨 Validaciones y Errores

### Parámetros Obligatorios

- **dateFrom**: Fecha de inicio (requerida)
- **dateTo**: Fecha de fin (requerida)  
- **limit**: Número de resultados (requerido)

### Códigos de Error

- **400**: Parámetros obligatorios faltantes o inválidos
- **404**: No se encontraron logs para los criterios
- **500**: Error interno de DynamoDB o del servidor

## 🔐 Consideraciones de Seguridad

### Control de Acceso

1. **Filtrado por Usuario**: Los usuarios normales solo ven sus propios logs
2. **Filtrado por Fecha**: Límite máximo de rango de fechas
3. **Paginación Obligatoria**: Previene consultas masivas
4. **Sanitización**: Parámetros son validados y sanitizados

### Información Sensible

- **IPs**: Se registran para auditoría de seguridad
- **User Agents**: Para análisis de acceso
- **Datos**: Se almacenan datos completos de las acciones

## 📚 Referencias

- [Admin Users Handler](./admin-users.md) - Genera logs de auditoría de usuarios
- [List Cognito Users](./list-cognito-users.md) - Para obtener información de usuarios mencionados en logs
