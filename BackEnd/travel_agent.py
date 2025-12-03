from typing import Annotated, List, Dict, Any
from pydantic import BaseModel, Field
import operator
import json
from typing_extensions import TypedDict
from langchain_core.messages import SystemMessage, HumanMessage

from langgraph.types import Send
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
from datetime import datetime
from langgraph.graph import StateGraph, START, END

load_dotenv()

DEFAULT_MODEL = "gemini-2.5-flash"

llm = ChatGoogleGenerativeAI(model=DEFAULT_MODEL)

# Schema for structured output to use in planning
class Place(BaseModel):
    place: str = Field(
        description="Place to visit in the destination"
    )
    start_date: datetime = Field(
        description="Start date to visit the place"
    )
    end_date: datetime = Field(
        description="End date to visit the place"
    )
    activities: List[str] = Field(
        description="Activities to do in the place"
    )
    estimated_time: str = Field(
        description="Estimated time to visit the place"
    )
    best_time_to_visit: str = Field(
        description="Best time to visit the place"
    )
    tips: List[str] = Field(
        description="Tips for visiting the place"
    )


class Places(BaseModel):
    places: List[Place] = Field(
        description="Places to visit in the destination.",
    )


# Augment the LLM with schema for structured output
planner = llm.with_structured_output(Places)



# Graph state
class State(TypedDict):
    destination: str  # Report topic
    startDate: str  # Report topic
    endDate: str  # Report topic
    places: list[Place]  # List of report sections
    completed_places: Annotated[
        list, operator.add
    ]  # All workers write to this key in parallel
    final_plan: Dict[str, Any]  # Final report as JSON


# Worker state
class WorkerState(TypedDict):
    place: Place
    completed_places: Annotated[list, operator.add]


# Nodes
def orchestrator(state: State):
    """Orchestrator that generates a plan for the trip with error handling"""
    try:
        # Extract information from state
        destination = state['destination']
        start_date = state['startDate']
        end_date = state['endDate']
        
        # Generate a comprehensive travel plan with places to visit
        places = planner.invoke(
            [
                SystemMessage(content="You are a travel planning expert. Generate a comprehensive plan for a trip with the best places to visit in the specific time period. "
                              "For each place, include detailed information about activities, estimated time needed, best time to visit, and helpful tips."),
                HumanMessage(content=f"I'm planning a trip to {destination} from {start_date} to {end_date}. "
                             f"Please suggest the best places to visit, considering the time of year and duration of my stay. "
                             f"Organize the places in a logical order that minimizes travel time between locations."),
            ]
        )
        
        # Log the planning process
        print(f"Planning trip to {destination} from {start_date} to {end_date}")
        print(f"Generated {len(places.places)} places to visit")
        
        return {"places": places.places}
    except Exception as e:
        # Handle errors gracefully
        print(f"Error in orchestrator: {str(e)}")
        # Return an empty list if there's an error
        return {"places": []}


def llm_call(state: WorkerState):
    """Worker writes a section of the report with error handling"""
    try:
        # Format the place name for the header
        place_name = state['place'].place
        
        # Generate section
        section = llm.invoke(
            [
                SystemMessage(
                    content="You are a travel planning assistant. Create a detailed daily itinerary for the specified location. Include: \n"
                    "- Recommended attractions and activities\n"
                    "- Suggested timing for each activity\n"
                    "- Transportation options between locations\n"
                    "- Dining recommendations\n"
                    "- Local tips and cultural insights\n"
                    "- Estimated costs where relevant\n"
                    "- Weather considerations for the dates\n\n"
                    "Make the plan practical, engaging, and tailored to the specific location and dates provided."
                    "Format the response with clear headings and bullet points for readability."
                ),
                HumanMessage(
                    content=f"""Create a detailed travel plan for the following destination:

**Location:** {place_name}
**Visit Period:** From {state['place'].start_date} to {state['place'].end_date}
**Recommended Activities:** {', '.join(state['place'].activities)}
**Estimated Time Needed:** {state['place'].estimated_time}
**Best Time to Visit:** {state['place'].best_time_to_visit}
**Local Tips:** {', '.join(state['place'].tips)}

Please organize the itinerary by day, with specific times for each activity when appropriate. Include practical information about transportation between sites and meal recommendations."""
                ),
            ]
        )
        
        # Create a JSON object for this place
        place_data = {
            "name": place_name,
            "content": section.content,
            "start_date": str(state['place'].start_date),
            "end_date": str(state['place'].end_date),
            "activities": state['place'].activities,
            "estimated_time": state['place'].estimated_time,
            "best_time_to_visit": state['place'].best_time_to_visit,
            "tips": state['place'].tips
        }
        
        # Write the updated section to completed sections
        return {"completed_places": [place_data]}
    except Exception as e:
        # Handle errors gracefully
        error_data = {
            "name": state['place'].place,
            "error": str(e),
            "content": f"Unable to generate itinerary: {str(e)}"
        }
        return {"completed_places": [error_data]}


def synthesizer(state: State):
    """Synthesize full report from sections and create a JSON travel plan"""

    # List of completed places
    completed_places = state["completed_places"]
    destination = state["destination"]
    start_date = state["startDate"]
    end_date = state["endDate"]
    
    # Create the final plan as a JSON object
    final_plan = {
        "destination": destination,
        "travel_period": {
            "start_date": start_date,
            "end_date": end_date
        },
        "number_of_places": len(state['places']),
        "places": completed_places
    }
    
    return {"final_plan": final_plan}


# Conditional edge function to create llm_call workers that each write a section of the report
def assign_workers(state: State):
    """Assign a worker to each section in the plan with progress tracking"""
    
    # Check if there are places to process
    if not state["places"]:
        print("No places to visit were found. Please check your destination and dates.")
        return []
    
    print(f"Assigning {len(state['places'])} workers to process individual places...")
    
    # Kick off section writing in parallel via Send() API
    return [Send("llm_call", {"place": s}) for s in state["places"]]


# Build workflow
orchestrator_worker_builder = StateGraph(State)

# Add the nodes
orchestrator_worker_builder.add_node("orchestrator", orchestrator)
orchestrator_worker_builder.add_node("llm_call", llm_call)
orchestrator_worker_builder.add_node("synthesizer", synthesizer)

# Add edges to connect nodes
orchestrator_worker_builder.add_edge(START, "orchestrator")
orchestrator_worker_builder.add_conditional_edges(
    "orchestrator", assign_workers, ["llm_call"]
)
orchestrator_worker_builder.add_edge("llm_call", "synthesizer")
orchestrator_worker_builder.add_edge("synthesizer", END)

# Compile the workflow
orchestrator_worker = orchestrator_worker_builder.compile()

# Input validation function
def validate_input(destination, start_date, end_date):
    """Validate the input parameters for the travel planner"""
    if not destination or not isinstance(destination, str):
        raise ValueError("Destination must be a non-empty string")
    
    # Basic date format validation
    try:
        start = datetime.strptime(start_date, "%Y-%m-%d")
        end = datetime.strptime(end_date, "%Y-%m-%d")
        
        # Check if end date is after start date
        if end < start:
            raise ValueError("End date must be after start date")
            
        # Check if dates are in the future
        if start < datetime.now():
            print("Warning: Start date is in the past")
            
    except ValueError as e:
        if "does not match format" in str(e):
            raise ValueError("Dates must be in YYYY-MM-DD format") from e
        raise
    
    return True

# Function to run the travel planner
def generate_travel_plan(destination, start_date, end_date):
    """Generate a complete travel plan for the given destination and dates"""
    # Validate input
    validate_input(destination, start_date, end_date)
    
    print(f"\n=== Generating Travel Plan for {destination} ===\n")
    print(f"Travel period: {start_date} to {end_date}")
    
    # Invoke the workflow
    state = orchestrator_worker.invoke({
        "destination": destination,
        "startDate": start_date,
        "endDate": end_date,
        "completed_places": []
    })
    
    print(f"\n=== Travel Plan Generation Complete ===\n")
    save_plan_to_file(state["final_plan"])
    return state["final_plan"]

# Function to save the plan to a file
def save_plan_to_file(plan, filename="travel_plan.json"):
    """Save the travel plan to a JSON file"""
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(plan, f, indent=2, ensure_ascii=False)
    print(f"Travel plan saved to {filename}")
    return filename

