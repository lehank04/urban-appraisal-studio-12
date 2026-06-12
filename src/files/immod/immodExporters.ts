import { ModuloTecnicoManifest } from '@/shared/types/inmovalCore';
import { downloadTextFile } from '@/shared/storage/fileContracts';
import { stringifyInmovalFile, buildInmovalMimeType } from '@/files/inmovalFileUtils';
import { crearIMMODArchivoModulo, buildIMMODFileName } from './immodBuilders';

export function exportarIMMODModulo(params: {
  manifest: ModuloTecnicoManifest;
  generadoPor?: string;
}) {
  const archivo = crearIMMODArchivoModulo(params);
  const fileName = buildIMMODFileName(params.manifest);

  downloadTextFile({
    fileName,
    content: stringifyInmovalFile(archivo),
    mimeType: buildInmovalMimeType(),
  });

  return archivo;
}
