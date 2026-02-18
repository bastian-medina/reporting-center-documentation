---
layout: page
title: Frontend - Reporting Center
---

---
layout: page
title: Frontend - WebPortal
---

# Frontend - Reporting Center

## 📋 Descripción

El frontend del Reporting Center es una aplicación web construida para proporcionar una interfaz de usuario intuitiva para la gestión de reportes Subpoenas y administración de usuarios. La aplicación está diseñada con diferentes módulos especializados que permiten a los usuarios realizar operaciones específicas según su rol y permisos.

## 📑 Tabla de Contenido

- [Módulo Administrador de Usuarios](#modulo-administrador-de-usuarios)
- [Módulo Auditoría (Logs de auditoría)](#módulo-auditoría-logs-de-auditoría)
- [Módulo Reportes Subpoenas](#módulo-reportes-subpoenas)
- [Módulo Búsqueda de Reportes Subpoenas](#módulo-búsqueda-de-reportes-subpoenas)
- [Módulo Descarga de Reportes Subpoenas](#módulo-descarga-de-reportes-subpoenas)
- [Módulo Envío de Correos](#módulo-envío-de-correos)

---

## 🛠️ Módulo Administrador de Usuarios

Este módulo es presentado solo para algunos perfiles específicos, permitiendo realizar diferentes operaciones sobre los usuarios registrados y los ya creados en el sistema.

### 👥 Obtener Usuarios (Listar Usuarios)

Módulo que permite realizar la búsqueda de los usuarios registrados en la plataforma.

- La paginación se realiza desde el Frontend

#### Flujo:

![Administrador Menu](../images/requrimiento/Untitled.png)

**Paso 1:**

1. Mediante las opciones del menú izquierdo se visualiza la Opción **Administrador (Solo para algunos perfiles específicos).**
2. Luego en la opción **Search User** se procede a continuar con el proceso de listar los usuarios.

![Search User](../images/requrimiento/Untitled%201.png)

**Paso 2:**

1. Para realizar ejecutar la consulta de usuarios se debe ingresar como valor requerido el email o parte de este perteneciente al usuario a buscar.
   a. El valor ingresado no es sensible a mayúsculas o minúsculas, por lo que la búsqueda puede ejecutarse sin problema alguno.
2. Solo se habilitará el botón de **SUBMIT** si se ingresa algún valor en el campo mencionado anteriormente.

![Search Results](../images/requrimiento/Untitled%202.png)

**Paso 3:** Resultados de la búsqueda

### ➕ Crear Usuarios

Módulo que permite procesar la creación de usuarios en la plataforma.

#### Flujo:

![Create User Menu](../images/requrimiento/Untitled%203.png)

**Paso 1:**

1. Mediante las opciones del menú izquierdo se visualiza la Opción **Administrador (Solo para algunos perfiles específicos).**
2. Luego en la opción **Create User** se procede a continuar con el proceso de crear usuarios.

![Create User Form](../images/requrimiento/Untitled%204.png)

**Paso 2:**

1. Para proceder con la creación de un nuevo usuario se deben ingresar todos los campos presentados en el formulario:
   - **First Name:** Nombre del usuario
   - **Last Name:** Apellido del usuario
   - **Password:** Contraseña del usuario
   - **Confirm password:** Contraseña del usuario (confirmación)
   - **Email:** Correo electrónico del usuario a crear
   - **User Role:** (Super Admin, Admin, Reporter) *(Pendiente validar)*

2. Solo se habilitará el botón de **SUBMIT** cuando se ingresen todos los valores.

### ✏️ Editar Usuarios

Módulo que permite procesar la actualización de los usuarios en la plataforma.

#### Flujo:

![Admin Menu](../images/requrimiento/Untitled.png)

**Paso 1:**

1. Mediante las opciones del menú izquierdo se visualiza la Opción **Administrador (Solo para algunos perfiles específicos).**
2. Luego en la opción **Search User** se procede a continuar con el proceso de listar los usuarios.

![Search User](../images/requrimiento/Untitled%201.png)

**Paso 2:**

1. Para realizar ejecutar la consulta de usuarios se debe ingresar como valor requerido el email o parte de este perteneciente al usuario a buscar.
   a. El valor ingresado no es sensible a mayúsculas o minúsculas, por lo que la búsqueda puede ejecutarse sin problema alguno.
2. Solo se habilitará el botón de **SUBMIT** si se ingresa algún valor en el campo mencionado anteriormente.

![User List Actions](../images/requrimiento/Untitled%205.png)

**Paso 3:**

1. Para proceder con la edición de la información del usuario, se debe ingresar a la opción mostrada en **View Details**, la cual mostrará la información del usuario y los campos a editar.

![Edit User Form](../images/requrimiento/Untitled%206.png)

**Paso 4:**

Se podrán editar todos los campos a excepción del email, ya que es un campo muy importante para mantener la integridad de la información en la base de información de Cognito.

1. Luego de ingresar los valores que se deseen actualizar se envía la solicitud mediante la opción **UPDATE USER**.

### ❌ Deshabilitar Usuarios

Módulo que deshabilita usuarios en la plataforma.

#### Flujo:

![Admin Menu](../images/requrimiento/Untitled.png)

**Paso 1:**

1. Mediante las opciones del menú izquierdo se visualiza la Opción **Administrador (Solo para algunos perfiles específicos).**
2. Luego en la opción **Search User** se procede a continuar con el proceso de listar los usuarios.

![Search User](../images/requrimiento/Untitled%201.png)

**Paso 2:**

1. Para realizar ejecutar la consulta de usuarios se debe ingresar como valor requerido el email o parte de este perteneciente al usuario a buscar.
   a. El valor ingresado no es sensible a mayúsculas o minúsculas, por lo que la búsqueda puede ejecutarse sin problema alguno.
2. Solo se habilitará el botón de **SUBMIT** si se ingresa algún valor en el campo mencionado anteriormente.

![User List Actions](../images/requrimiento/Untitled%205.png)

**Paso 3:**

1. Para proceder con la deshabilitación del usuario, se debe ingresar a la opción mostrada en **View Details**, la cual mostrará la información del usuario y los campos a editar.

![Disable User](../images/requrimiento/Untitled%207.png)

**Paso 4:**

1. No se requieren ingresar datos adicionales, con el email es suficiente para continuar.

### 👤 Roles *(Pendiente revisar)*

- Super Admin
- Admin
- Reporter

---

## 📊 Módulo Auditoría (Logs de auditoría)

Hay un conjunto de acciones que deben auditarse y para ello se envía un evento a la cola para ser procesado y grabado en la misma.

### 🔍 Búsqueda Audit Logs

Se expone una API para realizar la búsqueda de los registros relacionados a las operaciones ejecutadas en el sistema.

Para realizar la consulta se pueden utilizar los siguientes filtros:

#### Flujo:

![Audit Logs](../images/requrimiento/Untitled%208.png)

**Paso 1:**

1. Se deben enviar los campos requeridos:
   - **Date From:** Fecha y hora desde donde se desea buscar información
   - **Date To:** Fecha y hora hasta donde se desea buscar información

2. Se pueden filtrar adicionalmente por los campos:
   - **Action:** Acción realizada en el sistema (Login, Descarga de reportes, creación de reportes, entre otros)
   - **Email:** Correo relacionado al usuario del sistema que ejecuta operaciones en la plataforma

### 📝 Creación Audit Logs

El módulo se encarga de escribir en la base de datos los registros de auditoría generados por los componentes usados en el sistema.

Para este caso este proceso de creación no requiere intervención por parte del usuario.

---

## 📋 Módulo Reportes Subpoenas

Los reportes de tipo Subpoenas son solicitudes federales del gobierno de EEUU donde entidades hacen peticiones a empresas o entidades que manejen temas financieros para realizar investigaciones y auditorías.

### 👥 Reportes - Subpoenas Customer

Reportes relacionados a los usuarios.

#### 🏠 Subpoenas Customer Personal

Reportes relacionados a los usuarios más orientados a información personal.

#### 🏢 Subpoenas Customer Business

Reportes relacionados a los usuarios más orientados a la información empresarial.

#### 🎂 Subpoenas Customer Personal DOB

Reportes relacionados a los usuarios más orientados a la información personal por fecha de cumpleaños.

### 💳 Reportes - Subpoenas Transaction

Reportes relacionados a las transacciones.

#### 👤 Subpoenas Transaction Personal

Reportes relacionados a las transacciones más orientados a la información personal.

#### 🏢 Subpoenas Transaction Business

Reportes relacionados a las transacciones más orientados a la información empresarial.

---

## 🔍 Módulo Búsqueda de Reportes Subpoenas

Este módulo permite buscar los diferentes reportes creados en el sistema, mediante algunos filtros de búsqueda requeridos y/o opcionales.

### 👤 Búsqueda Personal Subpoenas

*Detalles específicos pendientes de documentar*

### 🏢 Búsqueda Business Subpoenas

*Detalles específicos pendientes de documentar*

### 🎂 Búsqueda Persona DOB

*Detalles específicos pendientes de documentar*

---

## 📥 Módulo Descarga de Reportes Subpoenas

Este módulo permite descargar el reporte Subpoenas con toda la información generada y relacionada a los parámetros enviados por los usuarios del sistema.

Este módulo permite desencriptar el archivo almacenado en el repositorio (S3), ya que allí se encuentra cifrado y con esta funcionalidad se genera desencriptado tal cual lo requiere el usuario funcional.

---

## 📧 Módulo Envío de Correos

### 🔐 Envío de OTP

Esta funcionalidad se usa al momento de realizar login en el sistema, luego de que el usuario ingrese sus credenciales, el sistema envía un correo electrónico al email del usuario registrado, notificando el token OTP para poder realizar el proceso de ingreso.

### 📬 Envío Email - Notificación Estado Final del Reporte Subpoenas

Cuando se genera un reporte, se debe enviar un correo. Para ello, el microservicio envía un mensaje a la cola y, al llegar, un trigger dispara el llamado a ejecutar la lambda que procesa el evento y genera el correo para enviarlo usando el servicio de SendGrid.

---

## 🛠️ Tecnologías

*Información pendiente de completar*

## 📱 Funcionalidades Principales

### ✅ Implementadas

- **Módulo de Administración de Usuarios**
  - Búsqueda y listado de usuarios
  - Creación de nuevos usuarios
  - Edición de información de usuarios existentes
  - Deshabilitación de usuarios

- **Módulo de Reportes Subpoenas**
  - Generación de reportes de clientes (Personal, Business, DOB)
  - Generación de reportes de transacciones (Personal, Business)

- **Módulo de Auditoría**
  - Visualización de logs de auditoría
  - Filtros de búsqueda por fecha, acción y usuario

- **Módulo de Búsqueda y Descarga**
  - Búsqueda de reportes existentes
  - Descarga de reportes desencriptados

### 🔄 En Desarrollo

- Validación completa del sistema de roles
- Detalles específicos de los formularios de reportes
- Configuración de ambiente

## 🏗️ Estructura de la Aplicación

*Información pendiente de completar*

## ⚙️ Configuración

*Información pendiente de completar*

## 📝 Notas

Este documento contiene los requerimientos funcionales del frontend. Se requiere completar la información técnica específica incluyendo:

- Stack tecnológico utilizado
- Estructura de componentes
- Configuración de ambiente
- Guías de desarrollo
- Patrones de diseño implementados

## 🔗 Referencias Relacionadas

### 📋 Documentación QSR - Pases a Producción

- [📋 Índice QSR]({{ '/docs/qsr/' | relative_url }}) - Documentación completa de pases a producción
- [🏗️ Pipeline WebPortal]({{ '/docs/qsr/pipelines-produccion/' | relative_url }}) - Deploy del frontend
- [🚀 Proceso de Deploy]({{ '/docs/qsr/proceso-deploy/' | relative_url }}) - Despliegue de aplicaciones web
- [🚨 Troubleshooting Frontend]({{ '/docs/qsr/troubleshooting-produccion/' | relative_url }}) - Problemas comunes

### 🛠️ Infraestructura y Deploy

- [CI/CD]({{ '/docs/cicd/' | relative_url }}) - Jenkins y pipelines
- [Docker/AWS]({{ '/docs/cicd/docker-aws/' | relative_url }}) - CloudFront y S3
- [New Relic]({{ '/docs/cicd/newrelic/' | relative_url }}) - Monitoreo de performance

### ⚙️ Backend y APIs

- [Backend]({{ '/docs/backend/' | relative_url }}) - APIs y microservicios
- [Variables de Entorno]({{ '/docs/general/variables_entorno/' | relative_url }}) - Configuraciones
- [Casos de Uso]({{ '/docs/general/casos-uso/' | relative_url }}) - Flujos de negocio
- [Arquitectura]({{ '/docs/arquitectura/' | relative_url }}) - Integración con APIs
