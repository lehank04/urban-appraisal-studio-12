import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Database,
  ExternalLink,
  FileImage,
  Search,
} from 'lucide-react';
import {
  ComparableIndiceINMOVAL,
  getComparablesIndiceINMOVAL,
} from '@/platform/comparables/comparableStorage';
import { ExpedienteIndiceINMOVAL } from '../expedienteIndexTypes';

type ExpedienteComparablesPanelProps = {
  expediente: ExpedienteIndiceINMOVAL;
};

function formatMoney(value: number, moneda: string) {
  return `${moneda} ${Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getComparablesRecientes(comparables: ComparableIndiceINMOVAL[]) {
  return [...comparables]
    .sort((a, b) => b.actualizadoEn.localeCompare(a.actualizadoEn))
    .slice(0, 5);
}

export function ExpedienteComparablesPanel({
  expediente,
}: ExpedienteComparablesPanelProps) {
  const comparables = useMemo(() => getComparablesIndiceINMOVAL(), []);

  const comparablesRecientes = useMemo(
    () => getComparablesRecientes(comparables),
    [comparables]
  );

  const resumen = useMemo(() => {
    return {
      total: comparables.length,
      activos: comparables.filter((item) => item.estado === 'activo').length,
      congelados: comparables.filter((item) => item.estado === 'congelado').length,
      conTestigo: comparables.filter((item) => item.testigoWebImagenDataUrl).length,
    };
  }, [comparables]);

  return (
    <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
            <Database className="h-5 w-5" />
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
              Comparables de mercado
            </p>
            <h2 className="text-lg font-semibold text-slate-100">
              Consulta de base de comparables
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              Esta ficha administrativa solo permite visualizar la base de
              comparables disponible. La selección técnica, descarte, análisis,
              homologación y congelamiento final de comparables debe hacerse
              dentro del avalúo técnico urbano.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/comparables"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:bg-emerald-400/20"
          >
            <Database className="h-4 w-4" />
            Abrir base de comparables
          </Link>

          {expediente.avaluoTecnicoRuta ? (
            <Link
              to={expediente.avaluoTecnicoRuta}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 py-3 text-sm font-medium text-sky-100 transition hover:bg-sky-400/20"
            >
              <ExternalLink className="h-4 w-4" />
              Ir al avalúo técnico
            </Link>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
            Comparables base
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-100">
            {resumen.total}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
            Activos
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-100">
            {resumen.activos}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
            Congelados en base
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-100">
            {resumen.congelados}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
            Con testigo web
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-100">
            {resumen.conTestigo}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-sky-400/20 bg-sky-400/10 p-5">
        <div className="flex items-start gap-3">
          <Search className="mt-1 h-5 w-5 text-sky-300" />
          <div>
            <h3 className="text-sm font-semibold text-sky-100">
              Regla técnica
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Los comparables se cargan y respaldan en Plataforma, pero se
              seleccionan dentro del avalúo. Desde ahí se decidirá cuáles se
              usan, cuáles se descartan, cuáles se congelan y cuáles pasan al
              reporte final con su testigo web.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
          Comparables recientes en la base
        </h3>

        {comparablesRecientes.length === 0 ? (
          <div className="mt-4 rounded-3xl border border-dashed border-slate-700 bg-slate-950/40 p-8 text-center">
            <Database className="mx-auto h-9 w-9 text-slate-500" />
            <h3 className="mt-3 text-lg font-semibold text-slate-100">
              Sin comparables en la base
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              Crea o importa comparables .imc desde la base de comparables.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-4">
            {comparablesRecientes.map((comparable) => (
              <article
                key={comparable.id}
                className="rounded-3xl border border-slate-800 bg-slate-950/50 p-5"
              >
                <div className="grid gap-4 lg:grid-cols-[1fr_180px]">
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
                          Testigo web
                        </span>
                      ) : (
                        <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-1 text-xs text-amber-100">
                          Sin testigo
                        </span>
                      )}
                    </div>

                    <h3 className="mt-2 text-lg font-semibold text-slate-100">
                      {comparable.titulo}
                    </h3>

                    <p className="mt-1 text-sm text-slate-400">
                      {comparable.ubicacion}
                    </p>

                    <p className="mt-3 text-sm font-semibold text-slate-100">
                      {formatMoney(comparable.precio, comparable.moneda)}
                    </p>

                    {comparable.url ? (
                      <a
                        href={comparable.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-sky-300 hover:text-sky-200"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Ver referencia web
                      </a>
                    ) : null}
                  </div>

                  {comparable.testigoWebImagenDataUrl ? (
                    <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">
                      <img
                        src={comparable.testigoWebImagenDataUrl}
                        alt="Testigo web del comparable"
                        className="h-32 w-full object-cover"
                      />
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default ExpedienteComparablesPanel;
