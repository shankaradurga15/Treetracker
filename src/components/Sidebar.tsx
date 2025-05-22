import React from 'react';
import { ChartNoAxesColumnIncreasing, Trees, ClipboardList, Crown, Users } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  isActive?: boolean;
}

const SidebarItem = ({ icon, label, path, isActive = false }: SidebarItemProps) => {
  return (
    <Link
      to={path}
      className={`flex items-center gap-3 px-4 py-3 text-sm hover:bg-sidebar-accent rounded-md transition-colors ${
        isActive ? 'bg-sidebar-accent' : ''
      }`}
    >
      <div className="text-white">{icon}</div>
      <span className="text-white font-medium">{label}</span>
    </Link>
  );
};

const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="bg-dogControl-primary h-screen w-72 flex flex-col fixed left-0 top-0">
      <div className="h-28 flex flex-col items-center justify-center gap-2">
        <div className="h-20 flex items-center justify-center">
          <img src="/logo-placeholder.png" alt="Logo" className="w-16 h-16 object-contain mt-4" />
        </div>
        <div className="flex flex-col items-center">
          <span className="text-white font-medium text-lg">Tuticorin Municipal</span>
          <span className="text-white text-xs opacity-80">Tree Tracking System</span>
        </div>
      </div>

      <div className="py-4 flex flex-col gap-1 px-2 mt-6">
        <SidebarItem icon={<ChartNoAxesColumnIncreasing size={18} />} label="Dashboard" path="/" isActive={currentPath === '/'} />
        <SidebarItem icon={<Trees size={18} />} label="Trees" path="/trees" isActive={currentPath === '/trees'} />
        <SidebarItem icon={<Users size={18} />} label="Volunteers" path="/volunteer" isActive={currentPath === '/volunteer'} />
        <SidebarItem icon={<ClipboardList size={18} />} label="Inspections" path="/inspection" isActive={currentPath === '/inspection'} />
        <SidebarItem icon={<Users size={18} />} label="Users" path="/reports" isActive={currentPath === '/reports'} />
        <SidebarItem icon={<Crown size={18} />} label="Master" path="/settings" isActive={currentPath === '/settings'} />
      </div>
    </div>
  );
};

export default Sidebar;
