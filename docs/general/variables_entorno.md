---
layout: page
title: Variables de Entorno
---

## 📋 Descripción General

Este documento describe todas las variables de entorno utilizadas en los microservicios del Reporting Center, organizadas por categorías y ambientes.

## 🏗️ Variables del Microservicio de Reportes Generales

### Configuración del Servidor

```bash
# Puerto del servidor Spring Boot
SERVER_PORT=8889

# Perfil activo de Spring (dev, cert, prod)
SPRING_PROFILES_ACTIVE=dev

# Nivel de logging (INFO, WARN, ERROR)
LOG4J_LEVEL=INFO

# Zona horaria del sistema
TIME_ZONE=America/Puerto_Rico

# Configuración SSL
SSL_KEY_STORE=keystore.p12
SSL_KEYSTORE_PASSWORD=changeit
SSL_KEY_PASSWORD=changeit
```

### Rutas de la API

```bash
# Ruta base de la API
PATH_BASE=/athm-general-reports/api/v1/

# Endpoint de health check
PATH_HEALTH_CHECK=health

# Rutas de reportes de clientes
PATH_SUBPOENAS_CUSTOMER_REPORT=general/customer
PATH_OPTIONS_SUBPOENAS_CUSTOMER_REPORT=general/customer

# Rutas de reportes de transacciones
PATH_SUBPOENAS_TRANSACTION_REPORT=general/transaction
PATH_OPTIONS_SUBPOENAS_TRANSACTION_REPORT=general/transaction

# Rutas de búsqueda
PATH_SUBPOENAS_SEARCH_REPORT=general
PATH_OPTIONS_SUBPOENAS_SEARCH_REPORT=general

# Rutas de últimos reportes
PATH_SUBPOENAS_LAST_REPORTS=general/lastReports
PATH_OPTIONS_SUBPOENAS_LAST_REPORTS=general/lastReports

# Rutas de descarga
PATH_DOWNLOAD_REPORT=general/report-download
PATH_OPTIONS_DOWNLOAD_REPORT=general/report-download
```

### Configuración de AWS

```bash
# Región de AWS
REGION_AWS=us-east-1

# Bucket de S3 (varía por ambiente: athm-{env}-anl-general-reports)
BUCKET_NAME=athm-dev-anl-general-reports

# Endpoints para desarrollo local (solo DEV)
S3_ENDPOINT=http://localhost:49153
DYNAMODB_ENDPOINT=http://localhost:8000
SECRETMANAGER_ENDPOINT=http://localhost:49153
```

### Configuración de DynamoDB

```bash
# Tabla de reportes de transacciones históricos
HISTORICAL_TRANSACTION_REPORT_TABLE=ATHM-DEV-ANL-HISTORICAL-TRANSACTION-GENERAL

# Tabla de reportes de clientes históricos
HISTORICAL_CUSTOMER_REPORT_TABLE=ATHM-DEV-ANL-HISTORICAL-CUSTOMER-GENERAL

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

# Configuración de TTL (días)
DAYS_TO_ADD_TTL_RECORD=7
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

# Error para transacciones no encontradas
REPORT_SUBPOENA_TRANSACTION_NO_DATA_FOUND_MESSAGE=No Transactions found for this parameters.

# Error general de datos no encontrados
REPORT_GENERAL_NO_DATA_FOUND_MESSAGE=No data found.
```

### Configuración Específica

```bash
# ID por defecto para tarjetas activas en reportes generales
REPORT_GENERAL_CARD_DEFAULT_ACTIVE_ID=13
```

## 🏢 Configuración por Ambientes

### Desarrollo (DEV)

```bash
# Servidor
SERVER_PORT=8889
SPRING_PROFILES_ACTIVE=dev
LOG4J_LEVEL=INFO

# AWS
BUCKET_NAME=athm-dev-anl-general-reports
ALLOWED_ORIGINS=https://reports-dev.athmovil.com

# Endpoints locales (solo para desarrollo)
S3_ENDPOINT=http://localhost:49153
DYNAMODB_ENDPOINT=http://localhost:8000
SECRETMANAGER_ENDPOINT=http://localhost:49153

# Tablas con prefijo DEV
HISTORICAL_TRANSACTION_REPORT_TABLE=ATHM-DEV-ANL-HISTORICAL-TRANSACTION-GENERAL
HISTORICAL_CUSTOMER_REPORT_TABLE=ATHM-DEV-ANL-HISTORICAL-CUSTOMER-GENERAL
HISTORICAL_GENERAL_REPORT_TABLE=ATHM-DEV-ANL-HISTORICAL-REPORT-GENERAL

# Secretos con prefijo DEV
ATHM_REDSHIFT_SECRET_NAME=ATHM-DEV-ANL-REDSHIFT
ATHM_CRYPTO_SECRET_NAME=ATHM-DEV-ANL-CRYPTO-VALUE

# Colas con prefijo dev
SQS_AUDIT_LOG_QUEUE=https://sqs.us-east-1.amazonaws.com/846535660599/athm-dev-anl-auditLogs-queue
SQS_EMAIL_QUEUE=https://sqs.us-east-1.amazonaws.com/846535660599/athm-dev-anl-mails-queue
```

### Certificación (CERT)

```bash
# Servidor
SERVER_PORT=8889
SPRING_PROFILES_ACTIVE=cert
LOG4J_LEVEL=WARN

# AWS (sin endpoints locales)
BUCKET_NAME=athm-cert-anl-general-reports
ALLOWED_ORIGINS=https://reports-cert.athmovil.com

# Tablas con prefijo CERT
HISTORICAL_TRANSACTION_REPORT_TABLE=ATHM-CERT-ANL-HISTORICAL-TRANSACTION-GENERAL
HISTORICAL_CUSTOMER_REPORT_TABLE=ATHM-CERT-ANL-HISTORICAL-CUSTOMER-GENERAL
HISTORICAL_GENERAL_REPORT_TABLE=ATHM-CERT-ANL-HISTORICAL-REPORT-GENERAL

# Secretos con prefijo CERT
ATHM_REDSHIFT_SECRET_NAME=ATHM-CERT-ANL-REDSHIFT
ATHM_CRYPTO_SECRET_NAME=ATHM-CERT-ANL-CRYPTO-VALUE

# Colas con prefijo cert
SQS_AUDIT_LOG_QUEUE=https://sqs.us-east-1.amazonaws.com/846535660599/athm-cert-anl-auditLogs-queue
SQS_EMAIL_QUEUE=https://sqs.us-east-1.amazonaws.com/846535660599/athm-cert-anl-mails-queue
```

### Producción (PROD)

```bash
# Servidor
SERVER_PORT=8889
SPRING_PROFILES_ACTIVE=prod
LOG4J_LEVEL=ERROR

# AWS
BUCKET_NAME=athm-prod-anl-general-reports
ALLOWED_ORIGINS=https://reports.athmovil.com

# Tablas con prefijo PROD
HISTORICAL_TRANSACTION_REPORT_TABLE=ATHM-PROD-ANL-HISTORICAL-TRANSACTION-GENERAL
HISTORICAL_CUSTOMER_REPORT_TABLE=ATHM-PROD-ANL-HISTORICAL-CUSTOMER-GENERAL
HISTORICAL_GENERAL_REPORT_TABLE=ATHM-PROD-ANL-HISTORICAL-REPORT-GENERAL

# Secretos con prefijo PROD
ATHM_REDSHIFT_SECRET_NAME=ATHM-PROD-ANL-REDSHIFT
ATHM_CRYPTO_SECRET_NAME=ATHM-PROD-ANL-CRYPTO-VALUE

# Colas con prefijo prod
SQS_AUDIT_LOG_QUEUE=https://sqs.us-east-1.amazonaws.com/846535660599/athm-prod-anl-auditLogs-queue
SQS_EMAIL_QUEUE=https://sqs.us-east-1.amazonaws.com/846535660599/athm-prod-anl-mails-queue
```

## 🚀 Variables de Lambda Functions

### Configuración CORS para Lambda

```bash
# Credenciales de CORS
ACCESS_CONTROL_ALLOW_CREDENTIALS=true

# Headers permitidos
ACCESS_CONTROL_ALLOW_HEADERS=Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent

# Métodos HTTP permitidos
ACCESS_CONTROL_ALLOW_METHODS=OPTIONS,GET,PUT,POST,DELETE

# Origen permitido (varía por ambiente)
ACCESS_CONTROL_ALLOW_ORIGIN=https://reports-dev.athmovil.com
```

### Configuración AWS para Lambda

```bash
# Versión de la API CDK
API_VERSION_CDK=2016-04-18

# Reutilización de conexiones Node.js
AWS_NODEJS_CONNECTION_REUSE_ENABLED=1

# Región por defecto
DEFAULT_REGION=us-east-1
```

### Configuración de Cognito

```bash
# ID del cliente de Cognito
CLIENT_ID=4gckfjjqsfjquiuchp5ml0fp55

# ID del pool de usuarios de Cognito
COGNITO_POOL_ID=us-east-1_5Fg2GaNqZ
```

### Variables para Funciones SQS

```bash
# ARN de la cola de audit logs (para funciones createAuditLogs)
SQS_AUDIT_LOGS_QUEUE_ARN=arn:aws:sqs:us-east-1:846535660599:athm-dev-anl-auditLogs-queue

# ARN de la cola de emails (para funciones sendMail)
SQS_MAIL_QUEUE_ARN=arn:aws:sqs:us-east-1:846535660599:athm-dev-anl-mails-queue

# Secreto para SendGrid (funciones de email)
SECRET_NAME=ATHM-DEV-ANL-SENDGRID-SECRET
```
