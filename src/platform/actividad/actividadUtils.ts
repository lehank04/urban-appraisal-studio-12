import { ActividadINMOVAL } from '@/shared/types/inmovalCore';
import { nowISO } from '@/shared/utils/dateUtils';

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function crearActividadINMOVAL(params: {
  accion: string;
  modulo: ActividadINMOVAL['modulo'];
  usuarioId?: string;
  usuarioNombre?: string;
  expedienteId?: string;
  revisionId?: string;
  detalle?: string;
}): ActividadINMOVAL {
  return {
    id: createId(),
    fecha: nowISO(),
    usuarioId: params.usuarioId,
    usuarioNombre: params.usuarioNombre,
    accion: params.accion,
    modulo: params.modulo,
    expedienteId: params.expedienteId,
    revisionId: params.revisionId,
    detalle: params.detalle,
  };
}

export function agregarActividadINMOVAL(
  actividadActual: ActividadINMOVAL[],
  nuevaActividad: ActividadINMOVAL
) {
  return [nuevaActividad, ...actividadActual];
}

export function ordenarActividadPorFechaDesc(actividad: ActividadINMOVAL[]) {
  return [...actividad].sort((a, b) => b.fecha.localeCompare(a.fecha));
}

export function filtrarActividadPorExpediente(params: {
  actividad: ActividadINMOVAL[];
  expedienteId: string;
}) {
  return params.actividad.filter(
    (item) => item.expedienteId === params.expedienteId
  );
}
