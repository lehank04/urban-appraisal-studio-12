import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  FileInput,
  FileText,
  Upload,
} from 'lucide-react';
import { nowISO } from '@/shared/utils/dateUtils';
import { upsertExpedienteIndiceINMOVAL } from './expedienteIndexStorage';
import { ExpedienteIndiceINMOVAL } from './expedienteIndexTypes';
import { registrarActividadExpedienteINMOVAL } from './expedienteActivityStorage';
import { readExpedienteIMVFile } from './expedienteImvIO';

export default function ImportarExpedienteIMVPage() {
  const navigate = useNavigate();

  const [archivoNombre, setArchivoNombre] = useState('');
  const [expedientePreview, setExpedientePreview] =
    useState<ExpedienteIndiceINMOVAL | null>(null);
  const [error, setError] = useState('');
  const [importado, setImportado] = useState(false);

  async function handleSeleccionarArchivo(file?: File) {
    setError('');
    setImportado(false);
    setExpedientePreview(null);

    if (!file) return;

    setArchivoNombre(file.name);

    if (!file.name.toLowerCase().endsWith('.imv')) {
      setError('Seleccioná un archivo con extensión .imv.');
      return;
    }

    try {
      const expediente = await readExpedienteIMVFile(file);
      setExpedientePreview(expediente);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo importar el archivo.');
    }
  }

  function handleImportar() {
    if (!expedientePreview) {
      setError('Primero seleccioná un archivo .imv válido.');
      return;
    }

    const ahora = nowISO();

    const expedienteActualizado: ExpedienteIndiceINMOVAL = {
      ...expedientePreview,
      actualizadoEn: ahora,
    };

    upsertExpedienteIndiceINMOVAL(expedienteActualizado);

    registrarActividadExpedienteINMOVAL({
      expedienteId: expedienteActualizado.id,
      tipo: 'archivo',
      titulo: 'Archivo .imv importado',
      descripcion: `Se importó el expediente ${expedienteActualizado.codigo} desde archivo .imv.`,
      creadoEn: ahora,
    });

    setImportado(true);
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
                Importar expediente .imv
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                Importa un expediente integral de INMOVAL. El archivo .imv
                contiene la ficha administrativa y puede reconstruir el índice
                local del expediente.
              </p>
            </div>

            <Link
              to="/expedientes-plataforma"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950/50 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Expedientes
            </Link>
          </div>
        </header>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/10 text-sky-300">
                <FileInput className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                  Archivo
                </p>
                <h2 className="text-lg font-semibold text-slate-100">
                  Seleccionar .imv
                </h2>
              </div>
            </div>

            <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-slate-700 bg-slate-950/50 px-6 py-12 text-center transition hover:border-sky-400/50 hover:bg-sky-400/5">
              <Upload className="h-10 w-10 text-sky-300" />
              <span className="mt-4 text-sm font-semibold text-slate-100">
                Tocar para seleccionar archivo .imv
              </span>
              <span className="mt-2 text-sm text-slate-500">
                {archivoNombre || 'No hay archivo seleccionado'}
              </span>
              <input
                type="file"
                accept=".imv,application/json"
                className="hidden"
                onChange={(event) =>
                  handleSeleccionarArchivo(event.target.files?.[0])
                }
              />
            </label>

            {error ? (
              <div className="mt-5 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            ) : null}

            {importado ? (
              <div className="mt-5 flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
                <CheckCircle2 className="h-4 w-4" />
                Expediente importado correctamente.
              </div>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleImportar}
                disabled={!expedientePreview}
                className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Upload className="h-4 w-4" />
                Importar expediente
              </button>

              {expedientePreview ? (
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/expedientes-plataforma/${expedientePreview.id}`)
                  }
                  className="inline-flex items-center gap-2 rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 py-3 text-sm font-medium text-sky-100 transition hover:bg-sky-400/20"
                >
                  Abrir expediente
                </button>
              ) : null}
            </div>
          </article>

          <aside className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
              <FileText className="h-5 w-5" />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-100">
              Vista previa
            </h2>

            {expedientePreview ? (
              <div className="mt-5 grid gap-3 text-sm">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                  <p className="text-slate-500">Código</p>
                  <p className="mt-1 font-semibold text-slate-100">
                    {expedientePreview.codigo}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                  <p className="text-slate-500">Título</p>
                  <p className="mt-1 font-semibold text-slate-100">
                    {expedientePreview.titulo}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                  <p className="text-slate-500">Cliente</p>
                  <p className="mt-1 font-semibold text-slate-100">
                    {expedientePreview.clienteNombre}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                  <p className="text-slate-500">Estado</p>
                  <p className="mt-1 font-semibold text-slate-100">
                    {expedientePreview.estado}
                  </p>
                </div>
              </div>
            ) : (
              <p className="mt-5 text-sm leading-6 text-slate-400">
                Seleccioná un archivo .imv para validar su estructura antes de
                importarlo.
              </p>
            )}
          </aside>
        </section>
      </div>
    </div>
  );
}
