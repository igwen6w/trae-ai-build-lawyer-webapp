import { Lawyer, Review, User, Consultation } from '@/types';

// 模拟律师数据
export const mockLawyers: Lawyer[] = [
  {
    id: '1',
    name: '张明华',
    avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20chinese%20lawyer%20portrait%20male%20suit%20confident%20smile&image_size=square',
    specialties: ['民事诉讼', '合同纠纷', '房产纠纷'],
    experience: 15,
    rating: 4.8,
    reviewCount: 156,
    hourlyRate: 500,
    location: '北京市朝阳区',
    description: '资深民事诉讼律师，专注于合同纠纷和房产纠纷领域，拥有丰富的庭审经验和成功案例。',
    education: '中国政法大学法学硕士',
    certifications: ['中华全国律师协会会员', '北京市律师协会会员'],
    successCases: 280,
    responseTime: '30分钟内',
    languages: ['中文', '英文'],
    isOnline: true
  },
  {
    id: '2',
    name: '李雅婷',
    avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20chinese%20female%20lawyer%20portrait%20business%20suit%20confident&image_size=square',
    specialties: ['婚姻家庭', '继承纠纷', '劳动争议'],
    experience: 12,
    rating: 4.9,
    reviewCount: 203,
    hourlyRate: 450,
    location: '上海市浦东新区',
    description: '专业婚姻家庭律师，在离婚财产分割、子女抚养权等方面有着丰富的实践经验。',
    education: '华东政法大学法学博士',
    certifications: ['上海市律师协会会员', '婚姻家庭专业委员会委员'],
    successCases: 195,
    responseTime: '1小时内',
    languages: ['中文'],
    isOnline: false
  },
  {
    id: '3',
    name: '王建国',
    avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=senior%20chinese%20lawyer%20male%20glasses%20professional%20portrait&image_size=square',
    specialties: ['刑事辩护', '经济犯罪', '职务犯罪'],
    experience: 20,
    rating: 4.7,
    reviewCount: 89,
    hourlyRate: 800,
    location: '广州市天河区',
    description: '知名刑事辩护律师，在经济犯罪和职务犯罪辩护方面具有卓越的专业能力。',
    education: '中山大学法学院法学硕士',
    certifications: ['广东省律师协会会员', '刑事专业委员会主任'],
    successCases: 145,
    responseTime: '2小时内',
    languages: ['中文', '粤语'],
    isOnline: true
  },
  {
    id: '4',
    name: '陈思琪',
    avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=young%20professional%20chinese%20female%20lawyer%20modern%20office%20confident&image_size=square',
    specialties: ['知识产权', '互联网法律', '公司法务'],
    experience: 8,
    rating: 4.6,
    reviewCount: 124,
    hourlyRate: 400,
    location: '深圳市南山区',
    description: '新生代知识产权律师，专注于互联网、科技公司的法律服务，熟悉新兴业务模式。',
    education: '清华大学法学院法学硕士',
    certifications: ['深圳市律师协会会员', '知识产权专业委员会委员'],
    successCases: 98,
    responseTime: '1小时内',
    languages: ['中文', '英文'],
    isOnline: true
  }
];

// 模拟评价数据
export const mockReviews: Review[] = [
  {
    id: '1',
    lawyerId: '1',
    clientId: 'client1',
    consultationId: 'cons1',
    rating: 5,
    comment: '张律师非常专业，帮我成功解决了房产纠纷问题，服务态度很好，强烈推荐！',
    createdAt: '2024-01-15T10:30:00Z',
    clientName: '刘先生',
    clientAvatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20businessman%20avatar%20professional&image_size=square'
  },
  {
    id: '2',
    lawyerId: '1',
    clientId: 'client2',
    consultationId: 'cons2',
    rating: 4,
    comment: '律师很有经验，分析问题很透彻，给出的建议很实用。',
    createdAt: '2024-01-10T14:20:00Z',
    clientName: '王女士',
    clientAvatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20businesswoman%20avatar%20professional&image_size=square'
  },
  {
    id: '3',
    lawyerId: '2',
    clientId: 'client3',
    consultationId: 'cons3',
    rating: 5,
    comment: '李律师在婚姻法方面非常专业，帮我顺利解决了离婚财产分割问题，非常感谢！',
    createdAt: '2024-01-08T16:45:00Z',
    clientName: '张女士',
    clientAvatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20woman%20avatar%20professional%20smile&image_size=square'
  },
  {
    id: '4',
    lawyerId: '3',
    clientId: 'client4',
    consultationId: 'cons4',
    rating: 5,
    comment: '王律师的刑事辩护能力很强，为我争取到了最好的结果，真的很感谢！',
    createdAt: '2024-01-05T09:15:00Z',
    clientName: '李先生',
    clientAvatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20man%20avatar%20casual%20friendly&image_size=square'
  },
  {
    id: '5',
    lawyerId: '4',
    clientId: 'client5',
    consultationId: 'cons5',
    rating: 4,
    comment: '陈律师对知识产权法很熟悉，帮我们公司处理了商标纠纷，很专业。',
    createdAt: '2024-01-03T11:30:00Z',
    clientName: '赵总',
    clientAvatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20ceo%20avatar%20business%20suit&image_size=square'
  }
];

// 模拟用户数据
export const mockUsers: User[] = [
  {
    id: 'user1',
    name: '测试用户',
    email: 'test@example.com',
    phone: '13800138000',
    avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=friendly%20chinese%20person%20avatar%20casual&image_size=square',
    role: 'client',
    createdAt: '2024-01-01T00:00:00Z'
  }
];

// 模拟咨询数据
export const mockConsultations: Consultation[] = [
  {
    id: '1',
    clientId: '1',
    lawyerId: '1',
    type: 'video',
    status: 'completed',
    scheduledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    description: '关于房产买卖合同的法律问题咨询',
    duration: 60,
    fee: 800,
    amount: 800,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    clientId: '1',
    lawyerId: '2',
    type: 'phone',
    status: 'confirmed',
    scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    description: '劳动合同纠纷相关法律咨询',
    duration: 30,
    fee: 480,
    amount: 480,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    clientId: '1',
    lawyerId: '3',
    type: 'text',
    status: 'pending',
    scheduledAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    description: '婚姻财产分割问题咨询',
    duration: 0,
    fee: 300,
    amount: 300,
    createdAt: new Date().toISOString()
  }
];

// 专业领域选项
export const specialtyOptions = [
  '民事诉讼',
  '刑事辩护',
  '婚姻家庭',
  '合同纠纷',
  '房产纠纷',
  '劳动争议',
  '知识产权',
  '公司法务',
  '互联网法律',
  '继承纠纷',
  '经济犯罪',
  '职务犯罪'
];

// 地区选项
export const locationOptions = [
  '北京市',
  '上海市',
  '广州市',
  '深圳市',
  '杭州市',
  '南京市',
  '成都市',
  '武汉市',
  '西安市',
  '重庆市'
];