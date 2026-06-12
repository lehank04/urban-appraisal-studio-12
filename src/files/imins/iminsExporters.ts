import { downloadTextFile } from '@/shared/storage/fileContracts';
import { stringifyInmovalFile, buildInmovalMimeType } from '@/files/inmovalFileUtils';
import { crearIMINSArchivoInspeccion, buildIMINSFileName } from './iminsBuilders';
import { InspeccionCampoINMOVAL } from './iminsTypes';

export function exportarIMINSInspeccion(params: {
  inspeccion: InspeccionCampoINMOVAL;
  generadoPor?: string;
}) {
  const archivo = crearIMINSArchivoInspeccion(params);
  const fileName = buildIMINSFileName(params.inspeccion);

  downloadTextFile({
    fileName,
    content: stringifyInmovalFile(archivo),
    mimeType: buildInmovalMimeType(),
  });

  return archivo;
}
