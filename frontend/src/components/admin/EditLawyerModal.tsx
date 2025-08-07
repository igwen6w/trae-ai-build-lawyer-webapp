import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Lawyer {
  id: number;
  name: string;
  email: string;
  phone: string;
  license_number: string;
  experience: number;
  specialties: string[];
  languages: string[];
  education: string;
  bio: string;
  hourly_rate: number;
  status: string;
  rating: number;
  reviewCount: number;
  consultationsCount: number;
  totalEarnings: number;
}

interface EditLawyerModalProps {
  lawyer: Lawyer;
  onClose: () => void;
  onSuccess: () => void;
}

const EditLawyerModal: React.FC<EditLawyerModalProps> = ({ lawyer, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    license_number: '',
    experience: 0,
    specialties: [] as string[],
    languages: [] as string[],
    education: '',
    bio: '',
    hourly_rate: 0,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 预填充现有律师数据
  useEffect(() => {
    if (lawyer) {
      setFormData({
        name: lawyer.name || '',
        email: lawyer.email || '',
        phone: lawyer.phone || '',
        license_number: lawyer.license_number || '',
        experience: lawyer.experience || 0,
        specialties: lawyer.specialties || [],
        languages: lawyer.languages || [],
        education: lawyer.education || '',
        bio: lawyer.bio || '',
        hourly_rate: lawyer.hourly_rate || 0,
      });
    }
  }, [lawyer]);

  const specialtyOptions = [
    '民事诉讼',
    '刑事辩护',
    '合同纠纷',
    '知识产权',
    '经济犯罪',
    '劳动争议',
    '房产纠纷',
    '婚姻家庭',
    '公司法务',
    '税务法律'
  ];

  const languageOptions = [
    '中文',
    '英语',
    '日语',
    '韩语',
    '法语',
    '德语',
    '西班牙语',
    '俄语'
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '姓名不能为空';
    }

    if (!formData.email.trim()) {
      newErrors.email = '邮箱不能为空';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '邮箱格式不正确';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = '电话不能为空';
    } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = '电话格式不正确';
    }

    if (!formData.license_number.trim()) {
      newErrors.license_number = '执业证号不能为空';
    }

    if (formData.experience < 0) {
      newErrors.experience = '执业年限不能为负数';
    }

    if (formData.specialties.length === 0) {
      newErrors.specialties = '至少选择一个专业领域';
    }

    if (formData.languages.length === 0) {
      newErrors.languages = '至少选择一种语言';
    }

    if (formData.hourly_rate <= 0) {
      newErrors.hourly_rate = '咨询费用必须大于0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('请先登录');
        return;
      }

      const response = await fetch(`http://localhost:3001/api/admin/lawyers/${lawyer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.status === 401) {
        toast.error('登录已过期，请重新登录');
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login';
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '更新失败');
      }

      toast.success('律师信息更新成功');
      onSuccess();
    } catch (error) {
      console.error('更新律师失败:', error);
      toast.error(error instanceof Error ? `更新失败: ${error.message}` : '更新失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSpecialtyChange = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const handleLanguageChange = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">编辑律师信息</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 基本信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                姓名 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="请输入律师姓名"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                邮箱 *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="请输入邮箱地址"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                电话 *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="请输入手机号码"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                执业证号 *
              </label>
              <input
                type="text"
                value={formData.license_number}
                onChange={(e) => setFormData(prev => ({ ...prev, license_number: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.license_number ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="请输入执业证号"
              />
              {errors.license_number && <p className="text-red-500 text-sm mt-1">{errors.license_number}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                执业年限 *
              </label>
              <input
                type="number"
                min="0"
                value={formData.experience}
                onChange={(e) => setFormData(prev => ({ ...prev, experience: parseInt(e.target.value) || 0 }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.experience ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="请输入执业年限"
              />
              {errors.experience && <p className="text-red-500 text-sm mt-1">{errors.experience}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                咨询费用 (元/小时) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.hourly_rate}
                onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: parseFloat(e.target.value) || 0 }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.hourly_rate ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="请输入咨询费用"
              />
              {errors.hourly_rate && <p className="text-red-500 text-sm mt-1">{errors.hourly_rate}</p>}
            </div>
          </div>

          {/* 专业领域 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              专业领域 *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {specialtyOptions.map((specialty) => (
                <label key={specialty} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.specialties.includes(specialty)}
                    onChange={() => handleSpecialtyChange(specialty)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{specialty}</span>
                </label>
              ))}
            </div>
            {errors.specialties && <p className="text-red-500 text-sm mt-1">{errors.specialties}</p>}
          </div>

          {/* 语言能力 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              语言能力 *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {languageOptions.map((language) => (
                <label key={language} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.languages.includes(language)}
                    onChange={() => handleLanguageChange(language)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{language}</span>
                </label>
              ))}
            </div>
            {errors.languages && <p className="text-red-500 text-sm mt-1">{errors.languages}</p>}
          </div>

          {/* 教育背景 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              教育背景
            </label>
            <input
              type="text"
              value={formData.education}
              onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入教育背景"
            />
          </div>

          {/* 个人简介 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              个人简介
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入个人简介"
            />
          </div>

          {/* 提交按钮 */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  更新中...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  更新律师
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLawyerModal;