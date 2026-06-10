import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/store/avaluoStore';
import { Avaluo } from '@/store/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertTriangle,
  Building2,
  Check,
  FileText,
  Plus,
  Search,
  UserRound,
} from 'lucide-react';

export function StepCliente({ avaluo }: { avaluo: Avaluo }) {
  const { clientes, avaluos, updateAvaluo } = useStore();
  const [q, setQ] = useState('');

  const clienteActual = clientes.find((c) => c.id === avaluo.clienteId);

  const expedientesPorCliente = useMemo(() => {
    const map = new Map<string, number>();

    for (const a of avaluos) {
      if (!a.clienteId) continue;
      map.set(a.clienteId, (map.get(a.clienteId) || 0) + 1);
    }

    return map;
  }, [avaluos]);

  const clientesFiltrados = useMemo(() => {
    const query = q.trim().toLowerCase();

    return clientes
      .filter((cliente) => {
        if (!query) return true;

        const texto = [
          cliente.nombre,
          cliente.documento,
          cliente.telefono,
          cliente.email,
          cliente.direccion,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return texto.includes(query);
      })
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [clientes, q]);

  const seleccionarCliente = (clienteId: string) => {
    const cliente = clientes.find((c) => c.id === clienteId);

    updateAvaluo(avaluo.id, {
      clienteId,
      info: {
        ...avaluo.info,
        clienteNombre: cliente?.nombre || '',
        solicitante: avaluo.info.solicitante || cliente?.nombre || '',
      },
    });
  };

  const limpiarCliente = () => {
    updateAvaluo(avaluo.id, {
      clienteId: undefined,
      info: {
        ...avaluo.info,
        clienteNombre: '',
      },
    });
  };

  const updateInfo = (patch: Partial<Avaluo['info']>) => {
    updateAvaluo(avaluo.id, {
      info: {
        ...avaluo.info,
        ...patch,
      },
    });
  };

  return (
    <div className="space-y-5 max-w-5xl">
      <header>
        <div className="text-xs uppercase tracking-widest text-primary">
          Módulo urbano · Expediente técnico
        </div>
        <h2 className="text-xl font-semibold">
          Cliente, solicitante y propietario
        </h2>
        <p className="text-sm text-muted-foreground">
          Confirma el cliente asignado al expediente y ajusta los nombres que saldrán en el informe.
        </p>
      </header>

      {clienteActual ? (
        <Card className="p-5 border-primary/30 bg-primary/5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 grid place-items-center shrink-0">
                <Building2 className="h-6 w-6 text-primary" />
              </div>

              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  Cliente asignado al expediente
                </div>

                <h3 className="text-lg font-semibold mt-1">
                  {clienteActual.nombre}
                </h3>

                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="outline">
                    Documento: {clienteActual.documento || '—'}
                  </Badge>

                  {clienteActual.telefono && (
                    <Badge variant="outline">
                      Tel: {clienteActual.telefono}
                    </Badge>
                  )}

                  {clienteActual.email && (
                    <Badge variant="outline">
                      {clienteActual.email}
                    </Badge>
                  )}

                  <Badge variant="outline">
                    <FileText className="h-3 w-3 mr-1" />
                    {expedientesPorCliente.get(clienteActual.id) || 0} expediente(s)
                  </Badge>
                </div>

                {clienteActual.direccion && (
                  <div className="text-xs text-muted-foreground mt-3 max-w-2xl">
                    {clienteActual.direccion}
                  </div>
                )}
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={limpiarCliente}>
              Cambiar
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-4 border-amber-500/30 bg-amber-500/10">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-700 mt-0.5" />
            <div>
              <div className="font-medium text-amber-800">
                Este expediente no tiene cliente asignado
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Puedes continuar, pero conviene asignar un cliente para controlar historial, entregas y pagos desde Dashboard INMOVAL.
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-5 space-y-4">
        <div>
          <h3 className="font-semibold">Datos que aparecerán en el informe</h3>
          <p className="text-xs text-muted-foreground">
            Estos campos son independientes del cliente administrativo. Sirven para el documento técnico.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Solicitante</Label>
            <Input
              value={avaluo.info.solicitante || ''}
              onChange={(e) => updateInfo({ solicitante: e.target.value })}
              placeholder={clienteActual?.nombre || 'Nombre del solicitante'}
            />
          </div>

          <div>
            <Label className="text-xs">Propietario</Label>
            <Input
              value={avaluo.info.propietario || ''}
              onChange={(e) => updateInfo({ propietario: e.target.value })}
              placeholder="Nombre del propietario"
            />
          </div>

          <div>
            <Label className="text-xs">Cliente en informe</Label>
            <Input
              value={avaluo.info.clienteNombre || ''}
              onChange={(e) => updateInfo({ clienteNombre: e.target.value })}
              placeholder={clienteActual?.nombre || 'Nombre del cliente'}
            />
          </div>

          <div>
            <Label className="text-xs">Tipo de inmueble</Label>
            <Input
              value={avaluo.info.tipoInmueble || ''}
              onChange={(e) => updateInfo({ tipoInmueble: e.target.value })}
              placeholder="CASA DE HABITACIÓN - IU"
            />
          </div>
        </div>
      </Card>

      {clientes.length === 0 ? (
        <Card className="p-8 border-dashed">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="h-12 w-12 rounded-full bg-muted grid place-items-center">
              <UserRound className="h-6 w-6 text-muted-foreground" />
            </div>

            <div>
              <h3 className="font-semibold">No hay clientes registrados</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                Registra clientes para asignarlos a expedientes, controlar historial y reutilizar datos administrativos.
              </p>
            </div>

            <Button asChild>
              <Link to="/clientes">
                <Plus className="h-4 w-4 mr-1" />
                Registrar cliente
              </Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold">
                {clienteActual ? 'Cambiar cliente asignado' : 'Seleccionar cliente'}
              </h3>
              <p className="text-xs text-muted-foreground">
                El cliente seleccionado queda vinculado al expediente administrativo.
              </p>
            </div>

            <Button variant="outline" asChild>
              <Link to="/clientes">
                <Plus className="h-4 w-4 mr-1" />
                Gestionar clientes
              </Link>
            </Button>
          </div>

          <Card className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar cliente por nombre, documento, teléfono, email o dirección..."
                className="w-full h-9 rounded-md border border-input bg-background px-3 pl-9 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </Card>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {clientesFiltrados.map((cliente) => {
              const selected = clienteActual?.id === cliente.id;
              const total = expedientesPorCliente.get(cliente.id) || 0;

              return (
                <Card
                  key={cliente.id}
                  onClick={() => seleccionarCliente(cliente.id)}
                  className={`p-5 cursor-pointer transition-all relative ${
                    selected
                      ? 'border-primary ring-2 ring-primary/30 bg-primary/5'
                      : 'hover:border-primary/40'
                  }`}
                >
                  {selected && (
                    <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-primary text-primary-foreground grid place-items-center">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  )}

                  <div className="h-10 w-10 rounded-md bg-primary/10 grid place-items-center mb-3">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>

                  <div className="font-semibold pr-8">
                    {cliente.nombre}
                  </div>

                  <div className="text-xs text-muted-foreground mt-1 mono">
                    {cliente.documento || 'Sin documento'}
                  </div>

                  <dl className="mt-3 grid grid-cols-[5.5rem_1fr] gap-y-1 text-xs">
                    {cliente.telefono && (
                      <>
                        <dt className="text-muted-foreground">Teléfono</dt>
                        <dd className="truncate">{cliente.telefono}</dd>
                      </>
                    )}

                    {cliente.email && (
                      <>
                        <dt className="text-muted-foreground">Email</dt>
                        <dd className="truncate">{cliente.email}</dd>
                      </>
                    )}

                    {cliente.direccion && (
                      <>
                        <dt className="text-muted-foreground">Dirección</dt>
                        <dd className="line-clamp-2">{cliente.direccion}</dd>
                      </>
                    )}
                  </dl>

                  <div className="mt-4 pt-3 border-t border-border text-[10px] uppercase tracking-wider text-muted-foreground">
                    {total} expediente(s) asociado(s)
                  </div>
                </Card>
              );
            })}
          </div>

          {clientesFiltrados.length === 0 && (
            <Card className="p-6 text-center text-sm text-muted-foreground border-dashed">
              No hay clientes que coincidan con la búsqueda.
            </Card>
          )}
        </div>
      )}
    </div>
  );
}