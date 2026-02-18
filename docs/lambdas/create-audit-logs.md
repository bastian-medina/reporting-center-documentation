---
layout: page
title: Create Audit Logs - Lambda
---

# Create Audit Logs - Lambda Function

## 📋 Descripción General

Función Lambda del repositorio `athm-dev-anl-dataflow` que procesa eventos de SQS para crear registros de auditoría en DynamoDB. Actúa como consumidor de mensajes para el sistema de auditoría distribuido.

## 🔧 Configuración Serverless

```yaml
service: athm-dev-anl-dataflow
frameworkVersion: "3"

functions:
  createAuditLogs:
    handler: lib/CreateAuditLogs/lambda/use-case/audit-logs.createAuditLogsHandler
    runtime: nodejs18.x
    timeout: 30
    memorySize: 512
    events:
      - sqs:
          arn: ${env:SQS_AUDIT_LOGS_QUEUE_ARN}
          batchSize: 10
          maximumBatchingWindowInSeconds: 5
```

## 🔍 Estructura del Evento SQS

### SQS Event Message

```typescript
interface SQSEvent {
  Records: Array<{
    body: string;           // JSON stringificado de eventCreateAuditLogs
    messageId: string;      // ID único del mensaje SQS
    receiptHandle: string;  // Handle para confirmar procesamiento
    eventSource: string;    // "aws:sqs"
    eventSourceARN: string; // ARN de la cola SQS
  }>;
}
```

### Payload del Mensaje (JSON en body)

```typescript
interface eventCreateAuditLogs {
  action: string;    // Acción realizada ('CREATE', 'UPDATE', 'DISABLE', 'LOGIN', etc.)
  email: string;     // Email del usuario que ejecutó la acción
  data: any;         // Datos adicionales de la acción (payload específico)
}
```

## 📊 Ejemplos de Mensajes SQS

### Creación de Usuario

```json
{
  "Records": [
    {
      "body": "{\"action\":\"CREATE\",\"email\":\"admin@company.com\",\"data\":{\"message\":\"User Created\",\"email\":\"juan.perez@company.com\",\"name\":\"Juan\",\"family_name\":\"Pérez\",\"role\":\"AdminRole\"}}",
      "messageId": "12345678-1234-1234-1234-123456789012",
      "receiptHandle": "AQEB...",
      "eventSource": "aws:sqs",
      "eventSourceARN": "arn:aws:sqs:us-east-1:123456789012:audit-logs-queue"
    }
  ]
}
```

### Actualización de Usuario

```json
{
  "Records": [
    {
      "body": "{\"action\":\"UPDATE\",\"email\":\"admin@company.com\",\"data\":{\"message\":\"User updated\",\"email\":\"maria.garcia@company.com\",\"name\":\"María Elena\",\"family_name\":\"García\",\"role\":\"UserRole\"}}",
      "messageId": "87654321-4321-4321-4321-210987654321",
      "receiptHandle": "AQEB...",
      "eventSource": "aws:sqs"
    }
  ]
}
```

### Deshabilitación de Usuario

```json
{
  "Records": [
    {
      "body": "{\"action\":\"DISABLE\",\"email\":\"admin@company.com\",\"data\":{\"message\":\"User disabled\",\"email\":\"carlos.lopez@company.com\"}}",
      "messageId": "11111111-2222-3333-4444-555555555555",
      "receiptHandle": "AQEB...",
      "eventSource": "aws:sqs"
    }
  ]
}
```

### Procesamiento por Lotes

```json
{
  "Records": [
    {
      "body": "{\"action\":\"LOGIN\",\"email\":\"user1@company.com\",\"data\":{\"timestamp\":\"2024-01-15T10:30:00Z\",\"ipAddress\":\"192.168.1.100\",\"userAgent\":\"Mozilla/5.0...\"}}",
      "messageId": "msg-001"
    },
    {
      "body": "{\"action\":\"CREATE\",\"email\":\"admin@company.com\",\"data\":{\"message\":\"User Created\",\"email\":\"newuser@company.com\"}}",
      "messageId": "msg-002"
    },
    {
      "body": "{\"action\":\"UPDATE\",\"email\":\"admin@company.com\",\"data\":{\"message\":\"User updated\",\"email\":\"existinguser@company.com\"}}",
      "messageId": "msg-003"
    }
  ]
}
```


## 📚 Referencias

- [Search Audit Logs](./search-audit-logs.md) - Para consultar los logs creados por esta función
- [Admin Users Handler](./admin-users.md) - Genera eventos de auditoría que consume esta función
- [Send Mail](./send-mail.md) - Función relacionada en el mismo repositorio dataflow
