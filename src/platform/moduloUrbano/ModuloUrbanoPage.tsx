// Módulo Técnico Urbano — Página de captura (Fase Técnica 02 / F1)
// Esqueleto con 14 tabs. Captura básica en Identificación, Ubicación, Legal,
// Entorno, Terreno y Construcciones. El resto son placeholders.

import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Save, CircleDashed, CircleDot, CheckCircle2, AlertTriangle } from 'lucide-react';

import {
  ensureModuloUrbano,
  upsertModuloUrbano,
} from './moduloUrbanoStorage';
import {
  SECCIONES_MODULO_URBANO,
  SECCIONES_SOLO_CONSTRUCCION,
  tipoRequiereConstruccion,
  type EstadoSeccionModuloUrbano,
  type ModuloUrbanoExpediente,
  type SeccionModuloUrbano,
  type TipoInmuebleUrbano,
} from './moduloUrbanoTypes';
import { getExpedientesIndiceINMOVAL } from '../expedientes/expedienteIndexStorage';

const TIPO_INMUEBLE_OPCIONES: ReadonlyArray<{ value: TipoInmuebleUrbano; label: string }> = [
  { value: 'casa_habitacion', label: 'Casa de habitación' },
  { value: 'lote_vacio', label: 'Lote vacío' },
  { value: 'lote_con_mejoras', label: 'Lote con mejoras' },
  { value: 'local_comercial', label: 'Local comercial' },
  { value: 'bodega', label: 'Bodega' },
  { value: 'oficina', label: 'Oficina' },
  { value: 'obra_en_proceso', label: 'Obra en proceso' },
  { value: 'otro', label: 'Otro' },
];

const ESTADO_TONE: Record<EstadoSeccionModuloUrbano, string> = {
  pendiente: 'border-slate-700 bg-slate-900 text-slate-400',
  en_proceso: 'border-amber-400/30 bg-amber-500/10 text-amber-200',
  completo: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200',
  requiere_revision: 'border-rose-400/30 bg-rose-500/10 text-rose-200',
  no_aplica: 'border-slate-800 bg-slate-900/40 text-slate-500 italic',
};

function EstadoIcon({ estado }: { estado: EstadoSeccionModuloUrbano }) {
  if (estado === 'completo') return <CheckCircle2 className="h-3.5 w-3.5" />;
  if (estado === 'en_proceso') return <CircleDot className="h-3.5 w-3.5" />;
  if (estado === 'requiere_revision') return <AlertTriangle className="h-3.5 w-3.5" />;
  return <CircleDashed className="h-3.5 w-3.5" />;
}

function inputClass() {
  return 'w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/40';
}

function labelClass() {
  return 'mb-1 block text-xs font-medium text-slate-400';
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className={labelClass()}>{label}</span>
      {children}
    </label>
  );
}

function PlaceholderSection({ titulo }: { titulo: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6">
      <p className="text-sm font-semibold text-slate-200">{titulo}</p>
      <p className="mt-2 text-xs leading-5 text-slate-500">
        Esta sección se habilitará en fases posteriores del módulo técnico urbano
        (F2 a F6). En esta fase sólo se reserva la estructura y el estado de la sección.
      </p>
    </div>
  );
}

export default function ModuloUrbanoPage() {
  const { id } = useParams<{ id: string }>();
  const expedienteId = id ?? '';
  const [modulo, setModulo] = useState<ModuloUrbanoExpediente | null>(null);
  const [seccionActiva, setSeccionActiva] = useState<SeccionModuloUrbano>('identificacion');
  const [guardando, setGuardando] = useState(false);

  const expediente = useMemo(() => {
    if (!expedienteId) return null;
    return getExpedientesIndiceINMOVAL().find((e) => e.id === expedienteId) ?? null;
  }, [expedienteId]);

  useEffect(() => {
    if (!expedienteId) return;
    const m = ensureModuloUrbano(expedienteId);
    // Pre-llenar cliente si está vacío y el expediente lo tiene.
    if (!m.identificacion.cliente && expediente?.clienteNombre) {
      m.identificacion.cliente = expediente.clienteNombre;
    }
    if (!m.identificacion.propositoAvaluo && expediente?.propositoAvaluoNombre) {
      m.identificacion.propositoAvaluo = expediente.propositoAvaluoNombre;
    }
    setModulo(m);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expedienteId]);

  // Auto-sincronización de aplicabilidad según tipo de inmueble. NO borra datos:
  // sólo cambia el estado visual de las secciones de construcción.
  useEffect(() => {
    if (!modulo) return;
    const requiere = tipoRequiereConstruccion(modulo.identificacion.tipoInmueble);
    let changed = false;
    const next = { ...modulo.estadosSeccion };
    for (const s of SECCIONES_SOLO_CONSTRUCCION) {
      if (requiere) {
        if (next[s] === 'no_aplica') {
          next[s] = 'pendiente';
          changed = true;
        }
      } else if (next[s] !== 'no_aplica') {
        next[s] = 'no_aplica';
        changed = true;
      }
    }
    if (changed) {
      setModulo({ ...modulo, estadosSeccion: next });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modulo?.identificacion.tipoInmueble]);

  if (!expedienteId) {
    return (
      <div className="p-6 text-sm text-slate-400">Expediente no especificado.</div>
    );
  }
  if (!modulo) {
    return <div className="p-6 text-sm text-slate-400">Cargando módulo urbano…</div>;
  }

  function patch<K extends keyof ModuloUrbanoExpediente>(
    key: K,
    value: ModuloUrbanoExpediente[K],
  ) {
    setModulo((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function setEstadoSeccion(seccion: SeccionModuloUrbano, estado: EstadoSeccionModuloUrbano) {
    setModulo((prev) =>
      prev
        ? { ...prev, estadosSeccion: { ...prev.estadosSeccion, [seccion]: estado } }
        : prev,
    );
  }

  function guardar() {
    if (!modulo) return;
    setGuardando(true);
    try {
      const saved = upsertModuloUrbano(modulo);
      setModulo(saved);
    } finally {
      setTimeout(() => setGuardando(false), 250);
    }
  }




  const requiereConstruccion = tipoRequiereConstruccion(modulo.identificacion.tipoInmueble);
  const estadoActual = modulo.estadosSeccion[seccionActiva];

  // Avance por secciones (excluye no_aplica)
  const secciones = SECCIONES_MODULO_URBANO.map((s) => ({
    ...s,
    estado: modulo.estadosSeccion[s.key],
  }));
  const seccionesAplicables = secciones.filter((s) => s.estado !== 'no_aplica');
  const seccionesCompletas = seccionesAplicables.filter((s) => s.estado === 'completo').length;
  const avancePct = seccionesAplicables.length
    ? Math.round((seccionesCompletas / seccionesAplicables.length) * 100)
    : 0;

  // Validaciones blandas para F2
  const validaciones: { ok: boolean; label: string }[] = [
    { ok: Boolean(expedienteId), label: 'Expediente vinculado' },
    { ok: Boolean(modulo.identificacion.tipoInmueble), label: 'Tipo de inmueble' },
    { ok: Boolean(modulo.ubicacion.municipio.trim()), label: 'Municipio (req. F2)' },
    { ok: (modulo.terreno.areaTerreno ?? 0) > 0, label: 'Área de terreno (req. F2)' },
    {
      ok:
        !requiereConstruccion ||
        (modulo.construcciones.areaConstruidaPreliminar ?? 0) > 0,
      label: 'Área construida (si aplica)',
    },
  ];
  const listoParaF2 = validaciones.every((v) => v.ok);


  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-7xl">
        {/* Encabezado */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link
              to={`/expedientes-plataforma/${expedienteId}`}
              className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Volver al expediente
            </Link>
            <h1 className="mt-2 text-2xl font-semibold">Módulo Técnico Urbano</h1>
            <p className="text-xs text-slate-500">
              Expediente: {expediente?.codigo ?? expedienteId} ·{' '}
              {expediente?.clienteNombre ?? 'Sin cliente'}
            </p>
          </div>
          <button
            type="button"
            onClick={guardar}
            disabled={guardando}
            className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-400/20 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {guardando ? 'Guardando…' : 'Guardar'}
          </button>
        </div>

        {/* Resumen superior */}
        <div className="mb-6 grid gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 md:grid-cols-4">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-slate-500">Tipo de inmueble</p>
            <p className="mt-1 text-sm font-semibold text-slate-100">
              {TIPO_INMUEBLE_OPCIONES.find((o) => o.value === modulo.identificacion.tipoInmueble)
                ?.label ?? '— Sin definir —'}
            </p>
            <p className="text-[11px] text-slate-500">
              Propósito: {modulo.identificacion.propositoAvaluo || '—'}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-slate-500">Ubicación</p>
            <p className="mt-1 text-sm text-slate-100">
              {[modulo.ubicacion.municipio, modulo.ubicacion.departamento]
                .filter(Boolean)
                .join(', ') || '—'}
            </p>
            <p className="text-[11px] text-slate-500">
              {modulo.ubicacion.barrio || modulo.ubicacion.distrito || '—'}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-slate-500">Áreas</p>
            <p className="mt-1 text-sm text-slate-100">
              Terreno: {modulo.terreno.areaTerreno ?? '—'} m²
            </p>
            <p className="text-[11px] text-slate-500">
              Construcción:{' '}
              {requiereConstruccion
                ? `${modulo.construcciones.areaConstruidaPreliminar ?? '—'} m²`
                : 'No aplica'}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-slate-500">Avance técnico</p>
            <div className="mt-2 h-2 w-full rounded-full bg-slate-800">
              <div
                className="h-2 rounded-full bg-cyan-400"
                style={{ width: `${avancePct}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              {seccionesCompletas}/{seccionesAplicables.length} secciones · {avancePct}%
            </p>
          </div>
          <div className="md:col-span-4">
            <p className="mb-1 text-[10px] uppercase tracking-wide text-slate-500">
              Validaciones para F2 (Comparables + Homologación)
            </p>
            <div className="flex flex-wrap gap-2">
              {validaciones.map((v) => (
                <span
                  key={v.label}
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] ${
                    v.ok
                      ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
                      : 'border-amber-400/30 bg-amber-500/10 text-amber-200'
                  }`}
                >
                  {v.ok ? '✓' : '○'} {v.label}
                </span>
              ))}
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                  listoParaF2
                    ? 'border-emerald-400/40 bg-emerald-500/20 text-emerald-100'
                    : 'border-slate-700 bg-slate-900 text-slate-400'
                }`}
              >
                {listoParaF2 ? 'Listo para F2' : 'Falta capturar mínimos'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
          {/* Sidebar de secciones */}
          <nav className="space-y-1">
            {SECCIONES_MODULO_URBANO.map((s) => {
              const estado = modulo.estadosSeccion[s.key];
              const activo = s.key === seccionActiva;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setSeccionActiva(s.key)}
                  className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-sm transition ${
                    activo
                      ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-100'
                      : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span>{s.label}</span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${ESTADO_TONE[estado]}`}
                  >
                    <EstadoIcon estado={estado} />
                    {estado.replace('_', ' ')}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Contenido */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {SECCIONES_MODULO_URBANO.find((s) => s.key === seccionActiva)?.label}
              </h2>
              <select
                value={estadoActual}
                onChange={(e) =>
                  setEstadoSeccion(seccionActiva, e.target.value as EstadoSeccionModuloUrbano)
                }
                className="rounded-xl border border-slate-700 bg-slate-950/60 px-2 py-1 text-xs text-slate-100"
              >
                <option value="pendiente">Pendiente</option>
                <option value="en_proceso">En proceso</option>
                <option value="completo">Completo</option>
                <option value="requiere_revision">Requiere revisión</option>
              </select>
            </div>

            {seccionActiva === 'identificacion' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Tipo de inmueble">
                  <select
                    className={inputClass()}
                    value={modulo.identificacion.tipoInmueble}
                    onChange={(e) =>
                      patch('identificacion', {
                        ...modulo.identificacion,
                        tipoInmueble: e.target.value as TipoInmuebleUrbano | '',
                      })
                    }
                  >
                    <option value="">— Seleccionar —</option>
                    {TIPO_INMUEBLE_OPCIONES.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Propósito del avalúo">
                  <input
                    className={inputClass()}
                    value={modulo.identificacion.propositoAvaluo}
                    onChange={(e) =>
                      patch('identificacion', {
                        ...modulo.identificacion,
                        propositoAvaluo: e.target.value,
                      })
                    }
                  />
                </Field>
                <Field label="Fecha de inspección">
                  <input
                    type="date"
                    className={inputClass()}
                    value={modulo.identificacion.fechaInspeccion}
                    onChange={(e) =>
                      patch('identificacion', {
                        ...modulo.identificacion,
                        fechaInspeccion: e.target.value,
                      })
                    }
                  />
                </Field>
                <Field label="Cliente">
                  <input
                    className={inputClass()}
                    value={modulo.identificacion.cliente}
                    onChange={(e) =>
                      patch('identificacion', {
                        ...modulo.identificacion,
                        cliente: e.target.value,
                      })
                    }
                  />
                </Field>
                <Field label="Uso actual">
                  <input
                    className={inputClass()}
                    value={modulo.identificacion.usoActual}
                    onChange={(e) =>
                      patch('identificacion', {
                        ...modulo.identificacion,
                        usoActual: e.target.value,
                      })
                    }
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Observaciones generales">
                    <textarea
                      rows={3}
                      className={inputClass()}
                      value={modulo.identificacion.observacionesGenerales}
                      onChange={(e) =>
                        patch('identificacion', {
                          ...modulo.identificacion,
                          observacionesGenerales: e.target.value,
                        })
                      }
                    />
                  </Field>
                </div>
              </div>
            )}

            {seccionActiva === 'legal' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Número de escritura">
                  <input
                    className={inputClass()}
                    value={modulo.legal.numeroEscritura}
                    onChange={(e) =>
                      patch('legal', { ...modulo.legal, numeroEscritura: e.target.value })
                    }
                  />
                </Field>
                <Field label="Notario">
                  <input
                    className={inputClass()}
                    value={modulo.legal.notario}
                    onChange={(e) => patch('legal', { ...modulo.legal, notario: e.target.value })}
                  />
                </Field>
                <Field label="Fecha de escritura">
                  <input
                    type="date"
                    className={inputClass()}
                    value={modulo.legal.fechaEscritura}
                    onChange={(e) =>
                      patch('legal', { ...modulo.legal, fechaEscritura: e.target.value })
                    }
                  />
                </Field>
                <Field label="Número catastral">
                  <input
                    className={inputClass()}
                    value={modulo.legal.numeroCatastral}
                    onChange={(e) =>
                      patch('legal', { ...modulo.legal, numeroCatastral: e.target.value })
                    }
                  />
                </Field>
                <Field label="Área registral (m²)">
                  <input
                    type="number"
                    className={inputClass()}
                    value={modulo.legal.areaRegistral ?? ''}
                    onChange={(e) =>
                      patch('legal', {
                        ...modulo.legal,
                        areaRegistral: e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                  />
                </Field>
                <Field label="Área catastral (m²)">
                  <input
                    type="number"
                    className={inputClass()}
                    value={modulo.legal.areaCatastral ?? ''}
                    onChange={(e) =>
                      patch('legal', {
                        ...modulo.legal,
                        areaCatastral: e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Gravámenes / limitaciones">
                    <textarea
                      rows={3}
                      className={inputClass()}
                      value={modulo.legal.gravamenes}
                      onChange={(e) =>
                        patch('legal', { ...modulo.legal, gravamenes: e.target.value })
                      }
                    />
                  </Field>
                </div>
              </div>
            )}

            {seccionActiva === 'entorno' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Tipo de zona">
                  <input
                    className={inputClass()}
                    value={modulo.entorno.tipoZona}
                    onChange={(e) =>
                      patch('entorno', { ...modulo.entorno, tipoZona: e.target.value })
                    }
                  />
                </Field>
                <Field label="Vías de acceso">
                  <input
                    className={inputClass()}
                    value={modulo.entorno.viasAcceso}
                    onChange={(e) =>
                      patch('entorno', { ...modulo.entorno, viasAcceso: e.target.value })
                    }
                  />
                </Field>
                <Field label="Servicios públicos">
                  <input
                    className={inputClass()}
                    value={modulo.entorno.serviciosPublicos}
                    onChange={(e) =>
                      patch('entorno', { ...modulo.entorno, serviciosPublicos: e.target.value })
                    }
                  />
                </Field>
                <Field label="Equipamiento urbano">
                  <input
                    className={inputClass()}
                    value={modulo.entorno.equipamientoUrbano}
                    onChange={(e) =>
                      patch('entorno', { ...modulo.entorno, equipamientoUrbano: e.target.value })
                    }
                  />
                </Field>
              </div>
            )}

            {seccionActiva === 'terreno' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Área de terreno (m²)">
                  <input
                    type="number"
                    className={inputClass()}
                    value={modulo.terreno.areaTerreno ?? ''}
                    onChange={(e) =>
                      patch('terreno', {
                        ...modulo.terreno,
                        areaTerreno: e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                  />
                </Field>
                <Field label="Frente (m)">
                  <input
                    type="number"
                    className={inputClass()}
                    value={modulo.terreno.frente ?? ''}
                    onChange={(e) =>
                      patch('terreno', {
                        ...modulo.terreno,
                        frente: e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                  />
                </Field>
                <Field label="Fondo (m)">
                  <input
                    type="number"
                    className={inputClass()}
                    value={modulo.terreno.fondo ?? ''}
                    onChange={(e) =>
                      patch('terreno', {
                        ...modulo.terreno,
                        fondo: e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                  />
                </Field>
                <Field label="Topografía">
                  <input
                    className={inputClass()}
                    value={modulo.terreno.topografia}
                    onChange={(e) =>
                      patch('terreno', { ...modulo.terreno, topografia: e.target.value })
                    }
                  />
                </Field>
                <Field label="Forma">
                  <input
                    className={inputClass()}
                    value={modulo.terreno.forma}
                    onChange={(e) =>
                      patch('terreno', { ...modulo.terreno, forma: e.target.value })
                    }
                  />
                </Field>
              </div>
            )}

            {seccionActiva === 'construcciones' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Año de construcción">
                  <input
                    type="number"
                    className={inputClass()}
                    value={modulo.construcciones.anioConstruccion ?? ''}
                    onChange={(e) =>
                      patch('construcciones', {
                        ...modulo.construcciones,
                        anioConstruccion: e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                  />
                </Field>
                <Field label="Tipo constructivo">
                  <input
                    className={inputClass()}
                    value={modulo.construcciones.tipoConstructivo}
                    onChange={(e) =>
                      patch('construcciones', {
                        ...modulo.construcciones,
                        tipoConstructivo: e.target.value,
                      })
                    }
                  />
                </Field>
                <Field label="Estado de conservación">
                  <input
                    className={inputClass()}
                    value={modulo.construcciones.estadoConservacion}
                    onChange={(e) =>
                      patch('construcciones', {
                        ...modulo.construcciones,
                        estadoConservacion: e.target.value,
                      })
                    }
                  />
                </Field>
                <Field label="Área construida preliminar (m²)">
                  <input
                    type="number"
                    className={inputClass()}
                    value={modulo.construcciones.areaConstruidaPreliminar ?? ''}
                    onChange={(e) =>
                      patch('construcciones', {
                        ...modulo.construcciones,
                        areaConstruidaPreliminar:
                          e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                  />
                </Field>
                <Field label="Niveles">
                  <input
                    type="number"
                    className={inputClass()}
                    value={modulo.construcciones.niveles ?? ''}
                    onChange={(e) =>
                      patch('construcciones', {
                        ...modulo.construcciones,
                        niveles: e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                  />
                </Field>
              </div>
            )}

            {seccionActiva === 'ambientes' && <PlaceholderSection titulo="Ambientes (F1: placeholder)" />}
            {seccionActiva === 'fotografias' && <PlaceholderSection titulo="Fotografías (F1: placeholder)" />}
            {seccionActiva === 'comparables' && <PlaceholderSection titulo="Comparables (F2)" />}
            {seccionActiva === 'homologacion' && <PlaceholderSection titulo="Homologación (F2)" />}
            {seccionActiva === 'costo_reposicion' && <PlaceholderSection titulo="Costo / reposición (F3)" />}
            {seccionActiva === 'depreciacion' && <PlaceholderSection titulo="Depreciación (F3)" />}
            {seccionActiva === 'calculo_final' && <PlaceholderSection titulo="Cálculo final (F4)" />}
            {seccionActiva === 'informe' && <PlaceholderSection titulo="Informe (F5)" />}
            {seccionActiva === 'anexos' && <PlaceholderSection titulo="Anexos (F6)" />}
          </section>
        </div>
      </div>
    </div>
  );
}
