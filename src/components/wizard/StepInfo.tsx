import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/store/avaluoStore';
import { Avaluo } from '@/store/types';
import { TextField, TextArea, Field } from '@/components/forms/Fields';
import { StringSelectWithCustom } from '@/components/forms/CatSelect';
import { TIPOS_INMUEBLE, PROPOSITOS } from '@/lib/catalogos';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  Building2,
  CalendarClock,
  FileText,
  RefreshCw,
  UserCog,
} from 'lucide-react';

const codigoTipo = (t: string) => {
  const m = t.match(/^\s*([A-Z]{2,4}\d{0,3})/);
  return m
    ? m[1]
    : t.replace(/[^A-Za-z0-9]/g, '').slice(0, 5).toUpperCase() || 'XXX';
};

const sufijoProposito = (p: string) => {
  const m = p.match(/-\s*([A-Z]{2,4})\s*$/);
  return m
    ? m[1]
    : p.replace(/[^A-Za-zÁÉÍÓÚÑ]/g, '').slice(0, 2).toUpperCase() || 'XX';
};

const fmtFecha = (iso: string) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${y?.slice(-2) ?? ''}${m ?? ''}${d ?? ''}`;
};

const slugCliente = (n: string) =>
  (n || 'CLIENTE')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '')
    .toUpperCase()
    .slice(0, 20) || 'CLIENTE';

const hoyFecha = () => {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}${mm}${dd}`;
};

const generarExpediente = (
  tipo: string,
  proposito: string,
  fechaIso: string,
  clienteNombre: string
) => {
  const fecha = fechaIso ? fmtFecha(fechaIso) : hoyFecha();

  return `${codigoTipo(tipo)}-${sufijoProposito(proposito)}-${fecha}-${slugCliente(
    clienteNombre
  )}`;
};

export function StepInfo({ avaluo }: { avaluo: Avaluo }) {
  const { patchAvaluo, clientes, peritos } = useStore();

  const i = avaluo.info;
  const cliente = clientes.find((c) => c.id === avaluo.clienteId);
  const perito = peritos.find((p) => p.id === avaluo.peritoId);

  const set = <K extends keyof typeof i>(k: K, v: (typeof i)[K]) =>
    patchAvaluo(avaluo.id, (a) => ({
      ...a,
      info: {
        ...a.info,
        [k]: v,
      },
    }));

  useEffect(() => {
    if (!i.tipoInmueble || !i.proposito) return;

    const auto = generarExpediente(
      i.tipoInmueble,
      i.proposito,
      i.fechaInspeccion,
      i.clienteNombre || cliente?.nombre || ''
    );

    const pareceAuto =
      /^[A-Z]{2,5}\d{0,3}-[A-Z]{2,4}-\d{6}-[A-Z0-9]+$/.test(
        i.numeroExpediente
      );

    if (!i.numeroExpediente || pareceAuto) {
      if (i.numeroExpediente !== auto) {
        set('numeroExpediente', auto);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    i.tipoInmueble,
    i.proposito,
    i.fechaInspeccion,
    i.clienteNombre,
    cliente?.nombre,
  ]);

  useEffect(() => {
    if (cliente && !i.solicitante) set('solicitante', cliente.nombre);
    if (cliente && !i.clienteNombre) set('clienteNombre', cliente.nombre);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cliente?.id]);

  useEffect(() => {
    if (!perito) return;

    const nipev = perito.registroSIBOIF || perito.registro || '';

    if (i.valuadorNombre !== perito.nombre) {
      set('valuadorNombre', perito.nombre);
    }

    if (i.valuadorNipev !== nipev) {
      set('valuadorNipev', nipev);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    perito?.id,
    perito?.nombre,
    perito?.registroSIBOIF,
    perito?.registro,
  ]);

  return (
    <div className="space-y-6 max-w-5xl">
      <header>
        <div className="text-xs uppercase tracking-widest text-primary">
          Capítulo I · Módulo urbano
        </div>

        <h2 className="text-xl font-semibold">
          Información general del informe
        </h2>

        <p className="text-sm text-muted-foreground">
          Identificación técnica y documental del avalúo. Los datos administrativos como estatus, prioridad, pagos y fechas de entrega se controlan en la ficha superior del expediente.
        </p>
      </header>

      <Card className="p-4 bg-muted/20">
        <div className="grid md:grid-cols-3 gap-3 text-sm">
          <div className="flex items-start gap-2">
            <FileText className="h-4 w-4 text-primary mt-0.5" />
            <div>
              <div className="text-xs text-muted-foreground">
                Expediente
              </div>
              <div className="font-mono text-xs">
                {i.numeroExpediente || 'Sin código'}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Building2 className="h-4 w-4 text-primary mt-0.5" />
            <div>
              <div className="text-xs text-muted-foreground">
                Cliente administrativo
              </div>
              <div className="font-medium">
                {cliente?.nombre || 'Sin cliente asignado'}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <UserCog className="h-4 w-4 text-primary mt-0.5" />
            <div>
              <div className="text-xs text-muted-foreground">
                Perito firmante
              </div>
              <div className="font-medium">
                {perito?.nombre || 'Sin perito asignado'}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {(!cliente || !perito) && (
        <Card className="p-4 border-amber-500/30 bg-amber-500/10">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-700 mt-0.5" />

            <div className="space-y-1">
              <div className="font-medium text-amber-800">
                Expediente incompleto
              </div>

              <div className="text-sm text-muted-foreground">
                Conviene asignar cliente y perito antes de generar el documento final.
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {!cliente && (
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/clientes">
                      Gestionar clientes
                    </Link>
                  </Button>
                )}

                {!perito && (
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/peritos">
                      Gestionar peritos
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Identificación del avalúo
          </h3>
          <p className="text-xs text-muted-foreground">
            Estos datos se usan en portada, carta, encabezados, resumen y capítulos del informe.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <StringSelectWithCustom
            label="Tipo de inmueble"
            value={i.tipoInmueble}
            onChange={(v) => set('tipoInmueble', v)}
            options={TIPOS_INMUEBLE}
          />

          <Field label="Número de expediente">
            <div className="flex gap-2">
              <Input
                value={i.numeroExpediente}
                onChange={(e) => set('numeroExpediente', e.target.value)}
                placeholder="IUC01-RV-260522-CLIENTE"
                className="font-mono"
              />

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() =>
                  set(
                    'numeroExpediente',
                    generarExpediente(
                      i.tipoInmueble,
                      i.proposito,
                      i.fechaInspeccion,
                      i.clienteNombre || cliente?.nombre || ''
                    )
                  )
                }
                title="Regenerar código"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </Field>

          <StringSelectWithCustom
            label="Propósito del avalúo"
            value={i.proposito}
            onChange={(v) => set('proposito', v)}
            options={PROPOSITOS}
          />

          <Field label="Moneda del informe">
            <select
              value={i.moneda}
              onChange={(e) => set('moneda', e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="US$">US$ · Dólares</option>
              <option value="C$">C$ · Córdobas</option>
            </select>
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Partes que aparecerán en el documento
          </h3>
          <p className="text-xs text-muted-foreground">
            Pueden coincidir o no con el cliente administrativo del expediente.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <TextField
            label={`Solicitante ${
              cliente ? `(registro: ${cliente.nombre})` : ''
            }`}
            value={i.solicitante}
            onChange={(v) => set('solicitante', v)}
            placeholder="Nombre completo del solicitante"
          />

          <TextField
            label={`Cliente en informe ${
              cliente ? `(registro: ${cliente.nombre})` : ''
            }`}
            value={i.clienteNombre}
            onChange={(v) => set('clienteNombre', v)}
            placeholder="Nombre completo del cliente"
          />

          <TextField
            label="Propietario del inmueble"
            value={i.propietario}
            onChange={(v) => set('propietario', v)}
            placeholder="Nombre del propietario registral"
          />

          <div className="grid grid-cols-2 gap-3">
            <Field label="Valuador">
              <Input
                value={i.valuadorNombre}
                readOnly
                disabled
                className="bg-muted/40"
                placeholder="— sin perito asignado —"
              />
            </Field>

            <Field label="NIPEV / Licencia">
              <Input
                value={i.valuadorNipev}
                readOnly
                disabled
                className="bg-muted/40 font-mono"
                placeholder="—"
              />
            </Field>

            <p className="col-span-2 text-xs text-muted-foreground">
              El valuador y NIPEV se toman automáticamente del perito asignado al expediente.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Fechas documentales
          </h3>
          <p className="text-xs text-muted-foreground">
            La inspección alimenta el código técnico. La emisión aparece en portada, carta y resumen.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Fecha de inspección">
            <Input
              type="date"
              value={i.fechaInspeccion}
              onChange={(e) => set('fechaInspeccion', e.target.value)}
            />

            {i.fechaInspeccion && (
              <div className="text-xs text-muted-foreground mt-1 font-mono">
                Código fecha: {fmtFecha(i.fechaInspeccion)}
              </div>
            )}
          </Field>

          <Field label="Fecha de emisión del informe">
            <Input
              type="date"
              value={i.fechaAvaluo}
              onChange={(e) => set('fechaAvaluo', e.target.value)}
            />

            {i.fechaAvaluo && (
              <div className="text-xs text-muted-foreground mt-1 font-mono">
                Código fecha: {fmtFecha(i.fechaAvaluo)}
              </div>
            )}
          </Field>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            <CalendarClock className="h-3 w-3 mr-1" />
            Solicitud: {avaluo.fechaSolicitud || '—'}
          </Badge>

          <Badge variant="outline">
            Entrega estimada: {avaluo.fechaEntregaEstimada || '—'}
          </Badge>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Observaciones técnicas generales
          </h3>
          <p className="text-xs text-muted-foreground">
            Observaciones que pueden salir en el informe o servir como nota técnica general del avalúo.
          </p>
        </div>

        <TextArea
          label="Observaciones generales"
          value={i.observaciones}
          onChange={(v) => set('observaciones', v)}
          rows={4}
        />
      </section>
    </div>
  );
}