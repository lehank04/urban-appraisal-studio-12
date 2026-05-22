import { PlantillaId } from '@/store/types';

export interface Plantilla {
  id: PlantillaId;
  nombre: string;
  empresa: string;
  color: string;
  capitulos: string[];
  portadaSubtitulo: string;
  textoIntroduccion: string;
  textoAlcance: string;
  textosNoAplica: Record<string, string>;
}

export const PLANTILLAS: Record<PlantillaId, Plantilla> = {
  inmoval: {
    id: 'inmoval',
    nombre: 'INMOVAL',
    empresa: 'INMOVAL S.A.S.',
    color: '#0c4a6e',
    portadaSubtitulo: 'Informe Técnico de Avalúo Comercial',
    capitulos: [
      '1. Información general',
      '2. Identificación del inmueble',
      '3. Descripción del terreno',
      '4. Descripción de infraestructuras',
      '5. Metodologías valuatorias',
      '6. Memorias de cálculo',
      '7. Registro fotográfico',
      '8. Consolidado de valores',
      '9. Conclusiones',
      '10. Anexos',
    ],
    textoIntroduccion:
      'El presente informe corresponde al avalúo técnico-comercial del inmueble objeto del estudio, elaborado conforme a las normas vigentes de la Resolución 620 de 2008 del IGAC, las NIIF y las prácticas profesionales aceptadas por el Registro Nacional de Avaluadores.',
    textoAlcance:
      'El alcance del presente avalúo comprende la inspección física del inmueble, el análisis de la documentación legal aportada, la consulta de información catastral y de mercado, la aplicación de las metodologías valuatorias pertinentes y la emisión del informe técnico con su correspondiente valor comercial.',
    textosNoAplica: {
      comparativo: 'El método comparativo de mercado no se aplica al presente avalúo por inexistencia de comparables suficientes en la zona de influencia que cumplan los criterios de homogeneidad requeridos.',
      reposicion: 'El método de costo de reposición no se aplica por tratarse de un inmueble sin construcciones o mejoras significativas que requieran valoración por este método.',
      mercadoTerreno: 'No se aplica valor de mercado de terreno de manera independiente por integrarse al método principal.',
      mercadoMejoras: 'No se aplica valor de mercado de mejoras de manera independiente.',
    },
  },
  adalberto: {
    id: 'adalberto',
    nombre: 'Adalberto',
    empresa: 'Adalberto Rodríguez · Perito',
    color: '#7c2d12',
    portadaSubtitulo: 'Avalúo Comercial Independiente',
    capitulos: [
      '1. Datos generales',
      '2. Descripción del bien',
      '3. Análisis de terreno',
      '4. Análisis de construcciones',
      '5. Métodos aplicados',
      '6. Cálculos',
      '7. Anexo fotográfico',
      '8. Conclusión de valor',
    ],
    textoIntroduccion:
      'Atendiendo la solicitud recibida, se realiza el presente avalúo comercial bajo criterios técnicos y de mercado.',
    textoAlcance:
      'El presente trabajo comprende la inspección, recopilación documental, análisis técnico y emisión del valor comercial del inmueble.',
    textosNoAplica: {
      comparativo: 'Método comparativo no aplicable en este caso.',
      reposicion: 'Método de reposición no aplicable.',
      mercadoTerreno: 'No aplica.',
      mercadoMejoras: 'No aplica.',
    },
  },
  adicional: {
    id: 'adicional',
    nombre: 'Perito adicional',
    empresa: 'Plantilla genérica',
    color: '#1f2937',
    portadaSubtitulo: 'Informe de Avalúo',
    capitulos: [
      '1. Información general',
      '2. Inmueble',
      '3. Terreno',
      '4. Construcciones',
      '5. Metodología',
      '6. Cálculos',
      '7. Fotografías',
      '8. Conclusiones',
    ],
    textoIntroduccion: 'Informe de avalúo elaborado conforme a las normas técnicas aplicables.',
    textoAlcance: 'Alcance estándar de inspección, análisis y emisión de valor.',
    textosNoAplica: {
      comparativo: 'Metodología no aplicada.',
      reposicion: 'Metodología no aplicada.',
      mercadoTerreno: 'No aplica.',
      mercadoMejoras: 'No aplica.',
    },
  },
};
