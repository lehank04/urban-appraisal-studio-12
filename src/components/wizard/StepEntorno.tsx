import { useStore } from '@/store/avaluoStore';
import { Avaluo } from '@/store/types';
import { TextField, TextArea } from '@/components/forms/Fields';
import { StringSelectWithCustom } from '@/components/forms/CatSelect';
import { Card } from '@/components/ui/card';
import {
  CAT_CLASIFICACION_ZONA, CAT_INDICE_SATURACION, CAT_DENSIDAD,
  CAT_FLUJO_VEHICULAR, CAT_ESTADO_VIAL, CAT_IMPORTANCIA_VIA,
} from '@/lib/catalogos';

export function StepEntorno({ avaluo }: { avaluo: Avaluo }) {
  const { patchAvaluo } = useStore();
  const e = avaluo.entorno;
  const set = <K extends keyof typeof e>(k: K, v: (typeof e)[K]) =>
    patchAvaluo(avaluo.id, (a) => ({ ...a, entorno: { ...a.entorno, [k]: v } }));

  return (
    <div className="space-y-5 max-w-5xl">
      <header>
        <div className="text-xs uppercase tracking-widest text-primary">Capítulo III · INMOVAL</div>
        <h2 className="text-xl font-semibold">Análisis del entorno</h2>
        <p className="text-sm text-muted-foreground">Clasificación urbana, vías de acceso y servicios públicos.</p>
      </header>

      <Card className="p-4 space-y-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Caracterización de la zona</div>
        <div className="grid md:grid-cols-2 gap-4">
          <StringSelectWithCustom label="Clasificación de zona" value={e.clasificacionZona} onChange={(v) => set('clasificacionZona', v)} options={CAT_CLASIFICACION_ZONA} />
          <TextField label="Tipo de construcción predominante" value={e.tipoConstruccion} onChange={(v) => set('tipoConstruccion', v)} />
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
              ['Carpeta de rodamiento', 'carpetaZona', 'carpetaInmueble', null],
              ['Flujo vehicular', 'flujoZona', 'flujoInmueble', CAT_FLUJO_VEHICULAR],
              ['Estado físico', 'estadoZona', 'estadoInmueble', CAT_ESTADO_VIAL],
              ['Importancia', 'importanciaZona', 'importanciaInmueble', CAT_IMPORTANCIA_VIA],
              ['Proximidad a vía principal', 'proximidadZona', 'proximidadInmueble', null],
            ].map(([label, kz, ki, opts]) => (
              <tr key={label as string}>
                <td className="py-2 pr-2 text-sm">{label}</td>
                <td className="py-2 pr-2">
                  {opts
                    ? <StringSelectWithCustom label="" value={(e as any)[kz as string]} onChange={(v) => set(kz as any, v as any)} options={opts as string[]} />
                    : <TextField label="" value={(e as any)[kz as string]} onChange={(v) => set(kz as any, v as any)} />}
                </td>
                <td className="py-2">
                  {opts
                    ? <StringSelectWithCustom label="" value={(e as any)[ki as string]} onChange={(v) => set(ki as any, v as any)} options={opts as string[]} />
                    : <TextField label="" value={(e as any)[ki as string]} onChange={(v) => set(ki as any, v as any)} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="p-4 space-y-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Servicios y entorno</div>
        <div className="grid md:grid-cols-2 gap-4">
          <TextArea label="Servicios públicos disponibles" value={e.serviciosPublicos} onChange={(v) => set('serviciosPublicos', v)} rows={3} />
          <TextArea label="Equipamiento urbano" value={e.equipamientoUrbano} onChange={(v) => set('equipamientoUrbano', v)} rows={3} />
          <TextArea label="Contaminación / riesgos" value={e.contaminacion} onChange={(v) => set('contaminacion', v)} rows={3} />
          <TextArea label="Distancias a referencias" value={e.distancias} onChange={(v) => set('distancias', v)} rows={3} />
        </div>
      </Card>
    </div>
  );
}
