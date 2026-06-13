# INMOVAL - Cierre de Fase 1

## Estado

Fase 1 cerrada.

La Fase 1 consolidó la base operativa de la Plataforma INMOVAL como centro administrativo para expedientes, cotizaciones, módulos, configuración y navegación.

---

## Objetivo de la Fase 1

Construir una plataforma funcional que permitiera operar INMOVAL desde una capa administrativa central, separando:

- Plataforma general
- Expedientes
- Cotizaciones
- Configuraciones por área
- Módulos técnicos
- Navegación global
- Centro de control

---

## Componentes implementados

### 1. Navegación global INMOVAL

Se implementó un layout global con:

- Botón INMOVAL siempre disponible
- Menú desplegable con pantallas principales
- Cierre automático del menú al seleccionar una opción
- Botón global de volver, oculto en pantallas de inicio
- Todas las rutas principales bajo AppLayout

Pantallas incluidas en el menú:

- Dashboard
- Centro INMOVAL
- Expedientes
- Nuevo expediente
- Configuración de Expedientes
- Cotizaciones
- Configuración de Cotizaciones
- Módulos
- Configuración General
- Avalúos técnicos
- Nuevo avalúo técnico
- Clientes
- Peritos

---

### 2. Centro INMOVAL

Se creó el Centro INMOVAL como dashboard administrativo de plataforma.

Incluye:

- Métricas de expedientes
- Métricas de cotizaciones
- Saldos pendientes
- Actividad reciente
- Accesos rápidos
- Configuración activa de expedientes
- Configuración activa de cotizaciones

Ruta:

/plataforma

---

### 3. Expedientes

Se creó la pantalla administrativa de expedientes.

Incluye:

- Índice local de expedientes
- Filtros y búsqueda
- Estados
- Prioridad
- Estado de pago
- Acceso a ficha individual
- Sincronización de avalúos técnicos actuales
- Botón de nuevo expediente
- Botón de configuración de expedientes

Ruta:

/expedientes-plataforma

---

### 4. Nuevo expediente

Se creó la pantalla para generar expedientes directamente desde Plataforma.

Usa configuración específica de expedientes para:

- Prefijo
- Estado inicial
- Prioridad predeterminada
- Moneda predeterminada
- Días estimados de entrega

Ruta:

/expedientes-plataforma/nuevo

---

### 5. Ficha individual de expediente

Se implementó la ficha administrativa del expediente.

Incluye:

- Datos principales
- Cliente
- Perito
- Módulo técnico
- Fechas
- Pago
- Facturación
- Drive
- Archivo .imv
- Actividad del expediente
- Acciones administrativas

Acciones:

- En elaboración
- En revisión
- Entregado
- Marcar pagado
- Emitir factura
- Cerrar expediente
- Registrar abono
- Guardar datos operativos

Ruta:

/expedientes-plataforma/:id

---

### 6. Regla configurable de cierre

La regla de cierre de expediente quedó controlada desde configuración.

Opciones:

- Requerir pago total + factura emitida
- Permitir cierre flexible

La ficha individual responde a esta configuración.

---

### 7. Actividad por expediente

Se implementó bitácora por expediente.

Registra:

- Creación del expediente
- Cambios de estado
- Pagos
- Abonos
- Facturación
- Cierre
- Cambios administrativos

---

### 8. Cotizaciones

Se creó la pantalla administrativa de cotizaciones.

Incluye:

- Crear cotización
- Crear cotización demo
- Enviar
- Aprobar
- Rechazar
- Crear expediente desde cotización
- Ver expediente asociado
- Filtros y resumen

Ruta:

/cotizaciones

---

### 9. Flujo cotización a expediente

Se implementó el flujo:

Cotización aprobada
↓
Crear expediente
↓
Abrir ficha del expediente
↓
Gestionar pago, factura y cierre

---

### 10. Configuración general de Plataforma

Se creó la configuración general de plataforma.

Incluye:

- Modo de operación
- Estado de servidor
- URL de servidor
- Estado de Drive
- Carpetas base de Drive
- Prefijo general
- Moneda principal
- Días de validez de cotización

Ruta:

/configuracion-plataforma

---

### 11. Configuración específica de Expedientes

Se creó configuración propia del área de expedientes.

Incluye:

- Prefijo de expediente
- Estado inicial
- Prioridad predeterminada
- Moneda predeterminada
- Días estimados de entrega
- Regla de cierre
- Mostrar u ocultar sincronización legacy

Ruta:

/expedientes-plataforma/configuracion

---

### 12. Configuración específica de Cotizaciones

Se creó configuración propia del área de cotizaciones.

Incluye:

- Prefijo de cotización
- Servicio predeterminado
- Monto predeterminado
- Moneda predeterminada
- Días de validez
- Requerir aprobación para crear expediente

Ruta:

/cotizaciones/configuracion

---

## Estado técnico

La Fase 1 deja lista una plataforma local funcional basada en:

- React
- TypeScript
- LocalStorage
- Rutas centralizadas
- Configuración modular por área
- Índices administrativos
- Flujo operativo básico

---

## Pendientes para Fase 2

La Fase 2 debe enfocarse en fortalecer operación real y estructura de datos.

Pendientes recomendados:

1. Exportar expediente .imv desde ficha
2. Importar expediente .imv
3. Crear estructura formal de comparables .imc
4. Conectar expedientes con avalúos técnicos urbanos
5. Mejorar flujo de revisión Rev00, Rev01, Final
6. Crear pantalla de usuarios y roles
7. Aplicar permisos por rol
8. Preparar conexión futura con servidor
9. Preparar integración futura con Google Drive
10. Mejorar reportes PDF
11. Fortalecer auditoría global
12. Preparar base para INMOVAL Campo

---

## Principio de cierre

La Fase 1 no finaliza el producto. Finaliza la base operativa administrativa.

A partir de aquí, INMOVAL ya tiene una plataforma navegable, configurable y operativa para gestionar expedientes y cotizaciones.

