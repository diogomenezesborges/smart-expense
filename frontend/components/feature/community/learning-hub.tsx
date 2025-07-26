'use client';

import { useState, useEffect } from 'react';
import { LearningModule, Lesson, CommunityService } from '@/lib/services/community-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  BookOpen, 
  Play, 
  Clock, 
  Users, 
  Star,
  CheckCircle,
  PlayCircle,
  FileText,
  Video,
  PenTool,
  Calculator,
  Award,
  TrendingUp
} from 'lucide-react';

interface LearningHubProps {
  userId: string;
  className?: string;
}

export function LearningHub({ userId, className = '' }: LearningHubProps) {
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [enrolledModules, setEnrolledModules] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadLearningModules();
  }, [selectedCategory, selectedLevel]);

  const loadLearningModules = async () => {
    try {
      setLoading(true);
      const data = await CommunityService.getLearningModules(
        selectedCategory || undefined,
        selectedLevel || undefined
      );
      setModules(data);
      
      // Mock enrolled modules - in real app, fetch from user profile
      setEnrolledModules(new Set(['1']));
    } catch (error) {
      console.error('Failed to load learning modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: LearningModule['category']) => {
    switch (category) {
      case 'basics': return 'bg-blue-100 text-blue-800';
      case 'budgeting': return 'bg-green-100 text-green-800';
      case 'investing': return 'bg-purple-100 text-purple-800';
      case 'retirement': return 'bg-orange-100 text-orange-800';
      case 'taxes': return 'bg-red-100 text-red-800';
      case 'advanced': return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (level: LearningModule['level']) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
    }
  };

  const getLessonIcon = (type: Lesson['type']) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'article': return <FileText className="h-4 w-4" />;
      case 'interactive': return <PenTool className="h-4 w-4" />;
      case 'quiz': return <CheckCircle className="h-4 w-4" />;
      case 'simulation': return <Calculator className="h-4 w-4" />;
    }
  };

  const handleEnrollModule = (moduleId: string) => {
    setEnrolledModules(prev => new Set([...prev, moduleId]));
    // In real app, make API call to enroll user
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-3 w-3 ${i < Math.floor(rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const getModuleProgress = (moduleId: string) => {
    // Mock progress data - in real app, fetch from user profile
    const progressMap: Record<string, number> = {
      '1': 45,
      '2': 0
    };
    return progressMap[moduleId] || 0;
  };

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
          <h2 className="text-2xl font-bold">Learning Hub</h2>
          <p className="text-muted-foreground">Master financial skills with expert-created content</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              <SelectItem value="basics">Basics</SelectItem>
              <SelectItem value="budgeting">Budgeting</SelectItem>
              <SelectItem value="investing">Investing</SelectItem>
              <SelectItem value="retirement">Retirement</SelectItem>
              <SelectItem value="taxes">Taxes</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Featured Modules */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Featured Courses</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {modules.filter(m => m.featured).map((module) => {
            const isEnrolled = enrolledModules.has(module.id);
            const progress = getModuleProgress(module.id);
            
            return (
              <Card key={module.id} className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-yellow-600" />
                        <CardTitle className="text-lg">{module.title}</CardTitle>
                        <Star className="h-4 w-4 text-yellow-600 fill-current" />
                      </div>
                      <CardDescription>{module.description}</CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getCategoryColor(module.category)}>
                      {module.category}
                    </Badge>
                    <Badge className={getLevelColor(module.level)}>
                      {module.level}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{module.duration} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{module.enrollments}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {getRatingStars(module.rating)}
                      <span className="ml-1">{module.rating}</span>
                    </div>
                  </div>
                  
                  {isEnrolled && progress > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Course Content</div>
                    <div className="space-y-1">
                      {module.lessons.slice(0, 2).map((lesson, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          {getLessonIcon(lesson.type)}
                          <span>{lesson.title}</span>
                          <span className="text-gray-500">({lesson.duration} min)</span>
                          {lesson.completed && (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          )}
                        </div>
                      ))}
                      {module.lessons.length > 2 && (
                        <div className="text-sm text-gray-500">
                          +{module.lessons.length - 2} more lessons
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {!isEnrolled ? (
                      <Button 
                        className="flex-1"
                        onClick={() => handleEnrollModule(module.id)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Enroll Now
                      </Button>
                    ) : (
                      <Button className="flex-1">
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Continue Learning
                      </Button>
                    )}
                    <Button variant="outline">
                      Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* All Modules */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">All Courses</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.filter(m => !m.featured).map((module) => {
            const isEnrolled = enrolledModules.has(module.id);
            const progress = getModuleProgress(module.id);
            
            return (
              <Card key={module.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base">{module.title}</CardTitle>
                      <CardDescription className="text-sm line-clamp-2">
                        {module.description}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getCategoryColor(module.category)} variant="secondary">
                      {module.category}
                    </Badge>
                    <Badge className={getLevelColor(module.level)} variant="outline">
                      {module.level}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{module.duration} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{module.enrollments}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs">
                    {getRatingStars(module.rating)}
                    <span className="ml-1">{module.rating}</span>
                    <span className="text-gray-500">({module.enrollments} reviews)</span>
                  </div>
                  
                  {isEnrolled && progress > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-1" />
                    </div>
                  )}
                  
                  <div className="text-xs">
                    <span className="font-medium">{module.lessons.length} lessons</span>
                    {module.prerequisites && (
                      <span className="text-gray-500 ml-2">
                        • Prerequisites required
                      </span>
                    )}
                  </div>
                  
                  {!isEnrolled ? (
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleEnrollModule(module.id)}
                    >
                      Enroll
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" className="w-full">
                      Continue
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Learning Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Your Learning Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">3</div>
              <div className="text-sm text-gray-600">Courses Enrolled</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">1</div>
              <div className="text-sm text-gray-600">Courses Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">245</div>
              <div className="text-sm text-gray-600">Minutes Learned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">450</div>
              <div className="text-sm text-gray-600">XP Earned</div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">Next Milestone</span>
            </div>
            <div className="text-sm text-blue-700">
              Complete 2 more courses to unlock the "Knowledge Seeker" badge and earn 500 bonus XP!
            </div>
            <Progress value={33} className="mt-2 h-2" />
            <div className="text-xs text-blue-600 mt-1">1 of 3 courses completed</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}