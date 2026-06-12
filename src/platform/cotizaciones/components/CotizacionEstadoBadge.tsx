import { EstadoCotizacion } from '@/shared/types/inmovalCore';
import {
  getEstadoCotizacionClass,
  getEstadoCotizacionLabel,
} from '../cotizacionUiUtils';

type CotizacionEstadoBadgeProps = {
  estado: EstadoCotizacion;
};

export function CotizacionEstadoBadge({ estado }: CotizacionEstadoBadgeProps) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getEstadoCotizacionClass(estado)}`}>
      {getEstadoCotizacionLabel(estado)}
    </span>
  );
}
