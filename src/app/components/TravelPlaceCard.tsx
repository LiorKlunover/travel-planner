'use client';

import React, { useState } from 'react';
import { Place } from '@/types/travel';
import { Calendar, Clock, MapPin, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';

interface TravelPlaceCardProps {
  place: Place;
  index: number;
}

export default function TravelPlaceCard({ place, index }: TravelPlaceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDayRange = () => {
    const startDate = new Date(place.start_date);
    const endDate = new Date(place.end_date);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays === 1 ? '1 day' : `${diffDays} days`;
  };

  const getCardColor = (index: number) => {
    const colors = [
      'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200',
      'bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-200',
      'bg-gradient-to-br from-amber-50 to-orange-100 border-amber-200',
      'bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200',
      'bg-gradient-to-br from-rose-50 to-pink-100 border-rose-200',
    ];
    return colors[index % colors.length];
  };

  return (
    <div className={`rounded-xl border-2 shadow-lg hover:shadow-xl transition-all duration-300 ${getCardColor(index)}`}>
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-2 leading-tight">
              {place.name}
            </h3>
            <div className="flex flex-wrap gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(place.start_date)} - {formatDate(place.end_date)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{getDayRange()}</span>
              </div>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-400 ml-4">
            {String(index + 1).padStart(2, '0')}
          </div>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              Duration
            </h4>
            <p className="text-gray-600 text-sm">{place.estimated_time}</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Best Time</h4>
            <p className="text-gray-600 text-sm">{place.best_time_to_visit}</p>
          </div>
        </div>

        {/* Activities Preview */}
        <div className="mb-4">
          <h4 className="font-semibold text-gray-700 mb-2">Key Activities</h4>
          <div className="flex flex-wrap gap-2">
            {place.activities.slice(0, 3).map((activity, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-white bg-opacity-70 rounded-full text-xs font-medium text-gray-700 border border-gray-200"
              >
                {activity}
              </span>
            ))}
            {place.activities.length > 3 && (
              <span className="px-3 py-1 bg-white bg-opacity-70 rounded-full text-xs font-medium text-gray-500 border border-gray-200">
                +{place.activities.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-white bg-opacity-70 hover:bg-opacity-90 rounded-lg border border-gray-200 transition-all duration-200 text-gray-700 font-medium"
        >
          {isExpanded ? (
            <>
              <span>Show Less</span>
              <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              <span>View Details</span>
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-gray-200 border-opacity-50">
          <div className="pt-6 space-y-6">
            {/* Full Activities List */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                All Activities
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {place.activities.map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-600 text-sm">{activity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-1">
                <Lightbulb className="w-4 h-4" />
                Travel Tips
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {place.tips.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-600 text-sm">{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Content */}
            {place.content && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Detailed Itinerary</h4>
                <div className="bg-white bg-opacity-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-gray-600 text-sm whitespace-pre-line max-h-60 overflow-y-auto">
                    {place.content.length > 500 
                      ? `${place.content.substring(0, 500)}...` 
                      : place.content
                    }
                  </div>
                  {place.content.length > 500 && (
                    <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Read full itinerary →
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
