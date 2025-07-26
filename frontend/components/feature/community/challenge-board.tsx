'use client';

import { useState, useEffect } from 'react';
import { Challenge, ChallengeParticipation, CommunityService } from '@/lib/services/community-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  Trophy, 
  Users, 
  Calendar, 
  Target,
  Star,
  Clock,
  TrendingUp,
  Award,
  Zap,
  CheckCircle,
  Play
} from 'lucide-react';

interface ChallengeBoardProps {
  userId: string;
  className?: string;
}

export function ChallengeBoard({ userId, className = '' }: ChallengeBoardProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<ChallengeParticipation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<{
    category?: string;
    difficulty?: string;
    type?: string;
    status?: string;
  }>({});
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [joining, setJoining] = useState<string | null>(null);

  useEffect(() => {
    loadChallenges();
    loadUserChallenges();
  }, [userId, filter]);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      const data = await CommunityService.getChallenges(filter);
      setChallenges(data);
    } catch (error) {
      console.error('Failed to load challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserChallenges = async () => {
    try {
      const data = await CommunityService.getUserChallenges(userId);
      setUserChallenges(data);
    } catch (error) {
      console.error('Failed to load user challenges:', error);
    }
  };

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      setJoining(challengeId);
      await CommunityService.joinChallenge(userId, challengeId);
      await loadUserChallenges();
      setSelectedChallenge(null);
    } catch (error) {
      console.error('Failed to join challenge:', error);
    } finally {
      setJoining(null);
    }
  };

  const getDifficultyColor = (difficulty: Challenge['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
    }
  };

  const getCategoryIcon = (category: Challenge['category']) => {
    switch (category) {
      case 'savings': return <Target className="h-4 w-4" />;
      case 'budgeting': return <TrendingUp className="h-4 w-4" />;
      case 'investment': return <Star className="h-4 w-4" />;
      case 'debt': return <Trophy className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: Challenge['status']) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'upcoming': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTimeRemaining = (endDate: Date) => {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) {
      return `${days} days left`;
    } else {
      return 'Ended';
    }
  };

  const isUserParticipating = (challengeId: string) => {
    return userChallenges.some(uc => uc.challengeId === challengeId);
  };

  const getUserParticipation = (challengeId: string) => {
    return userChallenges.find(uc => uc.challengeId === challengeId);
  };

  const filteredChallenges = challenges.filter(challenge => {
    if (filter.status && challenge.status !== filter.status) return false;
    if (filter.category && challenge.category !== filter.category) return false;
    if (filter.difficulty && challenge.difficulty !== filter.difficulty) return false;
    if (filter.type && challenge.type !== filter.type) return false;
    return true;
  });

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header and Filters */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Community Challenges</h2>
          <p className="text-muted-foreground">Join challenges and compete with the community</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select 
            value={filter.category || ''} 
            onValueChange={(value) => setFilter(prev => ({ ...prev, category: value || undefined }))}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              <SelectItem value="savings">Savings</SelectItem>
              <SelectItem value="budgeting">Budgeting</SelectItem>
              <SelectItem value="investment">Investment</SelectItem>
              <SelectItem value="debt">Debt</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            value={filter.difficulty || ''} 
            onValueChange={(value) => setFilter(prev => ({ ...prev, difficulty: value || undefined }))}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            value={filter.status || ''} 
            onValueChange={(value) => setFilter(prev => ({ ...prev, status: value || undefined }))}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active User Challenges */}
      {userChallenges.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Your Active Challenges</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userChallenges.map((participation) => {
              const challenge = challenges.find(c => c.id === participation.challengeId);
              if (!challenge) return null;
              
              return (
                <Card key={participation.id} className="border-blue-200 bg-blue-50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{challenge.title}</CardTitle>
                      <Badge className={getStatusColor(challenge.status)}>
                        {challenge.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{participation.progress}%</span>
                      </div>
                      <Progress value={participation.progress} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>€{participation.currentValue.toLocaleString()}</span>
                        <span>€{participation.targetValue.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    {participation.rank && (
                      <div className="flex items-center gap-2 text-sm">
                        <Trophy className="h-4 w-4 text-yellow-600" />
                        <span>Rank #{participation.rank} of {challenge.participants}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimeRemaining(challenge.endDate)}</span>
                      </div>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Challenges */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Available Challenges</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredChallenges.map((challenge) => {
            const isParticipating = isUserParticipating(challenge.id);
            
            return (
              <Card key={challenge.id} className={challenge.featured ? 'border-yellow-200 bg-yellow-50' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(challenge.category)}
                      <CardTitle className="text-base">{challenge.title}</CardTitle>
                    </div>
                    {challenge.featured && (
                      <Star className="h-4 w-4 text-yellow-600 fill-current" />
                    )}
                  </div>
                  <CardDescription className="text-sm">
                    {challenge.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className={getDifficultyColor(challenge.difficulty)}>
                      {challenge.difficulty}
                    </Badge>
                    <Badge variant="outline">
                      {challenge.type}
                    </Badge>
                    <Badge className={getStatusColor(challenge.status)}>
                      {challenge.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{challenge.participants} joined</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{challenge.duration} days</span>
                    </div>
                  </div>
                  
                  {challenge.targetAmount && (
                    <div className="text-sm">
                      <span className="font-medium">Target:</span> €{challenge.targetAmount.toLocaleString()}
                    </div>
                  )}
                  
                  <div className="text-sm">
                    <div className="flex items-center gap-1">
                      <Award className="h-3 w-3 text-purple-600" />
                      <span>{challenge.rewards.points} points</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => setSelectedChallenge(challenge)}
                        >
                          Learn More
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                    
                    {!isParticipating ? (
                      <Button 
                        size="sm" 
                        className="flex-1"
                        disabled={joining === challenge.id || challenge.status !== 'active'}
                        onClick={() => handleJoinChallenge(challenge.id)}
                      >
                        {joining === challenge.id ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <>
                            <Play className="h-3 w-3 mr-1" />
                            Join
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button size="sm" variant="secondary" className="flex-1" disabled>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Joined
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Challenge Details Dialog */}
      {selectedChallenge && (
        <Dialog open={!!selectedChallenge} onOpenChange={() => setSelectedChallenge(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getCategoryIcon(selectedChallenge.category)}
                {selectedChallenge.title}
                {selectedChallenge.featured && (
                  <Star className="h-4 w-4 text-yellow-600 fill-current" />
                )}
              </DialogTitle>
              <DialogDescription>{selectedChallenge.description}</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium">Duration</div>
                  <div className="text-sm text-gray-600">{selectedChallenge.duration} days</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Participants</div>
                  <div className="text-sm text-gray-600">
                    {selectedChallenge.participants}
                    {selectedChallenge.maxParticipants && ` / ${selectedChallenge.maxParticipants}`}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">Difficulty</div>
                  <Badge className={getDifficultyColor(selectedChallenge.difficulty)}>
                    {selectedChallenge.difficulty}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm font-medium">Type</div>
                  <Badge variant="outline">{selectedChallenge.type}</Badge>
                </div>
              </div>
              
              {selectedChallenge.targetAmount && (
                <div>
                  <div className="text-sm font-medium">Target Amount</div>
                  <div className="text-lg font-semibold text-green-600">
                    €{selectedChallenge.targetAmount.toLocaleString()}
                  </div>
                </div>
              )}
              
              <div>
                <div className="text-sm font-medium mb-2">Challenge Rules</div>
                <ul className="space-y-1">
                  {selectedChallenge.rules.map((rule, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <div className="text-sm font-medium mb-2">Rewards</div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Award className="h-4 w-4 text-purple-600" />
                    <span>{selectedChallenge.rewards.points} points</span>
                  </div>
                  {selectedChallenge.rewards.badges.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Trophy className="h-4 w-4 text-yellow-600" />
                      <span>{selectedChallenge.rewards.badges.length} badge(s)</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setSelectedChallenge(null)}>
                  Close
                </Button>
                {!isUserParticipating(selectedChallenge.id) && selectedChallenge.status === 'active' && (
                  <Button 
                    onClick={() => handleJoinChallenge(selectedChallenge.id)}
                    disabled={joining === selectedChallenge.id}
                    className="flex-1"
                  >
                    {joining === selectedChallenge.id ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Join Challenge
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}