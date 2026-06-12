export type ConfiguracionCotizacionesINMOVAL = {
  prefijoCotizacion: string;
  servicioPredeterminado: string;
  montoPredeterminado: number;
  monedaPredeterminada: 'US$' | 'C$';
  diasValidez: number;
  requiereAprobacionParaExpediente: boolean;
  actualizadoEn: string;
};

const COTIZACION_CONFIG_KEY = 'inmoval_cotizaciones_config_v1';

export const DEFAULT_CONFIGURACION_COTIZACIONES: ConfiguracionCotizacionesINMOVAL = {
  prefijoCotizacion: 'COT',
  servicioPredeterminado: 'Avalúo de inmueble urbano',
  montoPredeterminado: 350,
  monedaPredeterminada: 'US$',
  diasValidez: 15,
  requiereAprobacionParaExpediente: true,
  actualizadoEn: new Date().toISOString(),
};

export function getConfiguracionCotizacionesINMOVAL(): ConfiguracionCotizacionesINMOVAL {
  if (typeof window === 'undefined') return DEFAULT_CONFIGURACION_COTIZACIONES;

  const raw = window.localStorage.getItem(COTIZACION_CONFIG_KEY);

  if (!raw) return DEFAULT_CONFIGURACION_COTIZACIONES;

  try {
    const parsed = JSON.parse(raw) as Partial<ConfiguracionCotizacionesINMOVAL>;

    return {
      ...DEFAULT_CONFIGURACION_COTIZACIONES,
      ...parsed,
    };
  } catch {
    return DEFAULT_CONFIGURACION_COTIZACIONES;
  }
}

export function saveConfiguracionCotizacionesINMOVAL(
  config: ConfiguracionCotizacionesINMOVAL
) {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(
    COTIZACION_CONFIG_KEY,
    JSON.stringify({
      ...config,
      actualizadoEn: new Date().toISOString(),
    })
  );
}

export function resetConfiguracionCotizacionesINMOVAL() {
  saveConfiguracionCotizacionesINMOVAL(DEFAULT_CONFIGURACION_COTIZACIONES);

  return DEFAULT_CONFIGURACION_COTIZACIONES;
}
