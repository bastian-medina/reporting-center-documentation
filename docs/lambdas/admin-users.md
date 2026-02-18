---
layout: page
title: Admin Users Handler - Lambda Function
---

## 📋 Descripción General

Función Lambda del repositorio `api-reports` que maneja la gestión de usuarios administrativos en AWS Cognito. Permite crear, actualizar y deshabilitar usuarios del sistema.

## 🔧 Configuración Serverless

```yaml
service: athm-dev-anl-api-reports
frameworkVersion: "3"

functions:
  adminUsers:
    handler: lambdas/adminUsers/use-case/admin-users.adminUsersHandler
    runtime: nodejs16.x
    timeout: 30
    memorySize: 512
```

## 🔍 Parámetros de Entrada

### Request Body (JSON)

```typescript
interface AdminUserArguments {
  // Información del usuario
  name: string;              // Nombre del usuario
  family_name: string;       // Apellido del usuario
  email: string;             // Email del usuario (usado como username)
  role: string;              // Rol del usuario en el sistema
  
  // Configuración de acción
  event_user: AdminUserEnum; // Tipo de operación: 'CREATE' | 'UPDATE' | 'DISABLE'
  username: string;          // Usuario que ejecuta la acción (para auditoría)
  
  // Campos condicionales
  password?: string;         // Contraseña (requerida para CREATE, opcional para UPDATE)
}

enum AdminUserEnum {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE'
  // DISABLE es implícito cuando no es CREATE ni UPDATE
}
```

## 📊 Ejemplos de Uso

### Crear Usuario

```json
POST /admin-users

{
  "name": "Juan",
  "family_name": "Pérez",
  "email": "juan.perez@company.com",
  "password": "TempPassword123!",
  "role": "AdminRole",
  "event_user": "CREATE",
  "username": "admin@company.com"
}
```

### Actualizar Usuario

```json
POST /admin-users

{
  "name": "Juan Carlos",
  "family_name": "Pérez González",
  "email": "juan.perez@company.com",
  "password": "NewPassword456!",
  "role": "SuperAdminRole",
  "event_user": "UPDATE",
  "username": "admin@company.com"
}
```

### Actualizar Usuario Sin Cambiar Contraseña

```json
POST /admin-users

{
  "name": "Juan Carlos",
  "family_name": "Pérez González",
  "email": "juan.perez@company.com",
  "role": "AdminRole",
  "event_user": "UPDATE",
  "username": "admin@company.com"
}
```

### Deshabilitar Usuario

```json
POST /admin-users

{
  "email": "juan.perez@company.com",
  "username": "admin@company.com"
}
```

## 📊 Estructura de Respuesta

### Respuesta de Creación Exitosa

```json
{
  "statusCode": 201,
  "body": {
    "message": "User Created",
    "email": "juan.perez@company.com",
    "name": "Juan",
    "family_name": "Pérez",
    "role": "AdminRole"
  }
}
```

### Respuesta de Actualización Exitosa

```json
{
  "statusCode": 200,
  "body": {
    "message": "User updated",
    "email": "juan.perez@company.com",
    "name": "Juan Carlos",
    "family_name": "Pérez González",
    "role": "SuperAdminRole"
  }
}
```

### Respuesta de Deshabilitación Exitosa

```json
{
  "statusCode": 200,
  "body": {
    "message": "User disabled",
    "email": "juan.perez@company.com"
  }
}
```

### Respuesta de Error

```json
{
  "statusCode": 400,
  "body": {
    "error": "ValidationError",
    "message": "Invalid email format or missing required fields"
  }
}
```

## 🔐 Atributos de Usuario en Cognito

### Atributos para Creación

```typescript
const createUserAttributes = [
  {
    Name: 'family_name',
    Value: payload.family_name
  },
  {
    Name: 'name',
    Value: payload.name
  },
  {
    Name: 'email_verified',
    Value: 'true'
  },
  {
    Name: 'email',
    Value: payload.email
  }
];
```

### Atributos para Actualización

```typescript
const updateUserAttributes = [
  {
    Name: 'family_name',
    Value: payload.family_name
  },
  {
    Name: 'name',
    Value: payload.name
  }
];
```

## 📝 Auditoría y Logging

### Eventos de Auditoría

La función envía eventos de auditoría a SQS para tracking:

```typescript
interface AuditEvent {
  action: 'CREATE' | 'UPDATE' | 'DISABLE';
  email: string;              // Usuario que ejecuta la acción
  data: {
    message: string;
    email: string;            // Usuario afectado
    name?: string;
    family_name?: string;
    role?: string;
  };
}
```

### Ejemplo de Evento de Auditoría

```json
{
  "action": "CREATE",
  "email": "admin@company.com",
  "data": {
    "message": "User Created",
    "email": "juan.perez@company.com",
    "name": "Juan",
    "family_name": "Pérez",
    "role": "AdminRole"
  }
}
```

## 🚨 Validaciones y Errores

### Validaciones Implementadas

1. **Formato de Email**: Validado por Cognito
2. **Campos Requeridos**: name, family_name, email, event_user, username
3. **Contraseña**: Requerida para CREATE, opcional para UPDATE
4. **Enum event_user**: Debe ser 'CREATE' o 'UPDATE' para operaciones específicas

### Códigos de Error Comunes

- **400**: Datos de entrada inválidos
- **409**: Usuario ya existe (CREATE)
- **404**: Usuario no encontrado (UPDATE/DISABLE)
- **500**: Error interno del servidor o SQS

## 🔗 Integración con Servicios AWS

### AWS Cognito User Pool
- Creación de usuarios con atributos personalizados
- Actualización de atributos de usuario
- Deshabilitación de usuarios (no eliminación)

### Amazon SQS
- Cola de auditoría para tracking de cambios
- Manejo de errores de SQS sin afectar la operación principal

### AWS Lambda Powertools
- Logger estructurado para debugging
- Métricas y observabilidad

## 📚 Referencias

- [List Cognito Users](./list-cognito-users.md) - Para listar usuarios existentes
- [Search Audit Logs](./search-audit-logs.md) - Para consultar logs de auditoría generados
