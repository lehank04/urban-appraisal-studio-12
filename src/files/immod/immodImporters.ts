import { parseInmovalJsonFile } from '@/files/inmovalFileUtils';
import { isIMMODArchivoModulo, IMMODArchivoModulo } from './immodTypes';

export function importarIMMODDesdeTexto(content: string): {
  ok: true;
  data: IMMODArchivoModulo;
} | {
  ok: false;
  error: string;
} {
  const parsed = parseInmovalJsonFile<IMMODArchivoModulo>(content);

  if (!parsed.ok) {
    return parsed;
  }

  if (!isIMMODArchivoModulo(parsed.data)) {
    return {
      ok: false,
      error: 'El archivo no es un módulo .immod válido.',
    };
  }

  return {
    ok: true,
    data: parsed.data,
  };
}
