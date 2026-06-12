import { RolUsuarioINMOVAL } from '@/shared/types/inmovalCore';

export type PermisoINMOVAL =
  | 'ver_dashboard'
  | 'ver_expedientes'
  | 'crear_expedientes'
  | 'editar_expedientes'
  | 'cerrar_expedientes'
  | 'ver_cotizaciones'
  | 'crear_cotizaciones'
  | 'aprobar_cotizaciones'
  | 'ver_pagos'
  | 'editar_pagos'
  | 'ver_facturacion'
  | 'editar_facturacion'
  | 'ver_modulo_tecnico'
  | 'editar_modulo_tecnico'
  | 'ver_comparables'
  | 'editar_comparables'
  | 'administrar_usuarios'
  | 'administrar_configuracion';

export const ROLE_PERMISSIONS: Record<RolUsuarioINMOVAL, PermisoINMOVAL[]> = {
  administrador: [
    'ver_dashboard',
    'ver_expedientes',
    'crear_expedientes',
    'editar_expedientes',
    'cerrar_expedientes',
    'ver_cotizaciones',
    'crear_cotizaciones',
    'aprobar_cotizaciones',
    'ver_pagos',
    'editar_pagos',
    'ver_facturacion',
    'editar_facturacion',
    'ver_modulo_tecnico',
    'editar_modulo_tecnico',
    'ver_comparables',
    'editar_comparables',
    'administrar_usuarios',
    'administrar_configuracion',
  ],
  administrativo: [
    'ver_dashboard',
    'ver_expedientes',
    'crear_expedientes',
    'editar_expedientes',
    'cerrar_expedientes',
    'ver_cotizaciones',
    'crear_cotizaciones',
    'aprobar_cotizaciones',
    'ver_pagos',
    'editar_pagos',
    'ver_facturacion',
    'editar_facturacion',
    'ver_comparables',
  ],
  operacional: [
    'ver_dashboard',
    'ver_expedientes',
    'ver_modulo_tecnico',
    'editar_modulo_tecnico',
    'ver_comparables',
    'editar_comparables',
  ],
};

export function usuarioTienePermiso(
  rol: RolUsuarioINMOVAL,
  permiso: PermisoINMOVAL
) {
  return ROLE_PERMISSIONS[rol].includes(permiso);
}
