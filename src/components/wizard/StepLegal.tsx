import { useStore } from '@/store/avaluoStore';
import { Avaluo, DocumentoLegalItem, TipoDocumentoLegal } from '@/store/types';
import { TextField, NumberField, TextArea, Field } from '@/components/forms/Fields';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, ChevronDown } from 'lucide-react';
import { m2ToVr2 } from '@/lib/calculations';

const TIPO_OPTIONS: { value: TipoDocumentoLegal; label: string; titulo: string; autorizanteLabel: string }[] = [
  { value: 'escritura',          label: 'Escritura pública',     titulo: 'Escritura pública',        autorizanteLabel: 'Notario público' },
  { value: 'contrato',           label: 'Contrato',              titulo: 'Contrato',                 autorizanteLabel: 'Firmante / partes' },
  { value: 'plano_topografico',  label: 'Plano topográfico',     titulo: 'Plano topográfico',        autorizanteLabel: 'Topógrafo' },
  { value: 'razon_inscripcion',  label: 'Razón de inscripción',  titulo: 'Razón de inscripción',     autorizanteLabel: 'Registrador' },
  { value: 'personalizado',      label: 'Personalizado',         titulo: 'Documento',                autorizanteLabel: 'Autorizante / firmante' },
];

const metaTipo = (t: TipoDocumentoLegal) => TIPO_OPTIONS.find((o) => o.value === t) || TIPO_OPTIONS[4];

const nuevoDoc = (tipo: TipoDocumentoLegal): DocumentoLegalItem => ({
  id: crypto.randomUUID(),
  tipo,
  titulo: metaTipo(tipo).titulo,
  nombre: '', fecha: '', autorizante: '',
  areaM2: 0, areaVr2: 0,
  tieneInscripcion: false,
  numeroRegistral: '', tomo: '', folio: '', asiento: '', numeroCatastral: '',
  observaciones: '',
});

export function StepLegal({ avaluo }: { avaluo: Avaluo }) {
  const { patchAvaluo } = useStore();
  const docs = avaluo.documentoLegal.documentos || [];

  const setDocs = (next: DocumentoLegalItem[]) =>
    patchAvaluo(avaluo.id, (a) => ({ ...a, documentoLegal: { ...a.documentoLegal, documentos: next } }));

  const addDoc = (tipo: TipoDocumentoLegal) => setDocs([...docs, nuevoDoc(tipo)]);
  const removeDoc = (id: string) => setDocs(docs.filter((d) => d.id !== id));
  const patchDoc = (id: string, patch: Partial<DocumentoLegalItem>) =>
    setDocs(docs.map((d) => (d.id === id ? { ...d, ...patch } : d)));

  const setObsGenerales = (v: string) =>
    patchAvaluo(avaluo.id, (a) => ({ ...a, documentoLegal: { ...a.documentoLegal, observaciones: v } }));

  return (
    <div className="space-y-5 max-w-5xl">
      <header>
        <div className="text-xs uppercase tracking-widest text-primary">Capítulo II · INMOVAL</div>
        <h2 className="text-xl font-semibold">Documentación legal presentada</h2>
        <p className="text-sm text-muted-foreground">
          Añade cada documento revisado (escritura, contrato, plano topográfico, razón de inscripción, etc.).
          Cada documento puede incluir datos de inscripción registral y observaciones propias.
        </p>
      </header>

      {/* Botonera para añadir documentos */}
      <Card className="p-3 flex flex-wrap items-center gap-2">
        <span className="text-xs uppercase tracking-wider text-muted-foreground mr-2">Añadir documento:</span>
        {TIPO_OPTIONS.map((o) => (
          <Button key={o.value} size="sm" variant="outline" onClick={() => addDoc(o.value)} type="button">
            <Plus className="h-3 w-3 mr-1" />{o.label}
          </Button>
        ))}
      </Card>

      {docs.length === 0 && (
        <div className="text-sm text-muted-foreground text-center py-10 border border-dashed rounded-md">
          Aún no se han añadido documentos legales.
        </div>
      )}

      <Accordion type="multiple" className="space-y-2" defaultValue={docs.map((d) => d.id)}>
        {docs.map((doc, idx) => {
          const meta = metaTipo(doc.tipo);
          return (
            <AccordionItem key={doc.id} value={doc.id} className="border rounded-md bg-card">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex-1 flex items-center justify-between pr-3">
                  <div className="text-left">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">
                      Documento {idx + 1} · {meta.label}
                    </div>
                    <div className="text-sm font-medium">{doc.titulo || meta.titulo}{doc.nombre ? ` — ${doc.nombre}` : ''}</div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-4">
                {/* Cabecera del documento */}
                <div className="grid md:grid-cols-3 gap-4">
                  <Field label="Tipo de documento">
                    <Select
                      value={doc.tipo}
                      onValueChange={(v) => {
                        const newMeta = metaTipo(v as TipoDocumentoLegal);
                        patchDoc(doc.id, {
                          tipo: v as TipoDocumentoLegal,
                          // si el título es el default anterior, actualizar al nuevo default
                          titulo: doc.titulo === meta.titulo ? newMeta.titulo : doc.titulo,
                        });
                      }}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TIPO_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <TextField
                    label="Título (editable)"
                    value={doc.titulo}
                    onChange={(v) => patchDoc(doc.id, { titulo: v })}
                    placeholder={meta.titulo}
                  />
                  <TextField
                    label="Nombre / número del documento"
                    value={doc.nombre}
                    onChange={(v) => patchDoc(doc.id, { nombre: v })}
                    placeholder="N° 123 / Folio A-456 / etc."
                  />

                  <Field label="Fecha">
                    <Input type="date" value={doc.fecha} onChange={(e) => patchDoc(doc.id, { fecha: e.target.value })} />
                  </Field>
                  <TextField
                    label={meta.autorizanteLabel}
                    value={doc.autorizante}
                    onChange={(v) => patchDoc(doc.id, { autorizante: v })}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <NumberField
                      label="Área indicada (m²)"
                      value={doc.areaM2}
                      onChange={(v) => patchDoc(doc.id, { areaM2: v, areaVr2: +m2ToVr2(v).toFixed(4) })}
                    />
                    <NumberField
                      label="Área (vr²)"
                      value={doc.areaVr2}
                      onChange={(v) => patchDoc(doc.id, { areaVr2: v })}
                    />
                  </div>
                </div>

                {/* Inscripción registral (desplegable opcional) */}
                <Collapsible open={doc.tieneInscripcion} onOpenChange={(o) => patchDoc(doc.id, { tieneInscripcion: o })}>
                  <div className="flex items-center justify-between border rounded-md px-3 py-2 bg-muted/30">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={doc.tieneInscripcion}
                        onCheckedChange={(o) => patchDoc(doc.id, { tieneInscripcion: o })}
                      />
                      <Label className="text-sm">Tiene datos de inscripción registral</Label>
                    </div>
                    <CollapsibleTrigger asChild>
                      <Button type="button" size="sm" variant="ghost">
                        <ChevronDown className={`h-4 w-4 transition-transform ${doc.tieneInscripcion ? 'rotate-180' : ''}`} />
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent className="pt-3">
                    <div className="grid md:grid-cols-4 gap-3">
                      <TextField label="N° registral" value={doc.numeroRegistral} onChange={(v) => patchDoc(doc.id, { numeroRegistral: v })} />
                      <TextField label="Tomo" value={doc.tomo} onChange={(v) => patchDoc(doc.id, { tomo: v })} />
                      <TextField label="Folio" value={doc.folio} onChange={(v) => patchDoc(doc.id, { folio: v })} />
                      <TextField label="Asiento" value={doc.asiento} onChange={(v) => patchDoc(doc.id, { asiento: v })} />
                      <TextField label="Número catastral" value={doc.numeroCatastral} onChange={(v) => patchDoc(doc.id, { numeroCatastral: v })} />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <TextArea
                  label="Observaciones del documento"
                  value={doc.observaciones}
                  onChange={(v) => patchDoc(doc.id, { observaciones: v })}
                  rows={3}
                />

                <div className="flex justify-end">
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeDoc(doc.id)}>
                    <Trash2 className="h-4 w-4 mr-1" />Eliminar documento
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      <TextArea
        label="Observaciones legales generales / gravámenes"
        value={avaluo.documentoLegal.observaciones}
        onChange={setObsGenerales}
        rows={4}
      />
    </div>
  );
}
