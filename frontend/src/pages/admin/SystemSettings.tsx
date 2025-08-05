import React, { useState, useEffect } from 'react';
import { Save, Settings, Shield, Users, Bell, Database, Mail, Key, Globe, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface SystemConfig {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  supportPhone: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailVerificationRequired: boolean;
  maxConsultationDuration: number;
  consultationPriceRange: {
    min: number;
    max: number;
  };
  paymentMethods: string[];
  autoApprovalEnabled: boolean;
  reviewModerationEnabled: boolean;
}

interface AdminRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  createdAt: string;
  isDefault: boolean;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

const SystemSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'permissions' | 'notifications' | 'security'>('general');
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    siteName: '法律咨询平台',
    siteDescription: '专业的在线法律咨询服务平台',
    contactEmail: 'contact@lawconsult.com',
    supportPhone: '400-123-4567',
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerificationRequired: true,
    maxConsultationDuration: 60,
    consultationPriceRange: { min: 100, max: 1000 },
    paymentMethods: ['alipay', 'wechat', 'bank'],
    autoApprovalEnabled: false,
    reviewModerationEnabled: true
  });
  
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRole, setSelectedRole] = useState<AdminRole | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Mock data
  useEffect(() => {
    const mockRoles: AdminRole[] = [
      {
        id: '1',
        name: '超级管理员',
        description: '拥有系统所有权限的最高级别管理员',
        permissions: ['user_management', 'lawyer_management', 'content_management', 'system_settings', 'financial_management'],
        userCount: 2,
        createdAt: '2024-01-01 00:00:00',
        isDefault: true
      },
      {
        id: '2',
        name: '内容管理员',
        description: '负责内容审核和用户管理的管理员',
        permissions: ['user_management', 'content_management'],
        userCount: 5,
        createdAt: '2024-01-01 00:00:00',
        isDefault: true
      },
      {
        id: '3',
        name: '财务管理员',
        description: '负责财务和支付相关功能的管理员',
        permissions: ['financial_management', 'payment_management'],
        userCount: 3,
        createdAt: '2024-01-01 00:00:00',
        isDefault: false
      }
    ];

    const mockPermissions: Permission[] = [
      { id: 'user_management', name: '用户管理', description: '管理用户账户、状态和信息', category: '用户管理' },
      { id: 'lawyer_management', name: '律师管理', description: '管理律师资质、审核和业绩', category: '律师管理' },
      { id: 'content_management', name: '内容管理', description: '审核评价、处理举报和内容监控', category: '内容管理' },
      { id: 'consultation_management', name: '咨询管理', description: '监控咨询过程和质量评估', category: '咨询管理' },
      { id: 'payment_management', name: '支付管理', description: '处理支付、退款和财务记录', category: '财务管理' },
      { id: 'financial_management', name: '财务管理', description: '查看财务报表和统计数据', category: '财务管理' },
      { id: 'system_settings', name: '系统设置', description: '修改系统配置和权限管理', category: '系统管理' },
      { id: 'admin_management', name: '管理员管理', description: '管理管理员账户和角色分配', category: '系统管理' }
    ];

    setRoles(mockRoles);
    setPermissions(mockPermissions);
  }, []);

  const handleConfigChange = (key: keyof SystemConfig, value: any) => {
    setSystemConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveConfig = async () => {
    setSaveStatus('saving');
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const handleRolePermissionChange = (roleId: string, permissionId: string, checked: boolean) => {
    setRoles(prev => prev.map(role => {
      if (role.id === roleId) {
        const newPermissions = checked 
          ? [...role.permissions, permissionId]
          : role.permissions.filter(p => p !== permissionId);
        return { ...role, permissions: newPermissions };
      }
      return role;
    }));
  };

  const getPermissionsByCategory = () => {
    const categories: { [key: string]: Permission[] } = {};
    permissions.forEach(permission => {
      if (!categories[permission.category]) {
        categories[permission.category] = [];
      }
      categories[permission.category].push(permission);
    });
    return categories;
  };

  const getSaveButtonContent = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            保存中...
          </>
        );
      case 'saved':
        return (
          <>
            <CheckCircle className="w-4 h-4" />
            已保存
          </>
        );
      case 'error':
        return (
          <>
            <AlertTriangle className="w-4 h-4" />
            保存失败
          </>
        );
      default:
        return (
          <>
            <Save className="w-4 h-4" />
            保存设置
          </>
        );
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">系统设置</h1>
        <button
          onClick={handleSaveConfig}
          disabled={saveStatus === 'saving'}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium ${
            saveStatus === 'saved' ? 'bg-green-600 text-white' :
            saveStatus === 'error' ? 'bg-red-600 text-white' :
            'bg-blue-600 text-white hover:bg-blue-700'
          } disabled:opacity-50`}
        >
          {getSaveButtonContent()}
        </button>
      </div>

      {/* 标签页导航 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'general', name: '基本设置', icon: Settings },
            { id: 'permissions', name: '权限管理', icon: Shield },
            { id: 'notifications', name: '通知设置', icon: Bell },
            { id: 'security', name: '安全设置', icon: Key }
          ].map(({ id, name, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* 基本设置 */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          {/* 站点信息 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              站点信息
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">站点名称</label>
                <input
                  type="text"
                  value={systemConfig.siteName}
                  onChange={(e) => handleConfigChange('siteName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">联系邮箱</label>
                <input
                  type="email"
                  value={systemConfig.contactEmail}
                  onChange={(e) => handleConfigChange('contactEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">站点描述</label>
                <textarea
                  value={systemConfig.siteDescription}
                  onChange={(e) => handleConfigChange('siteDescription', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">客服电话</label>
                <input
                  type="tel"
                  value={systemConfig.supportPhone}
                  onChange={(e) => handleConfigChange('supportPhone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* 功能设置 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              功能设置
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">维护模式</label>
                  <p className="text-xs text-gray-500">开启后用户无法访问前台功能</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={systemConfig.maintenanceMode}
                    onChange={(e) => handleConfigChange('maintenanceMode', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">用户注册</label>
                  <p className="text-xs text-gray-500">是否允许新用户注册</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={systemConfig.registrationEnabled}
                    onChange={(e) => handleConfigChange('registrationEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">邮箱验证</label>
                  <p className="text-xs text-gray-500">注册时是否需要邮箱验证</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={systemConfig.emailVerificationRequired}
                    onChange={(e) => handleConfigChange('emailVerificationRequired', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* 咨询设置 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              咨询设置
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">最大咨询时长(分钟)</label>
                <input
                  type="number"
                  value={systemConfig.maxConsultationDuration}
                  onChange={(e) => handleConfigChange('maxConsultationDuration', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">价格范围</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="最低价"
                    value={systemConfig.consultationPriceRange.min}
                    onChange={(e) => handleConfigChange('consultationPriceRange', {
                      ...systemConfig.consultationPriceRange,
                      min: parseInt(e.target.value)
                    })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="self-center text-gray-500">-</span>
                  <input
                    type="number"
                    placeholder="最高价"
                    value={systemConfig.consultationPriceRange.max}
                    onChange={(e) => handleConfigChange('consultationPriceRange', {
                      ...systemConfig.consultationPriceRange,
                      max: parseInt(e.target.value)
                    })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 权限管理 */}
      {activeTab === 'permissions' && (
        <div className="space-y-6">
          {/* 角色列表 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              管理员角色
            </h3>
            <div className="space-y-4">
              {roles.map((role) => (
                <div key={role.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{role.name}</h4>
                      <p className="text-sm text-gray-500">{role.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {role.userCount} 个用户 · 创建于 {role.createdAt}
                        {role.isDefault && <span className="ml-2 text-blue-600">默认角色</span>}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedRole(selectedRole?.id === role.id ? null : role)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      {selectedRole?.id === role.id ? '收起' : '编辑权限'}
                    </button>
                  </div>
                  
                  {selectedRole?.id === role.id && (
                    <div className="border-t pt-4">
                      <h5 className="font-medium text-gray-900 mb-3">权限设置</h5>
                      {Object.entries(getPermissionsByCategory()).map(([category, categoryPermissions]) => (
                        <div key={category} className="mb-4">
                          <h6 className="text-sm font-medium text-gray-700 mb-2">{category}</h6>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {categoryPermissions.map((permission) => (
                              <label key={permission.id} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={role.permissions.includes(permission.id)}
                                  onChange={(e) => handleRolePermissionChange(role.id, permission.id, e.target.checked)}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <div>
                                  <span className="text-sm text-gray-900">{permission.name}</span>
                                  <p className="text-xs text-gray-500">{permission.description}</p>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 通知设置 */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              邮件通知设置
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">新用户注册通知</label>
                  <p className="text-xs text-gray-500">有新用户注册时发送邮件通知</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">律师申请通知</label>
                  <p className="text-xs text-gray-500">有新的律师申请时发送邮件通知</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">举报处理通知</label>
                  <p className="text-xs text-gray-500">有新的举报需要处理时发送邮件通知</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              系统通知设置
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">浏览器推送通知</label>
                  <p className="text-xs text-gray-500">在浏览器中显示推送通知</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">声音提醒</label>
                  <p className="text-xs text-gray-500">收到通知时播放提示音</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 安全设置 */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Key className="w-5 h-5 mr-2" />
              登录安全
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">会话超时时间(小时)</label>
                <input
                  type="number"
                  defaultValue={24}
                  className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">强制双因素认证</label>
                  <p className="text-xs text-gray-500">要求所有管理员启用双因素认证</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">IP白名单</label>
                  <p className="text-xs text-gray-500">限制管理员登录的IP地址范围</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Database className="w-5 h-5 mr-2" />
              数据安全
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">自动备份</label>
                  <p className="text-xs text-gray-500">定期自动备份系统数据</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">备份频率</label>
                <select className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="daily">每日</option>
                  <option value="weekly">每周</option>
                  <option value="monthly">每月</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">操作日志记录</label>
                  <p className="text-xs text-gray-500">记录所有管理员操作日志</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemSettings;