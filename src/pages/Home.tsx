import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Shield, Clock, Users, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LawyerCard from '@/components/LawyerCard';
import { useLawyerStore } from '@/store';
import { mockLawyers, specialtyOptions } from '@/data/mockData';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const { setLawyers, lawyers } = useLawyerStore();
  const navigate = useNavigate();

  useEffect(() => {
    // 初始化律师数据
    setLawyers(mockLawyers);
  }, [setLawyers]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    }
    if (selectedSpecialty) {
      params.set('specialty', selectedSpecialty);
    }
    navigate(`/lawyers?${params.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 获取推荐律师（评分最高的3位）
  const recommendedLawyers = lawyers
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              专业法律咨询
              <span className="block text-blue-200">值得信赖的选择</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto">
              连接您与专业律师，提供便捷、透明、高效的法律咨询服务
            </p>
            
            {/* Search Section */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl p-6 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="搜索律师姓名或描述您的法律问题..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="w-full pl-12 pr-4 py-4 text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <select
                      value={selectedSpecialty}
                      onChange={(e) => setSelectedSpecialty(e.target.value)}
                      className="w-full py-4 px-4 text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    >
                      <option value="">选择专业领域</option>
                      {specialtyOptions.map((specialty) => (
                        <option key={specialty} value={specialty}>
                          {specialty}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleSearch}
                  className="w-full mt-4 bg-blue-600 text-white py-4 px-8 rounded-xl hover:bg-blue-700 transition-colors text-lg font-semibold flex items-center justify-center space-x-2"
                >
                  <span>搜索律师</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              为什么选择我们
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              我们致力于为您提供最专业、最便捷的法律咨询服务
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-blue-50 hover:bg-blue-100 transition-colors">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-6">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">专业可靠</h3>
              <p className="text-gray-600">
                所有律师均经过严格资质审核，拥有丰富的执业经验和专业背景
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-green-50 hover:bg-green-100 transition-colors">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 text-white rounded-full mb-6">
                <Clock className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">快速响应</h3>
              <p className="text-gray-600">
                平均30分钟内响应，多种咨询方式可选，随时随地获得法律帮助
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-purple-50 hover:bg-purple-100 transition-colors">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 text-white rounded-full mb-6">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">透明收费</h3>
              <p className="text-gray-600">
                明码标价，无隐藏费用，支付安全便捷，让您放心选择
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Lawyers Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              推荐律师
            </h2>
            <p className="text-xl text-gray-600">
              精选优秀律师，为您提供专业法律服务
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
            {recommendedLawyers.map((lawyer) => (
              <LawyerCard key={lawyer.id} lawyer={lawyer} variant="compact" />
            ))}
          </div>
          
          <div className="text-center">
            <Link
              to="/lawyers"
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-colors text-lg font-semibold"
            >
              <span>查看更多律师</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">1000+</div>
              <div className="text-blue-200">专业律师</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">50000+</div>
              <div className="text-blue-200">成功案例</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">98%</div>
              <div className="text-blue-200">客户满意度</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">24/7</div>
              <div className="text-blue-200">在线服务</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            立即开始您的法律咨询
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            专业律师团队随时为您提供法律支持
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/lawyers"
              className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-colors text-lg font-semibold"
            >
              找律师咨询
            </Link>
            <Link
              to="/about"
              className="border border-blue-600 text-blue-600 px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors text-lg font-semibold"
            >
              了解更多
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}