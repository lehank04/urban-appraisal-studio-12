import { Avaluo, EstadoPago, EstatusOperativo, PrioridadExpediente, TipoModuloAvaluo } from '@/store/types';
import { useStore } from '@/store/avaluoStore';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { fmtMoney } from '@/lib/calculations';
import {
  AlertTriangle,
  CalendarClock,
  CircleDollarSign,
  FileText,
  Landmark,
} from 'lucide-react';

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

const estatusToEstadoTecnico = (
  estatus: EstatusOperativo
): Avaluo['estado'] => {
  if (estatus === 'entregado' || estatus === 'cerrado') return 'finalizado';
  if (estatus === 'borrador') return 'borrador';
  return 'en_proceso';
};

const prioridadClass = (prioridad: PrioridadExpediente) => {
  switch (prioridad) {
    case 'urgente':
      return 'border-destructive/40 bg-destructive/10 text-destructive';
    case 'alta':
      return 'border-amber-500/40 bg-amber-500/10 text-amber-700';
    case 'normal':
      return 'border-blue-500/40 bg-blue-500/10 text-blue-700';
    case 'baja':
    default:
      return 'border-muted-foreground/30 text-muted-foreground';
  }
};

const pagoClass = (estadoPago: EstadoPago) => {
  switch (estadoPago) {
    case 'pagado':
      return 'border-green-500/40 bg-green-500/10 text-green-700';
    case 'parcial':
      return 'border-amber-500/40 bg-amber-500/10 text-amber-700';
    case 'pendiente':
      return 'border-destructive/40 bg-destructive/10 text-destructive';
    case 'no_aplica':
    default:
      return 'border-muted-foreground/30 text-muted-foreground';
  }
};

export function ExpedienteAdminPanel({ avaluo }: { avaluo: Avaluo }) {
  const { updateAvaluo } = useStore();

  const saldoPendiente = Math.max(
    0,
    (avaluo.costoServicio || 0) - (avaluo.montoPagado || 0)
  );

  const set = (patch: Partial<Avaluo>) => {
    updateAvaluo(avaluo.id, patch);
  };

  const setEstatus = (estatusOperativo: EstatusOperativo) => {
    updateAvaluo(avaluo.id, {
      estatusOperativo,
      estado: estatusToEstadoTecnico(estatusOperativo),
      fechaCierre:
        estatusOperativo === 'cerrado' && !avaluo.fechaCierre
          ? new Date().toISOString().slice(0, 10)
          : avaluo.fechaCierre,
    });
  };

  return (
    <Card className="p-4 border-primary/20 bg-card/80">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-primary">
            Expediente
          </div>

          <h2 className="text-lg font-semibold">
            {avaluo.info.numeroExpediente || 'Expediente sin código'}
          </h2>

          <p className="text-xs text-muted-foreground mt-1">
            Datos administrativos usados por Dashboard INMOVAL. El módulo técnico actual es el módulo urbano.
          </p>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Badge variant="outline">
            <Landmark className="h-3 w-3 mr-1" />
            {MODULO_LABEL[avaluo.tipoModulo]}
          </Badge>

          <Badge
            variant="outline"
            className={prioridadClass(avaluo.prioridad)}
          >
            {PRIORIDAD_LABEL[avaluo.prioridad]}
          </Badge>

          <Badge
            variant="outline"
            className={pagoClass(avaluo.estadoPago)}
          >
            Pago: {PAGO_LABEL[avaluo.estadoPago]}
          </Badge>
        </div>
      </div>

      {avaluo.tipoModulo !== 'urbano' && (
        <div className="mb-4 rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm flex gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-700 mt-0.5" />
          <div>
            Este expediente está marcado como módulo {MODULO_LABEL[avaluo.tipoModulo]}, pero por ahora solo está activo el módulo urbano.
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_1fr_1fr] gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <FileText className="h-4 w-4 text-primary" />
            Control operativo
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Módulo</Label>
              <select
                value={avaluo.tipoModulo}
                onChange={(e) => set({ tipoModulo: e.target.value as TipoModuloAvaluo })}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                {Object.entries(MODULO_LABEL).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-xs">Estatus</Label>
              <select
                value={avaluo.estatusOperativo}
                onChange={(e) => setEstatus(e.target.value as EstatusOperativo)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                {Object.entries(ESTATUS_LABEL).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-xs">Prioridad</Label>
              <select
                value={avaluo.prioridad}
                onChange={(e) => set({ prioridad: e.target.value as PrioridadExpediente })}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                {Object.entries(PRIORIDAD_LABEL).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-xs">Estado técnico</Label>
              <Input value={avaluo.estado} readOnly className="bg-muted/40" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <CalendarClock className="h-4 w-4 text-primary" />
            Fechas
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Fecha solicitud</Label>
              <Input
                type="date"
                value={avaluo.fechaSolicitud || ''}
                onChange={(e) => set({ fechaSolicitud: e.target.value })}
              />
            </div>

            <div>
              <Label className="text-xs">Fecha inspección</Label>
              <Input
                type="date"
                value={avaluo.info.fechaInspeccion || ''}
                onChange={(e) =>
                  set({
                    info: {
                      ...avaluo.info,
                      fechaInspeccion: e.target.value,
                    },
                  })
                }
              />
            </div>

            <div>
              <Label className="text-xs">Entrega estimada</Label>
              <Input
                type="date"
                value={avaluo.fechaEntregaEstimada || ''}
                onChange={(e) => set({ fechaEntregaEstimada: e.target.value })}
              />
            </div>

            <div>
              <Label className="text-xs">Fecha cierre</Label>
              <Input
                type="date"
                value={avaluo.fechaCierre || ''}
                onChange={(e) => set({ fechaCierre: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <CircleDollarSign className="h-4 w-4 text-primary" />
            Control financiero
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Costo servicio</Label>
              <Input
                type="number"
                min={0}
                value={avaluo.costoServicio || ''}
                onChange={(e) =>
                  set({ costoServicio: Number(e.target.value) || 0 })
                }
              />
            </div>

            <div>
              <Label className="text-xs">Monto pagado</Label>
              <Input
                type="number"
                min={0}
                value={avaluo.montoPagado || ''}
                onChange={(e) =>
                  set({ montoPagado: Number(e.target.value) || 0 })
                }
              />
            </div>

            <div>
              <Label className="text-xs">Estado pago</Label>
              <select
                value={avaluo.estadoPago}
                onChange={(e) => set({ estadoPago: e.target.value as EstadoPago })}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                {Object.entries(PAGO_LABEL).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-xs">Saldo pendiente</Label>
              <Input
                value={fmtMoney(saldoPendiente, avaluo.info.moneda)}
                readOnly
                className="bg-muted/40 font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <Label className="text-xs">Observaciones administrativas</Label>
        <Textarea
          rows={3}
          value={avaluo.observacionesAdministrativas || ''}
          onChange={(e) =>
            set({ observacionesAdministrativas: e.target.value })
          }
          placeholder="Notas internas: coordinación con cliente, entrega, pagos, visita, pendientes administrativos..."
        />
      </div>
    </Card>
  );
}