import { useMemo, useState } from 'react';
import { Search, Plus, Trash2, UserCog, Pencil } from 'lucide-react';

import { useStore } from '@/store/avaluoStore';
import { Perito } from '@/store/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { TextField } from '@/components/forms/Fields';

type PeritoDraft = {
  nombre: string;
  cedula?: string;
  registroSIBOIF?: string;
  registro?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  cargo?: string;
  empresa?: string;
  ciudad?: string;
};

const emptyPerito: PeritoDraft = {
  nombre: '',
  cedula: '',
  registroSIBOIF: '',
  registro: '',
  telefono: '',
  email: '',
  direccion: '',
  cargo: 'Perito firmante',
  empresa: '',
  ciudad: '',
};

function cleanDraft(draft: PeritoDraft) {
  return {
    nombre: draft.nombre.trim(),
    cedula: draft.cedula?.trim(),
    registroSIBOIF: draft.registroSIBOIF?.trim(),
    registro: draft.registro?.trim(),
    telefono: draft.telefono?.trim(),
    email: draft.email?.trim(),
    direccion: draft.direccion?.trim(),
    cargo: draft.cargo?.trim(),
    empresa: draft.empresa?.trim(),
    ciudad: draft.ciudad?.trim(),
  };
}

function PeritoForm({
  value,
  onChange,
}: {
  value: PeritoDraft;
  onChange: (value: PeritoDraft) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="md:col-span-2">
        <TextField
          label="Nombre completo / Razón profesional"
          value={value.nombre}
          onChange={(nombre) => onChange({ ...value, nombre })}
        />
      </div>

      <TextField
        label="Empresa"
        value={value.empresa || ''}
        onChange={(empresa) => onChange({ ...value, empresa })}
      />

      <TextField
        label="Cargo"
        value={value.cargo || ''}
        onChange={(cargo) => onChange({ ...value, cargo })}
      />

      <TextField
        label="Cédula"
        value={value.cedula || ''}
        onChange={(cedula) => onChange({ ...value, cedula })}
      />

      <TextField
        label="NIPEV / Registro SIBOIF"
        value={value.registroSIBOIF || value.registro || ''}
        onChange={(registroSIBOIF) =>
          onChange({ ...value, registroSIBOIF, registro: registroSIBOIF })
        }
      />

      <TextField
        label="Teléfono"
        value={value.telefono || ''}
        onChange={(telefono) => onChange({ ...value, telefono })}
      />

      <TextField
        label="Correo"
        value={value.email || ''}
        onChange={(email) => onChange({ ...value, email })}
      />

      <TextField
        label="Ciudad"
        value={value.ciudad || ''}
        onChange={(ciudad) => onChange({ ...value, ciudad })}
      />

      <div className="md:col-span-2">
        <TextField
          label="Dirección"
          value={value.direccion || ''}
          onChange={(direccion) => onChange({ ...value, direccion })}
        />
      </div>
    </div>
  );
}

export default function PeritosPage() {
  const { peritos, addPerito, updatePerito, deletePerito } = useStore();

  const [q, setQ] = useState('');
  const [openNuevo, setOpenNuevo] = useState(false);
  const [nuevo, setNuevo] = useState<PeritoDraft>(emptyPerito);
  const [editing, setEditing] = useState<Perito | null>(null);

  const peritosFiltrados = useMemo(() => {
    const query = q.trim().toLowerCase();

    return peritos
      .filter((perito) => {
        if (!query) return true;

        return [
          perito.nombre,
          perito.cedula,
          perito.registroSIBOIF,
          perito.registro,
          perito.telefono,
          perito.email,
          perito.direccion,
          perito.cargo,
          perito.empresa,
          perito.ciudad,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(query);
      })
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [peritos, q]);

  function guardarNuevo() {
    if (!nuevo.nombre.trim()) return;

    addPerito(cleanDraft(nuevo) as any);
    setNuevo(emptyPerito);
    setOpenNuevo(false);
  }

  function guardarEdicion() {
    if (!editing || !editing.nombre.trim()) return;

    updatePerito(editing.id, cleanDraft(editing) as any);
    setEditing(null);
  }

  function eliminar(perito: Perito) {
    const ok = window.confirm(
      `¿Eliminar el perito ${perito.nombre}? Esta acción no elimina expedientes existentes.`
    );

    if (!ok) return;
    deletePerito(perito.id);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-6">
      <header className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 text-slate-100 shadow-xl shadow-black/20 lg:flex-row lg:items-center">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-sky-300">
            Plataforma INMOVAL
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Peritos
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            {peritos.length} perito(s) o empresa(s) periciales registrados.
          </p>
        </div>

        <Button onClick={() => setOpenNuevo(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Nuevo perito
        </Button>
      </header>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Buscar por nombre, NIPEV, empresa, teléfono o email..."
            className="h-9 w-full rounded-md border border-input bg-background px-3 pl-9 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </Card>

      {peritosFiltrados.length === 0 ? (
        <Card className="border-dashed p-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-muted">
              <UserCog className="h-6 w-6 text-muted-foreground" />
            </div>

            <div>
              <h3 className="font-semibold">
                {peritos.length === 0
                  ? 'No hay peritos registrados'
                  : 'No hay peritos que coincidan con la búsqueda'}
              </h3>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Registra peritos o empresas periciales para asignarlos a expedientes.
              </p>
            </div>

            {peritos.length === 0 ? (
              <Button onClick={() => setOpenNuevo(true)}>
                <Plus className="mr-1 h-4 w-4" />
                Registrar perito
              </Button>
            ) : null}
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {peritosFiltrados.map((perito) => (
            <Card key={perito.id} className="flex flex-col p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    {perito.empresa || 'Perito / empresa pericial'}
                  </div>

                  <div className="mt-1 truncate text-lg font-semibold">
                    {perito.nombre}
                  </div>

                  <div className="mt-2 text-sm text-muted-foreground">
                    {perito.cargo || 'Perito firmante'}
                  </div>
                </div>

                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-sky-500/10 text-sky-300">
                  <UserCog className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium text-foreground">NIPEV:</span>{' '}
                  {perito.registroSIBOIF || perito.registro || '—'}
                </div>
                <div>
                  <span className="font-medium text-foreground">Cédula:</span>{' '}
                  {perito.cedula || '—'}
                </div>
                <div>
                  <span className="font-medium text-foreground">Teléfono:</span>{' '}
                  {perito.telefono || '—'}
                </div>
                <div>
                  <span className="font-medium text-foreground">Correo:</span>{' '}
                  {perito.email || '—'}
                </div>
                <div>
                  <span className="font-medium text-foreground">Ciudad:</span>{' '}
                  {perito.ciudad || '—'}
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2 border-t border-border pt-3">
                <Button size="sm" variant="ghost" onClick={() => setEditing(perito)}>
                  <Pencil className="mr-1 h-4 w-4" />
                  Editar
                </Button>

                <Button size="sm" variant="ghost" onClick={() => eliminar(perito)}>
                  <Trash2 className="mr-1 h-4 w-4" />
                  Eliminar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={openNuevo} onOpenChange={setOpenNuevo}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nuevo perito</DialogTitle>
          </DialogHeader>

          <PeritoForm value={nuevo} onChange={setNuevo} />

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenNuevo(false)}>
              Cancelar
            </Button>
            <Button onClick={guardarNuevo}>Guardar perito</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar perito</DialogTitle>
          </DialogHeader>

          {editing ? (
            <PeritoForm
              value={editing}
              onChange={(value) => setEditing({ ...editing, ...value })}
            />
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button onClick={guardarEdicion}>Guardar cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
