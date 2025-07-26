'use client';

import { useState, useEffect } from 'react';
import { SocialPost, Achievement, CommunityService } from '@/lib/services/community-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  Heart, 
  MessageCircle, 
  Share, 
  Trophy,
  Target,
  TrendingUp,
  HelpCircle,
  BookOpen,
  CheckCircle,
  MoreHorizontal,
  Send,
  Image as ImageIcon
} from 'lucide-react';

interface SocialFeedProps {
  userId: string;
  className?: string;
}

export function SocialFeed({ userId, className = '' }: SocialFeedProps) {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');
  const [newPost, setNewPost] = useState('');
  const [postType, setPostType] = useState<'tip' | 'question' | 'story'>('tip');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadSocialFeed();
  }, [filter]);

  const loadSocialFeed = async () => {
    try {
      setLoading(true);
      const data = await CommunityService.getSocialFeed(userId, filter || undefined);
      setPosts(data);
    } catch (error) {
      console.error('Failed to load social feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLikePost = (postId: string) => {
    setLikedPosts(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(postId)) {
        newLiked.delete(postId);
      } else {
        newLiked.add(postId);
      }
      return newLiked;
    });

    // Update post likes count
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: likedPosts.has(postId) ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  const handleShareAchievement = async () => {
    if (!newPost.trim()) return;

    try {
      // Mock achievement sharing - in real app, select from user achievements
      const mockAchievement: Achievement = {
        id: '1',
        title: 'Savings Milestone',
        description: 'Reached €5,000 in emergency fund',
        category: 'savings',
        icon: 'target',
        rarity: 'rare',
        points: 500
      };

      await CommunityService.shareAchievement(userId, mockAchievement, newPost);
      setNewPost('');
      await loadSocialFeed();
    } catch (error) {
      console.error('Failed to share post:', error);
    }
  };

  const getPostTypeIcon = (type: SocialPost['type']) => {
    switch (type) {
      case 'achievement': return <Trophy className="h-4 w-4 text-yellow-600" />;
      case 'milestone': return <Target className="h-4 w-4 text-green-600" />;
      case 'tip': return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case 'question': return <HelpCircle className="h-4 w-4 text-purple-600" />;
      case 'story': return <BookOpen className="h-4 w-4 text-orange-600" />;
    }
  };

  const getPostTypeColor = (type: SocialPost['type']) => {
    switch (type) {
      case 'achievement': return 'border-yellow-200 bg-yellow-50';
      case 'milestone': return 'border-green-200 bg-green-50';
      case 'tip': return 'border-blue-200 bg-blue-50';
      case 'question': return 'border-purple-200 bg-purple-50';
      case 'story': return 'border-orange-200 bg-orange-50';
      default: return '';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) {
      return `${days}d ago`;
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else {
      return 'Just now';
    }
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
          <h2 className="text-2xl font-bold">Community Feed</h2>
          <p className="text-muted-foreground">Share your journey and learn from others</p>
        </div>
        
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter posts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Posts</SelectItem>
            <SelectItem value="achievement">Achievements</SelectItem>
            <SelectItem value="tip">Tips</SelectItem>
            <SelectItem value="question">Questions</SelectItem>
            <SelectItem value="story">Stories</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Create Post */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Share with the Community</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Select value={postType} onValueChange={(value: any) => setPostType(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tip">Share Tip</SelectItem>
                <SelectItem value="question">Ask Question</SelectItem>
                <SelectItem value="story">Tell Story</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder={
              postType === 'tip' ? 'Share a helpful financial tip...' :
              postType === 'question' ? 'Ask the community a question...' :
              'Share your financial journey...'
            }
            className="min-h-[100px]"
          />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <ImageIcon className="h-3 w-3 mr-1" />
                Add Image
              </Button>
              <Button variant="outline" size="sm">
                <Trophy className="h-3 w-3 mr-1" />
                Share Achievement
              </Button>
            </div>
            
            <Button onClick={handleShareAchievement} disabled={!newPost.trim()}>
              <Send className="h-3 w-3 mr-1" />
              Post
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Social Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className={getPostTypeColor(post.type)}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={post.author.avatar} />
                    <AvatarFallback>
                      {post.author.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{post.author.name}</span>
                      {post.author.verified && (
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                      )}
                      <Badge variant="outline" className="text-xs">
                        {post.type}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatTimeAgo(post.createdAt)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {getPostTypeIcon(post.type)}
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="text-sm leading-relaxed">{post.content}</div>
              
              {post.attachments && post.attachments.length > 0 && (
                <div className="space-y-2">
                  {post.attachments.map((attachment, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        <span className="text-sm font-medium">{attachment.caption}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
              
              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLikePost(post.id)}
                    className={`h-8 ${likedPosts.has(post.id) ? 'text-red-600' : ''}`}
                  >
                    <Heart className={`h-4 w-4 mr-1 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                    {post.likes}
                  </Button>
                  
                  <Button variant="ghost" size="sm" className="h-8">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    {post.comments}
                  </Button>
                  
                  <Button variant="ghost" size="sm" className="h-8">
                    <Share className="h-4 w-4 mr-1" />
                    {post.shares}
                  </Button>
                </div>
                
                <Badge variant="outline" className="text-xs">
                  {post.privacy}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Community Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Community Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">1,247</div>
              <div className="text-sm text-gray-600">Active Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">856</div>
              <div className="text-sm text-gray-600">Posts This Week</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">3,421</div>
              <div className="text-sm text-gray-600">Tips Shared</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">92%</div>
              <div className="text-sm text-gray-600">Questions Answered</div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">Community Challenge</span>
            </div>
            <div className="text-sm text-blue-700">
              Help us reach 1,000 shared financial tips this month! We're at 856 - only 144 to go! 
              Share your best money-saving tip to contribute.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}