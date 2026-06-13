import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  CalendarDays,
  ClipboardList,
  DollarSign,
  Mail,
  MapPin,
  Save,
  User,
  UserSquare2,
} from 'lucide-react';

import { TipoModuloTecnico } from '@/shared/types/inmovalCore';
import { addDaysISO, nowISO, todayISO } from '@/shared/utils/dateUtils';
import { getConfiguracionExpedientesINMOVAL } from './expedienteConfigStorage';
import { upsertExpedienteIndiceINMOVAL } from './expedienteIndexStorage';
import { ExpedienteIndiceINMOVAL } from './expedienteIndexTypes';
import { registrarActividadExpedienteINMOVAL } from './expedienteActivityStorage';
import {
  MonedaINMOVAL,
  PrioridadExpedienteINMOVAL,
} from './expedienteTypes';

type CatalogOption = {
  id: string;
  nombre: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  codigo?: string;
};

type CodigoOption = {
  codigo: string;
  nombre: string;
};

type CotizacionPrecargaINMOVAL = {
  id: string;
  numero: string;
  estado?: string;

  clienteId?: string;
  clienteNombre?: string;
  clienteEmail?: string;
  clienteTelefono?: string;
  clienteDireccion?: string;

  direccionInmueble?: string;
  tipoInmuebleCodigo?: string;
  tipoInmuebleNombre?: string;
  clasificacionInmuebleCodigo?: string;
  clasificacionInmuebleNombre?: string;
  propositoAvaluoCodigo?: string;
  propositoAvaluoNombre?: string;

  descripcionServicio?: string;
  costoServicio?: number;
  moneda?: string;
  terminosCondiciones?: string;
};

const INSTITUCIONES_SOLICITANTES = [
  'SIBOIF',
  'BANCO DE LA PRODUCCIÓN - BANPRO',
  'BANCO DE AMÉRICA CENTRAL - BAC',
  'BANCO LAFISE BANCENTRO',
  'BANCO DE FINANZAS',
  'BANCO AVANZ',
  'SEGUROS LAFISE',
  'OTROS',
];

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

function getCotizacionPrecargaINMOVAL(): CotizacionPrecargaINMOVAL | null {
  if (typeof window === 'undefined') return null;

  const cotizacionId = new URLSearchParams(window.location.search).get('cotizacionId');

  if (!cotizacionId) return null;

  const raw = window.localStorage.getItem('inmoval_cotizaciones_v1');

  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) return null;

    return (
      parsed.find((item: CotizacionPrecargaINMOVAL) => item.id === cotizacionId) ||
      null
    );
  } catch {
    return null;
  }
}

function marcarCotizacionComoConvertidaINMOVAL(cotizacionId: string, expedienteId: string) {
  if (typeof window === 'undefined') return;

  const raw = window.localStorage.getItem('inmoval_cotizaciones_v1');

  if (!raw) return;

  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) return;

    const actualizadas = parsed.map((item: CotizacionPrecargaINMOVAL) =>
      item.id === cotizacionId
        ? {
            ...item,
            estado: 'convertida',
            expedienteId,
            actualizadoEn: nowISO(),
          }
        : item
    );

    window.localStorage.setItem(
      'inmoval_cotizaciones_v1',
      JSON.stringify(actualizadas)
    );
  } catch {
    // No bloquear creación del expediente por error al actualizar cotización.
  }
}

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
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
            codigo: item.codigo,
          };
        })
        .filter(Boolean) as CatalogOption[];
    } catch {
      // Ignorar datos inválidos
    }
  }

  return [];
}

function saveNewClientIfNeeded(cliente: CatalogOption) {
  if (typeof window === 'undefined') return;

  const key = 'inmoval_clientes_v1';
  const raw = window.localStorage.getItem(key);

  let actuales: CatalogOption[] = [];

  try {
    const parsed = raw ? JSON.parse(raw) : [];
    actuales = Array.isArray(parsed) ? parsed : [];
  } catch {
    actuales = [];
  }

  const exists = actuales.some(
    (item) => item.nombre.toLowerCase() === cliente.nombre.toLowerCase()
  );

  if (exists) return;

  window.localStorage.setItem(
    key,
    JSON.stringify([
      {
        ...cliente,
        creadoEn: nowISO(),
        actualizadoEn: nowISO(),
      },
      ...actuales,
    ])
  );
}

function normalizeCode(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '')
    .toUpperCase()
    .slice(0, 24);
}

function formatDateCode(value: string) {
  return value.replaceAll('-', '');
}

function buildCodigoExpediente({
  clasificacionCodigo,
  propositoCodigo,
  fechaCreacion,
  clienteNombre,
}: {
  clasificacionCodigo: string;
  propositoCodigo: string;
  fechaCreacion: string;
  clienteNombre: string;
}) {
  const clasificacion = clasificacionCodigo || 'CL';
  const proposito = propositoCodigo || 'PR';
  const fecha = formatDateCode(fechaCreacion || todayISO());
  const cliente = normalizeCode(clienteNombre || 'CLIENTE');

  return `${clasificacion}_${proposito}_${fecha}_${cliente}`;
}

function parseTipoInmuebleValue(value: string) {
  const [codigo, ...nombreParts] = value.split('::');

  return {
    codigo: codigo || '',
    nombre: nombreParts.join('::') || '',
  };
}

function moduloFromClasificacion(codigo: string): TipoModuloTecnico {
  if (codigo === 'IU') return 'urbano';
  if (codigo === 'IR') return 'rural';
  if (codigo === 'IE') return 'especiales';

  return 'urbano';
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
      {children}
    </span>
  );
}

export default function NuevoExpedienteINMOVALPage() {
  const navigate = useNavigate();
  const config = useMemo(() => getConfiguracionExpedientesINMOVAL(), []);
  const cotizacionPrecarga = useMemo(() => getCotizacionPrecargaINMOVAL(), []);

  const clientes = useMemo(
    () => readCatalogOptions(['inmoval_clientes_v1', 'inmoval_clientes', 'clientes']),
    []
  );

  const peritos = useMemo(
    () => readCatalogOptions(['inmoval_peritos_v1', 'inmoval_peritos', 'peritos']),
    []
  );

  const fechaCreacion = todayISO();

  const [clienteModo, setClienteModo] = useState<'base' | 'nuevo'>(
    clientes.length > 0 ? 'base' : 'nuevo'
  );
  const [clienteId, setClienteId] = useState('');
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteEmail, setClienteEmail] = useState('');
  const [clienteTelefono, setClienteTelefono] = useState('');
  const [clienteDireccion, setClienteDireccion] = useState('');

  const [peritoId, setPeritoId] = useState('');
  const [peritoNombre, setPeritoNombre] = useState('');

  const [correoElectronico, setCorreoElectronico] = useState('');
  const [institucionSolicitante, setInstitucionSolicitante] = useState('');
  const [nombreSolicitante, setNombreSolicitante] = useState('');
  const [informacionContacto, setInformacionContacto] = useState('');
  const [direccionInmueble, setDireccionInmueble] = useState('');

  const [tipoInmuebleValue, setTipoInmuebleValue] = useState('');
  const [clasificacionCodigo, setClasificacionCodigo] = useState('');
  const [propositoCodigo, setPropositoCodigo] = useState('');

  const [tipoModulo, setTipoModulo] = useState<TipoModuloTecnico>('urbano');
  const [prioridad, setPrioridad] = useState<PrioridadExpedienteINMOVAL>(
    config.prioridadPredeterminada
  );

  const [moneda, setMoneda] = useState<MonedaINMOVAL>(
    config.monedaPredeterminada
  );
  const [costoServicio, setCostoServicio] = useState('0');

  const [fechaInspeccion, setFechaInspeccion] = useState(todayISO());
  const [fechaEntregaEstimada, setFechaEntregaEstimada] = useState(
    addDaysISO(todayISO(), 5)
  );

  const [notas, setNotas] = useState('');
  const [precargaAplicada, setPrecargaAplicada] = useState(false);

  const tipoInmueble = parseTipoInmuebleValue(tipoInmuebleValue);
  const clasificacion = CLASIFICACIONES_INMUEBLE.find(
    (item) => item.codigo === clasificacionCodigo
  );
  const proposito = PROPOSITOS_AVALUO.find(
    (item) => item.codigo === propositoCodigo
  );

  const codigoPreview = buildCodigoExpediente({
    clasificacionCodigo,
    propositoCodigo,
    fechaCreacion,
    clienteNombre,
  });

  function handleClienteBaseChange(id: string) {
    setClienteId(id);

    const cliente = clientes.find((item) => item.id === id);

    if (!cliente) return;

    setClienteNombre(cliente.nombre);
    setClienteEmail(cliente.email || '');
    setClienteTelefono(cliente.telefono || '');
    setClienteDireccion(cliente.direccion || '');
  }

  function handlePeritoChange(id: string) {
    setPeritoId(id);

    const perito = peritos.find((item) => item.id === id);

    if (!perito) {
      setPeritoNombre('');
      return;
    }

    setPeritoNombre(perito.nombre);
  }

  function handleTipoInmuebleChange(value: string) {
    setTipoInmuebleValue(value);

    const parsed = parseTipoInmuebleValue(value);

    setClasificacionCodigo(parsed.codigo);
    setTipoModulo(moduloFromClasificacion(parsed.codigo));
  }

  function handleClasificacionChange(codigo: string) {
    setClasificacionCodigo(codigo);
    setTipoModulo(moduloFromClasificacion(codigo));
  }

  function handleFechaInspeccionChange(value: string) {
    setFechaInspeccion(value);
    setFechaEntregaEstimada(addDaysISO(value, 5));
  }

  useEffect(() => {
    if (!cotizacionPrecarga || precargaAplicada) return;

    // Precargar datos desde cotización
    const clienteExisteEnBase =
      cotizacionPrecarga.clienteId &&
      clientes.some((cliente) => cliente.id === cotizacionPrecarga.clienteId);

    setClienteModo(clienteExisteEnBase ? 'base' : 'nuevo');
    setClienteId(clienteExisteEnBase ? cotizacionPrecarga.clienteId || '' : '');
    setClienteNombre(cotizacionPrecarga.clienteNombre || '');
    setClienteEmail(cotizacionPrecarga.clienteEmail || '');
    setClienteTelefono(cotizacionPrecarga.clienteTelefono || '');
    setClienteDireccion(cotizacionPrecarga.clienteDireccion || '');

    setCorreoElectronico(cotizacionPrecarga.clienteEmail || '');
    setInformacionContacto(
      cotizacionPrecarga.clienteTelefono ||
        cotizacionPrecarga.clienteEmail ||
        ''
    );

    setDireccionInmueble(cotizacionPrecarga.direccionInmueble || '');

    if (
      cotizacionPrecarga.tipoInmuebleCodigo &&
      cotizacionPrecarga.tipoInmuebleNombre
    ) {
      setTipoInmuebleValue(
        cotizacionPrecarga.tipoInmuebleCodigo +
          '::' +
          cotizacionPrecarga.tipoInmuebleNombre
      );
    }

    const clasificacionDesdeCotizacion =
      cotizacionPrecarga.clasificacionInmuebleCodigo ||
      cotizacionPrecarga.tipoInmuebleCodigo ||
      '';

    setClasificacionCodigo(clasificacionDesdeCotizacion);
    setPropositoCodigo(cotizacionPrecarga.propositoAvaluoCodigo || '');
    setTipoModulo(moduloFromClasificacion(clasificacionDesdeCotizacion));

    setCostoServicio(String(cotizacionPrecarga.costoServicio || 0));

    const monedaCotizacion = cotizacionPrecarga.moneda;

    if (monedaCotizacion === 'C' + '$' || monedaCotizacion === 'US' + '$') {
      setMoneda(monedaCotizacion as MonedaINMOVAL);
    }

    setNotas(
      [
        'Origen: cotización ' + cotizacionPrecarga.numero,
        cotizacionPrecarga.descripcionServicio
          ? 'Servicio cotizado: ' + cotizacionPrecarga.descripcionServicio
          : '',
        cotizacionPrecarga.terminosCondiciones
          ? 'Términos y condiciones aprobados:\n' +
            cotizacionPrecarga.terminosCondiciones
          : '',
      ]
        .filter(Boolean)
        .join('\n\n')
    );

    setPrecargaAplicada(true);
  }, [cotizacionPrecarga, precargaAplicada, clientes]);

  function handleCrearExpediente() {
    const costo = Number(costoServicio || 0);

    if (!clienteNombre.trim()) {
      window.alert('Seleccioná o creá un cliente.');
      return;
    }

    if (!informacionContacto.trim()) {
      window.alert('Ingresá la información de contacto.');
      return;
    }

    if (!direccionInmueble.trim()) {
      window.alert('Ingresá la dirección del inmueble.');
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

    if (!fechaInspeccion) {
      window.alert('Seleccioná la fecha de inspección.');
      return;
    }

    if (!fechaEntregaEstimada) {
      window.alert('Seleccioná la fecha de entrega.');
      return;
    }

    if (!Number.isFinite(costo) || costo < 0) {
      window.alert('Ingresá un costo válido.');
      return;
    }

    if (clienteModo === 'nuevo') {
      saveNewClientIfNeeded({
        id: clienteId || createId(),
        nombre: clienteNombre.trim(),
        email: clienteEmail.trim() || undefined,
        telefono: clienteTelefono.trim() || undefined,
        direccion: clienteDireccion.trim() || undefined,
      });
    }

    const id = createId();
    const codigo = codigoPreview;
    const ahora = nowISO();
    const titulo = `${proposito.nombre} - ${tipoInmueble.nombre}`;

    const expediente: ExpedienteIndiceINMOVAL = {
      id,
      codigo,
      titulo,

      tipoModulo,
      estado: config.estadoInicial,
      prioridad,

      clienteId: clienteId || undefined,
      clienteNombre: clienteNombre.trim(),
      clienteEmail: clienteEmail.trim() || correoElectronico.trim() || undefined,
      clienteTelefono: clienteTelefono.trim() || undefined,
      clienteDireccion: clienteDireccion.trim() || undefined,

      peritoId: peritoId || undefined,
      peritoNombre: peritoNombre.trim() || undefined,

      correoElectronico: correoElectronico.trim() || undefined,
      institucionSolicitante: institucionSolicitante || undefined,
      nombreSolicitante: nombreSolicitante.trim() || undefined,
      informacionContacto: informacionContacto.trim(),
      direccionInmueble: direccionInmueble.trim(),

      tipoInmuebleCodigo: tipoInmueble.codigo,
      tipoInmuebleNombre: tipoInmueble.nombre,
      clasificacionInmuebleCodigo: clasificacion.codigo,
      clasificacionInmuebleNombre: clasificacion.nombre,
      propositoAvaluoCodigo: proposito.codigo,
      propositoAvaluoNombre: proposito.nombre,

      fechaSolicitud: fechaCreacion,
      fechaInspeccion,
      fechaEntregaEstimada,
      fechaCierre: undefined,

      costoServicio: costo,
      montoPagado: 0,
      saldo: costo,
      moneda,
      estadoPago: costo > 0 ? 'pendiente' : 'no_aplica',

      facturaEmitida: false,
      numeroFactura: undefined,

      revisionActivaCodigo: 'Rev00',
      totalRevisiones: 0,

      driveUrl: undefined,
      archivoImvNombre: `${codigo}.imv`,

      notas: notas.trim() || undefined,

      creadoEn: ahora,
      actualizadoEn: ahora,
    };

    upsertExpedienteIndiceINMOVAL(expediente);

    registrarActividadExpedienteINMOVAL({
      expedienteId: id,
      tipo: 'nota',
      titulo: 'Expediente creado',
      descripcion: `Se creó el expediente ${codigo} para ${clienteNombre.trim()}.`,
      creadoEn: ahora,
    });

    navigate('/expedientes-plataforma');
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
                Nuevo expediente
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                Creá un expediente único con cliente, perito, contacto, inmueble,
                propósito, fechas, costo y código automático.
              </p>
            </div>

            <div className="rounded-2xl border border-sky-400/20 bg-sky-400/10 px-4 py-3 text-sm text-sky-100">
              Código: <span className="font-semibold">{codigoPreview}</span>
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
          <article className="rounded-3xl border border-slate-800 bg-slate-900/75 p-6 shadow-xl shadow-black/20">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                  Apertura de expediente
                </p>
                <h2 className="text-lg font-semibold text-slate-100">
                  Información principal
                </h2>
              </div>
            </div>

            <div className="mt-6 grid gap-6">
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
                  <FieldLabel>Perito responsable</FieldLabel>
                  <select
                    value={peritoId}
                    onChange={(event) => handlePeritoChange(event.target.value)}
                    className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                  >
                    <option value="">Seleccionar perito</option>
                    {peritos.map((perito) => (
                      <option key={perito.id} value={perito.id}>
                        {perito.nombre}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {clienteModo === 'nuevo' ? (
                <div className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-950/40 p-4 md:grid-cols-2">
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
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        value={clienteEmail}
                        onChange={(event) => setClienteEmail(event.target.value)}
                        placeholder="correo@dominio.com"
                        className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950/70 pl-10 pr-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                      />
                    </div>
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

                  <label className="grid gap-2">
                    <FieldLabel>Dirección del cliente</FieldLabel>
                    <input
                      value={clienteDireccion}
                      onChange={(event) => setClienteDireccion(event.target.value)}
                      placeholder="Dirección"
                      className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                    />
                  </label>
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2">
                  <FieldLabel>Correo electrónico</FieldLabel>
                  <input
                    value={correoElectronico}
                    onChange={(event) => setCorreoElectronico(event.target.value)}
                    placeholder="Correo de contacto del expediente"
                    className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                  />
                </label>

                <label className="grid gap-2">
                  <FieldLabel>Institución solicitante</FieldLabel>
                  <select
                    value={institucionSolicitante}
                    onChange={(event) => setInstitucionSolicitante(event.target.value)}
                    className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                  >
                    <option value="">Seleccionar institución</option>
                    {INSTITUCIONES_SOLICITANTES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2">
                  <FieldLabel>Nombre del solicitante</FieldLabel>
                  <input
                    value={nombreSolicitante}
                    onChange={(event) => setNombreSolicitante(event.target.value)}
                    placeholder="Nombre del solicitante"
                    className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                  />
                </label>

                <label className="grid gap-2">
                  <FieldLabel>Información de contacto</FieldLabel>
                  <input
                    value={informacionContacto}
                    onChange={(event) => setInformacionContacto(event.target.value)}
                    placeholder="Teléfono, correo, persona de contacto..."
                    className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                  />
                </label>

                <label className="grid gap-2 md:col-span-2">
                  <FieldLabel>Dirección del inmueble</FieldLabel>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      value={direccionInmueble}
                      onChange={(event) => setDireccionInmueble(event.target.value)}
                      placeholder="Ubicación o dirección del inmueble"
                      className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950/70 pl-10 pr-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                    />
                  </div>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
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
                  <FieldLabel>Clasificación del inmueble</FieldLabel>
                  <select
                    value={clasificacionCodigo}
                    onChange={(event) => handleClasificacionChange(event.target.value)}
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
                  <FieldLabel>Módulo técnico</FieldLabel>
                  <div className="relative">
                    <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <select
                      value={tipoModulo}
                      onChange={(event) =>
                        setTipoModulo(event.target.value as TipoModuloTecnico)
                      }
                      className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950/70 pl-10 pr-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                    >
                      <option value="urbano">Urbano</option>
                      <option value="rural">Rural</option>
                      <option value="maquinaria">Maquinaria</option>
                      <option value="vehiculos">Vehículos</option>
                      <option value="especiales">Especiales</option>
                    </select>
                  </div>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-5">
                <label className="grid gap-2">
                  <FieldLabel>Prioridad</FieldLabel>
                  <select
                    value={prioridad}
                    onChange={(event) =>
                      setPrioridad(event.target.value as PrioridadExpedienteINMOVAL)
                    }
                    className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                  >
                    <option value="baja">Baja</option>
                    <option value="normal">Normal</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </label>

                <label className="grid gap-2">
                  <FieldLabel>Costo</FieldLabel>
                  <div className="relative">
                    <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={costoServicio}
                      onChange={(event) => setCostoServicio(event.target.value)}
                      className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950/70 pl-10 pr-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                    />
                  </div>
                </label>

                <label className="grid gap-2">
                  <FieldLabel>Moneda</FieldLabel>
                  <select
                    value={moneda}
                    onChange={(event) =>
                      setMoneda(event.target.value as MonedaINMOVAL)
                    }
                    className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                  >
                    <option value="US$">US$</option>
                    <option value="C$">C$</option>
                  </select>
                </label>

                <label className="grid gap-2">
                  <FieldLabel>Fecha inspección</FieldLabel>
                  <input
                    type="date"
                    value={fechaInspeccion}
                    onChange={(event) => handleFechaInspeccionChange(event.target.value)}
                    className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                  />
                </label>

                <label className="grid gap-2">
                  <FieldLabel>Fecha entrega</FieldLabel>
                  <input
                    type="date"
                    value={fechaEntregaEstimada}
                    onChange={(event) => setFechaEntregaEstimada(event.target.value)}
                    className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                  />
                </label>
              </div>

              <label className="grid gap-2">
                <FieldLabel>Notas</FieldLabel>
                <textarea
                  value={notas}
                  onChange={(event) => setNotas(event.target.value)}
                  rows={4}
                  placeholder="Notas internas del expediente..."
                  className="rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                />
              </label>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleCrearExpediente}
                className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:bg-emerald-400/20"
              >
                <Save className="h-4 w-4" />
                Crear expediente
              </button>

              <button
                type="button"
                onClick={() => navigate('/expedientes-plataforma')}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950/50 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
              >
                Cancelar
              </button>
            </div>
          </article>

          <aside className="rounded-3xl border border-slate-800 bg-slate-900/75 p-6 shadow-xl shadow-black/20">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/10 text-sky-300">
              <ArrowRight className="h-5 w-5" />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-100">
              Código automático
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              El expediente se codifica con clasificación, propósito, fecha de creación
              y cliente.
            </p>

            <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                Código generado
              </p>
              <p className="mt-2 break-all text-lg font-semibold text-sky-100">
                {codigoPreview}
              </p>
            </div>

            <div className="mt-5 grid gap-3 text-sm">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                <p className="text-slate-500">Formato</p>
                <p className="mt-1 font-semibold text-slate-100">
                  CLASIFICACIÓN_PROPÓSITO_AAAAMMDD_CLIENTE
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                <p className="text-slate-500">Regla entrega</p>
                <p className="mt-1 text-sm text-slate-300">
                  Por ahora se calcula 5 días después de la fecha de inspección.
                  Luego se ajustará a la etapa real de inspección realizada.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                <p className="text-slate-500">Archivo inicial</p>
                <p className="mt-1 font-semibold text-slate-100">
                  {codigoPreview}.imv
                </p>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
