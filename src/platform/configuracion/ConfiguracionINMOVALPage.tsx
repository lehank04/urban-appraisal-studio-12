import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Cloud,
  Database,
  FolderCog,
  RotateCcw,
  Save,
  Server,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import {
  ConfiguracionPlataformaLocalINMOVAL,
  EstadoConexionPlataformaINMOVAL,
  ModoOperacionPlataformaINMOVAL,
  getConfiguracionPlataformaINMOVAL,
  resetConfiguracionPlataformaINMOVAL,
  saveConfiguracionPlataformaINMOVAL,
} from './configuracionPlataformaStorage';
import { RespaldoDatosINMOVALPanel } from './RespaldoDatosINMOVALPanel';

function getEstadoClass(estado: EstadoConexionPlataformaINMOVAL) {
  if (estado === 'conectado') {
    return 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200';
  }

  if (estado === 'error') {
    return 'border-rose-400/30 bg-rose-400/10 text-rose-200';
  }

  if (estado === 'pendiente') {
    return 'border-amber-400/30 bg-amber-400/10 text-amber-200';
  }

  return 'border-slate-600 bg-slate-950/50 text-slate-300';
}

function EstadoBadge({ estado }: { estado: EstadoConexionPlataformaINMOVAL }) {
  const labels: Record<EstadoConexionPlataformaINMOVAL, string> = {
    no_configurado: 'No configurado',
    pendiente: 'Pendiente',
    conectado: 'Conectado',
    error: 'Error',
  };

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getEstadoClass(estado)}`}>
      {labels[estado]}
    </span>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
      {children}
    </span>
  );
}

export default function ConfiguracionINMOVALPage() {
  const [config, setConfig] = useState<ConfiguracionPlataformaLocalINMOVAL>(
    () => getConfiguracionPlataformaINMOVAL()
  );

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!saved) return;

    const timer = window.setTimeout(() => setSaved(false), 1800);

    return () => window.clearTimeout(timer);
  }, [saved]);

  function updateConfig(cambios: Partial<ConfiguracionPlataformaLocalINMOVAL>) {
    setConfig((current) => ({
      ...current,
      ...cambios,
    }));
  }

  function handleGuardar() {
    saveConfiguracionPlataformaINMOVAL(config);
    setConfig(getConfiguracionPlataformaINMOVAL());
    setSaved(true);
  }

  function handleReset() {
    const reset = resetConfiguracionPlataformaINMOVAL();

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
                Configuración
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                Configuración local de operación, servidor, Google Drive, carpetas
                base y preferencias administrativas. Esta pantalla prepara la
                integración futura con servidor y Drive.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleGuardar}
                className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:bg-emerald-400/20"
              >
                <Save className="h-4 w-4" />
                Guardar configuración
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950/50 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
              >
                <RotateCcw className="h-4 w-4" />
                Restaurar base
              </button>
            </div>
          </div>

          {saved ? (
            <div className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
              <CheckCircle2 className="h-4 w-4" />
              Configuración guardada correctamente.
            </div>
          ) : null}
        </header>
        <RespaldoDatosINMOVALPanel />

<section className="mt-6 grid gap-4 lg:grid-cols-3">
          <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/10 text-sky-300">
                <Settings className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                  Operación
                </p>
                <h2 className="text-lg font-semibold text-slate-100">
                  Modo de plataforma
                </h2>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              <label className="grid gap-2">
                <FieldLabel>Modo de operación</FieldLabel>
                <select
                  value={config.modoOperacion}
                  onChange={(event) =>
                    updateConfig({
                      modoOperacion:
                        event.target.value as ModoOperacionPlataformaINMOVAL,
                    })
                  }
                  className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-sky-400"
                >
                  <option value="local">Local</option>
                  <option value="hibrido">Híbrido</option>
                  <option value="servidor">Servidor</option>
                </select>
              </label>

              <label className="grid gap-2">
                <FieldLabel>Prefijo expediente</FieldLabel>
                <input
                  value={config.prefijoExpediente}
                  onChange={(event) =>
                    updateConfig({ prefijoExpediente: event.target.value })
                  }
                  className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-sky-400"
                />
              </label>

              <label className="grid gap-2">
                <FieldLabel>Moneda principal</FieldLabel>
                <select
                  value={config.monedaPrincipal}
                  onChange={(event) =>
                    updateConfig({
                      monedaPrincipal: event.target.value as 'US$' | 'C$',
                    })
                  }
                  className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-sky-400"
                >
                  <option value="US$">US$</option>
                  <option value="C$">C$</option>
                </select>
              </label>

              <label className="grid gap-2">
                <FieldLabel>Días validez cotización</FieldLabel>
                <input
                  type="number"
                  min="1"
                  value={config.diasValidezCotizacion}
                  onChange={(event) =>
                    updateConfig({
                      diasValidezCotizacion: Number(event.target.value || 1),
                    })
                  }
                  className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-sky-400"
                />
              </label>
            </div>
          </article>

          <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
                <Server className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                  Servidor
                </p>
                <h2 className="text-lg font-semibold text-slate-100">
                  Cerebro operativo
                </h2>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                <span className="text-sm text-slate-300">Estado servidor</span>
                <EstadoBadge estado={config.servidorEstado} />
              </div>

              <label className="grid gap-2">
                <FieldLabel>Estado</FieldLabel>
                <select
                  value={config.servidorEstado}
                  onChange={(event) =>
                    updateConfig({
                      servidorEstado:
                        event.target.value as EstadoConexionPlataformaINMOVAL,
                    })
                  }
                  className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                >
                  <option value="no_configurado">No configurado</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="conectado">Conectado</option>
                  <option value="error">Error</option>
                </select>
              </label>

              <label className="grid gap-2">
                <FieldLabel>URL servidor</FieldLabel>
                <input
                  value={config.servidorUrl || ''}
                  onChange={(event) =>
                    updateConfig({ servidorUrl: event.target.value })
                  }
                  placeholder="https://api.inmoval..."
                  className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                />
              </label>
            </div>
          </article>

          <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10 text-amber-300">
                <Cloud className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                  Google Drive
                </p>
                <h2 className="text-lg font-semibold text-slate-100">
                  Bodega documental
                </h2>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                <span className="text-sm text-slate-300">Estado Drive</span>
                <EstadoBadge estado={config.driveEstado} />
              </div>

              <label className="grid gap-2">
                <FieldLabel>Estado</FieldLabel>
                <select
                  value={config.driveEstado}
                  onChange={(event) =>
                    updateConfig({
                      driveEstado:
                        event.target.value as EstadoConexionPlataformaINMOVAL,
                    })
                  }
                  className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-amber-400"
                >
                  <option value="no_configurado">No configurado</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="conectado">Conectado</option>
                  <option value="error">Error</option>
                </select>
              </label>

              <label className="grid gap-2">
                <FieldLabel>Carpeta raíz</FieldLabel>
                <input
                  value={config.driveCarpetaRaiz || ''}
                  onChange={(event) =>
                    updateConfig({ driveCarpetaRaiz: event.target.value })
                  }
                  className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-amber-400"
                />
              </label>
            </div>
          </article>
        </section>

        <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-400/20 bg-purple-400/10 text-purple-300">
              <FolderCog className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                Carpetas base
              </p>
              <h2 className="text-lg font-semibold text-slate-100">
                Organización documental
              </h2>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <label className="grid gap-2">
              <FieldLabel>Expedientes</FieldLabel>
              <input
                value={config.driveCarpetaExpedientes || ''}
                onChange={(event) =>
                  updateConfig({ driveCarpetaExpedientes: event.target.value })
                }
                className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-purple-400"
              />
            </label>

            <label className="grid gap-2">
              <FieldLabel>Comparables</FieldLabel>
              <input
                value={config.driveCarpetaComparables || ''}
                onChange={(event) =>
                  updateConfig({ driveCarpetaComparables: event.target.value })
                }
                className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-purple-400"
              />
            </label>

            <label className="grid gap-2">
              <FieldLabel>Respaldos</FieldLabel>
              <input
                value={config.driveCarpetaRespaldos || ''}
                onChange={(event) =>
                  updateConfig({ driveCarpetaRespaldos: event.target.value })
                }
                className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-purple-400"
              />
            </label>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
              <div className="flex items-center gap-2 text-slate-100">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                <p className="text-sm font-semibold">Regla activa</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Google Drive funciona como bodega documental. El servidor será
                el cerebro operativo y la plataforma mantiene el control de estados.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-600 bg-slate-950/70 text-slate-300">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                Registro local
              </p>
              <h2 className="text-lg font-semibold text-slate-100">
                Última actualización
              </h2>
            </div>
          </div>

          <p className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/50 p-4 text-sm text-slate-400">
            {config.actualizadoEn}
          </p>
        </section>
      </div>
    </div>
  );
}
