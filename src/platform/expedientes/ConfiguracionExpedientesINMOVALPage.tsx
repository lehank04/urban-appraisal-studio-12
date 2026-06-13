import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  RotateCcw,
  Save,
  Settings,
} from 'lucide-react';
import { EstadoExpedienteINMOVAL } from '@/shared/types/inmovalCore';
import {
  MonedaINMOVAL,
  PrioridadExpedienteINMOVAL,
} from './expedienteTypes';
import {
  ConfiguracionExpedientesINMOVAL,
  getConfiguracionExpedientesINMOVAL,
  resetConfiguracionExpedientesINMOVAL,
  saveConfiguracionExpedientesINMOVAL,
} from './expedienteConfigStorage';

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
      {children}
    </span>
  );
}

export default function ConfiguracionExpedientesINMOVALPage() {
  const [config, setConfig] = useState<ConfiguracionExpedientesINMOVAL>(
    () => getConfiguracionExpedientesINMOVAL()
  );

  const [saved, setSaved] = useState(false);

  function updateConfig(cambios: Partial<ConfiguracionExpedientesINMOVAL>) {
    setConfig((current) => ({
      ...current,
      ...cambios,
    }));

    setSaved(false);
  }

  function handleGuardar() {
    saveConfiguracionExpedientesINMOVAL(config);
    setConfig(getConfiguracionExpedientesINMOVAL());
    setSaved(true);
  }

  function handleReset() {
    const reset = resetConfiguracionExpedientesINMOVAL();

    setConfig(reset);
    setSaved(true);
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
                Configuración de Expedientes
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                Parámetros propios del área de expedientes. Esta configuración
                controla valores predeterminados, reglas de cierre y comportamiento
                visible dentro de Expedientes.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/expedientes-plataforma"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950/50 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Expedientes
              </Link>

              <button
                type="button"
                onClick={handleGuardar}
                className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:bg-emerald-400/20"
              >
                <Save className="h-4 w-4" />
                Guardar
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950/50 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
              >
                <RotateCcw className="h-4 w-4" />
                Restaurar
              </button>
            </div>
          </div>

          {saved ? (
            <div className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
              <CheckCircle2 className="h-4 w-4" />
              Configuración de expedientes guardada.
            </div>
          ) : null}
        </header>

        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/10 text-sky-300">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                  Datos base
                </p>
                <h2 className="text-lg font-semibold text-slate-100">
                  Valores predeterminados
                </h2>
              </div>
            </div>

            <div className="mt-5 grid gap-4">
              <label className="grid gap-2">
                <FieldLabel>Prefijo de expediente</FieldLabel>
                <input
                  value={config.prefijoExpediente}
                  onChange={(event) =>
                    updateConfig({
                      prefijoExpediente: event.target.value.toUpperCase(),
                    })
                  }
                  className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-sky-400"
                />
              </label>

              <label className="grid gap-2">
                <FieldLabel>Estado inicial</FieldLabel>
                <select
                  value={config.estadoInicial}
                  onChange={(event) =>
                    updateConfig({
                      estadoInicial: event.target.value as EstadoExpedienteINMOVAL,
                    })
                  }
                  className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-sky-400"
                >
                  <option value="en_cotizacion">En cotización</option>
                  <option value="cotizacion_aprobada">Cotización aprobada</option>
                  <option value="pendiente_inspeccion">Pendiente de inspección</option>
                  <option value="en_elaboracion">En elaboración</option>
                </select>
              </label>

              <label className="grid gap-2">
                <FieldLabel>Prioridad predeterminada</FieldLabel>
                <select
                  value={config.prioridadPredeterminada}
                  onChange={(event) =>
                    updateConfig({
                      prioridadPredeterminada:
                        event.target.value as PrioridadExpedienteINMOVAL,
                    })
                  }
                  className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-sky-400"
                >
                  <option value="baja">Baja</option>
                  <option value="normal">Normal</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </label>

              <label className="grid gap-2">
                <FieldLabel>Moneda predeterminada</FieldLabel>
                <select
                  value={config.monedaPredeterminada}
                  onChange={(event) =>
                    updateConfig({
                      monedaPredeterminada: event.target.value as MonedaINMOVAL,
                    })
                  }
                  className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-sky-400"
                >
                  <option value="US$">US$</option>
                  <option value="C$">C$</option>
                </select>
              </label>
            </div>
          </article>

          <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10 text-amber-300">
                <Settings className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                  Reglas
                </p>
                <h2 className="text-lg font-semibold text-slate-100">
                  Flujo administrativo
                </h2>
              </div>
            </div>

            <div className="mt-5 grid gap-4">
              <label className="grid gap-2">
                <FieldLabel>Días estimados de entrega</FieldLabel>
                <input
                  type="number"
                  min="1"
                  value={config.diasEntregaEstimados}
                  onChange={(event) =>
                    updateConfig({
                      diasEntregaEstimados: Number(event.target.value || 1),
                    })
                  }
                  className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-amber-400"
                />
              </label>

              <label className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3">
                <input
                  type="checkbox"
                  checked={config.requierePagoYFacturaParaCerrar}
                  onChange={(event) =>
                    updateConfig({
                      requierePagoYFacturaParaCerrar: event.target.checked,
                    })
                  }
                  className="h-4 w-4"
                />
                <span className="text-sm text-slate-200">
                  Requerir pago total + factura para cerrar
                </span>
              </label>

              <label className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3">
                <input
                  type="checkbox"
                  checked={config.mostrarSincronizacionLegacy}
                  onChange={(event) =>
                    updateConfig({
                      mostrarSincronizacionLegacy: event.target.checked,
                    })
                  }
                  className="h-4 w-4"
                />
                <span className="text-sm text-slate-200">
                  Mostrar sincronización de avalúos actuales
                </span>
              </label>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                <p className="text-sm font-semibold text-slate-100">
                  Última actualización
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  {config.actualizadoEn}
                </p>
              </div>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
