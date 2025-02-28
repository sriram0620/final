import EnhancedGeofenceMonitor from '@/components/EnhancedGeofenceMonitor';
import { Card } from '@/components/ui/modernCard';
import { MapPin, Clock, ArrowRight, Box } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  // Using a simple user ID for demo purposes
  const demoUserId = 'demo.user@example.com';
  
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">
              Geofence Monitoring System
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Real-time location tracking and attendance management with precise geofencing technology
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="col-span-2">
              <EnhancedGeofenceMonitor userId={demoUserId} />
            </Card>
            
            <div className="space-y-4">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-blue-100 dark:border-blue-900">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
                    <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-lg">Location Tracking</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Precise GPS tracking with Haversine distance calculation for accurate geofence detection.
                </p>
                <Link href="/location-checkin" className="text-sm text-blue-600 dark:text-blue-400 flex items-center hover:underline">
                  Try location check-in
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-green-100 dark:border-green-900">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-3">
                    <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-semibold text-lg">Attendance Tracking</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Automatic check-in/out detection with detailed time tracking and attendance history.
                </p>
                <Link href="/test-checkout" className="text-sm text-green-600 dark:text-green-400 flex items-center hover:underline">
                  Try test checkout
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/50 dark:to-violet-950/50 border-purple-100 dark:border-purple-900">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mr-3">
                    <Box className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-lg">3D Dashboard</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Interactive 3D visualization of attendance data with real-time updates.
                </p>
                <Link href="/3d-dashboard" className="text-sm text-purple-600 dark:text-purple-400 flex items-center hover:underline">
                  View 3D dashboard
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Card>
            </div>
          </div>
          
          <Card className="w-full">
            <h2 className="text-xl font-bold mb-4">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-secondary/30 p-4 rounded-md">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <span className="font-semibold">1</span>
                </div>
                <h3 className="font-medium mb-2">Real-time Location Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  The system tracks your location using your device's GPS and calculates your distance from the center point (12.835239990526295, 80.13544605129297).
                </p>
              </div>
              
              <div className="bg-secondary/30 p-4 rounded-md">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <span className="font-semibold">2</span>
                </div>
                <h3 className="font-medium mb-2">Geofence Detection</h3>
                <p className="text-sm text-muted-foreground">
                  When you enter the 200-meter radius geofence, a check-in event is recorded. When you exit, a check-out event is recorded.
                </p>
              </div>
              
              <div className="bg-secondary/30 p-4 rounded-md">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <span className="font-semibold">3</span>
                </div>
                <h3 className="font-medium mb-2">Time Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  The system maintains a history of all your entries and exits, and calculates total time spent inside the geofence automatically.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}