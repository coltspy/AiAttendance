'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCheck, AlertTriangle, Clock, FileBarChart } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import AttendanceTrendChart from '@/components/Dashboard/AttendanceTrendChart';
import AttendanceDonutChart from '@/components/Dashboard/AttendanceDonutChart';

interface ClassData {
  id: string;
  name: string;
}

interface AttendanceData {
  present: number;
  absent: number;
  late: number;
  total: number;
}

export default function ReportsPage() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);

  useEffect(() => {
    const fetchClassesAndSetDefault = async () => {
      const classesCollection = collection(db, 'classes');
      const classesSnapshot = await getDocs(classesCollection);
      const classesData = classesSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
      setClasses(classesData);

      if (classesData.length > 0) {
        setSelectedClass(classesData[0].id);
      }
    };

    fetchClassesAndSetDefault();
  }, []);

  useEffect(() => {
    const fetchAttendanceData = async (classId: string) => {
      // Here you would typically fetch real data from Firestore
      // For this example, we'll use dummy data
      
      // Simulating an API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      setAttendanceData({
        present: 25,
        absent: 3,
        late: 2,
        total: 30
      });

      setWeeklyData([
        { date: 'Mon', present: 28, absent: 1, late: 1 },
        { date: 'Tue', present: 27, absent: 2, late: 1 },
        { date: 'Wed', present: 25, absent: 3, late: 2 },
        { date: 'Thu', present: 26, absent: 3, late: 1 },
        { date: 'Fri', present: 25, absent: 3, late: 2 },
      ]);
    };

    if (selectedClass) {
      fetchAttendanceData(selectedClass);
    }
  }, [selectedClass]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Class Reports</h1>
      
      <Select value={selectedClass || ''} onValueChange={setSelectedClass}>
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="Select a class" />
        </SelectTrigger>
        <SelectContent>
          {classes.map((cls) => (
            <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {attendanceData && (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Present</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{attendanceData.present}</div>
                <p className="text-xs text-muted-foreground">
                  {((attendanceData.present / attendanceData.total) * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Absent</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{attendanceData.absent}</div>
                <p className="text-xs text-muted-foreground">
                  {((attendanceData.absent / attendanceData.total) * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Late</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{attendanceData.late}</div>
                <p className="text-xs text-muted-foreground">
                  {((attendanceData.late / attendanceData.total) * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <FileBarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{attendanceData.total}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Attendance Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <AttendanceTrendChart data={weeklyData} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Today's Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <AttendanceDonutChart data={attendanceData} />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}