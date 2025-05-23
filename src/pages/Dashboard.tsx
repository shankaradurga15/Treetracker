
import { PanelLeft,Trees, Users, TriangleAlert, Clock } from 'lucide-react';
import StatCard from '@/components/StatCard';
import DogControlBarChart from '@/components/BarChart';
import DogControlLineChart from '@/components/LineChart';
import HeatmapSection from '@/components/HeatmapSection';
import ActivityTimeline from '@/components/ActivityTimeline';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


const Dashboard = () => {
  // Sample data for charts
  const monthlyData = [
    { name: 'Jan', complaints: 35, sterilizations: 28 },
    { name: 'Feb', complaints: 32, sterilizations: 35 },
    { name: 'Mar', complaints: 38, sterilizations: 30 },
    { name: 'Apr', complaints: 30, sterilizations: 32 },
    { name: 'May', complaints: 35, sterilizations: 28 },
    { name: 'Jun', complaints: 32, sterilizations: 30 },
    { name: 'Jul', complaints: 33, sterilizations: 35 },
    { name: 'Aug', complaints: 35, sterilizations: 38 },
    { name: 'Sep', complaints: 38, sterilizations: 42 },
    { name: 'Oct', complaints: 40, sterilizations: 45 },
    { name: 'Nov', complaints: 38, sterilizations: 42 },
    { name: 'Dec', complaints: 42, sterilizations: 44 },
  ];
  
  const performanceData = [
    { name: 'Jan', complaints: 40, sterilizations: 30 },
    { name: 'Feb', complaints: 32, sterilizations: 35 },
    { name: 'Mar', complaints: 45, sterilizations: 40 },
    { name: 'Apr', complaints: 42, sterilizations: 38 },
    { name: 'May', complaints: 35, sterilizations: 32 },
    { name: 'Jun', complaints: 38, sterilizations: 42 },
    { name: 'Jul', complaints: 40, sterilizations: 45 },
    { name: 'Aug', complaints: 42, sterilizations: 48 },
    { name: 'Sep', complaints: 45, sterilizations: 50 },
    { name: 'Oct', complaints: 48, sterilizations: 52 },
    { name: 'Nov', complaints: 46, sterilizations: 48 },
    { name: 'Dec', complaints: 50, sterilizations: 52 },
  ];
  
  const activities = [
    {
      id: '1',
      title: 'Rajesh Kumar',
      description: '23 trees in Central Park',
      timeAgo: '2 hours ago',
      type: 'resolved' as const,
    },
    {
      id: '2',
      title: 'Priya Sharma',
      description: '15 trees in Beach Road',
      timeAgo: '5 hours ago',
      type: 'sterilized' as const,
    },
    {
      id: '3',
      title: 'Arun Singh',
      description: '8 trees in Railway Colony',
      timeAgo: '1 day ago',
      type: 'registered' as const,
    },
    {
      id: '4',
      title: 'Meena Patel',
      description: '12 trees in Industrial Zone',
      timeAgo: '2 days ago',
      type: 'assigned' as const,
    },
    {
      id: '5',
      title: 'Vijay Reddy',
      description: '30 trees in Harbour Area',
      timeAgo: '2 days ago',
      type: 'unassigned' as const,
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Remove the entire header section */}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard 
          title="Total Trees"
          value="3,248"
          description="+12% from last month"
          icon={<Trees size={20} />}
          color="blue"
        />
        
        <StatCard 
          title="Total Volunteers"
          value="152"
          description="61% completion rate"
          icon={<Users size={20} />}
          color="green"
        />
        
        <StatCard 
          title="Inspection in Progress"
          value="64"
          description="28% of total trees"
          icon={<Clock size={20} />}
          color="orange"
        />
        
        <StatCard 
          title="Overdue Inspection"
          value="32"
          description="13% require attention"
          icon={< TriangleAlert size={20} />}
          color="red"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <DogControlBarChart data={monthlyData} title="Trees vs Volunteers(Monthly)" />
        <DogControlLineChart data={performanceData} title="Monthly Performance" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityTimeline activities={activities} />
        <HeatmapSection />
      </div>
    </div>
  );
};

export default Dashboard;
