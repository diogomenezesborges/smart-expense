// Community Service for Social Features and Learning Platform
export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: 'savings' | 'budgeting' | 'investment' | 'debt' | 'general';
  type: 'individual' | 'group' | 'competitive';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // days
  startDate: Date;
  endDate: Date;
  targetAmount?: number;
  targetPercentage?: number;
  rules: string[];
  rewards: {
    points: number;
    badges: string[];
    unlocks?: string[];
  };
  participants: number;
  maxParticipants?: number;
  createdBy: string;
  status: 'upcoming' | 'active' | 'completed';
  featured: boolean;
}

export interface ChallengeParticipation {
  id: string;
  challengeId: string;
  userId: string;
  joinedAt: Date;
  progress: number; // 0-100
  currentValue: number;
  targetValue: number;
  lastUpdate: Date;
  rank?: number;
  completed: boolean;
  achievements: string[];
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  category: 'basics' | 'budgeting' | 'investing' | 'retirement' | 'taxes' | 'advanced';
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // minutes
  lessons: Lesson[];
  prerequisites?: string[];
  completionRate: number;
  rating: number;
  enrollments: number;
  createdBy: string;
  tags: string[];
  featured: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'article' | 'interactive' | 'quiz' | 'simulation';
  content: string;
  duration: number;
  order: number;
  completed?: boolean;
  resources?: LearningResource[];
}

export interface LearningResource {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'article' | 'tool' | 'calculator';
  url: string;
  description: string;
}

export interface Expert {
  id: string;
  name: string;
  title: string;
  specialties: string[];
  credentials: string[];
  rating: number;
  reviewCount: number;
  hourlyRate?: number;
  availability: {
    timezone: string;
    schedule: { [key: string]: string[] }; // day -> time slots
  };
  bio: string;
  profileImage: string;
  verified: boolean;
  languages: string[];
  consultationTypes: ('video' | 'phone' | 'chat' | 'email')[];
}

export interface Consultation {
  id: string;
  expertId: string;
  userId: string;
  type: 'video' | 'phone' | 'chat' | 'email';
  scheduledAt: Date;
  duration: number;
  topic: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  documents?: string[];
  followUpRequired: boolean;
  rating?: number;
  review?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  unlockedAt?: Date;
  progress?: {
    current: number;
    target: number;
  };
}

export interface SocialPost {
  id: string;
  userId: string;
  author: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  type: 'achievement' | 'milestone' | 'tip' | 'question' | 'story';
  content: string;
  attachments?: {
    type: 'image' | 'chart' | 'document';
    url: string;
    caption?: string;
  }[];
  likes: number;
  comments: number;
  shares: number;
  createdAt: Date;
  tags: string[];
  privacy: 'public' | 'community' | 'friends';
}

export class CommunityService {
  private static readonly API_BASE = '/api/community';

  /**
   * Get available challenges
   */
  static async getChallenges(
    filters?: {
      category?: string;
      type?: string;
      difficulty?: string;
      status?: string;
    }
  ): Promise<Challenge[]> {
    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) queryParams.append(key, value);
        });
      }

      const response = await fetch(`${this.API_BASE}/challenges?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch challenges: ${response.statusText}`);
      }

      const data = await response.json();
      return data.challenges || this.getMockChallenges();
    } catch (error) {
      console.error('Failed to fetch challenges:', error);
      return this.getMockChallenges();
    }
  }

  /**
   * Join a challenge
   */
  static async joinChallenge(
    userId: string,
    challengeId: string
  ): Promise<ChallengeParticipation> {
    try {
      const response = await fetch(`${this.API_BASE}/challenges/${challengeId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to join challenge: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to join challenge:', error);
      throw error;
    }
  }

  /**
   * Get user's challenge participations
   */
  static async getUserChallenges(userId: string): Promise<ChallengeParticipation[]> {
    try {
      const response = await fetch(`${this.API_BASE}/users/${userId}/challenges`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user challenges: ${response.statusText}`);
      }

      const data = await response.json();
      return data.participations || this.getMockParticipations();
    } catch (error) {
      console.error('Failed to fetch user challenges:', error);
      return this.getMockParticipations();
    }
  }

  /**
   * Get learning modules
   */
  static async getLearningModules(
    category?: string,
    level?: string
  ): Promise<LearningModule[]> {
    try {
      const queryParams = new URLSearchParams();
      if (category) queryParams.append('category', category);
      if (level) queryParams.append('level', level);

      const response = await fetch(`${this.API_BASE}/learning?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch learning modules: ${response.statusText}`);
      }

      const data = await response.json();
      return data.modules || this.getMockLearningModules();
    } catch (error) {
      console.error('Failed to fetch learning modules:', error);
      return this.getMockLearningModules();
    }
  }

  /**
   * Get available experts
   */
  static async getExperts(
    specialty?: string,
    availability?: boolean
  ): Promise<Expert[]> {
    try {
      const queryParams = new URLSearchParams();
      if (specialty) queryParams.append('specialty', specialty);
      if (availability) queryParams.append('availability', 'true');

      const response = await fetch(`${this.API_BASE}/experts?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch experts: ${response.statusText}`);
      }

      const data = await response.json();
      return data.experts || this.getMockExperts();
    } catch (error) {
      console.error('Failed to fetch experts:', error);
      return this.getMockExperts();
    }
  }

  /**
   * Book consultation with expert
   */
  static async bookConsultation(
    userId: string,
    expertId: string,
    consultation: Partial<Consultation>
  ): Promise<Consultation> {
    try {
      const response = await fetch(`${this.API_BASE}/consultations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          expertId,
          ...consultation
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to book consultation: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to book consultation:', error);
      throw error;
    }
  }

  /**
   * Get user achievements
   */
  static async getUserAchievements(userId: string): Promise<Achievement[]> {
    try {
      const response = await fetch(`${this.API_BASE}/users/${userId}/achievements`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch achievements: ${response.statusText}`);
      }

      const data = await response.json();
      return data.achievements || this.getMockAchievements();
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
      return this.getMockAchievements();
    }
  }

  /**
   * Get community social feed
   */
  static async getSocialFeed(
    userId: string,
    type?: string,
    limit: number = 20
  ): Promise<SocialPost[]> {
    try {
      const queryParams = new URLSearchParams();
      if (type) queryParams.append('type', type);
      queryParams.append('limit', limit.toString());

      const response = await fetch(`${this.API_BASE}/feed?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch social feed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.posts || this.getMockSocialPosts();
    } catch (error) {
      console.error('Failed to fetch social feed:', error);
      return this.getMockSocialPosts();
    }
  }

  /**
   * Share achievement to community
   */
  static async shareAchievement(
    userId: string,
    achievement: Achievement,
    message?: string
  ): Promise<SocialPost> {
    try {
      const response = await fetch(`${this.API_BASE}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          type: 'achievement',
          achievement,
          message
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to share achievement: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to share achievement:', error);
      throw error;
    }
  }

  // Mock data methods for development
  private static getMockChallenges(): Challenge[] {
    return [
      {
        id: '1',
        title: '30-Day Savings Sprint',
        description: 'Save €500 in 30 days by cutting unnecessary expenses',
        category: 'savings',
        type: 'competitive',
        difficulty: 'beginner',
        duration: 30,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        targetAmount: 500,
        rules: [
          'Track all expenses daily',
          'Identify and eliminate one unnecessary expense per week',
          'Save at least €16.67 per day on average'
        ],
        rewards: {
          points: 500,
          badges: ['savings_sprint_champion'],
          unlocks: ['advanced_budgeting_course']
        },
        participants: 234,
        maxParticipants: 500,
        createdBy: 'community_team',
        status: 'active',
        featured: true
      },
      {
        id: '2',
        title: 'No-Spend November',
        description: 'Go an entire month spending only on essentials',
        category: 'budgeting',
        type: 'group',
        difficulty: 'intermediate',
        duration: 30,
        startDate: new Date('2024-11-01'),
        endDate: new Date('2024-11-30'),
        rules: [
          'Only spend on rent, utilities, groceries, and transportation',
          'No dining out, entertainment, or shopping',
          'Share daily check-ins with your group'
        ],
        rewards: {
          points: 1000,
          badges: ['no_spend_warrior', 'mindful_spender'],
          unlocks: ['investment_fundamentals']
        },
        participants: 89,
        createdBy: 'expert_sarah',
        status: 'upcoming',
        featured: true
      },
      {
        id: '3',
        title: 'Emergency Fund Builder',
        description: 'Build a 3-month emergency fund step by step',
        category: 'savings',
        type: 'individual',
        difficulty: 'intermediate',
        duration: 90,
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        targetPercentage: 100,
        rules: [
          'Calculate your monthly expenses',
          'Set up automatic transfers to savings',
          'Track progress weekly'
        ],
        rewards: {
          points: 1500,
          badges: ['emergency_prepared', 'financial_security'],
          unlocks: ['investment_portfolio_course']
        },
        participants: 156,
        createdBy: 'expert_michael',
        status: 'active',
        featured: false
      }
    ];
  }

  private static getMockParticipations(): ChallengeParticipation[] {
    return [
      {
        id: '1',
        challengeId: '1',
        userId: '1',
        joinedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        progress: 65,
        currentValue: 325,
        targetValue: 500,
        lastUpdate: new Date(),
        rank: 23,
        completed: false,
        achievements: ['week_one_saver']
      }
    ];
  }

  private static getMockLearningModules(): LearningModule[] {
    return [
      {
        id: '1',
        title: 'Personal Finance Fundamentals',
        description: 'Master the basics of budgeting, saving, and financial planning',
        category: 'basics',
        level: 'beginner',
        duration: 120,
        lessons: [
          {
            id: '1',
            title: 'Understanding Your Money Mindset',
            type: 'video',
            content: 'Explore your relationship with money',
            duration: 15,
            order: 1
          },
          {
            id: '2',
            title: 'Creating Your First Budget',
            type: 'interactive',
            content: 'Step-by-step budget creation guide',
            duration: 30,
            order: 2
          }
        ],
        completionRate: 78,
        rating: 4.7,
        enrollments: 1245,
        createdBy: 'expert_team',
        tags: ['budgeting', 'basics', 'mindset'],
        featured: true
      },
      {
        id: '2',
        title: 'Investment Portfolio Building',
        description: 'Learn to build and manage a diversified investment portfolio',
        category: 'investing',
        level: 'intermediate',
        duration: 180,
        lessons: [
          {
            id: '3',
            title: 'Asset Allocation Strategies',
            type: 'article',
            content: 'How to distribute investments across asset classes',
            duration: 20,
            order: 1
          },
          {
            id: '4',
            title: 'Portfolio Rebalancing',
            type: 'simulation',
            content: 'Interactive portfolio management simulation',
            duration: 45,
            order: 2
          }
        ],
        prerequisites: ['basics_completion'],
        completionRate: 65,
        rating: 4.9,
        enrollments: 567,
        createdBy: 'expert_investment',
        tags: ['investing', 'portfolio', 'stocks'],
        featured: false
      }
    ];
  }

  private static getMockExperts(): Expert[] {
    return [
      {
        id: '1',
        name: 'Sarah Johnson',
        title: 'Certified Financial Planner',
        specialties: ['budgeting', 'debt_management', 'retirement_planning'],
        credentials: ['CFP', 'CPA'],
        rating: 4.9,
        reviewCount: 127,
        hourlyRate: 150,
        availability: {
          timezone: 'UTC+1',
          schedule: {
            'monday': ['09:00', '10:00', '14:00', '15:00'],
            'tuesday': ['09:00', '10:00', '11:00'],
            'wednesday': ['14:00', '15:00', '16:00'],
            'thursday': ['09:00', '10:00'],
            'friday': ['14:00', '15:00']
          }
        },
        bio: 'With over 10 years of experience in financial planning, Sarah specializes in helping young professionals build strong financial foundations.',
        profileImage: '/experts/sarah-johnson.jpg',
        verified: true,
        languages: ['English', 'Spanish'],
        consultationTypes: ['video', 'phone', 'chat']
      },
      {
        id: '2',
        name: 'Michael Chen',
        title: 'Investment Advisor',
        specialties: ['investing', 'portfolio_management', 'tax_optimization'],
        credentials: ['CFA', 'FRM'],
        rating: 4.8,
        reviewCount: 89,
        hourlyRate: 200,
        availability: {
          timezone: 'UTC+1',
          schedule: {
            'monday': ['10:00', '11:00', '15:00'],
            'wednesday': ['09:00', '10:00', '11:00'],
            'friday': ['14:00', '15:00', '16:00']
          }
        },
        bio: 'Investment advisor with expertise in building diversified portfolios and tax-efficient investing strategies.',
        profileImage: '/experts/michael-chen.jpg',
        verified: true,
        languages: ['English', 'Mandarin'],
        consultationTypes: ['video', 'phone']
      }
    ];
  }

  private static getMockAchievements(): Achievement[] {
    return [
      {
        id: '1',
        title: 'First Budget Created',
        description: 'Created your very first budget',
        category: 'budgeting',
        icon: 'target',
        rarity: 'common',
        points: 100,
        unlockedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      },
      {
        id: '2',
        title: 'Savings Streak Champion',
        description: 'Saved money for 30 consecutive days',
        category: 'savings',
        icon: 'trophy',
        rarity: 'rare',
        points: 500,
        unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        id: '3',
        title: 'Investment Pioneer',
        description: 'Made your first investment',
        category: 'investing',
        icon: 'trending-up',
        rarity: 'epic',
        points: 1000,
        progress: {
          current: 1,
          target: 1
        }
      }
    ];
  }

  private static getMockSocialPosts(): SocialPost[] {
    return [
      {
        id: '1',
        userId: '2',
        author: {
          name: 'Alex Rodriguez',
          avatar: '/avatars/alex.jpg',
          verified: false
        },
        type: 'achievement',
        content: 'Just hit my €10,000 emergency fund goal! 🎉 Started with €0 six months ago. The key was automating my savings and treating it like a bill I had to pay.',
        likes: 47,
        comments: 12,
        shares: 8,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        tags: ['emergency-fund', 'milestone', 'automation'],
        privacy: 'public'
      },
      {
        id: '2',
        userId: '3',
        author: {
          name: 'Emma Thompson',
          avatar: '/avatars/emma.jpg',
          verified: true
        },
        type: 'tip',
        content: 'Pro tip: Use the envelope method for discretionary spending. I allocate €200/month for dining out and when it\'s gone, I cook at home. Saved me €300 last month!',
        likes: 23,
        comments: 6,
        shares: 15,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        tags: ['budgeting', 'envelope-method', 'dining'],
        privacy: 'public'
      }
    ];
  }
}