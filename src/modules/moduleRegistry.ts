import { ModuloTecnicoManifest } from '@/shared/types/inmovalCore';
import { URBANO_MODULE_MANIFEST } from './urbano/moduleManifest';
import { RURAL_MODULE_MANIFEST } from './rural/moduleManifest';
import { MAQUINARIA_MODULE_MANIFEST } from './maquinaria/moduleManifest';
import { VEHICULOS_MODULE_MANIFEST } from './vehiculos/moduleManifest';
import { ESPECIALES_MODULE_MANIFEST } from './especiales/moduleManifest';

export const MODULE_REGISTRY: ModuloTecnicoManifest[] = [
  URBANO_MODULE_MANIFEST,
  RURAL_MODULE_MANIFEST,
  MAQUINARIA_MODULE_MANIFEST,
  VEHICULOS_MODULE_MANIFEST,
  ESPECIALES_MODULE_MANIFEST,
];

export function getModuleManifest(id: ModuloTecnicoManifest['id']) {
  return MODULE_REGISTRY.find((module) => module.id === id);
}