import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  User, Settings, MessageCircle, Clock, Calendar,
  Star, FileText, CreditCard, Bell, Shield,
  ChevronRight, Phone, Video, CheckCircle,
  XCircle, AlertCircle, X
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Rating from '@/components/Rating';
import { useUserStore, useConsultationStore, useLawyerStore, useReviewStore } from '@/store';
import { mockConsultations, mockLawyers } from '@/data/mockData';
import { Consultation } from '@/types';

type TabType = 'consultations' | 'profile' | 'settings';

const consultationTypeIcons = {
  text: MessageCircle,
  phone: Phone,
  video: Video
};

const consultationTypeNames = {
  text: '图文咨询',
  phone: '电话咨询',
  video: '视频咨询'
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const statusNames = {
  pending: '待确认',
  confirmed: '已确认',
  completed: '已完成',
  cancelled: '已取消'
};

const statusIcons = {
  pending: AlertCircle,
  confirmed: CheckCircle,
  completed: CheckCircle,
  cancelled: XCircle
};

export default function UserCenter() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 根据当前路径设置默认标签页
  const getDefaultTab = (): TabType => {
    if (location.pathname === '/profile') {
      return 'profile';
    } else if (location.pathname.startsWith('/user/profile')) {
      return 'profile';
    } else if (location.pathname.startsWith('/user/settings')) {
      return 'settings';
    }
    return 'consultations';
  };
  
  const [activeTab, setActiveTab] = useState<TabType>(getDefaultTab());
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [consultationToCancel, setConsultationToCancel] = useState<Consultation | null>(null);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showBindPhoneModal, setShowBindPhoneModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const { user } = useUserStore();
  const { consultations, setConsultations } = useConsultationStore();
  const { lawyers, setLawyers } = useLawyerStore();
  const { addReview } = useReviewStore();
  
  // 监听路由变化，更新activeTab
  useEffect(() => {
    setActiveTab(getDefaultTab());
  }, [location.pathname]);

  useEffect(() => {
    if (consultations.length === 0) {
      setConsultations(mockConsultations);
    }
    if (lawyers.length === 0) {
      setLawyers(mockLawyers);
    }
  }, [consultations.length, lawyers.length, setConsultations, setLawyers]);

  const handleOpenReviewModal = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setShowReviewModal(true);
    setReviewRating(5);
    setReviewComment('');
  };

  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setSelectedConsultation(null);
    setReviewRating(5);
    setReviewComment('');
  };

  const handleEnterConsultation = (consultation: Consultation) => {
    // 跳转到咨询室页面
    navigate(`/consultation/room/${consultation.id}`);
  };

  const handleCancelConsultation = (consultation: Consultation) => {
    setConsultationToCancel(consultation);
    setShowCancelModal(true);
  };

  const confirmCancelConsultation = () => {
    if (consultationToCancel) {
      // 更新咨询状态为已取消
      const updatedConsultations = consultations.map(c => 
        c.id === consultationToCancel.id 
          ? { ...c, status: 'cancelled' as const }
          : c
      );
      
      // 这里应该调用API更新数据库，现在只是模拟
      alert('咨询已成功取消');
      
      setShowCancelModal(false);
      setConsultationToCancel(null);
      
      // 刷新页面数据
      window.location.reload();
    }
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setConsultationToCancel(null);
  };

  const handleSubmitReview = () => {
    if (!selectedConsultation || !user) return;
    
    const lawyer = lawyers.find(l => l.id === selectedConsultation.lawyerId);
    if (!lawyer) return;

    const newReview = {
      id: Date.now().toString(),
      lawyerId: selectedConsultation.lawyerId,
      clientId: user.id,
      consultationId: selectedConsultation.id,
      rating: reviewRating,
      comment: reviewComment,
      createdAt: new Date().toISOString(),
      clientName: user.name,
      clientAvatar: user.avatar
    };

    addReview(newReview);
    handleCloseReviewModal();
    alert('评价提交成功！');
  };

  const handleChangePassword = () => {
    setShowChangePasswordModal(true);
  };

  const handleBindPhone = () => {
    setShowBindPhoneModal(true);
  };

  const handleCloseChangePasswordModal = () => {
    setShowChangePasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleCloseBindPhoneModal = () => {
    setShowBindPhoneModal(false);
    setNewPhoneNumber('');
    setVerificationCode('');
  };

  const handleSubmitChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('请填写所有密码字段');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('新密码和确认密码不匹配');
      return;
    }
    if (newPassword.length < 6) {
      alert('新密码长度至少6位');
      return;
    }
    // 这里应该调用API更新密码
    alert('密码修改成功！');
    handleCloseChangePasswordModal();
  };

  const handleSubmitBindPhone = () => {
    if (!newPhoneNumber || !verificationCode) {
      alert('请填写手机号和验证码');
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(newPhoneNumber)) {
      alert('请输入正确的手机号格式');
      return;
    }
    // 这里应该调用API绑定手机
    alert('手机绑定成功！');
    handleCloseBindPhoneModal();
  };

  const sendVerificationCode = () => {
    if (!newPhoneNumber) {
      alert('请先输入手机号');
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(newPhoneNumber)) {
      alert('请输入正确的手机号格式');
      return;
    }
    // 这里应该调用API发送验证码
    alert('验证码已发送');
  };
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">请先登录</h1>
            <p className="text-gray-600 mb-6">登录后可查看您的咨询记录和个人信息</p>
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              返回首页
            </Link>
          </div>
      </div>
      
      <Footer />
    </div>
  );
}
  
  const userConsultations = consultations.filter(c => c.clientId === user.id);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* User Profile Header */}
              <div className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <div className="flex items-center space-x-4">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-16 w-16 rounded-full object-cover border-4 border-white/20"
                  />
                  <div>
                    <h2 className="text-xl font-bold">{user.name}</h2>
                    <p className="text-blue-100">{user.email}</p>
                  </div>
                </div>
              </div>
              
              {/* Navigation Menu */}
              <nav className="p-2">
                <button
                  onClick={() => {
                    setActiveTab('consultations');
                    navigate('/consultations');
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === 'consultations'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <MessageCircle className="h-5 w-5" />
                  <span className="font-medium">我的咨询</span>
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </button>
                
                <button
                  onClick={() => {
                    setActiveTab('profile');
                    navigate('/profile');
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <User className="h-5 w-5" />
                  <span className="font-medium">个人信息</span>
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </button>
                
                <button
                  onClick={() => {
                    setActiveTab('settings');
                    navigate('/user/settings');
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === 'settings'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Settings className="h-5 w-5" />
                  <span className="font-medium">账户设置</span>
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </button>
              </nav>
            </div>
            
            {/* Quick Stats */}
            <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">统计信息</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">总咨询次数</span>
                  <span className="font-bold text-blue-600">{userConsultations.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">已完成咨询</span>
                  <span className="font-bold text-green-600">
                    {userConsultations.filter(c => c.status === 'completed').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">待处理咨询</span>
                  <span className="font-bold text-yellow-600">
                    {userConsultations.filter(c => c.status === 'pending' || c.status === 'confirmed').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'consultations' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-gray-900">我的咨询</h1>
                    <p className="text-gray-600 mt-1">查看和管理您的咨询记录</p>
                  </div>
                  
                  <div className="p-6">
                    {userConsultations.length > 0 ? (
                      <div className="space-y-4">
                        {userConsultations.map((consultation) => {
                          const lawyer = lawyers.find(l => l.id === consultation.lawyerId);
                          const TypeIcon = consultationTypeIcons[consultation.type];
                          const StatusIcon = statusIcons[consultation.status];
                          
                          return (
                            <div
                              key={consultation.id}
                              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start space-x-4">
                                  <img
                                    src={lawyer?.avatar}
                                    alt={lawyer?.name}
                                    className="h-12 w-12 rounded-full object-cover"
                                  />
                                  <div>
                                    <h3 className="font-semibold text-gray-900">{lawyer?.name}</h3>
                                    <p className="text-sm text-gray-600">{lawyer?.specialties[0]}</p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    statusColors[consultation.status]
                                  }`}>
                                    <StatusIcon className="h-3 w-3 mr-1" />
                                    {statusNames[consultation.status]}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <TypeIcon className="h-4 w-4" />
                                  <span>{consultationTypeNames[consultation.type]}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <Calendar className="h-4 w-4" />
                                  <span>{new Date(consultation.scheduledAt).toLocaleString('zh-CN')}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <CreditCard className="h-4 w-4" />
                                  <span>¥{consultation.amount}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <Clock className="h-4 w-4" />
                                  <span>创建于 {new Date(consultation.createdAt).toLocaleDateString('zh-CN')}</span>
                                </div>
                              </div>
                              
                              <div className="mb-4">
                                <h4 className="font-medium text-gray-900 mb-2">问题描述</h4>
                                <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">
                                  {consultation.description}
                                </p>
                              </div>
                              
                              {consultation.status === 'completed' && (
                                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                  <div className="flex items-center space-x-2">
                                    <Star className="h-4 w-4 text-yellow-400" />
                                    <span className="text-sm text-gray-600">为本次咨询评分</span>
                                  </div>
                                  <button 
                                    onClick={() => handleOpenReviewModal(consultation)}
                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                  >
                                    写评价
                                  </button>
                                </div>
                              )}
                              
                              {consultation.status === 'confirmed' && (
                                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                  <span className="text-sm text-gray-600">咨询即将开始，请保持联系方式畅通</span>
                                  <div className="space-x-2">
                                    <button 
                                      onClick={() => handleCancelConsultation(consultation)}
                                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                                    >
                                      取消咨询
                                    </button>
                                    <button 
                                      onClick={() => handleEnterConsultation(consultation)}
                                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                                    >
                                      进入咨询
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">暂无咨询记录</h3>
                        <p className="text-gray-600 mb-6">您还没有进行过法律咨询</p>
                        <Link
                          to="/lawyers"
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          立即咨询
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h1 className="text-2xl font-bold text-gray-900">个人信息</h1>
                  <p className="text-gray-600 mt-1">管理您的个人资料</p>
                </div>
                
                <div className="p-6">
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          姓名
                        </label>
                        <input
                          type="text"
                          defaultValue={user.name}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          邮箱
                        </label>
                        <input
                          type="email"
                          defaultValue={user.email}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          手机号
                        </label>
                        <input
                          type="tel"
                          defaultValue={user.phone}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          所在地区
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                          <option>北京市</option>
                          <option>上海市</option>
                          <option>广州市</option>
                          <option>深圳市</option>
                          <option>杭州市</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        个人简介
                      </label>
                      <textarea
                        rows={4}
                        placeholder="简单介绍一下自己..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        保存更改
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            
            {activeTab === 'settings' && (
              <div className="space-y-6">
                {/* Account Settings */}
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">账户设置</h2>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Bell className="h-5 w-5 text-gray-400" />
                        <div>
                          <h3 className="font-medium text-gray-900">消息通知</h3>
                          <p className="text-sm text-gray-600">接收咨询相关的通知消息</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Shield className="h-5 w-5 text-gray-400" />
                        <div>
                          <h3 className="font-medium text-gray-900">隐私保护</h3>
                          <p className="text-sm text-gray-600">保护您的个人信息不被泄露</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Security Settings */}
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">安全设置</h2>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <button 
                      onClick={handleChangePassword}
                      className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Shield className="h-5 w-5 text-blue-600" />
                        <div className="text-left">
                          <h3 className="font-medium text-gray-900">修改密码</h3>
                          <p className="text-sm text-gray-600">定期更换密码保护账户安全</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </button>
                    
                    <button 
                      onClick={handleBindPhone}
                      className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-green-600" />
                        <div className="text-left">
                          <h3 className="font-medium text-gray-900">绑定手机</h3>
                          <p className="text-sm text-gray-600">已绑定: {user.phone}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Cancel Consultation Modal */}
      {showCancelModal && consultationToCancel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">确认取消咨询</h3>
              <button
                onClick={closeCancelModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-2">您确定要取消以下咨询吗？</p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium text-gray-900">
                  律师: {lawyers.find(l => l.id === consultationToCancel.lawyerId)?.name}
                </p>
                <p className="text-sm text-gray-600">
                  咨询类型: {consultationToCancel.type === 'text' ? '文字咨询' : 
                           consultationToCancel.type === 'phone' ? '语音咨询' : '视频咨询'}
                </p>
                <p className="text-sm text-gray-600">
                  预约时间: {new Date(consultationToCancel.scheduledAt).toLocaleString('zh-CN')}
                </p>
              </div>
              <p className="text-sm text-red-600 mt-2">
                ⚠️ 取消后将无法恢复，请谨慎操作
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={closeCancelModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                保留咨询
              </button>
              <button
                onClick={confirmCancelConsultation}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                确认取消
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Review Modal */}
      {showReviewModal && selectedConsultation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">评价咨询</h3>
              <button
                onClick={handleCloseReviewModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  评分
                </label>
                <Rating
                   rating={reviewRating}
                   onRatingChange={setReviewRating}
                   interactive={true}
                   size="lg"
                 />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  评价内容
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                  placeholder="请分享您的咨询体验..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleCloseReviewModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmitReview}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                提交评价
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">修改密码</h3>
              <button
                onClick={handleCloseChangePasswordModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  当前密码
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="请输入当前密码"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  新密码
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="请输入新密码（至少6位）"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  确认新密码
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="请再次输入新密码"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleCloseChangePasswordModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmitChangePassword}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                确认修改
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Bind Phone Modal */}
      {showBindPhoneModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">绑定手机</h3>
              <button
                onClick={handleCloseBindPhoneModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  新手机号
                </label>
                <input
                  type="tel"
                  value={newPhoneNumber}
                  onChange={(e) => setNewPhoneNumber(e.target.value)}
                  placeholder="请输入新的手机号"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  验证码
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="请输入验证码"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={sendVerificationCode}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
                  >
                    发送验证码
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleCloseBindPhoneModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmitBindPhone}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                确认绑定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}