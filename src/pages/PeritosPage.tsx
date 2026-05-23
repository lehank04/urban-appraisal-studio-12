import { useState } from 'react';
import { useStore } from '@/store/avaluoStore';
import { Perito, PlantillaId } from '@/store/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { TextField } from '@/components/forms/Fields';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { PLANTILLAS } from '@/templates/plantillas';

const empty: Omit<Perito, 'id'> = {
  nombre: '', cedula: '', registroSIBOIF: '', telefono: '', email: '', direccion: '',
  plantilla: 'inmoval', cargo: 'Perito firmante',
};

function PeritoForm({ value, onChange }: { value: Omit<Perito, 'id'>; onChange: (v: Omit<Perito, 'id'>) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="col-span-2">
        <TextField label="Nombre completo" value={value.nombre} onChange={(v) => onChange({ ...value, nombre: v })} />
      </div>
      <TextField label="Cédula / RUC" value={value.cedula || ''} onChange={(v) => onChange({ ...value, cedula: v })} />
      <TextField label="NIPEV / Licencia" value={value.registroSIBOIF || ''} onChange={(v) => onChange({ ...value, registroSIBOIF: v })} />
      <TextField label="Teléfono" value={value.telefono || ''} onChange={(v) => onChange({ ...value, telefono: v })} />
      <TextField label="Email" value={value.email || ''} onChange={(v) => onChange({ ...value, email: v })} />
      <div className="col-span-2">
        <TextField label="Dirección" value={value.direccion || ''} onChange={(v) => onChange({ ...value, direccion: v })} />
      </div>
      <TextField label="Cargo" value={value.cargo || ''} onChange={(v) => onChange({ ...value, cargo: v })} />
      <TextField label="Empresa" value={value.empresa || ''} onChange={(v) => onChange({ ...value, empresa: v })} />
      <div className="col-span-2 space-y-1.5">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Plantilla documental</Label>
        <Select value={value.plantilla} onValueChange={(v) => onChange({ ...value, plantilla: v as PlantillaId })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.entries(PLANTILLAS).map(([k, pl]) => (
              <SelectItem key={k} value={k}>{pl.nombre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export default function PeritosPage() {
  const { peritos, addPerito, updatePerito, deletePerito } = useStore();
  const [open, setOpen] = useState(false);
  const [nuevo, setNuevo] = useState<Omit<Perito, 'id'>>(empty);
  const [editing, setEditing] = useState<Perito | null>(null);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Peritos firmantes</h1>
          <p className="text-sm text-muted-foreground">{peritos.length} perito(s) · cada uno con su plantilla documental</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" />Nuevo</Button></DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader><DialogTitle>Registrar perito firmante</DialogTitle></DialogHeader>
            <PeritoForm value={nuevo} onChange={setNuevo} />
            <DialogFooter>
              <Button onClick={() => { addPerito(nuevo); setOpen(false); setNuevo(empty); }} disabled={!nuevo.nombre.trim()}>
                Guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Diálogo de edición */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Editar perito firmante</DialogTitle></DialogHeader>
          {editing && (
            <PeritoForm
              value={editing}
              onChange={(v) => setEditing({ ...editing, ...v })}
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button
              onClick={() => {
                if (editing) {
                  const { id, ...patch } = editing;
                  updatePerito(id, patch);
                  setEditing(null);
                }
              }}
              disabled={!editing?.nombre?.trim()}
            >
              Guardar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid md:grid-cols-2 gap-4">
        {peritos.map((p) => {
          const pl = PLANTILLAS[p.plantilla];
          return (
            <Card key={p.id} className="p-5">
              <div className="flex justify-between items-start">
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">{pl.nombre}</div>
                  <div className="font-semibold text-lg mt-1 truncate">{p.nombre}</div>
                  <dl className="mt-2 grid grid-cols-[7rem_1fr] gap-y-1 text-xs">
                    {p.cedula && (<><dt className="text-muted-foreground">Cédula/RUC</dt><dd className="font-mono">{p.cedula}</dd></>)}
                    {(p.registroSIBOIF || p.registro) && (<><dt className="text-muted-foreground">NIPEV</dt><dd className="font-mono">{p.registroSIBOIF || p.registro}</dd></>)}
                    {p.telefono && (<><dt className="text-muted-foreground">Teléfono</dt><dd>{p.telefono}</dd></>)}
                    {p.email && (<><dt className="text-muted-foreground">Email</dt><dd className="truncate">{p.email}</dd></>)}
                    {p.direccion && (<><dt className="text-muted-foreground">Dirección</dt><dd>{p.direccion}</dd></>)}
                  </dl>
                </div>
                <div className="h-10 w-10 shrink-0 rounded grid place-items-center text-white font-bold" style={{ background: pl.color }}>
                  {pl.nombre.charAt(0)}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-border flex justify-end gap-1">
                <Button size="sm" variant="outline" onClick={() => setEditing(p)}>
                  <Pencil className="h-4 w-4 mr-1" />Editar
                </Button>
                <Button size="icon" variant="ghost" onClick={() => deletePerito(p.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
