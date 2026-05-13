// src/types/specialtyForms.ts
export interface FormField {
    id: string;
    type: 'text' | 'number' | 'select' | 'radio' | 'multiselect';
    label: string;
    placeholder?: string;
    required: boolean;
    options?: string[];
    min?: number;
    max?: number;
}

export interface SpecialtyFormConfig {
    title: string;
    description?: string;
    fields: FormField[];
}
