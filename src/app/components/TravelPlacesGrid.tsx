'use client';

import React from 'react';
import { TravelPlan } from '@/types/travel';
import TravelPlaceCard from './TravelPlaceCard';
import { MapPin, Calendar, Users } from 'lucide-react';

interface TravelPlacesGridProps {
  travelPlan: TravelPlan;
}

export default function TravelPlacesGrid({ travelPlan }: TravelPlacesGridProps) {
  const formatDateRange = () => {
    const startDate = new Date(travelPlan.travel_period.start_date);
    const endDate = new Date(travelPlan.travel_period.end_date);
    
    const formatOptions: Intl.DateTimeFormatOptions = {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    };
    
    return `${startDate.toLocaleDateString('en-US', formatOptions)} - ${endDate.toLocaleDateString('en-US', formatOptions)}`;
  };

  const getTotalDays = () => {
    const startDate = new Date(travelPlan.travel_period.start_date);
    const endDate = new Date(travelPlan.travel_period.end_date);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 capitalize">
            {travelPlan.destination} Travel Plan
          </h1>
          <p className="text-gray-600 text-lg">
            Your complete itinerary for an amazing journey
          </p>
        </div>

        {/* Trip Overview */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Duration</h3>
                <p className="text-gray-600">{getTotalDays()} days</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <MapPin className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Places</h3>
                <p className="text-gray-600">{travelPlan.number_of_places} destinations</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Travel Dates</h3>
                <p className="text-gray-600 text-sm">{formatDateRange()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {travelPlan.places.map((place, index) => {
            const startDate = new Date(place.start_date);
            const endDate = new Date(place.end_date);
            const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            
            return (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="text-2xl font-bold text-gray-800 mb-1">
                  {days}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  Day{days > 1 ? 's' : ''} in
                </div>
                <div className="text-sm font-medium text-gray-700 mt-1 truncate">
                  {(place.name || 'Unknown').split(' - ')[0]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Places Grid */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Your Itinerary
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {travelPlan.places.map((place, index) => (
            <TravelPlaceCard
              key={index}
              place={place}
              index={index}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center">
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Ready for Your Adventure?
          </h3>
          <p className="text-gray-600 mb-4">
            Your {getTotalDays()}-day journey through {travelPlan.destination} awaits! 
            Make sure to check local weather conditions and book accommodations in advance.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {travelPlan.places.reduce((total, place) => total + place.activities.length, 0)} Activities
            </span>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
              {travelPlan.places.reduce((total, place) => total + place.tips.length, 0)} Tips
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              {travelPlan.number_of_places} Destinations
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
