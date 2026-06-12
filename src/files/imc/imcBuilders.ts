@'
import { ComparableINMOVAL } from '@/comparables/types/comparableTypes';
import { buildInmovalFileName } from '@/shared/storage/fileContracts';
import { nowISO } from '@/shared/utils/dateUtils';
import { IMCArchivoComparable } from './imcTypes';

export function crearIMCArchivoComparable(params: {
  comparable: ComparableINMOVAL;
  generadoPor?: string;
}): IMCArchivoComparable {
  const generadoEn = nowISO();

  return {
    tipoArchivo: 'inmoval_comparable',
    extension: '.imc',
    version: '1.0.0',
    fechaExportacion: generadoEn,

    comparable: params.comparable,

    evidenciasIncluidas: [],
    documentosAdjuntos: [],
    fotosAdjuntas: [],

    metadata: {
      generadoPor: params.generadoPor,
      generadoEn,
      app: 'INMOVAL',
      descripcion:
        'Archivo integral de comparable INMOVAL con datos de mercado, ubicación, valores, homologación y evidencias referenciadas.',
    },
  };
}

export function buildIMCFileName(comparable: ComparableINMOVAL) {
  return buildInmovalFileName({
    tipoArchivo: 'inmoval_comparable',
    codigo: comparable.codigo || comparable.id || 'COMPARABLE',
  });
}
'@ | Set-Content -Path "src\files\imc\imcBuilders.ts" -Encoding UTF8