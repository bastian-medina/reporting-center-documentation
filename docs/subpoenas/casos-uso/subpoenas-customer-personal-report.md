# SubpoenasCustomerPersonalReportUseCase

## 📋 Descripción

**Propósito**: Generar reportes de subpoenas para clientes de tipo personal con información de KYC, datos personales y de contacto.

**Tipo de Ejecución**: **Asíncrono** (WebFlux) - Procesamiento en background con notificación por email

**Request Body**: `SubpoenasCustomerRequest`

## 📊 Campos del Request Body

| Campo | Tipo | Obligatorio | Validaciones | Valores Permitidos |
|-------|------|-------------|--------------|-------------------|
| `subType` | `SubpoenasCustomerReportSubTypeEnum` | ✅ Sí | `@NotNull`, debe ser `PERSONAL` | `PERSONAL` (fijo para este caso de uso) |
| `username` | `String` | ✅ Sí | `@NotBlank` | Email del usuario autenticado |
| `regDateFrom` | `String` | ❌ No* | Formato YYYY-MM-DD | Ejemplo: `"2024-01-01"` |
| `regDateTo` | `String` | ❌ No* | Formato YYYY-MM-DD | Ejemplo: `"2024-12-31"` |
| `phoneNumber` | `String` | ❌ No | Solo dígitos numéricos | Ejemplo: `"8095551234"` |
| `firstName` | `String` | ❌ No** | String válido | Ejemplo: `"Juan"` |
| `lastName` | `String` | ❌ No** | String válido | Ejemplo: `"Pérez"` |
| `email` | `String` | ❌ No | Formato de email válido | Ejemplo: `"user@example.com"` |
| `dateOfBirth` | `String` | ❌ No | Formato de fecha | Ejemplo: `"1990-01-15"` |
| `ssnOrEin` | `String` | ❌ No | Exactamente 9 dígitos | Ejemplo: `"123456789"` |
| `cardNumber` | `String` | ❌ No | String válido | Ejemplo: `"1234567812345678"` |
| `businessName` | `String` | ❌ No | **NO aplica para PERSONAL** - debe ser null | `null` |
| `path` | `String` | ❌ No | **NO aplica para PERSONAL** - debe ser null | `null` |

## 🔍 Validaciones Específicas en RequestFilterValidator

### Validaciones para subTipo PERSONAL

```java
private boolean validatePersonalFilters(SubpoenasCustomerRequest request, boolean isPersonalSubType) {
    boolean isValidNumber = isPhoneNumberValid(request, isPersonalSubType) || isNoPhoneNumber(request, isPersonalSubType);
    boolean isValidSsnOrEin = isSsnOrEinValid(request, isPersonalSubType) || noSsnOrEin(request, isPersonalSubType);
    boolean isValidLastNameAndName = isValidLastNameAndName(request, isPersonalSubType);
    
    return isValidNumber && isValidSsnOrEin && isValidLastNameAndName;
}
```

### Validaciones específicas aplicadas

- ✅ `phoneNumber`: Si se proporciona, debe contener solo dígitos (`\\d+`)
- ✅ `ssnOrEin`: Si se proporciona, debe tener exactamente 9 dígitos (`\\d{9}`)
- ✅ `firstName` y `lastName`: Deben proporcionarse ambos o ninguno
- ✅ `email`: Si se proporciona, debe tener formato válido (`^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$`)
- ✅ `cardNumber`: Si se proporciona, debe ser string no vacío
- ❌ `businessName`: NO debe proporcionarse para tipo PERSONAL
- ❌ `path`: NO debe proporcionarse para tipo PERSONAL

### Validaciones de fechas

- ✅ `regDateFrom` y `regDateTo`: Deben proporcionarse ambos o ninguno
- ✅ Formato requerido: YYYY-MM-DD
- ✅ Máximo años entre fechas: configurado en `${report.subpoena.dates.max-years-between-dates}`

### Filtro mínimo requerido

Al menos UNO de los siguientes campos debe tener valor:
- `phoneNumber`
- `dateOfBirth`
- `firstName` (con `lastName`)
- `lastName` (con `firstName`)
- `email`
- `ssnOrEin`
- `cardNumber`
- `regDateFrom` y `regDateTo` (ambos)

## 📝 Ejemplo de Request Body Válido

```json
{
  "subType": "PERSONAL",
  "username": "admin@example.com",
  "regDateFrom": "2024-01-01",
  "regDateTo": "2024-12-31",
  "phoneNumber": "8095551234",
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan.perez@example.com",
  "ssnOrEin": "123456789",
  "cardNumber": "1234567812345678"
}
```

## 📝 Ejemplo de Request Body Mínimo

```json
{
  "subType": "PERSONAL",
  "username": "admin@example.com",
  "phoneNumber": "8095551234"
}
```

## 🗄️ Queries Utilizadas

```sql
SELECT
  DENSE_RANK() OVER (
    ORDER BY
      USERNAME,
      REGISTRATIONDATE
  ) AS CUSTOMER,
  FIRSTNAME,
  LASTNAME,
  USERNAME,
  BIRTHDATE,
  EMAIL,
  PHONENUMBER,
  CASE WHEN CONVERT(VARCHAR, DEACTIVATIONDATE) IS NULL THEN CONVERT(VARCHAR, REGISTRATIONDATE) ELSE CONVERT(VARCHAR, REGISTRATIONDATE) + ' - to - ' + CONVERT(VARCHAR, DEACTIVATIONDATE) END AS REGISTRATION,
  CARDS,
  FINANCIALINSTITUTION,
  STATUSCARD,
  ACCOUNTSTATUS
FROM
  (
    SELECT
      CUST.FIRSTNAME AS FIRSTNAME,
      CUST.LASTNAME AS LASTNAME,
      CUST.USERNAME AS USERNAME,
      CUST.BIRTHDATE AS BIRTHDATE,
      CUST.EMAIL AS EMAIL,
      CUST.REGISTRATIONDATE AS REGISTRATIONDATE,
      CUST.DEACTIVATIONDATE AS DEACTIVATIONDATE,
      PHONE.PHONENUMBER AS PHONENUMBER,
      CARD.CARDNUMBER AS CARDS,
      FI.NAME AS FINANCIALINSTITUTION,
      CARD_S.statusname AS STATUSCARD,
      ACCOUNT_S.statusname AS ACCOUNTSTATUS
    FROM
      athdb.athprd.customerownphones PHONE
      INNER JOIN athdb.athprd.customers CUST ON (
        CONVERT(VARCHAR, PHONE.CUSTOMERID) = CUST.CUSTOMERID
      )
      INNER JOIN athprd.statuslist ACCOUNT_S ON ACCOUNT_S.statusid = CUST.statusid
      LEFT JOIN athdb.athprd.customercards CARD ON (
        CONVERT(VARCHAR, PHONE.CUSTOMERID) = CARD.CUSTOMERID
      )
      LEFT JOIN athprd.statuslist CARD_S ON CARD_S.statusid = CARD.statusid
      LEFT JOIN athdb.athprd.ath_prefix PRE ON PRE.prefixid = CARD.prefixid
      LEFT JOIN athdb.athprd.financialinstitutions FI ON FI.FIID = PRE.fiid
    WHERE
      (
        LENGTH('') = 0
        OR PHONE.PHONENUMBER = ''
      )
      AND (
        (
          LENGTH('07/01/2021') = 0
          AND LENGTH('01/01/2024') = 0
        )
        OR (
          CAST(CUST.REGISTRATIONDATE AS DATE) BETWEEN TO_DATE('07/01/2021', 'MM/DD/YYYY')
          AND TO_DATE('01/01/2024', 'MM/DD/YYYY')
        )
      )
      AND (
        LENGTH('') = 0
        OR UPPER(TRIM(CUST.FIRSTNAME)) LIKE '%' + UPPER(TRIM('')) + '%'
      )
      AND (
        LENGTH('') = 0
        OR UPPER(TRIM(CUST.LASTNAME)) LIKE '%' + UPPER(TRIM('')) + '%'
      )
      AND (
        LENGTH('') = 0
        OR UPPER(TRIM(CUST.EMAIL)) LIKE '%' + UPPER(TRIM('')) + '%'
      )
      AND (
        LENGTH('') = 0
        OR CARD.CARDNUMBER = ''
      )
    GROUP BY
      CUST.FIRSTNAME,
      CUST.LASTNAME,
      CUST.USERNAME,
      CUST.BIRTHDATE,
      CUST.EMAIL,
      PHONE.PHONENUMBER,
      CUST.REGISTRATIONDATE,
      CUST.DEACTIVATIONDATE,
      CUST.STATUSID,
      CARD.CARDNUMBER,
      ACCOUNT_S.statusname,
      FI.NAME,
      CARD_S.statusname
  )
ORDER BY
  CUSTOMER,
  ACCOUNTSTATUS
```

## 📋 Notas Importantes

- **Encriptación**: Los campos `ssnOrEin` y `cardNumber` se encriptan antes del procesamiento
- **Desencriptación**: Los datos sensibles se desencriptan al generar el reporte
- **Auditoría**: Se registra evento `BUILD_SUBPOENA_REPORT` en logs de auditoría
- **Notificación**: Email automático al completar el procesamiento
- **Almacenamiento**: Archivo encriptado en S3 con nomenclatura específica
