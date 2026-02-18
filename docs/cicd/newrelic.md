---
layout: page
title: New Relic - Monitoreo y Observabilidad
---

---
layout: page
title: New Relic - Monitoreo y Observabilidad
---

# New Relic - Monitoreo y Observabilidad

## Descripción General

New Relic es la plataforma de observabilidad utilizada en el Reporting Center para monitorear el rendimiento de la aplicación Java, rastrear transacciones, identificar errores, y obtener insights sobre el comportamiento del sistema en tiempo real.

## Configuración del Agente Java

El proyecto utiliza el agente de New Relic para Java con las siguientes características:

- **Monitoreo de transacciones** en tiempo real
- **Distributed tracing** para rastrear requests entre servicios
- **Logs forwarding** automático a New Relic
- **Error tracking** y análisis de excepciones
- **Performance insights** y métricas de rendimiento

## Configuración por Ambiente

### Ambientes Configurados

| Ambiente | App Name | Environment |
|----------|----------|-------------|
| **Desarrollo** | `ATHMRCG-BE-DEV` | `development` |
| **Testing/QA** | `ATHMRCG-BE-QA` | `test` |
| **Certificación** | `ATHMRCG-BE-CRT` | `staging` |
| **Producción** | `ATHMRCG-BE-PRD` | `production` |

### Variables de Ambiente Docker

El contenedor automáticamente mapea los perfiles de Spring Boot a los ambientes de New Relic:

```bash
# Mapeo automático en ENTRYPOINT
case "$SPRING_PROFILES_ACTIVE" in
  dev) NEW_RELIC_ENVIRONMENT=development;;
  crt) NEW_RELIC_ENVIRONMENT=staging;;
  prd) NEW_RELIC_ENVIRONMENT=production;;
  *) NEW_RELIC_ENVIRONMENT=development;;
esac
```

## Archivo de Configuración

El archivo `newrelic.yml` contiene la configuración completa del agente:

```yaml
# Configuración común para todos los ambientes
common: &default_settings
  license_key: 'x-your-license-key'
  agent_enabled: true
  app_name: 'YourProductName-BE-PRD'
  high_security: true
  enable_auto_app_naming: false
  enable_auto_transaction_naming: true
  log_level: info
  
  # Configuración de Application Logging
  application_logging:
    enabled: true
    forwarding:
      enabled: true
    metrics:
      enabled: true
      
  # Transaction Tracer
  transaction_tracer:
    enabled: true
    transaction_threshold: apdex_f
    record_sql: obfuscated
    log_sql: false
    stack_trace_threshold: 0.5
    explain_enabled: true
    explain_threshold: 0.5
    top_n: 20
    
  # Error Collector
  error_collector:
    enabled: true
    ignore_errors: akka.actor.ActorKilledException
    ignore_status_codes: 404
    
  # Distributed Tracing
  distributed_tracing:
    enabled: true
    exclude_newrelic_header: false
    
  # Span Events
  span_events:
    enabled: true
    max_samples_stored: 2000

# Configuración por ambiente
development:
  <<: *default_settings
  app_name: 'YourProductName-BE-DEV'

test:
  <<: *default_settings
  app_name: 'YourProductName-BE-QA'

production:
  <<: *default_settings

staging:
  <<: *default_settings
  app_name: 'YourProductName-BE-CRT'
```

## Dockerfile - Configuración de New Relic

El Dockerfile incluye la configuración completa para New Relic:

```dockerfile
FROM amazoncorretto:21
VOLUME /tmp
ARG JAR_FILE=build/libs/your-jar-name.jar
ARG FILE_VERSION=build/libs/version.txt
ARG CERT_FILE=keystore.p12

# Install required packages
RUN yum -y update python \
&& yum install -y tar \
&& mkdir -p /instaladores

# Copy and install dependencies
COPY ./dependencias/*.tar.gz /instaladores
COPY ./scripts/instala.sh /instaladores
RUN chmod +x /instaladores/instala.sh \
&& sh /instaladores/instala.sh

# Copy New Relic agent and configuration
COPY ./newrelic/newrelic.jar /newrelic/newrelic.jar
COPY ./newrelic/newrelic.yml /newrelic/newrelic.yml
COPY ./newrelic/extensions /newrelic/extensions

# Copy application files
COPY ${JAR_FILE} your-jar-name.jar
COPY ${FILE_VERSION} version.txt
COPY ${CERT_FILE} keystore.p12

ENV JAVA_OPTS="\
    -Dsun.net.inetaddr.ttl=60 \
    -Dsun.net.inetaddr.negative.ttl=10 \
    -Dhttp.keepAlive.time.server=300000 \
    -Dhttp.keepAlive.timeout=300000 \
    -javaagent:/newrelic/newrelic.jar"

# Expose port
EXPOSE 8888

# Start application with connection tuning parameters
ENTRYPOINT ["sh", "-c", "\
  case \"$SPRING_PROFILES_ACTIVE\" in \
    dev) NEW_RELIC_ENVIRONMENT=development;; \
    crt) NEW_RELIC_ENVIRONMENT=staging;; \
    prd) NEW_RELIC_ENVIRONMENT=production;; \
    *) NEW_RELIC_ENVIRONMENT=development;; \
  esac; \
  echo \"🚀 Starting service with NEW_RELIC_ENVIRONMENT=$NEW_RELIC_ENVIRONMENT\"; \
  exec java $JAVA_OPTS -Dnewrelic.environment=$NEW_RELIC_ENVIRONMENT -jar /your-jar-name.jar"]
```

## Características Habilitadas

### 🔍 Transaction Monitoring

- **Threshold**: `apdex_f` (4x el tiempo de Apdex)
- **SQL Recording**: Obfuscado para seguridad (la cuenta de evertec tiene esta configuración, si es distinta de true, newrelic no levantará)
- **Stack Traces**: Capturados cuando excedan 0.5s
- **Query Plans**: Habilitados para MySQL y PostgreSQL

### 🚨 Error Tracking

- **Errores capturados**: Todas las excepciones no controladas
- **Excepciones ignoradas**: `akka.actor.ActorKilledException`
- **Status codes ignorados**: `404`

### 📊 Distributed Tracing

- **Habilitado**: Sí
- **W3C Trace Context**: Soportado
- **Cross-service tracing**: Completo

### 📋 Application Logs

- **Log Forwarding**: Automático a New Relic
- **Log Metrics**: Métricas por nivel de log
- **Context Linking**: Enlaces entre logs, traces y errors

### 🔒 Seguridad

- **High Security Mode**: Habilitado
- **SQL Obfuscation**: Automática
- **Request Parameters**: No enviados (high security)

## Credenciales y Acceso

> **⚠️ IMPORTANTE**: Para obtener las credenciales de New Relic y acceso al dashboard, contactar a **Edwin Molero**.

### License Key

La license key actual está configurada en el archivo `newrelic.yml`:
```yaml
license_key: 'x-your-license-key'
```

### Dashboards Disponibles

1. **APM Dashboard**: Monitoreo de aplicación principal
2. **Infrastructure**: Monitoreo de contenedores y hosts  
3. **Logs**: Centralización y búsqueda de logs
4. **Errors**: Análisis de errores y excepciones
5. **Distributed Tracing**: Trazabilidad entre servicios

## Enlaces Directos a APMs

### Microservicio Subpoenas

| Ambiente | Enlace Directo |
|----------|----------------|
| **DEV** | [ATHMRCG Subpoenas DEV](https://one.newrelic.com/nr1-core/apm/overview/MzQzMTE0OHxBUE18QVBQTElDQVRJT058MTA2MzU4NDkyMQ?duration=1800000&state=1a2f48fb-3fe4-4380-d7a0-1532288becd9) |
| **CERT** | [ATHMRCG Subpoenas CERT](https://one.newrelic.com/nr1-core/apm/overview/MzQzMTE0OHxBUE18QVBQTElDQVRJT058MTAzMTY1NDIyNQ?duration=1800000&state=ca8c7ead-243d-3392-563a-763e0697a3dd) |
| **PROD** | [ATHMRCG Subpoenas PROD](https://one.newrelic.com/nr1-core/apm/overview/MzQzMTE0OHxBUE18QVBQTElDQVRJT058MTEzMTc2NDczOA?duration=1800000&state=8457f0e3-b0b6-8071-6e01-33a027a9b94e) |

### Microservicio Reportes Generales

| Ambiente | Enlace Directo |
|----------|----------------|
| **DEV** | [ATHMRCG Reportes Generales DEV](https://one.newrelic.com/nr1-core/apm/overview/MzQzMTE0OHxBUE18QVBQTElDQVRJT058MTExNjY3ODY0OQ?duration=1800000&state=40aec8d5-b9cb-acca-011f-4355e0bd21d0) |
| **CERT** | [ATHMRCG Reportes Generales CERT](https://one.newrelic.com/nr1-core/apm/overview/MzQzMTE0OHxBUE18QVBQTElDQVRJT058MTExNjU2OTEzNg?duration=1800000&state=5dcde00a-f11f-9717-8d69-60d29b7ce0e8) |
| **PROD** | [ATHMRCG Reportes Generales PROD](https://one.newrelic.com/nr1-core/apm/overview/MzQzMTE0OHxBUE18QVBQTElDQVRJT044MTExMjkxNzIzMg?duration=1800000&state=15d17abc-6c13-f7bf-4adc-560976818165) |

## Configuración Avanzada

### JVM Options

Las siguientes opciones de JVM están configuradas para optimizar el rendimiento:

```bash
JAVA_OPTS="\
    -Dsun.net.inetaddr.ttl=60 \
    -Dsun.net.inetaddr.negative.ttl=10 \
    -Dhttp.keepAlive.time.server=300000 \
    -Dhttp.keepAlive.timeout=300000 \
    -javaagent:/newrelic/newrelic.jar"
```

### Instrumentación Deshabilitada

Por rendimiento, se han deshabilitado ciertos módulos de instrumentación:

- `servlet-user`: User principal reporting
- `spring-aop-2`: Spring AOP instrumentation  
- `jdbc-resultset`: ResultSet operations metrics

### Class Loader Exclusions

Optimización para evitar instrumentar classloaders dinámicos:

- `groovy.lang.GroovyClassLoader$InnerLoader`
- `org.springframework.data.convert.ClassGeneratingEntityInstantiator$ObjectInstantiatorClassGenerator`
- `org.mvel2.optimizers.impl.asm.ASMAccessorOptimizer$ContextClassLoader`

## Troubleshooting

### Verificar Conexión

1. **Revisar logs de aplicación** para mensajes de New Relic
2. **Verificar environment** con: `echo $NEW_RELIC_ENVIRONMENT`
3. **Validar license key** en el dashboard de New Relic

### Problemas Comunes

| Problema | Solución |
|----------|----------|
| **No aparecen datos** | Verificar license_key y conectividad |
| **Environment incorrecto** | Revisar mapeo de SPRING_PROFILES_ACTIVE |
| **Logs no aparecen** | Verificar `application_logging.forwarding.enabled` |
| **Performance degradado** | Revisar configuración de instrumentación |

### Logs de New Relic

Los logs del agente se almacenan en:
```bash
# Dentro del contenedor
/newrelic/logs/newrelic_agent.log
```

## Métricas Clave

### Performance Metrics

- **Response Time**: Tiempo de respuesta promedio
- **Throughput**: Requests por minuto
- **Error Rate**: Porcentaje de errores
- **Apdex Score**: Satisfacción del usuario

### Infrastructure Metrics

- **CPU Usage**: Uso de CPU del contenedor
- **Memory Usage**: Consumo de memoria
- **GC Performance**: Rendimiento del Garbage Collector
- **JVM Metrics**: Métricas específicas de la JVM

## Alertas Recomendadas

1. **Error Rate > 5%**
2. **Response Time > 2s**  
3. **Apdex Score < 0.7**
4. **Memory Usage > 85%**
5. **CPU Usage > 80%**

## Enlaces Útiles

- [New Relic Java Agent Documentation](https://docs.newrelic.com/docs/agents/java-agent/)
- [Configuration File Template](https://docs.newrelic.com/docs/agents/java-agent/configuration/java-agent-configuration-config-file/)
- [Distributed Tracing Guide](https://docs.newrelic.com/docs/distributed-tracing/)
- [Application Logging Setup](https://docs.newrelic.com/docs/logs/logs-context/java-configure-logs-context-all/)