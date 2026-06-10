import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/store/avaluoStore';
import { Perito, PlantillaId } from '@/store/types';
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
  FileBadge,
  FileText,
  Plus,
  Search,
  Trash2,
  UserCog,
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { PLANTILLAS } from '@/templates/plantillas';

const emptyPerito: Omit<Perito, 'id'> = {
  nombre: '',
  cedula: '',
  registroSIBOIF: '',
  telefono: '',
  email: '',
  direccion: '',
  plantilla: 'inmoval',
  cargo: 'Perito firmante',
  empresa: '',
  ciudad: '',
};

function PeritoForm({
  value,
  onChange,
}: {
  value: Omit<Perito, 'id'>;
  onChange: (v: Omit<Perito, 'id'>) => void;
}) {
  const plantilla = PLANTILLAS[value.plantilla];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <TextField
            label="Nombre completo / Razón profesional"
            value={value.nombre}
            onChange={(v) => onChange({ ...value, nombre: v })}
          />
        </div>

        <TextField
          label="Cédula / RUC"
          value={value.cedula || ''}
          onChange={(v) => onChange({ ...value, cedula: v })}
        />

        <TextField
          label="NIPEV / Licencia"
          value={value.registroSIBOIF || ''}
          onChange={(v) => onChange({ ...value, registroSIBOIF: v })}
        />

        <TextField
          label="Teléfono"
          value={value.telefono || ''}
          onChange={(v) => onChange({ ...value, telefono: v })}
        />

        <TextField
          label="Email"
          value={value.email || ''}
          onChange={(v) => onChange({ ...value, email: v })}
        />

        <TextField
          label="Cargo"
          value={value.cargo || ''}
          onChange={(v) => onChange({ ...value, cargo: v })}
        />

        <TextField
          label="Empresa"
          value={value.empresa || ''}
          onChange={(v) => onChange({ ...value, empresa: v })}
        />

        <TextField
          label="Ciudad"
          value={value.ciudad || ''}
          onChange={(v) => onChange({ ...value, ciudad: v })}
        />

        <div className="col-span-2">
          <TextField
            label="Dirección"
            value={value.direccion || ''}
            onChange={(v) => onChange({ ...value, direccion: v })}
          />
        </div>

        <div className="col-span-2 space-y-1.5">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">
            Plantilla documental
          </Label>

          <select
            value={value.plantilla}
            onChange={(e) =>
              onChange({ ...value, plantilla: e.target.value as PlantillaId })
            }
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            {Object.entries(PLANTILLAS).map(([k, pl]) => (
              <option key={k} value={k}>
                {pl.nombre} · {pl.empresa}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-md border border-border bg-muted/20 p-3 flex items-start gap-3">
        <div
          className="h-10 w-10 rounded grid place-items-center text-white shrink-0"
          style={{ background: plantilla.color }}
        >
          <FileBadge className="h-5 w-5" />
        </div>

        <div>
          <div className="font-medium text-sm">{plantilla.nombre}</div>
          <div className="text-xs text-muted-foreground">
            {plantilla.empresa}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {plantilla.capitulos.length} capítulo(s) · {plantilla.normativa}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PeritosPage() {
  const {
    peritos,
    avaluos,
    addPerito,
    updatePerito,
    deletePerito,
  } = useStore();

  const [q, setQ] = useState('');
  const [openNuevo, setOpenNuevo] = useState(false);
  const [nuevo, setNuevo] = useState<Omit<Perito, 'id'>>(emptyPerito);
  const [editing, setEditing] = useState<Perito | null>(null);

  const peritosFiltrados = useMemo(() => {
    const query = q.trim().toLowerCase();

    return peritos
      .filter((p) => {
        if (!query) return true;

        const plantilla = PLANTILLAS[p.plantilla];

        const texto = [
          p.nombre,
          p.cedula,
          p.registroSIBOIF,
          p.registro,
          p.telefono,
          p.email,
          p.direccion,
          p.cargo,
          p.empresa,
          p.ciudad,
          plantilla?.nombre,
          plantilla?.empresa,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return texto.includes(query);
      })
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [peritos, q]);

  const expedientesPorPerito = useMemo(() => {
    const map = new Map<string, number>();

    for (const a of avaluos) {
      if (!a.peritoId) continue;
      map.set(a.peritoId, (map.get(a.peritoId) || 0) + 1);
    }

    return map;
  }, [avaluos]);

  const activosPorPerito = useMemo(() => {
    const map = new Map<string, number>();

    for (const a of avaluos) {
      if (!a.peritoId) continue;
      if (['entregado', 'cerrado', 'cancelado'].includes(a.estatusOperativo)) {
        continue;
      }

      map.set(a.peritoId, (map.get(a.peritoId) || 0) + 1);
    }

    return map;
  }, [avaluos]);

  const puedeGuardarNuevo = nuevo.nombre.trim().length > 0;

  const puedeGuardarEdicion = !!editing && editing.nombre.trim().length > 0;

  const guardarNuevo = () => {
    if (!puedeGuardarNuevo) return;

    addPerito({
      nombre: nuevo.nombre.trim(),
      cedula: nuevo.cedula?.trim(),
      registroSIBOIF: nuevo.registroSIBOIF?.trim(),
      telefono: nuevo.telefono?.trim(),
      email: nuevo.email?.trim(),
      direccion: nuevo.direccion?.trim(),
      plantilla: nuevo.plantilla,
      cargo: nuevo.cargo?.trim(),
      empresa: nuevo.empresa?.trim(),
      ciudad: nuevo.ciudad?.trim(),
    });

    setNuevo(emptyPerito);
    setOpenNuevo(false);
  };

  const abrirEdicion = (perito: Perito) => {
    setEditing({ ...perito });
  };

  const guardarEdicion = () => {
    if (!editing || !puedeGuardarEdicion) return;

    const { id, ...patch } = editing;

    updatePerito(id, {
      nombre: patch.nombre.trim(),
      cedula: patch.cedula?.trim(),
      registroSIBOIF: patch.registroSIBOIF?.trim(),
      registro: patch.registro?.trim(),
      telefono: patch.telefono?.trim(),
      email: patch.email?.trim(),
      direccion: patch.direccion?.trim(),
      plantilla: patch.plantilla,
      cargo: patch.cargo?.trim(),
      empresa: patch.empresa?.trim(),
      ciudad: patch.ciudad?.trim(),
    });

    setEditing(null);
  };

  const eliminarPerito = (perito: Perito) => {
    const totalExpedientes = expedientesPorPerito.get(perito.id) || 0;

    const mensaje =
      totalExpedientes > 0
        ? `Este perito tiene ${totalExpedientes} expediente(s) asociado(s). Si lo eliminas, esos expedientes quedarán sin perito asignado. ¿Deseas continuar?`
        : '¿Eliminar este perito?';

    if (confirm(mensaje)) {
      deletePerito(perito.id);
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
            Peritos y plantillas
          </h1>
          <p className="text-sm text-muted-foreground">
            {peritos.length} perito(s) · cada perito puede usar su propia plantilla documental
          </p>
        </div>

        <Button onClick={() => setOpenNuevo(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Nuevo perito
        </Button>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre, NIPEV, empresa, teléfono, email o plantilla..."
            className="w-full h-9 rounded-md border border-input bg-background px-3 pl-9 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </Card>

      {peritosFiltrados.length === 0 ? (
        <Card className="p-8 border-dashed">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="h-12 w-12 rounded-full bg-muted grid place-items-center">
              <UserCog className="h-6 w-6 text-muted-foreground" />
            </div>

            <div>
              <h3 className="font-semibold">
                {peritos.length === 0
                  ? 'No hay peritos registrados'
                  : 'No hay peritos que coincidan con la búsqueda'}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                Registra peritos firmantes para asignarlos a expedientes y definir la plantilla documental usada por el módulo urbano.
              </p>
            </div>

            {peritos.length === 0 && (
              <Button onClick={() => setOpenNuevo(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Registrar perito
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {peritosFiltrados.map((p) => {
            const pl = PLANTILLAS[p.plantilla];
            const totalExpedientes = expedientesPorPerito.get(p.id) || 0;
            const activos = activosPorPerito.get(p.id) || 0;

            return (
              <Card key={p.id} className="p-5 flex flex-col">
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">
                      {pl.nombre}
                    </div>

                    <div className="font-semibold text-lg mt-1 truncate">
                      {p.nombre}
                    </div>

                    <div className="text-xs text-muted-foreground mt-1">
                      {p.cargo || 'Perito firmante'}
                      {p.empresa ? ` · ${p.empresa}` : ''}
                    </div>
                  </div>

                  <div
                    className="h-11 w-11 shrink-0 rounded grid place-items-center text-white"
                    style={{ background: pl.color }}
                  >
                    <FileBadge className="h-5 w-5" />
                  </div>
                </div>

                <dl className="mt-4 grid grid-cols-[7rem_1fr] gap-y-1 text-xs">
                  {p.cedula && (
                    <>
                      <dt className="text-muted-foreground">Cédula/RUC</dt>
                      <dd className="font-mono truncate">{p.cedula}</dd>
                    </>
                  )}

                  {(p.registroSIBOIF || p.registro) && (
                    <>
                      <dt className="text-muted-foreground">NIPEV</dt>
                      <dd className="font-mono truncate">
                        {p.registroSIBOIF || p.registro}
                      </dd>
                    </>
                  )}

                  {p.telefono && (
                    <>
                      <dt className="text-muted-foreground">Teléfono</dt>
                      <dd>{p.telefono}</dd>
                    </>
                  )}

                  {p.email && (
                    <>
                      <dt className="text-muted-foreground">Email</dt>
                      <dd className="truncate">{p.email}</dd>
                    </>
                  )}

                  {p.ciudad && (
                    <>
                      <dt className="text-muted-foreground">Ciudad</dt>
                      <dd>{p.ciudad}</dd>
                    </>
                  )}

                  {p.direccion && (
                    <>
                      <dt className="text-muted-foreground">Dirección</dt>
                      <dd className="line-clamp-2">{p.direccion}</dd>
                    </>
                  )}
                </dl>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="outline">
                    <FileText className="h-3 w-3 mr-1" />
                    {totalExpedientes} expediente(s)
                  </Badge>

                  <Badge variant="outline">
                    {activos} activo(s)
                  </Badge>

                  <Badge variant="outline">
                    {pl.capitulos.length} cap.
                  </Badge>
                </div>

                <div className="mt-4 p-3 rounded-md bg-muted/30 border border-border">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    Plantilla documental
                  </div>
                  <div className="text-sm font-medium mt-1">
                    {pl.nombre}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {pl.normativa}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border flex justify-end gap-1">
                  {totalExpedientes > 0 && (
                    <Button size="sm" variant="ghost" asChild>
                      <Link to="/avaluos">
                        <FileText className="h-4 w-4 mr-1" />
                        Expedientes
                      </Link>
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => abrirEdicion(p)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => eliminarPerito(p)}
                    title="Eliminar perito"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={openNuevo} onOpenChange={setOpenNuevo}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Registrar perito firmante</DialogTitle>
          </DialogHeader>

          <PeritoForm value={nuevo} onChange={setNuevo} />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setOpenNuevo(false);
                setNuevo(emptyPerito);
              }}
            >
              Cancelar
            </Button>

            <Button onClick={guardarNuevo} disabled={!puedeGuardarNuevo}>
              Guardar perito
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar perito firmante</DialogTitle>
          </DialogHeader>

          {editing && (
            <PeritoForm
              value={editing}
              onChange={(v) => setEditing({ ...editing, ...v })}
            />
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
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