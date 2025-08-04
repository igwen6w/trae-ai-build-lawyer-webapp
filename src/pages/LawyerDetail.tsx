import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, Clock, Star, Award, GraduationCap, 
  MessageCircle, Phone, Video, Calendar, 
  ChevronLeft, Users, TrendingUp
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Rating, { RatingStats } from '@/components/Rating';
import { useLawyerStore, useReviewStore } from '@/store';
import { mockLawyers, mockReviews } from '@/data/mockData';
import { Lawyer, Review } from '@/types';

export default function LawyerDetail() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'cases'>('overview');
  const { lawyers, setLawyers } = useLawyerStore();
  const { reviews, setReviews, getReviewsByLawyer } = useReviewStore();
  
  const lawyer = lawyers.find(l => l.id === id);
  const lawyerReviews = getReviewsByLawyer(id || '');

  useEffect(() => {
    if (lawyers.length === 0) {
      setLawyers(mockLawyers);
    }
    if (reviews.length === 0) {
      setReviews(mockReviews);
    }
  }, [lawyers.length, reviews.length, setLawyers, setReviews]);

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

  // 计算评分统计
  const ratingStats = lawyerReviews.reduce((acc, review) => {
    acc[review.rating] = (acc[review.rating] || 0) + 1;
    return acc;
  }, {} as { [key: number]: number });

  const averageRating = lawyerReviews.length > 0 
    ? lawyerReviews.reduce((sum, review) => sum + review.rating, 0) / lawyerReviews.length
    : lawyer.rating;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            to="/lawyers"
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>返回律师列表</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lawyer Profile Card */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                  <div className="relative">
                    <img
                      src={lawyer.avatar}
                      alt={lawyer.name}
                      className="h-32 w-32 rounded-full object-cover mx-auto sm:mx-0"
                    />
                    {lawyer.isOnline && (
                      <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-green-500 border-4 border-white rounded-full flex items-center justify-center">
                        <div className="h-2 w-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 text-center sm:text-left">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{lawyer.name}</h1>
                    <p className="text-lg text-gray-600 mb-4">{lawyer.experience}年执业经验</p>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0 mb-4">
                      <div className="flex items-center justify-center sm:justify-start space-x-1">
                        <Rating rating={averageRating} showNumber reviewCount={lawyerReviews.length} />
                      </div>
                      <div className="flex items-center justify-center sm:justify-start text-gray-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        {lawyer.location}
                      </div>
                      <div className="flex items-center justify-center sm:justify-start text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        {lawyer.responseTime}响应
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                      {lawyer.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'overview'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    律师简介
                  </button>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'reviews'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    用户评价 ({lawyerReviews.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('cases')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'cases'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    成功案例
                  </button>
                </nav>
              </div>
              
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Description */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">个人简介</h3>
                      <p className="text-gray-700 leading-relaxed">{lawyer.description}</p>
                    </div>
                    
                    {/* Education */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">教育背景</h3>
                      <div className="flex items-center space-x-2 text-gray-700">
                        <GraduationCap className="h-5 w-5 text-blue-600" />
                        <span>{lawyer.education}</span>
                      </div>
                    </div>
                    
                    {/* Certifications */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">执业资质</h3>
                      <div className="space-y-2">
                        {lawyer.certifications.map((cert, index) => (
                          <div key={index} className="flex items-center space-x-2 text-gray-700">
                            <Award className="h-5 w-5 text-blue-600" />
                            <span>{cert}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Languages */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">语言能力</h3>
                      <div className="flex flex-wrap gap-2">
                        {lawyer.languages.map((language, index) => (
                          <span
                            key={index}
                            className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                          >
                            {language}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'reviews' && (
                  <div className="space-y-6">
                    {lawyerReviews.length > 0 ? (
                      <>
                        <RatingStats
                          ratings={ratingStats}
                          totalReviews={lawyerReviews.length}
                          averageRating={averageRating}
                        />
                        
                        <div className="space-y-4">
                          {lawyerReviews.map((review) => (
                            <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-start space-x-4">
                                <img
                                  src={review.clientAvatar || 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=default%20user%20avatar&image_size=square'}
                                  alt={review.clientName}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium text-gray-900">{review.clientName}</h4>
                                    <span className="text-sm text-gray-500">
                                      {new Date(review.createdAt).toLocaleDateString('zh-CN')}
                                    </span>
                                  </div>
                                  <Rating rating={review.rating} size="sm" />
                                  <p className="text-gray-700 mt-2">{review.comment}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-gray-400 mb-4">
                          <Star className="h-12 w-12 mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">暂无评价</h3>
                        <p className="text-gray-600">成为第一个评价这位律师的用户</p>
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'cases' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 rounded-lg p-6 text-center">
                        <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                        <div className="text-2xl font-bold text-blue-600 mb-1">{lawyer.successCases}</div>
                        <div className="text-sm text-gray-600">成功案例</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-6 text-center">
                        <Users className="h-8 w-8 text-green-600 mx-auto mb-3" />
                        <div className="text-2xl font-bold text-green-600 mb-1">{lawyer.reviewCount}</div>
                        <div className="text-sm text-gray-600">服务客户</div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">典型案例</h3>
                      <div className="space-y-4">
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">房产买卖合同纠纷案</h4>
                          <p className="text-gray-600 text-sm mb-2">案例类型: 合同纠纷 | 争议金额: 200万元</p>
                          <p className="text-gray-700">成功为客户追回房产交易中的违约金，并维护了客户的合法权益。</p>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">离婚财产分割案</h4>
                          <p className="text-gray-600 text-sm mb-2">案例类型: 婚姻家庭 | 争议金额: 500万元</p>
                          <p className="text-gray-700">通过专业的法律服务，帮助客户合理分割夫妻共同财产，保护了客户的合法权益。</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Consultation Options */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">咨询方式</h3>
              
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <MessageCircle className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">图文咨询</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">¥{Math.round(lawyer.hourlyRate * 0.5)}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">文字描述问题，律师详细解答</p>
                  <Link
                    to={`/consultation/book/${lawyer.id}?type=text`}
                    className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    立即咨询
                  </Link>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-5 w-5 text-green-600" />
                      <span className="font-medium">电话咨询</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">¥{Math.round(lawyer.hourlyRate * 0.8)}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">电话沟通，实时解答法律问题</p>
                  <Link
                    to={`/consultation/book/${lawyer.id}?type=phone`}
                    className="block w-full bg-green-600 text-white text-center py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    预约通话
                  </Link>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Video className="h-5 w-5 text-purple-600" />
                      <span className="font-medium">视频咨询</span>
                    </div>
                    <span className="text-lg font-bold text-purple-600">¥{lawyer.hourlyRate}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">面对面视频交流，深度咨询</p>
                  <Link
                    to={`/consultation/book/${lawyer.id}?type=video`}
                    className="block w-full bg-purple-600 text-white text-center py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    预约视频
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">律师数据</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">执业年限</span>
                  <span className="font-medium">{lawyer.experience}年</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">成功案例</span>
                  <span className="font-medium">{lawyer.successCases}件</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">服务评分</span>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="font-medium">{averageRating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">响应时间</span>
                  <span className="font-medium">{lawyer.responseTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">在线状态</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    lawyer.isOnline 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {lawyer.isOnline ? '在线' : '离线'}
                  </span>
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