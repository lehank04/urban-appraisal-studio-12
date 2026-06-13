import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Archive,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  FilePlus2,
  FileText,
  MoreHorizontal,
  Plus,
  Search,
  Send,
  Settings,
  Trash2,
  User,
} from 'lucide-react';

type EstadoCotizacionINMOVAL =
  | 'borrador'
  | 'enviada'
  | 'aprobada'
  | 'rechazada'
  | 'convertida';

type MonedaCotizacionINMOVAL = 'US$' | 'C$';

type CatalogOption = {
  id: string;
  nombre: string;
  email?: string;
  telefono?: string;
  direccion?: string;
};

type CodigoOption = {
  codigo: string;
  nombre: string;
};

type CotizacionINMOVALLocal = {
  id: string;
  numero: string;
  estado: EstadoCotizacionINMOVAL;

  clienteId?: string;
  clienteNombre: string;
  clienteEmail?: string;
  clienteTelefono?: string;
  clienteDireccion?: string;

  direccionInmueble: string;
  tipoInmuebleCodigo: string;
  tipoInmuebleNombre: string;
  clasificacionInmuebleCodigo: string;
  clasificacionInmuebleNombre: string;
  propositoAvaluoCodigo: string;
  propositoAvaluoNombre: string;

  descripcionServicio: string;
  costoServicio: number;
  moneda: MonedaCotizacionINMOVAL;
  terminosCondiciones: string;

  fechaCotizacion: string;
  fechaValidez: string;
  expedienteId?: string;

  creadoEn: string;
  actualizadoEn: string;
};

const STORAGE_KEY = 'inmoval_cotizaciones_v1';

const TERMINOS_BASE = `1. La presente cotización corresponde al servicio profesional de avalúo indicado.
2. El costo no incluye gastos registrales, certificaciones, traslados extraordinarios ni trámites de terceros, salvo que se indique expresamente.
3. La programación de inspección queda sujeta a confirmación del cliente y disponibilidad del perito.
4. La entrega estimada se calculará a partir de la inspección realizada y la recepción completa de la documentación necesaria.
5. La cotización tendrá validez hasta la fecha indicada en este documento.
6. La aprobación de esta cotización permite iniciar la apertura del expediente correspondiente.`;

const TIPOS_INMUEBLE: CodigoOption[] = [
  { codigo: 'IU', nombre: 'CASA DE HABITACIÓN' },
  { codigo: 'IU', nombre: 'APARTAMENTOS' },
  { codigo: 'IU', nombre: 'LOTE DE TERRENO VACÍO' },
  { codigo: 'IU', nombre: 'LOTE DE TERRENO CON MEJORAS' },
  { codigo: 'IU', nombre: 'LOCAL COMERCIAL' },
  { codigo: 'IU', nombre: 'BODEGA' },
  { codigo: 'IU', nombre: 'OFICINAS' },
  { codigo: 'IU', nombre: 'AVANCE DE OBRA' },
  { codigo: 'IR', nombre: 'TERRENO RURAL (CON O SIN ESTRUCTURAS)' },
  { codigo: 'IR', nombre: 'VIVIENDAS RURALES' },
  { codigo: 'IR', nombre: 'EDIFICIOS RURALES' },
  { codigo: 'IR', nombre: 'GALPONES' },
  { codigo: 'IR', nombre: 'CERCAS' },
  { codigo: 'IR', nombre: 'SISTEMAS DE RIEGO Y DRENAJE' },
  { codigo: 'IR', nombre: 'VÍAS' },
  { codigo: 'IR', nombre: 'ADECUACIONES DE SUELOS' },
  { codigo: 'IR', nombre: 'POZOS' },
  { codigo: 'IR', nombre: 'CULTIVOS Y PLANTACIONES AGRÍCOLAS' },
  { codigo: 'IR', nombre: 'EXPLOTACIÓN AGRÍCOLA' },
  { codigo: 'IE', nombre: 'EDIFICIOS' },
  { codigo: 'IE', nombre: 'CENTROS COMERCIALES' },
  { codigo: 'IE', nombre: 'HOTELES' },
  { codigo: 'IE', nombre: 'COLEGIOS' },
  { codigo: 'IE', nombre: 'HOSPITALES' },
  { codigo: 'IE', nombre: 'CLÍNICAS' },
  { codigo: 'IE', nombre: 'RESTAURANTES' },
  { codigo: 'IE', nombre: 'AVANCE DE OBRAS (EDIFICIOS EN CONSTRUCCIÓN)' },
  { codigo: 'IE', nombre: 'ESTRUCTURAS ESPECIALES PARA PROCESOS' },
  { codigo: 'IE', nombre: 'AEROPUERTOS' },
  { codigo: 'IE', nombre: 'MUELLES' },
  { codigo: 'IE', nombre: 'PUENTES' },
  { codigo: 'IE', nombre: 'ACUEDUCTOS Y CONDUCCIONES' },
  { codigo: 'IE', nombre: 'EDIFICIOS DE CONSERVACIÓN ARQUITECTÓNICA' },
  { codigo: 'IE', nombre: 'MONUMENTOS HISTÓRICOS' },
  { codigo: 'IO', nombre: 'OTRO' },
];

const CLASIFICACIONES_INMUEBLE: CodigoOption[] = [
  { codigo: 'IU', nombre: 'INMUEBLE URBANO' },
  { codigo: 'IR', nombre: 'INMUEBLE RURAL' },
  { codigo: 'IE', nombre: 'INMUEBLE ESPECIAL' },
  { codigo: 'IO', nombre: 'OTROS INMUEBLES' },
];

const PROPOSITOS_AVALUO: CodigoOption[] = [
  { codigo: 'OC', nombre: 'OTORGAMIENTO DE CRÉDITO' },
  { codigo: 'RC', nombre: 'REESTRUCTURACIÓN DE CRÉDITO' },
  { codigo: 'BU', nombre: 'BIENES EN USO' },
  { codigo: 'BA', nombre: 'BIENES ADJUDICADOS' },
  { codigo: 'PS', nombre: 'PÓLIZA DE SEGURO' },
  { codigo: 'PV', nombre: 'PARTICULAR / VENTA' },
  { codigo: 'RV', nombre: 'REFERENCIA DE VALORES' },
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysISO(dateISO: string, days: number) {
  const date = new Date(dateISO + 'T00:00:00');
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function nowISO() {
  return new Date().toISOString();
}

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function buildNumeroCotizacion() {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');

  return `COT-${yyyy}${mm}${dd}-${hh}${min}`;
}

function parseTipoInmuebleValue(value: string) {
  const [codigo, ...nombreParts] = value.split('::');

  return {
    codigo: codigo || '',
    nombre: nombreParts.join('::') || '',
  };
}

function readCatalogOptions(keys: string[]): CatalogOption[] {
  if (typeof window === 'undefined') return [];

  for (const key of keys) {
    const raw = window.localStorage.getItem(key);

    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw);
      const array = Array.isArray(parsed) ? parsed : parsed?.items;

      if (!Array.isArray(array)) continue;

      return array
        .map((item: any): CatalogOption | null => {
          const nombre =
            item.nombre ||
            item.name ||
            item.clienteNombre ||
            item.razonSocial ||
            item.displayName;

          if (!nombre) return null;

          return {
            id: String(item.id || item.codigo || nombre),
            nombre: String(nombre),
            email: item.email || item.correo || item.correoElectronico,
            telefono: item.telefono || item.phone || item.celular,
            direccion: item.direccion || item.address,
          };
        })
        .filter(Boolean) as CatalogOption[];
    } catch {
      // Ignorar datos inválidos
    }
  }

  return [];
}

function getCotizaciones() {
  if (typeof window === 'undefined') return [];

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CotizacionINMOVALLocal[]) : [];
  } catch {
    return [];
  }
}

function saveCotizaciones(cotizaciones: CotizacionINMOVALLocal[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cotizaciones));
}

function formatMoney(value: number, moneda: MonedaCotizacionINMOVAL) {
  return `${moneda} ${Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function estadoLabel(estado: EstadoCotizacionINMOVAL) {
  const labels: Record<EstadoCotizacionINMOVAL, string> = {
    borrador: 'Borrador',
    enviada: 'Enviada',
    aprobada: 'Aprobada',
    rechazada: 'Rechazada',
    convertida: 'Convertida',
  };

  return labels[estado];
}

function estadoClass(estado: EstadoCotizacionINMOVAL) {
  if (estado === 'aprobada') return 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100';
  if (estado === 'convertida') return 'border-sky-400/30 bg-sky-400/10 text-sky-100';
  if (estado === 'enviada') return 'border-amber-400/30 bg-amber-400/10 text-amber-100';
  if (estado === 'rechazada') return 'border-rose-400/30 bg-rose-400/10 text-rose-100';

  return 'border-slate-500/40 bg-slate-500/10 text-slate-100';
}

function MetricCard({
  label,
  value,
  description,
  icon,
}: {
  label: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <article className="rounded-3xl border border-slate-800 bg-slate-900/75 p-5 shadow-xl shadow-black/20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
            {label}
          </p>
          <p className="mt-3 text-3xl font-bold text-slate-50">{value}</p>
          <p className="mt-3 text-sm text-slate-400">{description}</p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/10 text-sky-300">
          {icon}
        </div>
      </div>
    </article>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
      {children}
    </span>
  );
}

export default function CotizacionesINMOVALPage() {
  const navigate = useNavigate();

  const clientes = useMemo(
    () => readCatalogOptions(['inmoval_clientes_v1', 'inmoval_clientes', 'clientes']),
    []
  );

  const [refreshKey, setRefreshKey] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<EstadoCotizacionINMOVAL | 'todos'>('todos');

  const cotizaciones = useMemo(() => getCotizaciones(), [refreshKey]);

  const cotizacionesFiltradas = useMemo(() => {
    const query = busqueda.trim().toLowerCase();

    return cotizaciones.filter((cotizacion) => {
      if (filtroEstado !== 'todos' && cotizacion.estado !== filtroEstado) return false;

      if (!query) return true;

      return [
        cotizacion.numero,
        cotizacion.clienteNombre,
        cotizacion.direccionInmueble,
        cotizacion.tipoInmuebleNombre,
        cotizacion.propositoAvaluoNombre,
        cotizacion.descripcionServicio,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [cotizaciones, busqueda, filtroEstado]);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [clienteModo, setClienteModo] = useState<'base' | 'nuevo'>(
    clientes.length > 0 ? 'base' : 'nuevo'
  );

  const [clienteId, setClienteId] = useState('');
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteEmail, setClienteEmail] = useState('');
  const [clienteTelefono, setClienteTelefono] = useState('');
  const [clienteDireccion, setClienteDireccion] = useState('');

  const [direccionInmueble, setDireccionInmueble] = useState('');
  const [tipoInmuebleValue, setTipoInmuebleValue] = useState('');
  const [clasificacionCodigo, setClasificacionCodigo] = useState('');
  const [propositoCodigo, setPropositoCodigo] = useState('');

  const [descripcionServicio, setDescripcionServicio] = useState('Avalúo de inmueble');
  const [costoServicio, setCostoServicio] = useState('0');
  const [moneda, setMoneda] = useState<MonedaCotizacionINMOVAL>('US$');
  const [fechaCotizacion, setFechaCotizacion] = useState(todayISO());
  const [fechaValidez, setFechaValidez] = useState(addDaysISO(todayISO(), 15));
  const [terminosCondiciones, setTerminosCondiciones] = useState(TERMINOS_BASE);

  const total = cotizaciones.length;
  const enviadas = cotizaciones.filter((item) => item.estado === 'enviada').length;
  const aprobadas = cotizaciones.filter((item) => item.estado === 'aprobada').length;
  const pendientesExpediente = cotizaciones.filter((item) => item.estado === 'aprobada' && !item.expedienteId).length;
  const montoTotal = cotizaciones.reduce((sum, item) => sum + Number(item.costoServicio || 0), 0);

  const tipoInmueble = parseTipoInmuebleValue(tipoInmuebleValue);
  const clasificacion = CLASIFICACIONES_INMUEBLE.find((item) => item.codigo === clasificacionCodigo);
  const proposito = PROPOSITOS_AVALUO.find((item) => item.codigo === propositoCodigo);

  function refrescar() {
    setRefreshKey((value) => value + 1);
  }

  function limpiarFormulario() {
    setClienteModo(clientes.length > 0 ? 'base' : 'nuevo');
    setClienteId('');
    setClienteNombre('');
    setClienteEmail('');
    setClienteTelefono('');
    setClienteDireccion('');
    setDireccionInmueble('');
    setTipoInmuebleValue('');
    setClasificacionCodigo('');
    setPropositoCodigo('');
    setDescripcionServicio('Avalúo de inmueble');
    setCostoServicio('0');
    setMoneda('US$');
    setFechaCotizacion(todayISO());
    setFechaValidez(addDaysISO(todayISO(), 15));
    setTerminosCondiciones(TERMINOS_BASE);
  }

  function handleClienteBaseChange(id: string) {
    setClienteId(id);

    const cliente = clientes.find((item) => item.id === id);

    if (!cliente) return;

    setClienteNombre(cliente.nombre);
    setClienteEmail(cliente.email || '');
    setClienteTelefono(cliente.telefono || '');
    setClienteDireccion(cliente.direccion || '');
  }

  function handleTipoInmuebleChange(value: string) {
    setTipoInmuebleValue(value);

    const parsed = parseTipoInmuebleValue(value);

    setClasificacionCodigo(parsed.codigo);
  }

  function guardarCotizacion() {
    const costo = Number(costoServicio || 0);

    if (!clienteNombre.trim()) {
      window.alert('Seleccioná o creá un cliente.');
      return;
    }

    if (!direccionInmueble.trim()) {
      window.alert('Ingresá la dirección del inmueble a valuar.');
      return;
    }

    if (!tipoInmueble.codigo || !tipoInmueble.nombre) {
      window.alert('Seleccioná el tipo de inmueble.');
      return;
    }

    if (!clasificacionCodigo || !clasificacion) {
      window.alert('Seleccioná la clasificación del inmueble.');
      return;
    }

    if (!propositoCodigo || !proposito) {
      window.alert('Seleccioná el propósito del avalúo.');
      return;
    }

    if (!Number.isFinite(costo) || costo < 0) {
      window.alert('Ingresá un costo válido.');
      return;
    }

    const ahora = nowISO();

    const cotizacion: CotizacionINMOVALLocal = {
      id: createId(),
      numero: buildNumeroCotizacion(),
      estado: 'borrador',

      clienteId: clienteId || undefined,
      clienteNombre: clienteNombre.trim(),
      clienteEmail: clienteEmail.trim() || undefined,
      clienteTelefono: clienteTelefono.trim() || undefined,
      clienteDireccion: clienteDireccion.trim() || undefined,

      direccionInmueble: direccionInmueble.trim(),
      tipoInmuebleCodigo: tipoInmueble.codigo,
      tipoInmuebleNombre: tipoInmueble.nombre,
      clasificacionInmuebleCodigo: clasificacion.codigo,
      clasificacionInmuebleNombre: clasificacion.nombre,
      propositoAvaluoCodigo: proposito.codigo,
      propositoAvaluoNombre: proposito.nombre,

      descripcionServicio: descripcionServicio.trim() || 'Avalúo de inmueble',
      costoServicio: costo,
      moneda,
      terminosCondiciones: terminosCondiciones.trim(),

      fechaCotizacion,
      fechaValidez,

      creadoEn: ahora,
      actualizadoEn: ahora,
    };

    saveCotizaciones([cotizacion, ...cotizaciones]);
    refrescar();
    limpiarFormulario();
    setMostrarFormulario(false);
  }

  function actualizarCotizacion(cotizacion: CotizacionINMOVALLocal, patch: Partial<CotizacionINMOVALLocal>) {
    saveCotizaciones(
      cotizaciones.map((item) =>
        item.id === cotizacion.id
          ? {
              ...item,
              ...patch,
              actualizadoEn: nowISO(),
            }
          : item
      )
    );

    refrescar();
  }

  function eliminarCotizacion(cotizacion: CotizacionINMOVALLocal) {
    const confirmar = window.confirm(`¿Eliminar la cotización ${cotizacion.numero}?`);

    if (!confirmar) return;

    saveCotizaciones(cotizaciones.filter((item) => item.id !== cotizacion.id));
    refrescar();
  }

  function convertirEnExpediente(cotizacion: CotizacionINMOVALLocal) {
    if (cotizacion.estado !== 'aprobada') {
      const confirmar = window.confirm(
        'Esta cotización todavía no está aprobada. ¿Querés aprobarla y continuar con el expediente?'
      );

      if (!confirmar) return;

      actualizarCotizacion(cotizacion, { estado: 'aprobada' });
    }

    navigate(`/expedientes-plataforma/nuevo?cotizacionId=${cotizacion.id}`);
  }

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/30">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-300">
                INMOVAL
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-50">
                Cotizaciones
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                Gestión de propuestas, aprobación comercial y apertura posterior de expediente.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setMostrarFormulario((value) => !value)}
                className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:bg-emerald-400/20"
              >
                <Plus className="h-4 w-4" />
                Nueva cotización
              </button>

              <button
                type="button"
                onClick={() => navigate('/cotizaciones/configuracion')}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-700 bg-slate-950/50 text-slate-200 transition hover:bg-slate-800"
                title="Configuración"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard label="Total" value={total} description="Cotizaciones registradas" icon={<Archive className="h-5 w-5" />} />
          <MetricCard label="Enviadas" value={enviadas} description="Pendientes de respuesta" icon={<Send className="h-5 w-5" />} />
          <MetricCard label="Aprobadas" value={aprobadas} description="Listas para expediente" icon={<CheckCircle2 className="h-5 w-5" />} />
          <MetricCard label="Pendientes" value={pendientesExpediente} description="Aprobadas sin expediente" icon={<ClipboardList className="h-5 w-5" />} />
          <MetricCard label="Monto" value={formatMoney(montoTotal, 'US$')} description="Monto cotizado" icon={<DollarSign className="h-5 w-5" />} />
        </section>

        {mostrarFormulario ? (
          <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/75 p-6 shadow-xl shadow-black/20">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                  Nueva cotización
                </p>
                <h2 className="mt-1 text-lg font-semibold text-slate-100">
                  Datos de propuesta
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setMostrarFormulario(false)}
                className="rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-6 grid gap-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2">
                  <FieldLabel>Cliente</FieldLabel>
                  <select
                    value={clienteModo === 'nuevo' ? '__nuevo__' : clienteId}
                    onChange={(event) => {
                      if (event.target.value === '__nuevo__') {
                        setClienteModo('nuevo');
                        setClienteId('');
                        setClienteNombre('');
                        setClienteEmail('');
                        setClienteTelefono('');
                        setClienteDireccion('');
                        return;
                      }

                      setClienteModo('base');
                      handleClienteBaseChange(event.target.value);
                    }}
                    className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                  >
                    <option value="">Seleccionar cliente</option>
                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nombre}
                      </option>
                    ))}
                    <option value="__nuevo__">+ Crear cliente nuevo</option>
                  </select>
                </label>

                <label className="grid gap-2">
                  <FieldLabel>Nombre del cliente</FieldLabel>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      value={clienteNombre}
                      onChange={(event) => setClienteNombre(event.target.value)}
                      placeholder="Nombre o razón social"
                      className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950/70 pl-10 pr-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                    />
                  </div>
                </label>

                <label className="grid gap-2">
                  <FieldLabel>Correo del cliente</FieldLabel>
                  <input
                    value={clienteEmail}
                    onChange={(event) => setClienteEmail(event.target.value)}
                    placeholder="correo@dominio.com"
                    className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                  />
                </label>

                <label className="grid gap-2">
                  <FieldLabel>Teléfono del cliente</FieldLabel>
                  <input
                    value={clienteTelefono}
                    onChange={(event) => setClienteTelefono(event.target.value)}
                    placeholder="Teléfono"
                    className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 md:col-span-2">
                  <FieldLabel>Dirección del inmueble a valuar</FieldLabel>
                  <input
                    value={direccionInmueble}
                    onChange={(event) => setDireccionInmueble(event.target.value)}
                    placeholder="Ubicación o dirección del inmueble"
                    className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                  />
                </label>

                <label className="grid gap-2">
                  <FieldLabel>Tipo de inmueble</FieldLabel>
                  <select
                    value={tipoInmuebleValue}
                    onChange={(event) => handleTipoInmuebleChange(event.target.value)}
                    className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                  >
                    <option value="">Seleccionar tipo</option>
                    {TIPOS_INMUEBLE.map((item) => (
                      <option key={`${item.codigo}-${item.nombre}`} value={`${item.codigo}::${item.nombre}`}>
                        {item.nombre} - {item.codigo}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2">
                  <FieldLabel>Clasificación</FieldLabel>
                  <select
                    value={clasificacionCodigo}
                    onChange={(event) => setClasificacionCodigo(event.target.value)}
                    className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                  >
                    <option value="">Seleccionar clasificación</option>
                    {CLASIFICACIONES_INMUEBLE.map((item) => (
                      <option key={item.codigo} value={item.codigo}>
                        {item.nombre} - {item.codigo}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2">
                  <FieldLabel>Propósito del avalúo</FieldLabel>
                  <select
                    value={propositoCodigo}
                    onChange={(event) => setPropositoCodigo(event.target.value)}
                    className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                  >
                    <option value="">Seleccionar propósito</option>
                    {PROPOSITOS_AVALUO.map((item) => (
                      <option key={item.codigo} value={item.codigo}>
                        {item.nombre} - {item.codigo}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2">
                  <FieldLabel>Descripción del servicio</FieldLabel>
                  <input
                    value={descripcionServicio}
                    onChange={(event) => setDescripcionServicio(event.target.value)}
                    placeholder="Avalúo de inmueble"
                    className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <label className="grid gap-2">
                  <FieldLabel>Costo</FieldLabel>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={costoServicio}
                    onChange={(event) => setCostoServicio(event.target.value)}
                    className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                  />
                </label>

                <label className="grid gap-2">
                  <FieldLabel>Moneda</FieldLabel>
                  <select
                    value={moneda}
                    onChange={(event) => setMoneda(event.target.value as MonedaCotizacionINMOVAL)}
                    className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                  >
                    <option value="US$">US$</option>
                    <option value="C$">C$</option>
                  </select>
                </label>

                <label className="grid gap-2">
                  <FieldLabel>Fecha cotización</FieldLabel>
                  <input
                    type="date"
                    value={fechaCotizacion}
                    onChange={(event) => setFechaCotizacion(event.target.value)}
                    className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                  />
                </label>

                <label className="grid gap-2">
                  <FieldLabel>Validez</FieldLabel>
                  <input
                    type="date"
                    value={fechaValidez}
                    onChange={(event) => setFechaValidez(event.target.value)}
                    className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                  />
                </label>
              </div>

              <label className="grid gap-2">
                <FieldLabel>Términos y condiciones</FieldLabel>
                <textarea
                  value={terminosCondiciones}
                  onChange={(event) => setTerminosCondiciones(event.target.value)}
                  rows={7}
                  className="rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                />
              </label>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={guardarCotizacion}
                  className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:bg-emerald-400/20"
                >
                  <FilePlus2 className="h-4 w-4" />
                  Guardar cotización
                </button>

                <button
                  type="button"
                  onClick={limpiarFormulario}
                  className="rounded-2xl border border-slate-700 bg-slate-950/50 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
                >
                  Limpiar
                </button>
              </div>
            </div>
          </section>
        ) : null}

        <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/75 p-5 shadow-xl shadow-black/20">
          <div className="grid gap-3 lg:grid-cols-[1fr_200px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                placeholder="Buscar por cotización, cliente, inmueble o propósito..."
                className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950/70 pl-11 pr-3 text-sm text-slate-100 outline-none transition focus:border-sky-400"
              />
            </div>

            <select
              value={filtroEstado}
              onChange={(event) => setFiltroEstado(event.target.value as EstadoCotizacionINMOVAL | 'todos')}
              className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-sky-400"
            >
              <option value="todos">Todos los estados</option>
              <option value="borrador">Borrador</option>
              <option value="enviada">Enviada</option>
              <option value="aprobada">Aprobada</option>
              <option value="rechazada">Rechazada</option>
              <option value="convertida">Convertida</option>
            </select>
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/75 shadow-xl shadow-black/20">
          {cotizacionesFiltradas.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-lg font-semibold text-slate-100">
                No hay cotizaciones registradas
              </p>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400">
                Creá una cotización para iniciar el flujo comercial antes del expediente.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="px-5 py-4 font-medium">Cotización</th>
                    <th className="px-5 py-4 font-medium">Cliente</th>
                    <th className="px-5 py-4 font-medium">Inmueble</th>
                    <th className="px-5 py-4 font-medium">Monto</th>
                    <th className="px-5 py-4 font-medium">Estado</th>
                    <th className="px-5 py-4 font-medium">Validez</th>
                    <th className="px-5 py-4 text-right font-medium">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {cotizacionesFiltradas.map((cotizacion) => (
                    <tr key={cotizacion.id} className="border-b border-slate-800/80 align-top last:border-0 hover:bg-slate-950/30">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-50">{cotizacion.numero}</p>
                        <p className="mt-1 text-xs text-slate-500">{cotizacion.descripcionServicio}</p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-slate-100">{cotizacion.clienteNombre}</p>
                        <p className="mt-1 text-xs text-slate-500">{cotizacion.clienteTelefono || cotizacion.clienteEmail || 'Sin contacto'}</p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="max-w-[260px] truncate text-slate-100">
                          {cotizacion.tipoInmuebleNombre} - {cotizacion.tipoInmuebleCodigo}
                        </p>
                        <p className="mt-1 max-w-[260px] truncate text-xs text-slate-500">
                          {cotizacion.direccionInmueble}
                        </p>
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-50">
                        {formatMoney(cotizacion.costoServicio, cotizacion.moneda)}
                      </td>

                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${estadoClass(cotizacion.estado)}`}>
                          {estadoLabel(cotizacion.estado)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-300">
                        {cotizacion.fechaValidez}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-wrap justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => actualizarCotizacion(cotizacion, { estado: 'enviada' })}
                            className="rounded-xl border border-slate-700 bg-slate-950/50 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800"
                          >
                            Enviada
                          </button>

                          <button
                            type="button"
                            onClick={() => actualizarCotizacion(cotizacion, { estado: 'aprobada' })}
                            className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-xs font-medium text-emerald-100 hover:bg-emerald-400/20"
                          >
                            Aprobar
                          </button>

                          <button
                            type="button"
                            onClick={() => convertirEnExpediente(cotizacion)}
                            className="rounded-xl border border-sky-400/30 bg-sky-400/10 px-3 py-2 text-xs font-medium text-sky-100 hover:bg-sky-400/20"
                          >
                            Crear expediente
                          </button>

                          <button
                            type="button"
                            onClick={() => eliminarCotizacion(cotizacion)}
                            className="inline-flex items-center gap-1 rounded-xl border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-xs font-medium text-rose-100 hover:bg-rose-400/20"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
