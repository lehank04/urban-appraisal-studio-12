import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TablaFactor } from '@/lib/catalogos';

const CUSTOM_SENTINEL = '__custom__';

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

/** Select de string con opción "Otros / Personalizado" → text input */
export function StringSelectWithCustom({ label, value, onChange, options, placeholder, customPlaceholder }: {
  label: string; value: string; onChange: (v: string) => void;
  options: string[]; placeholder?: string; customPlaceholder?: string;
}) {
  const isCustom = !!value && !options.includes(value);
  const [mode, setMode] = useState<'select' | 'custom'>(isCustom ? 'custom' : 'select');

  useEffect(() => { if (isCustom) setMode('custom'); }, [isCustom]);

  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      <Select
        value={mode === 'custom' ? CUSTOM_SENTINEL : value}
        onValueChange={(v) => {
          if (v === CUSTOM_SENTINEL) { setMode('custom'); onChange(''); }
          else { setMode('select'); onChange(v); }
        }}
      >
        <SelectTrigger><SelectValue placeholder={placeholder || 'Seleccionar...'} /></SelectTrigger>
        <SelectContent>
          {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          <SelectItem value={CUSTOM_SENTINEL}>Otros / Personalizado…</SelectItem>
        </SelectContent>
      </Select>
      {mode === 'custom' && (
        <Input
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={customPlaceholder || 'Escribir valor personalizado'}
        />
      )}
    </div>
  );
}

/** Multi-select con chips + opción de añadir personalizados */
export function MultiSelectWithCustom({ label, values, onChange, options, placeholder }: {
  label: string; values: string[]; onChange: (v: string[]) => void;
  options: string[]; placeholder?: string;
}) {
  const [custom, setCustom] = useState('');
  const toggle = (opt: string) =>
    onChange(values.includes(opt) ? values.filter((v) => v !== opt) : [...values, opt]);
  const removeChip = (v: string) => onChange(values.filter((x) => x !== v));
  const addCustom = () => {
    const v = custom.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setCustom('');
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {values.map((v) => (
            <Badge key={v} variant="secondary" className="gap-1 pr-1">
              <span className="max-w-[24rem] truncate">{v}</span>
              <button type="button" onClick={() => removeChip(v)} className="hover:bg-muted rounded p-0.5">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <div className="border rounded-md divide-y max-h-64 overflow-auto">
        {options.map((o) => (
          <label key={o} className="flex items-start gap-2 p-2 hover:bg-muted/40 cursor-pointer text-sm">
            <Checkbox checked={values.includes(o)} onCheckedChange={() => toggle(o)} className="mt-0.5" />
            <span>{o}</span>
          </label>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } }}
          placeholder={placeholder || 'Añadir personalizado y presionar Enter'}
        />
        <button
          type="button"
          onClick={addCustom}
          className="px-3 rounded-md border bg-secondary text-sm hover:bg-secondary/80"
        >
          Añadir
        </button>
      </div>
    </div>
  );
}
