# INMOVAL — Arquitectura Base

## 1. Concepto general

INMOVAL se plantea como una plataforma híbrida para gestión de expedientes de avalúo.

La plataforma no debe entenderse como un único módulo de avalúo, sino como una consola operativa que puede cargar módulos técnicos especializados.

## 2. Metáfora principal

- Plataforma INMOVAL = consola.

- Módulos técnicos = cartuchos o discos.

- Expediente `.imv` = archivo completo del expediente.

- Comparable `.imc` = archivo completo de comparable.

- Inspección `.imins` = paquete de inspección de campo.

- Módulo `.immod` = paquete de módulo técnico.

## 3. Componentes principales

```txt

INMOVAL

├─ Plataforma INMOVAL

├─ Módulos técnicos

├─ Base de comparables

├─ Archivos integrales

└─ Integraciones externas