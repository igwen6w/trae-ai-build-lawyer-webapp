// 用户类型定义
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: 'client' | 'lawyer';
  createdAt: string;
}

// 律师类型定义
export interface Lawyer {
  id: string;
  name: string;
  avatar: string;
  specialties: string[];
  experience: number; // 执业年限
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  location: string;
  description: string;
  education: string;
  certifications: string[];
  successCases: number;
  responseTime: string; // 响应时间
  languages: string[];
  isOnline: boolean;
}

// 咨询方式类型
export type ConsultationType = 'phone' | 'video' | 'text';

// 咨询预约类型
export interface Consultation {
  id: string;
  lawyerId: string;
  clientId: string;
  type: ConsultationType;
  scheduledAt: string;
  duration: number; // 分钟
  fee: number;
  amount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  description: string;
  createdAt: string;
}

// 评价类型
export interface Review {
  id: string;
  lawyerId: string;
  clientId: string;
  consultationId: string;
  rating: number;
  comment: string;
  createdAt: string;
  clientName: string;
  clientAvatar?: string;
}

// 支付订单类型
export interface PaymentOrder {
  id: string;
  consultationId: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'wechat' | 'alipay' | 'card';
  createdAt: string;
  paidAt?: string;
}

// 筛选条件类型
export interface LawyerFilters {
  specialties: string[];
  experienceRange: [number, number];
  ratingRange: [number, number];
  priceRange: [number, number];
  location: string;
  isOnline?: boolean;
}

// 排序选项类型
export type SortOption = 'rating' | 'price' | 'experience' | 'reviews';

// 排序方向类型
export type SortDirection = 'asc' | 'desc';