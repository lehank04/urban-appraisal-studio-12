import { ModuloTecnicoManifest } from '@/shared/types/inmovalCore';

export const RURAL_MODULE_MANIFEST: ModuloTecnicoManifest = {
  id: 'rural',
  nombre: 'Inmuebles rurales',
  descripcion:
    'Cartucho técnico futuro para avalúos rurales: fincas, suelos, cultivos, mejoras rurales, fuentes de agua, productividad y mercado rural.',
  version: '0.0.0',
  estado: 'no_instalado',
  extension: '.immod',
  requiereInstalacionLocal: true,
  puedeCrearExpedientes: false,
  puedeAbrirExpedientes: false,
};