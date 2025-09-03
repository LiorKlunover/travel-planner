'use client';

import React, { useState } from 'react';
import { useTravelPlanner } from '../../hooks/useTravelPlanner';
import TravelPlacesGrid from './TravelPlacesGrid';
import { TravelPlan } from '@/types/travel';

const TravelPlannerComponent: React.FC = () => {
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const { loading, plan, places, error, generatePlan, reset } = useTravelPlanner();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!destination || !startDate || !endDate) {
      alert('Please fill in all fields');
      return;
    }

    await generatePlan({ destination, startDate, endDate });
  };

  const handleReset = () => {
    reset();
    setDestination('');
    setStartDate('');
    setEndDate('');
  };

  const downloadPlan = () => {
    if (plan) {
      // Convert plan object to string if it's an object
      const planContent = typeof plan === 'object' ? JSON.stringify(plan, null, 2) : plan;
      const blob = new Blob([planContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `travel-plan-${destination.replace(/\s+/g, '-').toLowerCase()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Extract detailed content for each place from the plan
  const extractPlaceContent = (placeName: string): string => {
    if (!plan || typeof plan !== 'string') return '';
    
    // Split the plan by place sections (marked by ## headers)
    const sections = plan.split(/(?=##\s)/);
    
    // Find the section for this specific place
    const placeSection = sections.find(section => 
      section.toLowerCase().includes(placeName.toLowerCase()) ||
      placeName.toLowerCase().includes(section.split('\n')[0]?.replace('##', '').trim().toLowerCase() || '')
    );
    
    return placeSection?.trim() || '';
  };

  // Transform places data into TravelPlan format for the new components
  const createTravelPlan = (): TravelPlan | null => {
    if (!places || places.length === 0) return null;
    
    return {
      destination: destination,
      travel_period: {
        start_date: startDate,
        end_date: endDate
      },
      number_of_places: places.length,
      places: places.map(place => ({
        name: place.place || place.name || 'Unknown Place',
        content: extractPlaceContent(place.place || place.name || ''),
        start_date: place.start_date,
        end_date: place.end_date,
        activities: place.activities || [],
        estimated_time: place.estimated_time || '',
        best_time_to_visit: place.best_time_to_visit || '',
        tips: place.tips || []
      }))
    };
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">
        AI Travel Planner
      </h1>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-2">
              Destination
            </label>
            <input
              type="text"
              id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g., Paris, France"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating Plan...' : 'Generate Travel Plan'}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-3 bg-gray-600 text-white font-medium rounded-md shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Reset
          </button>
        </div>
      </form>

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Generating your personalized travel plan...</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                {error}
              </div>
            </div>
          </div>
        </div>
      )}

      {places && places.length > 0 && (
        <div className="mb-6">
          <TravelPlacesGrid travelPlan={createTravelPlan()!} />
        </div>
      )}

      {plan && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Your Travel Plan</h2>
            <button
              onClick={downloadPlan}
              className="px-4 py-2 bg-green-600 text-white font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Download Plan
            </button>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-md p-6 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
              {typeof plan === 'object' ? JSON.stringify(plan, null, 2) : plan}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelPlannerComponent;