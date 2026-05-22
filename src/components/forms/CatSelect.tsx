import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TablaFactor } from '@/lib/catalogos';

/** Select para tablas de calibración (key → label) */
export function KeySelect({ label, value, onChange, tabla, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; tabla: TablaFactor; placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue placeholder={placeholder || 'Seleccionar...'} /></SelectTrigger>
        <SelectContent>
          {tabla.opciones.map((o) => (
            <SelectItem key={o.key} value={o.key}>
              {o.label} <span className="text-muted-foreground ml-2">({o.calificacion.toFixed(3)})</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/** Select simple desde lista de strings */
export function StringSelect({ label, value, onChange, options, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue placeholder={placeholder || 'Seleccionar...'} /></SelectTrigger>
        <SelectContent>
          {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
