import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, UserCog, Plus, Building2 } from 'lucide-react';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
} from '@/components/ui/sidebar';

const items = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Avalúos', url: '/avaluos', icon: FileText },
  { title: 'Nuevo avalúo', url: '/avaluos/nuevo', icon: Plus },
  { title: 'Clientes', url: '/clientes', icon: Users },
  { title: 'Peritos', url: '/peritos', icon: UserCog },
];

export function AppSidebar() {
  const { pathname } = useLocation();
  const isActive = (url: string) => url === '/' ? pathname === '/' : pathname.startsWith(url);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primary to-accent grid place-items-center">
            <Building2 className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <div className="font-semibold text-sm tracking-tight">INMOVAL</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Sistema de avalúos</div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Operación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((it) => (
                <SidebarMenuItem key={it.url}>
                  <SidebarMenuButton asChild isActive={isActive(it.url)}>
                    <NavLink to={it.url}>
                      <it.icon className="h-4 w-4" />
                      <span>{it.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="px-3 py-3 border-t border-sidebar-border">
        <div className="text-[10px] text-muted-foreground">v0.1 · Prototipo</div>
      </SidebarFooter>
    </Sidebar>
  );
}
