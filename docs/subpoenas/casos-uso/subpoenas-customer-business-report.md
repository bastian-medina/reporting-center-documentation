# SubpoenasCustomerBusinessReportUseCase

## 📋 Descripción

**Propósito**: Generar reportes de subpoenas para clientes de tipo empresarial con información corporativa, representantes legales y datos de negocio.

**Tipo de Ejecución**: **Asíncrono** (WebFlux) - Procesamiento en background con notificación por email

**Request Body**: `SubpoenasCustomerRequest`

## 📊 Campos del Request Body

| Campo | Tipo | Obligatorio | Validaciones | Valores Permitidos |
|-------|------|-------------|--------------|-------------------|
| `subType` | `SubpoenasCustomerReportSubTypeEnum` | ✅ Sí | `@NotNull`, debe ser `BUSINESS` | `BUSINESS` (fijo para este caso de uso) |
| `username` | `String` | ✅ Sí | `@NotBlank` | Email del usuario autenticado |
| `regDateFrom` | `String` | ❌ No* | Formato YYYY-MM-DD | Ejemplo: `"2024-01-01"` |
| `regDateTo` | `String` | ❌ No* | Formato YYYY-MM-DD | Ejemplo: `"2024-12-31"` |
| `businessName` | `String` | ❌ No | String válido | Ejemplo: `"Empresa ABC Corp"` |
| `path` | `String` | ❌ No | String no vacío | Ejemplo: `"empresa-abc-corp"` |
| `firstName` | `String` | ❌ No** | String válido | Ejemplo: `"Juan"` |
| `lastName` | `String` | ❌ No** | String válido | Ejemplo: `"Pérez"` |
| `email` | `String` | ❌ No | Formato de email válido | Ejemplo: `"contact@empresa.com"` |
| `ssnOrEin` | `String` | ❌ No | Exactamente 9 dígitos | Ejemplo: `"123456789"` |
| `cardNumber` | `String` | ❌ No | String válido | Ejemplo: `"1234567812345678"` |
| `phoneNumber` | `String` | ❌ No | **NO aplica para BUSINESS** - debe ser null | `null` |
| `dateOfBirth` | `String` | ❌ No | **NO aplica para BUSINESS** - debe ser null | `null` |

## 🔍 Validaciones Específicas en RequestFilterValidator

### Validaciones para subTipo BUSINESS

```java
private boolean validateBusinessFilters(SubpoenasCustomerRequest request, boolean isBusinessSubType) {
    boolean isValidPath = isPathValid(request, isBusinessSubType) || isNoPath(request, isBusinessSubType);
    boolean isValidSsnOrEin = isSsnOrEinValid(request, isBusinessSubType) || noSsnOrEin(request, isBusinessSubType);
    boolean isValidLastNameAndName = isValidLastNameAndName(request, isBusinessSubType);
    
    return isValidPath && isValidSsnOrEin && isValidLastNameAndName;
}
```

### Validaciones específicas aplicadas

- ✅ `path`: Si se proporciona, debe ser string no vacío
- ✅ `ssnOrEin`: Si se proporciona, debe tener exactamente 9 dígitos (`\\d{9}`)
- ✅ `firstName` y `lastName`: Deben proporcionarse ambos o ninguno
- ✅ `email`: Si se proporciona, debe tener formato válido (`^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$`)
- ✅ `cardNumber`: Si se proporciona, debe ser string no vacío
- ❌ `phoneNumber`: NO debe proporcionarse para tipo BUSINESS
- ❌ `dateOfBirth`: NO debe proporcionarse para tipo BUSINESS

### Validaciones de fechas

- ✅ `regDateFrom` y `regDateTo`: Deben proporcionarse ambos o ninguno
- ✅ Formato requerido: YYYY-MM-DD
- ✅ Máximo años entre fechas: configurado en `${report.subpoena.dates.max-years-between-dates}`

### Filtro mínimo requerido

Al menos UNO de los siguientes campos debe tener valor:

- `businessName`
- `path`
- `email`
- `ssnOrEin`
- `cardNumber`
- `regDateFrom` y `regDateTo` (ambos)

## 📝 Ejemplo de Request Body Válido

```json
{
  "subType": "BUSINESS",
  "username": "admin@example.com",
  "regDateFrom": "2024-01-01",
  "regDateTo": "2024-12-31",
  "businessName": "Empresa ABC Corp",
  "path": "empresa-abc-corp",
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "contact@empresa.com",
  "ssnOrEin": "123456789",
  "cardNumber": "1234567812345678"
}
```

## 📝 Ejemplo de Request Body Mínimo

```json
{
  "subType": "BUSINESS",
  "username": "admin@example.com",
  "businessName": "Empresa ABC Corp"
}
```

## 🗄️ Queries Utilizadas

```sql
SELECT
  BC.BUSINESS_NAME AS BUSINESSNAME,
  BC.FIRSTNAME + ' ' + BC.LASTNAME AS CUSTOMER,
  BC.CUSTOMER_ID AS UID,
  BCI.IDENTIFICATION_NUMBER AS IDENTIFICATION_NUMBER,
  CASE WHEN BCI.IDENTIFICATION_TYPE = 'P' THEN 'SSN' WHEN BCI.IDENTIFICATION_TYPE = 'B' THEN 'EIN' END AS IDENTIFICATION_TYPE,
  ABP.PATH AS PATH,
  BC.INDUSTRY AS INDUSTRY,
  BC.EMAIL AS EMAIL,
  CASE WHEN BC.DEACTIVATION_DATE IS NULL THEN TO_CHAR(BC.REGISTRATION_DATE, 'YYYY-MM-DD HH24:MI:SS') ELSE TO_CHAR(BC.REGISTRATION_DATE, 'YYYY-MM-DD HH24:MI:SS') || ' - to - ' || TO_CHAR(BC.DEACTIVATION_DATE, 'YYYY-MM-DD HH24:MI:SS') END AS REGISTRATION,
  BCC.CARDNUMBER AS CARDNUMBER,
  FI.NAME AS FINANCIALINSTITUTION,
  BCC.STATUS AS STATUSCARD,
  BC.STATUS_ID AS ACCOUNTSTATUS
FROM
  athdb.athprd.BUSINESS_PATHS ABP
  INNER JOIN athdb.athprd.BUSINESS_CUSTOMERS BC ON (ABP.CUSTOMER_ID = BC.CUSTOMER_ID)
  LEFT JOIN athdb.athprd.BUSINESS_CUSTOMER_CARDS BCC ON (BCC.CUSTOMERID = BC.CUSTOMER_ID)
  LEFT JOIN athdb.athprd.BUSINESS_CUSTOMER_INFORMATION BCI ON (ABP.CUSTOMER_ID = BCI.CUSTOMER_ID)
  LEFT JOIN athdb.athprd.ATH_PREFIX PRE ON (PRE.PREFIXID = BCC.PREFIXID)
  LEFT JOIN athdb.athprd.FINANCIALINSTITUTIONS FI ON FI.FIID = PRE.fiid
WHERE
  (
    LENGTH('') = 0
    OR UPPER(TRIM(ABP.PATH)) = UPPER(TRIM(''))
  )
  AND (
    (
      (LENGTH('') = 0)
      AND (LENGTH('') = 0)
    )
    OR (
      CAST(BC.REGISTRATION_DATE AS DATE) BETWEEN TO_DATE('', 'MM/DD/YYYY')
      AND TO_DATE('', 'MM/DD/YYYY')
    )
  )
  AND (
    LENGTH('') = 0
    OR UPPER(TRIM(BC.BUSINESS_NAME)) LIKE '%' + UPPER(TRIM('')) + '%'
  )
  AND (
    LENGTH('') = 0
    OR UPPER(TRIM(BC.FIRSTNAME)) LIKE '%' + UPPER(TRIM('')) + '%'
  )
  AND (
    LENGTH('') = 0
    OR UPPER(TRIM(BC.LASTNAME)) LIKE '%' + UPPER(TRIM('')) + '%'
  )
  AND (
    LENGTH('') = 0
    OR UPPER(TRIM(BC.EMAIL)) LIKE '%' + UPPER(TRIM('')) + '%'
  )
  AND (
    LENGTH('') = 0
    OR UPPER(TRIM(BCI.IDENTIFICATION_NUMBER)) LIKE '%' + UPPER(TRIM('')) + '%'
  )
  AND (
    LENGTH(
      '89b602b83f9e31cf50b18938bdfb3100c1fa4fe0808ee61e90fb870711e43fa2'
    ) = 0
    OR UPPER(TRIM(BCC.CARDNUMBER)) LIKE '%' + UPPER(
      TRIM(
        '89b602b83f9e31cf50b18938bdfb3100c1fa4fe0808ee61e90fb870711e43fa2'
      )
    ) + '%'
  )
GROUP BY
  BC.BUSINESS_NAME,
  BC.FIRSTNAME,
  BC.LASTNAME,
  BC.CUSTOMER_ID,
  BCI.IDENTIFICATION_NUMBER,
  BCI.IDENTIFICATION_TYPE,
  ABP.PATH,
  BC.INDUSTRY,
  BC.EMAIL,
  BC.DEACTIVATION_DATE,
  BC.REGISTRATION_DATE,
  BCC.CARDNUMBER,
  BCC.STATUS,
  FI.NAME,
  BC.STATUS_ID
```

## 📋 Notas Importantes

- **Encriptación**: Los campos `ssnOrEin` y `cardNumber` se encriptan antes del procesamiento
- **Desencriptación**: Los datos sensibles se desencriptan al generar el reporte
- **Auditoría**: Se registra evento `BUILD_SUBPOENA_REPORT` en logs de auditoría
- **Notificación**: Email automático al completar el procesamiento
- **Almacenamiento**: Archivo encriptado en S3 con nomenclatura específica
- **Path empresarial**: Campo único para identificación de empresa en el sistema
