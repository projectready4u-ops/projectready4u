'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

interface Feedback {
  id: string;
  name: string;
  email: string;
  rating: number;
  description: string;
  approved: boolean;
  created_at: string;
}

export function FeedbackCarousel() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApprovedFeedback();
  }, []);

  const loadApprovedFeedback = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/feedback?approved=true');
      
      if (!response.ok) {
        throw new Error('Failed to load feedback');
      }

      const data = await response.json();
      setFeedbacks(data.feedbacks || []);
    } catch (error) {
      console.error('Error loading feedback:', error);
      toast.error('Failed to load customer feedback');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="col-span-full text-center py-8">
        <p className="text-gray-400">Loading feedback...</p>
      </div>
    );
  }

  if (!feedbacks || feedbacks.length === 0) {
    return (
      <Card className="col-span-full border border-white/10 bg-white/5 p-12 text-center">
        <p className="text-gray-400">No feedback yet. Be the first to share your experience!</p>
      </Card>
    );
  }

  return (
    <>
      {feedbacks.map((feedback) => (
        <Card
          key={feedback.id}
          className="border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-all"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="font-semibold text-white">{feedback.name}</h4>
              <p className="text-xs text-gray-400">{feedback.email}</p>
            </div>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < feedback.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">{feedback.description}</p>
          <p className="text-xs text-gray-500 mt-4">
            {new Date(feedback.created_at).toLocaleDateString()}
          </p>
        </Card>
      ))}
    </>
  );
}
