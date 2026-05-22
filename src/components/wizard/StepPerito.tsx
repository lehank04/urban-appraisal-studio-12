import { useStore } from '@/store/avaluoStore';
import { Avaluo, PlantillaId } from '@/store/types';
import { Card } from '@/components/ui/card';
import { Check, FileBadge } from 'lucide-react';
import { PLANTILLAS } from '@/templates/plantillas';

export function StepPerito({ avaluo }: { avaluo: Avaluo }) {
  const { peritos, updateAvaluo, addPerito } = useStore();
  const opciones: { plantilla: PlantillaId; titulo: string; descripcion: string }[] = [
    { plantilla: 'inmoval', titulo: 'INMOVAL', descripcion: 'Plantilla institucional INMOVAL S.A.S. — portada, capítulos y consolidados completos.' },
    { plantilla: 'adalberto', titulo: 'Adalberto', descripcion: 'Plantilla del perito independiente Adalberto Rodríguez.' },
    { plantilla: 'adicional', titulo: 'Perito adicional', descripcion: 'Plantilla genérica configurable para otros peritos firmantes.' },
  ];

  const select = (plantilla: PlantillaId) => {
    let perito = peritos.find((p) => p.plantilla === plantilla);
    if (!perito) {
      perito = addPerito({ nombre: PLANTILLAS[plantilla].empresa, registro: 'RNA-' + plantilla, plantilla });
    }
    updateAvaluo(avaluo.id, { peritoId: perito.id });
  };

  const peritoActual = peritos.find((p) => p.id === avaluo.peritoId);

  return (
    <div className="space-y-5 max-w-4xl">
      <header>
        <h2 className="text-xl font-semibold">Paso 2 · Perito firmante / Plantilla</h2>
        <p className="text-sm text-muted-foreground">
          La selección del perito define automáticamente la plantilla documental: portada, capítulos, textos base y formato.
        </p>
      </header>

      <div className="grid md:grid-cols-3 gap-4">
        {opciones.map((o) => {
          const selected = peritoActual?.plantilla === o.plantilla;
          const plantilla = PLANTILLAS[o.plantilla];
          return (
            <Card
              key={o.plantilla}
              onClick={() => select(o.plantilla)}
              className={`p-5 cursor-pointer transition-all relative ${selected ? 'border-primary ring-2 ring-primary/30' : 'hover:border-primary/40'}`}
            >
              {selected && (
                <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-primary text-primary-foreground grid place-items-center">
                  <Check className="h-3.5 w-3.5" />
                </div>
              )}
              <div className="h-10 w-10 rounded-md grid place-items-center mb-3" style={{ background: plantilla.color }}>
                <FileBadge className="h-5 w-5 text-white" />
              </div>
              <div className="font-semibold">{o.titulo}</div>
              <div className="text-xs text-muted-foreground mt-1">{o.descripcion}</div>
              <div className="mt-3 pt-3 border-t border-border text-[10px] uppercase tracking-wider text-muted-foreground">
                {plantilla.capitulos.length} capítulos
              </div>
            </Card>
          );
        })}
      </div>

      {peritoActual && (
        <Card className="p-4 bg-primary/5 border-primary/30">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Plantilla activa</div>
          <div className="font-medium">{PLANTILLAS[peritoActual.plantilla].nombre} — {peritoActual.nombre}</div>
          <div className="text-xs text-muted-foreground mt-1">Reg: {peritoActual.registro}</div>
        </Card>
      )}
    </div>
  );
}
