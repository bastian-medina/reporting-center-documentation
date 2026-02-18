# Proceso de Deploy a Producción

Esta guía describe el proceso paso a paso para realizar despliegues a producción del sistema Reporting Center usando los pipelines establecidos.

## 📋 Pre-requisitos

### Accesos Requeridos

- **VPN Corporativa** - Conectividad a recursos internos
- **Jenkins Access** - Permisos para ejecutar pipelines
- **AWS Console** - Verificación de servicios
- **QSR Approved** - Quality Service Request aprobado

### Validaciones Previas

- [ ] Código en rama `develop` tested y aprobado
- [ ] QSR documentado y aprobado por stakeholders
- [ ] Backup de base de datos realizado
- [ ] Verificación de capacidad de infraestructura
- [ ] Plan de rollback documentado

## 🚀 Proceso de Despliegue

### Fase 1: Preparación (30 minutos)

#### 1.1 Validación de Código

```bash
# Verificar estado de la rama develop
git checkout develop
git pull origin develop
git log --oneline -10

# Ejecutar tests locales
./gradlew clean test
```

#### 1.2 Preparación del QSR

- **Número QSR**: Obtener del sistema de tickets
- **Descripción**: Detallar cambios incluidos
- **Impacto**: Evaluar riesgo y downtime esperado
- **Aprobaciones**: Confirmar todas las firmas requeridas

#### 1.3 Comunicación de Inicio

- Notificar a stakeholders sobre inicio del proceso
- Confirmar ventana de mantenimiento
- Activar sala de guerra (war room) si es necesario

### Fase 2: Ejecución de Pipelines (2-3 horas)

#### 2.1 Orden de Ejecución

Ejecutar los pipelines en el siguiente orden:

1. **Cognito Pipeline**
   - Pipeline: `ATHM-CRT-Anl-Cognito-Pipeline-Pipeline9850B417-1ROP74K2U6WPO`
   - Tiempo: 5-8 minutos
   - Verificación: Login funcional

2. **DataFlow Pipeline**
   - Pipeline: `ATHM-CRT-ANL-DataFlow-Pipeline-Pipeline9850B417-1SU4MB59FO9RK`
   - Tiempo: 15-30 minutos
   - Verificación: Datos procesados correctamente

3. **General Reports - Environment Variables**
   - Pipeline: `ATHM-CRT-ANL-GENERAL-REPORTS-SERVICE-Pipeline-Pipeline9850B417-2L6Ncb9PxMBX`
   - Tiempo: 3-5 minutos
   - Verificación: Variables aplicadas

4. **General Reports - Docker Deployment**
   - Pipeline: `ATHM-CRT-ANL-GENERAL-REPORTS-DEPLOYMENT-Pipeline-Pipeline9850B417-7FejzdexeJWP`
   - Tiempo: 8-12 minutos
   - Verificación: Servicio health check OK

5. **Subpoenas - Environment Variables**
   - Pipeline: `ATHM-CRT-ANL-REPORTING-API-SERVICE-Pipeline-Pipeline9850B417-iRVIprGBMHG7`
   - Tiempo: 3-5 minutos
   - Verificación: Variables aplicadas

6. **Subpoenas - Image Deployment**
   - Pipeline: `ATHM-CRT-ANL-REPORTING-API-DEPLOYMENT-Pipeline-Pipeline9850B417-12F6Z3GQ6C7C0`
   - Tiempo: 10-15 minutos
   - Verificación: API endpoints respondiendo

7. **API Reports Pipeline**
   - Pipeline: `ATHM-CRT-ANL-ApiReports-Pipeline-Pipeline9850B417-DJTE60KCVPZ0`
   - Tiempo: 8-12 minutos
   - Verificación: Swagger UI accesible

8. **WebPortal Pipeline**
   - Pipeline: `ATHM-CRT-ANL-WebPortal-Pipeline-Pipeline9850B417-PDEHLPBUZJ2O`
   - Tiempo: 12-20 minutos
   - Verificación: Portal accesible y funcional

#### 2.2 Ejecución por Pipeline

Para cada pipeline:

1. **Abrir Jenkins Pipeline**
   - Navegar a la URL del pipeline
   - Verificar parámetros de configuración
   - Confirmar rama y versión

2. **Ejecutar con Parámetros**
   ```
   BRANCH: develop
   QSR_NUMBER: [Número de QSR]
   ENVIRONMENT: production
   DEPLOY_TYPE: release
   ```

3. **Monitorear Ejecución**
   - Observar logs en tiempo real
   - Verificar cada stage exitoso
   - Anotar cualquier warning o error

4. **Validar Resultados**
   - Health checks automáticos
   - Smoke tests
   - Métricas de New Relic

### Fase 3: Validación Post-Deploy (45 minutos)

#### 3.1 Tests de Funcionalidad

- [ ] **Login de usuarios** - Verificar autenticación
- [ ] **Generación de reportes** - Probar funciones principales
- [ ] **API endpoints** - Validar respuestas correctas
- [ ] **Subpoenas** - Verificar proceso completo
- [ ] **DataFlow** - Confirmar procesamiento de datos

#### 3.2 Tests de Performance

- [ ] **Response times** - <2 segundos para APIs
- [ ] **Throughput** - Capacidad de usuarios concurrentes
- [ ] **Memory usage** - Dentro de límites establecidos
- [ ] **CPU utilization** - <70% en promedio

#### 3.3 Monitoreo

- [ ] **New Relic** - Dashboards sin alertas críticas
- [ ] **CloudWatch** - Métricas dentro de rangos normales
- [ ] **Application logs** - Sin errores críticos
- [ ] **Database** - Performance normal

### Fase 4: Cierre y Documentación (15 minutos)

#### 4.1 Comunicación de Finalización

- Notificar éxito del despliegue
- Confirmar que servicios están operativos
- Actualizar status pages si aplica

#### 4.2 Documentación

- Registrar versiones desplegadas
- Documentar cualquier issue encontrado
- Actualizar runbooks si es necesario

## 🚨 Procedimiento de Rollback

### Rollback Automático

Algunos pipelines tienen rollback automático en caso de fallo:

- Health checks fallan por más de 5 minutos
- Error rate > 5% por más de 3 minutos
- Response time > 10 segundos consistentemente

### Rollback Manual

Si se requiere rollback manual:

1. **Identificar Versión Anterior**
   ```bash
   # Ver últimas versiones en ECR
   aws ecr describe-images --repository-name reporting-service --region us-east-1
   ```

2. **Ejecutar Rollback Pipeline**
   - Usar pipeline específico de rollback
   - Especificar versión anterior conocida como buena
   - Parámetro: `ROLLBACK_VERSION: [previous-version]`

3. **Validar Rollback**
   - Ejecutar smoke tests
   - Verificar funcionalidad crítica
   - Confirmar métricas normales

### Tiempo de Rollback

- **WebPortal**: 5-10 minutos
- **APIs**: 8-15 minutos
- **Microservicios**: 10-20 minutos
- **DataFlow**: Requiere re-procesamiento (30-60 minutos)

## 📞 Contactos de Emergencia

### Escalación Level 1 (0-15 minutos)
- **Equipo de Desarrollo**: Issues de aplicación
- **DevOps on-call**: Fallos de pipeline

### Escalación Level 2 (15-30 minutos)
- **Hector Granada (DevOps Lead)**: Decisiones de infraestructura
- **Tech Lead**: Decisiones de arquitectura

### Escalación Level 3 (30+ minutos)
- **Manager de Proyecto**: Comunicación con stakeholders
- **AWS Enterprise Support**: Issues críticos de infraestructura

## 📊 Métricas de Éxito

### Criterios de Éxito

- [ ] Todos los pipelines ejecutados exitosamente
- [ ] Response time APIs < 2 segundos
- [ ] Error rate < 1%
- [ ] Disponibilidad > 99.9%
- [ ] Todos los smoke tests passing

### Reporte Post-Deploy

Generar reporte con:

- Tiempo total de deploy
- Issues encontrados y resolución
- Performance comparativa
- Feedback del negocio
- Lecciones aprendidas

---

## 🔗 Navegación QSR

### 📋 Documentos Relacionados

- [← Volver al Índice QSR](./01-README.md)
- [🏗️ Ver Detalle de Pipelines →](./02-pipelines-produccion.md)
- [✅ Usar Checklist QSR →](./04-checklist-qsr.md)
- [🚨 Resolver Problemas →](./05-troubleshooting-produccion.md)
- [📄 Consultar QSR-2666059 →](./06-qsr-2666059-reference.md)

### 🛠️ Herramientas y Referencias

- [Jenkins CI/CD](../04-cicd.md) - Configuración y acceso
- [Docker/AWS Setup](../05-docker-aws.md) - Infraestructura
- [Monitoreo New Relic](../06-newrelic.md) - Dashboards y alertas
- [Variables de Entorno](../general/variables_entorno.md) - Configuraciones

### 📖 Guías Adicionales

- [Arquitectura Backend](../01-arquitectura-backend.md) - Estructura del sistema
- [Frontend](../03-frontend.md) - WebPortal y UI
- [Casos de Uso](../general/casos-uso.md) - Flujos de negocio

---

**Documento actualizado**: Agosto 2025  
**Próxima revisión**: Septiembre 2025  
**Responsable**: Equipo DevOps
