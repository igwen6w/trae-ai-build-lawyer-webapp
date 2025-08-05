import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle, AlertTriangle, Flag, MessageSquare, Star, Clock, User } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Review {
  id: string;
  consultationId: string;
  clientName: string;
  lawyerName: string;
  rating: number;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectReason?: string;
  isAnonymous: boolean;
  consultationType: string;
}

interface Report {
  id: string;
  reportType: 'review' | 'lawyer' | 'consultation' | 'other';
  targetId: string;
  targetName: string;
  reporterName: string;
  reason: string;
  description: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  assignedTo?: string;
  resolvedAt?: string;
  resolution?: string;
}

const ContentManagement: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [reportTypeFilter, setReportTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [activeTab, setActiveTab] = useState<'reviews' | 'reports' | 'analytics'>('reviews');
  const itemsPerPage = 10;

  // Mock data
  useEffect(() => {
    const mockReviews: Review[] = [
      {
        id: '1',
        consultationId: 'CONS001',
        clientName: '张三',
        lawyerName: '李律师',
        rating: 5,
        content: '李律师非常专业，解答详细，服务态度很好，强烈推荐！',
        status: 'pending',
        createdAt: '2024-01-15 14:30:00',
        isAnonymous: false,
        consultationType: '视频咨询'
      },
      {
        id: '2',
        consultationId: 'CONS002',
        clientName: '王五',
        lawyerName: '陈律师',
        rating: 1,
        content: '律师迟到了30分钟，而且态度很差，完全不专业，浪费时间和金钱！',
        status: 'pending',
        createdAt: '2024-01-15 11:15:00',
        isAnonymous: true,
        consultationType: '电话咨询'
      },
      {
        id: '3',
        consultationId: 'CONS003',
        clientName: '赵六',
        lawyerName: '刘律师',
        rating: 4,
        content: '整体服务不错，律师很有经验，给出的建议很实用。',
        status: 'approved',
        createdAt: '2024-01-14 16:20:00',
        reviewedAt: '2024-01-14 17:00:00',
        reviewedBy: '管理员A',
        isAnonymous: false,
        consultationType: '在线咨询'
      },
      {
        id: '4',
        consultationId: 'CONS004',
        clientName: '孙七',
        lawyerName: '周律师',
        rating: 2,
        content: '这个律师根本不懂法律，给的建议完全错误，还收费这么贵，简直是骗子！',
        status: 'rejected',
        createdAt: '2024-01-14 09:45:00',
        reviewedAt: '2024-01-14 10:30:00',
        reviewedBy: '管理员B',
        rejectReason: '包含不当言论和人身攻击',
        isAnonymous: false,
        consultationType: '视频咨询'
      }
    ];

    const mockReports: Report[] = [
      {
        id: '1',
        reportType: 'lawyer',
        targetId: 'LAW001',
        targetName: '陈律师',
        reporterName: '王五',
        reason: '服务态度恶劣',
        description: '律师在咨询过程中态度极其恶劣，多次打断我的话，而且迟到30分钟没有任何道歉。',
        status: 'investigating',
        priority: 'high',
        createdAt: '2024-01-15 11:30:00',
        assignedTo: '管理员A'
      },
      {
        id: '2',
        reportType: 'review',
        targetId: 'REV001',
        targetName: '对李律师的评价',
        reporterName: '匿名用户',
        reason: '虚假评价',
        description: '这个评价明显是刷的，内容过于夸张，不符合实际情况。',
        status: 'pending',
        priority: 'medium',
        createdAt: '2024-01-15 09:20:00'
      },
      {
        id: '3',
        reportType: 'consultation',
        targetId: 'CONS005',
        targetName: '咨询记录CONS005',
        reporterName: '李四',
        reason: '内容不当',
        description: '咨询过程中律师提供了错误的法律建议，可能误导其他用户。',
        status: 'resolved',
        priority: 'high',
        createdAt: '2024-01-14 15:10:00',
        assignedTo: '管理员B',
        resolvedAt: '2024-01-14 18:00:00',
        resolution: '已核实并要求律师更正建议，对律师进行警告处理。'
      }
    ];

    setReviews(mockReviews);
    setReports(mockReports);
  }, []);

  // Analytics data
  const reviewStats = [
    { date: '1/10', total: 25, approved: 20, rejected: 3, pending: 2 },
    { date: '1/11', total: 32, approved: 28, rejected: 2, pending: 2 },
    { date: '1/12', total: 18, approved: 15, rejected: 1, pending: 2 },
    { date: '1/13', total: 41, approved: 35, rejected: 4, pending: 2 },
    { date: '1/14', total: 29, approved: 24, rejected: 3, pending: 2 },
    { date: '1/15', total: 36, approved: 30, rejected: 4, pending: 2 }
  ];

  const reportTypeData = [
    { name: '律师举报', value: 45, color: '#EF4444' },
    { name: '评价举报', value: 30, color: '#F59E0B' },
    { name: '咨询举报', value: 20, color: '#3B82F6' },
    { name: '其他举报', value: 5, color: '#6B7280' }
  ];

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.lawyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
    const matchesRating = ratingFilter === 'all' || 
                         (ratingFilter === 'low' && review.rating <= 2) ||
                         (ratingFilter === 'medium' && review.rating === 3) ||
                         (ratingFilter === 'high' && review.rating >= 4);
    return matchesSearch && matchesStatus && matchesRating;
  });

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.targetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reporterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesType = reportTypeFilter === 'all' || report.reportType === reportTypeFilter;
    const matchesPriority = priorityFilter === 'all' || report.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesType && matchesPriority;
  });

  const currentData = activeTab === 'reviews' ? filteredReviews : filteredReports;
  const paginatedData = currentData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(currentData.length / itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': case 'resolved': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': case 'dismissed': return 'text-red-600 bg-red-100';
      case 'investigating': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
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

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const handleReviewAction = (reviewId: string, action: 'approve' | 'reject', reason?: string) => {
    setReviews(prev => prev.map(review => 
      review.id === reviewId 
        ? { 
            ...review, 
            status: action === 'approve' ? 'approved' : 'rejected',
            reviewedAt: new Date().toISOString(),
            reviewedBy: '当前管理员',
            rejectReason: action === 'reject' ? reason : undefined
          }
        : review
    ));
    setSelectedReview(null);
  };

  const handleReportAction = (reportId: string, action: 'investigate' | 'resolve' | 'dismiss', resolution?: string) => {
    setReports(prev => prev.map(report => 
      report.id === reportId 
        ? { 
            ...report, 
            status: action === 'investigate' ? 'investigating' : 
                   action === 'resolve' ? 'resolved' : 'dismissed',
            assignedTo: action === 'investigate' ? '当前管理员' : report.assignedTo,
            resolvedAt: action !== 'investigate' ? new Date().toISOString() : undefined,
            resolution: action === 'resolve' ? resolution : undefined
          }
        : report
    ));
    setSelectedReport(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">内容管理</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'reviews'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            评价审核 {reviews.filter(r => r.status === 'pending').length > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {reviews.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'reports'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            举报处理 {reports.filter(r => r.status === 'pending').length > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {reports.filter(r => r.status === 'pending').length}
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
            内容统计
          </button>
        </div>
      </div>

      {(activeTab === 'reviews' || activeTab === 'reports') && (
        <>
          {/* 搜索和筛选 */}
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder={activeTab === 'reviews' ? "搜索评价内容、客户或律师..." : "搜索举报内容、举报人..."}
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
                {activeTab === 'reviews' ? (
                  <>
                    <option value="pending">待审核</option>
                    <option value="approved">已通过</option>
                    <option value="rejected">已拒绝</option>
                  </>
                ) : (
                  <>
                    <option value="pending">待处理</option>
                    <option value="investigating">调查中</option>
                    <option value="resolved">已解决</option>
                    <option value="dismissed">已驳回</option>
                  </>
                )}
              </select>
              {activeTab === 'reviews' && (
                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">全部评分</option>
                  <option value="high">高评分(4-5星)</option>
                  <option value="medium">中评分(3星)</option>
                  <option value="low">低评分(1-2星)</option>
                </select>
              )}
              {activeTab === 'reports' && (
                <>
                  <select
                    value={reportTypeFilter}
                    onChange={(e) => setReportTypeFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">全部类型</option>
                    <option value="lawyer">律师举报</option>
                    <option value="review">评价举报</option>
                    <option value="consultation">咨询举报</option>
                    <option value="other">其他举报</option>
                  </select>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">全部优先级</option>
                    <option value="high">高优先级</option>
                    <option value="medium">中优先级</option>
                    <option value="low">低优先级</option>
                  </select>
                </>
              )}
            </div>
          </div>

          {/* 列表 */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {activeTab === 'reviews' ? (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">评价信息</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">评分</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">内容</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时间</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                      </>
                    ) : (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">举报信息</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">优先级</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时间</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activeTab === 'reviews' ? (
                    (paginatedData as Review[]).map((review) => (
                      <tr key={review.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {review.isAnonymous ? '匿名用户' : review.clientName} → {review.lawyerName}
                            </div>
                            <div className="text-sm text-gray-500">{review.consultationType}</div>
                            <div className="text-xs text-gray-400">咨询ID: {review.consultationId}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getRatingStars(review.rating)}
                            <span className="ml-2 text-sm text-gray-600">{review.rating}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {review.content}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            getStatusColor(review.status)
                          }`}>
                            {review.status === 'pending' ? '待审核' :
                             review.status === 'approved' ? '已通过' : '已拒绝'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>{review.createdAt}</div>
                          {review.reviewedAt && (
                            <div className="text-xs text-gray-500">审核: {review.reviewedAt}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => setSelectedReview(review)}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            查看
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    (paginatedData as Report[]).map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {report.reporterName} 举报 {report.targetName}
                            </div>
                            <div className="text-sm text-gray-500">{report.reason}</div>
                            {report.assignedTo && (
                              <div className="text-xs text-gray-400">负责人: {report.assignedTo}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {report.reportType === 'lawyer' ? '律师举报' :
                             report.reportType === 'review' ? '评价举报' :
                             report.reportType === 'consultation' ? '咨询举报' : '其他举报'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            getPriorityColor(report.priority)
                          }`}>
                            {report.priority === 'high' ? '高' :
                             report.priority === 'medium' ? '中' : '低'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            getStatusColor(report.status)
                          }`}>
                            {report.status === 'pending' ? '待处理' :
                             report.status === 'investigating' ? '调查中' :
                             report.status === 'resolved' ? '已解决' : '已驳回'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>{report.createdAt}</div>
                          {report.resolvedAt && (
                            <div className="text-xs text-gray-500">解决: {report.resolvedAt}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => setSelectedReport(report)}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            查看
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
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
                      {Math.min(currentPage * itemsPerPage, currentData.length)}
                    </span>{' '}
                    共 <span className="font-medium">{currentData.length}</span> 条记录
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

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 评价审核趋势 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">评价审核趋势</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reviewStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#3B82F6" name="总评价" />
                <Bar dataKey="approved" fill="#10B981" name="已通过" />
                <Bar dataKey="rejected" fill="#EF4444" name="已拒绝" />
                <Bar dataKey="pending" fill="#F59E0B" name="待审核" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 举报类型分布 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">举报类型分布</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reportTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {reportTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 内容质量指标 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">内容质量指标</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">评价通过率</span>
                <span className="text-lg font-semibold text-green-600">85.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">平均评分</span>
                <span className="text-lg font-semibold text-blue-600">4.3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">举报解决率</span>
                <span className="text-lg font-semibold text-purple-600">92.1%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">平均处理时间</span>
                <span className="text-lg font-semibold text-yellow-600">2.5小时</span>
              </div>
            </div>
          </div>

          {/* 待处理统计 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">待处理统计</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{reviews.filter(r => r.status === 'pending').length}</div>
                <div className="text-sm text-gray-600">待审核评价</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{reports.filter(r => r.status === 'pending').length}</div>
                <div className="text-sm text-gray-600">待处理举报</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{reports.filter(r => r.status === 'investigating').length}</div>
                <div className="text-sm text-gray-600">调查中举报</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{reports.filter(r => r.priority === 'high' && r.status !== 'resolved').length}</div>
                <div className="text-sm text-gray-600">高优先级</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 评价详情模态框 */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">评价详情</h2>
              <button
                onClick={() => setSelectedReview(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">客户姓名</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedReview.isAnonymous ? '匿名用户' : selectedReview.clientName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">律师姓名</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedReview.lawyerName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">咨询类型</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedReview.consultationType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">评分</label>
                  <div className="mt-1 flex items-center">
                    {getRatingStars(selectedReview.rating)}
                    <span className="ml-2 text-sm text-gray-600">{selectedReview.rating}</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">评价内容</label>
                <p className="mt-1 text-sm text-gray-900 p-3 bg-gray-50 rounded-lg">{selectedReview.content}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">创建时间</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedReview.createdAt}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">状态</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    getStatusColor(selectedReview.status)
                  }`}>
                    {selectedReview.status === 'pending' ? '待审核' :
                     selectedReview.status === 'approved' ? '已通过' : '已拒绝'}
                  </span>
                </div>
              </div>
              {selectedReview.reviewedAt && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">审核时间</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedReview.reviewedAt}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">审核人</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedReview.reviewedBy}</p>
                  </div>
                </div>
              )}
              {selectedReview.rejectReason && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">拒绝原因</label>
                  <p className="mt-1 text-sm text-gray-900 p-3 bg-red-50 rounded-lg">{selectedReview.rejectReason}</p>
                </div>
              )}
              {selectedReview.status === 'pending' && (
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => handleReviewAction(selectedReview.id, 'reject', '内容不当或违规')}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    拒绝
                  </button>
                  <button
                    onClick={() => handleReviewAction(selectedReview.id, 'approve')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    通过
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 举报详情模态框 */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">举报详情</h2>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">举报人</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedReport.reporterName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">被举报对象</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedReport.targetName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">举报类型</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedReport.reportType === 'lawyer' ? '律师举报' :
                     selectedReport.reportType === 'review' ? '评价举报' :
                     selectedReport.reportType === 'consultation' ? '咨询举报' : '其他举报'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">优先级</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    getPriorityColor(selectedReport.priority)
                  }`}>
                    {selectedReport.priority === 'high' ? '高优先级' :
                     selectedReport.priority === 'medium' ? '中优先级' : '低优先级'}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">举报原因</label>
                <p className="mt-1 text-sm text-gray-900">{selectedReport.reason}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">详细描述</label>
                <p className="mt-1 text-sm text-gray-900 p-3 bg-gray-50 rounded-lg">{selectedReport.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">创建时间</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedReport.createdAt}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">状态</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    getStatusColor(selectedReport.status)
                  }`}>
                    {selectedReport.status === 'pending' ? '待处理' :
                     selectedReport.status === 'investigating' ? '调查中' :
                     selectedReport.status === 'resolved' ? '已解决' : '已驳回'}
                  </span>
                </div>
              </div>
              {selectedReport.assignedTo && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">负责人</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedReport.assignedTo}</p>
                </div>
              )}
              {selectedReport.resolvedAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">解决时间</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedReport.resolvedAt}</p>
                </div>
              )}
              {selectedReport.resolution && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">处理结果</label>
                  <p className="mt-1 text-sm text-gray-900 p-3 bg-green-50 rounded-lg">{selectedReport.resolution}</p>
                </div>
              )}
              {selectedReport.status === 'pending' && (
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => handleReportAction(selectedReport.id, 'dismiss')}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    驳回
                  </button>
                  <button
                    onClick={() => handleReportAction(selectedReport.id, 'investigate')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    开始调查
                  </button>
                </div>
              )}
              {selectedReport.status === 'investigating' && (
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => handleReportAction(selectedReport.id, 'resolve', '已核实并处理相关问题')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    标记解决
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

export default ContentManagement;