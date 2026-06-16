import { ModuloTecnicoManifest } from '@/shared/types/inmovalCore';

export const ESPECIALES_MODULE_MANIFEST: ModuloTecnicoManifest = {
  id: 'especial',
  nombre: 'AvalÃºos especiales',
  descripcion:
    'Cartucho tÃ©cnico futuro para avalÃºos especiales o no estandarizados.',
  version: '0.0.0',
  estado: 'no_instalado',
  extension: '.immod',
  requiereInstalacionLocal: true,
  puedeCrearExpedientes: false,
  puedeAbrirExpedientes: false,
};
