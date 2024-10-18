'use client';

import React, { useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';

export default function CreateClass() {
  const [className, setClassName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Starting class creation process');
      const user = auth.currentUser;
      if (!user) {
        console.error('No user logged in');
        throw new Error('No user logged in');
      }

      console.log('Current user:', user.uid);

      const classData = {
        name: className,
        teacherId: user.uid,
        createdAt: new Date().toISOString()
      };

      console.log('Attempting to add class to Firestore:', classData);

      const docRef = await addDoc(collection(db, 'classes'), classData);

      console.log('Class created successfully with ID:', docRef.id);

      setClassName('');
      alert('Class created successfully!');
    } catch (error) {
      console.error('Detailed error in class creation:', error);
      if (error instanceof Error) {
        setError(`Failed to create class: ${error.message}`);
      } else {
        setError('Failed to create class due to an unknown error.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">Create New Class</h2>
      </CardHeader>
      <form onSubmit={handleCreateClass}>
        <CardContent>
          <Input
            label="Class Name"
            type="text"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder="Enter class name"
            error={error}
            required
          />
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Class'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}