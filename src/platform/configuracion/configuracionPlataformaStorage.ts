export type ModoOperacionPlataformaINMOVAL = 'local' | 'hibrido' | 'servidor';

export type EstadoConexionPlataformaINMOVAL =
  | 'no_configurado'
  | 'pendiente'
  | 'conectado'
  | 'error';

export type ConfiguracionPlataformaLocalINMOVAL = {
  modoOperacion: ModoOperacionPlataformaINMOVAL;

  servidorEstado: EstadoConexionPlataformaINMOVAL;
  servidorUrl?: string;

  driveEstado: EstadoConexionPlataformaINMOVAL;
  driveCarpetaRaiz?: string;
  driveCarpetaExpedientes?: string;
  driveCarpetaComparables?: string;
  driveCarpetaRespaldos?: string;

  prefijoExpediente: string;
  monedaPrincipal: 'US$' | 'C$';
  diasValidezCotizacion: number;

  actualizadoEn: string;
};

const CONFIG_KEY = 'inmoval_platform_config_v1';

export const DEFAULT_CONFIGURACION_PLATAFORMA: ConfiguracionPlataformaLocalINMOVAL = {
  modoOperacion: 'hibrido',

  servidorEstado: 'no_configurado',
  servidorUrl: '',

  driveEstado: 'no_configurado',
  driveCarpetaRaiz: 'INMOVAL',
  driveCarpetaExpedientes: 'INMOVAL/Expedientes',
  driveCarpetaComparables: 'INMOVAL/Comparables',
  driveCarpetaRespaldos: 'INMOVAL/Respaldos',

  prefijoExpediente: 'EXP',
  monedaPrincipal: 'US$',
  diasValidezCotizacion: 15,

  actualizadoEn: new Date().toISOString(),
};

export function getConfiguracionPlataformaINMOVAL(): ConfiguracionPlataformaLocalINMOVAL {
  if (typeof window === 'undefined') return DEFAULT_CONFIGURACION_PLATAFORMA;

  const raw = window.localStorage.getItem(CONFIG_KEY);

  if (!raw) return DEFAULT_CONFIGURACION_PLATAFORMA;

  try {
    const parsed = JSON.parse(raw) as Partial<ConfiguracionPlataformaLocalINMOVAL>;

    return {
      ...DEFAULT_CONFIGURACION_PLATAFORMA,
      ...parsed,
    };
  } catch {
    return DEFAULT_CONFIGURACION_PLATAFORMA;
  }
}

export function saveConfiguracionPlataformaINMOVAL(
  config: ConfiguracionPlataformaLocalINMOVAL
) {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(
    CONFIG_KEY,
    JSON.stringify({
      ...config,
      actualizadoEn: new Date().toISOString(),
    })
  );
}

export function resetConfiguracionPlataformaINMOVAL() {
  saveConfiguracionPlataformaINMOVAL(DEFAULT_CONFIGURACION_PLATAFORMA);

  return DEFAULT_CONFIGURACION_PLATAFORMA;
}
