import { Link } from 'react-router-dom';
import { Avaluo } from '@/store/types';
import { useStore } from '@/store/avaluoStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { consolidados, fmtMoney } from '@/lib/calculations';
import { Eye } from 'lucide-react';

export function StepPreview({ avaluo }: { avaluo: Avaluo }) {
  const { clientes, peritos } = useStore();
  const cli = clientes.find((c) => c.id === avaluo.clienteId);
  const per = peritos.find((p) => p.id === avaluo.peritoId);
  const c = consolidados(avaluo);

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Paso 8 · Vista previa y consolidados</h2>
          <p className="text-sm text-muted-foreground">Resumen ejecutivo antes de generar el documento completo.</p>
        </div>
        <Button asChild><Link to={`/avaluos/${avaluo.id}/preview`}><Eye className="h-4 w-4 mr-1" />Ver documento</Link></Button>
      </header>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Cliente</div>
          <div className="font-medium mt-1">{cli?.nombre || '—'}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Perito firmante</div>
          <div className="font-medium mt-1">{per?.nombre || '—'}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Expediente</div>
          <div className="font-medium mt-1 mono">{avaluo.info.codigoExpediente || '—'}</div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="font-semibold mb-3">Consolidado de terrenos</div>
        <table className="w-full text-sm">
          <thead><tr className="text-xs uppercase text-muted-foreground border-b border-border">
            <th className="text-left py-2">Terreno</th><th className="text-right">Área</th><th className="text-right">V. unitario</th><th className="text-right">Total</th>
          </tr></thead>
          <tbody className="divide-y divide-border">
            {c.terrenos.map((t) => (
              <tr key={t.id}><td className="py-2">{t.titulo}</td><td className="text-right mono">{t.area} m²</td>
                <td className="text-right mono">{fmtMoney(t.valorUnitario)}</td>
                <td className="text-right mono font-medium">{fmtMoney(t.valorTotal)}</td></tr>
            ))}
            <tr className="bg-muted/30 font-semibold"><td colSpan={3} className="py-2 text-right">Subtotal terrenos</td><td className="text-right mono">{fmtMoney(c.totalTerrenos)}</td></tr>
          </tbody>
        </table>
      </Card>

      <Card className="p-4">
        <div className="font-semibold mb-3">Consolidado de infraestructuras</div>
        <table className="w-full text-sm">
          <thead><tr className="text-xs uppercase text-muted-foreground border-b border-border">
            <th className="text-left py-2">Terreno</th><th className="text-left">Infra</th><th className="text-right">Reposición</th><th className="text-right">Depreciado</th>
          </tr></thead>
          <tbody className="divide-y divide-border">
            {c.infras.map((i) => (
              <tr key={i.infra.id}><td className="py-2">{i.terreno}</td><td>{i.infra.nombre}</td>
                <td className="text-right mono">{fmtMoney(i.costo)}</td>
                <td className="text-right mono font-medium">{fmtMoney(i.depreciado)}</td></tr>
            ))}
            <tr className="bg-muted/30 font-semibold"><td colSpan={3} className="py-2 text-right">Subtotal infraestructuras</td><td className="text-right mono">{fmtMoney(c.totalInfras)}</td></tr>
          </tbody>
        </table>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Valor comercial total</div>
        <div className="text-4xl font-bold mt-2 mono">{fmtMoney(c.total, avaluo.info.moneda)}</div>
      </Card>
    </div>
  );
}
