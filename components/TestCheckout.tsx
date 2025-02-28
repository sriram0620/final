"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/modernCard';

type TestItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export default function TestCheckout() {
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

  return (
    <Card className="w-full max-w-2xl mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">Test Checkout Transaction</h2>
      
      {error && (
        <div className="p-3 mb-4 bg-red-100 text-red-800 rounded-md">
          {error}
        </div>
      )}
      
      {result && (
        <div className="p-3 mb-4 bg-green-100 text-green-800 rounded-md">
          <p className="font-semibold">Test checkout successful!</p>
          <p className="text-sm">Transaction ID: {result.transaction?.id}</p>
          <p className="text-sm">Attendance ID: {result.data?.id}</p>
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Test User ID
          </label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder="TEST_USER_123"
          />
          <p className="text-xs text-gray-500 mt-1">
            Use a prefix like TEST_ to easily identify test users
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full p-2 border rounded-md"
          />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Items
            </label>
            <button
              type="button"
              onClick={handleAddItem}
              className="text-sm bg-blue-50 text-blue-600 px-2 py-1 rounded"
            >
              + Add Item
            </button>
          </div>
          
          {items.map((item) => (
            <div key={item.id} className="flex space-x-2 mb-2">
              <input
                type="text"
                value={item.name}
                onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                className="flex-grow p-2 border rounded-md"
                placeholder="Item name"
              />
              <input
                type="number"
                value={item.price}
                onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
                className="w-24 p-2 border rounded-md"
                placeholder="Price"
                step="0.01"
                min="0"
              />
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                className="w-20 p-2 border rounded-md"
                placeholder="Qty"
                min="1"
              />
              <button
                type="button"
                onClick={() => handleRemoveItem(item.id)}
                className="text-red-500 px-2"
              >
                ×
              </button>
            </div>
          ))}
          
          <div className="text-right font-semibold mt-2">
            Total: ${calculateTotal()}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Shipping Details
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={shipping.name}
              onChange={(e) => handleShippingChange('name', e.target.value)}
              className="p-2 border rounded-md"
              placeholder="Name"
            />
            <input
              type="text"
              value={shipping.address}
              onChange={(e) => handleShippingChange('address', e.target.value)}
              className="p-2 border rounded-md"
              placeholder="Address"
            />
            <input
              type="text"
              value={shipping.city}
              onChange={(e) => handleShippingChange('city', e.target.value)}
              className="p-2 border rounded-md"
              placeholder="City"
            />
            <input
              type="text"
              value={shipping.state}
              onChange={(e) => handleShippingChange('state', e.target.value)}
              className="p-2 border rounded-md"
              placeholder="State"
            />
            <input
              type="text"
              value={shipping.zip}
              onChange={(e) => handleShippingChange('zip', e.target.value)}
              className="p-2 border rounded-md"
              placeholder="ZIP"
            />
            <input
              type="text"
              value={shipping.country}
              onChange={(e) => handleShippingChange('country', e.target.value)}
              className="p-2 border rounded-md"
              placeholder="Country"
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400"
          >
            {loading ? 'Processing...' : 'Process Test Checkout'}
          </button>
        </div>
      </div>
    </Card>
  );
}