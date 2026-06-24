// ============================================================
// MODELO DE DATOS INMOVAL
// Torre de Control + Módulo Técnico Urbano
//
// Resolución CD-SIBOIF-868-1-DIC10-2014 "Norma sobre Peritos
// Valuadores que presten servicios a las Instituciones del
// Sistema Financiero"
// ============================================================

export type ID = string;

// ============================================================
// TORRE DE CONTROL — TIPOS ADMINISTRATIVOS
// ============================================================

export type TipoModuloAvaluo =
  | 'urbano'
  | 'rural'
  | 'maquinaria'
  | 'vehiculo'
  | 'especial';

export type EstatusOperativo =
  | 'borrador'
  | 'pendiente_inspeccion'
  | 'en_inspeccion'
  | 'en_elaboracion'
  | 'en_revision'
  | 'listo_exportar'
  | 'entregado'
  | 'cerrado'
  | 'cancelado';

export type PrioridadExpediente =
  | 'baja'
  | 'normal'
  | 'alta'
  | 'urgente';

export type EstadoPago =
  | 'pendiente'
  | 'parcial'
  | 'pagado'
  | 'no_aplica';

// -------------------- ENTIDADES BASE --------------------

export interface Cliente {
  id: ID;
  nombre: string;
  documento: string;       // cédula / RUC
  telefono?: string;
  email?: string;
  direccion?: string;
}

export type PlantillaId = 'inmoval' | 'adalberto' | 'adicional';

export interface Perito {
  id: ID;
  nombre: string;
  cedula?: string;          // Cédula o RUC
  registroSIBOIF?: string;  // NIPEV
  /** alias legado */
  registro?: string;
  cargo?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  plantilla: PlantillaId;
  empresa?: string;
  ciudad?: string;
}

// -------------------- INFORMACIÓN GENERAL --------------------

export interface InfoGeneral {
  numeroExpediente: string;
  tipoInmueble: string;
  regimen: string;
  proposito: string;
  propietario: string;
  solicitante: string;
  clienteNombre: string;
  valuadorNombre: string;
  valuadorNipev: string;
  fechaInspeccion: string;
  fechaAvaluo: string;     // fecha emisión / portada
  observaciones: string;

  // ---- alias / campos legados UI prototipo ----
  moneda?: string;
  codigoExpediente?: string;
  tipoAvaluo?: string;
  finalidad?: string;
  fechaElaboracion?: string;
  direccionInmueble?: string;
  departamento?: string;
  municipio?: string;
  matricula?: string;
  numeroCatastral?: string;
  areaRegistrada?: string;
  areaLevantada?: string;
  observacionesGenerales?: string;
}

// -------------------- DOCUMENTACIÓN LEGAL --------------------

export type TipoDocumentoLegal =
  | 'escritura'
  | 'contrato'
  | 'plano_topografico'
  | 'razon_inscripcion'
  | 'personalizado';

export interface DocumentoLegalItem {
  id: string;
  tipo: TipoDocumentoLegal;
  titulo: string;
  nombre: string;
  fecha: string;
  autorizante: string;
  areaM2: number;
  areaVr2: number;

  tieneInscripcion: boolean;
  numeroRegistral: string;
  tomo: string;
  folio: string;
  asiento: string;
  numeroCatastral: string;
  observaciones: string;
}

export interface DocumentoLegal {
  documentos: DocumentoLegalItem[];

  // Campos legacy — compatibilidad con avalúos antiguos
  numeroEscritura: string;
  fechaEscritura: string;
  notario: string;
  areaTerrenoEscritura: number;
  areaTerrenoEscrituraVr2: number;
  areaTerrenoCatastro?: number;
  numeroCatastral: string;
  numeroRegistral: string;
  numeroFinca?: string;
  tomo: string;
  folio: string;
  asiento: string;
  observaciones: string;
}

// -------------------- ENTORNO --------------------

export interface EquipamientoItem {
  id: string;
  nombre: string;
  distanciaKm: number;
  observaciones?: string;
}

export interface Entorno {
  clasificacionZona: string;
  tipoConstruccion: string;
  indiceSaturacion: string;
  densidadPoblacional: string;

  carpetaZona: string;
  carpetaInmueble: string;
  flujoZona: string;
  flujoInmueble: string;
  estadoZona: string;
  estadoInmueble: string;
  importanciaZona: string;
  importanciaInmueble: string;
  proximidadZona: string;
  proximidadInmueble: string;

  contaminacion: string[];
  serviciosPublicos: string[];
  equipamientoUrbano: EquipamientoItem[];
  distancias: string;
}

// -------------------- TERRENO --------------------

export interface AreaItem {
  id: string;
  origen:
    | 'doc_legal'
    | 'nueva'
    | 'escritura'
    | 'plano'
    | 'levantamiento'
    | 'contrato'
    | 'personalizado';
  origenLabel?: string;
  docLegalId?: string;
  unidad1: string;
  valor1: number;
  unidad2: string;
  valor2: number;
  usarHomologacion: boolean;
  observaciones?: string;
}

export interface DescripcionGeneralTerrenos {
  direccion: string;
  coordenadas: string;
  personaEntrevistada: string;
}

export type LinderoFuente =
  | 'escritura'
  | 'plano'
  | 'levantamiento'
  | 'personalizado';

export interface LinderoMedida {
  id: string;
  fuente: LinderoFuente;
  fuenteLabel?: string;
  colindante: string;
  medida: number;
}

export interface Lindero {
  orientacion: 'NORTE' | 'SUR' | 'ESTE' | 'OESTE';
  medidas: LinderoMedida[];
  delimitanteFisico: string;

  // legacy
  levantamientoColindante: string;
  levantamientoMedida: number;
  escrituraColindante: string;
  escrituraMedida: number;
  planoColindante: string;
  planoMedida: number;
}

export interface Terreno {
  id: ID;
  titulo: string;
  ubicacionExacta: string;
  coordenadas: string;
  personaEntrevistada: string;

  areas: AreaItem[];

  // áreas legadas
  areaEscrituraM2: number;
  areaEscrituraVr2: number;
  areaCatastralM2: number;
  areaCatastralVr2: number;
  areaLevantamientoM2: number;
  areaLevantamientoVr2: number;
  areaHomologacionFuente: 'escritura' | 'catastral' | 'levantamiento';
  diferenciaArea: number;
  observacionesArea: string;

  topografia: string;
  forma: string;
  servidumbres: string;
  caracteristicasPanoramicas: string;
  consideracionesAdicionales: string;
  usoTipo: string;
  estadoOcupacion: string;
  tieneObrasComplementarias: boolean;
  obrasComplementarias: string;

  linderos: Lindero[];

  valorUnitarioVr2: number;

  infraestructuras: Infraestructura[];

  // alias / legados UI prototipo
  area?: number;
  valorUnitario?: number;
  tipoAcceso?: string;
  serviciosPublicos?: string;
  zonificacion?: string;
  usoActual?: string;
  usoPotencial?: string;
  entorno?: string;
  descripcionFisica?: string;
  observaciones?: string;
}

// -------------------- INFRAESTRUCTURA --------------------

export interface AmbienteCount {
  ambiente: string;
  cantidad: number;
}

export interface DescripcionConstructiva {
  elemento: string;
  descripcion: string;
}

export interface CostoEtapa {
  id: ID;
  grupo: 'directos' | 'indirectos' | 'impuestos';
  etapa: string;
  descripcion: string;
  unidad: string;
  cantidad: number;
  costoUnitario: number;
}

export interface Infraestructura {
  id: ID;
  tipo: 'principal' | 'complementaria' | 'obra_exterior';
  nombre: string;
  areaTotalM2: number;
  niveles: number;
  ambientes: AmbienteCount[];
  descripciones: DescripcionConstructiva[];
  observaciones: string;

  vidaUtilAnios: number;
  edadAnios: number;
  estadoFE: number;
  anioConstruccion: number;
  estadoConservacionTexto: string;

  costos: CostoEtapa[];

  unidadObraExterior?: string;
  cantidadObraExterior?: number;
  descripcionObraExterior?: string;

  costoReposicionM2?: number;
  depAjustadaPct?: number;

  // alias / legados UI prototipo
  unidadMedida?: string;
  area?: number;
  costoUnitario?: number;
  estadoConservacion?: string;
  vidaUtil?: number;
  edad?: number;
  descripcion?: string;
}

// -------------------- ENFOQUE DE MERCADO --------------------

export interface FichaSujetoInmueble {
  direccion: string;
  areaConstruccionM2: number;
  areaTerrenoM2: number;
  ubicacionKey: string;
  zonaKey: string;
  viaAccesoKey: string;
  fechaInspeccion: string;
  dormitorios: number;
  banosCompletos: number;
  banoMedio: number;
  cuartoBanoServicio: number;
}

export interface FichaSujetoTerreno {
  direccion: string;
  areaTerrenoVr2: number;
  ubicacionKey: string;
  zonaKey: string;
  viaAccesoKey: string;
  fechaInspeccion: string;
  serviciosKey: string;
  equipamientoKey: string;
  topografiaKey: string;
  posicionManzanaKey: string;
}

export interface ComparableInmueble {
  id: ID;
  paginaWeb: string;
  enlace: string;
  contacto: string;
  idAnuncio: string;
  direccion: string;
  precioVentaUSD: number;
  areaConstruccionM2: number;
  areaTerrenoM2: number;
  fechaPublicacion: string;
  diasAntiguedad: number;
  ubicacionKey: string;
  zonaKey: string;
  viaAccesoKey: string;
  dormitorios: number;
  banosCompletos: number;
  banoMedio: number;
  cuartoBanoServicio: number;
}

export interface ComparableTerreno {
  id: ID;
  paginaWeb: string;
  enlace: string;
  contacto: string;
  idAnuncio: string;
  direccion: string;
  precioVentaUSD: number;
  areaTerrenoVr2: number;
  fechaPublicacion: string;
  diasAntiguedad: number;
  ubicacionKey: string;
  zonaKey: string;
  viaAccesoKey: string;
  serviciosKey: string;
  equipamientoKey: string;
  topografiaKey: string;
  posicionManzanaKey: string;
}

// -------------------- VALOR DE REALIZACIÓN --------------------

export interface DeduccionesRealizacion {
  ir: number;
  ibi: number;
  corretaje: number;
  legales: number;
  comercializacion: number;
}

// -------------------- METODOLOGÍAS --------------------

export interface FactorComparable {
  key: string;
  label: string;
  value: number;
  active: boolean;
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

export const defaultFactores = (): FactorComparable[] => [
  { key: 'ubicacion', label: 'Ubicación', value: 1.0, active: true },
  { key: 'area', label: 'Área', value: 1.0, active: true },
  { key: 'topografia', label: 'Topografía', value: 1.0, active: true },
  { key: 'acceso', label: 'Acceso', value: 1.0, active: true },
  { key: 'servicios', label: 'Servicios', value: 1.0, active: true },
  { key: 'uso', label: 'Uso', value: 1.0, active: true },
];

export interface Metodologias {
  enfoqueMercado: boolean;
  enfoqueCosto: boolean;
  enfoqueIngresos: boolean;

  sujetoInmueble: FichaSujetoInmueble;
  sujetoTerreno: FichaSujetoTerreno;

  comparablesInmueble: ComparableInmueble[];
  comparablesTerreno: ComparableTerreno[];

  deducciones: DeduccionesRealizacion;
  enfoqueConclusion: 'mercado' | 'costo';
  notasMercadoInmueble: string;
  notasMercadoTerreno: string;

  // alias / legados UI prototipo
  comparativo?: boolean;
  reposicion?: boolean;
  mercadoTerreno?: boolean;
  mercadoMejoras?: boolean;
  comparables?: Comparable[];
}

// -------------------- MEMORIAS POR TERRENO --------------------

export interface AplicarMemorias {
  mercadoInmueble: boolean;
  realizacion: boolean;
  mercadoTerreno: boolean;
  reposicion: boolean;
  ross: boolean;
  consolidado: boolean;
  conclusion: boolean;
}

export interface MemoriaTerreno {
  aplicar: AplicarMemorias;
  infraestructurasPrincipalesIds?: ID[];
  sujetoInmueble: FichaSujetoInmueble;
  sujetoTerreno: FichaSujetoTerreno;
  comparablesInmueble: ComparableInmueble[];
  comparablesTerreno: ComparableTerreno[];
  deducciones: DeduccionesRealizacion;
  enfoqueConclusion: 'mercado' | 'costo';
  notasMercadoInmueble: string;
  notasMercadoTerreno: string;
}

// -------------------- FOTOS --------------------

export type FotoCategoria =
  | 'fachada'
  | 'interior'
  | 'lindero_norte'
  | 'lindero_sur'
  | 'lindero_este'
  | 'lindero_oeste'
  | 'infraestructuras'
  | 'comparables_inmueble'
  | 'comparables_terreno'
  | 'comparables'
  | 'planos'
  | 'macrolocalizacion'
  | 'microlocalizacion'
  | 'legales';

export interface Foto {
  id: ID;
  src: string;
  descripcion: string;
}

export type Fotografias = Record<FotoCategoria, Foto[]>;

// -------------------- FORMATO EXPORTACIÓN --------------------

export interface FormatoExport {
  portadaImagen?: string;
  mostrarPortadaImagen: boolean;

  headerIzq: string;
  headerDer: string;
  footerIzq: string;
  footerDer: string;
  mostrarHeader: boolean;
  mostrarFooter: boolean;

  fuente: 'roboto-mono' | 'inter' | 'serif';
  bordesRedondeados: boolean;

  incluirCartaPresentacion: boolean;
  incluirMetodologia: boolean;

  textoCartaPresentacion?: string;
  textoMetodologia?: string;
}

export const emptyFormatoExport = (): FormatoExport => ({
  mostrarPortadaImagen: true,
  headerIzq: '{{capitulo}}',
  headerDer: '{{empresa}}',
  footerIzq: 'PERITO VALUADOR {{perito}}\n{{email}} / {{telefono}}',
  footerDer: 'PÁG. {{pagina}}',
  mostrarHeader: true,
  mostrarFooter: true,
  fuente: 'roboto-mono',
  bordesRedondeados: true,
  incluirCartaPresentacion: true,
  incluirMetodologia: true,
});

// -------------------- AVALÚO / EXPEDIENTE --------------------

export interface Avaluo {
  id: ID;
  createdAt: string;
  updatedAt: string;

  /**
   * Estado técnico legado.
   * Se mantiene por compatibilidad con pantallas existentes.
   */
  estado: 'borrador' | 'en_proceso' | 'finalizado';

  // ============================================================
  // TORRE DE CONTROL — DATOS ADMINISTRATIVOS DEL EXPEDIENTE
  // ============================================================

  tipoModulo: TipoModuloAvaluo;
  estatusOperativo: EstatusOperativo;
  prioridad: PrioridadExpediente;

  fechaSolicitud: string;
  fechaEntregaEstimada: string;
  fechaCierre: string;

  costoServicio: number;
  montoPagado: number;
  estadoPago: EstadoPago;

  observacionesAdministrativas: string;

  // ============================================================
  // RELACIONES Y MÓDULO TÉCNICO URBANO
  // ============================================================

  clienteId?: ID;
  peritoId?: ID;

  info: InfoGeneral;
  documentoLegal: DocumentoLegal;
  entorno: Entorno;
  descripcionGeneralTerrenos: DescripcionGeneralTerrenos;
  terrenos: Terreno[];

  metodologias: Metodologias;
  metodologiasPorTerreno?: Record<ID, MemoriaTerreno>;

  fotos: Fotografias;
  formato?: FormatoExport;
}

// ============================================================
// FACTORIES
// ============================================================

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const emptyInfo = (): InfoGeneral => ({
  numeroExpediente: '',
  tipoInmueble: 'CASA DE HABITACIÓN - IU',
  regimen: 'PRIVADA INDIVIDUAL',
  proposito: 'REFERENCIA DE VALORES - RV',
  propietario: '',
  solicitante: '',
  clienteNombre: '',
  valuadorNombre: '',
  valuadorNipev: '',
  fechaInspeccion: '',
  fechaAvaluo: '',
  observaciones: '',
  moneda: 'US$',
});

export const emptyDocLegal = (): DocumentoLegal => ({
  documentos: [],
  numeroEscritura: '',
  fechaEscritura: '',
  notario: '',
  areaTerrenoEscritura: 0,
  areaTerrenoEscrituraVr2: 0,
  numeroCatastral: '',
  numeroRegistral: '',
  tomo: '',
  folio: '',
  asiento: '',
  observaciones: '',
});

export const emptyEntorno = (): Entorno => ({
  clasificacionZona: '',
  tipoConstruccion: '',
  indiceSaturacion: '',
  densidadPoblacional: '',
  carpetaZona: '',
  carpetaInmueble: '',
  flujoZona: '',
  flujoInmueble: '',
  estadoZona: '',
  estadoInmueble: '',
  importanciaZona: '',
  importanciaInmueble: '',
  proximidadZona: '',
  proximidadInmueble: '',
  contaminacion: [],
  serviciosPublicos: [],
  equipamientoUrbano: [],
  distancias: '',
});

export const emptyLinderoMedida = (
  fuente: LinderoFuente = 'levantamiento'
): LinderoMedida => ({
  id: crypto.randomUUID(),
  fuente,
  fuenteLabel: '',
  colindante: '',
  medida: 0,
});

export const emptyLinderos = (): Lindero[] =>
  (['NORTE', 'SUR', 'ESTE', 'OESTE'] as const).map((o) => ({
    orientacion: o,
    medidas: [emptyLinderoMedida('levantamiento')],
    delimitanteFisico: '',
    levantamientoColindante: '',
    levantamientoMedida: 0,
    escrituraColindante: '',
    escrituraMedida: 0,
    planoColindante: '',
    planoMedida: 0,
  }));

export const emptyDescripcionGeneralTerrenos = (): DescripcionGeneralTerrenos => ({
  direccion: '',
  coordenadas: '',
  personaEntrevistada: '',
});

export const emptyAreaItem = (
  origen: AreaItem['origen'] = 'levantamiento'
): AreaItem => ({
  id: crypto.randomUUID(),
  origen,
  origenLabel: '',
  unidad1: 'm²',
  valor1: 0,
  unidad2: 'vr²',
  valor2: 0,
  usarHomologacion: origen === 'levantamiento',
  observaciones: '',
});

export const emptyTerreno = (n = 1): Terreno => ({
  id: crypto.randomUUID(),
  titulo: `Terreno ${n}`,
  ubicacionExacta: '',
  coordenadas: '',
  personaEntrevistada: '',

  areas: [emptyAreaItem('levantamiento')],

  areaEscrituraM2: 0,
  areaEscrituraVr2: 0,
  areaCatastralM2: 0,
  areaCatastralVr2: 0,
  areaLevantamientoM2: 0,
  areaLevantamientoVr2: 0,
  areaHomologacionFuente: 'levantamiento',
  diferenciaArea: 0,
  observacionesArea: '',

  topografia: '',
  forma: '',
  servidumbres: '',
  caracteristicasPanoramicas: '',
  consideracionesAdicionales: '',
  usoTipo: '',
  estadoOcupacion: '',
  tieneObrasComplementarias: false,
  obrasComplementarias: '',

  linderos: emptyLinderos(),

  valorUnitarioVr2: 0,

  infraestructuras: [],
});

export const emptyInfra = (
  tipo: Infraestructura['tipo'] = 'principal'
): Infraestructura => ({
  id: crypto.randomUUID(),
  tipo,
  nombre: '',
  areaTotalM2: 0,
  niveles: 1,
  ambientes: [],
  descripciones: [],
  observaciones: '',

  vidaUtilAnios: 70,
  edadAnios: 0,
  estadoFE: 8,
  anioConstruccion: new Date().getFullYear(),
  estadoConservacionTexto: '',

  costos: [],
});

export const emptySujetoInmueble = (): FichaSujetoInmueble => ({
  direccion: '',
  areaConstruccionM2: 0,
  areaTerrenoM2: 0,
  ubicacionKey: 'PERIFERICA',
  zonaKey: 'RESIDENCIAL',
  viaAccesoKey: 'ASFALTO',
  fechaInspeccion: '',
  dormitorios: 0,
  banosCompletos: 0,
  banoMedio: 0,
  cuartoBanoServicio: 0,
});

export const emptySujetoTerreno = (): FichaSujetoTerreno => ({
  direccion: '',
  areaTerrenoVr2: 0,
  ubicacionKey: 'PERIFERICA',
  zonaKey: 'RESIDENCIAL',
  viaAccesoKey: 'ASFALTO',
  fechaInspeccion: '',
  serviciosKey: 'ESTANDAR',
  equipamientoKey: 'MEDIA',
  topografiaKey: 'PLANA',
  posicionManzanaKey: 'MEDIANERO',
});

export const emptyComparableInmueble = (): ComparableInmueble => ({
  id: crypto.randomUUID(),
  paginaWeb: '',
  enlace: '',
  contacto: '',
  idAnuncio: '',
  direccion: '',
  precioVentaUSD: 0,
  areaConstruccionM2: 0,
  areaTerrenoM2: 0,
  fechaPublicacion: '',
  diasAntiguedad: 0,
  ubicacionKey: 'PERIFERICA',
  zonaKey: 'RESIDENCIAL',
  viaAccesoKey: 'ASFALTO',
  dormitorios: 0,
  banosCompletos: 0,
  banoMedio: 0,
  cuartoBanoServicio: 0,
});

export const emptyComparableTerreno = (): ComparableTerreno => ({
  id: crypto.randomUUID(),
  paginaWeb: '',
  enlace: '',
  contacto: '',
  idAnuncio: '',
  direccion: '',
  precioVentaUSD: 0,
  areaTerrenoVr2: 0,
  fechaPublicacion: '',
  diasAntiguedad: 0,
  ubicacionKey: 'PERIFERICA',
  zonaKey: 'RESIDENCIAL',
  viaAccesoKey: 'ASFALTO',
  serviciosKey: 'ESTANDAR',
  equipamientoKey: 'MEDIA',
  topografiaKey: 'PLANA',
  posicionManzanaKey: 'MEDIANERO',
});

export const emptyMetodologias = (): Metodologias => ({
  enfoqueMercado: true,
  enfoqueCosto: true,
  enfoqueIngresos: false,
  sujetoInmueble: emptySujetoInmueble(),
  sujetoTerreno: emptySujetoTerreno(),
  comparablesInmueble: [],
  comparablesTerreno: [],
  deducciones: {
    ir: 2,
    ibi: 1,
    corretaje: 4,
    legales: 1,
    comercializacion: 2,
  },
  enfoqueConclusion: 'mercado',
  notasMercadoInmueble: '',
  notasMercadoTerreno: '',
});

export const emptyAplicarMemorias = (): AplicarMemorias => ({
  mercadoInmueble: true,
  realizacion: true,
  mercadoTerreno: true,
  reposicion: true,
  ross: true,
  consolidado: true,
  conclusion: true,
});

export const emptyMemoriaTerreno = (): MemoriaTerreno => ({
  aplicar: emptyAplicarMemorias(),
  infraestructurasPrincipalesIds: undefined,
  sujetoInmueble: emptySujetoInmueble(),
  sujetoTerreno: emptySujetoTerreno(),
  comparablesInmueble: [],
  comparablesTerreno: [],
  deducciones: {
    ir: 2,
    ibi: 1,
    corretaje: 4,
    legales: 1,
    comercializacion: 2,
  },
  enfoqueConclusion: 'mercado',
  notasMercadoInmueble: '',
  notasMercadoTerreno: '',
});

export const emptyFotos = (): Fotografias => ({
  fachada: [],
  interior: [],
  lindero_norte: [],
  lindero_sur: [],
  lindero_este: [],
  lindero_oeste: [],
  infraestructuras: [],
  comparables_inmueble: [],
  comparables_terreno: [],
  comparables: [],
  planos: [],
  macrolocalizacion: [],
  microlocalizacion: [],
  legales: [],
});