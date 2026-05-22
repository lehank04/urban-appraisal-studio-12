import { useStore } from '@/store/avaluoStore';
import { Avaluo } from '@/store/types';
import { TextField, TextArea, Field } from '@/components/forms/Fields';
import { DynamicField } from '@/components/forms/DynamicField';
import { CATALOGOS } from '@/lib/catalogos';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function StepInfo({ avaluo }: { avaluo: Avaluo }) {
  const { patchAvaluo } = useStore();
  const i = avaluo.info;
  const set = (k: keyof typeof i, v: string) =>
    patchAvaluo(avaluo.id, (a) => ({ ...a, info: { ...a.info, [k]: v } }));

  return (
    <div className="space-y-5 max-w-5xl">
      <header>
        <h2 className="text-xl font-semibold">Paso 3 · Información general</h2>
        <p className="text-sm text-muted-foreground">Datos generales del expediente. Todos los campos son editables.</p>
      </header>

      <div className="grid md:grid-cols-3 gap-4">
        <TextField label="Código expediente" value={i.codigoExpediente} onChange={(v) => set('codigoExpediente', v)} placeholder="INM-2025-001" />
        <TextField label="Solicitante" value={i.solicitante} onChange={(v) => set('solicitante', v)} />
        <TextField label="Propietario" value={i.propietario} onChange={(v) => set('propietario', v)} />

        <DynamicField label="Tipo de avalúo" value={i.tipoAvaluo} onChange={(v) => set('tipoAvaluo', v)} options={CATALOGOS.tipoAvaluo} />
        <DynamicField label="Finalidad" value={i.finalidad} onChange={(v) => set('finalidad', v)} options={CATALOGOS.finalidad} />

        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Moneda</Label>
          <Select value={i.moneda} onValueChange={(v) => set('moneda', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{CATALOGOS.moneda.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <Field label="Fecha de inspección"><Input type="date" value={i.fechaInspeccion} onChange={(e) => set('fechaInspeccion', e.target.value)} /></Field>
        <Field label="Fecha de elaboración"><Input type="date" value={i.fechaElaboracion} onChange={(e) => set('fechaElaboracion', e.target.value)} /></Field>
        <TextField label="Dirección del inmueble" value={i.direccionInmueble} onChange={(v) => set('direccionInmueble', v)} />

        <TextField label="Departamento" value={i.departamento} onChange={(v) => set('departamento', v)} />
        <TextField label="Municipio" value={i.municipio} onChange={(v) => set('municipio', v)} />
        <TextField label="Matrícula inmobiliaria" value={i.matricula} onChange={(v) => set('matricula', v)} />

        <TextField label="Número catastral" value={i.numeroCatastral} onChange={(v) => set('numeroCatastral', v)} />
        <TextField label="Área registrada (m²)" value={i.areaRegistrada} onChange={(v) => set('areaRegistrada', v)} />
        <TextField label="Área levantada (m²)" value={i.areaLevantada} onChange={(v) => set('areaLevantada', v)} />
      </div>

      <TextArea label="Observaciones generales" value={i.observacionesGenerales} onChange={(v) => set('observacionesGenerales', v)} rows={4} />
    </div>
  );
}
