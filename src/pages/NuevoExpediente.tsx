import { FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/avaluoStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  CircleDollarSign,
  FileBadge,
  FileText,
  Plus,
  UserCog,
} from 'lucide-react';
import {
  EstatusOperativo,
  PrioridadExpediente,
  TipoModuloAvaluo,
  todayISO,
} from '@/store/types';
import { PLANTILLAS } from '@/templates/plantillas';

const MODULO_LABEL: Record<TipoModuloAvaluo, string> = {
  urbano: 'Urbano',
  rural: 'Rural',
  maquinaria: 'Maquinaria',
  vehiculo: 'Vehículo',
  especial: 'Especial',
};

const PRIORIDAD_LABEL: Record<PrioridadExpediente, string> = {
  baja: 'Baja',
  normal: 'Normal',
  alta: 'Alta',
  urgente: 'Urgente',
};

const ESTATUS_INICIAL_LABEL: Record<EstatusOperativo, string> = {
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

const codigoSugerido = () => {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');

  return `INMOVAL-U-${yy}${mm}${dd}-${hh}${min}`;
};

const estadoTecnicoDesdeEstatus = (
  estatus: EstatusOperativo
): 'borrador' | 'en_proceso' | 'finalizado' => {
  if (estatus === 'entregado' || estatus === 'cerrado') return 'finalizado';
  if (estatus === 'borrador') return 'borrador';
  return 'en_proceso';
};

export default function NuevoExpediente() {
  const navigate = useNavigate();
  const {
    clientes,
    peritos,
    createAvaluo,
    updateAvaluo,
  } = useStore();

  const [clienteId, setClienteId] = useState('');
  const [peritoId, setPeritoId] = useState('');

  const [tipoModulo, setTipoModulo] = useState<TipoModuloAvaluo>('urbano');
  const [estatusOperativo, setEstatusOperativo] =
    useState<EstatusOperativo>('borrador');
  const [prioridad, setPrioridad] = useState<PrioridadExpediente>('normal');

  const [numeroExpediente, setNumeroExpediente] = useState(codigoSugerido());
  const [tipoInmueble, setTipoInmueble] = useState('CASA DE HABITACIÓN - IU');
  const [proposito, setProposito] = useState('REFERENCIA DE VALORES - RV');
  const [propietario, setPropietario] = useState('');
  const [solicitante, setSolicitante] = useState('');

  const [fechaSolicitud, setFechaSolicitud] = useState(todayISO());
  const [fechaInspeccion, setFechaInspeccion] = useState('');
  const [fechaEntregaEstimada, setFechaEntregaEstimada] = useState('');

  const [costoServicio, setCostoServicio] = useState('');
  const [montoPagado, setMontoPagado] = useState('');

  const clienteSeleccionado = useMemo(
    () => clientes.find((c) => c.id === clienteId),
    [clientes, clienteId]
  );

  const peritoSeleccionado = useMemo(
    () => peritos.find((p) => p.id === peritoId),
    [peritos, peritoId]
  );

  const plantillaSeleccionada = peritoSeleccionado
    ? PLANTILLAS[peritoSeleccionado.plantilla]
    : null;

  const puedeCrear = numeroExpediente.trim().length > 0;

  const crear = (e: FormEvent) => {
    e.preventDefault();

    if (!puedeCrear) return;

    const av = createAvaluo();

    const costo = Number(costoServicio) || 0;
    const pagado = Number(montoPagado) || 0;

    updateAvaluo(av.id, {
      clienteId: clienteId || undefined,
      peritoId: peritoId || undefined,

      tipoModulo,
      estatusOperativo,
      prioridad,

      fechaSolicitud,
      fechaEntregaEstimada,
      costoServicio: costo,
      montoPagado: pagado,
      estadoPago:
        costo <= 0
          ? 'pendiente'
          : pagado <= 0
            ? 'pendiente'
            : pagado >= costo
              ? 'pagado'
              : 'parcial',

      estado: estadoTecnicoDesdeEstatus(estatusOperativo),

      info: {
        ...av.info,
        numeroExpediente: numeroExpediente.trim(),
        tipoInmueble,
        proposito,
        propietario,
        solicitante: solicitante || clienteSeleccionado?.nombre || '',
        clienteNombre: clienteSeleccionado?.nombre || '',
        fechaInspeccion,
        valuadorNombre: peritoSeleccionado?.nombre || '',
        valuadorNipev:
          peritoSeleccionado?.registroSIBOIF ||
          peritoSeleccionado?.registro ||
          '',
      },
    });

    navigate(`/avaluos/${av.id}`);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-primary">
            Dashboard INMOVAL
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Nuevo expediente
          </h1>
          <p className="text-sm text-muted-foreground">
            Crea la ficha administrativa, asigna cliente y perito, y luego abre el módulo técnico.
          </p>
        </div>

        <Button variant="outline" asChild>
          <Link to="/avaluos">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver a expedientes
          </Link>
        </Button>
      </div>

      <form onSubmit={crear} className="space-y-5">
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Datos base del expediente</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs">Número de expediente</Label>
              <Input
                value={numeroExpediente}
                onChange={(e) => setNumeroExpediente(e.target.value)}
                placeholder="INMOVAL-U-..."
              />
            </div>

            <div>
              <Label className="text-xs">Módulo técnico</Label>
              <select
                value={tipoModulo}
                onChange={(e) =>
                  setTipoModulo(e.target.value as TipoModuloAvaluo)
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                {Object.entries(MODULO_LABEL).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>

              {tipoModulo !== 'urbano' && (
                <p className="text-[11px] text-amber-700 mt-1">
                  Por ahora solo el módulo urbano está activo. Los demás quedan preparados para futuro.
                </p>
              )}
            </div>

            <div>
              <Label className="text-xs">Estatus inicial</Label>
              <select
                value={estatusOperativo}
                onChange={(e) =>
                  setEstatusOperativo(e.target.value as EstatusOperativo)
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                {Object.entries(ESTATUS_INICIAL_LABEL).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-xs">Prioridad</Label>
              <select
                value={prioridad}
                onChange={(e) =>
                  setPrioridad(e.target.value as PrioridadExpediente)
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                {Object.entries(PRIORIDAD_LABEL).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-xs">Tipo de inmueble</Label>
              <Input
                value={tipoInmueble}
                onChange={(e) => setTipoInmueble(e.target.value)}
              />
            </div>

            <div>
              <Label className="text-xs">Propósito</Label>
              <Input
                value={proposito}
                onChange={(e) => setProposito(e.target.value)}
              />
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-2 gap-5">
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <h2 className="font-semibold">Cliente, solicitante y propietario</h2>
            </div>

            <div className="grid gap-4">
              <div>
                <Label className="text-xs">Cliente registrado</Label>
                <select
                  value={clienteId}
                  onChange={(e) => setClienteId(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Sin cliente seleccionado</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} · {c.documento}
                    </option>
                  ))}
                </select>

                {clientes.length === 0 && (
                  <p className="text-[11px] text-muted-foreground mt-1">
                    No hay clientes registrados. Puedes crear el expediente y registrar el cliente después.
                  </p>
                )}
              </div>

              {clienteSeleccionado && (
                <div className="rounded-md border border-border bg-muted/20 p-3">
                  <div className="text-sm font-medium">
                    {clienteSeleccionado.nombre}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {clienteSeleccionado.documento}
                    {clienteSeleccionado.telefono
                      ? ` · ${clienteSeleccionado.telefono}`
                      : ''}
                    {clienteSeleccionado.email
                      ? ` · ${clienteSeleccionado.email}`
                      : ''}
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Solicitante</Label>
                  <Input
                    value={solicitante}
                    onChange={(e) => setSolicitante(e.target.value)}
                    placeholder={clienteSeleccionado?.nombre || 'Nombre del solicitante'}
                  />
                </div>

                <div>
                  <Label className="text-xs">Propietario</Label>
                  <Input
                    value={propietario}
                    onChange={(e) => setPropietario(e.target.value)}
                    placeholder="Nombre del propietario"
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <UserCog className="h-4 w-4 text-primary" />
              <h2 className="font-semibold">Perito y plantilla documental</h2>
            </div>

            <div>
              <Label className="text-xs">Perito asignado</Label>
              <select
                value={peritoId}
                onChange={(e) => setPeritoId(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Sin perito seleccionado</option>
                {peritos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} · {PLANTILLAS[p.plantilla].nombre}
                  </option>
                ))}
              </select>

              {peritos.length === 0 && (
                <p className="text-[11px] text-muted-foreground mt-1">
                  No hay peritos registrados. Puedes crear el expediente y asignar perito después.
                </p>
              )}
            </div>

            {peritoSeleccionado && plantillaSeleccionada ? (
              <div className="rounded-md border border-border bg-muted/20 p-3 flex items-start gap-3">
                <div
                  className="h-10 w-10 rounded grid place-items-center text-white shrink-0"
                  style={{ background: plantillaSeleccionada.color }}
                >
                  <FileBadge className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <div className="text-sm font-medium">
                    {peritoSeleccionado.nombre}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    NIPEV: {peritoSeleccionado.registroSIBOIF || peritoSeleccionado.registro || '—'}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Plantilla: {plantillaSeleccionada.nombre} · {plantillaSeleccionada.capitulos.length} capítulos
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1">
                    <Badge variant="outline">
                      {plantillaSeleccionada.empresa}
                    </Badge>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-md border border-dashed border-border bg-muted/10 p-3 text-sm text-muted-foreground">
                Selecciona un perito para vincular automáticamente la plantilla documental del expediente.
              </div>
            )}
          </Card>
        </div>

        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Fechas</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs">Fecha de solicitud</Label>
              <Input
                type="date"
                value={fechaSolicitud}
                onChange={(e) => setFechaSolicitud(e.target.value)}
              />
            </div>

            <div>
              <Label className="text-xs">Fecha de inspección</Label>
              <Input
                type="date"
                value={fechaInspeccion}
                onChange={(e) => setFechaInspeccion(e.target.value)}
              />
            </div>

            <div>
              <Label className="text-xs">Entrega estimada</Label>
              <Input
                type="date"
                value={fechaEntregaEstimada}
                onChange={(e) => setFechaEntregaEstimada(e.target.value)}
              />
            </div>
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <CircleDollarSign className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Control financiero inicial</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Costo del servicio</Label>
              <Input
                type="number"
                min={0}
                value={costoServicio}
                onChange={(e) => setCostoServicio(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label className="text-xs">Monto pagado</Label>
              <Input
                type="number"
                min={0}
                value={montoPagado}
                onChange={(e) => setMontoPagado(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="outline" asChild>
            <Link to="/avaluos">Cancelar</Link>
          </Button>

          <Button type="submit" disabled={!puedeCrear}>
            <Plus className="h-4 w-4 mr-1" />
            Crear expediente y abrir módulo
          </Button>
        </div>
      </form>
    </div>
  );
}