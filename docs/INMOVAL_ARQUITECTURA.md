# INMOVAL — Arquitectura Base

## 1. Concepto general

INMOVAL se plantea como una plataforma híbrida para gestión de expedientes de avalúo.

La plataforma no debe entenderse como un único módulo de avalúo, sino como una consola operativa que puede cargar módulos técnicos especializados.

La arquitectura debe permitir crecer de forma ordenada, sin mezclar la operación administrativa con la lógica técnica de cada tipo de avalúo.

---

## 2. Metáfora principal

- Plataforma INMOVAL = consola.
- Módulos técnicos = cartuchos o discos.
- Expediente `.imv` = archivo completo del expediente.
- Comparable `.imc` = archivo completo de comparable.
- Inspección `.imins` = paquete de inspección de campo.
- Módulo `.immod` = paquete de módulo técnico.

La plataforma controla la operación.  
Los módulos técnicos hacen el trabajo especializado.  
Los archivos integrales permiten guardar, cargar, respaldar y transportar información.

---

## 3. Componentes principales

```txt
INMOVAL
├─ Plataforma INMOVAL
├─ Módulos técnicos
├─ Base de comparables
├─ Archivos integrales
└─ Integraciones externas

```

---

## 4. Plataforma INMOVAL

La Plataforma INMOVAL gestiona la operación.

Incluye:

- Dashboard operativo.
- Expedientes.
- Clientes.
- Peritos.
- Cotizaciones.
- Pagos.
- Facturación.
- Estados.
- Revisiones.
- Historial de actividad.
- Usuarios y roles.
- Módulos técnicos disponibles.
- Referencias a archivos `.imv`.
- Acceso a base de comparables.

La plataforma controla, pero no debe mezclar toda la lógica técnica de cada tipo de avalúo.

La Plataforma INMOVAL debe poder funcionar como centro operativo para:

- Crear expedientes.
- Emitir cotizaciones.
- Dar seguimiento a estados.
- Controlar pagos.
- Registrar facturas.
- Asignar peritos.
- Ver actividad.
- Abrir módulos técnicos.
- Cargar o guardar expedientes.
- Gestionar comparables.
- Prepararse para servidor y Google Drive.

---

## 5. Módulos técnicos

Los módulos técnicos funcionan como cartuchos.

Módulos previstos:

- Inmuebles urbanos.
- Inmuebles rurales.
- Maquinaria y equipos.
- Vehículos.
- Avalúos especiales.

Cada módulo debe tener:

- Pantallas propias.
- Formularios propios.
- Catálogos propios.
- Validaciones.
- Cálculos.
- Memorias.
- Importadores.
- Exportadores.
- Preview.
- Conexión con comparables.

La Plataforma INMOVAL no debe depender internamente de la lógica específica de cada módulo.  
Cada módulo debe poder cargarse, activarse o desactivarse según la computadora, el usuario o la licencia disponible.

---

## 6. Módulos técnicos cargados en la computadora

La plataforma debe recordar qué módulos técnicos tiene cargados cada computadora.

Ejemplo:

```txt
Esta computadora:
├─ Módulo urbano: activo
├─ Módulo rural: no instalado
├─ Módulo maquinaria: no instalado
├─ Módulo vehículos: no instalado
└─ Módulo especiales: no instalado

```

Esto permite:

- Evitar abrir avalúos de módulos no instalados.
- Controlar qué tipo de avalúos puede trabajar cada perito.
- Reducir errores operativos.
- Mantener la plataforma limpia.
- Separar la consola de los cartuchos técnicos.

Si un expediente requiere un módulo no disponible, la plataforma debe mostrar una advertencia:

```txt
Este expediente requiere el módulo técnico rural.
El módulo no está cargado en esta computadora.

```

---

## 7. Base de comparables

La base de comparables es independiente de la plataforma, pero interactúa con ella y con los módulos técnicos.

Debe permitir:

- Crear comparables.
- Editar comparables.
- Consultar comparables.
- Filtrar comparables.
- Archivar comparables.
- Descartar comparables.
- Exportar comparables `.imc`.
- Importar comparables `.imc`.

Cada comparable debe tener fecha de publicación y fecha de expiración.

Regla base:

```txt
fechaExpiracion = fechaPublicacion + 1 año

```

Estados previstos:

- Vigente.
- Por vencer.
- Vencido.
- Archivado.
- Descartado.

La base de comparables debe poder funcionar como biblioteca compartida para los módulos técnicos.  
Los módulos técnicos consultan la base, seleccionan comparables y copian los comparables usados dentro de la revisión activa del expediente.

---

## 8. Comparables usados en avalúos

Cuando un comparable se usa en una revisión de avalúo, debe guardarse una copia congelada dentro del expediente `.imv`.

Esto es importante porque la base de comparables puede cambiar con el tiempo.

Regla:

```txt
Comparable en base de datos = registro vivo.
Comparable usado en revisión = copia congelada.

```

Así se conserva la trazabilidad técnica.

Ejemplo:

```txt
Rev01
├─ Comparable usado A
├─ Comparable usado B
└─ Comparable usado C

```

Aunque después el comparable original se actualice, venza o se archive, la revisión conserva la información utilizada al momento de emitir el avalúo.

---

## 9. Archivos integrales

INMOVAL debe manejar archivos integrales para portabilidad, respaldo y trazabilidad.

Formatos previstos:


| Extensión | Uso                         |
| --------- | --------------------------- |
| `.imv`    | Expediente completo INMOVAL |
| `.imc`    | Comparable completo         |
| `.imins`  | Inspección de campo         |
| `.immod`  | Módulo técnico              |


---

## 10. Archivo `.imv`

Archivo integral del expediente.

Debe contener:

- Datos administrativos.
- Cliente.
- Perito.
- Cotización.
- Pagos.
- Facturación.
- Estados.
- Revisiones.
- Avalúo técnico.
- Fotos.
- Documentos.
- Inspecciones importadas.
- Comparables usados congelados.
- Historial interno.

El `.imv` representa el expediente completo.  
Debe poder exportarse, importarse, respaldarse y cargarse nuevamente.

Primera versión:

```txt
.imv = JSON estructurado con extensión .imv

```

Versión futura:

```txt
.imv = paquete comprimido con:
├─ expediente.json
├─ fotos/
├─ documentos/
├─ revisiones/
└─ evidencias/

```

---

## 11. Archivo `.imc`

Archivo integral de comparable.

Debe contener:

- Datos del comparable.
- Fuente.
- URL.
- Fecha de publicación.
- Fecha de captura.
- Fecha de expiración.
- Ubicación.
- Coordenadas.
- Precio.
- Área.
- Factores.
- Evidencias.
- Fotos.
- Capturas.
- Historial.

El `.imc` permite respaldar un comparable completo, incluyendo su evidencia.

Primera versión:

```txt
.imc = JSON estructurado con extensión .imc

```

Versión futura:

```txt
.imc = paquete comprimido con:
├─ comparable.json
├─ fotos/
├─ capturas/
└─ documentos/

```

---

## 12. Archivo `.imins`

Paquete de inspección de campo.

Debe contener:

```txt
.imins
├─ inspeccion.json
├─ fotos/
└─ documentos/

```

El archivo `inspeccion.json` contiene los datos y el mapa de fotos.

Las fotos deben tener:

- Título.
- Categoría.
- Descripción.
- Archivo.
- Orden.
- Coordenadas.
- Terreno asociado.
- Infraestructura asociada.
- Componente asociado.
- Indicación de uso en informe.

La app de campo no debe generar solo un JSON simple cuando existan fotos.  
Debe generar un paquete de inspección que permita importar las imágenes donde corresponden dentro del módulo técnico urbano.

---

## 13. Archivo `.immod`

Paquete de módulo técnico.

Debe contener la información necesaria para identificar y cargar un módulo técnico.

Debe incluir:

- ID del módulo.
- Nombre.
- Tipo.
- Versión.
- Estado.
- Compatibilidad.
- Catálogos.
- Pantallas.
- Cálculos.
- Memorias.
- Importadores.
- Exportadores.

Ejemplo:

```txt
modulo-urbano-v1.immod
modulo-rural-v1.immod
modulo-maquinaria-v1.immod

```

---

## 14. Servidor y Google Drive

Arquitectura híbrida recomendada:

```txt
Servidor = cerebro operativo.
Google Drive = bodega documental.
.imv = expediente completo.
Módulos técnicos = cartuchos.
INMOVAL Web = consola/plataforma.

```

El servidor debe manejar:

- Login.
- Usuarios.
- Roles.
- Permisos.
- Índice de expedientes.
- Estados.
- Cotizaciones.
- Pagos.
- Facturación.
- Historial de actividad.
- Base de comparables consultable.
- Referencias a archivos en Google Drive.

Google Drive debe almacenar:

- Archivos `.imv`.
- Archivos `.imc`.
- Archivos `.immod`.
- Archivos `.imins`.
- PDFs.
- Fotos.
- Documentos.
- Evidencias.

---

## 15. Usuarios y roles

Roles previstos:

- Administrador.
- Administrativo.
- Operacional / técnico.

Regla inicial:

```txt
El usuario operacional no debe ver flujo de dinero, pagos ni saldos.

```

El usuario administrativo puede trabajar la parte operativa, financiera y comercial.

El usuario operacional trabaja el avalúo técnico, revisiones, inspecciones, módulos técnicos y comparables, pero no debe ver información financiera sensible.

---

## 16. Estados del expediente

Estados previstos:

- En cotización.
- Cotización enviada.
- Cotización aprobada.
- Pendiente de inspección.
- En inspección.
- En elaboración.
- En revisión.
- Correcciones.
- Aprobado.
- Entregado.
- Facturado.
- Cerrado.
- Cancelado.

Regla de cierre:

```txt
Cerrado = pago total + factura emitida.

```

El expediente no debe cerrarse solo por haber entregado el avalúo.  
Debe cerrarse cuando el servicio esté pagado totalmente y la factura haya sido emitida.

---

## 17. Cotizaciones

La cotización forma parte del expediente.

Debe contener:

- Número de cotización.
- Cliente.
- Solicitante.
- Servicio.
- Descripción del servicio.
- Monto.
- Moneda.
- Fecha.
- Fecha de vencimiento.
- Forma de pago.
- Tiempo de entrega.
- Entregables.
- Términos y condiciones.
- Estado de la cotización.

Estados de cotización:

- Borrador.
- Enviada.
- Aprobada.
- Rechazada.
- Vencida.

La aprobación de la cotización debe permitir avanzar el expediente hacia inspección.

---

## 18. Pagos y facturación

El expediente debe registrar:

- Costo del servicio.
- Monto pagado.
- Saldo pendiente.
- Estado de pago.
- Factura emitida.
- Número de factura.
- Fecha de factura.

Estados de pago:

- Pendiente.
- Parcial.
- Pagado.
- No aplica.

Regla:

```txt
Si montoPagado >= costoServicio y facturaEmitida = true,
el expediente puede pasar a Cerrado.

```

---

## 19. Revisiones del avalúo

Cada expediente puede tener varias revisiones.

Ejemplo:

- Rev00 / Borrador.
- Rev01.
- Rev02.
- Rev03.
- Final.

El módulo técnico trabaja sobre la revisión activa.

Cada revisión debe poder:

- Abrirse.
- Duplicarse.
- Modificarse.
- Exportarse.
- Marcarse como final.

Las correcciones deben crear una nueva revisión sin perder la anterior.

---

## 20. Historial de actividad

La plataforma debe registrar actividad.

Ejemplos:

- Expediente creado.
- Cotización emitida.
- Cotización aprobada.
- Cliente asignado.
- Perito asignado.
- Inspección importada.
- Revisión creada.
- Revisión exportada.
- Pago registrado.
- Factura emitida.
- Expediente cerrado.
- Comparable creado.
- Comparable usado.
- Archivo `.imv` exportado.
- Archivo `.imv` importado.

Cada evento debe guardar:

- Fecha.
- Usuario.
- Acción.
- Módulo.
- Expediente relacionado.
- Revisión relacionada.
- Detalle.

---

## 21. INMOVAL Campo

INMOVAL Campo será una app externa para inspecciones.

Debe capturar:

- Información general del avalúo.
- Ubicación.
- Coordenadas.
- Entorno.
- Terrenos.
- Áreas.
- Linderos.
- Infraestructuras.
- Componentes constructivos.
- Estado físico.
- Edad aparente.
- Vida útil estimada.
- Fotos.
- Documentos.
- Observaciones.

No debe calcular:

- Valor final.
- Homologación.
- Depreciación final.
- Valor de realización.
- PDF final.

La app de campo debe generar un archivo `.imins`.

---

## 22. Módulo urbano

El módulo urbano será el primer módulo técnico real.

Debe incluir:

- Pista de lanzamiento.
- Importar inspección `.imins`.
- Información general.
- Documentación legal.
- Entorno.
- Terrenos.
- Linderos.
- Infraestructuras.
- Fotos.
- Coordenadas.
- Memorias de reposición.
- Depreciación.
- Mercado.
- Comparables.
- Preview.
- Exportación PDF.
- Revisiones.

El módulo urbano debe ser tratado como el primer cartucho técnico de INMOVAL.

---

## 23. Regla general de arquitectura

```txt
La plataforma controla.
El módulo técnico trabaja.
El archivo .imv contiene.
La base de comparables alimenta.
Google Drive almacena.
El servidor coordina.

```

---

## 24. Orden de implementación

Orden recomendado:

1. Limpieza de casa y arquitectura base.
2. Plataforma INMOVAL operativa.
3. Revisiones.
4. Archivo `.imv`.
5. Base de comparables.
6. Archivo `.imc`.
7. Preparación servidor / Google Drive.
8. Módulos técnicos como cartuchos.
9. Módulo urbano como primer cartucho real.
10. Paquete de inspección `.imins`.
11. INMOVAL Campo.
12. Módulo rural.
13. Módulos técnicos adicionales.

---

## 25. Principio final

INMOVAL debe crecer sin perder orden.

La plataforma no debe convertirse en una mezcla desordenada de formularios, cálculos y expedientes.

Cada pieza debe tener responsabilidad clara:

- Plataforma INMOVAL: operación.
- Módulo técnico: avalúo especializado.
- Comparables: biblioteca técnica.
- `.imv`: expediente completo.
- `.imc`: comparable completo.
- `.imins`: inspección de campo.
- `.immod`: módulo técnico.
- Servidor: coordinación.
- Google Drive: bodega documental.

