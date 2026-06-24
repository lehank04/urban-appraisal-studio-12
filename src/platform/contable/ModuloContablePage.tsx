import { Link } from 'react-router-dom';
import {
  FileText,
  Receipt,
  WalletCards,
  CreditCard,
  BarChart3,
  ArrowUpRight,
} from 'lucide-react';

type Tile = {
  to: string;
  title: string;
  description: string;
  icon: typeof FileText;
  state: 'activo' | 'proximamente';
  badge?: string;
};

const TILES: Tile[] = [
  {
    to: '/cotizaciones',
    title: 'Cotizaciones',
    description: 'Propuestas, aprobaciones y conversión a expediente.',
    icon: FileText,
    state: 'activo',
    badge: 'Disponible',
  },
  {
    to: '/contable/facturacion',
    title: 'Facturación',
    description: 'Emisión de facturas por expediente o cliente.',
    icon: Receipt,
    state: 'proximamente',
  },
  {
    to: '/contable/cobros',
    title: 'Cobros',
    description: 'Seguimiento de cuentas por cobrar y conciliación.',
    icon: WalletCards,
    state: 'proximamente',
  },
  {
    to: '/contable/pagos',
    title: 'Pagos',
    description: 'Egresos a peritos, proveedores y gastos operativos.',
    icon: CreditCard,
    state: 'proximamente',
  },
  {
    to: '/contable/reportes',
    title: 'Reportes contables',
    description: 'Resumen de ingresos, cartera y rentabilidad por mes.',
    icon: BarChart3,
    state: 'proximamente',
  },
];

export default function ModuloContablePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-10 space-y-8">
        <header className="flex flex-col gap-2">
          <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-emerald-300/90">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Módulo Contable · INMOVAL Studio
          </span>
          <h1 className="text-3xl font-bold tracking-tight">Operación financiera del despacho</h1>
          <p className="max-w-2xl text-sm text-slate-400">
            Concentra cotizaciones, facturación, cobros, pagos y reportes contables. Cada
            expediente recibe trazabilidad financiera sin salir del flujo técnico.
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
                    : 'border-slate-800 bg-slate-900/70 hover:border-emerald-400/40 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-700 bg-slate-950/80 text-emerald-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      disabled
                        ? 'border-slate-700 bg-slate-900 text-slate-500'
                        : 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200'
                    }`}
                  >
                    {disabled ? 'Próximamente' : t.badge || 'Disponible'}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold">{t.title}</h3>
                <p className="mt-1 text-sm text-slate-400">{t.description}</p>
                {!disabled && (
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-emerald-300">
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

        <section className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
            Notas de la fase contable
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            <li>· Las cotizaciones existentes siguen vivas con la misma ruta y datos.</li>
            <li>· Facturación, cobros y pagos quedarán conectados al expediente y al cliente.</li>
            <li>· No se ha modificado ningún cálculo técnico ni clave de almacenamiento.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
