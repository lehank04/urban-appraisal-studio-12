export type EstadoConservacionConstruccion =
  | 'nuevo'
  | 'muy_bueno'
  | 'bueno'
  | 'regular'
  | 'malo'
  | 'ruinoso'
  | 'otro';

export type EstadoConservacionInfo = {
  value: EstadoConservacionConstruccion;
  label: string;
  coeficienteConservacionSugerido: number;
  descripcion: string;
};

export const ESTADOS_CONSERVACION_CONSTRUCCION: EstadoConservacionInfo[] = [
  {
    value: 'nuevo',
    label: 'Nuevo',
    coeficienteConservacionSugerido: 0.85,
    descripcion: 'Construcción nueva o prácticamente sin deterioro físico visible.',
  },
  {
    value: 'muy_bueno',
    label: 'Muy bueno',
    coeficienteConservacionSugerido: 0.95,
    descripcion: 'Construcción con mantenimiento sobresaliente y deterioro mínimo.',
  },
  {
    value: 'bueno',
    label: 'Bueno',
    coeficienteConservacionSugerido: 1,
    descripcion: 'Estado normal de conservación, sin daños relevantes.',
  },
  {
    value: 'regular',
    label: 'Regular',
    coeficienteConservacionSugerido: 1.15,
    descripcion: 'Presenta desgaste visible, mantenimiento incompleto o reparaciones menores pendientes.',
  },
  {
    value: 'malo',
    label: 'Malo',
    coeficienteConservacionSugerido: 1.35,
    descripcion: 'Presenta deterioro importante, necesidad de reparaciones relevantes o pérdida funcional parcial.',
  },
  {
    value: 'ruinoso',
    label: 'Ruinoso',
    coeficienteConservacionSugerido: 1.75,
    descripcion: 'Deterioro severo, alto grado de obsolescencia física o funcional.',
  },
  {
    value: 'otro',
    label: 'Otro / criterio pericial',
    coeficienteConservacionSugerido: 1,
    descripcion: 'Estado definido por criterio técnico del perito.',
  },
];

export function getEstadoConservacionInfo(
  value?: string | null,
): EstadoConservacionInfo | undefined {
  if (!value) return undefined;
  return ESTADOS_CONSERVACION_CONSTRUCCION.find((item) => item.value === value);
}

export function getCoeficienteConservacionSugerido(value?: string | null): number | null {
  return getEstadoConservacionInfo(value)?.coeficienteConservacionSugerido ?? null;
}

export function getDescripcionEstadoConservacion(value?: string | null): string {
  return getEstadoConservacionInfo(value)?.descripcion ?? '';
}
