# Sistema de Avalúos INMOVAL — Prototipo Dinámico

Voy a transformar el prototipo en un ensamblador técnico-documental con sidebar profesional, tema oscuro elegante y un wizard de creación de avalúo por pasos.

## Arquitectura

- **Estado global** con Zustand (`src/store/avaluoStore.ts`) — persistencia en localStorage. Modelo: `Cliente`, `Perito/Plantilla`, `InfoGeneral`, `Terreno[]` (con `Infraestructura[]`), `Metodologias`, `Comparables[]`, `Fotos{categoria}`.
- **Layout** con `SidebarProvider` shadcn: navegación por avalúos, peritos, clientes, configuración.
- **Diseño**: tema oscuro empresarial (slate/zinc + acento azul técnico), tipografía Inter + JetBrains Mono para códigos. Tokens semánticos en `index.css`.

## Rutas

```
/                          Dashboard (lista de avalúos + KPIs)
/avaluos                   Listado
/avaluos/nuevo             Wizard 8 pasos
/avaluos/:id               Editor (mismos pasos, ya creado)
/avaluos/:id/preview       Vista previa documental paginada
/peritos                   CRUD peritos / plantillas
/clientes                  CRUD clientes
```

## Wizard (8 pasos con stepper lateral)

1. **Cliente** — buscador + crear nuevo (modal).
2. **Perito / Plantilla** — cards seleccionables: INMOVAL, Adalberto, Adicional. Define plantilla.
3. **Información general** — formulario con todos los campos listados.
4. **Terrenos dinámicos** — selector de cantidad + acordeón por terreno con todos los campos (selects con opciones precargadas + "personalizado").
5. **Infraestructuras** — dentro de cada terreno, botón `+ Nueva Infraestructura`, tipo/nombre/desc/unidad/área/estado/vida útil/edad/obs. Auto-calcula reposición y depreciación (línea recta: `valor = costo * (1 - edad/vidaUtil)`).
6. **Metodologías** — switches por método. Comparativo: tabla de comparables con factores activables, recálculo automático (precio ajustado = precio * Π factores activos). Si método desactivado → texto justificativo.
7. **Fotografías** — tabs por categoría, drag&drop (HTML5), reordenar, descripción, eliminar. Imágenes en base64 en store.
8. **Vista previa** — documento paginado A4 simulado (`max-w-[210mm]` con sombras), ensambla portada + capítulos + tablas consolidadas. Botón imprimir.

## Componentes reutilizables

- `DynamicField` (select con opción "Personalizado" → input)
- `RepeatableSection` (terrenos, infraestructuras, comparables)
- `CollapsiblePanel`, `DataTable`, `PhotoDropzone`, `StepperSidebar`, `DocumentPage`
- `ConsolidadoTerrenos`, `ConsolidadoInfra`, `ConsolidadoValores` (derivados del store)

## Plantillas

`src/templates/inmoval.ts` define: portada (campos, layout), orden de capítulos, textos base, footer/header, anexos. Otros peritos extienden o sobreescriben.

## Detalles técnicos

- Cálculos en `src/lib/calculations.ts`: depreciación, factor comparativo, totales.
- Opciones precargadas (forma, topografía, servicios, etc.) en `src/lib/catalogos.ts`.
- Sin backend: todo client-side con Zustand + persist. Fácil de migrar a Lovable Cloud después.

## Entrega

Prototipo funcional navegable end-to-end: crear avalúo → completar 8 pasos → ver documento ensamblado con consolidados.
