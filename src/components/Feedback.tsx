import { useState } from 'react';
import { Star } from 'lucide-react';
import type { Doctor } from '../App';

interface FeedbackProps {
  doctor: Doctor;
  onSubmit: () => void;
}

export function Feedback({ doctor, onSubmit }: FeedbackProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [comment, setComment] = useState('');

  const reasons = [
    'Professional',
    'Good Listener',
    'Quick Response',
    'Great Consultation',
    'Helpful Advice',
    'Knowledgeable'
  ];

  const toggleReason = (reason: string) => {
    setSelectedReasons(prev =>
      prev.includes(reason)
        ? prev.filter(r => r !== reason)
        : [...prev, reason]
    );
  };

  const handleSubmit = () => {
    // Here you would typically send the feedback to your backend
    onSubmit();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <h1 className="text-lg text-gray-900 text-center">Rating</h1>
      </div>

      <div className="px-6 py-8">
        {/* Doctor Info */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-200 to-blue-200 rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl">👨‍⚕️</span>
          </div>
          <h2 className="text-xl text-gray-900 mb-1">{doctor.name}</h2>
          <p className="text-sm text-gray-600">{doctor.specialty}</p>
        </div>

        {/* Rating Stars */}
        <div className="mb-8">
          <h3 className="text-sm text-gray-700 text-center mb-4">
            How was your experience?
          </h3>
          <div className="flex items-center justify-center gap-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-10 h-10 ${
                    star <= (hoveredRating || rating)
                      ? 'text-yellow-500 fill-yellow-500'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Reason Selection */}
        <div className="mb-8">
          <h3 className="text-sm text-gray-700 mb-4">
            What did you like the doctor help you?
          </h3>
          <div className="flex flex-wrap gap-2">
            {reasons.map((reason) => (
              <button
                key={reason}
                onClick={() => toggleReason(reason)}
                className={`px-4 py-2 rounded-full text-sm border transition-all ${
                  selectedReasons.includes(reason)
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300'
                }`}
              >
                {reason}
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div className="mb-8">
          <h3 className="text-sm text-gray-700 mb-3">
            Leave a comment (optional)
          </h3>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience..."
            className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            rows={4}
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={rating === 0}
          className="w-full bg-purple-600 text-white px-6 py-4 rounded-full hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Submit Review
        </button>
      </div>
    </div>
  );
}
