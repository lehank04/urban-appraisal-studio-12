import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Boxes,
  Building2,
  ChevronDown,
  ClipboardList,
  FilePlus2,
  FileText,
  Image,
  Database,
  Gauge,
  Home,
  Menu,
  Settings,
  Upload,
  SlidersHorizontal,
  Users,
  UserSquare2,
  X,
} from 'lucide-react';

type NavItem = {
  label: string;
  to: string;
  icon: typeof Home;
  description: string;
  group: 'plataforma' | 'operacion' | 'catalogos';
};

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Centro INMOVAL',
    to: '/plataforma',
    icon: Gauge,
    description: 'Centro de coordinación operativa',
    group: 'plataforma',
  },
  {
    label: 'Expedientes',
    to: '/expedientes-plataforma',
    icon: ClipboardList,
    description: 'Gestión de expedientes',
    group: 'plataforma',
  },
  {
    label: 'Clientes',
    to: '/clientes',
    icon: Users,
    description: 'Clientes registrados',
    group: 'plataforma',
  },
  {
    label: 'Peritos',
    to: '/peritos',
    icon: UserSquare2,
    description: 'Peritos registrados',
    group: 'plataforma',
  },
  {
    label: 'Módulos técnicos',
    to: '/modulos',
    icon: Boxes,
    description: 'Módulos técnicos disponibles',
    group: 'plataforma',
  },
  {
    label: 'Base de comparables',
    to: '/comparables',
    icon: Database,
    description: 'Base local de comparables',
    group: 'plataforma',
  },
  {
    label: 'Configuración',
    to: '/configuracion-plataforma',
    icon: Settings,
    description: 'Preferencias generales',
    group: 'plataforma',
  },
];

const GROUP_LABELS: Record<NavItem['group'], string> = {
  plataforma: 'Plataforma INMOVAL',
  operacion: '',
  catalogos: '',
};

function getCurrentPage(pathname: string) {
  const exact = NAV_ITEMS.find((item) => item.to === pathname);

  if (exact) return exact;

  return (
    NAV_ITEMS.find(
      (item) => item.to !== '/' && pathname === item.to
    ) ||
    NAV_ITEMS.find(
      (item) => item.to !== '/' && pathname.startsWith(`${item.to}/`)
    ) ||
    NAV_ITEMS[0]
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

  const groupedItems = NAV_ITEMS.reduce<Record<NavItem['group'], NavItem[]>>(
    (acc, item) => {
      acc[item.group].push(item);
      return acc;
    },
    {
      plataforma: [],
      operacion: [],
      catalogos: [],
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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {!isStartPage ? (
              <button
                type="button"
                onClick={handleBack}
                title="Volver a la pantalla anterior"
                aria-label="Volver a la pantalla anterior"
                className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 text-slate-200 shadow-lg shadow-black/20 transition hover:bg-slate-800"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            ) : null}

            <div className="relative">
              <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                className="inline-flex h-12 items-center gap-3 rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 text-left shadow-lg shadow-black/20 transition hover:bg-sky-400/20"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500 text-sm font-black text-slate-950">
                  IN
                </div>

                <div className="hidden sm:block">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-200">
                    INMOVAL
                  </p>
                  <p className="text-xs text-slate-400">
                    Todas las pantallas
                  </p>
                </div>

                <ChevronDown
                  className={`h-4 w-4 text-sky-200 transition ${
                    open ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {open ? (
                <div className="absolute left-0 top-[calc(100%+0.75rem)] w-[min(92vw,540px)] overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/40">
                  <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-100">
                        Menú INMOVAL
                      </p>
                      <p className="text-xs text-slate-400">
                        Plataforma, operación y catálogos
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="rounded-xl border border-slate-700 bg-slate-950/60 p-2 text-slate-300 hover:bg-slate-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <nav className="max-h-[72vh] overflow-y-auto p-3">
                    {(['plataforma', 'operacion', 'catalogos'] as const).map(
                      (group) => (
                        <div key={group} className="mb-3 last:mb-0">
                          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                            {GROUP_LABELS[group]}
                          </p>

                          <div className="grid gap-2">
                            {groupedItems[group].filter((item) => !item.label.startsWith('__HIDDEN__')).map((item) => {
                              const Icon = item.icon;

                              return (
                                <NavLink
                                  key={item.to}
                                  to={item.to}
                                  onClick={handleNavClick}
                                  end={item.to === '/'}
                                  className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm transition ${
                                      isActive
                                        ? 'border-sky-400/40 bg-sky-400/15 text-sky-100'
                                        : 'border-transparent text-slate-300 hover:border-slate-700 hover:bg-slate-800/80'
                                    }`
                                  }
                                >
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-950/60">
                                    <Icon className="h-4 w-4" />
                                  </div>

                                  <div>
                                    <p className="font-semibold">
                                      {item.label}
                                    </p>
                                    <p className="mt-0.5 text-xs text-slate-500">
                                      {item.description}
                                    </p>
                                  </div>
                                </NavLink>
                              );
                            })}
                          </div>
                        </div>
                      )
                    )}
                  </nav>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3">
            <CurrentIcon className="hidden h-4 w-4 shrink-0 text-sky-300 sm:block" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-100">
                {currentPage.label}
              </p>
              <p className="hidden truncate text-xs text-slate-500 sm:block">
                {currentPage.description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 sm:hidden"
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
          className="fixed inset-0 z-40 cursor-default bg-black/20"
        />
      ) : null}

      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
