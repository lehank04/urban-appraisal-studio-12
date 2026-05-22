import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '@/store/avaluoStore';
import { Button } from '@/components/ui/button';
import { StepperSidebar, Step } from '@/components/wizard/StepperSidebar';
import { StepCliente } from '@/components/wizard/StepCliente';
import { StepPerito } from '@/components/wizard/StepPerito';
import { StepInfo } from '@/components/wizard/StepInfo';
import { StepTerrenos } from '@/components/wizard/StepTerrenos';
import { StepInfraestructuras } from '@/components/wizard/StepInfraestructuras';
import { StepMetodologias } from '@/components/wizard/StepMetodologias';
import { StepFotos } from '@/components/wizard/StepFotos';
import { StepPreview } from '@/components/wizard/StepPreview';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function AvaluoWizard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { avaluos, createAvaluo, getAvaluo, updateAvaluo } = useStore();
  const [current, setCurrent] = useState(0);

  // Crear si no hay id
  useEffect(() => {
    if (!id) {
      const av = createAvaluo();
      navigate(`/avaluos/${av.id}`, { replace: true });
    }
  }, [id]);

  const avaluo = id ? getAvaluo(id) : undefined;
  if (!avaluo) return <div className="p-8 text-muted-foreground">Cargando...</div>;

  const steps: Step[] = [
    { id: 1, title: 'Cliente', subtitle: 'Buscar o crear' },
    { id: 2, title: 'Perito / Plantilla', subtitle: 'Define documento' },
    { id: 3, title: 'Información general', subtitle: 'Datos del expediente' },
    { id: 4, title: 'Terrenos', subtitle: `${avaluo.terrenos.length} terreno(s)` },
    { id: 5, title: 'Infraestructuras', subtitle: 'Reposición y depreciación' },
    { id: 6, title: 'Metodologías', subtitle: 'Memorias de cálculo' },
    { id: 7, title: 'Fotografías', subtitle: 'Registro visual' },
    { id: 8, title: 'Vista previa', subtitle: 'Consolidados' },
  ];

  const render = () => {
    switch (current) {
      case 0: return <StepCliente avaluo={avaluo} />;
      case 1: return <StepPerito avaluo={avaluo} />;
      case 2: return <StepInfo avaluo={avaluo} />;
      case 3: return <StepTerrenos avaluo={avaluo} />;
      case 4: return <StepInfraestructuras avaluo={avaluo} />;
      case 5: return <StepMetodologias avaluo={avaluo} />;
      case 6: return <StepFotos avaluo={avaluo} />;
      case 7: return <StepPreview avaluo={avaluo} />;
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-3rem)]">
      <StepperSidebar steps={steps} current={current} onJump={setCurrent} />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-6 overflow-auto">
          {render()}
        </div>
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
