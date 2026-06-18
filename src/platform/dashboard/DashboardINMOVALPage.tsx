import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Boxes,
  CheckCircle2,
  ClipboardList,
  FileText,
  Filter,
  FolderKanban,
  Receipt,
  ScrollText,
  Send,
  WalletCards,
} from 'lucide-react';

import { getExpedientesIndiceINMOVAL } from '@/platform/expedientes/expedienteIndexStorage';
import { getAllExpedienteActivityINMOVAL } from '@/platform/expedientes/expedienteActivityStorage';
import { formatMoneyINMOVAL, getEstadoExpedienteLabel } from '@/platform/expedientes/expedienteUiUtils';

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

function getMontoCotizacion(cotizacion: CotizacionDashboard) {
  return Number(
    cotizacion.costoServicio ||
      cotizacion.monto ||
      cotizacion.total ||
      0
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/75 p-6 shadow-xl shadow-black/20">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-50">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">{subtitle}</p>
      </div>

      {children}
    </section>
  );
}

function StatCard({
  titulo,
  valor,
  detalle,
  icon,
}: {
  titulo: string;
  valor: string | number;
  detalle: string;
  icon: React.ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 shadow-xl shadow-black/20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
            {titulo}
          </p>
          <p className="mt-3 text-3xl font-bold text-slate-50">{valor}</p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/10 text-sky-200">
          {icon}
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-400">{detalle}</p>
    </article>
  );
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

  const cotizacionesFiltradas = useMemo(() => {
    return cotizaciones.filter((cotizacion) =>
      inDateRange(
        cotizacion.fechaCotizacion || cotizacion.creadoEn || cotizacion.actualizadoEn,
        fechaInicio,
        fechaFin
      )
    );
  }, [cotizaciones, fechaInicio, fechaFin]);

  const expedientesFiltrados = useMemo(() => {
    return expedientes.filter((expediente) =>
      inDateRange(expediente.fechaSolicitud || expediente.creadoEn, fechaInicio, fechaFin)
    );
  }, [expedientes, fechaInicio, fechaFin]);

  const bitacoraFiltrada = useMemo(() => {
    return bitacora
      .filter((item) => inDateRange(item.creadoEn, fechaInicio, fechaFin))
      .slice(0, 8);
  }, [bitacora, fechaInicio, fechaFin]);

  const cotizacionesEnviadas = cotizacionesFiltradas.filter(
    (cotizacion) => cotizacion.estado === 'enviada'
  );

  const cotizacionesAprobadasSinExpediente = cotizacionesFiltradas.filter(
    (cotizacion) =>
      cotizacion.estado === 'aprobada' && !cotizacion.expedienteId
  );

  const avaluosEnProceso = cotizacionesFiltradas.filter(
    (cotizacion) =>
      cotizacion.estado === 'avaluo_en_proceso' ||
      cotizacion.estado === 'convertida' ||
      Boolean(cotizacion.expedienteId)
  );

  const avaluosFinalizados = cotizacionesFiltradas.filter(
    (cotizacion) => cotizacion.estado === 'avaluo_finalizado'
  );

  const facturasEmitidas = cotizacionesFiltradas.filter(
    (cotizacion) => cotizacion.estado === 'factura_emitida'
  );

  const expedientesNuevos = expedientesFiltrados.filter(
    (expediente) =>
      expediente.estado === 'en_cotizacion' ||
      expediente.estado === 'cotizacion_aprobada'
  );

  const expedientesActivos = expedientesFiltrados.filter(
    (expediente) =>
      !['cerrado', 'cancelado', 'entregado'].includes(String(expediente.estado))
  );

  const expedientesEnRevision = expedientesFiltrados.filter(
    (expediente) =>
      expediente.estado === 'en_revision' ||
      expediente.estado === 'correcciones' ||
      expediente.estado === 'avaluo_en_revision'
  );

  const expedientesPendientesEntrega = expedientesFiltrados.filter(
    (expediente) =>
      expediente.estado === 'aprobado' ||
      expediente.estado === 'listo_para_entrega'
  );

  const pagosPendientes = expedientesFiltrados.filter(
    (expediente) => expediente.estadoPago !== 'pagado' && Number(expediente.saldo || 0) > 0
  );

  const totalSaldoPendiente = pagosPendientes.reduce(
    (total, expediente) => total + Number(expediente.saldo || 0),
    0
  );

  const montoCotizado = cotizacionesFiltradas.reduce(
    (total, cotizacion) => total + getMontoCotizacion(cotizacion),
    0
  );

  const monedaPrincipal =
    cotizacionesFiltradas[0]?.moneda ||
    pagosPendientes[0]?.moneda ||
    expedientesFiltrados[0]?.moneda ||
    'US$';

  const modulosActivos = modulos.filter((modulo) => modulo.estado === 'activo');

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
      <div className="mx-auto grid max-w-7xl gap-6">
        <header className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-sky-300">
                Plataforma INMOVAL
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-50">
                Centro INMOVAL
              </h1>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-400">
                Resumen operativo de cotizaciones, expedientes, avalúos, módulos,
                pagos y bitácora de la plataforma en el rango seleccionado.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-200">
                <Filter className="h-4 w-4 text-sky-300" />
                Filtrar por rango de fecha
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-xs text-slate-400">
                  Desde
                  <input
                    type="date"
                    value={fechaInicio}
                    onChange={(event) => setFechaInicio(event.target.value)}
                    className="h-10 rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100 outline-none focus:border-sky-400"
                  />
                </label>

                <label className="grid gap-1 text-xs text-slate-400">
                  Hasta
                  <input
                    type="date"
                    value={fechaFin}
                    onChange={(event) => setFechaFin(event.target.value)}
                    className="h-10 rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100 outline-none focus:border-sky-400"
                  />
                </label>
              </div>
            </div>
          </div>
        </header>

        <Section
          title="Cotizaciones"
          subtitle="Seguimiento comercial real desde el módulo de cotizaciones."
        >
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              titulo="Enviadas"
              valor={cotizacionesEnviadas.length}
              detalle="Cotizaciones enviadas pendientes de respuesta."
              icon={<Send className="h-5 w-5" />}
            />

            <StatCard
              titulo="Aprobadas"
              valor={cotizacionesAprobadasSinExpediente.length}
              detalle="Aprobadas pendientes de crear expediente."
              icon={<FileText className="h-5 w-5" />}
            />

            <StatCard
              titulo="Monto cotizado"
              valor={formatMoneyINMOVAL(montoCotizado, monedaPrincipal)}
              detalle="Suma de cotizaciones dentro del rango."
              icon={<WalletCards className="h-5 w-5" />}
            />

            <article className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 shadow-xl shadow-black/20">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                Acción
              </p>
              <Link
                to="/cotizaciones"
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 py-3 text-sm font-medium text-sky-100 transition hover:bg-sky-400/20"
              >
                <FileText className="h-4 w-4" />
                Ver cotizaciones
              </Link>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                Revisar propuestas, aprobaciones y expedientes vinculados.
              </p>
            </article>
          </div>
        </Section>

        <Section
          title="Expedientes y avalúos"
          subtitle="Estado operativo de expedientes y avance técnico."
        >
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              titulo="Nuevos"
              valor={expedientesNuevos.length}
              detalle="Expedientes recién abiertos."
              icon={<FolderKanban className="h-5 w-5" />}
            />

            <StatCard
              titulo="Avalúos en proceso"
              valor={avaluosEnProceso.length}
              detalle="Cotizaciones vinculadas a expediente o proceso técnico."
              icon={<ClipboardList className="h-5 w-5" />}
            />

            <StatCard
              titulo="En revisión"
              valor={expedientesEnRevision.length}
              detalle="Expedientes con revisión o correcciones."
              icon={<ScrollText className="h-5 w-5" />}
            />

            <StatCard
              titulo="Por entregar"
              valor={expedientesPendientesEntrega.length}
              detalle="Expedientes listos o aprobados para entrega."
              icon={<CheckCircle2 className="h-5 w-5" />}
            />
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <StatCard
              titulo="Expedientes activos"
              valor={expedientesActivos.length}
              detalle="No cerrados, cancelados ni entregados."
              icon={<FolderKanban className="h-5 w-5" />}
            />

            <StatCard
              titulo="Avalúos finalizados"
              valor={avaluosFinalizados.length}
              detalle="Listos para habilitar facturación."
              icon={<CheckCircle2 className="h-5 w-5" />}
            />

            <StatCard
              titulo="Facturas emitidas"
              valor={facturasEmitidas.length}
              detalle="Cotizaciones que ya pasaron a factura emitida."
              icon={<Receipt className="h-5 w-5" />}
            />
          </div>
        </Section>

        <Section
          title="Pagos y módulos"
          subtitle="Control financiero básico y disponibilidad técnica."
        >
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              titulo="Pagos pendientes"
              valor={pagosPendientes.length}
              detalle="Expedientes con saldo pendiente."
              icon={<Receipt className="h-5 w-5" />}
            />

            <StatCard
              titulo="Saldo pendiente"
              valor={formatMoneyINMOVAL(totalSaldoPendiente, monedaPrincipal)}
              detalle="Total pendiente de cobro en el rango."
              icon={<WalletCards className="h-5 w-5" />}
            />

            <StatCard
              titulo="Módulos activos"
              valor={modulosActivos.length}
              detalle="Módulos técnicos disponibles para operación."
              icon={<Boxes className="h-5 w-5" />}
            />
          </div>
        </Section>

        <Section
          title="Bitácora reciente"
          subtitle="Últimos movimientos registrados en expedientes."
        >
          {bitacoraFiltrada.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 text-sm text-slate-400">
              No hay actividad registrada en el rango seleccionado.
            </div>
          ) : (
            <div className="grid gap-3">
              {bitacoraFiltrada.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-100">
                        {item.titulo || item.tipo || 'Actividad'}
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        {item.descripcion || item.detalle || 'Movimiento registrado'}
                      </p>
                    </div>

                    <div className="text-xs text-slate-500">
                      {item.creadoEn?.slice(0, 10)}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Section>
      </div>
    </main>
  );
}
