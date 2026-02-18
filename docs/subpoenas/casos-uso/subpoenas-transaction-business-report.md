---
layout: page
title: SubpoenasTransactionBusinessReportUseCase
---

## 📋 Descripción

**Propósito**: Generar reportes de subpoenas para transacciones de clientes empresariales incluyendo transacciones corporativas e información empresarial.

**Tipo de Ejecución**: **Asíncrono** (WebFlux) - Procesamiento en background con notificación por email

**Request Body**: `SubpoenasTransactionRequest`

## 📊 Campos del Request Body

| Campo | Tipo | Obligatorio | Validaciones | Valores Permitidos |
|-------|------|-------------|--------------|-------------------|
| `subType` | `SubpoenasTransactionReportSubTypeEnum` | ✅ Sí | `@NotNull`, debe ser `BUSINESS` | `BUSINESS` (fijo para este caso de uso) |
| `username` | `String` | ✅ Sí | `@NotBlank` | Email del usuario autenticado |
| `transDateFrom` | `String` | ❌ No* | Formato YYYY-MM-DD | Ejemplo: `"2024-01-01"` |
| `transDateTo` | `String` | ❌ No* | Formato YYYY-MM-DD | Ejemplo: `"2024-12-31"` |
| `path` | `String` | ❌ No | String no vacío | Ejemplo: `"empresa-abc-corp"` |
| `businessName` | `String` | ❌ No | String válido | Ejemplo: `"Empresa ABC Corp"` |
| `firstName` | `String` | ❌ No | String válido | Ejemplo: `"Juan"` |
| `lastName` | `String` | ❌ No | String válido | Ejemplo: `"Pérez"` |
| `email` | `String` | ❌ No | String válido | Ejemplo: `"contact@empresa.com"` |
| `transactionId` | `String` | ❌ No | String válido | Ejemplo: `"TXN123456789"` |
| `cardNumber` | `String` | ❌ No | Mínimo 16 dígitos | Ejemplo: `"1234567812345678"` |
| `phoneNumber` | `String` | ❌ No | **NO aplica para BUSINESS** - debe ser null | `null` |
| `targetPhoneNumber` | `String` | ❌ No | **NO aplica para BUSINESS** - debe ser null | `null` |

## 🔍 Validaciones Específicas en RequestFilterValidator

### Validaciones para transacciones BUSINESS

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

- ✅ **Búsqueda válida para BUSINESS**: Al menos uno de:
  - `cardNumber` válido (mínimo 16 dígitos: `\\d{16,}`)
  - `transactionId` no vacío
  - `path` no vacío (específico para BUSINESS)

- ✅ **Fechas obligatorias**: Si NO hay `transactionId`, entonces `transDateFrom` y `transDateTo` son obligatorios
- ✅ **Rango de fechas**: Máximo 2 años entre `transDateFrom` y `transDateTo`
- ✅ **Formato de fechas**: YYYY-MM-DD (validado con patrón `^\\d{4}-\\d{2}-\\d{2}$`)
- ❌ **Campos NO aplicables**: `phoneNumber` y `targetPhoneNumber` deben ser null para BUSINESS

### Lógica de procesamiento por tipo de transacción

#### Transacciones Business
- Se procesan según los filtros empresariales proporcionados
- Incluye desencriptación de números de tarjetas empresariales
- Filtra por `path`, `businessName`, fechas de transacción

#### Información Business
- Siempre se incluye información empresarial asociada
- Incluye datos de la empresa y representantes legales
- Desencriptación de datos sensibles empresariales

## 📝 Ejemplo de Request Body Válido (con transactionId)

```json
{
  "subType": "BUSINESS",
  "username": "admin@example.com",
  "transactionId": "TXN123456789",
  "businessName": "Empresa ABC Corp",
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "contact@empresa.com"
}
```

## 📝 Ejemplo de Request Body Válido (con fechas)

```json
{
  "subType": "BUSINESS",
  "username": "admin@example.com",
  "transDateFrom": "2024-01-01",
  "transDateTo": "2024-12-31",
  "path": "empresa-abc-corp",
  "businessName": "Empresa ABC Corp",
  "cardNumber": "1234567812345678"
}
```

## 📝 Ejemplo de Request Body Mínimo

```json
{
  "subType": "BUSINESS",
  "username": "admin@example.com",
  "path": "empresa-abc-corp",
  "transDateFrom": "2024-01-01",
  "transDateTo": "2024-12-31"
}
```

## 🗄️ Queries Utilizadas

```sql
SELECT
  TRANSACTIONID,
  TRANSACTIONDATE,
  TRANSACTIONTYPE,
  TRANSACTIONSTATUS,
  SOURCECUSTOMERID,
  SOURCECUSTOMERNAME,
  SOURCEID,
  SOURCECUSTOMEREMAIL,
  SOURCEPLASTICNUMBER,
  SOURCEACCOUNTSECTION,
  SOURCEGROUPID,
  TARGETCUSTOMERID,
  TARGETCUSTOMERNAME,
  TARGETID,
  TARGETCUSTOMEREMAIL,
  TARGETCARDID,
  TARGETPLASTICNUMBER,
  TARGETACCOUNTSECTION,
  TARGETGROUPID,
  AMOUNT,
  MESSAGE,
  CHANNELID,
  AUDITTRACENUMBER,
  BTRANSSTATUSCODE,
  EFFECTIVEDATE,
  REVERSEDDATE,
  TERMINALDESCRIPTION,
  EXPIREDAYS,
  RECIPIENT_FEE,
  REFUNDSTATUS,
  TRANSACTIONDAILYID,
  SOURCECARDID,
  IDADDRESS_REF_NUMBER,
  TRANSACTION_SUBTYPE,
  AMOUNT_REFUNDED
FROM
  athdb.athprd.BUSINESS_TRANSACTIONS BT
WHERE
  (
    (
      LENGTH(TRIM('01/01/2025')) = 0
      AND LENGTH(TRIM('12/31/2025')) = 0
    )
    OR (
      CAST(BT.TRANSACTIONDATE AS DATE) BETWEEN TO_DATE('01/01/2025', 'MM/DD/YYYY')
      AND TO_DATE('12/31/2025', 'MM/DD/YYYY')
    )
  )
  AND (
    LENGTH(TRIM('')) = 0
    OR (
      UPPER(TRIM(BT.TARGETID)) = UPPER(TRIM(''))
      OR UPPER(TRIM(BT.SOURCEID)) = UPPER(TRIM(''))
    )
  )
  AND (
    LENGTH(TRIM('')) = 0
    OR UPPER(TRIM(BT.TARGETCUSTOMERNAME)) = UPPER(TRIM(''))
  )
  AND (
    LENGTH(TRIM('')) = 0
    OR UPPER(TRIM(BT.SOURCECUSTOMEREMAIL)) = UPPER(TRIM(''))
  )
  AND (
    LENGTH(TRIM('')) = 0
    OR UPPER(TRIM(BT.SOURCECUSTOMERNAME)) LIKE '%' || UPPER(TRIM('')) || '%'
  )
  AND (
    LENGTH(
      TRIM(
        '00728933244fbdba40d3190f4600069cc1fa4fe0808ee61e90fb870711e43fa2'
      )
    ) = 0
    OR (
      -- SOURCE
      UPPER(TRIM(BT.SOURCEPLASTICNUMBER)) = UPPER(
        TRIM(
          '00728933244fbdba40d3190f4600069cc1fa4fe0808ee61e90fb870711e43fa2'
        )
      )
      OR -- TARGET
      UPPER(TRIM(BT.TARGETPLASTICNUMBER)) = UPPER(
        TRIM(
          '00728933244fbdba40d3190f4600069cc1fa4fe0808ee61e90fb870711e43fa2'
        )
      )
    )
  )
  AND (
    LENGTH('') = 0
    OR (BT.TRANSACTIONID = '')
  )
ORDER BY
  TRANSACTIONDATE DESC
```



## 📋 Notas Importantes

- **Múltiples hojas Excel**: Genera 2 hojas (Business Transactions, Business Information)
- **Encriptación**: Los campos `cardNumber` se encriptan antes del procesamiento
- **Desencriptación**: Los números de tarjetas empresariales se desencriptan en el resultado
- **Path empresarial**: Campo clave para identificación única de la empresa
- **Auditoría**: Se registra evento `BUILD_SUBPOENA_REPORT` en logs de auditoría
- **Notificación**: Email automático al completar el procesamiento
- **Almacenamiento**: Archivo encriptado en S3 con nomenclatura basada en `path`

## ⚠️ Validaciones críticas

- **Sin transactionId**: Requiere fechas obligatorias (`transDateFrom` y `transDateTo`)
- **Con transactionId**: Las fechas son opcionales
- **Rango máximo**: 2 años entre fechas (configurado en `${report.subpoena.dates.max-years-between-dates}`)
- **Formato estricto**: Fechas deben seguir patrón YYYY-MM-DD exacto
- **Identificación empresarial**: Al menos `path`, `cardNumber` o `transactionId` debe proporcionarse

## 🏢 Diferencias con PERSONAL

- **Campo `path`**: Específico para empresas, no disponible en PERSONAL
- **Sin teléfonos**: No maneja `phoneNumber` ni `targetPhoneNumber`
- **Hojas diferentes**: Solo 2 hojas vs 4 hojas en PERSONAL
- **Parámetros empresariales**: Usa `BusinessParameters` en lugar de `PersonalParameters`
- **Nomenclatura**: Archivos usan `BUSINESS_SUBPOENAS` y `path` para identificación
