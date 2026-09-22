import {Stethoscope, TestTube2, Pill, Scan, HeartHandshake, MessageSquare} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { UserRequestServiceType, UserRequestStatusGroup } from '../../data/userOrdersMockData';

export const serviceTypeMap: Record<string, UserRequestServiceType> = {
    doctor: 'consultation',
    lab: 'lab',
    pharmacy: 'pharmacy',
    nurse: 'nurse',
    chat: 'chat',
};

export const reverseServiceTypeMap: Record<string, string> = {
    consultation: 'doctor',
    lab: 'lab',
    pharmacy: 'pharmacy',
    nurse: 'nurse',
    chat: 'chat',
};

export const doctorStatusLabelMap: Record<string, string> = {
    booked: 'رزرو شده',
    done: 'انجام شده',
    canceled: 'لغو شده',
    cancelled: 'لغو شده',
    completed: 'تکمیل شده'
};

export const mapToStatusGroup = (type: string, rawStatus: string | number): UserRequestStatusGroup => {
    const s = String(rawStatus);
    switch (type) {
        case 'chat':
            if (s === '3' || s === '4' || s === '5') return 'cancelled';
            return 'active';
        case 'doctor':
            if (s === 'completed' || s === '3' || s === 'done') return 'completed';
            if (s === 'cancelled') return 'cancelled';
            return 'active';
        case 'lab':
            if (s === '4' || s === '5') return 'completed';
            if (s === '6') return 'cancelled';
            return 'active';
        case 'pharmacy':
            if (s === '5' || s === '6') return 'completed';
            if (s === '7') return 'cancelled';
            return 'active';
        case 'nurse':
            if (s === '4') return 'completed';
            if (s === '5') return 'cancelled';
            return 'active';
        default:
            return 'active';
    }
};

export const getStatusClass = (group: UserRequestStatusGroup): string => {
    switch (group) {
        case 'active': return 'bg-blue-50 text-blue-600 ring-blue-200';
        case 'completed': return 'bg-emerald-50 text-emerald-600 ring-emerald-200';
        case 'cancelled': return 'bg-red-50 text-red-600 ring-red-200';
        default: return 'bg-gray-50 text-gray-600 ring-gray-200';
    }
};

export const toJalaliDate = (iso: string): string => {
    try {
        return new Date(iso).toLocaleDateString('fa-IR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } catch {
        return iso;
    }
};

export const serviceIcons: Record<UserRequestServiceType, LucideIcon> = {
    consultation: Stethoscope,
    lab: TestTube2,
    pharmacy: Pill,
    radiology: Scan,
    nurse: HeartHandshake,
    chat: MessageSquare,
};

export const serviceIconStyles: Record<UserRequestServiceType, string> = {
    consultation: 'bg-blue-50 text-blue-600',
    lab: 'bg-violet-50 text-violet-600',
    pharmacy: 'bg-emerald-50 text-emerald-600',
    radiology: 'bg-cyan-50 text-cyan-600',
    nurse: 'bg-rose-50 text-rose-600',
    chat: 'bg-teal-50 text-teal-600',
};