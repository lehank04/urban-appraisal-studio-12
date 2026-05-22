import { Link, useParams } from 'react-router-dom';
import { useStore } from '@/store/avaluoStore';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer } from 'lucide-react';
import { PLANTILLAS } from '@/templates/plantillas';
import { consolidados, depreciacion, fmtMoney, valorComparable, valorTerreno } from '@/lib/calculations';

function Page({ children, num, total, plantilla }: any) {
  return (
    <div className="doc-page mb-6 relative">
      <div className="absolute top-6 left-0 right-0 px-6 flex justify-between text-[10px] uppercase tracking-widest text-zinc-500 border-b border-zinc-200 pb-2">
        <span>{plantilla.empresa}</span><span>Avalúo comercial</span>
      </div>
      <div className="mt-6">{children}</div>
      <div className="absolute bottom-6 left-0 right-0 px-6 flex justify-between text-[10px] text-zinc-400 border-t border-zinc-200 pt-2">
        <span>Documento técnico confidencial</span><span>Página {num} de {total}</span>
      </div>
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

  const totalPages = 6 + avaluo.terrenos.length;

  return (
    <div className="min-h-screen bg-zinc-200">
      <header className="no-print sticky top-0 z-20 bg-card border-b border-border px-6 py-3 flex items-center justify-between">
        <Button variant="ghost" asChild><Link to={`/avaluos/${avaluo.id}`}><ArrowLeft className="h-4 w-4 mr-1" />Volver al editor</Link></Button>
        <div className="text-sm font-medium">Vista previa documental · {plantilla.nombre}</div>
        <Button onClick={() => window.print()}><Printer className="h-4 w-4 mr-1" />Imprimir / PDF</Button>
      </header>

      <div className="py-8">
        {/* Portada */}
        <div className="doc-page mb-6 flex flex-col" style={{ background: `linear-gradient(180deg, white 60%, ${plantilla.color}11)` }}>
          <div className="border-t-8" style={{ borderColor: plantilla.color }} />
          <div className="flex-1 flex flex-col justify-center text-center px-12">
            <div className="text-xs uppercase tracking-[0.3em] text-zinc-500 mb-4">{plantilla.empresa}</div>
            <h1 className="text-5xl font-serif font-bold text-zinc-900 mb-3">{plantilla.portadaSubtitulo}</h1>
            <div className="w-16 h-1 mx-auto my-6" style={{ background: plantilla.color }} />
            <div className="text-lg text-zinc-700">{i.propietario || 'Propietario'}</div>
            <div className="text-sm text-zinc-500 mt-1">{i.direccionInmueble || 'Dirección del inmueble'}</div>
            <div className="text-sm text-zinc-500">{i.municipio}, {i.departamento}</div>
            <div className="mt-10 inline-block mx-auto px-6 py-3 border-2 border-zinc-300 rounded">
              <div className="text-[10px] uppercase tracking-wider text-zinc-500">Expediente</div>
              <div className="font-mono text-lg">{i.codigoExpediente || 'SIN CÓDIGO'}</div>
            </div>
          </div>
          <div className="px-12 pb-12 grid grid-cols-3 gap-6 text-xs">
            <div><div className="text-zinc-500 uppercase tracking-wider text-[9px]">Solicitante</div><div className="text-zinc-900 font-medium">{i.solicitante || '—'}</div></div>
            <div><div className="text-zinc-500 uppercase tracking-wider text-[9px]">Cliente</div><div className="text-zinc-900 font-medium">{cli?.nombre || '—'}</div></div>
            <div><div className="text-zinc-500 uppercase tracking-wider text-[9px]">Fecha</div><div className="text-zinc-900 font-medium">{i.fechaElaboracion || '—'}</div></div>
          </div>
        </div>

        {/* Índice */}
        <Page num={2} total={totalPages} plantilla={plantilla}>
          <h2 className="text-2xl font-bold mb-6">Contenido</h2>
          <ol className="space-y-2 text-sm">
            {plantilla.capitulos.map((cap) => (
              <li key={cap} className="flex justify-between border-b border-dotted border-zinc-300 pb-1">
                <span>{cap}</span><span className="text-zinc-400">·</span>
              </li>
            ))}
          </ol>
          <div className="mt-10">
            <h3 className="text-lg font-semibold mb-2">Introducción</h3>
            <p className="text-sm leading-relaxed text-zinc-700">{plantilla.textoIntroduccion}</p>
            <h3 className="text-lg font-semibold mt-6 mb-2">Alcance</h3>
            <p className="text-sm leading-relaxed text-zinc-700">{plantilla.textoAlcance}</p>
          </div>
        </Page>

        {/* Información general */}
        <Page num={3} total={totalPages} plantilla={plantilla}>
          <h2 className="text-2xl font-bold mb-6">1. Información general</h2>
          <table className="w-full text-sm border-collapse">
            <tbody>
              {[
                ['Código expediente', i.codigoExpediente], ['Solicitante', i.solicitante],
                ['Propietario', i.propietario], ['Tipo de avalúo', i.tipoAvaluo],
                ['Finalidad', i.finalidad], ['Fecha inspección', i.fechaInspeccion],
                ['Fecha elaboración', i.fechaElaboracion], ['Dirección', i.direccionInmueble],
                ['Municipio / Departamento', `${i.municipio} / ${i.departamento}`],
                ['Matrícula', i.matricula], ['Número catastral', i.numeroCatastral],
                ['Área registrada', `${i.areaRegistrada} m²`], ['Área levantada', `${i.areaLevantada} m²`],
                ['Moneda', i.moneda],
              ].map(([k, v]) => (
                <tr key={k} className="border-b border-zinc-200">
                  <td className="py-2 pr-4 text-zinc-500 uppercase text-[10px] tracking-wider w-1/3">{k}</td>
                  <td className="py-2 font-medium">{v || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {i.observacionesGenerales && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Observaciones</h3>
              <p className="text-sm text-zinc-700 leading-relaxed">{i.observacionesGenerales}</p>
            </div>
          )}
        </Page>

        {/* Terrenos */}
        {avaluo.terrenos.map((t, idx) => (
          <Page key={t.id} num={4 + idx} total={totalPages} plantilla={plantilla}>
            <h2 className="text-2xl font-bold mb-2">3.{idx + 1} {t.titulo}</h2>
            <div className="text-sm text-zinc-500 mb-4">Valor total: <span className="font-mono font-semibold text-zinc-900">{fmtMoney(valorTerreno(t), i.moneda)}</span></div>
            <table className="w-full text-sm border-collapse mb-4">
              <tbody>
                {[
                  ['Área', `${t.area} m²`], ['Valor unitario', fmtMoney(t.valorUnitario, i.moneda)],
                  ['Forma', t.forma], ['Topografía', t.topografia], ['Acceso', t.tipoAcceso],
                  ['Servicios', t.serviciosPublicos], ['Zonificación', t.zonificacion],
                  ['Uso actual', t.usoActual], ['Uso potencial', t.usoPotencial], ['Entorno', t.entorno],
                ].map(([k, v]) => (
                  <tr key={k} className="border-b border-zinc-200">
                    <td className="py-1.5 pr-4 text-zinc-500 uppercase text-[10px] tracking-wider w-1/3">{k}</td>
                    <td className="py-1.5">{v || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {t.descripcionFisica && (<><h4 className="font-semibold mt-4 mb-1">Descripción física</h4><p className="text-sm text-zinc-700">{t.descripcionFisica}</p></>)}

            {t.infraestructuras.length > 0 && (
              <>
                <h3 className="font-bold mt-6 mb-3">Infraestructuras</h3>
                <table className="w-full text-xs border border-zinc-300">
                  <thead className="bg-zinc-100"><tr>
                    <th className="text-left p-2 border border-zinc-300">Tipo</th>
                    <th className="text-left p-2 border border-zinc-300">Nombre</th>
                    <th className="text-right p-2 border border-zinc-300">Área</th>
                    <th className="text-right p-2 border border-zinc-300">Reposición</th>
                    <th className="text-right p-2 border border-zinc-300">Depreciado</th>
                  </tr></thead>
                  <tbody>
                    {t.infraestructuras.map((inf) => {
                      const d = depreciacion(inf);
                      return (
                        <tr key={inf.id}>
                          <td className="p-2 border border-zinc-300 capitalize">{inf.tipo.replace('_', ' ')}</td>
                          <td className="p-2 border border-zinc-300">{inf.nombre}</td>
                          <td className="p-2 border border-zinc-300 text-right font-mono">{inf.area} {inf.unidadMedida}</td>
                          <td className="p-2 border border-zinc-300 text-right font-mono">{fmtMoney(d.costo, i.moneda)}</td>
                          <td className="p-2 border border-zinc-300 text-right font-mono font-semibold">{fmtMoney(d.depreciado, i.moneda)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </>
            )}
          </Page>
        ))}

        {/* Metodologías */}
        <Page num={4 + avaluo.terrenos.length} total={totalPages} plantilla={plantilla}>
          <h2 className="text-2xl font-bold mb-6">5. Metodologías valuatorias</h2>
          {(['comparativo', 'reposicion', 'mercadoTerreno', 'mercadoMejoras'] as const).map((k) => {
            const labels = { comparativo: 'Método comparativo de mercado', reposicion: 'Método de reposición', mercadoTerreno: 'Valor de mercado terreno', mercadoMejoras: 'Valor de mercado mejoras' };
            const active = avaluo.metodologias[k];
            return (
              <div key={k} className="mb-4 pb-4 border-b border-zinc-200">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">{labels[k]}</h3>
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${active ? 'bg-green-100 text-green-800' : 'bg-zinc-200 text-zinc-600'}`}>
                    {active ? 'Aplica' : 'No aplica'}
                  </span>
                </div>
                {!active && <p className="text-xs italic text-zinc-600 mt-2">{plantilla.textosNoAplica[k]}</p>}
              </div>
            );
          })}

          {avaluo.metodologias.comparativo && avaluo.metodologias.comparables.length > 0 && (
            <>
              <h3 className="font-bold mt-6 mb-3">Memorias comparativas</h3>
              <table className="w-full text-xs border border-zinc-300">
                <thead className="bg-zinc-100"><tr>
                  <th className="text-left p-2 border border-zinc-300">Comparable</th>
                  <th className="text-right p-2 border border-zinc-300">Área</th>
                  <th className="text-right p-2 border border-zinc-300">Precio</th>
                  <th className="text-right p-2 border border-zinc-300">Factor</th>
                  <th className="text-right p-2 border border-zinc-300">$/m² ajustado</th>
                </tr></thead>
                <tbody>
                  {avaluo.metodologias.comparables.map((co) => {
                    const v = valorComparable(co);
                    return (
                      <tr key={co.id}>
                        <td className="p-2 border border-zinc-300">{co.nombre}<div className="text-zinc-500">{co.ubicacion}</div></td>
                        <td className="p-2 border border-zinc-300 text-right font-mono">{co.area}</td>
                        <td className="p-2 border border-zinc-300 text-right font-mono">{fmtMoney(co.precio, i.moneda)}</td>
                        <td className="p-2 border border-zinc-300 text-right font-mono">{v.factor.toFixed(3)}</td>
                        <td className="p-2 border border-zinc-300 text-right font-mono font-semibold">{fmtMoney(v.unitario, i.moneda)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          )}
        </Page>

        {/* Fotos */}
        <Page num={5 + avaluo.terrenos.length} total={totalPages} plantilla={plantilla}>
          <h2 className="text-2xl font-bold mb-6">7. Registro fotográfico</h2>
          {(['fachada', 'interior', 'comparables', 'infraestructuras', 'planos', 'legales'] as const).map((cat) => {
            const fotos = avaluo.fotos[cat];
            if (!fotos.length) return null;
            return (
              <div key={cat} className="mb-6">
                <h3 className="font-semibold capitalize mb-2">{cat}</h3>
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

        {/* Consolidados y conclusión */}
        <Page num={6 + avaluo.terrenos.length} total={totalPages} plantilla={plantilla}>
          <h2 className="text-2xl font-bold mb-6">8. Consolidado de valores y conclusiones</h2>

          <h3 className="font-bold mb-2">Terrenos</h3>
          <table className="w-full text-xs border border-zinc-300 mb-6">
            <thead className="bg-zinc-100"><tr><th className="text-left p-2 border">Terreno</th><th className="text-right p-2 border">Área</th><th className="text-right p-2 border">V. unitario</th><th className="text-right p-2 border">Total</th></tr></thead>
            <tbody>
              {c.terrenos.map((t) => (
                <tr key={t.id}><td className="p-2 border">{t.titulo}</td><td className="p-2 border text-right font-mono">{t.area} m²</td><td className="p-2 border text-right font-mono">{fmtMoney(t.valorUnitario, i.moneda)}</td><td className="p-2 border text-right font-mono font-semibold">{fmtMoney(t.valorTotal, i.moneda)}</td></tr>
              ))}
              <tr className="bg-zinc-50 font-semibold"><td colSpan={3} className="p-2 border text-right">Subtotal terrenos</td><td className="p-2 border text-right font-mono">{fmtMoney(c.totalTerrenos, i.moneda)}</td></tr>
            </tbody>
          </table>

          <h3 className="font-bold mb-2">Infraestructuras</h3>
          <table className="w-full text-xs border border-zinc-300 mb-6">
            <thead className="bg-zinc-100"><tr><th className="text-left p-2 border">Terreno</th><th className="text-left p-2 border">Infra</th><th className="text-right p-2 border">Reposición</th><th className="text-right p-2 border">Depreciado</th></tr></thead>
            <tbody>
              {c.infras.map((x) => (
                <tr key={x.infra.id}><td className="p-2 border">{x.terreno}</td><td className="p-2 border">{x.infra.nombre}</td><td className="p-2 border text-right font-mono">{fmtMoney(x.costo, i.moneda)}</td><td className="p-2 border text-right font-mono font-semibold">{fmtMoney(x.depreciado, i.moneda)}</td></tr>
              ))}
              <tr className="bg-zinc-50 font-semibold"><td colSpan={3} className="p-2 border text-right">Subtotal infraestructuras</td><td className="p-2 border text-right font-mono">{fmtMoney(c.totalInfras, i.moneda)}</td></tr>
            </tbody>
          </table>

          <div className="mt-8 p-6 border-2 text-center" style={{ borderColor: plantilla.color, background: `${plantilla.color}08` }}>
            <div className="text-xs uppercase tracking-widest text-zinc-600">Valor comercial total</div>
            <div className="text-4xl font-bold font-mono mt-2" style={{ color: plantilla.color }}>{fmtMoney(c.total, i.moneda)}</div>
          </div>

          <div className="mt-12 pt-8 border-t border-zinc-300 grid grid-cols-2 gap-8">
            <div>
              <div className="border-b border-zinc-400 pb-2 mb-1 h-12"></div>
              <div className="text-sm font-semibold">{per?.nombre || 'Perito firmante'}</div>
              <div className="text-xs text-zinc-500">Reg. {per?.registro || '—'}</div>
            </div>
            <div className="text-right text-xs text-zinc-500">
              <div>Elaborado el {i.fechaElaboracion || '—'}</div>
              <div>{plantilla.empresa}</div>
            </div>
          </div>
        </Page>
      </div>
    </div>
  );
}
