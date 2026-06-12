import { nowISO, todayISO } from '@/shared/utils/dateUtils';
import { ExpedienteIndiceINMOVAL } from './expedienteIndexTypes';

export type PreparacionModuloTecnicoINMOVAL = {
  id: string;
  expedienteAdministrativoId: string;
  expedienteAdministrativoCodigo: string;
  titulo: string;
  clienteNombre: string;
  peritoNombre?: string;
  tipoModulo: 'urbano' | 'rural' | 'maquinaria' | 'vehiculos' | 'especiales';
  fechaPreparacion: string;
  fechaSolicitud: string;
  fechaEntregaEstimada?: string;
  costoServicio: number;
  moneda: string;
  estado: 'pendiente' | 'preparado' | 'vinculado';
  datosBase: {
    usoPrevisto?: string;
    direccionPendiente: boolean;
    inspeccionPendiente: boolean;
    comparablesPendientes: boolean;
    documentacionPendiente: boolean;
  };
};

const PREPARACION_TECNICA_KEY = 'inmoval_preparaciones_tecnicas_v1';

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `prep-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getPreparacionesTecnicasINMOVAL(): PreparacionModuloTecnicoINMOVAL[] {
  if (typeof window === 'undefined') return [];

  const raw = window.localStorage.getItem(PREPARACION_TECNICA_KEY);

  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return parsed as PreparacionModuloTecnicoINMOVAL[];
  } catch {
    return [];
  }
}

export function savePreparacionesTecnicasINMOVAL(
  preparaciones: PreparacionModuloTecnicoINMOVAL[]
) {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(PREPARACION_TECNICA_KEY, JSON.stringify(preparaciones));
}

export function upsertPreparacionTecnicaINMOVAL(
  preparacion: PreparacionModuloTecnicoINMOVAL
) {
  const preparaciones = getPreparacionesTecnicasINMOVAL();
  const index = preparaciones.findIndex((item) => item.id === preparacion.id);

  if (index >= 0) {
    preparaciones[index] = preparacion;
  } else {
    preparaciones.unshift(preparacion);
  }

  savePreparacionesTecnicasINMOVAL(preparaciones);
}

export function getPreparacionTecnicaPorExpedienteINMOVAL(
  expedienteId: string
) {
  return getPreparacionesTecnicasINMOVAL().find(
    (item) => item.expedienteAdministrativoId === expedienteId
  );
}

export function crearPreparacionTecnicaDesdeExpediente(
  expediente: ExpedienteIndiceINMOVAL
): PreparacionModuloTecnicoINMOVAL {
  const existente = getPreparacionTecnicaPorExpedienteINMOVAL(expediente.id);

  if (existente) return existente;

  return {
    id: createId(),
    expedienteAdministrativoId: expediente.id,
    expedienteAdministrativoCodigo: expediente.codigo,
    titulo: expediente.titulo,
    clienteNombre: expediente.clienteNombre,
    peritoNombre: expediente.peritoNombre,
    tipoModulo: expediente.tipoModulo,
    fechaPreparacion: nowISO(),
    fechaSolicitud: expediente.fechaSolicitud || todayISO(),
    fechaEntregaEstimada: expediente.fechaEntregaEstimada,
    costoServicio: expediente.costoServicio,
    moneda: expediente.moneda,
    estado: 'preparado',
    datosBase: {
      usoPrevisto: 'Avalúo técnico urbano',
      direccionPendiente: true,
      inspeccionPendiente: true,
      comparablesPendientes: true,
      documentacionPendiente: true,
    },
  };
}
