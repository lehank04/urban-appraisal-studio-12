import { useStore } from '@/store/avaluoStore';
import { Avaluo, Infraestructura, emptyInfra, CostoEtapa, DescripcionConstructiva, AmbienteCount } from '@/store/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TextField, NumberField, TextArea, Field } from '@/components/forms/Fields';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus, Trash2 } from 'lucide-react';
import { totalesCostos, valorNetoInfra, fmtMoney, fmtPct, totalEtapa } from '@/lib/calculations';
import { ELEMENTOS_CONSTRUCTIVOS, AMBIENTES_CATALOGO, ETAPAS_DIRECTAS, ETAPAS_INDIRECTAS, ETAPAS_IMPUESTOS, ROSS_HEIDECKE } from '@/lib/catalogos';

const TIPOS = [
  { value: 'principal',     label: 'Principal' },
  { value: 'complementaria',label: 'Complementaria' },
  { value: 'obra_exterior', label: 'Obra exterior' },
] as const;

export function StepInfraestructuras({ avaluo }: { avaluo: Avaluo }) {
  const { patchAvaluo } = useStore();

  const addInfra = (terrenoId: string, tipo: Infraestructura['tipo'] = 'principal') => {
    patchAvaluo(avaluo.id, (a) => ({
      ...a, terrenos: a.terrenos.map((t) => t.id === terrenoId
        ? { ...t, infraestructuras: [...t.infraestructuras, emptyInfra(tipo)] } : t),
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
        <div className="text-xs uppercase tracking-widest text-primary">Capítulo V · INMOVAL</div>
        <h2 className="text-xl font-semibold">Descripción de la infraestructura</h2>
        <p className="text-sm text-muted-foreground">
          Por cada terreno: 1..n infraestructuras con descripción constructiva, memoria de costos por etapas y depreciación Ross-Heidecke.
        </p>
      </header>

      {avaluo.terrenos.length === 0 && (
        <Card className="p-6 text-center text-sm text-muted-foreground">Primero define al menos un terreno (Cap. IV).</Card>
      )}

      <div className="space-y-6">
        {avaluo.terrenos.map((t) => (
          <Card key={t.id} className="p-4">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div>
                <div className="font-semibold">{t.titulo}</div>
                <div className="text-xs text-muted-foreground">{t.infraestructuras.length} infraestructura(s)</div>
              </div>
              <div className="flex gap-2">
                {TIPOS.map((tt) => (
                  <Button key={tt.value} size="sm" variant="outline" onClick={() => addInfra(t.id, tt.value as Infraestructura['tipo'])}>
                    <Plus className="h-3 w-3 mr-1" />{tt.label}
                  </Button>
                ))}
              </div>
            </div>

            <Accordion type="multiple" className="space-y-2">
              {t.infraestructuras.map((inf) => (
                <InfraEditor key={inf.id} infra={inf}
                  onChange={(patch) => updateInfra(t.id, inf.id, patch)}
                  onRemove={() => removeInfra(t.id, inf.id)} />
              ))}
            </Accordion>

            {t.infraestructuras.length === 0 && (
              <div className="text-xs text-muted-foreground text-center py-4">Sin infraestructuras</div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============ Editor por infraestructura ============
function InfraEditor({ infra, onChange, onRemove }: {
  infra: Infraestructura; onChange: (p: Partial<Infraestructura>) => void; onRemove: () => void;
}) {
  const setDesc = (descripciones: DescripcionConstructiva[]) => onChange({ descripciones });
  const setAmb = (ambientes: AmbienteCount[]) => onChange({ ambientes });

  return (
    <AccordionItem value={infra.id} className="border border-border rounded-md bg-muted/10 px-4">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center justify-between w-full pr-4">
          <div className="text-left">
            <div className="font-medium">{infra.nombre || '(sin nombre)'} <span className="text-xs text-muted-foreground ml-2 capitalize">{infra.tipo.replace('_',' ')}</span></div>
            <div className="text-xs text-muted-foreground">
              Área: {infra.areaTotalM2 || 0} m² · Niveles: {infra.niveles || 0} · Año: {infra.anioConstruccion || '—'}
            </div>
          </div>
          <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="text-muted-foreground hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-2 pb-4 space-y-5">
        {/* Datos generales */}
        <div className="grid md:grid-cols-4 gap-3">
          <Field label="Tipo">
            <Select value={infra.tipo} onValueChange={(v) => onChange({ tipo: v as Infraestructura['tipo'] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{TIPOS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <TextField label="Nombre" value={infra.nombre} onChange={(v) => onChange({ nombre: v })} />
          <NumberField label="Área total (m²)" value={infra.areaTotalM2} onChange={(v) => onChange({ areaTotalM2: v })} />
          <NumberField label="Niveles" value={infra.niveles} onChange={(v) => onChange({ niveles: v })} />
        </div>
        <div className="grid md:grid-cols-4 gap-3">
          <NumberField label="Año de construcción" value={infra.anioConstruccion} onChange={(v) => onChange({ anioConstruccion: v })} />
        </div>


        {/* Descripciones constructivas */}
        <Card className="p-3 bg-card">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Descripción constructiva</div>
            <Button size="sm" variant="outline" onClick={() => setDesc([...infra.descripciones, { elemento: '', descripcion: '' }])}>
              <Plus className="h-3 w-3 mr-1" />Elemento
            </Button>
          </div>
          <div className="space-y-2">
            {infra.descripciones.map((d, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-start">
                <div className="col-span-3">
                  <Select value={d.elemento} onValueChange={(v) => setDesc(infra.descripciones.map((x, ix) => ix === i ? { ...x, elemento: v } : x))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Elemento..." /></SelectTrigger>
                    <SelectContent>{ELEMENTOS_CONSTRUCTIVOS.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Input className="col-span-8 h-8 text-xs" placeholder="Descripción técnica" value={d.descripcion}
                  onChange={(e) => setDesc(infra.descripciones.map((x, ix) => ix === i ? { ...x, descripcion: e.target.value } : x))} />
                <button className="col-span-1 text-muted-foreground hover:text-destructive" onClick={() => setDesc(infra.descripciones.filter((_, ix) => ix !== i))}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {infra.descripciones.length === 0 && <div className="text-xs text-muted-foreground">Sin descripciones</div>}
          </div>
        </Card>

        {/* Ambientes */}
        <Card className="p-3 bg-card">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Ambientes</div>
            <Button size="sm" variant="outline" onClick={() => setAmb([...infra.ambientes, { ambiente: '', cantidad: 1 }])}>
              <Plus className="h-3 w-3 mr-1" />Ambiente
            </Button>
          </div>
          <div className="grid md:grid-cols-2 gap-2">
            {infra.ambientes.map((a, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Select value={a.ambiente} onValueChange={(v) => setAmb(infra.ambientes.map((x, ix) => ix === i ? { ...x, ambiente: v } : x))}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Ambiente..." /></SelectTrigger>
                  <SelectContent>{AMBIENTES_CATALOGO.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                </Select>
                <Input type="number" className="w-20 h-8 text-xs" value={a.cantidad || ''}
                  onChange={(e) => setAmb(infra.ambientes.map((x, ix) => ix === i ? { ...x, cantidad: Number(e.target.value) || 0 } : x))} />
                <button className="text-muted-foreground hover:text-destructive" onClick={() => setAmb(infra.ambientes.filter((_, ix) => ix !== i))}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </Card>


        <TextArea label="Observaciones" value={infra.observaciones} onChange={(v) => onChange({ observaciones: v })} rows={2} />
      </AccordionContent>
    </AccordionItem>
  );
}
