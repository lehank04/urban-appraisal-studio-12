import { ExpedienteINMOVAL, expedientePuedeCerrarse } from './expedienteTypes';
import { ConfiguracionExpedientesINMOVAL } from './expedienteConfigStorage';

export function expedientePuedeCerrarseConConfiguracion(
  expediente: ExpedienteINMOVAL,
  config: ConfiguracionExpedientesINMOVAL
) {
  if (config.requierePagoYFacturaParaCerrar) {
    return expedientePuedeCerrarse(expediente);
  }

  return true;
}

export function getMensajeReglaCierreExpediente(
  config: ConfiguracionExpedientesINMOVAL
) {
  if (config.requierePagoYFacturaParaCerrar) {
    return 'Para cerrar el expediente se requiere pago total y factura emitida.';
  }

  return 'La regla estricta de pago total y factura está desactivada.';
}
