'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ClassQRCode from '@/components/ClassQRCode';
import Image from 'next/image';

interface Student {
  name: string;
  photoUrl: string;
}

interface JoinRequest {
  id: string;
  name: string;
  photoUrl: string;
}

export default function ClassPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [classData, setClassData] = useState<any>(null);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) {
        router.push('/login');
        return;
      }

      try {
        const classDoc = await getDoc(doc(db, 'classes', params.id));
        if (classDoc.exists()) {
          setClassData({ id: classDoc.id, ...classDoc.data() });
          await fetchJoinRequests();
        } else {
          setError('Class not found');
        }
      } catch (err) {
        console.error('Error fetching class:', err);
        setError('Error fetching class data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, router]);

  const fetchJoinRequests = async () => {
    const q = query(collection(db, 'joinRequests'), where('classId', '==', params.id));
    const querySnapshot = await getDocs(q);
    setJoinRequests(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JoinRequest)));
  };

  const handleApproveRequest = async (request: JoinRequest) => {
    try {
      // Add student to class
      await updateDoc(doc(db, 'classes', params.id), {
        students: arrayUnion({ name: request.name, photoUrl: request.photoUrl })
      });

      // Delete join request
      await deleteDoc(doc(db, 'joinRequests', request.id));

      // Update local state
      setClassData({
        ...classData,
        students: [...(classData.students || []), { name: request.name, photoUrl: request.photoUrl }]
      });
      setJoinRequests(joinRequests.filter(r => r.id !== request.id));
    } catch (err) {
      console.error('Error approving join request:', err);
      setError('Failed to approve join request');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!classData) return <div>Class not found</div>;

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">{classData.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Students</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {classData.students && classData.students.length > 0 ? (
                classData.students.map((student: Student, index: number) => (
                  <div key={index} className="flex flex-col items-center">
                    <Image
                      src={student.photoUrl}
                      alt={student.name}
                      width={100}
                      height={100}
                      className="rounded-full object-cover"
                    />
                    <p className="mt-2 text-center">{student.name}</p>
                  </div>
                ))
              ) : (
                <p>No students added yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Class QR Code</h2>
          </CardHeader>
          <CardContent>
            <ClassQRCode classId={params.id} />
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <h2 className="text-xl font-semibold">Join Requests</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {joinRequests.length > 0 ? (
                joinRequests.map((request) => (
                  <div key={request.id} className="flex flex-col items-center border p-4 rounded-lg">
                    <Image
                      src={request.photoUrl}
                      alt={request.name}
                      width={100}
                      height={100}
                      className="rounded-full object-cover mb-2"
                    />
                    <p className="text-center mb-2">{request.name}</p>
                    <Button onClick={() => handleApproveRequest(request)}>Approve</Button>
                  </div>
                ))
              ) : (
                <p>No pending join requests.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}