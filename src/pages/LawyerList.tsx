import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LawyerCard from '@/components/LawyerCard';
import { useLawyerStore } from '@/store';
import { mockLawyers, specialtyOptions, locationOptions } from '@/data/mockData';
import { SortOption, SortDirection } from '@/types';

export default function LawyerList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [tempFilters, setTempFilters] = useState({
    specialties: [] as string[],
    experienceRange: [0, 30] as [number, number],
    ratingRange: [0, 5] as [number, number],
    priceRange: [0, 1000] as [number, number],
    location: '',
    isOnline: undefined as boolean | undefined
  });

  const {
    lawyers,
    filteredLawyers,
    filters,
    sortBy,
    sortDirection,
    searchQuery,
    setLawyers,
    setFilters,
    setSorting,
    setSearchQuery
  } = useLawyerStore();

  useEffect(() => {
    // 初始化律师数据
    if (lawyers.length === 0) {
      setLawyers(mockLawyers);
    }

    // 从URL参数设置搜索和筛选条件
    const search = searchParams.get('search');
    const specialty = searchParams.get('specialty');
    
    if (search) {
      setSearchQuery(search);
    }
    
    if (specialty) {
      setFilters({ specialties: [specialty] });
      setTempFilters(prev => ({ ...prev, specialties: [specialty] }));
    }
  }, [searchParams, setLawyers, setSearchQuery, setFilters, lawyers.length]);

  const handleSortChange = (newSortBy: SortOption) => {
    const newDirection: SortDirection = 
      sortBy === newSortBy && sortDirection === 'desc' ? 'asc' : 'desc';
    setSorting(newSortBy, newDirection);
  };

  const handleFilterChange = (key: string, value: any) => {
    setTempFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    setShowFilters(false);
  };

  const resetFilters = () => {
    const defaultFilters = {
      specialties: [],
      experienceRange: [0, 30] as [number, number],
      ratingRange: [0, 5] as [number, number],
      priceRange: [0, 1000] as [number, number],
      location: '',
      isOnline: undefined
    };
    setTempFilters(defaultFilters);
    setFilters(defaultFilters);
  };

  const toggleSpecialty = (specialty: string) => {
    const newSpecialties = tempFilters.specialties.includes(specialty)
      ? tempFilters.specialties.filter(s => s !== specialty)
      : [...tempFilters.specialties, specialty];
    handleFilterChange('specialties', newSpecialties);
  };

  const getSortLabel = (sort: SortOption) => {
    const labels = {
      rating: '评分',
      price: '价格',
      experience: '经验',
      reviews: '评价数'
    };
    return labels[sort];
  };

  const activeFiltersCount = 
    tempFilters.specialties.length +
    (tempFilters.location ? 1 : 0) +
    (tempFilters.isOnline !== undefined ? 1 : 0) +
    (tempFilters.experienceRange[0] > 0 || tempFilters.experienceRange[1] < 30 ? 1 : 0) +
    (tempFilters.ratingRange[0] > 0 || tempFilters.ratingRange[1] < 5 ? 1 : 0) +
    (tempFilters.priceRange[0] > 0 || tempFilters.priceRange[1] < 1000 ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">找律师</h1>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-gray-600">
              找到 {filteredLawyers.length} 位律师
              {searchQuery && (
                <span className="ml-2">
                  搜索: <span className="font-medium">"{searchQuery}"</span>
                </span>
              )}
            </p>
            
            <div className="flex items-center space-x-4">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={`${sortBy}-${sortDirection}`}
                  onChange={(e) => {
                    const [sort, direction] = e.target.value.split('-') as [SortOption, SortDirection];
                    setSorting(sort, direction);
                  }}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="rating-desc">评分从高到低</option>
                  <option value="rating-asc">评分从低到高</option>
                  <option value="price-asc">价格从低到高</option>
                  <option value="price-desc">价格从高到低</option>
                  <option value="experience-desc">经验从多到少</option>
                  <option value="experience-asc">经验从少到多</option>
                  <option value="reviews-desc">评价数从多到少</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              
              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>筛选</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-80 flex-shrink-0`}>
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">筛选条件</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={resetFilters}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    重置
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="lg:hidden text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              {/* Specialties Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">专业领域</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {specialtyOptions.map((specialty) => (
                    <label key={specialty} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={tempFilters.specialties.includes(specialty)}
                        onChange={() => toggleSpecialty(specialty)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{specialty}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Location Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">地区</h4>
                <select
                  value={tempFilters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">所有地区</option>
                  {locationOptions.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Experience Range */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">执业年限</h4>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={tempFilters.experienceRange[1]}
                    onChange={(e) => handleFilterChange('experienceRange', [0, parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>0年</span>
                    <span>{tempFilters.experienceRange[1]}年以上</span>
                  </div>
                </div>
              </div>
              
              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">咨询费用 (每小时)</h4>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={tempFilters.priceRange[1]}
                    onChange={(e) => handleFilterChange('priceRange', [0, parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>¥0</span>
                    <span>¥{tempFilters.priceRange[1]}以下</span>
                  </div>
                </div>
              </div>
              
              {/* Online Status */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">在线状态</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="onlineStatus"
                      checked={tempFilters.isOnline === undefined}
                      onChange={() => handleFilterChange('isOnline', undefined)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">全部</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="onlineStatus"
                      checked={tempFilters.isOnline === true}
                      onChange={() => handleFilterChange('isOnline', true)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">在线</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="onlineStatus"
                      checked={tempFilters.isOnline === false}
                      onChange={() => handleFilterChange('isOnline', false)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">离线</span>
                  </label>
                </div>
              </div>
              
              <button
                onClick={applyFilters}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                应用筛选
              </button>
            </div>
          </div>
          
          {/* Lawyers List */}
          <div className="flex-1">
            {filteredLawyers.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Filter className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">未找到匹配的律师</h3>
                <p className="text-gray-600 mb-4">请尝试调整筛选条件或搜索关键词</p>
                <button
                  onClick={resetFilters}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  重置筛选条件
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredLawyers.map((lawyer) => (
                  <LawyerCard key={lawyer.id} lawyer={lawyer} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}