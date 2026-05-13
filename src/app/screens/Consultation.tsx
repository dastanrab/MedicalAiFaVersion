import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { 
  ArrowLeft, 
  Video, 
  Phone, 
  Send, 
  Paperclip,
  MoreVertical,
  Mic
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar } from '../components/ui/avatar';

const doctorData: any = {
  1: {
    name: 'Dr. Sarah Johnson',
    specialty: 'General Physician',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop',
    status: 'online',
  },
};

const chatMessages = [
  {
    id: 1,
    sender: 'doctor',
    message: 'Hello! How can I help you today?',
    time: '10:30 AM',
  },
  {
    id: 2,
    sender: 'user',
    message: 'Hi Doctor, I have been experiencing headaches for the past few days.',
    time: '10:32 AM',
  },
  {
    id: 3,
    sender: 'doctor',
    message: 'I understand. Can you describe the type of headache? Is it throbbing or constant?',
    time: '10:33 AM',
  },
  {
    id: 4,
    sender: 'user',
    message: 'It\'s a constant dull ache, mostly on my forehead.',
    time: '10:35 AM',
  },
  {
    id: 5,
    sender: 'doctor',
    message: 'Have you been getting enough sleep? Stress and lack of sleep can often cause tension headaches.',
    time: '10:36 AM',
  },
];

export function Consultation() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(chatMessages);
  const [activeTab, setActiveTab] = useState('chat');

  const doctor = doctorData[id as string] || doctorData[1];

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        sender: 'user',
        message: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...messages, newMessage]);
      setMessage('');

      // Simulate doctor response
      setTimeout(() => {
        const doctorResponse = {
          id: messages.length + 2,
          sender: 'doctor',
          message: 'Thank you for that information. Let me check your symptoms.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, doctorResponse]);
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 shadow-sm">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              
              <div className="relative">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              </div>

              <div>
                <h2 className="text-lg text-gray-900">{doctor.name}</h2>
                <p className="text-sm text-green-600">{doctor.status}</p>
              </div>
            </div>

            <button className="text-gray-600 hover:text-gray-900">
              <MoreVertical className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b px-6">
        <div className="max-w-md mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="chat" className="flex-1">
                Chat
              </TabsTrigger>
              <TabsTrigger value="call" className="flex-1">
                Voice Call
              </TabsTrigger>
              <TabsTrigger value="video" className="flex-1">
                Video Call
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-md mx-auto h-full">
          {activeTab === 'chat' && (
            <div className="h-full flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] ${
                        msg.sender === 'user'
                          ? 'bg-blue-500 text-white rounded-2xl rounded-tr-md'
                          : 'bg-white text-gray-900 rounded-2xl rounded-tl-md shadow-md'
                      } px-4 py-3`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <div className="bg-white border-t px-6 py-4">
                <div className="flex items-center gap-2">
                  <button className="text-gray-600 hover:text-gray-900">
                    <Paperclip className="w-6 h-6" />
                  </button>

                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type your message..."
                    className="flex-1"
                  />

                  <button
                    onClick={sendMessage}
                    className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'call' && (
            <div className="h-full flex items-center justify-center p-6">
              <Card className="p-8 text-center shadow-xl border-0 max-w-sm">
                <div className="w-32 h-32 mx-auto mb-6 relative">
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                  <div className="absolute inset-0 rounded-full bg-green-500 opacity-20 animate-pulse" />
                </div>

                <h2 className="text-2xl text-gray-900 mb-2">{doctor.name}</h2>
                <p className="text-gray-600 mb-6">Voice Call</p>

                <div className="space-y-3">
                  <Button className="w-full h-12 bg-green-500 hover:bg-green-600 text-white">
                    <Phone className="w-5 h-5 mr-2" />
                    Start Voice Call
                  </Button>

                  <Button variant="outline" className="w-full h-12">
                    <Mic className="w-5 h-5 mr-2" />
                    Mute
                  </Button>
                </div>

                <p className="text-sm text-gray-500 mt-6">
                  You will be charged {doctor.consultationFee || '$80'} for this consultation
                </p>
              </Card>
            </div>
          )}

          {activeTab === 'video' && (
            <div className="h-full flex items-center justify-center p-6">
              <Card className="p-8 text-center shadow-xl border-0 max-w-sm">
                <div className="w-32 h-32 mx-auto mb-6 relative">
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                  <div className="absolute inset-0 rounded-full bg-blue-500 opacity-20 animate-pulse" />
                </div>

                <h2 className="text-2xl text-gray-900 mb-2">{doctor.name}</h2>
                <p className="text-gray-600 mb-6">Video Consultation</p>

                <div className="space-y-3">
                  <Button className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white">
                    <Video className="w-5 h-5 mr-2" />
                    Start Video Call
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="h-12">
                      <Video className="w-5 h-5 mr-2" />
                      Camera
                    </Button>
                    <Button variant="outline" className="h-12">
                      <Mic className="w-5 h-5 mr-2" />
                      Mic
                    </Button>
                  </div>
                </div>

                <p className="text-sm text-gray-500 mt-6">
                  You will be charged {doctor.consultationFee || '$80'} for this consultation
                </p>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
