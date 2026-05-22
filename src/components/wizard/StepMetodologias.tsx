import { useStore } from '@/store/avaluoStore';
import {
  Avaluo, ComparableInmueble, ComparableTerreno, FichaSujetoInmueble, FichaSujetoTerreno,
  emptyComparableInmueble, emptyComparableTerreno, DeduccionesRealizacion,
} from '@/store/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { TextField, NumberField, TextArea } from '@/components/forms/Fields';
import { KeySelect } from '@/components/forms/CatSelect';
import { Input } from '@/components/ui/input';
import {
  TABLA_UBICACION, TABLA_ZONA, TABLA_VIA, TABLA_SERVICIOS,
  TABLA_EQUIPAMIENTO, TABLA_TOPOGRAFIA, TABLA_POSICION,
} from '@/lib/catalogos';
import {
  consolidados, homologacionInmueble, homologacionTerreno,
  totalDeducciones, valorRealizacion, deduccionesDetalle, fmtMoney, fmtNum, fmtPct,
} from '@/lib/calculations';
import { Plus, Trash2 } from 'lucide-react';

export function StepMetodologias({ avaluo }: { avaluo: Avaluo }) {
  const { patchAvaluo } = useStore();
  const m = avaluo.metodologias;
  const setM = (patch: Partial<typeof m>) =>
    patchAvaluo(avaluo.id, (a) => ({ ...a, metodologias: { ...a.metodologias, ...patch } }));
  const setSujetoT = (p: Partial<FichaSujetoTerreno>) => setM({ sujetoTerreno: { ...m.sujetoTerreno, ...p } });
  const setSujetoI = (p: Partial<FichaSujetoInmueble>) => setM({ sujetoInmueble: { ...m.sujetoInmueble, ...p } });
  const setDed = (p: Partial<DeduccionesRealizacion>) => setM({ deducciones: { ...m.deducciones, ...p } });

  const cons = consolidados(avaluo);
  const homT = homologacionTerreno(m.sujetoTerreno, m.comparablesTerreno);
  const homI = homologacionInmueble(m.sujetoInmueble, m.comparablesInmueble);
  const valorMercado = (homT.valorMercadoTerreno || 0) + (homI.valorMercado || 0);
  const valorReal = valorRealizacion(valorMercado || cons.totalReposicionNeto, m.deducciones);

  return (
    <div className="space-y-5">
      <header>
        <div className="text-xs uppercase tracking-widest text-primary">Capítulo VI · INMOVAL</div>
        <h2 className="text-xl font-semibold">Metodología y avalúo</h2>
        <p className="text-sm text-muted-foreground">Enfoque de costos, enfoque de mercado (homologación) y valor de realización.</p>
      </header>

      <Tabs defaultValue="costo">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="costo">A · Enfoque de costos</TabsTrigger>
          <TabsTrigger value="terreno">B · Mercado — Terreno</TabsTrigger>
          <TabsTrigger value="inmueble">C · Mercado — Construido</TabsTrigger>
          <TabsTrigger value="realizacion">D · Valor de realización</TabsTrigger>
          <TabsTrigger value="conclusion">E · Conclusión</TabsTrigger>
        </TabsList>

        {/* A. COSTO */}
        <TabsContent value="costo" className="mt-4">
          <Card className="p-4">
            <div className="font-semibold mb-3">Resumen del enfoque de costos</div>
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted-foreground border-b border-border">
                <tr><th className="text-left py-2">Terreno</th><th className="text-right">Área vr²</th><th className="text-right">V. unitario</th><th className="text-right">Total</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {cons.terrenos.map((t) => (
                  <tr key={t.id}><td className="py-2">{t.titulo}</td><td className="text-right mono">{fmtNum(t.areaVr2)}</td>
                    <td className="text-right mono">{fmtMoney(t.valorUnitario)}</td>
                    <td className="text-right mono font-medium">{fmtMoney(t.valorTotal)}</td></tr>
                ))}
                <tr className="bg-muted/30 font-semibold"><td colSpan={3} className="py-2 text-right">Subtotal terrenos</td><td className="text-right mono">{fmtMoney(cons.totalTerrenos)}</td></tr>
              </tbody>
            </table>

            <div className="font-semibold mt-6 mb-3">Infraestructuras (Ross-Heidecke)</div>
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted-foreground border-b border-border">
                <tr><th className="text-left py-2">Terreno</th><th className="text-left">Infra</th>
                  <th className="text-right">VRN</th><th className="text-right">Dep%</th><th className="text-right">VNO</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {cons.infras.map((i) => (
                  <tr key={i.infra.id}><td className="py-2">{i.terreno}</td><td>{i.infra.nombre}</td>
                    <td className="text-right mono">{fmtMoney(i.vrn)}</td>
                    <td className="text-right mono">{fmtPct(i.depPct)}</td>
                    <td className="text-right mono font-medium">{fmtMoney(i.vno)}</td></tr>
                ))}
                <tr className="bg-muted/30 font-semibold"><td colSpan={4} className="py-2 text-right">Subtotal VNO</td><td className="text-right mono">{fmtMoney(cons.totalVNO)}</td></tr>
              </tbody>
            </table>

            <div className="mt-6 grid md:grid-cols-3 gap-3">
              <Card className="p-3"><div className="text-xs text-muted-foreground">Terreno</div><div className="text-lg mono">{fmtMoney(cons.totalTerrenos)}</div></Card>
              <Card className="p-3"><div className="text-xs text-muted-foreground">+ VNO infras</div><div className="text-lg mono">{fmtMoney(cons.totalVNO)}</div></Card>
              <Card className="p-3 bg-primary/10 border-primary/30"><div className="text-xs text-muted-foreground">VNR (Valor Neto de Reposición)</div><div className="text-lg mono font-bold text-primary">{fmtMoney(cons.totalReposicionNeto)}</div></Card>
            </div>
          </Card>
        </TabsContent>

        {/* B. MERCADO TERRENO */}
        <TabsContent value="terreno" className="mt-4 space-y-4">
          <Card className="p-4">
            <div className="font-semibold mb-3">Ficha sujeto · Terreno</div>
            <div className="grid md:grid-cols-3 gap-3">
              <TextField label="Dirección" value={m.sujetoTerreno.direccion} onChange={(v) => setSujetoT({ direccion: v })} />
              <NumberField label="Área vr²" value={m.sujetoTerreno.areaTerrenoVr2} onChange={(v) => setSujetoT({ areaTerrenoVr2: v })} />
              <KeySelect label="Ubicación" tabla={TABLA_UBICACION} value={m.sujetoTerreno.ubicacionKey} onChange={(v) => setSujetoT({ ubicacionKey: v })} />
              <KeySelect label="Zona" tabla={TABLA_ZONA} value={m.sujetoTerreno.zonaKey} onChange={(v) => setSujetoT({ zonaKey: v })} />
              <KeySelect label="Vía de acceso" tabla={TABLA_VIA} value={m.sujetoTerreno.viaAccesoKey} onChange={(v) => setSujetoT({ viaAccesoKey: v })} />
              <KeySelect label="Servicios" tabla={TABLA_SERVICIOS} value={m.sujetoTerreno.serviciosKey} onChange={(v) => setSujetoT({ serviciosKey: v })} />
              <KeySelect label="Equipamiento" tabla={TABLA_EQUIPAMIENTO} value={m.sujetoTerreno.equipamientoKey} onChange={(v) => setSujetoT({ equipamientoKey: v })} />
              <KeySelect label="Topografía" tabla={TABLA_TOPOGRAFIA} value={m.sujetoTerreno.topografiaKey} onChange={(v) => setSujetoT({ topografiaKey: v })} />
              <KeySelect label="Posición en manzana" tabla={TABLA_POSICION} value={m.sujetoTerreno.posicionManzanaKey} onChange={(v) => setSujetoT({ posicionManzanaKey: v })} />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">Comparables de terreno ({m.comparablesTerreno.length})</div>
              <Button size="sm" onClick={() => setM({ comparablesTerreno: [...m.comparablesTerreno, emptyComparableTerreno()] })}>
                <Plus className="h-4 w-4 mr-1" />Comparable
              </Button>
            </div>
            <div className="space-y-3">
              {m.comparablesTerreno.map((c, idx) => (
                <CompTerrenoRow key={c.id} comp={c} idx={idx}
                  onChange={(p) => setM({ comparablesTerreno: m.comparablesTerreno.map((x) => x.id === c.id ? { ...x, ...p } : x) })}
                  onRemove={() => setM({ comparablesTerreno: m.comparablesTerreno.filter((x) => x.id !== c.id) })} />
              ))}
              {m.comparablesTerreno.length === 0 && <div className="text-xs text-muted-foreground text-center py-4">Sin comparables</div>}
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
            <TextArea label="Notas del enfoque de mercado (terreno)" value={m.notasMercadoTerreno} onChange={(v) => setM({ notasMercadoTerreno: v })} rows={2} />
          </Card>
        </TabsContent>

        {/* C. MERCADO INMUEBLE */}
        <TabsContent value="inmueble" className="mt-4 space-y-4">
          <Card className="p-4">
            <div className="font-semibold mb-3">Ficha sujeto · Inmueble construido</div>
            <div className="grid md:grid-cols-3 gap-3">
              <TextField label="Dirección" value={m.sujetoInmueble.direccion} onChange={(v) => setSujetoI({ direccion: v })} />
              <NumberField label="Área construcción (m²)" value={m.sujetoInmueble.areaConstruccionM2} onChange={(v) => setSujetoI({ areaConstruccionM2: v })} />
              <NumberField label="Área terreno (m²)" value={m.sujetoInmueble.areaTerrenoM2} onChange={(v) => setSujetoI({ areaTerrenoM2: v })} />
              <KeySelect label="Ubicación" tabla={TABLA_UBICACION} value={m.sujetoInmueble.ubicacionKey} onChange={(v) => setSujetoI({ ubicacionKey: v })} />
              <KeySelect label="Zona" tabla={TABLA_ZONA} value={m.sujetoInmueble.zonaKey} onChange={(v) => setSujetoI({ zonaKey: v })} />
              <KeySelect label="Vía de acceso" tabla={TABLA_VIA} value={m.sujetoInmueble.viaAccesoKey} onChange={(v) => setSujetoI({ viaAccesoKey: v })} />
              <NumberField label="Dormitorios" value={m.sujetoInmueble.dormitorios} onChange={(v) => setSujetoI({ dormitorios: v })} />
              <NumberField label="Baños completos" value={m.sujetoInmueble.banosCompletos} onChange={(v) => setSujetoI({ banosCompletos: v })} />
              <NumberField label="Baño medio" value={m.sujetoInmueble.banoMedio} onChange={(v) => setSujetoI({ banoMedio: v })} />
              <NumberField label="Cuarto/baño servicio" value={m.sujetoInmueble.cuartoBanoServicio} onChange={(v) => setSujetoI({ cuartoBanoServicio: v })} />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">Comparables de inmueble construido ({m.comparablesInmueble.length})</div>
              <Button size="sm" onClick={() => setM({ comparablesInmueble: [...m.comparablesInmueble, emptyComparableInmueble()] })}>
                <Plus className="h-4 w-4 mr-1" />Comparable
              </Button>
            </div>
            <div className="space-y-3">
              {m.comparablesInmueble.map((c, idx) => (
                <CompInmuebleRow key={c.id} comp={c} idx={idx}
                  onChange={(p) => setM({ comparablesInmueble: m.comparablesInmueble.map((x) => x.id === c.id ? { ...x, ...p } : x) })}
                  onRemove={() => setM({ comparablesInmueble: m.comparablesInmueble.filter((x) => x.id !== c.id) })} />
              ))}
              {m.comparablesInmueble.length === 0 && <div className="text-xs text-muted-foreground text-center py-4">Sin comparables</div>}
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
            <TextArea label="Notas del enfoque de mercado (inmueble)" value={m.notasMercadoInmueble} onChange={(v) => setM({ notasMercadoInmueble: v })} rows={2} />
          </Card>
        </TabsContent>

        {/* D. REALIZACIÓN */}
        <TabsContent value="realizacion" className="mt-4">
          <Card className="p-4">
            <div className="font-semibold mb-3">Deducciones del valor de realización</div>
            <div className="grid md:grid-cols-5 gap-3">
              <NumberField label="IR (%)" value={m.deducciones.ir} onChange={(v) => setDed({ ir: v })} />
              <NumberField label="IBI (%)" value={m.deducciones.ibi} onChange={(v) => setDed({ ibi: v })} />
              <NumberField label="Corretaje (%)" value={m.deducciones.corretaje} onChange={(v) => setDed({ corretaje: v })} />
              <NumberField label="Legales (%)" value={m.deducciones.legales} onChange={(v) => setDed({ legales: v })} />
              <NumberField label="Comercialización (%)" value={m.deducciones.comercializacion} onChange={(v) => setDed({ comercializacion: v })} />
            </div>
            <div className="mt-4">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-muted-foreground border-b border-border">
                  <tr><th className="text-left py-2">Concepto</th><th className="text-right">%</th><th className="text-right">Valor</th></tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {deduccionesDetalle(valorMercado || cons.totalReposicionNeto, m.deducciones).map((d) => (
                    <tr key={d.concepto}><td className="py-2">{d.concepto}</td><td className="text-right mono">{d.pct}%</td><td className="text-right mono">{fmtMoney(d.valor)}</td></tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                <div className="p-2 rounded bg-muted/30"><div className="text-xs text-muted-foreground">Total deducciones</div><div className="mono">{fmtPct(totalDeducciones(m.deducciones))}</div></div>
                <div className="p-2 rounded bg-muted/30"><div className="text-xs text-muted-foreground">Base (V. mercado)</div><div className="mono">{fmtMoney(valorMercado || cons.totalReposicionNeto)}</div></div>
                <div className="p-2 rounded bg-primary/10 border border-primary/30"><div className="text-xs text-muted-foreground">Valor de realización</div><div className="mono font-bold text-primary">{fmtMoney(valorReal)}</div></div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* E. CONCLUSIÓN */}
        <TabsContent value="conclusion" className="mt-4">
          <Card className="p-4 space-y-3">
            <div className="font-semibold">Conciliación de valores</div>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded bg-muted/30"><div className="text-xs text-muted-foreground">Valor por enfoque de costos (VNR)</div><div className="text-lg mono">{fmtMoney(cons.totalReposicionNeto)}</div></div>
              <div className="p-3 rounded bg-muted/30"><div className="text-xs text-muted-foreground">Valor por enfoque de mercado</div><div className="text-lg mono">{fmtMoney(valorMercado)}</div></div>
            </div>
            <div className="flex gap-2">
              <Button variant={m.enfoqueConclusion === 'mercado' ? 'default' : 'outline'} onClick={() => setM({ enfoqueConclusion: 'mercado' })}>Conclusión por Mercado</Button>
              <Button variant={m.enfoqueConclusion === 'costo' ? 'default' : 'outline'} onClick={() => setM({ enfoqueConclusion: 'costo' })}>Conclusión por Costo</Button>
            </div>
            <Card className="p-4 bg-primary/10 border-primary/30">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Valor comercial concluido</div>
              <div className="text-3xl font-bold mono text-primary mt-1">
                {fmtMoney(m.enfoqueConclusion === 'mercado' ? (valorMercado || cons.totalReposicionNeto) : cons.totalReposicionNeto)}
              </div>
              <div className="text-xs text-muted-foreground mt-2">Valor de realización: <span className="mono">{fmtMoney(valorReal)}</span></div>
            </Card>
          </Card>
        </TabsContent>
      </Tabs>
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
