---
layout: page
title: GeneralLastReportUseCase
---

# GeneralLastReportUseCase

## 📋 Descripción

**Propósito**: Consultar información del último reporte generado por el usuario autenticado para verificar estado y progreso.

**Tipo de Ejecución**: **Síncrono** (WebFlux) - Respuesta inmediata con información del último reporte

**Request Body**: Sin request body (consulta por contexto de autenticación)

## 📊 Campos del Request

| Campo | Tipo | Obligatorio | Validaciones | Valores Permitidos |
|-------|------|-------------|--------------|-------------------|
| `emailAuthentication` | `String` | ✅ Sí | String no vacío (inyectado automáticamente desde el contexto de autenticación) | Email del usuario autenticado |

## 🔍 Validaciones Específicas

### Autenticación requerida

- ✅ `emailAuthentication`: Obtenido automáticamente del contexto de seguridad JWT
- ✅ El usuario debe tener permisos válidos para consultar reportes
- ✅ La consulta solo retorna reportes del usuario autenticado

### Sin parámetros adicionales

- ❌ No requiere parámetros de filtro
- ❌ No requiere fechas
- ❌ No requiere tipos de transacción o cliente
- ✅ Automáticamente filtra por el email de autenticación

## 📤 Response Esperado

### Estructura del Response

```json
{
  "reportId": "string",
  "reportType": "CUSTOMER_PERSONAL | CUSTOMER_BUSINESS | POS_PAYMENT | P2P | P2B | B2C | REFUND | POS_REFUND",
  "status": "PENDING | PROCESSING | COMPLETED | FAILED | EXPIRED",
  "createdDate": "2024-01-15T10:30:00Z",
  "completedDate": "2024-01-15T10:35:00Z",
  "fileName": "report_customer_personal_20240115_103000.xlsx",
  "fileSize": 1048576,
  "downloadUrl": "https://s3.bucket.com/reports/...",
  "expirationDate": "2024-01-22T10:35:00Z",
  "errorMessage": "string (solo si status = FAILED)",
  "requestParameters": {
    "transType": "P2P",
    "transDateFrom": "2024-01-01",
    "transDateTo": "2024-01-15"
  }
}
```

### Estados Posibles

- `PENDING`: Reporte en cola de procesamiento
- `PROCESSING`: Reporte siendo generado
- `COMPLETED`: Reporte completado y disponible para descarga
- `FAILED`: Error en la generación del reporte
- `EXPIRED`: Reporte expirado (no disponible para descarga)

### Casos de respuesta

- **Usuario sin reportes**: Retorna `null` o respuesta vacía
- **Usuario con reportes**: Retorna información del último reporte generado
- **Reporte expirado**: Incluye información pero `downloadUrl` puede estar vacía

## 📝 Ejemplo de Request (Sin Body)

```http
GET /api/reports/last
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

## 📝 Ejemplo de Response Exitoso

```json
{
  "reportId": "rpt_20240115_103000_abc123",
  "reportType": "P2P",
  "status": "COMPLETED",
  "createdDate": "2024-01-15T10:30:00Z",
  "completedDate": "2024-01-15T10:35:00Z",
  "fileName": "report_p2p_transactions_20240115_103000.xlsx",
  "fileSize": 2097152,
  "downloadUrl": "https://s3-reports.bucket.com/reports/rpt_20240115_103000_abc123.xlsx?signed=true",
  "expirationDate": "2024-01-22T10:35:00Z",
  "requestParameters": {
    "transType": "P2P",
    "transDateFrom": "2024-01-01",
    "transDateTo": "2024-01-15",
    "customerStatus": "ACTIVE"
  }
}
```