import ExpedientesINMOVALPage from '@/platform/expedientes/ExpedientesINMOVALPage';
import CotizacionesINMOVALPage from '@/platform/cotizaciones/CotizacionesINMOVALPage';
import ExpedienteDetalleINMOVALPage from '@/platform/expedientes/ExpedienteDetalleINMOVALPage';
import DashboardINMOVALPage from '@/platform/dashboard/DashboardINMOVALPage';
﻿import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import AvaluosList from './pages/AvaluosList';
import NuevoExpediente from './pages/NuevoExpediente';
import AvaluoWizard from './pages/AvaluoWizard';
import AvaluoPreview from './pages/AvaluoPreview';
import ClientesPage from './pages/ClientesPage';
import PeritosPage from './pages/PeritosPage';
import ModulosINMOVALPage from '@/platform/modulos/ModulosINMOVALPage';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/avaluos" element={<AvaluosList />} />
            <Route path="/avaluos/nuevo" element={<NuevoExpediente />} />
            <Route path="/avaluos/:id" element={<AvaluoWizard />} />
            <Route path="/clientes" element={<ClientesPage />} />
            <Route path="/peritos" element={<PeritosPage />} />
          <Route path="/modulos" element={<ModulosINMOVALPage />} />
          </Route>

          <Route path="/avaluos/:id/preview" element={<AvaluoPreview />} />
          <Route path="*" element={<NotFound />} />
                  <Route path="/expedientes-plataforma" element={<ExpedientesINMOVALPage />} />
                  <Route path="/cotizaciones" element={<CotizacionesINMOVALPage />} />
                  <Route path="/expedientes-plataforma/:id" element={<ExpedienteDetalleINMOVALPage />} />
                  <Route path="/plataforma" element={<DashboardINMOVALPage />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

