"use client";
import { useRouter } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 p-4 text-center">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-10 bg-indigo-500"
            style={{
              width: Math.floor(Math.random() * 200) + 100 + 'px',
              height: Math.floor(Math.random() * 200) + 100 + 'px',
              top: Math.floor(Math.random() * 100) + '%',
              left: Math.floor(Math.random() * 100) + '%',
              animation: `float ${Math.floor(Math.random() * 15) + 10}s infinite ease-in-out`,
              animationDelay: `${i * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-2xl">
        {/* Illustration */}
        <div className="relative mb-8 mx-auto w-64 h-64">
          <div className="absolute inset-0 bg-indigo-100 rounded-full flex items-center justify-center">
            <svg className="w-40 h-40 text-indigo-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M13 2L3 14h6l-1 8 10-12h-6l1-8z" />
            </svg>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-red-100 rounded-full w-24 h-24 flex items-center justify-center">
            <span className="text-4xl font-bold text-red-500">404</span>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-indigo-800 mb-4">Route Not Found</h1>
        <p className="text-lg text-gray-700 mb-8 max-w-md mx-auto">
          The destination you're looking for doesn't exist in our system. 
          It might have been moved, deleted, or you may have taken a wrong turn.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium shadow-md"
          >
            <FiArrowLeft /> Go Back
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
      `}</style>
    </div>
  );
}