---
layout: page
title: DownloadFileUseCase
---

## 📋 Descripción

**Propósito**: Descargar archivo de reporte de subpoena previamente generado desde S3, con desencriptación automática del contenido.

**Tipo de Ejecución**: **Síncrono** (WebFlux) - Respuesta inmediata con stream del archivo desencriptado

**Request Body**: Sin request body (parámetros por query string)

## 📊 Parámetros del Request

| Parámetro | Ubicación | Tipo | Obligatorio | Validaciones | Valores Permitidos |
|-----------|-----------|------|-------------|--------------|-------------------|
| `fileName` | Query String | `String` | ✅ Sí | Campo no vacío, debe ser nombre válido de archivo | Ejemplo: `"subpoena_personal_20240115_103000.xlsx"` |
| `username` | Query String | `String` | ✅ Sí | Campo no vacío, usuario autenticado | Email del usuario autenticado |

## 🔍 Validaciones Específicas

### Validaciones en RequestFilterValidator

```java
public Mono<DownloadReportFileRequest> validateFileDownloadRequest(DownloadReportFileRequest request) {
    return Mono.just(request)
            .filter(valid -> commonFunctionalities.isValidField(request.getFilename()))
            .filter(valid -> commonFunctionalities.isValidField(request.getUsername()))
            .switchIfEmpty(Mono.error(new TechnicalException(TECHNICAL_ERROR_REQUEST)))
            .thenReturn(request);
}
```

### Validaciones aplicadas

- ✅ `fileName`: Debe ser un campo válido (no null, no vacío)
- ✅ `username`: Debe ser un campo válido (no null, no vacío)
- ✅ Verificación de existencia del archivo en S3
- ✅ Desencriptación automática con clave del usuario

### Proceso de descarga

1. **Obtención desde S3**: `is3Gateway.getObject(REPORTING_BUCKET_NAME, fileName, username)`
2. **Desencriptación**: `iFileEncryptDecryptGateway.decrypt(bytes, username)`
3. **Log de auditoría**: Registro del evento de descarga en SQS
4. **Respuesta**: Archivo desencriptado en formato binario

## 📝 Ejemplo de Request

```http
GET /api/subpoenas/download?fileName=subpoena_personal_20240115_103000.xlsx&username=user@example.com
Authorization: Bearer <jwt-token>
```

## 📤 Response Esperado

### Descarga exitosa

```json
{
  "fileName": "subpoena_personal_20240115_103000.xlsx",
  "file": "[Binary data of Excel file]"
}
```

### Errores posibles

- **Archivo no encontrado**: Error al obtener archivo desde S3
- **Error de desencriptación**: Fallo en el proceso de desencriptación
- **Parámetros inválidos**: fileName o username vacíos o nulos

## 🔒 Consideraciones de Seguridad

### Encriptación y desencriptación

- Archivos almacenados encriptados en S3
- Desencriptación usando clave específica del usuario
- Log de auditoría para cada descarga

### Control de acceso

- Validación de permisos por usuario
- Verificación de existencia del archivo
- Registro de actividad de descarga
