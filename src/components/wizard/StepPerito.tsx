import { Link } from 'react-router-dom';
import { useStore } from '@/store/avaluoStore';
import { Avaluo } from '@/store/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Check,
  FileBadge,
  Plus,
  UserCog,
  AlertTriangle,
} from 'lucide-react';
import { PLANTILLAS } from '@/templates/plantillas';

export function StepPerito({ avaluo }: { avaluo: Avaluo }) {
  const { peritos, updateAvaluo } = useStore();

  const peritoActual = peritos.find((p) => p.id === avaluo.peritoId);
  const plantillaActual = peritoActual
    ? PLANTILLAS[peritoActual.plantilla]
    : null;

  const seleccionarPerito = (peritoId: string) => {
    const perito = peritos.find((p) => p.id === peritoId);

    updateAvaluo(avaluo.id, {
      peritoId,
      info: {
        ...avaluo.info,
        valuadorNombre: perito?.nombre || '',
        valuadorNipev:
          perito?.registroSIBOIF ||
          perito?.registro ||
          '',
      },
    });
  };

  const limpiarPerito = () => {
    updateAvaluo(avaluo.id, {
      peritoId: undefined,
      info: {
        ...avaluo.info,
        valuadorNombre: '',
        valuadorNipev: '',
      },
    });
  };

  return (
    <div className="space-y-5 max-w-5xl">
      <header>
        <div className="text-xs uppercase tracking-widest text-primary">
          Módulo urbano · Avalúo técnico
        </div>
        <h2 className="text-xl font-semibold">
          Perito y plantilla documental
        </h2>
        <p className="text-sm text-muted-foreground">
          Confirma el perito asignado al expediente. La plantilla documental se toma desde la ficha del perito.
        </p>
      </header>

      {peritoActual && plantillaActual && (
        <Card className="p-5 border-primary/30 bg-primary/5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div
                className="h-12 w-12 rounded-lg grid place-items-center text-white shrink-0"
                style={{ background: plantillaActual.color }}
              >
                <FileBadge className="h-6 w-6" />
              </div>

              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  Perito asignado al expediente
                </div>

                <h3 className="text-lg font-semibold mt-1">
                  {peritoActual.nombre}
                </h3>

                <div className="text-sm text-muted-foreground mt-1">
                  {peritoActual.cargo || 'Perito firmante'}
                  {peritoActual.empresa ? ` · ${peritoActual.empresa}` : ''}
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="outline">
                    Plantilla: {plantillaActual.nombre}
                  </Badge>

                  <Badge variant="outline">
                    NIPEV: {peritoActual.registroSIBOIF || peritoActual.registro || '—'}
                  </Badge>

                  {peritoActual.cedula && (
                    <Badge variant="outline">
                      Cédula/RUC: {peritoActual.cedula}
                    </Badge>
                  )}
                </div>

                <div className="text-xs text-muted-foreground mt-3 max-w-2xl">
                  Esta plantilla define identidad visual, textos base, normativa y estructura documental del informe.
                  Más adelante cada módulo podrá tener sus propias plantillas y memorias.
                </div>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={limpiarPerito}>
              Cambiar
            </Button>
          </div>
        </Card>
      )}

      {!peritoActual && (
        <Card className="p-4 border-amber-500/30 bg-amber-500/10">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-700 mt-0.5" />
            <div>
              <div className="font-medium text-amber-800">
                Este expediente no tiene perito asignado
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Puedes continuar capturando información, pero para generar un documento formal conviene asignar un perito y su plantilla documental.
              </div>
            </div>
          </div>
        </Card>
      )}

      {peritos.length === 0 ? (
        <Card className="p-8 border-dashed">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="h-12 w-12 rounded-full bg-muted grid place-items-center">
              <UserCog className="h-6 w-6 text-muted-foreground" />
            </div>

            <div>
              <h3 className="font-semibold">No hay peritos registrados</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                Registra primero un perito firmante con sus datos profesionales, NIPEV/licencia, contacto y plantilla documental.
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
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold">
                {peritoActual ? 'Cambiar perito asignado' : 'Seleccionar perito'}
              </h3>
              <p className="text-xs text-muted-foreground">
                El perito seleccionado actualiza también el valuador y NIPEV en la información general del avalúo.
              </p>
            </div>

            <Button variant="outline" asChild>
              <Link to="/peritos">
                <Plus className="h-4 w-4 mr-1" />
                Gestionar peritos
              </Link>
            </Button>
          </div>

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
                      ? 'border-primary ring-2 ring-primary/30 bg-primary/5'
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

                  <div className="font-semibold pr-8">
                    {perito.nombre}
                  </div>

                  <div className="text-xs text-muted-foreground mt-1">
                    {perito.cargo || 'Perito firmante'}
                    {perito.empresa ? ` · ${perito.empresa}` : ''}
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

                    {perito.email && (
                      <>
                        <dt className="text-muted-foreground">Email</dt>
                        <dd className="truncate">{perito.email}</dd>
                      </>
                    )}

                    {perito.telefono && (
                      <>
                        <dt className="text-muted-foreground">Teléfono</dt>
                        <dd className="truncate">{perito.telefono}</dd>
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
        </div>
      )}
    </div>
  );
}