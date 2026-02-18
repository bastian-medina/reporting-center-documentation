---
layout: page
title: Casos de Uso - Microservicio Reportes Generales
---

## 📋 Descripción General

Este documento describe todos los casos de uso implementados en el microservicio de reportes generales (`athmrc-dev-reporting-general`), incluyendo su propósito, tipo de ejecución (síncrono/asíncrono) y validaciones del request body.

## 🏗️ Arquitectura de Casos de Uso

El microservicio utiliza **Spring WebFlux** (programación reactiva) con **Clean Architecture**. Todos los casos de uso retornan `Mono<T>` para procesamiento asíncrono no bloqueante.

## 📊 Casos de Uso de Reportes de Clientes

### 1. GeneralReportCustomerPersonalUseCase

**Propósito**: Generar reportes de clientes personales con información demográfica, estados de tarjetas, fechas de registro y datos de login.

**Tipo de Ejecución**: **Asíncrono** (WebFlux) - Procesamiento en background con notificación por email

**Request Body**: `GeneralCustomerReportRequest`

**Validaciones del Body**:
```java
// Validaciones básicas (Jakarta Validation)
@NotNull GeneralReportAccountTypeEnum accountType = PERSONAL
@Valid String emailAuthentication  // Inyectado desde contexto

// Validaciones personalizadas (RequestFilterValidator)
- RSA Status: GeneralReportRSAStatusEnum válido (opcional)
- Card Status: Lista de strings numéricas (opcional) 
- Customer Status: Lista de strings numéricas (opcional)
- Fraud Status: GeneralReportCustomerFraudStatus válido (opcional)
- Phone Number Status: String numérica (opcional)
- Last Login After/Before: GeneralReportAfterBefore válido (opcional)
- Profit: No aplica para PERSONAL (debe ser null)
- Category: No aplica para PERSONAL (debe ser null)
- Registration Date Range: Formato YYYY-MM-DD, máximo MAX_YEARS_SEARCHING años
- Unregistered Date Range: Formato YYYY-MM-DD (opcional)
- Institution: String válido (opcional)
```

---

### 2. GeneralReportCustomerBusinessUseCase

**Propósito**: Generar reportes de clientes empresariales con información de negocios, categorías, rentabilidad y datos específicos de empresas.

**Tipo de Ejecución**: **Asíncrono** (WebFlux) - Procesamiento en background con notificación por email

**Request Body**: `GeneralCustomerReportRequest`

**Validaciones del Body**:
```java
// Validaciones básicas
@NotNull GeneralReportAccountTypeEnum accountType = BUSINESS
@Valid String emailAuthentication

// Validaciones específicas para BUSINESS
- Card Status: GeneralReportCardStatusEnum válido (opcional)
- Customer Status: GeneralReportCustomerStatusEnum válido (opcional) 
- Profit: GeneralReportYesORNoBusinessEnum válido (opcional)
- Category: Lista de strings con patrón [a-zA-Z &\\-]+ (opcional)
- Phone Number Status: No aplica para BUSINESS (debe ser null)
- Fraud Status: No aplica para BUSINESS (debe ser null)
- Fechas: Mismas validaciones que PERSONAL
```

---

## 📈 Casos de Uso de Reportes de Transacciones

### 3. GeneralReportTransactionPOSPaymentUseCase

**Propósito**: Generar reportes de transacciones de pagos POS (Point of Sale) con detalles de comercios, montos y estados.

**Tipo de Ejecución**: **Asíncrono** (WebFlux) - Procesamiento en background

**Request Body**: `GeneralTransactionReportRequest`

**Validaciones del Body**:
```java
// Validaciones básicas
@NotNull GeneralReportTransTypeEnum transType = POS_PAYMENT
@Valid String emailAuthentication

// Validaciones específicas para POS_PAYMENT
- Transaction Date Range: Formato YYYY-MM-DD, máximo MAX_YEARS_BETWEEN_TRANSACTION_REPORT
- Primary Card: GeneralReportYesORNoBusinessEnum válido (opcional)
- Institution: String válido (opcional)
- Transaction Status: GeneralReportTransactionTypePOS válido (opcional)
- Customer Status: String numérica (opcional)
- Primary Phone: No aplica para POS_PAYMENT (debe ser null)
- Channel: No aplica para POS_PAYMENT (debe ser null)
- Last Login After/Before: GeneralReportAfterBefore válido (opcional)
```
---

### 4. GeneralReportTransactionPOSRefundUseCase

**Propósito**: Generar reportes de devoluciones POS con información de transacciones originales y montos devueltos.

**Tipo de Ejecución**: **Asíncrono** (WebFlux)

**Request Body**: `GeneralTransactionReportRequest`

**Validaciones del Body**:
```java
// Validaciones específicas para POS_REFUND
@NotNull GeneralReportTransTypeEnum transType = POS_REFUND
- Transaction Status: GeneralReportTransactionTypePOS válido (opcional)
- Primary Phone: No aplica para POS_REFUND (debe ser null)
- Channel: No aplica para POS_REFUND (debe ser null)
- Otras validaciones iguales a POS_PAYMENT
```

---

### 5. GeneralReportTransactionP2PTransferUseCase

**Propósito**: Generar reportes de transferencias persona a persona (P2P) con datos de remitente, receptor y montos.

**Tipo de Ejecución**: **Asíncrono** (WebFlux)

**Request Body**: `GeneralTransactionReportRequest`

**Validaciones del Body**:
```java
// Validaciones específicas para P2P
@NotNull GeneralReportTransTypeEnum transType = P2P
- Transaction Status: String numérica (opcional)
- Customer Status: String numérica (opcional)
- Primary Phone: GeneralReportYesORNoBusinessEnum válido (opcional)
- Channel: String numérica válida (opcional)
```


---

### 6. GeneralReportTransactionP2BTransferUseCase

**Propósito**: Generar reportes de transferencias persona a negocio (P2B) con información de comercios receptores.

**Tipo de Ejecución**: **Asíncrono** (WebFlux)

**Request Body**: `GeneralTransactionReportRequest`

**Validaciones del Body**:
```java
// Validaciones específicas para P2B
@NotNull GeneralReportTransTypeEnum transType = P2B
- Transaction Status: GeneralRerportTransactionTypeBusiness válido (opcional)
- Customer Status: GeneralReportCustomerStatusEnum válido (opcional)
- Primary Phone: No aplica para P2B (debe ser null)
- Channel: String numérica válida (opcional)
```

---

### 7. GeneralReportTransactionB2CTransferUseCase

**Propósito**: Generar reportes de transferencias negocio a cliente (B2C) como devoluciones o pagos empresariales.

**Tipo de Ejecución**: **Asíncrono** (WebFlux)

**Request Body**: `GeneralTransactionReportRequest`

**Validaciones del Body**:
```java
// Validaciones específicas para B2C
@NotNull GeneralReportTransTypeEnum transType = B2C
- Transaction Status: GeneralRerportTransactionTypeBusiness válido (opcional)
- Customer Status: GeneralReportCustomerStatusEnum válido (opcional)
- Primary Phone: No aplica para B2C (debe ser null)
- Channel: String numérica válida (opcional)
```


---

### 8. GeneralReportTransactionRefundUseCase

**Propósito**: Generar reportes de devoluciones generales del sistema con detalles de transacciones revertidas.

**Tipo de Ejecución**: **Asíncrono** (WebFlux)

**Request Body**: `GeneralTransactionReportRequest`

**Validaciones del Body**:
```java
// Validaciones específicas para REFUND
@NotNull GeneralReportTransTypeEnum transType = REFUND
- Transaction Status: GeneralRerportTransactionTypeBusiness válido (opcional)
- Primary Phone: No aplica para REFUND (debe ser null)
- Channel: No aplica para REFUND (debe ser null)
- Customer Status: Depende del contexto de la devolución
```


---

## 📋 Casos de Uso de Consulta y Descarga

### 9. GeneralLastReportUseCase

**Propósito**: Obtener los últimos reportes generados por un usuario con filtros por tipo (CUSTOMER/TRANSACTION).

**Tipo de Ejecución**: **Síncrono** (WebFlux) - Respuesta inmediata desde DynamoDB

**Request**: Query Parameters

**Validaciones del Request**:
```java
// Query Parameters
@NotNull String reportType // "CUSTOMER" | "TRANSACTION"
@Valid String emailAuthentication // Desde contexto

// Validaciones
- reportType: GeneralReportTypeEnum válido (CUSTOMER, TRANSACTION)
- emailAuthentication: String no vacío
```

---

### 10. DownloadFileUseCase

**Propósito**: Descargar archivos de reportes encriptados desde S3 con desencriptación automática.

**Tipo de Ejecución**: **Síncrono** (WebFlux) - Streaming de archivo

**Request**: Query Parameters

**Validaciones del Request**:
```java
// Query Parameters  
@NotNull String fileName // Nombre del archivo en S3
@Valid String emailAuthentication // Desde contexto

// Validaciones
- fileName: String no vacío y válido
- emailAuthentication: String no vacío
- Verificación de permisos de acceso al archivo
```
---

## 🔄 Flujo de Procesamiento Asíncrono

### Patrón Común de Reportes Asíncronos

El flujo de procesamiento asíncrono sigue estos pasos:

1. **Request Validation** - Validación del request
2. **Save Initial Record** - Guardar registro inicial
3. **Return Async Response** - Retornar respuesta asíncrona
4. **Background Processing** - Procesamiento en segundo plano
5. **Data Query & Decryption** - Consulta de datos y desencriptación
6. **Excel Generation** - Generación del archivo Excel
7. **File Encryption** - Encriptación del archivo
8. **S3 Upload** - Subida a S3
9. **Send Audit Log** - Envío de log de auditoría
10. **Update Record Status** - Actualización del estado del registro
11. **Send Email Notification** - Envío de notificación por email

### Estados de Reportes

- **IN_PROGRESS**: Reporte iniciado, procesando en background
- **COMPLETED**: Reporte generado exitosamente, archivo disponible
- **FAILED**: Error en la generación, revisar logs

## 📊 Configuración y Parámetros

### Variables de Configuración para Validaciones

```properties
# Rangos de fechas permitidos
report.general.dates.max_years_between_customer_report=5
report.general.dates.max_years_between_transaction_report=2  
report.general.dates.min_year_of_data_available=2020

# Bucket S3 para reportes
adapter.aws.s3.bucketName=athm-dev-anl-general-reports
```

### Enums de Validación Principales

- `GeneralReportAccountTypeEnum`: PERSONAL, BUSINESS
- `GeneralReportTransTypeEnum`: POS_PAYMENT, POS_REFUND, P2P, P2B, B2C, REFUND
- `GeneralReportCardStatusEnum`: Estados de tarjetas
- `GeneralReportCustomerStatusEnum`: Estados de clientes  
- `GeneralReportRSAStatusEnum`: Estados RSA de seguridad
- `GeneralReportYesORNoBusinessEnum`: YES, NO para filtros booleanos

## 🔐 Consideraciones de Seguridad

### Encriptación de Datos

- **Datos sensibles encriptados**: Números de tarjeta, teléfonos, información PII
- **Archivos encriptados**: Todos los reportes se almacenan encriptados en S3
- **Desencriptación**: Se realiza durante la consulta y descarga con credenciales del usuario

### Auditoría

- **Logs de generación**: `AuditLogsEventEnum.BUILD_GENERAL_REPORT`
- **Logs de descarga**: `AuditLogsEventEnum.DOWNLOAD_REPORT`
- **Notificaciones SQS**: Audit logs y email notifications asíncronas

## 📚 Dependencias Principales

- **Spring WebFlux**: Programación reactiva
- **Jakarta Validation**: Validaciones de request
- **AWS S3**: Almacenamiento de archivos
- **DynamoDB**: Reportes históricos
- **SQS**: Notificaciones asíncronas
- **Redshift**: Queries de datos principales
- **Apache POI**: Generación de archivos Excel
