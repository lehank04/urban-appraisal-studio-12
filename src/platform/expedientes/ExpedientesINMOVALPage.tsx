import { getConfiguracionExpedientesINMOVAL } from './expedienteConfigStorage';
﻿import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Archive, ClipboardList, DollarSign, FileText, Search,
  Settings,
  Upload,
  PlusCircle, ArrowLeft, Boxes } from 'lucide-react';
import { getExpedientesIndiceINMOVAL } from './expedienteIndexStorage';
import { sincronizarAvaluosLegacyConIndicePlataforma } from './legacyAvaluoIndexBridge';
import {
  ExpedienteIndiceFiltrosINMOVAL,
  ExpedienteIndiceINMOVAL,
} from './expedienteIndexTypes';
import { filtrarExpedientesIndiceINMOVAL } from './expedienteIndexStorage';
import { ExpedienteEstadoBadge } from './components/ExpedienteEstadoBadge';
import { ExpedienteResumenCard } from './components/ExpedienteResumenCard';
import {
  formatMoneyINMOVAL,
  getModuloLabel,
} from './expedienteUiUtils';

const filtrosIniciales: ExpedienteIndiceFiltrosINMOVAL = {
  busqueda: '',
  tipoModulo: 'todos',
  estado: 'todos',
  prioridad: 'todos',
  estadoPago: 'todos',
};

export default function ExpedientesINMOVALPage() {
  const configExpedientes = getConfiguracionExpedientesINMOVAL();
  const [expedientes, setExpedientes] = useState<ExpedienteIndiceINMOVAL[]>([]);
  const [filtros, setFiltros] = useState<ExpedienteIndiceFiltrosINMOVAL>(
    filtrosIniciales
  );

  useEffect(() => {
    setExpedientes(getExpedientesIndiceINMOVAL());
  }, []);

  function handleSincronizarLegacy() {
    const result = sincronizarAvaluosLegacyConIndicePlataforma();
    setExpedientes(getExpedientesIndiceINMOVAL());

    console.info('Sincronización INMOVAL completada:', result);
  }

  const expedientesFiltrados = useMemo(() => {
    return filtrarExpedientesIndiceINMOVAL(expedientes, filtros);
  }, [expedientes, filtros]);

  const resumen = useMemo(() => {
    const total = expedientes.length;
    const abiertos = expedientes.filter(
      (expediente) =>
        expediente.estado !== 'cerrado' && expediente.estado !== 'cancelado'
    ).length;
    const urgentes = expedientes.filter(
      (expediente) => expediente.prioridad === 'urgente'
    ).length;
    const saldoPendiente = expedientes.reduce(
      (totalSaldo, expediente) => totalSaldo + Number(expediente.saldo || 0),
      0
    );

    return {
      total,
      abiertos,
      urgentes,
      saldoPendiente,
    };
  }, [expedientes]);

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/30">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-300">
                INMOVAL
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-50">
                Expedientes
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                Vista operativa para controlar expedientes, estados,
                prioridades, pagos, facturación, revisiones y módulos técnicos.
                Esta pantalla usa el índice local de INMOVAL.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">

              <div className="rounded-2xl border border-sky-400/20 bg-sky-400/10 px-4 py-3 text-sm text-sky-100">
                {expedientesFiltrados.length} expediente(s) visibles
              </div>
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <ExpedienteResumenCard
            titulo="Total"
            valor={resumen.total}
            descripcion="Expedientes registrados"
            icono={<Archive className="h-5 w-5" />}
          />
          <ExpedienteResumenCard
            titulo="Abiertos"
            valor={resumen.abiertos}
            descripcion="En proceso operativo"
            icono={<ClipboardList className="h-5 w-5" />}
          />
          <ExpedienteResumenCard
            titulo="Urgentes"
            valor={resumen.urgentes}
            descripcion="Prioridad crítica"
            icono={<AlertTriangle className="h-5 w-5" />}
          />
          <ExpedienteResumenCard
            titulo="Saldo"
            valor={formatMoneyINMOVAL(resumen.saldoPendiente, 'US$')}
            descripcion="Pendiente estimado"
            icono={<DollarSign className="h-5 w-5" />}
          />
        </section>

        <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-black/20">
          <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_180px]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={filtros.busqueda || ''}
                onChange={(event) =>
                  setFiltros((actual) => ({
                    ...actual,
                    busqueda: event.target.value,
                  }))
                }
                placeholder="Buscar por código, cliente, perito o factura..."
                className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950/70 pl-10 pr-4 text-sm text-slate-100 outline-none transition focus:border-sky-400"
              />
            </label>

            <select
              value={filtros.tipoModulo || 'todos'}
              onChange={(event) =>
                setFiltros((actual) => ({
                  ...actual,
                  tipoModulo: event.target.value as ExpedienteIndiceFiltrosINMOVAL['tipoModulo'],
                }))
              }
              className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-sky-400"
            >
              <option value="todos">Todos los módulos</option>
              <option value="urbano">Urbano</option>
              <option value="rural">Rural</option>
              <option value="maquinaria">Maquinaria</option>
              <option value="vehiculo">Vehículos</option>
              <option value="especial">Especiales</option>
            </select>

            <select
              value={filtros.prioridad || 'todos'}
              onChange={(event) =>
                setFiltros((actual) => ({
                  ...actual,
                  prioridad: event.target.value as ExpedienteIndiceFiltrosINMOVAL['prioridad'],
                }))
              }
              className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-sky-400"
            >
              <option value="todos">Todas las prioridades</option>
              <option value="baja">Baja</option>
              <option value="normal">Normal</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>

            <select
              value={filtros.estadoPago || 'todos'}
              onChange={(event) =>
                setFiltros((actual) => ({
                  ...actual,
                  estadoPago: event.target.value as ExpedienteIndiceFiltrosINMOVAL['estadoPago'],
                }))
              }
              className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-sky-400"
            >
              <option value="todos">Todos los pagos</option>
              <option value="pendiente">Pendiente</option>
              <option value="parcial">Parcial</option>
              <option value="pagado">Pagado</option>
              <option value="no_aplica">No aplica</option>
            </select>
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 shadow-xl shadow-black/20">
          {expedientesFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-700 bg-slate-950/70">
                <FileText className="h-7 w-7 text-slate-400" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-slate-100">
                No hay expedientes registrados
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                Esta pantalla ya está preparada. En los siguientes bloques vamos
                a conectar la creación de expedientes, cotizaciones y sincronización
                con el índice de expedientes.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800 text-sm">
                <thead className="bg-slate-950/60">
                  <tr>
                    <th className="px-5 py-4 text-left font-medium text-slate-400">
                      Expediente
                    </th>
                    <th className="px-5 py-4 text-left font-medium text-slate-400">
                      Cliente
                    </th>
                    <th className="px-5 py-4 text-left font-medium text-slate-400">
                      Módulo
                    </th>
                    <th className="px-5 py-4 text-left font-medium text-slate-400">
                      Estado
                    </th>
                    <th className="px-5 py-4 text-left font-medium text-slate-400">
                      Prioridad
                    </th>
                    <th className="px-5 py-4 text-left font-medium text-slate-400">
                      Pago
                    </th>
                    <th className="px-5 py-4 text-right font-medium text-slate-400">
                      Saldo
                    </th>
                    <th className="px-5 py-4 text-right font-medium text-slate-400">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800">
                  {expedientesFiltrados.map((expediente) => (
                    <tr key={expediente.id} className="hover:bg-slate-800/40">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-100">
                          {expediente.codigo}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {expediente.titulo}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-slate-300">
                        {expediente.clienteNombre}
                      </td>
                      <td className="px-5 py-4 text-slate-300">
                        {getModuloLabel(expediente.tipoModulo)}
                      </td>
                      <td className="px-5 py-4">
                        <ExpedienteEstadoBadge
                          tipo="estado"
                          value={expediente.estado}
                        />
                      </td>
                      <td className="px-5 py-4">
                        <ExpedienteEstadoBadge
                          tipo="prioridad"
                          value={expediente.prioridad}
                        />
                      </td>
                      <td className="px-5 py-4">
                        <ExpedienteEstadoBadge
                          tipo="pago"
                          value={expediente.estadoPago}
                        />
                      </td>
                      <td className="px-5 py-4 text-right font-medium text-slate-100">
                        {formatMoneyINMOVAL(expediente.saldo, expediente.moneda)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          to={`/expedientes-plataforma/${expediente.id}`}
                          className="inline-flex rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-xs font-medium text-sky-100 hover:bg-sky-400/20"
                        >
                          Abrir expediente
                        </Link>
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
