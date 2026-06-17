import { ChangeEvent, useRef, useState } from 'react';

type RemStorageEntry = {
  key: string;
  value: string;
};

type RemPayload = {
  formato: 'INMOVAL_RESPALDO_REM';
  tipo: 'INMOVAL_RESTORE_FILE';
  extension: '.rem';
  version: string;
  generadoEn: string;
  plataforma: 'INMOVAL';
  origen: string;
  resumen: {
    totalClaves: number;
    claves: string[];
  };
  storage: RemStorageEntry[];
};

const REM_FORMATO = 'INMOVAL_RESPALDO_REM';
const REM_VERSION = '1.0.0';

const gruposLimpieza = [
  {
    id: 'cotizaciones',
    label: 'Cotizaciones',
    descripcion: 'Borra cotizaciones, configuración de cotizaciones e índices relacionados.',
    pattern: /cotizacion|cotizaciones/i,
  },
  {
    id: 'expedientes',
    label: 'Expedientes',
    descripcion: 'Borra expedientes, actividad, comparables vinculados y preparaciones técnicas.',
    pattern: /expediente|expedientes|preparaciones_tecnicas/i,
  },
  {
    id: 'clientes',
    label: 'Clientes',
    descripcion: 'Borra catálogos e índices de clientes.',
    pattern: /cliente|clientes/i,
  },
  {
    id: 'peritos',
    label: 'Peritos',
    descripcion: 'Borra catálogos e índices de peritos.',
    pattern: /perito|peritos/i,
  },
  {
    id: 'comparables',
    label: 'Comparables',
    descripcion: 'Borra base de comparables y comparables usados en expedientes o avalúos.',
    pattern: /comparable|comparables|avaluo_comparables/i,
  },
  {
    id: 'modulos',
    label: 'Módulos técnicos',
    descripcion: 'Borra estados locales de módulos técnicos cargados o activos.',
    pattern: /modulo|modulos/i,
  },
];

function isInmovalStorageKey(key: string) {
  return /^inmoval_/i.test(key);
}

function getInmovalStorageKeys() {
  if (typeof window === 'undefined') return [];

  const keys: string[] = [];

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);

    if (key && isInmovalStorageKey(key)) {
      keys.push(key);
    }
  }

  return keys.sort((a, b) => a.localeCompare(b));
}

function getInmovalStorageEntries(): RemStorageEntry[] {
  if (typeof window === 'undefined') return [];

  return getInmovalStorageKeys().map((key) => ({
    key,
    value: window.localStorage.getItem(key) || '',
  }));
}

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], {
    type: 'application/json;charset=utf-8',
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
}

function buildRemFileName() {
  const stamp = new Date()
    .toISOString()
    .slice(0, 16)
    .replace('T', '_')
    .replace(/[-:]/g, '');

  return `INMOVAL_respaldo_${stamp}.rem`;
}

function normalizarEntradasRespaldo(parsed: any): RemStorageEntry[] {
  const formatoValido =
    parsed?.formato === REM_FORMATO ||
    parsed?.tipo === 'INMOVAL_RESTORE_FILE' ||
    parsed?.tipo === 'INMOVAL_BACKUP';

  if (!formatoValido) {
    throw new Error('El archivo no parece ser un punto de restauración INMOVAL válido.');
  }

  if (Array.isArray(parsed?.storage)) {
    return parsed.storage
      .filter((entry: any) => entry?.key && typeof entry.key === 'string')
      .map((entry: any) => ({
        key: String(entry.key),
        value:
          typeof entry.value === 'string'
            ? entry.value
            : JSON.stringify(entry.value ?? null),
      }))
      .filter((entry: RemStorageEntry) => isInmovalStorageKey(entry.key));
  }

  if (parsed?.datos && typeof parsed.datos === 'object') {
    return Object.entries(parsed.datos)
      .map(([key, value]) => ({
        key,
        value: typeof value === 'string' ? value : JSON.stringify(value ?? null),
      }))
      .filter((entry) => isInmovalStorageKey(entry.key));
  }

  throw new Error('El respaldo no contiene datos restaurables.');
}

function removeStorageKeys(keys: string[]) {
  keys.forEach((key) => window.localStorage.removeItem(key));
}

export function RespaldoDatosINMOVALPanel() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [mensaje, setMensaje] = useState('');
  const totalClaves = getInmovalStorageKeys().length;

  function generarRespaldo() {
    const storage = getInmovalStorageEntries();

    const payload: RemPayload = {
      formato: REM_FORMATO,
      tipo: 'INMOVAL_RESTORE_FILE',
      extension: '.rem',
      version: REM_VERSION,
      generadoEn: new Date().toISOString(),
      plataforma: 'INMOVAL',
      origen: window.location.origin,
      resumen: {
        totalClaves: storage.length,
        claves: storage.map((entry) => entry.key),
      },
      storage,
    };

    downloadTextFile(buildRemFileName(), JSON.stringify(payload, null, 2));
    setMensaje(`Respaldo .rem generado con ${storage.length} clave(s) INMOVAL.`);
  }

  async function restaurarDesdeArchivo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const entries = normalizarEntradasRespaldo(parsed);

      if (entries.length === 0) {
        throw new Error('El respaldo no contiene claves INMOVAL.');
      }

      const confirmacion = window.prompt(
        `Se restaurarán ${entries.length} clave(s) desde "${file.name}".\n\nEsta acción reemplazará los datos actuales de INMOVAL.\n\nEscribí RESTAURAR para continuar:`
      );

      if (confirmacion !== 'RESTAURAR') {
        setMensaje('Restauración cancelada.');
        return;
      }

      removeStorageKeys(getInmovalStorageKeys());

      entries.forEach((entry) => {
        window.localStorage.setItem(entry.key, entry.value);
      });

      window.alert('Restauración completada. La plataforma se recargará.');
      window.location.reload();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudo restaurar el respaldo.';

      window.alert(message);
      setMensaje(message);
    }
  }

  function limpiarGrupo(label: string, pattern: RegExp) {
    const keys = getInmovalStorageKeys().filter((key) => pattern.test(key));

    if (keys.length === 0) {
      setMensaje(`No hay datos para limpiar en: ${label}.`);
      return;
    }

    const confirmado = window.confirm(
      `Se eliminarán ${keys.length} clave(s) de "${label}".\n\nSe recomienda generar un respaldo .rem antes de limpiar.\n\n¿Continuar?`
    );

    if (!confirmado) return;

    removeStorageKeys(keys);
    setMensaje(`Datos limpiados: ${label} (${keys.length} clave(s)).`);
  }

  function limpiarTodo() {
    const keys = getInmovalStorageKeys();

    if (keys.length === 0) {
      setMensaje('No hay datos INMOVAL para limpiar.');
      return;
    }

    const confirmacion = window.prompt(
      `Se eliminarán TODAS las claves locales de INMOVAL (${keys.length}).\n\nGenerá un respaldo .rem antes de continuar.\n\nEscribí LIMPIAR para confirmar:`
    );

    if (confirmacion !== 'LIMPIAR') {
      setMensaje('Limpieza total cancelada.');
      return;
    }

    removeStorageKeys(keys);
    setMensaje(`Limpieza total completada: ${keys.length} clave(s) eliminada(s).`);
  }

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/75 p-6 shadow-xl shadow-black/20">
      <input
        ref={fileInputRef}
        type="file"
        accept=".rem,.json,application/json"
        className="hidden"
        onChange={restaurarDesdeArchivo}
      />

      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-300">
            Respaldo y datos
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-50">
            Punto de restauración INMOVAL
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
            Generá un archivo .rem para guardar manualmente una copia completa
            de la plataforma. También podés restaurar un respaldo o limpiar datos
            locales de prueba.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-slate-300">
          Claves locales INMOVAL:{' '}
          <span className="font-semibold text-slate-100">{totalClaves}</span>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-sky-400/20 bg-sky-400/10 p-4">
          <h3 className="text-base font-semibold text-slate-50">
            Respaldo / restauración
          </h3>
          <p className="mt-2 text-sm leading-6 text-sky-100/80">
            Usá esta opción antes de limpiar datos, cambiar de equipo o guardar
            un punto estable del trabajo.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={generarRespaldo}
              className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:bg-emerald-400/20"
            >
              Generar respaldo .rem
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 py-3 text-sm font-medium text-sky-100 transition hover:bg-sky-400/20"
            >
              Restaurar desde .rem
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
          <h3 className="text-base font-semibold text-slate-50">
            Limpieza de datos de prueba
          </h3>
          <p className="mt-2 text-sm leading-6 text-amber-100/80">
            Estas acciones eliminan datos locales del navegador actual. Generá
            un respaldo .rem antes de limpiar.
          </p>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {gruposLimpieza.map((grupo) => (
              <button
                key={grupo.id}
                type="button"
                onClick={() => limpiarGrupo(grupo.label, grupo.pattern)}
                title={grupo.descripcion}
                className="rounded-2xl border border-slate-700 bg-slate-950/50 px-4 py-3 text-left text-sm font-medium text-slate-200 transition hover:bg-slate-800"
              >
                Limpiar {grupo.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={limpiarTodo}
            className="mt-4 w-full rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/20"
          >
            Limpiar todo INMOVAL
          </button>
        </div>
      </div>

      {mensaje ? (
        <div className="mt-5 rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-200">
          {mensaje}
        </div>
      ) : null}
    </section>
  );
}
