import {
    EstadoRevisionAvaluo,
    TipoModuloTecnico,
  } from '@/shared/types/inmovalCore';
  
  export type SnapshotTecnicoRevisionINMOVAL = {
    modulo: TipoModuloTecnico;
    versionModulo: string;
  
    datosTecnicos?: unknown;
    informacionGeneral?: unknown;
    documentacionLegal?: unknown;
    entorno?: unknown;
    terrenos?: unknown[];
    infraestructuras?: unknown[];
    metodologias?: unknown;
    comparablesUsados?: unknown[];
    fotos?: unknown[];
    documentos?: unknown[];
  
    memoriaCalculo?: unknown;
    resultadoTecnico?: unknown;
    formatoInforme?: unknown;
  };
  
  export type RevisionAvaluoINMOVAL = {
    id: string;
    expedienteId: string;
  
    codigo: string;
    nombre: string;
    estado: EstadoRevisionAvaluo;
  
    modulo: TipoModuloTecnico;
    versionModulo: string;
  
    snapshotTecnico: SnapshotTecnicoRevisionINMOVAL;
  
    observacionesRevision?: string;
    motivoNuevaRevision?: string;
  
    creadaDesdeRevisionId?: string;
    creadaPor?: string;
  
    fechaCreacion: string;
    fechaActualizacion: string;
    fechaAprobacion?: string;
  
    esRevisionActiva: boolean;
    esFinal: boolean;
  };
  
  export function crearCodigoRevision(numeroRevision: number) {
    if (numeroRevision <= 0) return 'Rev00';
  
    return `Rev${String(numeroRevision).padStart(2, '0')}`;
  }
  
  export function revisionPuedeMarcarseFinal(revision: RevisionAvaluoINMOVAL) {
    return revision.estado === 'aprobado' || revision.estado === 'final';
  }
  
  export function revisionPuedeDuplicarse(revision: RevisionAvaluoINMOVAL) {
    return !revision.esFinal;
  }