import { Scale, Users, Building, Heart, Shield, FileText, Briefcase, Home } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const specialties = [
  {
    id: 1,
    name: '民事法律',
    description: '处理个人和组织之间的民事纠纷，包括合同纠纷、侵权责任、财产纠纷等',
    icon: Scale,
    color: 'bg-blue-500',
    cases: ['合同纠纷', '侵权赔偿', '财产分割', '债务纠纷']
  },
  {
    id: 2,
    name: '刑事法律',
    description: '为刑事案件提供法律援助，包括刑事辩护、取保候审、减刑申请等',
    icon: Shield,
    color: 'bg-red-500',
    cases: ['刑事辩护', '取保候审', '缓刑申请', '无罪辩护']
  },
  {
    id: 3,
    name: '公司法律',
    description: '为企业提供全方位法律服务，包括公司设立、合规管理、商业合同等',
    icon: Building,
    color: 'bg-green-500',
    cases: ['公司设立', '股权转让', '商业合同', '知识产权']
  },
  {
    id: 4,
    name: '婚姻家庭',
    description: '处理婚姻家庭相关法律事务，包括离婚诉讼、财产分割、子女抚养等',
    icon: Heart,
    color: 'bg-pink-500',
    cases: ['离婚诉讼', '财产分割', '子女抚养', '遗产继承']
  },
  {
    id: 5,
    name: '劳动法律',
    description: '维护劳动者权益，处理劳动争议、工伤赔偿、社保纠纷等问题',
    icon: Users,
    color: 'bg-purple-500',
    cases: ['劳动争议', '工伤赔偿', '社保纠纷', '加班费追讨']
  },
  {
    id: 6,
    name: '房产法律',
    description: '处理房地产相关法律事务，包括房屋买卖、租赁纠纷、物业管理等',
    icon: Home,
    color: 'bg-orange-500',
    cases: ['房屋买卖', '租赁纠纷', '物业纠纷', '拆迁补偿']
  },
  {
    id: 7,
    name: '知识产权',
    description: '保护知识产权，处理专利申请、商标注册、版权保护等事务',
    icon: FileText,
    color: 'bg-indigo-500',
    cases: ['专利申请', '商标注册', '版权保护', '侵权维权']
  },
  {
    id: 8,
    name: '金融法律',
    description: '处理金融相关法律事务，包括银行贷款、投资纠纷、保险理赔等',
    icon: Briefcase,
    color: 'bg-yellow-500',
    cases: ['银行贷款', '投资纠纷', '保险理赔', '金融诈骗']
  }
];

export default function Specialties() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            专业法律服务领域
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            我们的专业律师团队覆盖多个法律领域，为您提供全方位的法律服务和专业咨询
          </p>
        </div>

        {/* Specialties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {specialties.map((specialty) => {
            const IconComponent = specialty.icon;
            return (
              <div
                key={specialty.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group cursor-pointer"
              >
                {/* Header */}
                <div className={`${specialty.color} p-6 text-white`}>
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-3 bg-white/20 rounded-full">
                      <IconComponent className="h-8 w-8" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-center">{specialty.name}</h3>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                    {specialty.description}
                  </p>
                  
                  {/* Cases */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">主要业务：</h4>
                    <div className="flex flex-wrap gap-1">
                      {specialty.cases.map((case_, index) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {case_}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6">
                  <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200 group-hover:bg-blue-50 group-hover:text-blue-700">
                    查看专业律师
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">需要专业法律咨询？</h2>
          <p className="text-xl mb-6 text-blue-100">
            我们的专业律师团队随时为您提供优质的法律服务
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 font-semibold py-3 px-8 rounded-lg hover:bg-blue-50 transition-colors">
              立即咨询
            </button>
            <button className="border-2 border-white text-white font-semibold py-3 px-8 rounded-lg hover:bg-white hover:text-blue-600 transition-colors">
              查看所有律师
            </button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}