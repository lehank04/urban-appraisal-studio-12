import { useMemo, useState } from 'react';
import {
  Boxes,
  CheckCircle2,
  CircleOff,
  Download,
  FileArchive,
  Power,
  ShieldCheck,
  Trash2,
} from 'lucide-react';

type EstadoModulo = 'no_cargado' | 'cargado' | 'activo';

type ModuloTecnicoPlataforma = {
  id: string;
  nombre: string;
  subtitulo: string;
  descripcion: string;
  estado: EstadoModulo;
  version?: string;
  actualizadoEn?: string;
};

const STORAGE_KEY = 'inmoval_modulos_tecnicos_estado_v1';

const BASE_MODULES: ModuloTecnicoPlataforma[] = [
  {
    id: 'urbano',
    nombre: 'Módulo técnico urbano',
    subtitulo: 'Inmuebles urbanos',
    descripcion:
      'Casas, terrenos urbanos, apartamentos, locales, edificios y avances de obra urbana.',
    estado: 'no_cargado',
  },
  {
    id: 'rural',
    nombre: 'Módulo técnico rural',
    subtitulo: 'Inmuebles rurales',
    descripcion:
      'Fincas, terrenos rurales, unidades productivas, mejoras agropecuarias y usos rurales.',
    estado: 'no_cargado',
  },
  {
    id: 'especiales',
    nombre: 'Módulo técnico de especiales',
    subtitulo: 'Inmuebles especiales',
    descripcion:
      'Activos no convencionales, propiedades de uso especializado y casos que requieren reglas técnicas propias.',
    estado: 'no_cargado',
  },
  {
    id: 'maquinaria',
    nombre: 'Módulo técnico de maquinaria',
    subtitulo: 'Vehículos y maquinaria',
    descripcion:
      'Vehículos, maquinaria, equipos, activos móviles y bienes valuados fuera del flujo inmobiliario tradicional.',
    estado: 'no_cargado',
  },
];

function mergeModules(saved: ModuloTecnicoPlataforma[]) {
  return BASE_MODULES.map((base) => ({
    ...base,
    ...(saved.find((item) => item.id === base.id) || {}),
  }));
}

function readModules(): ModuloTecnicoPlataforma[] {
  if (typeof window === 'undefined') return BASE_MODULES;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return BASE_MODULES;

    const saved = JSON.parse(raw) as ModuloTecnicoPlataforma[];

    if (!Array.isArray(saved)) return BASE_MODULES;

    return mergeModules(saved);
  } catch {
    return BASE_MODULES;
  }
}

function saveModules(modulos: ModuloTecnicoPlataforma[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(modulos));
}

function estadoLabel(estado: EstadoModulo) {
  if (estado === 'activo') return 'Activo';
  if (estado === 'cargado') return 'Cargado';
  return 'No cargado';
}

function estadoClass(estado: EstadoModulo) {
  if (estado === 'activo') {
    return 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100';
  }

  if (estado === 'cargado') {
    return 'border-sky-400/30 bg-sky-400/10 text-sky-100';
  }

  return 'border-slate-700 bg-slate-950/60 text-slate-400';
}

function estadoDescripcion(estado: EstadoModulo) {
  if (estado === 'activo') {
    return 'El módulo está disponible para ser usado por expedientes compatibles.';
  }

  if (estado === 'cargado') {
    return 'El módulo está cargado, pero todavía no está activo para operación.';
  }

  return 'El módulo está registrado como opción, pero aún no tiene carga activa.';
}

function formatDate(value?: string) {
  if (!value) return 'Sin registro';

  try {
    return new Date(value).toLocaleString('es-NI', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return value;
  }
}

export default function ModulosINMOVALPage() {
  const [modulos, setModulos] = useState<ModuloTecnicoPlataforma[]>(() =>
    readModules()
  );

  const resumen = useMemo(() => {
    return {
      total: modulos.length,
      noCargados: modulos.filter((item) => item.estado === 'no_cargado').length,
      cargados: modulos.filter((item) => item.estado === 'cargado').length,
      activos: modulos.filter((item) => item.estado === 'activo').length,
    };
  }, [modulos]);

  function persistir(next: ModuloTecnicoPlataforma[]) {
    setModulos(next);
    saveModules(next);
  }

  function actualizarModulo(id: string, patch: Partial<ModuloTecnicoPlataforma>) {
    const next = modulos.map((item) =>
      item.id === id
        ? {
            ...item,
            ...patch,
            actualizadoEn: new Date().toISOString(),
          }
        : item
    );

    persistir(next);
  }

  function cargarModulo(id: string) {
    actualizarModulo(id, {
      estado: 'cargado',
      version: 'Carga local preparada (.immod)',
    });
  }

  function activarModulo(id: string) {
    actualizarModulo(id, { estado: 'activo' });
  }

  function desactivarModulo(id: string) {
    actualizarModulo(id, { estado: 'cargado' });
  }

  function eliminarModulo(id: string) {
    const modulo = modulos.find((item) => item.id === id);

    if (!modulo) return;

    const confirmar = window.confirm(
      `Se eliminará la carga local de "${modulo.nombre}".\n\nEl módulo quedará como "No cargado".\n\n¿Continuar?`
    );

    if (!confirmar) return;

    actualizarModulo(id, {
      estado: 'no_cargado',
      version: undefined,
    });
  }

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/30">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-300">
                Plataforma INMOVAL
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-50">
                Módulos técnicos
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                Centro de control para cargar, activar o retirar módulos técnicos.
                Esta pantalla no desarrolla el contenido interno del módulo; solo
                administra su disponibilidad dentro de la plataforma.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Total
                </p>
                <p className="mt-2 text-2xl font-bold">{resumen.total}</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  No cargados
                </p>
                <p className="mt-2 text-2xl font-bold">{resumen.noCargados}</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Cargados
                </p>
                <p className="mt-2 text-2xl font-bold">{resumen.cargados}</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Activos
                </p>
                <p className="mt-2 text-2xl font-bold">{resumen.activos}</p>
              </div>
            </div>
          </div>
        </header>

        <section className="mt-6 rounded-3xl border border-sky-400/20 bg-sky-400/10 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-sky-400/30 bg-slate-950/60 text-sky-200">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-base font-semibold text-slate-50">
                  Regla operativa
                </h2>
                <p className="mt-2 max-w-4xl text-sm leading-6 text-sky-100/80">
                  El expediente define qué módulo técnico requiere. Esta pantalla
                  solo controla si ese módulo está cargado y activo. El contenido
                  técnico interno se construirá después como módulo independiente.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
              Archivo esperado:{' '}
              <span className="font-semibold text-slate-100">.immod</span>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          {modulos.map((modulo) => (
            <article
              key={modulo.id}
              className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/20"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-700 bg-slate-950/70 text-sky-300">
                    <Boxes className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {modulo.subtitulo}
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-slate-100">
                      {modulo.nombre}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {modulo.descripcion}
                    </p>
                  </div>
                </div>

                <span
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${estadoClass(
                    modulo.estado
                  )}`}
                >
                  {estadoLabel(modulo.estado)}
                </span>
              </div>

              <div className="mt-5 grid gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 p-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Estado
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-100">
                    {estadoLabel(modulo.estado)}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Versión
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-100">
                    {modulo.version || 'Sin carga'}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Actualizado
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-100">
                    {formatDate(modulo.actualizadoEn)}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-400">
                {estadoDescripcion(modulo.estado)}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {modulo.estado === 'no_cargado' ? (
                  <button
                    type="button"
                    onClick={() => cargarModulo(modulo.id)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 py-3 text-sm font-medium text-sky-100 transition hover:bg-sky-400/20"
                  >
                    <Download className="h-4 w-4" />
                    Cargar módulo
                  </button>
                ) : null}

                {modulo.estado === 'cargado' ? (
                  <button
                    type="button"
                    onClick={() => activarModulo(modulo.id)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:bg-emerald-400/20"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Activar
                  </button>
                ) : null}

                {modulo.estado === 'activo' ? (
                  <button
                    type="button"
                    onClick={() => desactivarModulo(modulo.id)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm font-medium text-amber-100 transition hover:bg-amber-400/20"
                  >
                    <Power className="h-4 w-4" />
                    Desactivar
                  </button>
                ) : null}

                {modulo.estado !== 'no_cargado' ? (
                  <button
                    type="button"
                    onClick={() => eliminarModulo(modulo.id)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm font-medium text-rose-100 transition hover:bg-rose-400/20"
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar carga
                  </button>
                ) : null}

                <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-slate-500">
                  <FileArchive className="h-4 w-4" />
                  Paquete técnico .immod
                </div>

                {modulo.estado === 'no_cargado' ? (
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-slate-500">
                    <CircleOff className="h-4 w-4" />
                    Pendiente de carga
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
