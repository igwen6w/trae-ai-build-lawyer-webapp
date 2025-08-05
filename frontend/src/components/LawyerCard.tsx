import { Link } from 'react-router-dom';
import { Star, MapPin, Clock, MessageCircle, Video, Phone } from 'lucide-react';
import { Lawyer } from '@/types';

interface LawyerCardProps {
  lawyer: Lawyer;
  variant?: 'default' | 'compact';
}

export default function LawyerCard({ lawyer, variant = 'default' }: LawyerCardProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : i < rating
            ? 'text-yellow-400 fill-current opacity-50'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  if (variant === 'compact') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src={lawyer.avatar}
              alt={lawyer.name}
              className="h-16 w-16 rounded-full object-cover"
            />
            {lawyer.isOnline && (
              <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{lawyer.name}</h3>
            <div className="flex items-center space-x-1 mt-1">
              {renderStars(lawyer.rating)}
              <span className="text-sm text-gray-600 ml-1">
                {lawyer.rating} ({lawyer.reviewCount}条评价)
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              {lawyer.location}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-lg font-bold text-blue-600">¥{lawyer.hourlyRate}/小时</div>
            <Link
              to={`/lawyers/${lawyer.id}`}
              className="inline-block mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              立即咨询
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start space-x-4">
          <div className="relative">
            <img
              src={lawyer.avatar}
              alt={lawyer.name}
              className="h-20 w-20 rounded-full object-cover"
            />
            {lawyer.isOnline && (
              <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                <div className="h-2 w-2 bg-white rounded-full"></div>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{lawyer.name}</h3>
                <p className="text-gray-600 mt-1">{lawyer.experience}年执业经验</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">¥{lawyer.hourlyRate}</div>
                <div className="text-sm text-gray-500">每小时</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 mt-2">
              {renderStars(lawyer.rating)}
              <span className="text-sm text-gray-600 ml-2">
                {lawyer.rating} ({lawyer.reviewCount}条评价)
              </span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600 mt-2">
              <MapPin className="h-4 w-4 mr-1" />
              {lawyer.location}
              <Clock className="h-4 w-4 ml-4 mr-1" />
              {lawyer.responseTime}响应
            </div>
            
            <div className="flex flex-wrap gap-2 mt-3">
              {lawyer.specialties.slice(0, 3).map((specialty, index) => (
                <span
                  key={index}
                  className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                >
                  {specialty}
                </span>
              ))}
              {lawyer.specialties.length > 3 && (
                <span className="inline-block bg-gray-50 text-gray-600 px-3 py-1 rounded-full text-sm">
                  +{lawyer.specialties.length - 3}个专业
                </span>
              )}
            </div>
            
            <p className="text-gray-600 mt-3 line-clamp-2">{lawyer.description}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <MessageCircle className="h-4 w-4 mr-1" />
              图文咨询
            </div>
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-1" />
              电话咨询
            </div>
            <div className="flex items-center">
              <Video className="h-4 w-4 mr-1" />
              视频咨询
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Link
              to={`/lawyers/${lawyer.id}`}
              className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              查看详情
            </Link>
            <Link
              to={`/consultation/book/${lawyer.id}`}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              立即咨询
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}