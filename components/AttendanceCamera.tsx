'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import Webcam from 'react-webcam';
import { Camera, X } from 'lucide-react';

interface Student {
  name: string;
  photoUrl: string;
}

interface AttendanceCameraProps {
  students: Student[];
  onComplete: (results: { [key: string]: string }) => void;
  onClose: () => void;
}

export default function AttendanceCamera({ students, onComplete, onClose }: AttendanceCameraProps) {
  const webcamRef = useRef<Webcam>(null);
  const [processing, setProcessing] = useState(false);

  const capture = async () => {
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
            students: students
          }),
        });

        const results = await response.json();
        onComplete(results);
      } catch (error) {
        console.error('Error recognizing faces:', error);
      } finally {
        setProcessing(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      <div className="bg-gray-800 p-4 flex justify-between items-center">
        <Button variant="ghost" onClick={onClose} className="text-white">
          <X className="h-6 w-6 mr-2" />
          Close
        </Button>
        <Button onClick={capture} disabled={processing} className="bg-blue-500 hover:bg-blue-600">
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
  );
}