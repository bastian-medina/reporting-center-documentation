---
layout: page
title: GeneralReportTransactionPOSRefundUseCase
---

# GeneralReportTransactionPOSRefundUseCase

## 📋 Descripción

**Propósito**: Generar reportes de reembolsos específicos de transacciones realizadas en puntos de venta (POS).

**Tipo de Ejecución**: **Asíncrono** (WebFlux) - Procesamiento en background con notificación por email

**Request Body**: `GeneralTransactionReportRequest`

## 📊 Campos del Request Body

| Campo | Tipo | Obligatorio | Validaciones | Valores Permitidos |
|-------|------|-------------|--------------|-------------------|
| `transType` | `GeneralReportTransTypeEnum` | ✅ Sí | `@NotNull` | `POS_REFUND` (fijo para este caso de uso) |
| `transDateFrom` | `String` | ✅ Sí | `@NotBlank`, formato YYYY-MM-DD, no antes del año mínimo configurado | Ejemplo: `"2024-01-01"` |
| `transDateTo` | `String` | ✅ Sí | `@NotBlank`, formato YYYY-MM-DD, no antes del año mínimo configurado, máximo 2 años de diferencia con `transDateFrom` | Ejemplo: `"2024-12-31"` |
| `lastLoginDate` | `String` | ❌ No | Formato de fecha libre | Ejemplo: `"2024-07-15"` |
| `lastLoginAfterBefore` | `String` | ❌ No | Debe ser valor válido del enum `GeneralReportAfterBefore` | `AFTER`, `BEFORE` (default: `AFTER`) |
| `customerStatus` | `String` | ❌ No | Para POS_REFUND: debe ser valor válido del enum `GeneralReportCustomerStatusEnum` | Valores específicos del enum |
| `primaryCard` | `String` | ❌ No | **Para POS_REFUND es importante** - Valor válido del enum `GeneralReportYesORNoBusinessEnum` | `YES`, `NO` |
| `institution` | `String` | ❌ No | String válido | Ejemplo: `"BANCO_POPULAR"` |
| `transStatus` | `String` | ❌ No | Para POS_REFUND: debe ser valor válido del enum `GeneralReportTransactionStatusEnum` (específico para POS) | Valores específicos del enum |
| `primaryPhone` | `String` | ❌ No | String válido | Ejemplo: `"8095551234"` |
| `channel` | `String` | ❌ No | Para POS_REFUND: string numérico válido | Ejemplo: `"1"` |
| `emailAuthentication` | `String` | ✅ Sí | String no vacío (inyectado automáticamente desde el contexto de autenticación) | Email del usuario autenticado |

## 🔍 Validaciones Específicas para POS_REFUND

### Campos aplicables para POS_REFUND

- ✅ `primaryPhone`: Acepta filtro por teléfono principal del cliente
- ✅ `customerStatus`: Si se proporciona, debe ser valor válido del enum `GeneralReportCustomerStatusEnum`
- ✅ `transStatus`: Si se proporciona, debe ser valor válido del enum `GeneralReportTransactionStatusEnum` (específico para transacciones POS)
- ✅ `primaryCard`: **Campo importante para POS** - Si se proporciona, debe ser `YES` o `NO`
- ✅ `channel`: Si se proporciona, debe ser string numérico

### Validaciones de fechas

- `transDateFrom` y `transDateTo` son obligatorios y deben tener máximo 2 años de diferencia
- Todas las fechas deben estar en formato YYYY-MM-DD
- Las fechas no pueden estar antes del año mínimo configurado en la aplicación

### Diferencias con otros tipos de transacción

- Permite filtro por `primaryPhone`
- Usa enum `GeneralReportTransactionStatusEnum` para estados (específico para POS, diferente a otros tipos)
- Usa enum `GeneralReportCustomerStatusEnum` para estados de cliente
- **Campo `primaryCard` es especialmente relevante** para identificar si el reembolso fue a tarjeta principal
- Orientado específicamente a reembolsos de transacciones POS
- Incluye información específica de terminales y comercios

## 📝 Ejemplo de Request Body Válido

```json
{
  "transType": "POS_REFUND",
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
  c.firstname,
  c.lastname,
  c.username,
  c.email,
  c.registrationdate,
  c.last_login,
  c.rsa_status,
  cp.phonenumber,
  cStatus.description AS customer_status,
  ts.NAME AS transaction_type,
  t.TRANSACTION_STATUS,
  COUNT(DISTINCT t.POS_TRANSACTION_ID) AS total_refunds,
  SUM(t.AMOUNT + t.TIP_AMOUNT) AS cumulative_amount
FROM
  athdb.athprd.POS_TRANSACTIONS t
  LEFT JOIN athdb.athprd.transactiontype tt ON tt.transactiontypeid = t.TRANSACTION_TYPE
  LEFT JOIN athdb.athprd.transaction_subtype ts ON ts.TRANSACTION_SUBTYPE_ID = t.TRANSACTION_SUBTYPE_ID
  LEFT JOIN athdb.athprd.customers c ON t.CUSTOMER_ID = c.customerid
  LEFT JOIN athdb.athprd.statuslist cStatus ON cStatus.statusid = c.statusid
  LEFT JOIN athdb.athprd.customercards cc ON cc.id = t.CARD_ID
  LEFT JOIN athdb.athprd.statuslist ccStatus ON ccStatus.statusid = cc.statusid
  LEFT JOIN athdb.athprd.customerownphones cp ON c.customerid = cp.customerid
  LEFT JOIN athdb.athprd.ath_prefix ap ON ap.PREFIXID = cc.PREFIXID
  LEFT JOIN athdb.athprd.financialinstitutions FI ON FI.FIID = ap.FIID
WHERE
  c.customerid <> 44
  AND ts.NAME = 'POS_REFUND'
  AND (
    (LENGTH('07/01/2023') = 0)
    AND (LENGTH('01/01/2024') = 0)
    OR (
      CAST(t.transaction_date AS DATE) BETWEEN TO_DATE('07/01/2023', 'MM/DD/YYYY')
      AND TO_DATE('01/01/2024', 'MM/DD/YYYY')
    )
  )
  AND (
    LENGTH('') = 0
    OR c.last_login > TO_DATE('', 'YYYY-MM-DD')
  )
  AND (
    LENGTH(TRIM('')) = 0
    OR UPPER(TRIM(t.transaction_status)) = UPPER(TRIM(''))
  )
  AND (
    0 = 0
    OR cStatus.statusid = 0
  )
  AND (
    LENGTH(TRIM('')) = 0
    OR UPPER(TRIM(cc.primarycard)) = UPPER(TRIM(''))
  )
  AND (
    LENGTH(TRIM('')) = 0
    OR UPPER(TRIM(cp.primaryphone)) = UPPER(TRIM(''))
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
  ts.name,
  t.TRANSACTION_STATUS;
```

## Aurora
```sql
select 
	c.firstname, 
	c.lastname,
	c.username, 
	c.email,
	c.registrationdate,
	c.last_login,
	c.rsa_status,
	
	cp.phonenumber, 
	
	cStatus.description as customer_status,  
	
	ts.NAME as transaction_type, 
	
	t.TRANSACTION_STATUS,
	sum(t.AMOUNT + t.TIP_AMOUNT) as cumulative_amount, 
	count(distinct t.POS_TRANSACTION_ID)  as total_refunds 
from 
	POS_TRANSACTIONS t 
left join transactiontype tt on tt.transactiontypeid = t.TRANSACTION_TYPE 
left join transaction_subtype ts on ts.TRANSACTION_SUBTYPE_ID = t.TRANSACTION_SUBTYPE_ID 
left join customers c on t.CUSTOMER_ID = c.customerid 
left join statuslist cStatus on cStatus.statusid = c.statusid 
left join customerownphones cp on c.customerid = cp.customerid and cp.primaryphone = 'Y' 
left join customercards cc on cc.id = t.CARD_ID 
left join ath_prefix ap on ap.PREFIXID = cc.PREFIXID 
where 
	c.customerid != :1 
	and ts.NAME = :2 
	and t.TRANSACTION_DATE >= :3 
	and t.TRANSACTION_DATE < :4 
	and c.last_login < :5 
	and t.TRANSACTION_STATUS = :6 
	and c.statusid = :7 
	and c.rsa_status = :8 
	and cc.statusid = :9 
	and cc.primarycard = :10 
	and ap.FIID = :11 
group by 
	c.firstname,	
	c.lastname, 
	c.username, 
	c.email, 
	cp.phonenumber, 
	c.registrationdate, 
	c.last_login, 
	cStatus.description,  
	c.rsa_status, 
	ts.name, 
	t.TRANSACTION_STATUS;
```