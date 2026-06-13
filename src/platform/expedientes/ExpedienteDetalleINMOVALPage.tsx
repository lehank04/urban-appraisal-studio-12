import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  FileText,
  FolderOpen,
  History,
  Home,
  Save,
  UserRound,
} from 'lucide-react';

import {
  getExpedientesIndiceINMOVAL,
  upsertExpedienteIndiceINMOVAL,
} from './expedienteIndexStorage';
import type { ExpedienteIndiceINMOVAL } from './expedienteIndexTypes';
import {
  getExpedienteActivityINMOVAL,
  registrarActividadExpedienteINMOVAL,
} from './expedienteActivityStorage';

function nowISO() {
  return new Date().toISOString();
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function money(value: unknown, moneda: unknown) {
  const amount = Number(value || 0);
  const currency = typeof moneda === 'string' && moneda ? moneda : 'US$';

  return `${currency} ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function label(value: unknown, fallback = '—') {
  if (value === null || value === undefined || value === '') return fallback;
  return String(value);
}

function getEstadoLabel(value: unknown) {
  const estado = String(value || 'en_cotizacion');

  const labels: Record<string, string> = {
    en_cotizacion: 'En cotización',
    cotizacion_aprobada: 'Cotización aprobada',
    abierto: 'Abierto',
    en_proceso: 'En proceso',
    inspeccion_programada: 'Inspección programada',
    inspeccion_realizada: 'Inspección realizada',
    en_avaluo: 'En avalúo',
    en_revision: 'En revisión',
    cerrado: 'Cerrado',
    cancelado: 'Cancelado',
  };

  return labels[estado] || estado.replace(/_/g, ' ');
}

function getPagoLabel(value: unknown) {
  const estado = String(value || 'pendiente');

  const labels: Record<string, string> = {
    pendiente: 'Pendiente',
    parcial: 'Parcial',
    pagado: 'Pagado',
  };

  return labels[estado] || estado;
}

function getPrioridadLabel(value: unknown) {
  const prioridad = String(value || 'normal');

  const labels: Record<string, string> = {
    baja: 'Baja',
    normal: 'Normal',
    alta: 'Alta',
    urgente: 'Urgente',
  };

  return labels[prioridad] || prioridad;
}

function normalizeExpediente(expediente: ExpedienteIndiceINMOVAL) {
  const data = expediente as any;
  const costoServicio = Number(data.costoServicio || 0);
  const montoPagado = Number(data.montoPagado || 0);
  const saldo =
    typeof data.saldo === 'number'
      ? data.saldo
      : Math.max(0, costoServicio - montoPagado);

  return {
    ...data,
    estado: data.estado || 'en_cotizacion',
    prioridad: data.prioridad || 'normal',
    estadoPago:
      data.estadoPago ||
      (saldo <= 0 && costoServicio > 0
        ? 'pagado'
        : montoPagado > 0
          ? 'parcial'
          : 'pendiente'),
    costoServicio,
    montoPagado,
    saldo,
    moneda: data.moneda || 'US$',
    tipoModulo: data.tipoModulo || 'urbano',
    clienteNombre: data.clienteNombre || 'Cliente sin nombre',
    peritoNombre: data.peritoNombre || '',
    fechaEntregaEstimada: data.fechaEntregaEstimada || '',
  } as ExpedienteIndiceINMOVAL;
}

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
      <p className="mt-2 break-words text-sm font-medium text-slate-100">
        {value || '—'}
      </p>
    </div>
  );
}

function SectionCard({
  icon,
  title,
  eyebrow,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-700 bg-slate-950/70 text-sky-300">
          {icon}
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
            {eyebrow}
          </p>
          <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
        </div>
      </div>

      {children}
    </section>
  );
}

export default function ExpedienteDetalleINMOVALPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const expedienteInicial = useMemo(() => {
    const encontrado = getExpedientesIndiceINMOVAL().find((item) => item.id === id);
    return encontrado ? normalizeExpediente(encontrado) : undefined;
  }, [id]);

  const [expediente, setExpediente] = useState<
    ExpedienteIndiceINMOVAL | undefined
  >(expedienteInicial);

  const [actividad, setActividad] = useState(() =>
    expedienteInicial ? getExpedienteActivityINMOVAL(expedienteInicial.id) : []
  );

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
              No se encontró el expediente solicitado en el índice local de INMOVAL.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const data = expediente as any;

  function guardarCambios(cambios: Record<string, any>, titulo: string) {
    const actualizado = normalizeExpediente({
      ...(expediente as any),
      ...cambios,
      actualizadoEn: nowISO(),
    } as ExpedienteIndiceINMOVAL);

    upsertExpedienteIndiceINMOVAL(actualizado);
    setExpediente(actualizado);

    registrarActividadExpedienteINMOVAL({
      expedienteId: expediente.id,
      tipo: 'nota',
      titulo,
      descripcion: 'Cambio registrado desde la ficha del expediente.',
    });

    setActividad(getExpedienteActivityINMOVAL(expediente.id));
  }

  function marcarInspeccionRealizada() {
    guardarCambios(
      {
        inspeccionRealizada: true,
        fechaInspeccionRealizada: todayISO(),
        estado: 'inspeccion_realizada',
      },
      'Inspección marcada como realizada'
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/30">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-300">
                Expediente INMOVAL
              </p>
              <h1 className="mt-2 break-words text-3xl font-bold text-slate-50">
                {label(data.codigo || data.numero || data.id)}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                Ficha operativa del expediente para gestionar cliente, inmueble,
                pago, inspección, avalúo técnico, revisión y entrega.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate('/expedientes-plataforma')}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950/50 px-4 py-3 text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver
              </button>

              <Link
                to="/avaluos/nuevo"
                className="inline-flex items-center gap-2 rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 py-3 text-sm font-medium text-sky-100 hover:bg-sky-400/20"
              >
                <FileText className="h-4 w-4" />
                Crear avalúo técnico
              </Link>

              <button
                type="button"
                onClick={marcarInspeccionRealizada}
                className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100 hover:bg-emerald-400/20"
              >
                <CheckCircle2 className="h-4 w-4" />
                Marcar inspección realizada
              </button>
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <DetailItem label="Estado" value={getEstadoLabel(data.estado)} />
          <DetailItem label="Prioridad" value={getPrioridadLabel(data.prioridad)} />
          <DetailItem label="Pago" value={getPagoLabel(data.estadoPago)} />
          <DetailItem label="Saldo" value={money(data.saldo, data.moneda)} />
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <SectionCard
            eyebrow="Cliente"
            title="Datos del cliente"
            icon={<UserRound className="h-5 w-5" />}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <DetailItem label="Cliente" value={data.clienteNombre} />
              <DetailItem label="Contacto" value={data.informacionContacto || data.clienteTelefono} />
              <DetailItem label="Correo" value={data.correoElectronico || data.clienteEmail} />
              <DetailItem label="Dirección cliente" value={data.clienteDireccion} />
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Inmueble"
            title="Datos del inmueble"
            icon={<Home className="h-5 w-5" />}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <DetailItem label="Tipo de inmueble" value={data.tipoInmuebleNombre} />
              <DetailItem label="Clasificación" value={data.clasificacionInmuebleNombre || data.clasificacionInmuebleCodigo} />
              <DetailItem label="Propósito" value={data.propositoAvaluoNombre || data.propositoAvaluoCodigo} />
              <DetailItem label="Dirección" value={data.direccionInmueble || data.ubicacionInmueble} />
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Operación"
            title="Perito, fechas e inspección"
            icon={<CalendarDays className="h-5 w-5" />}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <DetailItem label="Perito" value={data.peritoNombre || 'Sin asignar'} />
              <DetailItem label="Fecha inspección" value={data.fechaInspeccion || data.fechaInspeccionProgramada} />
              <DetailItem label="Inspección realizada" value={data.inspeccionRealizada ? 'Sí' : 'No'} />
              <DetailItem label="Entrega estimada" value={data.fechaEntregaEstimada} />
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Pago"
            title="Cotización, pago y facturación"
            icon={<CreditCard className="h-5 w-5" />}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <DetailItem label="Costo servicio" value={money(data.costoServicio, data.moneda)} />
              <DetailItem label="Pagado" value={money(data.montoPagado, data.moneda)} />
              <DetailItem label="Saldo" value={money(data.saldo, data.moneda)} />
              <DetailItem label="Estado de pago" value={getPagoLabel(data.estadoPago)} />
            </div>
          </SectionCard>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <SectionCard
            eyebrow="Avalúo"
            title="Avalúo técnico"
            icon={<ClipboardList className="h-5 w-5" />}
          >
            <div className="grid gap-3">
              <p className="text-sm leading-6 text-slate-400">
                Desde este expediente se puede crear o vincular el avalúo técnico
                correspondiente.
              </p>

              <Link
                to="/avaluos/nuevo"
                className="inline-flex w-fit items-center gap-2 rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 py-3 text-sm font-medium text-sky-100 hover:bg-sky-400/20"
              >
                <FileText className="h-4 w-4" />
                Crear avalúo técnico
              </Link>
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Archivos"
            title="Documentos y respaldo"
            icon={<FolderOpen className="h-5 w-5" />}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <DetailItem label="Archivo .imv" value={data.archivoImvNombre} />
              <DetailItem label="Drive / carpeta" value={data.driveUrl} />
            </div>

            <button
              type="button"
              onClick={() =>
                guardarCambios(
                  { archivoImvNombre: data.archivoImvNombre || 'Pendiente de respaldo' },
                  'Referencia documental actualizada'
                )
              }
              className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950/50 px-4 py-3 text-sm font-medium text-slate-200 hover:bg-slate-800"
            >
              <Save className="h-4 w-4" />
              Guardar referencia
            </button>
          </SectionCard>
        </div>

        <SectionCard
          eyebrow="Bitácora"
          title="Actividad del expediente"
          icon={<History className="h-5 w-5" />}
        >
          {actividad.length === 0 ? (
            <p className="text-sm text-slate-500">
              Todavía no hay actividad registrada.
            </p>
          ) : (
            <div className="grid gap-3">
              {actividad.slice(0, 8).map((item: any) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-100">
                        {item.titulo}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.descripcion || 'Sin descripción'}
                      </p>
                    </div>

                    <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-400">
                      {item.tipo}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
