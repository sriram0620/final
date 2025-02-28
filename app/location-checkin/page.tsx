import EnhancedAttendanceActions from '@/components/EnhancedAttendanceActions';
import { Card } from '@/components/ui/modernCard';
import { MapPin, Clock, Shield, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function LocationCheckinPage() {
  // In a real application, this would come from authentication
  const demoUserId = 'demo.user@example.com';
  
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-8">
            <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground mr-4">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-bold">
              Location-Aware Check-In/Out
            </h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2">
              <EnhancedAttendanceActions userId={demoUserId} />
            </div>
            
            <div className="space-y-4">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-blue-100 dark:border-blue-900">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
                    <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-lg">Geofence Detection</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  The system automatically detects when you enter or exit the defined geofence area using precise GPS coordinates.
                </p>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-green-100 dark:border-green-900">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-3">
                    <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-semibold text-lg">Accurate Timestamps</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  All check-in and check-out events are recorded with precise timestamps for accurate attendance tracking.
                </p>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/50 dark:to-violet-950/50 border-purple-100 dark:border-purple-900">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mr-3">
                    <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-lg">Data Security</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  All attendance data is securely stored in the database with proper validation and error handling.
                </p>
              </Card>
            </div>
          </div>
          
          <Card className="w-full">
            <h2 className="text-xl font-bold mb-4">How It Works</h2>
            <ol className="list-decimal pl-5 space-y-3 mb-4">
              <li className="text-sm">
                <span className="font-medium">Location Tracking:</span> The system tracks your location in real-time using your device's GPS.
              </li>
              <li className="text-sm">
                <span className="font-medium">Geofence Detection:</span> When you enter a geofence, the "Check In" button becomes available.
              </li>
              <li className="text-sm">
                <span className="font-medium">Check-in Process:</span> After checking in, your attendance record is created in the database.
              </li>
              <li className="text-sm">
                <span className="font-medium">Status Change:</span> The button changes to "Check Out" when you're checked in.
              </li>
              <li className="text-sm">
                <span className="font-medium">Check-out Process:</span> When you check out, your attendance record is updated with the checkout time.
              </li>
              <li className="text-sm">
                <span className="font-medium">Validation:</span> The system prevents multiple check-ins and validates your location.
              </li>
              <li className="text-sm">
                <span className="font-medium">Data Storage:</span> All attendance data is securely stored in the database.
              </li>
            </ol>
            <p className="text-sm text-muted-foreground">
              Note: For this demo, your location is tracked only while the page is open and is not stored permanently unless you explicitly check in or out.
            </p>
          </Card>
        </div>
      </div>
    </main>
  );
}