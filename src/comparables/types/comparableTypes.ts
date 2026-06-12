import {
    EstadoComparable,
    TipoModuloTecnico,
  } from '@/shared/types/inmovalCore';
  import { MonedaINMOVAL } from '@/platform/expedientes/expedienteTypes';
  
  export type TipoComparableINMOVAL =
    | 'terreno'
    | 'inmueble'
    | 'renta'
    | 'venta'
    | 'oferta'
    | 'transaccion';
  
  export type FuenteComparableINMOVAL =
    | 'web'
    | 'corredor'
    | 'cliente'
    | 'campo'
    | 'registro'
    | 'interno'
    | 'otro';
  
  export type EvidenciaComparableINMOVAL = {
    id: string;
    tipo: 'foto' | 'captura' | 'documento' | 'enlace' | 'otro';
    titulo: string;
    descripcion?: string;
    url?: string;
    archivoNombre?: string;
    driveFileId?: string;
    driveUrl?: string;
    fechaCaptura?: string;
  };
  
  export type UbicacionComparableINMOVAL = {
    departamento?: string;
    municipio?: string;
    ciudad?: string;
    zona?: string;
    barrio?: string;
    direccion?: string;
    latitud?: number;
    longitud?: number;
    referencia?: string;
  };
  
  export type CaracteristicasComparableINMOVAL = {
    usoSuelo?: string;
    tipoInmueble?: string;
    tipoCalle?: string;
    servicios?: string[];
  
    areaTerreno?: number;
    unidadAreaTerreno?: 'm2' | 'v2' | 'mz' | 'ha';
  
    areaConstruccion?: number;
    unidadAreaConstruccion?: 'm2';
  
    topografia?: string;
    forma?: string;
    frente?: number;
    fondo?: number;
  
    estadoFisico?: string;
    edadAparente?: number;
    calidadConstructiva?: string;
    observaciones?: string;
  };
  
  export type ValoresComparableINMOVAL = {
    precioOferta?: number;
    precioNegociado?: number;
    precioFinal?: number;
    moneda: MonedaINMOVAL;
  
    precioPorM2Terreno?: number;
    precioPorV2Terreno?: number;
    precioPorM2Construccion?: number;
  
    factorNegociacion?: number;
    factorUbicacion?: number;
    factorForma?: number;
    factorTopografia?: number;
    factorArea?: number;
    factorEstado?: number;
  
    precioHomologado?: number;
    observacionesHomologacion?: string;
  };
  
  export type ComparableINMOVAL = {
    id: string;
    codigo: string;
    titulo: string;
  
    tipo: TipoComparableINMOVAL;
    moduloAplicable: TipoModuloTecnico;
    estado: EstadoComparable;
  
    fuente: FuenteComparableINMOVAL;
    fuenteNombre?: string;
    fuenteUrl?: string;
    contacto?: string;
    telefonoContacto?: string;
  
    fechaPublicacion?: string;
    fechaCaptura: string;
    fechaExpiracion?: string;
  
    ubicacion: UbicacionComparableINMOVAL;
    caracteristicas: CaracteristicasComparableINMOVAL;
    valores: ValoresComparableINMOVAL;
  
    evidencias: EvidenciaComparableINMOVAL[];
  
    driveFolderId?: string;
    driveFileId?: string;
    driveUrl?: string;
  
    archivoImcNombre?: string;
    archivoImcVersion?: string;
  
    observaciones?: string;
    etiquetas?: string[];
  
    creadoPor?: string;
    creadoEn: string;
    actualizadoEn: string;
  };
  
  export type ComparableCongeladoINMOVAL = {
    comparableId: string;
    codigo: string;
    titulo: string;
    fechaCongelado: string;
    motivoUso?: string;
    revisionId?: string;
    expedienteId?: string;
    snapshot: ComparableINMOVAL;
  };
  
  export function calcularPrecioPorUnidad(params: {
    precio?: number;
    area?: number;
  }) {
    const precio = Number(params.precio || 0);
    const area = Number(params.area || 0);
  
    if (precio <= 0 || area <= 0) return 0;
  
    return precio / area;
  }
  
  export function comparableEstaVencido(params: {
    fechaExpiracion?: string;
    fechaActualISO: string;
  }) {
    if (!params.fechaExpiracion) return false;
  
    return params.fechaExpiracion < params.fechaActualISO;
  }