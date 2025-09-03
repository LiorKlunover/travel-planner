# FastAPI Server Test Documentation

## Overview

This document provides information about the test coverage for the FastAPI server implementation in the Travel Planner application. The tests are designed to verify the functionality of the `/travel-plan` endpoint, which generates travel plans based on user input.

## Test Coverage

The test suite (`test_FastAPI_Server.py`) covers the following scenarios:

1. **Successful Travel Plan Generation**
   - Verifies that the endpoint returns a 200 status code and the expected response structure when valid parameters are provided
   - Confirms that the `generate_travel_plan` function is called with the correct parameters

2. **Parameter Validation**
   - Tests error handling when required parameters are missing (destination, start_date, end_date)
   - Verifies that FastAPI's built-in validation returns a 422 status code for missing parameters

3. **Input Validation Errors**
   - Tests error handling when the `generate_travel_plan` function raises a ValueError
   - Verifies that the API returns a 400 status code with the appropriate error message
   - Specifically tests the case where end_date is before start_date

4. **Server Error Handling**
   - Tests error handling when an unexpected exception occurs in the `generate_travel_plan` function
   - Verifies that the API returns a 400 status code with the error message

5. **Date Format Validation**
   - Tests error handling when dates are not provided in the required YYYY-MM-DD format
   - Verifies that the API returns a 400 status code with the appropriate error message

## Mocking Strategy

The tests use Python's `unittest.mock` to mock the `generate_travel_plan` function, which allows testing the API without making actual calls to the travel planning service. This approach:

- Isolates the API functionality from the underlying implementation
- Makes tests faster and more reliable
- Allows testing error scenarios that might be difficult to reproduce with the actual implementation

## Running the Tests

To run the tests, use the following command from the project root directory:

```bash
python -m pytest BackEnd/test_FastAPI_Server.py -v
```

Or if using a specific Python environment:

```bash
/path/to/python -m pytest BackEnd/test_FastAPI_Server.py -v
```

## Future Test Improvements

Potential areas for expanding test coverage:

1. Testing with different date formats and validating error messages
2. Performance testing for large travel plans
3. Integration tests with the actual `generate_travel_plan` function
4. Testing CORS and other HTTP headers
5. Load testing for concurrent requests
