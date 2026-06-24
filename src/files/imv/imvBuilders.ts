import { CotizacionINMOVAL } from '@/platform/cotizaciones/cotizacionTypes';
import { ExpedienteINMOVAL } from '@/platform/expedientes/expedienteTypes';
import { RevisionAvaluoINMOVAL } from '@/platform/expedientes/revisionTypes';
import { buildInmovalFileName } from '@/shared/storage/fileContracts';
import { nowISO } from '@/shared/utils/dateUtils';
import { IMVArchivoExpediente } from './imvTypes';

export function crearIMVArchivoExpediente(params: {
  expediente: ExpedienteINMOVAL;
  cotizacion?: CotizacionINMOVAL;
  revisiones?: RevisionAvaluoINMOVAL[];
  generadoPor?: string;
}): IMVArchivoExpediente {
  const generadoEn = nowISO();

  return {
    tipoArchivo: 'inmoval_expediente',
    extension: '.imv',
    version: '1.0.0',
    fechaExportacion: generadoEn,

    expediente: params.expediente,
    cotizacion: params.cotizacion,
    revisiones: params.revisiones || [],

    comparablesCongelados: [],
    inspeccionesImportadas: [],
    documentosAdjuntos: [],
    fotosAdjuntas: [],

    metadata: {
      generadoPor: params.generadoPor,
      generadoEn,
      app: 'INMOVAL',
      descripcion:
        'Archivo integral de expediente INMOVAL con datos administrativos, técnicos, revisiones, cotización y adjuntos referenciados.',
    },
  };
}

export function buildIMVFileName(expediente: ExpedienteINMOVAL) {
  return buildInmovalFileName({
    tipoArchivo: 'inmoval_expediente',
    codigo: expediente.codigo || expediente.id || 'EXPEDIENTE',
  });
}
