# Send Mail - Lambda Function

## 📋 Descripción General

Función Lambda del repositorio `athm-dev-anl-dataflow` que procesa eventos de SQS para enviar correos electrónicos utilizando SendGrid. Maneja el envío asíncrono de notificaciones del sistema.

## 🔧 Configuración Serverless

```yaml
service: athm-dev-anl-dataflow
frameworkVersion: "3"

functions:
  sendMail:
    handler: lib/MailSender/lambda/use-case/send-mail.sendMailHandler
    runtime: nodejs18.x
    timeout: 30
    memorySize: 512
    environment:
      SECRET_NAME: ${env:SECRET_NAME}  # Secrets Manager para API key de SendGrid
    events:
      - sqs:
          arn: ${env:SQS_MAIL_QUEUE_ARN}
          batchSize: 10
          maximumBatchingWindowInSeconds: 5
```

## 🔍 Estructura del Evento SQS

### SQS Event Message

```typescript
interface SQSEvent {
  Records: Array<{
    body: string;           // JSON stringificado de EmailArguments
    messageId: string;      // ID único del mensaje SQS
    receiptHandle: string;  // Handle para confirmar procesamiento
    eventSource: string;    // "aws:sqs"
    eventSourceARN: string; // ARN de la cola SQS
  }>;
}
```

### Payload del Mensaje (JSON en body)

```typescript
interface EmailArguments {
  to: string;           // Email del destinatario
  subject: string;      // Asunto del correo
  templateId: string;   // ID del template en SendGrid
  templateData: any;    // Datos dinámicos para el template
}
```

## 📊 Ejemplos de Mensajes SQS

### Notificación de Nuevo Usuario

```json
{
  "Records": [
    {
      "body": "{\"to\":\"juan.perez@company.com\",\"subject\":\"Bienvenido al Sistema de Reportes\",\"templateId\":\"d-1234567890abcdef\",\"templateData\":{\"firstName\":\"Juan\",\"lastName\":\"Pérez\",\"role\":\"AdminRole\",\"loginUrl\":\"https://reports.company.com/login\",\"companyName\":\"Company Inc.\"}}",
      "messageId": "12345678-1234-1234-1234-123456789012",
      "receiptHandle": "AQEB...",
      "eventSource": "aws:sqs",
      "eventSourceARN": "arn:aws:sqs:us-east-1:123456789012:mail-queue"
    }
  ]
}
```

### Notificación de Usuario Actualizado

```json
{
  "Records": [
    {
      "body": "{\"to\":\"maria.garcia@company.com\",\"subject\":\"Tu perfil ha sido actualizado\",\"templateId\":\"d-fedcba0987654321\",\"templateData\":{\"firstName\":\"María Elena\",\"lastName\":\"García\",\"previousRole\":\"UserRole\",\"newRole\":\"AdminRole\",\"updatedBy\":\"admin@company.com\",\"timestamp\":\"2024-01-15T10:30:00Z\"}}",
      "messageId": "87654321-4321-4321-4321-210987654321",
      "receiptHandle": "AQEB...",
      "eventSource": "aws:sqs"
    }
  ]
}
```

### Notificación de Usuario Deshabilitado

```json
{
  "Records": [
    {
      "body": "{\"to\":\"carlos.lopez@company.com\",\"subject\":\"Acceso suspendido temporalmente\",\"templateId\":\"d-abcdef1234567890\",\"templateData\":{\"firstName\":\"Carlos\",\"lastName\":\"López\",\"reason\":\"Inactividad prolongada\",\"contactEmail\":\"support@company.com\",\"reactivationUrl\":\"https://reports.company.com/reactivate\"}}",
      "messageId": "11111111-2222-3333-4444-555555555555",
      "receiptHandle": "AQEB...",
      "eventSource": "aws:sqs"
    }
  ]
}
```

### Notificación de Reporte Generado

```json
{
  "Records": [
    {
      "body": "{\"to\":\"analyst@company.com\",\"subject\":\"Reporte financiero disponible\",\"templateId\":\"d-report123456789\",\"templateData\":{\"reportName\":\"Financial Summary Q1 2024\",\"reportType\":\"Financial\",\"generatedBy\":\"admin@company.com\",\"downloadUrl\":\"https://reports.company.com/download/report-123\",\"expiresAt\":\"2024-01-22T10:30:00Z\"}}",
      "messageId": "22222222-3333-4444-5555-666666666666",
      "receiptHandle": "AQEB...",
      "eventSource": "aws:sqs"
    }
  ]
}
```

### Procesamiento por Lotes Mixto

```json
{
  "Records": [
    {
      "body": "{\"to\":\"user1@company.com\",\"subject\":\"Password Reset Request\",\"templateId\":\"d-password-reset\",\"templateData\":{\"firstName\":\"User1\",\"resetUrl\":\"https://reports.company.com/reset/token123\",\"expiresIn\":\"24 hours\"}}",
      "messageId": "msg-001"
    },
    {
      "body": "{\"to\":\"admin@company.com\",\"subject\":\"Weekly System Report\",\"templateId\":\"d-weekly-report\",\"templateData\":{\"totalUsers\":145,\"activeUsers\":132,\"newUsers\":8,\"reportPeriod\":\"Jan 8-14, 2024\"}}",
      "messageId": "msg-002"
    },
    {
      "body": "{\"to\":\"manager@company.com\",\"subject\":\"New User Registration\",\"templateId\":\"d-new-user-notification\",\"templateData\":{\"newUserEmail\":\"newbie@company.com\",\"registeredBy\":\"hr@company.com\",\"role\":\"UserRole\"}}",
      "messageId": "msg-003"
    }
  ]
}
```

## 📧 Configuración de SendGrid

### API Key desde Secrets Manager

```typescript
interface SendGridSecret {
  SENDGRID_API_KEY: string;  // API key de SendGrid
  FROM_EMAIL?: string;       // Email remitente por defecto
  FROM_NAME?: string;        // Nombre remitente por defecto
}
```

### Template Configuration

```typescript
interface SendGridTemplate {
  templateId: string;        // ID del template en SendGrid
  version: string;          // Versión del template (opcional)
  templateData: {
    // Variables dinámicas específicas del template
    [key: string]: any;
  };
}
```


## 📚 Referencias

- [Create Audit Logs](./create-audit-logs.md) - Función relacionada en el mismo repositorio dataflow
- [Admin Users Handler](./admin-users.md) - Genera eventos que pueden resultar en emails
- [SendGrid Documentation](https://docs.sendgrid.com/) - Documentación oficial de SendGrid
- [AWS SQS Documentation](https://docs.aws.amazon.com/sqs/) - Documentación de Amazon SQS
