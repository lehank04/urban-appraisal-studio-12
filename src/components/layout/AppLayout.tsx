import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  BarChart3,
  ClipboardList,
  FilePlus2,
  UserCog,
  Users,
} from 'lucide-react';

const tabs = [
  {
    label: 'Dashboard',
    to: '/',
    icon: BarChart3,
  },
  {
    label: 'Expedientes',
    to: '/avaluos',
    icon: ClipboardList,
  },
  {
    label: 'Nuevo expediente',
    to: '/avaluos/nuevo',
    icon: FilePlus2,
  },
  {
    label: 'Clientes',
    to: '/clientes',
    icon: Users,
  },
  {
    label: 'Peritos',
    to: '/peritos',
    icon: UserCog,
  },
];

export default function AppLayout() {
  const location = useLocation();

  const isActive = (to: string) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  };

  return (
    <div className="min-h-screen w-full bg-[#111827] text-slate-100">
      <header className="sticky top-0 z-30 px-4 py-3">
        <div className="mx-auto max-w-[1500px] rounded-[2rem] border border-slate-700/70 bg-[#1f2937]/90 backdrop-blur-xl shadow-lg shadow-black/10 px-4 py-3 flex items-center justify-between gap-5">
          <Link to="/" className="flex items-center gap-3 min-w-0 shrink-0">
            <div className="h-11 w-11 rounded-2xl overflow-hidden bg-[#0f5f8f] border border-slate-600 shadow-sm grid place-items-center shrink-0">
              <img
                src="/inmoval-logo.jpg"
                alt="INMOVAL"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="text-xs font-black text-[#facc15]">
                IN
              </span>
            </div>

            <div className="leading-tight min-w-0">
              <div className="text-sm font-black tracking-tight text-sky-300">
                INMOVAL
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                Confianza que da valor
              </div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-2 rounded-full bg-[#0f172a] border border-slate-700 p-1.5 shadow-inner">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = isActive(tab.to);

              return (
                <Link
                  key={tab.to}
                  to={tab.to}
                  className={`h-10 px-5 rounded-full text-xs font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
                    active
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/80'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden xl:flex items-center gap-2 shrink-0">
            <div className="rounded-full bg-emerald-500/10 border border-emerald-400/30 px-3 py-1.5 text-xs font-medium text-emerald-300 whitespace-nowrap">
              Módulo urbano activo
            </div>
          </div>
        </div>

        <nav className="lg:hidden mx-auto max-w-[1500px] mt-3 flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.to);

            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={`h-10 px-4 rounded-full text-xs font-medium flex items-center gap-2 transition-all whitespace-nowrap border ${
                  active
                    ? 'bg-sky-500 text-white border-sky-400'
                    : 'bg-[#1f2937] text-slate-300 border-slate-700'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="px-4 pb-6">
        <div className="mx-auto max-w-[1500px] rounded-[2rem] border border-slate-700/70 bg-[#172033] min-h-[calc(100vh-6rem)] overflow-hidden shadow-lg shadow-black/10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}