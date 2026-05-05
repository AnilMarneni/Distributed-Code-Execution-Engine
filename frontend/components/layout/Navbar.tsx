"use client";

import React from 'react';
import { Play, Settings, Cpu, ChevronDown, Loader2 } from 'lucide-react';

interface NavbarProps {
  onRun: () => void;
  isRunning: boolean;
  language: string;
  onLanguageChange: (lang: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onRun, isRunning, language, onLanguageChange }) => {
  return (
    <nav className="h-14 border-b border-border bg-bg-surface flex items-center justify-between px-4 z-50">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-accent rounded-md flex items-center justify-center text-white">
            <Cpu size={20} />
          </div>
          <span className="font-bold text-lg tracking-tight">ENGINE<span className="text-accent">.IO</span></span>
        </div>
        
        <div className="h-6 w-[1px] bg-border mx-2" />
        
        <div className="flex items-center space-x-1 px-3 py-1.5 rounded-md hover:bg-bg-elevated cursor-pointer transition-colors border border-transparent hover:border-border">
          <span className="text-sm font-medium text-text-secondary">Language:</span>
          <span className="text-sm font-bold text-text-primary ml-1 uppercase">{language}</span>
          <ChevronDown size={14} className="text-text-muted ml-1" />
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <button 
          onClick={onRun}
          disabled={isRunning}
          className="flex items-center space-x-2 bg-accent hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-md transition-all active:scale-95 font-semibold text-sm shadow-lg shadow-blue-500/20"
        >
          {isRunning ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} fill="currentColor" />}
          <span>{isRunning ? 'Executing...' : 'Run Code'}</span>
        </button>
        
        <div className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-bg-elevated text-text-secondary cursor-pointer transition-colors border border-border">
          <Settings size={18} />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
