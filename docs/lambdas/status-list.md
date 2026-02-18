---
layout: page
title: Status List - Lambda
---

## 📋 Descripción General

Función Lambda del repositorio `api-reports` que consulta listas de estados desde Redshift. Proporciona estados del sistema organizados por tipos, útiles para dropdowns y validaciones en la aplicación.

## 🔧 Configuración Serverless

```yaml
service: athm-dev-anl-api-reports
frameworkVersion: "3"

functions:
  statusList:
    handler: lambdas/statusList/use-case/entry-point/read-status-list.handler
    runtime: nodejs16.x
    timeout: 30
    memorySize: 512
```

## 🔍 Parámetros de Entrada

### Query Parameters

```typescript
interface IReadRequestStatusListParameterDto {
  statusType?: number;  // Filtro por tipo de estado (null para todos los tipos)
}
```

## 📊 Ejemplos de Uso

### Obtener Todos los Estados

```http
GET /status-list
```

### Obtener Estados por Tipo Específico

```http
GET /status-list?statusType=1
```

### Obtener Estados de Tipo Usuario

```http
GET /status-list?statusType=2
```

### Obtener Estados de Tipo Transacción

```http
GET /status-list?statusType=3
```

## 📊 Estructura de Respuesta

### Respuesta - Todos los Estados

```json
{
  "statusCode": 200,
  "body": {
    "totalCount": 18,
    "statusList": [
      {
        "statusid": 1,
        "name": "Active",
        "type": 1,
        "typename": "User Status",
        "description": "User account is active and can perform operations"
      },
      {
        "statusid": 2,
        "name": "Inactive",
        "type": 1, 
        "typename": "User Status",
        "description": "User account is temporarily disabled"
      },
      {
        "statusid": 3,
        "name": "Suspended",
        "type": 1,
        "typename": "User Status", 
        "description": "User account is suspended due to policy violation"
      },
      {
        "statusid": 11,
        "name": "Pending",
        "type": 2,
        "typename": "Transaction Status",
        "description": "Transaction is waiting for processing"
      },
      {
        "statusid": 12,
        "name": "Completed", 
        "type": 2,
        "typename": "Transaction Status",
        "description": "Transaction has been successfully completed"
      },
      {
        "statusid": 13,
        "name": "Failed",
        "type": 2,
        "typename": "Transaction Status",
        "description": "Transaction failed to process"
      },
      {
        "statusid": 21,
        "name": "Draft",
        "type": 3,
        "typename": "Document Status", 
        "description": "Document is in draft state"
      },
      {
        "statusid": 22,
        "name": "Published",
        "type": 3,
        "typename": "Document Status",
        "description": "Document has been published"
      }
    ],
    "groupedByType": {
      "1": {
        "typename": "User Status",
        "statuses": [
          { "statusid": 1, "name": "Active", "description": "User account is active and can perform operations" },
          { "statusid": 2, "name": "Inactive", "description": "User account is temporarily disabled" },
          { "statusid": 3, "name": "Suspended", "description": "User account is suspended due to policy violation" }
        ]
      },
      "2": {
        "typename": "Transaction Status", 
        "statuses": [
          { "statusid": 11, "name": "Pending", "description": "Transaction is waiting for processing" },
          { "statusid": 12, "name": "Completed", "description": "Transaction has been successfully completed" },
          { "statusid": 13, "name": "Failed", "description": "Transaction failed to process" }
        ]
      },
      "3": {
        "typename": "Document Status",
        "statuses": [
          { "statusid": 21, "name": "Draft", "description": "Document is in draft state" },
          { "statusid": 22, "name": "Published", "description": "Document has been published" }
        ]
      }
    }
  }
}
```

### Respuesta Filtrada por Tipo

```json
{
  "statusCode": 200,
  "body": {
    "totalCount": 3,
    "statusList": [
      {
        "statusid": 1,
        "name": "Active",
        "type": 1,
        "typename": "User Status",
        "description": "User account is active and can perform operations"
      },
      {
        "statusid": 2,
        "name": "Inactive", 
        "type": 1,
        "typename": "User Status",
        "description": "User account is temporarily disabled"
      },
      {
        "statusid": 3,
        "name": "Suspended",
        "type": 1,
        "typename": "User Status",
        "description": "User account is suspended due to policy violation"
      }
    ],
    "searchCriteria": {
      "statusType": 1
    },
    "typeInfo": {
      "type": 1,
      "typename": "User Status"
    }
  }
}
```

### Respuesta Sin Resultados

```json
{
  "statusCode": 200,
  "body": {
    "totalCount": 0,
    "statusList": [],
    "message": "No status items found for the specified type",
    "searchCriteria": {
      "statusType": 999
    }
  }
}
```

## 🗄️ Modelo de Datos

### StatusList

```typescript
class StatusList {
  statusid: number;      // ID único del estado
  name: string;          // Nombre del estado  
  type: number;          // Tipo/categoría del estado
  typename: string | null; // Nombre del tipo de estado
  description: string;   // Descripción detallada del estado
  
  constructor(
    statusid: number,
    name: string, 
    type: number,
    typename: string | null,
    description: string
  ) {
    this.statusid = statusid;
    this.name = name;
    this.type = type;
    this.typename = typename;
    this.description = description;
  }
}
```

## 🗃️ Consulta a Redshift

### Query para Todos los Estados

```sql
SELECT 
  s.status_id as statusid,
  s.status_name as name,
  s.status_type as type,
  st.type_name as typename,
  s.description
FROM status_list s
LEFT JOIN status_types st ON s.status_type = st.type_id
WHERE s.is_active = true
ORDER BY s.status_type, s.status_id;
```

### Query para Tipo Específico

```sql
SELECT 
  s.status_id as statusid,
  s.status_name as name,
  s.status_type as type,
  st.type_name as typename,
  s.description
FROM status_list s
LEFT JOIN status_types st ON s.status_type = st.type_id  
WHERE s.status_type = ?
  AND s.is_active = true
ORDER BY s.status_id;
```

### Parámetros de Query

```typescript
const queryParameters = requestParameters.statusType !== null 
  ? [requestParameters.statusType]  // Para tipo específico
  : [];                             // Para todos los tipos
```

## 📚 Referencias

- [Business Categories](./business-categories.md) - Función similar para categorías de negocio
- [Financial Institutions](./financial-institutions.md) - Función similar para instituciones financieras
- [Admin Users Handler](./admin-users.md) - Utiliza estados de usuario de esta función
