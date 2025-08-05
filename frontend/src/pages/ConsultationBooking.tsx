import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  Calendar, Clock, MessageCircle, Phone, Video, 
  CreditCard, Smartphone, ChevronLeft, AlertCircle,
  CheckCircle, User, FileText
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLawyerStore, useUserStore } from '@/store';
import { mockLawyers } from '@/data/mockData';
import { ConsultationType } from '@/types';

type PaymentMethod = 'wechat' | 'alipay' | 'card';

interface TimeSlot {
  time: string;
  available: boolean;
}

const timeSlots: TimeSlot[] = [
  { time: '09:00', available: true },
  { time: '10:00', available: true },
  { time: '11:00', available: false },
  { time: '14:00', available: true },
  { time: '15:00', available: true },
  { time: '16:00', available: true },
  { time: '17:00', available: false },
  { time: '19:00', available: true },
  { time: '20:00', available: true },
];

const consultationTypes = {
  text: {
    icon: MessageCircle,
    title: '图文咨询',
    description: '文字描述问题，律师详细解答',
    duration: '24小时内回复',
    priceMultiplier: 0.5
  },
  phone: {
    icon: Phone,
    title: '电话咨询',
    description: '电话沟通，实时解答法律问题',
    duration: '30分钟',
    priceMultiplier: 0.8
  },
  video: {
    icon: Video,
    title: '视频咨询',
    description: '面对面视频交流，深度咨询',
    duration: '60分钟',
    priceMultiplier: 1
  }
};

export default function ConsultationBooking() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { lawyers, setLawyers } = useLawyerStore();
  const { user } = useUserStore();
  
  const [consultationType, setConsultationType] = useState<ConsultationType>(
    (searchParams.get('type') as ConsultationType) || 'text'
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wechat');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const lawyer = lawyers.find(l => l.id === id);
  
  useEffect(() => {
    if (lawyers.length === 0) {
      setLawyers(mockLawyers);
    }
  }, [lawyers.length, setLawyers]);
  
  if (!lawyer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">律师未找到</h1>
            <Link
              to="/lawyers"
              className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>返回律师列表</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  const consultationInfo = consultationTypes[consultationType];
  const price = Math.round(lawyer.hourlyRate * consultationInfo.priceMultiplier);
  
  // 生成未来7天的日期选项
  const dateOptions = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      value: date.toISOString().split('T')[0],
      label: i === 0 ? '今天' : i === 1 ? '明天' : date.toLocaleDateString('zh-CN', { 
        month: 'short', 
        day: 'numeric',
        weekday: 'short'
      })
    };
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('请先登录');
      return;
    }
    
    if (!selectedTime) {
      alert('请选择咨询时间');
      return;
    }
    
    if (!description.trim()) {
      alert('请描述您的法律问题');
      return;
    }
    
    setIsSubmitting(true);
    
    // 模拟提交过程
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setShowSuccess(true);
    
    // 3秒后跳转到用户中心
    setTimeout(() => {
      navigate('/user/consultations');
    }, 3000);
  };
  
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">预约成功！</h1>
            <p className="text-gray-600 mb-6">
              您的咨询预约已提交，律师将在约定时间为您提供服务。
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">律师：</span>{lawyer.name}</p>
                <p><span className="font-medium">咨询类型：</span>{consultationInfo.title}</p>
                <p><span className="font-medium">预约时间：</span>{selectedDate} {selectedTime}</p>
                <p><span className="font-medium">费用：</span>¥{price}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              正在跳转到用户中心...
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            to={`/lawyers/${id}`}
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>返回律师详情</span>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900">预约咨询</h1>
                <p className="text-gray-600 mt-1">请填写以下信息完成预约</p>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Consultation Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    咨询类型
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {Object.entries(consultationTypes).map(([type, info]) => {
                      const Icon = info.icon;
                      const isSelected = consultationType === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setConsultationType(type as ConsultationType)}
                          className={`p-4 border rounded-lg text-left transition-colors ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon className={`h-6 w-6 mb-2 ${
                            isSelected ? 'text-blue-600' : 'text-gray-400'
                          }`} />
                          <div className="font-medium text-sm">{info.title}</div>
                          <div className="text-xs text-gray-500 mt-1">{info.duration}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    选择日期
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                    {dateOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setSelectedDate(option.value)}
                        className={`p-3 border rounded-lg text-center transition-colors ${
                          selectedDate === option.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-sm font-medium">{option.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Time Selection */}
                {consultationType !== 'text' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      选择时间
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => setSelectedTime(slot.time)}
                          className={`p-3 border rounded-lg text-center transition-colors ${
                            !slot.available
                              ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                              : selectedTime === slot.time
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-sm font-medium">{slot.time}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Problem Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    问题描述 *
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="请详细描述您遇到的法律问题，以便律师更好地为您提供帮助..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    支付方式
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="payment"
                        value="wechat"
                        checked={paymentMethod === 'wechat'}
                        onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                        className="text-blue-600"
                      />
                      <Smartphone className="h-5 w-5 text-green-600" />
                      <span className="font-medium">微信支付</span>
                    </label>
                    <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="payment"
                        value="alipay"
                        checked={paymentMethod === 'alipay'}
                        onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                        className="text-blue-600"
                      />
                      <Smartphone className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">支付宝</span>
                    </label>
                    <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                        className="text-blue-600"
                      />
                      <CreditCard className="h-5 w-5 text-purple-600" />
                      <span className="font-medium">银行卡支付</span>
                    </label>
                  </div>
                </div>
                
                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting || !user}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? '提交中...' : `确认预约 (¥${price})`}
                  </button>
                  
                  {!user && (
                    <div className="mt-3 flex items-center space-x-2 text-amber-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">请先登录后再预约咨询</span>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Lawyer Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">咨询律师</h3>
              
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={lawyer.avatar}
                  alt={lawyer.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-medium text-gray-900">{lawyer.name}</h4>
                  <p className="text-sm text-gray-600">{lawyer.experience}年执业经验</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">专业领域:</span>
                  <span className="text-gray-900">{lawyer.specialties[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">执业地点:</span>
                  <span className="text-gray-900">{lawyer.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">响应时间:</span>
                  <span className="text-gray-900">{lawyer.responseTime}</span>
                </div>
              </div>
            </div>
            
            {/* Consultation Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">咨询详情</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <consultationInfo.icon className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">{consultationInfo.title}</div>
                    <div className="text-sm text-gray-600">{consultationInfo.description}</div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">服务时长:</span>
                    <span className="font-medium">{consultationInfo.duration}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">咨询费用:</span>
                    <span className="text-xl font-bold text-blue-600">¥{price}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tips */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
              <div className="flex items-start space-x-2">
                <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">咨询提示</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• 请详细描述您的法律问题</li>
                    <li>• 提供相关证据材料更有助于律师判断</li>
                    <li>• 咨询过程中请保持电话畅通</li>
                    <li>• 如需取消请提前24小时联系</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}