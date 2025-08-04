import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, Menu, X, Scale } from 'lucide-react';
import { useUserStore } from '@/store';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { currentUser, isAuthenticated, logout } = useUserStore();
  const navigate = useNavigate();

  const handleLogin = () => {
    // 模拟登录
    const mockUser = {
      id: 'user1',
      name: '测试用户',
      email: 'test@example.com',
      phone: '13800138000',
      avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=friendly%20chinese%20person%20avatar%20casual&image_size=square',
      role: 'client' as const,
      createdAt: '2024-01-01T00:00:00Z'
    };
    useUserStore.getState().login('zhangsan@example.com', 'password123');
    setIsUserMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Scale className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">法律咨询</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors">
              首页
            </Link>
            <Link to="/lawyers" className="text-gray-700 hover:text-blue-600 transition-colors">
              找律师
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-blue-600 transition-colors">
              关于我们
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索律师或专业领域..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const query = (e.target as HTMLInputElement).value;
                    if (query.trim()) {
                      navigate(`/lawyers?search=${encodeURIComponent(query)}`);
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <img
                    src={currentUser.avatar || 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=default%20user%20avatar&image_size=square'}
                    alt={currentUser.name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <span>{currentUser.name}</span>
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      个人中心
                    </Link>
                    <Link
                      to="/consultations"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      我的咨询
                    </Link>
                    {currentUser.role === 'lawyer' && (
                      <Link
                        to="/lawyer-dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        律师工作台
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      退出登录
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleLogin}
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  登录
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={handleLogin}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  注册
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索律师或专业领域..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Mobile Navigation Links */}
              <Link
                to="/"
                className="text-gray-700 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                首页
              </Link>
              <Link
                to="/lawyers"
                className="text-gray-700 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                找律师
              </Link>
              <Link
                to="/about"
                className="text-gray-700 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                关于我们
              </Link>
              
              {/* Mobile User Menu */}
              {isAuthenticated && currentUser ? (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <img
                      src={currentUser.avatar || 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=default%20user%20avatar&image_size=square'}
                      alt={currentUser.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <span className="font-medium text-gray-900">{currentUser.name}</span>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Link
                      to="/profile"
                      className="text-gray-700 hover:text-blue-600 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      个人中心
                    </Link>
                    <Link
                      to="/consultations"
                      className="text-gray-700 hover:text-blue-600 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      我的咨询
                    </Link>
                    {currentUser.role === 'lawyer' && (
                      <Link
                        to="/lawyer-dashboard"
                        className="text-gray-700 hover:text-blue-600 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        律师工作台
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="text-left text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      退出登录
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-200 flex flex-col space-y-2">
                  <button
                    onClick={handleLogin}
                    className="text-left text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    登录
                  </button>
                  <button
                    onClick={handleLogin}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center"
                  >
                    注册
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}