import { useStore } from '@/store/avaluoStore';
import { Avaluo } from '@/store/types';
import { TextField, NumberField, TextArea, Field } from '@/components/forms/Fields';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { m2ToVr2 } from '@/lib/calculations';
import { Button } from '@/components/ui/button';

export function StepLegal({ avaluo }: { avaluo: Avaluo }) {
  const { patchAvaluo } = useStore();
  const d = avaluo.documentoLegal;
  const set = <K extends keyof typeof d>(k: K, v: (typeof d)[K]) =>
    patchAvaluo(avaluo.id, (a) => ({ ...a, documentoLegal: { ...a.documentoLegal, [k]: v } }));

  const syncVr2 = () => set('areaTerrenoEscrituraVr2', +m2ToVr2(d.areaTerrenoEscritura).toFixed(4));

  return (
    <div className="space-y-5 max-w-5xl">
      <header>
        <div className="text-xs uppercase tracking-widest text-primary">Capítulo II · INMOVAL</div>
        <h2 className="text-xl font-semibold">Documentación legal presentada</h2>
        <p className="text-sm text-muted-foreground">Escritura pública, inscripción registral y datos catastrales.</p>
      </header>

      <Card className="p-4 space-y-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Escritura pública</div>
        <div className="grid md:grid-cols-3 gap-4">
          <TextField label="Número de escritura" value={d.numeroEscritura} onChange={(v) => set('numeroEscritura', v)} />
          <Field label="Fecha de escritura"><Input type="date" value={d.fechaEscritura} onChange={(e) => set('fechaEscritura', e.target.value)} /></Field>
          <TextField label="Notario público" value={d.notario} onChange={(v) => set('notario', v)} />

          <NumberField label="Área según escritura (m²)" value={d.areaTerrenoEscritura} onChange={(v) => set('areaTerrenoEscritura', v)} />
          <div className="flex gap-2 items-end">
            <NumberField label="Área según escritura (vr²)" value={d.areaTerrenoEscrituraVr2} onChange={(v) => set('areaTerrenoEscrituraVr2', v)} />
            <Button size="sm" variant="outline" onClick={syncVr2} type="button">↻ m²→vr²</Button>
          </div>
        </div>
      </Card>

      <Card className="p-4 space-y-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Inscripción registral</div>
        <div className="grid md:grid-cols-4 gap-4">
          <TextField label="N° registral" value={d.numeroRegistral} onChange={(v) => set('numeroRegistral', v)} />
          <TextField label="Tomo" value={d.tomo} onChange={(v) => set('tomo', v)} />
          <TextField label="Folio" value={d.folio} onChange={(v) => set('folio', v)} />
          <TextField label="Asiento" value={d.asiento} onChange={(v) => set('asiento', v)} />
          <TextField label="Número catastral" value={d.numeroCatastral} onChange={(v) => set('numeroCatastral', v)} />
        </div>
      </Card>

      <TextArea label="Observaciones legales / gravámenes" value={d.observaciones} onChange={(v) => set('observaciones', v)} rows={4} />
    </div>
  );
}
