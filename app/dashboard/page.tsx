'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import CreateClass from '@/components/CreateClass';

interface ClassData {
  id: string;
  name: string;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<ClassData[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (!currentUser) {
        router.push('/login');
      } else {
        fetchClasses(currentUser.uid);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchClasses = async (userId: string) => {
    try {
      const classesRef = collection(db, 'classes');
      const q = query(classesRef, where('teacherId', '==', userId));
      const querySnapshot = await getDocs(q);
      const classesData: ClassData[] = [];
      querySnapshot.forEach((doc) => {
        classesData.push({ id: doc.id, ...doc.data() } as ClassData);
      });
      setClasses(classesData);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const handleLogout = () => {
    auth.signOut().then(() => router.push('/'));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-6">Welcome to your Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-xl font-semibold">User Information</h2>
          </CardHeader>
          <CardContent>
            <p>Email: {user.email}</p>
            <p>User ID: {user.uid}</p>
          </CardContent>
        </Card>

        <CreateClass />

        <Card className="mb-6 md:col-span-2">
          <CardHeader>
            <h2 className="text-xl font-semibold">Your Classes</h2>
          </CardHeader>
          <CardContent>
            {classes.length > 0 ? (
              <ul>
                {classes.map((cls) => (
                  <li key={cls.id} className="mb-2">
                    <Link href={`/class/${cls.id}`} className="text-blue-600 hover:underline">
                      {cls.name}
                    </Link>
                    {' - Created on: '}{new Date(cls.createdAt).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No classes created yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Button variant="destructive" onClick={handleLogout}>
        Logout
      </Button>
    </div>
  );
}