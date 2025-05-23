"use client"

import type React from "react"
import { useLocation } from "react-router-dom"

const routeTitles: { [key: string]: string } = {
  "/": "Dashboard",
  "/trees": "Trees Management",
  "/volunteer": "Volunteers Management",
  "/inspection": "Inspections Management",
  "/users": "Users Management",
  "/master": "Master Settings",
}

// Updated Toggle Icon Component that shows different states based on sidebar open/close
const ToggleIcon: React.FC<{ isOpen: boolean }> = ({ isOpen }) => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-green-900">
      {/* Outer rectangle */}
      <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
      
      {/* Vertical divider line */}
      <line x1="12" y1="4" x2="12" y2="20" stroke="currentColor" strokeWidth="2" />
      
      {/* Left column - filled when sidebar is open */}
      <rect 
        x="4.5" 
        y="4.5" 
        width="7" 
        height="15" 
        rx="1.5" 
        fill={isOpen ? "currentColor" : "none"}
        opacity={isOpen ? "0.3" : "0"}
        className="transition-all duration-300"
      />
      
      {/* Right column - filled when sidebar is closed */}
      <rect 
        x="12.5" 
        y="4.5" 
        width="7" 
        height="15" 
        rx="1.5" 
        fill={!isOpen ? "currentColor" : "none"}
        opacity={!isOpen ? "0.3" : "0"}
        className="transition-all duration-300"
      />
    </svg>
  )
}

interface HeaderProps {
  onToggleSidebar: () => void
  isSidebarOpen: boolean
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const location = useLocation()
  const pageTitle = routeTitles[location.pathname] || "Tuticorin Tree Tracking System"

  return (
    <div
      className={`h-16 flex items-center justify-between px-6 bg-white shadow-sm border-b border-gray-200 fixed top-0 ${isSidebarOpen ? "left-72" : "left-16"} right-0 z-50 transition-all duration-300`}
    >
      <div className="flex items-center">
        <button 
          onClick={onToggleSidebar} 
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
          title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
        >
          <ToggleIcon isOpen={isSidebarOpen} />
        </button>
        <div className="flex flex-col ml-6">
          <h1 className="text-lg font-semibold text-gray-800">{pageTitle}</h1>
          <span className="text-xs text-gray-500">Welcome to {pageTitle}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <img src="/logo-placeholder.png" alt="Profile" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header