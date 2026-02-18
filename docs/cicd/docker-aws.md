---
layout: page
title: Docker y AWS ECR
---

# Docker y AWS ECR - Despliegue Manual

Este documento contiene las instrucciones para realizar despliegues manuales en caso de que el pipeline esté bloqueado.

## 📋 Requisitos Previos

- AWS CLI configurado con las credenciales apropiadas
- Docker instalado y configurado
- Acceso al repositorio ECR de ATH Móvil

### Reportes Generales

- **Repository**: `846535660599.dkr.ecr.us-east-1.amazonaws.com/athm-dev-anl-general-reports-repository`
- **Image Name**: `athm-dev-anl-general-reports-repository`

### Subpoenas

- **Repository**: `846535660599.dkr.ecr.us-east-1.amazonaws.com/athm-dev-anl-subpoenas-repository`
- **Image Name**: `athm-dev-anl-subpoenas-repository`

## 🚀 Proceso de Despliegue

### Paso 0: Preparación del Build (Requerido)

Antes de ejecutar los comandos de Docker, debes preparar el proyecto siguiendo estos pasos que normalmente ejecuta el pipeline automático:

#### 1. Build del Multiproyecto Gradle

```bash
# Ejecutar build completo del multiproyecto
./gradlew clean build
```

#### 2. Mover el JAR generado

```bash
# El JAR se genera en applications/build/libs/
# Debe moverse a build/libs/ para Docker
mkdir -p build/libs/
cp applications/build/libs/your-jar-name.jar build/libs/
```

#### 3. Generar archivo de versión

```bash
# Crear archivo version.txt con la versión a desplegar
echo "v1.0.0-manual-$(date +%Y%m%d-%H%M%S)" > build/libs/version.txt

# O especificar una versión manual:
# echo "v1.2.3-hotfix" > build/libs/version.txt
```

⚠️ **Importante**: Estos pasos son **obligatorios** antes de proceder con Docker. El contenedor espera encontrar:

- `build/libs/your-jar-name.jar`
- `build/libs/version.txt`

#### Script de Automatización (Opcional)

Para automatizar estos pasos, puedes crear un script `prepare-build.sh`:

```bash
#!/bin/bash
set -e

echo "🔨 Iniciando preparación del build..."

# 1. Build del multiproyecto
echo "📦 Ejecutando build de Gradle..."
./gradlew clean build

# 2. Crear directorio y mover JAR
echo "📁 Preparando estructura de archivos..."
mkdir -p build/libs/
cp applications/build/libs/*.jar build/libs/your-jar-name.jar

# 3. Generar version.txt
VERSION="v1.0.0-manual-$(date +%Y%m%d-%H%M%S)"
echo "📝 Generando version.txt: $VERSION"
echo "$VERSION" > build/libs/version.txt

echo "✅ Preparación completada. Archivos listos para Docker:"
ls -la build/libs/

echo "🐳 Ahora puedes ejecutar los comandos de Docker..."
```

Ejecutar con: `chmod +x prepare-build.sh && ./prepare-build.sh`

### 1. Login en ECR

```bash
aws ecr get-login-password --region us-east-1 \
  | docker login --username AWS --password-stdin 846535660599.dkr.ecr.us-east-1.amazonaws.com
```

### 2. Build Multiplataforma para AMD64

#### Reportes Generales

```bash
docker buildx build --platform linux/amd64 -t athm-dev-anl-general-reports-repository .
```

#### Subpoenas

```bash
docker buildx build --platform linux/amd64 -t athm-dev-anl-subpoenas-repository .
```

### 3. Prueba Local (Opcional)

#### Reportes Generales

```bash
docker run \
  -e ALLOWED_ORIGINS="http://localhost:3000,https://reports-dev.athmovil.com" \
  -e ATHM_REDSHIFT_SECRET_NAME="ATHM-DEV-ANL-REDSHIFT" \
  -e SPRING_PROFILES_ACTIVE="dev" \
  -e SSL_KEY_ALIAS="reporting-center-cert" \
  -e SSL_KEY_STORE="/Users/bastianmedina/repos/athmrc-dev-reporting-general/keystore.p12" \
  -e REGION_AWS="us-east-1" \
  -e SSL_KEYSTORE_PASSWORD="changeit" \
  -e ENV_LOCAL="true" \
  -e SSL_KEY_PASSWORD="changeit" \
  -e BUCKET_NAME="athm-dev-anl-reporting" \
  -e LOG4J_LEVEL="INFO" \
  athm-dev-anl-general-reports-repository:latest
```

#### Subpoenas

```bash
docker run \
  -e ALLOWED_ORIGINS="http://localhost:3000,https://subpoenas-dev.athmovil.com" \
  -e ATHM_REDSHIFT_SECRET_NAME="ATHM-DEV-ANL-REDSHIFT" \
  -e SPRING_PROFILES_ACTIVE="dev" \
  -e SSL_KEY_ALIAS="reporting-center-cert" \
  -e SSL_KEY_STORE="/path/to/keystore.p12" \
  -e REGION_AWS="us-east-1" \
  -e SSL_KEYSTORE_PASSWORD="changeit" \
  -e ENV_LOCAL="true" \
  -e SSL_KEY_PASSWORD="changeit" \
  -e BUCKET_NAME="athm-dev-anl-reporting" \
  -e LOG4J_LEVEL="INFO" \
  athm-dev-anl-subpoenas-repository:latest
```

### 4. Tag con "latest"

#### Reportes Generales

```bash
docker tag athm-dev-anl-general-reports-repository:latest \
  846535660599.dkr.ecr.us-east-1.amazonaws.com/athm-dev-anl-general-reports-repository:latest
```

#### Subpoenas

```bash
docker tag athm-dev-anl-subpoenas-repository:latest \
  846535660599.dkr.ecr.us-east-1.amazonaws.com/athm-dev-anl-subpoenas-repository:latest
```

### 5. Tag con Versión Temporal

#### Reportes Generales

```bash
docker tag athm-dev-anl-general-reports-repository:latest \
  846535660599.dkr.ecr.us-east-1.amazonaws.com/athm-dev-anl-general-reports-repository:temporal-general-image
```

#### Subpoenas

```bash
docker tag athm-dev-anl-subpoenas-repository:latest \
  846535660599.dkr.ecr.us-east-1.amazonaws.com/athm-dev-anl-subpoenas-repository:temporal-subpoenas-image
```

### 6. Push a ECR

#### Reportes Generales

```bash
docker push 846535660599.dkr.ecr.us-east-1.amazonaws.com/athm-dev-anl-general-reports-repository:latest
docker push 846535660599.dkr.ecr.us-east-1.amazonaws.com/athm-dev-anl-general-reports-repository:temporal-general-image
```

#### Push Subpoenas

```bash
docker push 846535660599.dkr.ecr.us-east-1.amazonaws.com/athm-dev-anl-subpoenas-repository:latest
docker push 846535660599.dkr.ecr.us-east-1.amazonaws.com/athm-dev-anl-subpoenas-repository:temporal-subpoenas-image
```

## 🔍 Verificación

Después del push, verifica que las imágenes se hayan subido correctamente:

```bash
aws ecr describe-images --repository-name athm-dev-anl-general-reports-repository --region us-east-1
aws ecr describe-images --repository-name athm-dev-anl-subpoenas-repository --region us-east-1
```

## ⚠️ Notas Importantes

- **Preparación Obligatoria**: Siempre ejecuta el "Paso 0: Preparación del Build" antes de cualquier comando Docker
- **Multiproyecto Gradle**: El build debe ejecutarse desde la raíz del proyecto para compilar todos los módulos
- **Estructura de Archivos**: El Dockerfile espera encontrar los archivos en `build/libs/` específicamente
- **Version.txt**: Este archivo se muestra en el endpoint de health check para identificar la versión desplegada
- **Uso de Emergency**: Este proceso manual debe usarse únicamente cuando el pipeline automático esté bloqueado
- **Testing Local**: Siempre prueba la imagen localmente antes de hacer push a ECR
- **Versioning**: Asegúrate de usar tags apropiados para identificar las versiones manuales
- **Cleanup**: Limpia las imágenes locales después del despliegue para liberar espacio

## � Referencias Relacionadas

### 📋 Documentación QSR - Pases a Producción

- [📋 Índice QSR]({{ '/docs/qsr/' | relative_url }}) - Documentación completa de pases a producción
- [🏗️ Pipelines Docker]({{ '/docs/qsr/pipelines-produccion/' | relative_url }}) - General Reports y Subpoenas Docker deployment
- [🚀 Proceso de Deploy]({{ '/docs/qsr/proceso-deploy/' | relative_url }}) - Despliegue automatizado vs manual
- [🚨 Troubleshooting Docker]({{ '/docs/qsr/troubleshooting-produccion/' | relative_url }}) - ECR y ECS issues

### 🛠️ Documentación Técnica

- [CI/CD]({{ '/docs/cicd/' | relative_url }}) - Pipelines automatizados vs despliegue manual
- [Backend]({{ '/docs/backend/' | relative_url }}) - Aplicaciones a desplegar
- [Arquitectura]({{ '/docs/arquitectura/' | relative_url }}) - Infraestructura y contenedores
- [New Relic]({{ '/docs/cicd/newrelic/' | relative_url }}) - Monitoreo post-deploy

### ⚙️ Configuración

- [Variables de Entorno]({{ '/docs/general/variables_entorno/' | relative_url }}) - Configuraciones por ambiente
- [README Principal]({{ '/' | relative_url }}) - Visión general del proyecto

---

**Nota**: Para despliegues a producción, usar siempre los [pipelines QSR documentados]({{ '/docs/qsr/' | relative_url }}). Este documento es solo para casos de emergencia o troubleshooting.