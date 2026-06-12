import { parseInmovalJsonFile } from '@/files/inmovalFileUtils';
import { isIMINSArchivoInspeccion, IMINSArchivoInspeccion } from './iminsTypes';

export function importarIMINSDesdeTexto(content: string): {
  ok: true;
  data: IMINSArchivoInspeccion;
} | {
  ok: false;
  error: string;
} {
  const parsed = parseInmovalJsonFile<IMINSArchivoInspeccion>(content);

  if (!parsed.ok) {
    return parsed;
  }

  if (!isIMINSArchivoInspeccion(parsed.data)) {
    return {
      ok: false,
      error: 'El archivo no es una inspección .imins válida.',
    };
  }

  return {
    ok: true,
    data: parsed.data,
  };
}
