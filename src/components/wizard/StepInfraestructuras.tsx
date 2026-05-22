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
  const tot = totalesCostos(infra);
  const vno = valorNetoInfra(infra);

  const setDesc = (descripciones: DescripcionConstructiva[]) => onChange({ descripciones });
  const setAmb = (ambientes: AmbienteCount[]) => onChange({ ambientes });
  const setCostos = (costos: CostoEtapa[]) => onChange({ costos });

  return (
    <AccordionItem value={infra.id} className="border border-border rounded-md bg-muted/10 px-4">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center justify-between w-full pr-4">
          <div className="text-left">
            <div className="font-medium">{infra.nombre || '(sin nombre)'} <span className="text-xs text-muted-foreground ml-2 capitalize">{infra.tipo.replace('_',' ')}</span></div>
            <div className="text-xs text-muted-foreground">
              VRN: {fmtMoney(vno.vrn)} · Dep: {fmtPct(vno.depPct)} · VNO: <span className="text-foreground font-medium">{fmtMoney(vno.vno)}</span>
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

        {/* Ross-Heidecke */}
        <Card className="p-3 bg-card">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Vida útil y estado (Ross-Heidecke)</div>
          <div className="grid md:grid-cols-4 gap-3">
            <NumberField label="V.U.E (años)" value={infra.vidaUtilAnios} onChange={(v) => onChange({ vidaUtilAnios: v })} />
            <NumberField label="Edad (años)" value={infra.edadAnios} onChange={(v) => onChange({ edadAnios: v })} />
            <NumberField label="Año de construcción" value={infra.anioConstruccion} onChange={(v) => onChange({ anioConstruccion: v })} />
            <Field label="Estado FE">
              <Select value={String(infra.estadoFE)} onValueChange={(v) => onChange({ estadoFE: Number(v) })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROSS_HEIDECKE.map((r) => (
                    <SelectItem key={r.fe} value={String(r.fe)}>{r.fe} · {r.label} (Q={r.q})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <div className="grid md:grid-cols-4 gap-3 mt-3 text-xs">
            <div className="p-2 rounded bg-muted/40"><div className="text-muted-foreground">% depreciación</div><div className="font-mono text-base">{fmtPct(vno.depPct)}</div></div>
            <div className="p-2 rounded bg-muted/40"><div className="text-muted-foreground">VRN</div><div className="font-mono text-base">{fmtMoney(vno.vrn)}</div></div>
            <div className="p-2 rounded bg-muted/40"><div className="text-muted-foreground">Depreciación acum.</div><div className="font-mono text-base">{fmtMoney(vno.depAcumulada)}</div></div>
            <div className="p-2 rounded bg-primary/10 border border-primary/30"><div className="text-muted-foreground">VNO</div><div className="font-mono text-base text-primary font-semibold">{fmtMoney(vno.vno)}</div></div>
          </div>
        </Card>

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

        {/* Memoria de costos */}
        <Card className="p-3 bg-card">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Memoria de costos por etapas</div>

          {(['directos','indirectos','impuestos'] as const).map((grupo) => {
            const opciones = grupo === 'directos' ? ETAPAS_DIRECTAS : grupo === 'indirectos' ? ETAPAS_INDIRECTAS : ETAPAS_IMPUESTOS;
            const items = infra.costos.filter((c) => c.grupo === grupo);
            const subtotal = items.reduce((a, c) => a + totalEtapa(c), 0);
            return (
              <div key={grupo} className="mb-3 border border-border rounded">
                <div className="flex items-center justify-between p-2 bg-muted/30">
                  <div className="text-sm font-medium capitalize">{grupo}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs mono">{fmtMoney(subtotal)}</span>
                    <Button size="sm" variant="outline" onClick={() => setCostos([...infra.costos, {
                      id: crypto.randomUUID(), grupo, etapa: '', descripcion: '', unidad: 'm²', cantidad: 0, costoUnitario: 0,
                    }])}><Plus className="h-3 w-3" /></Button>
                  </div>
                </div>
                <table className="w-full text-xs">
                  <thead className="text-muted-foreground">
                    <tr><th className="text-left p-1 w-1/4">Etapa</th><th className="text-left p-1">Descripción</th>
                      <th className="text-left p-1 w-16">Unid.</th><th className="text-right p-1 w-20">Cant.</th>
                      <th className="text-right p-1 w-24">C.Unit.</th><th className="text-right p-1 w-28">Total</th><th></th></tr>
                  </thead>
                  <tbody>
                    {items.map((c) => (
                      <tr key={c.id} className="border-t border-border">
                        <td className="p-1">
                          <Select value={c.etapa} onValueChange={(v) => setCostos(infra.costos.map((x) => x.id === c.id ? { ...x, etapa: v } : x))}>
                            <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Etapa..." /></SelectTrigger>
                            <SelectContent>{opciones.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                          </Select>
                        </td>
                        <td className="p-1"><Input className="h-7 text-xs" value={c.descripcion} onChange={(e) => setCostos(infra.costos.map((x) => x.id === c.id ? { ...x, descripcion: e.target.value } : x))} /></td>
                        <td className="p-1"><Input className="h-7 text-xs" value={c.unidad} onChange={(e) => setCostos(infra.costos.map((x) => x.id === c.id ? { ...x, unidad: e.target.value } : x))} /></td>
                        <td className="p-1"><Input className="h-7 text-xs text-right mono" type="number" value={c.cantidad || ''} onChange={(e) => setCostos(infra.costos.map((x) => x.id === c.id ? { ...x, cantidad: Number(e.target.value) || 0 } : x))} /></td>
                        <td className="p-1"><Input className="h-7 text-xs text-right mono" type="number" value={c.costoUnitario || ''} onChange={(e) => setCostos(infra.costos.map((x) => x.id === c.id ? { ...x, costoUnitario: Number(e.target.value) || 0 } : x))} /></td>
                        <td className="p-1 text-right mono">{fmtMoney(totalEtapa(c))}</td>
                        <td className="p-1"><button className="text-muted-foreground hover:text-destructive" onClick={() => setCostos(infra.costos.filter((x) => x.id !== c.id))}><Trash2 className="h-3 w-3" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
          <div className="grid grid-cols-4 gap-2 text-xs pt-2 border-t border-border">
            <div className="p-2 bg-muted/30 rounded"><div className="text-muted-foreground">Directos</div><div className="mono">{fmtMoney(tot.directos)}</div></div>
            <div className="p-2 bg-muted/30 rounded"><div className="text-muted-foreground">Indirectos</div><div className="mono">{fmtMoney(tot.indirectos)}</div></div>
            <div className="p-2 bg-muted/30 rounded"><div className="text-muted-foreground">Impuestos</div><div className="mono">{fmtMoney(tot.impuestos)}</div></div>
            <div className="p-2 bg-primary/10 border border-primary/30 rounded"><div className="text-muted-foreground">VRN total</div><div className="mono font-semibold">{fmtMoney(tot.vrn)}</div></div>
          </div>
        </Card>

        <TextArea label="Observaciones" value={infra.observaciones} onChange={(v) => onChange({ observaciones: v })} rows={2} />
      </AccordionContent>
    </AccordionItem>
  );
}
