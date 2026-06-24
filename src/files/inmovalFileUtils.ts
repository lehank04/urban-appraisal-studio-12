import {
  InmovalFileExtension,
  InmovalFileKind,
} from '@/shared/types/inmovalCore';
import {
  INMOVAL_FILE_EXTENSIONS,
  INMOVAL_FILE_LABELS,
  safeJsonParse,
} from '@/shared/storage/fileContracts';

export function getInmovalFileKindByExtension(
  fileName: string
): InmovalFileKind | undefined {
  const lowerName = fileName.toLowerCase();

  const entry = Object.entries(INMOVAL_FILE_EXTENSIONS).find(([, ext]) =>
    lowerName.endsWith(ext)
  );

  return entry?.[0] as InmovalFileKind | undefined;
}

export function getInmovalFileExtensionByKind(
  kind: InmovalFileKind
): InmovalFileExtension {
  return INMOVAL_FILE_EXTENSIONS[kind];
}

export function getInmovalFileLabelByKind(kind: InmovalFileKind) {
  return INMOVAL_FILE_LABELS[kind];
}

export function isInmovalFileName(fileName: string) {
  return Boolean(getInmovalFileKindByExtension(fileName));
}

export function parseInmovalJsonFile<T>(content: string) {
  return safeJsonParse<T>(content);
}

export function stringifyInmovalFile(data: unknown) {
  return JSON.stringify(data, null, 2);
}

export function buildInmovalMimeType() {
  return 'application/json;charset=utf-8';
}
'@ | Set-Content -Path "src\files\inmovalFileUtils.ts" -Encoding UTF8