import {
    ConfiguracionLocalINMOVAL,
    ModuloTecnicoManifest,
    TipoModuloTecnico,
  } from '@/shared/types/inmovalCore';
  
  const STORAGE_KEY = 'inmoval_configuracion_local_v1';
  
  export const MODULOS_TECNICOS_BASE: ModuloTecnicoManifest[] = [
    {
      id: 'urbano',
      nombre: 'Inmuebles urbanos',
      descripcion: 'Módulo técnico para avalúos de inmuebles urbanos.',
      version: '1.0.0',
      estado: 'activo',
      extension: '.immod',
      requiereInstalacionLocal: true,
      puedeCrearExpedientes: true,
      puedeAbrirExpedientes: true,
    },
    {
      id: 'rural',
      nombre: 'Inmuebles rurales',
      descripcion: 'Módulo técnico para avalúos rurales. Pendiente de instalación.',
      version: '0.0.0',
      estado: 'no_instalado',
      extension: '.immod',
      requiereInstalacionLocal: true,
      puedeCrearExpedientes: false,
      puedeAbrirExpedientes: false,
    },
    {
      id: 'maquinaria',
      nombre: 'Maquinaria y equipos',
      descripcion:
        'Módulo técnico para maquinaria, equipos y activos especializados. Pendiente de instalación.',
      version: '0.0.0',
      estado: 'no_instalado',
      extension: '.immod',
      requiereInstalacionLocal: true,
      puedeCrearExpedientes: false,
      puedeAbrirExpedientes: false,
    },
    {
      id: 'vehiculo',
      nombre: 'Vehículos',
      descripcion: 'Módulo técnico para avalúos vehiculares. Pendiente de instalación.',
      version: '0.0.0',
      estado: 'no_instalado',
      extension: '.immod',
      requiereInstalacionLocal: true,
      puedeCrearExpedientes: false,
      puedeAbrirExpedientes: false,
    },
    {
      id: 'especial',
      nombre: 'Avalúos especiales',
      descripcion: 'Módulo técnico para avalúos especiales. Pendiente de instalación.',
      version: '0.0.0',
      estado: 'no_instalado',
      extension: '.immod',
      requiereInstalacionLocal: true,
      puedeCrearExpedientes: false,
      puedeAbrirExpedientes: false,
    },
  ];
  
  export function crearConfiguracionLocalInicial(): ConfiguracionLocalINMOVAL {
    return {
      version: '1.0.0',
      modulosInstalados: MODULOS_TECNICOS_BASE,
      ultimaActualizacion: new Date().toISOString(),
    };
  }
  
  export function getConfiguracionLocalINMOVAL(): ConfiguracionLocalINMOVAL {
    if (typeof window === 'undefined') {
      return crearConfiguracionLocalInicial();
    }
  
    const raw = window.localStorage.getItem(STORAGE_KEY);
  
    if (!raw) {
      const inicial = crearConfiguracionLocalInicial();
      saveConfiguracionLocalINMOVAL(inicial);
      return inicial;
    }
  
    try {
      const parsed = JSON.parse(raw) as ConfiguracionLocalINMOVAL;
  
      return {
        ...parsed,
        modulosInstalados: mergeModulosBase(parsed.modulosInstalados || []),
      };
    } catch {
      const inicial = crearConfiguracionLocalInicial();
      saveConfiguracionLocalINMOVAL(inicial);
      return inicial;
    }
  }
  
  export function saveConfiguracionLocalINMOVAL(
    config: ConfiguracionLocalINMOVAL
  ) {
    if (typeof window === 'undefined') return;
  
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...config,
        ultimaActualizacion: new Date().toISOString(),
      })
    );
  }
  
  export function getModuloTecnicoLocal(
    tipoModulo: TipoModuloTecnico
  ): ModuloTecnicoManifest | undefined {
    const config = getConfiguracionLocalINMOVAL();
  
    return config.modulosInstalados.find((m) => m.id === tipoModulo);
  }
  
  export function puedeAbrirModuloTecnico(tipoModulo: TipoModuloTecnico) {
    const modulo = getModuloTecnicoLocal(tipoModulo);
  
    return Boolean(
      modulo &&
        modulo.estado === 'activo' &&
        modulo.puedeAbrirExpedientes
    );
  }
  
  export function puedeCrearConModuloTecnico(tipoModulo: TipoModuloTecnico) {
    const modulo = getModuloTecnicoLocal(tipoModulo);
  
    return Boolean(
      modulo &&
        modulo.estado === 'activo' &&
        modulo.puedeCrearExpedientes
    );
  }
  
  export function actualizarModuloTecnicoLocal(
    tipoModulo: TipoModuloTecnico,
    cambios: Partial<ModuloTecnicoManifest>
  ) {
    const config = getConfiguracionLocalINMOVAL();
  
    const modulosInstalados = config.modulosInstalados.map((modulo) =>
      modulo.id === tipoModulo ? { ...modulo, ...cambios } : modulo
    );
  
    saveConfiguracionLocalINMOVAL({
      ...config,
      modulosInstalados,
    });
  
    return modulosInstalados.find((m) => m.id === tipoModulo);
  }
  
  function mergeModulosBase(
    actuales: ModuloTecnicoManifest[]
  ): ModuloTecnicoManifest[] {
    return MODULOS_TECNICOS_BASE.map((base) => {
      const existente = actuales.find((m) => m.id === base.id);
  
      return existente ? { ...base, ...existente } : base;
    });
  }