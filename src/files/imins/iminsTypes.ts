import {
    InmovalFileContract,
    TipoModuloTecnico,
  } from '@/shared/types/inmovalCore';
  
  export type IMINSFileVersion = '1.0.0';
  
  export type CategoriaFotoInspeccionINMOVAL =
    | 'fachada'
    | 'entorno'
    | 'calle'
    | 'terreno'
    | 'infraestructura'
    | 'interior'
    | 'servicios'
    | 'danos'
    | 'documento'
    | 'otro';
  
  export type FotoInspeccionINMOVAL = {
    id: string;
    titulo: string;
    categoria: CategoriaFotoInspeccionINMOVAL;
    descripcion?: string;
  
    archivoRelativo: string;
    orden: number;
  
    latitud?: number;
    longitud?: number;
  
    terrenoId?: string;
    infraestructuraId?: string;
    componenteId?: string;
  
    usarEnInforme: boolean;
    tomadaEn?: string;
  };
  
  export type DocumentoInspeccionINMOVAL = {
    id: string;
    titulo: string;
    descripcion?: string;
    archivoRelativo: string;
    tipo?: string;
  };
  
  export type InspeccionCampoINMOVAL = {
    id: string;
    expedienteId?: string;
    modulo: TipoModuloTecnico;
  
    codigo?: string;
    titulo?: string;
  
    fechaInspeccion: string;
    inspector?: string;
  
    ubicacion?: unknown;
    informacionGeneral?: unknown;
    entorno?: unknown;
    terrenos?: unknown[];
    infraestructuras?: unknown[];
    observaciones?: string;
  
    fotos: FotoInspeccionINMOVAL[];
    documentos: DocumentoInspeccionINMOVAL[];
  
    creadoEn: string;
    actualizadoEn: string;
  };
  
  export type IMINSArchivoInspeccion = InmovalFileContract & {
    tipoArchivo: 'inmoval_inspeccion_urbana';
    extension: '.imins';
    version: IMINSFileVersion;
  
    inspeccion: InspeccionCampoINMOVAL;
  
    estructuraPaquete: {
      inspeccionJson: 'inspeccion.json';
      carpetaFotos: 'fotos/';
      carpetaDocumentos: 'documentos/';
    };
  
    metadata: {
      generadoPor?: string;
      generadoEn: string;
      app: 'INMOVAL Campo';
      descripcion: string;
    };
  };
  
  export function isIMINSArchivoInspeccion(
    value: unknown
  ): value is IMINSArchivoInspeccion {
    if (!value || typeof value !== 'object') return false;
  
    const data = value as Partial<IMINSArchivoInspeccion>;
  
    return (
      data.tipoArchivo === 'inmoval_inspeccion_urbana' &&
      data.extension === '.imins' &&
      Boolean(data.inspeccion)
    );
  }