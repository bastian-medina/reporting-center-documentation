---
layout: page
title: GeneralReportTransactionB2CTransferUseCase
---

## 📋 Descripción

**Propósito**: Generar reportes de transferencias negocio a cliente (B2C) como devoluciones o pagos empresariales.

**Tipo de Ejecución**: **Asíncrono** (WebFlux) - Procesamiento en background con notificación por email

**Request Body**: `GeneralTransactionReportRequest`

## 📊 Campos del Request Body

| Campo | Tipo | Obligatorio | Validaciones | Valores Permitidos |
|-------|------|-------------|--------------|-------------------|
| `transType` | `GeneralReportTransTypeEnum` | ✅ Sí | `@NotNull` | `B2C` (fijo para este caso de uso) |
| `transDateFrom` | `String` | ✅ Sí | `@NotBlank`, formato YYYY-MM-DD, no antes del año mínimo configurado | Ejemplo: `"2024-01-01"` |
| `transDateTo` | `String` | ✅ Sí | `@NotBlank`, formato YYYY-MM-DD, no antes del año mínimo configurado, máximo 2 años de diferencia con `transDateFrom` | Ejemplo: `"2024-12-31"` |
| `lastLoginDate` | `String` | ❌ No | Formato de fecha libre | Ejemplo: `"2024-07-15"` |
| `lastLoginAfterBefore` | `String` | ❌ No | Debe ser valor válido del enum `GeneralReportAfterBefore` | `AFTER`, `BEFORE` (default: `AFTER`) |
| `customerStatus` | `String` | ❌ No | Para B2C: debe ser valor válido del enum `GeneralReportCustomerStatusEnum` | Valores específicos del enum |
| `primaryCard` | `String` | ❌ No | Valor válido del enum `GeneralReportYesORNoBusinessEnum` | `YES`, `NO` |
| `institution` | `String` | ❌ No | String válido | Ejemplo: `"BANCO_POPULAR"` |
| `transStatus` | `String` | ❌ No | Para B2C: debe ser valor válido del enum `GeneralRerportTransactionTypeBusiness` | Valores específicos del enum |
| `primaryPhone` | `String` | ❌ No | **Para B2C debe ser null** (no aplica) | `null` |
| `channel` | `String` | ❌ No | Para B2C: string numérico válido | Ejemplo: `"1"` |
| `emailAuthentication` | `String` | ✅ Sí | String no vacío (inyectado automáticamente desde el contexto de autenticación) | Email del usuario autenticado |

## 🔍 Validaciones Específicas para B2C

### Campos que NO aplican para B2C
- ❌ `primaryPhone`: Debe ser null (no aplica para transacciones B2C)

### Campos con validaciones específicas para B2C
- ✅ `customerStatus`: Si se proporciona, debe ser valor válido del enum `GeneralReportCustomerStatusEnum`
- ✅ `transStatus`: Si se proporciona, debe ser valor válido del enum `GeneralRerportTransactionTypeBusiness`
- ✅ `primaryCard`: Si se proporciona, debe ser `YES` o `NO`
- ✅ `channel`: Si se proporciona, debe ser string numérico

### Validaciones de fechas
- `transDateFrom` y `transDateTo` son obligatorios y deben tener máximo 2 años de diferencia
- Todas las fechas deben estar en formato YYYY-MM-DD
- Las fechas no pueden estar antes del año mínimo configurado en la aplicación

### Diferencias con otros tipos de transacción
- No permite filtro por `primaryPhone`
- Usa enum `GeneralRerportTransactionTypeBusiness` para estados de transacción
- Usa enum `GeneralReportCustomerStatusEnum` para estados de cliente
- Orientado a pagos desde empresas hacia clientes individuales

## 📝 Ejemplo de Request Body Válido

```json
{
  "transType": "B2C",
  "transDateFrom": "2024-01-01",
  "transDateTo": "2024-12-31",
  "lastLoginDate": "2024-07-15",
  "lastLoginAfterBefore": "AFTER",
  "customerStatus": "ACTIVE",
  "primaryCard": "YES",
  "institution": "BANCO_POPULAR",
  "transStatus": "COMPLETED",
  "channel": "1"
}
```

## 🗄️ Queries Utilizadas

## Redshift
```sql
SELECT
    bt.targetid AS path,
    bc.firstname AS firstname,
    bc.lastname AS lastname,
    bc.business_name AS businessname,
    bc.industry AS category,
    bc.email AS email,
    bc.registration_date AS registrationdate,
    bc.last_login AS last_login,
    bc.status_id AS customer_status,
    bt.transactiontype AS transaction_type,
    bt.transaction_subtype AS transaction_subtype,
    SUM(bt.recipient_fee) AS fee,
    COUNT(bt.transactionid) AS total_transfer,
    SUM(bt.amount) AS cumulative_amount
FROM athdb.athprd.business_transactions bt
LEFT JOIN athdb.athprd.business_customers bc ON bt.targetcustomerid = bc.customer_id
LEFT JOIN (
    SELECT customerid, cardnumber, status, primarycard, prefixid, ROW_NUMBER() OVER (PARTITION BY customerid ORDER BY primarycard DESC) AS rn
    FROM athdb.athprd.business_customer_cards
    WHERE primarycard = 'Y' AND status = 'ACTIVE_CARD'
) bcc ON bc.customer_id = bcc.customerid AND bcc.rn = 1
LEFT JOIN athdb.athprd.financialinstitutions FI ON FI.group_id = bt.targetgroupid
LEFT JOIN athdb.athprd.statusList sl on sl.statusid = bt.channelid
WHERE
    bt.transactiontype = 'B2C_TRANSFER'
    AND (LENGTH(TRIM('')) = 0 OR UPPER(TRIM(bc.status_id)) = UPPER(TRIM('')))
    AND (LENGTH('') = 0 OR bc.last_login > TO_DATE('', 'YYYY-MM-DD'))
    AND (
        (LENGTH('07/01/2023') = 0) AND (LENGTH('01/01/2024') = 0) OR
        (CAST(bt.transactiondate AS DATE) BETWEEN TO_DATE('07/01/2023', 'MM/DD/YYYY') AND TO_DATE('01/01/2024', 'MM/DD/YYYY'))
    )
    AND (0 = 0 OR sl.statusid = 0)
    AND (LENGTH(TRIM('')) = 0 OR UPPER(TRIM(bcc.primarycard)) = UPPER(TRIM('')))
    AND (LENGTH(TRIM('')) = 0 OR UPPER(TRIM(bt.transactionstatus)) = UPPER(TRIM('')))
    AND (LENGTH(TRIM('')) = 0 OR UPPER(TRIM(fi.fiid)) = UPPER(TRIM('')))
GROUP BY
    bt.targetid,
    bc.firstname,
    bc.lastname,
    bc.business_name,
    bc.industry,
    bc.email,
    bc.registration_date,
    bc.last_login,
    bc.status_id,
    bt.transactiontype,
    bt.transaction_subtype,
    bt.transaction_subtype,
    bt.transactionstatus
ORDER BY bt.targetid;
```

## Aurora
```sql
SELECT
  bc.firstname AS firstname,
  bc.lastname AS lastname,
  bc.business_name AS businessname,
  bt.sourceid AS PATH,
  bc.industry AS category,
  bc.email AS email,
  bc.registration_date AS registrationdate,
  bc.last_login AS last_login,
  bc.status_id AS customer_status,
  bc.customer_id AS rsa_status,
  bt.transactiontype AS transaction_type,
  bt.transaction_subtype AS transaction_subtype,
  bt.transactionstatus AS transaction_status,
  count(bt.transactionid) AS total_b2c,
  (sum(bt.amount) - sum(bt.recipient_fee)) AS b2c_amount,
  sum(bt.recipient_fee) AS b2c_fee,
  sum(bt.amount) AS total_amount
FROM
  business_transactions bt,
  business_customers bc,
  business_customer_cards bcc
WHERE
  bt.transactiontype = 'B2C_TRANSFER'
  AND bt.sourcecustomerid = bc.customer_id
  AND bt.sourcecardid = bcc.cardid --and bt.transactiondate >= ? 
  --and bt.transactiondate < ? 
GROUP BY
  bc.firstname,
  bc.lastname,
  bc.business_name,
  bt.sourceid,
  bc.industry,
  bc.email,
  bc.registration_date,
  bc.last_login,
  bc.status_id,
  bc.customer_id,
  bt.transactiontype,
  bt.transaction_subtype,
  bt.transactionstatus
ORDER BY
  bt.sourceid,
  bt.transactiontype,
  bt.transaction_subtype,
  bt.transactionstatus
```
