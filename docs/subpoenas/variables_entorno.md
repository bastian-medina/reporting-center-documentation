---
layout: page
title: Variables de Entorno - Subpoenas
---

# Variables de Entorno - Microservicio Subpoenas

## 📋 Descripción General

Este documento describe todas las variables de entorno utilizadas en el microservicio de Subpoenas del Reporting Center, organizadas por categorías y ambientes.

## 🏛️ Variables del Microservicio de Subpoenas

### Configuración del Servidor

```bash
# Puerto del servidor Spring Boot (diferente al de reportes generales)
SERVER_PORT=8888

# Perfil activo de Spring (dev, cert, prod)
SPRING_PROFILES_ACTIVE=dev

# Nivel de logging (INFO, WARN, ERROR)
LOG4J_LEVEL=INFO

# Zona horaria del sistema
TIME_ZONE=America/Puerto_Rico

# Variable específica del ambiente de Subpoenas
athmsbp=test_environment

# Configuración SSL
SSL_KEY_STORE=keystore.p12
SSL_KEYSTORE_PASSWORD=changeit
SSL_KEY_PASSWORD=changeit
```

### Rutas de la API

```bash
# Ruta base de la API de Subpoenas
PATH_BASE=/athm-subpoenas-reports/api/v1/

# Endpoint de health check
PATH_HEALTH_CHECK=health

# Rutas de reportes de clientes Subpoenas
PATH_SUBPOENAS_CUSTOMER_REPORT=subpoenas/customer
PATH_OPTIONS_SUBPOENAS_CUSTOMER_REPORT=subpoenas/customer

# Rutas de reportes de transacciones Subpoenas
PATH_SUBPOENAS_TRANSACTION_REPORT=subpoenas/transaction
PATH_OPTIONS_SUBPOENAS_TRANSACTION_REPORT=subpoenas/transaction

# Rutas de búsqueda de Subpoenas
PATH_SUBPOENAS_SEARCH_REPORT=subpoenas
PATH_OPTIONS_SUBPOENAS_SEARCH_REPORT=subpoenas

# Rutas de últimos reportes Subpoenas
PATH_SUBPOENAS_LAST_REPORTS=subpoenas/lastReports
PATH_OPTIONS_SUBPOENAS_LAST_REPORTS=subpoenas/lastReports

# Rutas de descarga (más cortas que reportes generales)
PATH_DOWNLOAD_REPORT=download
PATH_OPTIONS_DOWNLOAD_REPORT=download
```

### Configuración de AWS

```bash
# Región de AWS
REGION_AWS=us-east-1

# Bucket de S3 para reportes Subpoenas
BUCKET_NAME=athm-dev-anl-reporting

# Endpoints para desarrollo local (solo DEV)
S3_ENDPOINT=http://localhost:49153
DYNAMODB_ENDPOINT=http://localhost:8000
SECRETMANAGER_ENDPOINT=http://localhost:49153
```

### Configuración de DynamoDB

```bash
# Tabla de reportes de transacciones históricos Subpoenas
HISTORICAL_TRANSACTION_REPORT_TABLE=ATHM-DEV-ANL-HISTORICAL-REPORT-TRANSACTION

# Tabla de reportes de clientes históricos Subpoenas
HISTORICAL_CUSTOMER_REPORT_TABLE=ATHM-DEV-ANL-HISTORICAL-REPORT-CUSTOMER

# Tabla de reportes generales históricos
HISTORICAL_GENERAL_REPORT_TABLE=ATHM-DEV-ANL-HISTORICAL-REPORT-GENERAL

# Índices de búsqueda por tipo de reporte
HISTORICAL_TRANSACTION_REPORT_TABLE_REPORT_TYPE_INDEX=reportType-createdDate-index
HISTORICAL_CUSTOMER_REPORT_TABLE_REPORT_TYPE_INDEX=reportType-createdDate-index

# Índices de búsqueda por subtipo de reporte
HISTORICAL_TRANSACTION_REPORT_TABLE_REPORT_SUBTYPE_INDEX=reportSubtype-createdDate-index
HISTORICAL_CUSTOMER_REPORT_TABLE_REPORT_SUBTYPE_INDEX=reportSubtype-createdDate-index

# Configuración de procesamiento
DYNAMODB_THREADS=10

# Configuración de TTL (días) - Subpoenas tiene TTL más largo
DAYS_TO_ADD_TTL_RECORD=31
DAYS_LAST_REPORTS=7
```

### Configuración de SQS

```bash
# Endpoint base de SQS
SQS_ENDPOINT=https://sqs.us-east-1.amazonaws.com/846535660599

# Cola para logs de auditoría
SQS_AUDIT_LOG_QUEUE=https://sqs.us-east-1.amazonaws.com/846535660599/athm-dev-anl-auditLogs-queue

# Cola para envío de emails
SQS_EMAIL_QUEUE=https://sqs.us-east-1.amazonaws.com/846535660599/athm-dev-anl-mails-queue
```

### Configuración de Secrets Manager

```bash
# Secreto para credenciales de Redshift
ATHM_REDSHIFT_SECRET_NAME=ATHM-DEV-ANL-REDSHIFT

# Secreto para valores de encriptación
ATHM_CRYPTO_SECRET_NAME=ATHM-DEV-ANL-CRYPTO-VALUE

# Archivo de encriptación
ENCRYPTION_FILE_ATHM=athm-dev-encryption
```

### Configuración de CORS

```bash
# Orígenes permitidos (varía por ambiente)
ALLOWED_ORIGINS=https://reports-dev.athmovil.com
```

### Mensajes de Error Personalizados

```bash
# Error para números de teléfono no registrados
REPORT_SUBPOENA_CUSTOMER_PERSONAL_NO_DATA_FOUND_MESSAGE=Phone Number Not Registered in ATH Móvil.

# Error para negocios no registrados
REPORT_SUBPOENA_CUSTOMER_BUSINESS_NO_DATA_FOUND_MESSAGE=pATH Not Registered in ATH Business.

# Error para fecha de nacimiento no encontrada
REPORT_SUBPOENA_CUSTOMER_DOB_NO_DATA_FOUND_MESSAGE=Not user registered whit this parameter in ATH Móvil.

# Error para transacciones no encontradas en Subpoenas
REPORT_SUBPOENA_TRANSACTION_NO_DATA_FOUND_MESSAGE=No Transactions found for this parameters.

# Error general de datos no encontrados
REPORT_GENERAL_NO_DATA_FOUND_MESSAGE=No data found.
```

## 🏢 Configuración por Ambientes

### Desarrollo (DEV)

```bash
# Servidor
SERVER_PORT=8888
SPRING_PROFILES_ACTIVE=dev
LOG4J_LEVEL=INFO
athmsbp=test_environment

# AWS
BUCKET_NAME=athm-dev-anl-reporting
ALLOWED_ORIGINS=https://reports-dev.athmovil.com

# Endpoints locales (solo para desarrollo)
S3_ENDPOINT=http://localhost:49153
DYNAMODB_ENDPOINT=http://localhost:8000
SECRETMANAGER_ENDPOINT=http://localhost:49153

# Tablas con prefijo DEV
HISTORICAL_TRANSACTION_REPORT_TABLE=ATHM-DEV-ANL-HISTORICAL-REPORT-TRANSACTION
HISTORICAL_CUSTOMER_REPORT_TABLE=ATHM-DEV-ANL-HISTORICAL-REPORT-CUSTOMER
HISTORICAL_GENERAL_REPORT_TABLE=ATHM-DEV-ANL-HISTORICAL-REPORT-GENERAL

# Secretos con prefijo DEV
ATHM_REDSHIFT_SECRET_NAME=ATHM-DEV-ANL-REDSHIFT
ATHM_CRYPTO_SECRET_NAME=ATHM-DEV-ANL-CRYPTO-VALUE

# Colas con prefijo dev
SQS_AUDIT_LOG_QUEUE=https://sqs.us-east-1.amazonaws.com/846535660599/athm-dev-anl-auditLogs-queue
SQS_EMAIL_QUEUE=https://sqs.us-east-1.amazonaws.com/846535660599/athm-dev-anl-mails-queue

# TTL específico para Subpoenas
DAYS_TO_ADD_TTL_RECORD=31
```

### Certificación (CERT)

```bash
# Servidor
SERVER_PORT=8888
SPRING_PROFILES_ACTIVE=cert
LOG4J_LEVEL=WARN
athmsbp=cert_environment

# AWS (sin endpoints locales)
BUCKET_NAME=athm-cert-anl-reporting
ALLOWED_ORIGINS=https://reports-cert.athmovil.com

# Tablas con prefijo CERT
HISTORICAL_TRANSACTION_REPORT_TABLE=ATHM-CERT-ANL-HISTORICAL-REPORT-TRANSACTION
HISTORICAL_CUSTOMER_REPORT_TABLE=ATHM-CERT-ANL-HISTORICAL-REPORT-CUSTOMER
HISTORICAL_GENERAL_REPORT_TABLE=ATHM-CERT-ANL-HISTORICAL-REPORT-GENERAL

# Secretos con prefijo CERT
ATHM_REDSHIFT_SECRET_NAME=ATHM-CERT-ANL-REDSHIFT
ATHM_CRYPTO_SECRET_NAME=ATHM-CERT-ANL-CRYPTO-VALUE

# Colas con prefijo cert
SQS_AUDIT_LOG_QUEUE=https://sqs.us-east-1.amazonaws.com/846535660599/athm-cert-anl-auditLogs-queue
SQS_EMAIL_QUEUE=https://sqs.us-east-1.amazonaws.com/846535660599/athm-cert-anl-mails-queue

# TTL específico para Subpoenas
DAYS_TO_ADD_TTL_RECORD=31
```

### Producción (PROD)

```bash
# Servidor
SERVER_PORT=8888
SPRING_PROFILES_ACTIVE=prod
LOG4J_LEVEL=ERROR
athmsbp=prod_environment

# AWS
BUCKET_NAME=athm-prod-anl-reporting
ALLOWED_ORIGINS=https://reports.athmovil.com

# Tablas con prefijo PROD
HISTORICAL_TRANSACTION_REPORT_TABLE=ATHM-PROD-ANL-HISTORICAL-REPORT-TRANSACTION
HISTORICAL_CUSTOMER_REPORT_TABLE=ATHM-PROD-ANL-HISTORICAL-REPORT-CUSTOMER
HISTORICAL_GENERAL_REPORT_TABLE=ATHM-PROD-ANL-HISTORICAL-REPORT-GENERAL

# Secretos con prefijo PROD
ATHM_REDSHIFT_SECRET_NAME=ATHM-PROD-ANL-REDSHIFT
ATHM_CRYPTO_SECRET_NAME=ATHM-PROD-ANL-CRYPTO-VALUE

# Colas con prefijo prod
SQS_AUDIT_LOG_QUEUE=https://sqs.us-east-1.amazonaws.com/846535660599/athm-prod-anl-auditLogs-queue
SQS_EMAIL_QUEUE=https://sqs.us-east-1.amazonaws.com/846535660599/athm-prod-anl-mails-queue

# TTL específico para Subpoenas
DAYS_TO_ADD_TTL_RECORD=31
```

## 🔍 Diferencias Principales con Reportes Generales

### Variables Específicas de Subpoenas

```bash
# Puerto diferente
SERVER_PORT=8888  # vs 8889 en reportes generales

# Ruta base específica
PATH_BASE=/athm-subpoenas-reports/api/v1/  # vs /athm-general-reports/api/v1/

# Bucket compartido (no específico por servicio)
BUCKET_NAME=athm-dev-anl-reporting  # vs athm-dev-anl-general-reports

# Rutas más cortas para descarga
PATH_DOWNLOAD_REPORT=download  # vs general/report-download

# TTL más largo para retención de Subpoenas
DAYS_TO_ADD_TTL_RECORD=31  # vs 7 días en reportes generales

# Variable específica del ambiente
athmsbp=test_environment  # Solo existe en Subpoenas

# Nombres de tablas diferentes
HISTORICAL_TRANSACTION_REPORT_TABLE=ATHM-DEV-ANL-HISTORICAL-REPORT-TRANSACTION
# vs ATHM-DEV-ANL-HISTORICAL-TRANSACTION-GENERAL en reportes generales

HISTORICAL_CUSTOMER_REPORT_TABLE=ATHM-DEV-ANL-HISTORICAL-REPORT-CUSTOMER
# vs ATHM-DEV-ANL-HISTORICAL-CUSTOMER-GENERAL en reportes generales
```

### Rutas de API Específicas

```bash
# Todas las rutas usan "subpoenas" como prefijo
PATH_SUBPOENAS_CUSTOMER_REPORT=subpoenas/customer
PATH_SUBPOENAS_TRANSACTION_REPORT=subpoenas/transaction
PATH_SUBPOENAS_SEARCH_REPORT=subpoenas
PATH_SUBPOENAS_LAST_REPORTS=subpoenas/lastReports

# vs rutas con "general" en reportes generales:
# general/customer, general/transaction, general, general/lastReports
```

### Configuración de Retención

```bash
# Subpoenas tiene mayor retención por requerimientos legales
DAYS_TO_ADD_TTL_RECORD=31  # 31 días para Subpoenas
DAYS_LAST_REPORTS=7        # 7 días para consultas recientes (igual en ambos)
```
