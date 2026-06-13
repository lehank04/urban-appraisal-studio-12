import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  ExternalLink,
  Link2,
  PencilLine,
  PlusCircle,
  Save,
} from 'lucide-react';
import { nowISO } from '@/shared/utils/dateUtils';
import { ExpedienteIndiceINMOVAL } from '../expedienteIndexTypes';
import { upsertExpedienteIndiceINMOVAL } from '../expedienteIndexStorage';
import { registrarActividadExpedienteINMOVAL } from '../expedienteActivityStorage';

type ExpedienteModuloTecnicoPanelProps = {
  expediente: ExpedienteIndiceINMOVAL;
  onUpdated?: () => void;
};

export function ExpedienteModuloTecnicoPanel({
  expediente,
  onUpdated,
}: ExpedienteModuloTecnicoPanelProps) {
  const [editing, setEditing] = useState(false);
  const [avaluoTecnicoId, setAvaluoTecnicoId] = useState(
    expediente.avaluoTecnicoId || ''
  );

  const rutaTecnica =
    expediente.avaluoTecnicoRuta ||
    (expediente.avaluoTecnicoId
      ? `/avaluos/${expediente.avaluoTecnicoId}`
      : '');

  function handleGuardarVinculo() {
    const cleanId = avaluoTecnicoId.trim();

    if (!cleanId) {
      window.alert('Ingresá el ID del avalúo urbano.');
      return;
    }

    const ahora = nowISO();

    const actualizado: ExpedienteIndiceINMOVAL = {
      ...expediente,
      avaluoTecnicoId: cleanId,
      avaluoTecnicoRuta: `/avaluos/${cleanId}`,
      moduloTecnicoVinculado: expediente.tipoModulo,
      vinculadoModuloTecnicoEn: ahora,
      actualizadoEn: ahora,
    };

    upsertExpedienteIndiceINMOVAL(actualizado);

    registrarActividadExpedienteINMOVAL({
      expedienteId: expediente.id,
      tipo: 'nota',
      titulo: 'Avalúo técnico vinculado',
      descripcion: `Se vinculó el expediente con el avalúo técnico ${expediente.tipoModulo}: ${cleanId}.`,
      creadoEn: ahora,
    });

    setEditing(false);
    onUpdated?.();
  }

  return (
    <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/10 text-sky-300">
            <Building2 className="h-5 w-5" />
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
              Avalúo técnico
            </p>
            <h2 className="text-lg font-semibold text-slate-100">
              Avalúo técnico del expediente
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              Esta sección conecta este expediente con su avalúo técnico. El avalúo forma parte del expediente único y queda incluido dentro del archivo .imv exportado.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {rutaTecnica ? (
            <Link
              to={rutaTecnica}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 py-3 text-sm font-medium text-sky-100 transition hover:bg-sky-400/20"
            >
              <ExternalLink className="h-4 w-4" />
              Abrir avalúo técnico
            </Link>
          ) : null}

          {expediente.avaluoTecnicoId ? (
            <Link
              to={`/avaluos/${expediente.avaluoTecnicoId}/memoria-calculo`}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:bg-emerald-400/20"
            >
              Memoria de cálculo
            </Link>
          ) : null}

          <Link
            to="/avaluos/nuevo"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:bg-emerald-400/20"
          >
            <PlusCircle className="h-4 w-4" />
            Crear avalúo urbano
          </Link>

          <button
            type="button"
            onClick={() => setEditing((value) => !value)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm font-medium text-amber-100 transition hover:bg-amber-400/20"
          >
            <PencilLine className="h-4 w-4" />
            {editing ? 'Cancelar vínculo' : 'Vincular existente'}
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
            Módulo esperado
          </p>
          <p className="mt-2 text-lg font-semibold capitalize text-slate-100">
            {expediente.tipoModulo}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
            ID del avalúo
          </p>
          <p className="mt-2 break-all text-sm font-semibold text-slate-100">
            {expediente.avaluoTecnicoId || 'No vinculado'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
            Ruta técnica
          </p>
          <p className="mt-2 break-all text-sm font-semibold text-slate-100">
            {rutaTecnica || 'Pendiente'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
            Vinculado en
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-100">
            {expediente.vinculadoModuloTecnicoEn || 'Pendiente'}
          </p>
        </div>
      </div>

      {editing ? (
        <div className="mt-5 rounded-3xl border border-amber-400/20 bg-amber-400/10 p-5">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
            <label className="relative block">
              <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={avaluoTecnicoId}
                onChange={(event) => setAvaluoTecnicoId(event.target.value)}
                placeholder="ID del avalúo existente"
                className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950/70 pl-10 pr-3 text-sm text-slate-100 outline-none transition focus:border-amber-400"
              />
            </label>

            <button
              type="button"
              onClick={handleGuardarVinculo}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm font-medium text-amber-100 transition hover:bg-amber-400/20"
            >
              <Save className="h-4 w-4" />
              Guardar vínculo
            </button>
          </div>

          <p className="mt-3 text-sm leading-6 text-amber-100/80">
            Por ahora el vínculo puede hacerse manualmente por ID. En la siguiente evolución, el expediente podrá crear automáticamente su avalúo urbano y precargar datos del cliente, sujeto, inspección y plantilla técnica.
          </p>
        </div>
      ) : null}
    </section>
  );
}

export default ExpedienteModuloTecnicoPanel;
