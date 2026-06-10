import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/store/avaluoStore';
import { Cliente } from '@/store/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { TextField } from '@/components/forms/Fields';
import {
  Edit,
  FileText,
  Plus,
  Search,
  Trash2,
  Users,
} from 'lucide-react';

const emptyCliente: Omit<Cliente, 'id'> = {
  nombre: '',
  documento: '',
  telefono: '',
  email: '',
  direccion: '',
};

export default function ClientesPage() {
  const {
    clientes,
    avaluos,
    addCliente,
    updateCliente,
    deleteCliente,
  } = useStore();

  const [q, setQ] = useState('');
  const [openNuevo, setOpenNuevo] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);

  const [nuevo, setNuevo] = useState<Omit<Cliente, 'id'>>(emptyCliente);
  const [editando, setEditando] = useState<Cliente | null>(null);

  const clientesFiltrados = useMemo(() => {
    const query = q.trim().toLowerCase();

    return clientes
      .filter((c) => {
        if (!query) return true;

        const texto = [
          c.nombre,
          c.documento,
          c.telefono,
          c.email,
          c.direccion,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return texto.includes(query);
      })
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [clientes, q]);

  const expedientesPorCliente = useMemo(() => {
    const map = new Map<string, number>();

    for (const a of avaluos) {
      if (!a.clienteId) continue;
      map.set(a.clienteId, (map.get(a.clienteId) || 0) + 1);
    }

    return map;
  }, [avaluos]);

  const puedeGuardarNuevo =
    nuevo.nombre.trim().length > 0 && nuevo.documento.trim().length > 0;

  const puedeGuardarEdicion =
    !!editando &&
    editando.nombre.trim().length > 0 &&
    editando.documento.trim().length > 0;

  const guardarNuevo = () => {
    if (!puedeGuardarNuevo) return;

    addCliente({
      nombre: nuevo.nombre.trim(),
      documento: nuevo.documento.trim(),
      telefono: nuevo.telefono?.trim(),
      email: nuevo.email?.trim(),
      direccion: nuevo.direccion?.trim(),
    });

    setNuevo(emptyCliente);
    setOpenNuevo(false);
  };

  const abrirEdicion = (cliente: Cliente) => {
    setEditando({ ...cliente });
    setOpenEditar(true);
  };

  const guardarEdicion = () => {
    if (!editando || !puedeGuardarEdicion) return;

    updateCliente(editando.id, {
      nombre: editando.nombre.trim(),
      documento: editando.documento.trim(),
      telefono: editando.telefono?.trim(),
      email: editando.email?.trim(),
      direccion: editando.direccion?.trim(),
    });

    setEditando(null);
    setOpenEditar(false);
  };

  const eliminarCliente = (cliente: Cliente) => {
    const totalExpedientes = expedientesPorCliente.get(cliente.id) || 0;

    const mensaje =
      totalExpedientes > 0
        ? `Este cliente tiene ${totalExpedientes} expediente(s) asociado(s). Si lo eliminas, esos expedientes quedarán sin cliente asignado. ¿Deseas continuar?`
        : '¿Eliminar este cliente?';

    if (confirm(mensaje)) {
      deleteCliente(cliente.id);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-primary">
            Dashboard INMOVAL
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Clientes
          </h1>
          <p className="text-sm text-muted-foreground">
            {clientes.length} cliente(s) registrado(s) · usados para crear y controlar expedientes
          </p>
        </div>

        <Button onClick={() => setOpenNuevo(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Nuevo cliente
        </Button>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre, cédula/RUC, teléfono, email o dirección..."
            className="w-full h-9 rounded-md border border-input bg-background px-3 pl-9 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left p-3">Cliente</th>
                <th className="text-left p-3">Documento</th>
                <th className="text-left p-3">Contacto</th>
                <th className="text-left p-3">Dirección</th>
                <th className="text-left p-3">Expedientes</th>
                <th className="p-3"></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {clientesFiltrados.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-8 text-center text-muted-foreground"
                  >
                    {clientes.length === 0
                      ? 'No hay clientes registrados.'
                      : 'No hay clientes que coincidan con la búsqueda.'}
                  </td>
                </tr>
              )}

              {clientesFiltrados.map((c) => {
                const totalExpedientes = expedientesPorCliente.get(c.id) || 0;

                return (
                  <tr key={c.id} className="hover:bg-muted/20">
                    <td className="p-3">
                      <div className="flex items-start gap-2">
                        <div className="h-9 w-9 rounded-full bg-primary/10 grid place-items-center shrink-0">
                          <Users className="h-4 w-4 text-primary" />
                        </div>

                        <div className="min-w-0">
                          <div className="font-medium truncate">
                            {c.nombre}
                          </div>
                          <div className="text-xs text-muted-foreground mono">
                            ID: {c.id.slice(0, 8)}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3 mono text-xs">
                      {c.documento || '—'}
                    </td>

                    <td className="p-3 text-xs text-muted-foreground">
                      <div>{c.telefono || 'Sin teléfono'}</div>
                      <div>{c.email || 'Sin email'}</div>
                    </td>

                    <td className="p-3 text-xs text-muted-foreground max-w-xs">
                      <div className="line-clamp-2">
                        {c.direccion || '—'}
                      </div>
                    </td>

                    <td className="p-3">
                      <Badge variant="outline">
                        <FileText className="h-3 w-3 mr-1" />
                        {totalExpedientes}
                      </Badge>
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1">
                        {totalExpedientes > 0 && (
                          <Button
                            size="icon"
                            variant="ghost"
                            asChild
                            title="Ver expedientes"
                          >
                            <Link to="/avaluos">
                              <FileText className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => abrirEdicion(c)}
                          title="Editar cliente"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => eliminarCliente(c)}
                          title="Eliminar cliente"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={openNuevo} onOpenChange={setOpenNuevo}>
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
                setOpenNuevo(false);
                setNuevo(emptyCliente);
              }}
            >
              Cancelar
            </Button>

            <Button onClick={guardarNuevo} disabled={!puedeGuardarNuevo}>
              Guardar cliente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openEditar} onOpenChange={setOpenEditar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar cliente</DialogTitle>
          </DialogHeader>

          {editando && (
            <div className="space-y-3">
              <TextField
                label="Nombre / Razón social"
                value={editando.nombre}
                onChange={(v) => setEditando({ ...editando, nombre: v })}
              />

              <TextField
                label="Cédula / RUC"
                value={editando.documento}
                onChange={(v) => setEditando({ ...editando, documento: v })}
              />

              <div className="grid grid-cols-2 gap-3">
                <TextField
                  label="Teléfono"
                  value={editando.telefono || ''}
                  onChange={(v) => setEditando({ ...editando, telefono: v })}
                />

                <TextField
                  label="Email"
                  value={editando.email || ''}
                  onChange={(v) => setEditando({ ...editando, email: v })}
                />
              </div>

              <TextField
                label="Dirección"
                value={editando.direccion || ''}
                onChange={(v) => setEditando({ ...editando, direccion: v })}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setOpenEditar(false);
                setEditando(null);
              }}
            >
              Cancelar
            </Button>

            <Button onClick={guardarEdicion} disabled={!puedeGuardarEdicion}>
              Guardar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}