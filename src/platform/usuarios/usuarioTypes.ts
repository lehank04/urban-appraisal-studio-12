import { RolUsuarioINMOVAL } from '@/shared/types/inmovalCore';

export type UsuarioPlataformaINMOVAL = {
  id: string;
  nombre: string;
  email: string;
  rol: RolUsuarioINMOVAL;
  activo: boolean;
  ultimoAcceso?: string;
  creadoEn: string;
  actualizadoEn: string;
};
