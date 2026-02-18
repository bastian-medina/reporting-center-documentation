---
layout: page
title: Casos de Uso - Subpoenas
---

# Casos de Uso - Subpoenas

## 📋 Índice de Casos de Uso

Este directorio contiene la documentación detallada de todos los casos de uso del microservicio de subpoenas. Cada caso de uso incluye validaciones específicas, campos obligatorios y opcionales, y ejemplos de request/response.

## 🏢 Casos de Uso de Reportes de Clientes

### 1. [Reporte de Clientes Personales]({{ '/docs/subpoenas/casos-uso/subpoenas-customer-personal-report/' | relative_url }})
- **UseCase**: `SubpoenasCustomerPersonalReportUseCase`
- **Request**: `SubpoenasCustomerRequest`
- **Tipo**: Asíncrono
- **Propósito**: Generar reportes de subpoenas para clientes personas naturales

### 2. [Reporte de Clientes Empresariales]({{ '/docs/subpoenas/casos-uso/subpoenas-customer-business-report/' | relative_url }})
- **UseCase**: `SubpoenasCustomerBusinessReportUseCase`
- **Request**: `SubpoenasCustomerRequest`
- **Tipo**: Asíncrono
- **Propósito**: Generar reportes de subpoenas para clientes empresariales

### 3. [Reporte de Clientes por Fecha de Nacimiento]({{ '/docs/subpoenas/casos-uso/subpoenas-customer-dob-report/' | relative_url }})
- **UseCase**: `SubpoenasCustomerDOBReportUseCase`
- **Request**: `SubpoenasDOBRequest`
- **Tipo**: Asíncrono
- **Propósito**: Generar reportes de subpoenas por fecha de nacimiento específica

## 💳 Casos de Uso de Reportes de Transacciones

### 4. [Reporte de Transacciones Personales]({{ '/docs/subpoenas/casos-uso/subpoenas-transaction-personal-report/' | relative_url }})
- **UseCase**: `SubpoenasTransactionPersonalReportUseCase`
- **Request**: `SubpoenasTransactionRequest`
- **Tipo**: Asíncrono
- **Propósito**: Generar reportes de transacciones para clientes personales (P2P, POS, P2B)

### 5. [Reporte de Transacciones Empresariales]({{ '/docs/subpoenas/casos-uso/subpoenas-transaction-business-report/' | relative_url }})
- **UseCase**: `SubpoenasTransactionBusinessReportUseCase`
- **Request**: `SubpoenasTransactionRequest`
- **Tipo**: Asíncrono
- **Propósito**: Generar reportes de transacciones para clientes empresariales

## 🔍 Casos de Uso de Consulta

### 6. [Consulta de Últimos Reportes]({{ '/docs/subpoenas/casos-uso/subpoenas-last-report/' | relative_url }})
- **UseCase**: `SubpoenasLastReportUseCase`
- **Request**: Query parameters (reportType, username)
- **Tipo**: Síncrono
- **Propósito**: Consultar los últimos reportes generados por usuario y tipo

### 7. [Búsqueda de Reportes]({{ '/docs/subpoenas/casos-uso/subpoenas-search/' | relative_url }})
- **UseCase**: `SubpoenasSearchUseCase`
- **Request**: Query parameters (múltiples filtros)
- **Tipo**: Síncrono
- **Propósito**: Buscar reportes existentes por diferentes criterios

### 8. [Descarga de Archivo]({{ '/docs/subpoenas/casos-uso/download-file/' | relative_url }})
- **UseCase**: `DownloadFileUseCase`
- **Request**: Query parameters (fileName, username)
- **Tipo**: Síncrono
- **Propósito**: Descargar archivo de reporte con desencriptación automática

## 📊 Resumen de Request Bodies

### SubpoenasCustomerRequest
- **Usado en casos de uso**: 1, 2
- **Subtipos**: `PERSONAL`, `BUSINESS`
- **Validaciones específicas**: Según `subType` y filtros mínimos requeridos

### SubpoenasDOBRequest
- **Usado en caso de uso**: 3
- **Subtipo**: `PERSONAL_DOB`
- **Campo único**: `dateOfBirth` obligatorio

### SubpoenasTransactionRequest
- **Usado en casos de uso**: 4, 5
- **Subtipos**: `PERSONAL`, `BUSINESS`
- **Validaciones específicas**: Según `subType` y criterios de búsqueda

### Query Parameters
- **Usado en casos de uso**: 6, 7, 8
- **Sin request body**: Parámetros por URL
- **Validaciones específicas**: Según el endpoint y filtros aplicados

## 🔐 Validaciones Comunes

### Todas las operaciones
- ✅ `username`: Obligatorio (del contexto de autenticación)
- ✅ Validación mediante `RequestFilterValidator`
- ✅ Uso de Jakarta Validation (`@NotNull`, `@NotBlank`)

### Operaciones con fechas
- ✅ Formato YYYY-MM-DD estricto
- ✅ Máximo años entre fechas: configurado en propiedades
- ✅ Validación con patrón regex para fechas

### Operaciones asíncronas (1-5)
- ✅ Procesamiento en background con Schedulers.boundedElastic()
- ✅ Notificación por email al completar
- ✅ Generación de archivo Excel multi-hoja
- ✅ Encriptación y almacenamiento en S3
- ✅ Registro en histórico y auditoría

### Operaciones síncronas (6-8)
- ✅ Respuesta inmediata
- ✅ Validación de permisos y existencia
- ✅ Conversión automática de parámetros JSON

## 🔒 Características de Seguridad

### Encriptación de datos
- **Campos encriptados**: `cardNumber`, `ssnOrEin`
- **Proceso**: Encriptación antes de procesamiento, desencriptación en resultados
- **Clave**: Específica por usuario (`username`)

### Control de acceso
- **Autenticación**: JWT obligatorio en todas las operaciones
- **Autorización**: Filtrado automático por usuario autenticado
- **Auditoría**: Registro de eventos `BUILD_SUBPOENA_REPORT` y descargas

### Almacenamiento seguro
- **S3**: Archivos encriptados con clave de usuario
- **Nomenclatura**: Específica por tipo y identificador único
- **Limpieza**: Gestión automática de archivos temporales

## 📁 Estructura de Archivos Generados

### Nomenclatura por tipo
```
subpoena_{subtype}_{identifier}_{reporttype}_{timestamp}.xlsx
```

### Ejemplos
- **Personal**: `subpoena_personal_8095551234_customer_20240115_103000.xlsx`
- **Business**: `subpoena_business_empresa-abc_transaction_20240115_103000.xlsx`
- **DOB**: `subpoena_dob_01_15_1990_20240115_103000.xlsx`

### Hojas Excel por caso de uso
- **Customer Personal/Business**: 1 hoja con datos del cliente
- **Transaction Personal**: 4 hojas (P2P, P2B, POS, User Info)
- **Transaction Business**: 2 hojas (Business Transactions, Business Info)
- **DOB**: 1 hoja con datos de usuarios

## ⚠️ Diferencias Clave entre Subtipos

### PERSONAL vs BUSINESS
| Característica | PERSONAL | BUSINESS |
|----------------|----------|----------|
| Campo único | `phoneNumber` | `path` |
| Filtros específicos | Teléfono, fecha nacimiento | Nombre empresa, path |
| Validaciones | Nombres completos o vacíos | Path empresarial |
| Nomenclatura archivos | Usa teléfono | Usa path |

### Transacciones: Lógica condicional
- **Con transactionId**: Fechas opcionales
- **Sin transactionId**: Fechas obligatorias  
- **Rango máximo**: 2 años entre fechas
- **Tipos de transacción**: P2P, POS, P2B (solo para PERSONAL)

## 🗄️ Próximos Pasos

- [ ] Completar queries SQL específicas en cada caso de uso
- [ ] Documentar estructura exacta de hojas Excel por caso de uso
- [ ] Añadir diagramas de flujo para validaciones complejas
- [ ] Documentar enums con todos sus valores posibles
- [ ] Crear ejemplos de respuestas de error para cada validación
- [ ] Documentar configuraciones específicas de propiedades
