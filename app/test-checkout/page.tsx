import EnhancedTestCheckout from '@/components/EnhancedTestCheckout';
import { Card } from '@/components/ui/modernCard';
import { Beaker, ShieldCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TestCheckoutPage() {
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
              Test Checkout System
            </h1>
          </div>
          
          <EnhancedTestCheckout />
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="w-full">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center mr-3">
                  <Beaker className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <h2 className="text-xl font-bold">About Test Checkouts</h2>
              </div>
              
              <p className="mb-4 text-sm">
                This page allows you to create test checkout transactions that are clearly marked in the database.
                These test transactions can be used for:
              </p>
              
              <ul className="list-disc pl-5 space-y-2 mb-4 text-sm">
                <li>Testing the checkout flow without affecting real data</li>
                <li>Verifying database persistence and retrieval</li>
                <li>Simulating various checkout scenarios</li>
                <li>Training new staff on the system</li>
              </ul>
            </Card>
            
            <Card className="w-full">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-3">
                  <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-bold">Data Safety</h2>
              </div>
              
              <p className="mb-4 text-sm">
                All test transactions are designed with data safety in mind:
              </p>
              
              <ul className="list-disc pl-5 space-y-2 mb-4 text-sm">
                <li>All test transactions are flagged with <code className="bg-secondary px-1 py-0.5 rounded text-xs">is_test: true</code></li>
                <li>Test user IDs should start with "TEST_" to make them easily identifiable</li>
                <li>Test data can be easily filtered out from real transactions</li>
                <li>The system maintains data integrity by creating proper relationships between attendance and transaction records</li>
              </ul>
              
              <p className="text-xs text-muted-foreground border-t pt-3 mt-3">
                Note: For testing purposes, if no active check-in is found for a test user, the system will automatically create one.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}