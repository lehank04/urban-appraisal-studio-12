import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '@/store/avaluoStore';
import { Button } from '@/components/ui/button';
import { StepperSidebar, Step } from '@/components/wizard/StepperSidebar';
import { StepCliente } from '@/components/wizard/StepCliente';
import { StepPerito } from '@/components/wizard/StepPerito';
import { StepInfo } from '@/components/wizard/StepInfo';
import { StepLegal } from '@/components/wizard/StepLegal';
import { StepEntorno } from '@/components/wizard/StepEntorno';
import { StepTerrenos } from '@/components/wizard/StepTerrenos';
import { StepInfraestructuras } from '@/components/wizard/StepInfraestructuras';
import { StepMetodologias } from '@/components/wizard/StepMetodologias';
import { StepFotos } from '@/components/wizard/StepFotos';
import { StepPreview } from '@/components/wizard/StepPreview';
import { StepFormato } from '@/components/wizard/StepFormato';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function AvaluoWizard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { createAvaluo, getAvaluo, updateAvaluo } = useStore();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!id) {
      const av = createAvaluo();
      navigate(`/avaluos/${av.id}`, { replace: true });
    }
  }, [id]);

  const avaluo = id ? getAvaluo(id) : undefined;
  if (!avaluo) return <div className="p-8 text-muted-foreground">Cargando...</div>;

  const steps: Step[] = [
    { id: 1, title: 'Perito firmante',          subtitle: 'Define plantilla INMOVAL' },
    { id: 2, title: 'Cliente / Solicitante',    subtitle: 'Datos del solicitante' },
    { id: 3, title: 'Cap. I — Información general', subtitle: 'Expediente y propósito' },
    { id: 4, title: 'Cap. II — Documentación legal', subtitle: 'Escritura · Registro · Catastro' },
    { id: 5, title: 'Cap. III — Entorno urbano',     subtitle: 'Zona · Servicios · Vías' },
    { id: 6, title: 'Cap. IV — Terreno(s)',          subtitle: `${avaluo.terrenos.length} terreno(s) · linderos` },
    { id: 7, title: 'Cap. V — Infraestructuras',     subtitle: 'Memoria de costos · Ross-Heidecke' },
    { id: 8, title: 'Cap. VI — Metodología',         subtitle: 'Costo · Mercado · Realización' },
    { id: 9, title: 'Cap. VII — Anexo fotográfico',  subtitle: 'Registro visual' },
    { id: 10,title: 'Formato del PDF',                subtitle: 'Portada · encabezado · pie · tipografía' },
    { id: 11,title: 'Vista previa',                   subtitle: 'Documento final' },
  ];

  const render = () => {
    switch (current) {
      case 0: return <StepPerito avaluo={avaluo} />;
      case 1: return <StepCliente avaluo={avaluo} />;
      case 2: return <StepInfo avaluo={avaluo} />;
      case 3: return <StepLegal avaluo={avaluo} />;
      case 4: return <StepEntorno avaluo={avaluo} />;
      case 5: return <StepTerrenos avaluo={avaluo} />;
      case 6: return <StepInfraestructuras avaluo={avaluo} />;
      case 7: return <StepMetodologias avaluo={avaluo} />;
      case 8: return <StepFotos avaluo={avaluo} />;
      case 9: return <StepFormato avaluo={avaluo} />;
      case 10: return <StepPreview avaluo={avaluo} />;
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-3rem)]">
      <StepperSidebar steps={steps} current={current} onJump={setCurrent} />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-6 overflow-auto">{render()}</div>
        <footer className="border-t border-border bg-card/50 p-4 flex items-center justify-between">
          <Button variant="outline" onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0}>
            <ChevronLeft className="h-4 w-4 mr-1" />Anterior
          </Button>
          <div className="text-xs text-muted-foreground">Paso {current + 1} de {steps.length} · Guardado automático</div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { updateAvaluo(avaluo.id, { estado: 'en_proceso' }); toast.success('Avalúo guardado'); }}>
              <Save className="h-4 w-4 mr-1" />Guardar
            </Button>
            <Button onClick={() => setCurrent((c) => Math.min(steps.length - 1, c + 1))} disabled={current === steps.length - 1}>
              Siguiente <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}
