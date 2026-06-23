import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useNurseAccountType } from '../store/providerAuthStore';
import { providerPath } from '../config/providerNav';
import type { NurseAccountType } from '../config/providerNav';

interface NurseRoleGateProps {
    allowed: NurseAccountType[];
    children: ReactNode;
}

export function NurseRoleGate({ allowed, children }: NurseRoleGateProps) {
    const accountType = useNurseAccountType();
    if (!allowed.includes(accountType)) {
        return <Navigate to={providerPath('nurse', 'dashboard')} replace />;
    }
    return children;
}
