"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import ProtectedRoute from "./ProtectedRoute";


export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* <Navbar onMenuClick={() => setSidebarOpen(true)} /> */}
        <main className="flex-1 overflow-y-auto ">{children}</main>
      </div>
    </div>
    </ProtectedRoute>
  );
}
