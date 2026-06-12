import { HeartPulse } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { serviceModuleLabels, type ServiceModuleId } from '../../config/settingsOptions';
import { servicesCatalog } from '../../../config/servicesCatalog';
import { Switch } from '../../../components/ui/switch';
import { SettingsPanel } from './AdminSettingsGeneral';

export function AdminSettingsServices() {
    const services = useSettingsStore((s) => s.services);
    const setServiceEnabled = useSettingsStore((s) => s.setServiceEnabled);

    return (
        <SettingsPanel title="ماژول‌های خدمات" icon={HeartPulse}>
            <p className="mb-6 text-sm text-slate-500">
                فعال یا غیرفعال کردن ماژول‌های بخش{' '}
                <span className="font-medium text-slate-700">/services</span> در اپ کاربر
            </p>

            <div className="space-y-3">
                {servicesCatalog.map((item) => {
                    const Icon = item.icon;
                    const enabled = services[item.id as ServiceModuleId];
                    return (
                        <div
                            key={item.id}
                            className={`flex items-center justify-between rounded-xl border p-4 transition ${
                                enabled
                                    ? 'border-slate-200 bg-white'
                                    : 'border-slate-100 bg-slate-50 opacity-75'
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <div
                                    className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} text-white shadow-sm`}
                                >
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">
                                        {serviceModuleLabels[item.id]}
                                    </p>
                                    <p className="text-xs text-slate-500">{item.desc}</p>
                                    <p className="mt-0.5 text-[11px] text-slate-400" dir="ltr">
                                        {item.path}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span
                                    className={`text-xs font-medium ${
                                        enabled ? 'text-emerald-600' : 'text-slate-400'
                                    }`}
                                >
                                    {enabled ? 'فعال' : 'غیرفعال'}
                                </span>
                                <Switch
                                    checked={enabled}
                                    onCheckedChange={(checked) =>
                                        setServiceEnabled(item.id, checked)
                                    }
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </SettingsPanel>
    );
}
