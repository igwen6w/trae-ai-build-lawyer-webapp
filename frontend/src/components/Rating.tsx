import { Star } from 'lucide-react';

interface RatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  reviewCount?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export default function Rating({
  rating,
  maxRating = 5,
  size = 'md',
  showNumber = false,
  reviewCount,
  interactive = false,
  onRatingChange
}: RatingProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const handleStarClick = (starRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const renderStars = () => {
    return Array.from({ length: maxRating }, (_, i) => {
      const starValue = i + 1;
      const isFilled = starValue <= Math.floor(rating);
      const isHalfFilled = starValue === Math.ceil(rating) && rating % 1 !== 0;

      return (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => handleStarClick(starValue)}
          className={`${
            interactive
              ? 'cursor-pointer hover:scale-110 transition-transform'
              : 'cursor-default'
          } ${interactive ? 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded' : ''}`}
        >
          <Star
            className={`${sizeClasses[size]} ${
              isFilled
                ? 'text-yellow-400 fill-current'
                : isHalfFilled
                ? 'text-yellow-400 fill-current opacity-50'
                : 'text-gray-300'
            } ${interactive ? 'hover:text-yellow-500' : ''}`}
          />
        </button>
      );
    });
  };

  return (
    <div className="flex items-center space-x-1">
      <div className="flex items-center space-x-0.5">
        {renderStars()}
      </div>
      
      {showNumber && (
        <span className={`${textSizeClasses[size]} text-gray-600 ml-1`}>
          {rating.toFixed(1)}
          {reviewCount !== undefined && (
            <span className="text-gray-500">
              {' '}({reviewCount}条评价)
            </span>
          )}
        </span>
      )}
    </div>
  );
}

// 评分统计组件
interface RatingStatsProps {
  ratings: { [key: number]: number }; // { 5: 120, 4: 45, 3: 12, 2: 3, 1: 1 }
  totalReviews: number;
  averageRating: number;
}

export function RatingStats({ ratings, totalReviews, averageRating }: RatingStatsProps) {
  const maxCount = Math.max(...Object.values(ratings));

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="text-center mb-6">
        <div className="text-4xl font-bold text-gray-900 mb-2">
          {averageRating.toFixed(1)}
        </div>
        <Rating rating={averageRating} size="lg" />
        <div className="text-sm text-gray-600 mt-2">
          基于 {totalReviews} 条评价
        </div>
      </div>
      
      <div className="space-y-3">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = ratings[star] || 0;
          const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
          
          return (
            <div key={star} className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 w-12">
                <span className="text-sm text-gray-600">{star}</span>
                <Star className="h-3 w-3 text-yellow-400 fill-current" />
              </div>
              
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              
              <div className="text-sm text-gray-600 w-8 text-right">
                {count}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}