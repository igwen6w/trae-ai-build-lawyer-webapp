import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MessageCircle, Phone, Video, Send, Mic, MicOff, 
  VideoIcon, VideoOff, Settings, MoreVertical,
  Clock, User, ArrowLeft
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useUserStore, useConsultationStore, useLawyerStore } from '@/store';
import { Consultation } from '@/types';

export default function ConsultationRoom() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { consultations } = useConsultationStore();
  const { lawyers } = useLawyerStore();
  
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{
    id: string;
    sender: 'user' | 'lawyer';
    content: string;
    timestamp: Date;
    type: 'text' | 'system';
  }>>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [consultationStatus, setConsultationStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  
  const consultation = consultations.find(c => c.id === id);
  const lawyer = consultation ? lawyers.find(l => l.id === consultation.lawyerId) : null;
  
  useEffect(() => {
    if (!consultation || !lawyer) {
      navigate('/consultations');
      return;
    }
    
    // 模拟连接过程
    const timer = setTimeout(() => {
      setConsultationStatus('connected');
      setMessages([
        {
          id: '1',
          sender: 'lawyer',
          content: `您好！我是${lawyer.name}律师，很高兴为您提供法律咨询服务。请详细描述您遇到的法律问题。`,
          timestamp: new Date(),
          type: 'text'
        }
      ]);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [consultation, lawyer, navigate]);
  
  const sendMessage = () => {
    if (!message.trim()) return;
    
    const newMessage = {
      id: Date.now().toString(),
      sender: 'user' as const,
      content: message,
      timestamp: new Date(),
      type: 'text' as const
    };
    
    setMessages(prev => [...prev, newMessage]);
    setMessage('');
    
    // 模拟律师回复
    setTimeout(() => {
      const lawyerReply = {
        id: (Date.now() + 1).toString(),
        sender: 'lawyer' as const,
        content: '我理解您的问题。根据相关法律规定，我建议您...',
        timestamp: new Date(),
        type: 'text' as const
      };
      setMessages(prev => [...prev, lawyerReply]);
    }, 1000 + Math.random() * 2000);
  };
  
  const endConsultation = () => {
    if (confirm('确定要结束咨询吗？')) {
      setConsultationStatus('ended');
      setTimeout(() => {
        navigate('/consultations');
      }, 2000);
    }
  };
  
  if (!consultation || !lawyer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">咨询不存在</h1>
            <p className="text-gray-600 mb-6">请检查咨询ID是否正确</p>
            <button
              onClick={() => navigate('/consultations')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              返回咨询列表
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/consultations')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-600" />
                </button>
                <img
                  src={lawyer.avatar}
                  alt={lawyer.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{lawyer.name}</h1>
                  <p className="text-sm text-gray-600">{lawyer.specialties.join('、')} · {lawyer.experience}年经验</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                  consultationStatus === 'connecting' ? 'bg-yellow-100 text-yellow-800' :
                  consultationStatus === 'connected' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    consultationStatus === 'connecting' ? 'bg-yellow-500' :
                    consultationStatus === 'connected' ? 'bg-green-500' :
                    'bg-gray-500'
                  }`} />
                  <span>
                    {consultationStatus === 'connecting' ? '连接中...' :
                     consultationStatus === 'connected' ? '已连接' : '已结束'}
                  </span>
                </div>
                
                <button
                  onClick={endConsultation}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  结束咨询
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg border border-gray-200 h-[600px] flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {consultation.type === 'text' && <MessageCircle className="h-5 w-5 text-blue-600" />}
                    {consultation.type === 'phone' && <Phone className="h-5 w-5 text-green-600" />}
                    {consultation.type === 'video' && <Video className="h-5 w-5 text-purple-600" />}
                    <span className="font-medium text-gray-900">
                      {consultation.type === 'text' ? '文字咨询' :
                       consultation.type === 'phone' ? '语音咨询' : '视频咨询'}
                    </span>
                  </div>
                  
                  {consultation.type !== 'text' && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        className={`p-2 rounded-lg transition-colors ${
                          isMuted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </button>
                      
                      {consultation.type === 'video' && (
                        <button
                          onClick={() => setIsVideoOn(!isVideoOn)}
                          className={`p-2 rounded-lg transition-colors ${
                            !isVideoOn ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {isVideoOn ? <VideoIcon className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {consultationStatus === 'connecting' ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">正在连接律师...</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-xs mt-1 ${
                          msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {msg.timestamp.toLocaleTimeString('zh-CN', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {/* Message Input */}
              {consultationStatus === 'connected' && (
                <div className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="输入您的问题..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!message.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Consultation Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-3">咨询信息</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">咨询ID:</span>
                  <span className="text-gray-900">{consultation.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">咨询费用:</span>
                  <span className="text-gray-900">¥{consultation.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">预约时间:</span>
                  <span className="text-gray-900">
                    {new Date(consultation.scheduledAt).toLocaleString('zh-CN')}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Problem Description */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-3">问题描述</h3>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                {consultation.description}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}