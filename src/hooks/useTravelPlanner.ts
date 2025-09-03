import { useState, useCallback } from 'react';
import {TravelPlannerClient} from '../utils/travelPlannerClient';
import {TravelPlanRequest, Place} from '../types/travel';

export interface UseTravelPlannerState {
  loading: boolean;
  plan: Record<string, unknown> | string | null; // Properly typed to handle JSON object or string
  places: Place[] | null;
  error: string | null;
}

export const useTravelPlanner = () => {
  const [state, setState] = useState<UseTravelPlannerState>({
    loading: false,
    plan: null,
    places: null,
    error: null
  });

  const client = new TravelPlannerClient();

  const generatePlan = useCallback(async (request: TravelPlanRequest) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await client.generatePlan(request);
      
      if (response.success && response.plan) {
        setState({
          loading: false,
          plan: response.plan,
          places: response.plan.places,
          error: null
        });
      } else {
        setState({
          loading: false,
          plan: null,
          places: null,
          error: response.error || 'Failed to generate plan'
        });
      }
    } catch (error) {
      setState({
        loading: false,
        plan: null,
        places: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      loading: false,
      plan: null,
      places: null,
      error: null
    });
  }, []);

  return {
    ...state,
    generatePlan,
    reset
  };
};