from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from travel_agent import generate_travel_plan

app = FastAPI()

# Add CORS middleware to allow cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.get("/travel-plan")
async def get_travel_plan(destination: str, start_date: str, end_date: str):
    try:
        # Generate travel plan using the travel_agent.py
        # Now plan is already a JSON object (dictionary)
        plan = generate_travel_plan(destination, start_date, end_date)
        
        # Return JSON response
        # Since plan is already a dictionary, we can include it directly
        return JSONResponse(content={
            "success": True,
            "destination": destination,
            "start_date": start_date,
            "end_date": end_date,
            "plan": plan
        })
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)