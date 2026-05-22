import { Link } from 'react-router-dom';
import { useStore } from '@/store/avaluoStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, Eye, Edit } from 'lucide-react';
import { consolidados, fmtMoney } from '@/lib/calculations';
import { Badge } from '@/components/ui/badge';

export default function AvaluosList() {
  const { avaluos, peritos, clientes, deleteAvaluo } = useStore();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Avalúos</h1>
          <p className="text-sm text-muted-foreground">{avaluos.length} expediente(s)</p>
        </div>
        <Button asChild><Link to="/avaluos/nuevo"><Plus className="h-4 w-4 mr-1" />Nuevo</Link></Button>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left p-3">Código</th>
              <th className="text-left p-3">Propietario</th>
              <th className="text-left p-3">Cliente</th>
              <th className="text-left p-3">Perito</th>
              <th className="text-left p-3">Estado</th>
              <th className="text-right p-3">Valor</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {avaluos.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Sin avalúos</td></tr>
            )}
            {avaluos.map((a) => {
              const cli = clientes.find((c) => c.id === a.clienteId);
              const per = peritos.find((p) => p.id === a.peritoId);
              const c = consolidados(a);
              return (
                <tr key={a.id} className="hover:bg-muted/20">
                  <td className="p-3 mono text-xs">{a.info.numeroExpediente || a.id.slice(0, 8)}</td>
                  <td className="p-3">{a.info.propietario || '—'}</td>
                  <td className="p-3">{cli?.nombre || '—'}</td>
                  <td className="p-3">{per?.nombre || '—'}</td>
                  <td className="p-3"><Badge variant="outline">{a.estado}</Badge></td>
                  <td className="p-3 text-right font-medium">{fmtMoney(c.totalReposicionNeto, a.info.moneda)}</td>

                  <td className="p-3 text-right">
                    <div className="flex gap-1 justify-end">
                      <Button size="icon" variant="ghost" asChild><Link to={`/avaluos/${a.id}/preview`}><Eye className="h-4 w-4" /></Link></Button>
                      <Button size="icon" variant="ghost" asChild><Link to={`/avaluos/${a.id}`}><Edit className="h-4 w-4" /></Link></Button>
                      <Button size="icon" variant="ghost" onClick={() => confirm('¿Eliminar?') && deleteAvaluo(a.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
