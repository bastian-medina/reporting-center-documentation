---
layout: page
title: Financial Institutions - Lambda
---

# Financial Institutions - Lambda Function

## 📋 Descripción General

Función Lambda del repositorio `api-reports` que consulta instituciones financieras desde Redshift. Permite obtener todas las instituciones o buscar una específica por ID.

## 🔧 Configuración Serverless

```yaml
service: athm-dev-anl-api-reports
frameworkVersion: "3"

functions:
  financialInstitutions:
    handler: lambdas/financial-institutions/use-case/entry-point/read-financial-institution.handler
    runtime: nodejs16.x
    timeout: 30
    memorySize: 512
```

## 🔍 Parámetros de Entrada

### Query Parameters

```typescript
interface IReadRequestParameterDto {
  id?: string;              // ID específico de la institución financiera (FIID)
  // Si se proporciona id, solo retorna esa institución
  // Si no se proporciona, retorna todas las instituciones
}
```

## 📊 Ejemplos de Uso

### Obtener Todas las Instituciones Financieras

```http
GET /financial-institutions
```

### Obtener Institución Específica por ID

```http
GET /financial-institutions?id=001
```

### Buscar Institución por FIID

```http
GET /financial-institutions?id=BPPR001
```

## 📊 Estructura de Respuesta

### Respuesta - Todas las Instituciones

```json
{
  "statusCode": 200,
  "body": {
    "totalCount": 25,
    "institutions": [
      {
        "fiid": "001",
        "name": "Banco Popular de Puerto Rico"
      },
      {
        "fiid": "002", 
        "name": "FirstBank Puerto Rico"
      },
      {
        "fiid": "003",
        "name": "Banco Santander Puerto Rico"
      },
      {
        "fiid": "004",
        "name": "Oriental Bank"
      },
      {
        "fiid": "005",
        "name": "Scotiabank de Puerto Rico"
      },
      {
        "fiid": "021",
        "name": "Doral Bank"
      },
      {
        "fiid": "030",
        "name": "Cooperativa de Ahorro y Crédito de Arecibo"
      },
      {
        "fiid": "031",
        "name": "Cooperativa de Ahorro y Crédito de Bayamón"
      }
    ],
    "pagination": {
      "page": 1,
      "totalPages": 1,
      "hasMore": false
    }
  }
}
```

### Respuesta - Institución Específica

```json
{
  "statusCode": 200,
  "body": {
    "totalCount": 1,
    "institutions": [
      {
        "fiid": "001",
        "name": "Banco Popular de Puerto Rico"
      }
    ],
    "searchCriteria": {
      "id": "001"
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
    "institutions": [],
    "message": "No financial institution found with the specified ID",
    "searchCriteria": {
      "id": "999"
    }
  }
}
```

## 🗄️ Modelo de Datos

### FinancialInstitution

```typescript
class FinancialInstitution {
  fiid: string;     // Financial Institution ID - ID único de la institución
  name: string;     // Nombre completo de la institución financiera
  
  constructor(fiid: string, name: string) {
    this.fiid = fiid;
    this.name = name;
  }
}
```

## 🗃️ Consulta a Redshift

### Query para Todas las Instituciones

```sql
SELECT 
  institution_id as fiid,
  institution_name as name
FROM financial_institutions_view
WHERE is_active = true
ORDER BY institution_name;
```

### Query para Institución Específica

```sql
SELECT 
  institution_id as fiid,
  institution_name as name  
FROM financial_institutions_view
WHERE institution_id = ?
  AND is_active = true;
```

### Parámetros de Query

```typescript
const queryParameters = requestParameters.isFiIdProvided 
  ? [requestParameters.id]  // Para búsqueda específica
  : [];                     // Para todas las instituciones
```

## 📚 Referencias

- [Business Categories](./business-categories.md) - Función similar para categorías de negocio
- [Status List](./status-list.md) - Función similar para listas de estados
- [Admin Users Handler](./admin-users.md) - Para gestión de usuarios que acceden a estas instituciones
