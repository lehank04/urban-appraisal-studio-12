import { ModuloTecnicoManifest } from '@/shared/types/inmovalCore';

export const MAQUINARIA_MODULE_MANIFEST: ModuloTecnicoManifest = {
  id: 'maquinaria',
  nombre: 'Maquinaria y equipos',
  descripcion:
    'Cartucho tÃ©cnico futuro para avalÃºos de maquinaria, equipos, instalaciones industriales y activos especializados.',
  version: '0.0.0',
  estado: 'no_instalado',
  extension: '.immod',
  requiereInstalacionLocal: true,
  puedeCrearExpedientes: false,
  puedeAbrirExpedientes: false,
};
