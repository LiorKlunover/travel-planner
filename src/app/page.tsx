import FilterPanel from './components/FilterPanel';
import TravelPlannerComponent from './components/TravelPlannerComponent';

export default function Home() {
  const handlePlanTrip = (destination: string, startDate: string, endDate: string) => {
    console.log('Planning trip to:', { destination, startDate, endDate });
    // TODO: Add trip planning logic here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      
      <TravelPlannerComponent />
    </div>
    );
  }
