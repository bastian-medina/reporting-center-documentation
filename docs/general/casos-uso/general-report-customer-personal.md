---
layout: page
title: GeneralReportCustomerPersonalUseCase
---

# GeneralReportCustomerPersonalUseCase

## 📋 Descripción

**Propósito**: Generar reportes de clientes personales con información demográfica, estados de tarjetas, fechas de registro y datos de login.

**Tipo de Ejecución**: **Asíncrono** (WebFlux) - Procesamiento en background con notificación por email

**Request Body**: `GeneralCustomerReportRequest`

## 📊 Campos del Request Body

| Campo | Tipo | Obligatorio | Validaciones | Valores Permitidos |
|-------|------|-------------|--------------|-------------------|
| `accountType` | `GeneralReportAccountTypeEnum` | ✅ Sí | `@NotNull` | `PERSONAL` (fijo para este caso de uso) |
| `regDateFrom` | `String` | ✅ Sí | `@NotBlank`, formato YYYY-MM-DD, no antes del año mínimo configurado | Ejemplo: `"2024-01-01"` |
| `regDateTo` | `String` | ✅ Sí | `@NotBlank`, formato YYYY-MM-DD, no antes del año mínimo configurado, máximo 5 años de diferencia con `regDateFrom` | Ejemplo: `"2024-12-31"` |
| `unregisteredDateFrom` | `String` | ❌ No | Formato YYYY-MM-DD si se proporciona, debe ir acompañado de `unregisteredDateTo` | Ejemplo: `"2024-06-01"` |
| `unregisteredDateTo` | `String` | ❌ No | Formato YYYY-MM-DD si se proporciona, debe ir acompañado de `unregisteredDateFrom` | Ejemplo: `"2024-06-30"` |
| `lastLoginDate` | `String` | ❌ No | Formato de fecha libre | Ejemplo: `"2024-07-15"` |
| `lastLoginAfterBefore` | `String` | ❌ No | Debe ser valor válido del enum `GeneralReportAfterBefore` | `AFTER`, `BEFORE` (default: `AFTER`) |
| `customerStatus` | `List<String>` | ❌ No | Para PERSONAL: cada elemento debe ser string numérico | Ejemplo: `["1", "2", "3"]` |
| `fraudStatus` | `List<String>` | ❌ No | Para PERSONAL: debe ser valor válido del enum `GeneralReportCustomerFraudStatus` | Valores específicos del enum |
| `rsaStatus` | `List<String>` | ❌ No | Debe ser valor válido del enum `GeneralReportRSAStatusEnum` | Valores específicos del enum |
| `cardStatus` | `List<String>` | ❌ No | Para PERSONAL: cada elemento debe ser string numérico | Ejemplo: `["10", "20", "30"]` |
| `category` | `List<String>` | ❌ No | **Para PERSONAL debe ser null o vacío** (solo aplica para BUSINESS) | `null` o `[]` |
| `institution` | `List<String>` | ❌ No | String válido | Ejemplo: `["BANCO_POPULAR", "SANTANDER"]` |
| `phoneNumberStatus` | `String` | ❌ No | Para PERSONAL: debe ser string numérico | Ejemplo: `"1"` |
| `primaryCard` | `String` | ❌ No | Valor válido del enum `GeneralReportYesORNoEnum` | `YES`, `NO` |
| `profit` | `String` | ❌ No | **Para PERSONAL debe ser null** (solo aplica para BUSINESS) | `null` |
| `emailAuthentication` | `String` | ✅ Sí | String no vacío (inyectado automáticamente desde el contexto de autenticación) | Email del usuario autenticado |

## 🔍 Validaciones Específicas para PERSONAL

### Campos que NO aplican para PERSONAL
- ❌ `profit`: Debe ser null o no proporcionado
- ❌ `category`: Debe ser null o lista vacía

### Campos con validaciones específicas para PERSONAL
- ✅ `customerStatus`: Si se proporciona, cada elemento debe ser string numérico (ej: "1", "2")
- ✅ `cardStatus`: Si se proporciona, cada elemento debe ser string numérico (ej: "10", "20")
- ✅ `phoneNumberStatus`: Si se proporciona, debe ser string numérico
- ✅ `fraudStatus`: Si se proporciona, debe ser valor válido del enum

### Validaciones de fechas
- `regDateFrom` y `regDateTo` son obligatorios y deben tener máximo 5 años de diferencia
- Si se proporciona `unregisteredDateFrom`, también debe proporcionarse `unregisteredDateTo`
- Todas las fechas deben estar en formato YYYY-MM-DD
- Las fechas no pueden estar antes del año mínimo configurado en la aplicación

## 📝 Ejemplo de Request Body Válido

```json
{
  "accountType": "PERSONAL",
  "regDateFrom": "2024-01-01",
  "regDateTo": "2024-12-31",
  "unregisteredDateFrom": "2024-06-01",
  "unregisteredDateTo": "2024-06-30",
  "lastLoginDate": "2024-07-15",
  "lastLoginAfterBefore": "AFTER",
  "customerStatus": ["1", "2"],
  "fraudStatus": ["ACTIVE"],
  "rsaStatus": ["ENABLED"],
  "cardStatus": ["10", "20"],
  "institution": ["BANCO_POPULAR"],
  "phoneNumberStatus": "1",
  "primaryCard": "YES"
}
```

## 🗄️ Queries Utilizadas

## Redshift
```sql
SELECT
  DENSE_RANK() OVER (
    ORDER BY
      C.USERNAME,
      cp.phonenumber,
      c.registrationdate
  ) AS customerDenseRank,
  c.firstname,
  c.lastname,
  c.username,
  c.email,
  cp.phonenumber,
  psl.statusname AS phoneNumberStatus,
  cc.cardnumber AS auxCard,
  FI.name AS financialInstitution,
  c.registrationdate,
  c.last_login AS lastLogin,
  c.fraud_status AS fraudStatus,
  c.deactivationdate AS unregisteredDate,
  cStatus.description AS customerStatus,
  c.rsa_status AS rsaStatus,
  c.unregister_notes AS unregisteredNotes,
  csl.statusname AS cardStatus,
  cc.primarycard AS isPrimaryCard,
  csl.statusid AS cardStatusId
FROM
  athdb.athprd.customers c
  LEFT JOIN athdb.athprd.customercards cc ON c.customerid = cc.customerid
  LEFT JOIN athdb.athprd.statuslist cStatus ON cStatus.statusid = c.statusid
  LEFT JOIN athdb.athprd.ath_prefix ap ON ap.PREFIXID = cc.PREFIXID
  LEFT JOIN athdb.athprd.customerownphones cp ON c.customerid = cp.customerid
  LEFT JOIN athdb.athprd.financialinstitutions FI ON FI.FIID = ap.fiid
  LEFT JOIN athdb.athprd.statusList sl ON sl.statusid = c.statusid
  LEFT JOIN athdb.athprd.statusList csl ON csl.statusid = cc.statusid
  LEFT JOIN athdb.athprd.statusList psl ON psl.statusid = cp.statusid
WHERE
  c.customerid <> 44
  AND (
    GET_ARRAY_LENGTH(ARRAY()) = 0
    OR c.statusid = ARRAY()
  )
  AND (
    0 = 0
    OR psl.statusid = 0
  )
  AND (
    GET_ARRAY_LENGTH(ARRAY()) = 0
    OR csl.statusid = ARRAY()
  )
  AND (
    LENGTH(TRIM('')) = 0
    OR UPPER(TRIM(cc.primarycard)) = UPPER(TRIM(''))
  )
  AND (
    GET_ARRAY_LENGTH(ARRAY()) = 0
    OR UPPER(TRIM(c.rsa_status)) = ARRAY()
  )
  AND (
    (LENGTH('01/01/2013') = 0)
    AND (LENGTH('01/01/2021') = 0)
    OR (
      CAST(c.registrationdate AS DATE) BETWEEN TO_DATE('01/01/2013', 'MM/DD/YYYY')
      AND TO_DATE('01/01/2021', 'MM/DD/YYYY')
    )
  )
  AND (
    (LENGTH('') = 0)
    AND (LENGTH('') = 0)
    OR (
      CAST(c.deactivationdate AS DATE) BETWEEN TO_DATE('', 'MM/DD/YYYY')
      AND TO_DATE('', 'MM/DD/YYYY')
    )
  )
  AND (
    LENGTH('') = 0
    OR c.last_login > TO_DATE('', 'YYYY-MM-DD')
  )
  AND (
    GET_ARRAY_LENGTH(ARRAY()) = 0
    OR UPPER(TRIM(fi.fiid)) = ARRAY()
  )
  AND (
    GET_ARRAY_LENGTH(ARRAY()) = 0
    OR UPPER(TRIM(c.fraud_status)) = ARRAY()
  )
GROUP BY
  c.customerid,
  c.firstname,
  c.lastname,
  c.username,
  c.email,
  cc.cardnumber,
  FI.name,
  cp.phonenumber,
  c.registrationdate,
  c.last_login,
  c.fraud_status,
  c.deactivationdate,
  cStatus.description,
  c.rsa_status,
  c.unregister_notes,
  c.customerid,
  csl.statusname,
  cc.primarycard,
  psl.statusname,
  csl.statusid
ORDER BY
  customerDenseRank,
  c.registrationdate DESC;
```

## Aurora
```sql
--GeneralReportCustomerPersonalUseCase
SELECT
  c.firstname,
  c.lastname,
  c.username,
  c.email,
  cp.phonenumber,
  NVL(
    (
      SELECT
        card.cardnumber || '|' || pref.fiid AS cardnumber
      FROM
        customercards card,
        ath_prefix pref
      WHERE
        card.customerid = c.customerid
        AND card.primarycard = 'Y'
        AND card.statusid = '13'
        AND card.prefixid = pref.prefixid
    ),
    ''
  ) AS primary_card,
  NVL(
    (
      SELECT
        cardnumber
      FROM
        (
          SELECT
            rownum AS line,
            card.cardnumber || '|' || pref.fiid AS cardnumber
          FROM
            customercards card,
            ath_prefix pref
          WHERE
            card.customerid = c.customerid
            AND card.primarycard = 'N'
            AND card.statusid = '13'
            AND card.prefixid = pref.prefixid
          ORDER BY
            card.cardnumber DESC
        )
      WHERE
        line = 1
    ),
    ''
  ) AS second_card,
  NVL(
    (
      SELECT
        cardnumber
      FROM
        (
          SELECT
            rownum AS line,
            card.cardnumber || '|' || pref.fiid AS cardnumber
          FROM
            customercards card,
            ath_prefix pref
          WHERE
            card.customerid = c.customerid
            AND card.primarycard = 'N'
            AND card.statusid = '13'
            AND card.prefixid = pref.prefixid
          ORDER BY
            card.cardnumber DESC
        )
      WHERE
        line = 2
    ),
    ''
  ) AS third_card,
  NVL(
    (
      SELECT
        cardnumber
      FROM
        (
          SELECT
            rownum AS line,
            card.cardnumber || '|' || pref.fiid AS cardnumber
          FROM
            customercards card,
            ath_prefix pref
          WHERE
            card.customerid = c.customerid
            AND card.primarycard = 'N'
            AND card.statusid = '13'
            AND card.prefixid = pref.prefixid
          ORDER BY
            card.cardnumber DESC
        )
      WHERE
        line = 3
    ),
    ''
  ) AS fourth_card,
  NVL(
    (
      SELECT
        cardnumber
      FROM
        (
          SELECT
            rownum AS line,
            card.cardnumber || '|' || pref.fiid AS cardnumber
          FROM
            customercards card,
            ath_prefix pref
          WHERE
            card.customerid = c.customerid
            AND card.primarycard = 'N'
            AND card.statusid = '13'
            AND card.prefixid = pref.prefixid
          ORDER BY
            card.cardnumber DESC
        )
      WHERE
        line = 4
    ),
    ''
  ) AS fifth_card,
  NVL(
    (
      SELECT
        fi.name
      FROM
        customercards card,
        ath_prefix pref,
        financialinstitutions fi
      WHERE
        card.customerid = c.customerid
        AND card.primarycard = 'Y'
        AND card.statusid = '13'
        AND card.prefixid = pref.prefixid
        AND fi.fiid = pref.fiid
    ),
    ''
  ) AS financial_institution,
  c.registrationdate,
  c.last_login,
  c.deactivationdate AS unregistered_date,
  cStatus.description AS customer_status,
  c.rsa_status,
  c.unregister_notes AS unregistered_notes
FROM
  customers c
  LEFT JOIN customercards cc ON c.customerid = cc.customerid
  LEFT JOIN statuslist cStatus ON cStatus.statusid = c.statusid
  LEFT JOIN ath_prefix ap ON ap.PREFIXID = cc.PREFIXID
  LEFT JOIN customerownphones cp ON c.customerid = cp.customerid
WHERE
  c.customerid != 44
  AND c.statusid = 4
  AND cc.statusid = 13
  AND cc.primarycard = 'Y'
  AND c.rsa_status = 'RSA_ACTIVE'
  AND c.registrationdate >= '01-Mar-2024'
  AND c.registrationdate < '27-Mar-2024'
  AND c.last_login < '01-Apr-2024'
  AND ap.FIID = 'BPPR'
GROUP BY
  c.firstname,
  c.lastname,
  c.username,
  c.email,
  cp.phonenumber,
  c.registrationdate,
  c.last_login,
  c.deactivationdate,
  cStatus.description,
  c.rsa_status,
  c.unregister_notes,
  c.customerid
ORDER BY
  c.lastname OFFSET 0 ROWS FETCH NEXT 100000 ROWS ONLY;
```

