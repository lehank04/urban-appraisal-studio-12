import {
  useState } from 'react';
import { NavLink,
  Outlet,
  useLocation,
  useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Boxes,
  Building2,
  ChevronDown,
  ClipboardList,
  Database,
  FilePlus2,
  FileText,
  Gauge,
  Home,
  Image,
  Menu,
  Settings,
  SlidersHorizontal,
  Upload,
  UserSquare2,
  Users,
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
    label: 'Cotizaciones',
    to: '/cotizaciones',
    icon: FileText,
    description: 'Propuestas y aprobaciones',
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
    label: 'Módulos',
    to: '/modulos',
    icon: Boxes,
    description: 'Módulos técnicos disponibles',
    group: 'plataforma',
  },
  {
    label: 'Comparables',
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

  const visibleNavItems = NAV_ITEMS.filter(
    (item) => item.to !== '/plataforma' && item.to !== '/configuracion-plataforma'
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
    <div className="imv-root">
      <header className="imv-topbar">
        <div className="imv-topbar-inner">
          <div className="flex min-w-0 items-center gap-3">
            {!isStartPage ? (
              <button
                type="button"
                onClick={handleBack}
                title="Volver"
                aria-label="Volver"
                className="imv-icon-button hidden sm:inline-flex"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            ) : null}

            <NavLink
              to="/plataforma"
              onClick={handleNavClick}
              className="imv-brand"
            >
              <div className="imv-brand-mark">
                IN
              </div>

              <div className="hidden sm:block">
                <p className="imv-brand-title">
                  INMOVAL
                </p>
                <p className="imv-brand-subtitle">
                  Mission Control
                </p>
              </div>
            </NavLink>
          </div>

          <nav className="hidden flex-1 items-center justify-center xl:flex">
            <div className="imv-command-bar">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const active =
                  location.pathname === item.to ||
                  (item.to !== '/' && location.pathname.startsWith(item.to + '/'));

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={handleNavClick}
                    className={active ? 'imv-command-item imv-command-item-active' : 'imv-command-item'}
                  >
                    <Icon className="imv-command-icon" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}

              <NavLink
                to="/configuracion-plataforma"
                onClick={handleNavClick}
                className={({ isActive }) =>
                  isActive
                    ? 'imv-command-item imv-command-item-active !px-3'
                    : 'imv-command-item !px-3'
                }
                title="Configuración"
                aria-label="Configuración"
              >
                <Settings className="imv-command-icon" />
              </NavLink>
            </div>
          </nav>

          <div className="flex items-center gap-2">
            <div className="imv-topbar-current hidden lg:inline-flex">
              <CurrentIcon className="h-3.5 w-3.5 text-[var(--imv-accent)]" />
              <span className="max-w-[170px] truncate">
                {currentPage.label}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="imv-icon-button xl:hidden"
              aria-label="Abrir menú INMOVAL"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {open ? (
          <div className="mx-auto mt-2 max-w-[1500px] overflow-hidden rounded-2xl border border-black bg-black shadow-2xl shadow-black/50 xl:hidden">
            <nav className="grid gap-2 p-3 sm:grid-cols-2 lg:grid-cols-4">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const active =
                  location.pathname === item.to ||
                  (item.to !== '/' && location.pathname.startsWith(item.to + '/'));

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={handleNavClick}
                    className={active ? 'imv-command-item imv-command-item-active !justify-start !py-3' : 'imv-command-item !justify-start !py-3'}
                  >
                    <Icon className="imv-command-icon" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}

              <NavLink
                to="/configuracion-plataforma"
                onClick={handleNavClick}
                className={({ isActive }) =>
                  isActive
                    ? 'imv-command-item imv-command-item-active !justify-start !py-3'
                    : 'imv-command-item !justify-start !py-3'
                }
              >
                <Settings className="imv-command-icon" />
                <span>Configuración</span>
              </NavLink>
            </nav>
          </div>
        ) : null}
      </header>

      <main className="imv-app-frame">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
