import {
  calcularEstadoPagoExpediente,
  calcularSaldoExpediente,
} from '@/platform/expedientes/expedienteTypes';
import { ExpedienteIndiceINMOVAL } from '@/platform/expedientes/expedienteIndexTypes';
import { upsertExpedienteIndiceINMOVAL } from '@/platform/expedientes/expedienteIndexStorage';
import { nowISO, todayISO } from '@/shared/utils/dateUtils';
import { CotizacionINMOVAL } from './cotizacionTypes';
import { TipoModuloTecnico } from '@/shared/types/inmovalCore';

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function moduloFromClasificacionCotizacion(codigo?: string): TipoModuloTecnico {
  if (codigo === 'IU') return 'urbano';
  if (codigo === 'IR') return 'rural';
  if (codigo === 'IE') return 'especiales';
  if (codigo === 'VM') return 'maquinaria';

  return 'urbano';
}

function buildCodigoExpedienteDesdeCotizacion(cotizacion: CotizacionINMOVAL) {
  const cleanNumero = cotizacion.numero
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(-10)
    .toUpperCase();

  return `EXP-${cleanNumero}`;
}

export function crearExpedienteIndiceDesdeCotizacion(
  cotizacion: CotizacionINMOVAL
): ExpedienteIndiceINMOVAL {
  const data = cotizacion as any;
  const ahora = nowISO();

  const costoBase = Number(data.costoServicio ?? 0);
  const gastosItems = Array.isArray(data.otrosGastosItems) ? data.otrosGastosItems : [];
  const otrosGastos = Number(
    data.otrosGastos ??
      (gastosItems.length > 0
        ? gastosItems.reduce((s: number, g: any) => s + Number(g?.monto || 0), 0)
        : 0)
  );
  const aplicaIVA = Boolean(data.aplicaIVA);
  const ivaPorcentaje = Number(data.ivaPorcentaje || 0);
  const impuestos = Number(
    data.impuestos ??
      (aplicaIVA ? Number(((costoBase + otrosGastos) * (ivaPorcentaje / 100)).toFixed(2)) : 0)
  );
  const totalFacturable = Number(
    data.total ?? Number((costoBase + otrosGastos + impuestos).toFixed(2))
  );
  const montoPagado = 0;
  const saldo = calcularSaldoExpediente(totalFacturable, montoPagado);

  const clasificacionCodigo = data.clasificacionInmuebleCodigo || '';
  const tipoModulo = moduloFromClasificacionCotizacion(clasificacionCodigo);

  return {
    id: data.expedienteId || createId(),
    codigo: buildCodigoExpedienteDesdeCotizacion(cotizacion),
    titulo:
      data.servicio ||
      data.descripcionServicio ||
      `Expediente de ${data.numero || 'cotización'}`,

    tipoModulo,
    estado: 'en_cotizacion',
    prioridad: 'normal',

    clienteId: data.clienteId || data.cliente?.id || undefined,
    clienteNombre:
      data.clienteNombre ||
      data.cliente?.nombre ||
      'Cliente pendiente',
    clienteEmail: data.clienteEmail || data.cliente?.email || undefined,
    clienteTelefono: data.clienteTelefono || data.cliente?.telefono || undefined,
    clienteDireccion: data.clienteDireccion || data.cliente?.direccion || undefined,

    direccionInmueble: data.direccionInmueble || undefined,
    tipoInmuebleCodigo: data.tipoInmuebleCodigo || undefined,
    tipoInmuebleNombre: data.tipoInmuebleNombre || undefined,
    clasificacionInmuebleCodigo: data.clasificacionInmuebleCodigo || undefined,
    clasificacionInmuebleNombre: data.clasificacionInmuebleNombre || undefined,
    propositoAvaluoCodigo: data.propositoAvaluoCodigo || undefined,
    propositoAvaluoNombre: data.propositoAvaluoNombre || undefined,

    notas:
      data.terminosCondiciones ||
      data.descripcionServicio ||
      data.servicio ||
      undefined,

    fechaSolicitud: todayISO(),

    costoServicio: costoBase,
    montoPagado,
    saldo,
    moneda: data.moneda || 'US$',
    estadoPago: calcularEstadoPagoExpediente(totalFacturable, montoPagado),

    cotizacionId: data.id,
    cotizacionNumero: data.numero,
    costoBaseServicio: costoBase,
    otrosGastos,
    otrosGastosItems: gastosItems,
    aplicaIVA,
    ivaPorcentaje,
    impuestos,
    totalFacturable,

    facturaEmitida: false,

    revisionActivaCodigo: 'Rev00',
    totalRevisiones: 0,

    creadoEn: ahora,
    actualizadoEn: ahora,
  };
}

export function crearExpedienteDeCotizacionAprobada(
  cotizacion: CotizacionINMOVAL
) {
  const expediente = crearExpedienteIndiceDesdeCotizacion(cotizacion);

  upsertExpedienteIndiceINMOVAL(expediente);

  return expediente;
}
