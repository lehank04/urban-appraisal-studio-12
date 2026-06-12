import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  RotateCcw,
  Save,
  Settings,
} from 'lucide-react';
import {
  ConfiguracionCotizacionesINMOVAL,
  getConfiguracionCotizacionesINMOVAL,
  resetConfiguracionCotizacionesINMOVAL,
  saveConfiguracionCotizacionesINMOVAL,
} from './cotizacionConfigStorage';

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
      {children}
    </span>
  );
}

export default function ConfiguracionCotizacionesINMOVALPage() {
  const [config, setConfig] = useState<ConfiguracionCotizacionesINMOVAL>(
    () => getConfiguracionCotizacionesINMOVAL()
  );

  const [saved, setSaved] = useState(false);

  function updateConfig(cambios: Partial<ConfiguracionCotizacionesINMOVAL>) {
    setConfig((current) => ({
      ...current,
      ...cambios,
    }));

    setSaved(false);
  }

  function handleGuardar() {
    saveConfiguracionCotizacionesINMOVAL(config);
    setConfig(getConfiguracionCotizacionesINMOVAL());
    setSaved(true);
  }

  function handleReset() {
    const reset = resetConfiguracionCotizacionesINMOVAL();

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
                Configuración de Cotizaciones
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                Parámetros propios del área de cotizaciones. Esta configuración
                controla prefijos, valores iniciales, vigencia y reglas para
                convertir una cotización en expediente.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/cotizaciones"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950/50 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Cotizaciones
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
              Configuración de cotizaciones guardada.
            </div>
          ) : null}
        </header>

        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/10 text-sky-300">
                <FileText className="h-5 w-5" />
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
                <FieldLabel>Prefijo de cotización</FieldLabel>
                <input
                  value={config.prefijoCotizacion}
                  onChange={(event) =>
                    updateConfig({
                      prefijoCotizacion: event.target.value.toUpperCase(),
                    })
                  }
                  className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-sky-400"
                />
              </label>

              <label className="grid gap-2">
                <FieldLabel>Servicio predeterminado</FieldLabel>
                <input
                  value={config.servicioPredeterminado}
                  onChange={(event) =>
                    updateConfig({
                      servicioPredeterminado: event.target.value,
                    })
                  }
                  className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-sky-400"
                />
              </label>

              <label className="grid gap-2">
                <FieldLabel>Monto predeterminado</FieldLabel>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={config.montoPredeterminado}
                  onChange={(event) =>
                    updateConfig({
                      montoPredeterminado: Number(event.target.value || 0),
                    })
                  }
                  className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-sky-400"
                />
              </label>

              <label className="grid gap-2">
                <FieldLabel>Moneda predeterminada</FieldLabel>
                <select
                  value={config.monedaPredeterminada}
                  onChange={(event) =>
                    updateConfig({
                      monedaPredeterminada: event.target.value as 'US$' | 'C$',
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
                  Flujo de cotización
                </h2>
              </div>
            </div>

            <div className="mt-5 grid gap-4">
              <label className="grid gap-2">
                <FieldLabel>Días de validez</FieldLabel>
                <input
                  type="number"
                  min="1"
                  value={config.diasValidez}
                  onChange={(event) =>
                    updateConfig({
                      diasValidez: Number(event.target.value || 1),
                    })
                  }
                  className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-amber-400"
                />
              </label>

              <label className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3">
                <input
                  type="checkbox"
                  checked={config.requiereAprobacionParaExpediente}
                  onChange={(event) =>
                    updateConfig({
                      requiereAprobacionParaExpediente: event.target.checked,
                    })
                  }
                  className="h-4 w-4"
                />
                <span className="text-sm text-slate-200">
                  Requerir aprobación para crear expediente
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
