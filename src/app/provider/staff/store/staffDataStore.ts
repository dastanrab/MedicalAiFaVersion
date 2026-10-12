import { create } from 'zustand';
import {
    mockStaffAppointments,
    mockStaffLabRequests,
    mockStaffPharmacyRequests,
    mockStaffDrugStock,
    mockStaffNurseRequests,
    type StaffAppointment,
    type StaffLabRequest,
    type StaffPharmacyRequest,
    type StaffDrugStock,
    type StaffNurseRequest,
} from '../data/mockStaffData';

/**
 * داده‌های عملیاتی پنل کارمند (mock در حافظه).
 * بعد از آماده شدن API کارمند، این store با فراخوانی endpointها جایگزین می‌شود.
 */
interface StaffDataState {
    appointments: StaffAppointment[];
    labRequests: StaffLabRequest[];
    pharmacyRequests: StaffPharmacyRequest[];
    drugStock: StaffDrugStock[];
    nurseRequests: StaffNurseRequest[];

    addAppointment: (input: Omit<StaffAppointment, 'id' | 'status' | 'source'>) => StaffAppointment;
    updateAppointment: (id: number, patch: Partial<StaffAppointment>) => void;
    updateLabRequest: (id: number, patch: Partial<StaffLabRequest>) => void;
    updatePharmacyRequest: (id: number, patch: Partial<StaffPharmacyRequest>) => void;
    updateDrugStock: (id: number, stock: number) => void;
    updateNurseRequest: (id: number, patch: Partial<StaffNurseRequest>) => void;
}

function patchById<T extends { id: number }>(list: T[], id: number, patch: Partial<T>): T[] {
    return list.map((item) => (item.id === id ? { ...item, ...patch } : item));
}

export const useStaffDataStore = create<StaffDataState>()((set, get) => ({
    appointments: mockStaffAppointments,
    labRequests: mockStaffLabRequests,
    pharmacyRequests: mockStaffPharmacyRequests,
    drugStock: mockStaffDrugStock,
    nurseRequests: mockStaffNurseRequests,

    addAppointment: (input) => {
        const id = Math.max(0, ...get().appointments.map((a) => a.id)) + 1;
        const appointment: StaffAppointment = { ...input, id, status: 'booked', source: 'secretary' };
        set((s) => ({ appointments: [...s.appointments, appointment] }));
        return appointment;
    },
    updateAppointment: (id, patch) =>
        set((s) => ({ appointments: patchById(s.appointments, id, patch) })),
    updateLabRequest: (id, patch) =>
        set((s) => ({ labRequests: patchById(s.labRequests, id, patch) })),
    updatePharmacyRequest: (id, patch) =>
        set((s) => ({ pharmacyRequests: patchById(s.pharmacyRequests, id, patch) })),
    updateDrugStock: (id, stock) =>
        set((s) => ({ drugStock: patchById(s.drugStock, id, { stock }) })),
    updateNurseRequest: (id, patch) =>
        set((s) => ({ nurseRequests: patchById(s.nurseRequests, id, patch) })),
}));
