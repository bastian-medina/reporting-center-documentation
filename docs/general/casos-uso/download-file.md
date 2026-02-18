# DownloadFileUseCase

## 📋 Descripción

**Propósito**: Descargar archivo de reporte previamente generado usando el ID del reporte o URL de descarga.

**Tipo de Ejecución**: **Síncrono** (WebFlux) - Respuesta inmediata con stream del archivo o redirección

**Request Body**: Sin request body (consulta por parámetro de URL)

## 📊 Parámetros del Request

| Parámetro | Ubicación | Tipo | Obligatorio | Validaciones | Valores Permitidos |
|-----------|-----------|------|-------------|--------------|-------------------|
| `reportId` | Path Parameter | `String` | ✅ Sí | String no vacío, formato válido de ID de reporte | Ejemplo: `"rpt_20240115_103000_abc123"` |
| `emailAuthentication` | Context | `String` | ✅ Sí | String no vacío (inyectado automáticamente desde el contexto de autenticación) | Email del usuario autenticado |

## 🔍 Validaciones Específicas

### Autenticación y autorización

- ✅ `emailAuthentication`: Obtenido automáticamente del contexto de seguridad JWT
- ✅ El usuario debe ser el propietario del reporte (creado por el mismo email)
- ✅ El usuario debe tener permisos válidos para descargar reportes

### Validaciones del reporte

- ✅ `reportId`: Debe existir en la base de datos
- ✅ El reporte debe estar en estado `COMPLETED`
- ✅ El reporte no debe estar expirado
- ✅ El archivo debe estar disponible en S3
- ✅ El usuario autenticado debe ser el propietario del reporte

### Estados que impiden la descarga

- ❌ `PENDING`: Reporte aún no procesado
- ❌ `PROCESSING`: Reporte en proceso de generación
- ❌ `FAILED`: Reporte falló en la generación
- ❌ `EXPIRED`: Reporte expirado (archivo eliminado)

## 📤 Response Esperado

### Descarga exitosa

```http
HTTP/1.1 200 OK
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="report_p2p_transactions_20240115_103000.xlsx"
Content-Length: 2097152

[Binary data of Excel file]
```

### Redirección a S3 (alternativa)

```http
HTTP/1.1 302 Found
Location: https://s3-reports.bucket.com/reports/rpt_20240115_103000_abc123.xlsx?signed=true&expires=1641384000
```

### Errores posibles

#### Reporte no encontrado

```json
{
  "error": "REPORT_NOT_FOUND",
  "message": "Report with ID 'rpt_invalid_123' not found",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Reporte no disponible

```json
{
  "error": "REPORT_NOT_AVAILABLE",
  "message": "Report is not ready for download. Current status: PROCESSING",
  "status": "PROCESSING",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Reporte expirado

```json
{
  "error": "REPORT_EXPIRED",
  "message": "Report has expired and is no longer available for download",
  "expirationDate": "2024-01-08T10:35:00Z",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Sin permisos

```json
{
  "error": "UNAUTHORIZED",
  "message": "You don't have permission to download this report",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 📝 Ejemplo de Request

```http
GET /api/reports/download/rpt_20240115_103000_abc123
Authorization: Bearer <jwt-token>
Accept: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
```

## 📝 Ejemplo de Response Headers Exitoso

```http
HTTP/1.1 200 OK
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="report_p2p_transactions_20240115_103000.xlsx"
Content-Length: 2097152
Cache-Control: no-cache, no-store, must-revalidate
Pragma: no-cache
Expires: 0
X-Report-Type: P2P
X-Generated-Date: 2024-01-15T10:35:00Z
```


## 🔒 Consideraciones de Seguridad

### Control de acceso

- Verificación de propietario del reporte
- Validación de token JWT
- Registro de actividad de descarga
- Rate limiting por usuario

### Protección de datos

- URLs firmadas con tiempo de expiración
- Headers de seguridad (no-cache, no-store)
- Validación de integridad del archivo
- Logs de auditoría para descargas

### Gestión de archivos

- Limpieza automática de archivos expirados
- Verificación de existencia en S3 antes de descarga
- Manejo de errores de conectividad con S3
- Backup y recuperación de archivos críticos
