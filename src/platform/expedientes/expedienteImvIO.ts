import { nowISO } from '@/shared/utils/dateUtils';
import { ExpedienteIndiceINMOVAL } from './expedienteIndexTypes';
import { ExpedienteActivityINMOVAL } from './expedienteActivityStorage';

export type ExpedienteIMVArchivo = {
  formato: 'INMOVAL_EXPEDIENTE_IMV';
  version: '2.0';
  extension: '.imv';
  exportadoEn: string;
  origen: 'plataforma_inmoval';
  expediente: ExpedienteIndiceINMOVAL;
  actividad?: ExpedienteActivityINMOVAL[];
  metadata: {
    app: 'INMOVAL';
    tipoArchivo: 'expediente';
    codigo: string;
    id: string;
  };
};

export function buildExpedienteIMV(
  expediente: ExpedienteIndiceINMOVAL,
  actividad: ExpedienteActivityINMOVAL[] = []
): ExpedienteIMVArchivo {
  return {
    formato: 'INMOVAL_EXPEDIENTE_IMV',
    version: '2.0',
    extension: '.imv',
    exportadoEn: nowISO(),
    origen: 'plataforma_inmoval',
    expediente,
    actividad,
    metadata: {
      app: 'INMOVAL',
      tipoArchivo: 'expediente',
      codigo: expediente.codigo,
      id: expediente.id,
    },
  };
}

export function sanitizeIMVFileName(value: string) {
  return value
    .trim()
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function getExpedienteIMVFileName(expediente: ExpedienteIndiceINMOVAL) {
  const base = expediente.archivoImvNombre || `${expediente.codigo}.imv`;

  if (base.toLowerCase().endsWith('.imv')) {
    return sanitizeIMVFileName(base);
  }

  return `${sanitizeIMVFileName(base)}.imv`;
}

export function downloadExpedienteIMV(
  expediente: ExpedienteIndiceINMOVAL,
  actividad: ExpedienteActivityINMOVAL[] = []
) {
  const archivo = buildExpedienteIMV(expediente, actividad);
  const contenido = JSON.stringify(archivo, null, 2);
  const blob = new Blob([contenido], {
    type: 'application/json;charset=utf-8',
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = getExpedienteIMVFileName(expediente);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
}

export function parseExpedienteIMVContent(content: string): ExpedienteIndiceINMOVAL {
  const parsed = JSON.parse(content) as Partial<ExpedienteIMVArchivo>;

  if (parsed.formato !== 'INMOVAL_EXPEDIENTE_IMV') {
    throw new Error('El archivo no tiene formato INMOVAL_EXPEDIENTE_IMV.');
  }

  if (parsed.extension !== '.imv') {
    throw new Error('El archivo no corresponde a un expediente .imv.');
  }

  if (!parsed.expediente?.id || !parsed.expediente?.codigo) {
    throw new Error('El expediente dentro del archivo .imv está incompleto.');
  }

  return parsed.expediente;
}

export function readExpedienteIMVFile(file: File): Promise<ExpedienteIndiceINMOVAL> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const content = String(reader.result || '');
        resolve(parseExpedienteIMVContent(content));
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('No se pudo leer el archivo .imv.'));
    };

    reader.readAsText(file, 'utf-8');
  });
}
