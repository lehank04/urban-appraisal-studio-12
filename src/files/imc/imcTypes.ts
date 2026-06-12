import { ComparableINMOVAL } from '@/comparables/types/comparableTypes';
import { InmovalFileContract } from '@/shared/types/inmovalCore';

export type IMCFileVersion = '1.0.0';

export type IMCArchivoComparable = InmovalFileContract & {
  tipoArchivo: 'inmoval_comparable';
  extension: '.imc';
  version: IMCFileVersion;

  comparable: ComparableINMOVAL;

  evidenciasIncluidas?: unknown[];
  documentosAdjuntos?: unknown[];
  fotosAdjuntas?: unknown[];

  metadata: {
    generadoPor?: string;
    generadoEn: string;
    app: 'INMOVAL';
    descripcion: string;
  };
};

export function isIMCArchivoComparable(value: unknown): value is IMCArchivoComparable {
  if (!value || typeof value !== 'object') return false;

  const data = value as Partial<IMCArchivoComparable>;

  return (
    data.tipoArchivo === 'inmoval_comparable' &&
    data.extension === '.imc' &&
    Boolean(data.comparable)
  );
}