import { nowISO, todayISO } from '@/shared/utils/dateUtils';
import {
  calcularEstadoPagoExpediente,
  calcularSaldoExpediente,
} from './expedienteTypes';
import { ExpedienteIndiceINMOVAL } from './expedienteIndexTypes';
import {
  getExpedientesIndiceINMOVAL,
  saveExpedientesIndiceINMOVAL,
} from './expedienteIndexStorage';

type LegacyAvaluoLike = {
  id?: string;
  codigo?: string;
  nombre?: string;
  titulo?: string;

  tipoModulo?: string;
  estatusOperativo?: string;
  prioridad?: string;

  fechaSolicitud?: string;
  fechaEntregaEstimada?: string;
  fechaCierre?: string;

  costoServicio?: number;
  montoPagado?: number;
  estadoPago?: string;

  clienteId?: string;
  peritoId?: string;

  info?: {
    solicitante?: string;
    propietario?: string;
    clienteNombre?: string;
    valuadorNombre?: string;
    fecha?: string;
    moneda?: string;
  };

  updatedAt?: string;
  createdAt?: string;
};

type LegacyStoreLike = {
  state?: {
    avaluos?: LegacyAvaluoLike[];
    clientes?: Array<{ id?: string; nombre?: string; name?: string }>;
    peritos?: Array<{ id?: string; nombre?: string; name?: string }>;
  };
  avaluos?: LegacyAvaluoLike[];
  clientes?: Array<{ id?: string; nombre?: string; name?: string }>;
  peritos?: Array<{ id?: string; nombre?: string; name?: string }>;
};

function normalizeModulo(value?: string): ExpedienteIndiceINMOVAL['tipoModulo'] {
  if (value === 'rural') return 'rural';
  if (value === 'maquinaria') return 'maquinaria';
  if (value === 'vehiculo') return 'vehiculo';
  if (value === 'especial') return 'especial';

  return 'urbano';
}

function normalizeEstado(
  value?: string
): ExpedienteIndiceINMOVAL['estado'] {
  const allowed: ExpedienteIndiceINMOVAL['estado'][] = [
    'en_cotizacion',
    'cotizacion_enviada',
    'cotizacion_aprobada',
    'pendiente_inspeccion',
    'en_inspeccion',
    'en_elaboracion',
    'en_revision',
    'correcciones',
    'aprobado',
    'entregado',
    'facturado',
    'cerrado',
    'cancelado',
  ];

  if (allowed.includes(value as ExpedienteIndiceINMOVAL['estado'])) {
    return value as ExpedienteIndiceINMOVAL['estado'];
  }

  if (value === 'borrador') return 'en_elaboracion';
  if (value === 'pendiente') return 'pendiente_inspeccion';
  if (value === 'revision') return 'en_revision';

  return 'en_elaboracion';
}

function normalizePrioridad(
  value?: string
): ExpedienteIndiceINMOVAL['prioridad'] {
  if (value === 'baja') return 'baja';
  if (value === 'alta') return 'alta';
  if (value === 'urgente') return 'urgente';

  return 'normal';
}

function normalizeMoneda(value?: string): ExpedienteIndiceINMOVAL['moneda'] {
  return value === 'C$' ? 'C$' : 'US$';
}

function findNameById(
  items: Array<{ id?: string; nombre?: string; name?: string }>,
  id?: string
) {
  if (!id) return undefined;

  const found = items.find((item) => item.id === id);

  return found?.nombre || found?.name;
}

function readLegacyStoreCandidates(): LegacyStoreLike[] {
  if (typeof window === 'undefined') return [];

  const candidates: LegacyStoreLike[] = [];

  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);

    if (!key) continue;

    const raw = window.localStorage.getItem(key);

    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw) as LegacyStoreLike;

      const state = parsed.state || parsed;
      const avaluos = state.avaluos || [];

      if (Array.isArray(avaluos) && avaluos.length > 0) {
        candidates.push(parsed);
      }
    } catch {
      // Ignorar llaves que no sean JSON válido.
    }
  }

  return candidates;
}

export function obtenerAvaluosLegacyDesdeLocalStorage() {
  const candidates = readLegacyStoreCandidates();

  const mejor = candidates
    .map((candidate) => {
      const state = candidate.state || candidate;

      return {
        avaluos: state.avaluos || [],
        clientes: state.clientes || [],
        peritos: state.peritos || [],
      };
    })
    .sort((a, b) => b.avaluos.length - a.avaluos.length)[0];

  return {
    avaluos: mejor?.avaluos || [],
    clientes: mejor?.clientes || [],
    peritos: mejor?.peritos || [],
  };
}

export function convertirAvaluoLegacyAExpedienteIndice(params: {
  avaluo: LegacyAvaluoLike;
  clientes?: Array<{ id?: string; nombre?: string; name?: string }>;
  peritos?: Array<{ id?: string; nombre?: string; name?: string }>;
}): ExpedienteIndiceINMOVAL {
  const avaluo = params.avaluo;
  const clientes = params.clientes || [];
  const peritos = params.peritos || [];

  const id = avaluo.id || crypto.randomUUID();
  const codigo = avaluo.codigo || `EXP-${id.slice(0, 8).toUpperCase()}`;
  const costoServicio = Number(avaluo.costoServicio || 0);
  const montoPagado = Number(avaluo.montoPagado || 0);
  const saldo = calcularSaldoExpediente(costoServicio, montoPagado);
  const estadoPago =
    avaluo.estadoPago === 'pendiente' ||
    avaluo.estadoPago === 'parcial' ||
    avaluo.estadoPago === 'pagado' ||
    avaluo.estadoPago === 'no_aplica'
      ? avaluo.estadoPago
      : calcularEstadoPagoExpediente(costoServicio, montoPagado);

  const clienteNombre =
    findNameById(clientes, avaluo.clienteId) ||
    avaluo.info?.clienteNombre ||
    avaluo.info?.solicitante ||
    avaluo.info?.propietario ||
    'Cliente pendiente';

  const peritoNombre =
    findNameById(peritos, avaluo.peritoId) ||
    avaluo.info?.valuadorNombre ||
    undefined;

  const actualizadoEn = avaluo.updatedAt || nowISO();

  return {
    id,
    codigo,
    titulo: avaluo.titulo || avaluo.nombre || `Expediente ${codigo}`,

    tipoModulo: normalizeModulo(avaluo.tipoModulo),
    estado: normalizeEstado(avaluo.estatusOperativo),
    prioridad: normalizePrioridad(avaluo.prioridad),

    clienteNombre,
    peritoNombre,

    fechaSolicitud: avaluo.fechaSolicitud || avaluo.info?.fecha || todayISO(),
    fechaEntregaEstimada: avaluo.fechaEntregaEstimada,
    fechaCierre: avaluo.fechaCierre,

    costoServicio,
    montoPagado,
    saldo,
    moneda: normalizeMoneda(avaluo.info?.moneda),
    estadoPago,

    facturaEmitida: false,

    totalRevisiones: 0,

    creadoEn: avaluo.createdAt || actualizadoEn,
    actualizadoEn,
  };
}

export function sincronizarAvaluosLegacyConIndicePlataforma() {
  const { avaluos, clientes, peritos } = obtenerAvaluosLegacyDesdeLocalStorage();

  const actuales = getExpedientesIndiceINMOVAL();

  const convertidos = avaluos.map((avaluo) =>
    convertirAvaluoLegacyAExpedienteIndice({
      avaluo,
      clientes,
      peritos,
    })
  );

  const mapa = new Map<string, ExpedienteIndiceINMOVAL>();

  for (const expediente of actuales) {
    mapa.set(expediente.id, expediente);
  }

  for (const expediente of convertidos) {
    mapa.set(expediente.id, {
      ...mapa.get(expediente.id),
      ...expediente,
    });
  }

  const resultado = Array.from(mapa.values());

  saveExpedientesIndiceINMOVAL(resultado);

  return {
    totalLegacy: avaluos.length,
    totalSincronizados: convertidos.length,
    totalIndice: resultado.length,
  };
}
