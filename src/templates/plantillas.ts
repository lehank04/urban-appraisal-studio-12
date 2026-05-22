import { PlantillaId } from '@/store/types';

export interface Plantilla {
  id: PlantillaId;
  nombre: string;
  empresa: string;
  color: string;
  colorAccent: string;
  portadaTitulo: string;
  portadaSubtitulo: string;
  capitulos: string[];
  textoIntroduccion: string;
  textoMetodologia: string;
  textoAlcance: string;
  textosNoAplica: Record<string, string>;
  normativa: string;
}

const TEXTO_INMOVAL_METODO = `EL PRESENTE INFORME TÉCNICO SE ELABORA SIGUIENDO LOS MÉTODOS Y TÉCNICAS DE VALUACIÓN ESTABLECIDAS EN LA RESOLUCIÓN N° CD-SIBOIF-868-1-DIC10-2014, "NORMA SOBRE PERITOS VALUADORES". EL ANÁLISIS SE BASA EN LA INSPECCIÓN FÍSICA DEL INMUEBLE, LA DOCUMENTACIÓN LEGAL PROPORCIONADA Y LA INVESTIGACIÓN DE MERCADO, PARA PRODUCIR UN DICTAMEN TÉCNICO OBJETIVO Y VERIFICABLE.`;

export const PLANTILLAS: Record<PlantillaId, Plantilla> = {
  inmoval: {
    id: 'inmoval',
    nombre: 'INMOVAL',
    empresa: 'INMOVAL · Avalúos Urbanos',
    color: '#1d4f8b',
    colorAccent: '#f5b41a',
    portadaTitulo: 'AVALÚO DE INMUEBLE URBANO',
    portadaSubtitulo: 'CASA DE HABITACIÓN',
    capitulos: [
      'I. METODOLOGÍA',
      'I.1. Objeto y propósito del avalúo',
      'I.2. Enfoques de valuación aplicados',
      'I.3. Metodología del enfoque de costo o reposición',
      'I.4. Metodología del enfoque de mercado y factores de homologación',
      'II. CARACTERÍSTICAS DEL INMUEBLE',
      'II.1. Información general',
      'II.1.1. Documentación legal presentada',
      'II.2. Análisis del entorno',
      'II.3. Descripción del terreno',
      'II.4. Descripción de la infraestructura física',
      'III. ANÁLISIS DE VALORACIÓN',
      'III.1. Valor de mercado (enfoque de mercado)',
      'III.2. Valor de realización',
      'III.3. Valor de reposición (enfoque de costos)',
      '3.1. Valor del terreno',
      '3.2. Memoria de cálculo de la depreciación',
      '3.3. Memoria de costos de infraestructuras (VRN)',
      '3.4. Consolidado de valores y cálculo del VNR',
      'III.4. Resumen y conciliación de valores',
      'IV. RESUMEN DE VALORES',
      'V. CERTIFICACIÓN',
      'VI. ANEXOS',
    ],
    textoIntroduccion: TEXTO_INMOVAL_METODO,
    textoMetodologia: TEXTO_INMOVAL_METODO,
    textoAlcance:
      'EL ALCANCE DEL PRESENTE AVALÚO COMPRENDE LA INSPECCIÓN FÍSICA DEL INMUEBLE, EL ANÁLISIS DE LA DOCUMENTACIÓN LEGAL APORTADA, LA CONSULTA DE INFORMACIÓN CATASTRAL Y DE MERCADO, LA APLICACIÓN DE LAS METODOLOGÍAS VALUATORIAS PERTINENTES Y LA EMISIÓN DEL INFORME TÉCNICO CON SU CORRESPONDIENTE VALOR COMERCIAL.',
    textosNoAplica: {
      enfoqueMercado: 'EL ENFOQUE DE MERCADO NO SE APLICA POR INEXISTENCIA DE COMPARABLES SUFICIENTES EN LA ZONA DE INFLUENCIA QUE CUMPLAN LOS CRITERIOS DE HOMOGENEIDAD REQUERIDOS.',
      enfoqueCosto: 'EL ENFOQUE DE COSTO NO SE APLICA POR TRATARSE DE UN INMUEBLE SIN CONSTRUCCIONES O MEJORAS SIGNIFICATIVAS QUE REQUIERAN VALORACIÓN POR ESTE MÉTODO.',
      enfoqueIngresos: 'EN CUMPLIMIENTO DEL ARTÍCULO 31 DE LA NORMA SOBRE PERITOS VALUADORES, EL ENFOQUE DE INGRESOS NO SE INCLUYE MIENTRAS LA SUPERINTENDENCIA NO DICTE LOS PARÁMETROS Y CRITERIOS PARA QUE LOS PERITOS DETERMINEN LA TASA DE CAPITALIZACIÓN.',
    },
    normativa: 'RESOLUCIÓN N° CD-SIBOIF-868-1-DIC10-2014 — NORMA SOBRE PERITOS VALUADORES',
  },
  adalberto: {
    id: 'adalberto',
    nombre: 'Adalberto',
    empresa: 'Adalberto Rodríguez · Perito Valuador',
    color: '#7c2d12',
    colorAccent: '#fbbf24',
    portadaTitulo: 'AVALÚO COMERCIAL',
    portadaSubtitulo: 'Informe técnico independiente',
    capitulos: [
      '1. Datos generales',
      '2. Descripción del bien',
      '3. Análisis de terreno',
      '4. Análisis de construcciones',
      '5. Métodos aplicados',
      '6. Memorias de cálculo',
      '7. Anexo fotográfico',
      '8. Conclusión de valor',
    ],
    textoIntroduccion: 'Atendiendo la solicitud recibida, se realiza el presente avalúo comercial bajo criterios técnicos y de mercado.',
    textoMetodologia: 'Se aplican los enfoques de mercado y costo, conforme a la mejor evidencia disponible.',
    textoAlcance: 'Inspección, recopilación documental, análisis técnico y emisión del valor comercial del inmueble.',
    textosNoAplica: {
      enfoqueMercado: 'Método comparativo no aplicable en este caso.',
      enfoqueCosto: 'Método de reposición no aplicable.',
      enfoqueIngresos: 'No aplica.',
    },
    normativa: 'Estándares profesionales nacionales',
  },
  adicional: {
    id: 'adicional',
    nombre: 'Perito adicional',
    empresa: 'Plantilla genérica',
    color: '#1f2937',
    colorAccent: '#3b82f6',
    portadaTitulo: 'INFORME DE AVALÚO',
    portadaSubtitulo: 'Plantilla técnica',
    capitulos: [
      '1. Información general', '2. Inmueble', '3. Terreno', '4. Construcciones',
      '5. Metodología', '6. Cálculos', '7. Fotografías', '8. Conclusiones',
    ],
    textoIntroduccion: 'Informe de avalúo elaborado conforme a las normas técnicas aplicables.',
    textoMetodologia: 'Se aplica un esquema estándar de valuación.',
    textoAlcance: 'Alcance estándar de inspección, análisis y emisión de valor.',
    textosNoAplica: {
      enfoqueMercado: 'Metodología no aplicada.',
      enfoqueCosto: 'Metodología no aplicada.',
      enfoqueIngresos: 'No aplica.',
    },
    normativa: '—',
  },
};
