import { useStore } from '@/store/avaluoStore';
import { Avaluo, EquipamientoItem } from '@/store/types';
import { TextArea } from '@/components/forms/Fields';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { StringSelectWithCustom, MultiSelectWithCustom } from '@/components/forms/CatSelect';
import { Card } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import {
  CAT_CLASIFICACION_ZONA, CAT_CONSTRUCCIONES_PREDOMINANTES,
  CAT_INDICE_SATURACION, CAT_DENSIDAD,
  CAT_RODAMIENTO, CAT_FLUJO_VEHICULAR, CAT_ESTADO_VIAL, CAT_IMPORTANCIA_VIA,
  CAT_SERVICIOS_BASICOS, CAT_EQUIPAMIENTO_URBANO, CAT_RIESGOS_AMBIENTALES,
} from '@/lib/catalogos';

export function StepEntorno({ avaluo }: { avaluo: Avaluo }) {
  const { patchAvaluo } = useStore();
  // Migración defensiva por avalúos antiguos donde estos campos eran string
  const e = {
    ...avaluo.entorno,
    contaminacion: Array.isArray(avaluo.entorno.contaminacion)
      ? avaluo.entorno.contaminacion
      : (avaluo.entorno.contaminacion ? [String(avaluo.entorno.contaminacion)] : []),
    serviciosPublicos: Array.isArray(avaluo.entorno.serviciosPublicos)
      ? avaluo.entorno.serviciosPublicos
      : (avaluo.entorno.serviciosPublicos ? [String(avaluo.entorno.serviciosPublicos)] : []),
    equipamientoUrbano: Array.isArray(avaluo.entorno.equipamientoUrbano)
      ? avaluo.entorno.equipamientoUrbano as EquipamientoItem[]
      : [],
  };

  const set = <K extends keyof typeof e>(k: K, v: (typeof e)[K]) =>
    patchAvaluo(avaluo.id, (a) => ({ ...a, entorno: { ...a.entorno, [k]: v } as any }));

  const addEquip = (nombre = '') => {
    const item: EquipamientoItem = { id: crypto.randomUUID(), nombre, distanciaKm: 0, observaciones: '' };
    set('equipamientoUrbano', [...e.equipamientoUrbano, item]);
  };
  const patchEquip = (id: string, patch: Partial<EquipamientoItem>) =>
    set('equipamientoUrbano', e.equipamientoUrbano.map((it) => it.id === id ? { ...it, ...patch } : it));
  const removeEquip = (id: string) =>
    set('equipamientoUrbano', e.equipamientoUrbano.filter((it) => it.id !== id));

  return (
    <div className="space-y-5 max-w-5xl">
      <header>
        <div className="text-xs uppercase tracking-widest text-primary">Capítulo III · INMOVAL</div>
        <h2 className="text-xl font-semibold">Análisis del entorno</h2>
        <p className="text-sm text-muted-foreground">Clasificación urbana, vías, servicios, equipamiento y riesgos.</p>
      </header>

      <Card className="p-4 space-y-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Caracterización de la zona</div>
        <div className="grid md:grid-cols-2 gap-4">
          <StringSelectWithCustom label="Clasificación de zona" value={e.clasificacionZona} onChange={(v) => set('clasificacionZona', v)} options={CAT_CLASIFICACION_ZONA} />
          <StringSelectWithCustom label="Tipo de construcción predominante" value={e.tipoConstruccion} onChange={(v) => set('tipoConstruccion', v)} options={CAT_CONSTRUCCIONES_PREDOMINANTES} />
          <StringSelectWithCustom label="Índice de saturación" value={e.indiceSaturacion} onChange={(v) => set('indiceSaturacion', v)} options={CAT_INDICE_SATURACION} />
          <StringSelectWithCustom label="Densidad poblacional" value={e.densidadPoblacional} onChange={(v) => set('densidadPoblacional', v)} options={CAT_DENSIDAD} />
        </div>
      </Card>

      <Card className="p-4 space-y-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Vías de acceso · Zona vs Inmueble</div>
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground"><tr>
            <th className="text-left pb-2">Característica</th><th className="text-left pb-2">Zona</th><th className="text-left pb-2">Vía inmediata</th>
          </tr></thead>
          <tbody className="divide-y divide-border">
            {[
              ['Carpeta de rodamiento', 'carpetaZona', 'carpetaInmueble', CAT_RODAMIENTO],
              ['Flujo vehicular', 'flujoZona', 'flujoInmueble', CAT_FLUJO_VEHICULAR],
              ['Estado físico', 'estadoZona', 'estadoInmueble', CAT_ESTADO_VIAL],
              ['Importancia', 'importanciaZona', 'importanciaInmueble', CAT_IMPORTANCIA_VIA],
              ['Proximidad a vía principal', 'proximidadZona', 'proximidadInmueble', CAT_IMPORTANCIA_VIA],
            ].map(([label, kz, ki, opts]) => (
              <tr key={label as string}>
                <td className="py-2 pr-2 text-sm align-top pt-4">{label}</td>
                <td className="py-2 pr-2">
                  <StringSelectWithCustom label="" value={(e as any)[kz as string]} onChange={(v) => set(kz as any, v as any)} options={opts as string[]} />
                </td>
                <td className="py-2">
                  <StringSelectWithCustom label="" value={(e as any)[ki as string]} onChange={(v) => set(ki as any, v as any)} options={opts as string[]} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="p-4 space-y-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Servicios públicos disponibles</div>
        <MultiSelectWithCustom
          label="Marca los servicios disponibles (puedes añadir personalizados)"
          values={e.serviciosPublicos}
          onChange={(v) => set('serviciosPublicos', v)}
          options={CAT_SERVICIOS_BASICOS}
          placeholder="Añadir servicio personalizado y presionar Enter"
        />
      </Card>

      <Card className="p-4 space-y-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Contaminación ambiental / Riesgos</div>
        <MultiSelectWithCustom
          label="Marca los riesgos presentes (puedes añadir personalizados)"
          values={e.contaminacion}
          onChange={(v) => set('contaminacion', v)}
          options={CAT_RIESGOS_AMBIENTALES}
          placeholder="Añadir riesgo personalizado y presionar Enter"
        />
      </Card>

      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Equipamiento urbano · nombre y distancia (km)</div>
          <Button size="sm" variant="outline" onClick={() => addEquip('')}>
            <Plus className="h-4 w-4 mr-1" />Añadir
          </Button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {CAT_EQUIPAMIENTO_URBANO.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => addEquip(opt)}
              className="text-xs px-2 py-1 rounded-md border bg-secondary hover:bg-secondary/80"
            >
              + {opt}
            </button>
          ))}
        </div>

        {e.equipamientoUrbano.length === 0 && (
          <div className="text-sm text-muted-foreground italic">Sin equipamientos. Usa los botones de sugerencia o "Añadir".</div>
        )}

        <div className="space-y-2">
          {e.equipamientoUrbano.map((it) => (
            <div key={it.id} className="grid grid-cols-12 gap-2 items-end border rounded-md p-3">
              <div className="col-span-5 space-y-1">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Nombre</Label>
                <Input value={it.nombre} onChange={(ev) => patchEquip(it.id, { nombre: ev.target.value })} placeholder="Ej. Escuela, Hospital..." />
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Distancia (km)</Label>
                <Input
                  type="number" step="0.1" min="0"
                  value={it.distanciaKm || ''}
                  onChange={(ev) => patchEquip(it.id, { distanciaKm: Number(ev.target.value) || 0 })}
                />
              </div>
              <div className="col-span-4 space-y-1">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Observaciones</Label>
                <Input value={it.observaciones || ''} onChange={(ev) => patchEquip(it.id, { observaciones: ev.target.value })} placeholder="Opcional" />
              </div>
              <div className="col-span-1 flex justify-end">
                <Button size="icon" variant="ghost" onClick={() => removeEquip(it.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4 space-y-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Notas adicionales</div>
        <TextArea label="Distancias a referencias / observaciones del entorno" value={e.distancias} onChange={(v) => set('distancias', v)} rows={3} />
      </Card>
    </div>
  );
}
