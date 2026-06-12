import { isIMCArchivoComparable } from '@/files/imc/imcTypes';
import { isIMINSArchivoInspeccion } from '@/files/imins/iminsTypes';
import { isIMMODArchivoModulo } from '@/files/immod/immodTypes';
import { isIMVArchivoExpediente } from '@/files/imv/imvTypes';
import { InmovalFileKind } from '@/shared/types/inmovalCore';

export function getTipoArchivoINMOVAL(value: unknown): InmovalFileKind | undefined {
  if (isIMVArchivoExpediente(value)) return 'inmoval_expediente';
  if (isIMCArchivoComparable(value)) return 'inmoval_comparable';
  if (isIMINSArchivoInspeccion(value)) return 'inmoval_inspeccion_urbana';
  if (isIMMODArchivoModulo(value)) return 'inmoval_modulo_tecnico';

  return undefined;
}

export function esArchivoINMOVALValido(value: unknown) {
  return Boolean(getTipoArchivoINMOVAL(value));
}

export function validarArchivoINMOVAL(value: unknown): {
  ok: true;
  tipoArchivo: InmovalFileKind;
} | {
  ok: false;
  error: string;
} {
  const tipoArchivo = getTipoArchivoINMOVAL(value);

  if (!tipoArchivo) {
    return {
      ok: false,
      error: 'El archivo no corresponde a un formato INMOVAL reconocido.',
    };
  }

  return {
    ok: true,
    tipoArchivo,
  };
}
