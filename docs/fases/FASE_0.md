# FASE 0 — Base arquitectónica INMOVAL

## Estado

Fase 0 completada como base estructural y técnica inicial de INMOVAL.

Esta fase no modificó rutas principales, pantallas operativas ni el flujo visual del avalúo. Su objetivo fue preparar la arquitectura para que la plataforma pueda crecer de forma ordenada.

## Componentes creados

### Plataforma INMOVAL

- Expedientes
- Cotizaciones
- Clientes
- Peritos
- Usuarios
- Roles y permisos
- Actividad
- Configuración
- Storage local
- Drive futuro
- Servidor futuro
- Módulos locales

### Módulos técnicos

- Urbano
- Rural
- Maquinaria
- Vehículos
- Especiales

El módulo urbano queda como módulo activo inicial. Los demás quedan preparados como módulos futuros no instalados.

### Comparables

Se preparó la base independiente de comparables con:

- Tipos
- Manifest
- Storage futuro
- Utilidades futuras
- Evidencias
- Importadores/exportadores futuros

### Archivos INMOVAL

Se prepararon contratos, builders, importadores y exportadores base para:

- .imv — expediente integral
- .imc — comparable integral
- .imins — inspección de campo
- .immod — módulo técnico

### Shared

Se prepararon utilidades compartidas para:

- Tipos core
- Contratos de archivo
- Fechas
- Validaciones
- Constantes

## Regla de arquitectura

La Plataforma INMOVAL controla.

Los módulos técnicos trabajan.

Los archivos .imv, .imc, .imins y .immod contienen o transportan información.

Google Drive funcionará como bodega documental.

El servidor funcionará como cerebro operativo.

## Próxima fase

FASE 1 — Plataforma INMOVAL operativa.

Objetivo:

Convertir la base administrativa en una plataforma visible y funcional, empezando por dashboard, expedientes, cotizaciones, clientes, peritos, estados, pagos, facturación y módulos disponibles.
