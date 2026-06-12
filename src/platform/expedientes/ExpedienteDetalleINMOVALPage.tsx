import { getConfiguracionExpedientesINMOVAL } from './expedienteConfigStorage';
import { expedientePuedeCerrarseConConfiguracion, getMensajeReglaCierreExpediente } from './expedienteConfigRules';
import { ExportarExpedienteIMVButton } from './components/ExportarExpedienteIMVButton';
﻿import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeDollarSign,
  Boxes,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  FileText,
  FolderOpen,
  Home,
  History,
  LockKeyhole,
  ReceiptText,
  CreditCard,
  Link2,
  Save,
  UserRound,
} from 'lucide-react';
import {
  getExpedientesIndiceINMOVAL,
  upsertExpedienteIndiceINMOVAL,
} from './expedienteIndexStorage';
import { ExpedienteIndiceINMOVAL } from './expedienteIndexTypes';
import { ExpedienteEstadoBadge } from './components/ExpedienteEstadoBadge';
import {
  formatMoneyINMOVAL,
  getModuloLabel,
} from './expedienteUiUtils';
import { nowISO, todayISO } from '@/shared/utils/dateUtils';
import {
  getExpedienteActivityINMOVAL,
  registrarActividadExpedienteINMOVAL,
} from './expedienteActivityStorage';

function DetailItem({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-slate-100">
        {value || '—'}
      </p>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
  tone = 'sky',
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  tone?: 'sky' | 'emerald' | 'amber' | 'rose' | 'slate';
}) {
  const classes = {
    sky: 'border-sky-400/30 bg-sky-400/10 text-sky-100 hover:bg-sky-400/20',
    emerald:
      'border-emerald-400/30 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/20',
    amber:
      'border-amber-400/30 bg-amber-400/10 text-amber-100 hover:bg-amber-400/20',
    rose: 'border-rose-400/30 bg-rose-400/10 text-rose-100 hover:bg-rose-400/20',
    slate:
      'border-slate-600 bg-slate-950/50 text-slate-200 hover:bg-slate-800',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${classes[tone]}`}
    >
      {children}
    </button>
  );
}

export default function ExpedienteDetalleINMOVALPage() {
  const configExpedientes = getConfiguracionExpedientesINMOVAL();
  const { id } = useParams();

  const expedienteInicial = useMemo(
    () => getExpedientesIndiceINMOVAL().find((item) => item.id === id),
    [id]
  );

  const [expediente, setExpediente] = useState<
    ExpedienteIndiceINMOVAL | undefined
  >(expedienteInicial);

  const [actividad, setActividad] = useState(() =>
    expedienteInicial ? getExpedienteActivityINMOVAL(expedienteInicial.id) : []
  );

  const [abonoMonto, setAbonoMonto] = useState('');
  const [prioridadDraft, setPrioridadDraft] = useState(
    expedienteInicial?.prioridad || 'normal'
  );
  const [fechaEntregaDraft, setFechaEntregaDraft] = useState(
    expedienteInicial?.fechaEntregaEstimada || ''
  );
  const [peritoDraft, setPeritoDraft] = useState(
    expedienteInicial?.peritoNombre || ''
  );
  const [driveUrlDraft, setDriveUrlDraft] = useState(
    expedienteInicial?.driveUrl || ''
  );
  const [archivoImvDraft, setArchivoImvDraft] = useState(
    expedienteInicial?.archivoImvNombre || ''
  );

  function guardarCambios(
    cambios: Partial<ExpedienteIndiceINMOVAL>,
    actividadParams?: {
      tipo: 'estado' | 'pago' | 'facturacion' | 'cierre' | 'archivo' | 'nota';
      titulo: string;
      descripcion?: string;
    }
  ) {
    if (!expediente) return;

    const actualizado: ExpedienteIndiceINMOVAL = {
      ...expediente,
      ...cambios,
      actualizadoEn: nowISO(),
    };

    upsertExpedienteIndiceINMOVAL(actualizado);
    setExpediente(actualizado);

    if (actividadParams) {
      registrarActividadExpedienteINMOVAL({
        expedienteId: expediente.id,
        tipo: actividadParams.tipo,
        titulo: actividadParams.titulo,
        descripcion: actividadParams.descripcion,
      });

      setActividad(getExpedienteActivityINMOVAL(expediente.id));
    }
  }

  function handleGuardarDatosOperativos() {
    if (!expediente) return;

    guardarCambios(
      {
        prioridad: prioridadDraft as ExpedienteIndiceINMOVAL['prioridad'],
        fechaEntregaEstimada: fechaEntregaDraft || undefined,
        peritoNombre: peritoDraft.trim() || undefined,
        driveUrl: driveUrlDraft.trim() || undefined,
        archivoImvNombre: archivoImvDraft.trim() || undefined,
      },
      {
        tipo: 'nota',
        titulo: 'Datos administrativos actualizados',
        descripcion:
          'Se actualizaron prioridad, entrega estimada, perito o referencias documentales.',
      }
    );
  }

  function handleRegistrarAbono() {
    if (!expediente) return;

    const abono = Number(abonoMonto || 0);

    if (!Number.isFinite(abono) || abono <= 0) {
      window.alert('Ingresá un monto de abono válido.');
      return;
    }

    const nuevoMontoPagado = Math.min(
      Number(expediente.costoServicio || 0),
      Number(expediente.montoPagado || 0) + abono
    );

    const nuevoSaldo = Math.max(
      0,
      Number(expediente.costoServicio || 0) - nuevoMontoPagado
    );

    guardarCambios(
      {
        montoPagado: nuevoMontoPagado,
        saldo: nuevoSaldo,
        estadoPago:
          nuevoSaldo <= 0
            ? 'pagado'
            : nuevoMontoPagado > 0
              ? 'parcial'
              : 'pendiente',
      },
      {
        tipo: 'pago',
        titulo: 'Abono registrado',
        descripcion: `Se registró un abono de ${expediente.moneda} ${abono.toFixed(
          2
        )}.`,
      }
    );

    setAbonoMonto('');
  }

  if (!expediente) {
    return (
      <div className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
        <div className="mx-auto max-w-5xl">
          <Link
            to="/expedientes-plataforma"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a expedientes
          </Link>

          <div className="mt-6 rounded-3xl border border-rose-400/20 bg-rose-400/10 p-8">
            <h1 className="text-2xl font-bold text-rose-100">
              Expediente no encontrado
            </h1>
            <p className="mt-3 text-sm leading-6 text-rose-100/80">
              No se encontró el expediente solicitado en el índice local de
              Plataforma INMOVAL.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const puedeCerrarExpediente = expedientePuedeCerrarseConConfiguracion(
    expediente,
    configExpedientes
  );

  const puedeCerrar = puedeCerrarExpediente;

  const estaCerrado = expediente.estado === 'cerrado';

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Link>

          <Link
            to="/expedientes-plataforma"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a expedientes
          </Link>

          <Link
            to="/cotizaciones"
            className="inline-flex items-center gap-2 rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 py-3 text-sm font-medium text-sky-100 hover:bg-sky-400/20"
          >
            <FileText className="h-4 w-4" />
            Cotizaciones
          </Link>

          <Link
            to="/modulos"
            className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100 hover:bg-emerald-400/20"
          >
            <Boxes className="h-4 w-4" />
            Módulos
          </Link>
        </div>

        <header className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/30">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-300">
                Expediente Plataforma INMOVAL
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-50">
                {expediente.codigo}
              </h1>
              <p className="mt-2 text-lg text-slate-300">
                {expediente.titulo}
              </p>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                Ficha administrativa del expediente. Desde aquí se controla pago,
                facturación, cierre, estado operativo y referencias documentales.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <ExpedienteEstadoBadge tipo="estado" value={expediente.estado} />
              <ExpedienteEstadoBadge
                tipo="prioridad"
                value={expediente.prioridad}
              />
              <ExpedienteEstadoBadge tipo="pago" value={expediente.estadoPago} />
            </div>
          </div>
        </header>

        <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/10 text-sky-300">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                Acciones administrativas
              </p>
              <h2 className="text-lg font-semibold text-slate-100">
                Control rápido del expediente
              </h2>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
              <ExportarExpedienteIMVButton expediente={expediente} disabled={false} />

            <ActionButton
              tone="sky"
              disabled={estaCerrado}
              onClick={() =>
                guardarCambios(
                  {
                    estado: 'en_elaboracion',
                  },
                  {
                    tipo: 'estado',
                    titulo: 'Estado actualizado',
                    descripcion: 'El expediente fue marcado como En elaboración.',
                  }
                )
              }
            >
              <ClipboardList className="h-4 w-4" />
              En elaboración
            </ActionButton>

            <ActionButton
              tone="amber"
              disabled={estaCerrado}
              onClick={() =>
                guardarCambios(
                  {
                    estado: 'en_revision',
                  },
                  {
                    tipo: 'estado',
                    titulo: 'Estado actualizado',
                    descripcion: 'El expediente fue marcado como En revisión.',
                  }
                )
              }
            >
              <FileText className="h-4 w-4" />
              En revisión
            </ActionButton>

            <ActionButton
              tone="emerald"
              disabled={estaCerrado}
              onClick={() =>
                guardarCambios(
                  {
                    estado: 'entregado',
                  },
                  {
                    tipo: 'estado',
                    titulo: 'Estado actualizado',
                    descripcion: 'El expediente fue marcado como Entregado.',
                  }
                )
              }
            >
              <CheckCircle2 className="h-4 w-4" />
              Entregado
            </ActionButton>

            <ActionButton
              tone="emerald"
              disabled={estaCerrado || expediente.estadoPago === 'pagado'}
              onClick={() =>
                guardarCambios(
                  {
                    montoPagado: expediente.costoServicio,
                    saldo: 0,
                    estadoPago: 'pagado',
                  },
                  {
                    tipo: 'pago',
                    titulo: 'Pago registrado',
                    descripcion: 'El expediente fue marcado como pagado en su totalidad.',
                  }
                )
              }
            >
              <BadgeDollarSign className="h-4 w-4" />
              Marcar pagado
            </ActionButton>

            <ActionButton
              tone="amber"
              disabled={estaCerrado || expediente.facturaEmitida}
              onClick={() =>
                guardarCambios(
                  {
                    facturaEmitida: true,
                    numeroFactura:
                      expediente.numeroFactura ||
                      `FAC-${todayISO().replace(/-/g, '')}-${expediente.codigo.slice(
                        -4
                      )}`,
                    estado: 'facturado',
                  },
                  {
                    tipo: 'facturacion',
                    titulo: 'Factura emitida',
                    descripcion: 'Se registró la emisión de factura del expediente.',
                  }
                )
              }
            >
              <ReceiptText className="h-4 w-4" />
              Emitir factura
            </ActionButton>

            <ActionButton
              tone="rose"
              disabled={estaCerrado || !puedeCerrarExpediente}
              onClick={() =>
                guardarCambios(
                  {
                    estado: 'cerrado',
                    fechaCierre: todayISO(),
                  },
                  {
                    tipo: 'cierre',
                    titulo: 'Expediente cerrado',
                    descripcion: 'El expediente fue cerrado administrativamente.',
                  }
                )
              }
            >
              <LockKeyhole className="h-4 w-4" />
              Cerrar expediente
            </ActionButton>
          </div>

          {!puedeCerrarExpediente && !estaCerrado ? (
            <p className="mt-4 text-sm text-slate-400">
              {getMensajeReglaCierreExpediente(configExpedientes)}
            </p>
          ) : null}
        </section>

        <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
              <Save className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                Edición administrativa
              </p>
              <h2 className="text-lg font-semibold text-slate-100">
                Datos rápidos del expediente
              </h2>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <label className="grid gap-2">
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                Prioridad
              </span>
              <select
                value={prioridadDraft}
                onChange={(event) => setPrioridadDraft(event.target.value)}
                disabled={estaCerrado}
                className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400 disabled:opacity-50"
              >
                <option value="baja">Baja</option>
                <option value="normal">Normal</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                Entrega estimada
              </span>
              <input
                type="date"
                value={fechaEntregaDraft}
                onChange={(event) => setFechaEntregaDraft(event.target.value)}
                disabled={estaCerrado}
                className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400 disabled:opacity-50"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                Perito asignado
              </span>
              <input
                value={peritoDraft}
                onChange={(event) => setPeritoDraft(event.target.value)}
                disabled={estaCerrado}
                placeholder="Nombre del perito"
                className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400 disabled:opacity-50"
              />
            </label>

            <label className="grid gap-2 md:col-span-2">
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                URL de Drive
              </span>
              <div className="relative">
                <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  value={driveUrlDraft}
                  onChange={(event) => setDriveUrlDraft(event.target.value)}
                  disabled={estaCerrado}
                  placeholder="https://drive.google.com/..."
                  className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950/70 pl-10 pr-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400 disabled:opacity-50"
                />
              </div>
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                Archivo .imv
              </span>
              <input
                value={archivoImvDraft}
                onChange={(event) => setArchivoImvDraft(event.target.value)}
                disabled={estaCerrado}
                placeholder="EXP-0001.imv"
                className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400 disabled:opacity-50"
              />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <ActionButton
              tone="emerald"
              disabled={estaCerrado}
              onClick={handleGuardarDatosOperativos}
            >
              <Save className="h-4 w-4" />
              Guardar datos
            </ActionButton>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/10 text-sky-300">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                Pagos parciales
              </p>
              <h2 className="text-lg font-semibold text-slate-100">
                Registrar abono
              </h2>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]">
            <input
              type="number"
              min="0"
              step="0.01"
              value={abonoMonto}
              onChange={(event) => setAbonoMonto(event.target.value)}
              disabled={estaCerrado || expediente.estadoPago === 'pagado'}
              placeholder={`Monto de abono en ${expediente.moneda}`}
              className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-sky-400 disabled:opacity-50"
            />

            <ActionButton
              tone="sky"
              disabled={estaCerrado || expediente.estadoPago === 'pagado'}
              onClick={handleRegistrarAbono}
            >
              <CreditCard className="h-4 w-4" />
              Registrar abono
            </ActionButton>
          </div>

          <p className="mt-3 text-sm text-slate-400">
            El abono actualiza monto pagado, saldo y estado de pago. Si el saldo llega a cero, el expediente queda como pagado.
          </p>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <DetailItem label="Cliente" value={expediente.clienteNombre} />
          <DetailItem label="Perito" value={expediente.peritoNombre} />
          <DetailItem label="Módulo" value={getModuloLabel(expediente.tipoModulo)} />
          <DetailItem
            label="Revisión activa"
            value={expediente.revisionActivaCodigo || 'Rev00'}
          />
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/10 text-sky-300">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                  Fechas
                </p>
                <h2 className="text-lg font-semibold text-slate-100">
                  Control operativo
                </h2>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              <DetailItem label="Solicitud" value={expediente.fechaSolicitud} />
              <DetailItem
                label="Entrega estimada"
                value={expediente.fechaEntregaEstimada}
              />
              <DetailItem label="Cierre" value={expediente.fechaCierre} />
            </div>
          </article>

          <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
                <BadgeDollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                  Pago
                </p>
                <h2 className="text-lg font-semibold text-slate-100">
                  Servicio y saldo
                </h2>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              <DetailItem
                label="Costo servicio"
                value={formatMoneyINMOVAL(
                  expediente.costoServicio,
                  expediente.moneda
                )}
              />
              <DetailItem
                label="Monto pagado"
                value={formatMoneyINMOVAL(
                  expediente.montoPagado,
                  expediente.moneda
                )}
              />
              <DetailItem
                label="Saldo"
                value={formatMoneyINMOVAL(expediente.saldo, expediente.moneda)}
              />
            </div>
          </article>

          <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10 text-amber-300">
                <ReceiptText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                  Facturación
                </p>
                <h2 className="text-lg font-semibold text-slate-100">
                  Cierre administrativo
                </h2>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              <DetailItem
                label="Factura emitida"
                value={expediente.facturaEmitida ? 'Sí' : 'No'}
              />
              <DetailItem label="Número factura" value={expediente.numeroFactura} />
              <DetailItem
                label="Puede cerrarse"
                value={puedeCerrarExpediente ? 'Sí' : 'No'}
              />
            </div>
          </article>
        </section>

        <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-600 bg-slate-950/70 text-slate-300">
              <FolderOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                Archivo y Drive
              </p>
              <h2 className="text-lg font-semibold text-slate-100">
                Referencias documentales
              </h2>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <DetailItem label="Archivo .imv" value={expediente.archivoImvNombre} />
            <DetailItem label="Drive URL" value={expediente.driveUrl} />
          </div>

          {expediente.driveUrl ? (
            <a
              href={expediente.driveUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 py-3 text-sm font-medium text-sky-100 hover:bg-sky-400/20"
            >
              Abrir en Drive
              <ExternalLink className="h-4 w-4" />
            </a>
          ) : null}
        </section>

        <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-400/20 bg-purple-400/10 text-purple-300">
              <History className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                Historial
              </p>
              <h2 className="text-lg font-semibold text-slate-100">
                Actividad del expediente
              </h2>
            </div>
          </div>

          {actividad.length === 0 ? (
            <p className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/50 p-4 text-sm text-slate-400">
              Todavía no hay actividad registrada para este expediente.
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {actividad.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4"
                >
                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                    <div>
                      <p className="text-sm font-semibold text-slate-100">
                        {item.titulo}
                      </p>
                      {item.descripcion ? (
                        <p className="mt-1 text-sm text-slate-400">
                          {item.descripcion}
                        </p>
                      ) : null}
                    </div>

                    <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-400">
                      {item.tipo}
                    </span>
                  </div>

                  <p className="mt-3 text-xs text-slate-500">
                    {item.creadoEn} · {item.usuarioNombre}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-600 bg-slate-950/70 text-slate-300">
              <UserRound className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                Auditoría
              </p>
              <h2 className="text-lg font-semibold text-slate-100">
                Creación y actualización
              </h2>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <DetailItem label="Creado en" value={expediente.creadoEn} />
            <DetailItem label="Actualizado en" value={expediente.actualizadoEn} />
          </div>
        </section>
      </div>
    </div>
  );
}
