# Enums - Reportes Generales

## 📋 Descripción

Este documento contiene todos los valores posibles de los enums utilizados en el microservicio de reportes generales.

## 🔄 GeneralReportTransTypeEnum

**Propósito**: Define los tipos de transacciones para reportes generales.

**Uso**: Campo `transType` en `GeneralTransactionReportRequest`

| Valor | Descripción |
|-------|-------------|
| `ANY` | Cualquier tipo de transacción |
| `P2P` | Transferencias persona a persona |
| `BALANCE_INQUIRY` | Consultas de balance |
| `P2B` | Transferencias persona a negocio |
| `REFUND` | Reembolsos y devoluciones |
| `POS_PAYMENT` | Pagos en puntos de venta |
| `POS_REFUND` | Reembolsos de POS |
| `RECHARGES` | Recargas de saldo |

**Ejemplo de uso**:

```json
{
  "transType": "P2P",
  "transDateFrom": "2024-01-01",
  "transDateTo": "2024-12-31"
}
```

## 🏢 GeneralReportAccountTypeEnum

**Propósito**: Define los tipos de cuenta para reportes de clientes.

**Uso**: Campo `accountType` en `GeneralCustomerReportRequest`

| Valor | Descripción |
|-------|-------------|
| `PERSONAL` | Cuenta de persona natural |
| `BUSINESS` | Cuenta empresarial |

**Ejemplo de uso**:

```json
{
  "accountType": "PERSONAL",
  "regDateFrom": "2024-01-01",
  "regDateTo": "2024-12-31"
}
```

## 👤 GeneralReportCustomerStatusEnum

**Propósito**: Define los estados posibles de clientes en el sistema.

**Uso**: Campo `customerStatus` en `GeneralCustomerReportRequest` y `GeneralTransactionReportRequest`

| Valor | Descripción |
|-------|-------------|
| `ANY` | Cualquier estado de cliente |
| `ACTIVE` | Cliente activo |
| `TEMPORARY` | Cliente temporal |
| `UNREGISTERED` | Cliente no registrado |
| `LOCKED` | Cliente bloqueado |
| `RESET_PASSWORD` | Cliente con reset de contraseña pendiente |
| `DISABLED` | Cliente deshabilitado |
| `DISABLED_FRAUD` | Cliente deshabilitado por fraude |
| `NOT_FOUND` | Cliente no encontrado |
| `PENDING_REGAIN_ACCESS_VERIFICATION` | Cliente pendiente de verificación para recuperar acceso |
| `EMPTY` | Valor vacío (equivale a no filtrar) |

**Ejemplo de uso**:

```json
{
  "customerStatus": "ACTIVE",
  "accountType": "PERSONAL"
}
```

## 💳 GeneralReportCardStatusEnum

**Propósito**: Define los estados posibles de las tarjetas en el sistema.

**Uso**: Campo `cardStatus` en `GeneralCustomerReportRequest` y `GeneralTransactionReportRequest`

| Valor | Descripción |
|-------|-------------|
| `ANY` | Cualquier estado de tarjeta |
| `ACTIVE` | Tarjeta activa |
| `INACTIVE` | Tarjeta inactiva |
| `NEW` | Tarjeta nueva |
| `DELETED` | Tarjeta eliminada |
| `EMPTY` | Valor vacío (equivale a no filtrar) |

**Ejemplo de uso**:

```json
{
  "cardStatus": "ACTIVE",
  "primaryCard": "YES"
}
```

## 🔐 GeneralReportRSAStatusEnum

**Propósito**: Define los estados RSA (autenticación de dos factores) de los clientes.

**Uso**: Campo `rsaStatus` en `GeneralCustomerReportRequest` y `GeneralTransactionReportRequest`

| Valor | Descripción |
|-------|-------------|
| `ANY` | Cualquier estado RSA |
| `ACTIVE` | RSA activo |
| `BLOCKED` | RSA bloqueado |
| `ENROLLMENT_REQUIRED` | Requiere inscripción RSA |
| `EMPTY` | Valor vacío (equivale a no filtrar) |

**Ejemplo de uso**:

```json
{
  "rsaStatus": "ACTIVE",
  "customerStatus": "ACTIVE"
}
```

## 📊 GeneralReportStatusEnum

**Propósito**: Define los estados posibles de las transacciones.

**Uso**: Campo `transStatus` en `GeneralTransactionReportRequest`

| Valor | Descripción |
|-------|-------------|
| `ANY` | Cualquier estado de transacción |
| `PENDING_TRANSFER` | Transferencia pendiente |
| `COMPLETE` | Transacción completada |
| `PENDING_REGISTRATION` | Pendiente de registro |
| `CANCELLED` | Transacción cancelada |
| `FAILED` | Transacción fallida |
| `EXPIRED` | Transacción expirada |
| `IN_PROCESS_BTRANS` | En proceso (transacción empresarial) |
| `EMPTY` | Valor vacío (equivale a no filtrar) |

**Ejemplo de uso**:

```json
{
  "transStatus": "COMPLETE",
  "transType": "P2P"
}
```

## 📋 GeneralReportTypeEnum

**Propósito**: Define los tipos principales de reportes generales.

**Uso**: Parámetro `reportType` en consultas de último reporte

| Valor | Descripción |
|-------|-------------|
| `CUSTOMER` | Reportes de datos de clientes |
| `TRANSACTION` | Reportes de transacciones |

**Ejemplo de uso**:

```http
GET /api/reports/last?reportType=TRANSACTION&username=admin@example.com
```

## 📝 Casos de Uso por Tipo de Transacción

### P2P (Persona a Persona)

- **UseCase**: `GeneralReportTransactionP2PTransferUseCase`
- **Características**: Transferencias entre usuarios individuales
- **Campos específicos**: `primaryPhone` permitido

### POS_PAYMENT (Pagos POS)

- **UseCase**: `GeneralReportTransactionPOSPaymentUseCase`
- **Características**: Pagos en terminales de punto de venta
- **Campos específicos**: `primaryCard` es relevante

### P2B (Persona a Negocio)

- **UseCase**: `GeneralReportTransactionP2BTransferUseCase`
- **Características**: Pagos desde personas hacia empresas
- **Campos específicos**: `primaryPhone` permitido

### B2C (Negocio a Cliente)

- **UseCase**: `GeneralReportTransactionB2CTransferUseCase`
- **Características**: Pagos desde empresas hacia clientes
- **Campos específicos**: `primaryPhone` NO permitido

### REFUND (Reembolsos)

- **UseCase**: `GeneralReportTransactionRefundUseCase`
- **Características**: Reembolsos y devoluciones generales
- **Campos específicos**: `primaryPhone` permitido

### POS_REFUND (Reembolsos POS)

- **UseCase**: `GeneralReportTransactionPOSRefundUseCase`
- **Características**: Reembolsos específicos de transacciones POS
- **Campos específicos**: `primaryCard` es especialmente relevante

## ⚠️ Validaciones Específicas por Enum

### Validaciones en RequestFilterValidator

```java
// Validación de Customer Status
public static boolean isValidGeneralReportCustomerStatusEnum(String value) {
    for (GeneralReportCustomerStatusEnum valueEnum : GeneralReportCustomerStatusEnum.values()) {
        if (valueEnum.getValue().equals(value)) {
            return true;
        }
    }
    return false;
}

// Validación de Card Status  
public static boolean isValidGeneralReportCardStatusEnum(String value) {
    for (GeneralReportCardStatusEnum valueEnum : GeneralReportCardStatusEnum.values()) {
        if (valueEnum.getValue().equals(value)) {
            return true;
        }
    }
    return false;
}

// Validación de RSA Status
public static boolean isValidGeneralReportRSAStatusEnum(String value) {
    for (GeneralReportRSAStatusEnum valueEnum : GeneralReportRSAStatusEnum.values()) {
        if (valueEnum.getValue().equals(value)) {
            return true;
        }
    }
    return false;
}

// Validación de Transaction Status
public static boolean isValidGeneralReportStatusEnum(String value) {
    for (GeneralReportStatusEnum valueEnum : GeneralReportStatusEnum.values()) {
        if (valueEnum.getValue().equals(value)) {
            return true;
        }
    }
    return false;
}
```

### Diferencias clave entre PERSONAL y BUSINESS

#### Para PERSONAL (`GeneralReportAccountTypeEnum.PERSONAL`)

- ✅ Campos permitidos: `primaryPhone`
- ✅ Validaciones específicas para personas naturales
- ✅ Filtros por teléfono principal

#### Para BUSINESS (`GeneralReportAccountTypeEnum.BUSINESS`)

- ❌ Campo `primaryPhone` NO permitido
- ✅ Validaciones específicas para empresas
- ✅ Filtros empresariales especializados

### Valores especiales

#### `ANY` y `EMPTY`

- **`ANY`**: Significa "incluir todos los valores posibles"
- **`EMPTY`**: Significa "no aplicar filtro" (equivale a null)
- **Diferencia**: `ANY` es explícito, `EMPTY` es ausencia de filtro

#### Estados críticos

- **`DISABLED_FRAUD`**: Cliente deshabilitado por actividad fraudulenta
- **`PENDING_REGAIN_ACCESS_VERIFICATION`**: Proceso de recuperación de cuenta
- **`IN_PROCESS_BTRANS`**: Estado específico para transacciones empresariales

## 📊 Matriz de Compatibilidad

| TransType | primaryPhone | primaryCard | Enum Status Usado |
|-----------|--------------|-------------|-------------------|
| `P2P` | ✅ Permitido | ✅ Relevante | `GeneralReportStatusEnum` |
| `POS_PAYMENT` | ❌ No permitido | ✅ Muy relevante | `GeneralReportStatusEnum` |
| `P2B` | ✅ Permitido | ✅ Relevante | `GeneralRerportTransactionTypeBusiness` |
| `B2C` | ❌ No permitido | ✅ Relevante | `GeneralRerportTransactionTypeBusiness` |
| `REFUND` | ✅ Permitido | ✅ Relevante | `GeneralRerportTransactionTypeBusiness` |
| `POS_REFUND` | ✅ Permitido | ✅ Muy relevante | `GeneralReportTransactionStatusEnum` |
