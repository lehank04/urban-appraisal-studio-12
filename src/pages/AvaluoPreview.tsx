import { Link, useParams } from 'react-router-dom';
import { useStore } from '@/store/avaluoStore';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer } from 'lucide-react';
import { PLANTILLAS } from '@/templates/plantillas';
import { emptyFormatoExport } from '@/store/types';
import {
  consolidados, homologacionInmueble, homologacionTerreno,
  totalesCostos, valorRealizacion, deduccionesDetalle,
  fmtMoney, fmtNum, fmtPct,
} from '@/lib/calculations';

function renderToken(tpl: string, ctx: Record<string, string | number>) {
  return (tpl || '').replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => String(ctx[k] ?? ''));
}

function Page({ children, num, total, plantilla, title, formato, ctx }: any) {
  const fontClass = formato.fuente === 'roboto-mono' ? 'pdf-roboto'
    : formato.fuente === 'serif' ? 'font-serif' : '';
  const roundedClass = formato.bordesRedondeados ? 'pdf-rounded' : '';
  const headerL = renderToken(formato.headerIzq, { ...ctx, capitulo: title || '' });
  const headerR = renderToken(formato.headerDer, { ...ctx, capitulo: title || '' });
  const footerL = renderToken(formato.footerIzq, { ...ctx, pagina: num, totalPaginas: total });
  const footerR = renderToken(formato.footerDer, { ...ctx, pagina: num, totalPaginas: total });
  return (
    <div className={`doc-page ${fontClass} ${roundedClass} mb-6 relative bg-white text-zinc-900 mx-auto`} style={{ width: '210mm', minHeight: '297mm', padding: '20mm', boxShadow: '0 4px 14px rgba(0,0,0,.08)' }}>
      {formato.mostrarHeader && (
        <div className="flex justify-between text-[10px] uppercase tracking-widest text-zinc-500 border-b border-zinc-200 pb-2 mb-4">
          <span>{headerL}</span><span>{headerR}</span>
        </div>
      )}
      <div>{children}</div>
      {formato.mostrarFooter && (
        <div className="absolute bottom-6 left-0 right-0 px-[20mm] flex justify-between text-[9px] text-zinc-500 border-t border-zinc-200 pt-2 whitespace-pre-line">
          <span>{footerL}</span><span>{footerR}</span>
        </div>
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: any }) {
  return (
    <tr className="border-b border-zinc-200">
      <td className="py-1.5 pr-4 text-zinc-500 uppercase text-[10px] tracking-wider w-1/3">{k}</td>
      <td className="py-1.5 font-medium text-sm">{v || '—'}</td>
    </tr>
  );
}

function H(props: { roman: string; title: string }) {
  return (
    <div className="mb-4">
      <div className="text-[10px] uppercase tracking-widest text-zinc-400">Capítulo {props.roman}</div>
      <h2 className="text-2xl font-bold border-b-2 border-zinc-800 pb-1">{props.title}</h2>
    </div>
  );
}

export default function AvaluoPreview() {
  const { id } = useParams();
  const { getAvaluo, peritos, clientes } = useStore();
  const avaluo = id ? getAvaluo(id) : undefined;
  if (!avaluo) return <div className="p-8">Avalúo no encontrado</div>;

  const per = peritos.find((p) => p.id === avaluo.peritoId);
  const cli = clientes.find((c) => c.id === avaluo.clienteId);
  const plantilla = per ? PLANTILLAS[per.plantilla] : PLANTILLAS.inmoval;
  const c = consolidados(avaluo);
  const i = avaluo.info;
  const d = avaluo.documentoLegal;
  const e = avaluo.entorno;
  const m = avaluo.metodologias;
  const homT = homologacionTerreno(m.sujetoTerreno, m.comparablesTerreno);
  const homI = homologacionInmueble(m.sujetoInmueble, m.comparablesInmueble);
  const valorMercado = (homT.valorMercadoTerreno || 0) + (homI.valorMercado || 0);
  const base = valorMercado || c.totalReposicionNeto;
  const valorReal = valorRealizacion(base, m.deducciones);
  const valorConcluido = m.enfoqueConclusion === 'mercado' ? base : c.totalReposicionNeto;

  // numeración rough
  const totalPages = 8 + avaluo.terrenos.length;
  let p = 0;
  const nextP = () => ++p;

  return (
    <div className="min-h-screen bg-zinc-200">
      <header className="no-print sticky top-0 z-20 bg-card border-b border-border px-6 py-3 flex items-center justify-between">
        <Button variant="ghost" asChild><Link to={`/avaluos/${avaluo.id}`}><ArrowLeft className="h-4 w-4 mr-1" />Volver al editor</Link></Button>
        <div className="text-sm font-medium">Documento técnico · {plantilla.nombre}</div>
        <Button onClick={() => window.print()}><Printer className="h-4 w-4 mr-1" />Imprimir / PDF</Button>
      </header>

      <div className="py-8">
        {/* PORTADA */}
        <div className="doc-page mb-6 flex flex-col mx-auto bg-white text-zinc-900" style={{ width: '210mm', minHeight: '297mm', boxShadow: '0 4px 14px rgba(0,0,0,.08)' }}>
          <div className="border-t-8" style={{ borderColor: plantilla.color }} />
          <div className="flex-1 flex flex-col justify-center text-center px-12">
            <div className="text-xs uppercase tracking-[0.3em] text-zinc-500 mb-4">{plantilla.empresa}</div>
            <h1 className="text-5xl font-serif font-bold text-zinc-900 mb-3">{plantilla.portadaTitulo}</h1>
            <div className="text-lg text-zinc-600">{plantilla.portadaSubtitulo}</div>
            <div className="w-16 h-1 mx-auto my-6" style={{ background: plantilla.color }} />
            <div className="text-lg text-zinc-700">{i.propietario || 'Propietario'}</div>
            <div className="text-sm text-zinc-500 mt-1">{i.tipoInmueble}</div>
            <div className="mt-10 inline-block mx-auto px-6 py-3 border-2 border-zinc-300 rounded">
              <div className="text-[10px] uppercase tracking-wider text-zinc-500">Expediente</div>
              <div className="font-mono text-lg">{i.numeroExpediente || 'SIN N°'}</div>
            </div>
          </div>
          <div className="px-12 pb-12 grid grid-cols-3 gap-6 text-xs">
            <div><div className="text-zinc-500 uppercase tracking-wider text-[9px]">Solicitante</div><div className="text-zinc-900 font-medium">{cli?.nombre || '—'}</div></div>
            <div><div className="text-zinc-500 uppercase tracking-wider text-[9px]">Propósito</div><div className="text-zinc-900 font-medium">{i.proposito}</div></div>
            <div><div className="text-zinc-500 uppercase tracking-wider text-[9px]">Fecha</div><div className="text-zinc-900 font-medium">{i.fechaAvaluo || '—'}</div></div>
          </div>
          <div className="px-12 pb-12 text-center text-[10px] text-zinc-500 border-t border-zinc-200 pt-4">
            {per && (<><div className="font-medium text-zinc-800">{per.nombre}</div><div>NIPEV: {per.registroSIBOIF || per.registro || '—'}</div></>)}
            <div className="mt-2">{plantilla.normativa}</div>
          </div>
        </div>

        {/* ÍNDICE */}
        <Page num={nextP()} total={totalPages} plantilla={plantilla} title="Contenido">
          <h2 className="text-2xl font-bold mb-6">Contenido</h2>
          <ol className="space-y-1.5 text-sm">
            {plantilla.capitulos.map((cap) => (
              <li key={cap} className="flex justify-between border-b border-dotted border-zinc-300 pb-1">
                <span>{cap}</span><span className="text-zinc-400">·</span>
              </li>
            ))}
          </ol>
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2">Introducción</h3>
            <p className="text-sm leading-relaxed text-zinc-700">{plantilla.textoIntroduccion}</p>
            <h3 className="text-lg font-semibold mt-4 mb-2">Alcance</h3>
            <p className="text-sm leading-relaxed text-zinc-700">{plantilla.textoAlcance}</p>
          </div>
        </Page>

        {/* CAP I — INFORMACIÓN GENERAL */}
        <Page num={nextP()} total={totalPages} plantilla={plantilla} title="Cap. I · Información general">
          <H roman="I" title="Información general" />
          <table className="w-full text-sm border-collapse">
            <tbody>
              <Row k="Número de expediente" v={i.numeroExpediente} />
              <Row k="Tipo de inmueble" v={i.tipoInmueble} />
              <Row k="Régimen" v={i.regimen} />
              <Row k="Propósito" v={i.proposito} />
              <Row k="Solicitante / Cliente" v={cli?.nombre} />
              <Row k="Propietario" v={i.propietario} />
              <Row k="Fecha inspección" v={i.fechaInspeccion} />
              <Row k="Fecha del avalúo" v={i.fechaAvaluo} />
              <Row k="Moneda" v={i.moneda} />
              <Row k="Perito firmante" v={per ? `${per.nombre} · NIPEV ${per.registroSIBOIF || per.registro || '—'}` : '—'} />
            </tbody>
          </table>
          {i.observaciones && (<div className="mt-4 text-sm text-zinc-700"><b>Observaciones:</b> {i.observaciones}</div>)}
        </Page>

        {/* CAP II — DOC LEGAL */}
        <Page num={nextP()} total={totalPages} plantilla={plantilla} title="Cap. II · Documentación legal">
          <H roman="II" title="Documentación legal presentada" />
          <table className="w-full text-sm border-collapse">
            <tbody>
              <Row k="N° escritura" v={d.numeroEscritura} />
              <Row k="Fecha escritura" v={d.fechaEscritura} />
              <Row k="Notario público" v={d.notario} />
              <Row k="Área según escritura" v={`${fmtNum(d.areaTerrenoEscritura)} m² · ${fmtNum(d.areaTerrenoEscrituraVr2)} vr²`} />
              <Row k="N° registral" v={d.numeroRegistral} />
              <Row k="Tomo / Folio / Asiento" v={`${d.tomo} / ${d.folio} / ${d.asiento}`} />
              <Row k="N° catastral" v={d.numeroCatastral} />
            </tbody>
          </table>
          {d.observaciones && (<div className="mt-4 text-sm text-zinc-700"><b>Observaciones legales:</b> {d.observaciones}</div>)}
        </Page>

        {/* CAP III — ENTORNO */}
        <Page num={nextP()} total={totalPages} plantilla={plantilla} title="Cap. III · Entorno urbano">
          <H roman="III" title="Análisis del entorno" />
          <table className="w-full text-sm border-collapse mb-4">
            <tbody>
              <Row k="Clasificación de zona" v={e.clasificacionZona} />
              <Row k="Tipo de construcción" v={e.tipoConstruccion} />
              <Row k="Índice de saturación" v={e.indiceSaturacion} />
              <Row k="Densidad poblacional" v={e.densidadPoblacional} />
            </tbody>
          </table>
          <h3 className="font-semibold mb-2 mt-4">Vías de acceso</h3>
          <table className="w-full text-xs border border-zinc-300">
            <thead className="bg-zinc-100"><tr>
              <th className="text-left p-2 border">Característica</th><th className="text-left p-2 border">Zona</th><th className="text-left p-2 border">Vía inmediata</th>
            </tr></thead>
            <tbody>
              {[
                ['Carpeta', e.carpetaZona, e.carpetaInmueble],
                ['Flujo vehicular', e.flujoZona, e.flujoInmueble],
                ['Estado físico', e.estadoZona, e.estadoInmueble],
                ['Importancia', e.importanciaZona, e.importanciaInmueble],
                ['Proximidad', e.proximidadZona, e.proximidadInmueble],
              ].map(([l, z, n]) => (
                <tr key={l as string}><td className="p-2 border">{l}</td><td className="p-2 border">{z || '—'}</td><td className="p-2 border">{n || '—'}</td></tr>
              ))}
            </tbody>
          </table>
          {((e.serviciosPublicos?.length || 0) > 0 || (e.equipamientoUrbano?.length || 0) > 0 || (e.contaminacion?.length || 0) > 0) && (
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div><b>Servicios públicos:</b><div className="text-zinc-700">{(e.serviciosPublicos || []).join(', ') || '—'}</div></div>
              <div><b>Equipamiento urbano:</b><div className="text-zinc-700">{(e.equipamientoUrbano || []).map((it) => `${it.nombre} (${it.distanciaKm} km)`).join('; ') || '—'}</div></div>
              <div className="col-span-2"><b>Riesgos / contaminación:</b><div className="text-zinc-700">{(e.contaminacion || []).join('; ') || '—'}</div></div>
            </div>
          )}
        </Page>

        {/* CAP IV — TERRENOS (uno por página) */}
        {avaluo.terrenos.map((t, idx) => (
          <Page key={t.id} num={nextP()} total={totalPages} plantilla={plantilla} title={`Cap. IV · ${t.titulo}`}>
            <H roman="IV" title={`Descripción del terreno — ${t.titulo}`} />
            <table className="w-full text-sm border-collapse mb-4">
              <tbody>
                <Row k="Ubicación exacta" v={t.ubicacionExacta} />
                <Row k="Coordenadas" v={t.coordenadas} />
                <Row k="Área escritura" v={`${fmtNum(t.areaEscrituraM2)} m² · ${fmtNum(t.areaEscrituraVr2)} vr²`} />
                <Row k="Área catastral" v={`${fmtNum(t.areaCatastralM2)} m² · ${fmtNum(t.areaCatastralVr2)} vr²`} />
                <Row k="Área levantamiento" v={`${fmtNum(t.areaLevantamientoM2)} m² · ${fmtNum(t.areaLevantamientoVr2)} vr²`} />
                <Row k="Fuente homologación" v={t.areaHomologacionFuente} />
                <Row k="Topografía / Forma" v={`${t.topografia || '—'} · ${t.forma || '—'}`} />
                <Row k="Valor unitario US$/vr²" v={fmtMoney(t.valorUnitarioVr2)} />
              </tbody>
            </table>

            <h3 className="font-semibold mb-2">Linderos</h3>
            <table className="w-full text-xs border border-zinc-300 mb-4">
              <thead className="bg-zinc-100"><tr>
                <th className="text-left p-1.5 border w-16">Orient.</th>
                <th className="text-left p-1.5 border">Colindante (levantamiento)</th>
                <th className="text-right p-1.5 border w-20">Medida</th>
                <th className="text-left p-1.5 border">Colindante (escritura)</th>
                <th className="text-right p-1.5 border w-20">Medida</th>
                <th className="text-left p-1.5 border">Delimitante físico</th>
              </tr></thead>
              <tbody>
                {t.linderos.map((l) => (
                  <tr key={l.orientacion}>
                    <td className="p-1.5 border font-semibold">{l.orientacion}</td>
                    <td className="p-1.5 border">{l.levantamientoColindante || '—'}</td>
                    <td className="p-1.5 border text-right mono">{fmtNum(l.levantamientoMedida)}</td>
                    <td className="p-1.5 border">{l.escrituraColindante || '—'}</td>
                    <td className="p-1.5 border text-right mono">{fmtNum(l.escrituraMedida)}</td>
                    <td className="p-1.5 border">{l.delimitanteFisico || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {t.infraestructuras.length > 0 && (
              <>
                <h3 className="font-semibold mb-2 mt-4">Infraestructuras del terreno</h3>
                <table className="w-full text-xs border border-zinc-300">
                  <thead className="bg-zinc-100"><tr>
                    <th className="text-left p-1.5 border">Tipo</th><th className="text-left p-1.5 border">Nombre</th>
                    <th className="text-right p-1.5 border">Área m²</th>
                    <th className="text-right p-1.5 border">VRN</th><th className="text-right p-1.5 border">Dep%</th>
                    <th className="text-right p-1.5 border">VNO</th>
                  </tr></thead>
                  <tbody>
                    {t.infraestructuras.map((inf) => {
                      const tot = totalesCostos(inf);
                      const dep = c.infras.find((x) => x.infra.id === inf.id);
                      return (
                        <tr key={inf.id}>
                          <td className="p-1.5 border capitalize">{inf.tipo.replace('_',' ')}</td>
                          <td className="p-1.5 border">{inf.nombre}</td>
                          <td className="p-1.5 border text-right mono">{fmtNum(inf.areaTotalM2)}</td>
                          <td className="p-1.5 border text-right mono">{fmtMoney(tot.vrn)}</td>
                          <td className="p-1.5 border text-right mono">{fmtPct(dep?.depPct || 0)}</td>
                          <td className="p-1.5 border text-right mono font-semibold">{fmtMoney(dep?.vno || 0)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </>
            )}
          </Page>
        ))}

        {/* CAP V — DESCRIPCIÓN CONSTRUCTIVA + MEMORIAS DE COSTOS */}
        <Page num={nextP()} total={totalPages} plantilla={plantilla} title="Cap. V · Descripción constructiva">
          <H roman="V" title="Descripción de la infraestructura física" />
          {c.infras.length === 0 && <div className="text-sm text-zinc-500">Sin infraestructuras registradas.</div>}
          {c.infras.map((row) => {
            const inf = row.infra;
            const tot = totalesCostos(inf);
            return (
              <div key={inf.id} className="mb-6">
                <div className="font-semibold text-sm bg-zinc-100 px-2 py-1 mb-2">{row.terreno} — {inf.nombre} <span className="text-zinc-500 capitalize">({inf.tipo.replace('_',' ')})</span></div>
                {inf.descripciones.length > 0 && (
                  <table className="w-full text-xs border border-zinc-300 mb-2">
                    <tbody>
                      {inf.descripciones.map((d, i) => (
                        <tr key={i}>
                          <td className="p-1.5 border bg-zinc-50 w-1/3 uppercase text-[10px] tracking-wider">{d.elemento}</td>
                          <td className="p-1.5 border">{d.descripcion}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                <table className="w-full text-xs border border-zinc-300">
                  <thead className="bg-zinc-100"><tr>
                    <th className="text-left p-1 border">Grupo</th><th className="text-left p-1 border">Etapa</th>
                    <th className="text-left p-1 border">Unid.</th><th className="text-right p-1 border">Cant.</th>
                    <th className="text-right p-1 border">C.Unit.</th><th className="text-right p-1 border">Total</th>
                  </tr></thead>
                  <tbody>
                    {inf.costos.map((co) => (
                      <tr key={co.id}>
                        <td className="p-1 border capitalize">{co.grupo}</td>
                        <td className="p-1 border">{co.etapa}</td>
                        <td className="p-1 border">{co.unidad}</td>
                        <td className="p-1 border text-right mono">{fmtNum(co.cantidad)}</td>
                        <td className="p-1 border text-right mono">{fmtMoney(co.costoUnitario)}</td>
                        <td className="p-1 border text-right mono">{fmtMoney(co.cantidad * co.costoUnitario)}</td>
                      </tr>
                    ))}
                    <tr className="bg-zinc-50 font-semibold">
                      <td colSpan={5} className="p-1 border text-right">VRN total</td>
                      <td className="p-1 border text-right mono">{fmtMoney(tot.vrn)}</td>
                    </tr>
                  </tbody>
                </table>
                <div className="text-xs text-zinc-600 mt-1">
                  V.U.E {inf.vidaUtilAnios} años · Edad {inf.edadAnios} años · Estado FE {inf.estadoFE} · Depreciación {fmtPct(row.depPct)} · <b>VNO {fmtMoney(row.vno)}</b>
                </div>
              </div>
            );
          })}
        </Page>

        {/* CAP VI — METODOLOGÍA */}
        <Page num={nextP()} total={totalPages} plantilla={plantilla} title="Cap. VI · Metodología y avalúo">
          <H roman="VI" title="Análisis de valoración" />

          <h3 className="font-bold mb-2">VI.1 Enfoque de costos</h3>
          <table className="w-full text-xs border border-zinc-300 mb-4">
            <thead className="bg-zinc-100"><tr><th className="text-left p-1.5 border">Concepto</th><th className="text-right p-1.5 border">Valor</th></tr></thead>
            <tbody>
              <tr><td className="p-1.5 border">Valor de terrenos</td><td className="p-1.5 border text-right mono">{fmtMoney(c.totalTerrenos)}</td></tr>
              <tr><td className="p-1.5 border">VRN total infraestructuras</td><td className="p-1.5 border text-right mono">{fmtMoney(c.totalVRN)}</td></tr>
              <tr><td className="p-1.5 border">(−) Depreciación acumulada</td><td className="p-1.5 border text-right mono">{fmtMoney(c.totalDepreciacion)}</td></tr>
              <tr><td className="p-1.5 border">VNO infraestructuras</td><td className="p-1.5 border text-right mono">{fmtMoney(c.totalVNO)}</td></tr>
              <tr className="bg-zinc-50 font-semibold"><td className="p-1.5 border">VNR (Valor Neto de Reposición)</td><td className="p-1.5 border text-right mono">{fmtMoney(c.totalReposicionNeto)}</td></tr>
            </tbody>
          </table>

          {homT.filas.length > 0 && (
            <>
              <h3 className="font-bold mb-2 mt-4">VI.2 Enfoque de mercado — Terreno</h3>
              <table className="w-full text-[10px] border border-zinc-300 mb-3">
                <thead className="bg-zinc-100"><tr>
                  <th className="text-left p-1 border">Comp.</th><th className="text-left p-1 border">Dirección</th>
                  <th className="text-right p-1 border">Precio</th><th className="text-right p-1 border">Área vr²</th>
                  <th className="text-right p-1 border">$/vr²</th><th className="text-right p-1 border">F.Ub</th>
                  <th className="text-right p-1 border">F.Zona</th><th className="text-right p-1 border">F.Vía</th>
                  <th className="text-right p-1 border">F.Total</th><th className="text-right p-1 border">$/vr² hom.</th>
                </tr></thead>
                <tbody>
                  {homT.filas.map((f, idx) => (
                    <tr key={idx}>
                      <td className="p-1 border">C{idx + 1}</td>
                      <td className="p-1 border">{f.comparable.direccion}</td>
                      <td className="p-1 border text-right mono">{fmtMoney(f.comparable.precioVentaUSD)}</td>
                      <td className="p-1 border text-right mono">{fmtNum(f.comparable.areaTerrenoVr2)}</td>
                      <td className="p-1 border text-right mono">{fmtNum(f.precioVr2)}</td>
                      <td className="p-1 border text-right mono">{f.factores.ubicacion.toFixed(3)}</td>
                      <td className="p-1 border text-right mono">{f.factores.zona.toFixed(3)}</td>
                      <td className="p-1 border text-right mono">{f.factores.via.toFixed(3)}</td>
                      <td className="p-1 border text-right mono font-semibold">{f.factores.total.toFixed(3)}</td>
                      <td className="p-1 border text-right mono font-semibold">{fmtNum(f.valorVr2Homologado)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="text-xs mb-4">Promedio negociación: <span className="mono">{homT.promNeg.toFixed(3)}</span> · $/vr² promedio: <b className="mono">{fmtMoney(homT.valorVr2Promedio)}</b> · <b>Valor mercado terreno: {fmtMoney(homT.valorMercadoTerreno)}</b></div>
            </>
          )}

          {homI.filas.length > 0 && (
            <>
              <h3 className="font-bold mb-2 mt-4">VI.3 Enfoque de mercado — Inmueble construido</h3>
              <table className="w-full text-[10px] border border-zinc-300 mb-3">
                <thead className="bg-zinc-100"><tr>
                  <th className="text-left p-1 border">Comp.</th><th className="text-right p-1 border">Precio</th>
                  <th className="text-right p-1 border">A.Const</th><th className="text-right p-1 border">$/m²</th>
                  <th className="text-right p-1 border">F.Ub</th><th className="text-right p-1 border">F.Zona</th>
                  <th className="text-right p-1 border">F.Total</th><th className="text-right p-1 border">$/m² hom.</th>
                </tr></thead>
                <tbody>
                  {homI.filas.map((f, idx) => (
                    <tr key={idx}>
                      <td className="p-1 border">C{idx + 1}</td>
                      <td className="p-1 border text-right mono">{fmtMoney(f.comparable.precioVentaUSD)}</td>
                      <td className="p-1 border text-right mono">{fmtNum(f.comparable.areaConstruccionM2)}</td>
                      <td className="p-1 border text-right mono">{fmtNum(f.precioM2)}</td>
                      <td className="p-1 border text-right mono">{f.factores.ubicacion.toFixed(3)}</td>
                      <td className="p-1 border text-right mono">{f.factores.zona.toFixed(3)}</td>
                      <td className="p-1 border text-right mono font-semibold">{f.factores.total.toFixed(3)}</td>
                      <td className="p-1 border text-right mono font-semibold">{fmtNum(f.valorM2Homologado)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="text-xs mb-4">$/m² promedio: <b className="mono">{fmtMoney(homI.valorM2Promedio)}</b> · <b>Valor mercado inmueble: {fmtMoney(homI.valorMercado)}</b></div>
            </>
          )}

          <h3 className="font-bold mb-2 mt-4">VI.4 Valor de realización</h3>
          <table className="w-full text-xs border border-zinc-300">
            <thead className="bg-zinc-100"><tr><th className="text-left p-1.5 border">Concepto</th><th className="text-right p-1.5 border">%</th><th className="text-right p-1.5 border">Valor</th></tr></thead>
            <tbody>
              {deduccionesDetalle(base, m.deducciones).map((dd) => (
                <tr key={dd.concepto}><td className="p-1.5 border">{dd.concepto}</td><td className="p-1.5 border text-right mono">{dd.pct}%</td><td className="p-1.5 border text-right mono">{fmtMoney(dd.valor)}</td></tr>
              ))}
              <tr className="bg-zinc-50 font-semibold"><td className="p-1.5 border" colSpan={2}>Valor de realización</td><td className="p-1.5 border text-right mono">{fmtMoney(valorReal)}</td></tr>
            </tbody>
          </table>
        </Page>

        {/* RESUMEN + FIRMA */}
        <Page num={nextP()} total={totalPages} plantilla={plantilla} title="Resumen de valores y certificación">
          <H roman="VII" title="Resumen de valores" />
          <table className="w-full text-sm border border-zinc-300 mb-6">
            <tbody>
              <tr><td className="p-2 border">Valor por enfoque de costos (VNR)</td><td className="p-2 border text-right mono">{fmtMoney(c.totalReposicionNeto)}</td></tr>
              <tr><td className="p-2 border">Valor por enfoque de mercado</td><td className="p-2 border text-right mono">{fmtMoney(valorMercado)}</td></tr>
              <tr><td className="p-2 border">Valor de realización</td><td className="p-2 border text-right mono">{fmtMoney(valorReal)}</td></tr>
            </tbody>
          </table>

          <div className="p-6 border-2 text-center" style={{ borderColor: plantilla.color, background: `${plantilla.color}08` }}>
            <div className="text-xs uppercase tracking-widest text-zinc-600">Valor comercial concluido ({m.enfoqueConclusion})</div>
            <div className="text-4xl font-bold font-mono mt-2" style={{ color: plantilla.color }}>{fmtMoney(valorConcluido, i.moneda)}</div>
          </div>

          <div className="mt-10 text-xs text-zinc-700">
            <p>El suscrito perito valuador certifica que la presente valuación se ha realizado conforme a lo establecido en la Resolución N° CD-SIBOIF-868-1-DIC10-2014, Norma sobre Peritos Valuadores, y que los valores aquí presentados reflejan, a la fecha del avalúo, el valor comercial del inmueble inspeccionado.</p>
          </div>

          <div className="mt-12 pt-8 border-t border-zinc-300 grid grid-cols-2 gap-8">
            <div>
              <div className="border-b border-zinc-400 pb-2 mb-1 h-12"></div>
              <div className="text-sm font-semibold">{per?.nombre || 'Perito firmante'}</div>
              <div className="text-xs text-zinc-500">NIPEV: {per?.registroSIBOIF || per?.registro || '—'}</div>
            </div>
            <div className="text-right text-xs text-zinc-500">
              <div>Elaborado el {i.fechaAvaluo || '—'}</div>
              <div>{plantilla.empresa}</div>
            </div>
          </div>
        </Page>

        {/* ANEXO FOTOGRÁFICO */}
        <Page num={nextP()} total={totalPages} plantilla={plantilla} title="Anexo fotográfico">
          <H roman="VIII" title="Anexo fotográfico" />
          {Object.entries(avaluo.fotos).map(([cat, fotos]) => {
            if (!fotos || fotos.length === 0) return null;
            return (
              <div key={cat} className="mb-6">
                <h3 className="font-semibold capitalize mb-2">{cat.replace(/_/g, ' ')}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {fotos.map((f) => (
                    <div key={f.id}>
                      <img src={f.src} alt="" className="w-full h-40 object-cover border border-zinc-300" />
                      <div className="text-[10px] text-zinc-500 mt-1">{f.descripcion}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </Page>
      </div>
    </div>
  );
}
