import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">法律咨询平台</h3>
            <p className="text-gray-400 mb-4">
              专业的法律服务平台，为您提供优质的法律咨询和解决方案。
            </p>
            <p className="text-gray-400">
              咨询热线：400-888-8888
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">服务</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/lawyers" className="hover:text-white transition-colors">找律师</Link></li>
              <li><Link to="/specialties" className="hover:text-white transition-colors">专业领域</Link></li>
              <li><Link to="/consultation" className="hover:text-white transition-colors">在线咨询</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">关于</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/about" className="hover:text-white transition-colors">关于我们</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">联系我们</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">隐私政策</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">联系方式</h3>
            <ul className="space-y-2 text-gray-400">
              <li>北京市朝阳区建国门外大街1号</li>
              <li>国贸大厦A座28层</li>
              <li>邮箱：info@legalconsult.com</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 法律咨询平台. 保留所有权利.</p>
        </div>
      </div>
    </footer>
  );
}