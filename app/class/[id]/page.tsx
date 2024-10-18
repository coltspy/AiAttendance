import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ClassQRCode from '@/components/ClassQRCode';
import Image from 'next/image';
import Webcam from 'react-webcam';
import { Camera, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Student {
  name: string;
  photoUrl: string;
  status: 'absent' | 'present';
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
  const [showCamera, setShowCamera] = useState(false);
  const [processing, setProcessing] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) {
        router.push('/login');
        return;
      }

      try {
        const classDoc = await getDoc(doc(db, 'classes', params.id));
        if (classDoc.exists()) {
          const data = classDoc.data();
          const studentsWithStatus = data.students.map((student: Student) => ({
            ...student,
            status: student.status || 'absent'
          }));
          setClassData({ id: classDoc.id, ...data, students: studentsWithStatus });
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
      await updateDoc(doc(db, 'classes', params.id), {
        students: arrayUnion({ name: request.name, photoUrl: request.photoUrl, status: 'absent' })
      });
      await deleteDoc(doc(db, 'joinRequests', request.id));
      setClassData({
        ...classData,
        students: [...classData.students, { name: request.name, photoUrl: request.photoUrl, status: 'absent' }]
      });
      setJoinRequests(joinRequests.filter(r => r.id !== request.id));
    } catch (err) {
      console.error('Error approving join request:', err);
      setError('Failed to approve join request');
    }
  };
  const startAttendance = () => {
    setShowCamera(true);
  };

  const closeCamera = () => {
    setShowCamera(false);
  };

  const captureAttendance = async () => {
    if (webcamRef.current) {
      setProcessing(true);
      const imageSrc = webcamRef.current.getScreenshot();
      
      try {
        const response = await fetch('/api/recognize-faces', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            attendanceImage: imageSrc,
            students: classData.students
          }),
        });

        const results = await response.json();
        
        // Update student statuses
        const updatedStudents = classData.students.map((student: Student) => ({
          ...student,
          status: results[student.name] || 'absent'
        }));

        setClassData({ ...classData, students: updatedStudents });

        // Update Firestore
        await updateDoc(doc(db, 'classes', params.id), { students: updatedStudents });

        setShowCamera(false);
      } catch (error) {
        console.error('Error recognizing faces:', error);
        setError('Failed to process attendance');
      } finally {
        setProcessing(false);
      }
    }
  };
  const sortStudents = (students: Student[]) => {
    return [...students].sort((a, b) => {
      if (a.status === 'absent' && b.status === 'present') return -1;
      if (a.status === 'present' && b.status === 'absent') return 1;
      return 0;
    });
  };

  const resetAttendance = async () => {
    const updatedStudents = classData.students.map((student: Student) => ({
      ...student,
      status: 'absent'
    }));
    setClassData({ ...classData, students: updatedStudents });
    await updateDoc(doc(db, 'classes', params.id), { students: updatedStudents });
  };

  const updateStudentStatus = async (studentName: string, newStatus: 'absent' | 'present') => {
    const updatedStudents = classData.students.map((student: Student) =>
      student.name === studentName ? { ...student, status: newStatus } : student
    );
    setClassData({ ...classData, students: updatedStudents });
    await updateDoc(doc(db, 'classes', params.id), { students: updatedStudents });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!classData) return <div>Class not found</div>;

  const sortedStudents = sortStudents(classData.students);

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{classData.name}</h1>
        <div className="space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">QR Code</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Class QR Code</DialogTitle>
              </DialogHeader>
              <ClassQRCode classId={params.id} />
            </DialogContent>
          </Dialog>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Join Requests ({joinRequests.length})</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Join Requests</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {joinRequests.length > 0 ? (
                  joinRequests.map((request) => (
                    <Card key={request.id}>
                      <CardContent className="flex items-center space-x-4 p-4">
                        <Image
                          src={request.photoUrl}
                          alt={request.name}
                          width={50}
                          height={50}
                          className="rounded-md object-cover"
                        />
                        <div>
                          <p>{request.name}</p>
                          <Button onClick={() => handleApproveRequest(request)} size="sm">Approve</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p>No pending join requests.</p>
                )}
              </div>
            </DialogContent>
          </Dialog>
          
          <Button onClick={startAttendance}>Take Attendance</Button>
          <Button onClick={resetAttendance} variant="destructive">Reset Attendance</Button>
        </div>
      </div>

      {showCamera && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="bg-gray-800 p-4 flex justify-between items-center">
            <Button variant="ghost" onClick={closeCamera} className="text-white">
              <X className="h-6 w-6 mr-2" />
              Close
            </Button>
            <Button onClick={captureAttendance} disabled={processing} className="bg-blue-500 hover:bg-blue-600">
              <Camera className="h-6 w-6 mr-2" />
              {processing ? 'Processing...' : 'Capture Attendance'}
            </Button>
          </div>
          <div className="flex-grow flex items-center justify-center">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full h-auto"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {sortedStudents.length > 0 ? (
          sortedStudents.map((student: Student, index: number) => (
            <Card key={index} className={student.status === 'absent' ? 'border-red-500' : 'border-green-500'}>
              <CardContent className="p-4 flex flex-col items-center">
                <Image
                  src={student.photoUrl}
                  alt={student.name}
                  width={80}
                  height={80}
                  className="rounded-md object-cover mb-2"
                />
                <p className="text-center text-sm font-medium">{student.name}</p>
                <Button 
                  size="sm" 
                  variant={student.status === 'absent' ? 'destructive' : 'default'}
                  onClick={() => updateStudentStatus(student.name, student.status === 'absent' ? 'present' : 'absent')}
                  className="mt-2"
                >
                  {student.status === 'absent' ? 'Absent' : 'Present'}
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <p>No students added yet.</p>
        )}
      </div>
    </div>
  );
}