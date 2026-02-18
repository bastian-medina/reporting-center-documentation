---
layout: page
title: GeneralReportTransactionP2BTransferUseCase
---

# GeneralReportTransactionP2BTransferUseCase

## 📋 Descripción

**Propósito**: Generar reportes de transferencias persona a negocio (P2B) como pagos de servicios, productos o facturas.

**Tipo de Ejecución**: **Asíncrono** (WebFlux) - Procesamiento en background con notificación por email

**Request Body**: `GeneralTransactionReportRequest`

## 📊 Campos del Request Body

| Campo | Tipo | Obligatorio | Validaciones | Valores Permitidos |
|-------|------|-------------|--------------|-------------------|
| `transType` | `GeneralReportTransTypeEnum` | ✅ Sí | `@NotNull` | `P2B` (fijo para este caso de uso) |
| `transDateFrom` | `String` | ✅ Sí | `@NotBlank`, formato YYYY-MM-DD, no antes del año mínimo configurado | Ejemplo: `"2024-01-01"` |
| `transDateTo` | `String` | ✅ Sí | `@NotBlank`, formato YYYY-MM-DD, no antes del año mínimo configurado, máximo 2 años de diferencia con `transDateFrom` | Ejemplo: `"2024-12-31"` |
| `lastLoginDate` | `String` | ❌ No | Formato de fecha libre | Ejemplo: `"2024-07-15"` |
| `lastLoginAfterBefore` | `String` | ❌ No | Debe ser valor válido del enum `GeneralReportAfterBefore` | `AFTER`, `BEFORE` (default: `AFTER`) |
| `customerStatus` | `String` | ❌ No | Para P2B: debe ser valor válido del enum `GeneralReportCustomerStatusEnum` | Valores específicos del enum |
| `primaryCard` | `String` | ❌ No | Valor válido del enum `GeneralReportYesORNoBusinessEnum` | `YES`, `NO` |
| `institution` | `String` | ❌ No | String válido | Ejemplo: `"BANCO_POPULAR"` |
| `transStatus` | `String` | ❌ No | Para P2B: debe ser valor válido del enum `GeneralRerportTransactionTypeBusiness` | Valores específicos del enum |
| `primaryPhone` | `String` | ❌ No | String válido | Ejemplo: `"8095551234"` |
| `channel` | `String` | ❌ No | Para P2B: string numérico válido | Ejemplo: `"1"` |
| `emailAuthentication` | `String` | ✅ Sí | String no vacío (inyectado automáticamente desde el contexto de autenticación) | Email del usuario autenticado |

## 🔍 Validaciones Específicas para P2B

### Campos aplicables para P2B

- ✅ `primaryPhone`: Acepta filtro por teléfono principal del cliente
- ✅ `customerStatus`: Si se proporciona, debe ser valor válido del enum `GeneralReportCustomerStatusEnum`
- ✅ `transStatus`: Si se proporciona, debe ser valor válido del enum `GeneralRerportTransactionTypeBusiness`
- ✅ `primaryCard`: Si se proporciona, debe ser `YES` o `NO`
- ✅ `channel`: Si se proporciona, debe ser string numérico

### Validaciones de fechas

- `transDateFrom` y `transDateTo` son obligatorios y deben tener máximo 2 años de diferencia
- Todas las fechas deben estar en formato YYYY-MM-DD
- Las fechas no pueden estar antes del año mínimo configurado en la aplicación

### Diferencias con otros tipos de transacción

- Permite filtro por `primaryPhone` (similar a P2P y REFUND)
- Usa enum `GeneralRerportTransactionTypeBusiness` para estados de transacción
- Usa enum `GeneralReportCustomerStatusEnum` para estados de cliente
- Orientado a pagos desde personas hacia empresas/negocios
- Incluye pagos de servicios, productos y facturas comerciales

## 📝 Ejemplo de Request Body Válido

```json
{
  "transType": "P2B",
  "transDateFrom": "2024-01-01",
  "transDateTo": "2024-12-31",
  "lastLoginDate": "2024-07-15",
  "lastLoginAfterBefore": "AFTER",
  "customerStatus": "ACTIVE",
  "primaryCard": "YES",
  "institution": "BANCO_POPULAR",
  "transStatus": "COMPLETED",
  "primaryPhone": "8095551234",
  "channel": "1"
}
```

## 🗄️ Queries Utilizadas

## Redshift
```sql
SELECT
  bt.targetid AS PATH,
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
FROM
  athdb.athprd.business_transactions bt
  LEFT JOIN athdb.athprd.business_customers bc ON bt.targetcustomerid = bc.customer_id
  LEFT JOIN (
    SELECT
      customerid,
      cardnumber,
      status,
      primarycard,
      prefixid,
      ROW_NUMBER() OVER (
        PARTITION BY customerid
        ORDER BY
          primarycard DESC
      ) AS rn
    FROM
      athdb.athprd.business_customer_cards
    WHERE
      primarycard = 'Y'
      AND status = 'ACTIVE_CARD'
  ) bcc ON bc.customer_id = bcc.customerid
  AND bcc.rn = 1
  LEFT JOIN athdb.athprd.financialinstitutions FI ON FI.group_id = bt.targetgroupid
  LEFT JOIN athdb.athprd.statusList sl ON sl.statusid = bt.channelid
WHERE
  bt.transactiontype = 'P2B_TRANSFER'
  AND (
    LENGTH(TRIM('')) = 0
    OR UPPER(TRIM(bc.status_id)) = UPPER(TRIM(''))
  )
  AND (
    LENGTH('') = 0
    OR bc.last_login > TO_DATE('', 'YYYY-MM-DD')
  )
  AND (
    (LENGTH('07/01/2023') = 0)
    AND (LENGTH('01/01/2024') = 0)
    OR (
      CAST(bt.transactiondate AS DATE) BETWEEN TO_DATE('07/01/2023', 'MM/DD/YYYY')
      AND TO_DATE('01/01/2024', 'MM/DD/YYYY')
    )
  )
  AND (
    0 = 0
    OR sl.statusid = 0
  )
  AND (
    LENGTH(TRIM('')) = 0
    OR UPPER(TRIM(bcc.primarycard)) = UPPER(TRIM(''))
  )
  AND (
    LENGTH(TRIM('')) = 0
    OR UPPER(TRIM(bt.transactionstatus)) = UPPER(TRIM(''))
  )
  AND (
    LENGTH(TRIM('')) = 0
    OR UPPER(TRIM(fi.fiid)) = UPPER(TRIM(''))
  )
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
  bt.transactionstatus
ORDER BY
  bt.targetid;
```

## Aurora
```sql
--GeneralReportTransactionP2BtransferUseCase
select 
  bt.targetid as path, 
  bc.firstname as firstname, 
  bc.lastname as lastname, 
  bc.business_name as businessname, 
  bc.industry as category, 
  bc.email as email, 
  bc.registration_date as registrationdate, 
  bc.last_login as last_login, 
  bc.status_id as customer_status, 
  bt.transactiontype as transaction_type, 
  bt.transaction_subtype as transaction_subtype, 
  sum(bt.amount) as cumulative_amount, 
  sum(bt.recipient_fee) as fee, 
  count(bt.transactionid) as total_transfer 
from 
  business_transactions bt, 
  business_customers bc, 
  business_customer_cards bcc, 
  ath_prefix ap 
where 
  bt.transactiontype = : 1 
  and bt.targetcustomerid = bc.customer_id 
  and bt.targetcardid = bcc.cardid 
  and ap.prefixid = bcc.prefixid 
  and ap.fiid = : 2 
  and bc.status_id = : 3 
  and bc.last_login < : 4 
  and bt.transactiondate >= : 5 
  and bt.transactiondate < : 6 
  and bt.channelid = : 7 
  and bcc.primarycard = : 8 
  and bcc.status = : 9 
  and bt.transactionstatus = : 10 
group by 
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
  bt.transaction_subtype 
order by 
  bt.targetid;
```
