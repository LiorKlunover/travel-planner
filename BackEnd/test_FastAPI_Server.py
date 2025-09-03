import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from datetime import datetime

# Import the FastAPI app
from FastAPI_Server import app

# Create a test client
client = TestClient(app)

# Test data
valid_destination = "Paris"
valid_start_date = "2025-06-01"
valid_end_date = "2025-06-07"

# Mock JSON travel plan
mock_travel_plan = {
    "destination": "Paris",
    "travel_period": "2025-06-01 to 2025-06-07",
    "number_of_places": 3,
    "places": [
        {
            "name": "Eiffel Tower",
            "content": "Detailed itinerary for Eiffel Tower...",
            "start_date": "2025-06-01",
            "end_date": "2025-06-01",
            "activities": ["Viewing platform", "Restaurant dining"],
            "estimated_time": "4 hours",
            "best_time_to_visit": "Evening for light show",
            "tips": "Book tickets in advance to avoid long queues"
        },
        {
            "name": "Louvre Museum",
            "content": "Detailed itinerary for Louvre Museum...",
            "start_date": "2025-06-02",
            "end_date": "2025-06-02",
            "activities": ["Art viewing", "Guided tour"],
            "estimated_time": "6 hours",
            "best_time_to_visit": "Morning on weekdays",
            "tips": "Focus on key exhibits as the museum is huge"
        }
    ]
}


@pytest.fixture
def mock_generate_travel_plan():
    """Fixture to mock the generate_travel_plan function"""
    with patch("FastAPI_Server.generate_travel_plan") as mock:
        mock.return_value = mock_travel_plan
        yield mock


def test_get_travel_plan_success(mock_generate_travel_plan):
    """Test successful travel plan generation"""
    response = client.get(f"/travel-plan?destination={valid_destination}&start_date={valid_start_date}&end_date={valid_end_date}")
    
    # Assert response status code and content
    assert response.status_code == 200
    assert response.json() == {
        "success": True,
        "destination": valid_destination,
        "start_date": valid_start_date,
        "end_date": valid_end_date,
        "plan": mock_travel_plan
    }
    
    # Verify the mock was called with correct parameters
    mock_generate_travel_plan.assert_called_once_with(valid_destination, valid_start_date, valid_end_date)


def test_get_travel_plan_missing_params():
    """Test error handling when parameters are missing"""
    # Test missing destination
    response = client.get(f"/travel-plan?start_date={valid_start_date}&end_date={valid_end_date}")
    assert response.status_code == 422  # FastAPI validation error
    
    # Test missing start_date
    response = client.get(f"/travel-plan?destination={valid_destination}&end_date={valid_end_date}")
    assert response.status_code == 422
    
    # Test missing end_date
    response = client.get(f"/travel-plan?destination={valid_destination}&start_date={valid_start_date}")
    assert response.status_code == 422


@patch("FastAPI_Server.generate_travel_plan")
def test_get_travel_plan_validation_error(mock_generate_travel_plan):
    """Test error handling when input validation fails"""
    # Mock the function to raise a ValueError
    mock_generate_travel_plan.side_effect = ValueError("End date must be after start date")
    
    # Make the request
    response = client.get(f"/travel-plan?destination={valid_destination}&start_date={valid_end_date}&end_date={valid_start_date}")
    
    # Assert response status code and error message
    assert response.status_code == 400
    assert "End date must be after start date" in response.json()["detail"]


@patch("FastAPI_Server.generate_travel_plan")
def test_get_travel_plan_server_error(mock_generate_travel_plan):
    """Test error handling when an unexpected server error occurs"""
    # Mock the function to raise an unexpected exception
    mock_generate_travel_plan.side_effect = Exception("Unexpected server error")
    
    # Make the request
    response = client.get(f"/travel-plan?destination={valid_destination}&start_date={valid_start_date}&end_date={valid_end_date}")
    
    # Assert response status code and error message
    assert response.status_code == 400
    assert "Unexpected server error" in response.json()["detail"]


def test_get_travel_plan_invalid_date_format():
    """Test error handling when date format is invalid"""
    invalid_date = "01-06-2025"  # Not in YYYY-MM-DD format
    
    with patch("FastAPI_Server.generate_travel_plan") as mock:
        mock.side_effect = ValueError("Dates must be in YYYY-MM-DD format")
        
        response = client.get(f"/travel-plan?destination={valid_destination}&start_date={invalid_date}&end_date={valid_end_date}")
        
        assert response.status_code == 400
        assert "Dates must be in YYYY-MM-DD format" in response.json()["detail"]


if __name__ == "__main__":
    pytest.main(["-v"])
