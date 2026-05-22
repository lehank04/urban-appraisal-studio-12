import { useState } from 'react';
import { useStore } from '@/store/avaluoStore';
import { Avaluo, Cliente } from '@/store/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { TextField } from '@/components/forms/Fields';
import { Plus, Search, Check } from 'lucide-react';

export function StepCliente({ avaluo }: { avaluo: Avaluo }) {
  const { clientes, addCliente, updateAvaluo } = useStore();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [nuevo, setNuevo] = useState<Omit<Cliente, 'id'>>({ nombre: '', documento: '', telefono: '', email: '', direccion: '' });
  const filtered = clientes.filter((c) =>
    c.nombre.toLowerCase().includes(q.toLowerCase()) ||
    c.documento.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-5 max-w-3xl">
      <header>
        <h2 className="text-xl font-semibold">Paso 1 · Cliente</h2>
        <p className="text-sm text-muted-foreground">Selecciona un cliente existente o registra uno nuevo.</p>
      </header>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre o documento..." className="pl-9" />
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline"><Plus className="h-4 w-4 mr-1" />Nuevo cliente</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Registrar cliente</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <TextField label="Nombre / Razón social" value={nuevo.nombre} onChange={(v) => setNuevo({ ...nuevo, nombre: v })} />
              <TextField label="Documento / NIT" value={nuevo.documento} onChange={(v) => setNuevo({ ...nuevo, documento: v })} />
              <div className="grid grid-cols-2 gap-3">
                <TextField label="Teléfono" value={nuevo.telefono || ''} onChange={(v) => setNuevo({ ...nuevo, telefono: v })} />
                <TextField label="Email" value={nuevo.email || ''} onChange={(v) => setNuevo({ ...nuevo, email: v })} />
              </div>
              <TextField label="Dirección" value={nuevo.direccion || ''} onChange={(v) => setNuevo({ ...nuevo, direccion: v })} />
            </div>
            <DialogFooter>
              <Button onClick={() => {
                const c = addCliente(nuevo);
                updateAvaluo(avaluo.id, { clienteId: c.id });
                setOpen(false);
                setNuevo({ nombre: '', documento: '', telefono: '', email: '', direccion: '' });
              }}>Guardar y seleccionar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {filtered.map((c) => {
          const selected = c.id === avaluo.clienteId;
          return (
            <Card
              key={c.id}
              className={`p-4 cursor-pointer transition-colors ${selected ? 'border-primary bg-primary/5' : 'hover:bg-muted/30'}`}
              onClick={() => updateAvaluo(avaluo.id, { clienteId: c.id })}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{c.nombre}</div>
                  <div className="text-xs text-muted-foreground mono">{c.documento} · {c.email || c.telefono || '—'}</div>
                </div>
                {selected && <Check className="h-5 w-5 text-primary" />}
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 && <div className="text-sm text-muted-foreground text-center py-6">Sin resultados</div>}
      </div>
    </div>
  );
}
