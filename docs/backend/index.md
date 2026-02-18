---
layout: page
title: Backend - Reporting Center
---

---
layout: page
title: Backend - APIs y Servicios
---

# Backend - Reporting Center

## Tecnologías

### Versiones y Dependencias

**Stack Principal:**
- Spring Boot: 2.7.3
- Jacoco: 0.8.10
- Gradle: 7.6
- Java: 17
- Spring WebFlux

### Dependencias del Microservicio

**Desarrollo:**
```
- software.amazon.awssdk:bom:2.17.276
- io.projectreactor:reactor-core
- io.projectreactor.addons:reactor-extra
- software.amazon.awssdk:dynamodb-enhanced
- org.springframework.boot:spring-boot-starter
- org.springframework.boot:spring-boot-starter-validation
- io.projectreactor.tools:blockhound-junit-platform:1.0.8.RELEASE
- org.junit.platform:junit-platform-launcher
- group: 'org.apache.poi', name: 'poi', version: '5.2.3'
- group: 'org.apache.poi', name: 'poi-ooxml', version: '5.2.3'
- com.google.code.gson:gson:2.10.1
- evertec:crypto-lib:1.0.4-beta
```

**Testing:**
```
- io.projectreactor:reactor-test
- org.springframework.boot:spring-boot-starter-test
```

## Diseño de Arquitectura

### Arquitectura Limpia (Clean Architecture)

El microservicio de Subpoenas está diseñado siguiendo los principios de arquitectura limpia, lo que permite:

![Vista general arquitectura limpia](../images/backend/Untitled.png)

- **Vista general arquitectura limpia**: Separación clara de responsabilidades

![Relación de componentes arquitectura limpia](../images/backend/Untitled%201.png)

- **Relación de componentes arquitectura limpia**: Flujo de dependencias controlado

![Diagrama detallado de la arquitectura](../images/backend/Untitled%202.png)

## Dependencias Lambda/CDK

### DevDependencies

```json
{
  "@aws-cdk/assert": "2.68.0",
  "@types/aws-lambda": "^8.10.124",
  "@types/jest": "^27.5.0",
  "@types/lodash": "^4.14.185",
  "@types/node": "18.14.6",
  "@types/uuid": "^9.0.5",
  "aws-cdk": "2.78.0",
  "aws-cdk-lib": "2.78.0",
  "aws-sdk": "2.1124.0",
  "cdk-multi-profile-plugin": "2.1.0",
  "esbuild": "^0.19.4",
  "eslint-plugin-jest": "^26.6.0",
  "jest": "^27.5.1",
  "serverless-dotenv-plugin": "3.12.2",
  "serverless-offline": "^13.2.0",
  "serverless-plugin-typescript": "^2.1.5",
  "ts-jest": "^27.1.0",
  "ts-mockito": "2.6.1",
  "ts-node": "^10.7.0",
  "typescript": "4.8.4"
}
```

### Dependencies

```json
{
  "@aws-lambda-powertools/logger": "2.0.4",
  "@aws-sdk/client-cognito-identity-provider": "3.183.0",
  "@aws-sdk/client-dynamodb": "3.429.0",
  "@aws-sdk/client-secrets-manager": "3.429.0",
  "@aws-sdk/client-sqs": "3.398.0",
  "@aws-sdk/lib-dynamodb": "3.398.0",
  "@aws-sdk/util-dynamodb": "3.429.0",
  "@evt-cdk/codepipeline": "2.0.6",
  "@evt-cdk/core": "2.0.3",
  "@sendgrid/mail": "7.7.0",
  "aws-cdk-lib": "2.78.0",
  "constructs": "10.0.0",
  "reflect-metadata": "0.2.1",
  "source-map-support": "0.5.19",
  "typedoc": "0.24.8",
  "typedoc-clarity-theme": "1.1.0",
  "uuid": "9.0.1"
}
```

## 🔗 Referencias Relacionadas

### 📋 Documentación QSR - Pases a Producción

- [📋 Índice QSR]({{ '/docs/qsr/' | relative_url }}) - Documentación completa de pases a producción
- [🏗️ Pipelines Backend]({{ '/docs/qsr/pipelines-produccion/' | relative_url }}) - Subpoenas, API Reports, General Reports
- [🚀 Proceso de Deploy]({{ '/docs/qsr/proceso-deploy/' | relative_url }}) - Despliegue de microservicios
- [🚨 Troubleshooting Backend]({{ '/docs/qsr/troubleshooting-produccion/' | relative_url }}) - Resolución de problemas

### 🛠️ Infraestructura y Deploy

- [CI/CD]({{ '/docs/cicd/' | relative_url }}) - Jenkins y pipelines de desarrollo
- [Docker/AWS]({{ '/docs/cicd/docker-aws/' | relative_url }}) - Configuración de contenedores
- [New Relic]({{ '/docs/cicd/newrelic/' | relative_url }}) - Monitoreo de microservicios

### ⚙️ Configuración

- [Variables de Entorno]({{ '/docs/general/variables_entorno/' | relative_url }}) - Configuraciones del sistema
- [Casos de Uso]({{ '/docs/general/casos-uso/' | relative_url }}) - Flujos de negocio
- [Arquitectura]({{ '/docs/arquitectura/' | relative_url }}) - Diseño del sistema
