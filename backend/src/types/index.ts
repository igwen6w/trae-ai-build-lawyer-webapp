import { Request } from 'express';

// User Types
export interface IUser {
  id: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  avatar?: string;
  role: 'user' | 'lawyer' | 'admin';
  is_verified: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Lawyer Types
export interface ILawyer {
  id: string;
  user_id: string;
  specialties: string[];
  experience: number;
  education: string;
  license_number: string;
  location: string;
  hourly_rate: number;
  bio: string;
  languages: string[];
  is_online: boolean;
  rating: number;
  review_count: number;
  success_cases: number;
  response_time: string;
  availability: {
    [key: string]: {
      start: string;
      end: string;
      available: boolean;
    }[];
  };
  created_at: Date;
  updated_at: Date;
}

// Consultation Types
export interface IConsultation {
  id: string;
  client_id: string;
  lawyer_id: string;
  type: 'text' | 'phone' | 'video';
  status: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
  scheduled_at: Date;
  duration: number;
  price: number;
  description: string;
  rating?: number;
  review?: string;
  payment_id?: string;
  created_at: Date;
  updated_at: Date;
}

// Message Types
export interface IMessage {
  id: string;
  consultation_id: string;
  sender_id: string;
  sender_type: 'client' | 'lawyer';
  content: string;
  type: 'text' | 'file' | 'image';
  timestamp: Date;
  is_read: boolean;
}

// Payment Types
export interface IPayment {
  id: string;
  user_id: string;
  consultation_id: string;
  amount: number;
  currency: string;
  payment_method?: string;
  description?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  stripe_payment_intent_id: string;
  created_at: Date;
  updated_at: Date;
}

// Review Types
export interface IReview {
  id: string;
  client_id: string;
  lawyer_id: string;
  consultation_id: string;
  rating: number;
  comment: string;
  is_anonymous?: boolean;
  created_at: Date;
  updated_at: Date;
}

// Admin Types
export interface IAdmin {
  id: string;
  user_id: string;
  role: 'super_admin' | 'admin' | 'customer_service';
  permissions: Record<string, boolean>;
  last_login?: Date;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface IAdminLog {
  id: string;
  admin_id: string;
  action: string;
  target_type?: string;
  target_id?: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

export interface ISystemSetting {
  id: string;
  key: string;
  value: any;
  description?: string;
  category: string;
  is_public: boolean;
  updated_by?: string;
  created_at: Date;
  updated_at: Date;
}

// Request Types
export interface AuthRequest extends Request {
  user?: IUser;
  admin?: IAdmin;
  pagination?: {
    page: number;
    limit: number;
    offset: number;
    sort: string;
    order: 'ASC' | 'DESC';
  };
}

export interface AdminRequest extends Request {
  admin?: IAdmin;
  user?: IUser;
  pagination?: {
    page: number;
    limit: number;
    offset: number;
    sort: string;
    order: 'ASC' | 'DESC';
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Pagination Types
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Filter Types
export interface LawyerFilter {
  specialties?: string[];
  location?: string;
  minRating?: number;
  maxHourlyRate?: number;
  isOnline?: boolean;
  experience?: number;
}

// Socket Types
export interface SocketUser {
  userId: string;
  socketId: string;
  role: 'user' | 'lawyer';
  isOnline: boolean;
}

// Video Call Types
export interface VideoCallSession {
  consultation_id: string;
  channel_name: string;
  token: string;
  uid: number;
  participants: {
    client_id: string;
    lawyer_id: string;
  };
  start_time: Date;
  end_time?: Date;
}

// SMS Types
export interface SMSMessage {
  to: string;
  message: string;
  type: 'verification' | 'notification' | 'reminder';
}

// Email Types
export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  type: 'verification' | 'notification' | 'reminder' | 'receipt';
}