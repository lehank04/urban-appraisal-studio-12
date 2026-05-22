import { Avaluo, Infraestructura, Comparable, Terreno } from '@/store/types';

export const fmtMoney = (n: number, moneda = 'COP') =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: moneda, maximumFractionDigits: 0 }).format(n || 0);

export const fmtNum = (n: number, d = 2) =>
  new Intl.NumberFormat('es-CO', { maximumFractionDigits: d }).format(n || 0);

export const depreciacion = (infra: Infraestructura) => {
  const costo = infra.area * infra.costoUnitario;
  const factor = infra.vidaUtil > 0 ? Math.max(0, 1 - infra.edad / infra.vidaUtil) : 1;
  return { costo, depreciado: costo * factor, factor };
};

export const valorTerreno = (t: Terreno) => t.area * t.valorUnitario;

export const valorComparable = (c: Comparable) => {
  const factor = c.factores.filter((f) => f.active).reduce((acc, f) => acc * (f.value || 1), 1);
  const ajustado = c.precio * factor;
  const unitario = c.area > 0 ? ajustado / c.area : 0;
  return { factor, ajustado, unitario };
};

export const promedioUnitarioComparables = (cs: Comparable[]) => {
  if (!cs.length) return 0;
  const sum = cs.reduce((acc, c) => acc + valorComparable(c).unitario, 0);
  return sum / cs.length;
};

export const consolidados = (av: Avaluo) => {
  const terrenos = av.terrenos.map((t) => ({
    id: t.id, titulo: t.titulo, area: t.area,
    valorUnitario: t.valorUnitario, valorTotal: valorTerreno(t),
  }));
  const totalTerrenos = terrenos.reduce((a, t) => a + t.valorTotal, 0);

  const infras: { terrenoId: string; terreno: string; infra: Infraestructura; costo: number; depreciado: number }[] = [];
  av.terrenos.forEach((t) => {
    t.infraestructuras.forEach((i) => {
      const d = depreciacion(i);
      infras.push({ terrenoId: t.id, terreno: t.titulo, infra: i, costo: d.costo, depreciado: d.depreciado });
    });
  });
  const totalInfras = infras.reduce((a, i) => a + i.depreciado, 0);

  return {
    terrenos, totalTerrenos,
    infras, totalInfras,
    total: totalTerrenos + totalInfras,
  };
};
