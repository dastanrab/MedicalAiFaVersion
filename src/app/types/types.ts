export interface Pharmacy {
    id: string | number;
    name: string;
    address: string;
    phone: string;
    city?: string;
    rating?: number;
    reviews_count?: number;
    image_url?: string;
    is_open?: boolean;
}

export interface DrugItem {
    id: string | number;
    name: string;
    generic_name?: string;
    brand: string;
    dosage?: string;
    price: number;
    in_stock: boolean;
    image_url?: string;
}

export interface CartItem extends DrugItem {
    quantity: number;
}
