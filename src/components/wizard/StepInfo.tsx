import { useEffect } from 'react';
import { useStore } from '@/store/avaluoStore';
import { Avaluo } from '@/store/types';
import { TextField, TextArea, Field } from '@/components/forms/Fields';
import { StringSelectWithCustom } from '@/components/forms/CatSelect';
import { TIPOS_INMUEBLE, PROPOSITOS } from '@/lib/catalogos';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

// Código del tipo de inmueble: prefijo al inicio ("IUC01 - Residencial · ..." → "IUC01").
const codigoTipo = (t: string) => {
  const m = t.match(/^\s*([A-Z]{2,4}\d{0,3})/);
  return m ? m[1] : (t.replace(/[^A-Za-z0-9]/g, '').slice(0, 5).toUpperCase() || 'XXX');
};

// Código del propósito: 2-4 letras al final ("REFERENCIA DE VALORES - RV" → "RV").
const sufijoProposito = (p: string) => {
  const m = p.match(/-\s*([A-Z]{2,4})\s*$/);
  return m ? m[1] : (p.replace(/[^A-Za-zÁÉÍÓÚÑ]/g, '').slice(0, 2).toUpperCase() || 'XX');
};

// yyyy-mm-dd → dd/mm/aa (formato natural: día / mes / año corto).
const fmtFecha = (iso: string) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d ?? ''}/${m ?? ''}/${y?.slice(-2) ?? ''}`;
};

// Limpieza para usar el nombre del cliente en el código (sin espacios, sin acentos).
const slugCliente = (n: string) =>
  (n || 'CLIENTE')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '')
    .toUpperCase()
    .slice(0, 20) || 'CLIENTE';

// Fecha actual dd/mm/aa como fallback.
const hoyFecha = () => {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${dd}/${mm}/${yy}`;
};

const generarExpediente = (tipo: string, proposito: string, fechaIso: string, clienteNombre: string) => {
  const fecha = fechaIso ? fmtFecha(fechaIso) : hoyFecha();
  return `${codigoTipo(tipo)}-${sufijoProposito(proposito)}-${fecha}-${slugCliente(clienteNombre)}`;
};

export function StepInfo({ avaluo }: { avaluo: Avaluo }) {
  const { patchAvaluo, clientes, peritos } = useStore();
  const i = avaluo.info;
  const cliente = clientes.find((c) => c.id === avaluo.clienteId);
  const perito = peritos.find((p) => p.id === avaluo.peritoId);

  const set = <K extends keyof typeof i>(k: K, v: (typeof i)[K]) =>
    patchAvaluo(avaluo.id, (a) => ({ ...a, info: { ...a.info, [k]: v } }));

  // Auto-generar número de expediente con tipo + propósito + fecha inspección + cliente.
  useEffect(() => {
    if (!i.tipoInmueble || !i.proposito) return;
    const auto = generarExpediente(i.tipoInmueble, i.proposito, i.fechaInspeccion, i.clienteNombre || cliente?.nombre || '');
    // Auto-rellenar si está vacío o sigue el patrón generado (TIPO-PROP-AA/MM/DD-CLIENTE)
    if (!i.numeroExpediente || /^[A-Z]{2,5}\d{0,3}-[A-Z]{2,4}-\d{2}\/\d{2}\/\d{2}-[A-Z0-9]+$/.test(i.numeroExpediente)) {
      if (i.numeroExpediente !== auto) set('numeroExpediente', auto);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i.tipoInmueble, i.proposito, i.fechaInspeccion, i.clienteNombre, cliente?.nombre]);

  // Prefill solicitante / cliente desde el registro si están vacíos
  useEffect(() => {
    if (cliente && !i.solicitante) set('solicitante', cliente.nombre);
    if (cliente && !i.clienteNombre) set('clienteNombre', cliente.nombre);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cliente?.id]);

  // Sincronizar SIEMPRE valuador y NIPEV desde el perito firmante (no editable aquí).
  useEffect(() => {
    if (!perito) return;
    const nipev = perito.registroSIBOIF || perito.registro || '';
    if (i.valuadorNombre !== perito.nombre) set('valuadorNombre', perito.nombre);
    if (i.valuadorNipev !== nipev) set('valuadorNipev', nipev);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perito?.id, perito?.nombre, perito?.registroSIBOIF, perito?.registro]);

  return (
    <div className="space-y-6 max-w-5xl">
      <header>
        <div className="text-xs uppercase tracking-widest text-primary">Capítulo I · INMOVAL</div>
        <h2 className="text-xl font-semibold">Información general del avalúo</h2>
        <p className="text-sm text-muted-foreground">
          Identificación del expediente, partes involucradas y fechas. La fecha de emisión aparece en la portada,
          carta de presentación y resumen firmado.
        </p>
      </header>

      {/* Identificación */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Identificación</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <StringSelectWithCustom
            label="Tipo de inmueble"
            value={i.tipoInmueble}
            onChange={(v) => set('tipoInmueble', v)}
            options={TIPOS_INMUEBLE}
          />
          <Field label="Número de expediente (automático)">
            <div className="flex gap-2">
              <Input
                value={i.numeroExpediente}
                onChange={(e) => set('numeroExpediente', e.target.value)}
                placeholder="IUC01-RV-26/05/22-CLIENTE"
                className="font-mono"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => set('numeroExpediente', generarExpediente(i.tipoInmueble, i.proposito, i.fechaInspeccion, i.clienteNombre || cliente?.nombre || ''))}
                title="Regenerar"
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
        </div>
      </section>

      {/* Partes */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Partes involucradas</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <TextField
            label={`Solicitante ${cliente ? `(registro: ${cliente.nombre})` : ''}`}
            value={i.solicitante}
            onChange={(v) => set('solicitante', v)}
            placeholder="Nombre completo del solicitante"
          />
          <TextField
            label={`Cliente ${cliente ? `(registro: ${cliente.nombre})` : ''}`}
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
            <Field label="Valuador (perito firmante)">
              <Input value={i.valuadorNombre} readOnly disabled className="bg-muted/40" placeholder="— sin perito asignado —" />
            </Field>
            <Field label="NIPEV / Licencia">
              <Input value={i.valuadorNipev} readOnly disabled className="bg-muted/40 font-mono" placeholder="—" />
            </Field>
            <p className="col-span-2 text-xs text-muted-foreground">
              Se toma automáticamente del perito firmante asignado. Para cambiarlo, edita el registro en
              <span className="font-medium"> Peritos</span> o cambia el perito en el paso inicial.
            </p>
          </div>
        </div>
      </section>

      {/* Fechas */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Fechas</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Fecha de inspección (dd/mm/aa)">
            <Input
              type="date"
              value={i.fechaInspeccion}
              onChange={(e) => set('fechaInspeccion', e.target.value)}
            />
            {i.fechaInspeccion && (
              <div className="text-xs text-muted-foreground mt-1 font-mono">{fmtFecha(i.fechaInspeccion)}</div>
            )}
          </Field>
          <Field label="Fecha de emisión (portada · carta · resumen)">
            <Input
              type="date"
              value={i.fechaAvaluo}
              onChange={(e) => set('fechaAvaluo', e.target.value)}
            />
            {i.fechaAvaluo && (
              <div className="text-xs text-muted-foreground mt-1 font-mono">{fmtFecha(i.fechaAvaluo)}</div>
            )}
          </Field>
        </div>
      </section>

      {/* Observaciones */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Observaciones</h3>
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
