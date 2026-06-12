import { nowISO } from '@/shared/utils/dateUtils';
import { ComparableIndiceINMOVAL } from './comparableStorage';

export type ComparableIMCArchivo = {
  formato: 'INMOVAL_COMPARABLE_IMC';
  version: '2.0';
  extension: '.imc';
  exportadoEn: string;
  origen: 'plataforma_inmoval';
  comparable: ComparableIndiceINMOVAL;
  metadata: {
    app: 'INMOVAL';
    tipoArchivo: 'comparable';
    codigo: string;
    id: string;
  };
};

export function buildComparableIMC(
  comparable: ComparableIndiceINMOVAL
): ComparableIMCArchivo {
  return {
    formato: 'INMOVAL_COMPARABLE_IMC',
    version: '2.0',
    extension: '.imc',
    exportadoEn: nowISO(),
    origen: 'plataforma_inmoval',
    comparable,
    metadata: {
      app: 'INMOVAL',
      tipoArchivo: 'comparable',
      codigo: comparable.codigo,
      id: comparable.id,
    },
  };
}

export function sanitizeIMCFileName(value: string) {
  return value
    .trim()
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function getComparableIMCFileName(comparable: ComparableIndiceINMOVAL) {
  return `${sanitizeIMCFileName(comparable.codigo)}.imc`;
}

export function downloadComparableIMC(comparable: ComparableIndiceINMOVAL) {
  const archivo = buildComparableIMC(comparable);
  const contenido = JSON.stringify(archivo, null, 2);
  const blob = new Blob([contenido], {
    type: 'application/json;charset=utf-8',
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = getComparableIMCFileName(comparable);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
}

export function parseComparableIMCContent(content: string): ComparableIndiceINMOVAL {
  const parsed = JSON.parse(content) as Partial<ComparableIMCArchivo>;

  if (parsed.formato !== 'INMOVAL_COMPARABLE_IMC') {
    throw new Error('El archivo no tiene formato INMOVAL_COMPARABLE_IMC.');
  }

  if (parsed.extension !== '.imc') {
    throw new Error('El archivo no corresponde a un comparable .imc.');
  }

  if (!parsed.comparable?.id || !parsed.comparable?.codigo) {
    throw new Error('El comparable dentro del archivo .imc está incompleto.');
  }

  return parsed.comparable;
}

export function readComparableIMCFile(file: File): Promise<ComparableIndiceINMOVAL> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const content = String(reader.result || '');
        resolve(parseComparableIMCContent(content));
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('No se pudo leer el archivo .imc.'));
    };

    reader.readAsText(file, 'utf-8');
  });
}
