---
layout: page
title: List Cognito Users - Lambda
---

## 📋 Descripción General

Función Lambda del repositorio `api-reports` que obtiene usuarios de AWS Cognito con paginación y filtros. Permite buscar usuarios por atributos específicos y retorna información completa incluyendo roles.

## 🔧 Configuración Serverless

```yaml
service: athm-dev-anl-api-reports
frameworkVersion: "3"

functions:
  listCognitoUsers:
    handler: lambdas/adminUsers/use-case/get-users.getUsersHandler
    runtime: nodejs16.x
    timeout: 30
    memorySize: 512
```

## 🔍 Parámetros de Entrada

### Query Parameters

```typescript
interface IRequestListArguments {
  // Paginación
  limit?: number;           // Número de usuarios por página (default: valor de constante)
  
  // Filtros de búsqueda
  attributeName?: string;   // Nombre del atributo para filtrar: 'email' | 'name' | 'family_name'
  attributeValue?: string;  // Valor del atributo para buscar (búsqueda por prefijo)
}
```

### Atributos de Búsqueda Válidos

- **email**: Buscar por dirección de correo electrónico
- **name**: Buscar por nombre del usuario
- **family_name**: Buscar por apellido del usuario

## 📊 Ejemplos de Uso

### Listar Usuarios Sin Filtros

```http
GET /list-cognito-users
```

### Listar Usuarios con Límite

```http
GET /list-cognito-users?limit=10
```

### Buscar por Email

```http
GET /list-cognito-users?attributeName=email&attributeValue=juan&limit=5
```

### Buscar por Nombre

```http
GET /list-cognito-users?attributeName=name&attributeValue=Juan&limit=20
```

### Buscar por Apellido

```http
GET /list-cognito-users?attributeName=family_name&attributeValue=Pérez&limit=15
```

## 📊 Estructura de Respuesta

### Respuesta Exitosa

```json
{
  "statusCode": 200,
  "body": {
    "totalPageNumber": 3,
    "pages": [
      {
        "paginationToken": "eyJwYWdpbmF0aW9uVG9rZW4iOiJleGFtcGxlIn0=",
        "pageNumber": 1,
        "users": [
          {
            "username": "user-uuid-1234",
            "email": "juan.perez@company.com",
            "name": "Juan",
            "family_name": "Pérez",
            "enabled": true,
            "userStatus": "CONFIRMED",
            "createdDate": "2024-01-15T10:30:00.000Z",
            "lastModifiedDate": "2024-01-20T14:22:00.000Z",
            "role": "AdminRole"
          },
          {
            "username": "user-uuid-5678",
            "email": "maria.garcia@company.com",
            "name": "María",
            "family_name": "García",
            "enabled": true,
            "userStatus": "CONFIRMED",
            "createdDate": "2024-01-16T09:15:00.000Z",
            "lastModifiedDate": "2024-01-16T09:15:00.000Z",
            "role": "UserRole"
          }
        ]
      },
      {
        "paginationToken": "eyJwYWdpbmF0aW9uVG9rZW4iOiJleGFtcGxlMiJ9",
        "pageNumber": 2,
        "users": [
          {
            "username": "user-uuid-9012",
            "email": "carlos.lopez@company.com",
            "name": "Carlos",
            "family_name": "López",
            "enabled": false,
            "userStatus": "FORCE_CHANGE_PASSWORD",
            "createdDate": "2024-01-17T11:45:00.000Z",
            "lastModifiedDate": "2024-01-18T16:30:00.000Z",
            "role": "defaultRole"
          }
        ]
      }
    ]
  }
}
```

### Respuesta de Error - Límite Inválido

```json
{
  "statusCode": 400,
  "body": {
    "error": "ValidationError",
    "message": "Request Error - Limit parameter not available"
  }
}
```

### Respuesta de Error - Atributo Inválido

```json
{
  "statusCode": 400,
  "body": {
    "error": "ValidationError",
    "message": "Request Error - Invalid attribute name; valid values are: email, name, family_name"
  }
}
```

## 🔍 Lógica de Filtrado

### Construcción del Filtro

```typescript
// Para attributeName="email" y attributeValue="juan"
// Se construye: email ^= "juan"
// Esto busca emails que comiencen con "juan"

private buildFilter(payload: IRequestListArguments): string {
  const escapeCharacters = "\"";
  const attributeName = payload.attributeName;
  const attributeValue = payload.attributeValue;
  
  let filter = '';
  
  if (attributeName && attributeValue) {
    filter = attributeName
      .concat(" ^= ")
      .concat(escapeCharacters)
      .concat(attributeValue)
      .concat(escapeCharacters);
  }
  
  return filter;
}
```

### Ejemplos de Filtros Generados

```typescript
// Email filter
"email ^= \"juan\""          // Busca emails que empiecen con "juan"

// Name filter  
"name ^= \"María\""          // Busca nombres que empiecen con "María"

// Family name filter
"family_name ^= \"García\""  // Busca apellidos que empiecen con "García"
```

## 👥 Mapeo de Usuarios y Roles

### Estructura del Usuario Mapeado

```typescript
interface CognitoUser {
  username: string;           // UUID del usuario en Cognito
  email: string;             // Email del usuario
  name: string;              // Nombre
  family_name: string;       // Apellido
  enabled: boolean;          // Si el usuario está habilitado
  userStatus: string;        // Estado del usuario en Cognito
  createdDate: string;       // Fecha de creación
  lastModifiedDate: string;  // Fecha de última modificación
  role: string;              // Rol asignado desde Cognito Groups
}
```

### Obtención de Roles

La función consulta los grupos de Cognito para cada usuario para obtener su rol:

```typescript
// Para cada usuario se ejecuta:
const groupsResponse = await cognito.adminListGroupsForUser({
  UserPoolId: USER_POOL_ID,
  Username: user.Username
});

// El rol se obtiene del primer grupo encontrado
const role = groupsResponse.Groups?.[0]?.GroupName || "defaultRole";
```

## 📄 Paginación

### Manejo de Páginas

La función maneja automáticamente la paginación de Cognito:

1. Realiza múltiples llamadas a Cognito usando `PaginationToken`
2. Procesa cada página individualmente
3. Combina todas las páginas en una respuesta unificada
4. Incluye información de paginación para cada página

### Estructura de Página

```typescript
interface UserPaginationResponse {
  paginationToken?: string;  // Token para la siguiente página
  pageNumber: number;        // Número de página (1-based)
  users: CognitoUser[];     // Usuarios en esta página
}
```

## 🚨 Validaciones y Errores

### Validaciones Implementadas

```typescript
// Validación de límite
private isValidLimit(limit: number | undefined): boolean {
  return limit !== undefined && !isNaN(limit);
}

// Validación de nombre de atributo
private isValidAttributeName(attributeName: string | undefined): boolean {
  return attributeName === "email" || 
         attributeName === "name" || 
         attributeName === "family_name";
}
```

### Códigos de Error

- **400**: Parámetros de entrada inválidos
- **404**: No se encontraron usuarios
- **500**: Error interno del servidor o AWS

## ⚡ Consideraciones de Performance

### Optimizaciones

1. **Procesamiento Paralelo**: Los roles se obtienen en paralelo usando `Promise.all()`
2. **Lazy Loading**: Las páginas se procesan una por una
3. **Memoria Eficiente**: No se cargan todos los usuarios en memoria simultáneamente

### Límites y Recomendaciones

- **Límite por Defecto**: Definido en `ApplicationConstants.USER_PAGINATION_LIMIT`
- **Paginación Automática**: Maneja automáticamente múltiples páginas de Cognito
- **Timeout**: 30 segundos para consultas grandes

## 📚 Referencias

- [Admin Users Handler](./admin-users.md) - Para crear y gestionar usuarios
- [Search Audit Logs](./search-audit-logs.md) - Para auditoría de cambios de usuarios
