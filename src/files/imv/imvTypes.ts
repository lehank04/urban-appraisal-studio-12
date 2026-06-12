import { CotizacionINMOVAL } from '@/platform/cotizaciones/cotizacionTypes';
import { ExpedienteINMOVAL } from '@/platform/expedientes/expedienteTypes';
import { RevisionAvaluoINMOVAL } from '@/platform/expedientes/revisionTypes';
import { InmovalFileContract } from '@/shared/types/inmovalCore';

export type IMVFileVersion = '1.0.0';

export type IMVArchivoExpediente = InmovalFileContract & {
  tipoArchivo: 'inmoval_expediente';
  extension: '.imv';
  version: IMVFileVersion;

  expediente: ExpedienteINMOVAL;
  cotizacion?: CotizacionINMOVAL;
  revisiones: RevisionAvaluoINMOVAL[];

  comparablesCongelados?: unknown[];
  inspeccionesImportadas?: unknown[];
  documentosAdjuntos?: unknown[];
  fotosAdjuntas?: unknown[];

  metadata: {
    generadoPor?: string;
    generadoEn: string;
    app: 'INMOVAL';
    descripcion: string;
  };
};

export function isIMVArchivoExpediente(value: unknown): value is IMVArchivoExpediente {
  if (!value || typeof value !== 'object') return false;

  const data = value as Partial<IMVArchivoExpediente>;

  return (
    data.tipoArchivo === 'inmoval_expediente' &&
    data.extension === '.imv' &&
    Boolean(data.expediente)
  );
}