import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import OutputPanel from './components/OutputPanel';
import { Code2, Play, Database, RefreshCw, PlusCircle, FileCode } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

const VERDICT_LABELS = {
  AC: 'Accepted',
  WA: 'Wrong Answer',
  TLE: 'Execution Timeout Exceeded',
  RTE: 'Runtime Error',
  CE: 'Compilation Error',
  SYSTEM_ERROR: 'System Error',
  PENDING: 'Pending',
  RUNNING: 'Running'
};

const DEFAULT_SNIPPETS = {
  cpp: `#include <iostream>
using namespace std;

int main() {
    int a, b;
    if (cin >> a >> b) {
        cout << a + b << endl;
    }
    return 0;
}`,
  python: `import sys

# Read input from standard input
line = sys.stdin.readline()
if line:
    a, b = map(int, line.split())
    print(a + b)`,
  javascript: `const fs = require('fs');

// Read input from standard input
const input = fs.readFileSync(0, 'utf-8').trim();
if (input) {
    const [a, b] = input.split(/\\s+/).map(Number);
    console.log(a + b);
}`
};

export default function App() {
  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState(DEFAULT_SNIPPETS.cpp);
  const [stdin, setStdin] = useState('5 10');
  const [expectedOutput, setExpectedOutput] = useState('15');
  const [activeSubmission, setActiveSubmission] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [history, setHistory] = useState([]);
  const [pollingId, setPollingId] = useState(null);

  // Fetch submission history
  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/submissions`);
      setHistory(res.data || []);
    } catch (err) {
      console.error('Failed to fetch submission history:', err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchHistory();
  }, []);

  // Clean up polling interval on unmount to prevent leaks
  useEffect(() => {
    return () => {
      if (pollingId) {
        clearInterval(pollingId);
      }
    };
  }, [pollingId]);

  // Update default code when language changes
  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    setCode(DEFAULT_SNIPPETS[lang]);
  };

  // Run Code submission & polling logic
  const handleRunCode = async () => {
    setIsRunning(true);
    setActiveSubmission(null);
    if (pollingId) clearInterval(pollingId);

    try {
      // POST the submission
      const res = await axios.post(`${API_BASE_URL}/submissions`, {
        code,
        language,
        testCases: [
          { input: stdin, expectedOutput }
        ]
      });

      const subId = res.data.submissionId;

      // Start Polling REST API every 1.5s
      const interval = setInterval(async () => {
        try {
          const checkRes = await axios.get(`${API_BASE_URL}/submissions/${subId}`);
          const subData = checkRes.data;

          if (subData.verdict !== 'PENDING' && subData.verdict !== 'RUNNING') {
            clearInterval(interval);
            setIsRunning(false);
            setActiveSubmission(subData);
            setPollingId(null);
            fetchHistory(); // Refresh history log list
          }
        } catch (err) {
          console.error('Polling error:', err);
          clearInterval(interval);
          setIsRunning(false);
          setPollingId(null);
        }
      }, 1500);

      setPollingId(interval);

    } catch (err) {
      console.error('Execution submit error:', err);
      setIsRunning(false);
    }
  };

  // View a past submission from history
  const handleViewSubmission = async (id) => {
    if (pollingId) clearInterval(pollingId);
    setPollingId(null);
    setIsRunning(false);

    try {
      const res = await axios.get(`${API_BASE_URL}/submissions/${id}`);
      setActiveSubmission(res.data);
      // Load details into editor for review
      setCode(res.data.code);
      setLanguage(res.data.language);
      
      // Load first testcase values
      if (res.data.testCases && res.data.testCases.length > 0) {
        setStdin(res.data.testCases[0].input || '');
        setExpectedOutput(res.data.testCases[0].expectedOutput || '');
      }
    } catch (err) {
      console.error('Failed to fetch submission details:', err);
    }
  };

  // Clean state to compose new code
  const handleNewSubmission = () => {
    if (pollingId) clearInterval(pollingId);
    setPollingId(null);
    setIsRunning(false);
    setActiveSubmission(null);
    setCode(DEFAULT_SNIPPETS[language]);
  };

  return (
    <div className="app-container">
      {/* Integrated Header */}
      <header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Code2 style={{ color: 'var(--color-accent)', width: '22px', height: '22px' }} />
          <h1 style={{ fontSize: '15px', fontWeight: 'bold', letterSpacing: '0.05em', margin: 0 }}>
            Secure Code Execution Platform
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={handleNewSubmission} style={{ padding: '6px 12px', fontSize: '12px', width: 'auto' }}>
            <PlusCircle style={{ width: '14px', height: '14px' }} /> New Code
          </button>
        </div>
      </header>

      {/* Workspace */}
      <main className="main-content">
        
        {/* Monaco Editor Section */}
        <div className="editor-section">
          <div style={{
            height: '50px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            backgroundColor: 'rgba(255,255,255,0.01)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileCode style={{ color: 'var(--color-text-muted)', width: '16px', height: '16px' }} />
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Source Code</span>
            </div>
            
            {/* Language Selector */}
            <div style={{ width: '140px' }}>
              <select className="select-control" value={language} onChange={handleLanguageChange} style={{ padding: '6px 10px', fontSize: '12px' }}>
                <option value="cpp">C++ (GCC 13)</option>
                <option value="python">Python (3.11)</option>
                <option value="javascript">Node.js (18)</option>
              </select>
            </div>
          </div>

          {/* Editor Embed */}
          <div style={{ flex: 1, position: 'relative', textAlign: 'left' }}>
            <Editor
              height="100%"
              language={language === 'cpp' ? 'cpp' : language === 'javascript' ? 'javascript' : 'python'}
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || '')}
              options={{
                fontSize: 14,
                fontFamily: 'var(--font-mono)',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 12, bottom: 12 }
              }}
            />
          </div>

          {/* Editor Footer: Test Inputs & Run Button */}
          <div style={{
            borderTop: '1px solid var(--color-border)',
            padding: '20px',
            backgroundColor: 'rgba(255,255,255,0.01)'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 180px', gap: '15px', alignItems: 'end', textAlign: 'left' }}>
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '6px' }}>Stdin</label>
                <textarea
                  className="textarea-control"
                  value={stdin}
                  onChange={(e) => setStdin(e.target.value)}
                  placeholder="e.g. 5 10"
                  style={{ minHeight: '44px', height: '44px', padding: '10px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '6px' }}>Expected Output</label>
                <textarea
                  className="textarea-control"
                  value={expectedOutput}
                  onChange={(e) => setExpectedOutput(e.target.value)}
                  placeholder="e.g. 15"
                  style={{ minHeight: '44px', height: '44px', padding: '10px' }}
                />
              </div>
              <div>
                <button className="btn btn-primary" onClick={handleRunCode} disabled={isRunning} style={{ height: '44px' }}>
                  {isRunning ? (
                    <>
                      <RefreshCw className="loader" style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play style={{ width: '16px', height: '16px', fill: 'currentColor' }} />
                      Run Code
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Output & History Sidebar Panel */}
        <div className="sidebar-section">
          {/* Active Outputs */}
          <OutputPanel submission={activeSubmission} isRunning={isRunning} />

          {/* Submission History Log */}
          <div className="panel" style={{ flex: 1, borderBottom: 'none' }}>
            <div className="panel-title">
              <Database style={{ width: '14px', height: '14px' }} /> History Log
            </div>
            
            {history.length === 0 ? (
              <div style={{ color: 'var(--color-text-muted)', fontSize: '12px', textAlign: 'center', padding: '30px 0' }}>
                No submissions yet.
              </div>
            ) : (
              <div className="history-list">
                {history.map((item) => (
                  <div
                    key={item._id}
                    className={`history-item ${activeSubmission?._id === item._id ? 'active' : ''}`}
                    onClick={() => handleViewSubmission(item._id)}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#fff' }}>
                        {item.language.toUpperCase()} Submission
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                        {new Date(item.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    {/* Status Badge */}
                    <span style={{
                      fontSize: '9px',
                      fontWeight: '800',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      border: '1px solid rgba(255,255,255,0.05)',
                      backgroundColor: item.verdict === 'AC' 
                        ? 'rgba(46, 204, 113, 0.1)' 
                        : item.verdict === 'RUNNING' 
                        ? 'rgba(102, 252, 241, 0.1)'
                        : item.verdict === 'PENDING'
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(231, 76, 60, 0.1)',
                      color: item.verdict === 'AC' 
                        ? 'var(--color-success)' 
                        : item.verdict === 'RUNNING'
                        ? 'var(--color-accent)'
                        : item.verdict === 'PENDING'
                        ? 'var(--color-text-secondary)'
                        : 'var(--color-error)'
                    }}>
                      {VERDICT_LABELS[item.verdict] || item.verdict}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
