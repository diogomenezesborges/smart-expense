"use client"

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  MessageCircle, 
  Heart, 
  Share2, 
  Users, 
  Trophy, 
  Star, 
  BookOpen, 
  UserCheck,
  TrendingUp,
  Calendar,
  Search,
  Filter,
  Plus
} from 'lucide-react'

interface CommunityPost {
  id: string
  author: {
    name: string
    avatar?: string
    isExpert: boolean
    reputation: number
  }
  content: string
  type: 'story' | 'tip' | 'question' | 'achievement' | 'challenge'
  timestamp: string
  likes: number
  comments: number
  tags: string[]
  isLiked: boolean
}

interface Challenge {
  id: string
  title: string
  description: string
  participants: number
  daysLeft: number
  progress: number
  type: 'saving' | 'spending' | 'learning' | 'habit'
}

interface Expert {
  id: string
  name: string
  avatar?: string
  title: string
  specialties: string[]
  rating: number
  responses: number
  nextAvailable: string
}

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState('feed')
  const [searchQuery, setSearchQuery] = useState('')

  // Mock data for community posts
  const communityPosts: CommunityPost[] = [
    {
      id: '1',
      author: {
        name: 'Sarah M.',
        avatar: '/api/placeholder/40/40',
        isExpert: false,
        reputation: 245
      },
      content: "Just hit my €10,000 emergency fund goal! 🎉 It took 18 months but I finally did it. For anyone struggling, my key was automating €300/month transfers and treating it like a non-negotiable bill. The peace of mind is incredible!",
      type: 'achievement',
      timestamp: '2 hours ago',
      likes: 87,
      comments: 23,
      tags: ['emergency-fund', 'savings', 'automation'],
      isLiked: false
    },
    {
      id: '2',
      author: {
        name: 'Maria Rodriguez, CFP',
        avatar: '/api/placeholder/40/40',
        isExpert: true,
        reputation: 1250
      },
      content: "Quick tip for the week: When reviewing your monthly budget, don&apos;t just look at what you spent - analyze your spending velocity. If you spent 70% of your dining budget in the first 2 weeks, you&apos;re on track to overspend by 40%. Adjust early, adjust often! 📊",
      type: 'tip',
      timestamp: '4 hours ago',
      likes: 156,
      comments: 31,
      tags: ['budgeting', 'expert-tip', 'monthly-review'],
      isLiked: true
    },
    {
      id: '3',
      author: {
        name: 'Alex K.',
        avatar: '/api/placeholder/40/40',
        isExpert: false,
        reputation: 89
      },
      content: "Need advice: I&apos;m 28 and finally debt-free! 🙌 Should I focus on building a larger emergency fund (currently have 3 months) or start investing? My income is €3,500/month and I can save about €800/month now.",
      type: 'question',
      timestamp: '6 hours ago',
      likes: 34,
      comments: 18,
      tags: ['investing', 'emergency-fund', 'debt-free'],
      isLiked: false
    },
    {
      id: '4',
      author: {
        name: 'Community Team',
        avatar: '/api/placeholder/40/40',
        isExpert: false,
        reputation: 0
      },
      content: "🏆 No-Spend November Challenge Update: 2,847 participants have collectively saved €847,230 this month! Top tips from participants: meal planning, finding free entertainment, and using the 24-hour rule for purchases. Keep it up! 💪",
      type: 'challenge',
      timestamp: '8 hours ago',
      likes: 203,
      comments: 67,
      tags: ['no-spend-november', 'challenge', 'community'],
      isLiked: true
    }
  ]

  // Mock data for active challenges
  const activeChallenges: Challenge[] = [
    {
      id: '1',
      title: 'No-Spend November',
      description: 'Avoid all non-essential purchases for the entire month',
      participants: 2847,
      daysLeft: 8,
      progress: 73,
      type: 'spending'
    },
    {
      id: '2',
      title: 'Save €1,000 in 3 Months',
      description: 'Build your emergency fund with this focused savings challenge',
      participants: 1523,
      daysLeft: 45,
      progress: 34,
      type: 'saving'
    },
    {
      id: '3',
      title: 'Learn Investing Basics',
      description: 'Complete 10 investing lessons and practice with virtual portfolio',
      participants: 892,
      daysLeft: 21,
      progress: 67,
      type: 'learning'
    },
    {
      id: '4',
      title: 'Daily Budget Check-In',
      description: 'Review and log your spending every day for 30 days',
      participants: 2156,
      daysLeft: 12,
      progress: 82,
      type: 'habit'
    }
  ]

  // Mock data for financial experts
  const experts: Expert[] = [
    {
      id: '1',
      name: 'Maria Rodriguez',
      avatar: '/api/placeholder/60/60',
      title: 'Certified Financial Planner',
      specialties: ['Retirement Planning', 'Investment Strategy', 'Tax Optimization'],
      rating: 4.9,
      responses: 847,
      nextAvailable: 'Today 2:00 PM'
    },
    {
      id: '2',
      name: 'David Chen',
      avatar: '/api/placeholder/60/60',
      title: 'Investment Advisor',
      specialties: ['Portfolio Management', 'Real Estate', 'Cryptocurrency'],
      rating: 4.8,
      responses: 623,
      nextAvailable: 'Tomorrow 10:00 AM'
    },
    {
      id: '3',
      name: 'Sophie Laurent',
      avatar: '/api/placeholder/60/60',
      title: 'Debt Counselor',
      specialties: ['Debt Management', 'Credit Repair', 'Budgeting'],
      rating: 4.9,
      responses: 1205,
      nextAvailable: 'Today 4:30 PM'
    }
  ]

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'story': return <BookOpen className="h-4 w-4" />
      case 'tip': return <Star className="h-4 w-4" />
      case 'question': return <MessageCircle className="h-4 w-4" />
      case 'achievement': return <Trophy className="h-4 w-4" />
      case 'challenge': return <Users className="h-4 w-4" />
      default: return <MessageCircle className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'story': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'tip': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'question': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      case 'achievement': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'challenge': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getChallengeTypeColor = (type: string) => {
    switch (type) {
      case 'saving': return 'bg-green-500'
      case 'spending': return 'bg-red-500'
      case 'learning': return 'bg-blue-500'
      case 'habit': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Finance Community</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Learn, share, and grow with fellow financial enthusiasts
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search community..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="feed">Community Feed</TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
            <TabsTrigger value="experts">Experts</TabsTrigger>
            <TabsTrigger value="learning">Learning Paths</TabsTrigger>
            <TabsTrigger value="groups">Study Groups</TabsTrigger>
          </TabsList>

          {/* Community Feed */}
          <TabsContent value="feed">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Main Feed */}
              <div className="lg:col-span-3 space-y-6">
                {communityPosts.map((post) => (
                  <Card key={post.id} className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar>
                        <AvatarImage src={post.author.avatar} />
                        <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {post.author.name}
                          </span>
                          {post.author.isExpert && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                              <UserCheck className="h-3 w-3 mr-1" />
                              Expert
                            </Badge>
                          )}
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-500">{post.timestamp}</span>
                          <span className="text-sm text-gray-500">•</span>
                          <Badge variant="outline" className={getTypeColor(post.type)}>
                            {getTypeIcon(post.type)}
                            <span className="ml-1 capitalize">{post.type}</span>
                          </Badge>
                        </div>
                        
                        <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                          {post.content}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center space-x-6">
                          <button className={`flex items-center space-x-2 text-sm ${post.isLiked ? 'text-red-600' : 'text-gray-500'} hover:text-red-600 transition-colors`}>
                            <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                            <span>{post.likes}</span>
                          </button>
                          
                          <button className="flex items-center space-x-2 text-sm text-gray-500 hover:text-blue-600 transition-colors">
                            <MessageCircle className="h-4 w-4" />
                            <span>{post.comments}</span>
                          </button>
                          
                          <button className="flex items-center space-x-2 text-sm text-gray-500 hover:text-green-600 transition-colors">
                            <Share2 className="h-4 w-4" />
                            <span>Share</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Community Stats */}
                <Card className="p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Community Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Active Members</span>
                      <span className="font-semibold">12,847</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Posts This Week</span>
                      <span className="font-semibold">1,234</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Expert Responses</span>
                      <span className="font-semibold">89</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Money Saved</span>
                      <span className="font-semibold text-green-600">€2.1M</span>
                    </div>
                  </div>
                </Card>

                {/* Trending Topics */}
                <Card className="p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Trending Topics</h3>
                  <div className="space-y-2">
                    {['#emergency-fund', '#debt-payoff', '#investing-basics', '#budgeting-tips', '#side-hustle'].map((topic) => (
                      <div key={topic} className="flex items-center justify-between">
                        <span className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">{topic}</span>
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Quick Actions */}
                <Card className="p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      Join a Challenge
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Ask an Expert
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Start Learning Path
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Challenges */}
          <TabsContent value="challenges">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeChallenges.map((challenge) => (
                <Card key={challenge.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-3 h-3 rounded-full ${getChallengeTypeColor(challenge.type)}`}></div>
                    <Badge variant="outline">{challenge.daysLeft} days left</Badge>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{challenge.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{challenge.description}</p>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{challenge.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getChallengeTypeColor(challenge.type)}`}
                        style={{ width: `${challenge.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Users className="h-4 w-4 mr-1" />
                      {challenge.participants.toLocaleString()} participants
                    </div>
                    <Button size="sm">Join Challenge</Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Experts */}
          <TabsContent value="experts">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {experts.map((expert) => (
                <Card key={expert.id} className="p-6">
                  <div className="text-center mb-4">
                    <Avatar className="w-16 h-16 mx-auto mb-3">
                      <AvatarImage src={expert.avatar} />
                      <AvatarFallback>{expert.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{expert.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{expert.title}</p>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < Math.floor(expert.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                      {expert.rating} ({expert.responses} responses)
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {expert.specialties.map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Next available: {expert.nextAvailable}
                    </p>
                    <Button className="w-full">
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Session
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Learning Paths */}
          <TabsContent value="learning">
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Learning Paths Coming Soon</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Structured financial education paths will be available in the next update.
              </p>
              <Button>Get Notified</Button>
            </div>
          </TabsContent>

          {/* Study Groups */}
          <TabsContent value="groups">
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Study Groups Coming Soon</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Join study groups to learn with other community members.
              </p>
              <Button>Get Notified</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}