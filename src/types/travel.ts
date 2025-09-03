export interface Place {
    place?: string; // Backend uses 'place'
    name?: string;  // Frontend uses 'name'
    content?: string;
    start_date: string;
    end_date: string;
    activities: string[];
    estimated_time: string;
    best_time_to_visit: string;
    tips: string[];
  }
  
  export interface TravelPlan {
    destination: string;
    travel_period: {
      start_date: string;
      end_date: string;
    };
    number_of_places: number;
    places: Place[];
  }
  
  export interface TravelPlanRequest {
    destination: string;
    startDate: string;
    endDate: string;
  }
  
  export interface TravelPlanResponse {
    success: boolean;
    plan?: {
      destination: string;
      travel_period: {
        start_date: string;
        end_date: string;
      };
      number_of_places: number;
      places: Array<{
        name: string;
        content: string;
        start_date: string;
        end_date: string;
        activities: string[];
        estimated_time: string;
        best_time_to_visit: string;
        tips: string[];
      }>;
    };
    error?: string;
  }
  
  export interface WorkerState {
    place: Place;
    completed_places: string[];
  }
  
  export interface PlannerState {
    destination: string;
    startDate: string;
    endDate: string;
    places: Place[];
    completed_places: string[];
    final_plan?: string;
  }