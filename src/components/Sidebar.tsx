import React from 'react';
import { ChartNoAxesColumnIncreasing, Trees, ClipboardList, Crown, Users } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  isActive?: boolean;
  isOpen: boolean;
}

const SidebarItem = ({ icon, label, path, isActive = false, isOpen }: SidebarItemProps) => {
  return (
    <Link
      to={path}
      className={`flex items-center gap-3 px-4 py-3 text-sm hover:bg-sidebar-accent rounded-md transition-colors ${
        isActive ? 'bg-sidebar-accent' : ''
      }`}
      title={!isOpen ? label : ''}
    >
      <div className="text-white flex-shrink-0">{icon}</div>
      {isOpen && <span className="text-white font-medium">{label}</span>}
    </Link>
  );
};

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className={`bg-dogControl-primary min-h-screen flex flex-col fixed left-0 top-0 z-20 transition-all duration-300 ${
      isOpen ? 'w-72' : 'w-16'
    }`}>
      <div className={`${isOpen ? 'h-28' : 'h-20'} flex flex-col items-center justify-center gap-2 transition-all duration-300`}>
        <div className="h-16 flex items-center justify-center">
          <img src="/logo-placeholder.png" alt="Logo" className="w-12 h-12 object-contain" />
        </div>
        {isOpen && (
          <div className="flex flex-col items-center">
            <span className="text-white font-medium text-sm text-center px-2">Tuticorin Municipal</span>
            <span className="text-white text-xs opacity-80">Tree Tracking System</span>
          </div>
        )}
      </div>

      <div className="flex-1 py-4 flex flex-col gap-1 px-2 mt-6 overflow-y-auto">
        <SidebarItem 
          icon={<ChartNoAxesColumnIncreasing size={18} />} 
          label="Dashboard" 
          path="/" 
          isActive={currentPath === '/'} 
          isOpen={isOpen}
        />
        <SidebarItem 
          icon={<Trees size={18} />} 
          label="Trees" 
          path="/trees" 
          isActive={currentPath === '/trees'} 
          isOpen={isOpen}
        />
        <SidebarItem 
          icon={<Users size={18} />} 
          label="Volunteers" 
          path="/volunteer" 
          isActive={currentPath === '/volunteer'} 
          isOpen={isOpen}
        />
        <SidebarItem 
          icon={<ClipboardList size={18} />} 
          label="Inspections" 
          path="/inspection" 
          isActive={currentPath === '/inspection'} 
          isOpen={isOpen}
        />
        <SidebarItem 
          icon={<Users size={18} />} 
          label="Users" 
          path="/users" 
          isActive={currentPath === '/users'} 
          isOpen={isOpen}
        />
        <SidebarItem 
          icon={<Crown size={18} />} 
          label="Master" 
          path="/master" 
          isActive={currentPath === '/master'} 
          isOpen={isOpen}
        />
      </div>
    </div>
  );
};

export default Sidebar;