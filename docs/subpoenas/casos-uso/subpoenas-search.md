# SubpoenasSearchUseCase

## 📋 Descripción

**Propósito**: Buscar reportes de subpoenas existentes por diferentes criterios como ID específico, subtipo, fechas, estado y otros filtros.

**Tipo de Ejecución**: **Síncrono** (WebFlux) - Respuesta inmediata con resultados de búsqueda

**Request Body**: Sin request body (parámetros por query string)

## 📊 Parámetros del Request

| Parámetro | Ubicación | Tipo | Obligatorio | Validaciones | Valores Permitidos |
|-----------|-----------|------|-------------|--------------|-------------------|
| `subType` | Query String | `String` | ❌ No* | Debe ser valor válido del enum `SubpoenasCustomerReportSubTypeEnum` | `PERSONAL`, `BUSINESS`, `PERSONAL_DOB` |
| `id` | Query String | `String` | ❌ No* | String válido | UUID del reporte |
| `from` | Query String | `String` | ❌ No** | Formato YYYY-MM-DD | Ejemplo: `"2024-01-01"` |
| `to` | Query String | `String` | ❌ No** | Formato YYYY-MM-DD | Ejemplo: `"2024-12-31"` |
| `status` | Query String | `String` | ❌ No | String válido | `IN_PROGRESS`, `COMPLETED`, `FAILED` |
| `phone` | Query String | `String` | ❌ No | String válido | Ejemplo: `"8095551234"` |
| `path` | Query String | `String` | ❌ No | String válido | Ejemplo: `"empresa-abc-corp"` |
| `birthdate` | Query String | `String` | ❌ No | Formato de fecha | Ejemplo: `"1990-01-15"` |
| `cardNumber` | Query String | `String` | ❌ No | String válido | Ejemplo: `"1234567812345678"` |
| `username` | Query String | `String` | ✅ Sí | Campo no vacío | Email del usuario autenticado |

## 🔍 Validaciones Específicas en RequestFilterValidator

### Validaciones para SubpoenasSearchRequest

```java
public Mono<SubpoenasSearchRequest> validateSubpoenasSearchRequest(SubpoenasSearchRequest request) {
    Set<ConstraintViolation<SubpoenasSearchRequest>> constraintViolations = validator.validate(request);
    boolean isSubTypeSet = commonFunctionalities.isValidField(request.getSubType());

    if (isSubTypeSet) {
        var isValidSubType = isValidSubTypeEnum(request.getSubType());
        var isDateFromSet = commonFunctionalities.isValidField(request.getRegDateFrom());
        var isDateToSet = commonFunctionalities.isValidField(request.getRegDateTo());

        return Mono.just(constraintViolations)
                .map(Set::isEmpty)
                .filter(valid -> valid)
                .filter(subType -> isValidSubType)
                .filter(dateFrom -> isDateFromSet)
                .filter(dateTo -> isDateToSet)
                .switchIfEmpty(Mono.error(new TechnicalException(TECHNICAL_ERROR_REQUEST)))
                .thenReturn(request);
    } else {
        var isIdSet = commonFunctionalities.isValidField(request.getId());

        return Mono.just(constraintViolations)
                .map(Set::isEmpty)
                .filter(valid -> valid)
                .filter(id -> isIdSet)
                .switchIfEmpty(Mono.error(new TechnicalException(TECHNICAL_ERROR_REQUEST)))
                .thenReturn(request);
    }
}
```

### Validaciones específicas aplicadas

#### Búsqueda por subtipo
- ✅ `subType`: Debe ser valor válido del enum (`PERSONAL`, `BUSINESS`, `PERSONAL_DOB`)
- ✅ `from`: Obligatorio si se proporciona `subType`
- ✅ `to`: Obligatorio si se proporciona `subType`

#### Búsqueda por ID
- ✅ `id`: Obligatorio si NO se proporciona `subType`

### Lógica de procesamiento por subtipo

#### PERSONAL
- Busca en reportes de clientes personales Y transacciones personales
- Combina resultados de ambas búsquedas
- Aplica filtros: `phone`, `status`, `from`, `to`, `birthdate`, `cardNumber`

#### BUSINESS
- Busca en reportes de clientes empresariales Y transacciones empresariales
- Combina resultados de ambas búsquedas
- Aplica filtros: `path`, `status`, `from`, `to`, `cardNumber`

#### PERSONAL_DOB
- Busca SOLO en reportes DOB de clientes
- Aplica filtros: `birthdate`, `status`, `from`, `to`

#### Por ID específico
- Busca en ambas tablas (customer y transaction) por ID específico
- Retorna el reporte que coincida con el ID

## 📝 Ejemplo de Request (búsqueda por subtipo)

```http
GET /api/subpoenas/search?subType=PERSONAL&from=2024-01-01&to=2024-12-31&phone=8095551234&username=admin@example.com
Authorization: Bearer <jwt-token>
```

## 📝 Ejemplo de Request (búsqueda por ID)

```http
GET /api/subpoenas/search?id=550e8400-e29b-41d4-a716-446655440000&username=admin@example.com
Authorization: Bearer <jwt-token>
```

## 📤 Response Esperado

### Estructura del Response

```json
{
  "data": [
    {
      "reports": [
        {
          "id": "uuid-report-id",
          "requestedBy": "admin@example.com",
          "creationDate": "2024-01-15T10:30:00Z",
          "status": "COMPLETED",
          "type": "CUSTOMER",
          "subType": "PERSONAL",
          "filters": {
            "phoneNumber": "8095551234",
            "dateFrom": "01/01/2024",
            "dateTo": "12/31/2024"
          },
          "fileName": "subpoena_personal_20240115_103000.xlsx"
        }
      ]
    }
  ]
}
```

### Conversión de parámetros por subtipo

```java
private Object processReportType(SubpoenasCustomerReportSubTypeEnum reportSubType, String parameters) {
    Object parameter = null;

    switch (reportSubType) {
        case PERSONAL -> parameter = gsonUtils.stringToModel(parameters, PersonalParameters.class);
        case BUSINESS -> parameter = gsonUtils.stringToModel(parameters, BusinessParameters.class);
        case PERSONAL_DOB -> parameter = gsonUtils.stringToModel(parameters, DOBParameters.class);
        default -> { }
    }

    return parameter;
}
```

## 📝 Ejemplo de Response para PERSONAL

```json
{
  "data": [
    {
      "reports": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "requestedBy": "admin@example.com",
          "creationDate": "2024-01-15T10:30:00Z",
          "status": "COMPLETED",
          "type": "CUSTOMER",
          "subType": "PERSONAL",
          "filters": {
            "phoneNumber": "8095551234",
            "dateFrom": "01/01/2024",
            "dateTo": "12/31/2024",
            "firstName": "Juan",
            "lastName": "Pérez"
          },
          "fileName": "subpoena_personal_8095551234_customer_20240115_103000.xlsx"
        },
        {
          "id": "550e8400-e29b-41d4-a716-446655440001",
          "requestedBy": "admin@example.com",
          "creationDate": "2024-01-12T16:45:00Z",
          "status": "COMPLETED",
          "type": "TRANSACTION",
          "subType": "PERSONAL",
          "filters": {
            "phoneNumber": "8095551234",
            "dateFrom": "01/01/2024",
            "dateTo": "01/31/2024",
            "transactionId": "TXN123456"
          },
          "fileName": "subpoena_personal_8095551234_transaction_20240112_164500.xlsx"
        }
      ]
    }
  ]
}
```

## 📋 Notas Importantes

- **Búsqueda combinada**: Para PERSONAL y BUSINESS busca en customer Y transaction
- **Búsqueda específica**: Para PERSONAL_DOB busca solo en customer
- **Unificación de resultados**: Combina resultados de múltiples tablas
- **Conversión automática**: Parámetros JSON se convierten a objetos tipados
- **Filtrado dinámico**: Aplica filtros según el subtipo y parámetros proporcionados
- **Response consistente**: Misma estructura para todos los tipos de búsqueda

## ⚠️ Validaciones críticas

- **Modo exclusivo**: O se proporciona `subType` con fechas, o se proporciona `id`
- **Fechas obligatorias**: Si se usa `subType`, entonces `from` y `to` son obligatorios
- **Enum válido**: `subType` debe ser uno de los valores permitidos del enum
- **Sin combinación**: No se puede buscar por `id` Y por `subType` simultáneamente

## 🔍 Casos de uso de búsqueda

### Por teléfono (PERSONAL)
```http
GET /api/subpoenas/search?subType=PERSONAL&from=2024-01-01&to=2024-12-31&phone=8095551234&username=admin@example.com
```

### Por empresa (BUSINESS)
```http
GET /api/subpoenas/search?subType=BUSINESS&from=2024-01-01&to=2024-12-31&path=empresa-abc&username=admin@example.com
```

### Por fecha de nacimiento (PERSONAL_DOB)
```http
GET /api/subpoenas/search?subType=PERSONAL_DOB&from=2024-01-01&to=2024-12-31&birthdate=1990-01-15&username=admin@example.com
```

### Por ID específico
```http
GET /api/subpoenas/search?id=550e8400-e29b-41d4-a716-446655440000&username=admin@example.com
```
