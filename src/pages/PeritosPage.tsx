import { useMemo, useState } from 'react';
import { Search, Plus, Trash2, UserCog, Pencil } from 'lucide-react';

import { useStore } from '@/store/avaluoStore';
import { Perito } from '@/store/types';
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
    <main className="imv-page">
      <div className="imv-page-inner">
        <header className="imv-page-header flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <p className="imv-eyebrow">Plataforma INMOVAL</p>

            <h1 className="imv-title-xl mt-2 text-[clamp(2.2rem,5vw,4.2rem)]">
              Peritos
            </h1>

            <p className="imv-muted mt-3 text-sm">
              {peritos.length} perito(s) o empresa(s) periciales registrados.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setOpenNuevo(true)}
            className="imv-button imv-button-dark h-12 px-6 text-sm"
          >
            <Plus className="h-4 w-4" />
            Nuevo perito
          </button>
        </header>

        <section className="imv-panel p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5c696c]" />

            <input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Buscar por nombre, NIPEV, empresa, teléfono o email..."
              className="imv-input h-12 px-4 pl-11 text-sm"
            />
          </div>
        </section>

        {peritosFiltrados.length === 0 ? (
          <section className="imv-empty-state">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-black/10 bg-white/60 text-[#101415]">
              <UserCog className="h-6 w-6" />
            </div>

            <h3 className="imv-title mt-5">
              {peritos.length === 0
                ? 'No hay peritos registrados'
                : 'No hay peritos que coincidan con la búsqueda'}
            </h3>

            <p className="imv-muted mx-auto mt-2 max-w-md text-sm">
              Registra peritos o empresas periciales para asignarlos a expedientes.
            </p>

            {peritos.length === 0 ? (
              <button
                type="button"
                onClick={() => setOpenNuevo(true)}
                className="imv-button imv-button-dark mx-auto mt-5 h-12 px-6 text-sm"
              >
                <Plus className="h-4 w-4" />
                Registrar perito
              </button>
            ) : null}
          </section>
        ) : (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {peritosFiltrados.map((perito) => (
              <article key={perito.id} className="imv-card flex flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="imv-eyebrow">
                      {perito.empresa || 'Perito / empresa pericial'}
                    </p>

                    <h2 className="mt-2 truncate text-xl font-black tracking-[-0.035em] text-[#101415]">
                      {perito.nombre}
                    </h2>

                    <p className="imv-muted mt-2 text-sm">
                      {perito.cargo || 'Perito firmante'}
                    </p>
                  </div>

                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-black/10 bg-white/60 text-[#101415]">
                    <UserCog className="h-5 w-5" />
                  </div>
                </div>

                <div className="imv-muted mt-5 grid gap-2 text-sm">
                  <p>
                    <strong className="text-[#101415]">NIPEV:</strong>{' '}
                    {perito.registroSIBOIF || perito.registro || '—'}
                  </p>
                  <p>
                    <strong className="text-[#101415]">Cédula:</strong>{' '}
                    {perito.cedula || '—'}
                  </p>
                  <p>
                    <strong className="text-[#101415]">Teléfono:</strong>{' '}
                    {perito.telefono || '—'}
                  </p>
                  <p>
                    <strong className="text-[#101415]">Correo:</strong>{' '}
                    {perito.email || '—'}
                  </p>
                  <p>
                    <strong className="text-[#101415]">Ciudad:</strong>{' '}
                    {perito.ciudad || '—'}
                  </p>
                </div>

                <div className="mt-5 flex justify-end gap-2 border-t border-black/10 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditing(perito)}
                    className="imv-button border border-black/10 bg-white/60 px-4 py-2 text-xs font-black text-[#101415]"
                  >
                    <Pencil className="h-4 w-4" />
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => eliminar(perito)}
                    className="imv-button border border-black/10 bg-white/60 px-4 py-2 text-xs font-black text-[#101415]"
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>

      <Dialog open={openNuevo} onOpenChange={setOpenNuevo}>
        <DialogContent className="max-w-2xl border-black/10 bg-[#f4f5f2] text-[#101415] shadow-2xl">
          <DialogHeader>
            <DialogTitle>Nuevo perito</DialogTitle>
          </DialogHeader>

          <PeritoForm value={nuevo} onChange={setNuevo} />

          <DialogFooter>
            <button
              type="button"
              onClick={() => setOpenNuevo(false)}
              className="imv-button border border-black/10 bg-white/60 px-5 py-3 text-sm text-[#101415]"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={guardarNuevo}
              className="imv-button imv-button-dark px-5 py-3 text-sm"
            >
              Guardar perito
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-2xl border-black/10 bg-[#f4f5f2] text-[#101415] shadow-2xl">
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
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="imv-button border border-black/10 bg-white/60 px-5 py-3 text-sm text-[#101415]"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={guardarEdicion}
              className="imv-button imv-button-dark px-5 py-3 text-sm"
            >
              Guardar cambios
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
