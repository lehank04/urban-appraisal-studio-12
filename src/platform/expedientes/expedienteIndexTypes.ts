import {
  EstadoExpedienteINMOVAL,
  EstadoPagoINMOVAL,
  TipoModuloTecnico,
} from '@/shared/types/inmovalCore';
import {
  MonedaINMOVAL,
  PrioridadExpedienteINMOVAL,
} from './expedienteTypes';

export type ExpedienteIndiceINMOVAL = {
  id: string;
  codigo: string;
  titulo: string;

  tipoModulo: TipoModuloTecnico;
  estado: EstadoExpedienteINMOVAL;
  prioridad: PrioridadExpedienteINMOVAL;

  clienteId?: string;
  clienteNombre: string;
  clienteEmail?: string;
  clienteTelefono?: string;
  clienteDireccion?: string;

  peritoId?: string;
  peritoNombre?: string;

  correoElectronico?: string;
  institucionSolicitante?: string;
  nombreSolicitante?: string;
  informacionContacto?: string;

  direccionInmueble?: string;
  tipoInmuebleCodigo?: string;
  tipoInmuebleNombre?: string;
  clasificacionInmuebleCodigo?: string;
  clasificacionInmuebleNombre?: string;
  propositoAvaluoCodigo?: string;
  propositoAvaluoNombre?: string;

  fechaInspeccion?: string;
  notas?: string;

  fechaSolicitud: string;
  fechaEntregaEstimada?: string;
  fechaCierre?: string;

  costoServicio: number;
  montoPagado: number;
  saldo: number;
  moneda: MonedaINMOVAL;
  estadoPago: EstadoPagoINMOVAL;

  // ── Financiero extendido (heredado de cotización) ──
  cotizacionId?: string;
  cotizacionNumero?: string;
  costoBaseServicio?: number;
  otrosGastos?: number;
  otrosGastosItems?: Array<{ id: string; concepto: string; monto: number }>;
  aplicaIVA?: boolean;
  ivaPorcentaje?: number;
  impuestos?: number;
  totalFacturable?: number;

  facturaEmitida: boolean;
  numeroFactura?: string;
  facturaFecha?: string;

  // ── Movimientos financieros del expediente ──
  pagos?: Array<{
    id: string;
    fecha: string;
    monto: number;
    metodo?: string;
    referencia?: string;
    nota?: string;
    creadoEn: string;
  }>;
  gastosOperativos?: Array<{
    id: string;
    fecha: string;
    concepto: string;
    monto: number;
    categoria?: string;
    nota?: string;
    creadoEn: string;
  }>;

  revisionActivaCodigo?: string;
  totalRevisiones: number;

  driveUrl?: string;
  archivoImvNombre?: string;

  avaluoTecnicoId?: string;
  avaluoTecnicoRuta?: string;
  moduloTecnicoVinculado?: TipoModuloTecnico;
  vinculadoModuloTecnicoEn?: string;

  preparacionTecnicaId?: string;
  preparacionTecnicaEstado?: 'pendiente' | 'preparado' | 'vinculado';
  preparacionTecnicaEn?: string;
  preparacionTecnicaResumen?: string;

  creadoEn: string;
  actualizadoEn: string;
};

export type ExpedienteIndiceFiltrosINMOVAL = {
  busqueda?: string;
  tipoModulo?: TipoModuloTecnico | 'todos';
  estado?: EstadoExpedienteINMOVAL | 'todos';
  prioridad?: PrioridadExpedienteINMOVAL | 'todos';
  estadoPago?: EstadoPagoINMOVAL | 'todos';
};

export function expedienteIndiceCoincideConBusqueda(
  expediente: ExpedienteIndiceINMOVAL,
  busqueda?: string
) {
  if (!busqueda?.trim()) return true;

  const q = busqueda.trim().toLowerCase();

  return [
    expediente.codigo,
    expediente.titulo,
    expediente.clienteNombre,
    expediente.clienteEmail,
    expediente.clienteTelefono,
    expediente.peritoNombre,
    expediente.institucionSolicitante,
    expediente.nombreSolicitante,
    expediente.informacionContacto,
    expediente.direccionInmueble,
    expediente.tipoInmuebleNombre,
    expediente.clasificacionInmuebleNombre,
    expediente.propositoAvaluoNombre,
    expediente.revisionActivaCodigo,
    expediente.numeroFactura,
  ]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(q));
}
