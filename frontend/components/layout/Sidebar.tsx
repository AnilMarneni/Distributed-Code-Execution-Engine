"use client";

import React from 'react';
import { Files, History, TestTube2, Database } from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="w-14 border-r border-border bg-bg-surface flex flex-col items-center py-4 space-y-6">
      <SidebarItem icon={<Files size={22} />} active label="Files" />
      <SidebarItem icon={<History size={22} />} label="History" />
      <SidebarItem icon={<TestTube2 size={22} />} label="Tests" />
      <div className="flex-1" />
      <SidebarItem icon={<Database size={22} />} label="Engine Status" />
    </aside>
  );
};

const SidebarItem = ({ icon, active = false, label }: { icon: React.ReactNode, active?: boolean, label: string }) => (
  <div className={`relative group cursor-pointer p-2 rounded-lg transition-all ${active ? 'text-accent bg-accent-soft' : 'text-text-muted hover:text-text-primary hover:bg-bg-elevated'}`}>
    {icon}
    <div className="absolute left-16 px-2 py-1 bg-bg-elevated border border-border text-text-primary text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
      {label}
    </div>
    {active && <div className="absolute right-0 top-2 bottom-2 w-[3px] bg-accent rounded-l-full" />}
  </div>
);

export default Sidebar;
