import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  FilePlus2,
  Link2,
  Save,
} from 'lucide-react';
import { nowISO } from '@/shared/utils/dateUtils';
import {
  getExpedienteIndiceINMOVAL,
  upsertExpedienteIndiceINMOVAL,
} from './expedienteIndexStorage';
import { registrarActividadExpedienteINMOVAL } from './expedienteActivityStorage';
import {
  crearPreparacionTecnicaDesdeExpediente,
  getPreparacionTecnicaPorExpedienteINMOVAL,
  upsertPreparacionTecnicaINMOVAL,
} from './expedienteTecnicoBridge';

function DetailItem({
  label,
  value,
}: {
  label: string;
  value?: string | number;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-semibold text-slate-100">
        {value || 'Pendiente'}
      </p>
    </div>
  );
}

export default function PrepararModuloTecnicoINMOVALPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [saved, setSaved] = useState(false);
  const [avaluoTecnicoId, setAvaluoTecnicoId] = useState('');

  const expediente = useMemo(
    () => getExpedienteIndiceINMOVAL(id || ''),
    [id]
  );

  const preparacionExistente = useMemo(
    () => getPreparacionTecnicaPorExpedienteINMOVAL(id || ''),
    [id, saved]
  );

  if (!expediente) {
    return (
      <div className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
        <div className="mx-auto max-w-4xl rounded-3xl border border-rose-400/20 bg-rose-400/10 p-6">
          <h1 className="text-xl font-semibold text-rose-100">
            Expediente no encontrado
          </h1>
          <Link
            to="/expedientes-plataforma"
            className="mt-4 inline-flex rounded-2xl border border-slate-700 px-4 py-3 text-sm text-slate-200"
          >
            Volver a expedientes
          </Link>
        </div>
      </div>
    );
  }

  const rutaTecnica =
    expediente.avaluoTecnicoRuta ||
    (expediente.avaluoTecnicoId
      ? `/avaluos/${expediente.avaluoTecnicoId}`
      : '');

  function handlePrepararModulo() {
    const preparacion = crearPreparacionTecnicaDesdeExpediente(expediente);
    const ahora = nowISO();

    upsertPreparacionTecnicaINMOVAL(preparacion);

    upsertExpedienteIndiceINMOVAL({
      ...expediente,
      preparacionTecnicaId: preparacion.id,
      preparacionTecnicaEstado: 'preparado',
      preparacionTecnicaEn: ahora,
      preparacionTecnicaResumen:
        'Datos administrativos preparados para módulo técnico.',
      actualizadoEn: ahora,
    });

    registrarActividadExpedienteINMOVAL({
      expedienteId: expediente.id,
      tipo: 'nota',
      titulo: 'Preparación técnica creada',
      descripcion:
        'Se prepararon los datos administrativos para el módulo técnico urbano.',
      creadoEn: ahora,
    });

    setSaved(true);
  }

  function handleVincularTecnico() {
    const cleanId = avaluoTecnicoId.trim();

    if (!cleanId) {
      window.alert('Ingresá el ID del expediente técnico.');
      return;
    }

    const ahora = nowISO();

    upsertExpedienteIndiceINMOVAL({
      ...expediente,
      avaluoTecnicoId: cleanId,
      avaluoTecnicoRuta: `/avaluos/${cleanId}`,
      moduloTecnicoVinculado: expediente.tipoModulo,
      vinculadoModuloTecnicoEn: ahora,
      preparacionTecnicaEstado: 'vinculado',
      actualizadoEn: ahora,
    });

    registrarActividadExpedienteINMOVAL({
      expedienteId: expediente.id,
      tipo: 'nota',
      titulo: 'Expediente técnico vinculado',
      descripcion: `Se vinculó el expediente técnico ${cleanId} desde preparación técnica.`,
      creadoEn: ahora,
    });

    navigate(`/expedientes-plataforma/${expediente.id}`);
  }

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/30">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-300">
                FASE 3 · Puente técnico
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-50">
                Preparar módulo técnico urbano
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                Esta pantalla convierte la ficha administrativa en una preparación
                técnica lista para iniciar o vincular el avalúo urbano.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to={`/expedientes-plataforma/${expediente.id}`}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950/50 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Ficha expediente
              </Link>

              {rutaTecnica ? (
                <Link
                  to={rutaTecnica}
                  className="inline-flex items-center gap-2 rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 py-3 text-sm font-medium text-sky-100 transition hover:bg-sky-400/20"
                >
                  <ExternalLink className="h-4 w-4" />
                  Abrir técnico
                </Link>
              ) : null}

              <Link
                to="/avaluos/nuevo"
                className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:bg-emerald-400/20"
              >
                <FilePlus2 className="h-4 w-4" />
                Crear técnico urbano
              </Link>
            </div>
          </div>

          {saved ? (
            <div className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
              <CheckCircle2 className="h-4 w-4" />
              Preparación técnica guardada.
            </div>
          ) : null}
        </header>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
          <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/10 text-sky-300">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                  Expediente administrativo
                </p>
                <h2 className="text-lg font-semibold text-slate-100">
                  Datos que se enviarán al módulo técnico
                </h2>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <DetailItem label="Código" value={expediente.codigo} />
              <DetailItem label="Cliente" value={expediente.clienteNombre} />
              <DetailItem label="Perito" value={expediente.peritoNombre} />
              <DetailItem label="Título" value={expediente.titulo} />
              <DetailItem label="Módulo" value={expediente.tipoModulo} />
              <DetailItem label="Estado" value={expediente.estado} />
              <DetailItem label="Fecha solicitud" value={expediente.fechaSolicitud} />
              <DetailItem
                label="Entrega estimada"
                value={expediente.fechaEntregaEstimada}
              />
              <DetailItem
                label="Preparación"
                value={expediente.preparacionTecnicaEstado || 'pendiente'}
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handlePrepararModulo}
                className="inline-flex items-center gap-2 rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 py-3 text-sm font-medium text-sky-100 transition hover:bg-sky-400/20"
              >
                <Save className="h-4 w-4" />
                Preparar datos técnicos
              </button>
            </div>
          </article>

          <aside className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10 text-amber-300">
              <Building2 className="h-5 w-5" />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-100">
              Vincular expediente técnico existente
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Después de crear el expediente técnico urbano, copiá su ID aquí
              para dejar el expediente administrativo conectado.
            </p>

            <div className="mt-5 grid gap-3">
              <label className="relative block">
                <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  value={avaluoTecnicoId}
                  onChange={(event) => setAvaluoTecnicoId(event.target.value)}
                  placeholder="ID del expediente técnico"
                  className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950/70 pl-10 pr-3 text-sm text-slate-100 outline-none transition focus:border-amber-400"
                />
              </label>

              <button
                type="button"
                onClick={handleVincularTecnico}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm font-medium text-amber-100 transition hover:bg-amber-400/20"
              >
                <Link2 className="h-4 w-4" />
                Guardar vínculo técnico
              </button>
            </div>

            {preparacionExistente ? (
              <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
                Preparación existente: {preparacionExistente.id}
              </div>
            ) : null}
          </aside>
        </section>
      </div>
    </div>
  );
}
