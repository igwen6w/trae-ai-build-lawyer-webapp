import { ArrowLeft, Shield, Eye, Lock, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link 
              to="/" 
              className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首页
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">隐私政策</h1>
            <p className="text-lg text-gray-600">
              我们重视您的隐私权，本政策详细说明我们如何收集、使用和保护您的个人信息。
            </p>
            <p className="text-sm text-gray-500 mt-2">
              最后更新时间：2024年1月1日
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-8 space-y-8">
              
              {/* 信息收集 */}
              <section>
                <div className="flex items-center mb-4">
                  <Eye className="w-6 h-6 text-blue-600 mr-3" />
                  <h2 className="text-2xl font-semibold text-gray-900">信息收集</h2>
                </div>
                <div className="space-y-4 text-gray-700">
                  <h3 className="text-lg font-medium text-gray-900">我们收集的信息类型：</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>个人身份信息：</strong>姓名、电话号码、电子邮箱地址</li>
                    <li><strong>账户信息：</strong>用户名、密码（加密存储）、个人资料</li>
                    <li><strong>咨询记录：</strong>与律师的咨询内容、时间记录</li>
                    <li><strong>技术信息：</strong>IP地址、浏览器类型、设备信息、访问日志</li>
                    <li><strong>使用数据：</strong>页面访问记录、功能使用统计</li>
                  </ul>
                  
                  <h3 className="text-lg font-medium text-gray-900 mt-6">信息收集方式：</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>您主动提供的信息（注册、咨询时填写）</li>
                    <li>自动收集的技术信息（Cookies、日志文件）</li>
                    <li>第三方服务提供的信息（支付、地图服务）</li>
                  </ul>
                </div>
              </section>

              {/* 信息使用 */}
              <section>
                <div className="flex items-center mb-4">
                  <Shield className="w-6 h-6 text-green-600 mr-3" />
                  <h2 className="text-2xl font-semibold text-gray-900">信息使用</h2>
                </div>
                <div className="space-y-4 text-gray-700">
                  <p>我们使用收集的信息用于以下目的：</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>提供服务：</strong>处理咨询请求、安排律师服务、账户管理</li>
                    <li><strong>改善体验：</strong>优化网站功能、个性化推荐、技术支持</li>
                    <li><strong>沟通联系：</strong>发送服务通知、重要更新、营销信息（可选）</li>
                    <li><strong>安全保障：</strong>防范欺诈、保护账户安全、维护系统稳定</li>
                    <li><strong>法律合规：</strong>遵守法律法规要求、配合执法部门调查</li>
                  </ul>
                </div>
              </section>

              {/* 信息保护 */}
              <section>
                <div className="flex items-center mb-4">
                  <Lock className="w-6 h-6 text-red-600 mr-3" />
                  <h2 className="text-2xl font-semibold text-gray-900">信息保护</h2>
                </div>
                <div className="space-y-4 text-gray-700">
                  <p>我们采取以下安全措施保护您的个人信息：</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>技术保护：</strong>SSL加密传输、数据库加密存储、访问控制</li>
                    <li><strong>管理措施：</strong>员工培训、权限管理、定期安全审计</li>
                    <li><strong>物理安全：</strong>服务器机房安全、备份策略、灾难恢复</li>
                    <li><strong>第三方监管：</strong>合作伙伴安全评估、数据处理协议</li>
                  </ul>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                    <p className="text-yellow-800">
                      <strong>重要提醒：</strong>虽然我们采取了严格的安全措施，但请注意网络传输和存储无法做到100%安全。请妥善保管您的账户信息，不要向他人透露密码。
                    </p>
                  </div>
                </div>
              </section>

              {/* 用户权利 */}
              <section>
                <div className="flex items-center mb-4">
                  <Shield className="w-6 h-6 text-purple-600 mr-3" />
                  <h2 className="text-2xl font-semibold text-gray-900">您的权利</h2>
                </div>
                <div className="space-y-4 text-gray-700">
                  <p>根据相关法律法规，您享有以下权利：</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>知情权：</strong>了解个人信息的收集、使用情况</li>
                    <li><strong>访问权：</strong>查看我们持有的您的个人信息</li>
                    <li><strong>更正权：</strong>要求更正不准确或不完整的信息</li>
                    <li><strong>删除权：</strong>在特定情况下要求删除个人信息</li>
                    <li><strong>限制处理权：</strong>限制我们对您信息的处理</li>
                    <li><strong>数据可携权：</strong>以结构化格式获取您的数据</li>
                    <li><strong>反对权：</strong>反对基于合法利益的数据处理</li>
                  </ul>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <p className="text-blue-800">
                      如需行使上述权利，请通过下方联系方式与我们联系。我们将在法定时间内回复您的请求。
                    </p>
                  </div>
                </div>
              </section>

              {/* Cookie政策 */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cookie政策</h2>
                <div className="space-y-4 text-gray-700">
                  <p>我们使用Cookie和类似技术来改善您的浏览体验：</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>必要Cookie：</strong>维持网站基本功能，无法禁用</li>
                    <li><strong>功能Cookie：</strong>记住您的偏好设置和登录状态</li>
                    <li><strong>分析Cookie：</strong>帮助我们了解网站使用情况</li>
                    <li><strong>营销Cookie：</strong>用于个性化广告投放（可选）</li>
                  </ul>
                  <p className="mt-4">
                    您可以通过浏览器设置管理Cookie偏好，但禁用某些Cookie可能影响网站功能。
                  </p>
                </div>
              </section>

              {/* 第三方服务 */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">第三方服务</h2>
                <div className="space-y-4 text-gray-700">
                  <p>我们可能使用以下第三方服务，它们有各自的隐私政策：</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>支付服务：</strong>支付宝、微信支付等支付平台</li>
                    <li><strong>地图服务：</strong>百度地图、高德地图等位置服务</li>
                    <li><strong>云服务：</strong>阿里云、腾讯云等云计算服务</li>
                    <li><strong>分析工具：</strong>网站访问统计和用户行为分析</li>
                  </ul>
                  <p className="mt-4">
                    我们要求所有第三方服务提供商遵守严格的数据保护标准，并仅在必要范围内共享信息。
                  </p>
                </div>
              </section>

              {/* 政策更新 */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">政策更新</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    我们可能会不时更新本隐私政策。重大变更时，我们会通过以下方式通知您：
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>在网站显著位置发布通知</li>
                    <li>通过电子邮件发送更新通知</li>
                    <li>在您下次登录时显示提醒</li>
                  </ul>
                  <p className="mt-4">
                    继续使用我们的服务即表示您接受更新后的隐私政策。
                  </p>
                </div>
              </section>

              {/* 联系我们 */}
              <section className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">联系我们</h2>
                <div className="space-y-4 text-gray-700">
                  <p>如果您对本隐私政策有任何疑问或需要行使您的权利，请通过以下方式联系我们：</p>
                  
                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <div className="flex items-start space-x-3">
                      <Phone className="w-5 h-5 text-blue-600 mt-1" />
                      <div>
                        <h3 className="font-medium text-gray-900">客服电话</h3>
                        <p className="text-gray-600">400-123-4567</p>
                        <p className="text-sm text-gray-500">工作时间：周一至周五 9:00-18:00</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Mail className="w-5 h-5 text-blue-600 mt-1" />
                      <div>
                        <h3 className="font-medium text-gray-900">邮箱联系</h3>
                        <p className="text-gray-600">privacy@lawfirm.com</p>
                        <p className="text-sm text-gray-500">我们将在24小时内回复</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800 text-sm">
                      <strong>数据保护官联系方式：</strong>dpo@lawfirm.com<br/>
                      如果您认为我们的数据处理违反了相关法律法规，您也可以向当地数据保护监管机构投诉。
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}