import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ExternalLink,
  FileImage,
  FileText,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import { todayISO } from '@/shared/utils/dateUtils';
import { getAvaluoComparablesINMOVAL } from '@/technical-modules/modules/urbano/comparables/avaluoComparablesStorage';
import {
  formatMoneyReporte,
  getComparablesParaAnexoTestigos,
  getEstadoReporteLabel,
  getTestigoStatusLabel,
} from './avaluoReporteUtils';

function DetailItem({
  label,
  value,
}: {
  label: string;
  value?: string | number;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4 print:border-slate-300 print:bg-white">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500 print:text-slate-500">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-semibold text-slate-100 print:text-slate-900">
        {value || 'N/D'}
      </p>
    </div>
  );
}

export default function AvaluoAnexosTestigosPage() {
  const { id } = useParams();
  const avaluoId = id || '';

  const comparablesAvaluo = useMemo(
    () => getAvaluoComparablesINMOVAL(avaluoId),
    [avaluoId]
  );

  const comparablesReporte = useMemo(
    () => getComparablesParaAnexoTestigos(comparablesAvaluo),
    [comparablesAvaluo]
  );

  const resumen = useMemo(() => {
    return {
      totalSeleccionados: comparablesAvaluo.length,
      totalReporte: comparablesReporte.length,
      conTestigo: comparablesReporte.filter(
        (item) => item.snapshot.testigoWebImagenDataUrl
      ).length,
      sinTestigo: comparablesReporte.filter(
        (item) => !item.snapshot.testigoWebImagenDataUrl
      ).length,
    };
  }, [comparablesAvaluo, comparablesReporte]);

  function handlePrint() {
    window.print();
  }

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100 print:bg-white print:px-0 print:py-0 print:text-slate-900">
      <div className="mx-auto max-w-7xl print:max-w-none">
        <header className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/30 print:rounded-none print:border-b print:border-slate-300 print:bg-white print:shadow-none">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-300 print:text-slate-500">
                MÃ³dulo urbano Â· Anexos tÃ©cnicos
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-50 print:text-slate-950">
                Anexo de testigos web
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 print:text-slate-600">
                Respaldo visual de comparables usados o congelados dentro del
                avalÃºo tÃ©cnico. Esta vista prepara los testigos web para anexos
                del reporte final.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 print:hidden">
              <Link
                to={`/avaluos/${avaluoId}/comparables`}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950/50 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Comparables tÃ©cnicos
              </Link>

              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 py-3 text-sm font-medium text-sky-100 transition hover:bg-sky-400/20"
              >
                <Printer className="h-4 w-4" />
                Imprimir / guardar PDF
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <DetailItem label="ID AvalÃºo" value={avaluoId} />
            <DetailItem label="Fecha de anexo" value={todayISO()} />
            <DetailItem label="Comparables en avalÃºo" value={resumen.totalSeleccionados} />
            <DetailItem label="Comparables para reporte" value={resumen.totalReporte} />
          </div>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4 print:mx-6 print:mt-4">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 print:rounded-xl print:border-slate-300 print:bg-white">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Para anexo
            </p>
            <p className="mt-3 text-3xl font-bold text-slate-50 print:text-slate-950">
              {resumen.totalReporte}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 print:rounded-xl print:border-slate-300 print:bg-white">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Con testigo web
            </p>
            <p className="mt-3 text-3xl font-bold text-slate-50 print:text-slate-950">
              {resumen.conTestigo}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 print:rounded-xl print:border-slate-300 print:bg-white">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Sin imagen
            </p>
            <p className="mt-3 text-3xl font-bold text-slate-50 print:text-slate-950">
              {resumen.sinTestigo}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 print:rounded-xl print:border-slate-300 print:bg-white">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Estado
            </p>
            <p className="mt-3 text-lg font-bold text-slate-50 print:text-slate-950">
              Preparado
            </p>
          </div>
        </section>

        {comparablesReporte.length === 0 ? (
          <section className="mt-6 rounded-3xl border border-dashed border-slate-700 bg-slate-900/70 p-10 text-center print:mx-6 print:rounded-xl print:border-slate-300 print:bg-white">
            <FileImage className="mx-auto h-10 w-10 text-slate-500" />
            <h2 className="mt-4 text-xl font-semibold text-slate-100 print:text-slate-950">
              No hay comparables listos para anexo
            </h2>
            <p className="mt-2 text-sm text-slate-400 print:text-slate-600">
              En Comparables TÃ©cnicos, marca comparables como â€œusadoâ€ o
              â€œcongeladoâ€ para que aparezcan en este anexo.
            </p>
          </section>
        ) : (
          <section className="mt-6 grid gap-6 print:mx-6 print:mt-4">
            {comparablesReporte.map((item, index) => {
              const comparable = item.snapshot;
              const hasTestigo = Boolean(comparable.testigoWebImagenDataUrl);

              return (
                <article
                  key={item.id}
                  className="break-inside-avoid rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/20 print:rounded-xl print:border-slate-300 print:bg-white print:shadow-none"
                >
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300 print:text-slate-500">
                        Testigo {index + 1}
                      </p>
                      <h2 className="mt-2 text-2xl font-bold text-slate-50 print:text-slate-950">
                        {comparable.codigo}
                      </h2>
                      <p className="mt-1 text-sm text-slate-400 print:text-slate-600">
                        {comparable.titulo}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-100 print:border-slate-300 print:bg-white print:text-slate-700">
                        <ShieldCheck className="h-3 w-3" />
                        {getEstadoReporteLabel(item.estado)}
                      </span>

                      <span className="inline-flex items-center gap-1 rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-xs font-medium text-sky-100 print:border-slate-300 print:bg-white print:text-slate-700">
                        <FileImage className="h-3 w-3" />
                        {getTestigoStatusLabel(hasTestigo)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px]">
                    <div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <DetailItem label="Tipo" value={comparable.tipo} />
                        <DetailItem label="Fecha comparable" value={comparable.fecha} />
                        <DetailItem label="Fuente" value={comparable.fuente} />
                        <DetailItem label="Contacto" value={comparable.contacto} />
                        <DetailItem label="UbicaciÃ³n" value={comparable.ubicacion} />
                        <DetailItem
                          label="Zona"
                          value={[comparable.barrio, comparable.municipio, comparable.departamento]
                            .filter(Boolean)
                            .join(', ')}
                        />
                        <DetailItem
                          label="Precio"
                          value={formatMoneyReporte(comparable.precio, comparable.moneda)}
                        />
                        <DetailItem label="Ãrea terreno" value={comparable.areaTerreno} />
                        <DetailItem
                          label="Precio unitario terreno"
                          value={
                            comparable.precioUnitarioTerreno
                              ? formatMoneyReporte(
                                  comparable.precioUnitarioTerreno,
                                  comparable.moneda
                                )
                              : undefined
                          }
                        />
                        <DetailItem label="RevisiÃ³n" value={item.revision} />
                      </div>

                      {comparable.url ? (
                        <a
                          href={comparable.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-sky-300 hover:text-sky-200 print:text-slate-700"
                        >
                          <ExternalLink className="h-4 w-4" />
                          URL de referencia
                        </a>
                      ) : null}

                      {item.justificacion ? (
                        <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/50 p-4 print:border-slate-300 print:bg-white">
                          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                            JustificaciÃ³n tÃ©cnica
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-300 print:text-slate-700">
                            {item.justificacion}
                          </p>
                        </div>
                      ) : null}

                      {item.ajusteResumen ? (
                        <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/50 p-4 print:border-slate-300 print:bg-white">
                          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                            Resumen de ajuste / homologaciÃ³n
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-300 print:text-slate-700">
                            {item.ajusteResumen}
                          </p>
                        </div>
                      ) : null}

                      {comparable.testigoWebNotas ? (
                        <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/50 p-4 print:border-slate-300 print:bg-white">
                          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                            Notas del testigo web
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-300 print:text-slate-700">
                            {comparable.testigoWebNotas}
                          </p>
                        </div>
                      ) : null}
                    </div>

                    <div>
                      {hasTestigo ? (
                        <div className="overflow-hidden rounded-3xl border border-slate-700 bg-slate-950 print:rounded-xl print:border-slate-300 print:bg-white">
                          <img
                            src={comparable.testigoWebImagenDataUrl}
                            alt={`Testigo web ${comparable.codigo}`}
                            className="max-h-[520px] w-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="flex min-h-[260px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-700 bg-slate-950/50 p-6 text-center print:rounded-xl print:border-slate-300 print:bg-white">
                          <FileImage className="h-10 w-10 text-slate-500" />
                          <p className="mt-3 text-sm text-slate-400 print:text-slate-600">
                            Este comparable no tiene imagen de testigo web.
                          </p>
                        </div>
                      )}

                      <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/50 p-4 print:border-slate-300 print:bg-white">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                          Archivo testigo
                        </p>
                        <p className="mt-2 break-words text-sm font-semibold text-slate-100 print:text-slate-900">
                          {comparable.testigoWebImagenNombre || 'N/D'}
                        </p>
                        <p className="mt-2 text-xs text-slate-500">
                          Capturado: {comparable.testigoWebCapturadoEn || 'N/D'}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
}

