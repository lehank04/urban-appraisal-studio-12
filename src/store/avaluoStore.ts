import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Avaluo,
  Cliente,
  Perito,
  ID,
  emptyInfo,
  emptyFotos,
  emptyMetodologias,
  emptyDocLegal,
  emptyEntorno,
  emptyDescripcionGeneralTerrenos,
  emptyFormatoExport,
} from './types';

interface State {
  clientes: Cliente[];
  peritos: Perito[];
  avaluos: Avaluo[];

  addCliente: (c: Omit<Cliente, 'id'>) => Cliente;
  updateCliente: (id: ID, c: Partial<Cliente>) => void;
  deleteCliente: (id: ID) => void;

  addPerito: (p: Omit<Perito, 'id'>) => Perito;
  updatePerito: (id: ID, p: Partial<Perito>) => void;
  deletePerito: (id: ID) => void;

  createAvaluo: () => Avaluo;
  updateAvaluo: (id: ID, patch: Partial<Avaluo>) => void;
  patchAvaluo: (id: ID, fn: (a: Avaluo) => Avaluo) => void;
  deleteAvaluo: (id: ID) => void;
  getAvaluo: (id: ID) => Avaluo | undefined;
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      clientes: [],
      peritos: [],
      avaluos: [],

      addCliente: (c) => {
        const cliente: Cliente = {
          ...c,
          id: crypto.randomUUID(),
        };

        set((s) => ({
          clientes: [...s.clientes, cliente],
        }));

        return cliente;
      },

      updateCliente: (id, c) =>
        set((s) => ({
          clientes: s.clientes.map((x) =>
            x.id === id ? { ...x, ...c } : x
          ),
        })),

      deleteCliente: (id) =>
        set((s) => ({
          clientes: s.clientes.filter((x) => x.id !== id),
        })),

      addPerito: (p) => {
        const perito: Perito = {
          ...p,
          id: crypto.randomUUID(),
        };

        set((s) => ({
          peritos: [...s.peritos, perito],
        }));

        return perito;
      },

      updatePerito: (id, p) =>
        set((s) => ({
          peritos: s.peritos.map((x) =>
            x.id === id ? { ...x, ...p } : x
          ),
        })),

      deletePerito: (id) =>
        set((s) => ({
          peritos: s.peritos.filter((x) => x.id !== id),
        })),

      createAvaluo: () => {
        const now = new Date().toISOString();

        const avaluo: Avaluo = {
          id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now,
          estado: 'borrador',
          info: emptyInfo(),
          documentoLegal: emptyDocLegal(),
          entorno: emptyEntorno(),
          descripcionGeneralTerrenos: emptyDescripcionGeneralTerrenos(),
          terrenos: [],
          metodologias: emptyMetodologias(),
          fotos: emptyFotos(),
          formato: emptyFormatoExport(),
        };

        set((s) => ({
          avaluos: [avaluo, ...s.avaluos],
        }));

        return avaluo;
      },

      updateAvaluo: (id, patch) =>
        set((s) => ({
          avaluos: s.avaluos.map((a) =>
            a.id === id
              ? {
                  ...a,
                  ...patch,
                  updatedAt: new Date().toISOString(),
                }
              : a
          ),
        })),

      patchAvaluo: (id, fn) =>
        set((s) => ({
          avaluos: s.avaluos.map((a) =>
            a.id === id
              ? {
                  ...fn(a),
                  updatedAt: new Date().toISOString(),
                }
              : a
          ),
        })),

      deleteAvaluo: (id) =>
        set((s) => ({
          avaluos: s.avaluos.filter((a) => a.id !== id),
        })),

      getAvaluo: (id) => get().avaluos.find((a) => a.id === id),
    }),
    {
      name: 'inmoval-avaluos',
    }
  )
);