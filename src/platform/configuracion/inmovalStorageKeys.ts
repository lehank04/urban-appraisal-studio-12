export const INMOVAL_STORAGE_KEYS = {
  configuracionLocal: 'inmoval_configuracion_local_v1',
  configuracionPlataforma: 'inmoval_configuracion_plataforma_v1',
  expedientesIndice: 'inmoval_expedientes_indice_v1',
  cotizacionesIndice: 'inmoval_cotizaciones_indice_v1',
  comparablesIndice: 'inmoval_comparables_indice_v1',
  actividad: 'inmoval_actividad_v1',
  ultimoExpedienteAbierto: 'inmoval_ultimo_expediente_abierto_v1',
  ultimoModuloAbierto: 'inmoval_ultimo_modulo_abierto_v1',
} as const;

export type InmovalStorageKey =
  (typeof INMOVAL_STORAGE_KEYS)[keyof typeof INMOVAL_STORAGE_KEYS];
