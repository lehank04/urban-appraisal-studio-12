import { EstadoModuloTecnico } from '@/shared/types/inmovalCore';

export function getModuloEstadoLabel(estado: EstadoModuloTecnico) {
  const labels: Record<EstadoModuloTecnico, string> = {
    activo: 'Activo',
    no_instalado: 'No instalado',
    deshabilitado: 'Deshabilitado',
    requiere_actualizacion: 'Requiere actualización',
  };

  return labels[estado];
}

export function getModuloEstadoDescription(estado: EstadoModuloTecnico) {
  const descriptions: Record<EstadoModuloTecnico, string> = {
    activo: 'Este módulo está disponible para crear y abrir expedientes.',
    no_instalado: 'Este módulo está preparado, pero todavía no está instalado en esta computadora.',
    deshabilitado: 'Este módulo existe, pero está deshabilitado temporalmente.',
    requiere_actualizacion: 'Este módulo requiere actualización antes de poder utilizarse.',
  };

  return descriptions[estado];
}

export function getModuloEstadoBadgeClass(estado: EstadoModuloTecnico) {
  const classes: Record<EstadoModuloTecnico, string> = {
    activo: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
    no_instalado: 'border-slate-500/40 bg-slate-500/10 text-slate-300',
    deshabilitado: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
    requiere_actualizacion: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
  };

  return classes[estado];
}
