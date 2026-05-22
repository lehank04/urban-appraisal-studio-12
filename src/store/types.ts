export type ID = string;

export interface Cliente {
  id: ID;
  nombre: string;
  documento: string;
  telefono?: string;
  email?: string;
  direccion?: string;
}

export type PlantillaId = 'inmoval' | 'adalberto' | 'adicional';

export interface Perito {
  id: ID;
  nombre: string;
  registro: string;
  plantilla: PlantillaId;
  cargo?: string;
}

export interface InfoGeneral {
  codigoExpediente: string;
  solicitante: string;
  propietario: string;
  tipoAvaluo: string;
  finalidad: string;
  fechaInspeccion: string;
  fechaElaboracion: string;
  direccionInmueble: string;
  departamento: string;
  municipio: string;
  moneda: string;
  matricula: string;
  numeroCatastral: string;
  areaRegistrada: string;
  areaLevantada: string;
  observacionesGenerales: string;
}

export interface Infraestructura {
  id: ID;
  tipo: 'principal' | 'complementaria' | 'obra_exterior';
  nombre: string;
  descripcion: string;
  unidadMedida: string;
  area: number;
  costoUnitario: number;
  estadoConservacion: string;
  vidaUtil: number;
  edad: number;
  observaciones: string;
}

export interface Terreno {
  id: ID;
  titulo: string;
  area: number;
  valorUnitario: number;
  forma: string;
  topografia: string;
  tipoAcceso: string;
  serviciosPublicos: string;
  zonificacion: string;
  usoActual: string;
  usoPotencial: string;
  entorno: string;
  descripcionFisica: string;
  observaciones: string;
  infraestructuras: Infraestructura[];
}

export interface FactorComparable {
  key: string;
  label: string;
  active: boolean;
  value: number; // multiplicador 1.0 = neutro
}

export interface Comparable {
  id: ID;
  nombre: string;
  ubicacion: string;
  area: number;
  precio: number;
  fotos: string[];
  factores: FactorComparable[];
}

export interface Metodologias {
  comparativo: boolean;
  reposicion: boolean;
  mercadoTerreno: boolean;
  mercadoMejoras: boolean;
  comparables: Comparable[];
}

export type FotoCategoria = 'fachada' | 'interior' | 'comparables' | 'infraestructuras' | 'planos' | 'legales';
export interface Foto { id: ID; src: string; descripcion: string; }
export type Fotografias = Record<FotoCategoria, Foto[]>;

export interface Avaluo {
  id: ID;
  createdAt: string;
  updatedAt: string;
  estado: 'borrador' | 'en_proceso' | 'finalizado';
  clienteId?: ID;
  peritoId?: ID;
  info: InfoGeneral;
  terrenos: Terreno[];
  metodologias: Metodologias;
  fotos: Fotografias;
}

export const emptyInfo = (): InfoGeneral => ({
  codigoExpediente: '', solicitante: '', propietario: '', tipoAvaluo: '',
  finalidad: '', fechaInspeccion: '', fechaElaboracion: '', direccionInmueble: '',
  departamento: '', municipio: '', moneda: 'COP', matricula: '', numeroCatastral: '',
  areaRegistrada: '', areaLevantada: '', observacionesGenerales: '',
});

export const defaultFactores = (): FactorComparable[] => [
  { key: 'ubicacion', label: 'Ubicación', active: true, value: 1 },
  { key: 'area', label: 'Área', active: true, value: 1 },
  { key: 'forma', label: 'Forma', active: false, value: 1 },
  { key: 'topografia', label: 'Topografía', active: false, value: 1 },
  { key: 'acceso', label: 'Acceso', active: false, value: 1 },
  { key: 'servicios', label: 'Servicios', active: false, value: 1 },
  { key: 'entorno', label: 'Entorno', active: false, value: 1 },
  { key: 'oferta', label: 'Oferta/Demanda', active: false, value: 1 },
  { key: 'otros', label: 'Otros', active: false, value: 1 },
];

export const emptyFotos = (): Fotografias => ({
  fachada: [], interior: [], comparables: [], infraestructuras: [], planos: [], legales: [],
});

export const emptyMetodologias = (): Metodologias => ({
  comparativo: true, reposicion: true, mercadoTerreno: true, mercadoMejoras: false,
  comparables: [],
});

export const emptyTerreno = (n = 1): Terreno => ({
  id: crypto.randomUUID(),
  titulo: `Terreno ${n}`,
  area: 0, valorUnitario: 0,
  forma: '', topografia: '', tipoAcceso: '', serviciosPublicos: '',
  zonificacion: '', usoActual: '', usoPotencial: '', entorno: '',
  descripcionFisica: '', observaciones: '',
  infraestructuras: [],
});

export const emptyInfra = (): Infraestructura => ({
  id: crypto.randomUUID(),
  tipo: 'principal', nombre: '', descripcion: '', unidadMedida: 'm²',
  area: 0, costoUnitario: 0, estadoConservacion: 'Bueno',
  vidaUtil: 50, edad: 0, observaciones: '',
});
