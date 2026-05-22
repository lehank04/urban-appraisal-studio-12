import { useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}

const CUSTOM = '__custom__';

export function DynamicField({ label, value, onChange, options, placeholder }: Props) {
  const isPreset = options.includes(value);
  const [mode, setMode] = useState<'preset' | 'custom'>(isPreset || !value ? 'preset' : 'custom');

  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      {mode === 'preset' ? (
        <Select
          value={value || ''}
          onValueChange={(v) => {
            if (v === CUSTOM) { setMode('custom'); onChange(''); }
            else onChange(v);
          }}
        >
          <SelectTrigger><SelectValue placeholder={placeholder || 'Seleccionar...'} /></SelectTrigger>
          <SelectContent>
            {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            <SelectItem value={CUSTOM}>✎ Personalizado…</SelectItem>
          </SelectContent>
        </Select>
      ) : (
        <div className="flex gap-2">
          <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Escribir valor personalizado" />
          <button
            type="button"
            onClick={() => { setMode('preset'); onChange(''); }}
            className="text-xs text-muted-foreground hover:text-foreground px-2"
          >
            ← lista
          </button>
        </div>
      )}
    </div>
  );
}
