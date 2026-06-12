import { ReactNode } from 'react';

type ExpedienteResumenCardProps = {
  titulo: string;
  valor: string | number;
  descripcion?: string;
  icono?: ReactNode;
};

export function ExpedienteResumenCard({
  titulo,
  valor,
  descripcion,
  icono,
}: ExpedienteResumenCardProps) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-black/20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
            {titulo}
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-50">{valor}</p>
          {descripcion ? (
            <p className="mt-2 text-sm text-slate-400">{descripcion}</p>
          ) : null}
        </div>

        {icono ? (
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/10 text-sky-300">
            {icono}
          </div>
        ) : null}
      </div>
    </article>
  );
}
