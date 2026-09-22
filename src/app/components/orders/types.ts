import { UserRequestOrder, UserRequestServiceType, UserRequestStatusGroup } from '../../data/userOrdersMockData';

export type ServiceFilter = 'all' | UserRequestServiceType;

export interface ApiOrder {
    order_id: number;
    id: number;
    status: string | number;
    price: number;
    created_at: string;
    name: string;
    detail: string;
    type: 'doctor' | 'lab' | 'pharmacy' | 'nurse';
    status_label: string;
}

export interface ApiOrdersResponse {
    success: boolean;
    data: {
        orders: ApiOrder[];
        count_doctor: number;
        count_lab: number;
        count_pharmacy: number;
        count_nurse: number;
    };
}

export interface DoctorAppointmentDetail {
    id: number;
    slot_date: string;
    start_time: string;
    status: string;
    doctor_name: string;
    extra_detail: any;
}

export interface NurseRequestDetail {
    id: number;
    status: number;
    total_price: number;
    center_name: string;
    staff: { name: string; mobile: string } | null;
    services: { service_name: string; price: number }[];
    extra_info: {
        condition?: string;
        is_urgent?: boolean;
        custom_address?: string;
        report?: {
            duration_minutes: number;
            services_performed: string;
            patient_condition: string;
            recommendations: string;
            needs_followup: boolean;
        }
    };
}

export interface PharmacyRequestDetail {
    id: number;
    status: number;
    status_label: string;
    total_price: number;
    created_at: string;
    pharmacy_name: string;
    medicines: {
        id: number;
        medicine_name: string;
        quantity: number;
        unit_price: number;
        total_price: number;
        unit: string;
    }[];
}

export interface LabRequestDetail {
    id: number;
    status: number;
    status_label: string;
    total_price: number;
    visit_type: number;
    visit_type_label: string;
    request_date: string;
    lab_name: string;
    address: string | null;
    tests: {
        id: number;
        test_name: string;
        price: number;
        result_file: string | null;
    }[];
}