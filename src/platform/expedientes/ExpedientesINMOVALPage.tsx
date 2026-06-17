import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Archive,
  DollarSign,
  Download,
  FileText,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Settings,
  Trash2,
  Upload,
} from 'lucide-react';

import {
  filtrarExpedientesIndiceINMOVAL,
  getExpedientesIndiceINMOVAL,
  removeExpedienteIndiceINMOVAL,
  upsertExpedienteIndiceINMOVAL,
} from './expedienteIndexStorage';
import { ExpedienteIndiceINMOVAL } from './expedienteIndexTypes';
import {
  MonedaINMOVAL,
  PrioridadExpedienteINMOVAL,
} from './expedienteTypes';

type EstadoFiltro = string | 'todos';
type TipoModuloFiltro = string | 'todos';
type EstadoPagoFiltro = string | 'todos';

const ESTADOS_EXPEDIENTE = [
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

const ESTADOS_EXPEDIENTE_LEGACY = [
  { value: 'cotizacion_aprobada', label: 'Nuevo' },
  { value: 'cotizacion_enviada', label: 'Nuevo' },
];

const PRIORIDADES: { value: PrioridadExpedienteINMOVAL; label: string }[] = [
  { value: 'baja', label: 'Baja' },
  { value: 'normal', label: 'Normal' },
  { value: 'alta', label: 'Alta' },
  { value: 'urgente', label: 'Urgente' },
];

const MODULOS = [
  { value: 'urbano', label: 'Urbano' },
  { value: 'rural', label: 'Rural' },
  { value: 'maquinaria', label: 'Maquinaria' },
  { value: 'vehiculos', label: 'Vehículos' },
  { value: 'especiales', label: 'Especiales' },
];

const ESTADOS_PAGO = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'parcial', label: 'Parcial' },
  { value: 'pagado', label: 'Pagado' },
  { value: 'no_aplica', label: 'No aplica' },
];

function formatMoney(value: number, moneda?: MonedaINMOVAL) {
  return `${moneda || 'US$'} ${Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function labelFromValue(value?: string) {
  if (!value) return 'Sin definir';

  const all = [...ESTADOS_EXPEDIENTE, ...ESTADOS_EXPEDIENTE_LEGACY, ...MODULOS, ...ESTADOS_PAGO, ...PRIORIDADES];
  const match = all.find((item) => item.value === value);

  if (match) return match.label;

  return value
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function estadoBadgeClass(estado?: string) {
  if (estado === 'cerrado' || estado === 'entregado') {
    return 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100';
  }

  if (estado === 'listo_para_entrega' || estado === 'avaluo_en_revision') {
    return 'border-sky-400/30 bg-sky-400/10 text-sky-100';
  }

  if (estado === 'en_cotizacion' || estado === 'cotizacion_aprobada' || estado === 'cotizacion_enviada') {
    return 'border-slate-500/40 bg-slate-500/10 text-slate-100';
  }

  return 'border-amber-400/30 bg-amber-400/10 text-amber-100';
}

function prioridadBadgeClass(prioridad?: string) {
  if (prioridad === 'urgente' || prioridad === 'alta') {
    return 'border-amber-400/30 bg-amber-400/10 text-amber-100';
  }

  if (prioridad === 'baja') {
    return 'border-slate-500/40 bg-slate-500/10 text-slate-100';
  }

  return 'border-sky-400/30 bg-sky-400/10 text-sky-100';
}

function pagoBadgeClass(estadoPago?: string) {
  if (estadoPago === 'pagado') {
    return 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100';
  }

  if (estadoPago === 'parcial') {
    return 'border-amber-400/30 bg-amber-400/10 text-amber-100';
  }

  if (estadoPago === 'pendiente') {
    return 'border-rose-400/30 bg-rose-400/10 text-rose-100';
  }

  return 'border-slate-500/40 bg-slate-500/10 text-slate-100';
}

function getMenuFloatingPosition(rect: DOMRect) {
  const menuWidth = 320;
  const menuHeight = 360;
  const margin = 16;

  const hasSpaceBelow = rect.bottom + menuHeight + margin < window.innerHeight;

  const top = hasSpaceBelow
    ? rect.bottom + 8
    : Math.max(margin, rect.top - menuHeight - 8);

  const left = Math.min(
    Math.max(margin, rect.right - menuWidth),
    window.innerWidth - menuWidth - margin
  );

  return { top, left };
}

function downloadJSON(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json;charset=utf-8',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
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
  icon: React.ReactNode;
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

export default function ExpedientesINMOVALPage() {
  const navigate = useNavigate();
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const [tipoModulo, setTipoModulo] = useState<TipoModuloFiltro>('todos');
  const [prioridad, setPrioridad] = useState<PrioridadExpedienteINMOVAL | 'todos'>('todos');
  const [estadoPago, setEstadoPago] = useState<EstadoPagoFiltro>('todos');
  const [menuExpedienteId, setMenuExpedienteId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);

  const expedientes = useMemo(() => getExpedientesIndiceINMOVAL(), [refreshKey]);

  const expedientesFiltrados = useMemo(
    () =>
      filtrarExpedientesIndiceINMOVAL(expedientes, {
        busqueda,
        tipoModulo: tipoModulo as any,
        prioridad,
        estadoPago: estadoPago as any,
      }),
    [expedientes, busqueda, tipoModulo, prioridad, estadoPago]
  );

  const expedienteMenuActivo = expedientes.find(
    (item) => item.id === menuExpedienteId
  );

  const total = expedientes.length;
  const abiertos = expedientes.filter(
    (item) => !['cerrado', 'entregado'].includes(String(item.estado))
  ).length;
  const urgentes = expedientes.filter((item) => item.prioridad === 'urgente').length;
  const saldo = expedientes.reduce((sum, item) => sum + Number(item.saldo || 0), 0);
  const moneda = expedientes.find((item) => item.moneda)?.moneda || 'US$';

  function refrescar() {
    setRefreshKey((value) => value + 1);
  }

  function handleImportarImv(file?: File) {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || '{}'));
        const expediente = parsed.expediente || parsed;

        if (!expediente?.id || !expediente?.codigo || !expediente?.clienteNombre) {
          window.alert('El archivo .imv no tiene una estructura válida.');
          return;
        }

        upsertExpedienteIndiceINMOVAL({
          ...expediente,
          actualizadoEn: new Date().toISOString(),
        });

        refrescar();
      } catch {
        window.alert('No se pudo importar el archivo .imv.');
      }
    };

    reader.readAsText(file);
  }

  function handleCambiarEstado() {
    // Estado controlado automáticamente por flujo.
  }

  function handleCambiarPrioridad(expediente: ExpedienteIndiceINMOVAL) {
    const opciones = PRIORIDADES.map(
      (item, index) => `${index + 1}. ${item.label} [${item.value}]`
    ).join('\n');

    const respuesta = window.prompt(
      `Nueva prioridad para ${expediente.codigo}:\n\n${opciones}\n\nEscribí el código de prioridad:`,
      expediente.prioridad
    );

    if (!respuesta) return;

    const nuevaPrioridad = respuesta.trim() as PrioridadExpedienteINMOVAL;
    const existe = PRIORIDADES.some((item) => item.value === nuevaPrioridad);

    if (!existe) {
      window.alert('Prioridad no válida.');
      return;
    }

    upsertExpedienteIndiceINMOVAL({
      ...expediente,
      prioridad: nuevaPrioridad,
      actualizadoEn: new Date().toISOString(),
    });

    refrescar();
  }

  function handleExportarImv(expediente: ExpedienteIndiceINMOVAL) {
    downloadJSON(`${expediente.codigo}.imv`, {
      version: 'INMOVAL-IMV-1',
      tipo: 'expediente',
      exportadoEn: new Date().toISOString(),
      expediente,
    });
  }

  function handleExportarPlantilla(expediente: ExpedienteIndiceINMOVAL) {
    downloadJSON(`${expediente.codigo}_plantilla_tecnica.imvtemplate`, {
      version: 'INMOVAL-PLANTILLA-TECNICA-1',
      tipo: 'plantilla_tecnica',
      creadaEn: new Date().toISOString(),
      origenExpediente: {
        id: expediente.id,
        codigo: expediente.codigo,
        clienteNombre: expediente.clienteNombre,
      },
      plantilla: {
        tipoModulo: expediente.tipoModulo,
        tipoInmuebleCodigo: expediente.tipoInmuebleCodigo,
        tipoInmuebleNombre: expediente.tipoInmuebleNombre,
        clasificacionInmuebleCodigo: expediente.clasificacionInmuebleCodigo,
        clasificacionInmuebleNombre: expediente.clasificacionInmuebleNombre,
        propositoAvaluoCodigo: expediente.propositoAvaluoCodigo,
        propositoAvaluoNombre: expediente.propositoAvaluoNombre,
        notas: expediente.notas,
        comparables: [],
        memorias: [],
        textos: [],
      },
    });
  }

  function handleEliminar(expediente: ExpedienteIndiceINMOVAL) {
    const confirmar = window.confirm(
      `¿Eliminar el expediente ${expediente.codigo}? Esta acción no se puede deshacer.`
    );

    if (!confirmar) return;

    removeExpedienteIndiceINMOVAL(expediente.id);
    refrescar();
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
                Expedientes
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                Gestión central de expedientes, estados, prioridades, pagos,
                entregas y avalúos técnicos.
              </p>
            </div>

            <div className="rounded-2xl border border-sky-400/20 bg-sky-400/10 px-4 py-3 text-sm text-sky-100">
              {expedientesFiltrados.length} expediente(s) visibles
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Total"
            value={total}
            description="Expedientes registrados"
            icon={<Archive className="h-5 w-5" />}
          />

          <MetricCard
            label="Abiertos"
            value={abiertos}
            description="Expedientes en curso"
            icon={<FileText className="h-5 w-5" />}
          />

          <MetricCard
            label="Urgentes"
            value={urgentes}
            description="Prioridad urgente"
            icon={<AlertTriangle className="h-5 w-5" />}
          />

          <MetricCard
            label="Saldo"
            value={formatMoney(saldo, moneda)}
            description="Saldo pendiente"
            icon={<DollarSign className="h-5 w-5" />}
          />
        </section>

        <section className="mt-4 rounded-3xl border border-slate-800 bg-slate-900/75 p-5 shadow-xl shadow-black/20">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                Acciones
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Acciones principales para iniciar o reconstruir expedientes.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate('/expedientes-plataforma/nuevo')}
                className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:bg-emerald-400/20"
              >
                <Plus className="h-4 w-4" />
                Nuevo expediente
              </button>

              <div className="group relative">
                <button
                  type="button"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-700 bg-slate-950/50 text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </button>

                <div className="invisible absolute right-0 z-20 mt-2 w-56 rounded-2xl border border-slate-800 bg-slate-950 p-2 opacity-0 shadow-2xl shadow-black/40 transition group-hover:visible group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => importInputRef.current?.click()}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Upload className="h-4 w-4" />
                    Importar .imv
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/configuracion-plataforma')}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Settings className="h-4 w-4" />
                    Configuración
                  </button>
                </div>
              </div>

              <input
                ref={importInputRef}
                type="file"
                accept=".imv,application/json"
                className="hidden"
                onChange={(event) => {
                  handleImportarImv(event.target.files?.[0]);
                  event.currentTarget.value = '';
                }}
              />
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/75 p-5 shadow-xl shadow-black/20">
          <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_180px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                placeholder="Buscar por código, cliente, ubicación, perito o factura..."
                className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950/70 pl-11 pr-3 text-sm text-slate-100 outline-none transition focus:border-sky-400"
              />
            </div>

            <select
              value={tipoModulo}
              onChange={(event) => setTipoModulo(event.target.value)}
              className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-sky-400"
            >
              <option value="todos">Todos los tipos</option>
              {MODULOS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <select
              value={prioridad}
              onChange={(event) =>
                setPrioridad(event.target.value as PrioridadExpedienteINMOVAL | 'todos')
              }
              className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-sky-400"
            >
              <option value="todos">Todas las prioridades</option>
              {PRIORIDADES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <select
              value={estadoPago}
              onChange={(event) => setEstadoPago(event.target.value)}
              className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-sky-400"
            >
              <option value="todos">Todos los pagos</option>
              {ESTADOS_PAGO.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/75 shadow-xl shadow-black/20">
          {expedientesFiltrados.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-lg font-semibold text-slate-100">
                No hay expedientes registrados
              </p>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400">
                Creá un expediente nuevo para iniciar el flujo o importá un archivo
                .imv existente.
              </p>

              <button
                type="button"
                onClick={() => navigate('/expedientes-plataforma/nuevo')}
                className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:bg-emerald-400/20"
              >
                <Plus className="h-4 w-4" />
                Nuevo expediente
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="px-5 py-4 font-medium">Expediente</th>
                    <th className="px-5 py-4 font-medium">Cliente</th>
                    <th className="px-5 py-4 font-medium">Inmueble / propósito</th>
                    <th className="px-5 py-4 font-medium">Estado</th>
                    <th className="px-5 py-4 font-medium">Prioridad</th>
                    <th className="px-5 py-4 font-medium">Perito</th>
                    <th className="px-5 py-4 font-medium">Entrega</th>
                    <th className="px-5 py-4 font-medium">Pago</th>
                    <th className="px-5 py-4 text-right font-medium">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {expedientesFiltrados.map((expediente) => (
                    <tr
                      key={expediente.id}
                      className="border-b border-slate-800/80 align-top last:border-0 hover:bg-slate-950/30"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-50">{expediente.codigo}</p>
                        <p className="mt-1 text-xs text-slate-500">{expediente.titulo}</p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-slate-100">{expediente.clienteNombre}</p>
                        {expediente.informacionContacto ? (
                          <p className="mt-1 max-w-[180px] truncate text-xs text-slate-500">
                            {expediente.informacionContacto}
                          </p>
                        ) : null}
                      </td>

                      <td className="px-5 py-4">
                        <p className="max-w-[240px] truncate text-slate-100">
                          {expediente.tipoInmuebleNombre || labelFromValue(expediente.tipoModulo)}
                        </p>
                        <p className="mt-1 max-w-[240px] truncate text-xs text-slate-500">
                          {expediente.propositoAvaluoNombre || expediente.direccionInmueble || 'Sin propósito definido'}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${estadoBadgeClass(String(expediente.estado))}`}>
                          {labelFromValue(String(expediente.estado))}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${prioridadBadgeClass(expediente.prioridad)}`}>
                          {labelFromValue(expediente.prioridad)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-300">
                        {expediente.peritoNombre || 'Sin asignar'}
                      </td>

                      <td className="px-5 py-4 text-slate-300">
                        {expediente.fechaEntregaEstimada || 'Sin fecha'}
                      </td>

                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${pagoBadgeClass(String(expediente.estadoPago))}`}>
                          {labelFromValue(String(expediente.estadoPago))}
                        </span>
                        <p className="mt-2 text-xs font-semibold text-slate-100">
                          {formatMoney(expediente.saldo, expediente.moneda)}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setMenuExpedienteId(expediente.id)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-700 bg-slate-950/60 text-slate-200 transition hover:border-sky-400/40 hover:bg-sky-400/10 hover:text-sky-100"
                          aria-label="Acciones del expediente"
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
      {expedienteMenuActivo ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Cerrar acciones"
            className="absolute inset-0 bg-black/30"
            onClick={() => {
              setMenuExpedienteId(null);
              setMenuPosition(null);
            }}
          />

          <aside className="absolute bottom-0 right-0 top-0 w-full max-w-md overflow-y-auto border-l border-slate-800 bg-slate-950 p-5 shadow-2xl shadow-black/70">
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Acciones de expediente
                </p>
                <p className="mt-2 text-base font-semibold text-slate-100">
                  {expedienteMenuActivo.codigo}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {expedienteMenuActivo.clienteNombre}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMenuExpedienteId(null);
                  setMenuPosition(null);
                }}
                className="rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-5 grid gap-2">
              <button
                type="button"
                onClick={() => {
                  setMenuExpedienteId(null);
                  setMenuPosition(null);
                  navigate('/expedientes-plataforma/' + expedienteMenuActivo.id);
                }}
                className="flex w-full items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-left text-sm text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FileText className="h-4 w-4" />
                Abrir expediente
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuExpedienteId(null);
                  setMenuPosition(null);
                  navigate('/expedientes-plataforma/' + expedienteMenuActivo.id + '?modo=editar');
                }}
                className="flex w-full items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-left text-sm text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Pencil className="h-4 w-4" />
                Editar expediente
              </button>

              <div className="my-3 border-t border-slate-800" />

              <button
                type="button"
                onClick={() => {
                  handleCambiarEstado(expedienteMenuActivo);
                  setMenuExpedienteId(null);
                  setMenuPosition(null);
                }}
                className="flex w-full items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-left text-sm text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Archive className="h-4 w-4" />
                Estado controlado por flujo
              </button>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3">
                <div className="mb-2 flex items-center gap-2 text-sm text-slate-300">
                  <AlertTriangle className="h-4 w-4" />
                  Prioridad
                </div>

                <select
                  value={expedienteMenuActivo.prioridad || 'normal'}
                  onChange={(event) => {
                    upsertExpedienteIndiceINMOVAL({
                      ...expedienteMenuActivo,
                      prioridad: event.target.value as PrioridadExpedienteINMOVAL,
                      actualizadoEn: new Date().toISOString(),
                    });

                    refrescar();
                    setMenuExpedienteId(null);
                    setMenuPosition(null);
                  }}
                  className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-sky-400"
                >
                  <option value="baja">Baja</option>
                  <option value="normal">Normal</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>

              <div className="my-3 border-t border-slate-800" />

              <button
                type="button"
                onClick={() => {
                  handleExportarImv(expedienteMenuActivo);
                  setMenuExpedienteId(null);
                  setMenuPosition(null);
                }}
                className="flex w-full items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-left text-sm text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Download className="h-4 w-4" />
                Exportar .imv
              </button>

              <button
                type="button"
                onClick={() => {
                  handleExportarPlantilla(expedienteMenuActivo);
                  setMenuExpedienteId(null);
                  setMenuPosition(null);
                }}
                className="flex w-full items-center gap-3 rounded-2xl border border-violet-400/30 bg-violet-400/10 px-4 py-3 text-left text-sm text-violet-100 hover:bg-violet-400/20"
              >
                <FileText className="h-4 w-4" />
                Crear plantilla técnica
              </button>

              <div className="my-3 border-t border-slate-800" />

              <button
                type="button"
                onClick={() => {
                  handleEliminar(expedienteMenuActivo);
                  setMenuExpedienteId(null);
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
                {labelFromValue(String(expedienteMenuActivo.estado))}
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Desde este panel se gestionan las acciones principales del expediente.
              </p>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
