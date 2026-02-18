---
layout: page
title: Business Categories - Lambda Function
---

# Business Categories - Lambda Function

## 📋 Descripción General

Función Lambda del repositorio `api-reports` que consulta categorías de negocio desde Redshift. Proporciona una lista de categorías disponibles con información de habilitación y soporte multiidioma.

## 🔧 Configuración Serverless

```yaml
service: athm-dev-anl-api-reports
frameworkVersion: "3"

functions:
  businessCategories:
    handler: lambdas/businessCategories/use-case/entry-point/read-business-category.handler
    runtime: nodejs16.x
    timeout: 30
    memorySize: 512
```

## 🔍 Parámetros de Entrada

### Query Parameters

```typescript
interface IReadRequestStatusListParameterDto {
  categoryStatus?: string;  // Filtro por estado de la categoría ('enabled' | 'disabled' | null para todas)
}
```

## 📊 Ejemplos de Uso

### Obtener Todas las Categorías

```http
GET /business-categories
```

### Obtener Solo Categorías Habilitadas

```http
GET /business-categories?categoryStatus=enabled
```

### Obtener Solo Categorías Deshabilitadas

```http
GET /business-categories?categoryStatus=disabled
```

## 📊 Estructura de Respuesta

### Respuesta Exitosa

```json
{
  "statusCode": 200,
  "body": {
    "totalCount": 15,
    "categories": [
      {
        "id": "1",
        "value": "Retail Trade",
        "language": "en",
        "enabled": "true"
      },
      {
        "id": "2", 
        "value": "Comercio al por menor",
        "language": "es",
        "enabled": "true"
      },
      {
        "id": "3",
        "value": "Financial Services",
        "language": "en", 
        "enabled": "true"
      },
      {
        "id": "4",
        "value": "Servicios Financieros",
        "language": "es",
        "enabled": "true"
      },
      {
        "id": "5",
        "value": "Healthcare",
        "language": "en",
        "enabled": "false"
      },
      {
        "id": "6",
        "value": "Atención Médica",
        "language": "es",
        "enabled": "false"
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

### Respuesta Filtrada por Estado

```json
{
  "statusCode": 200,
  "body": {
    "totalCount": 8,
    "categories": [
      {
        "id": "1",
        "value": "Retail Trade",
        "language": "en",
        "enabled": "true"
      },
      {
        "id": "2",
        "value": "Comercio al por menor", 
        "language": "es",
        "enabled": "true"
      },
      {
        "id": "3",
        "value": "Financial Services",
        "language": "en",
        "enabled": "true"
      },
      {
        "id": "4",
        "value": "Servicios Financieros",
        "language": "es", 
        "enabled": "true"
      }
    ],
    "searchCriteria": {
      "categoryStatus": "enabled"
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
    "categories": [],
    "message": "No business categories found for the specified criteria"
  }
}
```

## 🗄️ Modelo de Datos

### BusinessCategoryModel

```typescript
class BusinessCategoryModel {
  id: string | null;        // ID único de la categoría
  value: string | null;     // Nombre de la categoría
  language: string | null;  // Código de idioma ('en', 'es')
  enabled: string | null;   // Estado de habilitación ('true', 'false')
  
  constructor(
    id: string | null,
    value: string | null, 
    language: string | null,
    enabled: string | null
  ) {
    this.id = id;
    this.value = value;
    this.language = language;
    this.enabled = enabled;
  }
}
```

## 🗃️ Consulta a Redshift

### Query Base

```sql
SELECT 
  id,
  category_name as value,
  language_code as language,
  is_enabled as enabled
FROM business_categories_view
WHERE 1=1
  AND (is_enabled = ? OR ? IS NULL)
ORDER BY id, language_code;
```

### Parámetros de Query

```typescript
const queryParameters = [
  requestParameters.categoryStatus === 'enabled' ? 'true' : 
  requestParameters.categoryStatus === 'disabled' ? 'false' : null,
  requestParameters.categoryStatus
];
```

## 🌐 Soporte Multiidioma

### Idiomas Soportados

- **en**: English (Inglés)
- **es**: Español

### Estructura de Categorías Multiidioma

Cada categoría de negocio tiene múltiples entradas, una por idioma soportado:

```json
[
  {
    "id": "1",
    "value": "Financial Services",
    "language": "en",
    "enabled": "true"
  },
  {
    "id": "1", 
    "value": "Servicios Financieros",
    "language": "es",
    "enabled": "true"
  }
]
```

## 📊 Filtros y Validaciones

### Estados de Categoría Válidos

```typescript
enum CategoryStatus {
  ENABLED = 'enabled',    // Solo categorías habilitadas
  DISABLED = 'disabled',  // Solo categorías deshabilitadas
  ALL = null             // Todas las categorías
}
```

### Validación de Parámetros

```typescript
const validateCategoryStatus = (status?: string): boolean => {
  if (!status) return true; // null/undefined es válido
  
  return status === 'enabled' || status === 'disabled';
};
```

### Respuesta de Error

```json
{
  "statusCode": 400,
  "body": {
    "error": "ValidationError",
    "message": "Invalid categoryStatus parameter",
    "validValues": ["enabled", "disabled", null]
  }
}
```

## 📚 Referencias

- [Financial Institutions](./financial-institutions.md) - Función similar para instituciones financieras
- [Status List](./status-list.md) - Función similar para listas de estados
