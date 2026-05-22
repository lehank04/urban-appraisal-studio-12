import { Link } from 'react-router-dom';
import { useStore } from '@/store/avaluoStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Users, UserCog, Plus, TrendingUp } from 'lucide-react';
import { consolidados, fmtMoney } from '@/lib/calculations';

export default function Dashboard() {
  const { avaluos, clientes, peritos } = useStore();
  const totalValor = avaluos.reduce((a, av) => a + consolidados(av).totalReposicionNeto, 0);

  const stats = [
    { label: 'Avalúos', value: avaluos.length, icon: FileText },
    { label: 'Clientes', value: clientes.length, icon: Users },
    { label: 'Peritos', value: peritos.length, icon: UserCog },
    { label: 'Valor consolidado', value: fmtMoney(totalValor), icon: TrendingUp },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Panel de control</h1>
          <p className="text-sm text-muted-foreground">Resumen operativo del sistema de avalúos</p>
        </div>
        <Button asChild><Link to="/avaluos/nuevo"><Plus className="h-4 w-4 mr-1" />Nuevo avalúo</Link></Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-border/60">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
                  <div className="text-2xl font-semibold mt-1">{s.value}</div>
                </div>
                <s.icon className="h-5 w-5 text-primary" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Avalúos recientes</CardTitle></CardHeader>
        <CardContent>
          {avaluos.length === 0 ? (
            <div className="text-sm text-muted-foreground py-8 text-center">
              No hay avalúos. <Link to="/avaluos/nuevo" className="text-primary underline">Crea el primero</Link>.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {avaluos.slice(0, 8).map((a) => {
                const c = consolidados(a);
                return (
                  <Link to={`/avaluos/${a.id}`} key={a.id} className="flex items-center justify-between py-3 hover:bg-muted/30 px-2 rounded">
                    <div>
                      <div className="font-medium text-sm">{a.info.numeroExpediente || 'Sin código'} · {a.info.propietario || 'Sin propietario'}</div>
                      <div className="text-xs text-muted-foreground mono">{a.id.slice(0, 8)} · {a.estado}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{fmtMoney(c.totalReposicionNeto, a.info.moneda)}</div>
                      <div className="text-xs text-muted-foreground">{a.terrenos.length} terreno(s)</div>
                    </div>
                  </Link>
                );
              })}

            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
