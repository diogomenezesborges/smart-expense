'use client';

import { useState } from 'react';
import { FeatureGate } from '@/components/feature/permissions/feature-gate';
import { ChallengeBoard } from '@/components/feature/community/challenge-board';
import { LearningHub } from '@/components/feature/community/learning-hub';
import { ExpertNetwork } from '@/components/feature/community/expert-network';
import { SocialFeed } from '@/components/feature/community/social-feed';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Trophy, 
  BookOpen, 
  MessageSquare,
  Star,
  Award,
  Calendar,
  Zap
} from 'lucide-react';

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState('feed');

  // Mock user ID - in real app, get from auth context
  const userId = '1';

  return (
    <FeatureGate feature="community">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              Community Hub
            </h1>
            <p className="text-muted-foreground">
              Connect, learn, and grow with fellow financial enthusiasts
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="px-3 py-1">
              Pro Member
            </Badge>
            <Button variant="outline">
              <Star className="h-4 w-4 mr-2" />
              Invite Friends
            </Button>
          </div>
        </div>

        {/* Community Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-600" />
                <div className="text-sm font-medium">Challenges</div>
              </div>
              <div className="text-2xl font-bold text-yellow-600">3</div>
              <div className="text-xs text-muted-foreground">
                Active participations
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-green-600" />
                <div className="text-sm font-medium">Learning</div>
              </div>
              <div className="text-2xl font-bold text-green-600">12</div>
              <div className="text-xs text-muted-foreground">
                Courses completed
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                <div className="text-sm font-medium">Expert Sessions</div>
              </div>
              <div className="text-2xl font-bold text-purple-600">4</div>
              <div className="text-xs text-muted-foreground">
                Consultations booked
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-orange-600" />
                <div className="text-sm font-medium">Community XP</div>
              </div>
              <div className="text-2xl font-bold text-orange-600">2,450</div>
              <div className="text-xs text-muted-foreground">
                Total points earned
              </div>
            </CardContent>
          </Card>
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
            <SocialFeed userId={userId} />
          </TabsContent>

          {/* Challenges */}
          <TabsContent value="challenges">
            <ChallengeBoard userId={userId} />
          </TabsContent>

          {/* Experts */}
          <TabsContent value="experts">
            <ExpertNetwork userId={userId} />
          </TabsContent>

          {/* Learning Paths */}
          <TabsContent value="learning">
            <LearningHub userId={userId} />
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
    </FeatureGate>
  )
}