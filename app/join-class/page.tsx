'use client';

import React, { useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Camera } from 'lucide-react';

export default function JoinClassPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const classId = searchParams.get('classId');
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!classId) {
      setError('Invalid join link');
      setLoading(false);
      return;
    }

    if (!name.trim() || !photo) {
      setError('Please provide both your name and photo');
      setLoading(false);
      return;
    }

    try {
      console.log('Starting file upload process');
      
      const timestamp = Date.now();
      const fileName = `${timestamp}-${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${photo.name.split('.').pop()}`;
      console.log('Generated file name:', fileName);

      const storageRef = ref(storage, `student-photos/${classId}/${fileName}`);
      console.log('Storage reference created');

      console.log('Uploading file...');
      const uploadResult = await uploadBytes(storageRef, photo);
      console.log('File uploaded successfully', uploadResult);

      console.log('Getting download URL...');
      const photoUrl = await getDownloadURL(uploadResult.ref);
      console.log('Download URL obtained:', photoUrl);

      console.log('Adding join request to Firestore...');
      await addDoc(collection(db, 'joinRequests'), {
        classId,
        name: name.trim(),
        photoUrl
      });
      console.log('Join request added to Firestore');

      alert('Join request submitted successfully! Waiting for teacher approval.');
      router.push('/');
    } catch (err) {
      console.error('Detailed error in join request submission:', err);
      if (err instanceof Error) {
        setError(`Failed to submit join request: ${err.message}`);
      } else {
        setError('An unknown error occurred while submitting the join request');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-bold">Join Class</h1>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoinClass} className="space-y-4">
            <div>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                required
              />
            </div>
            <div className="flex flex-col items-center">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-32 h-32 object-cover rounded-full mb-2" />
              ) : (
                <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                  <Camera size={48} />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                capture="user"
                onChange={handlePhotoChange}
                className="hidden"
                ref={fileInputRef}
              />
              <Button type="button" onClick={() => fileInputRef.current?.click()}>
                {photo ? 'Change Photo' : 'Take Photo'}
              </Button>
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Join Request'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}