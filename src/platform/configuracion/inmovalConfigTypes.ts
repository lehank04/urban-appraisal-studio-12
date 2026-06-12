import { ConfiguracionLocalINMOVAL } from '@/shared/types/inmovalCore';

export type ModoOperacionINMOVAL = 'local' | 'servidor' | 'hibrido';

export type EstadoConexionINMOVAL =
  | 'sin_configurar'
  | 'conectado'
  | 'desconectado'
  | 'error';

export type ConfiguracionServidorINMOVAL = {
  modo: ModoOperacionINMOVAL;
  apiUrl?: string;
  estadoConexion: EstadoConexionINMOVAL;
  ultimoChequeo?: string;
};

export type ConfiguracionGoogleDriveINMOVAL = {
  habilitado: boolean;
  estadoConexion: EstadoConexionINMOVAL;
  rootFolderId?: string;
  rootFolderUrl?: string;
  carpetaExpedientesId?: string;
  carpetaComparablesId?: string;
  carpetaInspeccionesId?: string;
  carpetaModulosId?: string;
  ultimoSync?: string;
};

export type PreferenciasPlataformaINMOVAL = {
  tema: 'oscuro' | 'claro' | 'sistema';
  monedaDefault: 'US$' | 'C$';
  diasVigenciaCotizacion: number;
  diasVigenciaComparable: number;
  mostrarModuloSoloSiInstalado: boolean;
};

export type ConfiguracionPlataformaINMOVAL = {
  version: string;
  local: ConfiguracionLocalINMOVAL;
  servidor: ConfiguracionServidorINMOVAL;
  googleDrive: ConfiguracionGoogleDriveINMOVAL;
  preferencias: PreferenciasPlataformaINMOVAL;
  actualizadoEn: string;
};
