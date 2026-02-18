---
layout: page
title: 🎯 QSR - Pases a Producción
---

---
layout: page
title: QSR - Pases a Producción
---

# 🎯 QSR - Pases a Producción

Esta sección contiene toda la documentación relacionada con los **Quality Service Requests (QSR)** y los procedimientos de pase a producción del sistema Reporting Center.

---

## 📋 Orden de Lectura Recomendado

Sigue este orden para entender el proceso completo:

1. **[🏗️ Pipelines de Producción]({{ 'pipelines-produccion/' | relative_url }})** - Conoce todos los pipelines disponibles
2. **[🚀 Proceso de Deploy]({{ 'proceso-deploy/' | relative_url }})** - Aprende el procedimiento paso a paso
3. **[✅ Checklist QSR]({{ 'checklist-qsr/' | relative_url }})** - Ejecuta con lista de verificación
4. **[🚨 Troubleshooting]({{ 'troubleshooting-produccion/' | relative_url }})** - Resuelve problemas comunes
5. **[📄 QSR-2666059 Reference]({{ 'qsr-2666059-reference/' | relative_url }})** - Consulta la referencia específica

---

## 🚀 Pipelines Disponibles

### Microservicios y APIs
- **DataFlow Pipeline** - Procesamiento de datos
- **Subpoenas Service** - Microservicio de citaciones
- **API Reports** - API de reportes
- **General Reports** - Reportes generales

### Infraestructura y Frontend
- **Cognito Pipeline** - Gestión de usuarios
- **Docker Deployments** - Despliegues de contenedores
- **WebPortal** - Frontend del sistema

### Configuración
- **Database Migrations** - Migraciones de datos
- **Cache Updates** - Actualización de caché

---

## 📞 Contactos Importantes

| Rol | Contacto |
|-----|----------|
| **DevOps Team** | Hector Granada |
| **Approval QSR** | Requerida para todos los pases |
| **Technical Lead** | Consultar documentación interna |

---

## 🔗 Enlaces Relacionados

### Documentación Técnica Complementaria

- [🏛️ Arquitectura Backend]({{ '/docs/arquitectura/' | relative_url }}) - Diseño del sistema
- [⚙️ Backend - APIs]({{ '/docs/backend/' | relative_url }}) - Servicios disponibles
- [🔄 CI/CD]({{ '/docs/cicd/' | relative_url }}) - Pipelines de desarrollo
- [🐳 Docker y AWS]({{ '/docs/cicd/docker-aws/' | relative_url }}) - Infraestructura

### Configuración y Referencias

- [🔧 Variables de Entorno]({{ '/docs/general/variables_entorno/' | relative_url }})
- [📝 Enums]({{ '/docs/general/enums/' | relative_url }})
- [📖 Casos de Uso]({{ '/docs/general/casos-uso/' | relative_url }})
- [📊 Monitoreo New Relic]({{ '/docs/cicd/newrelic/' | relative_url }})

---

## ✅ Checklist Rápido antes de Deploy

- [ ] Documentos de QSR aprobados
- [ ] Todos los tests pasando
- [ ] Documentación actualizada
- [ ] Problemas listados y verificados
- [ ] Ambiente de staging funcionando
- [ ] Rollback plan documentado

---

## 📌 Tips Importantes

⚠️ **Antes de hacer ANY pase a producción:**
1. Lee el **Proceso de Deploy** completo
2. Verifica el **Checklist QSR**
3. Ten el **Troubleshooting** a mano
4. Coordina con el equipo DevOps

✅ **Después del deploy:**
1. Monitorea en New Relic
2. Verifica logs en AWS CloudWatch
3. Prueba funcionalidad clave
4. Documenta cualquier issue

---

**Documentación actualizada:** {{ site.time | date: "%d de %B de %Y" }}
