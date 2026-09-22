import React from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { User, Loader2 } from 'lucide-react';
import { DoctorData, TimeSlot, UserProfile, OtherPatient, ViewState } from './types';
import { formatDate, Stepper } from './shared';

interface Props {
    doctorData: DoctorData;
    selectedDate: string;
    selectedSlot: TimeSlot | null;
    activeTempReservation: TimeSlot | null;
    bookingFor: 'myself' | 'other';
    setBookingFor: React.Dispatch<React.SetStateAction<'myself' | 'other'>>;
    currentUser: UserProfile | null;
    otherPatient: OtherPatient;
    setOtherPatient: React.Dispatch<React.SetStateAction<OtherPatient>>;
    patientErrors: Partial<OtherPatient>;
    setPatientErrors: React.Dispatch<React.SetStateAction<Partial<OtherPatient>>>;
    orderError: string | null;
    isCreatingOrder: boolean;
    handleCreateOrder: () => void;
    setView: React.Dispatch<React.SetStateAction<ViewState>>;
    setIsTimeModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function PatientReservationForm({
                                           doctorData, selectedDate, selectedSlot, activeTempReservation,
                                           bookingFor, setBookingFor, currentUser, otherPatient, setOtherPatient,
                                           patientErrors, setPatientErrors, orderError, isCreatingOrder,
                                           handleCreateOrder, setView, setIsTimeModalOpen
                                       }: Props) {
    return (
        <div className={`pb-6 animate-in fade-in duration-200 ${activeTempReservation ? 'pt-2' : 'pt-20'}`}>
            <Stepper step={2} />
            <div className="max-w-xl mx-auto px-4 space-y-4">
                <Card className="border-0 shadow-sm rounded-2xl bg-white flex items-center justify-between p-4 gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <img
                            src={doctorData.image_url}
                            alt={doctorData.name}
                            className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                        />
                        <div className="min-w-0">
                            <h3 className="font-bold text-xs sm:text-sm text-gray-900 truncate">
                                دکتر {doctorData.name}
                            </h3>
                            <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                                {formatDate(selectedDate)} - ساعت{' '}
                                <strong className="text-blue-700 font-mono text-xs" dir="ltr">
                                    {selectedSlot?.start_time}
                                </strong>
                            </p>
                        </div>
                    </div>
                    <Button variant="ghost" onClick={() => setIsTimeModalOpen(true)} className="text-xs text-blue-600 whitespace-nowrap flex-shrink-0">
                        تغییر زمان
                    </Button>
                </Card>

                <Card className="p-5 border-0 shadow-sm rounded-2xl bg-white space-y-4">
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-1.5">
                        <User className="w-4 h-4 text-blue-600" />
                        نوبت برای چه کسی ثبت می‌شود؟
                    </h3>

                    <div className="space-y-2.5">
                        <label onClick={() => setBookingFor('myself')} className={`flex items-center justify-between p-3.5 border rounded-xl cursor-pointer transition-all gap-3 ${bookingFor === 'myself' ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-400' : 'border-gray-200'}`}>
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-gray-900 truncate">{currentUser?.name || 'خودم'}</p>
                                <p className="text-[11px] text-gray-500 mt-0.5 truncate">{currentUser?.phone || 'شماره تلفن حساب'}</p>
                            </div>
                            <input type="radio" readOnly checked={bookingFor === 'myself'} className="text-blue-600 flex-shrink-0" />
                        </label>
                        <label onClick={() => setBookingFor('other')} className={`flex items-center justify-between p-3.5 border rounded-xl cursor-pointer transition-all gap-3 ${bookingFor === 'other' ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-400' : 'border-gray-200'}`}>
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-gray-900">شخص دیگر</p>
                                <p className="text-[11px] text-gray-500 mt-0.5">ثبت نوبت برای آشنایان یا اعضای خانواده</p>
                            </div>
                            <input type="radio" readOnly checked={bookingFor === 'other'} className="text-blue-600 flex-shrink-0" />
                        </label>
                    </div>

                    {bookingFor === 'other' && (
                        <div className="pt-3 border-t border-gray-100 space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">نام و نام خانوادگی بیمار:</label>
                                <input
                                    type="text"
                                    value={otherPatient.fullName}
                                    onChange={(e) => {
                                        setOtherPatient(p => ({ ...p, fullName: e.target.value }));
                                        setPatientErrors(err => ({ ...err, fullName: undefined }));
                                    }}
                                    className={`w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 ${patientErrors.fullName ? 'border-red-400' : ''}`}
                                />
                                {patientErrors.fullName && <p className="text-red-500 text-[11px] mt-1">{patientErrors.fullName}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">کد ملی بیمار:</label>
                                <input
                                    type="text" dir="ltr" maxLength={10} inputMode="numeric"
                                    value={otherPatient.nationalCode}
                                    onChange={(e) => {
                                        const v = e.target.value.replace(/\D/g, '');
                                        setOtherPatient(p => ({ ...p, nationalCode: v }));
                                        setPatientErrors(err => ({ ...err, nationalCode: undefined }));
                                    }}
                                    className={`w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono ${patientErrors.nationalCode ? 'border-red-400' : ''}`}
                                />
                                {patientErrors.nationalCode && <p className="text-red-500 text-[11px] mt-1">{patientErrors.nationalCode}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">شماره تماس بیمار:</label>
                                <input
                                    type="tel" dir="ltr" inputMode="numeric"
                                    value={otherPatient.phone}
                                    onChange={(e) => {
                                        setOtherPatient(p => ({ ...p, phone: e.target.value }));
                                        setPatientErrors(err => ({ ...err, phone: undefined }));
                                    }}
                                    className={`w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono ${patientErrors.phone ? 'border-red-400' : ''}`}
                                />
                                {patientErrors.phone && <p className="text-red-500 text-[11px] mt-1">{patientErrors.phone}</p>}
                            </div>
                        </div>
                    )}

                    {orderError && (
                        <div className="text-red-600 text-xs text-center bg-red-50 p-3 rounded-xl border border-red-100">
                            {orderError}
                        </div>
                    )}

                    <div className="pt-4 flex items-center gap-3">
                        <Button variant="outline" onClick={() => setView('profile')} className="w-1/3 rounded-xl h-11 text-xs">بازگشت</Button>
                        <Button onClick={handleCreateOrder} disabled={isCreatingOrder} className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 text-xs font-bold flex items-center justify-center gap-2">
                            {isCreatingOrder && <Loader2 className="w-4 h-4 animate-spin" />}
                            مرحله بعد (پرداخت)
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}