import { useStore } from '@/store/avaluoStore';
import { Avaluo, emptyTerreno, emptyAreaItem, emptyLinderoMedida, Terreno, Lindero, AreaItem, LinderoMedida, LinderoFuente } from '@/store/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { TextField, TextArea, Field } from '@/components/forms/Fields';
import { StringSelectWithCustom } from '@/components/forms/CatSelect';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { fmtNum } from '@/lib/calculations';
import {
  FORMAS_TERRENO, UNIDADES_AREA, ORIGENES_AREA,
  convertArea, toleranciaArea, M2_PER_UNIT,
} from '@/lib/catalogos';
import { useEffect } from 'react';

const TOPOGRAFIA_OPTS = ['PLANA', 'IRREGULAR', 'QUEBRADA'];

const labelOrigen = (a: AreaItem) =>
  a.origen === 'personalizado' ? (a.origenLabel || 'PERSONALIZADO') : a.origen.toUpperCase();

export function StepTerrenos({ avaluo }: { avaluo: Avaluo }) {
  const { patchAvaluo } = useStore();

  // Migración defensiva: garantizar `areas`, `descripcionGeneralTerrenos` y `linderos.medidas`
  useEffect(() => {
    patchAvaluo(avaluo.id, (a) => {
      const dgt = a.descripcionGeneralTerrenos ?? { direccion: '', coordenadas: '', personaEntrevistada: '' };
      const terrenos = a.terrenos.map((t) => {
        // áreas
        let areas = t.areas;
        if (!areas || !areas.length) {
          const seed: AreaItem[] = [];
          if (t.areaLevantamientoM2) seed.push({ ...emptyAreaItem('levantamiento'), valor1: t.areaLevantamientoM2, valor2: t.areaLevantamientoVr2, usarHomologacion: true });
          if (t.areaEscrituraM2) seed.push({ ...emptyAreaItem('escritura'), valor1: t.areaEscrituraM2, valor2: t.areaEscrituraVr2 });
          if (t.areaCatastralM2) seed.push({ ...emptyAreaItem('plano'), origenLabel: 'CATASTRAL', valor1: t.areaCatastralM2, valor2: t.areaCatastralVr2 });
          areas = seed.length ? seed : [emptyAreaItem('levantamiento')];
        }
        // linderos
        const linderos = t.linderos.map((l) => {
          if (l.medidas && l.medidas.length) return l;
          const m: LinderoMedida[] = [];
          if (l.levantamientoColindante || l.levantamientoMedida) m.push({ ...emptyLinderoMedida('levantamiento'), colindante: l.levantamientoColindante, medida: l.levantamientoMedida });
          if (l.escrituraColindante || l.escrituraMedida) m.push({ ...emptyLinderoMedida('escritura'), colindante: l.escrituraColindante, medida: l.escrituraMedida });
          if (l.planoColindante || l.planoMedida) m.push({ ...emptyLinderoMedida('plano'), colindante: l.planoColindante, medida: l.planoMedida });
          return { ...l, medidas: m.length ? m : [emptyLinderoMedida('levantamiento')] };
        });
        return { ...t, areas, linderos };
      });
      return { ...a, descripcionGeneralTerrenos: dgt, terrenos };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [avaluo.id]);

  const dgt = avaluo.descripcionGeneralTerrenos ?? { direccion: '', coordenadas: '', personaEntrevistada: '' };
  const patchDgt = (patch: Partial<typeof dgt>) =>
    patchAvaluo(avaluo.id, (a) => ({ ...a, descripcionGeneralTerrenos: { ...dgt, ...patch } }));

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

  // -------- helpers para AREAS --------
  const patchArea = (terrenoId: string, areaId: string, patch: Partial<AreaItem>) => {
    patchAvaluo(avaluo.id, (a) => ({
      ...a,
      terrenos: a.terrenos.map((t) => t.id !== terrenoId ? t : {
        ...t,
        areas: t.areas.map((ar) => ar.id === areaId ? { ...ar, ...patch } : ar),
      }),
    }));
  };

  const addArea = (terrenoId: string) => {
    patchAvaluo(avaluo.id, (a) => ({
      ...a,
      terrenos: a.terrenos.map((t) => t.id !== terrenoId ? t : {
        ...t, areas: [...t.areas, emptyAreaItem('escritura')],
      }),
    }));
  };

  const removeArea = (terrenoId: string, areaId: string) => {
    patchAvaluo(avaluo.id, (a) => ({
      ...a,
      terrenos: a.terrenos.map((t) => t.id !== terrenoId ? t : {
        ...t, areas: t.areas.filter((ar) => ar.id !== areaId),
      }),
    }));
  };

  const setHomologacion = (terrenoId: string, areaId: string) => {
    patchAvaluo(avaluo.id, (a) => ({
      ...a,
      terrenos: a.terrenos.map((t) => t.id !== terrenoId ? t : {
        ...t,
        areas: t.areas.map((ar) => ({ ...ar, usarHomologacion: ar.id === areaId })),
      }),
    }));
  };

  // -------- cálculos de diferencia / tolerancia --------
  const areaM2 = (ar: AreaItem) => convertArea(ar.valor1, ar.unidad1, 'm²') || convertArea(ar.valor2, ar.unidad2, 'm²');

  const renderToleranciaRow = (lev: AreaItem | undefined, ar: AreaItem) => {
    if (!lev || lev.id === ar.id) return null;
    const lm2 = areaM2(lev);
    const am2 = areaM2(ar);
    if (!lm2 || !am2) return null;
    const diff = am2 - lm2;
    const diffPct = Math.abs(diff) / lm2;
    const { pct, rango } = toleranciaArea(lm2);
    const dentro = diffPct <= pct;
    const txt = dentro
      ? `LA DIFERENCIA SE ENCUENTRA DENTRO DEL RANGO DE TOLERANCIA DEL ${(pct * 100).toFixed(1)}% PARA INMUEBLES URBANOS CON ÁREA ${rango}.`
      : `LA DIFERENCIA SE ENCUENTRA FUERA DEL RANGO DE TOLERANCIA, POR LO QUE EXCEDE EL ${(pct * 100).toFixed(1)}% PERMITIDO PARA INMUEBLES URBANOS CON ÁREA ${rango}.`;
    return (
      <div className={`text-[11px] px-3 py-1.5 rounded border ${dentro ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
        <span className="font-semibold mr-2">
          Δ vs {labelOrigen(lev)}: {fmtNum(diff, 2)} m² ({(diffPct * 100).toFixed(2)}%)
        </span>
        — {txt}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <header>
        <div className="text-xs uppercase tracking-widest text-primary">Capítulo IV · INMOVAL</div>
        <h2 className="text-xl font-semibold">Descripción del terreno</h2>
        <p className="text-sm text-muted-foreground">Descripción general, áreas comparativas con tolerancia oficial y linderos.</p>
      </header>

      {/* ----- DESCRIPCIÓN GENERAL DE LA SECCIÓN ----- */}
      <Card className="p-4 space-y-3">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Descripción general de la sección</div>
        <div className="grid md:grid-cols-3 gap-3">
          <TextField label="Dirección" value={dgt.direccion} onChange={(v) => patchDgt({ direccion: v })} />
          <TextField label="Coordenadas (lat, lng)" value={dgt.coordenadas} onChange={(v) => patchDgt({ coordenadas: v })} />
          <TextField label="Persona entrevistada (inspección)" value={dgt.personaEntrevistada} onChange={(v) => patchDgt({ personaEntrevistada: v })} />
        </div>
      </Card>

      {/* ----- CANTIDAD DE TERRENOS ----- */}
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
        {avaluo.terrenos.map((t) => {
          const areas = t.areas ?? [];
          const lev = areas.find((a) => a.usarHomologacion) ?? areas.find((a) => a.origen === 'levantamiento');
          const homArea = areas.find((a) => a.usarHomologacion);
          return (
          <AccordionItem key={t.id} value={t.id} className="border border-border rounded-md bg-card px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center justify-between w-full pr-4">
                <div className="text-left">
                  <div className="font-medium">{t.titulo}</div>
                  <div className="text-xs text-muted-foreground">
                    {homArea
                      ? `Homologación: ${labelOrigen(homArea)} · ${fmtNum(homArea.valor1)} ${homArea.unidad1} · ${fmtNum(homArea.valor2)} ${homArea.unidad2}`
                      : 'Sin área de homologación seleccionada'}
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); removeTerreno(t.id); }} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4 space-y-5">
              {/* Datos del terreno */}
              <div className="grid md:grid-cols-3 gap-4">
                <TextField label="Título del terreno" value={t.titulo} onChange={(v) => updateTerreno(t.id, { titulo: v })} />
                <TextField label="Uso / Tipo" value={t.usoTipo} onChange={(v) => updateTerreno(t.id, { usoTipo: v })} />
                <TextField label="Estado de ocupación" value={t.estadoOcupacion} onChange={(v) => updateTerreno(t.id, { estadoOcupacion: v })} />
              </div>

              {/* TABLA COMPARATIVA DE ÁREAS */}
              <Card className="p-3 bg-muted/20">
                <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Tabla comparativa de áreas</div>
                  <div className="flex items-center gap-2">
                    {(avaluo.documentoLegal?.documentos ?? []).filter((d) => d.areaM2 || d.areaVr2).length > 0 && (
                      <Select value="" onValueChange={(docId) => {
                        const doc = avaluo.documentoLegal.documentos.find((d) => d.id === docId);
                        if (!doc) return;
                        const origenMap: Record<string, AreaItem['origen']> = {
                          escritura: 'escritura', contrato: 'contrato',
                          plano_topografico: 'plano', razon_inscripcion: 'escritura',
                          personalizado: 'personalizado',
                        };
                        const nueva: AreaItem = {
                          ...emptyAreaItem(origenMap[doc.tipo] ?? 'personalizado'),
                          origenLabel: doc.tipo === 'personalizado' ? (doc.titulo || 'DOCUMENTO LEGAL') : '',
                          valor1: doc.areaM2 || 0,
                          valor2: doc.areaVr2 || (doc.areaM2 ? +convertArea(doc.areaM2, 'm²', 'vr²').toFixed(4) : 0),
                          observaciones: `Importado de: ${doc.titulo || doc.nombre || doc.tipo}`,
                        };
                        patchAvaluo(avaluo.id, (a) => ({
                          ...a,
                          terrenos: a.terrenos.map((tr) => tr.id !== t.id ? tr : { ...tr, areas: [...tr.areas, nueva] }),
                        }));
                      }}>
                        <SelectTrigger className="h-8 text-xs w-auto min-w-[14rem]">
                          <SelectValue placeholder="Importar de doc. legal…" />
                        </SelectTrigger>
                        <SelectContent>
                          {avaluo.documentoLegal.documentos
                            .filter((d) => d.areaM2 || d.areaVr2)
                            .map((d) => (
                              <SelectItem key={d.id} value={d.id}>
                                {(d.titulo || d.nombre || d.tipo).toUpperCase()} — {fmtNum(d.areaM2)} m²
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    )}
                    <Button size="sm" variant="outline" onClick={() => addArea(t.id)}>
                      <Plus className="h-3 w-3 mr-1" />Añadir área
                    </Button>
                  </div>
                </div>
...
                <div className="mt-3">
                  <TextField label="Ubicación exacta" value={t.ubicacionExacta} onChange={(v) => updateTerreno(t.id, { ubicacionExacta: v })} />
                </div>
                <div className="mt-2">
                  <TextArea label="Observaciones de área" value={t.observacionesArea} onChange={(v) => updateTerreno(t.id, { observacionesArea: v })} rows={2} />
                </div>
              </Card>

              {/* Morfología */}
              <div className="grid md:grid-cols-3 gap-3">
                <StringSelectWithCustom label="Topografía" value={t.topografia} onChange={(v) => updateTerreno(t.id, { topografia: v })} options={TOPOGRAFIA_OPTS} />
                <StringSelectWithCustom label="Forma" value={t.forma} onChange={(v) => updateTerreno(t.id, { forma: v })} options={FORMAS_TERRENO} />
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
          );
        })}
      </Accordion>
    </div>
  );
}

// silence unused
void M2_PER_UNIT;
