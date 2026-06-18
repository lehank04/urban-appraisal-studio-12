import { useState } from 'react';
import {
  Building2,
  CreditCard,
  FileText,
  Plus,
  RotateCcw,
  Save,
  Signature,
  Trash2,
} from 'lucide-react';

type TerminoPlantillaCotizacion = {
  id: string;
  incluido: boolean;
  titulo: string;
  texto: string;
};

type ConfiguracionPDFCotizacionesINMOVAL = {
  nombreEmpresa: string;
  subtituloEmpresa: string;
  tituloDocumento: string;
  subtituloDocumento: string;

  mostrarTituloEmpresa: boolean;
  mostrarSubtituloEmpresa: boolean;
  mostrarFechaCotizacion: boolean;
  mostrarFechaValidez: boolean;
  mostrarHoraExportacion: boolean;
  mostrarNumeroCotizacion: boolean;

  responsableNombre: string;
  responsableCargo: string;
  mostrarResponsable: boolean;
  mostrarFirma: boolean;

  mostrarDatosPago: boolean;
  banco: string;
  numeroCuenta: string;
  titularCuenta: string;

  notaFiscal: string;
  textoCierre: string;

  terminosItems: TerminoPlantillaCotizacion[];
};

const STORAGE_KEY = 'inmoval_cotizaciones_pdf_config_v1';

const TERMINOS_BASE: TerminoPlantillaCotizacion[] = [
  {
    id: 'vigencia-propuesta',
    incluido: true,
    titulo: 'VIGENCIA DE LA PROPUESTA',
    texto:
      'Esta cotización tiene una validez de quince (15) días calendario. Transcurrido este tiempo, agradeceremos solicitar una actualización de los términos para garantizar la disponibilidad y vigencia de los costos presentados.',
  },
  {
    id: 'compromiso-pago',
    incluido: true,
    titulo: 'COMPROMISO DE PAGO',
    texto:
      'Para dar inicio formal a las gestiones técnicas, se requiere un anticipo correspondiente al 50% del monto total. El 50% restante se cancelará al momento de la entrega del informe final.',
  },
  {
    id: 'alcance-servicios',
    incluido: true,
    titulo: 'ALCANCE DEL SERVICIO',
    texto:
      'Los honorarios propuestos cubren exclusivamente los servicios detallados en esta cotización. Cualquier servicio adicional, visita extra o modificación solicitada será evaluada y presupuestada de forma independiente.',
  },
  {
    id: 'colaboracion-cliente',
    incluido: true,
    titulo: 'COLABORACIÓN DEL CLIENTE',
    texto:
      'El cliente deberá facilitar el acceso seguro al inmueble y proporcionar la documentación legal o técnica necesaria para realizar el avalúo.',
  },
  {
    id: 'compromiso-entrega',
    incluido: true,
    titulo: 'COMPROMISO DE ENTREGA',
    texto:
      'La entrega estimada del informe dependerá de la recepción del anticipo, la documentación requerida y la realización efectiva de la inspección física del inmueble.',
  },
  {
    id: 'resguardo-informacion',
    incluido: true,
    titulo: 'RESGUARDO DE LA INFORMACIÓN',
    texto:
      'Toda la información y documentación recibida será tratada bajo criterios de confidencialidad y utilizada exclusivamente para los fines del servicio contratado.',
  },
];

function defaultConfig(): ConfiguracionPDFCotizacionesINMOVAL {
  return {
    nombreEmpresa: 'INMOVAL',
    subtituloEmpresa: 'Ingeniería · Inmuebles · Valoración',
    tituloDocumento: 'hola.',
    subtituloDocumento: 'ESTA ES SU COTIZACIÓN',

    mostrarTituloEmpresa: true,
    mostrarSubtituloEmpresa: true,
    mostrarFechaCotizacion: true,
    mostrarFechaValidez: true,
    mostrarHoraExportacion: false,
    mostrarNumeroCotizacion: true,

    responsableNombre: 'Responsable INMOVAL',
    responsableCargo: 'Firma autorizada',
    mostrarResponsable: true,
    mostrarFirma: true,

    mostrarDatosPago: true,
    banco: '',
    numeroCuenta: '',
    titularCuenta: '',

    notaFiscal: 'Esta cotización no constituye factura ni comprobante fiscal.',
    textoCierre: 'GRACIAS POR SU CONFIANZA',

    terminosItems: TERMINOS_BASE.map((item) => ({ ...item })),
  };
}

function readConfig(): ConfiguracionPDFCotizacionesINMOVAL {
  if (typeof window === 'undefined') return defaultConfig();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultConfig();

    const parsed = JSON.parse(raw);
    const base = defaultConfig();

    return {
      ...base,
      ...parsed,
      terminosItems:
        Array.isArray(parsed.terminosItems) && parsed.terminosItems.length > 0
          ? parsed.terminosItems
          : base.terminosItems,
    };
  } catch {
    return defaultConfig();
  }
}

function saveConfig(config: ConfiguracionPDFCotizacionesINMOVAL) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

function createTerminoId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return 'term-' + Date.now() + '-' + Math.random().toString(16).slice(2);
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
      {children}
    </span>
  );
}

function Section({
  title,
  eyebrow,
  icon,
  children,
}: {
  title: string;
  eyebrow: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/75 p-6 shadow-xl shadow-black/20">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/10 text-sky-300">
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

export default function ConfiguracionCotizacionesINMOVALPage() {
  const [config, setConfig] = useState<ConfiguracionPDFCotizacionesINMOVAL>(() =>
    readConfig()
  );
  const [mensaje, setMensaje] = useState('');

  function actualizar(patch: Partial<ConfiguracionPDFCotizacionesINMOVAL>) {
    setConfig((actual) => ({ ...actual, ...patch }));
    setMensaje('');
  }

  function guardar() {
    saveConfig(config);
    setMensaje('Configuración de cotizaciones guardada.');
  }

  function restaurarBase() {
    if (!window.confirm('¿Restaurar la plantilla base de cotizaciones?')) return;

    const base = defaultConfig();
    setConfig(base);
    saveConfig(base);
    setMensaje('Plantilla base restaurada.');
  }

  function actualizarTermino(
    id: string,
    patch: Partial<TerminoPlantillaCotizacion>
  ) {
    setConfig((actual) => ({
      ...actual,
      terminosItems: actual.terminosItems.map((item) =>
        item.id === id ? { ...item, ...patch } : item
      ),
    }));
    setMensaje('');
  }

  function agregarTermino() {
    setConfig((actual) => ({
      ...actual,
      terminosItems: [
        ...actual.terminosItems,
        {
          id: createTerminoId(),
          incluido: true,
          titulo: 'NUEVO TÉRMINO',
          texto: 'Escriba aquí el texto del término o condición.',
        },
      ],
    }));
  }

  function eliminarTermino(id: string) {
    setConfig((actual) => ({
      ...actual,
      terminosItems: actual.terminosItems.filter((item) => item.id !== id),
    }));
  }

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/30">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-300">
                Cotizaciones INMOVAL
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-50">
                Configuración de plantilla PDF
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                Controla cómo sale el PDF de cotización: encabezado, responsable,
                datos de pago, términos, firma y pie de documento.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={restaurarBase}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950/50 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
              >
                <RotateCcw className="h-4 w-4" />
                Restaurar base
              </button>

              <button
                type="button"
                onClick={guardar}
                className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/20"
              >
                <Save className="h-4 w-4" />
                Guardar configuración
              </button>
            </div>
          </div>

          {mensaje ? (
            <div className="mt-5 rounded-2xl border border-sky-400/20 bg-sky-400/10 px-4 py-3 text-sm text-sky-100">
              {mensaje}
            </div>
          ) : null}
        </header>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <Section
            eyebrow="Identidad"
            title="Encabezado del PDF"
            icon={<Building2 className="h-5 w-5" />}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <FieldLabel>Nombre de empresa</FieldLabel>
                <input
                  value={config.nombreEmpresa}
                  onChange={(event) => actualizar({ nombreEmpresa: event.target.value })}
                  className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-sky-400"
                />
              </label>

              <label className="grid gap-2">
                <FieldLabel>Subtítulo / lema</FieldLabel>
                <input
                  value={config.subtituloEmpresa}
                  onChange={(event) => actualizar({ subtituloEmpresa: event.target.value })}
                  className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-sky-400"
                />
              </label>

              <label className="grid gap-2">
                <FieldLabel>Título grande</FieldLabel>
                <input
                  value={config.tituloDocumento}
                  onChange={(event) => actualizar({ tituloDocumento: event.target.value })}
                  className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-sky-400"
                />
              </label>

              <label className="grid gap-2">
                <FieldLabel>Subtítulo del documento</FieldLabel>
                <input
                  value={config.subtituloDocumento}
                  onChange={(event) => actualizar({ subtituloDocumento: event.target.value })}
                  className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-sky-400"
                />
              </label>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {[
                ['mostrarTituloEmpresa', 'Mostrar empresa'],
                ['mostrarSubtituloEmpresa', 'Mostrar subtítulo'],
                ['mostrarNumeroCotizacion', 'Mostrar número'],
                ['mostrarFechaCotizacion', 'Mostrar fecha'],
                ['mostrarFechaValidez', 'Mostrar validez'],
                ['mostrarHoraExportacion', 'Mostrar hora de exportación'],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={Boolean(config[key as keyof ConfiguracionPDFCotizacionesINMOVAL])}
                    onChange={(event) =>
                      actualizar({
                        [key]: event.target.checked,
                      } as Partial<ConfiguracionPDFCotizacionesINMOVAL>)
                    }
                  />
                  {label}
                </label>
              ))}
            </div>
          </Section>

          <Section
            eyebrow="Pago"
            title="Datos de pago"
            icon={<CreditCard className="h-5 w-5" />}
          >
            <label className="mb-4 flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={config.mostrarDatosPago}
                onChange={(event) => actualizar({ mostrarDatosPago: event.target.checked })}
              />
              Mostrar datos de pago en el PDF
            </label>

            <div className="grid gap-4">
              <label className="grid gap-2">
                <FieldLabel>Banco</FieldLabel>
                <input
                  value={config.banco}
                  onChange={(event) => actualizar({ banco: event.target.value })}
                  placeholder="Ej. BAC, Lafise, Banpro..."
                  className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-sky-400"
                />
              </label>

              <label className="grid gap-2">
                <FieldLabel>No. de cuenta</FieldLabel>
                <input
                  value={config.numeroCuenta}
                  onChange={(event) => actualizar({ numeroCuenta: event.target.value })}
                  placeholder="Número de cuenta"
                  className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-sky-400"
                />
              </label>

              <label className="grid gap-2">
                <FieldLabel>Titular de la cuenta</FieldLabel>
                <input
                  value={config.titularCuenta}
                  onChange={(event) => actualizar({ titularCuenta: event.target.value })}
                  placeholder="Nombre del titular"
                  className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-sky-400"
                />
              </label>
            </div>
          </Section>

          <Section
            eyebrow="Firma"
            title="Responsable INMOVAL"
            icon={<Signature className="h-5 w-5" />}
          >
            <div className="grid gap-4">
              <label className="grid gap-2">
                <FieldLabel>Nombre del responsable</FieldLabel>
                <input
                  value={config.responsableNombre}
                  onChange={(event) => actualizar({ responsableNombre: event.target.value })}
                  className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-sky-400"
                />
              </label>

              <label className="grid gap-2">
                <FieldLabel>Cargo / descripción</FieldLabel>
                <input
                  value={config.responsableCargo}
                  onChange={(event) => actualizar({ responsableCargo: event.target.value })}
                  className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-sky-400"
                />
              </label>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={config.mostrarResponsable}
                    onChange={(event) => actualizar({ mostrarResponsable: event.target.checked })}
                  />
                  Mostrar responsable
                </label>

                <label className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={config.mostrarFirma}
                    onChange={(event) => actualizar({ mostrarFirma: event.target.checked })}
                  />
                  Mostrar línea de firma
                </label>
              </div>
            </div>
          </Section>

          <Section
            eyebrow="Texto"
            title="Notas del documento"
            icon={<FileText className="h-5 w-5" />}
          >
            <div className="grid gap-4">
              <label className="grid gap-2">
                <FieldLabel>Nota fiscal</FieldLabel>
                <textarea
                  value={config.notaFiscal}
                  onChange={(event) => actualizar({ notaFiscal: event.target.value })}
                  rows={3}
                  className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-sky-400"
                />
              </label>

              <label className="grid gap-2">
                <FieldLabel>Texto de cierre</FieldLabel>
                <input
                  value={config.textoCierre}
                  onChange={(event) => actualizar({ textoCierre: event.target.value })}
                  className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-sky-400"
                />
              </label>
            </div>
          </Section>
        </div>

        <Section
          eyebrow="Términos"
          title="Términos y condiciones"
          icon={<FileText className="h-5 w-5" />}
        >
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-slate-400">
              Activa, edita, agrega o elimina los términos que aparecerán en el PDF.
            </p>

            <button
              type="button"
              onClick={agregarTermino}
              className="inline-flex items-center gap-2 rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 py-3 text-sm font-semibold text-sky-100 transition hover:bg-sky-400/20"
            >
              <Plus className="h-4 w-4" />
              Agregar término
            </button>
          </div>

          <div className="grid gap-4">
            {config.terminosItems.map((termino, index) => (
              <article
                key={termino.id}
                className="rounded-3xl border border-slate-800 bg-slate-950/50 p-4"
              >
                <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <label className="flex items-center gap-3 text-sm font-medium text-slate-200">
                    <input
                      type="checkbox"
                      checked={termino.incluido}
                      onChange={(event) =>
                        actualizarTermino(termino.id, { incluido: event.target.checked })
                      }
                    />
                    Incluir término {index + 1}
                  </label>

                  <button
                    type="button"
                    onClick={() => eliminarTermino(termino.id)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm font-medium text-rose-100 transition hover:bg-rose-400/20"
                  >
                    <Trash2 className="h-4 w-4" />
                    Quitar
                  </button>
                </div>

                <div className="grid gap-3">
                  <label className="grid gap-2">
                    <FieldLabel>Título</FieldLabel>
                    <input
                      value={termino.titulo}
                      onChange={(event) =>
                        actualizarTermino(termino.id, { titulo: event.target.value })
                      }
                      className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none focus:border-sky-400"
                    />
                  </label>

                  <label className="grid gap-2">
                    <FieldLabel>Texto</FieldLabel>
                    <textarea
                      value={termino.texto}
                      onChange={(event) =>
                        actualizarTermino(termino.id, { texto: event.target.value })
                      }
                      rows={4}
                      className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none focus:border-sky-400"
                    />
                  </label>
                </div>
              </article>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
