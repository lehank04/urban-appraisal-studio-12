# INMOVAL - Cierre de Fase 2

## Estado

Fase 2 cerrada.

La Fase 2 fortaleció la arquitectura portable de INMOVAL y preparó el puente entre plataforma administrativa, archivos integrales, comparables y módulos técnicos.

---

## Objetivo de la Fase 2

Convertir la plataforma local en una base operativa portable, capaz de:

- Exportar expedientes como archivos .imv
- Importar expedientes desde archivos .imv
- Crear una base local de comparables
- Exportar comparables como archivos .imc
- Importar comparables desde archivos .imc
- Guardar testigos web como respaldo del comparable
- Preparar el vínculo entre expediente administrativo y módulo técnico urbano

---

## Parte 1 - Expedientes .imv

Se implementó:

- Formato de archivo .imv para expediente administrativo
- Exportación .imv desde ficha individual
- Importación .imv desde pantalla dedicada
- Validación básica de formato
- Registro de actividad al exportar/importar
- Ruta de importación
- Accesos desde menú INMOVAL

Rutas:

- /expedientes-plataforma/importar
- /expedientes-plataforma/:id

---

## Parte 2 - Comparables .imc

Se implementó:

- Base local de comparables
- Crear comparable
- Exportar comparable .imc
- Importar comparable .imc
- Filtrar comparables
- Eliminar comparable del índice local
- Guardar URL de referencia
- Guardar fuente, contacto, ubicación, áreas, precio y observaciones
- Guardar testigo web como imagen dentro del comparable

Ruta:

- /comparables

---

## Testigo web del comparable

Cada comparable puede guardar un respaldo visual de mercado.

El testigo web permite conservar:

- Captura de pantalla del anuncio
- Imagen de la página o publicación
- Nombre del archivo
- Fecha de captura
- Notas del testigo
- URL de referencia

Este respaldo queda dentro del archivo .imc y podrá ser usado luego en:

- Anexos del avalúo
- Sección de testigos
- Justificación de comparables
- Evidencia de mercado

---

## Parte 3 - Vínculo administrativo con módulo técnico

Se preparó el puente entre:

- Expediente administrativo de Plataforma
- Expediente técnico urbano
- Módulo de avalúo urbano

La ficha administrativa ahora puede guardar:

- ID del expediente técnico
- Ruta del expediente técnico
- Tipo de módulo vinculado
- Fecha de vinculación

Este vínculo queda dentro del expediente y se conserva al exportar .imv.

---

## Principio de arquitectura reforzado

La Fase 2 consolidó la idea:

Plataforma INMOVAL controla.
Expediente .imv contiene.
Comparable .imc respalda.
Módulo técnico trabaja.
Testigo web evidencia.
Google Drive almacenará.
Servidor coordinará.

---

## Pendientes para Fase 3

La Fase 3 debe enfocarse en operación técnica real e integración profunda:

1. Crear expediente técnico urbano automáticamente desde expediente administrativo
2. Sincronizar datos administrativos hacia el módulo urbano
3. Consumir comparables .imc dentro del avalúo
4. Insertar testigos web en el reporte de avalúo
5. Preparar Rev00, Rev01 y Final
6. Preparar roles y permisos reales
7. Crear usuarios locales
8. Preparar integración con Google Drive
9. Preparar estructura para servidor
10. Mejorar exportación PDF con anexos

---

## Cierre

La Fase 2 deja a INMOVAL con una base portable y auditable.

A partir de aquí, los expedientes y comparables ya pueden moverse como archivos propios de INMOVAL y conservar respaldo documental básico.
