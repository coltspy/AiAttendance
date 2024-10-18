import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Welcome to Our Attendance System</h1>
      <p className="text-xl mb-8">Effortlessly track and manage attendance with our powerful tools.</p>
      <div className="space-x-4">
        <Link href="/login" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Login
        </Link>
        <Link href="/register" className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          Register
        </Link>
      </div>
    </div>
  );
}