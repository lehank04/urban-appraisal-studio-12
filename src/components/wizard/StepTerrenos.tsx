import { useStore } from '@/store/avaluoStore';
import { Avaluo, emptyTerreno, Terreno, Lindero } from '@/store/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { TextField, NumberField, TextArea, Field } from '@/components/forms/Fields';
import { StringSelect } from '@/components/forms/CatSelect';
import { Plus, Trash2 } from 'lucide-react';
import { fmtNum, m2ToVr2 } from '@/lib/calculations';
import { FORMAS_TERRENO } from '@/lib/catalogos';
import { Input } from '@/components/ui/input';

const TOPOGRAFIA_OPTS = ['PLANA', 'IRREGULAR', 'QUEBRADA'];
const FUENTES = ['escritura', 'catastral', 'levantamiento'] as const;

export function StepTerrenos({ avaluo }: { avaluo: Avaluo }) {
  const { patchAvaluo } = useStore();

  const setCantidad = (n: number) => {
    patchAvaluo(avaluo.id, (a) => {
      const cur = a.terrenos;
      const nuevos = n >= cur.length
        ? [...cur, ...Array.from({ length: n - cur.length }, (_, i) => emptyTerreno(cur.length + i + 1))]
        : cur.slice(0, n);
      return { ...a, terrenos: nuevos };
    });
  };

  const updateTerreno = (id: string, patch: Partial<Terreno>) => {
    patchAvaluo(avaluo.id, (a) => ({
      ...a, terrenos: a.terrenos.map((t) => t.id === id ? { ...t, ...patch } : t),
    }));
  };

  const updateLindero = (terrenoId: string, idx: number, patch: Partial<Lindero>) => {
    patchAvaluo(avaluo.id, (a) => ({
      ...a, terrenos: a.terrenos.map((t) => t.id === terrenoId
        ? { ...t, linderos: t.linderos.map((l, i) => i === idx ? { ...l, ...patch } : l) }
        : t),
    }));
  };

  const removeTerreno = (id: string) => {
    patchAvaluo(avaluo.id, (a) => ({ ...a, terrenos: a.terrenos.filter((t) => t.id !== id) }));
  };

  return (
    <div className="space-y-5">
      <header>
        <div className="text-xs uppercase tracking-widest text-primary">Capítulo IV · INMOVAL</div>
        <h2 className="text-xl font-semibold">Descripción del terreno</h2>
        <p className="text-sm text-muted-foreground">Áreas (escritura / catastral / levantamiento), 4 linderos y morfología.</p>
      </header>

      <Card className="p-4 flex items-center gap-3 flex-wrap">
        <div className="text-sm font-medium">Cantidad de terrenos:</div>
        {[1, 2, 3, 4, 5].map((n) => (
          <Button key={n} size="sm"
            variant={avaluo.terrenos.length === n ? 'default' : 'outline'}
            onClick={() => setCantidad(n)}>{n}</Button>
        ))}
        <Button size="sm" variant="outline" onClick={() => setCantidad(avaluo.terrenos.length + 1)}>
          <Plus className="h-3 w-3 mr-1" />Otro
        </Button>
      </Card>

      {avaluo.terrenos.length === 0 && (
        <div className="text-sm text-muted-foreground text-center py-10">Selecciona la cantidad de terrenos.</div>
      )}

      <Accordion type="multiple" className="space-y-2" defaultValue={avaluo.terrenos.map((t) => t.id)}>
        {avaluo.terrenos.map((t) => (
          <AccordionItem key={t.id} value={t.id} className="border border-border rounded-md bg-card px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center justify-between w-full pr-4">
                <div className="text-left">
                  <div className="font-medium">{t.titulo}</div>
                  <div className="text-xs text-muted-foreground">
                    {fmtNum(t.areaLevantamientoM2)} m² · {fmtNum(t.areaLevantamientoVr2)} vr² · fuente: {t.areaHomologacionFuente}
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); removeTerreno(t.id); }} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4 space-y-5">
              {/* Datos generales */}
              <div className="grid md:grid-cols-3 gap-4">
                <TextField label="Título del terreno" value={t.titulo} onChange={(v) => updateTerreno(t.id, { titulo: v })} />
                <TextField label="Ubicación exacta" value={t.ubicacionExacta} onChange={(v) => updateTerreno(t.id, { ubicacionExacta: v })} />
                <TextField label="Coordenadas (lat, lng)" value={t.coordenadas} onChange={(v) => updateTerreno(t.id, { coordenadas: v })} />
                <TextField label="Persona entrevistada" value={t.personaEntrevistada} onChange={(v) => updateTerreno(t.id, { personaEntrevistada: v })} />
                <TextField label="Uso / Tipo" value={t.usoTipo} onChange={(v) => updateTerreno(t.id, { usoTipo: v })} />
                <TextField label="Estado de ocupación" value={t.estadoOcupacion} onChange={(v) => updateTerreno(t.id, { estadoOcupacion: v })} />
              </div>

              {/* Áreas */}
              <Card className="p-3 bg-muted/20">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Áreas según fuente</div>
                <div className="grid md:grid-cols-3 gap-3 mb-3">
                  <div className="grid grid-cols-2 gap-2">
                    <NumberField label="Escritura (m²)" value={t.areaEscrituraM2}
                      onChange={(v) => updateTerreno(t.id, { areaEscrituraM2: v, areaEscrituraVr2: +m2ToVr2(v).toFixed(4) })} />
                    <NumberField label="Escritura (vr²)" value={t.areaEscrituraVr2} onChange={(v) => updateTerreno(t.id, { areaEscrituraVr2: v })} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <NumberField label="Catastral (m²)" value={t.areaCatastralM2}
                      onChange={(v) => updateTerreno(t.id, { areaCatastralM2: v, areaCatastralVr2: +m2ToVr2(v).toFixed(4) })} />
                    <NumberField label="Catastral (vr²)" value={t.areaCatastralVr2} onChange={(v) => updateTerreno(t.id, { areaCatastralVr2: v })} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <NumberField label="Levantamiento (m²)" value={t.areaLevantamientoM2}
                      onChange={(v) => updateTerreno(t.id, { areaLevantamientoM2: v, areaLevantamientoVr2: +m2ToVr2(v).toFixed(4) })} />
                    <NumberField label="Levantamiento (vr²)" value={t.areaLevantamientoVr2} onChange={(v) => updateTerreno(t.id, { areaLevantamientoVr2: v })} />
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-3">
                  <Field label="Fuente para homologación">
                    <div className="flex gap-1">
                      {FUENTES.map((f) => (
                        <Button key={f} size="sm" variant={t.areaHomologacionFuente === f ? 'default' : 'outline'}
                          onClick={() => updateTerreno(t.id, { areaHomologacionFuente: f })}>{f}</Button>
                      ))}
                    </div>
                  </Field>
                  <NumberField label="Diferencia de área" value={t.diferenciaArea} onChange={(v) => updateTerreno(t.id, { diferenciaArea: v })} />
                  <NumberField label="Valor unitario US$/vr²" value={t.valorUnitarioVr2} onChange={(v) => updateTerreno(t.id, { valorUnitarioVr2: v })} />
                </div>
                <div className="mt-2">
                  <TextArea label="Observaciones de área" value={t.observacionesArea} onChange={(v) => updateTerreno(t.id, { observacionesArea: v })} rows={2} />
                </div>
              </Card>

              {/* Morfología */}
              <div className="grid md:grid-cols-3 gap-3">
                <StringSelect label="Topografía" value={t.topografia} onChange={(v) => updateTerreno(t.id, { topografia: v })} options={TOPOGRAFIA_OPTS} />
                <StringSelect label="Forma" value={t.forma} onChange={(v) => updateTerreno(t.id, { forma: v })} options={FORMAS_TERRENO} />
                <TextField label="Obras complementarias" value={t.obrasComplementarias} onChange={(v) => updateTerreno(t.id, { obrasComplementarias: v })} />
              </div>

              {/* Linderos */}
              <Card className="p-3 bg-muted/20">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Linderos (Norte / Sur / Este / Oeste)</div>
                <div className="space-y-2">
                  {t.linderos.map((l, idx) => (
                    <div key={l.orientacion} className="grid grid-cols-12 gap-2 items-start border border-border rounded p-2">
                      <div className="col-span-1 text-xs font-semibold pt-2">{l.orientacion}</div>
                      <div className="col-span-3">
                        <Input placeholder="Colindante (levantamiento)" value={l.levantamientoColindante}
                          onChange={(e) => updateLindero(t.id, idx, { levantamientoColindante: e.target.value })} className="h-8 text-xs" />
                      </div>
                      <div className="col-span-2">
                        <Input type="number" placeholder="Medida lev." value={l.levantamientoMedida || ''}
                          onChange={(e) => updateLindero(t.id, idx, { levantamientoMedida: Number(e.target.value) || 0 })} className="h-8 text-xs" />
                      </div>
                      <div className="col-span-3">
                        <Input placeholder="Colindante (escritura)" value={l.escrituraColindante}
                          onChange={(e) => updateLindero(t.id, idx, { escrituraColindante: e.target.value })} className="h-8 text-xs" />
                      </div>
                      <div className="col-span-2">
                        <Input type="number" placeholder="Medida esc." value={l.escrituraMedida || ''}
                          onChange={(e) => updateLindero(t.id, idx, { escrituraMedida: Number(e.target.value) || 0 })} className="h-8 text-xs" />
                      </div>
                      <div className="col-span-12">
                        <Input placeholder="Delimitante físico (muro, cerco, calle...)" value={l.delimitanteFisico}
                          onChange={(e) => updateLindero(t.id, idx, { delimitanteFisico: e.target.value })} className="h-8 text-xs" />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Notas */}
              <div className="grid md:grid-cols-2 gap-3">
                <TextArea label="Servidumbres" value={t.servidumbres} onChange={(v) => updateTerreno(t.id, { servidumbres: v })} rows={2} />
                <TextArea label="Características panorámicas" value={t.caracteristicasPanoramicas} onChange={(v) => updateTerreno(t.id, { caracteristicasPanoramicas: v })} rows={2} />
                <TextArea label="Consideraciones adicionales" value={t.consideracionesAdicionales} onChange={(v) => updateTerreno(t.id, { consideracionesAdicionales: v })} rows={2} />
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
