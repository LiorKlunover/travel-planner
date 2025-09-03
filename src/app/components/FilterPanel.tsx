'use client';

import { useState } from 'react';

interface FilterPanelProps {
  onPlanTrip?: (destination: string, startDate: string, endDate: string) => void;
}

export default function FilterPanel({ onPlanTrip }: FilterPanelProps) {
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handlePlanTrip = () => {
    if (destination.trim() && startDate && endDate) {
      onPlanTrip?.(destination.trim(), startDate, endDate);
    }
  };

  const isFormValid = destination.trim() && startDate && endDate;

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Plan Your Trip</h2>
          <p className="text-gray-600">Enter your destination and travel dates to get started</p>
        </div>

        {/* Destination Input */}
        <div className="space-y-2">
          <label htmlFor="destination" className="block text-sm font-medium text-gray-700">
            Destination
          </label>
          <input
            id="destination"
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Where would you like to go?"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
          />
        </div>

        {/* Date Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Travel Dates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Plan Trip Button */}
        <div className="pt-4">
          <button
            onClick={handlePlanTrip}
            disabled={!isFormValid}
            className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 transform ${
              isFormValid
                ? 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Plan Trip
          </button>
        </div>
      </div>
    </div>
  );
}