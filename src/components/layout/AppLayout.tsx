import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';

export default function AppLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center border-b border-border bg-card/30 backdrop-blur sticky top-0 z-10">
            <SidebarTrigger className="ml-2" />

            <div className="ml-3 flex flex-col leading-tight">
              <div className="text-sm font-medium">
                Dashboard INMOVAL
              </div>
              <div className="text-[11px] text-muted-foreground">
                Expedientes · Clientes · Peritos · Módulos técnicos
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}