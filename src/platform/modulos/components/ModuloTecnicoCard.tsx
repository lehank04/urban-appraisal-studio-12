import { Box, CheckCircle2, Clock3, HardDrive, Lock, RefreshCcw } from 'lucide-react';
import { ModuloTecnicoManifest } from '@/shared/types/inmovalCore';
import {
  getModuloEstadoBadgeClass,
  getModuloEstadoDescription,
  getModuloEstadoLabel,
} from '../moduloUiUtils';

type ModuloTecnicoCardProps = {
  modulo: ModuloTecnicoManifest;
};

function getEstadoIcon(estado: ModuloTecnicoManifest['estado']) {
  if (estado === 'activo') return CheckCircle2;
  if (estado === 'requiere_actualizacion') return RefreshCcw;
  if (estado === 'deshabilitado') return Lock;

  return Clock3;
}

export function ModuloTecnicoCard({ modulo }: ModuloTecnicoCardProps) {
  const EstadoIcon = getEstadoIcon(modulo.estado);

  return (
    <article className="rounded-2xl border border-slate-700/80 bg-slate-900/80 p-5 shadow-xl shadow-black/20">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/10">
            <Box className="h-6 w-6 text-sky-300" />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-100">
              {modulo.nombre}
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              {modulo.descripcion}
            </p>
          </div>
        </div>

        <span
          className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${getModuloEstadoBadgeClass(
            modulo.estado
          )}`}
        >
          <EstadoIcon className="h-3.5 w-3.5" />
          {getModuloEstadoLabel(modulo.estado)}
        </span>
      </div>

      <div className="mt-5 grid gap-3 border-t border-slate-700/70 pt-4 text-sm text-slate-300 sm:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Versión
          </p>
          <p className="mt-1 font-medium text-slate-200">{modulo.version}</p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Extensión
          </p>
          <p className="mt-1 font-medium text-slate-200">
            {modulo.extension || '—'}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Instalación
          </p>
          <p className="mt-1 inline-flex items-center gap-2 font-medium text-slate-200">
            <HardDrive className="h-4 w-4 text-slate-400" />
            {modulo.requiereInstalacionLocal ? 'Local' : 'No requerida'}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-700/70 bg-slate-950/40 p-3 text-sm text-slate-400">
        {getModuloEstadoDescription(modulo.estado)}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <span
          className={`rounded-full border px-3 py-1 ${
            modulo.puedeCrearExpedientes
              ? 'border-sky-400/30 bg-sky-400/10 text-sky-200'
              : 'border-slate-600 bg-slate-800 text-slate-400'
          }`}
        >
          Crear expedientes
        </span>

        <span
          className={`rounded-full border px-3 py-1 ${
            modulo.puedeAbrirExpedientes
              ? 'border-sky-400/30 bg-sky-400/10 text-sky-200'
              : 'border-slate-600 bg-slate-800 text-slate-400'
          }`}
        >
          Abrir expedientes
        </span>
      </div>
    </article>
  );
}
