import { useState } from 'react';
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import {
  ArrowLeft,
  ChevronDown,
  ClipboardList,
  Gauge,
  Library,
  Menu,
  Receipt,
  Settings,
  X,
} from 'lucide-react';

type NavGroupId =
  | 'centro'
  | 'contable'
  | 'expedientes'
  | 'biblioteca'
  | 'configuracion';

type NavItem = {
  label: string;
  to: string;
  icon: typeof Gauge;
  description: string;
  group: NavGroupId;
};

// Sidebar = mapa de módulos principales. Las herramientas internas
// (Cotizaciones, Comparables, Clientes, Peritos, Módulos técnicos,
// Plantillas, Precios de obra, Criterios, Facturación, Cobros, Pagos,
// Reportes, etc.) viven dentro de sus hubs respectivos y se acceden
// desde la página del módulo, no desde el menú global.
const NAV_ITEMS: NavItem[] = [
  {
    label: 'Centro INMOVAL',
    to: '/plataforma',
    icon: Gauge,
    description: 'Torre de control técnico y operativa',
    group: 'centro',
  },
  {
    label: 'Módulo Contable',
    to: '/contable',
    icon: Receipt,
    description: 'Cotizaciones, facturación, cobros, pagos y reportes',
    group: 'contable',
  },
  {
    label: 'Expedientes y Avalúos',
    to: '/expedientes-plataforma',
    icon: ClipboardList,
    description: 'Visión general del avalúo y módulo técnico',
    group: 'expedientes',
  },
  {
    label: 'Biblioteca',
    to: '/biblioteca',
    icon: Library,
    description: 'Comparables, clientes, plantillas y recursos técnicos',
    group: 'biblioteca',
  },
  {
    label: 'Configuración',
    to: '/configuracion-plataforma',
    icon: Settings,
    description: 'Empresa, peritos, módulos técnicos y respaldo',
    group: 'configuracion',
  },
];


const GROUP_ORDER: NavGroupId[] = [
  'centro',
  'contable',
  'expedientes',
  'biblioteca',
  'configuracion',
];

const GROUP_LABELS: Record<NavGroupId, string> = {
  centro: 'Centro INMOVAL',
  contable: 'Módulo Contable',
  expedientes: 'Expedientes y Avalúos',
  biblioteca: 'Biblioteca',
  configuracion: 'Configuración',
};

const GROUP_ACCENT: Record<NavGroupId, string> = {
  centro: 'text-sky-300',
  contable: 'text-emerald-300',
  expedientes: 'text-indigo-300',
  biblioteca: 'text-amber-300',
  configuracion: 'text-slate-400',
};

function getCurrentPage(pathname: string) {
  const exact = NAV_ITEMS.find((item) => item.to === pathname);
  if (exact) return exact;
  return (
    NAV_ITEMS.find(
      (item) => item.to !== '/' && pathname.startsWith(`${item.to}/`)
    ) || NAV_ITEMS[0]
  );
}

export function AppLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const currentPage = getCurrentPage(location.pathname);
  const CurrentIcon = currentPage.icon;
  const isStartPage =
    location.pathname === '/' || location.pathname === '/plataforma';

  const groupedItems = NAV_ITEMS.reduce<Record<NavGroupId, NavItem[]>>(
    (acc, item) => {
      acc[item.group].push(item);
      return acc;
    },
    {
      centro: [],
      contable: [],
      expedientes: [],
      biblioteca: [],
      configuracion: [],
    }
  );

  function handleBack() {
    setOpen(false);
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate('/');
  }

  function handleNavClick() {
    setOpen(false);
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(120%_80%_at_50%_-20%,rgba(56,189,248,0.08),transparent),linear-gradient(180deg,#05070d_0%,#0b1220_100%)] text-slate-100">
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {!isStartPage ? (
              <button
                type="button"
                onClick={handleBack}
                title="Volver"
                aria-label="Volver"
                className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/80 text-slate-200 shadow-inner shadow-black/40 transition hover:border-sky-400/40 hover:text-sky-200"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            ) : null}

            <div className="relative">
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="inline-flex h-12 items-center gap-3 rounded-2xl border border-sky-400/30 bg-gradient-to-br from-sky-500/10 via-slate-900/60 to-slate-950/60 px-4 text-left shadow-lg shadow-black/30 transition hover:border-sky-400/60 hover:from-sky-500/20"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-cyan-500 text-[11px] font-black tracking-tight text-slate-950 shadow-[0_0_18px_rgba(56,189,248,0.45)]">
                  IN
                </div>

                <div className="hidden sm:block">
                  <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-sky-200">
                    INMOVAL · Studio
                  </p>
                  <p className="text-xs text-slate-400">
                    Plataforma técnica de avalúos
                  </p>
                </div>

                <ChevronDown
                  className={`h-4 w-4 text-sky-200 transition ${open ? 'rotate-180' : ''}`}
                />
              </button>

              {open ? (
                <div className="absolute left-0 top-[calc(100%+0.75rem)] w-[min(94vw,620px)] overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/95 shadow-2xl shadow-black/60 ring-1 ring-sky-400/10">
                  <div className="flex items-center justify-between border-b border-slate-800/80 bg-gradient-to-r from-slate-900/80 to-slate-950 px-5 py-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-200">
                        Mapa de la plataforma
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Centro · Contable · Expedientes · Biblioteca · Configuración
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="rounded-xl border border-slate-800 bg-slate-900/70 p-2 text-slate-300 hover:bg-slate-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <nav className="max-h-[72vh] overflow-y-auto p-3">
                    {GROUP_ORDER.map((group) => (
                      <div key={group} className="mb-3 last:mb-0">
                        <div className="flex items-center gap-2 px-3 py-2">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              group === 'centro'
                                ? 'bg-sky-400'
                                : group === 'contable'
                                  ? 'bg-emerald-400'
                                  : group === 'expedientes'
                                    ? 'bg-indigo-400'
                                    : group === 'biblioteca'
                                      ? 'bg-amber-400'
                                      : 'bg-slate-500'
                            }`}
                          />
                          <p
                            className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${GROUP_ACCENT[group]}`}
                          >
                            {GROUP_LABELS[group]}
                          </p>
                        </div>

                        <div className="grid gap-2">
                          {groupedItems[group].map((item) => {
                            const Icon = item.icon;
                            return (
                              <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={handleNavClick}
                                end={item.to === '/'}
                                className={({ isActive }) =>
                                  `group flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm transition ${
                                    isActive
                                      ? 'border-sky-400/40 bg-sky-400/10 text-sky-100 shadow-[0_0_0_1px_rgba(56,189,248,0.15)]'
                                      : 'border-transparent text-slate-300 hover:border-slate-800 hover:bg-slate-900/70'
                                  }`
                                }
                              >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-950/80 transition group-hover:border-slate-700">
                                  <Icon className="h-4 w-4" />
                                </div>

                                <div className="min-w-0">
                                  <p className="font-semibold leading-tight">
                                    {item.label}
                                  </p>
                                  <p className="mt-0.5 truncate text-xs text-slate-500">
                                    {item.description}
                                  </p>
                                </div>
                              </NavLink>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </nav>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3">
            <span
              className={`hidden h-1.5 w-1.5 rounded-full sm:block ${
                currentPage.group === 'centro'
                  ? 'bg-sky-400'
                  : currentPage.group === 'contable'
                    ? 'bg-emerald-400'
                    : currentPage.group === 'expedientes'
                      ? 'bg-indigo-400'
                      : currentPage.group === 'biblioteca'
                        ? 'bg-amber-400'
                        : 'bg-slate-500'
              }`}
            />
            <CurrentIcon className="hidden h-4 w-4 shrink-0 text-slate-300 sm:block" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-100">
                {currentPage.label}
              </p>
              <p className="hidden truncate text-[11px] uppercase tracking-[0.18em] text-slate-500 sm:block">
                {GROUP_LABELS[currentPage.group]}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-slate-200 hover:bg-slate-800 sm:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {open ? (
        <button
          type="button"
          aria-label="Cerrar menú INMOVAL"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 cursor-default bg-black/30"
        />
      ) : null}

      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
