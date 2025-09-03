import type { TravelPlanRequest } from '../../../types/travel';

export async function POST(request: Request) {
  try {
    const body: TravelPlanRequest = await request.json();
    const { destination, startDate, endDate } = body;

    if (!destination || !startDate || !endDate) {
      return Response.json({
        success: false,
        error: 'Missing required fields: destination, startDate, endDate'
      }, { status: 400 });
    }

    // Call FastAPI endpoint
    const fastApiUrl = `http://localhost:8000/travel-plan?destination=${encodeURIComponent(destination)}&start_date=${startDate}&end_date=${endDate}`;
    
    const response = await fetch(fastApiUrl);
    
    if (!response.ok) {
      throw new Error(`FastAPI error: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Route: ',result);
    return Response.json(result);

  } catch (error) {
    console.error('API Error:', error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}