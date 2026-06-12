import { ModuloTecnicoManifest } from '@/shared/types/inmovalCore';
import { InmovalFileContract } from '@/shared/types/inmovalCore';

export type IMMODFileVersion = '1.0.0';

export type IMMODArchivoModulo = InmovalFileContract & {
  tipoArchivo: 'inmoval_modulo_tecnico';
  extension: '.immod';
  version: IMMODFileVersion;

  manifest: ModuloTecnicoManifest;

  catalogos?: unknown[];
  pantallas?: unknown[];
  calculos?: unknown[];
  memorias?: unknown[];
  importadores?: unknown[];
  exportadores?: unknown[];

  metadata: {
    generadoPor?: string;
    generadoEn: string;
    app: 'INMOVAL';
    descripcion: string;
  };
};

export function isIMMODArchivoModulo(value: unknown): value is IMMODArchivoModulo {
  if (!value || typeof value !== 'object') return false;

  const data = value as Partial<IMMODArchivoModulo>;

  return (
    data.tipoArchivo === 'inmoval_modulo_tecnico' &&
    data.extension === '.immod' &&
    Boolean(data.manifest)
  );
}