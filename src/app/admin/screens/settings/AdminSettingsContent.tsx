import { useState } from 'react';
import { FileText, Plus, Trash2, HelpCircle } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import {
    SettingsPanel,
    Field,
    textareaClass,
    SaveButton,
    inputClass,
} from './AdminSettingsGeneral';

export function AdminSettingsContent() {
    const content = useSettingsStore((s) => s.content);
    const updateContent = useSettingsStore((s) => s.updateContent);
    const addFaq = useSettingsStore((s) => s.addFaq);
    const updateFaq = useSettingsStore((s) => s.updateFaq);
    const removeFaq = useSettingsStore((s) => s.removeFaq);

    const [welcomeText, setWelcomeText] = useState(content.welcomeText);
    const [aboutText, setAboutText] = useState(content.aboutText);
    const [saved, setSaved] = useState(false);

    const handleSaveTexts = () => {
        updateContent({ welcomeText, aboutText });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleAddFaq = () => {
        addFaq({ question: 'سؤال جدید', answer: 'پاسخ را اینجا بنویسید.' });
    };

    return (
        <SettingsPanel title="محتوا و متن‌های ثابت" icon={FileText}>
            <div className="space-y-8">
                <Field label="متن خوش‌آمدگویی">
                    <textarea
                        value={welcomeText}
                        onChange={(e) => setWelcomeText(e.target.value)}
                        rows={2}
                        className={textareaClass}
                    />
                </Field>

                <Field label="درباره سامانه">
                    <textarea
                        value={aboutText}
                        onChange={(e) => setAboutText(e.target.value)}
                        rows={3}
                        className={textareaClass}
                    />
                </Field>

                <SaveButton onClick={handleSaveTexts} saved={saved} />

                <div>
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <HelpCircle className="h-4 w-4 text-slate-500" />
                            <h4 className="text-sm font-semibold text-slate-700">
                                سؤالات متداول (FAQ)
                            </h4>
                        </div>
                        <button
                            type="button"
                            onClick={handleAddFaq}
                            className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            افزودن
                        </button>
                    </div>

                    <div className="space-y-3">
                        {content.faq.map((item, index) => (
                            <div
                                key={item.id}
                                className="rounded-xl border border-slate-200 bg-slate-50/50 p-4"
                            >
                                <div className="mb-3 flex items-center justify-between">
                                    <span className="text-xs font-medium text-slate-500">
                                        سؤال {index + 1}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => removeFaq(item.id)}
                                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                                        title="حذف"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                                <input
                                    value={item.question}
                                    onChange={(e) =>
                                        updateFaq(item.id, { question: e.target.value })
                                    }
                                    className={`${inputClass} mb-2`}
                                    placeholder="سؤال"
                                />
                                <textarea
                                    value={item.answer}
                                    onChange={(e) => updateFaq(item.id, { answer: e.target.value })}
                                    rows={2}
                                    className={textareaClass}
                                    placeholder="پاسخ"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </SettingsPanel>
    );
}
