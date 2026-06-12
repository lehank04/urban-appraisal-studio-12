export type ClienteINMOVAL = {
  id: string;
  nombre: string;
  tipo: 'persona_natural' | 'persona_juridica' | 'institucion' | 'banco' | 'otro';
  identificacion?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  contactoPrincipal?: string;
  activo: boolean;
  creadoEn: string;
  actualizadoEn: string;
};
