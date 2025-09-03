from travel_agent import generate_travel_plan, save_plan_to_file
# Example usage
if __name__ == "__main__":
    import sys
    import argparse
    import os
    
    # Set up command line argument parsing
    parser = argparse.ArgumentParser(description="Generate a travel plan")
    parser.add_argument("--destination", "-d", type=str, default="Tel Aviv", help="Destination city or country")
    parser.add_argument("--start", "-s", type=str, default="2025-08-20", help="Start date (YYYY-MM-DD)")
    parser.add_argument("--end", "-e", type=str, default="2025-08-26", help="End date (YYYY-MM-DD)")
    parser.add_argument("--output", "-o", type=str, default="travel_plan.md", help="Output file path (default: travel_plan.md)")
    
    args = parser.parse_args()
    
    try:
        # Generate a travel plan
        plan = generate_travel_plan(args.destination, args.start, args.end)
        
        # Always save to file
        filename = save_plan_to_file(plan, args.output)
        
        # Display the plan
        print("\n" + "=" * 80)
        print(f"TRAVEL PLAN FOR {args.destination.upper()}")
        print("=" * 80)
        print(plan)
        print("=" * 80)
        print(f"\nTravel plan saved to: {os.path.abspath(filename)}")
            
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)
