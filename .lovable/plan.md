# Plan: Reescritura fiel del Wizard y Preview al formato INMOVAL

## Objetivo
Reescribir los 8 pasos del wizard y la página de preview para que reflejen **exactamente** la estructura capitular del formato INMOVAL del PDF de referencia (Ing. Liliet López — Resolución CD-SIBOIF-868-1-DIC10-2014). Hoy la UI usa la capa de compatibilidad legada; esto la elimina y trabaja contra el esquema nuevo (`src/store/types.ts`) sin alias.

## Estructura capitular a replicar (según PDF)

```text
PORTADA           Datos del perito, código de expediente, finalidad, solicitante.
CAP. I            Información General
                  - Solicitante, propietario, ubicación, tipo de inmueble,
                    finalidad, fecha de inspección, fecha de avalúo.
CAP. II           Documentación Legal
                  - Escritura (no., notario, tomo, folio), inscripción registral,
                    catastro, gravámenes, observaciones SIBOIF.
CAP. III          Entorno Urbano
                  - Uso de suelo, zonificación, nivel socioeconómico, vías de
                    acceso, transporte, servicios públicos (agua, luz, drenaje,
                    teléfono, internet, recolección), riesgos y observaciones.
CAP. IV           Descripción del Terreno
                  - 1..n terrenos. Por terreno:
                    · Áreas: escritura / catastral / levantamiento (m² y vr²)
                    · 4 linderos (N/S/E/O) con descripción + medida
                    · Topografía, forma, frente, fondo, esquina, servidumbres
                    · Croquis / plano (foto opcional)
CAP. V            Descripción Constructiva
                  - 1..n infraestructuras por terreno. Por infraestructura:
                    · Tipo (principal / accesoria), uso, niveles, área m²
                    · Sistema constructivo (cimientos, estructura, paredes,
                      techos, entrepisos, pisos, cielos, puertas, ventanas,
                      acabados, instalaciones, ambientes)
                    · Edad, VUE, Estado FE (Ross-Heidecke)
                    · Memoria de costos por etapas (directos / indirectos /
                      impuestos) → VRN, depreciación, VNO
CAP. VI           Metodología y Avalúo
                  Sección A — Enfoque de Costos (terrenos + VNO infras)
                  Sección B — Enfoque de Mercado (Homologación)
                    · Ficha sujeto (terreno y/o inmueble construido)
                    · 3 comparables con factores: ubicación, zonificación,
                      acceso, servicios, topografía, área (Ac/As)^0.10,
                      negociación, edad/conservación
                    · Tabla de homologación → V/m² promedio → Valor mercado
                  Sección C — Valor de Realización
                    · Deducciones: IR, IBI, corretaje, legales, comercialización
                  Sección D — Conclusión y Valores Finales
CAP. VII          Anexos Fotográficos
                  - Categorías: fachada, interiores, terreno, linderos,
                    entorno, documentación, comparables.
CIERRE            Firma del perito, sello, fecha, declaración jurada.
```

## Cambios por archivo

### Wizard steps (reescritura completa, sin usar campos legados)

| Paso | Archivo | Contenido |
|---|---|---|
| 1 | `StepPerito.tsx` | Selector de perito firmante → fija plantilla INMOVAL. (ya existe, ajuste menor) |
| 2 | `StepCliente.tsx` | Solicitante + propietario + datos de contacto. |
| 3 | `StepInfo.tsx` | **CAP. I**: código expediente, finalidad, tipo avalúo, fechas, ubicación completa (depto/municipio/barrio/dirección/coordenadas). |
| 4 | *nuevo* `StepLegal.tsx` | **CAP. II**: escritura, registro, catastro, gravámenes. |
| 5 | *nuevo* `StepEntorno.tsx` | **CAP. III**: uso de suelo, zonificación, servicios, riesgos. |
| 6 | `StepTerrenos.tsx` | **CAP. IV**: 1..n terrenos con 4 linderos, áreas triples, topografía. |
| 7 | `StepInfraestructuras.tsx` | **CAP. V**: por terreno, infras con descripción constructiva + memoria de costos por etapas. |
| 8 | `StepMetodologias.tsx` | **CAP. VI**: tabs Costos / Mercado-Terreno / Mercado-Construido / Realización. Usa `homologacionTerreno`, `homologacionInmueble`, `valorRealizacion`. |
| 9 | `StepFotos.tsx` | **CAP. VII**: categorías oficiales (fachada, interiores, terreno, linderos, entorno, documentación, comparables). |
| 10 | `StepPreview.tsx` | Documento renderizado con portada + Cap I..VII + cierre. |

`StepperSidebar.tsx` y `AvaluoWizard.tsx`: actualizar lista de pasos (de 8 a 10).

### Preview (`src/pages/AvaluoPreview.tsx` + `StepPreview.tsx`)
Componer páginas tipo A4 con cabeceras del perito, paginación, secciones numeradas en romano y tablas con los cálculos:
- Tabla resumen valores (terreno + VNO infras + valor mercado + valor realización).
- Tabla de homologación con factores por columna.
- Memoria de costos por etapas.
- Croquis/fotos al final.

### Limpieza de tipos
Quitar de `src/store/types.ts` los bloques `// ---- alias / legados (UI prototipo) ----` una vez que la UI nueva no los usa. Actualizar factories `empty*` consecuentemente.

### Cálculos
`src/lib/calculations.ts` ya contiene todo lo necesario (Ross-Heidecke, homologación, realización). Sólo retirar helpers legados (`depreciacion`, `valorTerreno`, `valorComparable`, `promedioUnitarioComparables`) cuando dejen de tener referencias.

## Orden de ejecución
1. Actualizar `AvaluoWizard.tsx` + `StepperSidebar.tsx` con los 10 pasos.
2. Reescribir pasos 3→9 contra el esquema nuevo.
3. Reescribir `StepPreview.tsx` / `AvaluoPreview.tsx` con la maquetación INMOVAL.
4. Eliminar alias legados de `types.ts` y helpers legados de `calculations.ts`.
5. Verificar build y abrir un avalúo de prueba en el preview.

## Fuera de alcance
- Autenticación, sincronización en la nube, IA, multiempresa, firma digital.
- Plantillas distintas a INMOVAL (quedan como `PlantillaId` para futuro).
- Exportación a PDF real (el preview será HTML imprimible).
