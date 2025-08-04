import { Award, Shield, Heart, Target, CheckCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function About() {
  const teamMembers = [
    {
      name: '张律师',
      position: '创始人 & 首席律师',
      specialty: '公司法、合同法',
      experience: '15年执业经验',
      image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20chinese%20lawyer%20portrait%20male%20suit&image_size=square'
    },
    {
      name: '李律师',
      position: '合伙人律师',
      specialty: '刑事辩护、民事诉讼',
      experience: '12年执业经验',
      image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20chinese%20lawyer%20portrait%20female%20suit&image_size=square'
    },
    {
      name: '王律师',
      position: '资深律师',
      specialty: '知识产权、劳动法',
      experience: '10年执业经验',
      image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20chinese%20lawyer%20portrait%20male%20glasses&image_size=square'
    }
  ];

  const values = [
    {
      icon: Shield,
      title: '专业可靠',
      description: '我们拥有资深的律师团队，为客户提供专业、可靠的法律服务'
    },
    {
      icon: Heart,
      title: '用心服务',
      description: '以客户为中心，用心倾听每一个法律需求，提供贴心的服务体验'
    },
    {
      icon: Target,
      title: '精准高效',
      description: '针对不同案件类型，制定精准的解决方案，高效解决法律问题'
    },
    {
      icon: CheckCircle,
      title: '诚信透明',
      description: '坚持诚信经营，收费透明公开，让客户明明白白消费'
    }
  ];

  const achievements = [
    { number: '1000+', label: '成功案例' },
    { number: '50+', label: '专业律师' },
    { number: '98%', label: '客户满意度' },
    { number: '24/7', label: '在线服务' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            关于我们
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
            专业的法律服务平台，致力于为每一位客户提供优质、高效的法律咨询服务
          </p>
        </div>
      </section>

      {/* Company Introduction */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                我们的使命
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                法律咨询平台成立于2020年，是一家专注于为个人和企业提供专业法律服务的互联网平台。我们致力于打破传统法律服务的壁垒，让每个人都能便捷地获得专业的法律帮助。
              </p>
              <p className="text-lg text-gray-600 mb-6">
                通过整合优质的律师资源和先进的技术手段，我们为客户提供涵盖民事、刑事、商事、知识产权等多个领域的法律咨询服务。无论是日常的法律问题咨询，还是复杂的诉讼案件，我们都能为您匹配最合适的专业律师。
              </p>
              <div className="flex items-center space-x-4">
                <Award className="h-8 w-8 text-blue-600" />
                <span className="text-lg font-semibold text-gray-900">国家认证的专业法律服务平台</span>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20law%20office%20interior%20professional%20meeting%20room&image_size=landscape_16_9"
                alt="法律咨询办公室"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              我们的价值观
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              以专业、诚信、高效为核心，为客户创造最大价值
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <div key={index} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6 mx-auto">
                    <IconComponent className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 text-center">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              专业团队
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              汇聚行业精英，为您提供最专业的法律服务
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-6 object-cover"
                />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-blue-600 font-semibold mb-2">
                  {member.position}
                </p>
                <p className="text-gray-600 mb-2">
                  专业领域：{member.specialty}
                </p>
                <p className="text-gray-500 text-sm">
                  {member.experience}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              我们的成就
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              数字见证我们的专业与实力
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2">
                  {achievement.number}
                </div>
                <div className="text-blue-100 text-lg">
                  {achievement.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            准备开始您的法律咨询？
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            我们的专业律师团队随时为您提供帮助
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/lawyers"
              className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-colors text-lg font-semibold"
            >
              立即咨询
            </a>
            <a
              href="/contact"
              className="border border-blue-600 text-blue-600 px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors text-lg font-semibold"
            >
              联系我们
            </a>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}