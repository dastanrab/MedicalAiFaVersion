import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
    defaultSettings,
    type AdminAccount,
    type AdminRole,
    type AppSettings,
    type FaqItem,
    type ServiceModuleId,
    type SocialLinkSetting,
} from '../config/settingsOptions';

interface SettingsState extends AppSettings {
    updateGeneral: (general: Partial<AppSettings['general']>) => void;
    updateSocialLink: (id: string, patch: Partial<SocialLinkSetting>) => void;
    updateAuth: (auth: Partial<AppSettings['auth']>) => void;
    updateContent: (content: Partial<AppSettings['content']>) => void;
    addFaq: (item: Omit<FaqItem, 'id'>) => void;
    updateFaq: (id: string, patch: Partial<FaqItem>) => void;
    removeFaq: (id: string) => void;
    setServiceEnabled: (id: ServiceModuleId, enabled: boolean) => void;
    addAdmin: (admin: Omit<AdminAccount, 'id' | 'createdAt'>) => void;
    updateAdmin: (id: string, patch: Partial<AdminAccount>) => void;
    removeAdmin: (id: string) => void;
    resetSettings: () => void;
}

let faqCounter = 100;
let adminCounter = 100;

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            ...defaultSettings,

            updateGeneral: (general) =>
                set((state) => ({ general: { ...state.general, ...general } })),

            updateSocialLink: (id, patch) =>
                set((state) => ({
                    general: {
                        ...state.general,
                        socialLinks: state.general.socialLinks.map((link) =>
                            link.id === id ? { ...link, ...patch } : link
                        ),
                    },
                })),

            updateAuth: (auth) => set((state) => ({ auth: { ...state.auth, ...auth } })),

            updateContent: (content) =>
                set((state) => ({ content: { ...state.content, ...content } })),

            addFaq: (item) => {
                faqCounter += 1;
                set((state) => ({
                    content: {
                        ...state.content,
                        faq: [...state.content.faq, { ...item, id: String(faqCounter) }],
                    },
                }));
            },

            updateFaq: (id, patch) =>
                set((state) => ({
                    content: {
                        ...state.content,
                        faq: state.content.faq.map((f) => (f.id === id ? { ...f, ...patch } : f)),
                    },
                })),

            removeFaq: (id) =>
                set((state) => ({
                    content: {
                        ...state.content,
                        faq: state.content.faq.filter((f) => f.id !== id),
                    },
                })),

            setServiceEnabled: (id, enabled) =>
                set((state) => ({
                    services: { ...state.services, [id]: enabled },
                })),

            addAdmin: (admin) => {
                adminCounter += 1;
                const now = new Date();
                const createdAt = now.toLocaleDateString('fa-IR');
                set((state) => ({
                    admins: [
                        ...state.admins,
                        { ...admin, id: String(adminCounter), createdAt },
                    ],
                }));
            },

            updateAdmin: (id, patch) =>
                set((state) => ({
                    admins: state.admins.map((a) => (a.id === id ? { ...a, ...patch } : a)),
                })),

            removeAdmin: (id) =>
                set((state) => ({
                    admins: state.admins.filter((a) => a.id !== id),
                })),

            resetSettings: () => set({ ...defaultSettings }),
        }),
        { name: 'app-settings-storage' }
    )
);

export function useEnabledSocialLinks() {
    return useSettingsStore((s) => s.general.socialLinks.filter((l) => l.enabled && l.href));
}

export function useEnabledServices() {
    return useSettingsStore((s) => s.services);
}
