import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Database,
  ExternalLink,
  FileImage,
  PlusCircle,
  Save,
  Search,
  Snowflake,
  Trash2,
  XCircle,
} from 'lucide-react';
import { nowISO, todayISO } from '@/shared/utils/dateUtils';
import {
  ComparableIndiceINMOVAL,
  MonedaComparableINMOVAL,
  TipoComparableINMOVAL,
  getComparablesIndiceINMOVAL,
} from '@/platform/comparables/comparableStorage';
import {
  ComparableAvaluoINMOVAL,
  EstadoComparableAvaluoINMOVAL,
  RevisionComparableAvaluoINMOVAL,
  TipoMercadoAvaluoINMOVAL,
  addComparableToAvaluoINMOVAL,
  congelarComparableAvaluoINMOVAL,
  getAvaluoComparablesPorMercadoINMOVAL,
  getComparablesParaSustentosINMOVAL,
  removeComparableAvaluoINMOVAL,
  updateComparableAvaluoINMOVAL,
} from '@/technical-modules/modules/urbano/comparables/avaluoComparablesStorage';

type ModoNuevoComparable = null | 'manual' | 'base_datos';

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `cmp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function buildCodigoManual(tipoMercado: TipoMercadoAvaluoINMOVAL) {
  const prefix = tipoMercado === 'construido' ? 'MC' : 'MT';
  return `${prefix}-${Date.now()}`;
}

function formatMoney(value: number, moneda: string) {
  return `${moneda} ${Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function estadoClasses(estado: EstadoComparableAvaluoINMOVAL) {
  if (estado === 'congelado') {
    return 'border-sky-400/30 bg-sky-400/10 text-sky-100';
  }

  if (estado === 'usado') {
    return 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100';
  }

  if (estado === 'descartado') {
    return 'border-rose-400/30 bg-rose-400/10 text-rose-100';
  }

  return 'border-amber-400/30 bg-amber-400/10 text-amber-100';
}

function mercadoTitulo(tipoMercado: TipoMercadoAvaluoINMOVAL) {
  return tipoMercado === 'construido'
    ? '1. Mercado construido'
    : '3. Mercado terreno';
}

function mercadoDescripcion(tipoMercado: TipoMercadoAvaluoINMOVAL) {
  return tipoMercado === 'construido'
    ? 'Comparables de inmuebles construidos, edificaciones, viviendas, locales y mejoras.'
    : 'Comparables de terrenos, lotes, suelo urbano o Ã¡reas vacantes.';
}

function filtrarComparablesBase(
  comparables: ComparableIndiceINMOVAL[],
  busqueda: string,
  tipoMercado: TipoMercadoAvaluoINMOVAL
) {
  const q = busqueda.trim().toLowerCase();

  return comparables.filter((item) => {
    const texto = [
      item.codigo,
      item.titulo,
      item.tipo,
      item.ubicacion,
      item.barrio,
      item.municipio,
      item.departamento,
      item.fuente,
      item.observaciones,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const coincideBusqueda = q ? texto.includes(q) : true;

    if (!coincideBusqueda) return false;

    if (tipoMercado === 'terreno') {
      return (
        !item.areaConstruccion ||
        item.areaConstruccion <= 0 ||
        texto.includes('terreno') ||
        texto.includes('lote') ||
        texto.includes('suelo')
      );
    }

    return true;
  });
}

function MercadoSection({
  avaluoId,
  tipoMercado,
  version,
  onChange,
}: {
  avaluoId: string;
  tipoMercado: TipoMercadoAvaluoINMOVAL;
  version: number;
  onChange: () => void;
}) {
  const [modoNuevo, setModoNuevo] = useState<ModoNuevoComparable>(null);
  const [busquedaBase, setBusquedaBase] = useState('');

  const [titulo, setTitulo] = useState(
    tipoMercado === 'construido'
      ? 'Comparable construido'
      : 'Comparable terreno'
  );
  const [tipo, setTipo] = useState<TipoComparableINMOVAL>('oferta');
  const [fuente, setFuente] = useState('');
  const [url, setUrl] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [barrio, setBarrio] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [areaTerreno, setAreaTerreno] = useState('');
  const [areaConstruccion, setAreaConstruccion] = useState('');
  const [precio, setPrecio] = useState('0');
  const [moneda, setMoneda] = useState<MonedaComparableINMOVAL>('US$');
  const [justificacion, setJustificacion] = useState('');
  const [ajusteResumen, setAjusteResumen] = useState('');

  const comparablesMercado = useMemo(
    () => getAvaluoComparablesPorMercadoINMOVAL(avaluoId, tipoMercado),
    [avaluoId, tipoMercado, version]
  );

  const comparablesBase = useMemo(
    () => getComparablesIndiceINMOVAL(),
    [version]
  );

  const comparablesBaseFiltrados = useMemo(() => {
    const usados = new Set(comparablesMercado.map((item) => item.comparableId));

    return filtrarComparablesBase(
      comparablesBase,
      busquedaBase,
      tipoMercado
    ).filter((item) => !usados.has(item.id));
  }, [comparablesBase, comparablesMercado, busquedaBase, tipoMercado]);

  const resumen = useMemo(() => {
    return {
      total: comparablesMercado.length,
      usados: comparablesMercado.filter((item) => item.estado === 'usado').length,
      congelados: comparablesMercado.filter((item) => item.estado === 'congelado').length,
      conSustento: comparablesMercado.filter(
        (item) => item.snapshot.testigoWebImagenDataUrl
      ).length,
    };
  }, [comparablesMercado]);

  function limpiarManual() {
    setTitulo(
      tipoMercado === 'construido'
        ? 'Comparable construido'
        : 'Comparable terreno'
    );
    setTipo('oferta');
    setFuente('');
    setUrl('');
    setUbicacion('');
    setBarrio('');
    setMunicipio('');
    setDepartamento('');
    setAreaTerreno('');
    setAreaConstruccion('');
    setPrecio('0');
    setMoneda('US$');
    setJustificacion('');
    setAjusteResumen('');
  }

  function handleAgregarDesdeBase(comparable: ComparableIndiceINMOVAL) {
    addComparableToAvaluoINMOVAL(
      avaluoId,
      comparable,
      tipoMercado,
      'base_datos'
    );

    onChange();
  }

  function handleCrearManual() {
    const precioNumero = Number(precio || 0);
    const areaTerrenoNumero = Number(areaTerreno || 0);
    const areaConstruccionNumero = Number(areaConstruccion || 0);

    if (!titulo.trim()) {
      window.alert('IngresÃ¡ un tÃ­tulo para el comparable.');
      return;
    }

    if (!ubicacion.trim()) {
      window.alert('IngresÃ¡ la ubicaciÃ³n del comparable.');
      return;
    }

    const ahora = nowISO();

    const comparable: ComparableIndiceINMOVAL = {
      id: createId(),
      codigo: buildCodigoManual(tipoMercado),
      titulo: titulo.trim(),
      tipo,
      estado: 'activo',
      fuente: fuente.trim() || 'Ingreso manual en memoria de cÃ¡lculo',
      url: url.trim() || undefined,
      fecha: todayISO(),
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
      observaciones: ajusteResumen.trim() || undefined,
      creadoEn: ahora,
      actualizadoEn: ahora,
    };

    const agregado = addComparableToAvaluoINMOVAL(
      avaluoId,
      comparable,
      tipoMercado,
      'manual'
    );

    updateComparableAvaluoINMOVAL(agregado.id, {
      justificacion: justificacion.trim() || undefined,
      ajusteResumen: ajusteResumen.trim() || undefined,
    });

    limpiarManual();
    setModoNuevo(null);
    onChange();
  }

  function handleActualizar(
    comparable: ComparableAvaluoINMOVAL,
    cambios: Partial<ComparableAvaluoINMOVAL>
  ) {
    updateComparableAvaluoINMOVAL(comparable.id, cambios);
    onChange();
  }

  function handleCongelar(comparable: ComparableAvaluoINMOVAL) {
    congelarComparableAvaluoINMOVAL(comparable.id);
    onChange();
  }

  function handleEliminar(comparable: ComparableAvaluoINMOVAL) {
    const ok = window.confirm('Â¿Quitar este comparable de este mercado?');

    if (!ok) return;

    removeComparableAvaluoINMOVAL(comparable.id);
    onChange();
  }

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-sky-300">
            Memoria de cÃ¡lculo
          </p>
          <h2 className="mt-1 text-2xl font-bold text-slate-50">
            {mercadoTitulo(tipoMercado)}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            {mercadoDescripcion(tipoMercado)}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setModoNuevo('manual')}
            className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100 hover:bg-emerald-400/20"
          >
            <PlusCircle className="h-4 w-4" />
            + Comparable
          </button>

          <button
            type="button"
            onClick={() => setModoNuevo('base_datos')}
            className="inline-flex items-center gap-2 rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 py-3 text-sm font-medium text-sky-100 hover:bg-sky-400/20"
          >
            <Database className="h-4 w-4" />
            Comparable de base de datos
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Total</p>
          <p className="mt-2 text-2xl font-bold text-slate-100">{resumen.total}</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Usados</p>
          <p className="mt-2 text-2xl font-bold text-slate-100">{resumen.usados}</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Congelados</p>
          <p className="mt-2 text-2xl font-bold text-slate-100">{resumen.congelados}</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Con sustento</p>
          <p className="mt-2 text-2xl font-bold text-slate-100">{resumen.conSustento}</p>
        </div>
      </div>

      {modoNuevo === 'manual' ? (
        <div className="mt-6 rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
          <h3 className="text-lg font-semibold text-slate-100">
            Nuevo comparable manual
          </h3>

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label className="grid gap-2">
              <span className="text-xs uppercase tracking-[0.16em] text-slate-500">TÃ­tulo</span>
              <input value={titulo} onChange={(event) => setTitulo(event.target.value)} className="h-11 rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100 outline-none focus:border-emerald-400" />
            </label>

            <label className="grid gap-2">
              <span className="text-xs uppercase tracking-[0.16em] text-slate-500">Tipo</span>
              <select value={tipo} onChange={(event) => setTipo(event.target.value as TipoComparableINMOVAL)} className="h-11 rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100 outline-none focus:border-emerald-400">
                <option value="venta">Venta</option>
                <option value="oferta">Oferta</option>
                <option value="renta">Renta</option>
                <option value="avaluo">AvalÃºo</option>
                <option value="referencia">Referencia</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-xs uppercase tracking-[0.16em] text-slate-500">Fuente</span>
              <input value={fuente} onChange={(event) => setFuente(event.target.value)} className="h-11 rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100 outline-none focus:border-emerald-400" />
            </label>

            <label className="grid gap-2 xl:col-span-3">
              <span className="text-xs uppercase tracking-[0.16em] text-slate-500">URL de referencia</span>
              <input value={url} onChange={(event) => setUrl(event.target.value)} className="h-11 rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100 outline-none focus:border-emerald-400" />
            </label>

            <label className="grid gap-2 xl:col-span-3">
              <span className="text-xs uppercase tracking-[0.16em] text-slate-500">UbicaciÃ³n</span>
              <input value={ubicacion} onChange={(event) => setUbicacion(event.target.value)} className="h-11 rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100 outline-none focus:border-emerald-400" />
            </label>

            <label className="grid gap-2">
              <span className="text-xs uppercase tracking-[0.16em] text-slate-500">Barrio / zona</span>
              <input value={barrio} onChange={(event) => setBarrio(event.target.value)} className="h-11 rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100 outline-none focus:border-emerald-400" />
            </label>

            <label className="grid gap-2">
              <span className="text-xs uppercase tracking-[0.16em] text-slate-500">Municipio</span>
              <input value={municipio} onChange={(event) => setMunicipio(event.target.value)} className="h-11 rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100 outline-none focus:border-emerald-400" />
            </label>

            <label className="grid gap-2">
              <span className="text-xs uppercase tracking-[0.16em] text-slate-500">Departamento</span>
              <input value={departamento} onChange={(event) => setDepartamento(event.target.value)} className="h-11 rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100 outline-none focus:border-emerald-400" />
            </label>

            <label className="grid gap-2">
              <span className="text-xs uppercase tracking-[0.16em] text-slate-500">Ãrea terreno</span>
              <input type="number" value={areaTerreno} onChange={(event) => setAreaTerreno(event.target.value)} className="h-11 rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100 outline-none focus:border-emerald-400" />
            </label>

            <label className="grid gap-2">
              <span className="text-xs uppercase tracking-[0.16em] text-slate-500">Ãrea construcciÃ³n</span>
              <input type="number" value={areaConstruccion} onChange={(event) => setAreaConstruccion(event.target.value)} className="h-11 rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100 outline-none focus:border-emerald-400" />
            </label>

            <label className="grid gap-2">
              <span className="text-xs uppercase tracking-[0.16em] text-slate-500">Precio</span>
              <div className="grid grid-cols-[1fr_90px] gap-2">
                <input type="number" value={precio} onChange={(event) => setPrecio(event.target.value)} className="h-11 rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100 outline-none focus:border-emerald-400" />
                <select value={moneda} onChange={(event) => setMoneda(event.target.value as MonedaComparableINMOVAL)} className="h-11 rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100 outline-none focus:border-emerald-400">
                  <option value="US$">US$</option>
                  <option value="C$">C$</option>
                </select>
              </div>
            </label>

            <label className="grid gap-2 xl:col-span-3">
              <span className="text-xs uppercase tracking-[0.16em] text-slate-500">JustificaciÃ³n tÃ©cnica</span>
              <textarea value={justificacion} onChange={(event) => setJustificacion(event.target.value)} rows={3} className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-slate-100 outline-none focus:border-emerald-400" />
            </label>

            <label className="grid gap-2 xl:col-span-3">
              <span className="text-xs uppercase tracking-[0.16em] text-slate-500">InformaciÃ³n completada en ficha / ajuste</span>
              <textarea value={ajusteResumen} onChange={(event) => setAjusteResumen(event.target.value)} rows={3} className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-slate-100 outline-none focus:border-emerald-400" />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={handleCrearManual} className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100 hover:bg-emerald-400/20">
              <Save className="h-4 w-4" />
              Guardar comparable
            </button>

            <button type="button" onClick={() => setModoNuevo(null)} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200 hover:bg-slate-800">
              Cancelar
            </button>
          </div>
        </div>
      ) : null}

      {modoNuevo === 'base_datos' ? (
        <div className="mt-6 rounded-3xl border border-sky-400/20 bg-sky-400/10 p-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={busquedaBase}
              onChange={(event) => setBusquedaBase(event.target.value)}
              placeholder="Buscar comparable por municipio, departamento, ubicaciÃ³n, zona, tipo o palabra clave..."
              className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950/70 pl-10 pr-4 text-sm text-slate-100 outline-none focus:border-sky-400"
            />
          </div>

          <div className="mt-4 grid gap-3">
            {comparablesBaseFiltrados.length === 0 ? (
              <div className="rounded-2xl border border-slate-700 bg-slate-950/50 p-5 text-sm text-slate-400">
                No hay comparables disponibles con ese filtro. Primero crea o importa comparables en la Base de comparables.
              </div>
            ) : (
              comparablesBaseFiltrados.map((comparable) => (
                <div key={comparable.id} className="grid gap-3 rounded-2xl border border-slate-700 bg-slate-950/60 p-4 lg:grid-cols-[1fr_auto]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-100">{comparable.codigo}</p>
                      <span className="rounded-full border border-sky-400/30 bg-sky-400/10 px-2 py-1 text-xs text-sky-100">{comparable.tipo}</span>
                      {comparable.testigoWebImagenDataUrl ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-xs text-emerald-100">
                          <FileImage className="h-3 w-3" />
                          Sustento disponible
                        </span>
                      ) : (
                        <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-1 text-xs text-amber-100">
                          Sin sustento
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-sm text-slate-300">{comparable.titulo}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {[comparable.ubicacion, comparable.municipio, comparable.departamento]
                        .filter(Boolean)
                        .join(' Â· ')}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-100">
                      {formatMoney(comparable.precio, comparable.moneda)}
                    </p>
                  </div>

                  <button type="button" onClick={() => handleAgregarDesdeBase(comparable)} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 py-3 text-sm font-medium text-sky-100 transition hover:bg-sky-400/20">
                    <CheckCircle2 className="h-4 w-4" />
                    Usar en memoria
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}

      <div className="mt-6 grid gap-4">
        {comparablesMercado.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950/40 p-8 text-center">
            <Database className="mx-auto h-9 w-9 text-slate-500" />
            <h3 className="mt-3 text-lg font-semibold text-slate-100">
              Sin comparables en esta secciÃ³n
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              AgregÃ¡ un comparable manual o desde la base de datos.
            </p>
          </div>
        ) : (
          comparablesMercado.map((item) => (
            <article key={item.id} className="rounded-3xl border border-slate-800 bg-slate-950/50 p-5">
              <div className="grid gap-5 xl:grid-cols-[1fr_240px]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-100">{item.snapshot.codigo}</p>
                    <span className={`rounded-full border px-2 py-1 text-xs font-medium ${estadoClasses(item.estado)}`}>
                      {item.estado}
                    </span>
                    <span className="rounded-full border border-slate-700 bg-slate-950/60 px-2 py-1 text-xs text-slate-300">
                      {item.origen === 'manual' ? 'Manual' : 'Base de datos'}
                    </span>
                    {item.snapshot.testigoWebImagenDataUrl ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-xs text-emerald-100">
                        <FileImage className="h-3 w-3" />
                        Va a sustentos
                      </span>
                    ) : null}
                  </div>

                  <h3 className="mt-2 text-lg font-semibold text-slate-100">
                    {item.snapshot.titulo}
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    {item.snapshot.ubicacion}
                  </p>

                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Precio</p>
                      <p className="mt-1 text-sm font-semibold text-slate-100">
                        {formatMoney(item.snapshot.precio, item.snapshot.moneda)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Ãrea terreno</p>
                      <p className="mt-1 text-sm font-semibold text-slate-100">
                        {item.snapshot.areaTerreno || 'N/D'}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Ãrea construcciÃ³n</p>
                      <p className="mt-1 text-sm font-semibold text-slate-100">
                        {item.snapshot.areaConstruccion || 'N/D'}
                      </p>
                    </div>
                  </div>

                  {item.snapshot.url ? (
                    <a href={item.snapshot.url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-sky-300 hover:text-sky-200">
                      <ExternalLink className="h-4 w-4" />
                      Ver referencia web
                    </a>
                  ) : null}

                  <div className="mt-5 grid gap-3">
                    <label className="grid gap-2">
                      <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                        JustificaciÃ³n tÃ©cnica
                      </span>
                      <textarea
                        value={item.justificacion || ''}
                        onChange={(event) =>
                          handleActualizar(item, {
                            justificacion: event.target.value,
                          })
                        }
                        rows={3}
                        className="rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-3 text-sm text-slate-100 outline-none focus:border-sky-400"
                      />
                    </label>

                    <label className="grid gap-2">
                      <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                        InformaciÃ³n completada en ficha / ajuste
                      </span>
                      <textarea
                        value={item.ajusteResumen || ''}
                        onChange={(event) =>
                          handleActualizar(item, {
                            ajusteResumen: event.target.value,
                          })
                        }
                        rows={3}
                        className="rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-3 text-sm text-slate-100 outline-none focus:border-sky-400"
                      />
                    </label>
                  </div>
                </div>

                <div className="grid content-start gap-3">
                  <label className="grid gap-2">
                    <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Estado</span>
                    <select
                      value={item.estado}
                      onChange={(event) =>
                        handleActualizar(item, {
                          estado: event.target.value as EstadoComparableAvaluoINMOVAL,
                        })
                      }
                      className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none focus:border-sky-400"
                    >
                      <option value="preseleccionado">Preseleccionado</option>
                      <option value="usado">Usado</option>
                      <option value="descartado">Descartado</option>
                      <option value="congelado">Congelado</option>
                    </select>
                  </label>

                  <label className="grid gap-2">
                    <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">RevisiÃ³n</span>
                    <select
                      value={item.revision}
                      onChange={(event) =>
                        handleActualizar(item, {
                          revision: event.target.value as RevisionComparableAvaluoINMOVAL,
                        })
                      }
                      className="h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none focus:border-sky-400"
                    >
                      <option value="Rev00">Rev00</option>
                      <option value="Rev01">Rev01</option>
                      <option value="Rev02">Rev02</option>
                      <option value="Rev03">Rev03</option>
                      <option value="Final">Final</option>
                    </select>
                  </label>

                  <button type="button" onClick={() => handleCongelar(item)} disabled={item.estado === 'congelado'} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-400/30 bg-sky-400/10 px-3 py-3 text-sm font-medium text-sky-100 hover:bg-sky-400/20 disabled:cursor-not-allowed disabled:opacity-40">
                    <Snowflake className="h-4 w-4" />
                    Congelar
                  </button>

                  <button type="button" onClick={() => handleActualizar(item, { estado: 'descartado' })} disabled={item.estado === 'descartado'} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-3 py-3 text-sm font-medium text-amber-100 hover:bg-amber-400/20 disabled:cursor-not-allowed disabled:opacity-40">
                    <XCircle className="h-4 w-4" />
                    Descartar
                  </button>

                  <button type="button" onClick={() => handleEliminar(item)} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-3 py-3 text-sm font-medium text-rose-100 hover:bg-rose-400/20">
                    <Trash2 className="h-4 w-4" />
                    Quitar
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function SustentosSection({
  avaluoId,
  version,
}: {
  avaluoId: string;
  version: number;
}) {
  const sustentos = useMemo(
    () => getComparablesParaSustentosINMOVAL(avaluoId),
    [avaluoId, version]
  );

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-300">
          MÃ³dulo Urbano
        </p>
        <h2 className="mt-1 text-2xl font-bold text-slate-50">
          Anexos / Sustentos de comparables
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          Las fotos o capturas web no se eligen aquÃ­. Aparecen automÃ¡ticamente
          cuando un comparable de la memoria de cÃ¡lculo tiene respaldo visual y
          estÃ¡ marcado como usado o congelado.
        </p>
      </div>

      <div className="mt-6 grid gap-4">
        {sustentos.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950/40 p-8 text-center">
            <FileImage className="mx-auto h-9 w-9 text-slate-500" />
            <h3 className="mt-3 text-lg font-semibold text-slate-100">
              Sin sustentos visibles
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              MarcÃ¡ comparables como usado o congelado en Mercado Construido o
              Mercado Terreno para ver sus fotos aquÃ­.
            </p>
          </div>
        ) : (
          sustentos.map((item) => (
            <article
              key={item.id}
              className="rounded-3xl border border-slate-800 bg-slate-950/50 p-5"
            >
              <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-100">
                      {item.snapshot.codigo}
                    </p>
                    <span className="rounded-full border border-sky-400/30 bg-sky-400/10 px-2 py-1 text-xs text-sky-100">
                      {item.tipoMercado === 'construido'
                        ? 'Mercado construido'
                        : 'Mercado terreno'}
                    </span>
                    <span className={`rounded-full border px-2 py-1 text-xs font-medium ${estadoClasses(item.estado)}`}>
                      {item.estado}
                    </span>
                  </div>

                  <h3 className="mt-2 text-lg font-semibold text-slate-100">
                    {item.snapshot.titulo}
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    {item.snapshot.ubicacion}
                  </p>

                  <p className="mt-3 text-sm font-semibold text-slate-100">
                    {formatMoney(item.snapshot.precio, item.snapshot.moneda)}
                  </p>

                  {item.justificacion ? (
                    <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                        JustificaciÃ³n
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        {item.justificacion}
                      </p>
                    </div>
                  ) : null}

                  {item.ajusteResumen ? (
                    <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                        InformaciÃ³n de ficha / ajuste
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        {item.ajusteResumen}
                      </p>
                    </div>
                  ) : null}

                  {item.snapshot.url ? (
                    <a
                      href={item.snapshot.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-sky-300 hover:text-sky-200"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Ver referencia web
                    </a>
                  ) : null}
                </div>

                <div>
                  {item.snapshot.testigoWebImagenDataUrl ? (
                    <div className="overflow-hidden rounded-3xl border border-slate-700 bg-slate-950">
                      <img
                        src={item.snapshot.testigoWebImagenDataUrl}
                        alt={`Sustento ${item.snapshot.codigo}`}
                        className="max-h-[420px] w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-700 bg-slate-950/50 p-6 text-center">
                      <FileImage className="h-10 w-10 text-slate-500" />
                      <p className="mt-3 text-sm text-slate-400">
                        Este comparable no tiene imagen o captura web guardada.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export default function AvaluoMemoriaCalculoPage() {
  const { id } = useParams();
  const avaluoId = id || 'demo';

  const [version, setVersion] = useState(0);

  function refrescar() {
    setVersion((current) => current + 1);
  }

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/30">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-300">
                MÃ³dulo Urbano
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-50">
                Memoria de cÃ¡lculo
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                AquÃ­ se seleccionan los comparables de la base de datos o se
                crean comparables manuales. Los sustentos visuales aparecen en
                anexos dentro del mismo mÃ³dulo urbano.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to={`/avaluos/${avaluoId}`}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950/50 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
              >
                <ArrowLeft className="h-4 w-4" />
                AvalÃºo
              </Link>

              <Link
                to="/comparables"
                className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:bg-emerald-400/20"
              >
                <Database className="h-4 w-4" />
                Base de comparables
              </Link>
            </div>
          </div>
        </header>

        <div className="mt-6 grid gap-6">
          <MercadoSection
            avaluoId={avaluoId}
            tipoMercado="construido"
            version={version}
            onChange={refrescar}
          />

          <MercadoSection
            avaluoId={avaluoId}
            tipoMercado="terreno"
            version={version}
            onChange={refrescar}
          />

          <SustentosSection avaluoId={avaluoId} version={version} />
        </div>
      </div>
    </div>
  );
}

