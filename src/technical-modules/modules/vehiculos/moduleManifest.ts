import { ModuloTecnicoManifest } from '@/shared/types/inmovalCore';

export const VEHICULOS_MODULE_MANIFEST: ModuloTecnicoManifest = {
  id: 'vehiculo',
  nombre: 'VehÃ­culos',
  descripcion:
    'Cartucho tÃ©cnico futuro para avalÃºos vehiculares: automÃ³viles, flotas, maquinaria rodante y activos mÃ³viles.',
  version: '0.0.0',
  estado: 'no_instalado',
  extension: '.immod',
  requiereInstalacionLocal: true,
  puedeCrearExpedientes: false,
  puedeAbrirExpedientes: false,
};
