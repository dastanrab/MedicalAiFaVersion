// src/utils/apiClient.ts

import { useDoctorAuthStore } from '../doctor/store/doctorAuthStore';
import { useProviderAuthStore } from '../store/providerAuthStore';
import type { ProviderRole } from '../config/providerNav';

export type AppRole = ProviderRole;

export async function fetchWithAuth(
    url: string,
    options: RequestInit = {},
    role: AppRole
): Promise<Response> {
    const response = await fetch(url, options);

    if (response.status === 401) {
        if (role === 'doctor') {
            useDoctorAuthStore.getState().logout();
            window.location.replace('/doctor/login');
        } else {
            useProviderAuthStore.getState().logout(role);
            window.location.replace(`/provider/${role}/login`);
        }

        throw new Error('UNAUTHORIZED');
    }

    return response;
}
