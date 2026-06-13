# INMOVAL - Cierre de Fase 3

## Estado

Fase 3 cerrada.

La Fase 3 conectó la plataforma administrativa con la operación técnica inicial del avalúo urbano, dejando preparado el flujo para seleccionar comparables dentro del avalúo y no desde la plataforma administrativa.

---

## Objetivo de la Fase 3

Construir el puente funcional entre:

- Expediente
- Módulo técnico urbano
- Base de comparables
- Selección técnica de comparables
- Revisiones base
- Preparación para reporte final

---

## Parte 1 - Puente expediente a módulo técnico urbano

Se implementó:

- Preparación técnica desde expediente
- Pantalla de preparación técnica
- Registro de preparación técnica
- Vínculo manual con avalúo técnico urbano existente
- Botón para abrir módulo técnico
- Botón para crear avalúo técnico urbano
- Registro de actividad del vínculo técnico

Ruta:

- /expedientes-plataforma/:id/preparar-tecnico

---

## Parte 2 - Regla correcta de comparables

Se corrigió la arquitectura funcional de comparables:

- La plataforma administra la base de comparables
- La plataforma permite visualizar referencias
- La selección técnica de comparables se realiza dentro del avalúo
- El congelamiento técnico para reporte ocurre dentro del avalúo
- El testigo web queda en el comparable y se usa luego como respaldo

---

## Parte 3 - Comparables técnicos dentro del avalúo

Se creó una pantalla técnica para el avalúo urbano.

Permite:

- Ver comparables disponibles desde la base .imc
- Agregar comparables al avalúo
- Marcar comparable como preseleccionado
- Marcar comparable como usado
- Descartar comparable
- Congelar comparable para reporte
- Asignar revisión Rev00, Rev01, Rev02, Rev03 o Final
- Escribir justificación técnica
- Escribir resumen de ajuste u homologación
- Asignar peso técnico
- Ver testigo web del comparable

Ruta:

- /avaluos/:id/comparables

---

## Regla definitiva de comparables

Base de comparables:

- Crea comparables
- Importa .imc
- Exporta .imc
- Guarda URL
- Guarda fuente
- Guarda testigo web
- Guarda respaldo documental

Expediente:

- Visualiza la base como referencia administrativa
- No decide técnicamente los comparables
- No homologa
- No congela para reporte final

Avalúo Técnico Urbano:

- Selecciona comparables
- Justifica comparables
- Descarta comparables
- Congela comparables usados
- Prepara comparables para anexos y reporte final

---

## Revisiones base

Se incorporó una base funcional de revisiones para comparables técnicos:

- Rev00
- Rev01
- Rev02
- Rev03
- Final

Esta estructura permitirá que los comparables usados en cada revisión del avalúo se mantengan ordenados.

---

## Principio de cierre

La Fase 3 establece la diferencia correcta:

Plataforma administra.
Avalúo decide.
Comparable respalda.
Testigo web evidencia.
Revisión ordena.
Reporte final presentará.

---

## Pendientes para Fase 4

La Fase 4 debe enfocarse en integrar estos datos al reporte y al flujo técnico real:

1. Insertar comparables técnicos en el reporte de avalúo
2. Crear anexos de testigos web
3. Conectar selección de comparables con metodología de mercado
4. Mejorar homologación
5. Generar resumen automático de comparables usados
6. Crear estructura de revisión completa Rev00 / Rev01 / Final
7. Conectar expediente con técnico sin copiar IDs manualmente
8. Preparar exportación final .imv con selección técnica usada
9. Preparar PDF con anexos
10. Mejorar auditoría técnica

---

## Cierre

Con Fase 3, INMOVAL ya separa correctamente administración y criterio técnico.

La plataforma puede controlar expedientes, cotizaciones y comparables, mientras el módulo urbano empieza a tomar decisiones técnicas propias del avalúo.
