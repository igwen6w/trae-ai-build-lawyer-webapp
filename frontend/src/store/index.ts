import { create } from 'zustand';
import { User, Lawyer, Consultation, Review, LawyerFilters, SortOption, SortDirection } from '@/types';

// 用户状态管理
interface UserState {
  user: User | null;
  currentUser: User | null;
  isLoggedIn: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: {
    id: '1',
    name: '张三',
    email: 'zhangsan@example.com',
    phone: '13800138000',
    avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20user%20avatar%20chinese%20male&image_size=square',
    role: 'client' as const,
    createdAt: new Date().toISOString()
  },
  currentUser: null,
  isLoggedIn: true,
  isAuthenticated: false,
  login: (email: string, password: string) => {
     const user: User = {
       id: '1',
       name: '张三',
       email: email,
       phone: '13800138000',
       avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20user%20avatar%20chinese%20male&image_size=square',
       role: 'client' as const,
       createdAt: new Date().toISOString()
     };
     set({ user, currentUser: user, isLoggedIn: true, isAuthenticated: true });
   },
  logout: () => set({ user: null, currentUser: null, isLoggedIn: false, isAuthenticated: false }),
  updateUser: (updates: Partial<User>) => set((state) => ({
    user: state.user ? { ...state.user, ...updates } : null,
    currentUser: state.currentUser ? { ...state.currentUser, ...updates } : null
  })),
}));

// 律师数据状态管理
interface LawyerState {
  lawyers: Lawyer[];
  filteredLawyers: Lawyer[];
  selectedLawyer: Lawyer | null;
  filters: LawyerFilters;
  sortBy: SortOption;
  sortDirection: SortDirection;
  searchQuery: string;
  setLawyers: (lawyers: Lawyer[]) => void;
  setSelectedLawyer: (lawyer: Lawyer | null) => void;
  setFilters: (filters: Partial<LawyerFilters>) => void;
  setSorting: (sortBy: SortOption, direction: SortDirection) => void;
  setSearchQuery: (query: string) => void;
  applyFiltersAndSort: () => void;
}

export const useLawyerStore = create<LawyerState>((set, get) => ({
  lawyers: [],
  filteredLawyers: [],
  selectedLawyer: null,
  filters: {
    specialties: [],
    experienceRange: [0, 30],
    ratingRange: [0, 5],
    priceRange: [0, 1000],
    location: '',
    isOnline: undefined
  },
  sortBy: 'rating',
  sortDirection: 'desc',
  searchQuery: '',
  setLawyers: (lawyers) => {
    set({ lawyers });
    get().applyFiltersAndSort();
  },
  setSelectedLawyer: (lawyer) => set({ selectedLawyer: lawyer }),
  setFilters: (newFilters) => {
    set((state) => ({ filters: { ...state.filters, ...newFilters } }));
    get().applyFiltersAndSort();
  },
  setSorting: (sortBy, sortDirection) => {
    set({ sortBy, sortDirection });
    get().applyFiltersAndSort();
  },
  setSearchQuery: (searchQuery) => {
    set({ searchQuery });
    get().applyFiltersAndSort();
  },
  applyFiltersAndSort: () => {
    const { lawyers, filters, sortBy, sortDirection, searchQuery } = get();
    
    let filtered = lawyers.filter((lawyer) => {
      // 搜索查询过滤
      if (searchQuery && !lawyer.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !lawyer.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))) {
        return false;
      }
      
      // 专业领域过滤
      if (filters.specialties.length > 0 && 
          !filters.specialties.some(s => lawyer.specialties.includes(s))) {
        return false;
      }
      
      // 经验范围过滤
      if (lawyer.experience < filters.experienceRange[0] || 
          lawyer.experience > filters.experienceRange[1]) {
        return false;
      }
      
      // 评分范围过滤
      if (lawyer.rating < filters.ratingRange[0] || 
          lawyer.rating > filters.ratingRange[1]) {
        return false;
      }
      
      // 价格范围过滤
      if (lawyer.hourlyRate < filters.priceRange[0] || 
          lawyer.hourlyRate > filters.priceRange[1]) {
        return false;
      }
      
      // 地区过滤
      if (filters.location && !lawyer.location.includes(filters.location)) {
        return false;
      }
      
      // 在线状态过滤
      if (filters.isOnline !== undefined && lawyer.isOnline !== filters.isOnline) {
        return false;
      }
      
      return true;
    });
    
    // 排序
    filtered.sort((a, b) => {
      let aValue: number;
      let bValue: number;
      
      switch (sortBy) {
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        case 'price':
          aValue = a.hourlyRate;
          bValue = b.hourlyRate;
          break;
        case 'experience':
          aValue = a.experience;
          bValue = b.experience;
          break;
        case 'reviews':
          aValue = a.reviewCount;
          bValue = b.reviewCount;
          break;
        default:
          return 0;
      }
      
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });
    
    set({ filteredLawyers: filtered });
  }
}));

// 咨询状态管理
interface ConsultationState {
  consultations: Consultation[];
  currentConsultation: Consultation | null;
  setConsultations: (consultations: Consultation[]) => void;
  addConsultation: (consultation: Consultation) => void;
  updateConsultation: (id: string, updates: Partial<Consultation>) => void;
  setCurrentConsultation: (consultation: Consultation | null) => void;
}

export const useConsultationStore = create<ConsultationState>((set) => ({
  consultations: [],
  currentConsultation: null,
  setConsultations: (consultations) => set({ consultations }),
  addConsultation: (consultation) => set((state) => ({
    consultations: [...state.consultations, consultation]
  })),
  updateConsultation: (id, updates) => set((state) => ({
    consultations: state.consultations.map(c => 
      c.id === id ? { ...c, ...updates } : c
    )
  })),
  setCurrentConsultation: (consultation) => set({ currentConsultation: consultation })
}));

// 评价状态管理
interface ReviewState {
  reviews: Review[];
  setReviews: (reviews: Review[]) => void;
  addReview: (review: Review) => void;
  getReviewsByLawyer: (lawyerId: string) => Review[];
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  reviews: [],
  setReviews: (reviews) => set({ reviews }),
  addReview: (review) => set((state) => ({
    reviews: [...state.reviews, review]
  })),
  getReviewsByLawyer: (lawyerId) => {
    return get().reviews.filter(review => review.lawyerId === lawyerId);
  }
}));