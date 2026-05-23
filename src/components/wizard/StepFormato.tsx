import { useRef } from 'react';
import { Avaluo, emptyFormatoExport, FormatoExport } from '@/store/types';
import { useStore } from '@/store/avaluoStore';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImagePlus, RotateCcw, Trash2 } from 'lucide-react';

const TOKENS = [
  '{{empresa}}', '{{capitulo}}', '{{perito}}', '{{email}}', '{{telefono}}',
  '{{pagina}}', '{{totalPaginas}}', '{{expediente}}', '{{cliente}}', '{{normativa}}',
];

export function StepFormato({ avaluo }: { avaluo: Avaluo }) {
  const { patchAvaluo } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const f: FormatoExport = avaluo.formato || emptyFormatoExport();

  const setF = (patch: Partial<FormatoExport>) =>
    patchAvaluo(avaluo.id, (a) => ({ ...a, formato: { ...(a.formato || emptyFormatoExport()), ...patch } }));

  const onFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setF({ portadaImagen: String(reader.result) });
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-5 max-w-5xl">
      <header>
        <div className="text-xs uppercase tracking-widest text-primary">Paso final</div>
        <h2 className="text-xl font-semibold">Formato del documento exportado</h2>
        <p className="text-sm text-muted-foreground">
          Personaliza la portada, encabezados, pie de página, tipografía y las secciones automáticas (carta de presentación, metodología).
        </p>
      </header>

      {/* PORTADA */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Portada</h3>
            <p className="text-xs text-muted-foreground">Foto principal del inmueble que aparece en la portada del informe.</p>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs">Mostrar imagen</Label>
            <Switch checked={f.mostrarPortadaImagen} onCheckedChange={(v) => setF({ mostrarPortadaImagen: v })} />
          </div>
        </div>

        <div className="flex gap-4 items-start">
          <div className="w-72 h-44 rounded-md border border-dashed border-border bg-muted/30 grid place-items-center overflow-hidden">
            {f.portadaImagen ? (
              <img src={f.portadaImagen} alt="Portada" className="w-full h-full object-cover" />
            ) : (
              <div className="text-xs text-muted-foreground text-center px-4">Sin imagen<br />(se mostrará un fondo color plantilla)</div>
            )}
          </div>
          <div className="space-y-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
            />
            <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
              <ImagePlus className="h-4 w-4 mr-1" /> Subir imagen
            </Button>
            {f.portadaImagen && (
              <Button size="sm" variant="ghost" onClick={() => setF({ portadaImagen: undefined })}>
                <Trash2 className="h-4 w-4 mr-1" /> Quitar
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* ENCABEZADO Y PIE */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Encabezado y pie de página</h3>
            <p className="text-xs text-muted-foreground">
              Usa tokens entre llaves dobles para insertar datos automáticamente.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 col-span-2">
            <Switch checked={f.mostrarHeader} onCheckedChange={(v) => setF({ mostrarHeader: v })} />
            <Label className="text-sm">Mostrar encabezado en cada página</Label>
          </div>
          <div>
            <Label className="text-xs">Encabezado izquierda</Label>
            <Input value={f.headerIzq} onChange={(e) => setF({ headerIzq: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">Encabezado derecha</Label>
            <Input value={f.headerDer} onChange={(e) => setF({ headerDer: e.target.value })} />
          </div>

          <div className="flex items-center gap-2 col-span-2 mt-2">
            <Switch checked={f.mostrarFooter} onCheckedChange={(v) => setF({ mostrarFooter: v })} />
            <Label className="text-sm">Mostrar pie de página</Label>
          </div>
          <div>
            <Label className="text-xs">Pie izquierda</Label>
            <Textarea rows={2} value={f.footerIzq} onChange={(e) => setF({ footerIzq: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">Pie derecha</Label>
            <Textarea rows={2} value={f.footerDer} onChange={(e) => setF({ footerDer: e.target.value })} />
          </div>
        </div>

        <div className="text-[11px] text-muted-foreground border-t border-border pt-3">
          <div className="font-medium mb-1">Tokens disponibles:</div>
          <div className="flex flex-wrap gap-1">
            {TOKENS.map((t) => (
              <code key={t} className="px-1.5 py-0.5 rounded bg-muted text-foreground">{t}</code>
            ))}
          </div>
        </div>
      </Card>

      {/* TIPOGRAFIA Y ESTILO */}
      <Card className="p-5 space-y-4">
        <h3 className="font-semibold">Tipografía y estilo de tablas</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Fuente del PDF</Label>
            <Select value={f.fuente} onValueChange={(v) => setF({ fuente: v as FormatoExport['fuente'] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="roboto-mono">Roboto Mono (estilo INMOVAL)</SelectItem>
                <SelectItem value="inter">Inter (sans-serif)</SelectItem>
                <SelectItem value="serif">Serif clásico</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-2">
            <Switch checked={f.bordesRedondeados} onCheckedChange={(v) => setF({ bordesRedondeados: v })} />
            <Label className="text-sm">Tablas con bordes redondeados</Label>
          </div>
        </div>
      </Card>

      {/* SECCIONES AUTOMATICAS */}
      <Card className="p-5 space-y-4">
        <h3 className="font-semibold">Secciones automáticas</h3>

        <div className="flex items-center gap-2">
          <Switch checked={f.incluirCartaPresentacion} onCheckedChange={(v) => setF({ incluirCartaPresentacion: v })} />
          <Label className="text-sm">Incluir carta de presentación (auto)</Label>
        </div>
        <div>
          <Label className="text-xs flex items-center justify-between">
            <span>Texto de carta de presentación (opcional — vacío = autogenerada)</span>
            {f.textoCartaPresentacion && (
              <Button variant="ghost" size="sm" onClick={() => setF({ textoCartaPresentacion: undefined })}>
                <RotateCcw className="h-3 w-3 mr-1" /> Restaurar
              </Button>
            )}
          </Label>
          <Textarea
            rows={5}
            placeholder="Dejar vacío para usar el texto automático INMOVAL con los valores calculados."
            value={f.textoCartaPresentacion || ''}
            onChange={(e) => setF({ textoCartaPresentacion: e.target.value || undefined })}
          />
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <Switch checked={f.incluirMetodologia} onCheckedChange={(v) => setF({ incluirMetodologia: v })} />
          <Label className="text-sm">Incluir capítulo de metodología (auto)</Label>
        </div>
        <div>
          <Label className="text-xs flex items-center justify-between">
            <span>Texto de metodología (opcional — vacío = autogenerada)</span>
            {f.textoMetodologia && (
              <Button variant="ghost" size="sm" onClick={() => setF({ textoMetodologia: undefined })}>
                <RotateCcw className="h-3 w-3 mr-1" /> Restaurar
              </Button>
            )}
          </Label>
          <Textarea
            rows={6}
            placeholder="Dejar vacío para usar la metodología INMOVAL completa (objeto, enfoques, costos, mercado, homologación)."
            value={f.textoMetodologia || ''}
            onChange={(e) => setF({ textoMetodologia: e.target.value || undefined })}
          />
        </div>
      </Card>
    </div>
  );
}
