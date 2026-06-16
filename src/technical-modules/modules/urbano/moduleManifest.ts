import { ModuloTecnicoManifest } from '@/shared/types/inmovalCore';

export const URBANO_MODULE_MANIFEST: ModuloTecnicoManifest = {
  id: 'urbano',
  nombre: 'Inmuebles urbanos',
  descripcion:
    'Cartucho tÃ©cnico para avalÃºos de inmuebles urbanos: informaciÃ³n general, documentaciÃ³n legal, entorno, terrenos, infraestructuras, metodologÃ­as, comparables, memorias y documento final.',
  version: '1.0.0',
  estado: 'activo',
  extension: '.immod',
  requiereInstalacionLocal: true,
  puedeCrearExpedientes: true,
  puedeAbrirExpedientes: true,
};
