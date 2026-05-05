"use client";

import React from 'react';
import { Terminal, CheckCircle2, XCircle, Clock, Database, Loader2 } from 'lucide-react';

interface OutputPanelProps {
  result?: any;
  isRunning: boolean;
}

const OutputPanel: React.FC<OutputPanelProps> = ({ result, isRunning }) => {
  return (
    <div className="w-[400px] border-l border-border bg-bg-surface flex flex-col overflow-hidden">
      <div className="h-10 border-b border-border px-4 flex items-center justify-between bg-bg-base/50">
        <div className="flex items-center space-x-2 text-text-secondary text-xs font-bold tracking-wider uppercase">
          <Terminal size={14} />
          <span>Output & Results</span>
        </div>
        {result && (
            <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${result.status === 'ACCEPTED' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                {result.status}
            </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {!result && !isRunning && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
            <div className="p-4 rounded-full bg-bg-elevated">
                <Terminal size={32} className="text-text-muted" />
            </div>
            <div>
                <p className="text-text-primary font-medium">No results to show</p>
                <p className="text-text-muted text-sm">Run your code to see execution metrics and outputs.</p>
            </div>
            </div>
        )}

        {isRunning && !result && (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <Loader2 size={32} className="text-accent animate-spin" />
                <p className="text-text-secondary text-sm font-medium animate-pulse">Waiting for worker...</p>
            </div>
        )}

        {result && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {result.testCases?.map((tc: any, i: number) => (
                    <div key={i} className="p-3 rounded-lg bg-bg-elevated border border-border">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">Test Case #{i+1}</span>
                            {tc.status === 'ACCEPTED' ? <CheckCircle2 size={16} className="text-green-500" /> : <XCircle size={16} className="text-red-500" />}
                        </div>
                        <pre className="text-sm font-mono text-text-primary bg-black/30 p-2 rounded border border-white/5 overflow-x-auto">
                            {tc.output || 'No output'}
                        </pre>
                        {tc.status !== 'ACCEPTED' && (
                            <p className="text-[10px] text-red-400 mt-2 font-medium italic">Expected: {tc.expectedOutput}</p>
                        )}
                    </div>
                ))}
            </div>
        )}
      </div>

      <div className="p-4 border-t border-border bg-bg-base/30 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-text-secondary">
            <Clock size={12} />
            <span>Exec Time:</span>
          </div>
          <span className="text-text-primary font-mono">{result?.testCases?.[0]?.timeTaken || '--'} ms</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-text-secondary">
            <Database size={12} />
            <span>Memory:</span>
          </div>
          <span className="text-text-primary font-mono">{result?.testCases?.[0]?.memoryUsed || '--'} MB</span>
        </div>
      </div>
    </div>
  );
};

export default OutputPanel;
