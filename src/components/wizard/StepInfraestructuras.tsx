import { useStore } from '@/store/avaluoStore';
import { Avaluo, Infraestructura, emptyInfra } from '@/store/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TextField, NumberField, TextArea } from '@/components/forms/Fields';
import { DynamicField } from '@/components/forms/DynamicField';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { CATALOGOS } from '@/lib/catalogos';
import { Plus, Trash2 } from 'lucide-react';
import { depreciacion, fmtMoney } from '@/lib/calculations';

export function StepInfraestructuras({ avaluo }: { avaluo: Avaluo }) {
  const { patchAvaluo } = useStore();

  const addInfra = (terrenoId: string) => {
    patchAvaluo(avaluo.id, (a) => ({
      ...a, terrenos: a.terrenos.map((t) => t.id === terrenoId
        ? { ...t, infraestructuras: [...t.infraestructuras, emptyInfra()] } : t),
    }));
  };

  const updateInfra = (terrenoId: string, infraId: string, patch: Partial<Infraestructura>) => {
    patchAvaluo(avaluo.id, (a) => ({
      ...a, terrenos: a.terrenos.map((t) => t.id === terrenoId
        ? { ...t, infraestructuras: t.infraestructuras.map((i) => i.id === infraId ? { ...i, ...patch } : i) }
        : t),
    }));
  };

  const removeInfra = (terrenoId: string, infraId: string) => {
    patchAvaluo(avaluo.id, (a) => ({
      ...a, terrenos: a.terrenos.map((t) => t.id === terrenoId
        ? { ...t, infraestructuras: t.infraestructuras.filter((i) => i.id !== infraId) } : t),
    }));
  };

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-xl font-semibold">Paso 5 · Infraestructuras</h2>
        <p className="text-sm text-muted-foreground">
          Cada terreno puede tener múltiples infraestructuras. El sistema genera automáticamente memorias de reposición y depreciación.
        </p>
      </header>

      {avaluo.terrenos.length === 0 && (
        <Card className="p-6 text-center text-sm text-muted-foreground">Primero define al menos un terreno (Paso 4).</Card>
      )}

      <div className="space-y-6">
        {avaluo.terrenos.map((t) => (
          <Card key={t.id} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-semibold">{t.titulo}</div>
                <div className="text-xs text-muted-foreground">{t.infraestructuras.length} infraestructura(s)</div>
              </div>
              <Button size="sm" onClick={() => addInfra(t.id)}><Plus className="h-4 w-4 mr-1" />Nueva infraestructura</Button>
            </div>

            <div className="space-y-3">
              {t.infraestructuras.map((inf) => {
                const d = depreciacion(inf);
                return (
                  <div key={inf.id} className="border border-border rounded-md p-4 bg-muted/20">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium">{inf.nombre || 'Sin nombre'}</div>
                      <button onClick={() => removeInfra(t.id, inf.id)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid md:grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Tipo</Label>
                        <Select value={inf.tipo} onValueChange={(v) => updateInfra(t.id, inf.id, { tipo: v as Infraestructura['tipo'] })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {CATALOGOS.tipoInfra.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <TextField label="Nombre" value={inf.nombre} onChange={(v) => updateInfra(t.id, inf.id, { nombre: v })} />
                      <DynamicField label="Unidad de medida" value={inf.unidadMedida} onChange={(v) => updateInfra(t.id, inf.id, { unidadMedida: v })} options={CATALOGOS.unidadMedida} />

                      <NumberField label="Área / cantidad" value={inf.area} onChange={(v) => updateInfra(t.id, inf.id, { area: v })} />
                      <NumberField label="Costo unitario" value={inf.costoUnitario} onChange={(v) => updateInfra(t.id, inf.id, { costoUnitario: v })} />
                      <DynamicField label="Estado de conservación" value={inf.estadoConservacion} onChange={(v) => updateInfra(t.id, inf.id, { estadoConservacion: v })} options={CATALOGOS.estadoConservacion} />

                      <NumberField label="Vida útil (años)" value={inf.vidaUtil} onChange={(v) => updateInfra(t.id, inf.id, { vidaUtil: v })} />
                      <NumberField label="Edad (años)" value={inf.edad} onChange={(v) => updateInfra(t.id, inf.id, { edad: v })} />
                      <div className="space-y-1.5">
                        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Valor depreciado</Label>
                        <div className="h-10 px-3 flex items-center bg-primary/10 border border-primary/20 rounded-md mono text-sm">
                          {fmtMoney(d.depreciado)}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <TextArea label="Descripción" value={inf.descripcion} onChange={(v) => updateInfra(t.id, inf.id, { descripcion: v })} rows={2} />
                    </div>
                    <div className="mt-3">
                      <TextArea label="Observaciones" value={inf.observaciones} onChange={(v) => updateInfra(t.id, inf.id, { observaciones: v })} rows={2} />
                    </div>
                    <div className="mt-3 flex gap-4 text-xs text-muted-foreground border-t border-border pt-3">
                      <div>Costo reposición: <span className="text-foreground mono">{fmtMoney(d.costo)}</span></div>
                      <div>Factor depreciación: <span className="text-foreground mono">{(d.factor * 100).toFixed(1)}%</span></div>
                    </div>
                  </div>
                );
              })}
              {t.infraestructuras.length === 0 && (
                <div className="text-xs text-muted-foreground text-center py-4">Sin infraestructuras</div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
