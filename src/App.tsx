import ConfiguracionExpedientesINMOVALPage from '@/platform/expedientes/ConfiguracionExpedientesINMOVALPage';
import NuevoExpedienteINMOVALPage from '@/platform/expedientes/NuevoExpedienteINMOVALPage';
import ConfiguracionCotizacionesINMOVALPage from '@/platform/cotizaciones/ConfiguracionCotizacionesINMOVALPage';
import ImportarExpedienteIMVPage from '@/platform/expedientes/ImportarExpedienteIMVPage';
import ComparablesINMOVALPage from '@/platform/comparables/ComparablesINMOVALPage';
import PrepararModuloTecnicoINMOVALPage from '@/platform/expedientes/PrepararModuloTecnicoINMOVALPage';
import AvaluoComparablesTecnicosPage from '@/modules/urbano/comparables/AvaluoComparablesTecnicosPage';
import AvaluoAnexosTestigosPage from '@/modules/urbano/reportes/AvaluoAnexosTestigosPage';
import AvaluoMercadoComparablesPage from '@/modules/urbano/mercado/AvaluoMercadoComparablesPage';
import AvaluoMemoriaCalculoPage from '@/modules/urbano/memoria/AvaluoMemoriaCalculoPage';
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
import NotFound from './pages/NotFound';

import DashboardINMOVALPage from '@/platform/dashboard/DashboardINMOVALPage';
import ExpedientesINMOVALPage from '@/platform/expedientes/ExpedientesINMOVALPage';
import ExpedienteDetalleINMOVALPage from '@/platform/expedientes/ExpedienteDetalleINMOVALPage';
import CotizacionesINMOVALPage from '@/platform/cotizaciones/CotizacionesINMOVALPage';
import ConfiguracionINMOVALPage from '@/platform/configuracion/ConfiguracionINMOVALPage';
import ModulosINMOVALPage from '@/platform/modulos/ModulosINMOVALPage';

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

            <Route path="/plataforma" element={<DashboardINMOVALPage />} />
            <Route path="/expedientes-plataforma" element={<ExpedientesINMOVALPage />} />
            <Route path="/expedientes-plataforma/configuracion" element={<ConfiguracionExpedientesINMOVALPage />} />
            <Route path="/expedientes-plataforma/nuevo" element={<NuevoExpedienteINMOVALPage />} />
            <Route path="/expedientes-plataforma/importar" element={<ImportarExpedienteIMVPage />} />
            <Route path="/expedientes-plataforma/:id/preparar-tecnico" element={<PrepararModuloTecnicoINMOVALPage />} />
            <Route path="/expedientes-plataforma/:id" element={<ExpedienteDetalleINMOVALPage />} />
            <Route path="/cotizaciones" element={<CotizacionesINMOVALPage />} />
            <Route path="/cotizaciones/configuracion" element={<ConfiguracionCotizacionesINMOVALPage />} />
            <Route path="/configuracion-plataforma" element={<ConfiguracionINMOVALPage />} />
            <Route path="/modulos" element={<ModulosINMOVALPage />} />
            <Route path="/comparables" element={<ComparablesINMOVALPage />} />

            <Route path="/avaluos" element={<AvaluosList />} />
            <Route path="/avaluos/nuevo" element={<NuevoExpediente />} />
            <Route path="/avaluos/:id/memoria-calculo" element={<AvaluoMemoriaCalculoPage />} />
            <Route path="/avaluos/:id" element={<AvaluoWizard />} />
            <Route path="/avaluos/:id/mercado-construido" element={<AvaluoMercadoComparablesPage tipoMercado="construido" />} />
            <Route path="/avaluos/:id/mercado-terreno" element={<AvaluoMercadoComparablesPage tipoMercado="terreno" />} />
            <Route path="/avaluos/:id/comparables" element={<AvaluoComparablesTecnicosPage />} />
            <Route path="/avaluos/:id/anexos-testigos" element={<AvaluoAnexosTestigosPage />} />
            <Route path="/avaluos/:id/preview" element={<AvaluoPreview />} />

            <Route path="/clientes" element={<ClientesPage />} />
            <Route path="/peritos" element={<PeritosPage />} />

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
