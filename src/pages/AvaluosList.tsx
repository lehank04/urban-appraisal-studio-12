import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useStore } from '@/store/avaluoStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CalendarClock,
  Edit,
  Eye,
  FileText,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { consolidados, fmtMoney } from '@/lib/calculations';
import {
  EstadoPago,
  EstatusOperativo,
  PrioridadExpediente,
  TipoModuloAvaluo,
} from '@/store/types';

const ESTATUS_LABEL: Record<EstatusOperativo, string> = {
  borrador: 'Borrador',
  pendiente_inspeccion: 'Pendiente inspección',
  en_inspeccion: 'En inspección',
  en_elaboracion: 'En elaboración',
  en_revision: 'En revisión',
  listo_exportar: 'Listo para exportar',
  entregado: 'Entregado',
  cerrado: 'Cerrado',
  cancelado: 'Cancelado',
};

const PRIORIDAD_LABEL: Record<PrioridadExpediente, string> = {
  baja: 'Baja',
  normal: 'Normal',
  alta: 'Alta',
  urgente: 'Urgente',
};

const MODULO_LABEL: Record<TipoModuloAvaluo, string> = {
  urbano: 'Urbano',
  rural: 'Rural',
  maquinaria: 'Maquinaria',
  vehiculo: 'Vehículo',
  especial: 'Especial',
};

const PAGO_LABEL: Record<EstadoPago, string> = {
  pendiente: 'Pendiente',
  parcial: 'Parcial',
  pagado: 'Pagado',
  no_aplica: 'No aplica',
};

const fmtDate = (value?: string) => {
  if (!value) return '—';

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('es-NI', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

const estatusClass = (estatus: EstatusOperativo) => {
  switch (estatus) {
    case 'borrador':
      return 'border-muted-foreground/30 text-muted-foreground';
    case 'pendiente_inspeccion':
      return 'border-amber-500/40 text-amber-700 bg-amber-500/10';
    case 'en_inspeccion':
      return 'border-blue-500/40 text-blue-700 bg-blue-500/10';
    case 'en_elaboracion':
      return 'border-primary/40 text-primary bg-primary/10';
    case 'en_revision':
      return 'border-purple-500/40 text-purple-700 bg-purple-500/10';
    case 'listo_exportar':
      return 'border-emerald-500/40 text-emerald-700 bg-emerald-500/10';
    case 'entregado':
    case 'cerrado':
      return 'border-green-500/40 text-green-700 bg-green-500/10';
    case 'cancelado':
      return 'border-destructive/40 text-destructive bg-destructive/10';
    default:
      return '';
  }
};

const prioridadClass = (prioridad: PrioridadExpediente) => {
  switch (prioridad) {
    case 'baja':
      return 'border-muted-foreground/30 text-muted-foreground';
    case 'normal':
      return 'border-blue-500/40 text-blue-700 bg-blue-500/10';
    case 'alta':
      return 'border-amber-500/40 text-amber-700 bg-amber-500/10';
    case 'urgente':
      return 'border-destructive/40 text-destructive bg-destructive/10';
    default:
      return '';
  }
};

const pagoClass = (estadoPago: EstadoPago) => {
  switch (estadoPago) {
    case 'pendiente':
      return 'border-destructive/40 text-destructive bg-destructive/10';
    case 'parcial':
      return 'border-amber-500/40 text-amber-700 bg-amber-500/10';
    case 'pagado':
      return 'border-green-500/40 text-green-700 bg-green-500/10';
    case 'no_aplica':
      return 'border-muted-foreground/30 text-muted-foreground';
    default:
      return '';
  }
};

export default function AvaluosList() {
  const {
    avaluos,
    peritos,
    clientes,
    updateAvaluo,
    deleteAvaluo,
  } = useStore();

  const [q, setQ] = useState('');
  const [estatusFiltro, setEstatusFiltro] = useState<EstatusOperativo | 'todos'>('todos');
  const [moduloFiltro, setModuloFiltro] = useState<TipoModuloAvaluo | 'todos'>('todos');

  const expedientes = useMemo(() => {
    const query = q.trim().toLowerCase();

    return [...avaluos]
      .filter((a) => {
        if (estatusFiltro !== 'todos' && a.estatusOperativo !== estatusFiltro) {
          return false;
        }

        if (moduloFiltro !== 'todos' && a.tipoModulo !== moduloFiltro) {
          return false;
        }

        if (!query) return true;

        const cliente = clientes.find((c) => c.id === a.clienteId);
        const perito = peritos.find((p) => p.id === a.peritoId);

        const texto = [
          a.info.numeroExpediente,
          a.info.propietario,
          a.info.solicitante,
          a.info.clienteNombre,
          a.info.tipoInmueble,
          cliente?.nombre,
          cliente?.documento,
          perito?.nombre,
          perito?.registroSIBOIF,
          perito?.registro,
          a.id,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return texto.includes(query);
      })
      .sort((a, b) => {
        const da = new Date(a.updatedAt || a.createdAt).getTime();
        const db = new Date(b.updatedAt || b.createdAt).getTime();
        return db - da;
      });
  }, [avaluos, clientes, peritos, q, estatusFiltro, moduloFiltro]);

  const activos = avaluos.filter(
    (a) => !['entregado', 'cerrado', 'cancelado'].includes(a.estatusOperativo)
  ).length;

  const pendientesPago = avaluos.filter(
    (a) => a.estadoPago === 'pendiente' || a.estadoPago === 'parcial'
  ).length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-primary">
            Dashboard INMOVAL
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Expedientes
          </h1>
          <p className="text-sm text-muted-foreground">
            {avaluos.length} expediente(s) · {activos} activo(s) · {pendientesPago} con pago pendiente o parcial
          </p>
        </div>

        <Button asChild>
          <Link to="/avaluos/nuevo">
            <Plus className="h-4 w-4 mr-1" />
            Nuevo expediente
          </Link>
        </Button>
      </div>

      <Card className="p-4">
        <div className="grid md:grid-cols-[1fr_220px_220px] gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por expediente, cliente, propietario, perito o tipo de inmueble..."
              className="w-full h-9 rounded-md border border-input bg-background px-3 pl-9 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <select
            value={estatusFiltro}
            onChange={(e) => setEstatusFiltro(e.target.value as EstatusOperativo | 'todos')}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="todos">Todos los estatus</option>
            {Object.entries(ESTATUS_LABEL).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <select
            value={moduloFiltro}
            onChange={(e) => setModuloFiltro(e.target.value as TipoModuloAvaluo | 'todos')}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="todos">Todos los módulos</option>
            {Object.entries(MODULO_LABEL).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1180px]">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left p-3">Expediente</th>
                <th className="text-left p-3">Cliente / Propietario</th>
                <th className="text-left p-3">Módulo</th>
                <th className="text-left p-3">Perito</th>
                <th className="text-left p-3">Estatus</th>
                <th className="text-left p-3">Prioridad</th>
                <th className="text-left p-3">Fechas</th>
                <th className="text-left p-3">Pago</th>
                <th className="text-right p-3">Valor técnico</th>
                <th className="p-3"></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {expedientes.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-muted-foreground">
                    {avaluos.length === 0
                      ? 'Sin expedientes registrados.'
                      : 'No hay expedientes que coincidan con los filtros.'}
                  </td>
                </tr>
              )}

              {expedientes.map((a) => {
                const cli = clientes.find((c) => c.id === a.clienteId);
                const per = peritos.find((p) => p.id === a.peritoId);
                const c = consolidados(a);

                const pendientePago = Math.max(
                  0,
                  (a.costoServicio || 0) - (a.montoPagado || 0)
                );

                return (
                  <tr key={a.id} className="hover:bg-muted/20 align-top">
                    <td className="p-3">
                      <div className="font-medium mono text-xs">
                        {a.info.numeroExpediente || a.id.slice(0, 8)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {a.info.tipoInmueble || 'Avalúo urbano'}
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="font-medium">
                        {cli?.nombre || a.info.clienteNombre || '—'}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Prop.: {a.info.propietario || '—'}
                      </div>
                      {cli?.documento && (
                        <div className="text-xs text-muted-foreground mono">
                          {cli.documento}
                        </div>
                      )}
                    </td>

                    <td className="p-3">
                      <Badge variant="outline">
                        {MODULO_LABEL[a.tipoModulo]}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-2">
                        {a.tipoModulo === 'urbano'
                          ? 'Módulo disponible'
                          : 'Módulo futuro'}
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="font-medium">
                        {per?.nombre || '—'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        NIPEV: {per?.registroSIBOIF || per?.registro || '—'}
                      </div>
                    </td>

                    <td className="p-3">
                      <Badge
                        variant="outline"
                        className={estatusClass(a.estatusOperativo)}
                      >
                        {ESTATUS_LABEL[a.estatusOperativo]}
                      </Badge>

                      <select
                        value={a.estatusOperativo}
                        onChange={(e) =>
                          updateAvaluo(a.id, {
                            estatusOperativo: e.target.value as EstatusOperativo,
                            estado:
                              e.target.value === 'cerrado' ||
                              e.target.value === 'entregado'
                                ? 'finalizado'
                                : e.target.value === 'borrador'
                                  ? 'borrador'
                                  : 'en_proceso',
                          })
                        }
                        className="mt-2 h-8 w-full rounded-md border border-input bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-ring"
                      >
                        {Object.entries(ESTATUS_LABEL).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="p-3">
                      <Badge
                        variant="outline"
                        className={prioridadClass(a.prioridad)}
                      >
                        {PRIORIDAD_LABEL[a.prioridad]}
                      </Badge>

                      <select
                        value={a.prioridad}
                        onChange={(e) =>
                          updateAvaluo(a.id, {
                            prioridad: e.target.value as PrioridadExpediente,
                          })
                        }
                        className="mt-2 h-8 w-full rounded-md border border-input bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-ring"
                      >
                        {Object.entries(PRIORIDAD_LABEL).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="p-3">
                      <div className="flex items-start gap-2">
                        <CalendarClock className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="text-xs">
                          <div>Solicitud: {fmtDate(a.fechaSolicitud)}</div>
                          <div>Inspección: {fmtDate(a.info.fechaInspeccion)}</div>
                          <div>Entrega: {fmtDate(a.fechaEntregaEstimada)}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      <Badge
                        variant="outline"
                        className={pagoClass(a.estadoPago)}
                      >
                        {PAGO_LABEL[a.estadoPago]}
                      </Badge>

                      <div className="text-xs text-muted-foreground mt-2">
                        Servicio: {fmtMoney(a.costoServicio || 0)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Pendiente: {fmtMoney(pendientePago)}
                      </div>

                      <select
                        value={a.estadoPago}
                        onChange={(e) =>
                          updateAvaluo(a.id, {
                            estadoPago: e.target.value as EstadoPago,
                          })
                        }
                        className="mt-2 h-8 w-full rounded-md border border-input bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-ring"
                      >
                        {Object.entries(PAGO_LABEL).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="p-3 text-right">
                      <div className="font-medium">
                        {fmtMoney(c.totalReposicionNeto, a.info.moneda)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {a.terrenos.length} terreno(s)
                      </div>
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex gap-1 justify-end">
                        <Button size="icon" variant="ghost" asChild title="Vista previa">
                          <Link to={`/avaluos/${a.id}/preview`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>

                        <Button size="icon" variant="ghost" asChild title="Abrir módulo">
                          <Link to={`/avaluos/${a.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>

                        <Button
                          size="icon"
                          variant="ghost"
                          title="Eliminar expediente"
                          onClick={() =>
                            confirm('¿Eliminar este expediente? Esta acción no se puede deshacer.') &&
                            deleteAvaluo(a.id)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {a.tipoModulo !== 'urbano' && (
                        <div className="text-[10px] text-muted-foreground mt-2">
                          Pendiente módulo
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}