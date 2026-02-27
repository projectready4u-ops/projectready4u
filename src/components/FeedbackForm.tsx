'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Star } from 'lucide-react';
import { isValidEmail } from '@/lib/utils';

export function FeedbackForm() {
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidEmail(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Please share your feedback');
      return;
    }

    if (rating < 1 || rating > 5) {
      toast.error('Please select a rating');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          rating,
          description: formData.description,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit feedback');
      }

      toast.success('✅ Thank you! Your feedback will be displayed after admin approval.');
      setFormData({ email: '', name: '', description: '' });
      setRating(5);
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      toast.error(error.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <Label className="text-white font-semibold">Your Name *</Label>
          <Input
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={loading}
            className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            required
          />
        </div>

        {/* Email */}
        <div>
          <Label className="text-white font-semibold">Email Address *</Label>
          <Input
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            disabled={loading}
            className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            required
          />
        </div>
      </div>

      {/* Rating */}
      <div>
        <Label className="text-white font-semibold mb-3 block">Rating *</Label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`transition-all ${
                star <= rating ? 'text-yellow-400' : 'text-gray-500'
              }`}
              disabled={loading}
            >
              <Star className="w-8 h-8 fill-current" />
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-400 mt-2">{rating}/5 stars</p>
      </div>

      {/* Description */}
      <div>
        <Label className="text-white font-semibold">Your Feedback *</Label>
        <Textarea
          placeholder="Share your experience with our projects... (e.g., how it helped you, what was great about it)"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          disabled={loading}
          rows={5}
          className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
          required
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold h-11"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Feedback'
        )}
      </Button>
    </form>
  );
}
