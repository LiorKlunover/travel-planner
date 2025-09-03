import {TravelPlanRequest, TravelPlanResponse} from '../types/travel';

export class TravelPlannerClient {
    private apiUrl: string;
  
    constructor(apiUrl: string = '/api/travel-plan') {
      this.apiUrl = apiUrl;
    }
  
    async generatePlan(request: TravelPlanRequest): Promise<TravelPlanResponse> {
      try {
        const response = await fetch(this.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        // Parse the response from the backend
        const backendResponse = await response.json();
        console.log('Backend response:', backendResponse);
        
        // Transform the backend response to match our frontend TravelPlanResponse type
        const transformedResponse: TravelPlanResponse = {
          success: backendResponse.success,
          plan: backendResponse.plan ? backendResponse.plan : undefined,
          error: backendResponse.error
        };
        
        return transformedResponse;
      } catch (error) {
        console.error('Error calling travel plan API:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to generate travel plan'
        };
      }
    }
  }