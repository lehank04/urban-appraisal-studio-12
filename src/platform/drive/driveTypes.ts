export type DriveReferenciaINMOVAL = {
  driveFileId?: string;
  driveFolderId?: string;
  driveUrl?: string;
  nombre?: string;
  mimeType?: string;
  actualizadoEn?: string;
};

export type DriveFolderSetINMOVAL = {
  root?: DriveReferenciaINMOVAL;
  expedientes?: DriveReferenciaINMOVAL;
  comparables?: DriveReferenciaINMOVAL;
  inspecciones?: DriveReferenciaINMOVAL;
  modulos?: DriveReferenciaINMOVAL;
};
