export type InmovalFileKind =
  | 'inmoval_expediente'
  | 'inmoval_comparable'
  | 'inmoval_inspeccion_urbana'
  | 'inmoval_modulo_tecnico';

export type InmovalFileExtension =
  | '.imv'
  | '.imc'
  | '.imins'
  | '.immod';

export type TipoModuloTecnico =
  | 'urbano'
  | 'rural'
  | 'maquinaria'
  | 'vehiculo'
  | 'vehiculos'
  | 'especial'
  | 'especiales';

export type EstadoModuloTecnico =
  | 'activo'
  | 'no_instalado'
  | 'deshabilitado'
  | 'requiere_actualizacion';

export type RolUsuarioINMOVAL =
  | 'administrador'
  | 'administrativo'
  | 'operacional';

export type EstadoExpedienteINMOVAL =
  | 'en_cotizacion'
  | 'cotizacion_enviada'
  | 'cotizacion_aprobada'
  | 'pendiente_inspeccion'
  | 'en_inspeccion'
  | 'en_elaboracion'
  | 'en_revision'
  | 'correcciones'
  | 'aprobado'
  | 'entregado'
  | 'facturado'
  | 'cerrado'
  | 'cancelado';

export type EstadoRevisionAvaluo =
  | 'borrador'
  | 'en_revision'
  | 'observado'
  | 'corregido'
  | 'aprobado'
  | 'final';

export type EstadoComparable =
  | 'vigente'
  | 'por_vencer'
  | 'vencido'
  | 'archivado'
  | 'descartado';

export type EstadoCotizacion =
  | 'borrador'
  | 'enviada'
  | 'aprobada'
  | 'rechazada'
  | 'vencida';

export type EstadoPagoINMOVAL =
  | 'pendiente'
  | 'parcial'
  | 'pagado'
  | 'no_aplica';

export type InmovalFileContract = {
  tipoArchivo: InmovalFileKind;
  version: string;
  fechaExportacion?: string;
};

export type ModuloTecnicoManifest = {
  id: TipoModuloTecnico;
  nombre: string;
  descripcion: string;
  version: string;
  estado: EstadoModuloTecnico;
  extension?: '.immod';
  requiereInstalacionLocal: boolean;
  puedeCrearExpedientes: boolean;
  puedeAbrirExpedientes: boolean;
};

export type ConfiguracionLocalINMOVAL = {
  version: string;
  modulosInstalados: ModuloTecnicoManifest[];
  ultimaRutaTrabajo?: string;
  ultimaActualizacion: string;
};

export type UsuarioINMOVAL = {
  id: string;
  nombre: string;
  email: string;
  rol: RolUsuarioINMOVAL;
  activo: boolean;
};

export type ActividadINMOVAL = {
  id: string;
  fecha: string;
  usuarioId?: string;
  usuarioNombre?: string;
  accion: string;
  modulo: 'plataforma' | 'urbano' | 'rural' | 'comparables' | 'sistema';
  expedienteId?: string;
  revisionId?: string;
  detalle?: string;
};