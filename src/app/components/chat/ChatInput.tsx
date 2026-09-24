import { Send, Paperclip, Loader2 } from 'lucide-react';
import { Input } from '../ui/input';
import { ConnectionStatus } from './types';

interface ChatInputProps {
    isMobile: boolean;
    message: string;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    sendMessage: () => void;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isUploading: boolean;
    status: ConnectionStatus;
    fileInputRef: React.RefObject<HTMLInputElement>;
}

export function ChatInput({
                              isMobile, message, handleInputChange, sendMessage,
                              handleFileUpload, isUploading, status, fileInputRef
                          }: ChatInputProps) {

    return (
        <div className={`flex-shrink-0 border-t border-gray-100 bg-white z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.02)] flex items-center ${isMobile ? 'px-3 pt-3 pb-[100px] gap-2' : 'mb-20 px-6 py-4 gap-3'}`}>
            <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} accept="image/*,application/pdf,.doc,.docx" />

            {isMobile ? (
                <button onClick={sendMessage} disabled={status !== 'connected' || !message.trim() || isUploading} className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 text-white p-2.5 rounded-full flex-shrink-0 transition-colors">
                    <Send className="w-4 h-4 relative right-0.5 -scale-x-100" />
                </button>
            ) : (
                <button onClick={() => fileInputRef.current?.click()} disabled={status !== 'connected' || isUploading} className="text-gray-400 hover:text-blue-600 hover:bg-gray-50 rounded-full p-2.5 transition-colors disabled:opacity-50 flex-shrink-0">
                    {isUploading ? <Loader2 className="w-5 h-5 animate-spin text-blue-500" /> : <Paperclip className="w-5 h-5" />}
                </button>
            )}

            <Input
                value={message}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder={isUploading ? 'درحال آپلود...' : status === 'connected' ? 'پیام خود را بنویسید...' : 'در انتظار اتصال...'}
                disabled={status !== 'connected' || isUploading}
                className={`flex-1 text-right rounded-full bg-gray-50 border-transparent focus:bg-white ${isMobile ? 'text-sm h-10 px-4' : 'h-11 px-5'}`}
            />

            {isMobile ? (
                <button onClick={() => fileInputRef.current?.click()} disabled={status !== 'connected' || isUploading} className="text-gray-400 hover:text-gray-600 flex-shrink-0 p-2 disabled:opacity-50">
                    {isUploading ? <Loader2 className="w-5 h-5 animate-spin text-blue-500" /> : <Paperclip className="w-5 h-5" />}
                </button>
            ) : (
                <button onClick={sendMessage} disabled={status !== 'connected' || !message.trim() || isUploading} className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white p-3 rounded-full flex-shrink-0 shadow-sm transition-colors">
                    <Send className="w-5 h-5 relative right-0.5 -scale-x-100" />
                </button>
            )}
        </div>
    );
}