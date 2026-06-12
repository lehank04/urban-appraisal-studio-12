export type ServerSyncStatusINMOVAL =
  | 'pendiente'
  | 'sincronizado'
  | 'conflicto'
  | 'error';

export type ServerRecordINMOVAL = {
  id: string;
  tipo: 'expediente' | 'cotizacion' | 'comparable' | 'usuario' | 'configuracion';
  localUpdatedAt: string;
  serverUpdatedAt?: string;
  syncStatus: ServerSyncStatusINMOVAL;
  error?: string;
};
