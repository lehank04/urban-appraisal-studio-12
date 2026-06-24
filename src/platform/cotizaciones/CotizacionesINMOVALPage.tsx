import { ReactNode, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Archive,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  FilePlus2,
  FileText,
  MoreHorizontal,
  Plus,
  Search,
  Send,
  Settings,
  Trash2,
  User,
} from 'lucide-react';

type EstadoCotizacionINMOVAL =
  | 'borrador'
  | 'enviada'
  | 'aprobada'
  | 'rechazada'
  | 'convertida'
  | 'avaluo_en_proceso'
  | 'avaluo_finalizado'
  | 'factura_emitida';

type GastoCotizacionItem = {
  id: string;
  concepto: string;
  monto: number;
};

type MonedaCotizacionINMOVAL = 'US$' | 'C$';

type CatalogOption = {
  id: string;
  nombre: string;
  email?: string;
  telefono?: string;
  direccion?: string;
};

type CodigoOption = {
  codigo: string;
  nombre: string;
};

type TerminoCondicionCotizacion = {
  id: string;
  incluido: boolean;
  titulo: string;
  texto: string;
};

type CotizacionRevisionHistorial = {
  id: string;
  numero: string;
  estado: EstadoCotizacionINMOVAL;
  clienteNombre: string;
  direccionInmueble: string;
  tipoInmuebleNombre: string;
  costoServicio: number;
  moneda: MonedaCotizacionINMOVAL;
  terminosCondiciones: string;
  terminosItems?: TerminoCondicionCotizacion[];
  creadoEn: string;
  guardadoEn: string;
};

type CotizacionINMOVALLocal = {
  id: string;
  numero: string;
  estado: EstadoCotizacionINMOVAL;

  clienteId?: string;
  clienteNombre: string;
  clienteEmail?: string;
  clienteTelefono?: string;
  clienteDireccion?: string;

  direccionInmueble: string;
  tipoInmuebleCodigo: string;
  tipoInmuebleNombre: string;
  clasificacionInmuebleCodigo: string;
  clasificacionInmuebleNombre: string;
  propositoAvaluoCodigo: string;
  propositoAvaluoNombre: string;

  descripcionServicio: string;
  costoServicio: number;
  moneda: MonedaCotizacionINMOVAL;
  terminosCondiciones: string;
  terminosItems?: TerminoCondicionCotizacion[];

  fechaCotizacion: string;
  fechaValidez: string;
  expedienteId?: string;

  revisionNumero?: number;
  cotizacionOrigenId?: string;
  cotizacionOrigenNumero?: string;
  historialRevisiones?: CotizacionRevisionHistorial[];

  otrosGastos?: number;
  otrosGastosItems?: GastoCotizacionItem[];
  aplicaIVA?: boolean;
  ivaPorcentaje?: number;
  impuestos?: number;

  creadoEn: string;
  actualizadoEn: string;
};

const STORAGE_KEY = 'inmoval_cotizaciones_v1';
const EXPEDIENTES_INDICE_STORAGE_KEY_INMOVAL = 'inmoval_expedientes_indice_v1';

const TERMINOS_BASE: TerminoCondicionCotizacion[] = [
  {
    id: 'vigencia-propuesta',
    incluido: true,
    titulo: 'VIGENCIA DE LA PROPUESTA',
    texto:
      'Esta cotización tiene una validez de quince (15) días calendario. Transcurrido este tiempo, agradeceremos solicitar una actualización de los términos para garantizar la disponibilidad y vigencia de los costos presentados.',
  },
  {
    id: 'compromiso-pago',
    incluido: true,
    titulo: 'COMPROMISO DE PAGO',
    texto:
      'Para dar inicio formal a las gestiones técnicas, se requiere un anticipo correspondiente al 50% del monto total. El 50% restante se cancelará al momento de la entrega del informe final. Los pagos podrán realizarse mediante transferencia o depósito bancario en las cuentas autorizadas adjuntas a este documento.',
  },
  {
    id: 'alcance-servicios',
    incluido: true,
    titulo: 'ALCANCE Y SERVICIOS COMPLEMENTARIOS',
    texto:
      'Los honorarios propuestos cubren exclusivamente los servicios detallados en el desglose de esta proforma. En caso de requerir servicios adicionales, modificaciones estructurales al proyecto original o visitas técnicas extra, estas serán evaluadas y presupuestadas de forma independiente para su aprobación previa.',
  },
  {
    id: 'colaboracion-cliente',
    incluido: true,
    titulo: 'COLABORACIÓN DEL CLIENTE',
    texto:
      'Con el fin de asegurar la calidad y exactitud de los resultados, solicitamos amablemente el apoyo del cliente para proporcionar el acceso seguro al inmueble y la documentación legal o técnica necesaria (escrituras, planos, antecedentes, etc.). La entrega oportuna de estos insumos es clave para el cumplimiento de los cronogramas pactados.',
  },
  {
    id: 'compromiso-entrega',
    incluido: true,
    titulo: 'COMPROMISO DE ENTREGA',
    texto:
      'Nuestro compromiso es entregar el informe de avalúo en un plazo de dos (02) días hábiles. El conteo de este tiempo iniciará una vez se completen los siguientes tres pasos:\n\n- Confirmación de la recepción del anticipo del 50%.\n- Recepción de la documentación técnica y legal requerida.\n- Realización efectiva de la inspección física del inmueble.',
  },
  {
    id: 'resguardo-informacion',
    incluido: true,
    titulo: 'RESGUARDO DE LA INFORMACIÓN',
    texto:
      'Toda la documentación, planos y reportes generados son tratados bajo estrictos estándares de confidencialidad para uso exclusivo del cliente o la entidad solicitante. INMOVAL garantiza el manejo ético y el resguardo de su información profesional y personal.',
  },
];

const TIPOS_INMUEBLE: CodigoOption[] = [
  { codigo: 'IU', nombre: 'CASA DE HABITACIÓN' },
  { codigo: 'IU', nombre: 'APARTAMENTOS' },
  { codigo: 'IU', nombre: 'LOTE DE TERRENO VACÍO' },
  { codigo: 'IU', nombre: 'LOTE DE TERRENO CON MEJORAS' },
  { codigo: 'IU', nombre: 'LOCAL COMERCIAL' },
  { codigo: 'IU', nombre: 'BODEGA' },
  { codigo: 'IU', nombre: 'OFICINAS' },
  { codigo: 'IU', nombre: 'AVANCE DE OBRA' },
  { codigo: 'IR', nombre: 'TERRENO RURAL (CON O SIN ESTRUCTURAS)' },
  { codigo: 'IR', nombre: 'VIVIENDAS RURALES' },
  { codigo: 'IR', nombre: 'EDIFICIOS RURALES' },
  { codigo: 'IR', nombre: 'GALPONES' },
  { codigo: 'IR', nombre: 'CERCAS' },
  { codigo: 'IR', nombre: 'SISTEMAS DE RIEGO Y DRENAJE' },
  { codigo: 'IR', nombre: 'VÍAS' },
  { codigo: 'IR', nombre: 'ADECUACIONES DE SUELOS' },
  { codigo: 'IR', nombre: 'POZOS' },
  { codigo: 'IR', nombre: 'CULTIVOS Y PLANTACIONES AGRÍCOLAS' },
  { codigo: 'IR', nombre: 'EXPLOTACIÓN AGRÍCOLA' },
  { codigo: 'IE', nombre: 'EDIFICIOS' },
  { codigo: 'IE', nombre: 'CENTROS COMERCIALES' },
  { codigo: 'IE', nombre: 'HOTELES' },
  { codigo: 'IE', nombre: 'COLEGIOS' },
  { codigo: 'IE', nombre: 'HOSPITALES' },
  { codigo: 'IE', nombre: 'CLÍNICAS' },
  { codigo: 'IE', nombre: 'RESTAURANTES' },
  { codigo: 'IE', nombre: 'AVANCE DE OBRAS (EDIFICIOS EN CONSTRUCCIÓN)' },
  { codigo: 'IE', nombre: 'ESTRUCTURAS ESPECIALES PARA PROCESOS' },
  { codigo: 'IE', nombre: 'AEROPUERTOS' },
  { codigo: 'IE', nombre: 'MUELLES' },
  { codigo: 'IE', nombre: 'PUENTES' },
  { codigo: 'IE', nombre: 'ACUEDUCTOS Y CONDUCCIONES' },
  { codigo: 'IE', nombre: 'EDIFICIOS DE CONSERVACIÓN ARQUITECTÓNICA' },
  { codigo: 'IE', nombre: 'MONUMENTOS HISTÓRICOS' },
  { codigo: 'VM', nombre: 'OTRO' },
];

const CLASIFICACIONES_INMUEBLE: CodigoOption[] = [
  { codigo: 'IU', nombre: 'INMUEBLE URBANO' },
  { codigo: 'IR', nombre: 'INMUEBLE RURAL' },
  { codigo: 'IE', nombre: 'INMUEBLE ESPECIAL' },
  { codigo: 'VM', nombre: 'VEHICULO O MAQUINARIA' },
];

const PROPOSITOS_AVALUO: CodigoOption[] = [
  { codigo: 'OC', nombre: 'OTORGAMIENTO DE CRÉDITO' },
  { codigo: 'RC', nombre: 'REESTRUCTURACIÓN DE CRÉDITO' },
  { codigo: 'BU', nombre: 'BIENES EN USO' },
  { codigo: 'BA', nombre: 'BIENES ADJUDICADOS' },
  { codigo: 'PS', nombre: 'PÓLIZA DE SEGURO' },
  { codigo: 'PV', nombre: 'PARTICULAR / VENTA' },
  { codigo: 'RV', nombre: 'REFERENCIA DE VALORES' },
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysISO(dateISO: string, days: number) {
  const date = new Date(dateISO + 'T00:00:00');
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function nowISO() {
  return new Date().toISOString();
}

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return 'id-' + Date.now() + '-' + Math.random().toString(16).slice(2);
}

function buildNumeroCotizacion() {
  const date = new Date();
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const fechaCorta = yy + mm + dd;

  let maxConsecutivo = 0;

  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];

      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          const numero = String(item?.numero || '');
          const match = numero.match(/^COT-(\d+)-\d{6}/i);

          if (match) {
            maxConsecutivo = Math.max(maxConsecutivo, Number(match[1] || 0));
          }
        }
      }
    } catch {
      // Si falla la lectura, se usa el consecutivo base.
    }
  }

  const consecutivo = String(maxConsecutivo + 1).padStart(4, '0');

  return 'COT-' + consecutivo + '-' + fechaCorta;
}

function numeroDiasEnTextoCotizacion(dias: number) {
  const nombres: Record<number, string> = {
    1: 'un',
    2: 'dos',
    3: 'tres',
    4: 'cuatro',
    5: 'cinco',
    6: 'seis',
    7: 'siete',
    8: 'ocho',
    9: 'nueve',
    10: 'diez',
    11: 'once',
    12: 'doce',
    13: 'trece',
    14: 'catorce',
    15: 'quince',
    20: 'veinte',
    30: 'treinta',
    45: 'cuarenta y cinco',
    60: 'sesenta',
    90: 'noventa',
  };

  return nombres[dias] || String(dias);
}

function buildTextoVigenciaCotizacion(dias: number) {
  const diasSeguro = Math.max(1, Number(dias || 15));

  return `Esta cotización tiene una validez de ${numeroDiasEnTextoCotizacion(
    diasSeguro
  )} (${diasSeguro}) días calendario. Transcurrido este tiempo, agradeceremos solicitar una actualización de los términos para garantizar la disponibilidad y vigencia de los costos presentados.`;
}

function extraerDiasVigenciaCotizacion(items: TerminoCondicionCotizacion[]) {
  const item = items.find((term) => term.id === 'vigencia-propuesta');
  const texto = item?.texto || '';
  const match = texto.match(/\((\d+)\)\s*d[ií]as/i) || texto.match(/(\d+)\s*d[ií]as/i);

  return match ? Number(match[1]) : 15;
}

function diffDaysISOCotizacion(inicio: string, fin: string) {
  if (!inicio || !fin) return 15;

  const start = new Date(inicio + 'T00:00:00');
  const end = new Date(fin + 'T00:00:00');
  const diff = Math.round((end.getTime() - start.getTime()) / 86400000);

  return Number.isFinite(diff) && diff > 0 ? diff : 15;
}

function parseTipoInmuebleValue(value: string) {
  const [codigo, ...nombreParts] = value.split('::');

  return {
    codigo: codigo || '',
    nombre: nombreParts.join('::') || '',
  };
}

function cloneTerminos(items: TerminoCondicionCotizacion[]) {
  return items.map((item) => ({ ...item }));
}

function normalizeCatalogItem(item: any): CatalogOption | null {
  const nombre =
    item?.nombre ||
    item?.name ||
    item?.clienteNombre ||
    item?.razonSocial ||
    item?.displayName;

  if (!nombre) return null;

  return {
    id: String(item.id || item.codigo || nombre),
    nombre: String(nombre),
    email: item.email || item.correo || item.correoElectronico,
    telefono: item.telefono || item.phone || item.celular,
    direccion: item.direccion || item.address,
  };
}

function extractClientesFromParsedStorage(parsed: any): CatalogOption[] {
  const possibleArrays = [
    parsed,
    parsed?.clientes,
    parsed?.items,
    parsed?.state?.clientes,
    parsed?.state?.items,
    parsed?.data?.clientes,
  ];

  for (const value of possibleArrays) {
    if (Array.isArray(value)) {
      const normalized = value
        .map((item) => normalizeCatalogItem(item))
        .filter(Boolean) as CatalogOption[];

      if (normalized.length > 0) return normalized;
    }
  }

  return [];
}

function readClientes(): CatalogOption[] {
  if (typeof window === 'undefined') return [];

  const encontrados: CatalogOption[] = [];
  const keys = Object.keys(window.localStorage);

  const pushUnique = (items: CatalogOption[]) => {
    for (const item of items) {
      const exists = encontrados.some(
        (actual) =>
          actual.id === item.id ||
          actual.nombre.trim().toLowerCase() === item.nombre.trim().toLowerCase()
      );

      if (!exists) encontrados.push(item);
    }
  };

  for (const key of keys) {
    if (!/cliente|clientes|avaluo|inmoval|store|storage/i.test(key)) continue;

    const raw = window.localStorage.getItem(key);
    if (!raw) continue;

    try {
      pushUnique(extractClientesFromParsedStorage(JSON.parse(raw)));
    } catch {
      // Ignorar storage inválido
    }
  }

  return encontrados.sort((a, b) => a.nombre.localeCompare(b.nombre));
}


const PDF_CONFIG_STORAGE_KEY_INMOVAL = 'inmoval_cotizaciones_pdf_config_v1';

type CotizacionPDFConfigINMOVAL = {
  nombreEmpresa: string;
  subtituloEmpresa: string;
  tituloDocumento: string;
  subtituloDocumento: string;
  mostrarTituloEmpresa: boolean;
  mostrarSubtituloEmpresa: boolean;
  mostrarFechaCotizacion: boolean;
  mostrarFechaValidez: boolean;
  mostrarHoraExportacion: boolean;
  mostrarNumeroCotizacion: boolean;
  responsableNombre: string;
  responsableCargo: string;
  mostrarResponsable: boolean;
  mostrarFirma: boolean;
  mostrarDatosPago: boolean;
  banco: string;
  numeroCuenta: string;
  titularCuenta: string;
  notaFiscal: string;
  textoCierre: string;
  terminosItems: TerminoCondicionCotizacion[];
};

function defaultCotizacionPDFConfigINMOVAL(): CotizacionPDFConfigINMOVAL {
  return {
    nombreEmpresa: 'INMOVAL',
    subtituloEmpresa: 'Ingeniería · Inmuebles · Valoración',
    tituloDocumento: 'hola.',
    subtituloDocumento: 'ESTA ES SU COTIZACIÓN',
    mostrarTituloEmpresa: true,
    mostrarSubtituloEmpresa: true,
    mostrarFechaCotizacion: true,
    mostrarFechaValidez: true,
    mostrarHoraExportacion: false,
    mostrarNumeroCotizacion: true,
    responsableNombre: 'Responsable INMOVAL',
    responsableCargo: 'Firma autorizada',
    mostrarResponsable: true,
    mostrarFirma: true,
    mostrarDatosPago: true,
    banco: '',
    numeroCuenta: '',
    titularCuenta: '',
    notaFiscal: 'Esta cotización no constituye factura ni comprobante fiscal.',
    textoCierre: 'GRACIAS POR SU CONFIANZA',
    terminosItems: cloneTerminos(TERMINOS_BASE),
  };
}

function readCotizacionPDFConfigINMOVAL(): CotizacionPDFConfigINMOVAL {
  if (typeof window === 'undefined') return defaultCotizacionPDFConfigINMOVAL();

  try {
    const raw = window.localStorage.getItem(PDF_CONFIG_STORAGE_KEY_INMOVAL);
    if (!raw) return defaultCotizacionPDFConfigINMOVAL();

    const parsed = JSON.parse(raw);
    const base = defaultCotizacionPDFConfigINMOVAL();

    return {
      ...base,
      ...parsed,
      terminosItems:
        Array.isArray(parsed.terminosItems) && parsed.terminosItems.length > 0
          ? parsed.terminosItems
          : base.terminosItems,
    };
  } catch {
    return defaultCotizacionPDFConfigINMOVAL();
  }
}

function getTerminosBaseCotizacionConfigurados() {
  return readCotizacionPDFConfigINMOVAL().terminosItems;
}

function revisarValorParaExpediente(
  value: any,
  matcher: (value: any) => boolean
): string | undefined {
  if (!value) return undefined;

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = revisarValorParaExpediente(item, matcher);
      if (found) return found;
    }

    return undefined;
  }

  if (typeof value !== 'object') return undefined;

  if (matcher(value) && value.id) {
    return String(value.id);
  }

  for (const child of Object.values(value)) {
    const found = revisarValorParaExpediente(child, matcher);
    if (found) return found;
  }

  return undefined;
}

function leerExpedientesIndiceCotizacionINMOVAL() {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(EXPEDIENTES_INDICE_STORAGE_KEY_INMOVAL);
    const parsed = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function buscarExpedienteIdDeCotizacion(cotizacion: CotizacionINMOVALLocal) {
  const numero = String(cotizacion.numero || '');
  const cotizacionId = String(cotizacion.id || '');

  const expediente = leerExpedientesIndiceCotizacionINMOVAL().find((value: any) => {
    const texto = [
      value.cotizacionId,
      value.cotizacionOrigenId,
      value.cotizacionNumero,
      value.numeroCotizacion,
    ]
      .filter(Boolean)
      .join(' ');

    return Boolean(
      (cotizacionId && texto.includes(cotizacionId)) ||
        (numero && texto.includes(numero))
    );
  });

  return expediente?.id ? String(expediente.id) : undefined;
}

function existeExpedienteINMOVAL(expedienteId?: string) {
  if (!expedienteId) return false;

  return leerExpedientesIndiceCotizacionINMOVAL().some(
    (value: any) => String(value?.id || '') === String(expedienteId)
  );
}

function getCotizaciones() {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];

    if (!Array.isArray(parsed)) return [];

    let changed = false;

    const normalizadas = parsed.map((cotizacion: CotizacionINMOVALLocal) => {
      const estado = cotizacion.estado;

      if (
        estado === 'aprobada' ||
        estado === 'convertida' ||
        estado === 'avaluo_en_proceso'
      ) {
        const expedienteId =
          cotizacion.expedienteId || buscarExpedienteIdDeCotizacion(cotizacion);

        const expedienteExiste = expedienteId
          ? existeExpedienteINMOVAL(expedienteId)
          : false;

        if (expedienteExiste) {
          const debeActualizar =
            cotizacion.expedienteId !== expedienteId ||
            estado !== 'avaluo_en_proceso';

          if (debeActualizar) changed = true;

          return {
            ...cotizacion,
            expedienteId,
            estado: 'avaluo_en_proceso' as EstadoCotizacionINMOVAL,
            actualizadoEn: new Date().toISOString(),
          };
        }

        if (estado === 'avaluo_en_proceso' || estado === 'convertida') {
          changed = true;

          const { expedienteId: _expedienteId, ...sinExpediente } = cotizacion;

          return {
            ...sinExpediente,
            estado: 'aprobada' as EstadoCotizacionINMOVAL,
            actualizadoEn: new Date().toISOString(),
          };
        }
      }

      return cotizacion;
    });

    if (changed) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizadas));
    }

    return normalizadas;
  } catch {
    return [];
  }
}

function saveCotizaciones(cotizaciones: CotizacionINMOVALLocal[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cotizaciones));
}

function formatMoney(value: number, moneda: MonedaCotizacionINMOVAL) {
  return (
    moneda +
    ' ' +
    Number(value || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

function estadoLabel(estado: EstadoCotizacionINMOVAL) {
  const labels: Record<string, string> = {
    borrador: 'Borrador',
    enviada: 'Enviada',
    aprobada: 'Aprobada',
    rechazada: 'Rechazada',
    avaluo_en_proceso: 'Avalúo en proceso',
    avaluo_finalizado: 'Avalúo finalizado',
    factura_emitida: 'Factura emitida',
    convertida: 'Avalúo en proceso',
  };

  return labels[estado] || String(estado || 'Sin estado').replace(/_/g, ' ');
}

function estadoClass(estado: EstadoCotizacionINMOVAL) {
  if (estado === 'aprobada') {
    return 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100';
  }

  if (estado === 'avaluo_en_proceso' || estado === 'convertida') {
    return 'border-sky-400/30 bg-sky-400/10 text-sky-100';
  }

  if (estado === 'avaluo_finalizado') {
    return 'border-violet-400/30 bg-violet-400/10 text-violet-100';
  }

  if (estado === 'factura_emitida') {
    return 'border-cyan-400/30 bg-cyan-400/10 text-cyan-100';
  }

  if (estado === 'enviada') {
    return 'border-amber-400/30 bg-amber-400/10 text-amber-100';
  }

  if (estado === 'rechazada') {
    return 'border-rose-400/30 bg-rose-400/10 text-rose-100';
  }

  return 'border-slate-500/40 bg-slate-500/10 text-slate-100';
}


function escapeHtmlCotizacionPDF(value: unknown) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatDateCotizacionPDF(value: string) {
  if (!value) return '—';

  const date = new Date(value + 'T00:00:00');

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString('es-NI', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  });
}


function buildCotizacionPDFHtml(cotizacion: CotizacionINMOVALLocal) {
  const config = readCotizacionPDFConfigINMOVAL();
  const exportadoEn = new Date();

  const terminosFuente =
    cotizacion.terminosItems && cotizacion.terminosItems.length > 0
      ? cotizacion.terminosItems
      : config.terminosItems;

  const terminos = terminosFuente
    .filter((item) => item.incluido)
    .map(
      (item, index) => `
        <div class="term">
          <h3>${index + 1}. ${escapeHtmlCotizacionPDF(item.titulo)}</h3>
          <p>${escapeHtmlCotizacionPDF(item.texto).replace(/\\n/g, '<br />')}</p>
        </div>
      `
    )
    .join('');

  const subtotal = Number(cotizacion.costoServicio || 0);

  const gastosItemsRaw = Array.isArray((cotizacion as any).otrosGastosItems)
    ? (cotizacion as any).otrosGastosItems
    : [];

  const gastosItems =
    gastosItemsRaw.length > 0
      ? gastosItemsRaw
          .map((item: any) => ({
            id: String(item.id || createId()),
            concepto: String(item.concepto || 'Otro gasto / servicio'),
            monto: Number(item.monto || 0),
          }))
          .filter((item: GastoCotizacionItem) => item.monto > 0)
      : Number((cotizacion as any).otrosGastos || 0) > 0
        ? [
            {
              id: createId(),
              concepto: 'Otros gastos / servicios',
              monto: Number((cotizacion as any).otrosGastos || 0),
            },
          ]
        : [];

  const otrosGastos = gastosItems.reduce(
    (total: number, item: GastoCotizacionItem) => total + Number(item.monto || 0),
    0
  );

  const aplicaIVA = Boolean((cotizacion as any).aplicaIVA);
  const impuestos = aplicaIVA
    ? Number(((subtotal + otrosGastos) * 0.15).toFixed(2))
    : 0;

  const subtotalFacturable = subtotal + otrosGastos;
  const totalCotizado = subtotalFacturable + impuestos;

  const monto = formatMoney(subtotal, cotizacion.moneda);
  const montoOtrosGastos = formatMoney(otrosGastos, cotizacion.moneda);
  const montoSubtotalFacturable = formatMoney(subtotalFacturable, cotizacion.moneda);
  const montoImpuestos = formatMoney(impuestos, cotizacion.moneda);
  const montoTotal = formatMoney(totalCotizado, cotizacion.moneda);

  const filasOtrosGastosPDF =
    gastosItems.length > 0
      ? gastosItems
          .map(
            (gasto: GastoCotizacionItem) => `
      <div class="table-row secondary">
        <div>Otro gasto / servicio: ${escapeHtmlCotizacionPDF(gasto.concepto)}</div>
        <div class="right">1</div>
        <div class="right">${escapeHtmlCotizacionPDF(formatMoney(gasto.monto, cotizacion.moneda))}</div>
        <div class="right">${escapeHtmlCotizacionPDF(formatMoney(gasto.monto, cotizacion.moneda))}</div>
      </div>`
          )
          .join('')
      : '';
  const metaRows = [
    config.mostrarNumeroCotizacion
      ? ['COTIZACIÓN No.', cotizacion.numero]
      : null,
    config.mostrarFechaCotizacion
      ? ['FECHA', formatDateCotizacionPDF(cotizacion.fechaCotizacion)]
      : null,
    config.mostrarFechaValidez
      ? ['VALIDEZ', formatDateCotizacionPDF(cotizacion.fechaValidez)]
      : null,
    config.mostrarHoraExportacion
      ? [
          'EXPORTADO',
          exportadoEn.toLocaleString('es-NI', {
            dateStyle: 'medium',
            timeStyle: 'short',
          }),
        ]
      : null,

  ]
    .filter(Boolean)
    .map(
      (row) =>
        `<div class="meta-row"><strong>${escapeHtmlCotizacionPDF((row as string[])[0])}</strong><span>${escapeHtmlCotizacionPDF((row as string[])[1])}</span></div>`
    )
    .join('');

  const datosPago =
    config.mostrarDatosPago && (config.banco || config.numeroCuenta || config.titularCuenta)
      ? `
        <section class="payment">
          <h2>DATOS DE PAGO</h2>
          <p>
            ${config.banco ? '<strong>Banco:</strong> ' + escapeHtmlCotizacionPDF(config.banco) : ''}
            ${config.numeroCuenta ? ' <strong>Cuenta:</strong> ' + escapeHtmlCotizacionPDF(config.numeroCuenta) : ''}
            ${config.titularCuenta ? ' <strong>Titular:</strong> ' + escapeHtmlCotizacionPDF(config.titularCuenta) : ''}
          </p>
        </section>
      `
      : '';

  const firma =
    config.mostrarResponsable || config.mostrarFirma
      ? `
        <div class="signature">
          ${config.mostrarFirma ? '<div class="signature-line"></div>' : ''}
          ${config.mostrarResponsable ? `<strong>${escapeHtmlCotizacionPDF(config.responsableNombre)}</strong>` : ''}
          ${config.mostrarResponsable ? `<span>${escapeHtmlCotizacionPDF(config.responsableCargo)}</span>` : ''}
        </div>
      `
      : '';

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtmlCotizacionPDF(cotizacion.numero)} - Cotización INMOVAL</title>
  <style>
    @page { size: letter; margin: 18mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      color: #111827;
      background: #ffffff;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 12px;
      line-height: 1.45;
    }
    .header {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 36px;
      margin-bottom: 30px;
    }
    .hello {
      font-size: 74px;
      line-height: 0.86;
      font-weight: 900;
      letter-spacing: -0.08em;
    }
    .hello-sub {
      margin-top: 8px;
      font-size: 14px;
      font-weight: 900;
      text-transform: uppercase;
    }
    .company {
      margin-bottom: 12px;
      font-size: 20px;
      font-weight: 900;
      text-transform: uppercase;
    }
    .company-sub {
      margin-top: -6px;
      margin-bottom: 12px;
      color: #475569;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
    }
    .meta-row {
      display: grid;
      grid-template-columns: 120px 1fr;
      gap: 10px;
      padding: 3px 0;
      font-size: 11px;
    }
    .meta-row strong {
      font-weight: 900;
      text-transform: uppercase;
    }
    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 48px;
      margin-bottom: 28px;
    }
    h2 {
      margin: 0 0 9px;
      font-size: 14px;
      font-weight: 900;
      text-transform: uppercase;
    }
    p { margin: 0; }
    .text-block p {
      margin: 2px 0;
    }
    .rule {
      border-top: 2px solid #111827;
      margin: 26px 0 14px;
    }
    .table-header,
    .table-row {
      display: grid;
      grid-template-columns: 1fr 90px 120px 120px;
      gap: 18px;
      align-items: start;
    }
    .table-header {
      font-size: 11px;
      font-weight: 900;
      text-transform: uppercase;
      padding-bottom: 20px;
    }
    .table-row {
      padding-bottom: 24px;
      border-bottom: 1px solid #cbd5e1;
      font-size: 13px;
    }

    .table-row.secondary {
      color: #475569;
      font-size: 11px;
    }
    .right { text-align: right; }
    .middle {
      display: grid;
      grid-template-columns: 1fr 0.95fr;
      gap: 54px;
      margin-top: 22px;
    }
    .notes {
      color: #334155;
    }
    .totals {
      font-size: 13px;
    }
    .total-row {
      display: grid;
      grid-template-columns: 1fr 140px;
      gap: 18px;
      border-bottom: 1px solid #cbd5e1;
      padding: 7px 0;
    }
    .total-row.final {
      border-bottom: none;
      font-size: 15px;
      font-weight: 900;
      padding-top: 10px;
    }
    .terms {
      margin-top: 28px;
      border-top: 2px solid #111827;
      padding-top: 18px;
    }
    .term {
      break-inside: avoid;
      margin-bottom: 12px;
    }
    .term h3 {
      margin: 0 0 4px;
      font-size: 11px;
      font-weight: 900;
      text-transform: uppercase;
    }
    .term p {
      color: #334155;
      text-align: justify;
    }
    .payment {
      margin-top: 20px;
      border-top: 1px solid #111827;
      border-bottom: 1px solid #111827;
      padding: 10px 0;
      font-size: 11px;
    }
    .payment h2 {
      margin-bottom: 5px;
      font-size: 12px;
    }
    .footer {
      margin-top: 34px;
      border-top: 2px solid #111827;
      padding-top: 20px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      align-items: end;
    }
    .footer-note {
      color: #475569;
      font-size: 10px;
    }
    .signature {
      text-align: center;
    }
    .signature-line {
      border-top: 1px solid #111827;
      margin-bottom: 8px;
    }
    .signature span {
      display: block;
      color: #64748b;
      font-size: 11px;
    }
    .thanks {
      margin-top: 10px;
      font-size: 24px;
      line-height: 1.1;
      font-weight: 900;
      text-transform: uppercase;
    }
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="hello">${escapeHtmlCotizacionPDF(config.tituloDocumento)}</div>
      <div class="hello-sub">${escapeHtmlCotizacionPDF(config.subtituloDocumento)}</div>
    </div>
    <div>
      ${config.mostrarTituloEmpresa ? `<div class="company">${escapeHtmlCotizacionPDF(config.nombreEmpresa)}</div>` : ''}
      ${config.mostrarSubtituloEmpresa ? `<div class="company-sub">${escapeHtmlCotizacionPDF(config.subtituloEmpresa)}</div>` : ''}
      ${metaRows}
    </div>
  </div>

  <section class="two-col">
    <div class="text-block">
      <h2>Cliente</h2>
      <p>${escapeHtmlCotizacionPDF(cotizacion.clienteNombre)}</p>
      <p>${escapeHtmlCotizacionPDF(cotizacion.clienteDireccion || '—')}</p>
      <p>${escapeHtmlCotizacionPDF(cotizacion.clienteTelefono || '—')}</p>
      <p>${escapeHtmlCotizacionPDF(cotizacion.clienteEmail || '—')}</p>
    </div>

    <div class="text-block">
      <h2>Inmueble</h2>
      <p>${escapeHtmlCotizacionPDF(cotizacion.tipoInmuebleNombre)}</p>
      <p>${escapeHtmlCotizacionPDF(cotizacion.clasificacionInmuebleNombre)}</p>
      <p>${escapeHtmlCotizacionPDF(cotizacion.propositoAvaluoNombre)}</p>
      <p>${escapeHtmlCotizacionPDF(cotizacion.direccionInmueble)}</p>
    </div>
  </section>

  <div class="rule"></div>

  <section>
    <div class="table-header">
      <div>Descripción</div>
      <div class="right">Cant.</div>
      <div class="right">Precio</div>
      <div class="right">Total</div>
    </div>
    <div class="table-row">
      <div>${escapeHtmlCotizacionPDF(cotizacion.descripcionServicio || 'Avalúo de inmueble')}</div>
      <div class="right">1</div>
      <div class="right">${escapeHtmlCotizacionPDF(monto)}</div>
      <div class="right">${escapeHtmlCotizacionPDF(monto)}</div>
    </div>
    ${filasOtrosGastosPDF}
  </section>

  <section class="middle">
    <div class="notes"></div>

    <div class="totals">
      ${`
      <div class="total-row"><span>Subtotal servicio</span><strong class="right">${escapeHtmlCotizacionPDF(monto)}</strong></div>
      ${otrosGastos > 0 ? `<div class="total-row"><span>Otros gastos</span><strong class="right">${escapeHtmlCotizacionPDF(montoOtrosGastos)}</strong></div>` : ''}
      ${otrosGastos > 0 ? `<div class="total-row"><span>Subtotal</span><strong class="right">${escapeHtmlCotizacionPDF(montoSubtotalFacturable)}</strong></div>` : ''}
      ${aplicaIVA ? `<div class="total-row"><span>IVA (15%)</span><strong class="right">${escapeHtmlCotizacionPDF(montoImpuestos)}</strong></div>` : ''}
      <div class="total-row final"><span>Total</span><strong class="right">${escapeHtmlCotizacionPDF(montoTotal)}</strong></div>
      `}
    </div>
  </section>

  <section class="terms">
    <h2>Términos y condiciones</h2>
    ${terminos || '<p>—</p>'}
  </section>

  ${datosPago}

  <footer class="footer">
    <div>
      <div class="footer-note">${escapeHtmlCotizacionPDF(config.notaFiscal)}</div>
      <div class="thanks">${escapeHtmlCotizacionPDF(config.textoCierre)}</div>
    </div>
    ${firma}
  </footer>

  <script>
    window.onload = function () {
      window.focus();
      window.print();
    };
  </script>
</body>
</html>`;
}


function estadoOperativoCotizacion(
  cotizacion: CotizacionINMOVALLocal
): EstadoCotizacionINMOVAL {
  if (
    cotizacion.estado === 'convertida' ||
    (cotizacion.estado === 'aprobada' && cotizacion.expedienteId)
  ) {
    return 'avaluo_en_proceso';
  }

  return cotizacion.estado;
}

function getMenuFloatingPosition(rect: DOMRect) {
  const menuWidth = 320;
  const menuHeight = 245;
  const margin = 16;
  const gap = 8;

  const preferredTop = rect.bottom + gap;
  const maxTop = window.innerHeight - menuHeight - margin;

  const top = Math.max(
    margin,
    Math.min(preferredTop, maxTop)
  );

  const left = Math.min(
    Math.max(margin, rect.right - menuWidth),
    window.innerWidth - menuWidth - margin
  );

  return { top, left };
}

function MetricCard({
  label,
  value,
  description,
  icon,
}: {
  label: string;
  value: string | number;
  description: string;
  icon: ReactNode;
}) {
  return (
    <article className="rounded-3xl border border-slate-800 bg-slate-900/75 p-5 shadow-xl shadow-black/20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
            {label}
          </p>
          <p className="mt-3 text-3xl font-bold text-slate-50">{value}</p>
          <p className="mt-3 text-sm text-slate-400">{description}</p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/10 text-sky-300">
          {icon}
        </div>
      </div>
    </article>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
      {children}
    </span>
  );
}

export default function CotizacionesINMOVALPage() {
  const navigate = useNavigate();

  const clientes = useMemo(() => readClientes(), []);

  const [refreshKey, setRefreshKey] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<EstadoCotizacionINMOVAL | 'todos'>('todos');
  const [menuCotizacionId, setMenuCotizacionId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);

  const cotizaciones = useMemo(() => getCotizaciones(), [refreshKey]);

  const cotizacionesFiltradas = useMemo(() => {
    const query = busqueda.trim().toLowerCase();

    return cotizaciones.filter((cotizacion) => {
      if (cotizacion.cotizacionOrigenId && !cotizacion.historialRevisiones) return false;
      if (filtroEstado !== 'todos' && cotizacion.estado !== filtroEstado) return false;

      if (!query) return true;

      return [
        cotizacion.numero,
        cotizacion.clienteNombre,
        cotizacion.direccionInmueble,
        cotizacion.tipoInmuebleNombre,
        cotizacion.propositoAvaluoNombre,
        cotizacion.descripcionServicio,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [cotizaciones, busqueda, filtroEstado]);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [cotizacionEditandoId, setCotizacionEditandoId] = useState<string | null>(null);

  const [clienteModo, setClienteModo] = useState<'base' | 'nuevo'>(
    clientes.length > 0 ? 'base' : 'nuevo'
  );
  const [clienteId, setClienteId] = useState('');
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteEmail, setClienteEmail] = useState('');
  const [clienteTelefono, setClienteTelefono] = useState('');
  const [clienteDireccion, setClienteDireccion] = useState('');

  const [direccionInmueble, setDireccionInmueble] = useState('');
  const [tipoInmuebleValue, setTipoInmuebleValue] = useState('');
  const [clasificacionCodigo, setClasificacionCodigo] = useState('');
  const [propositoCodigo, setPropositoCodigo] = useState('');

  const [descripcionServicio, setDescripcionServicio] = useState('Avalúo de inmueble');
  const [costoServicio, setCostoServicio] = useState('0');
  const [otrosGastosItems, setOtrosGastosItems] = useState<GastoCotizacionItem[]>([]);
  const [gastoConcepto, setGastoConcepto] = useState('');
  const [gastoMonto, setGastoMonto] = useState('');
  const [aplicaIVA, setAplicaIVA] = useState(false);
  const [moneda, setMoneda] = useState<MonedaCotizacionINMOVAL>('US$');
  const [fechaCotizacion, setFechaCotizacion] = useState(todayISO());
  const [fechaValidez, setFechaValidez] = useState(addDaysISO(todayISO(), 15));
  const [vigenciaDias, setVigenciaDias] = useState(15);
  const [terminosItems, setTerminosItems] =
    useState<TerminoCondicionCotizacion[]>(cloneTerminos(getTerminosBaseCotizacionConfigurados()));

  const cotizacionMenuActiva = cotizaciones.find(
    (item) => item.id === menuCotizacionId
  );

  const total = cotizaciones.length;
  const enviadas = cotizaciones.filter((item) => item.estado === 'enviada').length;
  const aprobadas = cotizaciones.filter((item) => item.estado === 'aprobada').length;
  const pendientesExpediente = cotizaciones.filter(
    (item) => item.estado === 'aprobada' && !item.expedienteId
  ).length;
  const montoTotal = cotizaciones.reduce(
    (sum, item) => sum + Number(item.costoServicio || 0),
    0
  );

  const tipoInmueble = parseTipoInmuebleValue(tipoInmuebleValue);
  const clasificacion = CLASIFICACIONES_INMUEBLE.find(
    (item) => item.codigo === clasificacionCodigo
  );
  const proposito = PROPOSITOS_AVALUO.find(
    (item) => item.codigo === propositoCodigo
  );

  const vigenciaPropuestaActiva = terminosItems.some(
    (item) => item.id === 'vigencia-propuesta' && item.incluido
  );

  const fechaValidezAutomatica = vigenciaPropuestaActiva
    ? addDaysISO(fechaCotizacion, vigenciaDias)
    : '';

  function actualizarVigenciaDias(value: string) {
    const dias = Math.max(1, Math.round(Number(value || 1)));

    setVigenciaDias(dias);
    setTerminosItems((items) =>
      items.map((item) =>
        item.id === 'vigencia-propuesta'
          ? {
              ...item,
              texto: buildTextoVigenciaCotizacion(dias),
            }
          : item
      )
    );
  }

  function refrescar() {
    setRefreshKey((value) => value + 1);
  }

  function limpiarFormulario() {
    setMostrarFormulario(false);
    setCotizacionEditandoId(null);
    setClienteModo(clientes.length > 0 ? 'base' : 'nuevo');
    setClienteId('');
    setClienteNombre('');
    setClienteEmail('');
    setClienteTelefono('');
    setClienteDireccion('');
    setDireccionInmueble('');
    setTipoInmuebleValue('');
    setClasificacionCodigo('');
    setPropositoCodigo('');
    setDescripcionServicio('Avalúo de inmueble');
    setCostoServicio('0');
    setOtrosGastosItems([]);
    setGastoConcepto('');
    setGastoMonto('');
    setAplicaIVA(false);
    setMoneda('US$');
    setFechaCotizacion(todayISO());
    setVigenciaDias(15);
    setFechaValidez(addDaysISO(todayISO(), 15));
    setTerminosItems(cloneTerminos(getTerminosBaseCotizacionConfigurados()));
  }

  function handleClienteBaseChange(id: string) {
    setClienteId(id);

    const cliente = clientes.find((item) => item.id === id);

    if (!cliente) return;

    setClienteNombre(cliente.nombre);
    setClienteEmail(cliente.email || '');
    setClienteTelefono(cliente.telefono || '');
    setClienteDireccion(cliente.direccion || '');
  }

  function handleTipoInmuebleChange(value: string) {
    setTipoInmuebleValue(value);

    const parsed = parseTipoInmuebleValue(value);
    setClasificacionCodigo(parsed.codigo);
  }

  function actualizarTerminoCotizacion(
    id: string,
    patch: Partial<TerminoCondicionCotizacion>
  ) {
    setTerminosItems((items) =>
      items.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  }

  function buildTerminosSeleccionados() {
    return terminosItems
      .filter((item) => item.incluido)
      .map((item, index) => String(index + 1) + '. ' + item.titulo + '\n' + item.texto.trim())
      .join('\n\n');
  }


  function normalizarGastosCotizacion(items: GastoCotizacionItem[]) {
    return items
      .map((item) => ({
        id: item.id || createId(),
        concepto: String(item.concepto || '').trim() || 'Otro gasto / servicio',
        monto: Number(item.monto || 0),
      }))
      .filter((item) => Number.isFinite(item.monto) && item.monto > 0);
  }

  function sumarOtrosGastosCotizacion(items: GastoCotizacionItem[]) {
    return normalizarGastosCotizacion(items).reduce(
      (total, item) => total + Number(item.monto || 0),
      0
    );
  }

  function calcularIVACotizacionLocal(costo: number, gastos: number, aplicar: boolean) {
    if (!aplicar) return 0;

    return Number(((Number(costo || 0) + Number(gastos || 0)) * 0.15).toFixed(2));
  }

  function agregarOtroGastoCotizacion() {
    const concepto = gastoConcepto.trim();
    const monto = Number(gastoMonto || 0);

    if (!concepto) {
      window.alert('Ingresá el concepto del gasto.');
      return;
    }

    if (!Number.isFinite(monto) || monto <= 0) {
      window.alert('Ingresá un monto válido para el gasto.');
      return;
    }

    setOtrosGastosItems((items) => [
      ...items,
      {
        id: createId(),
        concepto,
        monto,
      },
    ]);

    setGastoConcepto('');
    setGastoMonto('');
  }

  function quitarOtroGastoCotizacion(id: string) {
    setOtrosGastosItems((items) => items.filter((item) => item.id !== id));
  }

  function guardarCotizacion() {
    const costo = Number(costoServicio || 0);

    if (!clienteNombre.trim()) {
      window.alert('Seleccioná o creá un cliente.');
      return;
    }

    if (!direccionInmueble.trim()) {
      window.alert('Ingresá la dirección del inmueble a valuar.');
      return;
    }

    if (!tipoInmueble.codigo || !tipoInmueble.nombre) {
      window.alert('Seleccioná el tipo de inmueble.');
      return;
    }

    if (!clasificacionCodigo || !clasificacion) {
      window.alert('Seleccioná la clasificación del inmueble.');
      return;
    }

    if (!propositoCodigo || !proposito) {
      window.alert('Seleccioná el propósito del avalúo.');
      return;
    }

    if (!Number.isFinite(costo) || costo < 0) {
      window.alert('Ingresá un costo válido.');
      return;
    }

    const gastoPendienteMonto = Number(gastoMonto || 0);
    const gastoPendiente =
      gastoConcepto.trim() && Number.isFinite(gastoPendienteMonto) && gastoPendienteMonto > 0
        ? [
            {
              id: createId(),
              concepto: gastoConcepto.trim(),
              monto: gastoPendienteMonto,
            },
          ]
        : [];

    const gastosValidados = normalizarGastosCotizacion([
      ...otrosGastosItems,
      ...gastoPendiente,
    ]);

    const gastos = sumarOtrosGastosCotizacion(gastosValidados);
    const impuesto = calcularIVACotizacionLocal(costo, gastos, aplicaIVA);
    const ahora = nowISO();

    const cotizacionEditando = cotizaciones.find(
      (item) => item.id === cotizacionEditandoId
    );

    if (cotizacionEditando) {
      const actualizada: CotizacionINMOVALLocal = {
        ...cotizacionEditando,
        clienteId: clienteId || undefined,
        clienteNombre: clienteNombre.trim(),
        clienteEmail: clienteEmail.trim() || undefined,
        clienteTelefono: clienteTelefono.trim() || undefined,
        clienteDireccion: clienteDireccion.trim() || undefined,
        direccionInmueble: direccionInmueble.trim(),
        tipoInmuebleCodigo: tipoInmueble.codigo,
        tipoInmuebleNombre: tipoInmueble.nombre,
        clasificacionInmuebleCodigo: clasificacion.codigo,
        clasificacionInmuebleNombre: clasificacion.nombre,
        propositoAvaluoCodigo: proposito.codigo,
        propositoAvaluoNombre: proposito.nombre,
        descripcionServicio: descripcionServicio.trim() || 'Avalúo de inmueble',
        costoServicio: costo,
        otrosGastos: gastos,
        otrosGastosItems: gastosValidados,
        aplicaIVA,
        ivaPorcentaje: 15,
        impuestos: impuesto,
        moneda,
        terminosCondiciones: buildTerminosSeleccionados(),
        terminosItems: cloneTerminos(terminosItems),
        fechaCotizacion,
        fechaValidez: fechaValidezAutomatica,
        actualizadoEn: ahora,
      };

      saveCotizaciones(
        cotizaciones.map((item) => (item.id === actualizada.id ? actualizada : item))
      );
    } else {
      const nueva: CotizacionINMOVALLocal = {
        id: createId(),
        numero: buildNumeroCotizacion(),
        estado: 'borrador',
        clienteId: clienteId || undefined,
        clienteNombre: clienteNombre.trim(),
        clienteEmail: clienteEmail.trim() || undefined,
        clienteTelefono: clienteTelefono.trim() || undefined,
        clienteDireccion: clienteDireccion.trim() || undefined,
        direccionInmueble: direccionInmueble.trim(),
        tipoInmuebleCodigo: tipoInmueble.codigo,
        tipoInmuebleNombre: tipoInmueble.nombre,
        clasificacionInmuebleCodigo: clasificacion.codigo,
        clasificacionInmuebleNombre: clasificacion.nombre,
        propositoAvaluoCodigo: proposito.codigo,
        propositoAvaluoNombre: proposito.nombre,
        descripcionServicio: descripcionServicio.trim() || 'Avalúo de inmueble',
        costoServicio: costo,
        otrosGastos: gastos,
        otrosGastosItems: gastosValidados,
        aplicaIVA,
        ivaPorcentaje: 15,
        impuestos: impuesto,
        moneda,
        terminosCondiciones: buildTerminosSeleccionados(),
        terminosItems: cloneTerminos(terminosItems),
        fechaCotizacion,
        fechaValidez: fechaValidezAutomatica,
        creadoEn: ahora,
        actualizadoEn: ahora,
      };

      saveCotizaciones([nueva, ...cotizaciones]);
    }

    limpiarFormulario();
    refrescar();
  }

  function actualizarCotizacion(
    cotizacion: CotizacionINMOVALLocal,
    patch: Partial<CotizacionINMOVALLocal>
  ) {
    saveCotizaciones(
      cotizaciones.map((item) =>
        item.id === cotizacion.id
          ? {
              ...item,
              ...patch,
              actualizadoEn: nowISO(),
            }
          : item
      )
    );

    refrescar();
  }

  function cargarCotizacionParaEditar(cotizacion: CotizacionINMOVALLocal) {
    setCotizacionEditandoId(cotizacion.id);
    setMostrarFormulario(true);

    setClienteModo(cotizacion.clienteId ? 'base' : 'nuevo');
    setClienteId(cotizacion.clienteId || '');
    setClienteNombre(cotizacion.clienteNombre || '');
    setClienteEmail(cotizacion.clienteEmail || '');
    setClienteTelefono(cotizacion.clienteTelefono || '');
    setClienteDireccion(cotizacion.clienteDireccion || '');

    setDireccionInmueble(cotizacion.direccionInmueble || '');
    setTipoInmuebleValue(
      cotizacion.tipoInmuebleCodigo && cotizacion.tipoInmuebleNombre
        ? cotizacion.tipoInmuebleCodigo + '::' + cotizacion.tipoInmuebleNombre
        : ''
    );
    setClasificacionCodigo(cotizacion.clasificacionInmuebleCodigo || '');
    setPropositoCodigo(cotizacion.propositoAvaluoCodigo || '');

    setDescripcionServicio(cotizacion.descripcionServicio || 'Avalúo de inmueble');
    setCostoServicio(String(cotizacion.costoServicio || 0));

    const gastosGuardados = Array.isArray((cotizacion as any).otrosGastosItems)
      ? (cotizacion as any).otrosGastosItems
      : [];

    const gastosLegacy =
      gastosGuardados.length === 0 && Number((cotizacion as any).otrosGastos || 0) > 0
        ? [
            {
              id: createId(),
              concepto: 'Otros gastos / servicios',
              monto: Number((cotizacion as any).otrosGastos || 0),
            },
          ]
        : [];

    setOtrosGastosItems(normalizarGastosCotizacion([...gastosGuardados, ...gastosLegacy]));
    setGastoConcepto('');
    setGastoMonto('');
    setAplicaIVA(Boolean((cotizacion as any).aplicaIVA || Number((cotizacion as any).impuestos || 0) > 0));
    setMoneda(cotizacion.moneda || 'US$');
    const fechaCotizacionEdit = cotizacion.fechaCotizacion || todayISO();
    const terminosEdit = cloneTerminos(cotizacion.terminosItems || getTerminosBaseCotizacionConfigurados());
    const diasEdit =
      extraerDiasVigenciaCotizacion(terminosEdit) ||
      diffDaysISOCotizacion(
        fechaCotizacionEdit,
        cotizacion.fechaValidez || addDaysISO(fechaCotizacionEdit, 15)
      );

    setFechaCotizacion(fechaCotizacionEdit);
    setVigenciaDias(diasEdit);
    setFechaValidez(cotizacion.fechaValidez || addDaysISO(fechaCotizacionEdit, diasEdit));
    setTerminosItems(terminosEdit);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }


  function exportarCotizacionPDF(cotizacion: CotizacionINMOVALLocal) {
    const html = buildCotizacionPDFHtml(cotizacion);
    const popup = window.open('', '_blank', 'width=980,height=720');

    if (!popup) {
      window.alert('El navegador bloqueó la ventana de exportación. Permití ventanas emergentes para INMOVAL e intentá nuevamente.');
      return;
    }

    popup.document.open();
    popup.document.write(html);
    popup.document.close();
  }

  function crearRevisionCotizacion(cotizacion: CotizacionINMOVALLocal) {
    const confirmar = window.confirm(
      'Se creará una nueva revisión sobre esta misma cotización. La versión actual quedará guardada en el historial. ¿Continuar?'
    );

    if (!confirmar) return;

    const ahora = nowISO();

    const baseNumero =
      cotizacion.cotizacionOrigenNumero ||
      cotizacion.numero.replace(/-R\d+$/i, '');

    const siguienteRevision = Number(cotizacion.revisionNumero || 0) + 1;

    const versionAnterior: CotizacionRevisionHistorial = {
      id: createId(),
      numero: cotizacion.numero,
      estado: cotizacion.estado,
      clienteNombre: cotizacion.clienteNombre,
      direccionInmueble: cotizacion.direccionInmueble,
      tipoInmuebleNombre: cotizacion.tipoInmuebleNombre,
      costoServicio: cotizacion.costoServicio,
      moneda: cotizacion.moneda,
      terminosCondiciones: cotizacion.terminosCondiciones,
      terminosItems: cotizacion.terminosItems
        ? cloneTerminos(cotizacion.terminosItems)
        : undefined,
      creadoEn: cotizacion.creadoEn,
      guardadoEn: ahora,
    };

    const actualizada: CotizacionINMOVALLocal = {
      ...cotizacion,
      numero: baseNumero + '-R' + siguienteRevision,
      estado: 'borrador',
      expedienteId: undefined,
      revisionNumero: siguienteRevision,
      cotizacionOrigenId: cotizacion.cotizacionOrigenId || cotizacion.id,
      cotizacionOrigenNumero: baseNumero,
      historialRevisiones: [
        ...(cotizacion.historialRevisiones || []),
        versionAnterior,
      ],
      actualizadoEn: ahora,
    };

    saveCotizaciones(
      cotizaciones.map((item) =>
        item.id === cotizacion.id ? actualizada : item
      )
    );

    refrescar();
  }

  function eliminarCotizacion(cotizacion: CotizacionINMOVALLocal) {
    const confirmar = window.confirm('¿Eliminar la cotización ' + cotizacion.numero + '?');

    if (!confirmar) return;

    saveCotizaciones(cotizaciones.filter((item) => item.id !== cotizacion.id));
    refrescar();
  }

  function convertirEnExpediente(cotizacion: CotizacionINMOVALLocal) {
    if (cotizacion.estado !== 'aprobada') {
      const confirmar = window.confirm(
        'Esta cotización todavía no está aprobada. ¿Querés aprobarla y continuar con el expediente?'
      );

      if (!confirmar) return;

      actualizarCotizacion(cotizacion, { estado: 'aprobada' });
    }

    navigate('/expedientes-plataforma/nuevo?cotizacionId=' + cotizacion.id);
  }

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/30">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-300">
                INMOVAL
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-50">
                Cotizaciones
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                Gestión de propuestas, aprobación comercial y apertura posterior de expediente.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  if (!mostrarFormulario) limpiarFormulario();
                  setMostrarFormulario((value) => !value);
                }}
                className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:bg-emerald-400/20"
              >
                <Plus className="h-4 w-4" />
                Nueva cotización
              </button>

              <button
                type="button"
                onClick={() => navigate('/cotizaciones/configuracion')}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-700 bg-slate-950/50 text-slate-200 transition hover:bg-slate-800"
                title="Configuración"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard label="Total" value={total} description="Cotizaciones registradas" icon={<Archive className="h-5 w-5" />} />
          <MetricCard label="Enviadas" value={enviadas} description="Pendientes de respuesta" icon={<Send className="h-5 w-5" />} />
          <MetricCard label="Aprobadas" value={aprobadas} description="Listas para expediente" icon={<CheckCircle2 className="h-5 w-5" />} />
          <MetricCard label="Pendientes" value={pendientesExpediente} description="Aprobadas sin expediente" icon={<ClipboardList className="h-5 w-5" />} />
          <MetricCard label="Monto" value={formatMoney(montoTotal, 'US$')} description="Monto cotizado" icon={<DollarSign className="h-5 w-5" />} />
        </section>

        {mostrarFormulario ? (
          <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/75 p-6 shadow-xl shadow-black/20">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                  {cotizacionEditandoId ? 'Editar cotización' : 'Nueva cotización'}
                </p>
                <h2 className="mt-1 text-lg font-semibold text-slate-100">
                  {cotizacionEditandoId ? 'Actualizar datos de propuesta' : 'Datos de propuesta'}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setMostrarFormulario(false)}
                className="rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-6 grid gap-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2">
                  <FieldLabel>Cliente</FieldLabel>
                  <select
                    value={clienteModo === 'nuevo' ? '__nuevo__' : clienteId}
                    onChange={(event) => {
                      if (event.target.value === '__nuevo__') {
                        setClienteModo('nuevo');
                        setClienteId('');
                        setClienteNombre('');
                        setClienteEmail('');
                        setClienteTelefono('');
                        setClienteDireccion('');
                        return;
                      }

                      setClienteModo('base');
                      handleClienteBaseChange(event.target.value);
                    }}
                    className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                  >
                    <option value="">Seleccionar cliente</option>
                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nombre}
                      </option>
                    ))}
                    <option value="__nuevo__">+ Crear cliente nuevo</option>
                  </select>
                </label>

                <label className="grid gap-2">
                  <FieldLabel>Nombre del cliente</FieldLabel>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      value={clienteNombre}
                      onChange={(event) => setClienteNombre(event.target.value)}
                      placeholder="Nombre o razón social"
                      className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950/70 pl-10 pr-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                    />
                  </div>
                </label>

                <label className="grid gap-2">
                  <FieldLabel>Correo del cliente</FieldLabel>
                  <input
                    value={clienteEmail}
                    onChange={(event) => setClienteEmail(event.target.value)}
                    placeholder="correo@dominio.com"
                    className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                  />
                </label>

                <label className="grid gap-2">
                  <FieldLabel>Teléfono del cliente</FieldLabel>
                  <input
                    value={clienteTelefono}
                    onChange={(event) => setClienteTelefono(event.target.value)}
                    placeholder="Teléfono"
                    className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 md:col-span-2">
                  <FieldLabel>Dirección del inmueble a valuar</FieldLabel>
                  <input
                    value={direccionInmueble}
                    onChange={(event) => setDireccionInmueble(event.target.value)}
                    placeholder="Ubicación o dirección del inmueble"
                    className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                  />
                </label>

                <label className="grid gap-2">
                  <FieldLabel>Tipo de inmueble</FieldLabel>
                  <select
                    value={tipoInmuebleValue}
                    onChange={(event) => handleTipoInmuebleChange(event.target.value)}
                    className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                  >
                    <option value="">Seleccionar tipo</option>
                    {TIPOS_INMUEBLE.map((item) => (
                      <option key={item.codigo + '-' + item.nombre} value={item.codigo + '::' + item.nombre}>
                        {item.nombre} - {item.codigo}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2">
                  <FieldLabel>Clasificación</FieldLabel>
                  <select
                    value={clasificacionCodigo}
                    onChange={(event) => setClasificacionCodigo(event.target.value)}
                    className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                  >
                    <option value="">Seleccionar clasificación</option>
                    {CLASIFICACIONES_INMUEBLE.map((item) => (
                      <option key={item.codigo} value={item.codigo}>
                        {item.nombre} - {item.codigo}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2">
                  <FieldLabel>Propósito del avalúo</FieldLabel>
                  <select
                    value={propositoCodigo}
                    onChange={(event) => setPropositoCodigo(event.target.value)}
                    className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                  >
                    <option value="">Seleccionar propósito</option>
                    {PROPOSITOS_AVALUO.map((item) => (
                      <option key={item.codigo} value={item.codigo}>
                        {item.nombre} - {item.codigo}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2">
                  <FieldLabel>Descripción del servicio</FieldLabel>
                  <input
                    value={descripcionServicio}
                    onChange={(event) => setDescripcionServicio(event.target.value)}
                    placeholder="Avalúo de inmueble"
                    className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <label className="grid gap-2">
                  <FieldLabel>Costo</FieldLabel>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={costoServicio}
                    onChange={(event) => setCostoServicio(event.target.value)}
                    className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                  />
                </label>

                  <div className="grid gap-3 md:col-span-2 rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                    <div className="flex flex-col gap-1">
                      <FieldLabel>Otros gastos / servicios</FieldLabel>
                      <p className="text-xs text-slate-500">
                        Detallá cada gasto que deba incluirse en la cotización. Podés presionar Agregar o simplemente guardar la cotización si ya escribiste concepto y monto.
                      </p>
                    </div>

                    <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
                      <input
                        type="text"
                        value={gastoConcepto}
                        onChange={(event) => setGastoConcepto(event.target.value)}
                        className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-sky-400"
                        placeholder="Concepto. Ej. impresión, combustible, viático"
                      />

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={gastoMonto}
                        onChange={(event) => setGastoMonto(event.target.value)}
                        className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-sky-400"
                        placeholder="Monto"
                      />

                      <button
                        type="button"
                        onClick={agregarOtroGastoCotizacion}
                        className="rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 py-3 text-sm font-semibold text-sky-100 transition hover:bg-sky-400/20"
                      >
                        Agregar
                      </button>
                    </div>

                    {otrosGastosItems.length > 0 ? (
                      <div className="grid gap-2">
                        {otrosGastosItems.map((gasto) => (
                          <div
                            key={gasto.id}
                            className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 md:flex-row md:items-center md:justify-between"
                          >
                            <div>
                              <p className="text-sm font-semibold text-slate-100">
                                {gasto.concepto}
                              </p>
                              <p className="text-xs text-slate-500">
                                {formatMoney(gasto.monto, moneda)}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => quitarOtroGastoCotizacion(gasto.id)}
                              className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-xs font-medium text-rose-100 transition hover:bg-rose-400/20"
                            >
                              Quitar
                            </button>
                          </div>
                        ))}

                        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-200">
                          Total otros gastos: <strong>{formatMoney(sumarOtrosGastosCotizacion(otrosGastosItems), moneda)}</strong>
                        </div>
                      </div>
                    ) : (
                      <p className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-500">
                        No hay otros gastos agregados.
                      </p>
                    )}
                  </div>

                  <label className="md:col-span-2 flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={aplicaIVA}
                      onChange={(event) => setAplicaIVA(event.target.checked)}
                      className="mt-1"
                    />
                    <span>
                      <strong className="block text-slate-100">Aplicar IVA (15%)</strong>
                      <span className="text-slate-500">
                        El IVA se calcula automáticamente sobre costo del servicio + otros gastos.
                      </span>
                    </span>
                  </label>

                <label className="grid gap-2">
                  <FieldLabel>Moneda</FieldLabel>
                  <select
                    value={moneda}
                    onChange={(event) =>
                      setMoneda(event.target.value as MonedaCotizacionINMOVAL)
                    }
                    className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                  >
                    <option value="US$">US$</option>
                    <option value="C$">C$</option>
                  </select>
                </label>

                <label className="grid gap-2">
                  <FieldLabel>Fecha cotización</FieldLabel>
                  <input
                    type="date"
                    value={fechaCotizacion}
                    onChange={(event) => setFechaCotizacion(event.target.value)}
                    className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                  />
                </label>

                <label className="grid gap-2">
                  <FieldLabel>Validez</FieldLabel>
                  <input
                    type="date"
                    value={fechaValidezAutomatica}
                    disabled
                    onChange={() => undefined}
                    className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                  />
                </label>
              </div>

              <div className="grid gap-3">
                <div>
                  <FieldLabel>Términos y condiciones</FieldLabel>
                  <p className="mt-2 text-xs text-slate-500">
                    Marcá los puntos que deben aparecer en la cotización. Cada punto puede editarse.
                  </p>
                </div>

                <div className="grid gap-3">
                  {terminosItems.map((termino, index) => (
                    <div
                      key={termino.id}
                      className={
                        'rounded-2xl border p-4 transition ' +
                        (termino.incluido
                          ? 'border-emerald-400/30 bg-emerald-400/5'
                          : 'border-slate-800 bg-slate-950/40 opacity-70')
                      }
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={termino.incluido}
                          onChange={(event) =>
                            actualizarTerminoCotizacion(termino.id, {
                              incluido: event.target.checked,
                            })
                          }
                          className="mt-3 h-4 w-4 rounded border-slate-600 bg-slate-950 accent-emerald-400"
                        />

                        <div className="grid flex-1 gap-3">
                          <div className="flex items-center gap-2">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-950/60 text-xs font-semibold text-slate-400">
                              {index + 1}
                            </span>

                            <input
                              value={termino.titulo}
                              onChange={(event) =>
                                actualizarTerminoCotizacion(termino.id, {
                                  titulo: event.target.value,
                                })
                              }
                              className="h-10 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm font-semibold uppercase tracking-[0.08em] text-slate-100 outline-none transition focus:border-emerald-400"
                              placeholder={'Título del punto ' + String(index + 1)}
                            />
                          </div>

                          {termino.id === 'vigencia-propuesta' ? (
                            <div className="grid gap-2 rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                              <div className="grid gap-3 md:grid-cols-[220px_1fr] md:items-center">
                                <label className="grid gap-1">
                                  <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                                    Días de validez de la propuesta
                                  </span>
                                  <input
                                    type="number"
                                    min={1}
                                    value={vigenciaDias}
                                    disabled={!termino.incluido}
                                    onChange={(event) =>
                                      actualizarVigenciaDias(event.target.value)
                                    }
                                    className="h-10 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition disabled:cursor-not-allowed disabled:opacity-50 focus:border-emerald-400"
                                  />
                                </label>

                                <div className="text-xs leading-5 text-slate-400">
                                  {termino.incluido ? (
                                    <>
                                      La fecha de validez se calcula automáticamente desde la fecha de cotización.
                                      <span className="mt-1 block font-medium text-slate-200">
                                        Validez calculada: {fechaValidezAutomatica || '—'}
                                      </span>
                                    </>
                                  ) : (
                                    'Este punto está desmarcado; la cotización no tendrá fecha de validez.'
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : null}

                          <textarea
                            value={termino.texto}
                            onChange={(event) =>
                              actualizarTerminoCotizacion(termino.id, {
                                texto: event.target.value,
                              })
                            }
                            rows={4}
                            className="rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-3 text-sm leading-6 text-slate-100 outline-none transition focus:border-emerald-400"
                            placeholder="Texto del término o condición..."
                          />

                          <p className="text-xs text-slate-500">
                            {termino.incluido
                              ? 'Este punto aparecerá en la cotización.'
                              : 'Este punto no aparecerá en la cotización.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={guardarCotizacion}
                  className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:bg-emerald-400/20"
                >
                  <FilePlus2 className="h-4 w-4" />
                  {cotizacionEditandoId ? 'Actualizar cotización' : 'Guardar cotización'}
                </button>

                <button
                  type="button"
                  onClick={limpiarFormulario}
                  className="rounded-2xl border border-slate-700 bg-slate-950/50 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
                >
                  Limpiar
                </button>
              </div>
            </div>
          </section>
        ) : null}

        <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/75 p-5 shadow-xl shadow-black/20">
          <div className="grid gap-3 lg:grid-cols-[1fr_200px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                placeholder="Buscar por cotización, cliente, inmueble o propósito..."
                className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950/70 pl-11 pr-3 text-sm text-slate-100 outline-none transition focus:border-sky-400"
              />
            </div>

            <select
              value={filtroEstado}
              onChange={(event) =>
                setFiltroEstado(event.target.value as EstadoCotizacionINMOVAL | 'todos')
              }
              className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-sky-400"
            >
              <option value="todos">Todos los estados</option>
              <option value="borrador">Borrador</option>
              <option value="enviada">Enviada</option>
              <option value="aprobada">Aprobada</option>
              <option value="rechazada">Rechazada</option>
              <option value="convertida">Convertida</option>
            </select>
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/75 shadow-xl shadow-black/20">
          {cotizacionesFiltradas.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-lg font-semibold text-slate-100">
                No hay cotizaciones registradas
              </p>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400">
                Creá una cotización para iniciar el flujo comercial antes del expediente.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="px-5 py-4 font-medium">Cotización</th>
                    <th className="px-5 py-4 font-medium">Cliente</th>
                    <th className="px-5 py-4 font-medium">Inmueble</th>
                    <th className="px-5 py-4 font-medium">Monto</th>
                    <th className="px-5 py-4 font-medium">Estado</th>
                    <th className="px-5 py-4 font-medium">Validez</th>
                    <th className="px-5 py-4 text-right font-medium">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {cotizacionesFiltradas.map((cotizacion) => (
                    <tr
                      key={cotizacion.id}
                      className="border-b border-slate-800/80 align-top last:border-0 hover:bg-slate-950/30"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-50">
                          {cotizacion.numero}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {cotizacion.descripcionServicio}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-slate-100">{cotizacion.clienteNombre}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {cotizacion.clienteTelefono ||
                            cotizacion.clienteEmail ||
                            'Sin contacto'}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="max-w-[260px] truncate text-slate-100">
                          {cotizacion.tipoInmuebleNombre} - {cotizacion.tipoInmuebleCodigo}
                        </p>
                        <p className="mt-1 max-w-[260px] truncate text-xs text-slate-500">
                          {cotizacion.direccionInmueble}
                        </p>
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-50">
                        {formatMoney(cotizacion.costoServicio, cotizacion.moneda)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={
                            'inline-flex rounded-full border px-3 py-1 text-xs font-medium ' +
                            estadoClass(cotizacion.estado)
                          }
                        >
                          {estadoLabel(cotizacion.estado)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-300">
                        {cotizacion.fechaValidez}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setMenuCotizacionId(cotizacion.id)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-700 bg-slate-950/60 text-slate-200 transition hover:border-sky-400/40 hover:bg-sky-400/10 hover:text-sky-100"
                          aria-label="Acciones de cotización"
                        >
                          <MoreHorizontal className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {cotizacionMenuActiva ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Cerrar acciones"
            className="absolute inset-0 bg-black/30"
            onClick={() => {
              setMenuCotizacionId(null);
              setMenuPosition(null);
            }}
          />

          <aside className="absolute bottom-0 right-0 top-0 w-full max-w-md overflow-y-auto border-l border-slate-800 bg-slate-950 p-5 shadow-2xl shadow-black/70">
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Acciones de cotización
                </p>
                <p className="mt-2 text-base font-semibold text-slate-100">
                  {cotizacionMenuActiva.numero}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {cotizacionMenuActiva.clienteNombre}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMenuCotizacionId(null);
                  setMenuPosition(null);
                }}
                className="rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-5 grid gap-2">
              <button
                type="button"
                onClick={() => {
                  cargarCotizacionParaEditar(cotizacionMenuActiva);
                  setMenuCotizacionId(null);
                  setMenuPosition(null);
                }}
                className="flex w-full items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-left text-sm text-slate-200 hover:bg-slate-800"
              >
                <FileText className="h-4 w-4" />
                Editar cotización
              </button>

                <button
                  type="button"
                  onClick={() => {
                    exportarCotizacionPDF(cotizacionMenuActiva);
                    setMenuCotizacionId(null);
                  }}
                  className="flex w-full items-center gap-3 rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 py-3 text-left text-sm font-medium text-sky-100 hover:bg-sky-400/20"
                >
                  <FileText className="h-4 w-4" />
                  Exportar PDF
                </button>

              <button
                type="button"
                onClick={() => {
                  crearRevisionCotizacion(cotizacionMenuActiva);
                  setMenuCotizacionId(null);
                  setMenuPosition(null);
                }}
                className="flex w-full items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-left text-sm text-slate-200 hover:bg-slate-800"
              >
                <FilePlus2 className="h-4 w-4" />
                Crear nueva revisión
              </button>

              <div className="my-3 border-t border-slate-800" />

              {cotizacionMenuActiva.estado === 'borrador' ? (
                <button
                  type="button"
                  onClick={() => {
                    actualizarCotizacion(cotizacionMenuActiva, { estado: 'enviada' });
                    setMenuCotizacionId(null);
                    setMenuPosition(null);
                  }}
                  className="flex w-full items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-left text-sm text-slate-200 hover:bg-slate-800"
                >
                  <Send className="h-4 w-4" />
                  Marcar como enviada
                </button>
              ) : null}

              {cotizacionMenuActiva.estado === 'enviada' ? (
                <button
                  type="button"
                  onClick={() => {
                    actualizarCotizacion(cotizacionMenuActiva, { estado: 'aprobada' });
                    setMenuCotizacionId(null);
                    setMenuPosition(null);
                  }}
                  className="flex w-full items-center gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-left text-sm text-emerald-100 hover:bg-emerald-400/20"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Aprobar
                </button>
              ) : null}

              {cotizacionMenuActiva.estado === 'aprobada' ? (
                <button
                  type="button"
                  onClick={() => {
                    convertirEnExpediente(cotizacionMenuActiva);
                    setMenuCotizacionId(null);
                    setMenuPosition(null);
                  }}
                  className="flex w-full items-center gap-3 rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 py-3 text-left text-sm text-sky-100 hover:bg-sky-400/20"
                >
                  <ClipboardList className="h-4 w-4" />
                  Crear expediente
                </button>
              ) : null}

              <div className="my-3 border-t border-slate-800" />

              <button
                type="button"
                onClick={() => {
                  eliminarCotizacion(cotizacionMenuActiva);
                  setMenuCotizacionId(null);
                  setMenuPosition(null);
                }}
                className="flex w-full items-center gap-3 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-left text-sm text-rose-100 hover:bg-rose-400/20"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                Estado actual
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-100">
                {estadoLabel(cotizacionMenuActiva.estado)}
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Las acciones de avance cambian según el estado de la cotización.
              </p>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
