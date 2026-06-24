import { Link } from 'react-router-dom';
import {
  Database,
  Users,
  Boxes,
  LayoutTemplate,
  Hammer,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

type Tile = {
  to: string;
  title: string;
  description: string;
  icon: typeof Database;
  state: 'activo' | 'proximamente';
  badge?: string;
};

const TILES: Tile[] = [
  {
    to: '/comparables',
    title: 'Base de comparables',
    description: 'Comparables locales con filtros, mapas y reutilización entre expedientes.',
    icon: Database,
    state: 'activo',
    badge: 'Disponible',
  },
  {
    to: '/clientes',
    title: 'Clientes',
    description: 'Catálogo de clientes recurrentes para cotizaciones y expedientes.',
    icon: Users,
    state: 'activo',
    badge: 'Disponible',
  },
  {
    to: '/modulos',
    title: 'Módulos técnicos',
    description: 'Plantillas técnicas: urbano, rural, especiales, maquinaria.',
    icon: Boxes,
    state: 'activo',
    badge: 'Disponible',
  },
  {
    to: '/biblioteca/plantillas',
    title: 'Plantillas de informe',
    description: 'Documentos base, carátulas, encabezados y secciones reutilizables.',
    icon: LayoutTemplate,
    state: 'proximamente',
  },
  {
    to: '/biblioteca/precios-obra',
    title: 'Precios de obra por m²',
    description: 'Tabla viva de costos unitarios por tipología y acabado.',
    icon: Hammer,
    state: 'proximamente',
  },
  {
    to: '/biblioteca/criterios',
    title: 'Criterios técnicos',
    description: 'Argumentos, supuestos y notas reutilizables en avalúos.',
    icon: Sparkles,
    state: 'proximamente',
  },
];

export default function BibliotecaPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-10 space-y-8">
        <header className="flex flex-col gap-2">
          <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-amber-300/90">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Biblioteca · INMOVAL Studio
          </span>
          <h1 className="text-3xl font-bold tracking-tight">Conocimiento reutilizable del despacho</h1>
          <p className="max-w-2xl text-sm text-slate-400">
            Comparables, clientes, módulos, plantillas, precios de obra y criterios técnicos
            viven en un solo lugar para alimentar cada expediente.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TILES.map((t) => {
            const Icon = t.icon;
            const disabled = t.state === 'proximamente';
            const inner = (
              <div
                className={`group relative h-full overflow-hidden rounded-3xl border p-5 transition ${
                  disabled
                    ? 'border-slate-800 bg-slate-900/40 opacity-70'
                    : 'border-slate-800 bg-slate-900/70 hover:border-amber-400/40 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-700 bg-slate-950/80 text-amber-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      disabled
                        ? 'border-slate-700 bg-slate-900 text-slate-500'
                        : 'border-amber-400/40 bg-amber-400/10 text-amber-200'
                    }`}
                  >
                    {disabled ? 'Próximamente' : t.badge || 'Disponible'}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold">{t.title}</h3>
                <p className="mt-1 text-sm text-slate-400">{t.description}</p>
                {!disabled && (
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-amber-300">
                    Abrir <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>
            );
            return disabled ? (
              <div key={t.title} aria-disabled>{inner}</div>
            ) : (
              <Link key={t.title} to={t.to}>{inner}</Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
