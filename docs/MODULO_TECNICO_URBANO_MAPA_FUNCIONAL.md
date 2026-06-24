# Módulo Técnico Urbano — Mapa Funcional (Fase Técnica 01)

> Documento de análisis funcional. **No implementa cálculos**. Define la estructura
> que debe tener el módulo técnico urbano de INMOVAL para que el informe final sea
> equivalente en contenido y orden a los formatos SIBOIF de referencia (3 PDFs de
> avalúo urbano analizados).
>
> Restricciones respetadas:
> - No modifica cálculos existentes.
> - No reconstruye el módulo urbano.
> - No toca claves de localStorage.
> - No cambia rutas.
> - No afecta el flujo cotización → expediente → finanzas.
> - Sólo agrega documentación.

---

## 1. Estructura final del informe urbano

Orden canónico del PDF a generar (alineado con SIBOIF):

1. **Portada**
   - Logo, título "Informe de Avalúo", tipo de inmueble, ubicación, cliente,
     perito responsable, fecha, número de expediente, número de informe.
2. **Índice** (auto-generado a partir de las secciones presentes).
3. **Carta de presentación**
   - Dirigida al cliente. Resumen del propósito, objeto, valor concluido y
     vigencia del avalúo.
4. **Metodología**
   - Enfoques aplicados (comparativo de mercado, costo de reposición, residual,
     etc.), normativa, fuentes, alcance y limitaciones.
5. **Características del inmueble**
   - Identificación, datos legales, datos catastrales, entorno, terreno,
     construcciones, ambientes, instalaciones, obras complementarias,
     fotografías.
6. **Análisis de valoración**
   - Comparables, homologación, cálculo de valor de terreno, cálculo de valor
     de construcción (reposición nuevo y neto), depreciación.
7. **Resumen de valores**
   - Valor de terreno, valor de construcción, valor total, valor de mercado y
     valor de realización (o "valor de liquidación forzosa").
8. **Certificación**
   - Declaración del perito, firma, sello, número de acreditación.
9. **Anexos**
   - Documentos legales, planos, certificados catastrales, fotos completas,
     comparables fuente, croquis de ubicación.

---

## 2. Tipos de casos que debe soportar

| Caso | Terreno | Construcción | Reposición Nuevo | Reposición Neto | Mercado | Realización | Avance de obra |
|------|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| Casa de habitación / inmueble con construcción | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | opcional |
| Lote vacío | ✔ | — | — | — | ✔ | ✔ | — |
| Lote con mejoras | ✔ | parcial (mejoras) | ✔ (sólo mejoras) | ✔ | ✔ | ✔ | — |
| Local comercial | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | opcional |
| Bodega | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | opcional |
| Oficina | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | opcional |
| Obra en proceso (avance) | ✔ | parcial (% avance) | ✔ × % | ✔ × % | informativo | informativo | ✔ obligatorio |

### Diferencias clave

**Inmueble con construcción:**
- Terreno (comparables + homologación)
- Construcción (ambientes, áreas, tipo constructivo)
- Obras complementarias (muros, portones, piscina, etc.)
- Depreciación (edad, vida útil, estado)
- Valor de reposición nuevo
- Valor de reposición neto = nuevo − depreciación
- Valor de mercado y valor de realización

**Lote vacío:**
- Sólo terreno
- Entorno y comparables
- Homologación por factores
- Valor de mercado y valor de realización
- **NO aplica** reposición nuevo ni reposición neto
- **NO aplica** depreciación ni ambientes

---

## 3. Campos de captura necesarios

### 3.1 Datos generales
- Número de expediente (heredado), número de informe, fecha de inspección,
  fecha de emisión, perito responsable, revisor.

### 3.2 Cliente
- Nombre / razón social, identificación, dirección, contacto, solicitante.

### 3.3 Propósito
- Garantía bancaria, compra-venta, seguro, sucesión, contable, judicial, etc.

### 3.4 Ubicación
- Departamento, municipio, distrito, barrio, dirección exacta, coordenadas
  GPS, croquis, link de mapa.

### 3.5 Documentación legal
- Escritura, número, notario, fecha, libro, folio, asiento.
- Inscripción registral.
- Gravámenes / limitaciones.

### 3.6 Datos catastrales
- Número catastral, área registral, área catastral, área medida.

### 3.7 Descripción del entorno
- Tipo de zona (residencial, comercial, mixta, industrial).
- Nivel socioeconómico.
- Densidad.
- Uso de suelo predominante.

### 3.8 Vías de acceso
- Tipo de calle (asfalto, adoquín, tierra), ancho, estado, tránsito.

### 3.9 Servicios públicos
- Agua, energía, alcantarillado, telefonía, internet, recolección, alumbrado.

### 3.10 Equipamiento urbano
- Cercanía a escuelas, hospitales, comercios, transporte, áreas verdes.

### 3.11 Terreno
- Área, frente, fondo, forma, topografía, posición en manzana,
  servidumbres, retiros, restricciones.

### 3.12 Construcciones
- Año de construcción, tipo constructivo, sistema estructural, calidad,
  estado de conservación, niveles, área construida por nivel.

### 3.13 Ambientes
- Listado: sala, comedor, cocina, dormitorios, baños, garaje, terraza,
  patio, otros. Cantidades y áreas.

### 3.14 Fotografías
- Fachada, interiores por ambiente, exteriores, entorno, daños/observaciones,
  documentos. Pie de foto y fecha.

### 3.15 Comparables
- Tipo (oferta / venta), fuente, fecha, ubicación, área de terreno, área
  construida, precio, precio unitario, contacto.

### 3.16 Homologación
- Factores aplicados a cada comparable y resultado homologado.

### 3.17 Costos de construcción
- Tipo constructivo seleccionado, costo unitario base ($/m²), ajustes,
  costo total por área y tipo.

### 3.18 Depreciación
- Edad efectiva, vida útil total, vida útil remanente, estado, método
  (Ross-Heidecke, lineal, Fitto-Corvini), factor resultante.

### 3.19 Valores finales
- Valor de terreno, valor de construcción nuevo, valor de construcción neto,
  valor de obras complementarias, valor total, valor de mercado, valor de
  realización, vigencia.

### 3.20 Anexos
- Documentos escaneados, planos, comparables completos, evidencias.

---

## 4. Secciones del módulo técnico dentro del expediente

Orden de tabs/pasos sugerido (no implementar todavía, sólo mapear):

1. Identificación
2. Legal / documental
3. Entorno
4. Terreno
5. Construcciones
6. Ambientes
7. Fotografías
8. Comparables
9. Homologación
10. Costo / reposición
11. Depreciación
12. Cálculo final
13. Informe (preview)
14. Anexos

Cada sección debe poder marcarse como `completa`, `incompleta`, `no aplica`
(según tipo de caso).

---

## 5. Cálculos a implementar (fases posteriores)

| # | Cálculo | Entrada | Salida |
|---|---------|---------|--------|
| 1 | Valor de terreno por comparables | comparables homologados, área | $/m² ponderado, valor total |
| 2 | Homologación por factores | comparable, factores | valor homologado por comparable |
| 3 | Valor de construcción por reposición | área × $/m² × tipo | valor de reposición nuevo |
| 4 | Depreciación | edad, vida útil, estado | factor de depreciación |
| 5 | Valor de reposición nuevo | suma de construcciones + obras | total nuevo |
| 6 | Valor de reposición neto | nuevo × (1 − depreciación) | total neto |
| 7 | Valor de mercado | terreno + construcción neto (+ ajuste) | valor de mercado |
| 8 | Valor de realización | mercado × factor liquidación | valor de realización |
| 9 | Resumen final de valores | todo lo anterior | tabla final del informe |

---

## 6. Factores de homologación identificados

Recurrentes en los 3 informes de referencia:

- Superficie / tamaño
- Ubicación (micro y macro)
- Cantidad / calidad de ambientes
- Negociación / tiempo en mercado (oferta vs venta)
- Tipo de zona
- Vías de acceso
- Servicios públicos
- Equipamiento urbano
- Topografía
- Forma / posición del terreno (esquinero, medianero, irregular)
- Frente / fondo
- Fuente (privada, broker, portal)
- Antigüedad de la oferta
- Estado de conservación (cuando comparable es construido)

Todos deben quedar **configurables** en Biblioteca (rango permitido,
default y obligatoriedad).

---

## 7. Bibliotecas necesarias

| Biblioteca | Contenido | Fuente de verdad |
|------------|-----------|------------------|
| Base de comparables | comparables históricos reutilizables | módulo Comparables existente |
| Precios de obra por m² | costo unitario por tipo constructivo y calidad | nueva (Fase 3) |
| Plantillas de informe | layouts PDF por tipo de caso | nueva (Fase 5) |
| Criterios técnicos | metodologías, fórmulas, normativa | nueva (Fase 1-2) |
| Catálogos de factores | factores de homologación + rangos | nueva (Fase 2) |
| Catálogos de estado de conservación | escala (excelente / bueno / regular / malo / ruinoso) | nueva (Fase 3) |
| Catálogos de tipos constructivos | mampostería confinada, minifalda, prefabricado, etc. | nueva (Fase 3) |

---

## 8. Propuesta de implementación por fases

| Fase | Alcance | Riesgo | Dependencias |
|------|---------|--------|--------------|
| **F1** Estructura y captura técnica | crear secciones del módulo, formularios, persistencia | bajo | tipos de expediente actuales |
| **F2** Comparables y homologación | conectar Biblioteca de comparables, motor de factores | medio | F1 + módulo Comparables |
| **F3** Costos de construcción y depreciación | catálogos de precios, métodos de depreciación | medio | F1, Biblioteca |
| **F4** Cálculo de valores finales | motor de cálculo, resumen, validaciones | alto | F2, F3 |
| **F5** Generación de informe PDF | plantillas, render por tipo de caso, índice automático | alto | F4 |
| **F6** Revisión, firma, anexos y exportación | flujo de revisión, firma del perito, paquete final | medio | F5 + flujo de roles |

---

## 9. Riesgos y decisiones pendientes

### Qué debe quedar **configurable** (Configuración)
- Catálogos editables sin tocar código.
- Plantillas de informe por cliente / banco.
- Factores obligatorios vs opcionales.
- Métodos de depreciación habilitados.

### Qué debe venir de **Biblioteca**
- Comparables.
- Precios unitarios de construcción.
- Tipos constructivos.
- Catálogos de factores.
- Plantillas y textos legales.

### Qué debe venir del **expediente**
- Cliente, ubicación, perito, propósito.
- Datos heredados de la cotización (estructura financiera).
- Documentos legales adjuntos.

### Qué debe venir del **módulo técnico**
- Mediciones, ambientes, comparables seleccionados, homologación aplicada,
  cálculos, fotografías técnicas, observaciones del perito.

### Qué debe **bloquear la emisión del informe**
- Sección legal incompleta.
- Menos de N comparables homologados (definir N por tipo).
- Falta de fotografías mínimas obligatorias.
- Cálculo final sin firmar por el perito responsable.
- Tipo de caso no definido.
- Revisión pendiente (si el flujo de revisión está activo).

### Riesgos abiertos
- Diferencia entre área registral, catastral y medida → política de cuál
  prevalece para el cálculo.
- Métodos de depreciación: definir cuál es default (sugerido: Ross-Heidecke).
- Cómo manejar comparables sin fuente verificable.
- Versionado de plantillas (un informe ya emitido no debe cambiar si se
  actualiza la plantilla).
- Multi-moneda en costos de construcción.

---

## 10. Recomendación de siguiente fase técnica

**Fase Técnica 02 → F1: Estructura y captura técnica.**

Acciones sugeridas (no ejecutadas aún):
1. Definir tipos TypeScript del módulo técnico urbano (sin tocar los actuales,
   en un archivo nuevo tipo `urbanoModuloTypes.ts`).
2. Crear esqueleto de secciones (tabs) en el módulo urbano existente sin
   romper rutas.
3. Persistir por expediente con una clave nueva específica del módulo, sin
   colisionar con las claves actuales.
4. Marcar cada sección con su estado (`completa | incompleta | no_aplica`).
5. Dejar los cálculos como `TODO` señalizados, listos para F2-F4.

---

## Entrega de esta fase

- **Build:** no se ejecutó porque no se modificó código fuente. Sólo se
  agregó este documento Markdown.
- **Archivo creado:** `docs/MODULO_TECNICO_URBANO_MAPA_FUNCIONAL.md`
- **Archivos modificados:** ninguno.
- **Resumen:** mapa funcional completo del módulo técnico urbano alineado
  a los 3 informes SIBOIF de referencia, con estructura del informe, casos
  soportados, campos de captura, secciones del módulo, cálculos pendientes,
  factores de homologación, bibliotecas, fases y riesgos.
- **Siguiente fase recomendada:** Fase Técnica 02 → F1 (Estructura y
  captura técnica, no destructiva).
