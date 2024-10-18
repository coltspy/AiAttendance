'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, LogOut, Plus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
  const [newClassName, setNewClassName] = useState('');

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

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    // Add your class creation logic here
    console.log('Creating class:', newClassName);
    setNewClassName('');
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <h2 className="text-xl font-semibold">User Profile</h2>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={user.photoURL || undefined} />
              <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <p className="text-lg font-medium">{user.displayName || 'Teacher'}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <h2 className="text-xl font-semibold">Create New Class</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label htmlFor="className" className="block text-sm font-medium text-gray-700">
                  Class Name
                </label>
                <Input
                  type="text"
                  id="className"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="Enter class name"
                  className="mt-1"
                />
              </div>
              <Button type="submit" className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Create Class
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <h2 className="text-xl font-semibold">Your Classes</h2>
          </CardHeader>
          <CardContent>
            {classes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classes.map((cls) => (
                  <Card key={cls.id} className="flex flex-col">
                    <CardHeader>
                      <h3 className="text-lg font-semibold">{cls.name}</h3>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Created on: {new Date(cls.createdAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                    <CardFooter className="mt-auto">
                      <Button variant="outline" asChild className="w-full">
                        <Link href={`/class/${cls.id}`}>View Class</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">No classes created yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}