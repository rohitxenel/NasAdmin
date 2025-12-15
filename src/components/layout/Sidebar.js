"use client";
import React, { useMemo, useState } from "react";
import {
  FiBarChart2,
  FiUsers,
  FiClock,
  FiMessageSquare,
  FiLogOut,
  FiX,
  FiChevronDown,
} from "react-icons/fi";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import {
  FaUserTie,
} from "react-icons/fa";

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const topLinks = [
    { href: "/dashboard", label: "Dashboard", icon: FiBarChart2 },
    { href: "/user-management", label: "User Management", icon: FaUserTie },
    { href: "/job-management", label: "Job Management", icon: FiClock },
  ];



  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const NavItem = ({ href, label, Icon }) => {
    const active = pathname === href;
    return (
      <a
        href={href}
        className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg w-full transition ${active ? "bg-white/10 text-white shadow-md" : "text-indigo-200 hover:bg-white/5"
          }`}
      >
        <Icon className="mr-3 text-lg" />
        {label}
      </a>
    );
  };



  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden ${isOpen ? "block" : "hidden"
          }`}
        onClick={onClose}
      />

      {/* Sidebar panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out
                    lg:static lg:translate-x-0
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-screen flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white text-white">
          {/* Header (fixed height) */}
          <div className="flex items-center h-20 px-4 border-b border-indigo-700 justify-between shrink-0">
            <div className="flex items-center">
              <div className="w-45 h-9 relative flex items-center justify-center text-white font-bold rounded-lg">
                <Image
                  src="/Nas-Logo.svg"
                  alt="Company Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              {/* <span className="ml-3 text-xl font-semibold tracking-tight">Admin</span> */}
            </div>
            <button className="lg:hidden text-white" onClick={onClose}>
              <FiX size={20} />
            </button>
          </div>

          {/* Scrollable nav (takes remaining height) */}
          <nav className="flex-1 overflow-y-auto px-4 py-6 pr-3 space-y-1 scrollbar-thin">
            {topLinks.map(({ href, label, icon }) => (
              <NavItem key={href} href={href} label={label} Icon={icon} />
            ))}



            {/* Keep Help Support just before the bottom gap (always last link) */}
            <div className="pt-2">
              <NavItem href="/help-support" label="Help Support" Icon={FiMessageSquare} />
            </div>

            {/* bottom spacer so last link doesn't hide behind sticky footer */}
            <div className="h-4" />
          </nav>

          {/* Sticky footer (Logout) */}
          {/* <div className="px-4 pb-5 pt-3 border-t border-white/10 bg-gradient-to-b from-gray-900/80 to-gray-900 sticky bottom-0"> */}
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg 
                         border border-white/20 bg-white/10 text-indigo-100 
                         hover:bg-white/20 hover:text-white transition font-medium shadow-sm"
          >
            <FiLogOut className="text-lg" />
            Logout
          </button>
        </div>
        {/* </div> */}
      </aside>
    </>
  );
}
