import { Link } from 'react-router-dom';
import {
  Avaluo,
  DocumentoLegalItem,
  EstadoPago,
  EstatusOperativo,
  PrioridadExpediente,
} from '@/store/types';
import { useStore } from '@/store/avaluoStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  consolidados,
  homologacionInmueble,
  homologacionTerreno,
  valorRealizacion,
  fmtMoney,
  fmtPct,
  fmtNum,
} from '@/lib/calculations';
import {
  AlertTriangle,
  Building2,
  CalendarClock,
  CheckCircle2,
  Eye,
  FileText,
  Landmark,
  UserCog,
  Wallet,
} from 'lucide-react';

const ESTATUS_LABEL: Record<EstatusOperativo, string> = {
  borrador: 'Borrador',
  pendiente_inspeccion: 'Pendiente inspección',
  en_inspeccion: 'En inspección',
  en_elaboracion: 'En elaboración',
  en_revision: 'En revisión',
  listo_exportar: 'Listo para exportar',
  entregado: 'Entregado',
  cerrado: 'Cerrado',
  cancelado: 'Cancelado',
};

const PRIORIDAD_LABEL: Record<PrioridadExpediente, string> = {
  baja: 'Baja',
  normal: 'Normal',
  alta: 'Alta',
  urgente: 'Urgente',
};

const PAGO_LABEL: Record<EstadoPago, string> = {
  pendiente: 'Pendiente',
  parcial: 'Parcial',
  pagado: 'Pagado',
  no_aplica: 'No aplica',
};

const LABEL_DOCUMENTO_LEGAL: Record<string, string> = {
  escritura: 'Escritura pública',
  contrato: 'Contrato',
  plano_topografico: 'Plano topográfico',
  razon_inscripcion: 'Razón de inscripción',
  personalizado: 'Documento',
};

const fmtAreaLegal = (m2?: number, vr2?: number) => {
  const partes: string[] = [];

  if (m2 && m2 > 0) partes.push(`${fmtNum(m2)} m²`);
  if (vr2 && vr2 > 0) partes.push(`${fmtNum(vr2)} vr²`);

  return partes.length ? partes.join(' · ') : '—';
};

const documentoLegalLegacy = (d: any): DocumentoLegalItem | null => {
  if (
    !d.numeroEscritura &&
    !d.fechaEscritura &&
    !d.notario &&
    !d.numeroFinca &&
    !d.numeroRegistral &&
    !d.numeroCatastral
  ) {
    return null;
  }

  return {
    id: 'legacy-documento-legal',
    tipo: 'escritura',
    titulo: 'Escritura pública',
    nombre: d.numeroEscritura || '',
    fecha: d.fechaEscritura || '',
    autorizante: d.notario || '',
    areaM2: d.areaTerrenoEscritura || 0,
    areaVr2: d.areaTerrenoEscrituraVr2 || 0,
    tieneInscripcion: Boolean(
      d.numeroFinca ||
        d.numeroRegistral ||
        d.tomo ||
        d.folio ||
        d.asiento ||
        d.numeroCatastral
    ),
    numeroRegistral: d.numeroFinca || d.numeroRegistral || '',
    tomo: d.tomo || '',
    folio: d.folio || '',
    asiento: d.asiento || '',
    numeroCatastral: d.numeroCatastral || '',
    observaciones: '',
  };
};

const badgePrioridadClass = (prioridad: PrioridadExpediente) => {
  switch (prioridad) {
    case 'urgente':
      return 'border-destructive/40 bg-destructive/10 text-destructive';
    case 'alta':
      return 'border-amber-500/40 bg-amber-500/10 text-amber-700';
    default:
      return '';
  }
};

const badgePagoClass = (estadoPago: EstadoPago) => {
  switch (estadoPago) {
    case 'pagado':
      return 'border-green-500/40 bg-green-500/10 text-green-700';
    case 'parcial':
      return 'border-amber-500/40 bg-amber-500/10 text-amber-700';
    case 'pendiente':
      return 'border-destructive/40 bg-destructive/10 text-destructive';
    default:
      return '';
  }
};

export function StepPreview({ avaluo }: { avaluo: Avaluo }) {
  const { clientes, peritos } = useStore();

  const cli = clientes.find((c) => c.id === avaluo.clienteId);
  const per = peritos.find((p) => p.id === avaluo.peritoId);

  const c = consolidados(avaluo);
  const m = avaluo.metodologias;

  const homT = homologacionTerreno(m.sujetoTerreno, m.comparablesTerreno);
  const homI = homologacionInmueble(m.sujetoInmueble, m.comparablesInmueble);

  const valorMercado =
    (homT.valorMercadoTerreno || 0) + (homI.valorMercado || 0);

  const base = valorMercado || c.totalReposicionNeto;
  const valorReal = valorRealizacion(base, m.deducciones);
  const valorConcluido =
    m.enfoqueConclusion === 'mercado' ? base : c.totalReposicionNeto;

  const documentosLegales: DocumentoLegalItem[] =
    avaluo.documentoLegal.documentos &&
    avaluo.documentoLegal.documentos.length > 0
      ? avaluo.documentoLegal.documentos
      : documentoLegalLegacy(avaluo.documentoLegal)
        ? [documentoLegalLegacy(avaluo.documentoLegal)!]
        : [];

  const totalInfraestructuras = avaluo.terrenos.reduce(
    (acc, terreno) => acc + terreno.infraestructuras.length,
    0
  );

  const saldoPendiente = Math.max(
    0,
    (avaluo.costoServicio || 0) - (avaluo.montoPagado || 0)
  );

  const advertencias = [
    !cli ? 'No hay cliente administrativo asignado.' : '',
    !per ? 'No hay perito firmante asignado.' : '',
    documentosLegales.length === 0 ? 'No hay documentación legal registrada.' : '',
    avaluo.terrenos.length === 0 ? 'No hay terrenos registrados.' : '',
    totalInfraestructuras === 0 ? 'No hay infraestructuras registradas.' : '',
  ].filter(Boolean);

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-primary">
            Vista previa
          </div>

          <h2 className="text-xl font-semibold">
            Resumen ejecutivo del expediente
          </h2>

          <p className="text-sm text-muted-foreground">
            Revisión rápida antes de generar el documento INMOVAL completo.
          </p>
        </div>

        <Button asChild>
          <Link to={`/avaluos/${avaluo.id}/preview`}>
            <Eye className="h-4 w-4 mr-1" />
            Ver documento INMOVAL
          </Link>
        </Button>
      </header>

      {advertencias.length > 0 && (
        <Card className="p-4 border-amber-500/30 bg-amber-500/10">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-700 mt-0.5" />

            <div>
              <div className="font-medium text-amber-800">
                Revisión pendiente antes del documento final
              </div>

              <ul className="text-sm text-muted-foreground mt-2 list-disc pl-5 space-y-1">
                {advertencias.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <FileText className="h-4 w-4" />
            Expediente
          </div>

          <div className="font-medium mt-2 mono">
            {avaluo.info.numeroExpediente || '—'}
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="outline">
              {ESTATUS_LABEL[avaluo.estatusOperativo]}
            </Badge>

            <Badge
              variant="outline"
              className={badgePrioridadClass(avaluo.prioridad)}
            >
              {PRIORIDAD_LABEL[avaluo.prioridad]}
            </Badge>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <Building2 className="h-4 w-4" />
            Cliente
          </div>

          <div className="font-medium mt-2">
            {cli?.nombre || avaluo.info.clienteNombre || '—'}
          </div>

          <div className="text-xs text-muted-foreground mt-1">
            Solicitante: {avaluo.info.solicitante || '—'}
          </div>

          <div className="text-xs text-muted-foreground">
            Propietario: {avaluo.info.propietario || '—'}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <UserCog className="h-4 w-4" />
            Perito firmante
          </div>

          <div className="font-medium mt-2">
            {per?.nombre || '—'}
          </div>

          <div className="text-xs text-muted-foreground">
            NIPEV: {per?.registroSIBOIF || per?.registro || '—'}
          </div>

          <div className="text-xs text-muted-foreground">
            {per?.email || ''}
            {per?.telefono ? ` · ${per.telefono}` : ''}
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarClock className="h-4 w-4" />
            Solicitud
          </div>

          <div className="text-lg mono mt-1">
            {avaluo.fechaSolicitud || '—'}
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-muted-foreground">
            Inspección
          </div>

          <div className="text-lg mono mt-1">
            {avaluo.info.fechaInspeccion || '—'}
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-muted-foreground">
            Entrega estimada
          </div>

          <div className="text-lg mono mt-1">
            {avaluo.fechaEntregaEstimada || '—'}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Wallet className="h-4 w-4" />
            Pago
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            <Badge
              variant="outline"
              className={badgePagoClass(avaluo.estadoPago)}
            >
              {PAGO_LABEL[avaluo.estadoPago]}
            </Badge>
          </div>

          <div className="text-xs text-muted-foreground mt-2">
            Saldo: {fmtMoney(saldoPendiente, avaluo.info.moneda)}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Capítulo II
            </div>
            <h3 className="font-semibold">
              Documentación legal registrada
            </h3>
          </div>

          <Badge variant="outline">
            {documentosLegales.length} documento(s)
          </Badge>
        </div>

        {documentosLegales.length === 0 ? (
          <div className="text-sm text-muted-foreground border border-dashed rounded-md p-4">
            No se registró documentación legal.
          </div>
        ) : (
          <div className="space-y-3">
            {documentosLegales.map((doc, idx) => {
              const tipoLabel =
                LABEL_DOCUMENTO_LEGAL[doc.tipo] || doc.titulo || 'Documento';

              return (
                <div
                  key={doc.id || idx}
                  className="rounded-md border border-border p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">
                        Documento {idx + 1} · {tipoLabel}
                      </div>

                      <div className="font-medium mt-1">
                        {doc.titulo || tipoLabel}
                        {doc.nombre ? ` — ${doc.nombre}` : ''}
                      </div>

                      <div className="text-xs text-muted-foreground mt-1">
                        Fecha: {doc.fecha || '—'} · Emisor/autorizante:{' '}
                        {doc.autorizante || '—'}
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Área: {fmtAreaLegal(doc.areaM2, doc.areaVr2)}
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-end gap-2">
                      {doc.tieneInscripcion && (
                        <Badge variant="outline">
                          <Landmark className="h-3 w-3 mr-1" />
                          Registro
                        </Badge>
                      )}

                      {doc.numeroCatastral && (
                        <Badge variant="outline">
                          Catastro
                        </Badge>
                      )}
                    </div>
                  </div>

                  {doc.tieneInscripcion && (
                    <div className="mt-3 grid md:grid-cols-4 gap-2 text-xs text-muted-foreground">
                      <div>Finca/Registro: {doc.numeroRegistral || '—'}</div>
                      <div>Tomo: {doc.tomo || '—'}</div>
                      <div>Folio: {doc.folio || '—'}</div>
                      <div>Asiento: {doc.asiento || '—'}</div>
                    </div>
                  )}

                  {doc.observaciones && (
                    <div className="mt-3 text-xs text-muted-foreground">
                      <span className="font-medium">Observaciones:</span>{' '}
                      {doc.observaciones}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {avaluo.documentoLegal.observaciones && (
          <div className="mt-4 text-sm text-muted-foreground border-t pt-3">
            <span className="font-medium">Observaciones legales generales:</span>{' '}
            {avaluo.documentoLegal.observaciones}
          </div>
        )}
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Terrenos
          </div>

          <div className="text-2xl font-semibold mt-1">
            {avaluo.terrenos.length}
          </div>

          <div className="text-xs text-muted-foreground mt-1">
            Valor terreno: {fmtMoney(c.totalTerrenos, avaluo.info.moneda)}
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Infraestructuras
          </div>

          <div className="text-2xl font-semibold mt-1">
            {totalInfraestructuras}
          </div>

          <div className="text-xs text-muted-foreground mt-1">
            VNO: {fmtMoney(c.totalVNO, avaluo.info.moneda)}
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Anexo fotográfico
          </div>

          <div className="text-2xl font-semibold mt-1">
            {Object.values(avaluo.fotos).reduce(
              (acc, fotos) => acc + fotos.length,
              0
            )}
          </div>

          <div className="text-xs text-muted-foreground mt-1">
            fotografía(s) registradas
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">
            Valor terreno
          </div>

          <div className="text-lg mono">
            {fmtMoney(c.totalTerrenos, avaluo.info.moneda)}
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-muted-foreground">
            VNO infraestructuras
          </div>

          <div className="text-lg mono">
            {fmtMoney(c.totalVNO, avaluo.info.moneda)}
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-muted-foreground">
            Valor de mercado
          </div>

          <div className="text-lg mono">
            {fmtMoney(valorMercado, avaluo.info.moneda)}
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-muted-foreground">
            Valor de realización
          </div>

          <div className="text-lg mono">
            {fmtMoney(valorReal, avaluo.info.moneda)}
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          <CheckCircle2 className="h-4 w-4" />
          Valor comercial concluido ({m.enfoqueConclusion})
        </div>

        <div className="text-4xl font-bold mt-2 mono">
          {fmtMoney(valorConcluido, avaluo.info.moneda)}
        </div>

        <div className="text-xs text-muted-foreground mt-2">
          Deducciones realización:{' '}
          {fmtPct(
            (m.deducciones.ir +
              m.deducciones.ibi +
              m.deducciones.corretaje +
              m.deducciones.legales +
              m.deducciones.comercializacion) /
              100
          )}
        </div>
      </Card>
    </div>
  );
}