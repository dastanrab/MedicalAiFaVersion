import { ArrowRight, Users, AlertCircle, RefreshCw } from 'lucide-react';
import { ChatRoom, ConnectionStatus } from './types';
import { getInitials } from './utils';

interface ChatHeaderProps {
    isMobile: boolean;
    isSidebarOpen: boolean;
    handleBackToChatList: () => void;
    selectedRoomData?: ChatRoom;
    onlineUsersCount: number;
    errorMsg: string;
    status: ConnectionStatus;
    handleManualReconnect: () => void;
}

export function ChatHeader({
                               isMobile, isSidebarOpen, handleBackToChatList, selectedRoomData,
                               onlineUsersCount, errorMsg, status, handleManualReconnect
                           }: ChatHeaderProps) {
    return (
        <>
            <div className={`flex-shrink-0 ${isMobile ? 'px-3 py-3 shadow-sm' : 'px-6 py-4 shadow-sm'} border-b border-gray-100 bg-white flex items-center justify-between z-10`}>
                <div className="flex items-center gap-3">
                    {(isMobile || !isSidebarOpen) && (
                        <button onClick={handleBackToChatList} className={`text-gray-400 hover:text-gray-600 ${!isMobile && 'p-1.5 -mr-1.5'}`}>
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    )}
                    <div className="relative">
                        <div className={`${isMobile ? 'w-9 h-9' : 'w-10 h-10'} rounded-full bg-blue-50 flex items-center justify-center text-blue-500 text-sm font-medium overflow-hidden`}>
                            {selectedRoomData?.opponent.avatar ? <img src={selectedRoomData.opponent.avatar} alt="avatar" className="w-full h-full object-cover" /> : getInitials(selectedRoomData?.opponent.name || '')}
                        </div>
                        {selectedRoomData?.opponent.is_online && <div className="absolute bottom-0 left-0 w-2.5 h-2.5 bg-green-400 rounded-full border border-white" />}
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-medium text-gray-800">{selectedRoomData?.opponent.name}</p>
                        <p className="text-xs text-gray-400">{selectedRoomData?.opponent.is_online ? 'آنلاین' : 'آفلاین'}</p>
                    </div>
                </div>
                {!isMobile && (
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Users className="w-4 h-4" /> {onlineUsersCount}
                    </div>
                )}
            </div>

            {errorMsg && (
                <div className="bg-red-50 px-3 py-2 text-xs text-red-500 text-center flex items-center justify-center gap-2 flex-shrink-0 z-10">
                    <AlertCircle className="w-3 h-3" />
                    {errorMsg}
                    {status !== 'connected' && status !== 'connecting' && (
                        <button onClick={handleManualReconnect} className="underline inline-flex items-center gap-1">
                            <RefreshCw className="w-3 h-3" /> تلاش مجدد
                        </button>
                    )}
                </div>
            )}
        </>
    );
}