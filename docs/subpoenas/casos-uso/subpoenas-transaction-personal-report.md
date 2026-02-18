---
layout: page
title: SubpoenasTransactionPersonalReportUseCase
---

## 📋 Descripción

**Propósito**: Generar reportes de subpoenas para transacciones de clientes personales incluyendo P2P, POS, P2B y datos de usuario.

**Tipo de Ejecución**: **Asíncrono** (WebFlux) - Procesamiento en background con notificación por email

**Request Body**: `SubpoenasTransactionRequest`

## 📊 Campos del Request Body

| Campo | Tipo | Obligatorio | Validaciones | Valores Permitidos |
|-------|------|-------------|--------------|-------------------|
| `subType` | `SubpoenasTransactionReportSubTypeEnum` | ✅ Sí | `@NotNull`, debe ser `PERSONAL` | `PERSONAL` (fijo para este caso de uso) |
| `username` | `String` | ✅ Sí | `@NotBlank` | Email del usuario autenticado |
| `transDateFrom` | `String` | ❌ No* | Formato YYYY-MM-DD | Ejemplo: `"2024-01-01"` |
| `transDateTo` | `String` | ❌ No* | Formato YYYY-MM-DD | Ejemplo: `"2024-12-31"` |
| `phoneNumber` | `String` | ❌ No | String no vacío | Ejemplo: `"8095551234"` |
| `targetPhoneNumber` | `String` | ❌ No | String no vacío | Ejemplo: `"8095554321"` |
| `firstName` | `String` | ❌ No | String válido | Ejemplo: `"Juan"` |
| `lastName` | `String` | ❌ No | String válido | Ejemplo: `"Pérez"` |
| `email` | `String` | ❌ No | String válido | Ejemplo: `"user@example.com"` |
| `transactionId` | `String` | ❌ No | String válido | Ejemplo: `"TXN123456789"` |
| `cardNumber` | `String` | ❌ No | Mínimo 16 dígitos | Ejemplo: `"1234567812345678"` |
| `businessName` | `String` | ❌ No | **NO aplica para PERSONAL** - debe ser null | `null` |
| `path` | `String` | ❌ No | **NO aplica para PERSONAL** - debe ser null | `null` |

## 🔍 Validaciones Específicas en RequestFilterValidator

### Validaciones para transacciones PERSONAL

```java
public Mono<SubpoenasTransactionRequest> validateSubpoenasTransactionRequest(SubpoenasTransactionRequest request) {
    boolean hasTransactionId = hasTransactionId(request);
    boolean hasValidCardNumber = hasCardNumberValid(request);
    boolean isPersonalSubType = isPersonalSubType(request);
    boolean isBusinessSubType = isBusinessSubType(request);

    boolean isValidPersonalSearch = hasValidCardNumber || hasTransactionId || (isValidPhoneNumber(request) && isPersonalSubType);
    boolean isValidBusinessSearch = hasValidCardNumber || hasTransactionId || (isValidPath(request) && isBusinessSubType);

    boolean isValidDate = validateDateWhenThereisntATransactionId(request);
    boolean isValidDateRange = isWithinTwoYears(request);

    // Validaciones adicionales...
}
```

### Validaciones específicas aplicadas

- ✅ **Búsqueda válida para PERSONAL**: Al menos uno de:
  - `cardNumber` válido (mínimo 16 dígitos: `\\d{16,}`)
  - `transactionId` no vacío
  - `phoneNumber` no vacío (específico para PERSONAL)

- ✅ **Fechas obligatorias**: Si NO hay `transactionId`, entonces `transDateFrom` y `transDateTo` son obligatorios
- ✅ **Rango de fechas**: Máximo 2 años entre `transDateFrom` y `transDateTo`
- ✅ **Formato de fechas**: YYYY-MM-DD (validado con patrón `^\\d{4}-\\d{2}-\\d{2}$`)
- ❌ **Campos NO aplicables**: `businessName` y `path` deben ser null para PERSONAL

### Lógica de procesamiento por tipo de transacción

#### Transacciones P2P
- Se procesan si `transactionId` es numérico O no hay `transactionId`
- Incluye desencriptación de `sourcePlasticNumber` y `targetPlasticNumber`

#### Transacciones POS
- Se procesan si `transactionId` NO es numérico Y NO hay `targetPhoneNumber`
- Incluye desencriptación de `source_plastic_number`

#### Transacciones P2B
- Se procesan si `transactionId` NO es numérico Y NO hay `targetPhoneNumber`
- Incluye desencriptación de `sourcePlasticNumber` y `targetPlasticNumber`

#### Información de Usuario
- Siempre se incluye
- Incluye desencriptación de `cards`

## 📝 Ejemplo de Request Body Válido (con transactionId)

```json
{
  "subType": "PERSONAL",
  "username": "admin@example.com",
  "transactionId": "TXN123456789",
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "user@example.com"
}
```

## 📝 Ejemplo de Request Body Válido (con fechas)

```json
{
  "subType": "PERSONAL",
  "username": "admin@example.com",
  "transDateFrom": "2024-01-01",
  "transDateTo": "2024-12-31",
  "phoneNumber": "8095551234",
  "cardNumber": "1234567812345678",
  "firstName": "Juan",
  "lastName": "Pérez"
}
```

## 📝 Ejemplo de Request Body Mínimo

```json
{
  "subType": "PERSONAL",
  "username": "admin@example.com",
  "phoneNumber": "8095551234",
  "transDateFrom": "2024-01-01",
  "transDateTo": "2024-12-31"
}
```

## 🗄️ Queries Utilizadas

## P2P
```sql
SELECT
  TRANS.transactionid,
  TRANS.transactiondate,
  STATUS.statusname,
  TRANS.amount,
  TRANS.message,
  TRANS.targetphone,
  TARGETC.firstname + ' ' + TARGETC.lastname AS TARGETNAME,
  TARGETC.email AS TARGETEMAIL,
  TRANS.targetplasticnumber,
  TARGETFI.name AS targetfinancialinstitution,
  TRANS.effectivedate,
  TRANS.reverseddate,
  TRANS.terminaldescription,
  TRANS.sourceplasticnumber,
  SOURCEFI.name AS sourcefinancialinstitution,
  TRANS.accountsection AS sourceaccountsection,
  TRANS.sourcephone,
  SOURCEC.firstname + ' ' + SOURCEC.lastname AS SOURCENAME,
  SOURCEC.email AS SOURCEEMAIL
FROM
  athprd.vw_transactions TRANS
  LEFT JOIN athprd.customers SOURCEC ON SOURCEC.customerid = TRANS.customerid
  LEFT JOIN athprd.customers TARGETC ON TARGETC.customerid = TRANS.targetcustomerid
  INNER JOIN athprd.statuslist STATUS ON STATUS.statusid = TRANS.statusid
  LEFT JOIN athprd.financialinstitutions SOURCEFI ON SOURCEFI.group_id = TRANS.sourcegroupid
  LEFT JOIN athprd.financialinstitutions TARGETFI ON TARGETFI.group_id = TRANS.targetgroupid
WHERE
  (
    LENGTH(TRIM('7876054180')) = 0
    OR (
      TRIM(TRANS.SOURCEPHONE) = TRIM('7876054180')
      OR TRIM(TRANS.TARGETPHONE) = TRIM('7876054180')
    )
  )
  AND (
    (
      LENGTH(TRIM('01/01/2020')) = 0
      AND LENGTH(TRIM('12/31/2024')) = 0
    )
    OR (
      CAST(TRANS.TRANSACTIONDATE AS DATE) BETWEEN TO_DATE('01/01/2020', 'MM/DD/YYYY')
      AND TO_DATE('12/31/2024', 'MM/DD/YYYY')
    )
  )
  AND (
    LENGTH(TRIM('')) = 0
    OR UPPER(TRIM(SOURCEC.EMAIL)) = UPPER(TRIM(''))
    OR UPPER(TRIM(TARGETC.EMAIL)) = UPPER(TRIM(''))
  )
  AND (
    LENGTH(TRIM('')) = 0
    OR UPPER(TRIM(SOURCEC.FIRSTNAME)) = UPPER(TRIM(''))
    OR UPPER(TRIM(TARGETC.FIRSTNAME)) = UPPER(TRIM(''))
  )
  AND (
    LENGTH(TRIM('')) = 0
    OR UPPER(TRIM(SOURCEC.LASTNAME)) = UPPER(TRIM(''))
    OR UPPER(TRIM(TARGETC.LASTNAME)) = UPPER(TRIM(''))
  )
  AND (
    LENGTH(TRIM('')) = 0
    OR (
      -- SOURCE
      TRIM(TRANS.SOURCEPLASTICNUMBER) = TRIM('')
      OR -- TARGET
      TRIM(TRANS.TARGETPLASTICNUMBER) = TRIM('')
    )
  )
  AND (
    0 = 0
    OR (
      0 > 0
      AND TRANS.TRANSACTIONID = 0
    )
  )
ORDER BY
  TRANSACTIONDATE DESC
```

## POS
```sql
SELECT
  POS_TRANSACTION_ID,
  REFERENCE_NUMBER,
  AMOUNT,
  TAX1,
  TAX2,
  TIP_AMOUNT,
  TIP_INDICATOR,
  CURRENCY_NUM,
  COMPUTED_TAXES,
  CUSTOMER_ID,
  CARD_ID,
  SOURCE_PLASTIC_NUMBER,
  SOURCE_PHONE,
  SOURCE_PHONE_ID,
  ACCOUNT_SECTION,
  SOURCE_GROUP_ID,
  TRANSACTION_DATE,
  EFFECTIVE_DATE,
  REVERSED_DATE,
  AUTHORIZATION_ID,
  AUTHORIZATION_CODE,
  TRANSACTION_TYPE,
  TRANSACTION_STATUS,
  ACQUIRER_ID,
  TERMINAL_ID,
  MERCHANT_CATEGORIE_CODE,
  CAPTURE_DATE,
  ENTRY_MODE,
  TERMINAL_NAMELOC,
  POS_RETAILER_DATA,
  POS_TERMINAL_DATA,
  POS_ISSUER,
  POS_TERMINAL_ADDRESS,
  POS_INVOICE_DATA,
  POS_SETTLEMENT,
  RECEIVER_ID,
  BUSINESS_NAME,
  LOCATION,
  PAN_REQUESTED,
  SOURCE_CARD_EXPIRE,
  SYSTEM_TRACE,
  CONDITION_CODE,
  TAX_INDICATOR,
  CONTROL_NUMBER,
  BATCH_NUMBER,
  TAX3,
  BASE_AMT
FROM
  athdb.athprd.POS_TRANSACTIONS POS
  LEFT JOIN athdb.athprd.CUSTOMERS CUST ON CUST.CUSTOMERID = POS.CUSTOMER_ID
WHERE
  (
    (
      LENGTH(TRIM('01/01/2020')) = 0
      AND LENGTH(TRIM('12/31/2024')) = 0
    )
    OR (
      CAST(POS.TRANSACTION_DATE AS DATE) >= TO_DATE('01/01/2020', 'MM/DD/YYYY')
      AND CAST(POS.TRANSACTION_DATE AS DATE) <= TO_DATE('12/31/2024', 'MM/DD/YYYY')
    )
  )
  AND (
    LENGTH(TRIM('7876054180')) = 0
    OR TRIM(POS.SOURCE_PHONE) = TRIM('7876054180')
  )
  AND (
    LENGTH(TRIM('')) = 0
    OR UPPER(TRIM(CUST.EMAIL)) = UPPER(TRIM(''))
  )
  AND (
    LENGTH(TRIM('')) = 0
    OR UPPER(TRIM(CUST.FIRSTNAME)) = UPPER(TRIM(''))
  )
  AND (
    LENGTH(TRIM('')) = 0
    OR UPPER(TRIM(CUST.LASTNAME)) = UPPER(TRIM(''))
  )
  AND (
    LENGTH('') = 0
    OR (POS.POS_TRANSACTION_ID = '')
  )
  AND (
    LENGTH('') = 0
    OR TRIM(POS.SOURCE_PLASTIC_NUMBER) = ''
  )
ORDER BY
  TRANSACTION_DATE DESC
```

## P2B
```sql
SELECT
  BT.TRANSACTIONID,
  BT.TRANSACTIONDATE,
  BT.TRANSACTIONTYPE,
  BT.TRANSACTIONSTATUS,
  BT.SOURCECUSTOMERNAME,
  BT.SOURCEID,
  BT.SOURCECUSTOMEREMAIL,
  BT.SOURCEPLASTICNUMBER,
  SOURCEFI.name AS sourcefinancialinstitution,
  BT.SOURCEACCOUNTSECTION,
  BT.TARGETCUSTOMERNAME,
  BT.TARGETID,
  BT.TARGETCUSTOMEREMAIL,
  BT.TARGETPLASTICNUMBER,
  TARGETFI.name AS targetfinancialinstitution,
  BT.TARGETACCOUNTSECTION,
  BT.AMOUNT,
  BT.MESSAGE,
  BT.BTRANSSTATUSCODE,
  BT.EFFECTIVEDATE,
  BT.REVERSEDDATE,
  BT.TERMINALDESCRIPTION,
  BT.EXPIREDAYS,
  BT.RECIPIENT_FEE,
  BT.REFUNDSTATUS,
  BT.TRANSACTION_SUBTYPE,
  BT.AMOUNT_REFUNDED,
  ROUND(COALESCE(BT.TIP_AMOUNT, 0.00), 2) AS TIP_AMOUNT,
  ROUND(COALESCE(BT.TIP_AMOUNT_REFUNDED, 0.00), 2) AS TIP_AMOUNT_REFUNDED,
  BT.TIP_INDICATOR
FROM
  athdb.athprd.BUSINESS_TRANSACTIONS BT
  LEFT JOIN athprd.financialinstitutions SOURCEFI ON SOURCEFI.group_id = BT.sourcegroupid
  LEFT JOIN athprd.financialinstitutions TARGETFI ON TARGETFI.group_id = BT.targetgroupid
WHERE
  (
    (
      LENGTH(TRIM('01/01/2020')) = 0
      AND LENGTH(TRIM('12/31/2024')) = 0
    )
    OR (
      CAST(BT.TRANSACTIONDATE AS DATE) BETWEEN TO_DATE('01/01/2020', 'MM/DD/YYYY')
      AND TO_DATE('12/31/2024', 'MM/DD/YYYY')
    )
  )
  AND (
    LENGTH(TRIM('7876054180')) = 0
    OR REPLACE(
      REPLACE(
        REPLACE(REPLACE(BT.SOURCEID, '(', ''), ')', ''),
        '-',
        ''
      ),
      ' ',
      ''
    ) = TRIM('7876054180')
  )
  AND (
    LENGTH(TRIM('')) = 0
    OR UPPER(TRIM(BT.SOURCECUSTOMEREMAIL)) = UPPER(TRIM(''))
  )
  AND (
    LENGTH(TRIM('')) = 0
    OR UPPER(TRIM(BT.SOURCECUSTOMERNAME)) = UPPER(TRIM(''))
  )
  AND (
    LENGTH('') = 0
    OR (
      -- SOURCE
      TRIM(BT.SOURCEPLASTICNUMBER) = ''
      OR -- TARGET
      TRIM(BT.TARGETPLASTICNUMBER) = ''
    )
  )
  AND (
    LENGTH('') = 0
    OR (BT.TRANSACTIONID = '')
  )
ORDER BY
  TRANSACTIONDATE DESC;
```

## 📋 Notas Importantes

- **Múltiples hojas Excel**: Genera 4 hojas (P2P, P2B, POS, User Information)
- **Encriptación**: Los campos `cardNumber` se encriptan antes del procesamiento
- **Desencriptación**: Los números de tarjetas plásticas se desencriptan en el resultado
- **Lógica condicional**: El procesamiento varía según la presencia de `transactionId` y su tipo
- **Auditoría**: Se registra evento `BUILD_SUBPOENA_REPORT` en logs de auditoría
- **Notificación**: Email automático al completar el procesamiento
- **Almacenamiento**: Archivo encriptado en S3 con nomenclatura basada en `phoneNumber`

## ⚠️ Validaciones críticas

- **Sin transactionId**: Requiere fechas obligatorias (`transDateFrom` y `transDateTo`)
- **Con transactionId**: Las fechas son opcionales
- **Rango máximo**: 2 años entre fechas (configurado en `${report.subpoena.dates.max-years-between-dates}`)
- **Formato estricto**: Fechas deben seguir patrón YYYY-MM-DD exacto
