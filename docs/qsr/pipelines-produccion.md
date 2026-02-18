---
layout: page
title: Pipelines de Producción
---

Esta documentación detalla todos los pipelines disponibles para los pases a producción del sistema Reporting Center.

## 🏗️ Arquitectura de Pipelines

El sistema cuenta con múltiples pipelines especializados para diferentes componentes del ecosistema Reporting Center. Cada pipeline está identificado con un código único y cumple funciones específicas.

## 🚀 Pipelines Principales

### DataFlow Pipeline
**Pipeline ID**: `ATHM-CRT-ANL-DataFlow-Pipeline-Pipeline9850B417-1SU4MB59FO9RK`

- **Función**: Procesamiento y transformación de datos
- **Componentes**: ETL processes, data validation, data warehousing
- **Frecuencia**: Ejecución bajo demanda o programada
- **Dependencias**: Base de datos origen, Redshift, S3
- **Tiempo estimado**: 15-30 minutos

**Pre-requisitos**:
- Validación de conexiones a fuentes de datos
- Verificación de espacio en S3
- Estado operativo de Redshift

### Subpoenas Service Pipeline

#### Environment Variables
**Pipeline ID**: `ATHM-CRT-ANL-REPORTING-API-SERVICE-Pipeline-Pipeline9850B417-iRVIprGBMHG7`

- **Función**: Configuración de variables de entorno para el servicio de subpoenas
- **Componentes**: Environment configuration, secrets management
- **Ambiente**: Development, Staging, Production
- **Dependencias**: AWS Secrets Manager, Parameter Store

#### Image Deployment
**Pipeline ID**: `ATHM-CRT-ANL-REPORTING-API-DEPLOYMENT-Pipeline-Pipeline9850B417-12F6Z3GQ6C7C0`

- **Función**: Despliegue de imagen Docker del servicio de subpoenas
- **Componentes**: Docker build, ECR push, ECS deployment
- **Tiempo estimado**: 10-15 minutos
- **Rollback**: Automático en caso de fallo

**Proceso de Deploy**:
1. Build de imagen Docker
2. Push a ECR (Elastic Container Registry)
3. Update de ECS Service
4. Health checks y validación

### API Reports Pipeline
**Pipeline ID**: `ATHM-CRT-ANL-ApiReports-Pipeline-Pipeline9850B417-DJTE60KCVPZ0`

- **Función**: Despliegue del API de reportes
- **Componentes**: REST API, documentación Swagger, validaciones
- **Endpoints**: `/api/reports/*`, `/api/health`, `/api/swagger-ui`
- **Tiempo estimado**: 8-12 minutos

**Características**:
- Auto-scaling habilitado
- Circuit breaker patterns
- Rate limiting configurado
- Monitoring con New Relic

### Cognito Pipeline
**Pipeline ID**: `ATHM-CRT-Anl-Cognito-Pipeline-Pipeline9850B417-1ROP74K2U6WPO`

- **Función**: Gestión de usuarios y autenticación
- **Componentes**: User pools, identity providers, tokens
- **Integraciones**: LDAP, SAML, OAuth2
- **Tiempo estimado**: 5-8 minutos

**Configuraciones**:
- Password policies
- MFA settings
- User attributes
- Lambda triggers

### General Reports - Service Pipeline

#### Docker Deployment
**Pipeline ID**: `ATHM-CRT-ANL-GENERAL-REPORTS-DEPLOYMENT-Pipeline-Pipeline9850B417-7FejzdexeJWP`

- **Función**: Despliegue Docker del servicio de reportes generales
- **Componentes**: Containerización, orchestration
- **Recursos**: CPU 2vCPU, Memory 4GB, Storage 20GB
- **Auto-scaling**: Mín 2, Máx 10 instancias

#### Environment Variables
**Pipeline ID**: `ATHM-CRT-ANL-GENERAL-REPORTS-SERVICE-Pipeline-Pipeline9850B417-2L6Ncb9PxMBX`

- **Función**: Configuración de variables de entorno para reportes generales
- **Variables clave**:
  - Database connections
  - S3 bucket configurations
  - New Relic license key
  - Log levels

### WebPortal Pipeline (Frontend)
**Pipeline ID**: `ATHM-CRT-ANL-WebPortal-Pipeline-Pipeline9850B417-PDEHLPBUZJ2O`

- **Función**: Despliegue del portal web frontend
- **Tecnologías**: React/Angular, CDN distribution
- **Componentes**: Static assets, SPA routing, API integration
- **Tiempo estimado**: 12-20 minutos

**Proceso de Build**:
1. NPM install y build
2. Optimización de assets
3. Upload a S3 + CloudFront
4. Cache invalidation
5. Smoke tests

## 🔄 Orden de Ejecución Recomendado

Para un despliegue completo del sistema, se recomienda el siguiente orden:

1. **Cognito Pipeline** - Autenticación base
2. **DataFlow Pipeline** - Procesamiento de datos
3. **General Reports (Envs + Docker)** - Variables y servicios base
4. **Subpoenas (Envs + Image)** - Variables y microservicio
5. **API Reports Pipeline** - API principal
6. **WebPortal Pipeline** - Frontend

## ⚠️ Consideraciones Importantes

### Dependencias entre Pipelines

- **WebPortal** depende de **API Reports** y **Cognito**
- **API Reports** depende de **DataFlow** y **General Reports**
- **Subpoenas** puede ejecutarse independientemente
- **General Reports** depende de **DataFlow**

### Tiempos de Ejecución

| Pipeline | Tiempo Estimado | Tiempo Máximo |
|----------|----------------|---------------|
| Cognito | 5-8 min | 15 min |
| DataFlow | 15-30 min | 45 min |
| General Reports (Envs) | 3-5 min | 10 min |
| General Reports (Docker) | 8-12 min | 20 min |
| Subpoenas (Envs) | 3-5 min | 10 min |
| Subpoenas (Image) | 10-15 min | 25 min |
| API Reports | 8-12 min | 20 min |
| WebPortal | 12-20 min | 35 min |

**Tiempo total estimado**: 64-107 minutos  
**Tiempo total máximo**: 180 minutos

## 🚨 Alertas y Monitoreo

Todos los pipelines están configurados con:

- **New Relic monitoring**
- **CloudWatch alerts**
- **Slack notifications**
- **Email notifications** para fallos críticos

### Contactos de Escalación

1. **Equipo de Desarrollo** - Fallos de aplicación
2. **DevOps (Hector Granada)** - Fallos de infraestructura
3. **DBA Team** - Problemas de base de datos
4. **AWS Support** - Issues de servicios AWS

## 📊 Métricas y KPIs

- **Success Rate**: >95% para todos los pipelines
- **MTTR**: <30 minutos para rollback
- **Deployment Frequency**: 2-3 veces por semana
- **Lead Time**: <2 horas desde commit hasta producción

---

## 🔗 Navegación QSR

### 📋 Documentos Relacionados

- [← Volver al Índice QSR](./01-README.md)
- [📋 Checklist para Deploy →](./04-checklist-qsr.md)
- [🚀 Proceso Paso a Paso →](./03-proceso-deploy.md)
- [🚨 Solución de Problemas →](./05-troubleshooting-produccion.md)
- [📄 Referencia QSR-2666059 →](./06-qsr-2666059-reference.md)

### 🔗 Referencias Técnicas

- [Documentación CI/CD](../04-cicd.md) - Jenkins y procesos generales
- [Docker y AWS](../05-docker-aws.md) - Configuración de infraestructura
- [Backend](../02-backend.md) - Arquitectura de microservicios
- [New Relic](../06-newrelic.md) - Monitoreo y alertas

### 📁 Archivos de Soporte

- [Archivos QSR Originales](../../files/qsr/) - Documentos Word de referencia
- [Variables de Entorno](../general/variables_entorno.md)
- [Casos de Uso](../general/casos-uso.md)

---

**Próxima actualización**: Agosto 2025  
**Responsable**: Equipo DevOps & Desarrollo
