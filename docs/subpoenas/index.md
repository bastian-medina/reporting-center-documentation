---
layout: page
title: 📋 Subpoenas - Citaciones Judiciales
---

---
layout: page
title: Subpoenas - Documentación Específica
---

# 📋 Subpoenas - Citaciones Judiciales

Documentación completa del módulo de Subpoenas para el procesamiento y generación de citaciones judicales federales.

---

## 📖 Contenidos

### Configuración

**[Variables de Entorno]({{ 'variables_entorno/' | relative_url }})**
- Configuración específica del módulo Subpoenas
- Endpoints y credenciales
- Parámetros de procesamiento

**[Enums y Constantes]({{ 'enums/' | relative_url }})**
- Tipos de citaciones
- Estados de procesamiento
- Códigos de error

### Casos de Uso

**[Casos de Uso de Subpoenas]({{ 'casos-uso/' | relative_url }})**

#### Búsqueda y Descarga
- [Búsqueda de Subpoenas]({{ 'casos-uso/subpoenas-search/' | relative_url }})
- [Descargar Archivos]({{ 'casos-uso/download-file/' | relative_url }})

#### Reportes por Tipo de Cuenta
- [Reportes Negativos - Customer Business]({{ 'casos-uso/subpoenas-customer-business-report/' | relative_url }})
- [Reportes Personales - Customer Personal]({{ 'casos-uso/subpoenas-customer-personal-report/' | relative_url }})
- [Reportes DOB - Customer DOB]({{ 'casos-uso/subpoenas-customer-dob-report/' | relative_url }})

#### Reportes Transaccionales
- [Reportes de Transacciones - Business]({{ 'casos-uso/subpoenas-transaction-business-report/' | relative_url }})
- [Reportes de Transacciones - Personal]({{ 'casos-uso/subpoenas-transaction-personal-report/' | relative_url }})

#### Últimos Reportes
- [Último Reporte]({{ 'casos-uso/subpoenas-last-report/' | relative_url }})

---

## 🎯 Flujo General

```
Búsqueda de Citación
        ↓
Seleccionar Tipo de Reporte
        ↓
Generar Reporte
        ↓
Descargar Archivo
        ↓
Notificación por Email
```

---

## 📊 Consideraciones Importantes

### Cumplimiento Normativo
- ✅ Compliance con regulaciones federales
- ✅ Auditoría y trazabilidad completa
- ✅ Seguridad de datos sensibles

### Procesamiento
- ⚡ Procesamiento asíncrono
- 📧 Notificaciones automáticas
- 💾 Almacenamiento seguro en AWS S3

### Monitoreo
- 📊 New Relic para APM
- 📈 CloudWatch Logs
- 🚨 Alertas automáticas

---

## 🔗 Enlaces Relacionados

### Documentación Principal
- [⭐ QSR - Pases a Producción](/docs/qsr/)
- [🏛️ Arquitectura del Sistema](/docs/arquitectura/)
- [⚙️ Backend](/docs/backend/)

### Configuración y Referencia
- [🔧 Variables de Entorno General](/docs/general/variables_entorno.md)
- [📝 Enums General](/docs/general/enums.md)
- [🚀 Funciones Lambda](/docs/lambdas/)

### Infraestructura
- [🔄 CI/CD](/docs/cicd/)
- [🐳 Docker y AWS](/docs/cicd/docker-aws.md)
- [📊 New Relic](/docs/cicd/newrelic.md)

---

## 📞 Soporte

Para preguntas específicas sobre Subpoenas:
- Consulta los [Casos de Uso](casos-uso/)
- Revisa las [Variables de Entorno](variables_entorno.md)
- Verifica los [Enums](enums.md)

---

**Última actualización:** {{ site.time | date: "%d de %B de %Y" }}
