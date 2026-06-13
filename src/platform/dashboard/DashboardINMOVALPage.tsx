import { getConfiguracionExpedientesINMOVAL } from '@/platform/expedientes/expedienteConfigStorage';
import { getConfiguracionCotizacionesINMOVAL } from '@/platform/cotizaciones/cotizacionConfigStorage';
﻿import { Link } from 'react-router-dom';
import {
  BadgeDollarSign,
  Boxes,
  ClipboardList,
  FileText,
  History,
  LockKeyhole,
  PlusCircle,
  Send,
} from 'lucide-react';
import { getExpedientesIndiceINMOVAL } from '@/platform/expedientes/expedienteIndexStorage';
import { getCotizacionesIndiceINMOVAL } from '@/platform/cotizaciones/cotizacionIndexStorage';
import { getAllExpedienteActivityINMOVAL } from '@/platform/expedientes/expedienteActivityStorage';
import { DashboardMetricCard } from './components/DashboardMetricCard';
import { formatMoneyINMOVAL } from '@/platform/expedientes/expedienteUiUtils';

export default function DashboardINMOVALPage() {
  const configExpedientes = getConfiguracionExpedientesINMOVAL();
  const configCotizaciones = getConfiguracionCotizacionesINMOVAL();
  const expedientes = getExpedientesIndiceINMOVAL();
  const cotizaciones = getCotizacionesIndiceINMOVAL();
  const actividad = getAllExpedienteActivityINMOVAL().slice(0, 6);

  const expedientesAbiertos = expedientes.filter(
    (item) => item.estado !== 'cerrado' && item.estado !== 'cancelado'
  );

  const expedientesCerrados = expedientes.filter(
    (item) => item.estado === 'cerrado'
  );

  const cotizacionesPendientes = cotizaciones.filter(
    (item) => item.estado === 'borrador' || item.estado === 'enviada'
  );

  const saldoPendiente = expedientes.reduce(
    (total, expediente) => total + Number(expediente.saldo || 0),
    0
  );

  const montoCotizado = cotizaciones.reduce(
    (total, cotizacion) => total + Number(cotizacion.total || 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/30">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-300">
                Plataforma INMOVAL
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-50">
                Centro de control
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                Vista ejecutiva de expedientes, cotizaciones, pagos pendientes,
                cierres y actividad reciente de la plataforma.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/cotizaciones"
                className="inline-flex items-center gap-2 rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 py-3 text-sm font-medium text-sky-100 hover:bg-sky-400/20"
              >
                <PlusCircle className="h-4 w-4" />
                Cotización
              </Link>

              <Link
                to="/expedientes-plataforma"
                className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100 hover:bg-emerald-400/20"
              >
                <ClipboardList className="h-4 w-4" />
                Expedientes
              </Link>
            </div>
          </div>
        </header>
        <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-sky-300">
                Configuración activa de cotizaciones
              </p>
              <h2 className="mt-1 text-xl font-semibold text-slate-50">
                Reglas comerciales del área
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Estos parámetros gobiernan nuevas cotizaciones y su conversión a expedientes.
              </p>
            </div>

            <Link
              to="/cotizaciones/configuracion"
              className="inline-flex items-center justify-center rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 py-3 text-sm font-medium text-sky-100 transition hover:bg-sky-400/20"
            >
              Configurar cotizaciones
            </Link>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                Prefijo
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-100">
                {configCotizaciones.prefijoCotizacion}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                Servicio base
              </p>
              <p className="mt-2 truncate text-lg font-semibold text-slate-100">
                {configCotizaciones.servicioPredeterminado}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                Monto base
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-100">
                {configCotizaciones.monedaPredeterminada} {configCotizaciones.montoPredeterminado}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                Vigencia
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-100">
                {configCotizaciones.diasValidez} días
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                Expediente
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-100">
                {configCotizaciones.requiereAprobacionParaExpediente
                  ? 'Solo aprobada'
                  : 'Flexible'}
              </p>
            </div>
          </div>
        </section>


        <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber-300">
                Configuración activa de expedientes
              </p>
              <h2 className="mt-1 text-xl font-semibold text-slate-50">
                Reglas operativas del área
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Estos parámetros gobiernan la creación y cierre administrativo de expedientes.
              </p>
            </div>

            <Link
              to="/expedientes-plataforma/configuracion"
              className="inline-flex items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm font-medium text-amber-100 transition hover:bg-amber-400/20"
            >
              Configurar expedientes
            </Link>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                Prefijo
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-100">
                {configExpedientes.prefijoExpediente}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                Estado inicial
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-100">
                {configExpedientes.estadoInicial}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                Prioridad
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-100">
                {configExpedientes.prioridadPredeterminada}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                Entrega
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-100">
                {configExpedientes.diasEntregaEstimados} días
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                Cierre
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-100">
                {configExpedientes.requierePagoYFacturaParaCerrar
                  ? 'Pago + factura'
                  : 'Flexible'}
              </p>
            </div>
          </div>
        </section>



        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <DashboardMetricCard
            title="Expedientes abiertos"
            value={expedientesAbiertos.length}
            description="En proceso administrativo"
            icon={<ClipboardList className="h-5 w-5" />}
          />
          <DashboardMetricCard
            title="Cotizaciones pendientes"
            value={cotizacionesPendientes.length}
            description="Borradores o enviadas"
            icon={<Send className="h-5 w-5" />}
          />
          <DashboardMetricCard
            title="Saldo pendiente"
            value={formatMoneyINMOVAL(saldoPendiente, 'US$')}
            description="Por cobrar en expedientes"
            icon={<BadgeDollarSign className="h-5 w-5" />}
          />
          <DashboardMetricCard
            title="Expedientes cerrados"
            value={expedientesCerrados.length}
            description="Pagados y facturados"
            icon={<LockKeyhole className="h-5 w-5" />}
          />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                  Expedientes recientes
                </p>
                <h2 className="mt-1 text-xl font-semibold text-slate-100">
                  Últimos movimientos administrativos
                </h2>
              </div>

              <Link
                to="/expedientes-plataforma"
                className="rounded-2xl border border-slate-700 bg-slate-950/50 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                Ver todos
              </Link>
            </div>

            {expedientes.length === 0 ? (
              <p className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/50 p-5 text-sm text-slate-400">
                Todavía no hay expedientes en Plataforma INMOVAL.
              </p>
            ) : (
              <div className="mt-5 space-y-3">
                {expedientes.slice(0, 6).map((expediente) => (
                  <Link
                    key={expediente.id}
                    to={`/expedientes-plataforma/${expediente.id}`}
                    className="block rounded-2xl border border-slate-800 bg-slate-950/50 p-4 transition hover:border-sky-400/30 hover:bg-slate-900"
                  >
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                      <div>
                        <p className="font-semibold text-slate-100">
                          {expediente.codigo}
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                          {expediente.titulo}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {expediente.clienteNombre}
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="text-sm font-medium text-slate-100">
                          {formatMoneyINMOVAL(
                            expediente.saldo,
                            expediente.moneda
                          )}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {expediente.estado}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </article>

          <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-400/20 bg-purple-400/10 text-purple-300">
                <History className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                  Actividad reciente
                </p>
                <h2 className="text-xl font-semibold text-slate-100">
                  Bitácora de plataforma
                </h2>
              </div>
            </div>

            {actividad.length === 0 ? (
              <p className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/50 p-5 text-sm text-slate-400">
                Todavía no hay actividad reciente.
              </p>
            ) : (
              <div className="mt-5 space-y-3">
                {actividad.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4"
                  >
                    <p className="text-sm font-semibold text-slate-100">
                      {item.titulo}
                    </p>
                    {item.descripcion ? (
                      <p className="mt-1 text-sm text-slate-400">
                        {item.descripcion}
                      </p>
                    ) : null}
                    <p className="mt-3 text-xs text-slate-500">
                      {item.creadoEn}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </article>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <Link
            to="/cotizaciones"
            className="rounded-3xl border border-sky-400/20 bg-sky-400/10 p-5 text-sky-100 hover:bg-sky-400/20"
          >
            <FileText className="h-6 w-6" />
            <p className="mt-3 font-semibold">Gestionar cotizaciones</p>
            <p className="mt-1 text-sm text-sky-100/70">
              Total cotizado: {formatMoneyINMOVAL(montoCotizado, 'US$')}
            </p>
          </Link>

          <Link
            to="/modulos"
            className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5 text-emerald-100 hover:bg-emerald-400/20"
          >
            <Boxes className="h-6 w-6" />
            <p className="mt-3 font-semibold">Módulos técnicos</p>
            <p className="mt-1 text-sm text-emerald-100/70">
              Urbano activo; otros módulos preparados.
            </p>
          </Link>

          <Link
            to="/avaluos"
            className="rounded-3xl border border-slate-700 bg-slate-900 p-5 text-slate-100 hover:bg-slate-800"
          >
            <ClipboardList className="h-6 w-6" />
            <p className="mt-3 font-semibold">Avalúos técnicos</p>
            <p className="mt-1 text-sm text-slate-400">
              Acceso a la operación técnica actual.
            </p>
          </Link>
        </section>
      </div>
    </div>
  );
}
