'use client';

import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';

export default function ClassQRCode({ classId }: { classId: string }) {
  const [qrCodeData, setQRCodeData] = useState<string | null>(null);

  useEffect(() => {
    const fetchClassData = async () => {
      const classRef = doc(db, 'classes', classId);
      const classDoc = await getDoc(classRef);
      
      if (classDoc.exists()) {
        setQRCodeData(classId);
      } else {
        console.error('Class not found');
      }
    };

    fetchClassData();
  }, [classId]);

  const getJoinURL = (id: string) => {
    return `${window.location.origin}/join-class?classId=${id}`;
  };

  if (!qrCodeData) return <div>Loading QR Code...</div>;

  return (
    <div className="flex flex-col items-center">
      <QRCodeSVG value={getJoinURL(qrCodeData)} size={200} />
      <Button className="mt-4" onClick={() => navigator.clipboard.writeText(getJoinURL(qrCodeData))}>
        Copy Join URL
      </Button>
    </div>
  );
}