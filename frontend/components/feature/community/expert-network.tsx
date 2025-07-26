'use client';

import { useState, useEffect } from 'react';
import { Expert, Consultation, CommunityService } from '@/lib/services/community-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  Star, 
  Video, 
  Phone, 
  MessageSquare,
  Mail,
  Clock,
  DollarSign,
  Award,
  CheckCircle,
  Calendar as CalendarIcon,
  Users,
  Globe
} from 'lucide-react';

interface ExpertNetworkProps {
  userId: string;
  className?: string;
}

export function ExpertNetwork({ userId, className = '' }: ExpertNetworkProps) {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [bookingStep, setBookingStep] = useState<'expert' | 'time' | 'details' | 'confirm'>('expert');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [consultationType, setConsultationType] = useState<'video' | 'phone' | 'chat' | 'email'>('video');

  useEffect(() => {
    loadExperts();
    loadConsultations();
  }, [selectedSpecialty]);

  const loadExperts = async () => {
    try {
      setLoading(true);
      const data = await CommunityService.getExperts(
        selectedSpecialty || undefined,
        true
      );
      setExperts(data);
    } catch (error) {
      console.error('Failed to load experts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConsultations = async () => {
    try {
      // Mock consultations - in real app, fetch user's consultation history
      const mockConsultations: Consultation[] = [
        {
          id: '1',
          expertId: '1',
          userId: userId,
          type: 'video',
          scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          duration: 60,
          topic: 'Budget optimization and debt reduction strategy',
          status: 'scheduled',
          followUpRequired: false
        },
        {
          id: '2',
          expertId: '2',
          userId: userId,
          type: 'phone',
          scheduledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          duration: 45,
          topic: 'Investment portfolio review',
          status: 'completed',
          rating: 5,
          review: 'Excellent advice on portfolio diversification!',
          followUpRequired: false
        }
      ];
      setConsultations(mockConsultations);
    } catch (error) {
      console.error('Failed to load consultations:', error);
    }
  };

  const handleBookConsultation = async () => {
    if (!selectedExpert || !selectedDate || !selectedTime) return;

    try {
      const consultation = await CommunityService.bookConsultation(userId, selectedExpert.id, {
        type: consultationType,
        scheduledAt: new Date(`${selectedDate.toDateString()} ${selectedTime}`),
        duration: 60,
        topic: 'Financial consultation',
        status: 'scheduled'
      });

      await loadConsultations();
      setSelectedExpert(null);
      setBookingStep('expert');
    } catch (error) {
      console.error('Failed to book consultation:', error);
    }
  };

  const getConsultationTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'chat': return <MessageSquare className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
    }
  };

  const getSpecialtyColor = (specialty: string) => {
    const colors: Record<string, string> = {
      budgeting: 'bg-green-100 text-green-800',
      debt_management: 'bg-red-100 text-red-800',
      investing: 'bg-blue-100 text-blue-800',
      retirement_planning: 'bg-purple-100 text-purple-800',
      tax_optimization: 'bg-yellow-100 text-yellow-800',
      portfolio_management: 'bg-indigo-100 text-indigo-800'
    };
    return colors[specialty] || 'bg-gray-100 text-gray-800';
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const getAvailableTimeSlots = (expert: Expert, date: Date) => {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'lowercase' });
    return expert.availability.schedule[dayName] || [];
  };

  const formatConsultationDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          <h2 className="text-2xl font-bold">Expert Network</h2>
          <p className="text-muted-foreground">Connect with certified financial professionals</p>
        </div>
        
        <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by specialty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Specialties</SelectItem>
            <SelectItem value="budgeting">Budgeting</SelectItem>
            <SelectItem value="debt_management">Debt Management</SelectItem>
            <SelectItem value="investing">Investing</SelectItem>
            <SelectItem value="retirement_planning">Retirement Planning</SelectItem>
            <SelectItem value="tax_optimization">Tax Optimization</SelectItem>
            <SelectItem value="portfolio_management">Portfolio Management</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Upcoming Consultations */}
      {consultations.filter(c => c.status === 'scheduled').length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Upcoming Consultations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {consultations
              .filter(c => c.status === 'scheduled')
              .map((consultation) => {
                const expert = experts.find(e => e.id === consultation.expertId);
                return (
                  <Card key={consultation.id} className="border-blue-200 bg-blue-50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{expert?.name}</CardTitle>
                        <Badge variant="default">Scheduled</Badge>
                      </div>
                      <CardDescription>{consultation.topic}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          <span>{formatConsultationDate(consultation.scheduledAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{consultation.duration} minutes</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getConsultationTypeIcon(consultation.type)}
                        <span className="text-sm capitalize">{consultation.type} call</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          Reschedule
                        </Button>
                        <Button size="sm" className="flex-1">
                          Join Call
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>
      )}

      {/* Available Experts */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Available Experts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {experts.map((expert) => (
            <Card key={expert.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                    <Users className="h-6 w-6 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      {expert.name}
                      {expert.verified && (
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                      )}
                    </CardTitle>
                    <CardDescription className="text-sm">{expert.title}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center gap-1">
                  {getRatingStars(expert.rating)}
                  <span className="text-sm ml-1">{expert.rating}</span>
                  <span className="text-xs text-gray-500">({expert.reviewCount} reviews)</span>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {expert.specialties.slice(0, 2).map((specialty) => (
                    <Badge 
                      key={specialty} 
                      className={getSpecialtyColor(specialty)}
                      variant="secondary"
                    >
                      {specialty.replace('_', ' ')}
                    </Badge>
                  ))}
                  {expert.specialties.length > 2 && (
                    <Badge variant="outline">
                      +{expert.specialties.length - 2} more
                    </Badge>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {expert.credentials.map((credential) => (
                    <Badge key={credential} variant="outline" className="text-xs">
                      {credential}
                    </Badge>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    <span>€{expert.hourlyRate}/hr</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    <span>{expert.languages.join(', ')}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 text-sm">
                  {expert.consultationTypes.map((type) => (
                    <div key={type} className="flex items-center gap-1">
                      {getConsultationTypeIcon(type)}
                    </div>
                  ))}
                  <span className="text-gray-500 ml-2">
                    {expert.consultationTypes.length} methods
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                  >
                    View Profile
                  </Button>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          setSelectedExpert(expert);
                          setBookingStep('time');
                        }}
                      >
                        Book Consultation
                      </Button>
                    </DialogTrigger>
                    
                    {selectedExpert?.id === expert.id && (
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Book Consultation with {expert.name}</DialogTitle>
                          <DialogDescription>
                            Schedule a {consultationType} consultation
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-6">
                          {/* Consultation Type Selection */}
                          <div>
                            <div className="text-sm font-medium mb-2">Consultation Type</div>
                            <div className="grid grid-cols-2 gap-2">
                              {expert.consultationTypes.map((type) => (
                                <Button
                                  key={type}
                                  variant={consultationType === type ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => setConsultationType(type as any)}
                                  className="justify-start"
                                >
                                  {getConsultationTypeIcon(type)}
                                  <span className="ml-2 capitalize">{type}</span>
                                </Button>
                              ))}
                            </div>
                          </div>
                          
                          {/* Date Selection */}
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <div className="text-sm font-medium mb-2">Select Date</div>
                              <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                disabled={(date) => date < new Date()}
                                className="rounded-md border"
                              />
                            </div>
                            
                            {/* Time Selection */}
                            <div>
                              <div className="text-sm font-medium mb-2">Available Times</div>
                              {selectedDate && (
                                <div className="space-y-2">
                                  {getAvailableTimeSlots(expert, selectedDate).length > 0 ? (
                                    getAvailableTimeSlots(expert, selectedDate).map((time) => (
                                      <Button
                                        key={time}
                                        variant={selectedTime === time ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setSelectedTime(time)}
                                        className="w-full justify-start"
                                      >
                                        {time}
                                      </Button>
                                    ))
                                  ) : (
                                    <div className="text-sm text-gray-500">
                                      No available times for this date
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Booking Summary */}
                          {selectedDate && selectedTime && (
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <div className="text-sm font-medium mb-2">Booking Summary</div>
                              <div className="space-y-1 text-sm">
                                <div>Expert: {expert.name}</div>
                                <div>Type: {consultationType} consultation</div>
                                <div>Date: {selectedDate.toDateString()}</div>
                                <div>Time: {selectedTime}</div>
                                <div>Duration: 60 minutes</div>
                                <div>Cost: €{expert.hourlyRate}</div>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              onClick={() => setSelectedExpert(null)}
                            >
                              Cancel
                            </Button>
                            <Button 
                              onClick={handleBookConsultation}
                              disabled={!selectedDate || !selectedTime}
                              className="flex-1"
                            >
                              Confirm Booking
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    )}
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Past Consultations */}
      {consultations.filter(c => c.status === 'completed').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-600" />
              Consultation History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {consultations
                .filter(c => c.status === 'completed')
                .map((consultation) => {
                  const expert = experts.find(e => e.id === consultation.expertId);
                  return (
                    <div key={consultation.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium">{expert?.name}</div>
                        <div className="text-sm text-gray-600">{consultation.topic}</div>
                        <div className="text-xs text-gray-500">
                          {formatConsultationDate(consultation.scheduledAt)}
                        </div>
                      </div>
                      <div className="text-right">
                        {consultation.rating && (
                          <div className="flex items-center gap-1 mb-1">
                            {getRatingStars(consultation.rating)}
                          </div>
                        )}
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}