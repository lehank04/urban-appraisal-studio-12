import { useStore } from '@/store/avaluoStore';
import { Avaluo } from '@/store/types';
import { TextField, TextArea, Field } from '@/components/forms/Fields';
import { StringSelect } from '@/components/forms/CatSelect';
import { TIPOS_INMUEBLE, REGIMENES, PROPOSITOS } from '@/lib/catalogos';
import { Input } from '@/components/ui/input';

export function StepInfo({ avaluo }: { avaluo: Avaluo }) {
  const { patchAvaluo } = useStore();
  const i = avaluo.info;
  const set = <K extends keyof typeof i>(k: K, v: (typeof i)[K]) =>
    patchAvaluo(avaluo.id, (a) => ({ ...a, info: { ...a.info, [k]: v } }));

  return (
    <div className="space-y-5 max-w-5xl">
      <header>
        <div className="text-xs uppercase tracking-widest text-primary">Capítulo I · INMOVAL</div>
        <h2 className="text-xl font-semibold">Información general del avalúo</h2>
        <p className="text-sm text-muted-foreground">Identificación del expediente, finalidad y datos del propietario.</p>
      </header>

      <div className="grid md:grid-cols-3 gap-4">
        <TextField label="Número de expediente" value={i.numeroExpediente} onChange={(v) => set('numeroExpediente', v)} placeholder="INM-2025-001" />
        <StringSelect label="Tipo de inmueble" value={i.tipoInmueble} onChange={(v) => set('tipoInmueble', v)} options={TIPOS_INMUEBLE} />
        <StringSelect label="Régimen de propiedad" value={i.regimen} onChange={(v) => set('regimen', v)} options={REGIMENES} />

        <StringSelect label="Propósito del avalúo" value={i.proposito} onChange={(v) => set('proposito', v)} options={PROPOSITOS} />
        <TextField label="Propietario" value={i.propietario} onChange={(v) => set('propietario', v)} />
        <StringSelect label="Moneda" value={i.moneda} onChange={(v) => set('moneda', v)} options={['US$', 'C$']} />

        <Field label="Fecha de inspección"><Input type="date" value={i.fechaInspeccion} onChange={(e) => set('fechaInspeccion', e.target.value)} /></Field>
        <Field label="Fecha del avalúo"><Input type="date" value={i.fechaAvaluo} onChange={(e) => set('fechaAvaluo', e.target.value)} /></Field>
      </div>

      <TextArea label="Observaciones generales" value={i.observaciones} onChange={(v) => set('observaciones', v)} rows={4} />
    </div>
  );
}
