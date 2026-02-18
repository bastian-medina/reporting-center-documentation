# GeneralReportTransactionRefundUseCase

## 📋 Descripción

**Propósito**: Generar reportes de reembolsos y devoluciones de transacciones fallidas o disputadas.

**Tipo de Ejecución**: **Asíncrono** (WebFlux) - Procesamiento en background con notificación por email

**Request Body**: `GeneralTransactionReportRequest`

## 📊 Campos del Request Body

| Campo | Tipo | Obligatorio | Validaciones | Valores Permitidos |
|-------|------|-------------|--------------|-------------------|
| `transType` | `GeneralReportTransTypeEnum` | ✅ Sí | `@NotNull` | `REFUND` (fijo para este caso de uso) |
| `transDateFrom` | `String` | ✅ Sí | `@NotBlank`, formato YYYY-MM-DD, no antes del año mínimo configurado | Ejemplo: `"2024-01-01"` |
| `transDateTo` | `String` | ✅ Sí | `@NotBlank`, formato YYYY-MM-DD, no antes del año mínimo configurado, máximo 2 años de diferencia con `transDateFrom` | Ejemplo: `"2024-12-31"` |
| `lastLoginDate` | `String` | ❌ No | Formato de fecha libre | Ejemplo: `"2024-07-15"` |
| `lastLoginAfterBefore` | `String` | ❌ No | Debe ser valor válido del enum `GeneralReportAfterBefore` | `AFTER`, `BEFORE` (default: `AFTER`) |
| `customerStatus` | `String` | ❌ No | Para REFUND: debe ser valor válido del enum `GeneralReportCustomerStatusEnum` | Valores específicos del enum |
| `primaryCard` | `String` | ❌ No | Valor válido del enum `GeneralReportYesORNoBusinessEnum` | `YES`, `NO` |
| `institution` | `String` | ❌ No | String válido | Ejemplo: `"BANCO_POPULAR"` |
| `transStatus` | `String` | ❌ No | Para REFUND: debe ser valor válido del enum `GeneralRerportTransactionTypeBusiness` | Valores específicos del enum |
| `primaryPhone` | `String` | ❌ No | String válido | Ejemplo: `"8095551234"` |
| `channel` | `String` | ❌ No | Para REFUND: string numérico válido | Ejemplo: `"1"` |
| `emailAuthentication` | `String` | ✅ Sí | String no vacío (inyectado automáticamente desde el contexto de autenticación) | Email del usuario autenticado |

## 🔍 Validaciones Específicas para REFUND

### Campos aplicables para REFUND

- ✅ `primaryPhone`: Acepta filtro por teléfono principal del cliente (diferente a B2C)
- ✅ `customerStatus`: Si se proporciona, debe ser valor válido del enum `GeneralReportCustomerStatusEnum`
- ✅ `transStatus`: Si se proporciona, debe ser valor válido del enum `GeneralRerportTransactionTypeBusiness`
- ✅ `primaryCard`: Si se proporciona, debe ser `YES` o `NO`
- ✅ `channel`: Si se proporciona, debe ser string numérico

### Validaciones de fechas

- `transDateFrom` y `transDateTo` son obligatorios y deben tener máximo 2 años de diferencia
- Todas las fechas deben estar en formato YYYY-MM-DD
- Las fechas no pueden estar antes del año mínimo configurado en la aplicación

### Diferencias con otros tipos de transacción

- Permite filtro por `primaryPhone` (a diferencia de B2C)
- Usa enum `GeneralRerportTransactionTypeBusiness` para estados de transacción
- Usa enum `GeneralReportCustomerStatusEnum` para estados de cliente
- Orientado a transacciones de reembolso y devoluciones
- Incluye tanto reembolsos automáticos como manuales

## 📝 Ejemplo de Request Body Válido

```json
{
  "transType": "REFUND",
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
  bc.firstname AS firstname,
  bc.lastname AS lastname,
  bc.business_name AS businessname,
  bc.industry AS category,
  bc.email AS email,
  bc.registration_date AS registrationdate,
  bc.last_login AS last_login,
  bc.status_id AS customer_status,
  bc.customer_id AS rsa_status,
  bt.sourceid AS PATH,
  bt.transactiontype AS transaction_type,
  COUNT(bt.transactionid) AS total_refunds,
  SUM(bt.amount) AS total_refunds_amount
FROM
  athdb.athprd.business_transactions bt
  LEFT JOIN athdb.athprd.business_customers bc ON bt.sourcecustomerid = bc.customer_id
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
  LEFT JOIN athdb.athprd.ath_prefix ap ON ap.prefixid = bcc.prefixid
  LEFT JOIN athdb.athprd.financialinstitutions FI ON FI.FIID = ap.FIID
WHERE
  bt.transactiontype = 'REFUND'
  AND (
    LENGTH('') = 0
    OR bc.last_login > TO_DATE('', 'YYYY-MM-DD')
  )
  AND (
    (LENGTH('07/01/2023') = 0)
    AND (LENGTH('01/01/2024') = 0)
    OR (
      CAST(bc.registration_date AS DATE) BETWEEN TO_DATE('07/01/2023', 'MM/DD/YYYY')
      AND TO_DATE('01/01/2024', 'MM/DD/YYYY')
    )
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
  AND (
    LENGTH(TRIM('')) = 0
    OR UPPER(TRIM(bc.status_id)) = UPPER(TRIM(''))
  )
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
  bt.transactiontype
ORDER BY
  bt.sourceid;
```

## Aurora
```sql
select
	-- business customer
	bc.firstname as firstname,  
	bc.lastname as lastname,  
	bc.business_name as businessname, 
	bc.industry  as category,
	bc.email as email,  
	bc.registration_date as registrationdate,  
	bc.last_loginas last_login,  
	bc.status_id as customer_status,  
	bc.customer_id   as rsa_status,
	
	-- business transaction
	bt.sourceid as path, 
	bt.transactiontype as transaction_type,  
	count(bt.transactionid) as total_refunds,  
	sum(bt.amount)  as total_refunds_amount 
from 
	business_transactions bt, 
	business_customers bc, 
	business_customer_cards bcc,
	ath_prefix ap 
where 
	bt.transactiontype = :1 
	and bt.sourcecustomerid = bc.customer_id 
	and bt.sourcecardid = bcc.cardid 
	and ap.prefixid = bcc.prefixid 
	and ap.fiid = :2 
	and bc.status_id = :3 
	and bc.last_login < :4 
	and bt.transactiondate >= :5 
	and bt.transactiondate < :6 
	and bcc.primarycard = :7 
	and bcc.status = :8 
	and bt.transactionstatus = :9 
group by 
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
	bt.transactiontype 
order by 
	bt.sourceid;
```
