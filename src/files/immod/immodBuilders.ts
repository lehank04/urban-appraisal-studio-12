@'
import { ModuloTecnicoManifest } from '@/shared/types/inmovalCore';
import { buildInmovalFileName } from '@/shared/storage/fileContracts';
import { nowISO } from '@/shared/utils/dateUtils';
import { IMMODArchivoModulo } from './immodTypes';

export function crearIMMODArchivoModulo(params: {
  manifest: ModuloTecnicoManifest;
  generadoPor?: string;
}): IMMODArchivoModulo {
  const generadoEn = nowISO();

  return {
    tipoArchivo: 'inmoval_modulo_tecnico',
    extension: '.immod',
    version: '1.0.0',
    fechaExportacion: generadoEn,

    manifest: params.manifest,

    catalogos: [],
    pantallas: [],
    calculos: [],
    memorias: [],
    importadores: [],
    exportadores: [],

    metadata: {
      generadoPor: params.generadoPor,
      generadoEn,
      app: 'INMOVAL',
      descripcion:
        'Archivo de módulo técnico INMOVAL con manifiesto, catálogos, pantallas, cálculos, memorias, importadores y exportadores.',
    },
  };
}

export function buildIMMODFileName(manifest: ModuloTecnicoManifest) {
  return buildInmovalFileName({
    tipoArchivo: 'inmoval_modulo_tecnico',
    codigo: manifest.id || 'MODULO',
  });
}
'@ | Set-Content -Path "src\files\immod\immodBuilders.ts" -Encoding UTF8