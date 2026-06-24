import { buildInmovalFileName } from '@/shared/storage/fileContracts';
import { nowISO } from '@/shared/utils/dateUtils';
import {
  IMINSArchivoInspeccion,
  InspeccionCampoINMOVAL,
} from './iminsTypes';

export function crearIMINSArchivoInspeccion(params: {
  inspeccion: InspeccionCampoINMOVAL;
  generadoPor?: string;
}): IMINSArchivoInspeccion {
  const generadoEn = nowISO();

  return {
    tipoArchivo: 'inmoval_inspeccion_urbana',
    extension: '.imins',
    version: '1.0.0',
    fechaExportacion: generadoEn,

    inspeccion: params.inspeccion,

    estructuraPaquete: {
      inspeccionJson: 'inspeccion.json',
      carpetaFotos: 'fotos/',
      carpetaDocumentos: 'documentos/',
    },

    metadata: {
      generadoPor: params.generadoPor,
      generadoEn,
      app: 'INMOVAL Campo',
      descripcion:
        'Paquete de inspección de campo INMOVAL con datos técnicos, fotos, documentos y referencias para importación al módulo urbano.',
    },
  };
}

export function buildIMINSFileName(inspeccion: InspeccionCampoINMOVAL) {
  return buildInmovalFileName({
    tipoArchivo: 'inmoval_inspeccion_urbana',
    codigo: inspeccion.codigo || inspeccion.id || 'INSPECCION',
  });
}
