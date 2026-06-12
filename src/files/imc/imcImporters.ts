import { parseInmovalJsonFile } from '@/files/inmovalFileUtils';
import { isIMCArchivoComparable, IMCArchivoComparable } from './imcTypes';

export function importarIMCDesdeTexto(content: string): {
  ok: true;
  data: IMCArchivoComparable;
} | {
  ok: false;
  error: string;
} {
  const parsed = parseInmovalJsonFile<IMCArchivoComparable>(content);

  if (!parsed.ok) {
    return parsed;
  }

  if (!isIMCArchivoComparable(parsed.data)) {
    return {
      ok: false,
      error: 'El archivo no es un comparable .imc válido.',
    };
  }

  return {
    ok: true,
    data: parsed.data,
  };
}
