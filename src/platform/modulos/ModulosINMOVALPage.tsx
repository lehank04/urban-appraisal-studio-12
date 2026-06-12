import { MODULE_REGISTRY } from '@/modules/moduleRegistry';
import { ModuloTecnicoCard } from './components/ModuloTecnicoCard';

export default function ModulosINMOVALPage() {
  const modulosActivos = MODULE_REGISTRY.filter(
    (modulo) => modulo.estado === 'activo'
  ).length;

  const modulosNoInstalados = MODULE_REGISTRY.filter(
    (modulo) => modulo.estado === 'no_instalado'
  ).length;

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/30">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-300">
                Plataforma INMOVAL
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-50">
                Módulos técnicos
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                INMOVAL funciona como una plataforma central. Cada módulo técnico
                opera como un cartucho especializado para un tipo de avalúo. Esta
                pantalla muestra qué módulos están activos, preparados o pendientes
                de instalación en esta computadora.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:min-w-[320px]">
              <div className="rounded-2xl border border-sky-400/20 bg-sky-400/10 p-4">
                <p className="text-xs uppercase tracking-wide text-sky-200">
                  Activos
                </p>
                <p className="mt-2 text-3xl font-bold text-sky-100">
                  {modulosActivos}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-700 bg-slate-950/50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  No instalados
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-100">
                  {modulosNoInstalados}
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-6 grid gap-4 xl:grid-cols-2">
          {MODULE_REGISTRY.map((modulo) => (
            <ModuloTecnicoCard key={modulo.id} modulo={modulo} />
          ))}
        </section>
      </div>
    </div>
  );
}
