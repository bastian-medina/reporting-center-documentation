---
layout: page
title: CI/CD - Integración y Despliegue Continuo
---

# CI/CD - Integración y Despliegue Continuo

Este documento contiene la información sobre los pipelines de CI/CD y procesos de integración continua del proyecto Reporting Center.

## 🔧 Jenkins - Pipelines Automáticos

El proyecto utiliza Jenkins para la integración y despliegue continuo en los diferentes ambientes.

### 📋 Requisitos de Acceso

⚠️ **Importante**: Debes estar conectado a la **VPN corporativa** para acceder a los recursos de Jenkins.

### 🚀 Repositorios Jenkins

#### Subpoenas - Microservicio
- **Pipeline**: [INTEGRATOR_DEV](http://192.168.223.10:8080/jenkins/job/athmrc-dev-reporting-services/job/INTEGRATOR_DEV/)
- **Descripción**: Pipeline principal para el microservicio de Subpoenas
- **Ambiente**: Development
- **Repository**: `athm-dev-anl-subpoenas-repository`

#### Reportes Generales - Microservicio
- **Pipeline**: [Feature Branch - INTEGRATOR_DEV](http://192.168.223.10:8080/jenkins/job/athmrc-dev-reporting-general/job/feature%252FATHMSBP-1580-update-general-reports-repository-INTEGRATOR-DEV/)
- **Descripción**: Pipeline para el microservicio de Reportes Generales
- **Feature**: ATHMSBP-1580 - Update general reports repository
- **Ambiente**: Development
- **Repository**: `athm-dev-anl-general-reports-repository`

## 🌿 Estrategia Branching

### Ramas Principales

- **INTEGRATOR_DEV**: Rama de desarrollo principal
  - Se utiliza para desarrollo y testing
  - Deploys automáticos a ambiente de desarrollo
  
- **develop**: Rama de producción
  - Se utiliza para releases a producción
  - Requiere aprobación manual para despliegue

### 🚀 Proceso de Despliegue a Producción

#### 1. Preparación del Release
1. Hacer merge de `INTEGRATOR_DEV` a `develop`
2. Ejecutar pipeline de `develop` en Jenkins en **modo RELEASE**
3. Especificar el número del **QSR** (Quality Service Request)

#### 2. Despliegue a Certificación
- **Pipeline**: [Certificación - athmrc-reporting-services-cert-pipeline](http://192.168.223.10:8080/jenkins/view/Evertec-Certificacion/job/athm-ms-certification/job/athmrc-reporting-services-cert-pipeline/)
- **Aprobación requerida**: Contactar a **Hector Granada** (DevOps) para aprobar el pipeline
- **Prerequisito**: Pipeline de `develop` debe ejecutarse exitosamente en modo RELEASE

#### 3. Flujo Completo
1. **INTEGRATOR_DEV** → Merge a **develop**
2. **develop** → Ejecutar en modo RELEASE con número QSR
3. **Certificación Pipeline** → Solicitar aprobación a DevOps
4. **Aprobación DevOps** → Hector Granada aprueba el pipeline
5. **Deploy a Producción** → Despliegue automático tras aprobación

## 🚨 Troubleshooting

### Build Failures Comunes

#### Error de Compilación
```bash
# Verificar logs de Gradle
./gradlew clean build --info
```

#### Error de Docker Build
```bash
# Verificar Dockerfile y dependencias
docker build --no-cache -t test-image .
```

#### Error de Push a ECR
```bash
# Verificar autenticación ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 846535660599.dkr.ecr.us-east-1.amazonaws.com
```

### Acciones de Recuperación

1. **Pipeline Bloqueado**: Usar [despliegue manual](./docker_aws.md)
2. **ECR Issues**: Verificar permisos y conectividad
3. **Test Failures**: Revisar logs detallados en Jenkins
4. **Deployment Issues**: Verificar configuración de ambiente

## 📞 Contactos y Soporte

### Equipo DevOps

- **Jenkins Admin**: Contactar al equipo de infraestructura
- **AWS Support**: Para issues relacionados con ECR/ECS
- **Development Team**: Para issues de aplicación
- **Hector Granada (DevOps)**: Aprobación requerida para despliegues a certificación y producción

### Proceso de Aprobación

Para despliegues a **certificación y producción**:
1. Contactar a **Hector Granada** del equipo DevOps
2. Proporcionar número de **QSR** (Quality Service Request)
3. Confirmar que el pipeline de `develop` se ejecutó exitosamente en modo RELEASE
4. Solicitar aprobación del [pipeline de certificación](http://192.168.223.10:8080/jenkins/view/Evertec-Certificacion/job/athm-ms-certification/job/athmrc-reporting-services-cert-pipeline/)

### Enlaces Útiles
- [Documentación Docker/AWS]({{ '/docs/cicd/docker-aws/' | relative_url }})
- [Monitoreo New Relic]({{ '/docs/cicd/newrelic/' | relative_url }})
- [Arquitectura del Sistema]({{ '/docs/arquitectura/' | relative_url }})

---

## 📚 Referencias Adicionales

### 🎯 Documentación QSR - Pases a Producción

- [📋 Índice QSR]({{ '/docs/qsr/' | relative_url }}) - Documentación completa de pases a producción
- [🏗️ Pipelines de Producción]({{ '/docs/qsr/pipelines-produccion/' | relative_url }}) - Todos los pipelines documentados
- [🚀 Proceso de Deploy]({{ '/docs/qsr/proceso-deploy/' | relative_url }}) - Guía paso a paso
- [✅ Checklist QSR]({{ '/docs/qsr/checklist-qsr/' | relative_url }}) - Lista de verificación completa
- [🚨 Troubleshooting]({{ '/docs/qsr/troubleshooting-produccion/' | relative_url }}) - Resolución de problemas
- [📄 QSR-2666059]({{ '/docs/qsr/qsr-2666059-reference/' | relative_url }}) - Referencia específica

### 📖 Documentación General

- [README Principal](/)
- [Documentación de Backend]({{ '/docs/backend/' | relative_url }})
- [Arquitectura del Sistema]({{ '/docs/arquitectura/' | relative_url }})
- [Docker y AWS]({{ '/docs/cicd/docker-aws/' | relative_url }})
- [Monitoreo New Relic]({{ '/docs/cicd/newrelic/' | relative_url }})
- [Frontend]({{ '/docs/frontend/' | relative_url }})

### 🔧 Configuraciones y Casos de Uso
- [Variables de Entorno]({{ '/docs/general/variables_entorno/' | relative_url }})
- [Casos de Uso]({{ '/docs/general/casos-uso/' | relative_url }})
- [Enums del Sistema]({{ '/docs/general/enums/' | relative_url }})

---

**Última actualización**: Julio 2025
**Mantenido por**: Equipo de Desarrollo Reporting Center
