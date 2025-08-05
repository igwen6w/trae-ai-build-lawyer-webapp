import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, MessageSquare, AlertTriangle, CheckCircle, XCircle, Clock, Star, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface Consultation {
  id: string;
  clientName: string;
  lawyerName: string;
  type: 'online' | 'phone' | 'video';
  status: 'ongoing' | 'completed' | 'disputed' | 'cancelled';
  startTime: string;
  duration: number;
  rating?: number;
  hasDispute: boolean;
  amount: number;
  category: string;
}

interface Dispute {
  id: string;
  consultationId: string;
  clientName: string;
  lawyerName: string;
  reason: string;
  status: 'pending' | 'investigating' | 'resolved' | 'escalated';
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
}

const ConsultationManagement: React.FC = () => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [activeTab, setActiveTab] = useState<'consultations' | 'disputes' | 'analytics'>('consultations');
  const itemsPerPage = 10;

  // Mock data
  useEffect(() => {
    const mockConsultations: Consultation[] = [
      {
        id: '1',
        clientName: '张三',
        lawyerName: '李律师',
        type: 'video',
        status: 'completed',
        startTime: '2024-01-15 14:00',
        duration: 45,
        rating: 5,
        hasDispute: false,
        amount: 300,
        category: '合同纠纷'
      },
      {
        id: '2',
        clientName: '王五',
        lawyerName: '陈律师',
        type: 'phone',
        status: 'disputed',
        startTime: '2024-01-15 10:30',
        duration: 30,
        rating: 2,
        hasDispute: true,
        amount: 200,
        category: '劳动纠纷'
      },
      {
        id: '3',
        clientName: '赵六',
        lawyerName: '刘律师',
        type: 'online',
        status: 'ongoing',
        startTime: '2024-01-15 16:00',
        duration: 0,
        hasDispute: false,
        amount: 250,
        category: '房产纠纷'
      }
    ];

    const mockDisputes: Dispute[] = [
      {
        id: '1',
        consultationId: '2',
        clientName: '王五',
        lawyerName: '陈律师',
        reason: '律师迟到且服务态度不佳',
        status: 'investigating',
        createdAt: '2024-01-15 11:00',
        priority: 'high'
      }
    ];

    setConsultations(mockConsultations);
    setDisputes(mockDisputes);
  }, []);

  // Analytics data
  const consultationTrends = [
    { date: '1/10', total: 45, completed: 40, disputed: 2 },
    { date: '1/11', total: 52, completed: 48, disputed: 1 },
    { date: '1/12', total: 38, completed: 35, disputed: 3 },
    { date: '1/13', total: 61, completed: 55, disputed: 2 },
    { date: '1/14', total: 49, completed: 44, disputed: 1 },
    { date: '1/15', total: 56, completed: 50, disputed: 3 }
  ];

  const satisfactionData = [
    { name: '非常满意', value: 65, color: '#10B981' },
    { name: '满意', value: 25, color: '#3B82F6' },
    { name: '一般', value: 8, color: '#F59E0B' },
    { name: '不满意', value: 2, color: '#EF4444' }
  ];

  const filteredConsultations = consultations.filter(consultation => {
    const matchesSearch = consultation.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consultation.lawyerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || consultation.status === statusFilter;
    const matchesType = typeFilter === 'all' || consultation.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const paginatedConsultations = filteredConsultations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredConsultations.length / itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'ongoing': return 'text-blue-600 bg-blue-100';
      case 'disputed': return 'text-red-600 bg-red-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return '📹';
      case 'phone': return '📞';
      case 'online': return '💬';
      default: return '📋';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleResolveDispute = (disputeId: string) => {
    setDisputes(prev => prev.map(dispute => 
      dispute.id === disputeId 
        ? { ...dispute, status: 'resolved' as const }
        : dispute
    ));
    setSelectedDispute(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">咨询管理</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('consultations')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'consultations'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            咨询监控
          </button>
          <button
            onClick={() => setActiveTab('disputes')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'disputes'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            纠纷处理 {disputes.filter(d => d.status !== 'resolved').length > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {disputes.filter(d => d.status !== 'resolved').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'analytics'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            质量分析
          </button>
        </div>
      </div>

      {activeTab === 'consultations' && (
        <>
          {/* 搜索和筛选 */}
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="搜索客户或律师姓名..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">全部状态</option>
                <option value="ongoing">进行中</option>
                <option value="completed">已完成</option>
                <option value="disputed">有纠纷</option>
                <option value="cancelled">已取消</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">全部类型</option>
                <option value="video">视频咨询</option>
                <option value="phone">电话咨询</option>
                <option value="online">在线咨询</option>
              </select>
            </div>
          </div>

          {/* 咨询列表 */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">咨询信息</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时长</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">评分</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金额</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedConsultations.map((consultation) => (
                    <tr key={consultation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {consultation.clientName} → {consultation.lawyerName}
                          </div>
                          <div className="text-sm text-gray-500">{consultation.category}</div>
                          <div className="text-xs text-gray-400">{consultation.startTime}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-lg">{getTypeIcon(consultation.type)}</span>
                        <span className="ml-2 text-sm text-gray-600">
                          {consultation.type === 'video' ? '视频' : 
                           consultation.type === 'phone' ? '电话' : '在线'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          getStatusColor(consultation.status)
                        }`}>
                          {consultation.status === 'completed' ? '已完成' :
                           consultation.status === 'ongoing' ? '进行中' :
                           consultation.status === 'disputed' ? '有纠纷' : '已取消'}
                        </span>
                        {consultation.hasDispute && (
                          <AlertTriangle className="inline ml-1 w-4 h-4 text-red-500" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {consultation.status === 'ongoing' ? (
                          <span className="flex items-center text-blue-600">
                            <Clock className="w-4 h-4 mr-1" />
                            进行中
                          </span>
                        ) : (
                          `${consultation.duration}分钟`
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {consultation.rating ? (
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="ml-1 text-sm text-gray-900">{consultation.rating}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">未评分</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ¥{consultation.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedConsultation(consultation)}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          查看
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 分页 */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  上一页
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  下一页
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    显示 <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> 到{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, filteredConsultations.length)}
                    </span>{' '}
                    共 <span className="font-medium">{filteredConsultations.length}</span> 条记录
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'disputes' && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">纠纷处理</h2>
            <div className="space-y-4">
              {disputes.map((dispute) => (
                <div key={dispute.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          getPriorityColor(dispute.priority)
                        }`}>
                          {dispute.priority === 'high' ? '高优先级' :
                           dispute.priority === 'medium' ? '中优先级' : '低优先级'}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          dispute.status === 'resolved' ? 'text-green-600 bg-green-100' :
                          dispute.status === 'investigating' ? 'text-yellow-600 bg-yellow-100' :
                          'text-red-600 bg-red-100'
                        }`}>
                          {dispute.status === 'pending' ? '待处理' :
                           dispute.status === 'investigating' ? '调查中' :
                           dispute.status === 'resolved' ? '已解决' : '已升级'}
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-900 mb-1">
                        {dispute.clientName} vs {dispute.lawyerName}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{dispute.reason}</p>
                      <p className="text-xs text-gray-400">创建时间: {dispute.createdAt}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedDispute(dispute)}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        查看详情
                      </button>
                      {dispute.status !== 'resolved' && (
                        <button
                          onClick={() => handleResolveDispute(dispute.id)}
                          className="text-green-600 hover:text-green-900 text-sm"
                        >
                          标记解决
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {disputes.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>暂无纠纷记录</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 咨询趋势 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">咨询趋势</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={consultationTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#3B82F6" name="总咨询" />
                <Line type="monotone" dataKey="completed" stroke="#10B981" name="已完成" />
                <Line type="monotone" dataKey="disputed" stroke="#EF4444" name="有纠纷" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 满意度分布 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">客户满意度</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={satisfactionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {satisfactionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 质量指标 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">质量指标</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">4.6</div>
                <div className="text-sm text-gray-600">平均评分</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">95%</div>
                <div className="text-sm text-gray-600">完成率</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">2.1%</div>
                <div className="text-sm text-gray-600">纠纷率</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">38分钟</div>
                <div className="text-sm text-gray-600">平均时长</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 咨询详情模态框 */}
      {selectedConsultation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">咨询详情</h2>
              <button
                onClick={() => setSelectedConsultation(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">客户姓名</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedConsultation.clientName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">律师姓名</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedConsultation.lawyerName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">咨询类型</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedConsultation.type === 'video' ? '视频咨询' :
                     selectedConsultation.type === 'phone' ? '电话咨询' : '在线咨询'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">咨询分类</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedConsultation.category}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">开始时间</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedConsultation.startTime}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">咨询时长</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedConsultation.status === 'ongoing' ? '进行中' : `${selectedConsultation.duration}分钟`}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">咨询费用</label>
                  <p className="mt-1 text-sm text-gray-900">¥{selectedConsultation.amount}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">客户评分</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedConsultation.rating ? (
                      <span className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        {selectedConsultation.rating}
                      </span>
                    ) : (
                      '未评分'
                    )}
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">状态</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  getStatusColor(selectedConsultation.status)
                }`}>
                  {selectedConsultation.status === 'completed' ? '已完成' :
                   selectedConsultation.status === 'ongoing' ? '进行中' :
                   selectedConsultation.status === 'disputed' ? '有纠纷' : '已取消'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 纠纷详情模态框 */}
      {selectedDispute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">纠纷详情</h2>
              <button
                onClick={() => setSelectedDispute(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">客户姓名</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedDispute.clientName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">律师姓名</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedDispute.lawyerName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">优先级</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    getPriorityColor(selectedDispute.priority)
                  }`}>
                    {selectedDispute.priority === 'high' ? '高优先级' :
                     selectedDispute.priority === 'medium' ? '中优先级' : '低优先级'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">处理状态</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedDispute.status === 'resolved' ? 'text-green-600 bg-green-100' :
                    selectedDispute.status === 'investigating' ? 'text-yellow-600 bg-yellow-100' :
                    'text-red-600 bg-red-100'
                  }`}>
                    {selectedDispute.status === 'pending' ? '待处理' :
                     selectedDispute.status === 'investigating' ? '调查中' :
                     selectedDispute.status === 'resolved' ? '已解决' : '已升级'}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">纠纷原因</label>
                <p className="mt-1 text-sm text-gray-900">{selectedDispute.reason}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">创建时间</label>
                <p className="mt-1 text-sm text-gray-900">{selectedDispute.createdAt}</p>
              </div>
              {selectedDispute.status !== 'resolved' && (
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => handleResolveDispute(selectedDispute.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    标记为已解决
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultationManagement;