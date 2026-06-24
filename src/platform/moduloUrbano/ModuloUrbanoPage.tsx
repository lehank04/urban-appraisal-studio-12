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
  crearTerrenoVacio,
  crearMejoraVacia,
  crearConstruccionVacia,
  crearAmbienteVacio,
  crearHomologacionComparableVacio,
  crearFactorHomologacionDetalle,
  crearValoracionTerrenoItem,
  FACTORES_HOMOLOGACION_DEF,
  UNIDAD_BASE_VALOR_OPCIONES,
  type AmbienteItem,
  type BaseUnitariaHomologacion,
  type ComparablesBloque,
  type ConstruccionItem,
  type CriterioAdopcionHomologacion,
  type EstadoSeccionModuloUrbano,
  type FactorHomologacionDetalle,
  type FiltrosComparablesUrbano,
  type HomologacionBloque,
  type HomologacionComparable,
  type MejoraItem,
  type ModuloUrbanoExpediente,
  type SeccionModuloUrbano,
  type TerrenoItem,
  type TipoFactorHomologacion,
  type TipoInmuebleUrbano,
  type TipoTerrenoUrbano,
  type TipoMejoraUrbana,
  type TipoAmbienteUrbano,
  type UnidadAreaUrbano,
  type UnidadBaseValor,
  type ValoracionTerrenoBloque,
  type ValoracionTerrenoItem,
} from './moduloUrbanoTypes';
import { getExpedientesIndiceINMOVAL } from '../expedientes/expedienteIndexStorage';
import {
  listarComparablesParaModuloUrbano,
  filtrarComparablesParaModuloUrbano,
  crearSnapshotComparable,
  resumenComparable,
  type ComparableDisponible,
} from './comparablesAdapter';

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

// ── Constantes de opciones para selects relacionales ────────────────────────
const TIPO_TERRENO_OPCIONES: ReadonlyArray<{ value: TipoTerrenoUrbano; label: string }> = [
  { value: 'principal', label: 'Principal' },
  { value: 'secundario', label: 'Secundario' },
  { value: 'excedente', label: 'Excedente' },
  { value: 'afectado', label: 'Afectado' },
  { value: 'util', label: 'Útil' },
  { value: 'registral', label: 'Registral' },
  { value: 'catastral', label: 'Catastral' },
  { value: 'otro', label: 'Otro' },
];

const UNIDAD_AREA_OPCIONES: ReadonlyArray<{ value: UnidadAreaUrbano; label: string }> = [
  { value: 'm2', label: 'm²' },
  { value: 'vara2', label: 'vara²' },
  { value: 'mz', label: 'mz' },
  { value: 'ha', label: 'ha' },
  { value: 'otro', label: 'otro' },
];

const TIPO_MEJORA_OPCIONES: ReadonlyArray<{ value: TipoMejoraUrbana; label: string }> = [
  { value: 'cerco', label: 'Cerco' },
  { value: 'muro', label: 'Muro' },
  { value: 'porton', label: 'Portón' },
  { value: 'patio', label: 'Patio' },
  { value: 'losa', label: 'Losa' },
  { value: 'cisterna', label: 'Cisterna' },
  { value: 'pozo', label: 'Pozo' },
  { value: 'tanque', label: 'Tanque' },
  { value: 'piscina', label: 'Piscina' },
  { value: 'jardin', label: 'Jardín' },
  { value: 'estacionamiento', label: 'Estacionamiento' },
  { value: 'otro', label: 'Otro' },
];

const TIPO_AMBIENTE_OPCIONES: ReadonlyArray<{ value: TipoAmbienteUrbano; label: string }> = [
  { value: 'dormitorio', label: 'Dormitorio' },
  { value: 'sala', label: 'Sala' },
  { value: 'comedor', label: 'Comedor' },
  { value: 'cocina', label: 'Cocina' },
  { value: 'bano', label: 'Baño' },
  { value: 'estudio', label: 'Estudio' },
  { value: 'oficina', label: 'Oficina' },
  { value: 'patio_interior', label: 'Patio interior' },
  { value: 'garaje', label: 'Garaje' },
  { value: 'bodega_interna', label: 'Bodega interna' },
  { value: 'otro', label: 'Otro' },
];


function NoAplicaNotice({ motivo }: { motivo: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
      <p className="text-sm font-semibold text-slate-300">No aplica para este tipo de inmueble</p>
      <p className="mt-2 text-xs leading-5 text-slate-500">{motivo}</p>
      <p className="mt-2 text-[11px] text-slate-600">
        Los datos previos no se borran; sólo se ocultan mientras el tipo de inmueble lo indique.
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

  // ── Managers relacionales (F1.6) ──────────────────────────────────────────
  function addTerreno() {
    setModulo((prev) => prev ? { ...prev, terrenos: [...prev.terrenos, crearTerrenoVacio()] } : prev);
  }
  function updateTerreno(id: string, patchT: Partial<TerrenoItem>) {
    setModulo((prev) => prev ? { ...prev, terrenos: prev.terrenos.map((t) => t.id === id ? { ...t, ...patchT } : t) } : prev);
  }
  function removeTerreno(id: string) {
    setModulo((prev) => prev ? {
      ...prev,
      terrenos: prev.terrenos.filter((t) => t.id !== id),
      mejoras: prev.mejoras.map((m) => m.terrenoId === id ? { ...m, terrenoId: null } : m),
      construccionesDetalle: prev.construccionesDetalle.map((c) => c.terrenoId === id ? { ...c, terrenoId: null } : c),
    } : prev);
  }

  function addMejora() {
    setModulo((prev) => prev ? { ...prev, mejoras: [...prev.mejoras, crearMejoraVacia()] } : prev);
  }
  function updateMejora(id: string, patchM: Partial<MejoraItem>) {
    setModulo((prev) => prev ? { ...prev, mejoras: prev.mejoras.map((m) => m.id === id ? { ...m, ...patchM } : m) } : prev);
  }
  function removeMejora(id: string) {
    setModulo((prev) => prev ? { ...prev, mejoras: prev.mejoras.filter((m) => m.id !== id) } : prev);
  }

  function addConstruccion() {
    setModulo((prev) => prev ? { ...prev, construccionesDetalle: [...prev.construccionesDetalle, crearConstruccionVacia()] } : prev);
  }
  function updateConstruccion(id: string, patchC: Partial<ConstruccionItem>) {
    setModulo((prev) => prev ? { ...prev, construccionesDetalle: prev.construccionesDetalle.map((c) => c.id === id ? { ...c, ...patchC } : c) } : prev);
  }
  function removeConstruccion(id: string) {
    setModulo((prev) => prev ? {
      ...prev,
      construccionesDetalle: prev.construccionesDetalle.filter((c) => c.id !== id),
      ambientesDetalle: prev.ambientesDetalle.filter((a) => a.construccionId !== id),
    } : prev);
  }

  function addAmbiente(construccionId: string) {
    setModulo((prev) => prev ? { ...prev, ambientesDetalle: [...prev.ambientesDetalle, crearAmbienteVacio(construccionId)] } : prev);
  }
  function updateAmbiente(id: string, patchA: Partial<AmbienteItem>) {
    setModulo((prev) => prev ? { ...prev, ambientesDetalle: prev.ambientesDetalle.map((a) => a.id === id ? { ...a, ...patchA } : a) } : prev);
  }
  function removeAmbiente(id: string) {
    setModulo((prev) => prev ? { ...prev, ambientesDetalle: prev.ambientesDetalle.filter((a) => a.id !== id) } : prev);
  }

  function updateFiltrosComparables(patchF: Partial<FiltrosComparablesUrbano>) {
    setModulo((prev) => prev ? {
      ...prev,
      comparablesBloque: { ...prev.comparablesBloque, filtros: { ...prev.comparablesBloque.filtros, ...patchF } },
    } : prev);
  }
  function setComparablesBloque(patchB: Partial<ComparablesBloque>) {
    setModulo((prev) => prev ? { ...prev, comparablesBloque: { ...prev.comparablesBloque, ...patchB } } : prev);
  }

  function seleccionarComparable(comparable: ComparableDisponible, notas = '') {
    setModulo((prev) => {
      if (!prev) return prev;
      // Si ya estaba descartado, lo quitamos de descartados.
      const descartados = prev.comparablesBloque.descartados.filter((d) => d.comparableId !== comparable.id);
      // Evitar duplicados en seleccionados.
      if (prev.comparablesBloque.seleccionados.some((s) => s.comparableId === comparable.id)) {
        return { ...prev, comparablesBloque: { ...prev.comparablesBloque, descartados } };
      }
      const seleccion = {
        id: `sel_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
        comparableId: comparable.id,
        fechaSeleccion: new Date().toISOString(),
        notas,
      };
      const snapshot = crearSnapshotComparable(comparable);
      return {
        ...prev,
        comparablesBloque: {
          ...prev.comparablesBloque,
          seleccionados: [...prev.comparablesBloque.seleccionados, seleccion],
          descartados,
          snapshots: [...prev.comparablesBloque.snapshots, snapshot],
        },
      };
    });
  }

  function quitarSeleccionado(comparableId: string) {
    setModulo((prev) => prev ? {
      ...prev,
      comparablesBloque: {
        ...prev.comparablesBloque,
        seleccionados: prev.comparablesBloque.seleccionados.filter((s) => s.comparableId !== comparableId),
        // El snapshot se conserva como evidencia histórica.
      },
    } : prev);
  }

  function descartarComparable(comparable: ComparableDisponible, motivo: string) {
    setModulo((prev) => {
      if (!prev) return prev;
      const seleccionados = prev.comparablesBloque.seleccionados.filter((s) => s.comparableId !== comparable.id);
      if (prev.comparablesBloque.descartados.some((d) => d.comparableId === comparable.id)) {
        return { ...prev, comparablesBloque: { ...prev.comparablesBloque, seleccionados } };
      }
      const descarte = {
        id: `dsc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
        comparableId: comparable.id,
        motivo,
        fechaDescarte: new Date().toISOString(),
      };
      return {
        ...prev,
        comparablesBloque: {
          ...prev.comparablesBloque,
          seleccionados,
          descartados: [...prev.comparablesBloque.descartados, descarte],
        },
      };
    });
  }

  function quitarDescartado(comparableId: string) {
    setModulo((prev) => prev ? {
      ...prev,
      comparablesBloque: {
        ...prev.comparablesBloque,
        descartados: prev.comparablesBloque.descartados.filter((d) => d.comparableId !== comparableId),
      },
    } : prev);
  }


  // ── Homologación (F2B) ───────────────────────────────────────────────────
  function patchHomologacionBloque(patchH: Partial<HomologacionBloque>) {
    setModulo((prev) => prev ? {
      ...prev,
      homologacionBloque: { ...prev.homologacionBloque, ...patchH },
    } : prev);
  }
  function ensureHomologacionComparable(comparableId: string, base: BaseUnitariaHomologacion = 'terreno') {
    setModulo((prev) => {
      if (!prev) return prev;
      if (prev.homologacionBloque.comparables.some((c) => c.comparableId === comparableId)) return prev;
      return {
        ...prev,
        homologacionBloque: {
          ...prev.homologacionBloque,
          comparables: [...prev.homologacionBloque.comparables, crearHomologacionComparableVacio(comparableId, base)],
        },
      };
    });
  }
  function updateHomologacionComparable(comparableId: string, patchHC: Partial<HomologacionComparable>) {
    setModulo((prev) => prev ? {
      ...prev,
      homologacionBloque: {
        ...prev.homologacionBloque,
        comparables: prev.homologacionBloque.comparables.map((c) =>
          c.comparableId === comparableId ? { ...c, ...patchHC, fechaActualizacion: new Date().toISOString() } : c,
        ),
      },
    } : prev);
  }
  function removeHomologacionComparable(comparableId: string) {
    setModulo((prev) => prev ? {
      ...prev,
      homologacionBloque: {
        ...prev.homologacionBloque,
        comparables: prev.homologacionBloque.comparables.filter((c) => c.comparableId !== comparableId),
      },
    } : prev);
  }
  function addFactorHomologacion(comparableId: string, tipo: TipoFactorHomologacion) {
    setModulo((prev) => prev ? {
      ...prev,
      homologacionBloque: {
        ...prev.homologacionBloque,
        comparables: prev.homologacionBloque.comparables.map((c) =>
          c.comparableId === comparableId
            ? { ...c, factores: [...c.factores, crearFactorHomologacionDetalle(comparableId, tipo)] }
            : c,
        ),
      },
    } : prev);
  }
  function updateFactorHomologacion(comparableId: string, factorId: string, patchF: Partial<FactorHomologacionDetalle>) {
    setModulo((prev) => prev ? {
      ...prev,
      homologacionBloque: {
        ...prev.homologacionBloque,
        comparables: prev.homologacionBloque.comparables.map((c) =>
          c.comparableId === comparableId
            ? {
                ...c,
                factores: c.factores.map((f) =>
                  f.id === factorId ? { ...f, ...patchF, fechaActualizacion: new Date().toISOString() } : f,
                ),
              }
            : c,
        ),
      },
    } : prev);
  }
  function removeFactorHomologacion(comparableId: string, factorId: string) {
    setModulo((prev) => prev ? {
      ...prev,
      homologacionBloque: {
        ...prev.homologacionBloque,
        comparables: prev.homologacionBloque.comparables.map((c) =>
          c.comparableId === comparableId ? { ...c, factores: c.factores.filter((f) => f.id !== factorId) } : c,
        ),
      },
    } : prev);
  }

  // ── Valoración de terreno (F2C) ──────────────────────────────────────────
  function patchValoracionTerrenoBloque(patchV: Partial<ValoracionTerrenoBloque>) {
    setModulo((prev) => prev ? {
      ...prev,
      valoracionTerrenoBloque: { ...prev.valoracionTerrenoBloque, ...patchV },
    } : prev);
  }
  function ensureValoracionItem(terrenoId: string) {
    setModulo((prev) => {
      if (!prev) return prev;
      if (prev.valoracionTerrenoBloque.items.some((i) => i.terrenoId === terrenoId)) return prev;
      const terreno = prev.terrenos.find((t) => t.id === terrenoId);
      const nuevo = crearValoracionTerrenoItem(terrenoId);
      // Precarga áreaHomologable con el área del terreno (en su unidad nativa)
      if (terreno && terreno.area != null) nuevo.areaHomologable = terreno.area;
      return {
        ...prev,
        valoracionTerrenoBloque: {
          ...prev.valoracionTerrenoBloque,
          items: [...prev.valoracionTerrenoBloque.items, nuevo],
        },
      };
    });
  }
  function updateValoracionItem(terrenoId: string, patchI: Partial<ValoracionTerrenoItem>) {
    setModulo((prev) => prev ? {
      ...prev,
      valoracionTerrenoBloque: {
        ...prev.valoracionTerrenoBloque,
        items: prev.valoracionTerrenoBloque.items.map((i) =>
          i.terrenoId === terrenoId ? { ...i, ...patchI } : i,
        ),
      },
    } : prev);
  }
  function removeValoracionItem(terrenoId: string) {
    setModulo((prev) => prev ? {
      ...prev,
      valoracionTerrenoBloque: {
        ...prev.valoracionTerrenoBloque,
        items: prev.valoracionTerrenoBloque.items.filter((i) => i.terrenoId !== terrenoId),
      },
    } : prev);
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

  // Adaptador de comparables (F2A) — sin useMemo para no romper Rules of Hooks
  // (este bloque vive después del early return de !modulo).
  const comparablesDisponibles = listarComparablesParaModuloUrbano();
  const comparablesFiltrados = filtrarComparablesParaModuloUrbano(
    comparablesDisponibles,
    modulo.comparablesBloque.filtros,
  );
  const idsSeleccionados = new Set(modulo.comparablesBloque.seleccionados.map((s) => s.comparableId));
  const idsDescartados = new Set(modulo.comparablesBloque.descartados.map((d) => d.comparableId));

  // Homologación (F2B): cómputos preliminares
  const seleccionadosDelBloque = modulo.comparablesBloque.seleccionados;
  const homologacionRows = seleccionadosDelBloque.map((sel) => {
    const comparable = comparablesDisponibles.find((x) => x.id === sel.comparableId);
    const snapshot = modulo.comparablesBloque.snapshots
      .filter((s) => s.comparableId === sel.comparableId)
      .slice(-1)[0];
    const hc = modulo.homologacionBloque.comparables.find((c) => c.comparableId === sel.comparableId);
    const base = hc?.baseUnitaria ?? 'terreno';
    const precioBase = comparable?.precio ?? null;
    const areaRef = base === 'terreno' ? comparable?.areaTerreno : comparable?.areaConstruccion;
    const precioUnitarioLib = base === 'terreno' ? comparable?.precioUnitarioTerreno : comparable?.precioUnitarioConstruccion;
    const precioUnitarioCalc = precioBase != null && areaRef && areaRef > 0 ? precioBase / areaRef : null;
    const precioUnitarioBase = hc?.precioUnitarioBaseManual ?? precioUnitarioLib ?? precioUnitarioCalc ?? null;
    const factoresActivos = (hc?.factores ?? []).filter((f) => f.aplica && Number.isFinite(f.coeficiente));
    const factorGlobal = factoresActivos.reduce((acc, f) => acc * (f.coeficiente || 1), 1);
    const precioUnitarioHomologado = precioUnitarioBase != null ? precioUnitarioBase * factorGlobal : null;
    return { sel, comparable, snapshot, hc, base, precioBase, precioUnitarioBase, factorGlobal, precioUnitarioHomologado };
  });

  const precioUnitariosHomologados = homologacionRows
    .map((r) => r.precioUnitarioHomologado)
    .filter((v): v is number => v != null && Number.isFinite(v));

  const promedioHomologado = precioUnitariosHomologados.length
    ? precioUnitariosHomologados.reduce((a, b) => a + b, 0) / precioUnitariosHomologados.length
    : null;
  const medianaHomologada = (() => {
    if (!precioUnitariosHomologados.length) return null;
    const arr = [...precioUnitariosHomologados].sort((a, b) => a - b);
    const mid = Math.floor(arr.length / 2);
    return arr.length % 2 === 0 ? (arr[mid - 1] + arr[mid]) / 2 : arr[mid];
  })();

  // Sincroniza promedios/medianas al estado persistido cuando cambian.
  // Nota: no usamos useEffect aquí porque este bloque vive después del early
  // return de !modulo (Rules of Hooks). Se persistirá al siguiente render/guardado.
  {
    const hb = modulo.homologacionBloque;
    if (hb.valorUnitarioPromedio !== promedioHomologado || hb.valorUnitarioMediana !== medianaHomologada) {
      // Patch sincrónico en el siguiente tick para evitar setState en render.
      setTimeout(() => {
        patchHomologacionBloque({
          valorUnitarioPromedio: promedioHomologado,
          valorUnitarioMediana: medianaHomologada,
        });
      }, 0);
    }
  }

  // ── Valoración de terreno (F2C): cómputos preliminares ───────────────────
  const valBloque = modulo.valoracionTerrenoBloque;
  const valorUnitarioCriterio =
    valBloque.criterioAdopcion === 'promedio' ? promedioHomologado :
    valBloque.criterioAdopcion === 'mediana' ? medianaHomologada :
    valBloque.criterioAdopcion === 'manual' ? valBloque.valorUnitarioAdoptado :
    null;

  const valoracionRows = modulo.terrenos.map((t) => {
    const item = valBloque.items.find((i) => i.terrenoId === t.id) ?? null;
    const vuAplicado = item?.valorUnitarioAplicado ?? valBloque.valorUnitarioAdoptado ?? valorUnitarioCriterio ?? null;
    const factor = item?.factorAjusteManual ?? 1;
    const area = item?.areaHomologable ?? null;
    const valorParcial = area != null && vuAplicado != null && Number.isFinite(area) && Number.isFinite(vuAplicado)
      ? area * vuAplicado * (factor || 1)
      : null;
    return { terreno: t, item, vuAplicado, factor, area, valorParcial };
  });

  const incluidos = valoracionRows.filter((r) => r.item?.incluyeEnValorTerreno);
  const valorTerrenoTotal = incluidos.reduce<number | null>((acc, r) => {
    if (r.valorParcial == null) return acc;
    return (acc ?? 0) + r.valorParcial;
  }, null);
  const areaTotalConsiderada = incluidos.reduce<number | null>((acc, r) => {
    if (r.area == null) return acc;
    return (acc ?? 0) + r.area;
  }, null);

  // Persistencia diferida de totales
  if (
    valBloque.valorTerrenoTotal !== valorTerrenoTotal ||
    valBloque.areaTotalConsiderada !== areaTotalConsiderada
  ) {
    setTimeout(() => {
      patchValoracionTerrenoBloque({ valorTerrenoTotal, areaTotalConsiderada });
    }, 0);
  }

  function recalcularValorUnitarioAdoptado() {
    const next =
      valBloque.criterioAdopcion === 'promedio' ? promedioHomologado :
      valBloque.criterioAdopcion === 'mediana' ? medianaHomologada :
      valBloque.valorUnitarioAdoptado;
    patchValoracionTerrenoBloque({ valorUnitarioAdoptado: next });
  }

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

                {/* Ubicación */}
                <div className="sm:col-span-2 mt-2 border-t border-slate-800 pt-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Ubicación
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Departamento">
                      <input
                        className={inputClass()}
                        value={modulo.ubicacion.departamento}
                        onChange={(e) =>
                          patch('ubicacion', { ...modulo.ubicacion, departamento: e.target.value })
                        }
                      />
                    </Field>
                    <Field label="Municipio">
                      <input
                        className={inputClass()}
                        value={modulo.ubicacion.municipio}
                        onChange={(e) =>
                          patch('ubicacion', { ...modulo.ubicacion, municipio: e.target.value })
                        }
                      />
                    </Field>
                    <Field label="Distrito / comarca / zona">
                      <input
                        className={inputClass()}
                        value={modulo.ubicacion.distrito}
                        onChange={(e) =>
                          patch('ubicacion', { ...modulo.ubicacion, distrito: e.target.value })
                        }
                      />
                    </Field>
                    <Field label="Barrio / residencial / sector">
                      <input
                        className={inputClass()}
                        value={modulo.ubicacion.barrio}
                        onChange={(e) =>
                          patch('ubicacion', { ...modulo.ubicacion, barrio: e.target.value })
                        }
                      />
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="Dirección exacta">
                        <input
                          className={inputClass()}
                          value={modulo.ubicacion.direccionExacta}
                          onChange={(e) =>
                            patch('ubicacion', {
                              ...modulo.ubicacion,
                              direccionExacta: e.target.value,
                            })
                          }
                        />
                      </Field>
                    </div>
                    <Field label="Coordenadas GPS (lat, lng)">
                      <input
                        className={inputClass()}
                        placeholder="12.1364, -86.2514"
                        value={modulo.ubicacion.coordenadasGps}
                        onChange={(e) =>
                          patch('ubicacion', {
                            ...modulo.ubicacion,
                            coordenadasGps: e.target.value,
                          })
                        }
                      />
                    </Field>
                    <Field label="Distancia al centro urbano (km)">
                      <input
                        type="number"
                        step="0.1"
                        className={inputClass()}
                        value={modulo.ubicacion.distanciaCentroUrbanoKm ?? ''}
                        onChange={(e) =>
                          patch('ubicacion', {
                            ...modulo.ubicacion,
                            distanciaCentroUrbanoKm:
                              e.target.value === '' ? null : Number(e.target.value),
                          })
                        }
                      />
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="Referencia de ubicación">
                        <textarea
                          rows={2}
                          className={inputClass()}
                          placeholder="Del parque central 2 c. al norte…"
                          value={modulo.ubicacion.referencia}
                          onChange={(e) =>
                            patch('ubicacion', {
                              ...modulo.ubicacion,
                              referencia: e.target.value,
                            })
                          }
                        />
                      </Field>
                    </div>
                  </div>
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



                {/* Lista relacional de terrenos (F1.6) */}
                <div className="sm:col-span-2 mt-2 border-t border-slate-800 pt-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Terrenos</p>
                      <p className="text-[11px] text-slate-500">Múltiples terrenos vinculados al expediente. Mejoras y construcciones pueden referenciar uno.</p>
                    </div>
                    <button type="button" onClick={addTerreno} className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100 hover:bg-cyan-400/20">+ Terreno</button>
                  </div>
                  {modulo.terrenos.length === 0 && (
                    <p className="rounded-xl border border-dashed border-slate-700 p-3 text-xs text-slate-500">Sin terrenos agregados.</p>
                  )}
                  <div className="space-y-3">
                    {modulo.terrenos.map((t, idx) => (
                      <div key={t.id} className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-xs font-semibold text-slate-200">Terreno #{idx + 1} {t.codigo && `· ${t.codigo}`}</p>
                          <button type="button" onClick={() => removeTerreno(t.id)} className="text-[11px] text-rose-300 hover:text-rose-200">Eliminar</button>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                          <Field label="Código"><input className={inputClass()} value={t.codigo} onChange={(e) => updateTerreno(t.id, { codigo: e.target.value })} /></Field>
                          <Field label="Nombre"><input className={inputClass()} value={t.nombre} onChange={(e) => updateTerreno(t.id, { nombre: e.target.value })} /></Field>
                          <Field label="Tipo">
                            <select className={inputClass()} value={t.tipo} onChange={(e) => updateTerreno(t.id, { tipo: e.target.value as TipoTerrenoUrbano })}>
                              {TIPO_TERRENO_OPCIONES.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                            </select>
                          </Field>
                          <Field label="Área"><input type="number" className={inputClass()} value={t.area ?? ''} onChange={(e) => updateTerreno(t.id, { area: e.target.value === '' ? null : Number(e.target.value) })} /></Field>
                          <Field label="Unidad">
                            <select className={inputClass()} value={t.unidad} onChange={(e) => updateTerreno(t.id, { unidad: e.target.value as UnidadAreaUrbano })}>
                              {UNIDAD_AREA_OPCIONES.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                            </select>
                          </Field>
                          <Field label="Frente (m)"><input type="number" className={inputClass()} value={t.frente ?? ''} onChange={(e) => updateTerreno(t.id, { frente: e.target.value === '' ? null : Number(e.target.value) })} /></Field>
                          <Field label="Fondo (m)"><input type="number" className={inputClass()} value={t.fondo ?? ''} onChange={(e) => updateTerreno(t.id, { fondo: e.target.value === '' ? null : Number(e.target.value) })} /></Field>
                          <Field label="Forma"><input className={inputClass()} value={t.forma} onChange={(e) => updateTerreno(t.id, { forma: e.target.value })} /></Field>
                          <Field label="Topografía"><input className={inputClass()} value={t.topografia} onChange={(e) => updateTerreno(t.id, { topografia: e.target.value })} /></Field>
                          <Field label="Uso actual"><input className={inputClass()} value={t.usoActual} onChange={(e) => updateTerreno(t.id, { usoActual: e.target.value })} /></Field>
                          <Field label="Estado">
                            <select className={inputClass()} value={t.estado} onChange={(e) => updateTerreno(t.id, { estado: e.target.value as 'activo' | 'descartado' })}>
                              <option value="activo">Activo</option>
                              <option value="descartado">Descartado</option>
                            </select>
                          </Field>
                          <div className="sm:col-span-3"><Field label="Linderos"><textarea rows={2} className={inputClass()} value={t.linderos} onChange={(e) => updateTerreno(t.id, { linderos: e.target.value })} /></Field></div>
                          <div className="sm:col-span-3"><Field label="Afectaciones"><textarea rows={2} className={inputClass()} value={t.afectaciones} onChange={(e) => updateTerreno(t.id, { afectaciones: e.target.value })} /></Field></div>
                          <div className="sm:col-span-3"><Field label="Observaciones"><textarea rows={2} className={inputClass()} value={t.observaciones} onChange={(e) => updateTerreno(t.id, { observaciones: e.target.value })} /></Field></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mejoras / infraestructuras (F1.6) */}
                <div className="sm:col-span-2 mt-2 border-t border-slate-800 pt-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Mejoras / infraestructuras</p>
                      <p className="text-[11px] text-slate-500">Vinculables opcionalmente a un terreno.</p>
                    </div>
                    <button type="button" onClick={addMejora} className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100 hover:bg-cyan-400/20">+ Mejora</button>
                  </div>
                  {modulo.mejoras.length === 0 && (
                    <p className="rounded-xl border border-dashed border-slate-700 p-3 text-xs text-slate-500">Sin mejoras registradas.</p>
                  )}
                  <div className="space-y-3">
                    {modulo.mejoras.map((mej, idx) => (
                      <div key={mej.id} className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-xs font-semibold text-slate-200">Mejora #{idx + 1}</p>
                          <button type="button" onClick={() => removeMejora(mej.id)} className="text-[11px] text-rose-300 hover:text-rose-200">Eliminar</button>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                          <Field label="Tipo">
                            <select className={inputClass()} value={mej.tipo} onChange={(e) => updateMejora(mej.id, { tipo: e.target.value as TipoMejoraUrbana })}>
                              {TIPO_MEJORA_OPCIONES.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                            </select>
                          </Field>
                          <Field label="Terreno vinculado">
                            <select className={inputClass()} value={mej.terrenoId ?? ''} onChange={(e) => updateMejora(mej.id, { terrenoId: e.target.value || null })}>
                              <option value="">— Sin vincular —</option>
                              {modulo.terrenos.map((t) => (<option key={t.id} value={t.id}>{t.codigo || t.nombre || `Terreno ${t.id.slice(-4)}`}</option>))}
                            </select>
                          </Field>
                          <Field label="Unidad"><input className={inputClass()} value={mej.unidad} onChange={(e) => updateMejora(mej.id, { unidad: e.target.value })} /></Field>
                          <Field label="Cantidad"><input type="number" className={inputClass()} value={mej.cantidad ?? ''} onChange={(e) => updateMejora(mej.id, { cantidad: e.target.value === '' ? null : Number(e.target.value) })} /></Field>
                          <Field label="Estado conservación"><input className={inputClass()} value={mej.estadoConservacion} onChange={(e) => updateMejora(mej.id, { estadoConservacion: e.target.value })} /></Field>
                          <div className="sm:col-span-3"><Field label="Descripción"><textarea rows={2} className={inputClass()} value={mej.descripcion} onChange={(e) => updateMejora(mej.id, { descripcion: e.target.value })} /></Field></div>
                          <div className="sm:col-span-3"><Field label="Observaciones"><textarea rows={2} className={inputClass()} value={mej.observaciones} onChange={(e) => updateMejora(mej.id, { observaciones: e.target.value })} /></Field></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}


            {seccionActiva === 'construcciones' && !requiereConstruccion && (
              <NoAplicaNotice motivo="El tipo de inmueble seleccionado (lote vacío) no tiene construcciones que valuar." />
            )}
            {seccionActiva === 'construcciones' && requiereConstruccion && (
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

                {/* Construcciones detalladas (F1.6) */}
                <div className="sm:col-span-2 mt-2 border-t border-slate-800 pt-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Construcciones detalladas</p>
                      <p className="text-[11px] text-slate-500">Múltiples construcciones, opcionalmente vinculadas a un terreno.</p>
                    </div>
                    <button type="button" onClick={addConstruccion} className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100 hover:bg-cyan-400/20">+ Construcción</button>
                  </div>
                  {modulo.construccionesDetalle.length === 0 && (
                    <p className="rounded-xl border border-dashed border-slate-700 p-3 text-xs text-slate-500">Sin construcciones registradas.</p>
                  )}
                  <div className="space-y-3">
                    {modulo.construccionesDetalle.map((c, idx) => (
                      <div key={c.id} className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-xs font-semibold text-slate-200">Construcción #{idx + 1} {c.codigo && `· ${c.codigo}`}</p>
                          <button type="button" onClick={() => removeConstruccion(c.id)} className="text-[11px] text-rose-300 hover:text-rose-200">Eliminar</button>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                          <Field label="Código"><input className={inputClass()} value={c.codigo} onChange={(e) => updateConstruccion(c.id, { codigo: e.target.value })} /></Field>
                          <Field label="Nombre"><input className={inputClass()} value={c.nombre} onChange={(e) => updateConstruccion(c.id, { nombre: e.target.value })} /></Field>
                          <Field label="Tipo"><input className={inputClass()} value={c.tipo} onChange={(e) => updateConstruccion(c.id, { tipo: e.target.value })} /></Field>
                          <Field label="Terreno vinculado">
                            <select className={inputClass()} value={c.terrenoId ?? ''} onChange={(e) => updateConstruccion(c.id, { terrenoId: e.target.value || null })}>
                              <option value="">— Sin vincular —</option>
                              {modulo.terrenos.map((t) => (<option key={t.id} value={t.id}>{t.codigo || t.nombre || `Terreno ${t.id.slice(-4)}`}</option>))}
                            </select>
                          </Field>
                          <Field label="Área construida (m²)"><input type="number" className={inputClass()} value={c.areaConstruida ?? ''} onChange={(e) => updateConstruccion(c.id, { areaConstruida: e.target.value === '' ? null : Number(e.target.value) })} /></Field>
                          <Field label="Niveles"><input type="number" className={inputClass()} value={c.niveles ?? ''} onChange={(e) => updateConstruccion(c.id, { niveles: e.target.value === '' ? null : Number(e.target.value) })} /></Field>
                          <Field label="Año construcción"><input type="number" className={inputClass()} value={c.anioConstruccion ?? ''} onChange={(e) => updateConstruccion(c.id, { anioConstruccion: e.target.value === '' ? null : Number(e.target.value) })} /></Field>
                          <Field label="Edad aparente (años)"><input type="number" className={inputClass()} value={c.edadAparente ?? ''} onChange={(e) => updateConstruccion(c.id, { edadAparente: e.target.value === '' ? null : Number(e.target.value) })} /></Field>
                          <Field label="Vida útil estimada"><input type="number" className={inputClass()} value={c.vidaUtilEstimada ?? ''} onChange={(e) => updateConstruccion(c.id, { vidaUtilEstimada: e.target.value === '' ? null : Number(e.target.value) })} /></Field>
                          <Field label="Sistema constructivo"><input className={inputClass()} value={c.sistemaConstructivo} onChange={(e) => updateConstruccion(c.id, { sistemaConstructivo: e.target.value })} /></Field>
                          <Field label="Estado conservación"><input className={inputClass()} value={c.estadoConservacion} onChange={(e) => updateConstruccion(c.id, { estadoConservacion: e.target.value })} /></Field>
                          <div className="sm:col-span-3"><Field label="Observaciones"><textarea rows={2} className={inputClass()} value={c.observaciones} onChange={(e) => updateConstruccion(c.id, { observaciones: e.target.value })} /></Field></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {seccionActiva === 'ambientes' && !requiereConstruccion && (
              <NoAplicaNotice motivo="Lote vacío: no hay ambientes a relevar." />
            )}
            {seccionActiva === 'ambientes' && requiereConstruccion && (
              <div className="space-y-4">
                {modulo.construccionesDetalle.length === 0 && (
                  <p className="rounded-xl border border-dashed border-slate-700 p-3 text-xs text-slate-500">
                    Agregá primero al menos una construcción para poder registrar ambientes.
                  </p>
                )}
                {modulo.construccionesDetalle.map((c) => {
                  const ambientesDeC = modulo.ambientesDetalle.filter((a) => a.construccionId === c.id);
                  return (
                    <div key={c.id} className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-100">{c.codigo || c.nombre || 'Construcción'}</p>
                          <p className="text-[11px] text-slate-500">{ambientesDeC.length} ambiente(s)</p>
                        </div>
                        <button type="button" onClick={() => addAmbiente(c.id)} className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100 hover:bg-cyan-400/20">+ Ambiente</button>
                      </div>
                      {ambientesDeC.length === 0 && (
                        <p className="rounded-xl border border-dashed border-slate-700 p-3 text-xs text-slate-500">Sin ambientes registrados.</p>
                      )}
                      <div className="space-y-3">
                        {ambientesDeC.map((a, idx) => (
                          <div key={a.id} className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
                            <div className="mb-2 flex items-center justify-between">
                              <p className="text-xs font-semibold text-slate-200">Ambiente #{idx + 1}</p>
                              <button type="button" onClick={() => removeAmbiente(a.id)} className="text-[11px] text-rose-300 hover:text-rose-200">Eliminar</button>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-3">
                              <Field label="Tipo">
                                <select className={inputClass()} value={a.tipo} onChange={(e) => updateAmbiente(a.id, { tipo: e.target.value as TipoAmbienteUrbano })}>
                                  {TIPO_AMBIENTE_OPCIONES.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                                </select>
                              </Field>
                              <Field label="Nombre"><input className={inputClass()} value={a.nombre} onChange={(e) => updateAmbiente(a.id, { nombre: e.target.value })} /></Field>
                              <Field label="Cantidad"><input type="number" className={inputClass()} value={a.cantidad ?? ''} onChange={(e) => updateAmbiente(a.id, { cantidad: e.target.value === '' ? null : Number(e.target.value) })} /></Field>
                              <Field label="Área (m²)"><input type="number" className={inputClass()} value={a.area ?? ''} onChange={(e) => updateAmbiente(a.id, { area: e.target.value === '' ? null : Number(e.target.value) })} /></Field>
                              <Field label="Estado"><input className={inputClass()} value={a.estado} onChange={(e) => updateAmbiente(a.id, { estado: e.target.value })} /></Field>
                              <div className="sm:col-span-3"><Field label="Observaciones"><textarea rows={2} className={inputClass()} value={a.observaciones} onChange={(e) => updateAmbiente(a.id, { observaciones: e.target.value })} /></Field></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {seccionActiva === 'fotografias' && <PlaceholderSection titulo="Fotografías (F1: placeholder)" />}
            {seccionActiva === 'comparables' && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Filtros de búsqueda (preparado para Biblioteca)</p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Field label="Municipio"><input className={inputClass()} value={modulo.comparablesBloque.filtros.municipio} onChange={(e) => updateFiltrosComparables({ municipio: e.target.value })} /></Field>
                    <Field label="Zona"><input className={inputClass()} value={modulo.comparablesBloque.filtros.zona} onChange={(e) => updateFiltrosComparables({ zona: e.target.value })} /></Field>
                    <Field label="Tipo de inmueble"><input className={inputClass()} value={modulo.comparablesBloque.filtros.tipoInmueble} onChange={(e) => updateFiltrosComparables({ tipoInmueble: e.target.value })} /></Field>
                    <Field label="Uso"><input className={inputClass()} value={modulo.comparablesBloque.filtros.uso} onChange={(e) => updateFiltrosComparables({ uso: e.target.value })} /></Field>
                    <Field label="Fuente"><input className={inputClass()} value={modulo.comparablesBloque.filtros.fuente} onChange={(e) => updateFiltrosComparables({ fuente: e.target.value })} /></Field>
                    <Field label="Estado"><input className={inputClass()} value={modulo.comparablesBloque.filtros.estado} onChange={(e) => updateFiltrosComparables({ estado: e.target.value })} /></Field>
                    <Field label="Área mín. (m²)"><input type="number" className={inputClass()} value={modulo.comparablesBloque.filtros.areaMin ?? ''} onChange={(e) => updateFiltrosComparables({ areaMin: e.target.value === '' ? null : Number(e.target.value) })} /></Field>
                    <Field label="Área máx. (m²)"><input type="number" className={inputClass()} value={modulo.comparablesBloque.filtros.areaMax ?? ''} onChange={(e) => updateFiltrosComparables({ areaMax: e.target.value === '' ? null : Number(e.target.value) })} /></Field>
                    <Field label="Precio mín."><input type="number" className={inputClass()} value={modulo.comparablesBloque.filtros.precioMin ?? ''} onChange={(e) => updateFiltrosComparables({ precioMin: e.target.value === '' ? null : Number(e.target.value) })} /></Field>
                    <Field label="Precio máx."><input type="number" className={inputClass()} value={modulo.comparablesBloque.filtros.precioMax ?? ''} onChange={(e) => updateFiltrosComparables({ precioMax: e.target.value === '' ? null : Number(e.target.value) })} /></Field>
                    <Field label="Fecha desde"><input type="date" className={inputClass()} value={modulo.comparablesBloque.filtros.fechaDesde} onChange={(e) => updateFiltrosComparables({ fechaDesde: e.target.value })} /></Field>
                    <Field label="Fecha hasta"><input type="date" className={inputClass()} value={modulo.comparablesBloque.filtros.fechaHasta} onChange={(e) => updateFiltrosComparables({ fechaHasta: e.target.value })} /></Field>
                    <Field label="Vía de acceso"><input className={inputClass()} value={modulo.comparablesBloque.filtros.viaAcceso} onChange={(e) => updateFiltrosComparables({ viaAcceso: e.target.value })} /></Field>
                    <Field label="Servicios"><input className={inputClass()} value={modulo.comparablesBloque.filtros.servicios} onChange={(e) => updateFiltrosComparables({ servicios: e.target.value })} /></Field>
                    <Field label="Topografía"><input className={inputClass()} value={modulo.comparablesBloque.filtros.topografia} onChange={(e) => updateFiltrosComparables({ topografia: e.target.value })} /></Field>
                  </div>
                </div>

                {/* Resumen + aviso de mínimo */}
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-800 bg-slate-950/40 p-3">
                  <p className="text-xs text-slate-300">
                    {comparablesFiltrados.length} resultado(s) en la Biblioteca · {modulo.comparablesBloque.seleccionados.length} seleccionado(s) · {modulo.comparablesBloque.descartados.length} descartado(s)
                  </p>
                  {modulo.comparablesBloque.seleccionados.length < 3 && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-200">
                      ⚠ Recomendado: al menos 3 comparables seleccionados
                    </span>
                  )}
                </div>

                {/* Lista disponible desde Biblioteca */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Disponibles en Biblioteca</p>
                  {comparablesDisponibles.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-slate-700 p-3 text-xs text-slate-500">
                      La Biblioteca no tiene comparables registrados todavía. Agregalos desde Plataforma → Comparables.
                    </p>
                  ) : comparablesFiltrados.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-slate-700 p-3 text-xs text-slate-500">Ningún comparable cumple los filtros actuales.</p>
                  ) : (
                    <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
                      {comparablesFiltrados.map((c) => {
                        const sel = idsSeleccionados.has(c.id);
                        const dsc = idsDescartados.has(c.id);
                        return (
                          <div key={c.id} className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-slate-800 bg-slate-900/40 p-3">
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-slate-100">{resumenComparable(c)}</p>
                              <p className="text-[11px] text-slate-400">
                                {[c.municipio, c.barrio].filter(Boolean).join(' · ') || c.ubicacion} · {c.tipo} · {c.estado}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {c.fecha || '—'} · Área T: {c.areaTerreno ?? '—'} · Área C: {c.areaConstruccion ?? '—'} · {c.moneda} {Number(c.precio || 0).toLocaleString('en-US')}
                              </p>
                            </div>
                            <div className="flex flex-shrink-0 gap-2">
                              <button
                                type="button"
                                disabled={sel}
                                onClick={() => seleccionarComparable(c)}
                                className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-[11px] text-emerald-100 hover:bg-emerald-400/20 disabled:opacity-40"
                              >
                                {sel ? 'Seleccionado' : 'Seleccionar'}
                              </button>
                              <button
                                type="button"
                                disabled={dsc}
                                onClick={() => {
                                  const motivo = window.prompt('Motivo del descarte:', '') ?? '';
                                  if (motivo.trim()) descartarComparable(c, motivo.trim());
                                }}
                                className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-2 py-1 text-[11px] text-rose-100 hover:bg-rose-400/20 disabled:opacity-40"
                              >
                                {dsc ? 'Descartado' : 'Descartar'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Seleccionados ({modulo.comparablesBloque.seleccionados.length})</p>
                    {modulo.comparablesBloque.seleccionados.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-slate-700 p-3 text-xs text-slate-500">Ningún comparable seleccionado todavía.</p>
                    ) : (
                      <ul className="space-y-2 text-xs text-slate-300">
                        {modulo.comparablesBloque.seleccionados.map((s) => {
                          const c = comparablesDisponibles.find((x) => x.id === s.comparableId);
                          return (
                            <li key={s.id} className="flex items-start justify-between gap-2 rounded-xl border border-slate-800 bg-slate-900/40 p-2">
                              <div className="min-w-0">
                                <p className="font-medium text-slate-100">{c ? resumenComparable(c) : s.comparableId}</p>
                                <p className="text-[11px] text-slate-500">{s.fechaSeleccion.slice(0, 10)} · listo para homologación (F2B)</p>
                              </div>
                              <button type="button" onClick={() => quitarSeleccionado(s.comparableId)} className="text-[11px] text-rose-300 hover:text-rose-200">Quitar</button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Descartados ({modulo.comparablesBloque.descartados.length})</p>
                    {modulo.comparablesBloque.descartados.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-slate-700 p-3 text-xs text-slate-500">Sin descartes registrados.</p>
                    ) : (
                      <ul className="space-y-2 text-xs text-slate-300">
                        {modulo.comparablesBloque.descartados.map((d) => {
                          const c = comparablesDisponibles.find((x) => x.id === d.comparableId);
                          return (
                            <li key={d.id} className="flex items-start justify-between gap-2 rounded-xl border border-slate-800 bg-slate-900/40 p-2">
                              <div className="min-w-0">
                                <p className="font-medium text-slate-100">{c ? resumenComparable(c) : d.comparableId}</p>
                                <p className="text-[11px] text-slate-500">{d.fechaDescarte.slice(0, 10)} · Motivo: {d.motivo}</p>
                              </div>
                              <button type="button" onClick={() => quitarDescartado(d.comparableId)} className="text-[11px] text-slate-300 hover:text-slate-100">Quitar</button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-slate-500">
                  Snapshots inmutables guardados: {modulo.comparablesBloque.snapshots.length}. Cada selección genera una copia conservada en el módulo aunque el comparable cambie luego en la Biblioteca.
                </p>

              </div>
            )}

            {seccionActiva === 'homologacion' && (
              <div className="space-y-4">
                {/* Resumen */}
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-800 bg-slate-950/40 p-3">
                  <p className="text-xs text-slate-300">
                    {homologacionRows.length} comparable(s) seleccionado(s) · {precioUnitariosHomologados.length} con valor unitario homologado
                  </p>
                  {homologacionRows.length < 3 && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-200">
                      ⚠ Recomendado: al menos 3 comparables para homologar
                    </span>
                  )}
                </div>

                {homologacionRows.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-700 p-4 text-xs text-slate-500">
                    No hay comparables seleccionados. Volvé a la sección <span className="text-slate-300">Comparables</span> para seleccionar al menos uno.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {homologacionRows.map((row) => {
                      const { sel, comparable, hc, base, precioBase, precioUnitarioBase, factorGlobal, precioUnitarioHomologado } = row;
                      const cargado = Boolean(hc);
                      return (
                        <div key={sel.comparableId} className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                          <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-100">
                                {comparable ? resumenComparable(comparable) : sel.comparableId}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {comparable
                                  ? `${[comparable.municipio, comparable.barrio].filter(Boolean).join(' · ') || comparable.ubicacion} · ${comparable.tipo}`
                                  : 'Sólo snapshot histórico disponible'}
                              </p>
                            </div>
                            {!cargado ? (
                              <button
                                type="button"
                                onClick={() => ensureHomologacionComparable(sel.comparableId, 'terreno')}
                                className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-2 py-1 text-[11px] text-cyan-100 hover:bg-cyan-400/20"
                              >
                                Iniciar homologación
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => removeHomologacionComparable(sel.comparableId)}
                                className="text-[11px] text-rose-300 hover:text-rose-200"
                              >
                                Quitar homologación
                              </button>
                            )}
                          </div>

                          {cargado && hc && (
                            <>
                              <div className="grid gap-3 sm:grid-cols-4">
                                <Field label="Base unitaria">
                                  <select
                                    className={inputClass()}
                                    value={hc.baseUnitaria}
                                    onChange={(e) => updateHomologacionComparable(sel.comparableId, { baseUnitaria: e.target.value as BaseUnitariaHomologacion })}
                                  >
                                    <option value="terreno">Terreno (m²)</option>
                                    <option value="construccion">Construcción (m²)</option>
                                  </select>
                                </Field>
                                <Field label="Precio base">
                                  <input
                                    className={inputClass()}
                                    value={precioBase ?? ''}
                                    readOnly
                                    placeholder="—"
                                  />
                                </Field>
                                <Field label="P. unitario base (manual si falta)">
                                  <input
                                    type="number"
                                    className={inputClass()}
                                    value={hc.precioUnitarioBaseManual ?? ''}
                                    onChange={(e) => updateHomologacionComparable(sel.comparableId, { precioUnitarioBaseManual: e.target.value === '' ? null : Number(e.target.value) })}
                                    placeholder={precioUnitarioBase != null ? String(Number(precioUnitarioBase).toFixed(2)) : '—'}
                                  />
                                </Field>
                                <Field label="Observaciones">
                                  <input
                                    className={inputClass()}
                                    value={hc.observaciones}
                                    onChange={(e) => updateHomologacionComparable(sel.comparableId, { observaciones: e.target.value })}
                                  />
                                </Field>
                              </div>

                              {/* Factores */}
                              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/40 p-3">
                                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Factores ({hc.factores.length})</p>
                                  <div className="flex items-center gap-2">
                                    <select
                                      className="rounded-xl border border-slate-700 bg-slate-950/60 px-2 py-1 text-[11px] text-slate-100"
                                      defaultValue=""
                                      onChange={(e) => {
                                        const t = e.target.value as TipoFactorHomologacion | '';
                                        if (!t) return;
                                        addFactorHomologacion(sel.comparableId, t);
                                        e.currentTarget.value = '';
                                      }}
                                    >
                                      <option value="">+ Agregar factor…</option>
                                      {FACTORES_HOMOLOGACION_DEF.map((d) => (
                                        <option key={d.tipo} value={d.tipo}>{d.nombre}</option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                                {hc.factores.length === 0 ? (
                                  <p className="rounded-lg border border-dashed border-slate-700 p-2 text-[11px] text-slate-500">Sin factores aún. Agregá uno desde el selector.</p>
                                ) : (
                                  <div className="space-y-2">
                                    {hc.factores.map((f) => {
                                      const fueraRango = f.aplica && (f.coeficiente < 0.7 || f.coeficiente > 1.3);
                                      return (
                                        <div key={f.id} className={`rounded-lg border p-2 ${fueraRango ? 'border-amber-400/40 bg-amber-500/5' : 'border-slate-800 bg-slate-950/40'}`}>
                                          <div className="grid gap-2 sm:grid-cols-12">
                                            <div className="sm:col-span-3">
                                              <span className={labelClass()}>Factor</span>
                                              <input
                                                className={inputClass()}
                                                value={f.nombre}
                                                onChange={(e) => updateFactorHomologacion(sel.comparableId, f.id, { nombre: e.target.value })}
                                              />
                                            </div>
                                            <div className="sm:col-span-2">
                                              <span className={labelClass()}>V. sujeto</span>
                                              <input className={inputClass()} value={f.valorSujeto} onChange={(e) => updateFactorHomologacion(sel.comparableId, f.id, { valorSujeto: e.target.value })} />
                                            </div>
                                            <div className="sm:col-span-2">
                                              <span className={labelClass()}>V. comparable</span>
                                              <input className={inputClass()} value={f.valorComparable} onChange={(e) => updateFactorHomologacion(sel.comparableId, f.id, { valorComparable: e.target.value })} />
                                            </div>
                                            <div className="sm:col-span-1">
                                              <span className={labelClass()}>Coef.</span>
                                              <input
                                                type="number"
                                                step="0.01"
                                                className={inputClass()}
                                                value={f.coeficiente}
                                                onChange={(e) => updateFactorHomologacion(sel.comparableId, f.id, { coeficiente: Number(e.target.value) || 0 })}
                                              />
                                            </div>
                                            <div className="sm:col-span-1">
                                              <span className={labelClass()}>Pond.</span>
                                              <input
                                                type="number"
                                                step="0.01"
                                                className={inputClass()}
                                                value={f.ponderacion ?? ''}
                                                onChange={(e) => updateFactorHomologacion(sel.comparableId, f.id, { ponderacion: e.target.value === '' ? null : Number(e.target.value) })}
                                              />
                                            </div>
                                            <div className="sm:col-span-1 flex items-end gap-1">
                                              <label className="flex items-center gap-1 text-[11px] text-slate-300">
                                                <input
                                                  type="checkbox"
                                                  checked={f.aplica}
                                                  onChange={(e) => updateFactorHomologacion(sel.comparableId, f.id, { aplica: e.target.checked })}
                                                />
                                                Aplica
                                              </label>
                                            </div>
                                            <div className="sm:col-span-2 flex items-end justify-end">
                                              <button type="button" onClick={() => removeFactorHomologacion(sel.comparableId, f.id)} className="text-[11px] text-rose-300 hover:text-rose-200">Eliminar</button>
                                            </div>
                                            <div className="sm:col-span-12">
                                              <span className={labelClass()}>Justificación / observación técnica</span>
                                              <input className={inputClass()} value={f.justificacion} onChange={(e) => updateFactorHomologacion(sel.comparableId, f.id, { justificacion: e.target.value })} />
                                            </div>
                                          </div>
                                          {fueraRango && (
                                            <p className="mt-1 text-[11px] text-amber-200">⚠ Coeficiente fuera del rango sugerido 0.70–1.30; documentá la justificación.</p>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>

                              {/* Resultado preliminar */}
                              <div className="mt-3 grid gap-2 rounded-xl border border-slate-800 bg-slate-900/40 p-3 sm:grid-cols-3">
                                <div>
                                  <p className="text-[10px] uppercase tracking-wide text-slate-500">Factor global</p>
                                  <p className="text-sm font-semibold text-slate-100">{factorGlobal.toFixed(4)}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase tracking-wide text-slate-500">P. unitario base</p>
                                  <p className="text-sm text-slate-100">{precioUnitarioBase != null ? precioUnitarioBase.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '—'}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase tracking-wide text-slate-500">P. unitario homologado</p>
                                  <p className="text-sm font-semibold text-cyan-200">{precioUnitarioHomologado != null ? precioUnitarioHomologado.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '—'}</p>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Resumen estadístico */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Resumen preliminar</p>
                  <div className="grid gap-3 sm:grid-cols-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-slate-500">Promedio</p>
                      <p className="text-sm font-semibold text-slate-100">{promedioHomologado != null ? promedioHomologado.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '—'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-slate-500">Mediana</p>
                      <p className="text-sm font-semibold text-slate-100">{medianaHomologada != null ? medianaHomologada.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '—'}</p>
                    </div>
                    <Field label="Valor unitario adoptado (opcional)">
                      <input
                        type="number"
                        className={inputClass()}
                        value={modulo.homologacionBloque.valorUnitarioAdoptado ?? ''}
                        onChange={(e) => patchHomologacionBloque({ valorUnitarioAdoptado: e.target.value === '' ? null : Number(e.target.value) })}
                      />
                    </Field>
                    <Field label="Criterio de adopción">
                      <select
                        className={inputClass()}
                        value={modulo.homologacionBloque.criterioAdopcion}
                        onChange={(e) => patchHomologacionBloque({ criterioAdopcion: e.target.value as CriterioAdopcionHomologacion })}
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="promedio">Promedio</option>
                        <option value="mediana">Mediana</option>
                        <option value="manual">Manual</option>
                      </select>
                    </Field>
                  </div>
                  <div className="mt-3">
                    <Field label="Observaciones de homologación">
                      <textarea
                        className={inputClass()}
                        rows={2}
                        value={modulo.homologacionBloque.observacionesHomologacion}
                        onChange={(e) => patchHomologacionBloque({ observacionesHomologacion: e.target.value })}
                      />
                    </Field>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500">
                    F2B: cálculo preliminar de valor unitario. No adopta todavía valor final del terreno ni del inmueble. La decisión final se hará en F2C / F3.
                  </p>
                </div>
              </div>
            )}
            {seccionActiva === 'costo_reposicion' && (requiereConstruccion
              ? <PlaceholderSection titulo="Costo / reposición (F3)" />
              : <NoAplicaNotice motivo="Lote vacío: no aplica costo de reposición de construcción." />)}
            {seccionActiva === 'depreciacion' && (requiereConstruccion
              ? <PlaceholderSection titulo="Depreciación (F3)" />
              : <NoAplicaNotice motivo="Lote vacío: no aplica depreciación de construcción." />)}
            {seccionActiva === 'calculo_final' && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                  <p className="text-sm font-semibold text-slate-200">Valor de terreno (F2C)</p>
                  <p className="mt-1 text-[11px] leading-5 text-slate-500">
                    Adopta un valor unitario a partir de la homologación preliminar y calcula el valor parcial de cada terreno del sujeto.
                    {tipoRequiereConstruccion(modulo.identificacion.tipoInmueble)
                      ? ' Para inmuebles con construcción, este monto es sólo la componente de terreno; la construcción se calculará en F3.'
                      : ' Para lote vacío, este monto es la base principal del avalúo.'}
                  </p>
                </div>

                {/* Advertencias */}
                {(modulo.comparablesBloque.seleccionados.length < 3 ||
                  valBloque.valorUnitarioAdoptado == null ||
                  incluidos.length === 0) && (
                  <div className="rounded-2xl border border-amber-400/30 bg-amber-500/5 p-3 text-[11px] text-amber-200 space-y-1">
                    {modulo.comparablesBloque.seleccionados.length < 3 && (
                      <p>⚠ Hay menos de 3 comparables seleccionados; la homologación es estadísticamente débil.</p>
                    )}
                    {valBloque.valorUnitarioAdoptado == null && (
                      <p>⚠ No hay valor unitario adoptado todavía. Seleccioná un criterio y recalculá.</p>
                    )}
                    {incluidos.length === 0 && (
                      <p>⚠ Ningún terreno está incluido en el cálculo del valor total.</p>
                    )}
                  </div>
                )}

                {/* Adopción */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Adopción de valor unitario</p>
                  <div className="grid gap-3 sm:grid-cols-4">
                    <Field label="Criterio">
                      <select
                        className={inputClass()}
                        value={valBloque.criterioAdopcion}
                        onChange={(e) => patchValoracionTerrenoBloque({ criterioAdopcion: e.target.value as CriterioAdopcionHomologacion })}
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="promedio">Promedio homologado</option>
                        <option value="mediana">Mediana homologada</option>
                        <option value="manual">Manual</option>
                      </select>
                    </Field>
                    <Field label="Valor unitario adoptado">
                      <input
                        type="number"
                        className={inputClass()}
                        value={valBloque.valorUnitarioAdoptado ?? ''}
                        onChange={(e) => patchValoracionTerrenoBloque({ valorUnitarioAdoptado: e.target.value === '' ? null : Number(e.target.value) })}
                        placeholder={valorUnitarioCriterio != null ? Number(valorUnitarioCriterio).toFixed(2) : '—'}
                        readOnly={valBloque.criterioAdopcion !== 'manual' && valBloque.criterioAdopcion !== 'pendiente'}
                      />
                    </Field>
                    <Field label="Unidad base">
                      <select
                        className={inputClass()}
                        value={valBloque.unidadBase}
                        onChange={(e) => patchValoracionTerrenoBloque({ unidadBase: e.target.value as UnidadBaseValor })}
                      >
                        {UNIDAD_BASE_VALOR_OPCIONES.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </Field>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={recalcularValorUnitarioAdoptado}
                        className="w-full rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-100 hover:bg-cyan-400/20"
                      >
                        Recalcular desde homologación
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <Field label="Justificación técnica del valor adoptado">
                      <textarea
                        rows={2}
                        className={inputClass()}
                        value={valBloque.justificacionTecnica}
                        onChange={(e) => patchValoracionTerrenoBloque({ justificacionTecnica: e.target.value })}
                      />
                    </Field>
                    <Field label="Observaciones técnicas">
                      <textarea
                        rows={2}
                        className={inputClass()}
                        value={valBloque.observaciones}
                        onChange={(e) => patchValoracionTerrenoBloque({ observaciones: e.target.value })}
                      />
                    </Field>
                  </div>
                  <div className="mt-3 grid gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-3 sm:grid-cols-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-slate-500">V.U. promedio (homol.)</p>
                      <p className="text-sm text-slate-100">{promedioHomologado != null ? promedioHomologado.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '—'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-slate-500">V.U. mediana (homol.)</p>
                      <p className="text-sm text-slate-100">{medianaHomologada != null ? medianaHomologada.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '—'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-slate-500">V.U. adoptado</p>
                      <p className="text-sm font-semibold text-cyan-200">{valBloque.valorUnitarioAdoptado != null ? valBloque.valorUnitarioAdoptado.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '—'}</p>
                    </div>
                  </div>
                </div>

                {/* Tabla de terrenos valorados */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Terrenos valorados ({valoracionRows.length})</p>
                  {valoracionRows.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-slate-700 p-4 text-xs text-slate-500">
                      No hay terrenos registrados. Volvé a la sección <span className="text-slate-300">Terreno</span> y agregá al menos uno.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {valoracionRows.map((row) => {
                        const { terreno: t, item, vuAplicado, factor, area, valorParcial } = row;
                        const cargado = Boolean(item);
                        return (
                          <div key={t.id} className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
                            <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-100">
                                  {t.codigo || t.nombre || `Terreno ${t.id.slice(-4)}`}
                                  <span className="ml-2 text-[10px] uppercase tracking-wide text-slate-500">{t.tipo}</span>
                                </p>
                                <p className="text-[11px] text-slate-500">
                                  Área registrada: {t.area != null ? `${t.area} ${t.unidad}` : '—'}
                                </p>
                              </div>
                              {!cargado ? (
                                <button
                                  type="button"
                                  onClick={() => ensureValoracionItem(t.id)}
                                  className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-2 py-1 text-[11px] text-cyan-100 hover:bg-cyan-400/20"
                                >
                                  Activar valoración
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => removeValoracionItem(t.id)}
                                  className="text-[11px] text-rose-300 hover:text-rose-200"
                                >
                                  Quitar valoración
                                </button>
                              )}
                            </div>
                            {cargado && item && (
                              <>
                                <div className="grid gap-2 sm:grid-cols-12">
                                  <div className="sm:col-span-2">
                                    <label className="flex items-center gap-1 text-[11px] text-slate-300">
                                      <input
                                        type="checkbox"
                                        checked={item.incluyeEnValorTerreno}
                                        onChange={(e) => updateValoracionItem(t.id, { incluyeEnValorTerreno: e.target.checked })}
                                      />
                                      Incluir en total
                                    </label>
                                  </div>
                                  <div className="sm:col-span-2">
                                    <span className={labelClass()}>Área homologable</span>
                                    <input
                                      type="number"
                                      className={inputClass()}
                                      value={item.areaHomologable ?? ''}
                                      onChange={(e) => updateValoracionItem(t.id, { areaHomologable: e.target.value === '' ? null : Number(e.target.value) })}
                                    />
                                  </div>
                                  <div className="sm:col-span-2">
                                    <span className={labelClass()}>V.U. aplicado</span>
                                    <input
                                      type="number"
                                      className={inputClass()}
                                      value={item.valorUnitarioAplicado ?? ''}
                                      onChange={(e) => updateValoracionItem(t.id, { valorUnitarioAplicado: e.target.value === '' ? null : Number(e.target.value) })}
                                      placeholder={valBloque.valorUnitarioAdoptado != null ? String(valBloque.valorUnitarioAdoptado) : '—'}
                                    />
                                  </div>
                                  <div className="sm:col-span-2">
                                    <span className={labelClass()}>Factor manual</span>
                                    <input
                                      type="number"
                                      step="0.01"
                                      className={inputClass()}
                                      value={item.factorAjusteManual ?? ''}
                                      onChange={(e) => updateValoracionItem(t.id, { factorAjusteManual: e.target.value === '' ? null : Number(e.target.value) })}
                                      placeholder="1.00"
                                    />
                                  </div>
                                  <div className="sm:col-span-4">
                                    <span className={labelClass()}>Valor parcial</span>
                                    <p className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm font-semibold text-emerald-200">
                                      {valorParcial != null ? valorParcial.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '—'}
                                    </p>
                                  </div>
                                  <div className="sm:col-span-12">
                                    <span className={labelClass()}>Justificación del valor</span>
                                    <input
                                      className={inputClass()}
                                      value={item.justificacionValor}
                                      onChange={(e) => updateValoracionItem(t.id, { justificacionValor: e.target.value })}
                                    />
                                  </div>
                                  <div className="sm:col-span-12">
                                    <span className={labelClass()}>Observaciones</span>
                                    <input
                                      className={inputClass()}
                                      value={item.observaciones}
                                      onChange={(e) => updateValoracionItem(t.id, { observaciones: e.target.value })}
                                    />
                                  </div>
                                </div>
                                <p className="mt-2 text-[10px] text-slate-500">
                                  Cálculo: área × valor unitario aplicado × factor ({factor || 1}) ={' '}
                                  {area != null && vuAplicado != null
                                    ? `${area} × ${vuAplicado} × ${factor || 1}`
                                    : 'faltan datos'}
                                </p>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Resumen total */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Resumen del valor de terreno</p>
                  <div className="grid gap-3 sm:grid-cols-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-slate-500">Terrenos incluidos</p>
                      <p className="text-sm font-semibold text-slate-100">{incluidos.length} / {valoracionRows.length}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-slate-500">Área total considerada</p>
                      <p className="text-sm font-semibold text-slate-100">
                        {areaTotalConsiderada != null ? `${areaTotalConsiderada.toLocaleString('en-US', { maximumFractionDigits: 2 })}` : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-slate-500">V.U. adoptado</p>
                      <p className="text-sm text-slate-100">
                        {valBloque.valorUnitarioAdoptado != null ? valBloque.valorUnitarioAdoptado.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-slate-500">Valor total de terreno</p>
                      <p className="text-base font-semibold text-emerald-200">
                        {valorTerrenoTotal != null ? valorTerrenoTotal.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '—'}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-[11px] text-slate-500">
                    F2C: cálculo preliminar del valor de terreno. No incluye costo de construcción, depreciación ni reposición (pendiente F3).
                  </p>
                </div>
              </div>
            )}
            {seccionActiva === 'informe' && <PlaceholderSection titulo="Informe (F5)" />}
            {seccionActiva === 'anexos' && <PlaceholderSection titulo="Anexos (F6)" />}
          </section>
        </div>
      </div>
    </div>
  );
}
