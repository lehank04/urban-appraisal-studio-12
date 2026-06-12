import { ModuloTecnicoManifest } from '@/shared/types/inmovalCore';

export const URBANO_MODULE_MANIFEST: ModuloTecnicoManifest = {
  id: 'urbano',
  nombre: 'Inmuebles urbanos',
  descripcion:
    'Cartucho técnico para avalúos de inmuebles urbanos: información general, documentación legal, entorno, terrenos, infraestructuras, metodologías, comparables, memorias y documento final.',
  version: '1.0.0',
  estado: 'activo',
  extension: '.immod',
  requiereInstalacionLocal: true,
  puedeCrearExpedientes: true,
  puedeAbrirExpedientes: true,
};