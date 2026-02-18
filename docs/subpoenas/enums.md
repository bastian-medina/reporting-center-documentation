---
layout: page
title: Enums - Subpoenas
---

## 📋 Descripción

Este documento contiene todos los valores posibles de los enums utilizados en el microservicio de subpoenas.

## 🏢 SubpoenasCustomerReportSubTypeEnum

**Propósito**: Define los subtipos de reportes de clientes para subpoenas.

**Uso**: Campo `subType` en `SubpoenasCustomerRequest` y `SubpoenasDOBRequest`

| Valor | Descripción |
|-------|-------------|
| `PERSONAL` | Reporte de cliente persona natural |
| `BUSINESS` | Reporte de cliente empresarial |
| `PERSONAL_DOB` | Reporte de cliente por fecha de nacimiento específica |

**Ejemplo de uso**:
```json
{
  "subType": "PERSONAL"
}
```

## 💳 SubpoenasTransactionReportSubTypeEnum

**Propósito**: Define los subtipos de reportes de transacciones para subpoenas.

**Uso**: Campo `subType` en `SubpoenasTransactionRequest`

| Valor | Descripción |
|-------|-------------|
| `PERSONAL` | Reporte de transacciones de cliente persona natural |
| `BUSINESS` | Reporte de transacciones de cliente empresarial |

**Ejemplo de uso**:
```json
{
  "subType": "BUSINESS"
}
```

## 📊 SubpoenasReportTypeEnum

**Propósito**: Define los tipos principales de reportes de subpoenas.

**Uso**: Parámetro `reportType` en consultas de último reporte y búsquedas

| Valor | Descripción |
|-------|-------------|
| `CUSTOMER` | Reportes relacionados con datos de clientes |
| `TRANSACTION` | Reportes relacionados con transacciones |

**Ejemplo de uso**:
```http
GET /api/subpoenas/last-report?reportType=CUSTOMER&username=admin@example.com
```

## 🔄 SubpoenasReportStatusEnum

**Propósito**: Define los estados posibles de los reportes de subpoenas.

**Uso**: Estado interno de reportes, visible en consultas y búsquedas

| Valor | Descripción |
|-------|-------------|
| `IN PROGRESS` | Reporte en proceso de generación |
| `COMPLETED` | Reporte completado y disponible para descarga |
| `FAILED` | Error en la generación del reporte |

**Ejemplo en response**:
```json
{
  "status": "COMPLETED",
  "fileName": "subpoena_personal_20240115_103000.xlsx"
}
```

## 📝 Notas Importantes

### Diferencias entre Customer y Transaction SubTypes

#### Para CUSTOMER (`SubpoenasCustomerReportSubTypeEnum`)
- ✅ `PERSONAL`: Datos personales, KYC, información de contacto
- ✅ `BUSINESS`: Datos empresariales, representantes legales
- ✅ `PERSONAL_DOB`: Búsqueda específica por fecha de nacimiento

#### Para TRANSACTION (`SubpoenasTransactionReportSubTypeEnum`)
- ✅ `PERSONAL`: Transacciones P2P, POS, P2B para personas naturales
- ✅ `BUSINESS`: Transacciones empresariales y corporativas

### Estados del ciclo de vida del reporte

1. **IN PROGRESS**: El reporte se está generando en background
2. **COMPLETED**: El reporte está listo y el archivo está disponible en S3
3. **FAILED**: Ocurrió un error durante la generación

### Validaciones en RequestFilterValidator

```java
// Validación de SubType para Customer
public static boolean isValidSubTypeEnum(String value) {
    for (SubpoenasCustomerReportSubTypeEnum valueEnum : SubpoenasCustomerReportSubTypeEnum.values()) {
        if (valueEnum.getValue().equals(value)) {
            return true;
        }
    }
    return false;
}

// Validación de ReportType
public static boolean isValidSubpoenaReportTypeEnum(String value) {
    for (SubpoenasReportTypeEnum valueEnum : SubpoenasReportTypeEnum.values()) {
        if (valueEnum.getValue().equals(value)) {
            return true;
        }
    }
    return false;
}
```

### Casos de uso por enum

#### `PERSONAL` (Customer)
- **UseCase**: `SubpoenasCustomerPersonalReportUseCase`
- **Filtros**: phoneNumber, firstName, lastName, email, ssnOrEin, cardNumber
- **Validaciones**: Teléfono solo dígitos, nombres completos o vacíos

#### `BUSINESS` (Customer)  
- **UseCase**: `SubpoenasCustomerBusinessReportUseCase`
- **Filtros**: path, businessName, firstName, lastName, email, ssnOrEin, cardNumber
- **Validaciones**: Path empresarial obligatorio para búsqueda

#### `PERSONAL_DOB` (Customer)
- **UseCase**: `SubpoenasCustomerDOBReportUseCase`
- **Filtros**: dateOfBirth (obligatorio)
- **Validaciones**: Formato YYYY-MM-DD, conversión automática a MM/dd/yyyy

#### `PERSONAL` (Transaction)
- **UseCase**: `SubpoenasTransactionPersonalReportUseCase`  
- **Hojas Excel**: P2P, P2B, POS, User Information
- **Validaciones**: Requiere phoneNumber, cardNumber o transactionId

#### `BUSINESS` (Transaction)
- **UseCase**: `SubpoenasTransactionBusinessReportUseCase`
- **Hojas Excel**: Business Transactions, Business Information
- **Validaciones**: Requiere path, cardNumber o transactionId
