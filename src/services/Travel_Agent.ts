// import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
// import { SystemMessage, HumanMessage } from '@langchain/core/messages';
// import { StateGraph, START, END, Send } from '@langchain/langgraph';
// import { z } from 'zod';
// import { Place, PlannerState, WorkerState, TravelPlanResponse } from '../types/travel';

// const DEFAULT_MODEL = 'gemini-2.5-flash-preview-05-20';

// const llm = new ChatGoogleGenerativeAI({
//     model: DEFAULT_MODEL,
//     apiKey: process.env.GOOGLE_API_KEY,
// });

// // Zod schemas for structured output
// const PlaceSchema = z.object({
//   place: z.string().describe('Place to visit in the destination'),
//   start_date: z.string().describe('Start date to visit the place'),
//   end_date: z.string().describe('End date to visit the place'),
//   activities: z.array(z.string()).describe('Activities to do in the place'),
//   estimated_time: z.string().describe('Estimated time to visit the place'),
//   best_time_to_visit: z.string().describe('Best time to visit the place'),
//   tips: z.array(z.string()).describe('Tips for visiting the place'),
// });

// const PlacesSchema = z.object({
//   places: z.array(PlaceSchema).describe('Places to visit in the destination'),
// });

// const planner = llm.withStructuredOutput(PlacesSchema);

// // Orchestrator node - coordinates the travel planning workflow
// async function orchestrator(state: PlannerState): Promise<Partial<PlannerState>> {
//   try {
//     const { destination, startDate, endDate } = state;
    
//     console.log(`🎯 Orchestrator: Planning trip to ${destination} from ${startDate} to ${endDate}`);
    
//     const result = await planner.invoke([
//       new SystemMessage({
//         content: "You are a travel planning orchestrator. Generate a comprehensive list of places to visit for the given destination and time period. " +
//                 "Focus on creating a logical sequence of places that minimizes travel time and maximizes the travel experience. " +
//                 "For each place, provide essential planning information including activities, timing, and practical tips."
//       }),
//       new HumanMessage({
//         content: `Plan a trip to ${destination} from ${startDate} to ${endDate}. ` +
//                 `Generate an optimal list of places to visit, considering: ` +
//                 `1. Seasonal factors and weather for the travel dates ` +
//                 `2. Logical geographic routing to minimize travel time ` +
//                 `3. Mix of must-see attractions and local experiences ` +
//                 `4. Appropriate time allocation for each location`
//       }),
//     ]);
    
//     console.log(`🎯 Orchestrator: Generated ${result.places.length} places for detailed planning`);
//     return { places: result.places };
//   } catch (error) {
//     console.error('❌ Orchestrator error:', error);
//     return { places: [] };
//   }
// }

// // Worker agent - processes individual places with detailed itineraries
// async function detailPlanner(state: WorkerState): Promise<Partial<WorkerState>> {
//   try {
//     const { place } = state;
//     const placeName = place.place;
    
//     console.log(`🔧 Detail Planner: Creating itinerary for ${placeName}`);
    
//     const section = await llm.invoke([
//       new SystemMessage({
//         content: "You are a specialized travel detail planner agent. Your role is to create comprehensive, actionable itineraries for specific locations. " +
//                 "Focus on practical details that travelers need: precise timing, transportation, costs, and insider tips. " +
//                 "Structure your response with clear sections and bullet points for easy reading and implementation."
//       }),
//       new HumanMessage({
//         content: `Create a detailed itinerary for: ${placeName}
        
// **Visit Period:** ${place.start_date} to ${place.end_date}
// **Suggested Activities:** ${place.activities.join(', ')}
// **Time Allocation:** ${place.estimated_time}
// **Optimal Visit Time:** ${place.best_time_to_visit}
// **Local Insights:** ${place.tips.join(', ')}

// Structure the itinerary with:
// - Day-by-day breakdown with specific times
// - Transportation details between activities
// - Meal recommendations with timing
// - Cost estimates for major expenses
// - Weather-appropriate clothing suggestions
// - Local customs and etiquette tips
// - Emergency contacts and practical info`
//       }),
//     ]);
    
//     const formattedContent = `## ${placeName} - Detailed Itinerary\n\n${section.content}`;
    
//     console.log(`✅ Detail Planner: Completed itinerary for ${placeName}`);
//     return { completed_places: [formattedContent] };
//   } catch (error) {
//     console.error(`❌ Detail Planner error for ${state.place.place}:`, error);
//     const errorMessage = `## Error: ${state.place.place}\n\nUnable to generate detailed itinerary: ${error}`;
//     return { completed_places: [errorMessage] };
//   }
// }

// // Synthesizer agent - combines all detailed plans into final travel document
// async function synthesizer(state: PlannerState): Promise<Partial<PlannerState>> {
//   const { completed_places, destination, startDate, endDate, places } = state;
  
//   console.log(`📋 Synthesizer: Compiling final travel plan for ${destination}`);
  
//   const header = `# Complete Travel Plan: ${destination}\n\n` +
//                 `**Travel Period:** ${startDate} to ${endDate}\n\n` +
//                 `**Total Destinations:** ${places.length}\n\n` +
//                 `**Plan Generated:** ${new Date().toLocaleDateString()}\n\n` +
//                 `---\n\n`;
  
//   const completedReportPlaces = completed_places.join('\n\n---\n\n');
//   const finalPlan = header + completedReportPlaces;
  
//   console.log(`✅ Synthesizer: Final travel plan compiled successfully`);
//   return { final_plan: finalPlan };
// }

// // Coordinator function - assigns work to detail planners
// function assignWorkers(state: PlannerState): Send[] {
//   if (!state.places || state.places.length === 0) {
//     console.log('⚠️ Coordinator: No places found for detailed planning');
//     return [];
//   }
  
//   console.log(`🔄 Coordinator: Assigning ${state.places.length} detail planners for individual places`);
  
//   return state.places.map(place => new Send('detail_planner', { place }));
// }

// // Build LangGraph workflow with orchestrator pattern
// const orchestratorWorkerBuilder = new StateGraph({
//   channels: {
//     destination: null,
//     startDate: null,
//     endDate: null,
//     places: null,
//     completed_places: null,
//     final_plan: null,
//   }
// });

// // Add agent nodes to the workflow
// orchestratorWorkerBuilder.addNode('orchestrator', orchestrator);
// orchestratorWorkerBuilder.addNode('detail_planner', detailPlanner);
// orchestratorWorkerBuilder.addNode('synthesizer', synthesizer);

// // Define workflow edges - orchestrator coordinates the entire process
// orchestratorWorkerBuilder.addEdge(START, 'orchestrator');
// orchestratorWorkerBuilder.addConditionalEdges('orchestrator', assignWorkers);
// // Note: detail_planner connects to synthesizer via the Send API pattern
// orchestratorWorkerBuilder.addEdge('synthesizer', END);

// // Compile the workflow
// const orchestratorWorker = orchestratorWorkerBuilder.compile();

// // Input validation function
// function validateInput(destination: string, startDate: string, endDate: string): boolean {
//   if (!destination || typeof destination !== 'string') {
//     throw new Error('Destination must be a non-empty string');
//   }
  
//   try {
//     const start = new Date(startDate);
//     const end = new Date(endDate);
    
//     if (isNaN(start.getTime()) || isNaN(end.getTime())) {
//       throw new Error('Invalid date format. Use YYYY-MM-DD format');
//     }
    
//     if (end < start) {
//       throw new Error('End date must be after start date');
//     }
    
//     if (start < new Date()) {
//       console.warn('Warning: Start date is in the past');
//     }
//   } catch (error) {
//     throw new Error(`Date validation error: ${error}`);
//   }
  
//   return true;
// }

// // Main function to generate travel plan
// export async function generateTravelPlan(
//   destination: string,
//   startDate: string,
//   endDate: string
// ): Promise<TravelPlanResponse> {
//   try {
//     // Validate input
//     validateInput(destination, startDate, endDate);
    
//     console.log(`\n=== Generating Travel Plan for ${destination} ===\n`);
//     console.log(`Travel period: ${startDate} to ${endDate}`);
    
//     // Invoke the workflow
//     const result = await orchestratorWorker.invoke({
//       destination,
//       startDate,
//       endDate,
//       completed_places: [],
//       places: [],
//     });
    
//     console.log('\n=== Travel Plan Generation Complete ===\n');
    
//     const placesWithContent = result.completed_places;
    
//     return {
//       success: true,
//       plan: {
//         destination: destination,
//         travel_period: {
//           start_date: startDate,
//           end_date: endDate
//         },
//         number_of_places: (placesWithContent as any[]).length,
//         places: placesWithContent as any[]
//       }
//     };
//   } catch (error) {
//     console.error('Error generating travel plan:', error);
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : 'Unknown error occurred',
//     };
//   }
// }

// // Function to save plan to file
// export function savePlanToFile(plan: string, filename: string = 'travel_plan.md'): string {
//   const fs = require('fs');
//   fs.writeFileSync(filename, plan, 'utf-8');
//   console.log(`Travel plan saved to ${filename}`);
//   return filename;
// }

// export { orchestrator, detailPlanner, synthesizer, assignWorkers, validateInput };