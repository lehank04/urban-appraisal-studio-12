import { Link } from 'react-router-dom';
import { Avaluo } from '@/store/types';
import { useStore } from '@/store/avaluoStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  consolidados, homologacionInmueble, homologacionTerreno,
  valorRealizacion, fmtMoney, fmtPct,
} from '@/lib/calculations';
import { Eye } from 'lucide-react';

export function StepPreview({ avaluo }: { avaluo: Avaluo }) {
  const { clientes, peritos } = useStore();
  const cli = clientes.find((c) => c.id === avaluo.clienteId);
  const per = peritos.find((p) => p.id === avaluo.peritoId);
  const c = consolidados(avaluo);
  const m = avaluo.metodologias;
  const homT = homologacionTerreno(m.sujetoTerreno, m.comparablesTerreno);
  const homI = homologacionInmueble(m.sujetoInmueble, m.comparablesInmueble);
  const valorMercado = (homT.valorMercadoTerreno || 0) + (homI.valorMercado || 0);
  const base = valorMercado || c.totalReposicionNeto;
  const valorReal = valorRealizacion(base, m.deducciones);
  const valorConcluido = m.enfoqueConclusion === 'mercado' ? base : c.totalReposicionNeto;

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-primary">Vista previa</div>
          <h2 className="text-xl font-semibold">Resumen ejecutivo</h2>
          <p className="text-sm text-muted-foreground">Antes de generar el documento INMOVAL completo.</p>
        </div>
        <Button asChild><Link to={`/avaluos/${avaluo.id}/preview`}><Eye className="h-4 w-4 mr-1" />Ver documento INMOVAL</Link></Button>
      </header>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Solicitante</div>
          <div className="font-medium mt-1">{cli?.nombre || '—'}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Perito firmante</div>
          <div className="font-medium mt-1">{per?.nombre || '—'}</div>
          <div className="text-xs text-muted-foreground">NIPEV: {per?.registroSIBOIF || per?.registro || '—'}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Expediente</div>
          <div className="font-medium mt-1 mono">{avaluo.info.numeroExpediente || '—'}</div>
        </Card>
      </div>

      <div className="grid md:grid-cols-4 gap-3">
        <Card className="p-4"><div className="text-xs text-muted-foreground">Valor terreno</div><div className="text-lg mono">{fmtMoney(c.totalTerrenos)}</div></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground">VNO infraestructuras</div><div className="text-lg mono">{fmtMoney(c.totalVNO)}</div></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground">Valor de mercado</div><div className="text-lg mono">{fmtMoney(valorMercado)}</div></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground">Valor de realización</div><div className="text-lg mono">{fmtMoney(valorReal)}</div></Card>
      </div>

      <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Valor comercial concluido ({m.enfoqueConclusion})</div>
        <div className="text-4xl font-bold mt-2 mono">{fmtMoney(valorConcluido, avaluo.info.moneda)}</div>
        <div className="text-xs text-muted-foreground mt-2">Deducciones realización: {fmtPct((m.deducciones.ir + m.deducciones.ibi + m.deducciones.corretaje + m.deducciones.legales + m.deducciones.comercializacion) / 100)}</div>
      </Card>
    </div>
  );
}
