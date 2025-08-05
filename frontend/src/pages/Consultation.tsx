import { MessageCircle, Phone, Video, Clock, Shield, Star, ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const consultationTypes = [
  {
    id: 'text',
    name: '文字咨询',
    icon: MessageCircle,
    price: '¥99/次',
    duration: '30分钟内回复',
    description: '通过文字交流，详细描述您的法律问题，律师将给出专业建议',
    features: ['随时随地咨询', '文字记录保存', '经济实惠', '适合简单问题'],
    color: 'blue'
  },
  {
    id: 'voice',
    name: '语音咨询',
    icon: Phone,
    price: '¥199/30分钟',
    duration: '实时通话',
    description: '与律师进行语音通话，实时沟通法律问题，获得即时专业指导',
    features: ['实时沟通', '语音清晰', '互动性强', '适合复杂问题'],
    color: 'green'
  },
  {
    id: 'video',
    name: '视频咨询',
    icon: Video,
    price: '¥299/30分钟',
    duration: '面对面交流',
    description: '通过视频通话与律师面对面交流，如同线下咨询的体验',
    features: ['面对面交流', '文档展示', '最佳体验', '适合重要问题'],
    color: 'purple'
  }
];

const processSteps = [
  {
    step: 1,
    title: '选择律师',
    description: '浏览律师列表，查看专业领域和用户评价，选择合适的律师'
  },
  {
    step: 2,
    title: '预约咨询',
    description: '选择咨询类型和时间，填写问题描述，完成预约'
  },
  {
    step: 3,
    title: '开始咨询',
    description: '按预约时间进入咨询室，与律师进行专业交流'
  },
  {
    step: 4,
    title: '获得建议',
    description: '律师提供专业法律建议，您可以保存咨询记录供后续参考'
  }
];

const advantages = [
  {
    icon: Clock,
    title: '24小时服务',
    description: '全天候在线，随时为您提供法律咨询服务'
  },
  {
    icon: Shield,
    title: '专业保障',
    description: '所有律师均经过严格认证，具备丰富执业经验'
  },
  {
    icon: Star,
    title: '用户好评',
    description: '超过10万用户选择，98%满意度评价'
  }
];

export default function Consultation() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              专业法律咨询服务
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              连接您与专业律师，提供便捷、高效、专业的法律咨询服务
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/lawyers"
                className="inline-flex items-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                立即咨询
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
              >
                了解更多
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Consultation Types */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              选择适合您的咨询方式
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              我们提供多种咨询方式，满足不同场景下的法律咨询需求
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {consultationTypes.map((type) => {
              const IconComponent = type.icon;
              const colorClasses = {
                blue: 'bg-blue-50 border-blue-200 text-blue-600',
                green: 'bg-green-50 border-green-200 text-green-600',
                purple: 'bg-purple-50 border-purple-200 text-purple-600'
              };
              
              return (
                <div key={type.id} className="bg-white rounded-xl border border-gray-200 p-8 hover:shadow-lg transition-shadow">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-lg mb-6 ${colorClasses[type.color as keyof typeof colorClasses]}`}>
                    <IconComponent className="h-8 w-8" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{type.name}</h3>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-blue-600">{type.price}</span>
                    <span className="text-sm text-gray-500">{type.duration}</span>
                  </div>
                  
                  <p className="text-gray-600 mb-6">{type.description}</p>
                  
                  <ul className="space-y-2 mb-8">
                    {type.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Link
                    to="/lawyers"
                    className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    选择律师
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Process Steps */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              咨询流程
            </h2>
            <p className="text-lg text-gray-600">
              简单四步，轻松获得专业法律建议
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <div key={step.step} className="text-center">
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full text-xl font-bold mb-4">
                    {step.step}
                  </div>
                  {index < processSteps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gray-200 -translate-y-0.5" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Advantages */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              为什么选择我们
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {advantages.map((advantage, index) => {
              const IconComponent = advantage.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-lg mb-4">
                    <IconComponent className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{advantage.title}</h3>
                  <p className="text-gray-600">{advantage.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            准备开始您的法律咨询了吗？
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            专业律师团队随时为您提供帮助
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/lawyers"
              className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              立即咨询
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/specialties"
              className="inline-flex items-center px-8 py-3 border-2 border-gray-600 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
            >
              查看专业领域
            </Link>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}