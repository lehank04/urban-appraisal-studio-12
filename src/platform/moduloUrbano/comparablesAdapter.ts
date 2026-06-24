// Adaptador entre la Biblioteca de comparables INMOVAL existente
// (`inmoval_comparables_indice_v1`) y el módulo urbano (F2A).
//
// No crea storage nuevo: reutiliza `getComparablesIndiceINMOVAL`.
// Expone helpers para listar/filtrar/snapshot conforme a los filtros
// persistidos en `comparablesBloque.filtros` del módulo urbano.

import {
  getComparablesIndiceINMOVAL,
  type ComparableIndiceINMOVAL,
} from '../comparables/comparableStorage';
import type {
  ComparableSnapshot,
  FiltrosComparablesUrbano,
} from './moduloUrbanoTypes';

export type ComparableDisponible = ComparableIndiceINMOVAL;

export function listarComparablesParaModuloUrbano(): ComparableDisponible[] {
  // Sólo activos por defecto: los congelados/archivados también se devuelven
  // para permitir al perito reusarlos como referencia, pero quedan al final.
  const all = getComparablesIndiceINMOVAL();
  return [...all].sort((a, b) => {
    const ra = a.estado === 'activo' ? 0 : 1;
    const rb = b.estado === 'activo' ? 0 : 1;
    if (ra !== rb) return ra - rb;
    return (b.actualizadoEn || '').localeCompare(a.actualizadoEn || '');
  });
}

function txtMatch(haystack: string | undefined, needle: string): boolean {
  if (!needle.trim()) return true;
  return String(haystack ?? '').toLowerCase().includes(needle.trim().toLowerCase());
}

function inRange(v: number | undefined, min: number | null, max: number | null): boolean {
  if (min == null && max == null) return true;
  if (v == null || !Number.isFinite(v)) return false;
  if (min != null && v < min) return false;
  if (max != null && v > max) return false;
  return true;
}

function inDateRange(v: string | undefined, desde: string, hasta: string): boolean {
  if (!desde && !hasta) return true;
  if (!v) return false;
  if (desde && v < desde) return false;
  if (hasta && v > hasta) return false;
  return true;
}

export function filtrarComparablesParaModuloUrbano(
  comparables: ComparableDisponible[],
  filtros: FiltrosComparablesUrbano,
): ComparableDisponible[] {
  return comparables.filter((c) => {
    if (!txtMatch(c.municipio, filtros.municipio)) return false;
    if (filtros.zona && !(txtMatch(c.barrio, filtros.zona) || txtMatch(c.ubicacion, filtros.zona))) return false;
    if (!txtMatch(c.tipo, filtros.tipoInmueble)) return false;
    if (filtros.uso && !txtMatch(c.aplicaMercado, filtros.uso)) return false;
    if (!txtMatch(c.fuente, filtros.fuente)) return false;
    if (filtros.estado && c.estado !== filtros.estado) return false;
    if (!inRange(c.areaTerreno, filtros.areaMin, filtros.areaMax)) return false;
    if (!inRange(c.areaConstruccion, null, null)) return false; // ya no se filtra aquí
    if (!inRange(c.precio, filtros.precioMin, filtros.precioMax)) return false;
    if (!inDateRange(c.fecha, filtros.fechaDesde, filtros.fechaHasta)) return false;
    // Vía de acceso / servicios / topografía no existen en el índice actual,
    // se ignoran silenciosamente hasta que la base los soporte.
    return true;
  });
}

export function crearSnapshotComparable(
  comparable: ComparableDisponible,
): ComparableSnapshot {
  return {
    id: `snap_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    comparableId: comparable.id,
    fechaSnapshot: new Date().toISOString(),
    payload: JSON.parse(JSON.stringify(comparable)) as Record<string, unknown>,
  };
}

export function resumenComparable(c: ComparableDisponible): string {
  const partes: string[] = [];
  partes.push(c.codigo || c.id.slice(-6));
  if (c.titulo) partes.push(c.titulo);
  return partes.join(' · ');
}
