import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  CalendarDays,
  ClipboardList,
  DollarSign,
  Save,
  User,
  UserSquare2,
} from 'lucide-react';
import { TipoModuloTecnico } from '@/shared/types/inmovalCore';
import { addDaysISO, nowISO, todayISO } from '@/shared/utils/dateUtils';
import { getConfiguracionExpedientesINMOVAL } from './expedienteConfigStorage';
import { upsertExpedienteIndiceINMOVAL } from './expedienteIndexStorage';
import { ExpedienteIndiceINMOVAL } from './expedienteIndexTypes';
import {
  MonedaINMOVAL,
  PrioridadExpedienteINMOVAL,
} from './expedienteTypes';

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function buildCodigoExpediente(prefijo: string) {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');

  return `${prefijo || 'EXP'}-${yyyy}${mm}${dd}-${hh}${min}${ss}`;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
      {children}
    </span>
  );
}

export default function NuevoExpedienteINMOVALPage() {
  const navigate = useNavigate();
  const config = useMemo(() => getConfiguracionExpedientesINMOVAL(), []);

  const [clienteNombre, setClienteNombre] = useState('');
  const [titulo, setTitulo] = useState('Avalúo de inmueble urbano');
  const [peritoNombre, setPeritoNombre] = useState('');
  const [tipoModulo, setTipoModulo] = useState<TipoModuloTecnico>('urbano');
  const [prioridad, setPrioridad] = useState<PrioridadExpedienteINMOVAL>(
    config.prioridadPredeterminada
  );
  const [moneda, setMoneda] = useState<MonedaINMOVAL>(
    config.monedaPredeterminada
  );
  const [costoServicio, setCostoServicio] = useState('0');
  const [fechaEntregaEstimada, setFechaEntregaEstimada] = useState(
    addDaysISO(todayISO(), config.diasEntregaEstimados)
  );

  function handleCrearExpediente() {
    const costo = Number(costoServicio || 0);

    if (!clienteNombre.trim()) {
      window.alert('Ingresá el nombre del cliente.');
      return;
    }

    if (!titulo.trim()) {
      window.alert('Ingresá el título o servicio del expediente.');
      return;
    }

    if (!Number.isFinite(costo) || costo < 0) {
      window.alert('Ingresá un costo válido.');
      return;
    }

    const id = createId();
    const codigo = buildCodigoExpediente(config.prefijoExpediente);
    const ahora = nowISO();

    const expediente: ExpedienteIndiceINMOVAL = {
      id,
      codigo,
      titulo: titulo.trim(),

      tipoModulo,
      estado: config.estadoInicial,
      prioridad,

      clienteNombre: clienteNombre.trim(),
      peritoNombre: peritoNombre.trim() || undefined,

      fechaSolicitud: todayISO(),
      fechaEntregaEstimada: fechaEntregaEstimada || undefined,
      fechaCierre: undefined,

      costoServicio: costo,
      montoPagado: 0,
      saldo: costo,
      moneda,
      estadoPago: costo > 0 ? 'pendiente' : 'no_aplica',

      facturaEmitida: false,
      numeroFactura: undefined,

      revisionActivaCodigo: 'Rev00',
      totalRevisiones: 0,

      driveUrl: undefined,
      archivoImvNombre: `${codigo}.imv`,

      creadoEn: ahora,
      actualizadoEn: ahora,
    };

    upsertExpedienteIndiceINMOVAL(expediente);
    navigate(`/expedientes-plataforma/${id}`);
  }

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
                Nuevo expediente administrativo
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                Crea un expediente directamente desde la plataforma. Los valores
                iniciales se toman de la configuración de expedientes.
              </p>
            </div>

            <div className="rounded-2xl border border-sky-400/20 bg-sky-400/10 px-4 py-3 text-sm text-sky-100">
              Código: {config.prefijoExpediente}- automático
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
          <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                  Datos principales
                </p>
                <h2 className="text-lg font-semibold text-slate-100">
                  Información del expediente
                </h2>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <FieldLabel>Cliente</FieldLabel>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    value={clienteNombre}
                    onChange={(event) => setClienteNombre(event.target.value)}
                    placeholder="Nombre del cliente"
                    className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950/70 pl-10 pr-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                  />
                </div>
              </label>

              <label className="grid gap-2">
                <FieldLabel>Perito asignado</FieldLabel>
                <div className="relative">
                  <UserSquare2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    value={peritoNombre}
                    onChange={(event) => setPeritoNombre(event.target.value)}
                    placeholder="Nombre del perito"
                    className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950/70 pl-10 pr-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                  />
                </div>
              </label>

              <label className="grid gap-2 md:col-span-2">
                <FieldLabel>Título / servicio</FieldLabel>
                <input
                  value={titulo}
                  onChange={(event) => setTitulo(event.target.value)}
                  placeholder="Avalúo de inmueble urbano"
                  className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                />
              </label>

              <label className="grid gap-2">
                <FieldLabel>Módulo técnico</FieldLabel>
                <div className="relative">
                  <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <select
                    value={tipoModulo}
                    onChange={(event) =>
                      setTipoModulo(event.target.value as TipoModuloTecnico)
                    }
                    className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950/70 pl-10 pr-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                  >
                    <option value="urbano">Urbano</option>
                    <option value="rural">Rural</option>
                    <option value="maquinaria">Maquinaria</option>
                    <option value="vehiculos">Vehículos</option>
                    <option value="especiales">Especiales</option>
                  </select>
                </div>
              </label>

              <label className="grid gap-2">
                <FieldLabel>Prioridad</FieldLabel>
                <select
                  value={prioridad}
                  onChange={(event) =>
                    setPrioridad(event.target.value as PrioridadExpedienteINMOVAL)
                  }
                  className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                >
                  <option value="baja">Baja</option>
                  <option value="normal">Normal</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </label>

              <label className="grid gap-2">
                <FieldLabel>Costo del servicio</FieldLabel>
                <div className="relative">
                  <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={costoServicio}
                    onChange={(event) => setCostoServicio(event.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950/70 pl-10 pr-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                  />
                </div>
              </label>

              <label className="grid gap-2">
                <FieldLabel>Moneda</FieldLabel>
                <select
                  value={moneda}
                  onChange={(event) =>
                    setMoneda(event.target.value as MonedaINMOVAL)
                  }
                  className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                >
                  <option value="US$">US$</option>
                  <option value="C$">C$</option>
                </select>
              </label>

              <label className="grid gap-2">
                <FieldLabel>Fecha estimada de entrega</FieldLabel>
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="date"
                    value={fechaEntregaEstimada}
                    onChange={(event) =>
                      setFechaEntregaEstimada(event.target.value)
                    }
                    className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950/70 pl-10 pr-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                  />
                </div>
              </label>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleCrearExpediente}
                className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:bg-emerald-400/20"
              >
                <Save className="h-4 w-4" />
                Crear expediente
              </button>

              <button
                type="button"
                onClick={() => navigate('/expedientes-plataforma')}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950/50 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
              >
                Cancelar
              </button>
            </div>
          </article>

          <aside className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/10 text-sky-300">
              <ArrowRight className="h-5 w-5" />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-100">
              Valores aplicados desde configuración
            </h2>

            <div className="mt-5 grid gap-3 text-sm">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                <p className="text-slate-500">Prefijo</p>
                <p className="mt-1 font-semibold text-slate-100">
                  {config.prefijoExpediente}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                <p className="text-slate-500">Estado inicial</p>
                <p className="mt-1 font-semibold text-slate-100">
                  {config.estadoInicial}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                <p className="text-slate-500">Días estimados</p>
                <p className="mt-1 font-semibold text-slate-100">
                  {config.diasEntregaEstimados}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                <p className="text-slate-500">Archivo inicial</p>
                <p className="mt-1 font-semibold text-slate-100">
                  Código.imv
                </p>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
