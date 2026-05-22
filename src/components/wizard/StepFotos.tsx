import { useRef } from 'react';
import { useStore } from '@/store/avaluoStore';
import { Avaluo, Foto, FotoCategoria } from '@/store/types';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Upload, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';

const CATS: { key: FotoCategoria; label: string }[] = [
  { key: 'fachada', label: 'Fachada' },
  { key: 'interior', label: 'Interior' },
  { key: 'comparables', label: 'Comparables' },
  { key: 'infraestructuras', label: 'Infraestructuras' },
  { key: 'planos', label: 'Planos' },
  { key: 'legales', label: 'Documentos legales' },
];

export function StepFotos({ avaluo }: { avaluo: Avaluo }) {
  const { patchAvaluo } = useStore();
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const setFotos = (cat: FotoCategoria, fn: (fs: Foto[]) => Foto[]) =>
    patchAvaluo(avaluo.id, (a) => ({ ...a, fotos: { ...a.fotos, [cat]: fn(a.fotos[cat]) } }));

  const handleFiles = async (cat: FotoCategoria, files: FileList | null) => {
    if (!files) return;
    const items: Foto[] = [];
    for (const f of Array.from(files)) {
      const src = await new Promise<string>((res) => {
        const r = new FileReader();
        r.onload = () => res(r.result as string);
        r.readAsDataURL(f);
      });
      items.push({ id: crypto.randomUUID(), src, descripcion: f.name });
    }
    setFotos(cat, (fs) => [...fs, ...items]);
  };

  const move = (cat: FotoCategoria, id: string, dir: -1 | 1) => {
    setFotos(cat, (fs) => {
      const i = fs.findIndex((f) => f.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= fs.length) return fs;
      const copy = [...fs];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  };

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-xl font-semibold">Paso 7 · Registro fotográfico</h2>
        <p className="text-sm text-muted-foreground">Sube fotografías por categoría. Reordena, describe y elimina.</p>
      </header>

      <Tabs defaultValue="fachada">
        <TabsList className="flex-wrap h-auto">
          {CATS.map((c) => (
            <TabsTrigger key={c.key} value={c.key}>
              {c.label} <span className="ml-2 text-xs text-muted-foreground">({avaluo.fotos[c.key].length})</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {CATS.map((c) => (
          <TabsContent key={c.key} value={c.key} className="mt-4">
            <Card
              className="p-6 border-dashed border-2 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileRefs.current[c.key]?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleFiles(c.key, e.dataTransfer.files); }}
            >
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <div className="text-sm">Arrastra imágenes aquí o haz clic para subir</div>
              <input
                ref={(el) => (fileRefs.current[c.key] = el)}
                type="file" accept="image/*" multiple className="hidden"
                onChange={(e) => handleFiles(c.key, e.target.files)}
              />
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {avaluo.fotos[c.key].map((f) => (
                <Card key={f.id} className="overflow-hidden">
                  <img src={f.src} alt="" className="w-full h-40 object-cover" />
                  <div className="p-2 space-y-2">
                    <Input
                      value={f.descripcion}
                      onChange={(e) => setFotos(c.key, (fs) => fs.map((x) => x.id === f.id ? { ...x, descripcion: e.target.value } : x))}
                      placeholder="Descripción"
                      className="h-8 text-xs"
                    />
                    <div className="flex justify-between">
                      <div className="flex gap-1">
                        <button onClick={() => move(c.key, f.id, -1)} className="text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /></button>
                        <button onClick={() => move(c.key, f.id, 1)} className="text-muted-foreground hover:text-foreground"><ArrowRight className="h-4 w-4" /></button>
                      </div>
                      <button onClick={() => setFotos(c.key, (fs) => fs.filter((x) => x.id !== f.id))} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
