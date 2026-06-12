import { ComparableINMOVAL } from '@/comparables/types/comparableTypes';
import { downloadTextFile } from '@/shared/storage/fileContracts';
import { stringifyInmovalFile, buildInmovalMimeType } from '@/files/inmovalFileUtils';
import { crearIMCArchivoComparable, buildIMCFileName } from './imcBuilders';

export function exportarIMCComparable(params: {
  comparable: ComparableINMOVAL;
  generadoPor?: string;
}) {
  const archivo = crearIMCArchivoComparable(params);
  const fileName = buildIMCFileName(params.comparable);

  downloadTextFile({
    fileName,
    content: stringifyInmovalFile(archivo),
    mimeType: buildInmovalMimeType(),
  });

  return archivo;
}
