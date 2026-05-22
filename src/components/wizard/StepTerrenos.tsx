import { useStore } from '@/store/avaluoStore';
import { Avaluo, emptyTerreno, emptyAreaItem, emptyLinderoMedida, Terreno, Lindero, AreaItem, LinderoMedida, LinderoFuente } from '@/store/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { TextField, TextArea } from '@/components/forms/Fields';
import { StringSelectWithCustom, MultiSelectWithCustom } from '@/components/forms/CatSelect';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { fmtNum } from '@/lib/calculations';
import {
  FORMAS_TERRENO, UNIDADES_AREA,
  convertArea, toleranciaArea, M2_PER_UNIT,
  CAT_TOPOGRAFIA, CAT_FORMA_TERRENO, CAT_PANORAMICAS,
  CAT_USO_LOTE, CAT_ESTADO_OCUPACION_LOTE,
} from '@/lib/catalogos';
import { useEffect } from 'react';

const TOPOGRAFIA_OPTS = ['PLANA', 'IRREGULAR', 'QUEBRADA'];
const FORMA_OPTS = ['REGULAR', 'IRREGULAR', 'TRAPEZOIDAL', 'RECTANGULAR', 'TRIANGULAR'];

const labelArea = (a: AreaItem, docs: { id: string; titulo?: string; nombre?: string; tipo?: string }[]) => {
  if (a.origen === 'doc_legal' && a.docLegalId) {
    const d = docs.find((x) => x.id === a.docLegalId);
    return (d?.titulo || d?.nombre || d?.tipo || 'DOC. LEGAL').toUpperCase();
  }
  if (a.origen === 'nueva' || a.origen === 'personalizado') return (a.origenLabel || 'NUEVA ÁREA').toUpperCase();
  return (a.origenLabel || a.origen).toUpperCase();
};


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

  // -------- helpers LINDERO MEDIDAS --------
  const patchLinderoMedida = (terrenoId: string, lIdx: number, mId: string, patch: Partial<LinderoMedida>) => {
    patchAvaluo(avaluo.id, (a) => ({
      ...a, terrenos: a.terrenos.map((t) => t.id !== terrenoId ? t : {
        ...t, linderos: t.linderos.map((l, i) => i !== lIdx ? l : {
          ...l, medidas: l.medidas.map((m) => m.id === mId ? { ...m, ...patch } : m),
        }),
      }),
    }));
  };
  const addLinderoMedida = (terrenoId: string, lIdx: number) => {
    patchAvaluo(avaluo.id, (a) => ({
      ...a, terrenos: a.terrenos.map((t) => t.id !== terrenoId ? t : {
        ...t, linderos: t.linderos.map((l, i) => i !== lIdx ? l : {
          ...l, medidas: [...l.medidas, emptyLinderoMedida('escritura')],
        }),
      }),
    }));
  };
  const removeLinderoMedida = (terrenoId: string, lIdx: number, mId: string) => {
    patchAvaluo(avaluo.id, (a) => ({
      ...a, terrenos: a.terrenos.map((t) => t.id !== terrenoId ? t : {
        ...t, linderos: t.linderos.map((l, i) => i !== lIdx ? l : {
          ...l, medidas: l.medidas.filter((m) => m.id !== mId),
        }),
      }),
    }));
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
        ...t, areas: [...t.areas, emptyAreaItem('nueva')],
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
  const areaM2 = (ar: AreaItem): number => {
    if (ar.origen === 'doc_legal' && ar.docLegalId) {
      const d = docs.find((x) => x.id === ar.docLegalId);
      if (d) {
        if (d.areaM2) return d.areaM2;
        if (d.areaVr2) return convertArea(d.areaVr2, 'vr²', 'm²');
      }
    }
    return convertArea(ar.valor1, ar.unidad1, 'm²') || convertArea(ar.valor2, ar.unidad2, 'm²');
  };

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
          Δ vs {labelArea(lev, avaluo.documentoLegal?.documentos ?? [])}: {fmtNum(diff, 2)} m² ({(diffPct * 100).toFixed(2)}%)
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
                      ? `Homologación: ${labelArea(homArea, avaluo.documentoLegal?.documentos ?? [])} · ${fmtNum(homArea.valor1)} ${homArea.unidad1} · ${fmtNum(homArea.valor2)} ${homArea.unidad2}`
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
              <div>
                <TextField label="Título del terreno" value={t.titulo} onChange={(v) => updateTerreno(t.id, { titulo: v })} />
              </div>

              {/* TABLA COMPARATIVA DE ÁREAS */}
              {(() => {
                const docs = (avaluo.documentoLegal?.documentos ?? []).filter((d) => d.areaM2 || d.areaVr2);
                return (
              <Card className="p-3 bg-muted/20">
                <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Tabla comparativa de áreas</div>
                  <Button size="sm" variant="outline" onClick={() => addArea(t.id)}>
                    <Plus className="h-3 w-3 mr-1" />Añadir área
                  </Button>
                </div>

                {/* Encabezado de columnas */}
                <div className="grid grid-cols-12 gap-2 text-[10px] uppercase tracking-wider text-muted-foreground px-1 mb-1">
                  <div className="col-span-3">Origen</div>
                  <div className="col-span-2">Valor 1</div>
                  <div className="col-span-2">Unidad 1</div>
                  <div className="col-span-2">Valor 2 (conv.)</div>
                  <div className="col-span-2">Unidad 2</div>
                  <div className="col-span-1 text-center">Hom.</div>
                </div>

                <div className="space-y-3">
                  {areas.map((ar) => {
                    const isDoc = ar.origen === 'doc_legal';
                    const linkedDoc = isDoc && ar.docLegalId ? docs.find((d) => d.id === ar.docLegalId) : undefined;

                    // Si está vinculado a un documento, los valores y unidades se derivan en vivo del doc.
                    const displayU1 = isDoc ? 'm²' : ar.unidad1;
                    const displayU2 = isDoc ? 'vr²' : ar.unidad2;
                    const displayV1 = isDoc
                      ? (linkedDoc?.areaM2 || (linkedDoc?.areaVr2 ? +convertArea(linkedDoc.areaVr2, 'vr²', 'm²').toFixed(4) : 0))
                      : ar.valor1;
                    const displayV2 = isDoc
                      ? (linkedDoc?.areaVr2 || (linkedDoc?.areaM2 ? +convertArea(linkedDoc.areaM2, 'm²', 'vr²').toFixed(4) : 0))
                      : ar.valor2;

                    const isNueva = ar.origen === 'nueva' || ar.origen === 'personalizado';
                    const selectValue = isDoc && ar.docLegalId ? ar.docLegalId : (isNueva ? '__nueva__' : '__nueva__');
                    return (
                    <div key={ar.id} className="border border-border rounded p-2 bg-background space-y-2">
                      <div className="grid grid-cols-12 gap-2 items-center">
                        {/* Origen */}
                        <div className="col-span-3 space-y-1">
                          <Select
                            value={selectValue}
                            onValueChange={(v) => {
                              if (v === '__nueva__') {
                                patchArea(t.id, ar.id, { origen: 'nueva', docLegalId: undefined, origenLabel: ar.origenLabel || '' });
                              } else {
                                const doc = docs.find((d) => d.id === v);
                                if (!doc) return;
                                const m2 = doc.areaM2 || (doc.areaVr2 ? +convertArea(doc.areaVr2, 'vr²', 'm²').toFixed(4) : 0);
                                const vr2 = doc.areaVr2 || (doc.areaM2 ? +convertArea(doc.areaM2, 'm²', 'vr²').toFixed(4) : 0);
                                patchArea(t.id, ar.id, {
                                  origen: 'doc_legal',
                                  docLegalId: doc.id,
                                  origenLabel: '',
                                  unidad1: 'm²', valor1: m2,
                                  unidad2: 'vr²', valor2: vr2,
                                });
                              }
                            }}
                          >
                            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Origen…" /></SelectTrigger>
                            <SelectContent>
                              {docs.length > 0 && (
                                <>
                                  <div className="px-2 py-1 text-[10px] uppercase text-muted-foreground">Documentos del Cap. II</div>
                                  {docs.map((d) => (
                                    <SelectItem key={d.id} value={d.id}>
                                      {(d.titulo || d.nombre || d.tipo).toUpperCase()}
                                    </SelectItem>
                                  ))}
                                </>
                              )}
                              <SelectItem value="__nueva__">✎ Nueva área (manual)</SelectItem>
                            </SelectContent>
                          </Select>
                          {isNueva && (
                            <Input className="h-7 text-xs" placeholder="Nombre del área"
                              value={ar.origenLabel || ''}
                              onChange={(e) => patchArea(t.id, ar.id, { origenLabel: e.target.value })} />
                          )}
                          {isDoc && (
                            <div className="text-[10px] text-muted-foreground px-1">Vinculado a Cap. II — automático</div>
                          )}
                        </div>

                        {/* Valor 1 */}
                        <div className="col-span-2">
                          <Input type="number" className="h-8 text-xs" value={displayV1 || ''}
                            disabled={isDoc}
                            onChange={(e) => {
                              const v1 = Number(e.target.value) || 0;
                              const v2 = +convertArea(v1, ar.unidad1, ar.unidad2).toFixed(4);
                              patchArea(t.id, ar.id, { valor1: v1, valor2: v2 });
                            }} />
                        </div>
                        {/* Unidad 1 */}
                        <div className="col-span-2">
                          <Select value={displayU1} disabled={isDoc}
                            onValueChange={(u1) => {
                              const v2 = +convertArea(ar.valor1, u1, ar.unidad2).toFixed(4);
                              patchArea(t.id, ar.id, { unidad1: u1, valor2: v2 });
                            }}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {UNIDADES_AREA.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        {/* Valor 2 */}
                        <div className="col-span-2">
                          <Input type="number" className="h-8 text-xs" value={displayV2 || ''}
                            disabled={isDoc}
                            onChange={(e) => {
                              const v2 = Number(e.target.value) || 0;
                              const v1 = +convertArea(v2, ar.unidad2, ar.unidad1).toFixed(4);
                              patchArea(t.id, ar.id, { valor2: v2, valor1: v1 });
                            }} />
                        </div>
                        {/* Unidad 2 */}
                        <div className="col-span-2">
                          <Select value={displayU2} disabled={isDoc}
                            onValueChange={(u2) => {
                              const v2 = +convertArea(ar.valor1, ar.unidad1, u2).toFixed(4);
                              patchArea(t.id, ar.id, { unidad2: u2, valor2: v2 });
                            }}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {UNIDADES_AREA.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        {/* Homologación + eliminar */}
                        <div className="col-span-1 flex items-center justify-center gap-1">
                          <Checkbox checked={ar.usarHomologacion}
                            onCheckedChange={() => setHomologacion(t.id, ar.id)}
                            title="Usar para homologación y reposición" />
                          <button onClick={() => removeArea(t.id, ar.id)} className="text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>


                      {/* Conversión informativa */}
                      <div className="text-[11px] text-muted-foreground px-1">
                        {fmtNum(ar.valor1, 4)} {ar.unidad1} = {fmtNum(convertArea(ar.valor1, ar.unidad1, 'm²'), 4)} m² · {fmtNum(convertArea(ar.valor1, ar.unidad1, 'vr²'), 4)} vr²
                        {ar.usarHomologacion && <span className="ml-2 font-semibold text-primary">★ HOMOLOGACIÓN / REPOSICIÓN</span>}
                      </div>

                      {/* Comparativo vs base de homologación */}
                      {renderToleranciaRow(lev, ar)}

                      <Input className="h-7 text-xs" placeholder="Observaciones (opcional)"
                        value={ar.observaciones || ''}
                        onChange={(e) => patchArea(t.id, ar.id, { observaciones: e.target.value })} />
                    </div>
                    );
                  })}
                </div>

                <div className="mt-3">
                  <TextField label="Ubicación exacta" value={t.ubicacionExacta} onChange={(v) => updateTerreno(t.id, { ubicacionExacta: v })} />
                </div>
                <div className="mt-2">
                  <TextArea label="Observaciones generales de áreas" value={t.observacionesArea} onChange={(v) => updateTerreno(t.id, { observacionesArea: v })} rows={2} />
                </div>
              </Card>
                );
              })()}


              {/* Morfología — sin obras complementarias */}
              <div className="grid md:grid-cols-2 gap-3">
                <StringSelectWithCustom label="Topografía" value={t.topografia} onChange={(v) => updateTerreno(t.id, { topografia: v })} options={TOPOGRAFIA_OPTS} />
                <StringSelectWithCustom label="Forma" value={t.forma} onChange={(v) => updateTerreno(t.id, { forma: v })} options={FORMA_OPTS} />
              </div>

              {/* Linderos con medidas múltiples por fuente */}
              <Card className="p-3 bg-muted/20">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Linderos (Norte / Sur / Este / Oeste)</div>
                <div className="space-y-3">
                  {t.linderos.map((l, idx) => (
                    <div key={l.orientacion} className="border border-border rounded p-3 bg-background space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-semibold">{l.orientacion}</div>
                        <Button size="sm" variant="outline" onClick={() => addLinderoMedida(t.id, idx)}>
                          <Plus className="h-3 w-3 mr-1" />Añadir medida
                        </Button>
                      </div>
                      <div className="grid grid-cols-12 gap-2 text-[10px] uppercase tracking-wider text-muted-foreground px-1">
                        <div className="col-span-3">Fuente</div>
                        <div className="col-span-5">Colindante</div>
                        <div className="col-span-3">Medida (m)</div>
                        <div className="col-span-1"></div>
                      </div>
                      <div className="space-y-1.5">
                        {(l.medidas ?? []).map((m) => (
                          <div key={m.id} className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-3 space-y-1">
                              <Select value={m.fuente} onValueChange={(v) => patchLinderoMedida(t.id, idx, m.id, { fuente: v as LinderoFuente })}>
                                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="levantamiento">LEVANTAMIENTO</SelectItem>
                                  <SelectItem value="escritura">ESCRITURA</SelectItem>
                                  <SelectItem value="plano">PLANO</SelectItem>
                                  <SelectItem value="personalizado">PERSONALIZADO</SelectItem>
                                </SelectContent>
                              </Select>
                              {m.fuente === 'personalizado' && (
                                <Input className="h-7 text-xs" placeholder="Etiqueta" value={m.fuenteLabel || ''}
                                  onChange={(e) => patchLinderoMedida(t.id, idx, m.id, { fuenteLabel: e.target.value })} />
                              )}
                            </div>
                            <div className="col-span-5">
                              <Input className="h-8 text-xs" placeholder="Colindante" value={m.colindante}
                                onChange={(e) => patchLinderoMedida(t.id, idx, m.id, { colindante: e.target.value })} />
                            </div>
                            <div className="col-span-3">
                              <Input type="number" className="h-8 text-xs" value={m.medida || ''}
                                onChange={(e) => patchLinderoMedida(t.id, idx, m.id, { medida: Number(e.target.value) || 0 })} />
                            </div>
                            <div className="col-span-1 flex justify-center">
                              <button onClick={() => removeLinderoMedida(t.id, idx, m.id)} className="text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Input placeholder="Delimitante físico (muro, cerco, calle...)" value={l.delimitanteFisico}
                        onChange={(e) => updateLindero(t.id, idx, { delimitanteFisico: e.target.value })} className="h-8 text-xs" />
                    </div>
                  ))}
                </div>
              </Card>

              {/* Características panorámicas (multi-check con personalizables) */}
              <MultiSelectWithCustom
                label="Características panorámicas"
                values={(t.caracteristicasPanoramicas || '').split('|').filter(Boolean)}
                onChange={(v) => updateTerreno(t.id, { caracteristicasPanoramicas: v.join('|') })}
                options={CAT_PANORAMICAS}
                placeholder="Añadir característica personalizada y presionar Enter"
              />

              {/* Notas */}
              <div className="grid md:grid-cols-2 gap-3">
                <TextArea label="Servidumbres" value={t.servidumbres} onChange={(v) => updateTerreno(t.id, { servidumbres: v })} rows={2} />
                <TextArea label="Consideraciones adicionales" value={t.consideracionesAdicionales} onChange={(v) => updateTerreno(t.id, { consideracionesAdicionales: v })} rows={2} />
              </div>

              {/* USO ACTUAL / ESTADO DE OCUPACIÓN / OBRAS COMPLEMENTARIAS (al final) */}
              <Card className="p-3 bg-muted/20 space-y-3">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Uso actual y estado de ocupación</div>
                <div className="grid md:grid-cols-2 gap-3">
                  <StringSelectWithCustom label="Tipo de uso" value={t.usoTipo}
                    onChange={(v) => updateTerreno(t.id, { usoTipo: v })} options={CAT_USO_LOTE} />
                  <StringSelectWithCustom label="Estado de ocupación" value={t.estadoOcupacion}
                    onChange={(v) => updateTerreno(t.id, { estadoOcupacion: v })} options={CAT_ESTADO_OCUPACION_LOTE} />
                </div>
                <div className="border border-border rounded p-3 bg-background space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">¿Tiene obras complementarias?</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{t.tieneObrasComplementarias ? 'Sí' : 'No'}</span>
                      <Switch checked={!!t.tieneObrasComplementarias}
                        onCheckedChange={(v) => updateTerreno(t.id, { tieneObrasComplementarias: v })} />
                    </div>
                  </div>
                  {t.tieneObrasComplementarias && (
                    <>
                      <TextArea
                        label="Obras complementarias (referencia)"
                        value={t.obrasComplementarias}
                        onChange={(v) => updateTerreno(t.id, { obrasComplementarias: v })}
                        rows={2}
                      />
                      <p className="text-[11px] text-muted-foreground">
                        El detalle constructivo de estas obras se describe en el <strong>Capítulo V — Descripción de Infraestructuras</strong>.
                      </p>
                    </>
                  )}
                </div>
              </Card>
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
