import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  Boxes,
  ClipboardCheck,
  ClipboardList,
  Filter,
  FolderKanban,
  Map,
  Receipt,
  ScrollText,
  Send,
  Truck,
  WalletCards,
} from 'lucide-react';

import { getExpedientesIndiceINMOVAL } from '@/platform/expedientes/expedienteIndexStorage';
import { getAllExpedienteActivityINMOVAL } from '@/platform/expedientes/expedienteActivityStorage';
import { formatMoneyINMOVAL } from '@/platform/expedientes/expedienteUiUtils';

type CotizacionDashboard = {
  id: string;
  numero?: string;
  estado?: string;
  expedienteId?: string;
  costoServicio?: number;
  monto?: number;
  total?: number;
  moneda?: string;
  creadoEn?: string;
  fechaCotizacion?: string;
  actualizadoEn?: string;
};

type ModuloDashboard = {
  id: string;
  estado?: string;
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function startOfMonthISO() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
}

function inDateRange(value: string | undefined, from: string, to: string) {
  if (!value) return true;
  const date = value.slice(0, 10);
  return date >= from && date <= to;
}

function readLocalArray<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getMontoCotizacion(c: CotizacionDashboard) {
  return Number(c.costoServicio || c.monto || c.total || 0);
}

function daysBetween(fromISO: string | undefined, toISO: string) {
  if (!fromISO) return null;
  const a = new Date(fromISO.slice(0, 10)).getTime();
  const b = new Date(toISO.slice(0, 10)).getTime();
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  return Math.round((a - b) / (1000 * 60 * 60 * 24));
}

type ToreCardProps = {
  index: number;
  titulo: string;
  valor: number | string;
  detalle: string;
  accent: 'sky' | 'amber' | 'indigo' | 'violet' | 'emerald' | 'rose' | 'orange' | 'slate';
  to?: string;
  icon: React.ReactNode;
  badge?: string;
};

const ACCENT_MAP: Record<ToreCardProps['accent'], { ring: string; chip: string; dot: string; glow: string }> = {
  sky:     { ring: 'border-sky-400/30',     chip: 'bg-sky-400/10 text-sky-200',         dot: 'bg-sky-400',     glow: 'shadow-[0_0_24px_-8px_rgba(56,189,248,0.45)]' },
  amber:   { ring: 'border-amber-400/30',   chip: 'bg-amber-400/10 text-amber-200',     dot: 'bg-amber-400',   glow: 'shadow-[0_0_24px_-8px_rgba(251,191,36,0.45)]' },
  indigo:  { ring: 'border-indigo-400/30',  chip: 'bg-indigo-400/10 text-indigo-200',   dot: 'bg-indigo-400',  glow: 'shadow-[0_0_24px_-8px_rgba(129,140,248,0.45)]' },
  violet:  { ring: 'border-violet-400/30',  chip: 'bg-violet-400/10 text-violet-200',   dot: 'bg-violet-400',  glow: 'shadow-[0_0_24px_-8px_rgba(167,139,250,0.45)]' },
  emerald: { ring: 'border-emerald-400/30', chip: 'bg-emerald-400/10 text-emerald-200', dot: 'bg-emerald-400', glow: 'shadow-[0_0_24px_-8px_rgba(52,211,153,0.45)]' },
  rose:    { ring: 'border-rose-400/30',    chip: 'bg-rose-400/10 text-rose-200',       dot: 'bg-rose-400',    glow: 'shadow-[0_0_24px_-8px_rgba(251,113,133,0.45)]' },
  orange:  { ring: 'border-orange-400/30',  chip: 'bg-orange-400/10 text-orange-200',   dot: 'bg-orange-400',  glow: 'shadow-[0_0_24px_-8px_rgba(251,146,60,0.45)]' },
  slate:   { ring: 'border-slate-700',      chip: 'bg-slate-700/40 text-slate-200',     dot: 'bg-slate-400',   glow: '' },
};

function ToreCard({ index, titulo, valor, detalle, accent, to, icon, badge }: ToreCardProps) {
  const a = ACCENT_MAP[accent];
  const body = (
    <article
      className={`group relative overflow-hidden rounded-2xl border ${a.ring} bg-slate-950/70 p-5 transition hover:bg-slate-900/70 ${a.glow}`}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-white/[0.04] to-transparent" />
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full ${a.dot}`} />
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
            T-{String(index).padStart(2, '0')}
          </span>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${a.chip}`}>
          {icon}
        </div>
      </div>

      <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
        {titulo}
      </p>
      <p className="mt-2 font-mono text-4xl font-bold text-slate-50">{valor}</p>
      <p className="mt-2 text-xs leading-5 text-slate-400">{detalle}</p>

      {badge ? (
        <span className={`mt-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${a.chip}`}>
          <Activity className="h-3 w-3" />
          {badge}
        </span>
      ) : null}
    </article>
  );
  return to ? <Link to={to}>{body}</Link> : body;
}

export default function DashboardINMOVALPage() {
  const [fechaInicio, setFechaInicio] = useState(startOfMonthISO());
  const [fechaFin, setFechaFin] = useState(todayISO());

  const expedientes = useMemo(() => getExpedientesIndiceINMOVAL(), []);
  const bitacora = useMemo(() => getAllExpedienteActivityINMOVAL(), []);
  const cotizaciones = useMemo(
    () => readLocalArray<CotizacionDashboard>('inmoval_cotizaciones_v1'),
    []
  );
  const modulos = useMemo(
    () => readLocalArray<ModuloDashboard>('inmoval_modulos_tecnicos_estado_v1'),
    []
  );

  const expedientesFiltrados = useMemo(
    () =>
      expedientes.filter((e) =>
        inDateRange(e.fechaSolicitud || e.creadoEn, fechaInicio, fechaFin)
      ),
    [expedientes, fechaInicio, fechaFin]
  );

  const cotizacionesFiltradas = useMemo(
    () =>
      cotizaciones.filter((c) =>
        inDateRange(
          c.fechaCotizacion || c.creadoEn || c.actualizadoEn,
          fechaInicio,
          fechaFin
        )
      ),
    [cotizaciones, fechaInicio, fechaFin]
  );

  const bitacoraFiltrada = useMemo(
    () =>
      bitacora
        .filter((b) => inDateRange(b.creadoEn, fechaInicio, fechaFin))
        .slice(0, 6),
    [bitacora, fechaInicio, fechaFin]
  );

  const hoy = todayISO();

  // === 8 INDICADORES OPERATIVOS ===
  const expedientesActivos = expedientesFiltrados.filter(
    (e) => !['cerrado', 'cancelado', 'entregado'].includes(String(e.estado))
  );

  const pendientesInspeccion = expedientesFiltrados.filter((e) =>
    ['pendiente_inspeccion', 'en_inspeccion'].includes(String(e.estado))
  );

  // Heurística: expedientes en elaboración técnica sin comparables vinculados
  const pendientesComparables = expedientesFiltrados.filter(
    (e) =>
      ['en_elaboracion', 'cotizacion_aprobada'].includes(String(e.estado)) &&
      !Number((e as any).comparables) // si no llevan conteo, los marcamos
  );

  const pendientesInforme = expedientesFiltrados.filter((e) =>
    ['en_elaboracion', 'en_revision', 'avaluo_en_revision', 'correcciones'].includes(
      String(e.estado)
    )
  );

  // Entregas próximas: aprobados / listos / con fechaEntrega en <= 7 días
  const entregasProximas = expedientesFiltrados.filter((e) => {
    if (['aprobado', 'listo_para_entrega'].includes(String(e.estado))) return true;
    const d = daysBetween((e as any).fechaEntrega, hoy);
    return d !== null && d >= 0 && d <= 7;
  });

  // Detenidos: en correcciones o sin movimiento > 14 días
  const expedientesDetenidos = expedientesFiltrados.filter((e) => {
    if (String(e.estado) === 'correcciones') return true;
    const d = daysBetween(hoy, (e as any).actualizadoEn || e.creadoEn);
    return d !== null && d >= 14 && !['cerrado', 'cancelado', 'entregado'].includes(String(e.estado));
  });

  const cobrosPendientes = expedientesFiltrados.filter(
    (e) => e.estadoPago !== 'pagado' && Number(e.saldo || 0) > 0
  );
  const totalSaldoPendiente = cobrosPendientes.reduce(
    (t, e) => t + Number(e.saldo || 0),
    0
  );
  const monedaPrincipal =
    cobrosPendientes[0]?.moneda ||
    cotizacionesFiltradas[0]?.moneda ||
    expedientesFiltrados[0]?.moneda ||
    'US$';

  const modulosActivos = modulos.filter((m) => m.estado === 'activo');
  const cotizacionesEnviadas = cotizacionesFiltradas.filter(
    (c) => c.estado === 'enviada'
  );
  const montoCotizado = cotizacionesFiltradas.reduce(
    (t, c) => t + getMontoCotizacion(c),
    0
  );

  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto grid max-w-7xl gap-6">
        {/* ============ HEADER TORRE DE CONTROL ============ */}
        <header className="relative overflow-hidden rounded-3xl border border-sky-400/20 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950 p-6 shadow-2xl shadow-black/40">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_0%_0%,rgba(56,189,248,0.10),transparent),radial-gradient(40%_40%_at_100%_100%,rgba(99,102,241,0.10),transparent)]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/60 to-transparent" />

          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-400" />
                </span>
                <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-sky-300">
                  INMOVAL · Torre de control
                </p>
              </div>
              <h1 className="mt-2 text-3xl font-bold text-slate-50 sm:text-4xl">
                Centro INMOVAL
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                Seguimiento operativo en tiempo real de expedientes, inspecciones,
                comparables, informes, entregas y cobros.
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                <span className="rounded-full border border-slate-800 bg-slate-900/60 px-2.5 py-1">
                  · {expedientesFiltrados.length} expedientes en rango
                </span>
                <span className="rounded-full border border-slate-800 bg-slate-900/60 px-2.5 py-1">
                  · {modulosActivos.length} módulos activos
                </span>
                <span className="rounded-full border border-slate-800 bg-slate-900/60 px-2.5 py-1">
                  · {cotizacionesEnviadas.length} cotizaciones enviadas
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 backdrop-blur">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
                <Filter className="h-3.5 w-3.5" />
                Ventana operativa
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-[11px] uppercase tracking-wider text-slate-500">
                  Desde
                  <input
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="h-10 rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100 outline-none focus:border-sky-400"
                  />
                </label>
                <label className="grid gap-1 text-[11px] uppercase tracking-wider text-slate-500">
                  Hasta
                  <input
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="h-10 rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100 outline-none focus:border-sky-400"
                  />
                </label>
              </div>
            </div>
          </div>
        </header>

        {/* ============ 8 INDICADORES ============ */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xs font-mono font-semibold uppercase tracking-[0.28em] text-sky-300">
                · 8 Indicadores operativos
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Prioridades técnicas y financieras del rango.
              </p>
            </div>
            <Link
              to="/expedientes-plataforma"
              className="hidden rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-xs text-slate-300 hover:border-sky-400/40 hover:text-sky-200 sm:inline-flex"
            >
              Ir a expedientes →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ToreCard
              index={1}
              titulo="Expedientes activos"
              valor={expedientesActivos.length}
              detalle="No cerrados, cancelados ni entregados."
              accent="sky"
              to="/expedientes-plataforma"
              icon={<FolderKanban className="h-5 w-5" />}
            />
            <ToreCard
              index={2}
              titulo="Pendientes de inspección"
              valor={pendientesInspeccion.length}
              detalle="Por agendar o ejecutar visita de campo."
              accent="amber"
              to="/expedientes-plataforma"
              icon={<Map className="h-5 w-5" />}
              badge={pendientesInspeccion.length > 0 ? 'requiere visita' : undefined}
            />
            <ToreCard
              index={3}
              titulo="Pendientes de comparables"
              valor={pendientesComparables.length}
              detalle="Avalúos sin comparables registrados."
              accent="indigo"
              to="/comparables"
              icon={<Boxes className="h-5 w-5" />}
            />
            <ToreCard
              index={4}
              titulo="Pendientes de informe"
              valor={pendientesInforme.length}
              detalle="En elaboración, revisión o correcciones."
              accent="violet"
              to="/expedientes-plataforma"
              icon={<ScrollText className="h-5 w-5" />}
            />
            <ToreCard
              index={5}
              titulo="Entregas próximas"
              valor={entregasProximas.length}
              detalle="Listos para entrega o con fecha ≤ 7 días."
              accent="emerald"
              to="/expedientes-plataforma"
              icon={<Truck className="h-5 w-5" />}
              badge={entregasProximas.length > 0 ? 'esta semana' : undefined}
            />
            <ToreCard
              index={6}
              titulo="Expedientes detenidos"
              valor={expedientesDetenidos.length}
              detalle="Correcciones o sin movimiento > 14 días."
              accent="rose"
              to="/expedientes-plataforma"
              icon={<AlertTriangle className="h-5 w-5" />}
              badge={expedientesDetenidos.length > 0 ? 'atención' : undefined}
            />
            <ToreCard
              index={7}
              titulo="Cobros pendientes"
              valor={cobrosPendientes.length}
              detalle={`Saldo ${formatMoneyINMOVAL(totalSaldoPendiente, monedaPrincipal)}`}
              accent="orange"
              to="/contable"
              icon={<WalletCards className="h-5 w-5" />}
            />
            <ToreCard
              index={8}
              titulo="Indicadores operativos"
              valor={`${modulosActivos.length}/${modulos.length || modulosActivos.length}`}
              detalle={`Cotizado ${formatMoneyINMOVAL(montoCotizado, monedaPrincipal)} · ${cotizacionesEnviadas.length} cotz. enviadas`}
              accent="slate"
              to="/cotizaciones"
              icon={<Receipt className="h-5 w-5" />}
            />
          </div>
        </section>

        {/* ============ ACCESOS RÁPIDOS ============ */}
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { to: '/expedientes-plataforma/nuevo', label: 'Nuevo expediente', icon: ClipboardList },
            { to: '/cotizaciones', label: 'Nueva cotización', icon: Send },
            { to: '/comparables', label: 'Comparables', icon: Boxes },
            { to: '/contable', label: 'Módulo Contable', icon: Receipt },
          ].map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-sky-400/40 hover:bg-slate-900"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-400/10 text-sky-200">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-100">{label}</p>
                <p className="truncate text-xs text-slate-500">Acceso rápido</p>
              </div>
            </Link>
          ))}
        </section>

        {/* ============ BITÁCORA ============ */}
        <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl shadow-black/20">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.28em] text-sky-300">
                · Bitácora reciente
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Últimos movimientos registrados.
              </p>
            </div>
            <ClipboardCheck className="h-5 w-5 text-slate-500" />
          </div>

          {bitacoraFiltrada.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-6 text-center text-sm text-slate-500">
              Sin actividad registrada en el rango seleccionado.
            </div>
          ) : (
            <ol className="relative ml-2 border-l border-slate-800">
              {bitacoraFiltrada.map((item) => (
                <li key={item.id} className="mb-4 ml-4 last:mb-0">
                  <span className="absolute -left-[5px] mt-1.5 flex h-2.5 w-2.5 rounded-full bg-sky-400 ring-4 ring-slate-950" />
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-semibold text-slate-100">
                        {item.titulo || item.tipo || 'Actividad'}
                      </p>
                      <span className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
                        {item.creadoEn?.slice(0, 10)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-400">
                      {item.descripcion || item.detalle || 'Movimiento registrado'}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </main>
  );
}
