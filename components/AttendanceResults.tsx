import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface AttendanceResultsProps {
  results: { [key: string]: string };
  students: { name: string; photoUrl: string }[];
  onConfirm: () => void;
}

export default function AttendanceResults({ results, students, onConfirm }: AttendanceResultsProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Attendance Results</h2>
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">Students</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {students.map((student, index) => (
              <div key={index} className="flex flex-col items-center">
                <Image
                  src={student.photoUrl}
                  alt={student.name}
                  width={100}
                  height={100}
                  className="rounded-full object-cover"
                />
                <p className="mt-2 text-center">{student.name}</p>
                <p className={`text-sm ${results[student.name] === 'present' ? 'text-green-500' : 'text-red-500'}`}>
                  {results[student.name]}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Button onClick={onConfirm} className="mt-4">Confirm Attendance</Button>
    </div>
  );
}