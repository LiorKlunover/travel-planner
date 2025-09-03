// import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
// import type { Place, TravelPlanRequest, TravelPlanResponse, PlannerState, WorkerState } from '../types/travel';
// import * as fs from 'fs';

// class TravelPlannerService {
//   private genAI: GoogleGenerativeAI;
//   private model: GenerativeModel;

//   constructor(apiKey: string) {
//     if (!apiKey) {
//       throw new Error('Google Generative AI API key is required');
//     }
//     this.genAI = new GoogleGenerativeAI(apiKey);
//     this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
//   }

//   // Validate input parameters
//   private validateInput(destination: string, startDate: string, endDate: string): void {
//     if (!destination || typeof destination !== 'string') {
//       throw new Error('Destination must be a non-empty string');
//     }

//     try {
//       const start = new Date(startDate);
//       const end = new Date(endDate);

//       if (isNaN(start.getTime()) || isNaN(end.getTime())) {
//         throw new Error('Invalid date format. Use YYYY-MM-DD');
//       }

//       if (end < start) {
//         throw new Error('End date must be after start date');
//       }

//       if (start < new Date()) {
//         console.warn('Warning: Start date is in the past');
//       }
//     } catch (error) {
//       throw new Error(`Date validation error: ${error instanceof Error ? error.message : 'Invalid date'}`);
//     }
//   }

//   // Generate places to visit using Gemini
//   private async orchestrator(state: PlannerState): Promise<{ places: Place[] }> {
//     try {
//       const { destination, startDate, endDate } = state;

//       console.log(`Planning trip to ${destination} from ${startDate} to ${endDate}`);

//       const prompt = `You are a travel planning expert. Generate a comprehensive plan for a trip with the best places to visit in the specific time period.

// I'm planning a trip to ${destination} from ${startDate} to ${endDate}. Please suggest the best places to visit, considering the time of year and duration of my stay. Organize the places in a logical order that minimizes travel time between locations.

// For each place, provide the following information in JSON format:
// {
//   "places": [
//     {
//       "place": "Place name",
//       "start_date": "YYYY-MM-DD",
//       "end_date": "YYYY-MM-DD", 
//       "activities": ["activity1", "activity2", "activity3"],
//       "estimated_time": "X hours/days",
//       "best_time_to_visit": "time description",
//       "tips": ["tip1", "tip2", "tip3"]
//     }
//   ]
// }

// Return only valid JSON without any additional text or formatting.`;

//       const result = await this.model.generateContent(prompt);
//       const response = await result.response;
//       const text = response.text();

//       // Clean and parse the JSON response
//       const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
//       const parsedResponse = JSON.parse(cleanedText);

//       console.log(`Generated ${parsedResponse.places.length} places to visit`);
//       return { places: parsedResponse.places };

//     } catch (error) {
//       console.error('Error in orchestrator:', error);
//       return { places: [] };
//     }
//   }

//   // Generate detailed itinerary for a specific place
//   private async generatePlaceItinerary(workerState: WorkerState): Promise<string> {
//     try {
//       const { place } = workerState;

//       const prompt = `You are a travel planning assistant. Create a detailed daily itinerary for the specified location.

// **Location:** ${place.place}
// **Visit Period:** From ${place.start_date} to ${place.end_date}
// **Recommended Activities:** ${place.activities.join(', ')}
// **Estimated Time Needed:** ${place.estimated_time}
// **Best Time to Visit:** ${place.best_time_to_visit}
// **Local Tips:** ${place.tips.join(', ')}

// Create a detailed travel plan that includes:
// - Recommended attractions and activities
// - Suggested timing for each activity  
// - Transportation options between locations
// - Dining recommendations
// - Local tips and cultural insights
// - Estimated costs where relevant
// - Weather considerations for the dates

// Please organize the itinerary by day, with specific times for each activity when appropriate. Include practical information about transportation between sites and meal recommendations.

// Format the response with clear headings and bullet points for readability.`;

//       const result = await this.model.generateContent(prompt);
//       const response = await result.response;
//       const content = response.text();

//       return `## ${place.place} Itinerary\n\n${content}`;

//     } catch (error) {
//       console.error(`Error processing ${workerState.place.place}:`, error);
//       return `## Error processing ${workerState.place.place}\n\nUnable to generate itinerary: ${error instanceof Error ? error.message : 'Unknown error'}`;
//     }
//   }

//   // Process all places in parallel
//   private async processPlaces(places: Place[]): Promise<string[]> {
//     if (!places.length) {
//       console.log('No places to visit were found. Please check your destination and dates.');
//       return [];
//     }

//     console.log(`Processing ${places.length} places...`);

//     const promises = places.map(place => 
//       this.generatePlaceItinerary({ place, completed_places: [] })
//     );

//     try {
//       const results = await Promise.all(promises);
//       return results;
//     } catch (error) {
//       console.error('Error processing places:', error);
//       return [];
//     }
//   }

//   // Synthesize the final travel plan
//   private synthesizePlan(state: PlannerState, completedPlaces: string[]): string {
//     const { destination, startDate, endDate, places } = state;

//     // Create header
//     let finalPlan = `# Travel Plan for ${destination}\n\n`;
//     finalPlan += `**Travel Period:** ${startDate} to ${endDate}\n\n`;
//     finalPlan += `**Number of Places to Visit:** ${places.length}\n\n`;
//     finalPlan += '---\n\n';

//     // Add completed places
//     finalPlan += completedPlaces.join('\n\n---\n\n');

//     return finalPlan;
//   }

//   // Main method to generate complete travel plan
//   async generateTravelPlan({ destination, startDate, endDate }: TravelPlanRequest): Promise<TravelPlanResponse> {
//     try {
//       // Validate input
//       this.validateInput(destination, startDate, endDate);

//       console.log(`\n=== Generating Travel Plan for ${destination} ===\n`);
//       console.log(`Travel period: ${startDate} to ${endDate}`);

//       // Initialize state
//       const initialState: PlannerState = {
//         destination,
//         startDate,
//         endDate,
//         places: [],
//         completed_places: []
//       };

//       // Step 1: Generate places to visit
//       const { places } = await this.orchestrator(initialState);
      
//       if (places.length === 0) {
//         return {
//           success: false,
//           error: 'No places found for the specified destination and dates'
//         };
//       }

//       // Step 2: Generate detailed itineraries for each place
//       const completedPlaces = await this.processPlaces(places);

//       // Step 3: Synthesize final plan
//       const finalPlan = this.synthesizePlan({ ...initialState, places }, completedPlaces);

//       console.log('\n=== Travel Plan Generation Complete ===\n');

//       return {
//         success: true,
//         plan: {
//           destination,
//           travel_period: {
//             start_date: startDate,
//             end_date: endDate
//           },
//           number_of_places: places.length,
//           places: places.map(place => ({
//             name: place.place || 'Unknown Place',
//             content: '',
//             start_date: place.start_date,
//             end_date: place.end_date,
//             activities: place.activities,
//             estimated_time: place.estimated_time,
//             best_time_to_visit: place.best_time_to_visit,
//             tips: place.tips
//           }))
//         }
//       };

//     } catch (error) {
//       console.error('Error generating travel plan:', error);
//       return {
//         success: false,
//         error: error instanceof Error ? error.message : 'Unknown error occurred'
//       };
//     }
//   }

//   // Utility method to save plan to file (for server-side usage)
//   savePlanToFile(plan: string, filename: string = 'travel_plan.md'): void {
//     if (typeof window === 'undefined') {
//       // Server-side only
//       fs.writeFileSync(filename, plan, 'utf-8');
//       console.log(`Travel plan saved to ${filename}`);
//     } else {
//       console.warn('File saving is not supported in browser environment');
//     }
//   }
// }

// export default TravelPlannerService;