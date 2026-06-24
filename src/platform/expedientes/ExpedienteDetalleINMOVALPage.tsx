import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CalendarDays,
  Camera,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  FileText,
  FolderOpen,
  History,
  Home,
  Image as ImageIcon,
  Layers,
  Map as MapIcon,
  Mountain,
  Package,
  Save,
  Truck,
  UserRound,
  Wrench,
} from 'lucide-react';

import {
  getExpedientesIndiceINMOVAL,
  upsertExpedienteIndiceINMOVAL,
} from './expedienteIndexStorage';
import type { ExpedienteIndiceINMOVAL } from './expedienteIndexTypes';
import {
  getExpedienteActivityINMOVAL,
  registrarActividadExpedienteINMOVAL,
} from './expedienteActivityStorage';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const ESTADOS_EXPEDIENTE_MODAL_INMOVAL = [
  { value: 'en_cotizacion', label: 'Nuevo' },
  { value: 'abierto', label: 'Abierto' },
  { value: 'en_proceso', label: 'En proceso' },
  { value: 'inspeccion_programada', label: 'Inspección programada' },
  { value: 'inspeccion_realizada', label: 'Inspección realizada' },
  { value: 'avaluo_en_revision', label: 'Avalúo en revisión' },
  { value: 'listo_para_entrega', label: 'Listo para entrega' },
  { value: 'entregado', label: 'Entregado' },
  { value: 'cerrado', label: 'Cerrado' },
];

function nowISO() {
  return new Date().toISOString();
}
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function money(value: unknown, moneda: unknown) {
  const amount = Number(value || 0);
  const currency = typeof moneda === 'string' && moneda ? moneda : 'US$';
  return `${currency} ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
function label(value: unknown, fallback = '—') {
  if (value === null || value === undefined || value === '') return fallback;
  return String(value);
}
function getEstadoLabel(value: unknown) {
  const estado = String(value || 'en_cotizacion');
  const labels: Record<string, string> = {
    en_cotizacion: 'Nuevo',
    cotizacion_aprobada: 'Nuevo',
    abierto: 'Abierto',
    en_proceso: 'En proceso',
    inspeccion_programada: 'Inspección programada',
    inspeccion_realizada: 'Inspección realizada',
    en_avaluo: 'En avalúo',
    en_revision: 'En revisión',
    avaluo_en_revision: 'Avalúo en revisión',
    listo_para_entrega: 'Listo para entrega',
    entregado: 'Entregado',
    cerrado: 'Cerrado',
    cancelado: 'Cancelado',
  };
  return labels[estado] || estado.replace(/_/g, ' ');
}
function getPagoLabel(value: unknown) {
  const estado = String(value || 'pendiente');
  const labels: Record<string, string> = {
    pendiente: 'Pendiente',
    parcial: 'Parcial',
    pagado: 'Pagado',
  };
  return labels[estado] || estado;
}
function getPrioridadLabel(value: unknown) {
  const prioridad = String(value || 'normal');
  const labels: Record<string, string> = {
    baja: 'Baja',
    normal: 'Normal',
    alta: 'Alta',
    urgente: 'Urgente',
  };
  return labels[prioridad] || prioridad;
}

function diasHasta(fecha?: string): number | null {
  if (!fecha) return null;
  const t = new Date(fecha).getTime();
  if (Number.isNaN(t)) return null;
  return Math.ceil((t - Date.now()) / (1000 * 60 * 60 * 24));
}

function normalizeExpediente(expediente: ExpedienteIndiceINMOVAL) {
  const data = expediente as any;
  const costoServicio = Number(data.costoServicio || 0);
  const totalFacturableRaw = Number(
    data.totalFacturable ??
      Number(data.costoBaseServicio ?? costoServicio) +
        Number(data.otrosGastos || 0) +
        Number(data.impuestos || 0)
  );
  const baseFacturable = totalFacturableRaw > 0 ? totalFacturableRaw : costoServicio;
  const pagos = Array.isArray(data.pagos) ? data.pagos : [];
  const montoPagado = pagos.length > 0
    ? Number(pagos.reduce((s: number, p: any) => s + Number(p?.monto || 0), 0).toFixed(2))
    : Number(data.montoPagado || 0);
  const saldo = Math.max(0, Number((baseFacturable - montoPagado).toFixed(2)));

  return {
    ...data,
    estado: data.estado || 'en_cotizacion',
    prioridad: data.prioridad || 'normal',
    estadoPago:
      baseFacturable <= 0
        ? 'no_aplica'
        : saldo <= 0
          ? 'pagado'
          : montoPagado > 0
            ? 'parcial'
            : 'pendiente',
    costoServicio,
    pagos,
    gastosOperativos: Array.isArray(data.gastosOperativos) ? data.gastosOperativos : [],
    montoPagado,
    saldo,
    moneda: data.moneda || 'US$',
    tipoModulo: data.tipoModulo || 'urbano',
    clienteNombre: data.clienteNombre || 'Cliente sin nombre',
    peritoNombre: data.peritoNombre || '',
    fechaEntregaEstimada: data.fechaEntregaEstimada || '',
  } as ExpedienteIndiceINMOVAL;
}

// ─────────────────────────────────────────────────────────────────────────────
// UI primitives — INMOVAL Studio
// ─────────────────────────────────────────────────────────────────────────────

function SectionShell({
  code,
  eyebrow,
  title,
  icon,
  accent = 'sky',
  children,
  right,
}: {
  code: string;
  eyebrow: string;
  title: string;
  icon: React.ReactNode;
  accent?: 'sky' | 'emerald' | 'amber' | 'violet' | 'rose' | 'cyan' | 'slate';
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  const accentMap: Record<string, string> = {
    sky: 'from-sky-500/15 to-transparent border-sky-400/20 text-sky-300',
    emerald: 'from-emerald-500/15 to-transparent border-emerald-400/20 text-emerald-300',
    amber: 'from-amber-500/15 to-transparent border-amber-400/20 text-amber-300',
    slate: 'from-slate-500/10 to-transparent border-slate-700 text-slate-300',
    violet: 'from-violet-500/15 to-transparent border-violet-400/20 text-violet-300',
    rose: 'from-rose-500/15 to-transparent border-rose-400/20 text-rose-300',
    cyan: 'from-cyan-500/15 to-transparent border-cyan-400/20 text-cyan-300',
  };
  const cls = accentMap[accent];
  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/60 shadow-xl shadow-black/30 backdrop-blur">
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b ${cls.split(' ')[0]} ${cls.split(' ')[1]}`} />
      <div className="relative p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border bg-slate-950/80 ${cls.split(' ').slice(2).join(' ')}`}>
              {icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md border border-slate-700 bg-slate-950/80 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
                  {code}
                </span>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                  {eyebrow}
                </p>
              </div>
              <h2 className="mt-1 text-lg font-semibold text-slate-50">{title}</h2>
            </div>
          </div>
          {right}
        </div>
        {children}
      </div>
    </section>
  );
}

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4">
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-medium text-slate-100">
        {value || '—'}
      </p>
    </div>
  );
}

function Chip({
  children,
  tone = 'slate',
}: {
  children: React.ReactNode;
  tone?: 'slate' | 'sky' | 'emerald' | 'amber' | 'rose' | 'violet';
}) {
  const tones: Record<string, string> = {
    slate: 'border-slate-700 bg-slate-900/80 text-slate-300',
    sky: 'border-sky-400/30 bg-sky-400/10 text-sky-200',
    emerald: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
    amber: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
    rose: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
    violet: 'border-violet-400/30 bg-violet-400/10 text-violet-200',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

function ProgressBar({ value, tone = 'sky' }: { value: number; tone?: 'sky' | 'emerald' | 'amber' }) {
  const v = Math.max(0, Math.min(100, value));
  const toneMap: Record<string, string> = {
    sky: 'from-sky-400 to-cyan-300',
    emerald: 'from-emerald-400 to-teal-300',
    amber: 'from-amber-400 to-orange-300',
  };
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800/80">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${toneMap[tone]} transition-all`}
        style={{ width: `${v}%` }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Computed helpers
// ─────────────────────────────────────────────────────────────────────────────

function computeProgresoSecciones(data: any) {
  const has = (v: any) => Boolean(v) && String(v).trim() !== '';
  const secciones = [
    { code: 'F-01', label: 'Datos generales', done: has(data.clienteNombre) && has(data.direccionInmueble) },
    { code: 'F-02', label: 'Inspección', done: Boolean(data.inspeccionRealizada) },
    { code: 'F-03', label: 'Terreno', done: Boolean(data.avaluoTecnicoId) },
    { code: 'F-04', label: 'Construcciones', done: Boolean(data.avaluoTecnicoId) },
    { code: 'F-05', label: 'Ambientes', done: Boolean(data.avaluoTecnicoId) },
    { code: 'F-06', label: 'Fotografías', done: Boolean(data.avaluoTecnicoId) },
    { code: 'F-07', label: 'Comparables', done: Boolean(data.avaluoTecnicoId) },
    { code: 'F-08', label: 'Cálculo', done: Boolean(data.avaluoTecnicoId) },
    { code: 'F-09', label: 'Informe', done: ['avaluo_en_revision', 'listo_para_entrega', 'entregado', 'cerrado'].includes(String(data.estado)) },
    { code: 'F-10', label: 'Entrega', done: ['entregado', 'cerrado'].includes(String(data.estado)) },
  ];
  const done = secciones.filter((s) => s.done).length;
  return { secciones, porcentaje: Math.round((done / secciones.length) * 100), done, total: secciones.length };
}

function computeAlertas(data: any, saldo: number) {
  const alertas: { code: string; tone: 'amber' | 'rose' | 'sky'; titulo: string; detalle: string }[] = [];
  if (!data.inspeccionRealizada && !data.fechaInspeccion) {
    alertas.push({ code: 'A-01', tone: 'amber', titulo: 'Falta programar inspección', detalle: 'Aún no se ha programado la inspección del inmueble.' });
  }
  if (!data.avaluoTecnicoId) {
    alertas.push({ code: 'A-02', tone: 'sky', titulo: 'Faltan comparables y cálculo', detalle: 'El módulo técnico todavía no está vinculado al expediente.' });
  }
  if (data.inspeccionRealizada && !['avaluo_en_revision', 'listo_para_entrega', 'entregado', 'cerrado'].includes(String(data.estado))) {
    alertas.push({ code: 'A-03', tone: 'amber', titulo: 'Informe pendiente', detalle: 'La inspección está realizada pero el informe aún no se cierra.' });
  }
  if (saldo > 0) {
    alertas.push({ code: 'A-04', tone: 'amber', titulo: 'Saldo pendiente', detalle: `Quedan ${money(saldo, data.moneda)} por cobrar.` });
  }
  const dias = diasHasta(data.fechaEntregaEstimada);
  if (dias !== null) {
    if (dias < 0 && !['entregado', 'cerrado'].includes(String(data.estado))) {
      alertas.push({ code: 'A-05', tone: 'rose', titulo: 'Entrega vencida', detalle: `Vencida hace ${Math.abs(dias)} día(s).` });
    } else if (dias <= 3 && !['entregado', 'cerrado'].includes(String(data.estado))) {
      alertas.push({ code: 'A-05', tone: 'amber', titulo: 'Entrega próxima', detalle: `Faltan ${dias} día(s) para la entrega.` });
    }
  }
  return alertas;
}

const MODULO_TILES = [
  { code: 'T-01', label: 'Terreno', icon: <Mountain className="h-4 w-4" /> },
  { code: 'T-02', label: 'Construcciones', icon: <Building2 className="h-4 w-4" /> },
  { code: 'T-03', label: 'Ambientes', icon: <Layers className="h-4 w-4" /> },
  { code: 'T-04', label: 'Fotografías', icon: <Camera className="h-4 w-4" /> },
  { code: 'T-05', label: 'Comparables', icon: <MapIcon className="h-4 w-4" /> },
  { code: 'T-06', label: 'Cálculo', icon: <ClipboardCheck className="h-4 w-4" /> },
  { code: 'T-07', label: 'Informe', icon: <FileText className="h-4 w-4" /> },
];

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function ExpedienteDetalleINMOVALPage() {
  const [bitacoraAbierta, setBitacoraAbierta] = useState(false);
  const [estadoModalAbierto, setEstadoModalAbierto] = useState(false);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('');
  const cerrarModalEstado = () => setEstadoModalAbierto(false);
  const guardarEstadoDesdeModal = () => setEstadoModalAbierto(false);
  const [inspeccionEditorAbierto, setInspeccionEditorAbierto] = useState(false);
  const [fechaInspeccionInput, setFechaInspeccionInput] = useState('');
  const [motivoInspeccionInput, setMotivoInspeccionInput] = useState('');
  const [inspeccionMensaje, setInspeccionMensaje] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  const expedienteInicial = useMemo(() => {
    const encontrado = getExpedientesIndiceINMOVAL().find((item) => item.id === id);
    return encontrado ? normalizeExpediente(encontrado) : undefined;
  }, [id]);

  const [expediente, setExpediente] = useState<ExpedienteIndiceINMOVAL | undefined>(expedienteInicial);
  const [actividad, setActividad] = useState(() =>
    expedienteInicial ? getExpedienteActivityINMOVAL(expedienteInicial.id) : []
  );

  if (!expediente) {
    return (
      <div className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
        <div className="mx-auto max-w-5xl">
          <Link
            to="/expedientes-plataforma"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" /> Volver a expedientes
          </Link>
          <div className="mt-6 rounded-3xl border border-rose-400/20 bg-rose-400/10 p-8">
            <h1 className="text-2xl font-bold text-rose-100">Expediente no encontrado</h1>
            <p className="mt-3 text-sm leading-6 text-rose-100/80">
              No se encontró el expediente solicitado en el índice local de INMOVAL.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const data = expediente as any;
  const progreso = computeProgresoSecciones(data);
  const alertas = computeAlertas(data, Number(data.saldo || 0));
  const moduloVinculado = Boolean(data.avaluoTecnicoId || data.moduloTecnicoVinculado);
  const codigoExp = String(data.codigo || data.numero || data.id).slice(0, 24);
  const costoBase = Number(data.costoBaseServicio ?? data.costoServicio ?? 0);
  const otrosGastosItems = Array.isArray(data.otrosGastosItems) ? data.otrosGastosItems : [];
  const otrosGastos = Number(
    data.otrosGastos ??
      (otrosGastosItems.length > 0
        ? otrosGastosItems.reduce((s: number, g: any) => s + Number(g?.monto || 0), 0)
        : 0)
  );
  const iva = Number(data.impuestos ?? data.iva ?? 0);
  const totalFacturable = Number(
    data.totalFacturable ?? (costoBase + otrosGastos + iva)
  );
  const montoPagado = Number(data.montoPagado || 0);
  const saldoFacturable = Math.max(0, totalFacturable - montoPagado);

  // ───── Mutations (preservadas) ─────
  function guardarCambios(cambios: Record<string, any>, titulo: string) {
    const actualizado = normalizeExpediente({
      ...(expediente as any),
      ...cambios,
      actualizadoEn: nowISO(),
    } as ExpedienteIndiceINMOVAL);

    upsertExpedienteIndiceINMOVAL(actualizado);
    setExpediente(actualizado);

    registrarActividadExpedienteINMOVAL({
      expedienteId: expediente!.id,
      tipo: 'nota',
      titulo,
      descripcion: 'Cambio registrado desde la ficha del expediente.',
    });

    setActividad(getExpedienteActivityINMOVAL(expediente!.id));
  }

  function marcarInspeccionRealizada() {
    guardarCambios(
      {
        inspeccionRealizada: true,
        fechaInspeccionRealizada: todayISO(),
        estado: 'inspeccion_realizada',
      },
      'Inspección marcada como realizada'
    );
  }

  function abrirProgramacionInspeccion() {
    setFechaInspeccionInput(String(data.fechaInspeccion || todayISO()));
    setMotivoInspeccionInput('');
    setInspeccionMensaje('');
    setInspeccionEditorAbierto(true);
  }

  function guardarProgramacionInspeccion() {
    if (!fechaInspeccionInput) {
      setInspeccionMensaje('Seleccioná una fecha para la inspección.');
      return;
    }
    const yaEstabaProgramada = Boolean(data.fechaInspeccion);
    guardarCambios(
      {
        fechaInspeccion: fechaInspeccionInput,
        inspeccionRealizada: false,
        fechaInspeccionRealizada: '',
        inspeccionOrigen: data.inspeccionOrigen || 'Manual / plataforma',
        inspeccionMotivo: motivoInspeccionInput,
        estado: 'inspeccion_programada',
      },
      yaEstabaProgramada ? 'Inspección reprogramada' : 'Inspección programada'
    );
    setInspeccionEditorAbierto(false);
    setInspeccionMensaje(
      yaEstabaProgramada
        ? 'Inspección reprogramada correctamente.'
        : 'Inspección programada correctamente.'
    );
  }

  function iniciarNuevaInspeccion() {
    const versionActual = Number(
      (data as any).inspeccionVersion ||
        (data.inspeccionRealizada || data.fechaInspeccion ? 1 : 0)
    );
    guardarCambios(
      {
        inspeccionVersion: versionActual + 1,
        inspeccionRealizada: false,
        fechaInspeccion: '',
        fechaInspeccionRealizada: '',
        fechaEntregaEstimada: '',
        inspeccionOrigen: 'Manual / plataforma',
        inspeccionImportada: false,
        archivoInspeccionId: undefined,
        archivoInspeccionNombre: undefined,
      },
      'Nueva inspección iniciada'
    );
  }

  const diasEntrega = diasHasta(data.fechaEntregaEstimada);
  const inspeccionEstado = data.inspeccionRealizada
    ? { texto: 'Realizada', tone: 'emerald' as const }
    : data.fechaInspeccion
      ? { texto: 'Programada', tone: 'sky' as const }
      : { texto: 'Sin programar', tone: 'amber' as const };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_rgba(56,189,248,0.08),_transparent_60%),radial-gradient(ellipse_at_bottom_right,_rgba(99,102,241,0.06),_transparent_50%)] bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-7xl">
        {/* Back */}
        <button
          type="button"
          onClick={() => navigate('/expedientes-plataforma')}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Volver a expedientes
        </button>

        {/* ───────── Encabezado técnico ───────── */}
        <header className="relative mt-4 overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950/80 p-6 shadow-2xl shadow-black/40">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-200">
                  E-01 · Expediente
                </span>
                <Chip tone="sky">
                  Módulo: {String(data.tipoModulo || 'urbano').toUpperCase()}
                </Chip>
                <Chip
                  tone={
                    String(data.estado).includes('entreg') ? 'emerald'
                    : String(data.estado).includes('revis') ? 'violet'
                    : String(data.estado).includes('inspec') ? 'sky'
                    : 'slate'
                  }
                >
                  {getEstadoLabel(data.estado)}
                </Chip>
                <Chip tone={data.prioridad === 'urgente' ? 'rose' : data.prioridad === 'alta' ? 'amber' : 'slate'}>
                  Prioridad: {getPrioridadLabel(data.prioridad)}
                </Chip>
              </div>

              <h1 className="mt-3 break-words font-mono text-3xl font-bold text-slate-50 sm:text-4xl">
                {codigoExp}
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                <span className="text-slate-200">{data.clienteNombre || 'Cliente sin nombre'}</span>
                {data.direccionInmueble ? <> · <span className="text-slate-300">{data.direccionInmueble}</span></> : null}
              </p>

              {/* Progreso general */}
              <div className="mt-5 max-w-2xl">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-mono uppercase tracking-[0.18em] text-slate-500">Progreso técnico</span>
                  <span className="font-mono text-cyan-200">{progreso.porcentaje}% · {progreso.done}/{progreso.total} secciones</span>
                </div>
                <ProgressBar value={progreso.porcentaje} tone="sky" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:w-64">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">Total</p>
                <p className="mt-1 text-sm font-semibold text-slate-100">{money(data.costoServicio, data.moneda)}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">Saldo</p>
                <p className={`mt-1 text-sm font-semibold ${Number(data.saldo) > 0 ? 'text-amber-200' : 'text-emerald-200'}`}>
                  {money(data.saldo, data.moneda)}
                </p>
              </div>
              <div className="col-span-2 rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">Entrega estimada</p>
                <p className="mt-1 text-sm font-semibold text-slate-100">
                  {label(data.fechaEntregaEstimada)}
                  {diasEntrega !== null ? (
                    <span className={`ml-2 text-xs ${diasEntrega < 0 ? 'text-rose-300' : diasEntrega <= 3 ? 'text-amber-300' : 'text-slate-400'}`}>
                      {diasEntrega < 0 ? `vencida hace ${Math.abs(diasEntrega)}d` : `en ${diasEntrega}d`}
                    </span>
                  ) : null}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* ───────── Alertas ───────── */}
        {alertas.length > 0 ? (
          <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {alertas.map((a) => (
              <div
                key={a.code + a.titulo}
                className={`rounded-2xl border p-4 ${
                  a.tone === 'rose'
                    ? 'border-rose-400/30 bg-rose-500/10'
                    : a.tone === 'amber'
                      ? 'border-amber-400/30 bg-amber-500/10'
                      : 'border-sky-400/30 bg-sky-500/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`mt-0.5 h-4 w-4 ${a.tone === 'rose' ? 'text-rose-300' : a.tone === 'amber' ? 'text-amber-300' : 'text-sky-300'}`} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="rounded border border-slate-700 bg-slate-950/60 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">{a.code}</span>
                      <p className="text-sm font-semibold text-slate-100">{a.titulo}</p>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-slate-300/80">{a.detalle}</p>
                  </div>
                </div>
              </div>
            ))}
          </section>
        ) : null}

        {/* ───────── Panel de avance ───────── */}
        <div className="mt-6">
          <SectionShell
            code="E-02"
            eyebrow="Avance del avalúo"
            title="Panel técnico por secciones"
            icon={<ClipboardList className="h-5 w-5" />}
            accent="cyan"
          >
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {progreso.secciones.map((s) => (
                <div
                  key={s.code}
                  className={`rounded-xl border p-3 transition ${
                    s.done
                      ? 'border-emerald-400/30 bg-emerald-500/5'
                      : 'border-slate-800 bg-slate-950/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">{s.code}</span>
                    <span className={`h-2 w-2 rounded-full ${s.done ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                  </div>
                  <p className="mt-2 text-sm font-medium text-slate-100">{s.label}</p>
                  <p className={`mt-1 text-[11px] ${s.done ? 'text-emerald-300' : 'text-slate-500'}`}>
                    {s.done ? 'Completada' : 'Pendiente'}
                  </p>
                </div>
              ))}
            </div>
          </SectionShell>
        </div>

        {/* ───────── Datos generales (Cliente + Inmueble) ───────── */}
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <SectionShell
            code="E-03"
            eyebrow="Cliente"
            title="Datos del cliente"
            icon={<UserRound className="h-5 w-5" />}
            accent="sky"
          >
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Cliente" value={data.clienteNombre} />
              <Field label="Contacto" value={data.informacionContacto || data.clienteTelefono} />
              <Field label="Correo" value={data.correoElectronico || data.clienteEmail} />
              <Field label="Dirección cliente" value={data.clienteDireccion} />
              <Field label="Perito asignado" value={label(data.peritoNombre, 'Sin asignar')} />
              <Field label="Solicitante" value={data.nombreSolicitante || data.institucionSolicitante} />
            </div>
          </SectionShell>

          <SectionShell
            code="E-04"
            eyebrow="Inmueble"
            title="Datos del inmueble"
            icon={<Home className="h-5 w-5" />}
            accent="violet"
          >
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Tipo de inmueble" value={data.tipoInmuebleNombre} />
              <Field label="Clasificación" value={data.clasificacionInmuebleNombre || data.clasificacionInmuebleCodigo} />
              <Field label="Propósito" value={data.propositoAvaluoNombre || data.propositoAvaluoCodigo} />
              <Field label="Dirección" value={data.direccionInmueble} />
            </div>
          </SectionShell>
        </div>

        {/* ───────── Inspección ───────── */}
        <div className="mt-6">
          <SectionShell
            code="E-05"
            eyebrow="Inspección"
            title="Gestión de inspección técnica"
            icon={<CalendarDays className="h-5 w-5" />}
            accent="emerald"
            right={<Chip tone={inspeccionEstado.tone}>{inspeccionEstado.texto}</Chip>}
          >
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <Field label="Fecha programada" value={label(data.fechaInspeccion)} />
              <Field label="Fecha realizada" value={label(data.fechaInspeccionRealizada)} />
              <Field label="Origen" value={data.inspeccionOrigen || 'Manual / plataforma'} />
              <Field label="Perito" value={label(data.peritoNombre, 'Sin asignar')} />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <button
                type="button"
                onClick={marcarInspeccionRealizada}
                disabled={Boolean(data.inspeccionRealizada)}
                className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {data.inspeccionRealizada ? 'Inspección realizada' : 'Marcar realizada'}
              </button>
              <button
                type="button"
                onClick={iniciarNuevaInspeccion}
                className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm font-semibold text-amber-100 transition hover:bg-amber-400/20"
              >
                Nueva inspección
              </button>
              <button
                type="button"
                onClick={abrirProgramacionInspeccion}
                className="rounded-2xl border border-slate-700 bg-slate-950/50 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
              >
                {data.fechaInspeccion ? 'Reprogramar' : 'Programar'}
              </button>
              <button
                type="button"
                disabled
                className="rounded-2xl border border-sky-400/20 bg-sky-400/10 px-4 py-3 text-sm font-medium text-sky-100/60 disabled:cursor-not-allowed"
                title="Importar archivo de inspección desde la app externa"
              >
                Importar inspección
              </button>
            </div>

            {inspeccionEditorAbierto ? (
              <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="grid gap-4 md:grid-cols-[1fr_2fr]">
                  <label className="grid gap-2 text-sm text-slate-300">
                    Fecha de inspección
                    <input
                      type="date"
                      value={fechaInspeccionInput}
                      onChange={(e) => setFechaInspeccionInput(e.target.value)}
                      className="h-11 rounded-2xl border border-slate-700 bg-slate-900 px-4 text-sm text-slate-100 outline-none focus:border-sky-400"
                    />
                  </label>
                  <label className="grid gap-2 text-sm text-slate-300">
                    Motivo / observaciones
                    <input
                      type="text"
                      value={motivoInspeccionInput}
                      onChange={(e) => setMotivoInspeccionInput(e.target.value)}
                      placeholder="Ej. Cliente no disponible, lluvia, nueva visita requerida..."
                      className="h-11 rounded-2xl border border-slate-700 bg-slate-900 px-4 text-sm text-slate-100 outline-none focus:border-sky-400"
                    />
                  </label>
                </div>
                {inspeccionMensaje ? <p className="mt-3 text-sm text-sky-200">{inspeccionMensaje}</p> : null}
                <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setInspeccionEditorAbierto(false)}
                    className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-200 hover:bg-slate-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={guardarProgramacionInspeccion}
                    className="rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 py-3 text-sm font-semibold text-sky-100 hover:bg-sky-400/20"
                  >
                    Guardar inspección
                  </button>
                </div>
              </div>
            ) : null}
          </SectionShell>
        </div>

        {/* ───────── Módulo técnico ───────── */}
        <div className="mt-6">
          <SectionShell
            code="E-06"
            eyebrow="Área técnica"
            title="Módulo técnico del avalúo"
            icon={<Wrench className="h-5 w-5" />}
            accent="cyan"
            right={
              <Chip tone={moduloVinculado ? 'emerald' : 'amber'}>
                {moduloVinculado ? 'Conectado' : 'Pendiente de conexión'}
              </Chip>
            }
          >
            {!moduloVinculado ? (
              <div className="mb-5 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4">
                <p className="text-sm font-semibold text-amber-100">
                  Módulo técnico pendiente de conexión
                </p>
                <p className="mt-1 text-xs leading-5 text-amber-100/80">
                  Cuando se vincule el módulo técnico, las tarjetas inferiores se activarán como áreas de trabajo del avalúo.
                </p>
                <Link
                  to="/modulos"
                  className="mt-3 inline-flex items-center gap-2 rounded-xl border border-sky-400/30 bg-sky-400/10 px-3 py-2 text-xs font-medium text-sky-100 hover:bg-sky-400/20"
                >
                  <Wrench className="h-3.5 w-3.5" /> Ir a Módulos técnicos
                </Link>
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
              {MODULO_TILES.map((t) => (
                <button
                  key={t.code}
                  type="button"
                  disabled={!moduloVinculado}
                  className={`group flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition ${
                    moduloVinculado
                      ? 'border-cyan-400/20 bg-slate-950/60 hover:border-cyan-400/40 hover:bg-cyan-500/5'
                      : 'cursor-not-allowed border-slate-800 bg-slate-950/40 opacity-60'
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">{t.code}</span>
                    <span className={`flex h-7 w-7 items-center justify-center rounded-lg border ${moduloVinculado ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-200' : 'border-slate-800 bg-slate-900 text-slate-500'}`}>
                      {t.icon}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-100">{t.label}</p>
                  <p className="text-[11px] text-slate-500">
                    {moduloVinculado ? 'Abrir área' : 'Bloqueado'}
                  </p>
                </button>
              ))}
            </div>
          </SectionShell>
        </div>

        {/* ───────── Finanzas + Entrega ───────── */}
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <SectionShell
            code="E-07"
            eyebrow="Finanzas"
            title="Cotización, pago y facturación"
            icon={<CreditCard className="h-5 w-5" />}
            accent="amber"
            right={
              <Chip tone={data.estadoPago === 'pagado' ? 'emerald' : data.estadoPago === 'parcial' ? 'amber' : 'rose'}>
                {getPagoLabel(data.estadoPago)}
              </Chip>
            }
          >
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Costo base" value={money(costoBase, data.moneda)} />
              <Field label="Otros gastos" value={money(otrosGastos, data.moneda)} />
              <Field
                label={`IVA${data.ivaPorcentaje ? ` (${data.ivaPorcentaje}%)` : ''}`}
                value={money(iva, data.moneda)}
              />
              <Field label="Total facturable" value={money(totalFacturable, data.moneda)} />
              <Field label="Pagado" value={money(montoPagado, data.moneda)} />
              <Field label="Saldo" value={money(saldoFacturable, data.moneda)} />
            </div>
            {otrosGastosItems.length > 0 ? (
              <div className="mt-4 rounded-xl border border-slate-800/70 bg-slate-950/40 p-3">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  Detalle otros gastos
                </p>
                <ul className="space-y-1 text-xs text-slate-300">
                  {otrosGastosItems.map((g: any) => (
                    <li key={g.id} className="flex justify-between gap-3">
                      <span className="truncate">{g.concepto}</span>
                      <span className="font-mono text-slate-200">{money(Number(g.monto || 0), data.moneda)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {data.cotizacionNumero ? (
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                Origen cotización: {data.cotizacionNumero}
              </p>
            ) : null}
            {totalFacturable > 0 ? (
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-mono uppercase tracking-[0.18em] text-slate-500">Cobrado</span>
                  <span className="font-mono text-emerald-200">
                    {Math.round((montoPagado / totalFacturable) * 100)}%
                  </span>
                </div>
                <ProgressBar
                  value={(montoPagado / totalFacturable) * 100}
                  tone="emerald"
                />
              </div>
            ) : null}
          </SectionShell>

          <SectionShell
            code="E-08"
            eyebrow="Entrega"
            title="Estado de entrega del informe"
            icon={<Truck className="h-5 w-5" />}
            accent="emerald"
          >
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Fecha estimada" value={label(data.fechaEntregaEstimada)} />
              <Field label="Fecha cierre" value={label(data.fechaCierre)} />
              <Field label="Estado informe" value={getEstadoLabel(data.estado)} />
              <Field label="Revisiones" value={String(data.totalRevisiones ?? 0)} />
            </div>
            {diasEntrega !== null ? (
              <div className={`mt-4 rounded-2xl border p-3 text-xs ${diasEntrega < 0 ? 'border-rose-400/30 bg-rose-500/10 text-rose-200' : diasEntrega <= 3 ? 'border-amber-400/30 bg-amber-500/10 text-amber-200' : 'border-slate-800 bg-slate-950/60 text-slate-300'}`}>
                {diasEntrega < 0
                  ? `Entrega vencida hace ${Math.abs(diasEntrega)} día(s).`
                  : `Faltan ${diasEntrega} día(s) para la entrega estimada.`}
              </div>
            ) : null}
          </SectionShell>
        </div>

        {/* ───────── Documentos ───────── */}
        <div className="mt-6">
          <SectionShell
            code="E-09"
            eyebrow="Documentos"
            title="Archivos y respaldo del expediente"
            icon={<FolderOpen className="h-5 w-5" />}
            accent="violet"
          >
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <Field label="Archivo .imv" value={data.archivoImvNombre} />
              <Field label="Drive / carpeta" value={data.driveUrl} />
              <Field label="Informe PDF" value={data.informePdfNombre} />
              <Field label="Respaldo" value={data.respaldoNombre} />
            </div>
            <button
              type="button"
              onClick={() =>
                guardarCambios(
                  { archivoImvNombre: data.archivoImvNombre || 'Pendiente de respaldo' },
                  'Referencia documental actualizada'
                )
              }
              className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950/50 px-4 py-3 text-sm font-medium text-slate-200 hover:bg-slate-800"
            >
              <Save className="h-4 w-4" /> Guardar referencia
            </button>
          </SectionShell>
        </div>

        {/* ───────── Bitácora ───────── */}
        <div className="mt-6">
          <SectionShell
            code="E-10"
            eyebrow="Bitácora"
            title="Historial técnico del expediente"
            icon={<History className="h-5 w-5" />}
            accent="slate"
            right={
              <button
                type="button"
                onClick={() => setBitacoraAbierta((v) => !v)}
                className="rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800"
              >
                {bitacoraAbierta ? 'Ocultar' : 'Mostrar'} · {actividad.length}
              </button>
            }
          >
            {bitacoraAbierta ? (
              actividad.length === 0 ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-400">
                  No hay movimientos registrados.
                </div>
              ) : (
                <ol className="relative ml-3 space-y-3 border-l border-slate-800 pl-5">
                  {actividad.map((item) => (
                    <li key={item.id} className="relative">
                      <span className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-slate-900 bg-cyan-400" />
                      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-100">
                            {item.titulo || item.tipo || 'Actividad'}
                          </p>
                          <span className="rounded-full border border-slate-700 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400">
                            {item.tipo || 'nota'}
                          </span>
                        </div>
                        <p className="mt-1 text-xs leading-5 text-slate-400">
                          {item.descripcion || item.detalle || 'Movimiento registrado.'}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              )
            ) : (
              <p className="text-xs text-slate-500">
                {actividad.length} movimiento(s) registrado(s). La bitácora mantiene el historial fiel del expediente.
              </p>
            )}
          </SectionShell>
        </div>

        {/* ───────── Modal estado (preservado) ───────── */}
        {estadoModalAbierto ? (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-950 p-6 shadow-2xl shadow-black/50">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Expediente</p>
                  <h2 className="mt-2 text-xl font-bold text-slate-50">Estado controlado por flujo</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{data?.codigo || 'Expediente'}</p>
                </div>
                <button
                  type="button"
                  onClick={cerrarModalEstado}
                  className="rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
                >
                  Cerrar
                </button>
              </div>
              <label className="mt-6 grid gap-2 text-sm text-slate-300">
                Estado operativo
                <select
                  value={estadoSeleccionado}
                  onChange={(e) => setEstadoSeleccionado(e.target.value)}
                  className="h-12 rounded-2xl border border-slate-700 bg-slate-900 px-4 text-sm text-slate-100 outline-none focus:border-sky-400"
                >
                  {ESTADOS_EXPEDIENTE_MODAL_INMOVAL.map((estado) => (
                    <option key={estado.value} value={estado.value}>{estado.label}</option>
                  ))}
                </select>
              </label>
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button type="button" onClick={cerrarModalEstado} className="rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-medium text-slate-200 hover:bg-slate-800">
                  Cancelar
                </button>
                <button type="button" onClick={guardarEstadoDesdeModal} className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-5 py-3 text-sm font-semibold text-emerald-100 hover:bg-emerald-400/20">
                  Guardar estado
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
