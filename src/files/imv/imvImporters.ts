import { parseInmovalJsonFile } from '@/files/inmovalFileUtils';
import { isIMVArchivoExpediente, IMVArchivoExpediente } from './imvTypes';

export function importarIMVDesdeTexto(content: string): {
  ok: true;
  data: IMVArchivoExpediente;
} | {
  ok: false;
  error: string;
} {
  const parsed = parseInmovalJsonFile<IMVArchivoExpediente>(content);

  if (!parsed.ok) {
    return parsed;
  }

  if (!isIMVArchivoExpediente(parsed.data)) {
    return {
      ok: false,
      error: 'El archivo no es un expediente .imv válido.',
    };
  }

  return {
    ok: true,
    data: parsed.data,
  };
}
