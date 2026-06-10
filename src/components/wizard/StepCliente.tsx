import { useState } from 'react';
import { useStore } from '@/store/avaluoStore';
import { Avaluo, Cliente } from '@/store/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { TextField } from '@/components/forms/Fields';
import { Plus, Search, Check, Users } from 'lucide-react';

const emptyCliente: Omit<Cliente, 'id'> = {
  nombre: '',
  documento: '',
  telefono: '',
  email: '',
  direccion: '',
};

export function StepCliente({ avaluo }: { avaluo: Avaluo }) {
  const { clientes, addCliente, updateAvaluo } = useStore();

  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [nuevo, setNuevo] = useState<Omit<Cliente, 'id'>>(emptyCliente);

  const query = q.trim().toLowerCase();

  const filtered = clientes.filter((c) => {
    if (!query) return true;

    return (
      c.nombre.toLowerCase().includes(query) ||
      c.documento.toLowerCase().includes(query) ||
      (c.email || '').toLowerCase().includes(query) ||
      (c.telefono || '').toLowerCase().includes(query)
    );
  });

  const puedeGuardar = nuevo.nombre.trim().length > 0 && nuevo.documento.trim().length > 0;

  const guardarYSeleccionar = () => {
    if (!puedeGuardar) return;

    const cliente = addCliente({
      ...nuevo,
      nombre: nuevo.nombre.trim(),
      documento: nuevo.documento.trim(),
      telefono: nuevo.telefono?.trim(),
      email: nuevo.email?.trim(),
      direccion: nuevo.direccion?.trim(),
    });

    updateAvaluo(avaluo.id, { clienteId: cliente.id });

    setOpen(false);
    setNuevo(emptyCliente);
    setQ('');
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <header>
        <h2 className="text-xl font-semibold">Paso 2 · Cliente / Solicitante</h2>
        <p className="text-sm text-muted-foreground">
          Selecciona el cliente solicitante del avalúo o registra uno nuevo para este expediente.
        </p>
      </header>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre, cédula, RUC, teléfono o correo..."
            className="pl-9"
            disabled={clientes.length === 0}
          />
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Nuevo cliente
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar cliente</DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <TextField
                label="Nombre / Razón social"
                value={nuevo.nombre}
                onChange={(v) => setNuevo({ ...nuevo, nombre: v })}
              />

              <TextField
                label="Cédula / RUC"
                value={nuevo.documento}
                onChange={(v) => setNuevo({ ...nuevo, documento: v })}
              />

              <div className="grid grid-cols-2 gap-3">
                <TextField
                  label="Teléfono"
                  value={nuevo.telefono || ''}
                  onChange={(v) => setNuevo({ ...nuevo, telefono: v })}
                />

                <TextField
                  label="Email"
                  value={nuevo.email || ''}
                  onChange={(v) => setNuevo({ ...nuevo, email: v })}
                />
              </div>

              <TextField
                label="Dirección"
                value={nuevo.direccion || ''}
                onChange={(v) => setNuevo({ ...nuevo, direccion: v })}
              />
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  setNuevo(emptyCliente);
                }}
              >
                Cancelar
              </Button>

              <Button onClick={guardarYSeleccionar} disabled={!puedeGuardar}>
                Guardar y seleccionar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {clientes.length === 0 ? (
          <Card className="p-8 border-dashed">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="h-12 w-12 rounded-full bg-muted grid place-items-center">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>

              <div>
                <h3 className="font-semibold">No hay clientes registrados</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-md">
                  Registra el cliente o solicitante del avalúo. Puede ser una persona natural,
                  empresa, banco, institución o propietario solicitante.
                </p>
              </div>

              <Button onClick={() => setOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Registrar cliente
              </Button>
            </div>
          </Card>
        ) : filtered.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-6">
            No se encontraron clientes con ese criterio de búsqueda.
          </div>
        ) : (
          filtered.map((c) => {
            const selected = c.id === avaluo.clienteId;

            return (
              <Card
                key={c.id}
                className={`p-4 cursor-pointer transition-colors ${
                  selected
                    ? 'border-primary bg-primary/5'
                    : 'hover:bg-muted/30'
                }`}
                onClick={() => updateAvaluo(avaluo.id, { clienteId: c.id })}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{c.nombre}</div>

                    <div className="text-xs text-muted-foreground font-mono truncate">
                      {c.documento || 'Sin documento'}
                    </div>

                    <div className="text-xs text-muted-foreground truncate mt-1">
                      {c.email || c.telefono || c.direccion || 'Sin datos de contacto'}
                    </div>
                  </div>

                  {selected && <Check className="h-5 w-5 text-primary shrink-0" />}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}