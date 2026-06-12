import {
  EstadoExpedienteINMOVAL,
} from '@/shared/types/inmovalCore';
import {
  MonedaINMOVAL,
  PrioridadExpedienteINMOVAL,
} from './expedienteTypes';

export type ConfiguracionExpedientesINMOVAL = {
  prefijoExpediente: string;
  estadoInicial: EstadoExpedienteINMOVAL;
  prioridadPredeterminada: PrioridadExpedienteINMOVAL;
  monedaPredeterminada: MonedaINMOVAL;
  diasEntregaEstimados: number;
  requierePagoYFacturaParaCerrar: boolean;
  mostrarSincronizacionLegacy: boolean;
  actualizadoEn: string;
};

const EXPEDIENTE_CONFIG_KEY = 'inmoval_expedientes_config_v1';

export const DEFAULT_CONFIGURACION_EXPEDIENTES: ConfiguracionExpedientesINMOVAL = {
  prefijoExpediente: 'EXP',
  estadoInicial: 'en_cotizacion',
  prioridadPredeterminada: 'normal',
  monedaPredeterminada: 'US$',
  diasEntregaEstimados: 7,
  requierePagoYFacturaParaCerrar: true,
  mostrarSincronizacionLegacy: true,
  actualizadoEn: new Date().toISOString(),
};

export function getConfiguracionExpedientesINMOVAL(): ConfiguracionExpedientesINMOVAL {
  if (typeof window === 'undefined') return DEFAULT_CONFIGURACION_EXPEDIENTES;

  const raw = window.localStorage.getItem(EXPEDIENTE_CONFIG_KEY);

  if (!raw) return DEFAULT_CONFIGURACION_EXPEDIENTES;

  try {
    const parsed = JSON.parse(raw) as Partial<ConfiguracionExpedientesINMOVAL>;

    return {
      ...DEFAULT_CONFIGURACION_EXPEDIENTES,
      ...parsed,
    };
  } catch {
    return DEFAULT_CONFIGURACION_EXPEDIENTES;
  }
}

export function saveConfiguracionExpedientesINMOVAL(
  config: ConfiguracionExpedientesINMOVAL
) {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(
    EXPEDIENTE_CONFIG_KEY,
    JSON.stringify({
      ...config,
      actualizadoEn: new Date().toISOString(),
    })
  );
}

export function resetConfiguracionExpedientesINMOVAL() {
  saveConfiguracionExpedientesINMOVAL(DEFAULT_CONFIGURACION_EXPEDIENTES);

  return DEFAULT_CONFIGURACION_EXPEDIENTES;
}
