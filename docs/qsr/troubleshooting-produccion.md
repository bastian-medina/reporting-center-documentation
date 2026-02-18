---
layout: page
title: Troubleshooting - Pases a Producción
---

Guía de resolución de problemas comunes durante los pases a producción del sistema Reporting Center.

## 🚨 Problemas Comunes por Pipeline

### Cognito Pipeline Issues

**Pipeline**: `ATHM-CRT-Anl-Cognito-Pipeline-Pipeline9850B417-1ROP74K2U6WPO`

#### Error: "User Pool Configuration Failed"

**Síntomas**:

- Pipeline falla en stage de configuración
- Usuarios no pueden autenticarse
- Error 500 en login endpoint

**Causas Posibles**:

- Configuración de SAML/LDAP incorrecta
- Cambios en certificados SSL
- Límites de rate en AWS Cognito

**Solución**:

```bash
# Verificar configuración actual
aws cognito-idp describe-user-pool --user-pool-id [pool-id]

# Verificar identity providers
aws cognito-idp list-identity-providers --user-pool-id [pool-id]

# Rollback a configuración anterior
aws cognito-idp update-user-pool --user-pool-id [pool-id] --policies [previous-config]
```

**Tiempo de resolución**: 10-15 minutos

### DataFlow Pipeline Issues

**Pipeline**: `ATHM-CRT-ANL-DataFlow-Pipeline-Pipeline9850B417-1SU4MB59FO9RK`

#### Error: "Data Source Connection Timeout"

**Síntomas**:

- Pipeline se cuelga en stage de extracción
- Timeout después de 30 minutos
- No hay datos en destino

**Causas Posibles**:

- Mantenimiento de base de datos origen
- Cambios en configuración de red
- Credenciales expiradas

**Solución**:

```bash
# Verificar conectividad
nc -zv [database-host] [port]

# Verificar credenciales en Secrets Manager
aws secretsmanager get-secret-value --secret-id dataflow-db-credentials

# Re-ejecutar pipeline con retry
curl -X POST jenkins-url/job/dataflow/buildWithParameters \
  -d "RETRY=true&SKIP_VALIDATION=false"
```

**Tiempo de resolución**: 15-30 minutos

#### Error: "Data Validation Failed"

**Síntomas**:

- Pipeline completa pero reporta errores
- Registros faltantes en destino
- Calidad de datos no cumple umbrales

**Solución**:

1. Verificar logs detallados en CloudWatch
2. Comparar conteos entre origen y destino
3. Ejecutar validación manual:

```sql
-- Verificar conteos
SELECT COUNT(*) FROM source_table WHERE date = CURRENT_DATE;
SELECT COUNT(*) FROM destination_table WHERE date = CURRENT_DATE;

-- Verificar calidad
SELECT column_name, COUNT(*) as null_count 
FROM destination_table 
WHERE column_name IS NULL 
GROUP BY column_name;
```

### General Reports Pipeline Issues

#### Environment Variables Pipeline

**Pipeline**: `ATHM-CRT-ANL-GENERAL-REPORTS-SERVICE-Pipeline-Pipeline9850B417-2L6Ncb9PxMBX`

**Error: "Parameter Store Access Denied"**

**Síntomas**:

- Pipeline falla en stage de configuración
- Variables no se aplican correctamente
- Servicio usa configuración anterior

**Solución**:

```bash
# Verificar permisos IAM
aws iam get-role-policy --role-name general-reports-role --policy-name parameter-access

# Verificar parámetros existentes
aws ssm get-parameters-by-path --path "/general-reports/prod/"

# Aplicar configuración manualmente
aws ssm put-parameter --name "/general-reports/prod/db-url" --value "[value]" --overwrite
```

#### Docker Deployment Pipeline

**Pipeline**: `ATHM-CRT-ANL-GENERAL-REPORTS-DEPLOYMENT-Pipeline-Pipeline9850B417-7FejzdexeJWP`

**Error: "ECR Push Failed"**

**Síntomas**:

- Build exitoso pero push falla
- Error de autenticación con ECR
- Imagen no disponible para deploy

**Solución**:

```bash
# Re-autenticar con ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin [account].dkr.ecr.us-east-1.amazonaws.com

# Verificar repositorio existe
aws ecr describe-repositories --repository-names general-reports

# Manual push si es necesario
docker tag general-reports:latest [account].dkr.ecr.us-east-1.amazonaws.com/general-reports:latest
docker push [account].dkr.ecr.us-east-1.amazonaws.com/general-reports:latest
```

### Subpoenas Pipeline Issues

#### API Service Pipeline

**Pipeline**: `ATHM-CRT-ANL-REPORTING-API-SERVICE-Pipeline-Pipeline9850B417-iRVIprGBMHG7`

**Error: "Health Check Failed"**

**Síntomas**:

- Deploy completa pero health checks fallan
- API no responde en endpoints
- Load balancer marca instancias como unhealthy

**Solución**:

```bash
# Verificar logs de aplicación
aws logs tail /aws/ecs/subpoenas-service --follow

# Verificar configuración de ECS
aws ecs describe-services --cluster reporting-cluster --services subpoenas-service

# Manual health check
curl -v http://internal-lb.local/health
curl -v http://internal-lb.local/api/v1/subpoenas/health
```

**Checks adicionales**:

- Verificar variables de entorno en ECS task definition
- Confirmar que la base de datos está accesible
- Validar configuración de security groups

#### Image Deployment Pipeline

**Pipeline**: `ATHM-CRT-ANL-REPORTING-API-DEPLOYMENT-Pipeline-Pipeline9850B417-12F6Z3GQ6C7C0`

**Error: "ECS Service Update Failed"**

**Síntomas**:

- Imagen nueva disponible en ECR
- ECS no actualiza el servicio
- Instancias siguen usando imagen anterior

**Solución**:

```bash
# Forzar nueva deploment
aws ecs update-service --cluster reporting-cluster \
  --service subpoenas-service --force-new-deployment

# Verificar task definition
aws ecs describe-task-definition --task-definition subpoenas-service:latest

# Verificar eventos del servicio
aws ecs describe-services --cluster reporting-cluster \
  --services subpoenas-service --query 'services[0].events'
```

### API Reports Pipeline Issues

**Pipeline**: `ATHM-CRT-ANL-ApiReports-Pipeline-Pipeline9850B417-DJTE60KCVPZ0`

**Error: "Swagger Generation Failed"**

**Síntomas**:

- API funciona pero documentación no está disponible
- Swagger UI retorna 404
- Endpoints no están documentados

**Solución**:

1. Verificar anotaciones en código fuente
2. Re-generar documentación:

```bash
# Manual swagger generation
./gradlew generateSwagger

# Verificar archivo generado
ls -la build/swagger/

# Deploy manual de documentación
aws s3 cp build/swagger/swagger.json s3://api-docs-bucket/
```

### WebPortal Pipeline Issues

**Pipeline**: `ATHM-CRT-ANL-WebPortal-Pipeline-Pipeline9850B417-PDEHLPBUZJ2O`

**Error: "CloudFront Cache Not Invalidated"**

**Síntomas**:

- Deploy exitoso pero usuarios ven versión anterior
- Assets nuevos no cargan
- Funcionalidad nueva no disponible

**Solución**:

```bash
# Manual cache invalidation
aws cloudfront create-invalidation \
  --distribution-id E1234567890123 \
  --paths "/*"

# Verificar distribución
aws cloudfront get-distribution --id E1234567890123

# Verificar origin
curl -I https://d123456789.cloudfront.net/index.html
```

## 🔄 Procedimientos de Rollback Rápido

### Rollback por Pipeline

#### Servicios (APIs/Microservicios)

```bash
# Obtener versión anterior
PREVIOUS_VERSION=$(aws ecr describe-images \
  --repository-name [service-name] \
  --query 'sort_by(imageDetails,&imagePushedAt)[-2].imageTags[0]')

# Actualizar task definition
aws ecs register-task-definition \
  --family [service-name] \
  --task-role-arn [role-arn] \
  --container-definitions '[{
    "name": "[service-name]",
    "image": "[account].dkr.ecr.us-east-1.amazonaws.com/[service-name]:'$PREVIOUS_VERSION'"
  }]'

# Actualizar servicio
aws ecs update-service \
  --cluster reporting-cluster \
  --service [service-name] \
  --task-definition [service-name]:$NEW_REVISION
```

#### WebPortal (Frontend)

```bash
# Rollback S3 objects
aws s3 sync s3://webportal-backup/previous/ s3://webportal-prod/

# Invalidar CloudFront
aws cloudfront create-invalidation \
  --distribution-id E1234567890123 \
  --paths "/*"
```

#### DataFlow

```bash
# Rollback usando versión anterior del pipeline
aws glue start-job-run \
  --job-name dataflow-job \
  --arguments '{
    "--VERSION": "previous",
    "--ROLLBACK": "true"
  }'
```

### Tiempos de Rollback

| Componente | Tiempo Estimado |
|------------|----------------|
| WebPortal | 5-10 minutos |
| API Services | 8-15 minutos |
| Microservicios | 10-20 minutos |
| DataFlow | 30-60 minutos |
| Cognito | 5-10 minutos |

## 📊 Monitoreo y Alertas

### Dashboards Críticos

#### New Relic

- **APM Overview**: Performance de aplicaciones
- **Infrastructure**: Uso de recursos
- **Synthetics**: Monitoring de endpoints
- **Browser**: Performance del frontend

URLs principales:

- [APM Dashboard](https://one.newrelic.com/apm)
- [Infrastructure Dashboard](https://one.newrelic.com/infrastructure)

#### CloudWatch

- **ECS Metrics**: CPU, Memory, Network
- **Application Logs**: Errores y warnings
- **Custom Metrics**: Business KPIs

### Alertas Críticas

#### Nivel 1 (Inmediata)

- Error rate > 5%
- Response time > 10 segundos
- Service down por >5 minutos
- Memory usage > 90%

#### Nivel 2 (15 minutos)

- Error rate > 2%
- Response time > 5 segundos
- CPU usage > 80%
- Disk space > 85%

### Comandos de Diagnóstico Rápido

```bash
# Estado general de servicios
aws ecs list-services --cluster reporting-cluster
aws ecs describe-services --cluster reporting-cluster --services [service-names]

# Logs en tiempo real
aws logs tail /aws/ecs/[service-name] --follow

# Métricas de performance
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --dimensions Name=ServiceName,Value=[service-name] \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-01T01:00:00Z \
  --period 300 \
  --statistics Average
```

## 📞 Escalación y Contactos

### Escalación Level 1 (0-15 minutos)

**Equipo de Desarrollo**

- Issues de aplicación
- Bugs en funcionalidad
- Performance degradation

**DevOps On-Call**

- Fallos de pipeline
- Issues de infraestructura
- Problemas de deploy

### Escalación Level 2 (15-30 minutos)

**Hector Granada (DevOps Lead)**

- Decisiones de infraestructura crítica
- Aprobación de cambios emergency
- Coordinación con AWS Support

**Tech Lead**

- Decisiones de arquitectura
- Rollback de cambios mayores
- Coordinación técnica general

### Escalación Level 3 (30+ minutos)

**Project Manager**

- Comunicación con stakeholders
- Decisiones de negocio
- Coordinación externa

**AWS Enterprise Support**

- Issues críticos de infraestructura
- Soporte de servicios AWS
- Escalación a AWS TAM

### Plantillas de Comunicación

#### Incident Report

```
Subject: [PROD] Issue with [Component] - [Severity]

Issue: [Brief description]
Impact: [Business impact]
ETA: [Expected resolution time]
Next Update: [Time for next update]

Status: [IN_PROGRESS/RESOLVED/INVESTIGATING]
```

#### Resolution Report

```
Subject: [RESOLVED] [Component] Issue - Post-Mortem

Resolution: [What was done]
Root Cause: [Why it happened]
Prevention: [How to avoid in future]
Timeline: [Key events and times]
```

---

## 🔗 Navegación QSR

### 📋 Documentos Relacionados

- [← Volver al Índice QSR](./01-README.md)
- [🏗️ Información de Pipelines →](./02-pipelines-produccion.md)
- [🚀 Proceso de Deploy →](./03-proceso-deploy.md)
- [✅ Checklist QSR →](./04-checklist-qsr.md)
- [📄 Referencia QSR-2666059 →](./06-qsr-2666059-reference.md)

### 🛠️ Herramientas de Diagnóstico

- [Jenkins CI/CD](../04-cicd.md) - Logs y estado de pipelines
- [Docker/AWS](../05-docker-aws.md) - Comandos de infraestructura
- [New Relic](../06-newrelic.md) - Monitoreo y alertas
- [Backend](../02-backend.md) - Arquitectura de servicios

### 📖 Referencias Técnicas

- [Variables de Entorno](../general/variables_entorno.md) - Configuraciones
- [Casos de Uso](../general/casos-uso.md) - Flujos de validación
- [Frontend](../03-frontend.md) - Troubleshooting de UI
- [Arquitectura](../01-arquitectura-backend.md) - Diseño del sistema

---

**Documento actualizado**: Agosto 2025  
**Mantenido por**: Equipo DevOps & SRE  
**Próxima revisión**: Septiembre 2025
