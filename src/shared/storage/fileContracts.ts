import {
    InmovalFileExtension,
    InmovalFileKind,
  } from '@/shared/types/inmovalCore';
  
  export const INMOVAL_FILE_EXTENSIONS: Record<
    InmovalFileKind,
    InmovalFileExtension
  > = {
    inmoval_expediente: '.imv',
    inmoval_comparable: '.imc',
    inmoval_inspeccion_urbana: '.imins',
    inmoval_modulo_tecnico: '.immod',
  };
  
  export const INMOVAL_FILE_LABELS: Record<InmovalFileKind, string> = {
    inmoval_expediente: 'Expediente INMOVAL',
    inmoval_comparable: 'Comparable INMOVAL',
    inmoval_inspeccion_urbana: 'Inspección de campo INMOVAL',
    inmoval_modulo_tecnico: 'Módulo técnico INMOVAL',
  };
  
  export function sanitizeFileName(value: string) {
    return value
      .trim()
      .replace(/[\\/:*?"<>|]/g, '-')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toUpperCase();
  }
  
  export function buildInmovalFileName(params: {
    tipoArchivo: InmovalFileKind;
    codigo: string;
    fecha?: string;
  }) {
    const ext = INMOVAL_FILE_EXTENSIONS[params.tipoArchivo];
    const fecha = params.fecha || new Date().toISOString().slice(0, 10);
    const codigo = sanitizeFileName(params.codigo || 'SIN-CODIGO');
  
    return `${codigo}-${fecha}${ext}`;
  }
  
  export function isInmovalFileExtension(
    fileName: string,
    ext: InmovalFileExtension
  ) {
    return fileName.toLowerCase().endsWith(ext);
  }
  
  export function downloadTextFile(params: {
    fileName: string;
    content: string;
    mimeType?: string;
  }) {
    const blob = new Blob([params.content], {
      type: params.mimeType || 'application/json;charset=utf-8',
    });
  
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
  
    a.href = url;
    a.download = params.fileName;
    document.body.appendChild(a);
    a.click();
  
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  export async function readTextFile(file: File) {
    return await file.text();
  }
  
  export function safeJsonParse<T>(value: string): {
    ok: true;
    data: T;
  } | {
    ok: false;
    error: string;
  } {
    try {
      return {
        ok: true,
        data: JSON.parse(value) as T,
      };
    } catch (error) {
      return {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'No se pudo leer el archivo JSON.',
      };
    }
  }