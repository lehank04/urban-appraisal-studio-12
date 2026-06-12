import { ModuloTecnicoManifest } from '@/shared/types/inmovalCore';

export const VEHICULOS_MODULE_MANIFEST: ModuloTecnicoManifest = {
  id: 'vehiculo',
  nombre: 'Vehículos',
  descripcion:
    'Cartucho técnico futuro para avalúos vehiculares: automóviles, flotas, maquinaria rodante y activos móviles.',
  version: '0.0.0',
  estado: 'no_instalado',
  extension: '.immod',
  requiereInstalacionLocal: true,
  puedeCrearExpedientes: false,
  puedeAbrirExpedientes: false,
};