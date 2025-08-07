import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Award,
  FileText,
  Calendar,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  TrendingUp,
  Plus,
  MessageSquare,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import LawyerModal from '../../components/admin/LawyerModal';
import AddLawyerModal from '../../components/admin/AddLawyerModal';
import EditLawyerModal from '../../components/admin/EditLawyerModal';
import StatsModal from '../../components/admin/StatsModal';

interface Lawyer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  specialties: string[];
  experience: number;
  education: string;
  licenseNumber: string;
  rating: number;
  reviewCount: number;
  consultationsCount: number;
  totalEarnings: number;
  createdAt: string;
  approvedAt?: string;
  location?: string;
  bio?: string;
}

interface LawyerStats {
  name: string;
  consultations: number;
  earnings: number;
}

const LawyerManagement: React.FC = () => {
  const navigate = useNavigate();
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null);
  const [showLawyerModal, setShowLawyerModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showAddLawyerModal, setShowAddLawyerModal] = useState(false);
  const [showEditLawyerModal, setShowEditLawyerModal] = useState(false);
  const [editingLawyer, setEditingLawyer] = useState<Lawyer | null>(null);
  const [lawyerStats, setLawyerStats] = useState<LawyerStats[]>([]);

  // 检查token是否有效
  const checkTokenValidity = () => {
    const token = localStorage.getItem('adminToken');
    const adminUser = localStorage.getItem('adminUser');
    
    if (!token || !adminUser) {
      console.log('No token or admin user found, redirecting to login');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      navigate('/admin/login');
      return false;
    }
    
    try {
      // 简单的JWT token过期检查
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        throw new Error('Invalid token format');
      }
      
      const payload = JSON.parse(atob(tokenParts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (payload.exp && payload.exp < currentTime) {
        console.log('Token expired, redirecting to login');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/admin/login');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      navigate('/admin/login');
      return false;
    }
  };

  // 处理401错误的统一函数
  const handleUnauthorized = () => {
    console.log('Unauthorized access, redirecting to login');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  useEffect(() => {
    // 页面加载时检查登录状态
    if (checkTokenValidity()) {
      fetchLawyers();
    }
  }, [currentPage, searchTerm, statusFilter, specialtyFilter]);

  const fetchLawyers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      console.log('Fetching lawyers with token:', token ? 'Token exists' : 'No token');
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm,
        status: statusFilter === 'all' ? '' : statusFilter,
        specialty: specialtyFilter === 'all' ? '' : specialtyFilter
      });

      const response = await fetch(`http://localhost:3001/api/admin/lawyers?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('API Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('API Response data:', data);
        setLawyers(data.data?.lawyers || []);
        setTotalPages(Math.ceil((data.data?.pagination?.total || 0) / 10));
        return; // 成功获取数据，直接返回
      } else if (response.status === 401) {
        // 处理401未授权错误
        console.error('Unauthorized access - token invalid or expired');
        handleUnauthorized();
        return;
      } else {
        console.error('API request failed with status:', response.status);
        throw new Error(`API request failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to fetch lawyers:', error);
      // Mock data for development
      setLawyers([
        {
          id: '1',
          name: '张律师',
          email: 'zhang.lawyer@example.com',
          phone: '13800138001',
          status: 'pending',
          specialties: ['民事诉讼', '合同纠纷'],
          experience: 8,
          education: '北京大学法学院',
          licenseNumber: 'A20240001',
          rating: 4.8,
          reviewCount: 156,
          consultationsCount: 234,
          totalEarnings: 125000,
          createdAt: '2024-01-15T10:30:00Z',
          location: '北京市',
          bio: '专业从事民事诉讼和合同纠纷处理，具有丰富的实战经验。'
        },
        {
          id: '2',
          name: '李律师',
          email: 'li.lawyer@example.com',
          phone: '13900139001',
          status: 'approved',
          specialties: ['刑事辩护', '经济犯罪'],
          experience: 12,
          education: '清华大学法学院',
          licenseNumber: 'A20240002',
          rating: 4.9,
          reviewCount: 203,
          consultationsCount: 345,
          totalEarnings: 198000,
          createdAt: '2024-01-10T09:15:00Z',
          approvedAt: '2024-01-12T14:20:00Z',
          location: '上海市',
          bio: '资深刑事辩护律师，擅长处理各类经济犯罪案件。'
        },
        {
          id: '3',
          name: '王律师',
          email: 'wang.lawyer@example.com',
          phone: '13700137001',
          status: 'rejected',
          specialties: ['知识产权'],
          experience: 5,
          education: '中国政法大学',
          licenseNumber: 'A20240003',
          rating: 0,
          reviewCount: 0,
          consultationsCount: 0,
          totalEarnings: 0,
          createdAt: '2024-01-05T11:20:00Z',
          location: '广州市',
          bio: '专注知识产权保护和相关法律服务。'
        }
      ]);
      
      setLawyerStats([
        { name: '张律师', consultations: 234, earnings: 125000 },
        { name: '李律师', consultations: 345, earnings: 198000 },
        { name: '赵律师', consultations: 189, earnings: 95000 },
        { name: '钱律师', consultations: 267, earnings: 156000 },
        { name: '孙律师', consultations: 198, earnings: 112000 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (lawyerId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:3001/api/admin/lawyers/${lawyerId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setLawyers(lawyers.map(lawyer => 
          lawyer.id === lawyerId ? { 
            ...lawyer, 
            status: newStatus as any,
            approvedAt: newStatus === 'approved' ? new Date().toISOString() : lawyer.approvedAt
          } : lawyer
        ));
      } else if (response.status === 401) {
        console.error('Unauthorized access when updating lawyer status');
        handleUnauthorized();
        return;
      } else {
        console.error('Failed to update lawyer status, status:', response.status);
      }
    } catch (error) {
      console.error('Failed to update lawyer status:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: '待审核', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { label: '已通过', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { label: '已拒绝', color: 'bg-red-100 text-red-800', icon: XCircle },
      suspended: { label: '已暂停', color: 'bg-gray-100 text-gray-800', icon: XCircle }
    };

    // 添加调试信息
    console.log('Status value:', status, 'Type:', typeof status);
    
    const config = statusConfig[status as keyof typeof statusConfig];
    
    // 如果状态不存在，使用默认配置
    if (!config) {
      console.warn('Unknown status:', status, 'Using default config');
      const defaultConfig = { label: status || '未知', color: 'bg-gray-100 text-gray-800', icon: XCircle };
      const Icon = defaultConfig.icon;
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${defaultConfig.color}`}>
          <Icon className="h-3 w-3 mr-1" />
          {defaultConfig.label}
        </span>
      );
    }
    
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return '¥0';
    }
    return `¥${amount.toLocaleString()}`;
  };

  const LawyerModal: React.FC<{ lawyer: Lawyer; onClose: () => void }> = ({ lawyer, onClose }) => (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative bg-white rounded-lg max-w-4xl w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">律师详情</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircle className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xl font-medium text-gray-700">
                    {lawyer.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">{lawyer.name}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatusBadge(lawyer.status)}
                    {lawyer.rating > 0 && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">
                          {lawyer.rating} ({lawyer.reviewCount} 评价)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{lawyer.email}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">电话</label>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{lawyer.phone || '未提供'}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">地区</label>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{lawyer.location || '未提供'}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">执业年限</label>
                  <span className="text-sm text-gray-900">{lawyer.experience} 年</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">专业领域</label>
                <div className="flex flex-wrap gap-2">
                  {lawyer.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">教育背景</label>
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{lawyer.education}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">执业证号</label>
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{lawyer.licenseNumber}</span>
                </div>
              </div>

              {lawyer.bio && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">个人简介</label>
                  <p className="text-sm text-gray-900">{lawyer.bio}</p>
                </div>
              )}
            </div>

            {/* Stats & Actions */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-3">业绩统计</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                      <span className="text-2xl font-bold text-gray-900">{lawyer.consultationsCount}</span>
                    </div>
                    <p className="text-sm text-gray-600">咨询次数</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-2xl font-bold text-gray-900">
                        {formatCurrency(lawyer.totalEarnings)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">总收入</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-3">时间信息</h5>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">申请时间:</span>
                    <span className="text-sm text-gray-900">{formatDate(lawyer.createdAt)}</span>
                  </div>
                  {lawyer.approvedAt && (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-600">通过时间:</span>
                      <span className="text-sm text-gray-900">{formatDate(lawyer.approvedAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {lawyer.status === 'pending' && (
                <div className="space-y-2">
                  <button
                    onClick={() => handleStatusChange(lawyer.id, 'approved')}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    通过审核
                  </button>
                  <button
                    onClick={() => handleStatusChange(lawyer.id, 'rejected')}
                    className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    拒绝申请
                  </button>
                </div>
              )}
              
              {lawyer.status === 'approved' && (
                <button
                  onClick={() => handleStatusChange(lawyer.id, 'suspended')}
                  className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  暂停执业
                </button>
              )}
              
              {lawyer.status === 'suspended' && (
                <button
                  onClick={() => handleStatusChange(lawyer.id, 'approved')}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  恢复执业
                </button>
              )}
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const AddLawyerModal: React.FC<{ onClose: () => void; onSuccess: () => void }> = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      phone: '',
      specialties: [] as string[],
      experience: 0,
      education: '',
      licenseNumber: '',
      location: '',
      bio: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);

    const availableSpecialties = [
      '民事诉讼', '刑事辩护', '合同纠纷', '知识产权', '经济犯罪',
      '劳动争议', '婚姻家庭', '房产纠纷', '公司法务', '税务法律'
    ];

    const validateForm = () => {
      const newErrors: Record<string, string> = {};

      if (!formData.name.trim()) {
        newErrors.name = '请输入律师姓名';
      }

      if (!formData.email.trim()) {
        newErrors.email = '请输入邮箱地址';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = '请输入有效的邮箱地址';
      }

      if (!formData.phone.trim()) {
        newErrors.phone = '请输入手机号码';
      } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
        newErrors.phone = '请输入有效的手机号码';
      }

      if (selectedSpecialties.length === 0) {
        newErrors.specialties = '请至少选择一个专业领域';
      }

      if (!formData.experience || formData.experience < 0) {
        newErrors.experience = '请输入有效的执业年限';
      }

      if (!formData.education.trim()) {
        newErrors.education = '请输入教育背景';
      }

      if (!formData.licenseNumber.trim()) {
        newErrors.licenseNumber = '请输入执业证号';
      }

      if (!formData.location.trim()) {
        newErrors.location = '请输入执业地区';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);
      
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('http://localhost:3001/api/admin/lawyers', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...formData,
            specialties: selectedSpecialties
          })
        });

        if (response.ok) {
          onSuccess();
          // 显示成功提示
          alert('律师添加成功！');
        } else if (response.status === 401) {
          console.error('Unauthorized access when creating lawyer');
          handleUnauthorized();
          return;
        } else {
          const errorData = await response.json();
          alert(`添加失败: ${errorData.message || '未知错误'}`);
        }
      } catch (error) {
        console.error('Failed to create lawyer:', error);
        alert('添加失败，请检查网络连接');
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleSpecialtyToggle = (specialty: string) => {
      setSelectedSpecialties(prev => 
        prev.includes(specialty)
          ? prev.filter(s => s !== specialty)
          : [...prev, specialty]
      );
    };

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
          <div className="relative bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">添加新律师</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 基本信息 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    律师姓名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="请输入律师姓名"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    邮箱地址 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="请输入邮箱地址"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    手机号码 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="请输入手机号码"
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    执业年限 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.experience ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="请输入执业年限"
                  />
                  {errors.experience && <p className="text-red-500 text-xs mt-1">{errors.experience}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    教育背景 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.education}
                    onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.education ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="如：北京大学法学院"
                  />
                  {errors.education && <p className="text-red-500 text-xs mt-1">{errors.education}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    执业证号 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.licenseNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="请输入执业证号"
                  />
                  {errors.licenseNumber && <p className="text-red-500 text-xs mt-1">{errors.licenseNumber}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  执业地区 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.location ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="如：北京市、上海市"
                />
                {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
              </div>

              {/* 专业领域 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  专业领域 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableSpecialties.map((specialty) => (
                    <label key={specialty} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedSpecialties.includes(specialty)}
                        onChange={() => handleSpecialtyToggle(specialty)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{specialty}</span>
                    </label>
                  ))}
                </div>
                {errors.specialties && <p className="text-red-500 text-xs mt-1">{errors.specialties}</p>}
              </div>

              {/* 个人简介 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  个人简介
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请简要介绍律师的专业背景和经验..."
                />
              </div>

              {/* 提交按钮 */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '添加中...' : '添加律师'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const StatsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative bg-white rounded-lg max-w-4xl w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">律师业绩统计</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircle className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">咨询量排行</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={lawyerStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="consultations" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">收入排行</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={lawyerStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`¥${value}`, '收入']} />
                  <Bar dataKey="earnings" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">律师管理</h1>
          <p className="text-gray-600 mt-1">管理律师申请、审核和业绩</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddLawyerModal(true)}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>添加律师</span>
          </button>
          <button
            onClick={() => setShowStatsModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <TrendingUp className="h-4 w-4" />
            <span>业绩统计</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索律师..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">所有状态</option>
            <option value="pending">待审核</option>
            <option value="approved">已通过</option>
            <option value="rejected">已拒绝</option>
            <option value="suspended">已暂停</option>
          </select>
          
          <select
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">所有专业</option>
            <option value="民事诉讼">民事诉讼</option>
            <option value="刑事辩护">刑事辩护</option>
            <option value="合同纠纷">合同纠纷</option>
            <option value="知识产权">知识产权</option>
            <option value="经济犯罪">经济犯罪</option>
          </select>
          
          <button className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Filter className="h-4 w-4 mr-2" />
            筛选
          </button>
        </div>
      </div>

      {/* Lawyers Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  律师信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  专业领域
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  评分
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  业绩
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {lawyers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <div className="text-lg font-medium mb-2">暂无律师数据</div>
                      <div className="text-sm">请检查网络连接或稍后重试</div>
                    </div>
                  </td>
                </tr>
              ) : (
                lawyers.map((lawyer) => (
                  <tr key={lawyer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {lawyer.name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{lawyer.name}</div>
                        <div className="text-sm text-gray-500">{lawyer.experience}年经验</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {lawyer.specialties.slice(0, 2).map((specialty, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                      {lawyer.specialties.length > 2 && (
                        <span className="text-xs text-gray-500">+{lawyer.specialties.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(lawyer.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {lawyer.rating > 0 ? (
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-900">{lawyer.rating}</span>
                        <span className="text-sm text-gray-500">({lawyer.reviewCount})</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">暂无评分</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div>{lawyer.consultationsCount} 次咨询</div>
                      <div className="text-gray-500">{formatCurrency(lawyer.totalEarnings)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => {
                          setSelectedLawyer(lawyer);
                          setShowLawyerModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="查看详情"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingLawyer(lawyer);
                          setShowEditLawyerModal(true);
                        }}
                        className="text-green-600 hover:text-green-900"
                        title="编辑律师"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              显示第 {(currentPage - 1) * 10 + 1} - {Math.min(currentPage * 10, lawyers.length)} 条，共 {lawyers.length} 条
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一页
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一页
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lawyer Modal */}
      {showLawyerModal && selectedLawyer && (
        <LawyerModal
          lawyer={selectedLawyer}
          onClose={() => {
            setShowLawyerModal(false);
            setSelectedLawyer(null);
          }}
        />
      )}

      {/* Add Lawyer Modal */}
      {showAddLawyerModal && (
        <AddLawyerModal
          onClose={() => setShowAddLawyerModal(false)}
          onSuccess={() => {
            setShowAddLawyerModal(false);
            fetchLawyers(); // 刷新律师列表
          }}
        />
      )}

      {/* Edit Lawyer Modal */}
      {showEditLawyerModal && editingLawyer && (
        <EditLawyerModal
          lawyer={editingLawyer}
          onClose={() => {
            setShowEditLawyerModal(false);
            setEditingLawyer(null);
          }}
          onSuccess={() => {
            setShowEditLawyerModal(false);
            setEditingLawyer(null);
            fetchLawyers(); // 刷新律师列表
          }}
        />
      )}

      {/* Stats Modal */}
      {showStatsModal && (
        <StatsModal onClose={() => setShowStatsModal(false)} />
      )}
    </div>
  );
};

export default LawyerManagement;