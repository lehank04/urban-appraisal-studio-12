import { useStore } from '@/store/avaluoStore';
import { Avaluo, emptyTerreno, Terreno } from '@/store/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { TextField, NumberField, TextArea } from '@/components/forms/Fields';
import { DynamicField } from '@/components/forms/DynamicField';
import { CATALOGOS } from '@/lib/catalogos';
import { Plus, Trash2 } from 'lucide-react';
import { valorTerreno, fmtMoney } from '@/lib/calculations';

export function StepTerrenos({ avaluo }: { avaluo: Avaluo }) {
  const { patchAvaluo } = useStore();

  const setCantidad = (n: number) => {
    patchAvaluo(avaluo.id, (a) => {
      const cur = a.terrenos;
      let nuevos: Terreno[];
      if (n >= cur.length) {
        nuevos = [...cur, ...Array.from({ length: n - cur.length }, (_, i) => emptyTerreno(cur.length + i + 1))];
      } else {
        nuevos = cur.slice(0, n);
      }
      return { ...a, terrenos: nuevos };
    });
  };

  const updateTerreno = (id: string, patch: Partial<Terreno>) => {
    patchAvaluo(avaluo.id, (a) => ({
      ...a, terrenos: a.terrenos.map((t) => t.id === id ? { ...t, ...patch } : t),
    }));
  };

  const removeTerreno = (id: string) => {
    patchAvaluo(avaluo.id, (a) => ({ ...a, terrenos: a.terrenos.filter((t) => t.id !== id) }));
  };

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-xl font-semibold">Paso 4 · Terrenos</h2>
        <p className="text-sm text-muted-foreground">Define cuántos terrenos integran el inmueble. El sistema genera el formulario para cada uno.</p>
      </header>

      <Card className="p-4 flex items-center gap-3">
        <div className="text-sm font-medium">Cantidad de terrenos:</div>
        {[1, 2, 3, 4, 5].map((n) => (
          <Button
            key={n}
            size="sm"
            variant={avaluo.terrenos.length === n ? 'default' : 'outline'}
            onClick={() => setCantidad(n)}
          >{n}</Button>
        ))}
        <Button size="sm" variant="outline" onClick={() => setCantidad(avaluo.terrenos.length + 1)}>
          <Plus className="h-3 w-3 mr-1" />Otro
        </Button>
      </Card>

      {avaluo.terrenos.length === 0 && (
        <div className="text-sm text-muted-foreground text-center py-10">Selecciona la cantidad de terrenos.</div>
      )}

      <Accordion type="multiple" className="space-y-2" defaultValue={avaluo.terrenos.map((t) => t.id)}>
        {avaluo.terrenos.map((t, idx) => (
          <AccordionItem key={t.id} value={t.id} className="border border-border rounded-md bg-card px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center justify-between w-full pr-4">
                <div className="text-left">
                  <div className="font-medium">{t.titulo}</div>
                  <div className="text-xs text-muted-foreground">{t.area} m² · {fmtMoney(valorTerreno(t))}</div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); removeTerreno(t.id); }} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4">
              <div className="grid md:grid-cols-3 gap-4">
                <TextField label="Título del terreno" value={t.titulo} onChange={(v) => updateTerreno(t.id, { titulo: v })} />
                <NumberField label="Área (m²)" value={t.area} onChange={(v) => updateTerreno(t.id, { area: v })} />
                <NumberField label="Valor unitario / m²" value={t.valorUnitario} onChange={(v) => updateTerreno(t.id, { valorUnitario: v })} />

                <DynamicField label="Forma" value={t.forma} onChange={(v) => updateTerreno(t.id, { forma: v })} options={CATALOGOS.forma} />
                <DynamicField label="Topografía" value={t.topografia} onChange={(v) => updateTerreno(t.id, { topografia: v })} options={CATALOGOS.topografia} />
                <DynamicField label="Tipo de acceso" value={t.tipoAcceso} onChange={(v) => updateTerreno(t.id, { tipoAcceso: v })} options={CATALOGOS.tipoAcceso} />

                <DynamicField label="Servicios públicos" value={t.serviciosPublicos} onChange={(v) => updateTerreno(t.id, { serviciosPublicos: v })} options={CATALOGOS.serviciosPublicos} />
                <DynamicField label="Zonificación" value={t.zonificacion} onChange={(v) => updateTerreno(t.id, { zonificacion: v })} options={CATALOGOS.zonificacion} />
                <DynamicField label="Uso actual" value={t.usoActual} onChange={(v) => updateTerreno(t.id, { usoActual: v })} options={CATALOGOS.usoActual} />

                <DynamicField label="Uso potencial" value={t.usoPotencial} onChange={(v) => updateTerreno(t.id, { usoPotencial: v })} options={CATALOGOS.usoPotencial} />
                <DynamicField label="Entorno" value={t.entorno} onChange={(v) => updateTerreno(t.id, { entorno: v })} options={CATALOGOS.entorno} />
              </div>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <TextArea label="Descripción física" value={t.descripcionFisica} onChange={(v) => updateTerreno(t.id, { descripcionFisica: v })} rows={4} />
                <TextArea label="Observaciones" value={t.observaciones} onChange={(v) => updateTerreno(t.id, { observaciones: v })} rows={4} />
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
