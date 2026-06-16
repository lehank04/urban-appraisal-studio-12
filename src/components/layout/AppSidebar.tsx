import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  ClipboardList,
  FolderKanban,
  Users,
  UserCog,
  Database,
  Boxes,
  Settings,
} from 'lucide-react';

const navigation = [
  {
    title: 'Centro INMOVAL',
    url: '/',
    icon: BarChart3,
  },
  {
    title: 'Cotizaciones',
    url: '/cotizaciones',
    icon: ClipboardList,
  },
  {
    title: 'Expedientes',
    url: '/expedientes-plataforma',
    icon: FolderKanban,
  },
  {
    title: 'Clientes',
    url: '/clientes',
    icon: Users,
  },
  {
    title: 'Peritos',
    url: '/peritos',
    icon: UserCog,
  },
  {
    title: 'Base de comparables',
    url: '/comparables',
    icon: Database,
  },
  {
    title: 'Módulos técnicos',
    url: '/modulos',
    icon: Boxes,
  },
  {
    title: 'Configuración',
    url: '/configuracion-plataforma',
    icon: Settings,
  },
];

export function AppSidebar() {
  return (
    <aside className="min-h-screen w-72 border-r border-slate-800 bg-slate-950 p-4 text-slate-100">
      <div className="mb-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-4">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-sky-300">
          Plataforma
        </p>
        <h2 className="mt-2 text-xl font-bold">INMOVAL</h2>
      </div>

      <nav className="grid gap-2">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.url}
              to={item.url}
              end={item.url === '/'}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
                  isActive
                    ? 'bg-sky-500/15 text-sky-100 ring-1 ring-sky-400/30'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100',
                ].join(' ')
              }
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

export default AppSidebar;
