import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  ClipboardList,
  FileText,
  Filter,
  Receipt,
  ScrollText,
  Send,
} from 'lucide-react';

import { getExpedientesIndiceINMOVAL } from '@/platform/expedientes/expedienteIndexStorage';
import { getAllExpedienteActivityINMOVAL } from '@/platform/expedientes/expedienteActivityStorage';
import { formatMoneyINMOVAL, getEstadoExpedienteLabel } from '@/platform/expedientes/expedienteUiUtils';

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

  if (from && date < from) return false;
  if (to && date > to) return false;

  return true;
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
          <p className="mt-2 text-sm text-slate-400">{detalle}</p>
        </div>

        <div className="rounded-2xl border border-sky-400/20 bg-sky-400/10 p-3 text-sky-200">
          {icon}
        </div>
      </div>
    </article>
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
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-slate-50">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">{subtitle}</p>
      </div>

      {children}
    </section>
  );
}

export default function DashboardINMOVALPage() {
  const [fechaInicio, setFechaInicio] = useState(startOfMonthISO());
  const [fechaFin, setFechaFin] = useState(todayISO());

  const expedientes = useMemo(() => getExpedientesIndiceINMOVAL(), []);
  const bitacora = useMemo(() => getAllExpedienteActivityINMOVAL(), []);

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

  const cotizacionesEnviadas = expedientesFiltrados.filter(
    (expediente) => expediente.estado === 'cotizacion_enviada'
  );

  const cotizacionesAprobadasEnEspera = expedientesFiltrados.filter(
    (expediente) =>
      expediente.estado === 'cotizacion_aprobada' ||
      expediente.estado === 'pendiente_inspeccion'
  );

  const expedientesActivos = expedientesFiltrados.filter(
    (expediente) =>
      !['cerrado', 'cancelado', 'entregado'].includes(expediente.estado)
  );

  const expedientesPrioridadAlta = expedientesFiltrados.filter(
    (expediente) => expediente.prioridad === 'alta'
  );

  const expedientesEnRevision = expedientesFiltrados.filter(
    (expediente) =>
      expediente.estado === 'en_revision' || expediente.estado === 'correcciones'
  );

  const expedientesPendientesEntrega = expedientesFiltrados.filter(
    (expediente) => expediente.estado === 'aprobado'
  );

  const facturasPendientes = expedientesFiltrados.filter(
    (expediente) => !expediente.facturaEmitida && expediente.costoServicio > 0
  );

  const pagosPendientes = expedientesFiltrados.filter(
    (expediente) => expediente.estadoPago !== 'pagado' && expediente.saldo > 0
  );

  const totalSaldoPendiente = pagosPendientes.reduce(
    (total, expediente) => total + Number(expediente.saldo || 0),
    0
  );

  const monedaPrincipal = pagosPendientes[0]?.moneda || expedientesFiltrados[0]?.moneda || 'US$';

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
                Resumen de cotizaciones, expedientes, facturas, pagos y bitácora
                de la plataforma en el rango seleccionado.
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

        {/* 1. COTIZACIONES */}
        <Section
          title="Cotizaciones"
          subtitle="Seguimiento de cotizaciones enviadas y aprobadas en espera de expediente o inicio operativo."
        >
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              titulo="Enviadas"
              valor={cotizacionesEnviadas.length}
              detalle="Cotizaciones enviadas pendientes de respuesta."
              icon={<Send className="h-5 w-5" />}
            />

            <StatCard
              titulo="Aprobadas / por iniciar"
              valor={cotizacionesAprobadasEnEspera.length}
              detalle="Aprobadas o listas para iniciar expediente."
              icon={<FileText className="h-5 w-5" />}
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
                Crear cotización
              </Link>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                Acceso directo para registrar o revisar cotizaciones antes del expediente.
              </p>
            </article>
          </div>
        </Section>

        {/* 2. EXPEDIENTES */}
        <Section
          title="Expedientes"
          subtitle="Estado operativo de expedientes, prioridades, revisión y entregas."
        >
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              titulo="Activos"
              valor={expedientesActivos.length}
              detalle="Expedientes abiertos en operación."
              icon={<ClipboardList className="h-5 w-5" />}
            />

            <StatCard
              titulo="Prioridad alta"
              valor={expedientesPrioridadAlta.length}
              detalle="Casos que requieren atención inmediata."
              icon={<CalendarDays className="h-5 w-5" />}
            />

            <StatCard
              titulo="En revisión"
              valor={expedientesEnRevision.length}
              detalle="Avalúos en revisión o corrección."
              icon={<ScrollText className="h-5 w-5" />}
            />

            <StatCard
              titulo="Pendientes de entrega"
              valor={expedientesPendientesEntrega.length}
              detalle="Aprobados o listos para entregar."
              icon={<FileText className="h-5 w-5" />}
            />
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/80 text-xs uppercase tracking-[0.14em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Expediente</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Prioridad</th>
                  <th className="px-4 py-3">Entrega</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-950/40">
                {expedientesFiltrados.slice(0, 6).map((expediente) => (
                  <tr key={expediente.id}>
                    <td className="px-4 py-3 font-medium text-slate-100">
                      <Link
                        to={`/expedientes-plataforma/${expediente.id}`}
                        className="hover:text-sky-300"
                      >
                        {expediente.codigo}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {expediente.clienteNombre || 'Sin cliente'}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {getEstadoExpedienteLabel(expediente.estado)}
                    </td>
                    <td className="px-4 py-3 capitalize text-slate-300">
                      {expediente.prioridad}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {expediente.fechaEntregaEstimada || 'Sin fecha'}
                    </td>
                  </tr>
                ))}

                {expedientesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      No hay expedientes en el rango seleccionado.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Section>

        {/* 3. FACTURAS / PAGOS */}
        <Section
          title="Facturas y pagos"
          subtitle="Resumen de facturación pendiente, pagos pendientes y saldos por cobrar."
        >
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              titulo="Facturas pendientes"
              valor={facturasPendientes.length}
              detalle="Expedientes con servicio registrado sin factura emitida."
              icon={<Receipt className="h-5 w-5" />}
            />

            <StatCard
              titulo="Pagos pendientes"
              valor={pagosPendientes.length}
              detalle="Expedientes con saldo pendiente."
              icon={<Receipt className="h-5 w-5" />}
            />

            <StatCard
              titulo="Saldo pendiente"
              valor={formatMoneyINMOVAL(totalSaldoPendiente, monedaPrincipal)}
              detalle="Total pendiente en el rango filtrado."
              icon={<Receipt className="h-5 w-5" />}
            />
          </div>
        </Section>

        {/* 4. BITÁCORA */}
        <Section
          title="Bitácora"
          subtitle="Últimos movimientos registrados en la plataforma dentro del rango seleccionado."
        >
          <div className="mb-4">
            <Link
              to="/expedientes-plataforma"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
            >
              <ScrollText className="h-4 w-4" />
              Abrir bitácora
            </Link>
          </div>

          <div className="grid gap-3">
            {bitacoraFiltrada.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
              >
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                  <p className="font-medium text-slate-100">{item.titulo}</p>
                  <p className="text-xs text-slate-500">{item.creadoEn}</p>
                </div>
                {item.descripcion ? (
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {item.descripcion}
                  </p>
                ) : null}
              </article>
            ))}

            {bitacoraFiltrada.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-500">
                No hay movimientos registrados en el rango seleccionado.
              </div>
            ) : null}
          </div>
        </Section>
      </div>
    </main>
  );
}
