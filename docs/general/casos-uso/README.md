# Casos de Uso - Reportes Generales

## 📋 Índice de Casos de Uso

Este directorio contiene la documentación detallada de todos los casos de uso del microservicio de reportes generales. Cada caso de uso incluye validaciones específicas, campos obligatorios y opcionales, y ejemplos de request/response.

## 🏢 Casos de Uso de Reportes de Clientes

### 1. [Reporte de Clientes Personas](./general-report-customer-personal.md)
- **UseCase**: `GeneralReportCustomerPersonalUseCase`
- **Request**: `GeneralCustomerReportRequest`
- **Tipo**: Asíncrono
- **Propósito**: Generar reportes de clientes personas naturales con datos personales y de KYC

### 2. [Reporte de Clientes Empresas](./general-report-customer-business.md)
- **UseCase**: `GeneralReportCustomerBusinessUseCase`
- **Request**: `GeneralCustomerReportRequest`
- **Tipo**: Asíncrono
- **Propósito**: Generar reportes de clientes empresariales con datos corporativos y representantes legales

## 💳 Casos de Uso de Reportes de Transacciones

### 3. [Reporte de Pagos POS](./general-report-transaction-pos-payment.md)
- **UseCase**: `GeneralReportTransactionPOSPaymentUseCase`
- **Request**: `GeneralTransactionReportRequest`
- **Tipo**: Asíncrono
- **Propósito**: Generar reportes de transacciones realizadas en puntos de venta (POS)

### 4. [Reporte de Transferencias P2P](./general-report-transaction-p2p.md)
- **UseCase**: `GeneralReportTransactionP2PTransferUseCase`
- **Request**: `GeneralTransactionReportRequest`
- **Tipo**: Asíncrono
- **Propósito**: Generar reportes de transferencias persona a persona

### 5. [Reporte de Transferencias P2B](./general-report-transaction-p2b.md)
- **UseCase**: `GeneralReportTransactionP2BTransferUseCase`
- **Request**: `GeneralTransactionReportRequest`
- **Tipo**: Asíncrono
- **Propósito**: Generar reportes de transferencias persona a negocio

### 6. [Reporte de Transferencias B2C](./general-report-transaction-b2c.md)
- **UseCase**: `GeneralReportTransactionB2CTransferUseCase`
- **Request**: `GeneralTransactionReportRequest`
- **Tipo**: Asíncrono
- **Propósito**: Generar reportes de transferencias negocio a cliente

### 7. [Reporte de Reembolsos](./general-report-transaction-refund.md)
- **UseCase**: `GeneralReportTransactionRefundUseCase`
- **Request**: `GeneralTransactionReportRequest`
- **Tipo**: Asíncrono
- **Propósito**: Generar reportes de reembolsos y devoluciones

### 8. [Reporte de Reembolsos POS](./general-report-transaction-pos-refund.md)
- **UseCase**: `GeneralReportTransactionPOSRefundUseCase`
- **Request**: `GeneralTransactionReportRequest`
- **Tipo**: Asíncrono
- **Propósito**: Generar reportes de reembolsos específicos de transacciones POS

## 🔍 Casos de Uso de Consulta

### 9. [Consulta de Último Reporte](./general-last-report.md)
- **UseCase**: `GeneralLastReportUseCase`
- **Request**: Sin request body (por autenticación)
- **Tipo**: Síncrono
- **Propósito**: Consultar información del último reporte generado por el usuario

### 10. [Descarga de Archivo](./download-file.md)
- **UseCase**: `DownloadFileUseCase`
- **Request**: Path parameter (reportId)
- **Tipo**: Síncrono
- **Propósito**: Descargar archivo de reporte previamente generado

## 📊 Resumen de Request Bodies

### GeneralCustomerReportRequest
- Usado en casos de uso: **1, 2**
- Campos específicos para tipos de cuenta (`PERSONAL`, `BUSINESS`)
- Validaciones específicas según `accountType`

### GeneralTransactionReportRequest
- Usado en casos de uso: **3, 4, 5, 6, 7, 8**
- Campos específicos para tipos de transacción
- Validaciones específicas según `transType`

### Sin Request Body
- Usado en casos de uso: **9, 10**
- Autenticación por JWT y parámetros de URL

## 🔐 Validaciones Comunes

### Todas las operaciones
- ✅ `emailAuthentication`: Obligatorio (inyectado desde JWT)
- ✅ Validación de permisos y roles
- ✅ Rate limiting por usuario

### Operaciones con fechas
- ✅ Formato YYYY-MM-DD
- ✅ Máximo 2 años de diferencia entre fechas
- ✅ No fechas anteriores al año mínimo configurado

### Operaciones asíncronas (1-8)
- ✅ Procesamiento en background
- ✅ Notificación por email al completar
- ✅ Generación de archivo Excel
- ✅ Almacenamiento temporal en S3

### Operaciones síncronas (9-10)
- ✅ Respuesta inmediata
- ✅ Validación de existencia y permisos
- ✅ Control de expiración de archivos

## 📁 Estructura de Archivos Generados

### Nomenclatura de archivos
```
report_{tipo}_{fecha}_{hora}_{id}.xlsx
```

### Ejemplos
- `report_customer_personal_20240115_103000.xlsx`
- `report_transaction_p2p_20240115_103000.xlsx`
- `report_transaction_pos_payment_20240115_103000.xlsx`

## 🗄️ Próximos Pasos

- [ ] Completar queries SQL específicas en cada caso de uso
- [ ] Documentar estructura exacta de archivos Excel generados
- [ ] Añadir ejemplos de respuestas de error para cada caso de uso
- [ ] Documentar enums específicos con todos sus valores posibles
- [ ] Añadir diagramas de flujo para casos de uso complejos
