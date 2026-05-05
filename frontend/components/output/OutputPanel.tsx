"use client";

import React from 'react';
import { Terminal, CheckCircle2, XCircle, Clock, Database } from 'lucide-react';

const OutputPanel = () => {
  return (
    <div className="w-[400px] border-l border-border bg-bg-surface flex flex-col overflow-hidden">
      <div className="h-10 border-b border-border px-4 flex items-center justify-between bg-bg-base/50">
        <div className="flex items-center space-x-2 text-text-secondary text-xs font-bold tracking-wider uppercase">
          <Terminal size={14} />
          <span>Output & Results</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Placeholder for no execution */}
        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
          <div className="p-4 rounded-full bg-bg-elevated">
            <Terminal size={32} className="text-text-muted" />
          </div>
          <div>
            <p className="text-text-primary font-medium">No results to show</p>
            <p className="text-text-muted text-sm">Run your code to see execution metrics and outputs.</p>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-border bg-bg-base/30 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-text-secondary">
            <Clock size={12} />
            <span>Exec Time:</span>
          </div>
          <span className="text-text-primary font-mono">-- ms</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-text-secondary">
            <Database size={12} />
            <span>Memory:</span>
          </div>
          <span className="text-text-primary font-mono">-- MB</span>
        </div>
      </div>
    </div>
  );
};

export default OutputPanel;
