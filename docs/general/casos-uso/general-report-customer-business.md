# GeneralReportCustomerBusinessUseCase

## 📋 Descripción

**Propósito**: Generar reportes de clientes empresariales con información de negocios, categorías, rentabilidad y datos específicos de empresas.

**Tipo de Ejecución**: **Asíncrono** (WebFlux) - Procesamiento en background con notificación por email

**Request Body**: `GeneralCustomerReportRequest`

## 📊 Campos del Request Body

| Campo | Tipo | Obligatorio | Validaciones | Valores Permitidos |
|-------|------|-------------|--------------|-------------------|
| `accountType` | `GeneralReportAccountTypeEnum` | ✅ Sí | `@NotNull` | `BUSINESS` (fijo para este caso de uso) |
| `regDateFrom` | `String` | ✅ Sí | `@NotBlank`, formato YYYY-MM-DD, no antes del año mínimo configurado | Ejemplo: `"2024-01-01"` |
| `regDateTo` | `String` | ✅ Sí | `@NotBlank`, formato YYYY-MM-DD, no antes del año mínimo configurado, máximo 5 años de diferencia con `regDateFrom` | Ejemplo: `"2024-12-31"` |
| `unregisteredDateFrom` | `String` | ❌ No | Formato YYYY-MM-DD si se proporciona, debe ir acompañado de `unregisteredDateTo` | Ejemplo: `"2024-06-01"` |
| `unregisteredDateTo` | `String` | ❌ No | Formato YYYY-MM-DD si se proporciona, debe ir acompañado de `unregisteredDateFrom` | Ejemplo: `"2024-06-30"` |
| `lastLoginDate` | `String` | ❌ No | Formato de fecha libre | Ejemplo: `"2024-07-15"` |
| `lastLoginAfterBefore` | `String` | ❌ No | Debe ser valor válido del enum `GeneralReportAfterBefore` | `AFTER`, `BEFORE` (default: `AFTER`) |
| `customerStatus` | `List<String>` | ❌ No | Para BUSINESS: debe ser valor válido del enum `GeneralReportCustomerStatusEnum` | Valores específicos del enum |
| `fraudStatus` | `List<String>` | ❌ No | **Para BUSINESS debe ser null o vacío** (solo aplica para PERSONAL) | `null` o `[]` |
| `rsaStatus` | `List<String>` | ❌ No | Debe ser valor válido del enum `GeneralReportRSAStatusEnum` | Valores específicos del enum |
| `cardStatus` | `List<String>` | ❌ No | Para BUSINESS: debe ser valor válido del enum `GeneralReportCardStatusEnum` | Valores específicos del enum |
| `category` | `List<String>` | ❌ No | Para BUSINESS: cada elemento debe seguir el patrón `[a-zA-Z &\\-]+` | Ejemplo: `["Retail", "Food & Beverage"]` |
| `institution` | `List<String>` | ❌ No | String válido | Ejemplo: `["BANCO_POPULAR", "SANTANDER"]` |
| `phoneNumberStatus` | `String` | ❌ No | **Para BUSINESS debe ser null** (solo aplica para PERSONAL) | `null` |
| `primaryCard` | `String` | ❌ No | Valor válido del enum `GeneralReportYesORNoEnum` | `YES`, `NO` |
| `profit` | `String` | ❌ No | Para BUSINESS: debe ser valor válido del enum `GeneralReportYesORNoBusinessEnum` | `YES`, `NO` |
| `emailAuthentication` | `String` | ✅ Sí | String no vacío (inyectado automáticamente desde el contexto de autenticación) | Email del usuario autenticado |

## 🔍 Validaciones Específicas para BUSINESS

### Campos que NO aplican para BUSINESS
- ❌ `phoneNumberStatus`: Debe ser null (solo aplica para PERSONAL)
- ❌ `fraudStatus`: Debe ser null o lista vacía (solo aplica para PERSONAL)

### Campos con validaciones específicas para BUSINESS
- ✅ `customerStatus`: Si se proporciona, debe ser valor válido del enum `GeneralReportCustomerStatusEnum`
- ✅ `cardStatus`: Si se proporciona, debe ser valor válido del enum `GeneralReportCardStatusEnum`
- ✅ `profit`: Si se proporciona, debe ser `YES` o `NO`
- ✅ `category`: Si se proporciona, cada elemento debe seguir el patrón alfabético con espacios y guiones

### Validaciones de fechas
- `regDateFrom` y `regDateTo` son obligatorios y deben tener máximo 5 años de diferencia
- Si se proporciona `unregisteredDateFrom`, también debe proporcionarse `unregisteredDateTo`
- Todas las fechas deben estar en formato YYYY-MM-DD
- Las fechas no pueden estar antes del año mínimo configurado en la aplicación

## 📝 Ejemplo de Request Body Válido

```json
{
  "accountType": "BUSINESS",
  "regDateFrom": "2024-01-01",
  "regDateTo": "2024-12-31",
  "unregisteredDateFrom": "2024-06-01",
  "unregisteredDateTo": "2024-06-30",
  "lastLoginDate": "2024-07-15",
  "lastLoginAfterBefore": "AFTER",
  "customerStatus": ["ACTIVE"],
  "rsaStatus": ["ENABLED"],
  "cardStatus": ["ACTIVE_CARD"],
  "category": ["Retail", "Food & Beverage"],
  "institution": ["BANCO_POPULAR"],
  "primaryCard": "YES",
  "profit": "YES"
}
```

## 🗄️ Queries Utilizadas
## Redshift
```sql
SELECT
  bc.firstname AS firstName,
  bc.lastname AS lastName,
  bc.business_name AS businessName,
  p.path AS PATH,
  bcat.value AS category,
  bc.validated_as_nonprofit AS nonProfit,
  bc.email AS email,
  bci.phone_number AS phoneNumber,
  bci.url_website_socialmedia AS urlWebsiteSocialMedia,
  bci.address_first + ' ' + COALESCE(bci.address_second, '') AS address,
  CASE WHEN TRUE
  AND bcc.status = 'ACTIVE_CARD' THEN bcc.cardnumber ELSE '' END AS primaryCard,
  CASE WHEN TRUE
  AND bcc.status = 'ACTIVE_CARD' THEN FI.name ELSE '' END AS cardFi,
  bci.town AS town,
  bci.state AS state,
  bci.zip_code AS zipCode,
  bs.value AS businessStructure,
  bci.date_incorporation AS startDate,
  CASE WHEN bci.identification_type = 'P' THEN 'SSN' WHEN bci.identification_type = 'B' THEN 'EIN' ELSE NULL END AS identificationType,
  bci.identification_number AS identificationNumber,
  bci.merchant_registration AS merchantRegistration,
  bci.business_id_type AS businessIdType,
  bci.business_id_number AS businessIdNumber,
  mt.value AS estimatedMonthlySales,
  COALESCE(cards.card_count, 0) AS card,
  bc.registration_date AS registrationDate,
  bc.last_login AS lastLogin,
  bc.deactivation_date AS unregisteredDate,
  bc.status_id AS customerStatus,
  bc.unregister_profile AS unregisterProfile,
  bc.unregister_notes AS unregisteredNotes
FROM
  athdb.athprd.business_customers bc
  LEFT JOIN athdb.athprd.business_paths p ON bc.customer_id = p.customer_id
  LEFT JOIN athdb.athprd.business_customer_information bci ON bci.customer_id = bc.customer_id
  LEFT JOIN athdb.athprd.business_category bcat ON bcat.id = bc.industry
  AND bcat.language = 'en'
  LEFT JOIN athdb.athprd.business_structure bs ON bs.id = bci.business_structure
  AND bs.language = 'en'
  LEFT JOIN athdb.athprd.montly_transaction mt ON mt.id = bci.monthly_transactions
  AND mt.language = 'en'
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
  LEFT JOIN athdb.athprd.ath_prefix ap ON ap.PREFIXID = bcc.PREFIXID
  LEFT JOIN (
    SELECT
      customerid,
      COUNT(*) AS card_count
    FROM
      athdb.athprd.business_customer_cards
    WHERE
      GET_ARRAY_LENGTH(ARRAY()) = 0
      OR status = ARRAY()
    GROUP BY
      customerid
  ) cards ON cards.customerid = bc.customer_id
  LEFT JOIN athdb.athprd.financialinstitutions FI ON FI.FIID = ap.FIID
WHERE
  (
    GET_ARRAY_LENGTH(ARRAY()) = 0
    OR UPPER(TRIM(bc.status_id)) = ARRAY()
  )
  AND (
    LENGTH(TRIM('')) = 0
    OR UPPER(TRIM(bcc.primarycard)) = UPPER(TRIM(''))
  )
  AND (
    (LENGTH('01/01/2024') = 0)
    AND (LENGTH('07/01/2024') = 0)
    OR (
      CAST(bc.registration_date AS DATE) BETWEEN TO_DATE('01/01/2024', 'MM/DD/YYYY')
      AND TO_DATE('07/01/2024', 'MM/DD/YYYY')
    )
  )
  AND (
    (LENGTH('') = 0)
    AND (LENGTH('') = 0)
    OR (
      CAST(bc.deactivation_date AS DATE) BETWEEN TO_DATE('', 'MM/DD/YYYY')
      AND TO_DATE('', 'MM/DD/YYYY')
    )
  )
  AND (
    LENGTH('') = 0
    OR bc.last_login > TO_DATE('', 'YYYY-MM-DD')
  )
  AND (
    GET_ARRAY_LENGTH(ARRAY()) = 0
    OR UPPER(TRIM(fi.fiid)) = ARRAY()
  )
  AND (
    GET_ARRAY_LENGTH(ARRAY()) = 0
    OR UPPER(TRIM(bcat.id)) = ARRAY()
  )
  AND (
    LENGTH(TRIM('')) = 0
    OR UPPER(TRIM(bc.validated_as_nonprofit)) = UPPER(TRIM(''))
  )
  AND (
    GET_ARRAY_LENGTH(ARRAY()) = 0
    OR bcc.status = ARRAY()
  )
GROUP BY
  bc.firstname,
  bc.lastname,
  bc.business_name,
  p.path,
  bcat.value,
  bc.validated_as_nonprofit,
  bc.email,
  bcc.cardnumber,
  FI.name,
  bc.registration_date,
  bc.last_login,
  bc.deactivation_date,
  bc.status_id,
  bc.unregister_notes,
  bc.customer_id,
  bc.unregister_profile,
  bci.phone_number,
  bci.url_website_socialmedia,
  bci.address_first,
  bci.address_second,
  bci.town,
  bci.state,
  bci.zip_code,
  bs.value,
  bci.date_incorporation,
  bci.identification_type,
  bci.identification_number,
  bci.merchant_registration,
  mt.value,
  COALESCE(cards.card_count, 0),
  bci.business_id_type,
  bci.business_id_number,
  bcc.status
ORDER BY
  bc.registration_date DESC
```

## Aurora
```sql
--GeneralReportCustomerBusinessUseCase
SELECT
  c.firstname AS firstname,
  c.lastname AS lastname,
  c.business_name AS businessname,
  p.path AS PATH,
  bc.value AS category,
  c.validated_as_nonprofit AS nonprofit,
  c.email AS email,
  bci.phone_number,
  bci.url_website_socialmedia,
  CONCAT(
    CONCAT(bci.address_first, ' '),
    bci.address_second
  ) AS address,
  bci.town,
  bci.state,
  bci.zip_code,
  bs.value AS business_structure,
  bci.date_incorporation AS start_date,
  (
    CASE bci.identification_type WHEN 'P' THEN 'SSN' WHEN 'B' THEN 'EIN' ELSE NULL END
  ) AS identification_type,
  bci.identification_number,
  bci.merchant_registration AS merchant_registration,
  mt.value AS estimated_monthly_sales,
  (
    SELECT
      count(*)
    FROM
      business_customer_cards
    WHERE
      customerid = c.customer_id
      AND status NOT IN('DELETED_CARD', 'INACTIVE_CARD')
  ) AS card,
  (
    SELECT
      card.cardnumber || '|' || pref.fiid
    FROM
      business_customer_cards card,
      ath_prefix pref
    WHERE
      card.customerid = c.customer_id
      AND card.primarycard = 'Y'
      AND card.status = 'ACTIVE_CARD'
      AND card.prefixid = pref.prefixid
  ) AS primary_card,
  (
    SELECT
      financial.name
    FROM
      business_customer_cards card,
      ath_prefix pref,
      FINANCIALINSTITUTIONS financial
    WHERE
      card.customerid = c.customer_id
      AND card.primarycard = 'Y'
      AND card.status = 'ACTIVE_CARD'
      AND card.prefixid = pref.prefixid
      AND financial.FIID = pref.FIID
  ) AS CARD_FI,
  c.registration_date AS registrationdate,
  c.last_login AS last_login,
  c.deactivation_date AS unregistered_date,
  c.status_id AS customer_status,
  c.unregister_profile,
  c.unregister_notes AS unregistered_notes
FROM
  business_customers c
  INNER JOIN business_paths p ON c.customer_id = p.customer_id
  LEFT JOIN BUSINESS_CUSTOMER_INFORMATION bci ON bci.customer_id = c.customer_id
  LEFT JOIN BUSINESS_CATEGORY bc ON bc.id = c.industry
  AND bc.language = 'en'
  LEFT JOIN BUSINESS_STRUCTURE bs ON bs.id = bci.business_structure
  AND bs.language = 'en'
  LEFT JOIN MONTLY_TRANSACTION mt ON mt.id = bci.monthly_transactions
  AND mt.language = 'en'
  INNER JOIN business_customer_cards cc ON c.customer_id = cc.customerid
  INNER JOIN ath_prefix ap ON ap.PREFIXID = cc.PREFIXID
WHERE
  c.status_id = 'ACTIVE'
  AND cc.primarycard = 'Y'
  AND c.registration_date >= '01-Mar-2024'
  AND c.registration_date < '01-May-2024'
  AND c.last_login < '02-Apr-2024'
  AND ap.FIID = 'BPPR'
  AND cc.status = 'ACTIVE_CARD'
GROUP BY
  c.firstname,
  c.lastname,
  c.business_name,
  p.path,
  bc.value,
  c.validated_as_nonprofit,
  c.email,
  c.registration_date,
  c.last_login,
  c.deactivation_date,
  c.status_id,
  c.unregister_notes,
  c.customer_id,
  c.unregister_profile,
  bci.phone_number,
  bci.url_website_socialmedia,
  bci.address_first,
  bci.address_second,
  bci.town,
  bci.state,
  bci.zip_code,
  bs.value,
  bci.date_incorporation,
  bci.identification_type,
  bci.identification_number,
  bci.merchant_registration,
  mt.value
ORDER BY
  c.registration_date DESC OFFSET 0 ROWS FETCH NEXT 1000 ROWS ONLY
SELECT
  bc.firstname AS firstname,
  bc.lastname AS lastname,
  bc.business_name AS businessname,
  p.path AS PATH,
  bcat.value AS category,
  bc.validated_as_nonprofit AS nonprofit,
  bc.email AS email,
  bci.phone_number,
  bci.url_website_socialmedia,
  bci.address_first + ' ' + COALESCE(bci.address_second, '') AS address,
  bcc.cardnumber,
  FI.name AS financial_institution,
  bci.town,
  bci.state,
  bci.zip_code,
  bs.value AS business_structure,
  bci.date_incorporation AS start_date,
  CASE WHEN bci.identification_type = 'P' THEN 'SSN' WHEN bci.identification_type = 'B' THEN 'EIN' ELSE NULL END AS identification_type,
  bci.identification_number,
  bci.merchant_registration AS merchant_registration,
  mt.value AS estimated_monthly_sales,
  -- Subconsulta para contar las tarjetas activas
  COALESCE(cards.card_count, 0) AS card
FROM
  athdb.athprd.business_customers bc
  INNER JOIN athdb.athprd.business_paths p ON bc.customer_id = p.customer_id
  LEFT JOIN athdb.athprd.business_customer_information bci ON bci.customer_id = bc.customer_id
  LEFT JOIN athdb.athprd.business_category bcat ON bcat.id = bc.industry
  AND bcat.language = 'en'
  LEFT JOIN athdb.athprd.business_structure bs ON bs.id = bci.business_structure
  AND bs.language = 'en'
  LEFT JOIN athdb.athprd.montly_transaction mt ON mt.id = bci.monthly_transactions
  AND mt.language = 'en'
  INNER JOIN athdb.athprd.business_customer_cards bcc ON bc.customer_id = bcc.customerid
  INNER JOIN athdb.athprd.ath_prefix ap ON ap.PREFIXID = bcc.PREFIXID
  LEFT JOIN (
    SELECT
      customerid,
      COUNT(*) AS card_count
    FROM
      athdb.athprd.business_customer_cards
    WHERE
      status = 'ACTIVE_CARD'
    GROUP BY
      customerid
  ) cards ON cards.customerid = bc.customer_id
  LEFT JOIN athdb.athprd.financialinstitutions FI ON FI.FIID = ap.FIID
WHERE
  (
    LENGTH(TRIM('')) = 0
    OR UPPER(TRIM(bc.status_id)) = UPPER(TRIM(''))
  ) -- DISABLED_FRAUD, UNREGISTERED, ACTIVE, DISABLED, PENDING_ATHB_VERIFICATION, LOCKED
  AND (
    LENGTH(TRIM('')) = 0
    OR UPPER(TRIM(bcc.primarycard)) = UPPER(TRIM(''))
  ) -- Y, N
  AND (
    (LENGTH('') = 0) -- example 01-01-2024
    AND (LENGTH('') = 0) -- example 26-02-2025 
    OR (
      CAST(bc.registration_date AS DATE) BETWEEN TO_DATE('', 'MM/DD/YYYY')
      AND TO_DATE('', 'MM/DD/YYYY')
    )
  )
  AND (
    LENGTH('') = 0
    OR bc.last_login < TO_DATE('', 'YYYY-MM-DD')
  )
  AND (
    LENGTH(TRIM('')) = 0
    OR UPPER(TRIM(ap.fiid)) = UPPER(TRIM(''))
  )
  AND bcc.status = 'ACTIVE_CARD' -- ACTIVE_CARD, DELETED_CARD, INACTIVE_CARD
  AND bcc.status NOT IN ('DELETED_CARD', 'INACTIVE_CARD') -- ACTIVE_CARD, DELETED_CARD, INACTIVE_CARD
GROUP BY
  bc.firstname,
  bc.lastname,
  bc.business_name,
  p.path,
  bcat.value,
  bc.validated_as_nonprofit,
  bc.email,
  bcc.cardnumber,
  FI.name,
  bc.registration_date,
  bc.last_login,
  bc.deactivation_date,
  bc.status_id,
  bc.unregister_notes,
  bc.customer_id,
  bc.unregister_profile,
  bci.phone_number,
  bci.url_website_socialmedia,
  bci.address_first,
  bci.address_second,
  bci.town,
  bci.state,
  bci.zip_code,
  bs.value,
  bci.date_incorporation,
  bci.identification_type,
  bci.identification_number,
  bci.merchant_registration,
  mt.value,
  COALESCE(cards.card_count, 0)
ORDER BY
  bc.registration_date DESC
```
