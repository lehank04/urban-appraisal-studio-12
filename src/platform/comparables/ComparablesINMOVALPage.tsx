import { useMemo, useState, type ReactNode } from 'react';
import {
  Archive,
  CheckCircle2,
  Database,
  Download,
  FileInput,
  FileImage,
  Home,
  PlusCircle,
  PencilLine,
  Search,
  Trash2,
  Upload,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { nowISO, todayISO } from '@/shared/utils/dateUtils';
import {
  AplicacionMercadoComparableINMOVAL,
  ComparableIndiceINMOVAL,
  EstadoComparableINMOVAL,
  MonedaComparableINMOVAL,
  TipoComparableINMOVAL,
  filtrarComparablesINMOVAL,
  getComparablesIndiceINMOVAL,
  removeComparableINMOVAL,
  upsertComparableINMOVAL,
} from './comparableStorage';
import {
  downloadComparableIMC,
  readComparableIMCFile,
} from './comparableImcIO';

type TipoFiltroComparable = TipoComparableINMOVAL | 'todos';
type EstadoFiltroComparable = EstadoComparableINMOVAL | 'todos';

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function buildCodigoComparable() {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');

  return `IMC-${yyyy}${mm}${dd}-${hh}${min}${ss}`;
}

function formatMoney(value: number, moneda: MonedaComparableINMOVAL) {
  return `${moneda} ${Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
      {children}
    </span>
  );
}

function ComparableBadge({
  children,
  tone = 'sky',
}: {
  children: ReactNode;
  tone?: 'sky' | 'emerald' | 'amber' | 'slate';
}) {
  const classes = {
    sky: 'border-sky-400/30 bg-sky-400/10 text-sky-100',
    emerald: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100',
    amber: 'border-amber-400/30 bg-amber-400/10 text-amber-100',
    slate: 'border-slate-700 bg-slate-950/60 text-slate-300',
  };

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${classes[tone]}`}>
      {children}
    </span>
  );
}

export default function ComparablesINMOVALPage() {
  const [comparables, setComparables] = useState<ComparableIndiceINMOVAL[]>(
    () => getComparablesIndiceINMOVAL()
  );

  const [busqueda, setBusqueda] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<TipoFiltroComparable>('todos');
  const [estadoFiltro, setEstadoFiltro] =
    useState<EstadoFiltroComparable>('todos');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [titulo, setTitulo] = useState('Comparable urbano');
  const [tipo, setTipo] = useState<TipoComparableINMOVAL>('oferta');
  const [aplicaMercado, setAplicaMercado] =
    useState<AplicacionMercadoComparableINMOVAL>('ambos');
  const [estado, setEstado] = useState<EstadoComparableINMOVAL>('activo');
  const [fuente, setFuente] = useState('');
  const [contacto, setContacto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [url, setUrl] = useState('');
  const [testigoWebImagenDataUrl, setTestigoWebImagenDataUrl] = useState('');
  const [testigoWebImagenNombre, setTestigoWebImagenNombre] = useState('');
  const [testigoWebNotas, setTestigoWebNotas] = useState('');
  const [fecha, setFecha] = useState(todayISO());
  const [ubicacion, setUbicacion] = useState('');
  const [barrio, setBarrio] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [areaTerreno, setAreaTerreno] = useState('');
  const [areaConstruccion, setAreaConstruccion] = useState('');
  const [precio, setPrecio] = useState('0');
  const [moneda, setMoneda] = useState<MonedaComparableINMOVAL>('US$');
  const [observaciones, setObservaciones] = useState('');
  const [importMessage, setImportMessage] = useState('');
  const [error, setError] = useState('');
  const [editingComparableId, setEditingComparableId] = useState<string | null>(
    null
  );

  function refrescar() {
    setComparables(getComparablesIndiceINMOVAL());
  }

  function handleSeleccionarTestigoWeb(file?: File) {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      window.alert('Seleccioná una imagen válida como respaldo web.');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setTestigoWebImagenDataUrl(String(reader.result || ''));
      setTestigoWebImagenNombre(file.name);
    };

    reader.onerror = () => {
      window.alert('No se pudo leer la imagen del respaldo web.');
    };

    reader.readAsDataURL(file);
  }

  function limpiarTestigoWeb() {
    setTestigoWebImagenDataUrl('');
    setTestigoWebImagenNombre('');
    setTestigoWebNotas('');
  }

  function limpiarFormulario() {
    setTitulo('Comparable urbano');
    setTipo('oferta');
    setAplicaMercado('ambos');
    setEstado('activo');
    setFuente('');
    setContacto('');
    setTelefono('');
    setUrl('');
    limpiarTestigoWeb();
    setFecha(todayISO());
    setUbicacion('');
    setBarrio('');
    setMunicipio('');
    setDepartamento('');
    setAreaTerreno('');
    setAreaConstruccion('');
    setPrecio('0');
    setMoneda('US$');
    setObservaciones('');
    setEditingComparableId(null);
  }

  function handleEditarComparable(comparable: ComparableIndiceINMOVAL) {
    setEditingComparableId(comparable.id);

    setTitulo(comparable.titulo || 'Comparable urbano');
    setTipo(comparable.tipo || 'oferta');
    setAplicaMercado(comparable.aplicaMercado || 'ambos');
    setEstado(comparable.estado || 'activo');

    setFuente(comparable.fuente || '');
    setContacto(comparable.contacto || '');
    setTelefono(comparable.telefono || '');
    setUrl(comparable.url || '');

    setTestigoWebImagenDataUrl(comparable.testigoWebImagenDataUrl || '');
    setTestigoWebImagenNombre(comparable.testigoWebImagenNombre || '');
    setTestigoWebNotas(comparable.testigoWebNotas || '');

    setFecha(comparable.fecha || todayISO());

    setUbicacion(comparable.ubicacion || '');
    setBarrio(comparable.barrio || '');
    setMunicipio(comparable.municipio || '');
    setDepartamento(comparable.departamento || '');

    setAreaTerreno(
      comparable.areaTerreno !== undefined ? String(comparable.areaTerreno) : ''
    );
    setAreaConstruccion(
      comparable.areaConstruccion !== undefined
        ? String(comparable.areaConstruccion)
        : ''
    );

    setPrecio(String(comparable.precio || 0));
    setMoneda(comparable.moneda || 'US$');
    setObservaciones(comparable.observaciones || '');

    setMostrarFormulario(true);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  function handleCrearComparable() {
    const precioNumero = Number(precio || 0);
    const areaTerrenoNumero = Number(areaTerreno || 0);
    const areaConstruccionNumero = Number(areaConstruccion || 0);

    if (!titulo.trim()) {
      window.alert('Ingresá un título para el comparable.');
      return;
    }

    if (!ubicacion.trim()) {
      window.alert('Ingresá la ubicación del comparable.');
      return;
    }

    if (!Number.isFinite(precioNumero) || precioNumero < 0) {
      window.alert('Ingresá un precio válido.');
      return;
    }

    const ahora = nowISO();

    const comparableExistente = editingComparableId
      ? comparables.find((item) => item.id === editingComparableId)
      : undefined;

    const codigo = comparableExistente?.codigo || buildCodigoComparable();

    const comparable: ComparableIndiceINMOVAL = {
      id: editingComparableId || createId(),
      codigo,
      titulo: titulo.trim(),

      tipo,
      aplicaMercado,
      estado,

      fuente: fuente.trim() || undefined,
      contacto: contacto.trim() || undefined,
      telefono: telefono.trim() || undefined,
      url: url.trim() || undefined,

      testigoWebImagenDataUrl: testigoWebImagenDataUrl || undefined,
      testigoWebImagenNombre: testigoWebImagenNombre || undefined,
      testigoWebCapturadoEn: testigoWebImagenDataUrl
        ? comparableExistente?.testigoWebCapturadoEn || nowISO()
        : undefined,
      testigoWebNotas: testigoWebNotas.trim() || undefined,

      fecha,

      ubicacion: ubicacion.trim(),
      barrio: barrio.trim() || undefined,
      municipio: municipio.trim() || undefined,
      departamento: departamento.trim() || undefined,

      areaTerreno: areaTerrenoNumero > 0 ? areaTerrenoNumero : undefined,
      areaConstruccion:
        areaConstruccionNumero > 0 ? areaConstruccionNumero : undefined,

      precio: precioNumero,
      moneda,

      precioUnitarioTerreno:
        areaTerrenoNumero > 0 ? precioNumero / areaTerrenoNumero : undefined,
      precioUnitarioConstruccion:
        areaConstruccionNumero > 0
          ? precioNumero / areaConstruccionNumero
          : undefined,

      observaciones: observaciones.trim() || undefined,

      expedienteOrigenId: comparableExistente?.expedienteOrigenId,
      expedienteOrigenCodigo: comparableExistente?.expedienteOrigenCodigo,

      creadoEn: comparableExistente?.creadoEn || ahora,
      actualizadoEn: ahora,
    };

    upsertComparableINMOVAL(comparable);
    refrescar();
    limpiarFormulario();
    setMostrarFormulario(false);
  }

  function handleExportar(comparable: ComparableIndiceINMOVAL) {
    downloadComparableIMC(comparable);
  }

  async function handleImportar(file?: File) {
    setError('');
    setImportMessage('');

    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.imc')) {
      setError('Seleccioná un archivo con extensión .imc.');
      return;
    }

    try {
      const comparable = await readComparableIMCFile(file);
      upsertComparableINMOVAL({
        ...comparable,
        actualizadoEn: nowISO(),
      });
      refrescar();
      setImportMessage(`Comparable importado: ${comparable.codigo}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo importar el comparable.');
    }
  }

  function handleEliminar(id: string) {
    const ok = window.confirm('¿Eliminar este comparable del índice local?');

    if (!ok) return;

    removeComparableINMOVAL(id);
    refrescar();
  }

  const comparablesFiltrados = useMemo(() => {
    return filtrarComparablesINMOVAL(comparables, {
      busqueda,
      tipo: tipoFiltro,
      estado: estadoFiltro,
    });
  }, [comparables, busqueda, tipoFiltro, estadoFiltro]);

  const resumen = useMemo(() => {
    const activos = comparables.filter((item) => item.estado === 'activo').length;
    const congelados = comparables.filter((item) => item.estado === 'congelado').length;
    const valorTotal = comparables.reduce(
      (total, item) => total + Number(item.precio || 0),
      0
    );

    return {
      total: comparables.length,
      activos,
      congelados,
      valorTotal,
    };
  }, [comparables]);

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/30">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-300">
                Plataforma INMOVAL
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-50">
                Base de Comparables
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                Catálogo local de comparables para alimentar expedientes,
                homologaciones futuras y archivos portables .imc.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/plataforma"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-950/50 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
              >
                <Home className="h-4 w-4" />
                Centro INMOVAL
              </Link>

              <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 py-3 text-sm font-medium text-sky-100 transition hover:bg-sky-400/20">
                <Upload className="h-4 w-4" />
                Importar .imc
                <input
                  type="file"
                  accept=".imc,application/json"
                  className="hidden"
                  onChange={(event) => handleImportar(event.target.files?.[0])}
                />
              </label>

              <button
                type="button"
                onClick={() => setMostrarFormulario((value) => !value)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:bg-emerald-400/20"
              >
                <PlusCircle className="h-4 w-4" />
                Nuevo comparable
              </button>
            </div>
          </div>

          {importMessage ? (
            <div className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
              <CheckCircle2 className="h-4 w-4" />
              {importMessage}
            </div>
          ) : null}

          {error ? (
            <div className="mt-5 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Total
            </p>
            <p className="mt-3 text-3xl font-bold text-slate-50">
              {resumen.total}
            </p>
            <p className="mt-2 text-sm text-slate-400">Comparables registrados</p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Activos
            </p>
            <p className="mt-3 text-3xl font-bold text-slate-50">
              {resumen.activos}
            </p>
            <p className="mt-2 text-sm text-slate-400">Disponibles para consulta</p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Congelados
            </p>
            <p className="mt-3 text-3xl font-bold text-slate-50">
              {resumen.congelados}
            </p>
            <p className="mt-2 text-sm text-slate-400">Listos para expediente</p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Valor referencial
            </p>
            <p className="mt-3 text-3xl font-bold text-slate-50">
              US$ {resumen.valorTotal.toLocaleString('en-US')}
            </p>
            <p className="mt-2 text-sm text-slate-400">Suma sin conversión</p>
          </div>
        </section>

        {mostrarFormulario ? (
          <section className="mt-6 rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-6 shadow-xl shadow-black/20">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
                <FileInput className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-300">
                  Nuevo comparable
                </p>
                <h2 className="text-lg font-semibold text-slate-100">
                  Datos base del comparable
                </h2>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <label className="grid gap-2">
                <FieldLabel>Título</FieldLabel>
                <input
                  value={titulo}
                  onChange={(event) => setTitulo(event.target.value)}
                  className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                />
              </label>

              <label className="grid gap-2">
                <FieldLabel>Tipo</FieldLabel>
                <select
                  value={tipo}
                  onChange={(event) =>
                    setTipo(event.target.value as TipoComparableINMOVAL)
                  }
                  className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                >
                  <option value="oferta">Oferta</option>
                  <option value="venta">Venta</option>
                  <option value="renta">Renta</option>
                  <option value="avaluo">Avalúo</option>
                  <option value="referencia">Referencia</option>
                </select>
              </label>

              <label className="grid gap-2">
                <FieldLabel>Aplica para</FieldLabel>
                <select
                  value={aplicaMercado}
                  onChange={(event) =>
                    setAplicaMercado(
                      event.target.value as AplicacionMercadoComparableINMOVAL
                    )
                  }
                  className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                >
                  <option value="ambos">Ambos mercados</option>
                  <option value="construido">Mercado construido</option>
                  <option value="terreno">Mercado terreno</option>
                </select>
              </label>

              <label className="grid gap-2">
                <FieldLabel>Estado</FieldLabel>
                <select
                  value={estado}
                  onChange={(event) =>
                    setEstado(event.target.value as EstadoComparableINMOVAL)
                  }
                  className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                >
                  <option value="activo">Activo</option>
                  <option value="congelado">Congelado</option>
                  <option value="archivado">Archivado</option>
                </select>
              </label>

              <label className="grid gap-2">
                <FieldLabel>Fuente</FieldLabel>
                <input
                  value={fuente}
                  onChange={(event) => setFuente(event.target.value)}
                  placeholder="Facebook, corredor, visita, etc."
                  className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                />
              </label>

              <label className="grid gap-2">
                <FieldLabel>Contacto</FieldLabel>
                <input
                  value={contacto}
                  onChange={(event) => setContacto(event.target.value)}
                  className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                />
              </label>

              <label className="grid gap-2">
                <FieldLabel>Teléfono</FieldLabel>
                <input
                  value={telefono}
                  onChange={(event) => setTelefono(event.target.value)}
                  className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                />
              </label>

              <label className="grid gap-2 xl:col-span-2">
                <FieldLabel>URL / referencia</FieldLabel>
                <input
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://..."
                  className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                />
              </label>

              <div className="grid gap-2 xl:col-span-3">
                <FieldLabel>Respaldo web / testigo</FieldLabel>

                <div className="grid gap-4 rounded-2xl border border-sky-400/20 bg-sky-400/10 p-4 lg:grid-cols-[1fr_220px]">
                  <div>
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-sky-400/30 bg-slate-950/50 px-4 py-5 text-sm font-medium text-sky-100 transition hover:bg-sky-400/10">
                      <FileImage className="h-5 w-5" />
                      {testigoWebImagenNombre || 'Cargar captura del anuncio o página web'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) =>
                          handleSeleccionarTestigoWeb(event.target.files?.[0])
                        }
                      />
                    </label>

                    <textarea
                      value={testigoWebNotas}
                      onChange={(event) => setTestigoWebNotas(event.target.value)}
                      rows={3}
                      placeholder="Notas del testigo web: fecha de consulta, plataforma, condiciones, observaciones..."
                      className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400"
                    />

                    {testigoWebImagenDataUrl ? (
                      <button
                        type="button"
                        onClick={limpiarTestigoWeb}
                        className="mt-3 rounded-xl border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-xs font-medium text-rose-100 hover:bg-rose-400/20"
                      >
                        Quitar respaldo
                      </button>
                    ) : null}
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-950/70">
                    {testigoWebImagenDataUrl ? (
                      <img
                        src={testigoWebImagenDataUrl}
                        alt="Testigo web del comparable"
                        className="h-44 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-44 flex-col items-center justify-center px-4 text-center text-sm text-slate-500">
                        <FileImage className="mb-2 h-7 w-7" />
                        Sin imagen de respaldo
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <label className="grid gap-2">
                <FieldLabel>Fecha</FieldLabel>
                <input
                  type="date"
                  value={fecha}
                  onChange={(event) => setFecha(event.target.value)}
                  className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                />
              </label>

              <label className="grid gap-2 xl:col-span-3">
                <FieldLabel>Ubicación</FieldLabel>
                <input
                  value={ubicacion}
                  onChange={(event) => setUbicacion(event.target.value)}
                  placeholder="Dirección o descripción de ubicación"
                  className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                />
              </label>

              <label className="grid gap-2">
                <FieldLabel>Barrio / zona</FieldLabel>
                <input
                  value={barrio}
                  onChange={(event) => setBarrio(event.target.value)}
                  className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                />
              </label>

              <label className="grid gap-2">
                <FieldLabel>Municipio</FieldLabel>
                <input
                  value={municipio}
                  onChange={(event) => setMunicipio(event.target.value)}
                  className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                />
              </label>

              <label className="grid gap-2">
                <FieldLabel>Departamento</FieldLabel>
                <input
                  value={departamento}
                  onChange={(event) => setDepartamento(event.target.value)}
                  className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                />
              </label>

              <label className="grid gap-2">
                <FieldLabel>Área terreno</FieldLabel>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={areaTerreno}
                  onChange={(event) => setAreaTerreno(event.target.value)}
                  className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                />
              </label>

              <label className="grid gap-2">
                <FieldLabel>Área construcción</FieldLabel>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={areaConstruccion}
                  onChange={(event) => setAreaConstruccion(event.target.value)}
                  className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                />
              </label>

              <label className="grid gap-2">
                <FieldLabel>Precio</FieldLabel>
                <div className="grid grid-cols-[1fr_100px] gap-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={precio}
                    onChange={(event) => setPrecio(event.target.value)}
                    className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                  />

                  <select
                    value={moneda}
                    onChange={(event) =>
                      setMoneda(event.target.value as MonedaComparableINMOVAL)
                    }
                    className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                  >
                    <option value="US$">US$</option>
                    <option value="C$">C$</option>
                  </select>
                </div>
              </label>

              <label className="grid gap-2 xl:col-span-3">
                <FieldLabel>Observaciones</FieldLabel>
                <textarea
                  value={observaciones}
                  onChange={(event) => setObservaciones(event.target.value)}
                  rows={4}
                  className="rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                />
              </label>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleCrearComparable}
                className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:bg-emerald-400/20"
              >
                <PlusCircle className="h-4 w-4" />
                Guardar comparable
              </button>

              <button
                type="button"
                onClick={() => {
                  limpiarFormulario();
                  setMostrarFormulario(false);
                }}
                className="rounded-2xl border border-slate-700 bg-slate-950/50 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
              >
                Cancelar
              </button>
            </div>
          </section>
        ) : null}

        <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-black/20">
          <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                placeholder="Buscar por código, ubicación, fuente, zona..."
                className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950/70 pl-10 pr-4 text-sm text-slate-100 outline-none transition focus:border-sky-400"
              />
            </label>

            <select
              value={tipoFiltro}
              onChange={(event) =>
                setTipoFiltro(event.target.value as TipoFiltroComparable)
              }
              className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-sky-400"
            >
              <option value="todos">Todos los tipos</option>
              <option value="oferta">Oferta</option>
              <option value="venta">Venta</option>
              <option value="renta">Renta</option>
              <option value="avaluo">Avalúo</option>
              <option value="referencia">Referencia</option>
            </select>

            <select
              value={estadoFiltro}
              onChange={(event) =>
                setEstadoFiltro(event.target.value as EstadoFiltroComparable)
              }
              className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-sky-400"
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="congelado">Congelado</option>
              <option value="archivado">Archivado</option>
            </select>
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 shadow-xl shadow-black/20">
          {comparablesFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-700 bg-slate-950/70">
                <Database className="h-7 w-7 text-slate-400" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-slate-100">
                No hay comparables registrados
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                Crea o importa un archivo .imc para comenzar la base de
                comparables de INMOVAL.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800 text-sm">
                <thead className="bg-slate-950/60">
                  <tr>
                    <th className="px-5 py-4 text-left font-medium text-slate-400">
                      Comparable
                    </th>
                    <th className="px-5 py-4 text-left font-medium text-slate-400">
                      Ubicación
                    </th>
                    <th className="px-5 py-4 text-left font-medium text-slate-400">
                      Tipo
                    </th>
                    <th className="px-5 py-4 text-left font-medium text-slate-400">
                      Estado
                    </th>
                    <th className="px-5 py-4 text-right font-medium text-slate-400">
                      Precio
                    </th>
                    <th className="px-5 py-4 text-right font-medium text-slate-400">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800">
                  {comparablesFiltrados.map((comparable) => (
                    <tr key={comparable.id} className="hover:bg-slate-800/40">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-100">
                          {comparable.codigo}
                        </p>
                        <p className="mt-1 text-sm text-slate-300">
                          {comparable.titulo}
                        </p>
                        {comparable.fuente ? (
                          <p className="mt-1 text-xs text-slate-500">
                            Fuente: {comparable.fuente}
                          </p>
                        ) : null}

                        <p className="mt-1 text-xs text-slate-500">
                          Aplica: {comparable.aplicaMercado || 'ambos'}
                        </p>

                        {comparable.testigoWebImagenDataUrl ? (
                          <p className="mt-2 inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-xs font-medium text-emerald-100">
                            Testigo web guardado
                          </p>
                        ) : (
                          <p className="mt-2 inline-flex rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-1 text-xs font-medium text-amber-100">
                            Sin testigo web
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4 text-slate-300">
                        <p>{comparable.ubicacion}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {[comparable.barrio, comparable.municipio, comparable.departamento]
                            .filter(Boolean)
                            .join(', ') || 'Sin zona detallada'}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <ComparableBadge tone="sky">{comparable.tipo}</ComparableBadge>
                      </td>

                      <td className="px-5 py-4">
                        <ComparableBadge
                          tone={
                            comparable.estado === 'activo'
                              ? 'emerald'
                              : comparable.estado === 'congelado'
                                ? 'amber'
                                : 'slate'
                          }
                        >
                          {comparable.estado}
                        </ComparableBadge>
                      </td>

                      <td className="px-5 py-4 text-right font-semibold text-slate-100">
                        {formatMoney(comparable.precio, comparable.moneda)}
                        {comparable.precioUnitarioTerreno ? (
                          <p className="mt-1 text-xs font-normal text-slate-500">
                            Terreno: {formatMoney(comparable.precioUnitarioTerreno, comparable.moneda)} / unidad
                          </p>
                        ) : null}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-wrap justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleExportar(comparable)}
                            className="inline-flex items-center gap-1 rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-xs font-medium text-sky-100 hover:bg-sky-400/20"
                          >
                            <Download className="h-3 w-3" />
                            Exportar .imc
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEliminar(comparable.id)}
                            className="inline-flex items-center gap-1 rounded-full border border-rose-400/30 bg-rose-400/10 px-3 py-1 text-xs font-medium text-rose-100 hover:bg-rose-400/20"
                          >
                            <Trash2 className="h-3 w-3" />
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
