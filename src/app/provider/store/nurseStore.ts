import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
    mockNurseRequests,
    mockNursePersonnel,
    mockNurseServices,
    type NursePersonnel,
    type NurseService,
    type NurseRequest,
} from '../data/mockData';

export type { NurseRequest };

export type NursePersonnelInput = Omit<NursePersonnel, 'id'>;
export type NurseServiceInput = Omit<NurseService, 'id'>;

interface NurseDataState {
    requests: NurseRequest[];
    personnel: NursePersonnel[];
    services: NurseService[];
    nextRequestId: number;
    nextPersonnelId: number;
    nextServiceId: number;

    setRequests: (requests: NurseRequest[]) => void;
    addPersonnel: (input: NursePersonnelInput) => NursePersonnel;
    updatePersonnel: (id: number, patch: Partial<NursePersonnelInput>) => void;
    addService: (input: NurseServiceInput) => NurseService;
    updateService: (id: number, patch: Partial<NurseServiceInput>) => void;
    toggleServiceActive: (id: number) => void;
}

export const useNurseStore = create<NurseDataState>()(
    persist(
        (set, get) => ({
            requests: mockNurseRequests,
            personnel: mockNursePersonnel,
            services: mockNurseServices,
            nextRequestId: Math.max(...mockNurseRequests.map((r) => r.id), 0) + 1,
            nextPersonnelId: Math.max(...mockNursePersonnel.map((p) => p.id), 0) + 1,
            nextServiceId: Math.max(...mockNurseServices.map((s) => s.id), 0) + 1,

            setRequests: (requests) => set({ requests }),

            addPersonnel: (input) => {
                const id = get().nextPersonnelId;
                const item: NursePersonnel = { id, ...input };
                set((state) => ({
                    personnel: [...state.personnel, item],
                    nextPersonnelId: id + 1,
                }));
                return item;
            },

            updatePersonnel: (id, patch) =>
                set((state) => ({
                    personnel: state.personnel.map((p) => (p.id === id ? { ...p, ...patch } : p)),
                })),

            addService: (input) => {
                const id = get().nextServiceId;
                const item: NurseService = { id, ...input };
                set((state) => ({
                    services: [...state.services, item],
                    nextServiceId: id + 1,
                }));
                return item;
            },

            updateService: (id, patch) =>
                set((state) => ({
                    services: state.services.map((s) => (s.id === id ? { ...s, ...patch } : s)),
                })),

            toggleServiceActive: (id) =>
                set((state) => ({
                    services: state.services.map((s) =>
                        s.id === id ? { ...s, active: !s.active } : s
                    ),
                })),
        }),
        {
            name: 'nurse-panel-storage',
            version: 1,
            migrate: (persisted, version) => {
                const state = persisted as Partial<NurseDataState> | undefined;
                if (!state) return persisted as NurseDataState;
                if (version < 1 && Array.isArray(state.personnel)) {
                    state.personnel = state.personnel.map((p) => ({
                        ...p,
                        gender: p.gender ?? 'female',
                    }));
                }
                return state as NurseDataState;
            },
            partialize: (state) => ({
                requests: state.requests,
                personnel: state.personnel,
                services: state.services,
                nextRequestId: state.nextRequestId,
                nextPersonnelId: state.nextPersonnelId,
                nextServiceId: state.nextServiceId,
            }),
        }
    )
);
