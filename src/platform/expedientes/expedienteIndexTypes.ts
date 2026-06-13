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

  facturaEmitida: boolean;
  numeroFactura?: string;

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
