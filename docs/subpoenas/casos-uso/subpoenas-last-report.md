---
layout: page
title: SubpoenasLastReportUseCase
---

## 📋 Descripción

**Propósito**: Consultar información de los últimos reportes de subpoenas generados por el usuario autenticado, filtrados por tipo de reporte.

**Tipo de Ejecución**: **Síncrono** (WebFlux) - Respuesta inmediata con información de reportes históricos

**Request Body**: Sin request body (parámetros por query string)

## 📊 Parámetros del Request

| Parámetro | Ubicación | Tipo | Obligatorio | Validaciones | Valores Permitidos |
|-----------|-----------|------|-------------|--------------|-------------------|
| `reportType` | Query String | `String` | ✅ Sí | Debe ser valor válido del enum `SubpoenasReportTypeEnum` | `CUSTOMER`, `TRANSACTION` |
| `username` | Query String | `String` | ✅ Sí | Campo no vacío | Email del usuario autenticado |

## 🔍 Validaciones Específicas en RequestFilterValidator

### Validaciones para SubpoenasLastReportsRequest

```java
public Mono<SubpoenasLastReportsRequest> validateSubpoenasLastReportsRequest(SubpoenasLastReportsRequest request) {
    var isValidSubpoenaReportType = isValidSubpoenaReportTypeEnum(request.getReportType());

    return Mono.just(request)
            .filter(valid -> commonFunctionalities.isValidField(request.getReportType()))
            .filter(valid -> commonFunctionalities.isValidField(request.getUsername()))
            .filter(reportTypeValue -> isValidSubpoenaReportType)
            .switchIfEmpty(Mono.error(new TechnicalException(TECHNICAL_ERROR_REQUEST)))
            .thenReturn(request);
}

public static boolean isValidSubpoenaReportTypeEnum(String value) {
    for (SubpoenasReportTypeEnum valueEnum : SubpoenasReportTypeEnum.values()) {
        if (valueEnum.getValue().equals(value)) {
            return true;
        }
    }
    return false;
}
```

### Validaciones específicas aplicadas

- ✅ `reportType`: Debe ser campo válido (no null, no vacío)
- ✅ `reportType`: Debe ser valor válido del enum (`CUSTOMER` o `TRANSACTION`)
- ✅ `username`: Debe ser campo válido (no null, no vacío)

### Lógica de procesamiento por tipo de reporte

#### Tipo CUSTOMER
- Consulta reportes de clientes: `historicalReportService.getLastReportsCustomer(username)`
- Incluye reportes de: PERSONAL, BUSINESS, PERSONAL_DOB

#### Tipo TRANSACTION
- Consulta reportes de transacciones: `historicalReportService.getLastReportsTransaction(username)`
- Incluye reportes de transacciones: PERSONAL, BUSINESS

### Conversión de parámetros por subtipo

```java
private Object processSubTypeReport(SubpoenasCustomerReportSubTypeEnum reportType, String parameters) {
    Object parameter = null;

    switch (reportType) {
        case PERSONAL -> parameter = gsonUtils.stringToModel(parameters, PersonalParameters.class);
        case BUSINESS -> parameter = gsonUtils.stringToModel(parameters, BusinessParameters.class);
        case PERSONAL_DOB -> parameter = gsonUtils.stringToModel(parameters, DOBParameters.class);
        default -> { }
    }
    return parameter;
}
```

## 📝 Ejemplo de Request (CUSTOMER)

```http
GET /api/subpoenas/last-report?reportType=CUSTOMER&username=admin@example.com
Authorization: Bearer <jwt-token>
```

## 📝 Ejemplo de Request (TRANSACTION)

```http
GET /api/subpoenas/last-report?reportType=TRANSACTION&username=admin@example.com
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
            "dateFrom": "2024-01-01",
            "dateTo": "2024-12-31",
            "firstName": "Juan",
            "lastName": "Pérez"
          },
          "fileName": "subpoena_personal_20240115_103000.xlsx"
        }
      ]
    }
  ]
}
```

### Estados Posibles

- `IN_PROGRESS`: Reporte en proceso de generación
- `COMPLETED`: Reporte completado y disponible
- `FAILED`: Error en la generación del reporte

### Tipos de filtros por subtipo

#### PERSONAL (PersonalParameters)
- `phoneNumber`, `dateFrom`, `dateTo`, `firstName`, `lastName`, `email`, `cardNumber`

#### BUSINESS (BusinessParameters)  
- `path`, `dateFrom`, `dateTo`, `businessName`, `firstName`, `lastName`, `email`, `ssnOrEin`, `cardNumber`

#### PERSONAL_DOB (DOBParameters)
- `dateOfBirth`

## 📝 Ejemplo de Response para CUSTOMER

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
            "lastName": "Pérez",
            "email": "juan.perez@example.com"
          },
          "fileName": "subpoena_personal_8095551234_customer_20240115_103000.xlsx"
        },
        {
          "id": "550e8400-e29b-41d4-a716-446655440001",
          "requestedBy": "admin@example.com",
          "creationDate": "2024-01-10T14:20:00Z",
          "status": "COMPLETED",
          "type": "CUSTOMER",
          "subType": "BUSINESS",
          "filters": {
            "path": "empresa-abc-corp",
            "businessName": "Empresa ABC Corp",
            "dateFrom": "01/01/2024",
            "dateTo": "01/31/2024"
          },
          "fileName": "subpoena_business_empresa-abc-corp_customer_20240110_142000.xlsx"
        }
      ]
    }
  ]
}
```

## 📋 Notas Importantes

- **Sin paginación**: Retorna todos los reportes del usuario
- **Ordenamiento**: Por fecha de creación descendente (más recientes primero)
- **Filtrado por usuario**: Solo reportes del usuario autenticado
- **Conversión automática**: Parámetros JSON se convierten a objetos tipados según subtipo
- **Fechas formateadas**: Las fechas se muestran en formato MM/dd/yyyy para display
- **Response consistente**: Misma estructura para ambos tipos de reporte

## ⚠️ Consideraciones

- **Rendimiento**: Sin límite de resultados, podría ser lento con muchos reportes
- **Filtros complejos**: Los filtros se almacenan como JSON y se deserializan dinámicamente
- **Tipos específicos**: Cada subtipo tiene su propia clase de parámetros
- **Histórico completo**: Incluye reportes en todos los estados (IN_PROGRESS, COMPLETED, FAILED)
