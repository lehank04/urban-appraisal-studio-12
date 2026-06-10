import { Link } from 'react-router-dom';
import { useStore } from '@/store/avaluoStore';
import { Avaluo } from '@/store/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, FileBadge, Plus, UserCog } from 'lucide-react';
import { PLANTILLAS } from '@/templates/plantillas';

export function StepPerito({ avaluo }: { avaluo: Avaluo }) {
  const { peritos, updateAvaluo } = useStore();

  const peritoActual = peritos.find((p) => p.id === avaluo.peritoId);

  const seleccionarPerito = (peritoId: string) => {
    updateAvaluo(avaluo.id, { peritoId });
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <header>
        <h2 className="text-xl font-semibold">Paso 1 · Perito firmante</h2>
        <p className="text-sm text-muted-foreground">
          Selecciona el perito responsable del avalúo. La plantilla documental se define desde la ficha del perito.
        </p>
      </header>

      {peritos.length === 0 ? (
        <Card className="p-8 border-dashed">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="h-12 w-12 rounded-full bg-muted grid place-items-center">
              <UserCog className="h-6 w-6 text-muted-foreground" />
            </div>

            <div>
              <h3 className="font-semibold">No hay peritos registrados</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                Para iniciar un avalúo debes registrar primero al perito firmante con sus datos profesionales,
                NIPEV/licencia, contacto y plantilla documental.
              </p>
            </div>

            <Button asChild>
              <Link to="/peritos">
                <Plus className="h-4 w-4 mr-1" />
                Registrar perito
              </Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {peritos.map((perito) => {
            const selected = peritoActual?.id === perito.id;
            const plantilla = PLANTILLAS[perito.plantilla];

            return (
              <Card
                key={perito.id}
                onClick={() => seleccionarPerito(perito.id)}
                className={`p-5 cursor-pointer transition-all relative ${
                  selected
                    ? 'border-primary ring-2 ring-primary/30'
                    : 'hover:border-primary/40'
                }`}
              >
                {selected && (
                  <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-primary text-primary-foreground grid place-items-center">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                )}

                <div
                  className="h-10 w-10 rounded-md grid place-items-center mb-3"
                  style={{ background: plantilla.color }}
                >
                  <FileBadge className="h-5 w-5 text-white" />
                </div>

                <div className="font-semibold pr-8">{perito.nombre}</div>

                <div className="text-xs text-muted-foreground mt-1">
                  {perito.cargo || 'Perito firmante'}
                </div>

                <dl className="mt-3 grid grid-cols-[5.5rem_1fr] gap-y-1 text-xs">
                  {perito.cedula && (
                    <>
                      <dt className="text-muted-foreground">Cédula/RUC</dt>
                      <dd className="font-mono truncate">{perito.cedula}</dd>
                    </>
                  )}

                  {(perito.registroSIBOIF || perito.registro) && (
                    <>
                      <dt className="text-muted-foreground">NIPEV</dt>
                      <dd className="font-mono truncate">
                        {perito.registroSIBOIF || perito.registro}
                      </dd>
                    </>
                  )}

                  {perito.empresa && (
                    <>
                      <dt className="text-muted-foreground">Empresa</dt>
                      <dd className="truncate">{perito.empresa}</dd>
                    </>
                  )}
                </dl>

                <div className="mt-4 pt-3 border-t border-border text-[10px] uppercase tracking-wider text-muted-foreground">
                  {plantilla.nombre} · {plantilla.capitulos.length} capítulos
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {peritoActual && (
        <Card className="p-4 bg-primary/5 border-primary/30">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
            Perito seleccionado
          </div>

          <div className="font-medium">
            {peritoActual.nombre}
          </div>

          <div className="text-xs text-muted-foreground mt-1">
            Plantilla: {PLANTILLAS[peritoActual.plantilla].nombre}
            {(peritoActual.registroSIBOIF || peritoActual.registro) && (
              <> · NIPEV: {peritoActual.registroSIBOIF || peritoActual.registro}</>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}