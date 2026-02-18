---
layout: page
title: SubpoenasCustomerDOBReportUseCase
---

## 📋 Descripción

**Propósito**: Generar reportes de subpoenas para búsqueda de clientes por fecha de nacimiento específica (Date of Birth).

**Tipo de Ejecución**: **Asíncrono** (WebFlux) - Procesamiento en background con notificación por email

**Request Body**: `SubpoenasDOBRequest`

## 📊 Campos del Request Body

| Campo | Tipo | Obligatorio | Validaciones | Valores Permitidos |
|-------|------|-------------|--------------|-------------------|
| `subType` | `SubpoenasCustomerReportSubTypeEnum` | ✅ Sí | `@NotNull`, debe ser `PERSONAL_DOB` | `PERSONAL_DOB` (fijo para este caso de uso) |
| `username` | `String` | ✅ Sí | `@NotBlank` | Email del usuario autenticado |
| `dateOfBirth` | `String` | ✅ Sí | `@NotBlank`, formato YYYY-MM-DD | Ejemplo: `"1990-01-15"` |

## 🔍 Validaciones Específicas en RequestFilterValidator

### Validaciones para SubpoenasDOBRequest

```java
public Mono<SubpoenasDOBRequest> validateSubpoenasDOBRequest(SubpoenasDOBRequest request) {
    Set<ConstraintViolation<SubpoenasDOBRequest>> constraintViolations = validator.validate(request);

    return Mono.just(constraintViolations)
            .map(Set::isEmpty)
            .switchIfEmpty(Mono.error(new TechnicalException(TECHNICAL_ERROR_REQUEST)))
            .thenReturn(request);
}
```

### Validaciones específicas aplicadas

- ✅ `subType`: Debe ser `PERSONAL_DOB` (validación implícita en handler)
- ✅ `username`: Campo obligatorio no vacío (`@NotBlank`)
- ✅ `dateOfBirth`: Campo obligatorio no vacío (`@NotBlank`)
- ✅ **Formato de fecha**: Debe ser YYYY-MM-DD (validado en el modelo)
- ✅ **Conversión automática**: Se convierte a formato MM/dd/yyyy para display

### Procesamiento de fecha

```java
private String dateFormaterToDisplayDOB(String inputDate) {
    String YYYY_MM_DD = "yyyy-MM-dd";
    String MM_DD_YYYY = "MM/dd/yyyy";
    
    DateTimeFormatter inputFormatter = DateTimeFormatter.ofPattern(YYYY_MM_DD);
    DateTimeFormatter outputFormatter = DateTimeFormatter.ofPattern(MM_DD_YYYY);
    
    try {
        LocalDate date = LocalDate.parse(inputDate, inputFormatter);
        return date.format(outputFormatter);
    } catch (DateTimeParseException e) {
        throw new TechnicalException(TECHNICAL_ERROR_INVALID_DATE);
    }
}
```

### Validaciones automáticas

- ✅ Formato de entrada: YYYY-MM-DD
- ✅ Formato de salida para display: MM/dd/yyyy
- ✅ Validación de fecha válida (no fechas inválidas como 32/13/2024)
- ✅ Error técnico si la fecha no puede parsearse

## 📝 Ejemplo de Request Body Válido

```json
{
  "subType": "PERSONAL_DOB",
  "username": "admin@example.com",
  "dateOfBirth": "1990-01-15"
}
```

## 📝 Ejemplo de Request Body con Error

```json
{
  "subType": "PERSONAL_DOB",
  "username": "admin@example.com",
  "dateOfBirth": "1990-13-32"  // ❌ Fecha inválida
}
```

## 🗄️ Queries Utilizadas

```sql
SELECT
  cust.CUSTOMERID,
  cust.FIRSTNAME,
  cust.LASTNAME,
  cust.USERNAME,
  phone.PHONENUMBER,
  cust.EMAIL,
  status.STATUSNAME,
  cust.BIRTHDATE
FROM
  athdb.athprd.customers AS cust
  INNER JOIN athdb.athprd.STATUSLIST AS status ON cust.STATUSID = status.STATUSID
  LEFT JOIN athdb.athprd.CUSTOMEROWNPHONES AS phone ON phone.CUSTOMERID = cust.CUSTOMERID
WHERE
  TO_CHAR(cust.BIRTHDATE, 'YYYY-MM-DD') = '1988-05-06'
```

## 📋 Notas Importantes

- **Búsqueda específica**: Solo busca por fecha de nacimiento exacta
- **Sin encriptación**: No maneja datos encriptados como otros casos de uso
- **Formato automático**: Convierte automáticamente YYYY-MM-DD a MM/dd/yyyy
- **Auditoría**: Se registra evento `BUILD_SUBPOENA_REPORT` en logs de auditoría
- **Notificación**: Email automático al completar el procesamiento
- **Almacenamiento**: Archivo encriptado en S3 con nomenclatura específica para DOB
- **Nomenclatura especial**: Usa `FileNameGenerator.createFileNameSubpoenasDOBReport()`

## ⚠️ Diferencias con otros casos de uso

- **Request específico**: Usa `SubpoenasDOBRequest` en lugar de `SubpoenasCustomerRequest`
- **Campo único**: Solo requiere fecha de nacimiento, sin otros filtros
- **Sin filtros múltiples**: No permite combinación de filtros como otros casos
- **Búsqueda exacta**: No permite rangos de fechas, solo fecha específica
