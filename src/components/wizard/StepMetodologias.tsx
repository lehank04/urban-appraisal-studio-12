import { useStore } from '@/store/avaluoStore';
import { Avaluo, Comparable, defaultFactores, FactorComparable } from '@/store/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { TextField, NumberField } from '@/components/forms/Fields';
import { PLANTILLAS } from '@/templates/plantillas';
import { Plus, Trash2 } from 'lucide-react';
import { valorComparable, promedioUnitarioComparables, fmtMoney } from '@/lib/calculations';

export function StepMetodologias({ avaluo }: { avaluo: Avaluo }) {
  const { patchAvaluo, peritos } = useStore();
  const perito = peritos.find((p) => p.id === avaluo.peritoId);
  const plantilla = perito ? PLANTILLAS[perito.plantilla] : PLANTILLAS.inmoval;

  const m = avaluo.metodologias;
  const setMet = (key: keyof typeof m, value: boolean) =>
    patchAvaluo(avaluo.id, (a) => ({ ...a, metodologias: { ...a.metodologias, [key]: value } }));

  const addComparable = () => {
    const c: Comparable = {
      id: crypto.randomUUID(), nombre: `Comparable ${m.comparables.length + 1}`,
      ubicacion: '', area: 0, precio: 0, fotos: [], factores: defaultFactores(),
    };
    patchAvaluo(avaluo.id, (a) => ({ ...a, metodologias: { ...a.metodologias, comparables: [...a.metodologias.comparables, c] } }));
  };

  const updateComp = (id: string, patch: Partial<Comparable>) =>
    patchAvaluo(avaluo.id, (a) => ({
      ...a, metodologias: { ...a.metodologias, comparables: a.metodologias.comparables.map((c) => c.id === id ? { ...c, ...patch } : c) },
    }));

  const updateFactor = (compId: string, key: string, patch: Partial<FactorComparable>) => {
    patchAvaluo(avaluo.id, (a) => ({
      ...a, metodologias: { ...a.metodologias,
        comparables: a.metodologias.comparables.map((c) => c.id === compId
          ? { ...c, factores: c.factores.map((f) => f.key === key ? { ...f, ...patch } : f) } : c),
      },
    }));
  };

  const removeComp = (id: string) =>
    patchAvaluo(avaluo.id, (a) => ({ ...a, metodologias: { ...a.metodologias, comparables: a.metodologias.comparables.filter((c) => c.id !== id) } }));

  const metodos: { key: keyof typeof m; label: string }[] = [
    { key: 'comparativo', label: 'Método comparativo de mercado' },
    { key: 'reposicion', label: 'Método de reposición' },
    { key: 'mercadoTerreno', label: 'Valor de mercado terreno' },
    { key: 'mercadoMejoras', label: 'Valor de mercado mejoras' },
  ];

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-xl font-semibold">Paso 6 · Metodologías y memorias</h2>
        <p className="text-sm text-muted-foreground">Activa o desactiva metodologías. Las inactivas se justifican con texto técnico automático.</p>
      </header>

      <Card className="p-4">
        <div className="grid md:grid-cols-2 gap-4">
          {metodos.map((met) => (
            <div key={met.key} className="flex items-center justify-between p-3 border border-border rounded-md bg-muted/20">
              <div>
                <div className="font-medium text-sm">{met.label}</div>
                {!m[met.key] && (
                  <div className="text-xs text-muted-foreground mt-1 italic">{plantilla.textosNoAplica[met.key as string]}</div>
                )}
              </div>
              <Switch checked={Boolean(m[met.key])} onCheckedChange={(v) => setMet(met.key, v)} />
            </div>
          ))}
        </div>
      </Card>

      {m.comparativo && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-semibold">Memorias comparativas</div>
              <div className="text-xs text-muted-foreground">
                Valor unitario promedio: <span className="mono text-foreground">{fmtMoney(promedioUnitarioComparables(m.comparables))}/m²</span>
              </div>
            </div>
            <Button size="sm" onClick={addComparable}><Plus className="h-4 w-4 mr-1" />Comparable</Button>
          </div>

          <div className="space-y-3">
            {m.comparables.map((c) => {
              const v = valorComparable(c);
              return (
                <div key={c.id} className="border border-border rounded-md p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-medium text-sm">{c.nombre}</div>
                    <button onClick={() => removeComp(c.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid md:grid-cols-4 gap-3">
                    <TextField label="Nombre" value={c.nombre} onChange={(v) => updateComp(c.id, { nombre: v })} />
                    <TextField label="Ubicación" value={c.ubicacion} onChange={(v) => updateComp(c.id, { ubicacion: v })} />
                    <NumberField label="Área (m²)" value={c.area} onChange={(v) => updateComp(c.id, { area: v })} />
                    <NumberField label="Precio" value={c.precio} onChange={(v) => updateComp(c.id, { precio: v })} />
                  </div>

                  <div className="mt-4">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Factores ajustables</div>
                    <div className="grid md:grid-cols-3 gap-2">
                      {c.factores.map((f) => (
                        <div key={f.key} className={`p-2 border rounded ${f.active ? 'border-primary/40 bg-primary/5' : 'border-border bg-muted/10'}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium">{f.label}</span>
                            <Switch checked={f.active} onCheckedChange={(v) => updateFactor(c.id, f.key, { active: v })} />
                          </div>
                          <Input
                            type="number" step="0.01" disabled={!f.active}
                            value={f.value}
                            onChange={(e) => updateFactor(c.id, f.key, { value: Number(e.target.value) || 1 })}
                            className="h-8 text-sm mono"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-border flex gap-4 text-xs">
                    <div>Factor: <span className="mono text-foreground">{v.factor.toFixed(3)}</span></div>
                    <div>Ajustado: <span className="mono text-foreground">{fmtMoney(v.ajustado)}</span></div>
                    <div>Unitario: <span className="mono text-foreground">{fmtMoney(v.unitario)}/m²</span></div>
                  </div>
                </div>
              );
            })}
            {m.comparables.length === 0 && (
              <div className="text-xs text-muted-foreground text-center py-4">Sin comparables</div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
