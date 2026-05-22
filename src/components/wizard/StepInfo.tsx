import { useEffect } from 'react';
import { useStore } from '@/store/avaluoStore';
import { Avaluo } from '@/store/types';
import { TextField, TextArea, Field } from '@/components/forms/Fields';
import { StringSelectWithCustom } from '@/components/forms/CatSelect';
import { TIPOS_INMUEBLE, PROPOSITOS } from '@/lib/catalogos';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

// Sufijo después del " - " (CASA DE HABITACIÓN - IU → IU). Fallback: primeras 2 letras.
const sufijoTipo = (t: string) => {
  const m = t.match(/-\s*([A-Z]{1,4})\s*$/);
  if (m) return m[1];
  return t.replace(/[^A-Za-zÁÉÍÓÚÑ]/g, '').slice(0, 2).toUpperCase() || 'XX';
};

const generarExpediente = (tipo: string, id: string) => {
  const year = new Date().getFullYear();
  const short = id.replace(/-/g, '').slice(0, 4).toUpperCase();
  return `INM-${sufijoTipo(tipo)}-${year}-${short}`;
};

// yyyy-mm-dd → aa/mm/dd
const fmtAaMmDd = (iso: string) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${y?.slice(-2) ?? ''}/${m ?? ''}/${d ?? ''}`;
};

export function StepInfo({ avaluo }: { avaluo: Avaluo }) {
  const { patchAvaluo, clientes, peritos } = useStore();
  const i = avaluo.info;
  const cliente = clientes.find((c) => c.id === avaluo.clienteId);
  const perito = peritos.find((p) => p.id === avaluo.peritoId);

  const set = <K extends keyof typeof i>(k: K, v: (typeof i)[K]) =>
    patchAvaluo(avaluo.id, (a) => ({ ...a, info: { ...a.info, [k]: v } }));

  // Auto-generar número de expediente cuando esté vacío o cuando cambie el tipo de inmueble.
  useEffect(() => {
    if (!i.tipoInmueble) return;
    const auto = generarExpediente(i.tipoInmueble, avaluo.id);
    // Solo auto-rellenar si está vacío o si sigue el patrón generado (para reaccionar al cambio de tipo)
    if (!i.numeroExpediente || /^INM-[A-Z]{1,4}-\d{4}-[A-Z0-9]{4}$/.test(i.numeroExpediente)) {
      if (i.numeroExpediente !== auto) set('numeroExpediente', auto);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i.tipoInmueble]);

  // Prefill solicitante / cliente desde el registro si están vacíos
  useEffect(() => {
    if (cliente && !i.solicitante) set('solicitante', cliente.nombre);
    if (cliente && !i.clienteNombre) set('clienteNombre', cliente.nombre);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cliente?.id]);

  // Prefill valuador desde el perito firmante
  useEffect(() => {
    if (perito && !i.valuadorNombre) set('valuadorNombre', perito.nombre);
    if (perito && !i.valuadorNipev) set('valuadorNipev', perito.registroSIBOIF || perito.registro || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perito?.id]);

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
                placeholder="INM-IU-2026-AB12"
                className="font-mono"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => set('numeroExpediente', generarExpediente(i.tipoInmueble, avaluo.id))}
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
            <TextField
              label={`Valuador ${perito ? '(perito firmante)' : ''}`}
              value={i.valuadorNombre}
              onChange={(v) => set('valuadorNombre', v)}
              placeholder="Nombre del perito"
            />
            <TextField
              label="NIPEV / Licencia"
              value={i.valuadorNipev}
              onChange={(v) => set('valuadorNipev', v)}
              placeholder="RNA-1234"
            />
          </div>
        </div>
      </section>

      {/* Fechas */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Fechas</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Fecha de inspección (aa/mm/dd)">
            <Input
              type="date"
              value={i.fechaInspeccion}
              onChange={(e) => set('fechaInspeccion', e.target.value)}
            />
            {i.fechaInspeccion && (
              <div className="text-xs text-muted-foreground mt-1 font-mono">{fmtAaMmDd(i.fechaInspeccion)}</div>
            )}
          </Field>
          <Field label="Fecha de emisión (portada · carta · resumen)">
            <Input
              type="date"
              value={i.fechaAvaluo}
              onChange={(e) => set('fechaAvaluo', e.target.value)}
            />
            {i.fechaAvaluo && (
              <div className="text-xs text-muted-foreground mt-1 font-mono">{fmtAaMmDd(i.fechaAvaluo)}</div>
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
