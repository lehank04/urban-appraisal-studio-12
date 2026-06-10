import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useStore } from '@/store/avaluoStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock,
  FileText,
  FolderOpen,
  Plus,
  TrendingUp,
  Users,
  UserCog,
  Wallet,
} from 'lucide-react';
import { consolidados, fmtMoney } from '@/lib/calculations';
import { Avaluo, EstadoPago, EstatusOperativo, PrioridadExpediente, TipoModuloAvaluo } from '@/store/types';

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

const daysUntil = (value?: string) => {
  if (!value) return null;

  const today = new Date();
  const target = new Date(`${value}T00:00:00`);

  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  if (Number.isNaN(target.getTime())) return null;

  const ms = target.getTime() - today.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
};

const isActive = (a: Avaluo) =>
  !['entregado', 'cerrado', 'cancelado'].includes(a.estatusOperativo);

const estadoBadgeClass = (estatus: EstatusOperativo) => {
  switch (estatus) {
    case 'borrador':
      return 'bg-muted text-muted-foreground border-border';
    case 'pendiente_inspeccion':
      return 'bg-amber-500/10 text-amber-700 border-amber-500/30';
    case 'en_inspeccion':
      return 'bg-blue-500/10 text-blue-700 border-blue-500/30';
    case 'en_elaboracion':
      return 'bg-primary/10 text-primary border-primary/30';
    case 'en_revision':
      return 'bg-purple-500/10 text-purple-700 border-purple-500/30';
    case 'listo_exportar':
      return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30';
    case 'entregado':
    case 'cerrado':
      return 'bg-green-500/10 text-green-700 border-green-500/30';
    case 'cancelado':
      return 'bg-destructive/10 text-destructive border-destructive/30';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};

const prioridadBadgeClass = (prioridad: PrioridadExpediente) => {
  switch (prioridad) {
    case 'baja':
      return 'bg-muted text-muted-foreground border-border';
    case 'normal':
      return 'bg-blue-500/10 text-blue-700 border-blue-500/30';
    case 'alta':
      return 'bg-amber-500/10 text-amber-700 border-amber-500/30';
    case 'urgente':
      return 'bg-destructive/10 text-destructive border-destructive/30';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};

export default function Dashboard() {
  const { avaluos, clientes, peritos } = useStore();

  const data = useMemo(() => {
    const activos = avaluos.filter(isActive);

    const pendientesInspeccion = avaluos.filter(
      (a) => a.estatusOperativo === 'pendiente_inspeccion'
    ).length;

    const enInspeccion = avaluos.filter(
      (a) => a.estatusOperativo === 'en_inspeccion'
    ).length;

    const enElaboracion = avaluos.filter(
      (a) => a.estatusOperativo === 'en_elaboracion'
    ).length;

    const enRevision = avaluos.filter(
      (a) => a.estatusOperativo === 'en_revision'
    ).length;

    const listosExportar = avaluos.filter(
      (a) => a.estatusOperativo === 'listo_exportar'
    ).length;

    const cerrados = avaluos.filter((a) =>
      ['entregado', 'cerrado'].includes(a.estatusOperativo)
    ).length;

    const urgentes = activos.filter((a) => a.prioridad === 'urgente').length;

    const valorConsolidado = avaluos.reduce(
      (sum, av) => sum + consolidados(av).totalReposicionNeto,
      0
    );

    const ingresosEstimados = avaluos.reduce(
      (sum, av) => sum + (av.costoServicio || 0),
      0
    );

    const montoPagado = avaluos.reduce(
      (sum, av) => sum + (av.montoPagado || 0),
      0
    );

    const montoPendiente = Math.max(0, ingresosEstimados - montoPagado);

    const proximasEntregas = activos
      .filter((a) => a.fechaEntregaEstimada)
      .map((a) => ({
        ...a,
        dias: daysUntil(a.fechaEntregaEstimada),
      }))
      .sort((a, b) => {
        const da = a.dias ?? 9999;
        const db = b.dias ?? 9999;
        return da - db;
      })
      .slice(0, 6);

    const recientes = [...avaluos]
      .sort((a, b) => {
        const da = new Date(a.updatedAt || a.createdAt).getTime();
        const db = new Date(b.updatedAt || b.createdAt).getTime();
        return db - da;
      })
      .slice(0, 8);

    return {
      activos,
      pendientesInspeccion,
      enInspeccion,
      enElaboracion,
      enRevision,
      listosExportar,
      cerrados,
      urgentes,
      valorConsolidado,
      ingresosEstimados,
      montoPagado,
      montoPendiente,
      proximasEntregas,
      recientes,
    };
  }, [avaluos]);

  const mainStats = [
    {
      label: 'Expedientes activos',
      value: data.activos.length,
      icon: FolderOpen,
      detail: `${avaluos.length} expediente(s) total`,
    },
    {
      label: 'Pendientes inspección',
      value: data.pendientesInspeccion,
      icon: CalendarClock,
      detail: `${data.enInspeccion} en inspección`,
    },
    {
      label: 'En elaboración',
      value: data.enElaboracion,
      icon: Clock,
      detail: `${data.enRevision} en revisión`,
    },
    {
      label: 'Listos / cerrados',
      value: data.listosExportar,
      icon: CheckCircle2,
      detail: `${data.cerrados} entregado(s) o cerrado(s)`,
    },
  ];

  const adminStats = [
    {
      label: 'Clientes',
      value: clientes.length,
      icon: Users,
    },
    {
      label: 'Peritos',
      value: peritos.length,
      icon: UserCog,
    },
    {
      label: 'Ingresos estimados',
      value: fmtMoney(data.ingresosEstimados),
      icon: Wallet,
    },
    {
      label: 'Valor consolidado',
      value: fmtMoney(data.valorConsolidado),
      icon: TrendingUp,
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-primary">
            Dashboard INMOVAL
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Centro operativo de expedientes
          </h1>
          <p className="text-sm text-muted-foreground">
            Control de avalúos urbanos, estados, fechas, clientes, peritos y pagos.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/avaluos">
              <FileText className="h-4 w-4 mr-1" />
              Ver expedientes
            </Link>
          </Button>

          <Button asChild>
            <Link to="/avaluos/nuevo">
              <Plus className="h-4 w-4 mr-1" />
              Nuevo expediente
            </Link>
          </Button>
        </div>
      </div>

      {data.urgentes > 0 && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="pt-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <div className="font-medium text-destructive">
                  Hay {data.urgentes} expediente(s) urgente(s) activo(s)
                </div>
                <div className="text-sm text-muted-foreground">
                  Revisá prioridades, fechas de entrega y estado de elaboración.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {mainStats.map((s) => (
          <Card key={s.label} className="border-border/60">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    {s.label}
                  </div>
                  <div className="text-2xl font-semibold mt-1">{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {s.detail}
                  </div>
                </div>
                <s.icon className="h-5 w-5 text-primary shrink-0" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {adminStats.map((s) => (
          <Card key={s.label} className="border-border/60">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    {s.label}
                  </div>
                  <div className="text-xl font-semibold mt-1">{s.value}</div>
                </div>
                <s.icon className="h-5 w-5 text-primary shrink-0" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Próximas entregas</CardTitle>
          </CardHeader>

          <CardContent>
            {data.proximasEntregas.length === 0 ? (
              <div className="text-sm text-muted-foreground py-8 text-center">
                No hay fechas próximas de entrega registradas.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {data.proximasEntregas.map((a) => {
                  const cliente = clientes.find((c) => c.id === a.clienteId);
                  const perito = peritos.find((p) => p.id === a.peritoId);
                  const dias = a.dias;

                  const vencimiento =
                    dias === null
                      ? '—'
                      : dias < 0
                        ? `Vencido hace ${Math.abs(dias)} día(s)`
                        : dias === 0
                          ? 'Vence hoy'
                          : `Faltan ${dias} día(s)`;

                  return (
                    <Link
                      to={`/avaluos/${a.id}`}
                      key={a.id}
                      className="block py-3 px-2 rounded hover:bg-muted/30"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="font-medium text-sm truncate">
                            {a.info.numeroExpediente || 'Sin expediente'} ·{' '}
                            {cliente?.nombre || a.info.clienteNombre || 'Sin cliente'}
                          </div>

                          <div className="text-xs text-muted-foreground mt-1">
                            {MODULO_LABEL[a.tipoModulo]} ·{' '}
                            {perito?.nombre || 'Sin perito'} ·{' '}
                            {ESTATUS_LABEL[a.estatusOperativo]}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-sm font-medium">
                            {fmtDate(a.fechaEntregaEstimada)}
                          </div>
                          <div
                            className={`text-xs ${
                              dias !== null && dias <= 2
                                ? 'text-destructive'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {vencimiento}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Control financiero</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border p-3">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  Facturado estimado
                </div>
                <div className="text-lg font-semibold mono mt-1">
                  {fmtMoney(data.ingresosEstimados)}
                </div>
              </div>

              <div className="rounded-lg border border-border p-3">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  Pagado
                </div>
                <div className="text-lg font-semibold mono mt-1">
                  {fmtMoney(data.montoPagado)}
                </div>
              </div>

              <div className="rounded-lg border border-border p-3 col-span-2 bg-primary/5">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  Pendiente por cobrar
                </div>
                <div className="text-2xl font-bold mono mt-1 text-primary">
                  {fmtMoney(data.montoPendiente)}
                </div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Estos montos salen de los campos administrativos del expediente:
              costo del servicio y monto pagado.
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Expedientes recientes</CardTitle>
        </CardHeader>

        <CardContent>
          {avaluos.length === 0 ? (
            <div className="text-sm text-muted-foreground py-8 text-center">
              No hay expedientes.{' '}
              <Link to="/avaluos/nuevo" className="text-primary underline">
                Crea el primero
              </Link>
              .
            </div>
          ) : (
            <div className="divide-y divide-border">
              {data.recientes.map((a) => {
                const cliente = clientes.find((c) => c.id === a.clienteId);
                const perito = peritos.find((p) => p.id === a.peritoId);
                const c = consolidados(a);

                return (
                  <Link
                    to={`/avaluos/${a.id}`}
                    key={a.id}
                    className="flex items-center justify-between gap-4 py-3 hover:bg-muted/30 px-2 rounded"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">
                        {a.info.numeroExpediente || 'Sin expediente'} ·{' '}
                        {cliente?.nombre ||
                          a.info.clienteNombre ||
                          a.info.propietario ||
                          'Sin cliente'}
                      </div>

                      <div className="text-xs text-muted-foreground mt-1">
                        {MODULO_LABEL[a.tipoModulo]} ·{' '}
                        {perito?.nombre || 'Sin perito'} ·{' '}
                        {fmtDate(a.fechaSolicitud)}
                      </div>

                      <div className="flex flex-wrap gap-1 mt-2">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full border ${estadoBadgeClass(
                            a.estatusOperativo
                          )}`}
                        >
                          {ESTATUS_LABEL[a.estatusOperativo]}
                        </span>

                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full border ${prioridadBadgeClass(
                            a.prioridad
                          )}`}
                        >
                          {PRIORIDAD_LABEL[a.prioridad]}
                        </span>

                        <span className="text-[10px] px-2 py-0.5 rounded-full border bg-muted text-muted-foreground border-border">
                          Pago: {PAGO_LABEL[a.estadoPago]}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-semibold">
                        {fmtMoney(c.totalReposicionNeto, a.info.moneda)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {a.terrenos.length} terreno(s)
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}