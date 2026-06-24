import { nowISO } from '@/shared/utils/dateUtils';

const EXPEDIENTE_ACTIVITY_KEY = 'inmoval_expediente_activity_v1';

export type TipoActividadExpedienteINMOVAL =
  | 'creacion'
  | 'sincronizacion'
  | 'estado'
  | 'pago'
  | 'facturacion'
  | 'cierre'
  | 'archivo'
  | 'nota';

export type ExpedienteActivityINMOVAL = {
  id: string;
  expedienteId: string;
  tipo: TipoActividadExpedienteINMOVAL;
  titulo: string;
  descripcion?: string;
  detalle?: string;
  usuarioNombre?: string;
  creadoEn: string;
};

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `activity-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getAllExpedienteActivityINMOVAL(): ExpedienteActivityINMOVAL[] {
  if (typeof window === 'undefined') return [];

  const raw = window.localStorage.getItem(EXPEDIENTE_ACTIVITY_KEY);

  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return parsed as ExpedienteActivityINMOVAL[];
  } catch {
    return [];
  }
}

export function saveAllExpedienteActivityINMOVAL(
  activity: ExpedienteActivityINMOVAL[]
) {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(
    EXPEDIENTE_ACTIVITY_KEY,
    JSON.stringify(
      activity.sort(
        (a, b) =>
          new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime()
      )
    )
  );
}

export function getExpedienteActivityINMOVAL(expedienteId: string) {
  return getAllExpedienteActivityINMOVAL().filter(
    (item) => item.expedienteId === expedienteId
  );
}

export function registrarActividadExpedienteINMOVAL(params: {
  expedienteId: string;
  tipo: TipoActividadExpedienteINMOVAL;
  titulo: string;
  descripcion?: string;
  usuarioNombre?: string;
}) {
  const activity: ExpedienteActivityINMOVAL = {
    id: createId(),
    expedienteId: params.expedienteId,
    tipo: params.tipo,
    titulo: params.titulo,
    descripcion: params.descripcion,
    usuarioNombre: params.usuarioNombre || 'Usuario INMOVAL',
    creadoEn: nowISO(),
  };

  const actuales = getAllExpedienteActivityINMOVAL();

  saveAllExpedienteActivityINMOVAL([activity, ...actuales]);

  return activity;
}
