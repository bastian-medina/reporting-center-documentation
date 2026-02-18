---
layout: page
title: GeneralReportTransactionP2PTransferUseCase
---

## 📋 Descripción

**Propósito**: Generar reportes de transferencias persona a persona (P2P) con datos de remitente, receptor y montos.

**Tipo de Ejecución**: **Asíncrono** (WebFlux) - Procesamiento en background con notificación por email

**Request Body**: `GeneralTransactionReportRequest`

## 📊 Campos del Request Body

| Campo | Tipo | Obligatorio | Validaciones | Valores Permitidos |
|-------|------|-------------|--------------|-------------------|
| `transType` | `GeneralReportTransTypeEnum` | ✅ Sí | `@NotNull` | `P2P` (fijo para este caso de uso) |
| `transDateFrom` | `String` | ✅ Sí | `@NotBlank`, formato YYYY-MM-DD, no antes del año mínimo configurado | Ejemplo: `"2024-01-01"` |
| `transDateTo` | `String` | ✅ Sí | `@NotBlank`, formato YYYY-MM-DD, no antes del año mínimo configurado, máximo 2 años de diferencia con `transDateFrom` | Ejemplo: `"2024-12-31"` |
| `lastLoginDate` | `String` | ❌ No | Formato de fecha libre | Ejemplo: `"2024-07-15"` |
| `lastLoginAfterBefore` | `String` | ❌ No | Debe ser valor válido del enum `GeneralReportAfterBefore` | `AFTER`, `BEFORE` (default: `AFTER`) |
| `customerStatus` | `String` | ❌ No | Para P2P: debe ser string numérico | Ejemplo: `"1"` |
| `primaryCard` | `String` | ❌ No | Valor válido del enum `GeneralReportYesORNoBusinessEnum` | `YES`, `NO` |
| `institution` | `String` | ❌ No | String válido | Ejemplo: `"BANCO_POPULAR"` |
| `transStatus` | `String` | ❌ No | Para P2P: debe ser string numérico | Ejemplo: `"1"` |
| `primaryPhone` | `String` | ❌ No | Para P2P: valor válido del enum `GeneralReportYesORNoBusinessEnum` | `YES`, `NO` |
| `channel` | `String` | ❌ No | Para P2P: string numérico válido | Ejemplo: `"1"` |
| `emailAuthentication` | `String` | ✅ Sí | String no vacío (inyectado automáticamente desde el contexto de autenticación) | Email del usuario autenticado |

## 🔍 Validaciones Específicas para P2P

### Campos permitidos para P2P
- ✅ `primaryPhone`: Puede ser `YES` o `NO`
- ✅ `channel`: Puede ser string numérico válido

### Campos con validaciones específicas para P2P
- ✅ `customerStatus`: Si se proporciona, debe ser string numérico (ej: "1", "2")
- ✅ `transStatus`: Si se proporciona, debe ser string numérico (ej: "1", "2")
- ✅ `primaryCard`: Si se proporciona, debe ser `YES` o `NO`
- ✅ `primaryPhone`: Si se proporciona, debe ser `YES` o `NO`
- ✅ `channel`: Si se proporciona, debe ser string numérico

### Validaciones de fechas
- `transDateFrom` y `transDateTo` son obligatorios y deben tener máximo 2 años de diferencia
- Todas las fechas deben estar en formato YYYY-MM-DD
- Las fechas no pueden estar antes del año mínimo configurado en la aplicación

### Diferencias con otros tipos de transacción
- Permite filtros por `primaryPhone` y `channel` (a diferencia de POS)
- Usa validaciones numéricas para `transStatus` (no enum específico)
- Orientado a transferencias entre usuarios individuales

## 📝 Ejemplo de Request Body Válido

```json
{
  "transType": "P2P",
  "transDateFrom": "2024-01-01",
  "transDateTo": "2024-12-31",
  "lastLoginDate": "2024-07-15",
  "lastLoginAfterBefore": "AFTER",
  "customerStatus": "1",
  "primaryCard": "YES",
  "institution": "BANCO_POPULAR",
  "transStatus": "1",
  "primaryPhone": "YES",
  "channel": "1"
}
```

## 🗄️ Queries Utilizadas

```sql
SELECT
  c.firstname AS firstName,
  c.lastname AS lastName,
  c.username AS username,
  c.email AS email,
  cp.phonenumber AS phoneNumber,
  c.registrationdate AS registrationDate,
  c.last_login AS lastLogin,
  cStatus.description AS customerStatus,
  c.rsa_status AS rsaStatus,
  tt.name AS transactionType,
  COALESCE(SUB.name, 'TRANSFER') AS transactionSubtype,
  s.description AS transactionStatus,
  COUNT(DISTINCT t.transactionid) AS cumulativeAmount,
  SUM(t.amount) AS totalTransfers
FROM
  athdb.athprd.vw_transactions t
  LEFT JOIN athdb.athprd.transactiontype tt ON tt.transactiontypeid = t.transactiontypeid
  LEFT JOIN athdb.athprd.statuslist s ON s.statusid = t.statusid
  LEFT JOIN athdb.athprd.customers c ON t.customerid = c.customerid
  LEFT JOIN athdb.athprd.statuslist cStatus ON cStatus.statusid = c.statusid
  LEFT JOIN athdb.athprd.customercards cc ON cc.id = t.cardid
  LEFT JOIN athdb.athprd.ath_prefix ap ON ap.PREFIXID = cc.PREFIXID
  LEFT JOIN athdb.athprd.financialinstitutions FI ON FI.FIID = ap.FIID
  LEFT JOIN athdb.athprd.customerownphones cp ON c.customerid = cp.customerid
  AND t.sourcephone = cp.phonenumber
  LEFT JOIN athdb.athprd.transaction_subtype sub ON sub.transaction_subtype_id = t.transaction_subtype_id
  LEFT JOIN athdb.athprd.statusList csl ON csl.statusid = t.channelid
  LEFT JOIN athdb.athprd.statusList tsl ON tsl.statusid = t.statusid
WHERE
  c.customerid <> 44
  AND (
    (LENGTH('07/01/2021') = 0)
    AND (LENGTH('01/01/2024') = 0)
    OR (
      CAST(t.transactiondate AS DATE) BETWEEN TO_DATE('07/01/2021', 'MM/DD/YYYY')
      AND TO_DATE('01/01/2024', 'MM/DD/YYYY')
    )
  )
  AND (
    LENGTH('') = 0
    OR c.last_login > TO_DATE('', 'YYYY-MM-DD')
  )
  AND (
    0 = 0
    OR csl.statusid = 0
  )
  AND (
    0 = 0
    OR tsl.statusid = 0
  )
  AND (
    0 = 0
    OR cStatus.statusid = 0
  )
  AND (
    LENGTH(TRIM('')) = 0
    OR UPPER(TRIM(cp.primaryphone)) = UPPER(TRIM(''))
  )
  AND (
    LENGTH(TRIM('')) = 0
    OR UPPER(TRIM(cc.primarycard)) = UPPER(TRIM(''))
  )
  AND (
    LENGTH(TRIM('')) = 0
    OR UPPER(TRIM(fi.fiid)) = UPPER(TRIM(''))
  )
GROUP BY
  c.firstname,
  c.lastname,
  c.username,
  c.email,
  cp.phonenumber,
  c.registrationdate,
  c.last_login,
  cStatus.description,
  c.rsa_status,
  tt.name,
  sub.name,
  s.description
ORDER BY
  totalTransfers DESC;
```

## Aurora
```sql
--GeneralReportTransactionP2PtransferUseCase
(
  (
    SELECT
      c.firstname,
      c.lastname,
      c.username,
      c.email,
      cp.phonenumber,
      c.registrationdate,
      c.last_login,
      cStatus.description AS customer_status,
      c.rsa_status,
      tt.name AS transaction_type,
      CASE WHEN sub.TRANSACTION_SUBTYPE_ID = 4 THEN 'P2P QR Code' ELSE 'Transfer' END AS transaction_subtype,
      s.description AS transaction_status,
      sum(t.amount) AS cumulative_amount,
      count(DISTINCT t.transactionid) AS total_transfers
    FROM
      transactions t
      LEFT JOIN transactiontype tt ON tt.transactiontypeid = t.transactiontypeid
      LEFT JOIN statuslist s ON s.statusid = t.statusid
      LEFT JOIN customers c ON t.customerid = c.customerid
      LEFT JOIN statuslist cStatus ON cStatus.statusid = c.statusid
      LEFT JOIN customercards cc ON cc.id = t.cardid
      LEFT JOIN ath_prefix ap ON ap.PREFIXID = cc.PREFIXID
      LEFT JOIN customerownphones cp ON c.customerid = cp.customerid
      AND cp.primaryphone = 'Y'
      LEFT JOIN transaction_subtype sub ON sub.transaction_subtype_id = t.transaction_subtype_id
    WHERE
      c.customerid != 44
      AND t.transactiondate >=: 1
      AND t.transactiondate <: 2
      AND c.last_login <: 3
      AND t.channelid =: 4
      AND t.statusid =: 5
      AND c.statusid =: 6
      AND c.rsa_status =: 7
      AND cc.statusid =: 8
      AND cc.primarycard =: 9
      AND ap.FIID =: 10
    GROUP BY
      c.firstname,
      c.lastname,
      c.username,
      c.email,
      cp.phonenumber,
      c.registrationdate,
      c.last_login,
      cStatus.description,
      c.rsa_status,
      tt.name,
      (
        CASE WHEN sub.TRANSACTION_SUBTYPE_ID = 4 THEN 'P2P QR Code' ELSE 'Transfer' END
      ),
      s.description
  )
  UNION
  (
    SELECT
      c.firstname,
      c.lastname,
      c.username,
      c.email,
      cp.phonenumber,
      c.registrationdate,
      c.last_login,
      cStatus.description AS customer_status,
      c.rsa_status,
      tt.name AS transaction_type,
      CASE WHEN sub.TRANSACTION_SUBTYPE_ID = 4 THEN 'P2P QR Code' ELSE 'Transfer' END AS transaction_subtype,
      s.description AS transaction_status,
      sum(t.amount) AS cumulative_amount,
      count(DISTINCT t.transactionid) AS total_transfers
    FROM
      zz_transactions t
      LEFT JOIN transactiontype tt ON tt.transactiontypeid = t.transactiontypeid
      LEFT JOIN statuslist s ON s.statusid = t.statusid
      LEFT JOIN customers c ON t.customerid = c.customerid
      LEFT JOIN statuslist cStatus ON cStatus.statusid = c.statusid
      LEFT JOIN customercards cc ON cc.id = t.cardid
      LEFT JOIN ath_prefix ap ON ap.PREFIXID = cc.PREFIXID
      LEFT JOIN customerownphones cp ON c.customerid = cp.customerid
      AND cp.primaryphone = 'Y'
      LEFT JOIN transaction_subtype sub ON sub.transaction_subtype_id = t.transaction_subtype_id
    WHERE
      c.customerid != 44
      AND t.transactiondate >=: 11
      AND t.transactiondate <: 12
      AND c.last_login <: 13
      AND t.channelid =: 14
      AND t.statusid =: 15
      AND c.statusid =: 16
      AND c.rsa_status =: 17
      AND cc.statusid =: 18
      AND cc.primarycard =: 19
      AND ap.FIID =: 20
    GROUP BY
      c.firstname,
      c.lastname,
      c.username,
      c.email,
      cp.phonenumber,
      c.registrationdate,
      c.last_login,
      cStatus.description,
      c.rsa_status,
      tt.name,
      (
        CASE WHEN sub.TRANSACTION_SUBTYPE_ID = 4 THEN 'P2P QR Code' ELSE 'Transfer' END
      ),
      s.description
  )
)
ORDER BY
  total_transfers DESC;
```
