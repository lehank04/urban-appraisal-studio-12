import { useState } from 'react';
import { useStore } from '@/store/avaluoStore';
import { Cliente } from '@/store/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { TextField } from '@/components/forms/Fields';

export default function ClientesPage() {
  const { clientes, addCliente, deleteCliente } = useStore();
  const [open, setOpen] = useState(false);
  const [nuevo, setNuevo] = useState<Omit<Cliente, 'id'>>({ nombre: '', documento: '', telefono: '', email: '', direccion: '' });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-semibold">Clientes</h1><p className="text-sm text-muted-foreground">{clientes.length} cliente(s)</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" />Nuevo</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Registrar cliente</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <TextField label="Nombre / Razón social" value={nuevo.nombre} onChange={(v) => setNuevo({ ...nuevo, nombre: v })} />
              <TextField label="Documento / NIT" value={nuevo.documento} onChange={(v) => setNuevo({ ...nuevo, documento: v })} />
              <TextField label="Teléfono" value={nuevo.telefono || ''} onChange={(v) => setNuevo({ ...nuevo, telefono: v })} />
              <TextField label="Email" value={nuevo.email || ''} onChange={(v) => setNuevo({ ...nuevo, email: v })} />
              <TextField label="Dirección" value={nuevo.direccion || ''} onChange={(v) => setNuevo({ ...nuevo, direccion: v })} />
            </div>
            <DialogFooter><Button onClick={() => { addCliente(nuevo); setOpen(false); setNuevo({ nombre: '', documento: '', telefono: '', email: '', direccion: '' }); }}>Guardar</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="text-left p-3">Nombre</th><th className="text-left p-3">Documento</th><th className="text-left p-3">Contacto</th><th></th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {clientes.map((c) => (
              <tr key={c.id}>
                <td className="p-3 font-medium">{c.nombre}</td>
                <td className="p-3 mono text-xs">{c.documento}</td>
                <td className="p-3 text-xs text-muted-foreground">{c.email || c.telefono}</td>
                <td className="p-3 text-right"><Button size="icon" variant="ghost" onClick={() => deleteCliente(c.id)}><Trash2 className="h-4 w-4" /></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
