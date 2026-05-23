import { useMemo, useState, useEffect } from 'react';
import { useStore } from '@/store/avaluoStore';
import {
  Avaluo, ComparableInmueble, ComparableTerreno, FichaSujetoInmueble, FichaSujetoTerreno,
  emptyComparableInmueble, emptyComparableTerreno, DeduccionesRealizacion, Infraestructura,
  MemoriaTerreno, AplicarMemorias, emptyMemoriaTerreno,
} from '@/store/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { TextField, NumberField, TextArea, Field } from '@/components/forms/Fields';
import { KeySelect } from '@/components/forms/CatSelect';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  TABLA_UBICACION, TABLA_ZONA, TABLA_VIA, TABLA_SERVICIOS,
  TABLA_EQUIPAMIENTO, TABLA_TOPOGRAFIA, TABLA_POSICION,
  ROSS_HEIDECKE, factorQ, FACTOR_CONVERSION_M2_VR2,
} from '@/lib/catalogos';
import {
  consolidados, homologacionInmueble, homologacionTerreno,
  totalDeducciones, valorRealizacion, deduccionesDetalle,
  memoriaReposicion, rossHeidecke, depAjustado,
  fmtMoney, fmtNum, fmtPct, valorNetoInfra,
} from '@/lib/calculations';
import { Plus, Trash2 } from 'lucide-react';

// Toggle visual reutilizable para cada memoria
function ApplyToggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-md border border-border bg-muted/20 mb-3">
      <div className="text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-xs text-muted-foreground ml-2">
          {checked ? 'Esta memoria se aplica a este terreno.' : 'Esta memoria NO se aplicará a este terreno.'}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Aplicar</span>
        <Switch checked={checked} onCheckedChange={onChange} />
      </div>
    </div>
  );
}

export function StepMetodologias({ avaluo }: { avaluo: Avaluo }) {
  const { patchAvaluo } = useStore();

  // ---- Selección de terreno ----
  const terrenos = avaluo.terrenos ?? [];
  const [currentTerrenoId, setCurrentTerrenoId] = useState<string>(terrenos[0]?.id ?? '');
  useEffect(() => {
    if (!terrenos.find((t) => t.id === currentTerrenoId)) {
      setCurrentTerrenoId(terrenos[0]?.id ?? '');
    }
  }, [terrenos, currentTerrenoId]);
  const currentTerreno = terrenos.find((t) => t.id === currentTerrenoId);

  // ---- Resolver MemoriaTerreno actual (con hidratación desde avaluo.metodologias legado) ----
  const mt: MemoriaTerreno = useMemo(() => {
    const stored = avaluo.metodologiasPorTerreno?.[currentTerrenoId];
    if (stored) return stored;
    // Hidratar primer terreno desde la metodología legada para no perder datos
    const legacy = avaluo.metodologias;
    const isFirst = terrenos[0]?.id === currentTerrenoId;
    const base = emptyMemoriaTerreno();
    if (isFirst && legacy) {
      return {
        ...base,
        sujetoInmueble: legacy.sujetoInmueble ?? base.sujetoInmueble,
        sujetoTerreno: legacy.sujetoTerreno ?? base.sujetoTerreno,
        comparablesInmueble: legacy.comparablesInmueble ?? [],
        comparablesTerreno: legacy.comparablesTerreno ?? [],
        deducciones: legacy.deducciones ?? base.deducciones,
        enfoqueConclusion: legacy.enfoqueConclusion ?? 'mercado',
        notasMercadoInmueble: legacy.notasMercadoInmueble ?? '',
        notasMercadoTerreno: legacy.notasMercadoTerreno ?? '',
      };
    }
    return base;
  }, [avaluo.metodologiasPorTerreno, avaluo.metodologias, currentTerrenoId, terrenos]);

  const setMT = (patch: Partial<MemoriaTerreno>) =>
    patchAvaluo(avaluo.id, (a) => ({
      ...a,
      metodologiasPorTerreno: {
        ...(a.metodologiasPorTerreno ?? {}),
        [currentTerrenoId]: { ...mt, ...patch },
      },
      // Mantener compat con preview legado: si es el primer terreno, espejar a metodologias
      ...(terrenos[0]?.id === currentTerrenoId
        ? { metodologias: { ...a.metodologias, ...patch } as any }
        : {}),
    }));

  const setAplicar = (p: Partial<AplicarMemorias>) => setMT({ aplicar: { ...mt.aplicar, ...p } });
  const setSujetoT = (p: Partial<FichaSujetoTerreno>) => setMT({ sujetoTerreno: { ...mt.sujetoTerreno, ...p } });
  const setSujetoI = (p: Partial<FichaSujetoInmueble>) => setMT({ sujetoInmueble: { ...mt.sujetoInmueble, ...p } });
  const setDed = (p: Partial<DeduccionesRealizacion>) => setMT({ deducciones: { ...mt.deducciones, ...p } });

  const updateInfra = (terrenoId: string, infraId: string, patch: Partial<Infraestructura>) =>
    patchAvaluo(avaluo.id, (a) => ({
      ...a,
      terrenos: a.terrenos.map((t) => t.id !== terrenoId ? t : ({
        ...t,
        infraestructuras: t.infraestructuras.map((i) => i.id === infraId ? { ...i, ...patch } : i),
      })),
    }));

  const cons = consolidados(avaluo);
  const homT = homologacionTerreno(mt.sujetoTerreno, mt.comparablesTerreno);
  const homI = homologacionInmueble(mt.sujetoInmueble, mt.comparablesInmueble);
  const valorMercado = (homT.valorMercadoTerreno || 0) + (homI.valorMercado || 0);
  const valorReal = valorRealizacion(valorMercado || cons.totalReposicionNeto, mt.deducciones);

  // Infraestructuras SOLO del terreno actual
  const infrasAll = (currentTerreno?.infraestructuras ?? []).map((i) => ({
    terrenoId: currentTerreno!.id, terrenoTitulo: currentTerreno!.titulo, infra: i,
  }));
  const infrasPrincipales  = infrasAll.filter((x) => x.infra.tipo === 'principal');
  const infrasComplement   = infrasAll.filter((x) => x.infra.tipo === 'complementaria');
  const infrasExteriores   = infrasAll.filter((x) => x.infra.tipo === 'obra_exterior');

  const ap = mt.aplicar;

  if (terrenos.length === 0) {
    return (
      <Card className="p-6 text-center text-sm text-muted-foreground">
        Agregue al menos un terreno en Capítulo III para construir las memorias de cálculo.
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <header>
        <div className="text-xs uppercase tracking-widest text-primary">Capítulo VI · INMOVAL</div>
        <h2 className="text-xl font-semibold">Memorias de cálculo</h2>
        <p className="text-sm text-muted-foreground">Un juego de memorias (1–7) por cada terreno. Active solo las que apliquen.</p>
      </header>

      {/* Selector de terreno */}
      <Card className="p-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Terreno</div>
          <div className="flex flex-wrap gap-2">
            {terrenos.map((t) => (
              <Button key={t.id} size="sm"
                variant={t.id === currentTerrenoId ? 'default' : 'outline'}
                onClick={() => setCurrentTerrenoId(t.id)}>
                {t.titulo || 'Terreno'}
              </Button>
            ))}
          </div>
          <div className="ml-auto text-xs text-muted-foreground">
            Memorias activas:{' '}
            <span className="mono">
              {[
                ap.mercadoInmueble && '1',
                ap.realizacion && '2',
                ap.mercadoTerreno && '3',
                ap.reposicion && '4',
                ap.ross && '5',
                ap.consolidado && '6',
                ap.conclusion && '7',
              ].filter(Boolean).join(' · ') || 'ninguna'}
            </span>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="inmueble">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="inmueble">1 · Mercado construido {ap.mercadoInmueble ? '' : '○'}</TabsTrigger>
          <TabsTrigger value="realizacion">2 · Realización {ap.realizacion ? '' : '○'}</TabsTrigger>
          <TabsTrigger value="terreno">3 · Mercado terreno {ap.mercadoTerreno ? '' : '○'}</TabsTrigger>
          <TabsTrigger value="reposicion">4 · Reposición {ap.reposicion ? '' : '○'}</TabsTrigger>
          <TabsTrigger value="ross">5 · Ross-Heidecke {ap.ross ? '' : '○'}</TabsTrigger>
          <TabsTrigger value="consolidado">6 · Consolidado {ap.consolidado ? '' : '○'}</TabsTrigger>
          <TabsTrigger value="conclusion">7 · Conclusión {ap.conclusion ? '' : '○'}</TabsTrigger>
        </TabsList>


        {/* 1. MERCADO INMUEBLE CONSTRUIDO */}
        <TabsContent value="inmueble" className="mt-4 space-y-4">
          <ApplyToggle label="1 · Mercado del inmueble construido"
            checked={ap.mercadoInmueble} onChange={(v) => setAplicar({ mercadoInmueble: v })} />
          {!ap.mercadoInmueble && <div className="text-xs text-muted-foreground p-3 bg-muted/20 rounded">Memoria desactivada — los campos siguen disponibles pero esta memoria no formará parte del avalúo de este terreno.</div>}

          <Card className="p-4">
            <div className="font-semibold mb-3">Ficha sujeto · Inmueble construido</div>
            <div className="grid md:grid-cols-3 gap-3">
              <TextField label="Dirección" value={mt.sujetoInmueble.direccion} onChange={(v) => setSujetoI({ direccion: v })} />
              <NumberField label="Área construcción (m²)" value={mt.sujetoInmueble.areaConstruccionM2} onChange={(v) => setSujetoI({ areaConstruccionM2: v })} />
              <NumberField label="Área terreno (m²)" value={mt.sujetoInmueble.areaTerrenoM2} onChange={(v) => setSujetoI({ areaTerrenoM2: v })} />
              <KeySelect label="Ubicación" tabla={TABLA_UBICACION} value={mt.sujetoInmueble.ubicacionKey} onChange={(v) => setSujetoI({ ubicacionKey: v })} />
              <KeySelect label="Zona" tabla={TABLA_ZONA} value={mt.sujetoInmueble.zonaKey} onChange={(v) => setSujetoI({ zonaKey: v })} />
              <KeySelect label="Vía de acceso" tabla={TABLA_VIA} value={mt.sujetoInmueble.viaAccesoKey} onChange={(v) => setSujetoI({ viaAccesoKey: v })} />
              <NumberField label="Dormitorios" value={mt.sujetoInmueble.dormitorios} onChange={(v) => setSujetoI({ dormitorios: v })} />
              <NumberField label="Baños completos" value={mt.sujetoInmueble.banosCompletos} onChange={(v) => setSujetoI({ banosCompletos: v })} />
              <NumberField label="Baño medio" value={mt.sujetoInmueble.banoMedio} onChange={(v) => setSujetoI({ banoMedio: v })} />
              <NumberField label="Cuarto/baño servicio" value={mt.sujetoInmueble.cuartoBanoServicio} onChange={(v) => setSujetoI({ cuartoBanoServicio: v })} />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">Comparables de inmueble construido ({mt.comparablesInmueble.length})</div>
              <Button size="sm" onClick={() => setMT({ comparablesInmueble: [...mt.comparablesInmueble, emptyComparableInmueble()] })}>
                <Plus className="h-4 w-4 mr-1" />Comparable
              </Button>
            </div>
            <div className="space-y-3">
              {mt.comparablesInmueble.map((c, idx) => (
                <CompInmuebleRow key={c.id} comp={c} idx={idx}
                  onChange={(p) => setMT({ comparablesInmueble: mt.comparablesInmueble.map((x) => x.id === c.id ? { ...x, ...p } : x) })}
                  onRemove={() => setMT({ comparablesInmueble: mt.comparablesInmueble.filter((x) => x.id !== c.id) })} />
              ))}
              {mt.comparablesInmueble.length === 0 && <div className="text-xs text-muted-foreground text-center py-4">Sin comparables</div>}
            </div>

            {homI.filas.length > 0 && (
              <div className="mt-4 border-t border-border pt-3">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Tabla de homologación</div>
                <table className="w-full text-xs">
                  <thead className="text-muted-foreground"><tr>
                    <th className="text-left">Comp.</th><th className="text-right">$/m² const.</th>
                    <th className="text-right">F.AC</th><th className="text-right">F.AT</th><th className="text-right">F.Ub</th>
                    <th className="text-right">F.Zona</th><th className="text-right">F.Vía</th><th className="text-right">F.Dorm</th>
                    <th className="text-right">F.Baños</th><th className="text-right">F.Total</th><th className="text-right">$/m² hom.</th>
                  </tr></thead>
                  <tbody>
                    {homI.filas.map((f, i) => (
                      <tr key={i} className="border-t border-border">
                        <td>C{i + 1}</td>
                        <td className="text-right mono">{fmtNum(f.precioM2)}</td>
                        <td className="text-right mono">{f.factores.areaConst.toFixed(3)}</td>
                        <td className="text-right mono">{f.factores.areaTerreno.toFixed(3)}</td>
                        <td className="text-right mono">{f.factores.ubicacion.toFixed(3)}</td>
                        <td className="text-right mono">{f.factores.zona.toFixed(3)}</td>
                        <td className="text-right mono">{f.factores.via.toFixed(3)}</td>
                        <td className="text-right mono">{f.factores.dormitorios.toFixed(3)}</td>
                        <td className="text-right mono">{f.factores.banos.toFixed(3)}</td>
                        <td className="text-right mono font-semibold">{f.factores.total.toFixed(3)}</td>
                        <td className="text-right mono font-semibold">{fmtNum(f.valorM2Homologado)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                  <div className="p-2 rounded bg-muted/30"><div className="text-xs text-muted-foreground">Prom. negociación</div><div className="mono">{homI.promNeg.toFixed(3)}</div></div>
                  <div className="p-2 rounded bg-muted/30"><div className="text-xs text-muted-foreground">$/m² promedio hom.</div><div className="mono">{fmtMoney(homI.valorM2Promedio)}</div></div>
                  <div className="p-2 rounded bg-primary/10 border border-primary/30"><div className="text-xs text-muted-foreground">Valor mercado inmueble</div><div className="mono font-bold text-primary">{fmtMoney(homI.valorMercado)}</div></div>
                </div>
              </div>
            )}
            <TextArea label="Notas del enfoque de mercado (inmueble)" value={mt.notasMercadoInmueble} onChange={(v) => setMT({ notasMercadoInmueble: v })} rows={2} />
          </Card>
        </TabsContent>

        {/* 2. REALIZACIÓN */}
        <TabsContent value="realizacion" className="mt-4">
          <ApplyToggle label="2 · Valor de realización"
            checked={ap.realizacion} onChange={(v) => setAplicar({ realizacion: v })} />

          <Card className="p-4">
            <div className="font-semibold mb-3">Deducciones del valor de realización</div>
            <div className="grid md:grid-cols-5 gap-3">
              <NumberField label="IR (%)" value={mt.deducciones.ir} onChange={(v) => setDed({ ir: v })} />
              <NumberField label="IBI (%)" value={mt.deducciones.ibi} onChange={(v) => setDed({ ibi: v })} />
              <NumberField label="Corretaje (%)" value={mt.deducciones.corretaje} onChange={(v) => setDed({ corretaje: v })} />
              <NumberField label="Legales (%)" value={mt.deducciones.legales} onChange={(v) => setDed({ legales: v })} />
              <NumberField label="Comercialización (%)" value={mt.deducciones.comercializacion} onChange={(v) => setDed({ comercializacion: v })} />
            </div>
            <div className="mt-4">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-muted-foreground border-b border-border">
                  <tr><th className="text-left py-2">Concepto</th><th className="text-right">%</th><th className="text-right">Valor</th></tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {deduccionesDetalle(valorMercado || cons.totalReposicionNeto, mt.deducciones).map((d) => (
                    <tr key={d.concepto}><td className="py-2">{d.concepto}</td><td className="text-right mono">{d.pct}%</td><td className="text-right mono">{fmtMoney(d.valor)}</td></tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                <div className="p-2 rounded bg-muted/30"><div className="text-xs text-muted-foreground">Total deducciones</div><div className="mono">{fmtPct(totalDeducciones(mt.deducciones))}</div></div>
                <div className="p-2 rounded bg-muted/30"><div className="text-xs text-muted-foreground">Base (V. mercado)</div><div className="mono">{fmtMoney(valorMercado || cons.totalReposicionNeto)}</div></div>
                <div className="p-2 rounded bg-primary/10 border border-primary/30"><div className="text-xs text-muted-foreground">Valor de realización</div><div className="mono font-bold text-primary">{fmtMoney(valorReal)}</div></div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* 3. MERCADO TERRENO */}
        <TabsContent value="terreno" className="mt-4 space-y-4">
          <ApplyToggle label="3 · Mercado del terreno"
            checked={ap.mercadoTerreno} onChange={(v) => setAplicar({ mercadoTerreno: v })} />

          <Card className="p-4">
            <div className="font-semibold mb-3">Ficha sujeto · Terreno</div>
            <div className="grid md:grid-cols-3 gap-3">
              <TextField label="Dirección" value={mt.sujetoTerreno.direccion} onChange={(v) => setSujetoT({ direccion: v })} />
              <NumberField label="Área vr²" value={mt.sujetoTerreno.areaTerrenoVr2} onChange={(v) => setSujetoT({ areaTerrenoVr2: v })} />
              <KeySelect label="Ubicación" tabla={TABLA_UBICACION} value={mt.sujetoTerreno.ubicacionKey} onChange={(v) => setSujetoT({ ubicacionKey: v })} />
              <KeySelect label="Zona" tabla={TABLA_ZONA} value={mt.sujetoTerreno.zonaKey} onChange={(v) => setSujetoT({ zonaKey: v })} />
              <KeySelect label="Vía de acceso" tabla={TABLA_VIA} value={mt.sujetoTerreno.viaAccesoKey} onChange={(v) => setSujetoT({ viaAccesoKey: v })} />
              <KeySelect label="Servicios" tabla={TABLA_SERVICIOS} value={mt.sujetoTerreno.serviciosKey} onChange={(v) => setSujetoT({ serviciosKey: v })} />
              <KeySelect label="Equipamiento" tabla={TABLA_EQUIPAMIENTO} value={mt.sujetoTerreno.equipamientoKey} onChange={(v) => setSujetoT({ equipamientoKey: v })} />
              <KeySelect label="Topografía" tabla={TABLA_TOPOGRAFIA} value={mt.sujetoTerreno.topografiaKey} onChange={(v) => setSujetoT({ topografiaKey: v })} />
              <KeySelect label="Posición en manzana" tabla={TABLA_POSICION} value={mt.sujetoTerreno.posicionManzanaKey} onChange={(v) => setSujetoT({ posicionManzanaKey: v })} />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">Comparables de terreno ({mt.comparablesTerreno.length})</div>
              <Button size="sm" onClick={() => setMT({ comparablesTerreno: [...mt.comparablesTerreno, emptyComparableTerreno()] })}>
                <Plus className="h-4 w-4 mr-1" />Comparable
              </Button>
            </div>
            <div className="space-y-3">
              {mt.comparablesTerreno.map((c, idx) => (
                <CompTerrenoRow key={c.id} comp={c} idx={idx}
                  onChange={(p) => setMT({ comparablesTerreno: mt.comparablesTerreno.map((x) => x.id === c.id ? { ...x, ...p } : x) })}
                  onRemove={() => setMT({ comparablesTerreno: mt.comparablesTerreno.filter((x) => x.id !== c.id) })} />
              ))}
              {mt.comparablesTerreno.length === 0 && <div className="text-xs text-muted-foreground text-center py-4">Sin comparables</div>}
            </div>

            {homT.filas.length > 0 && (
              <div className="mt-4 border-t border-border pt-3">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Tabla de homologación</div>
                <table className="w-full text-xs">
                  <thead className="text-muted-foreground"><tr>
                    <th className="text-left">Comp.</th><th className="text-right">$/vr²</th><th className="text-right">F.Área</th>
                    <th className="text-right">F.Ubic</th><th className="text-right">F.Zona</th><th className="text-right">F.Vía</th>
                    <th className="text-right">F.Serv</th><th className="text-right">F.Equip</th><th className="text-right">F.Topo</th>
                    <th className="text-right">F.Pos</th><th className="text-right">F.Total</th><th className="text-right">$/vr² hom.</th>
                  </tr></thead>
                  <tbody>
                    {homT.filas.map((f, i) => (
                      <tr key={i} className="border-t border-border">
                        <td>C{i + 1}</td>
                        <td className="text-right mono">{fmtNum(f.precioVr2)}</td>
                        <td className="text-right mono">{f.factores.areaTerreno.toFixed(3)}</td>
                        <td className="text-right mono">{f.factores.ubicacion.toFixed(3)}</td>
                        <td className="text-right mono">{f.factores.zona.toFixed(3)}</td>
                        <td className="text-right mono">{f.factores.via.toFixed(3)}</td>
                        <td className="text-right mono">{f.factores.servicios.toFixed(3)}</td>
                        <td className="text-right mono">{f.factores.equipamiento.toFixed(3)}</td>
                        <td className="text-right mono">{f.factores.topografia.toFixed(3)}</td>
                        <td className="text-right mono">{f.factores.posicion.toFixed(3)}</td>
                        <td className="text-right mono font-semibold">{f.factores.total.toFixed(3)}</td>
                        <td className="text-right mono font-semibold">{fmtNum(f.valorVr2Homologado)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                  <div className="p-2 rounded bg-muted/30"><div className="text-xs text-muted-foreground">Prom. negociación</div><div className="mono">{homT.promNeg.toFixed(3)}</div></div>
                  <div className="p-2 rounded bg-muted/30"><div className="text-xs text-muted-foreground">$/vr² promedio hom.</div><div className="mono">{fmtMoney(homT.valorVr2Promedio)}</div></div>
                  <div className="p-2 rounded bg-primary/10 border border-primary/30"><div className="text-xs text-muted-foreground">Valor mercado terreno</div><div className="mono font-bold text-primary">{fmtMoney(homT.valorMercadoTerreno)}</div></div>
                </div>
              </div>
            )}
            <TextArea label="Notas del enfoque de mercado (terreno)" value={mt.notasMercadoTerreno} onChange={(v) => setMT({ notasMercadoTerreno: v })} rows={2} />
          </Card>
        </TabsContent>

        {/* 4. REPOSICIÓN */}
        <TabsContent value="reposicion" className="mt-4 space-y-4">
          <ApplyToggle label="4 · Reposición (etapas y obras exteriores)"
            checked={ap.reposicion} onChange={(v) => setAplicar({ reposicion: v })} />

          {(infrasPrincipales.length === 0 && infrasComplement.length === 0 && infrasExteriores.length === 0) && (
            <Card className="p-6 text-center text-sm text-muted-foreground">
              Agregue infraestructuras en Capítulo V para generar las memorias de reposición.
            </Card>
          )}

          {[...infrasPrincipales, ...infrasComplement].map((x) => (
            <MemoriaReposicionCard key={x.infra.id}
              infra={x.infra} terrenoTitulo={x.terrenoTitulo}
              onChange={(p) => updateInfra(x.terrenoId, x.infra.id, p)} />
          ))}

          {infrasExteriores.length > 0 && (
            <ObrasExterioresTable infras={infrasExteriores} onChange={updateInfra} />
          )}
        </TabsContent>

        {/* 5. ROSS-HEIDECKE */}
        <TabsContent value="ross" className="mt-4">
          <ApplyToggle label="5 · Depreciación Ross-Heidecke"
            checked={ap.ross} onChange={(v) => setAplicar({ ross: v })} />

          <Card className="p-4">
            <div className="font-semibold mb-1">Memoria de cálculo de la depreciación · Ross-Heidecke</div>
            <div className="text-xs text-muted-foreground mb-3">
              D = 1 − (1 − (E/V.U.E)<sup>1.4</sup>) · Q · El % ajustado se redondea hacia arriba al entero más cercano (editable).
            </div>
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted-foreground border-b border-border">
                <tr>
                  <th className="text-left py-2">Rubro</th>
                  <th className="text-right">V.U.E.</th>
                  <th className="text-right">Edad</th>
                  <th>Estado conservación</th>
                  <th className="text-right">Q</th>
                  <th className="text-right">% Calc.</th>
                  <th className="text-right">% Ajustado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {infrasAll.length === 0 && (
                  <tr><td colSpan={7} className="py-4 text-center text-muted-foreground">Sin infraestructuras</td></tr>
                )}
                {infrasAll.map((x) => {
                  const i = x.infra;
                  const q = factorQ(i.estadoFE);
                  const dCalc = rossHeidecke(i.edadAnios, i.vidaUtilAnios, i.estadoFE);
                  const dAj = i.depAjustadaPct ?? depAjustado(dCalc);
                  return (
                    <tr key={i.id}>
                      <td className="py-2">{i.nombre || '—'} <span className="text-xs text-muted-foreground">({i.tipo})</span></td>
                      <td className="text-right">
                        <Input type="number" className="h-7 w-20 text-xs text-right mono"
                          value={i.vidaUtilAnios || ''}
                          onChange={(e) => updateInfra(x.terrenoId, i.id, { vidaUtilAnios: Number(e.target.value) || 0 })} />
                      </td>
                      <td className="text-right">
                        <Input type="number" className="h-7 w-20 text-xs text-right mono"
                          value={i.edadAnios || ''}
                          onChange={(e) => updateInfra(x.terrenoId, i.id, { edadAnios: Number(e.target.value) || 0 })} />
                      </td>
                      <td>
                        <Select value={String(i.estadoFE)} onValueChange={(v) => updateInfra(x.terrenoId, i.id, { estadoFE: Number(v), depAjustadaPct: undefined })}>
                          <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {ROSS_HEIDECKE.map((r) => (
                              <SelectItem key={r.fe} value={String(r.fe)}>{r.label} (FE {r.fe})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="text-right mono">{q.toFixed(3)}</td>
                      <td className="text-right mono">{(dCalc * 100).toFixed(2)}%</td>
                      <td className="text-right">
                        <Input type="number" className="h-7 w-20 text-xs text-right mono"
                          value={Math.round(dAj * 100)}
                          onChange={(e) => updateInfra(x.terrenoId, i.id, { depAjustadaPct: Math.max(0, Math.min(100, Number(e.target.value) || 0)) / 100 })} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="text-xs text-muted-foreground mt-3">El terreno no se deprecia. Solo aplica a infraestructuras.</p>
          </Card>
        </TabsContent>

        {/* 6. CONSOLIDADO DE VALORES (enfoque de costos) */}
        <TabsContent value="consolidado" className="mt-4 space-y-4">
          <ApplyToggle label="6 · Consolidado de valores (enfoque de costos)"
            checked={ap.consolidado} onChange={(v) => setAplicar({ consolidado: v })} />

          <Card className="p-4">
            <div className="font-semibold mb-3">Consolidado de valores · Infraestructuras</div>
            <ConsolidadoBloque titulo="Obras principales" filas={infrasPrincipales} />
            <ConsolidadoBloque titulo="Obras complementarias" filas={infrasComplement} />
            <ConsolidadoBloque titulo="Obras exteriores" filas={infrasExteriores} />

            <div className="mt-4 p-3 rounded bg-muted/30 grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-xs text-muted-foreground">Subtotal VRN infraestructuras</span><div className="mono font-medium">{fmtMoney(cons.totalVRN)}</div></div>
              <div><span className="text-xs text-muted-foreground">Subtotal VNO (con depreciación)</span><div className="mono font-medium">{fmtMoney(cons.totalVNO)}</div></div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="font-semibold mb-3">Terreno · Valor por homologación</div>
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted-foreground border-b border-border">
                <tr><th className="text-left py-2">Concepto</th><th className="text-right">Área (vr²)</th><th className="text-right">$/vr²</th><th className="text-right">Total</th></tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="py-2">Terreno (área homologación)</td>
                  <td className="text-right mono">{fmtNum(mt.sujetoTerreno.areaTerrenoVr2)}</td>
                  <td className="text-right mono">{fmtMoney(homT.valorVr2Promedio)}</td>
                  <td className="text-right mono font-medium">{fmtMoney(homT.valorMercadoTerreno)}</td>
                </tr>
              </tbody>
            </table>
          </Card>

          <Card className="p-4 bg-primary/10 border-primary/30">
            <div className="grid md:grid-cols-3 gap-4">
              <div><div className="text-xs text-muted-foreground">VNO Infraestructuras</div><div className="text-lg mono">{fmtMoney(cons.totalVNO)}</div></div>
              <div><div className="text-xs text-muted-foreground">+ Valor terreno (mercado)</div><div className="text-lg mono">{fmtMoney(homT.valorMercadoTerreno)}</div></div>
              <div><div className="text-xs text-muted-foreground">Valor de reposición total</div><div className="text-xl mono font-bold text-primary">{fmtMoney(cons.totalVNO + homT.valorMercadoTerreno)}</div></div>
            </div>
          </Card>
        </TabsContent>

        {/* 7. CONCLUSIÓN */}
        <TabsContent value="conclusion" className="mt-4 space-y-4">
          <ApplyToggle label="7 · Conclusión y conciliación"
            checked={ap.conclusion} onChange={(v) => setAplicar({ conclusion: v })} />

          <Card className="p-4">
            <div className="font-semibold mb-3">Resumen y conciliación de valores</div>
            <div className="grid md:grid-cols-3 gap-3 text-sm">
              <div className="p-3 rounded bg-muted/30"><div className="text-xs text-muted-foreground">Valor de mercado</div><div className="text-lg mono">{fmtMoney(valorMercado)}</div></div>
              <div className="p-3 rounded bg-muted/30"><div className="text-xs text-muted-foreground">Valor de reposición</div><div className="text-lg mono">{fmtMoney(cons.totalVNO + homT.valorMercadoTerreno)}</div></div>
              <div className="p-3 rounded bg-muted/30"><div className="text-xs text-muted-foreground">Valor de realización</div><div className="text-lg mono">{fmtMoney(valorReal)}</div></div>
            </div>

            <div className="mt-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Enfoque concluido</div>
              <div className="flex gap-2">
                <Button variant={mt.enfoqueConclusion === 'mercado' ? 'default' : 'outline'} onClick={() => setMT({ enfoqueConclusion: 'mercado' })}>Conclusión por Mercado</Button>
                <Button variant={mt.enfoqueConclusion === 'costo' ? 'default' : 'outline'} onClick={() => setMT({ enfoqueConclusion: 'costo' })}>Conclusión por Reposición</Button>
              </div>
            </div>

            <div className="mt-4">
              <Field label="Nota / justificación del enfoque concluido">
                <textarea
                  className="w-full min-h-[120px] rounded border border-border bg-background px-3 py-2 text-sm"
                  value={mt.enfoqueConclusion === 'mercado' ? mt.notasMercadoInmueble : mt.notasMercadoTerreno}
                  onChange={(e) => mt.enfoqueConclusion === 'mercado'
                    ? setMT({ notasMercadoInmueble: e.target.value })
                    : setMT({ notasMercadoTerreno: e.target.value })}
                  placeholder={mt.enfoqueConclusion === 'mercado'
                    ? 'Tras analizar los resultados, se otorga el mayor peso al valor obtenido por el enfoque de mercado…'
                    : 'Dada la escasez de comparables directos y/o la naturaleza única de la propiedad valuada, se otorga el mayor peso al enfoque de costo (valor de reposición)…'}
                />
              </Field>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm" onClick={() => setMT({ notasMercadoInmueble: 'Tras analizar los resultados, se otorga el mayor peso al valor obtenido por el enfoque de mercado, ya que refleja de manera más directa el comportamiento actual de la oferta y la demanda para propiedades similares en la zona. El valor de reposición se considera un sólido soporte técnico, pero es el mercado quien dicta la transacción final.' })}>
                  Usar nota A (mercado)
                </Button>
                <Button variant="outline" size="sm" onClick={() => setMT({ notasMercadoTerreno: 'Dada la escasez de comparables directos y/o la naturaleza única de la propiedad valuada, se otorga el mayor peso al enfoque de costo (valor de reposición). Se considera que este valor representa de forma más fiel y objetiva el valor de los activos físicos que componen el inmueble, ante la ausencia de evidencia suficiente de mercado.' })}>
                  Usar nota B (reposición)
                </Button>
              </div>
            </div>

            <Card className="p-4 mt-4 bg-primary/10 border-primary/30">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Valor comercial concluido</div>
              <div className="text-3xl font-bold mono text-primary mt-1">
                {fmtMoney(mt.enfoqueConclusion === 'mercado'
                  ? (valorMercado || cons.totalVNO + homT.valorMercadoTerreno)
                  : (cons.totalVNO + homT.valorMercadoTerreno))}
              </div>
              <div className="text-xs text-muted-foreground mt-2">Valor de realización: <span className="mono">{fmtMoney(valorReal)}</span></div>
            </Card>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============ Memoria de reposición por etapas ============
function MemoriaReposicionCard({ infra, terrenoTitulo, onChange }: {
  infra: Infraestructura; terrenoTitulo: string;
  onChange: (p: Partial<Infraestructura>) => void;
}) {
  const mem = memoriaReposicion(infra.costoReposicionM2 ?? 0, infra.areaTotalM2 ?? 0);
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <div className="font-semibold">{infra.nombre || 'Infraestructura'}</div>
          <div className="text-xs text-muted-foreground">{terrenoTitulo} · {infra.tipo} · Área: {fmtNum(infra.areaTotalM2 ?? 0)} m²</div>
        </div>
        <div className="flex items-end gap-2">
          <div className="w-44">
            <NumberField label="Costo VRN US$/m²"
              value={infra.costoReposicionM2 ?? 0}
              onChange={(v) => onChange({ costoReposicionM2: v })} />
          </div>
        </div>
      </div>

      <table className="w-full text-xs">
        <thead className="text-muted-foreground border-b border-border">
          <tr>
            <th className="text-left py-1">Etapa</th>
            <th className="text-left">Descripción</th>
            <th className="text-right">Unidad</th>
            <th className="text-right">% Incid.</th>
            <th className="text-right">Total US$</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          <tr className="bg-muted/40"><td colSpan={5} className="py-1 px-1 text-xs font-semibold uppercase">Costos directos</td></tr>
          {mem.filas.filter((f) => f.grupo === 'directos').map((f) => (
            <tr key={f.id}>
              <td className="py-1 font-medium">{f.nombre}</td>
              <td className="text-muted-foreground">{f.descripcion}</td>
              <td className="text-right mono">{f.unidad}</td>
              <td className="text-right mono">{(f.pct * 100).toFixed(0)}%</td>
              <td className="text-right mono">{fmtMoney(f.total)}</td>
            </tr>
          ))}
          <tr className="bg-muted/20 font-medium"><td colSpan={4} className="py-1 text-right">Total directos</td><td className="text-right mono">{fmtMoney(mem.totalDirectos)}</td></tr>

          <tr className="bg-muted/40"><td colSpan={5} className="py-1 px-1 text-xs font-semibold uppercase">Costos indirectos (15% de directos)</td></tr>
          {mem.filas.filter((f) => f.grupo === 'indirectos').map((f) => (
            <tr key={f.id}>
              <td className="py-1 font-medium">{f.nombre}</td>
              <td className="text-muted-foreground">{f.descripcion}</td>
              <td className="text-right mono">{f.unidad}</td>
              <td className="text-right mono">{(f.pct * 100).toFixed(0)}%</td>
              <td className="text-right mono">{fmtMoney(f.total)}</td>
            </tr>
          ))}
          <tr className="bg-muted/20 font-medium"><td colSpan={4} className="py-1 text-right">Total indirectos</td><td className="text-right mono">{fmtMoney(mem.totalIndirectos)}</td></tr>

          <tr className="bg-muted/40"><td colSpan={5} className="py-1 px-1 text-xs font-semibold uppercase">Impuestos</td></tr>
          {mem.filas.filter((f) => f.grupo === 'impuestos').map((f) => (
            <tr key={f.id}>
              <td className="py-1 font-medium">{f.nombre}</td>
              <td className="text-muted-foreground">{f.descripcion}</td>
              <td className="text-right mono">{f.unidad}</td>
              <td className="text-right mono">{(f.pct * 100).toFixed(2)}%</td>
              <td className="text-right mono">{fmtMoney(f.total)}</td>
            </tr>
          ))}
          <tr className="bg-muted/20 font-medium"><td colSpan={4} className="py-1 text-right">Total impuestos</td><td className="text-right mono">{fmtMoney(mem.totalImpuestos)}</td></tr>

          <tr className="bg-primary/10 font-bold">
            <td colSpan={4} className="py-2 text-right">Valor de reposición a nuevo (VRN)</td>
            <td className="text-right mono text-primary">{fmtMoney(mem.vrn)}</td>
          </tr>
          <tr><td colSpan={4} className="text-right text-xs text-muted-foreground py-1">Costo US$/m²</td><td className="text-right mono text-xs">{fmtMoney(mem.area > 0 ? mem.vrn / mem.area : 0)}</td></tr>
        </tbody>
      </table>
    </Card>
  );
}

// ============ Tabla única para obras exteriores ============
function ObrasExterioresTable({ infras, onChange }: {
  infras: { terrenoId: string; terrenoTitulo: string; infra: Infraestructura }[];
  onChange: (terrenoId: string, infraId: string, p: Partial<Infraestructura>) => void;
}) {
  const total = infras.reduce((a, x) => {
    const cu = x.infra.costoReposicionM2 ?? 0;
    const cant = x.infra.cantidadObraExterior ?? x.infra.areaTotalM2 ?? 0;
    return a + cu * cant;
  }, 0);
  return (
    <Card className="p-4">
      <div className="font-semibold mb-3">Obras exteriores</div>
      <table className="w-full text-sm">
        <thead className="text-xs uppercase text-muted-foreground border-b border-border">
          <tr>
            <th className="text-left py-2">Nombre</th>
            <th className="text-left">Descripción</th>
            <th className="text-right">Unidad</th>
            <th className="text-right">Cant./Área</th>
            <th className="text-right">Costo unit. US$</th>
            <th className="text-right">Costo total US$</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {infras.map((x) => {
            const i = x.infra;
            const cu = i.costoReposicionM2 ?? 0;
            const cant = i.cantidadObraExterior ?? i.areaTotalM2 ?? 0;
            return (
              <tr key={i.id}>
                <td className="py-2">{i.nombre || '—'}</td>
                <td className="text-muted-foreground">{i.descripcionObraExterior || i.observaciones || '—'}</td>
                <td className="text-right mono">{i.unidadObraExterior || 'm²'}</td>
                <td className="text-right mono">{fmtNum(cant)}</td>
                <td className="text-right">
                  <Input type="number" className="h-7 w-24 text-xs text-right mono"
                    value={cu || ''}
                    onChange={(e) => onChange(x.terrenoId, i.id, { costoReposicionM2: Number(e.target.value) || 0 })} />
                </td>
                <td className="text-right mono font-medium">{fmtMoney(cu * cant)}</td>
              </tr>
            );
          })}
          <tr className="bg-primary/10 font-bold">
            <td colSpan={5} className="py-2 text-right">Total obras exteriores</td>
            <td className="text-right mono text-primary">{fmtMoney(total)}</td>
          </tr>
        </tbody>
      </table>
    </Card>
  );
}

// ============ Bloque del consolidado por tipo de infra ============
function ConsolidadoBloque({ titulo, filas }: {
  titulo: string;
  filas: { terrenoId: string; terrenoTitulo: string; infra: Infraestructura }[];
}) {
  if (filas.length === 0) return null;
  const subtotal = filas.reduce((a, x) => a + valorNetoInfra(x.infra).vno, 0);
  return (
    <div className="mb-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{titulo}</div>
      <table className="w-full text-sm">
        <thead className="text-xs uppercase text-muted-foreground border-b border-border">
          <tr>
            <th className="text-left py-2">Infraestructura</th>
            <th className="text-right">Unidad</th>
            <th className="text-right">Cantidad</th>
            <th className="text-right">$/m²</th>
            <th className="text-right">VRN</th>
            <th className="text-right">% Dep.</th>
            <th className="text-right">VNO</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {filas.map((x) => {
            const i = x.infra;
            const v = valorNetoInfra(i);
            const unidad = i.tipo === 'obra_exterior' ? (i.unidadObraExterior || 'm²') : 'm²';
            const cant = i.tipo === 'obra_exterior' ? (i.cantidadObraExterior ?? i.areaTotalM2 ?? 0) : (i.areaTotalM2 ?? 0);
            const cu = i.costoReposicionM2 ?? (cant > 0 ? v.vrn / cant : 0);
            return (
              <tr key={i.id}>
                <td className="py-2">{i.nombre || '—'}</td>
                <td className="text-right mono">{unidad}</td>
                <td className="text-right mono">{fmtNum(cant)}</td>
                <td className="text-right mono">{fmtMoney(cu)}</td>
                <td className="text-right mono">{fmtMoney(v.vrn)}</td>
                <td className="text-right mono">{(v.depPct * 100).toFixed(0)}%</td>
                <td className="text-right mono font-medium">{fmtMoney(v.vno)}</td>
              </tr>
            );
          })}
          <tr className="bg-muted/30 font-medium">
            <td colSpan={6} className="py-2 text-right">Subtotal {titulo.toLowerCase()}</td>
            <td className="text-right mono">{fmtMoney(subtotal)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ============ Fila de comparable Terreno ============
function CompTerrenoRow({ comp, idx, onChange, onRemove }: {
  comp: ComparableTerreno; idx: number; onChange: (p: Partial<ComparableTerreno>) => void; onRemove: () => void;
}) {
  return (
    <div className="border border-border rounded p-3 bg-muted/10">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">Comparable T-{idx + 1}</div>
        <button onClick={onRemove} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
      </div>
      <div className="grid md:grid-cols-4 gap-2">
        <Input placeholder="Dirección" value={comp.direccion} onChange={(e) => onChange({ direccion: e.target.value })} className="h-8 text-xs" />
        <Input placeholder="Página/Fuente" value={comp.paginaWeb} onChange={(e) => onChange({ paginaWeb: e.target.value })} className="h-8 text-xs" />
        <Input placeholder="Contacto" value={comp.contacto} onChange={(e) => onChange({ contacto: e.target.value })} className="h-8 text-xs" />
        <Input placeholder="Días antigüedad" type="number" value={comp.diasAntiguedad || ''} onChange={(e) => onChange({ diasAntiguedad: Number(e.target.value) || 0 })} className="h-8 text-xs" />
        <NumberField label="Precio venta US$" value={comp.precioVentaUSD} onChange={(v) => onChange({ precioVentaUSD: v })} />
        <NumberField label="Área vr²" value={comp.areaTerrenoVr2} onChange={(v) => onChange({ areaTerrenoVr2: v })} />
      </div>
      <div className="grid md:grid-cols-4 gap-2 mt-2">
        <KeySelect label="Ubicación" tabla={TABLA_UBICACION} value={comp.ubicacionKey} onChange={(v) => onChange({ ubicacionKey: v })} />
        <KeySelect label="Zona" tabla={TABLA_ZONA} value={comp.zonaKey} onChange={(v) => onChange({ zonaKey: v })} />
        <KeySelect label="Vía" tabla={TABLA_VIA} value={comp.viaAccesoKey} onChange={(v) => onChange({ viaAccesoKey: v })} />
        <KeySelect label="Servicios" tabla={TABLA_SERVICIOS} value={comp.serviciosKey} onChange={(v) => onChange({ serviciosKey: v })} />
        <KeySelect label="Equipamiento" tabla={TABLA_EQUIPAMIENTO} value={comp.equipamientoKey} onChange={(v) => onChange({ equipamientoKey: v })} />
        <KeySelect label="Topografía" tabla={TABLA_TOPOGRAFIA} value={comp.topografiaKey} onChange={(v) => onChange({ topografiaKey: v })} />
        <KeySelect label="Posición" tabla={TABLA_POSICION} value={comp.posicionManzanaKey} onChange={(v) => onChange({ posicionManzanaKey: v })} />
      </div>
    </div>
  );
}

function CompInmuebleRow({ comp, idx, onChange, onRemove }: {
  comp: ComparableInmueble; idx: number; onChange: (p: Partial<ComparableInmueble>) => void; onRemove: () => void;
}) {
  return (
    <div className="border border-border rounded p-3 bg-muted/10">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">Comparable I-{idx + 1}</div>
        <button onClick={onRemove} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
      </div>
      <div className="grid md:grid-cols-4 gap-2">
        <Input placeholder="Dirección" value={comp.direccion} onChange={(e) => onChange({ direccion: e.target.value })} className="h-8 text-xs" />
        <Input placeholder="Página/Fuente" value={comp.paginaWeb} onChange={(e) => onChange({ paginaWeb: e.target.value })} className="h-8 text-xs" />
        <Input placeholder="Contacto" value={comp.contacto} onChange={(e) => onChange({ contacto: e.target.value })} className="h-8 text-xs" />
        <Input placeholder="Días antigüedad" type="number" value={comp.diasAntiguedad || ''} onChange={(e) => onChange({ diasAntiguedad: Number(e.target.value) || 0 })} className="h-8 text-xs" />
        <NumberField label="Precio venta US$" value={comp.precioVentaUSD} onChange={(v) => onChange({ precioVentaUSD: v })} />
        <NumberField label="Área const. m²" value={comp.areaConstruccionM2} onChange={(v) => onChange({ areaConstruccionM2: v })} />
        <NumberField label="Área terreno m²" value={comp.areaTerrenoM2} onChange={(v) => onChange({ areaTerrenoM2: v })} />
      </div>
      <div className="grid md:grid-cols-4 gap-2 mt-2">
        <KeySelect label="Ubicación" tabla={TABLA_UBICACION} value={comp.ubicacionKey} onChange={(v) => onChange({ ubicacionKey: v })} />
        <KeySelect label="Zona" tabla={TABLA_ZONA} value={comp.zonaKey} onChange={(v) => onChange({ zonaKey: v })} />
        <KeySelect label="Vía" tabla={TABLA_VIA} value={comp.viaAccesoKey} onChange={(v) => onChange({ viaAccesoKey: v })} />
        <NumberField label="Dormitorios" value={comp.dormitorios} onChange={(v) => onChange({ dormitorios: v })} />
        <NumberField label="Baños comp." value={comp.banosCompletos} onChange={(v) => onChange({ banosCompletos: v })} />
        <NumberField label="Baño medio" value={comp.banoMedio} onChange={(v) => onChange({ banoMedio: v })} />
        <NumberField label="C/B servicio" value={comp.cuartoBanoServicio} onChange={(v) => onChange({ cuartoBanoServicio: v })} />
      </div>
    </div>
  );
}
