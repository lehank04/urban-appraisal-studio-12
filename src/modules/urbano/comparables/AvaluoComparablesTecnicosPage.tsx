import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Database,
  ExternalLink,
  FileImage,
  Search,
  Snowflake,
  Trash2,
  XCircle,
} from 'lucide-react';
import {
  ComparableIndiceINMOVAL,
  getComparablesIndiceINMOVAL,
} from '@/platform/comparables/comparableStorage';
import {
  ComparableAvaluoINMOVAL,
  EstadoComparableAvaluoINMOVAL,
  RevisionComparableAvaluoINMOVAL,
  addComparableToAvaluoINMOVAL,
  congelarComparableAvaluoINMOVAL,
  getAvaluoComparablesINMOVAL,
  removeComparableAvaluoINMOVAL,
  updateComparableAvaluoINMOVAL,
} from './avaluoComparablesStorage';

function formatMoney(value: number, moneda: string) {
  return `${moneda} ${Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function estadoClasses(estado: EstadoComparableAvaluoINMOVAL) {
  if (estado === 'congelado') {
    return 'border-sky-400/30 bg-sky-400/10 text-sky-100';
  }

  if (estado === 'usado') {
    return 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100';
  }

  if (estado === 'descartado') {
    return 'border-rose-400/30 bg-rose-400/10 text-rose-100';
  }

  return 'border-amber-400/30 bg-amber-400/10 text-amber-100';
}

export default function AvaluoComparablesTecnicosPage() {
  const { id } = useParams();
  const avaluoId = id || '';

  const [version, setVersion] = useState(0);
  const [busqueda, setBusqueda] = useState('');

  const comparablesBase = useMemo(
    () => getComparablesIndiceINMOVAL(),
    [version]
  );

  const comparablesAvaluo = useMemo(
    () => getAvaluoComparablesINMOVAL(avaluoId),
    [avaluoId, version]
  );

  const comparablesDisponibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    const usados = new Set(comparablesAvaluo.map((item) => item.comparableId));

    return comparablesBase
      .filter((item) => !usados.has(item.id))
      .filter((item) => {
        if (!q) return true;

        return [
          item.codigo,
          item.titulo,
          item.ubicacion,
          item.barrio,
          item.municipio,
          item.departamento,
          item.fuente,
          item.observaciones,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(q));
      });
  }, [comparablesBase, comparablesAvaluo, busqueda]);

  const resumen = useMemo(() => {
    return {
      total: comparablesAvaluo.length,
      usados: comparablesAvaluo.filter((item) => item.estado === 'usado').length,
      congelados: comparablesAvaluo.filter((item) => item.estado === 'congelado')
        .length,
      descartados: comparablesAvaluo.filter((item) => item.estado === 'descartado')
        .length,
      conTestigo: comparablesAvaluo.filter(
        (item) => item.snapshot.testigoWebImagenDataUrl
      ).length,
    };
  }, [comparablesAvaluo]);

  function refrescar() {
    setVersion((current) => current + 1);
  }

  function handleAgregar(comparable: ComparableIndiceINMOVAL) {
    addComparableToAvaluoINMOVAL(avaluoId, comparable);
    refrescar();
  }

  function handleActualizar(
    comparable: ComparableAvaluoINMOVAL,
    cambios: Partial<ComparableAvaluoINMOVAL>
  ) {
    updateComparableAvaluoINMOVAL(comparable.id, cambios);
    refrescar();
  }

  function handleCongelar(comparable: ComparableAvaluoINMOVAL) {
    congelarComparableAvaluoINMOVAL(comparable.id);
    refrescar();
  }

  function handleEliminar(comparable: ComparableAvaluoINMOVAL) {
    const ok = window.confirm('¿Quitar este comparable del avalúo?');

    if (!ok) return;

    removeComparableAvaluoINMOVAL(comparable.id);
    refrescar();
  }

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/30">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-300">
                Módulo urbano · Comparables técnicos
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-50">
                Selección de comparables para avalúo
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                Aquí se seleccionan técnicamente los comparables que se usarán
                en el avalúo. La plataforma administra la base; el avalúo decide
                cuáles usa, descarta o congela para reporte.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to={`/avaluos/${avaluoId}`}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950/50 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al avalúo
              </Link>

              <Link
                to="/comparables"
                className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:bg-emerald-400/20"
              >
                <Database className="h-4 w-4" />
                Base de comparables
              </Link>

              <Link
                to={`/avaluos/${avaluoId}/anexos-testigos`}
                className="inline-flex items-center gap-2 rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 py-3 text-sm font-medium text-sky-100 transition hover:bg-sky-400/20"
              >
                <FileImage className="h-4 w-4" />
                Anexos testigos
              </Link>
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Total
            </p>
            <p className="mt-3 text-3xl font-bold text-slate-50">
              {resumen.total}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Usados
            </p>
            <p className="mt-3 text-3xl font-bold text-slate-50">
              {resumen.usados}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Congelados
            </p>
            <p className="mt-3 text-3xl font-bold text-slate-50">
              {resumen.congelados}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Descartados
            </p>
            <p className="mt-3 text-3xl font-bold text-slate-50">
              {resumen.descartados}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Con testigo
            </p>
            <p className="mt-3 text-3xl font-bold text-slate-50">
              {resumen.conTestigo}
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar comparables para agregar al avalúo..."
              className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950/70 pl-10 pr-4 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
            />
          </div>

          <div className="mt-4 grid gap-3">
            {comparablesDisponibles.length === 0 ? (
              <div className="rounded-2xl border border-slate-700 bg-slate-950/50 p-5 text-sm text-slate-400">
                No hay comparables disponibles en la base o ya fueron agregados.
              </div>
            ) : (
              comparablesDisponibles.map((comparable) => (
                <div
                  key={comparable.id}
                  className="grid gap-3 rounded-2xl border border-slate-700 bg-slate-950/60 p-4 lg:grid-cols-[1fr_auto]"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-100">
                        {comparable.codigo}
                      </p>
                      <span className="rounded-full border border-sky-400/30 bg-sky-400/10 px-2 py-1 text-xs text-sky-100">
                        {comparable.tipo}
                      </span>
                      {comparable.testigoWebImagenDataUrl ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-xs text-emerald-100">
                          <FileImage className="h-3 w-3" />
                          Testigo
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-1 text-sm text-slate-300">
                      {comparable.titulo}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {comparable.ubicacion}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-100">
                      {formatMoney(comparable.precio, comparable.moneda)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAgregar(comparable)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:bg-emerald-400/20"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Agregar al avalúo
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="mt-6 grid gap-4">
          {comparablesAvaluo.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950/40 p-8 text-center">
              <Database className="mx-auto h-9 w-9 text-slate-500" />
              <h3 className="mt-3 text-lg font-semibold text-slate-100">
                Sin comparables seleccionados
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                Agrega comparables desde la base para iniciar el análisis técnico.
              </p>
            </div>
          ) : (
            comparablesAvaluo.map((item) => (
              <article
                key={item.id}
                className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5"
              >
                <div className="grid gap-5 xl:grid-cols-[1fr_260px]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-100">
                        {item.snapshot.codigo}
                      </p>
                      <span className={`rounded-full border px-2 py-1 text-xs font-medium ${estadoClasses(item.estado)}`}>
                        {item.estado}
                      </span>
                      <span className="rounded-full border border-slate-700 bg-slate-950/60 px-2 py-1 text-xs text-slate-300">
                        {item.revision}
                      </span>
                      {item.snapshot.testigoWebImagenDataUrl ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-xs text-emerald-100">
                          <FileImage className="h-3 w-3" />
                          Testigo web
                        </span>
                      ) : (
                        <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-1 text-xs text-amber-100">
                          Sin testigo
                        </span>
                      )}
                    </div>

                    <h3 className="mt-2 text-lg font-semibold text-slate-100">
                      {item.snapshot.titulo}
                    </h3>

                    <p className="mt-1 text-sm text-slate-400">
                      {item.snapshot.ubicacion}
                    </p>

                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                          Precio
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-100">
                          {formatMoney(item.snapshot.precio, item.snapshot.moneda)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                          Área terreno
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-100">
                          {item.snapshot.areaTerreno || 'N/D'}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                          Congelado en
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-100">
                          {item.congeladoEn || 'Pendiente'}
                        </p>
                      </div>
                    </div>

                    {item.snapshot.url ? (
                      <a
                        href={item.snapshot.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-sky-300 hover:text-sky-200"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Ver URL de referencia
                      </a>
                    ) : null}

                    <div className="mt-5 grid gap-3">
                      <label className="grid gap-2">
                        <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                          Justificación técnica
                        </span>
                        <textarea
                          value={item.justificacion || ''}
                          onChange={(event) =>
                            handleActualizar(item, {
                              justificacion: event.target.value,
                            })
                          }
                          rows={3}
                          className="rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400"
                        />
                      </label>

                      <label className="grid gap-2">
                        <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                          Resumen de ajuste / homologación
                        </span>
                        <textarea
                          value={item.ajusteResumen || ''}
                          onChange={(event) =>
                            handleActualizar(item, {
                              ajusteResumen: event.target.value,
                            })
                          }
                          rows={3}
                          className="rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="grid content-start gap-3">
                    {item.snapshot.testigoWebImagenDataUrl ? (
                      <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-950">
                        <img
                          src={item.snapshot.testigoWebImagenDataUrl}
                          alt="Testigo web"
                          className="h-40 w-full object-cover"
                        />
                      </div>
                    ) : null}

                    <label className="grid gap-2">
                      <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                        Estado técnico
                      </span>
                      <select
                        value={item.estado}
                        onChange={(event) =>
                          handleActualizar(item, {
                            estado: event.target.value as EstadoComparableAvaluoINMOVAL,
                          })
                        }
                        className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-sky-400"
                      >
                        <option value="preseleccionado">Preseleccionado</option>
                        <option value="usado">Usado</option>
                        <option value="descartado">Descartado</option>
                        <option value="congelado">Congelado</option>
                      </select>
                    </label>

                    <label className="grid gap-2">
                      <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                        Revisión
                      </span>
                      <select
                        value={item.revision}
                        onChange={(event) =>
                          handleActualizar(item, {
                            revision: event.target.value as RevisionComparableAvaluoINMOVAL,
                          })
                        }
                        className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-sky-400"
                      >
                        <option value="Rev00">Rev00</option>
                        <option value="Rev01">Rev01</option>
                        <option value="Rev02">Rev02</option>
                        <option value="Rev03">Rev03</option>
                        <option value="Final">Final</option>
                      </select>
                    </label>

                    <label className="grid gap-2">
                      <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                        Peso técnico
                      </span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.pesoTecnico || 0}
                        onChange={(event) =>
                          handleActualizar(item, {
                            pesoTecnico: Number(event.target.value || 0),
                          })
                        }
                        className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-sky-400"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => handleCongelar(item)}
                      disabled={item.estado === 'congelado'}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-400/30 bg-sky-400/10 px-3 py-3 text-sm font-medium text-sky-100 transition hover:bg-sky-400/20 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Snowflake className="h-4 w-4" />
                      Congelar para reporte
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleActualizar(item, {
                          estado: 'descartado',
                        })
                      }
                      disabled={item.estado === 'descartado'}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-3 py-3 text-sm font-medium text-amber-100 transition hover:bg-amber-400/20 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <XCircle className="h-4 w-4" />
                      Descartar
                    </button>

                    <button
                      type="button"
                      onClick={() => handleEliminar(item)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-3 py-3 text-sm font-medium text-rose-100 transition hover:bg-rose-400/20"
                    >
                      <Trash2 className="h-4 w-4" />
                      Quitar del avalúo
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
