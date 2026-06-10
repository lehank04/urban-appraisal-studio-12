import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useStore } from '@/store/avaluoStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  FilePlus2,
  UserCog,
  Users,
  Wallet,
} from 'lucide-react';
import { consolidados, fmtMoney } from '@/lib/calculations';

const money = (n: number) => fmtMoney(n || 0, 'US$');

export default function Dashboard() {
  const { avaluos, clientes, peritos } = useStore();

  const data = useMemo(() => {
    const activos = avaluos.filter(
      (a) => !['entregado', 'cerrado', 'cancelado'].includes(a.estatusOperativo)
    );

    const urgentes = avaluos.filter((a) => a.prioridad === 'urgente');

    const pendientesInspeccion = avaluos.filter(
      (a) => a.estatusOperativo === 'pendiente_inspeccion'
    );

    const enRevision = avaluos.filter(
      (a) => a.estatusOperativo === 'en_revision'
    );

    const listos = avaluos.filter(
      (a) => a.estatusOperativo === 'listo_exportar'
    );

    const pagosPendientes = avaluos.filter(
      (a) => a.estadoPago === 'pendiente' || a.estadoPago === 'parcial'
    );

    const ingresosEstimados = avaluos.reduce(
      (acc, a) => acc + (a.costoServicio || 0),
      0
    );

    const pendienteCobro = avaluos.reduce(
      (acc, a) =>
        acc + Math.max(0, (a.costoServicio || 0) - (a.montoPagado || 0)),
      0
    );

    const valorTecnico = avaluos.reduce(
      (acc, a) => acc + consolidados(a).totalReposicionNeto,
      0
    );

    const recientes = [...avaluos]
      .sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt).getTime() -
          new Date(a.updatedAt || a.createdAt).getTime()
      )
      .slice(0, 6);

    return {
      activos,
      urgentes,
      pendientesInspeccion,
      enRevision,
      listos,
      pagosPendientes,
      ingresosEstimados,
      pendienteCobro,
      valorTecnico,
      recientes,
    };
  }, [avaluos]);

  return (
    <div className="p-5 lg:p-7 space-y-6 text-slate-100">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#0f172a] border border-slate-700 shadow-xl shadow-black/20">
        <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_top_left,#0ea5e9,transparent_32%),radial-gradient(circle_at_bottom_right,#0f766e,transparent_36%)]" />
        <div className="absolute inset-0 bg-[#0f172a]/68" />

        <div className="relative p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-sky-400/10 border border-sky-300/20 px-3 py-1 text-xs text-sky-200 mb-5">
                <BarChart3 className="h-3.5 w-3.5 text-sky-300" />
                Dashboard INMOVAL
              </div>

              <h1 className="text-4xl lg:text-5xl font-light tracking-tight leading-tight text-slate-100">
                Control completo de tus{' '}
                <span className="text-sky-300 font-semibold">
                  expedientes de avalúo
                </span>
              </h1>

              <p className="text-sm lg:text-base text-slate-300 mt-4 max-w-xl">
                Vista ejecutiva para estados, clientes, peritos, pagos, fechas,
                valores técnicos y avance del módulo urbano.
              </p>

              <div className="flex flex-wrap gap-3 mt-6">
                <Button
                  asChild
                  className="rounded-full bg-sky-500 text-white hover:bg-sky-400"
                >
                  <Link to="/avaluos/nuevo">
                    <FilePlus2 className="h-4 w-4 mr-2" />
                    Nuevo expediente
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="rounded-full border-slate-600 bg-slate-800/80 text-slate-100 hover:bg-slate-700 hover:text-white"
                >
                  <Link to="/avaluos">
                    <ClipboardList className="h-4 w-4 mr-2" />
                    Ver expedientes
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 min-w-[280px]">
              <MiniStat label="Activos" value={data.activos.length} />
              <MiniStat label="Urgentes" value={data.urgentes.length} />
              <MiniStat label="Clientes" value={clientes.length} />
              <MiniStat label="Peritos" value={peritos.length} />
            </div>
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-4 gap-4">
        <MetricCard
          title="Expedientes activos"
          value={data.activos.length.toString()}
          subtitle={`${avaluos.length} expediente(s) totales`}
          icon={ClipboardList}
        />

        <MetricCard
          title="Pendiente inspección"
          value={data.pendientesInspeccion.length.toString()}
          subtitle="Requieren programación"
          icon={CalendarClock}
        />

        <MetricCard
          title="Listos para exportar"
          value={data.listos.length.toString()}
          subtitle="Documentos casi cerrados"
          icon={CheckCircle2}
        />

        <MetricCard
          title="Pagos pendientes"
          value={data.pagosPendientes.length.toString()}
          subtitle={money(data.pendienteCobro)}
          icon={Wallet}
          warning
        />
      </section>

      <section className="grid xl:grid-cols-[1.5fr_0.9fr] gap-5">
        <Card className="p-5 rounded-[1.75rem] border-slate-700 bg-[#1f2937] shadow-lg shadow-black/10">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div>
              <div className="text-xs uppercase tracking-widest text-slate-500">
                Flujo operativo
              </div>
              <h2 className="text-xl font-semibold text-slate-100">
                Estado general de expedientes
              </h2>
            </div>

            <Button
              asChild
              variant="outline"
              className="rounded-full border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white"
            >
              <Link to="/avaluos">
                Abrir lista
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-5 gap-3">
            <FlowCard label="Activos" value={data.activos.length} />
            <FlowCard
              label="Inspección"
              value={data.pendientesInspeccion.length}
            />
            <FlowCard label="Revisión" value={data.enRevision.length} />
            <FlowCard label="Exportar" value={data.listos.length} />
            <FlowCard label="Urgentes" value={data.urgentes.length} danger />
          </div>

          <div className="mt-5 rounded-[1.5rem] bg-[#111827] p-4 border border-slate-700">
            <div className="grid md:grid-cols-3 gap-4">
              <ValueBlock
                label="Ingresos estimados"
                value={money(data.ingresosEstimados)}
              />

              <ValueBlock
                label="Pendiente de cobro"
                value={money(data.pendienteCobro)}
              />

              <ValueBlock
                label="Valor técnico consolidado"
                value={money(data.valorTecnico)}
              />
            </div>
          </div>
        </Card>

        <Card className="p-5 rounded-[1.75rem] border-slate-700 bg-[#1f2937] shadow-lg shadow-black/10">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div>
              <div className="text-xs uppercase tracking-widest text-slate-500">
                Capital humano
              </div>
              <h2 className="text-xl font-semibold text-slate-100">
                Clientes y peritos
              </h2>
            </div>
          </div>

          <div className="space-y-3">
            <LinkCard
              to="/clientes"
              icon={Users}
              title="Clientes registrados"
              value={clientes.length.toString()}
              subtitle="Base administrativa de expedientes"
            />

            <LinkCard
              to="/peritos"
              icon={UserCog}
              title="Peritos firmantes"
              value={peritos.length.toString()}
              subtitle="Plantillas y responsables técnicos"
            />

            <LinkCard
              to="/avaluos/nuevo"
              icon={FilePlus2}
              title="Crear expediente"
              value="+"
              subtitle="Ficha administrativa + módulo urbano"
            />
          </div>
        </Card>
      </section>

      <section className="grid xl:grid-cols-[1.2fr_1fr] gap-5">
        <Card className="p-5 rounded-[1.75rem] border-slate-700 bg-[#1f2937] shadow-lg shadow-black/10">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div>
              <div className="text-xs uppercase tracking-widest text-slate-500">
                Actividad reciente
              </div>
              <h2 className="text-xl font-semibold text-slate-100">
                Últimos expedientes
              </h2>
            </div>

            <Button
              asChild
              variant="outline"
              className="rounded-full border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white"
            >
              <Link to="/avaluos">Todos</Link>
            </Button>
          </div>

          <div className="space-y-2">
            {data.recientes.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-600 p-8 text-center text-sm text-slate-400">
                No hay expedientes todavía.
              </div>
            ) : (
              data.recientes.map((a) => {
                const cliente = clientes.find((c) => c.id === a.clienteId);
                const perito = peritos.find((p) => p.id === a.peritoId);

                return (
                  <Link
                    key={a.id}
                    to={`/avaluos/${a.id}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-700 bg-[#111827] px-4 py-3 hover:border-sky-500/40 hover:bg-[#142033] transition"
                  >
                    <div className="min-w-0">
                      <div className="font-medium truncate text-slate-100">
                        {a.info.numeroExpediente || a.id.slice(0, 8)}
                      </div>
                      <div className="text-xs text-slate-400 truncate">
                        {cliente?.nombre || a.info.clienteNombre || 'Sin cliente'} ·{' '}
                        {perito?.nombre || 'Sin perito'}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-semibold text-sky-300">
                        {fmtMoney(
                          consolidados(a).totalReposicionNeto,
                          a.info.moneda
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {a.estatusOperativo.replace(/_/g, ' ')}
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </Card>

        <Card className="p-5 rounded-[1.75rem] border-slate-700 bg-[#1f2937] shadow-lg shadow-black/10">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div>
              <div className="text-xs uppercase tracking-widest text-slate-500">
                Alertas
              </div>
              <h2 className="text-xl font-semibold text-slate-100">
                Revisión rápida
              </h2>
            </div>

            <AlertTriangle className="h-5 w-5 text-sky-300" />
          </div>

          <div className="space-y-3">
            <DarkAlert
              title="Urgentes"
              value={data.urgentes.length}
              text="Expedientes marcados como prioridad urgente."
              danger
            />

            <DarkAlert
              title="Pagos"
              value={data.pagosPendientes.length}
              text="Expedientes con pago pendiente o parcial."
            />

            <DarkAlert
              title="Revisión"
              value={data.enRevision.length}
              text="Expedientes esperando revisión técnica."
            />
          </div>
        </Card>
      </section>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[1.35rem] bg-slate-900/55 border border-slate-600/70 p-4">
      <div className="text-3xl font-light text-sky-300">{value}</div>
      <div className="text-xs mt-1 text-slate-400">{label}</div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  warning,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: any;
  warning?: boolean;
}) {
  return (
    <Card className="p-5 rounded-[1.75rem] border-slate-700 bg-[#1f2937] shadow-lg shadow-black/10">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-slate-400">{title}</div>
          <div className={`text-3xl font-semibold mt-2 ${warning ? 'text-amber-300' : 'text-sky-300'}`}>
            {value}
          </div>
          <div className="text-xs text-slate-500 mt-1">{subtitle}</div>
        </div>

        <div className={`h-11 w-11 rounded-2xl grid place-items-center ${
          warning
            ? 'bg-amber-500/10 text-amber-300'
            : 'bg-sky-500/10 text-sky-300'
        }`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

function FlowCard({
  label,
  value,
  danger,
}: {
  label: string;
  value: number;
  danger?: boolean;
}) {
  return (
    <div className={`rounded-[1.35rem] border p-4 ${
      danger
        ? 'border-rose-400/25 bg-rose-500/10'
        : 'border-slate-600/70 bg-slate-900/45'
    }`}>
      <div className={`text-3xl font-semibold ${danger ? 'text-rose-300' : 'text-sky-300'}`}>
        {value}
      </div>
      <div className="text-xs text-slate-400 mt-1">{label}</div>
    </div>
  );
}

function ValueBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-xl font-semibold mt-1 text-slate-100">{value}</div>
    </div>
  );
}

function LinkCard({
  to,
  icon: Icon,
  title,
  value,
  subtitle,
}: {
  to: string;
  icon: any;
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <Link
      to={to}
      className="rounded-[1.35rem] border border-slate-700 bg-[#111827] p-4 flex items-center justify-between gap-3 hover:border-sky-500/40 hover:bg-[#142033] transition"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-10 w-10 rounded-2xl bg-sky-500/10 text-sky-300 grid place-items-center shrink-0">
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <div className="font-medium truncate text-slate-100">{title}</div>
          <div className="text-xs text-slate-400 truncate">{subtitle}</div>
        </div>
      </div>

      <div className="text-2xl font-semibold text-sky-300">
        {value}
      </div>
    </Link>
  );
}

function DarkAlert({
  title,
  value,
  text,
  danger,
}: {
  title: string;
  value: number;
  text: string;
  danger?: boolean;
}) {
  return (
    <div className={`rounded-[1.35rem] border p-4 ${
      danger
        ? 'bg-rose-500/10 border-rose-400/25'
        : 'bg-slate-900/45 border-slate-600/70'
    }`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-medium text-slate-100">{title}</div>
          <div className="text-xs text-slate-400 mt-1">{text}</div>
        </div>

        <div className={`text-3xl font-light ${danger ? 'text-rose-300' : 'text-sky-300'}`}>
          {value}
        </div>
      </div>
    </div>
  );
}