// ============================================================
// MOTOR DE CÁLCULO INMOVAL
// - Conversión m² <-> vr² (factor INETER 1.418415)
// - Homologación factor por factor (sujeto/comparable)
// - Promedio factor de negociación
// - Ross-Heidecke: D = 1 - (1 - (E/V.U.E)^1.4) * Q
// - Valor de Reposición a Nuevo (VRN) por suma de etapas
// - Valor de Realización con 5 deducciones
// - Consolidados terrenos + infraestructuras
// ============================================================

import {
  Avaluo, Infraestructura, Terreno, CostoEtapa,
  ComparableInmueble, ComparableTerreno,
  FichaSujetoInmueble, FichaSujetoTerreno,
  DeduccionesRealizacion,
} from '@/store/types';
import {
  TABLA_UBICACION, TABLA_ZONA, TABLA_VIA, TABLA_SERVICIOS,
  TABLA_EQUIPAMIENTO, TABLA_TOPOGRAFIA, TABLA_POSICION,
  COEF_AMBIENTES, rangoPorDias, factorQ, findOpcion,
  FACTOR_CONVERSION_M2_VR2,
} from './catalogos';

// -------------------- FORMATEO --------------------

export const fmtMoney = (n: number, moneda = 'US$') => {
  const v = isFinite(n) ? n : 0;
  return `${moneda} ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 3 }).format(v)}`;
};
export const fmtNum = (n: number, d = 2) =>
  new Intl.NumberFormat('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }).format(isFinite(n) ? n : 0);
export const fmtPct = (n: number, d = 2) => `${fmtNum(n * 100, d)}%`;

// -------------------- CONVERSIONES --------------------

export const m2ToVr2 = (m2: number) => m2 * FACTOR_CONVERSION_M2_VR2;
export const vr2ToM2 = (vr2: number) => vr2 / FACTOR_CONVERSION_M2_VR2;

// -------------------- HOMOLOGACIÓN: FACTORES INDIVIDUALES --------------------

/** Factor por tabla cualitativa: sujeto/comparable */
const factorTabla = (tabla: typeof TABLA_UBICACION, sKey: string, cKey: string) => {
  const s = findOpcion(tabla, sKey).calificacion;
  const c = findOpcion(tabla, cKey).calificacion;
  return c === 0 ? 1 : s / c;
};

/** Factor superficie de TERRENO: (Ac/As)^0.10 — inverso a tamaño */
export const factorSuperficieTerreno = (areaSujeto: number, areaComp: number) => {
  if (!areaSujeto || !areaComp) return 1;
  return Math.pow(areaComp / areaSujeto, 0.10);
};

/** Factor superficie de CONSTRUCCIÓN: (As/Ac)^0.10 */
export const factorSuperficieConstruccion = (areaSujeto: number, areaComp: number) => {
  if (!areaSujeto || !areaComp) return 1;
  return Math.pow(areaSujeto / areaComp, 0.10);
};

/** Factor cuantitativo por cantidad de ambientes: 1 + (sujeto - comp) * coef */
const factorAmbiente = (sujeto: number, comp: number, coef: number) =>
  1 + (sujeto - comp) * coef;

// -------------------- HOMOLOGACIÓN INMUEBLE --------------------

export interface FactoresInmueble {
  areaConst: number;
  areaTerreno: number;
  ubicacion: number;
  zona: number;
  via: number;
  dormitorios: number;
  banos: number;
  banoMedio: number;
  cuartoBanoServicio: number;
  total: number;
}

export const calcFactoresInmueble = (
  s: FichaSujetoInmueble, c: ComparableInmueble
): FactoresInmueble => {
  const f: FactoresInmueble = {
    areaConst: factorSuperficieConstruccion(s.areaConstruccionM2, c.areaConstruccionM2),
    areaTerreno: factorSuperficieTerreno(s.areaTerrenoM2, c.areaTerrenoM2),
    ubicacion: factorTabla(TABLA_UBICACION, s.ubicacionKey, c.ubicacionKey),
    zona: factorTabla(TABLA_ZONA, s.zonaKey, c.zonaKey),
    via: factorTabla(TABLA_VIA, s.viaAccesoKey, c.viaAccesoKey),
    dormitorios: factorAmbiente(s.dormitorios, c.dormitorios, COEF_AMBIENTES.dormitorio),
    banos: factorAmbiente(s.banosCompletos, c.banosCompletos, COEF_AMBIENTES.banoCompleto),
    banoMedio: factorAmbiente(s.banoMedio, c.banoMedio, COEF_AMBIENTES.banoMedio),
    cuartoBanoServicio: factorAmbiente(s.cuartoBanoServicio, c.cuartoBanoServicio, COEF_AMBIENTES.cuartoBanoServicio),
    total: 1,
  };
  f.total = f.areaConst * f.areaTerreno * f.ubicacion * f.zona * f.via *
            f.dormitorios * f.banos * f.banoMedio * f.cuartoBanoServicio;
  return f;
};

// -------------------- HOMOLOGACIÓN TERRENO --------------------

export interface FactoresTerreno {
  areaTerreno: number;
  ubicacion: number;
  zona: number;
  via: number;
  servicios: number;
  equipamiento: number;
  topografia: number;
  posicion: number;
  total: number;
}

export const calcFactoresTerreno = (
  s: FichaSujetoTerreno, c: ComparableTerreno
): FactoresTerreno => {
  const f: FactoresTerreno = {
    areaTerreno: factorSuperficieTerreno(s.areaTerrenoVr2, c.areaTerrenoVr2),
    ubicacion: factorTabla(TABLA_UBICACION, s.ubicacionKey, c.ubicacionKey),
    zona: factorTabla(TABLA_ZONA, s.zonaKey, c.zonaKey),
    via: factorTabla(TABLA_VIA, s.viaAccesoKey, c.viaAccesoKey),
    servicios: factorTabla(TABLA_SERVICIOS, s.serviciosKey, c.serviciosKey),
    equipamiento: factorTabla(TABLA_EQUIPAMIENTO, s.equipamientoKey, c.equipamientoKey),
    topografia: factorTabla(TABLA_TOPOGRAFIA, s.topografiaKey, c.topografiaKey),
    posicion: factorTabla(TABLA_POSICION, s.posicionManzanaKey, c.posicionManzanaKey),
    total: 1,
  };
  f.total = f.areaTerreno * f.ubicacion * f.zona * f.via * f.servicios *
            f.equipamiento * f.topografia * f.posicion;
  return f;
};

// -------------------- NEGOCIACIÓN --------------------

export const promedioNegociacion = (dias: number[]) => {
  if (!dias.length) return 1;
  const sum = dias.reduce((a, d) => a + rangoPorDias(d).factor, 0);
  return sum / dias.length;
};

// -------------------- VALOR DE MERCADO (INMUEBLE) --------------------

export interface FilaHomologacionInmueble {
  comparable: ComparableInmueble;
  precioVentaAjustado: number;     // precio * promedio_negociacion
  precioM2: number;                // precio_ajustado / area_construccion
  factores: FactoresInmueble;
  valorM2Homologado: number;       // precioM2 * factor_total
}

export const homologacionInmueble = (
  sujeto: FichaSujetoInmueble, comps: ComparableInmueble[]
) => {
  const promNeg = promedioNegociacion(comps.map((c) => c.diasAntiguedad));
  const filas: FilaHomologacionInmueble[] = comps.map((c) => {
    const factores = calcFactoresInmueble(sujeto, c);
    const precioAjustado = c.precioVentaUSD * promNeg;
    const precioM2 = c.areaConstruccionM2 > 0 ? precioAjustado / c.areaConstruccionM2 : 0;
    const valorM2Homologado = precioM2 * factores.total;
    return { comparable: c, precioVentaAjustado: precioAjustado, precioM2, factores, valorM2Homologado };
  });
  const valoresHom = filas.map((f) => f.valorM2Homologado).filter((v) => isFinite(v) && v > 0);
  const valorM2Promedio = valoresHom.length ? valoresHom.reduce((a, b) => a + b, 0) / valoresHom.length : 0;
  const valorMercado = valorM2Promedio * sujeto.areaConstruccionM2;
  return { filas, promNeg, valorM2Promedio, valorMercado };
};

// -------------------- VALOR DE MERCADO (TERRENO) --------------------

export interface FilaHomologacionTerreno {
  comparable: ComparableTerreno;
  precioVentaAjustado: number;
  precioVr2: number;
  factores: FactoresTerreno;
  valorVr2Homologado: number;
}

export const homologacionTerreno = (
  sujeto: FichaSujetoTerreno, comps: ComparableTerreno[]
) => {
  const promNeg = promedioNegociacion(comps.map((c) => c.diasAntiguedad));
  const filas: FilaHomologacionTerreno[] = comps.map((c) => {
    const factores = calcFactoresTerreno(sujeto, c);
    const precioAjustado = c.precioVentaUSD * promNeg;
    const precioVr2 = c.areaTerrenoVr2 > 0 ? precioAjustado / c.areaTerrenoVr2 : 0;
    const valorVr2Homologado = precioVr2 * factores.total;
    return { comparable: c, precioVentaAjustado: precioAjustado, precioVr2, factores, valorVr2Homologado };
  });
  const valoresHom = filas.map((f) => f.valorVr2Homologado).filter((v) => isFinite(v) && v > 0);
  const valorVr2Promedio = valoresHom.length ? valoresHom.reduce((a, b) => a + b, 0) / valoresHom.length : 0;
  const valorMercadoTerreno = valorVr2Promedio * sujeto.areaTerrenoVr2;
  return { filas, promNeg, valorVr2Promedio, valorMercadoTerreno };
};

// -------------------- VALOR DE REALIZACIÓN --------------------

export const totalDeducciones = (d: DeduccionesRealizacion) =>
  (d.ir + d.ibi + d.corretaje + d.legales + d.comercializacion) / 100;

export const valorRealizacion = (valorMercado: number, d: DeduccionesRealizacion) =>
  valorMercado * (1 - totalDeducciones(d));

export const deduccionesDetalle = (valorMercado: number, d: DeduccionesRealizacion) => [
  { concepto: 'IR (Ganancia de Capital)', pct: d.ir, valor: valorMercado * d.ir / 100 },
  { concepto: 'IBI (Impuesto de Bienes Inmuebles)', pct: d.ibi, valor: valorMercado * d.ibi / 100 },
  { concepto: 'Comisión por Corretaje', pct: d.corretaje, valor: valorMercado * d.corretaje / 100 },
  { concepto: 'Gastos legales y de cierre', pct: d.legales, valor: valorMercado * d.legales / 100 },
  { concepto: 'Factor de comercialización', pct: d.comercializacion, valor: valorMercado * d.comercializacion / 100 },
];

// -------------------- ROSS-HEIDECKE --------------------

/** D = 1 - (1 - (E/V.U.E)^1.4) * Q.   Devuelve % depreciación (0..1) */
export const rossHeidecke = (edad: number, vidaUtil: number, fe: number) => {
  if (vidaUtil <= 0) return 0;
  const ratio = Math.min(edad / vidaUtil, 1);
  const Q = factorQ(fe);
  const D = 1 - (1 - Math.pow(ratio, 1.4)) * Q;
  return Math.max(0, Math.min(1, D));
};

// -------------------- COSTOS DE INFRAESTRUCTURA --------------------

export const totalEtapa = (e: CostoEtapa) => e.cantidad * e.costoUnitario;

export const totalesCostos = (infra: Infraestructura) => {
  const directos = infra.costos.filter((c) => c.grupo === 'directos').reduce((a, c) => a + totalEtapa(c), 0);
  const indirectos = infra.costos.filter((c) => c.grupo === 'indirectos').reduce((a, c) => a + totalEtapa(c), 0);
  const impuestos = infra.costos.filter((c) => c.grupo === 'impuestos').reduce((a, c) => a + totalEtapa(c), 0);
  const vrn = directos + indirectos + impuestos;
  const costoUnitarioM2 = infra.areaTotalM2 > 0 ? vrn / infra.areaTotalM2 : 0;
  return { directos, indirectos, impuestos, vrn, costoUnitarioM2 };
};

export const valorNetoInfra = (infra: Infraestructura) => {
  const { vrn } = totalesCostos(infra);
  const dep = rossHeidecke(infra.edadAnios, infra.vidaUtilAnios, infra.estadoFE);
  return { vrn, depPct: dep, depAcumulada: vrn * dep, vno: vrn * (1 - dep) };
};

// -------------------- CONSOLIDADO POR AVALÚO --------------------

export interface FilaConsolidadoInfra {
  terrenoId: string;
  terreno: string;
  infra: Infraestructura;
  vrn: number;
  depPct: number;
  depAcumulada: number;
  vno: number;
  costo: number;
  depreciado: number;
}

export const consolidados = (av: Avaluo) => {
  const terrenos = av.terrenos.map((t) => {
    const areaVr2 = t.areaLevantamientoVr2 || t.areaCatastralVr2 || t.areaEscrituraVr2;
    const area = t.area ?? areaVr2;
    const valorUnit = t.valorUnitario ?? t.valorUnitarioVr2;
    const valorTotal = area * valorUnit;
    return { id: t.id, titulo: t.titulo, area, areaVr2, valorUnitario: valorUnit, valorTotal };
  });
  const totalTerrenos = terrenos.reduce((a, t) => a + t.valorTotal, 0);

  const infras: FilaConsolidadoInfra[] = [];
  av.terrenos.forEach((t) => {
    t.infraestructuras.forEach((i) => {
      const v = valorNetoInfra(i);
      const d = depreciacion(i);
      infras.push({
        terrenoId: t.id, terreno: t.titulo, infra: i,
        ...v, costo: d.costo, depreciado: d.depreciado,
      });
    });
  });
  const totalVRN = infras.reduce((a, i) => a + i.vrn, 0);
  const totalDepreciacion = infras.reduce((a, i) => a + i.depAcumulada, 0);
  const totalVNO = infras.reduce((a, i) => a + i.vno, 0);
  const totalInfras = infras.reduce((a, i) => a + i.depreciado, 0);
  const total = totalTerrenos + totalInfras;

  return {
    terrenos, totalTerrenos,
    infras,
    totalVRN, totalDepreciacion, totalVNO,
    totalReposicionNuevo: totalTerrenos + totalVRN,
    totalReposicionNeto: totalTerrenos + totalVNO,
    totalInfras, total,
  };
};

// helper para mostrar % entero (e.g. 21%)
export const pctEntero = (p: number) => `${Math.round(p * 100)}%`;

// -------------------- COMPATIBILIDAD UI PROTOTIPO --------------------

import { Comparable } from '@/store/types';

/** Depreciación legada: usa los alias `costoUnitario`, `area`, `vidaUtil`, `edad` */
export const depreciacion = (i: Infraestructura) => {
  const costo = (i.costoUnitario ?? 0) * (i.area ?? i.areaTotalM2 ?? 0);
  const vu = i.vidaUtil ?? i.vidaUtilAnios ?? 0;
  const ed = i.edad ?? i.edadAnios ?? 0;
  const factor = vu > 0 ? Math.min(ed / vu, 1) : 0;
  const depreciado = costo * (1 - factor);
  return { costo, factor, depreciado };
};

export const valorTerreno = (t: { area?: number; valorUnitario?: number; areaLevantamientoVr2?: number; valorUnitarioVr2?: number }) => {
  const area = t.area ?? t.areaLevantamientoVr2 ?? 0;
  const vu = t.valorUnitario ?? t.valorUnitarioVr2 ?? 0;
  return area * vu;
};

export const valorComparable = (c: Comparable) => {
  const factor = c.factores.filter((f) => f.active).reduce((a, f) => a * (f.value || 1), 1);
  const ajustado = c.precio * factor;
  const unitario = c.area > 0 ? ajustado / c.area : 0;
  return { factor, ajustado, unitario };
};

export const promedioUnitarioComparables = (comps: Comparable[]) => {
  const vs = comps.map((c) => valorComparable(c).unitario).filter((v) => v > 0);
  return vs.length ? vs.reduce((a, b) => a + b, 0) / vs.length : 0;
};
