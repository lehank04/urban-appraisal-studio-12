import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  FileText,
  Search,
  Send,
  Wallet,
  XCircle,
  ArrowLeft,
  Archive,
  ExternalLink,
} from 'lucide-react';
import { EstadoCotizacion } from '@/shared/types/inmovalCore';
import {
  getCotizacionesIndiceINMOVAL,
  upsertCotizacionINMOVAL,
} from './cotizacionIndexStorage';
import { CotizacionINMOVAL } from './cotizacionTypes';
import { CotizacionEstadoBadge } from './components/CotizacionEstadoBadge';
import { CotizacionResumenCard } from './components/CotizacionResumenCard';
import {
  cotizacionCoincideConBusqueda,
  formatMoneyCotizacion,
} from './cotizacionUiUtils';
import { crearCotizacionDemoINMOVAL } from './cotizacionDemoFactory';
import { crearExpedienteDeCotizacionAprobada } from './cotizacionExpedienteBridge';
import { nowISO } from '@/shared/utils/dateUtils';

type CotizacionFiltroEstado = EstadoCotizacion | 'todos';

export default function CotizacionesINMOVALPage() {
  const [cotizaciones, setCotizaciones] = useState<CotizacionINMOVAL[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState<CotizacionFiltroEstado>('todos');

  useEffect(() => {
    setCotizaciones(getCotizacionesIndiceINMOVAL());
  }, []);

  function refrescarCotizaciones() {
    setCotizaciones(getCotizacionesIndiceINMOVAL());
  }

  function handleCrearCotizacionDemo() {
    const nuevaCotizacion = crearCotizacionDemoINMOVAL();

    upsertCotizacionINMOVAL(nuevaCotizacion);
    refrescarCotizaciones();
  }

  function handleCambiarEstadoCotizacion(
    cotizacion: CotizacionINMOVAL,
    nuevoEstado: EstadoCotizacion
  ) {
    const ahora = nowISO();

    const actualizada: CotizacionINMOVAL = {
      ...cotizacion,
      estado: nuevoEstado,
      enviadaEn:
        nuevoEstado === 'enviada'
          ? ahora
          : cotizacion.enviadaEn,
      aprobadaEn:
        nuevoEstado === 'aprobada'
          ? ahora
          : cotizacion.aprobadaEn,
      rechazadaEn:
        nuevoEstado === 'rechazada'
          ? ahora
          : cotizacion.rechazadaEn,
      actualizadoEn: ahora,
    };

    upsertCotizacionINMOVAL(actualizada);
    refrescarCotizaciones();
  }

  function handleCrearExpedienteDesdeCotizacion(cotizacion: CotizacionINMOVAL) {
    const expediente = crearExpedienteDeCotizacionAprobada(cotizacion);

    const actualizada: CotizacionINMOVAL = {
      ...cotizacion,
      expedienteId: expediente.id,
      actualizadoEn: nowISO(),
    };

    upsertCotizacionINMOVAL(actualizada);
    refrescarCotizaciones();
  }

  const cotizacionesFiltradas = useMemo(() => {
    return cotizaciones.filter((cotizacion) => {
      if (estado !== 'todos' && cotizacion.estado !== estado) return false;

      return cotizacionCoincideConBusqueda({
        numero: cotizacion.numero,
        clienteNombre: cotizacion.cliente?.nombre,
        servicio: cotizacion.servicio,
        busqueda,
      });
    });
  }, [cotizaciones, busqueda, estado]);

  const resumen = useMemo(() => {
    const total = cotizaciones.length;
    const enviadas = cotizaciones.filter((item) => item.estado === 'enviada').length;
    const aprobadas = cotizaciones.filter((item) => item.estado === 'aprobada').length;
    const rechazadas = cotizaciones.filter((item) => item.estado === 'rechazada').length;
    const montoTotal = cotizaciones.reduce(
      (totalMonto, cotizacion) => totalMonto + Number(cotizacion.total || 0),
      0
    );

    return {
      total,
      enviadas,
      aprobadas,
      rechazadas,
      montoTotal,
    };
  }, [cotizaciones]);

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
                Cotizaciones
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                Vista administrativa para controlar cotizaciones, estados,
                montos, clientes, vencimientos y conversión a expediente.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-600 bg-slate-950/50 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Link>

              <Link
                to="/expedientes-plataforma"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:bg-emerald-400/20"
              >
                <Archive className="h-4 w-4" />
                Expedientes
              </Link>

              <button
                type="button"
                onClick={handleCrearCotizacionDemo}
                className="rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 py-3 text-sm font-medium text-sky-100 transition hover:bg-sky-400/20"
              >
                Crear cotización demo
              </button>

              <div className="rounded-2xl border border-sky-400/20 bg-sky-400/10 px-4 py-3 text-sm text-sky-100">
                {cotizacionesFiltradas.length} cotización(es) visibles
              </div>
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <CotizacionResumenCard
            titulo="Total"
            valor={resumen.total}
            descripcion="Cotizaciones registradas"
            icono={<FileText className="h-5 w-5" />}
          />
          <CotizacionResumenCard
            titulo="Enviadas"
            valor={resumen.enviadas}
            descripcion="Pendientes de respuesta"
            icono={<Send className="h-5 w-5" />}
          />
          <CotizacionResumenCard
            titulo="Aprobadas"
            valor={resumen.aprobadas}
            descripcion="Listas para expediente"
            icono={<CheckCircle2 className="h-5 w-5" />}
          />
          <CotizacionResumenCard
            titulo="Rechazadas"
            valor={resumen.rechazadas}
            descripcion="No aceptadas"
            icono={<XCircle className="h-5 w-5" />}
          />
          <CotizacionResumenCard
            titulo="Monto"
            valor={formatMoneyCotizacion(resumen.montoTotal, 'US$')}
            descripcion="Total cotizado"
            icono={<Wallet className="h-5 w-5" />}
          />
        </section>

        <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-black/20">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                placeholder="Buscar por número, cliente o servicio..."
                className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950/70 pl-10 pr-4 text-sm text-slate-100 outline-none transition focus:border-sky-400"
              />
            </label>

            <select
              value={estado}
              onChange={(event) =>
                setEstado(event.target.value as CotizacionFiltroEstado)
              }
              className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-sky-400"
            >
              <option value="todos">Todos los estados</option>
              <option value="borrador">Borrador</option>
              <option value="enviada">Enviada</option>
              <option value="aprobada">Aprobada</option>
              <option value="rechazada">Rechazada</option>
              <option value="vencida">Vencida</option>
            </select>
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 shadow-xl shadow-black/20">
          {cotizacionesFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-700 bg-slate-950/70">
                <FileText className="h-7 w-7 text-slate-400" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-slate-100">
                No hay cotizaciones en el índice de Plataforma INMOVAL
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                Creá una cotización demo para probar el flujo administrativo.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800 text-sm">
                <thead className="bg-slate-950/60">
                  <tr>
                    <th className="px-5 py-4 text-left font-medium text-slate-400">
                      Cotización
                    </th>
                    <th className="px-5 py-4 text-left font-medium text-slate-400">
                      Cliente
                    </th>
                    <th className="px-5 py-4 text-left font-medium text-slate-400">
                      Servicio
                    </th>
                    <th className="px-5 py-4 text-left font-medium text-slate-400">
                      Estado
                    </th>
                    <th className="px-5 py-4 text-left font-medium text-slate-400">
                      Fecha
                    </th>
                    <th className="px-5 py-4 text-right font-medium text-slate-400">
                      Total
                    </th>
                    <th className="px-5 py-4 text-right font-medium text-slate-400">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800">
                  {cotizacionesFiltradas.map((cotizacion) => (
                    <tr key={cotizacion.id} className="hover:bg-slate-800/40">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-100">
                          {cotizacion.numero}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {cotizacion.expedienteId
                            ? `Expediente creado: ${cotizacion.expedienteId}`
                            : 'Sin expediente asociado'}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-slate-300">
                        {cotizacion.cliente?.nombre || 'Cliente pendiente'}
                      </td>
                      <td className="px-5 py-4 text-slate-300">
                        {cotizacion.servicio}
                      </td>
                      <td className="px-5 py-4">
                        <CotizacionEstadoBadge estado={cotizacion.estado} />
                      </td>
                      <td className="px-5 py-4 text-slate-300">
                        {cotizacion.fecha}
                      </td>
                      <td className="px-5 py-4 text-right font-medium text-slate-100">
                        {formatMoneyCotizacion(cotizacion.total, cotizacion.moneda)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap justify-end gap-2">
                          {cotizacion.estado === 'borrador' ? (
                            <button
                              type="button"
                              onClick={() =>
                                handleCambiarEstadoCotizacion(
                                  cotizacion,
                                  'enviada'
                                )
                              }
                              className="rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-xs font-medium text-sky-100 hover:bg-sky-400/20"
                            >
                              Enviar
                            </button>
                          ) : null}

                          {cotizacion.estado !== 'aprobada' ? (
                            <button
                              type="button"
                              onClick={() =>
                                handleCambiarEstadoCotizacion(
                                  cotizacion,
                                  'aprobada'
                                )
                              }
                              className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-100 hover:bg-emerald-400/20"
                            >
                              Aprobar
                            </button>
                          ) : null}

                          {cotizacion.estado !== 'rechazada' ? (
                            <button
                              type="button"
                              onClick={() =>
                                handleCambiarEstadoCotizacion(
                                  cotizacion,
                                  'rechazada'
                                )
                              }
                              className="rounded-full border border-rose-400/30 bg-rose-400/10 px-3 py-1 text-xs font-medium text-rose-100 hover:bg-rose-400/20"
                            >
                              Rechazar
                            </button>
                          ) : null}

                          {cotizacion.estado === 'aprobada' &&
                          !cotizacion.expedienteId ? (
                            <button
                              type="button"
                              onClick={() =>
                                handleCrearExpedienteDesdeCotizacion(cotizacion)
                              }
                              className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-100 hover:bg-amber-400/20"
                            >
                              Crear expediente
                            </button>
                          ) : null}

                          {cotizacion.expedienteId ? (
                            <Link
                              to="/expedientes-plataforma"
                              className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-100 hover:bg-emerald-400/20"
                            >
                              Ver expediente
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
