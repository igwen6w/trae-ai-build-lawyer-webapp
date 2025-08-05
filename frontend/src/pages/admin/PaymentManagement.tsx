import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Download, RefreshCw, CreditCard, TrendingUp, DollarSign, AlertCircle, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface Payment {
  id: string;
  transactionId: string;
  clientName: string;
  lawyerName: string;
  amount: number;
  fee: number;
  netAmount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'disputed';
  paymentMethod: 'wechat' | 'alipay' | 'card' | 'bank';
  createdAt: string;
  completedAt?: string;
  consultationType: string;
  refundReason?: string;
}

interface RefundRequest {
  id: string;
  paymentId: string;
  clientName: string;
  lawyerName: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  requestedAt: string;
  processedAt?: string;
  adminNote?: string;
}

const PaymentManagement: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7days');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);
  const [activeTab, setActiveTab] = useState<'transactions' | 'refunds' | 'analytics'>('transactions');
  const itemsPerPage = 10;

  // Mock data
  useEffect(() => {
    const mockPayments: Payment[] = [
      {
        id: '1',
        transactionId: 'TXN20240115001',
        clientName: '张三',
        lawyerName: '李律师',
        amount: 300,
        fee: 15,
        netAmount: 285,
        status: 'completed',
        paymentMethod: 'wechat',
        createdAt: '2024-01-15 14:00:00',
        completedAt: '2024-01-15 14:00:30',
        consultationType: '视频咨询'
      },
      {
        id: '2',
        transactionId: 'TXN20240115002',
        clientName: '王五',
        lawyerName: '陈律师',
        amount: 200,
        fee: 10,
        netAmount: 190,
        status: 'refunded',
        paymentMethod: 'alipay',
        createdAt: '2024-01-15 10:30:00',
        completedAt: '2024-01-15 10:30:15',
        consultationType: '电话咨询',
        refundReason: '律师迟到'
      },
      {
        id: '3',
        transactionId: 'TXN20240115003',
        clientName: '赵六',
        lawyerName: '刘律师',
        amount: 250,
        fee: 12.5,
        netAmount: 237.5,
        status: 'pending',
        paymentMethod: 'card',
        createdAt: '2024-01-15 16:00:00',
        consultationType: '在线咨询'
      },
      {
        id: '4',
        transactionId: 'TXN20240115004',
        clientName: '孙七',
        lawyerName: '周律师',
        amount: 400,
        fee: 20,
        netAmount: 380,
        status: 'failed',
        paymentMethod: 'bank',
        createdAt: '2024-01-15 09:15:00',
        consultationType: '视频咨询'
      }
    ];

    const mockRefundRequests: RefundRequest[] = [
      {
        id: '1',
        paymentId: '2',
        clientName: '王五',
        lawyerName: '陈律师',
        amount: 200,
        reason: '律师迟到且服务质量不佳',
        status: 'pending',
        requestedAt: '2024-01-15 11:00:00'
      },
      {
        id: '2',
        paymentId: '1',
        clientName: '李四',
        lawyerName: '张律师',
        amount: 150,
        reason: '咨询时间不符合预期',
        status: 'approved',
        requestedAt: '2024-01-14 15:30:00',
        processedAt: '2024-01-14 16:00:00',
        adminNote: '经核实，同意退款'
      }
    ];

    setPayments(mockPayments);
    setRefundRequests(mockRefundRequests);
  }, []);

  // Analytics data
  const revenueData = [
    { date: '1/10', revenue: 4500, transactions: 18, refunds: 200 },
    { date: '1/11', revenue: 5200, transactions: 21, refunds: 150 },
    { date: '1/12', revenue: 3800, transactions: 15, refunds: 300 },
    { date: '1/13', revenue: 6100, transactions: 24, refunds: 100 },
    { date: '1/14', revenue: 4900, transactions: 19, refunds: 250 },
    { date: '1/15', revenue: 5600, transactions: 22, refunds: 180 }
  ];

  const paymentMethodData = [
    { name: '微信支付', value: 45, color: '#10B981' },
    { name: '支付宝', value: 35, color: '#3B82F6' },
    { name: '银行卡', value: 15, color: '#F59E0B' },
    { name: '银行转账', value: 5, color: '#EF4444' }
  ];

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.lawyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesMethod = methodFilter === 'all' || payment.paymentMethod === methodFilter;
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'refunded': return 'text-purple-600 bg-purple-100';
      case 'disputed': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'wechat': return '💬';
      case 'alipay': return '🅰️';
      case 'card': return '💳';
      case 'bank': return '🏦';
      default: return '💰';
    }
  };

  const getRefundStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'processed': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleRefundAction = (refundId: string, action: 'approve' | 'reject', note?: string) => {
    setRefundRequests(prev => prev.map(refund => 
      refund.id === refundId 
        ? { 
            ...refund, 
            status: action === 'approve' ? 'approved' : 'rejected',
            processedAt: new Date().toISOString(),
            adminNote: note || (action === 'approve' ? '已批准退款' : '退款申请被拒绝')
          }
        : refund
    ));
    setSelectedRefund(null);
  };

  const exportTransactions = () => {
    // 模拟导出功能
    const csvContent = "data:text/csv;charset=utf-8," + 
      "交易ID,客户姓名,律师姓名,金额,状态,支付方式,创建时间\n" +
      filteredPayments.map(p => 
        `${p.transactionId},${p.clientName},${p.lawyerName},${p.amount},${p.status},${p.paymentMethod},${p.createdAt}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "transactions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">支付管理</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'transactions'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            交易记录
          </button>
          <button
            onClick={() => setActiveTab('refunds')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'refunds'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            退款处理 {refundRequests.filter(r => r.status === 'pending').length > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {refundRequests.filter(r => r.status === 'pending').length}
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
            财务统计
          </button>
        </div>
      </div>

      {activeTab === 'transactions' && (
        <>
          {/* 搜索和筛选 */}
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="搜索交易ID、客户或律师姓名..."
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
                <option value="pending">待处理</option>
                <option value="completed">已完成</option>
                <option value="failed">失败</option>
                <option value="refunded">已退款</option>
                <option value="disputed">有争议</option>
              </select>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">全部支付方式</option>
                <option value="wechat">微信支付</option>
                <option value="alipay">支付宝</option>
                <option value="card">银行卡</option>
                <option value="bank">银行转账</option>
              </select>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7days">最近7天</option>
                <option value="30days">最近30天</option>
                <option value="90days">最近90天</option>
                <option value="custom">自定义</option>
              </select>
              <button
                onClick={exportTransactions}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                导出
              </button>
            </div>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">今日收入</p>
                  <p className="text-2xl font-bold text-gray-900">¥5,600</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CreditCard className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">成功交易</p>
                  <p className="text-2xl font-bold text-gray-900">22</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <RefreshCw className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">待处理</p>
                  <p className="text-2xl font-bold text-gray-900">3</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">失败交易</p>
                  <p className="text-2xl font-bold text-gray-900">1</p>
                </div>
              </div>
            </div>
          </div>

          {/* 交易列表 */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">交易信息</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金额</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">支付方式</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时间</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{payment.transactionId}</div>
                          <div className="text-sm text-gray-500">
                            {payment.clientName} → {payment.lawyerName}
                          </div>
                          <div className="text-xs text-gray-400">{payment.consultationType}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">¥{payment.amount}</div>
                        <div className="text-xs text-gray-500">手续费: ¥{payment.fee}</div>
                        <div className="text-xs text-gray-500">净额: ¥{payment.netAmount}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-lg">{getPaymentMethodIcon(payment.paymentMethod)}</span>
                        <span className="ml-2 text-sm text-gray-600">
                          {payment.paymentMethod === 'wechat' ? '微信支付' :
                           payment.paymentMethod === 'alipay' ? '支付宝' :
                           payment.paymentMethod === 'card' ? '银行卡' : '银行转账'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          getStatusColor(payment.status)
                        }`}>
                          {payment.status === 'completed' ? '已完成' :
                           payment.status === 'pending' ? '待处理' :
                           payment.status === 'failed' ? '失败' :
                           payment.status === 'refunded' ? '已退款' : '有争议'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{payment.createdAt}</div>
                        {payment.completedAt && (
                          <div className="text-xs text-gray-500">完成: {payment.completedAt}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedPayment(payment)}
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
                      {Math.min(currentPage * itemsPerPage, filteredPayments.length)}
                    </span>{' '}
                    共 <span className="font-medium">{filteredPayments.length}</span> 条记录
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

      {activeTab === 'refunds' && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">退款申请</h2>
            <div className="space-y-4">
              {refundRequests.map((refund) => (
                <div key={refund.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          getRefundStatusColor(refund.status)
                        }`}>
                          {refund.status === 'pending' ? '待处理' :
                           refund.status === 'approved' ? '已批准' :
                           refund.status === 'rejected' ? '已拒绝' : '已处理'}
                        </span>
                        <span className="text-sm font-medium text-gray-900">¥{refund.amount}</span>
                      </div>
                      <h3 className="font-medium text-gray-900 mb-1">
                        {refund.clientName} → {refund.lawyerName}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{refund.reason}</p>
                      <p className="text-xs text-gray-400">申请时间: {refund.requestedAt}</p>
                      {refund.processedAt && (
                        <p className="text-xs text-gray-400">处理时间: {refund.processedAt}</p>
                      )}
                      {refund.adminNote && (
                        <p className="text-xs text-blue-600 mt-1">管理员备注: {refund.adminNote}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedRefund(refund)}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        查看详情
                      </button>
                      {refund.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleRefundAction(refund.id, 'approve')}
                            className="text-green-600 hover:text-green-900 text-sm"
                          >
                            批准
                          </button>
                          <button
                            onClick={() => handleRefundAction(refund.id, 'reject')}
                            className="text-red-600 hover:text-red-900 text-sm"
                          >
                            拒绝
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {refundRequests.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <RefreshCw className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>暂无退款申请</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 收入趋势 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">收入趋势</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#3B82F6" name="收入" />
                <Line type="monotone" dataKey="refunds" stroke="#EF4444" name="退款" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 支付方式分布 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">支付方式分布</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 交易统计 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">交易统计</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="transactions" fill="#10B981" name="交易数量" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 财务指标 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">财务指标</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">¥32,100</div>
                <div className="text-sm text-gray-600">本月总收入</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">¥1,605</div>
                <div className="text-sm text-gray-600">平台手续费</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">¥980</div>
                <div className="text-sm text-gray-600">退款金额</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">97.2%</div>
                <div className="text-sm text-gray-600">支付成功率</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 交易详情模态框 */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">交易详情</h2>
              <button
                onClick={() => setSelectedPayment(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">交易ID</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedPayment.transactionId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">交易状态</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    getStatusColor(selectedPayment.status)
                  }`}>
                    {selectedPayment.status === 'completed' ? '已完成' :
                     selectedPayment.status === 'pending' ? '待处理' :
                     selectedPayment.status === 'failed' ? '失败' :
                     selectedPayment.status === 'refunded' ? '已退款' : '有争议'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">客户姓名</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedPayment.clientName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">律师姓名</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedPayment.lawyerName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">咨询类型</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedPayment.consultationType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">支付方式</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedPayment.paymentMethod === 'wechat' ? '微信支付' :
                     selectedPayment.paymentMethod === 'alipay' ? '支付宝' :
                     selectedPayment.paymentMethod === 'card' ? '银行卡' : '银行转账'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">交易金额</label>
                  <p className="mt-1 text-sm text-gray-900">¥{selectedPayment.amount}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">平台手续费</label>
                  <p className="mt-1 text-sm text-gray-900">¥{selectedPayment.fee}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">净收入</label>
                  <p className="mt-1 text-sm text-gray-900">¥{selectedPayment.netAmount}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">创建时间</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedPayment.createdAt}</p>
                </div>
                {selectedPayment.completedAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">完成时间</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedPayment.completedAt}</p>
                  </div>
                )}
                {selectedPayment.refundReason && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">退款原因</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedPayment.refundReason}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 退款详情模态框 */}
      {selectedRefund && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">退款详情</h2>
              <button
                onClick={() => setSelectedRefund(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">客户姓名</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRefund.clientName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">律师姓名</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRefund.lawyerName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">退款金额</label>
                  <p className="mt-1 text-sm text-gray-900">¥{selectedRefund.amount}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">处理状态</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    getRefundStatusColor(selectedRefund.status)
                  }`}>
                    {selectedRefund.status === 'pending' ? '待处理' :
                     selectedRefund.status === 'approved' ? '已批准' :
                     selectedRefund.status === 'rejected' ? '已拒绝' : '已处理'}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">退款原因</label>
                <p className="mt-1 text-sm text-gray-900">{selectedRefund.reason}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">申请时间</label>
                <p className="mt-1 text-sm text-gray-900">{selectedRefund.requestedAt}</p>
              </div>
              {selectedRefund.processedAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">处理时间</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRefund.processedAt}</p>
                </div>
              )}
              {selectedRefund.adminNote && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">管理员备注</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRefund.adminNote}</p>
                </div>
              )}
              {selectedRefund.status === 'pending' && (
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => handleRefundAction(selectedRefund.id, 'reject', '不符合退款条件')}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    拒绝退款
                  </button>
                  <button
                    onClick={() => handleRefundAction(selectedRefund.id, 'approve', '已批准退款申请')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    批准退款
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

export default PaymentManagement;