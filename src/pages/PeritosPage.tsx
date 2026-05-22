import { useStore } from '@/store/avaluoStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { PLANTILLAS } from '@/templates/plantillas';

export default function PeritosPage() {
  const { peritos, deletePerito } = useStore();
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Peritos firmantes</h1>
        <p className="text-sm text-muted-foreground">Cada perito está asociado a una plantilla documental.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {peritos.map((p) => {
          const pl = PLANTILLAS[p.plantilla];
          return (
            <Card key={p.id} className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">{pl.nombre}</div>
                  <div className="font-semibold text-lg mt-1">{p.nombre}</div>
                  <div className="text-xs text-muted-foreground mt-1">Registro: {p.registro}</div>
                  {p.cargo && <div className="text-xs text-muted-foreground">{p.cargo}</div>}
                </div>
                <div className="h-10 w-10 rounded grid place-items-center text-white font-bold" style={{ background: pl.color }}>
                  {pl.nombre.charAt(0)}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                <div className="text-xs text-muted-foreground">{pl.capitulos.length} capítulos en la plantilla</div>
                <Button size="icon" variant="ghost" onClick={() => deletePerito(p.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
