"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/modernCard';
import { ShoppingCart, Package, Truck, CreditCard, Plus, Minus, Check, AlertCircle, Loader2 } from 'lucide-react';

type TestItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export default function EnhancedTestCheckout() {
  const [userId, setUserId] = useState<string>('TEST_USER_123');
  const [location, setLocation] = useState<string>('Test Location');
  const [items, setItems] = useState<TestItem[]>([
    { id: 'item1', name: 'Test Product 1', price: 19.99, quantity: 1 },
    { id: 'item2', name: 'Test Product 2', price: 29.99, quantity: 2 }
  ]);
  const [shipping, setShipping] = useState({
    name: 'Test User',
    address: '123 Test Street',
    city: 'Test City',
    state: 'TS',
    zip: '12345',
    country: 'Test Country'
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<number>(1);

  const handleAddItem = () => {
    const newId = `item${items.length + 1}`;
    setItems([...items, { id: newId, name: `Test Product ${items.length + 1}`, price: 9.99, quantity: 1 }]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleItemChange = (id: string, field: keyof TestItem, value: any) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: field === 'price' || field === 'quantity' ? Number(value) : value } : item
    ));
  };

  const handleShippingChange = (field: string, value: string) => {
    setShipping({ ...shipping, [field]: value });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/attendance/test-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          location,
          items: items.map(item => item.name),
          quantities: items.map(item => item.quantity),
          prices: items.map(item => item.price),
          shipping,
          isTest: true
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data);
        setActiveStep(4); // Move to confirmation step
      } else {
        setError(data.message || 'Failed to process test checkout');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during test checkout');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
  };

  const nextStep = () => {
    if (activeStep < 4) {
      setActiveStep(activeStep + 1);
    }
  };

  const prevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <div className="border-b pb-4 mb-6">
        <h2 className="text-xl font-bold flex items-center">
          <ShoppingCart className="mr-2 text-primary" />
          Test Checkout Transaction
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Create test transactions for system validation</p>
      </div>
      
      {error && (
        <div className="p-4 mb-6 bg-destructive/10 text-destructive rounded-md flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      
      {result && (
        <div className="p-4 mb-6 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-md">
          <div className="flex items-center mb-2">
            <Check className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
            <p className="font-semibold">Test checkout successful!</p>
          </div>
          <div className="text-sm space-y-1">
            <p>Transaction ID: <span className="font-mono">{result.transaction?.id}</span></p>
            <p>Attendance ID: <span className="font-mono">{result.data?.id}</span></p>
            <p>Total Amount: ${result.transaction?.total_amount.toFixed(2)}</p>
          </div>
        </div>
      )}
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2">
            {[1, 2, 3, 4].map(step => (
              <div 
                key={step}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step === activeStep 
                    ? 'bg-primary text-primary-foreground' 
                    : step < activeStep 
                      ? 'bg-primary/20 text-primary' 
                      : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {step}
              </div>
            ))}
          </div>
          <div className="text-sm text-muted-foreground">
            {activeStep === 1 && 'User Information'}
            {activeStep === 2 && 'Items Selection'}
            {activeStep === 3 && 'Shipping Details'}
            {activeStep === 4 && 'Confirmation'}
          </div>
        </div>
      </div>
      
      {activeStep === 1 && (
        <div className="space-y-4 mb-6">
          <div className="bg-secondary/30 p-4 rounded-md">
            <label className="block text-sm font-medium mb-2">
              Test User ID
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full p-2 border rounded-md bg-background"
              placeholder="TEST_USER_123"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use a prefix like TEST_ to easily identify test users
            </p>
          </div>
          
          <div className="bg-secondary/30 p-4 rounded-md">
            <label className="block text-sm font-medium mb-2">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2 border rounded-md bg-background"
              placeholder="Test Location"
            />
          </div>
        </div>
      )}
      
      {activeStep === 2 && (
        <div className="space-y-4 mb-6">
          <div className="bg-secondary/30 p-4 rounded-md">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium">
                <Package className="inline-block w-4 h-4 mr-1" />
                Items
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </button>
            </div>
            
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex space-x-2 items-center bg-background p-2 rounded-md">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                    className="flex-grow p-2 border rounded-md"
                    placeholder="Item name"
                  />
                  <div className="flex items-center w-24">
                    <span className="text-muted-foreground mr-1">$</span>
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
                      className="w-full p-2 border rounded-md"
                      placeholder="Price"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div className="flex items-center space-x-1 w-20">
                    <button 
                      className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center"
                      onClick={() => handleItemChange(item.id, 'quantity', Math.max(1, item.quantity - 1))}
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                      className="w-10 p-1 text-center border rounded-md"
                      min="1"
                    />
                    <button 
                      className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center"
                      onClick={() => handleItemChange(item.id, 'quantity', item.quantity + 1)}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-destructive p-1 rounded-full hover:bg-destructive/10"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end mt-4">
              <div className="bg-primary/5 px-4 py-2 rounded-md">
                <span className="text-sm text-muted-foreground">Total:</span>
                <span className="ml-2 font-semibold">${calculateTotal()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeStep === 3 && (
        <div className="space-y-4 mb-6">
          <div className="bg-secondary/30 p-4 rounded-md">
            <div className="flex items-center mb-3">
              <Truck className="w-5 h-5 mr-2 text-primary" />
              <label className="block text-sm font-medium">
                Shipping Details
              </label>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs text-muted-foreground mb-1">Name</label>
                <input
                  type="text"
                  value={shipping.name}
                  onChange={(e) => handleShippingChange('name', e.target.value)}
                  className="w-full p-2 border rounded-md bg-background"
                  placeholder="Name"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-muted-foreground mb-1">Address</label>
                <input
                  type="text"
                  value={shipping.address}
                  onChange={(e) => handleShippingChange('address', e.target.value)}
                  className="w-full p-2 border rounded-md bg-background"
                  placeholder="Address"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">City</label>
                <input
                  type="text"
                  value={shipping.city}
                  onChange={(e) => handleShippingChange('city', e.target.value)}
                  className="w-full p-2 border rounded-md bg-background"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">State</label>
                <input
                  type="text"
                  value={shipping.state}
                  onChange={(e) => handleShippingChange('state', e.target.value)}
                  className="w-full p-2 border rounded-md bg-background"
                  placeholder="State"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">ZIP</label>
                <input
                  type="text"
                  value={shipping.zip}
                  onChange={(e) => handleShippingChange('zip', e.target.value)}
                  className="w-full p-2 border rounded-md bg-background"
                  placeholder="ZIP"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Country</label>
                <input
                  type="text"
                  value={shipping.country}
                  onChange={(e) => handleShippingChange('country', e.target.value)}
                  className="w-full p-2 border rounded-md bg-background"
                  placeholder="Country"
                />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeStep === 4 && (
        <div className="space-y-4 mb-6">
          <div className="bg-secondary/30 p-4 rounded-md">
            <h3 className="font-medium mb-3 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-primary" />
              Order Summary
            </h3>
            
            <div className="space-y-4">
              <div className="bg-background p-3 rounded-md">
                <p className="text-sm font-medium mb-2">User Information</p>
                <p className="text-sm">User ID: <span className="font-mono">{userId}</span></p>
                <p className="text-sm">Location: {location}</p>
              </div>
              
              <div className="bg-background p-3 rounded-md">
                <p className="text-sm font-medium mb-2">Items</p>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.name} × {item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2 flex justify-between font-medium">
                    <span>Total</span>
                    <span>${calculateTotal()}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-background p-3 rounded-md">
                <p className="text-sm font-medium mb-2">Shipping Address</p>
                <p className="text-sm">{shipping.name}</p>
                <p className="text-sm">{shipping.address}</p>
                <p className="text-sm">{shipping.city}, {shipping.state} {shipping.zip}</p>
                <p className="text-sm">{shipping.country}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-between">
        {activeStep > 1 ? (
          <button
            type="button"
            onClick={prevStep}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md"
          >
            Back
          </button>
        ) : (
          <div></div>
        )}
        
        {activeStep < 4 ? (
          <button
            type="button"
            onClick={nextStep}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md flex items-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Complete Test Checkout
              </>
            )}
          </button>
        )}
      </div>
    </Card>
  );
}