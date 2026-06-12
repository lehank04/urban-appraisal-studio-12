import {
  EstadoExpedienteINMOVAL,
  EstadoPagoINMOVAL,
} from '@/shared/types/inmovalCore';
import { PrioridadExpedienteINMOVAL } from '../expedienteTypes';
import {
  getEstadoExpedienteClass,
  getEstadoExpedienteLabel,
  getEstadoPagoClass,
  getEstadoPagoLabel,
  getPrioridadClass,
  getPrioridadLabel,
} from '../expedienteUiUtils';

type ExpedienteEstadoBadgeProps =
  | {
      tipo: 'estado';
      value: EstadoExpedienteINMOVAL;
    }
  | {
      tipo: 'prioridad';
      value: PrioridadExpedienteINMOVAL;
    }
  | {
      tipo: 'pago';
      value: EstadoPagoINMOVAL;
    };

export function ExpedienteEstadoBadge(props: ExpedienteEstadoBadgeProps) {
  if (props.tipo === 'estado') {
    return (
      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getEstadoExpedienteClass(props.value)}`}>
        {getEstadoExpedienteLabel(props.value)}
      </span>
    );
  }

  if (props.tipo === 'prioridad') {
    return (
      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getPrioridadClass(props.value)}`}>
        {getPrioridadLabel(props.value)}
      </span>
    );
  }

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getEstadoPagoClass(props.value)}`}>
      {getEstadoPagoLabel(props.value)}
    </span>
  );
}
