import { downloadTextFile } from '@/shared/storage/fileContracts';
import { stringifyInmovalFile, buildInmovalMimeType } from '@/files/inmovalFileUtils';
import { crearIMVArchivoExpediente, buildIMVFileName } from './imvBuilders';
import { CotizacionINMOVAL } from '@/platform/cotizaciones/cotizacionTypes';
import { ExpedienteINMOVAL } from '@/platform/expedientes/expedienteTypes';
import { RevisionAvaluoINMOVAL } from '@/platform/expedientes/revisionTypes';

export function exportarIMVExpediente(params: {
  expediente: ExpedienteINMOVAL;
  cotizacion?: CotizacionINMOVAL;
  revisiones?: RevisionAvaluoINMOVAL[];
  generadoPor?: string;
}) {
  const archivo = crearIMVArchivoExpediente(params);
  const fileName = buildIMVFileName(params.expediente);

  downloadTextFile({
    fileName,
    content: stringifyInmovalFile(archivo),
    mimeType: buildInmovalMimeType(),
  });

  return archivo;
}
