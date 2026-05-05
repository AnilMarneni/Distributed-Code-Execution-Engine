"use client";

import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import CodeEditor from "@/components/editor/CodeEditor";
import OutputPanel from "@/components/output/OutputPanel";
import axios from "axios";
import { useSocket } from "@/hooks/useSocket";

export default function Home() {
  const [code, setCode] = useState('// Write your code here...\n\n#include <iostream>\n\nint main() {\n    std::cout << "Hello Engine!" << std::endl;\n    return 0;\n}');
  const [language, setLanguage] = useState("cpp");
  const [jobId, setJobId] = useState<string | undefined>(undefined);
  const [isRunning, setIsRunning] = useState(false);
  
  // Use WebSocket for real-time results
  const { result: socketResult } = useSocket(jobId);

  const handleRun = async () => {
    setIsRunning(true);
    setJobId(undefined);
    
    try {
      const response = await axios.post("http://localhost:3000/api/v1/submit", {
        code,
        language,
        testCases: [
          { input: "", expectedOutput: "Hello Engine!\n" }
        ]
      });
      
      setJobId(response.data.data.jobId);
    } catch (error: any) {
      console.error("Submission failed", error);
      alert(error.response?.data?.error?.message || "Failed to submit code");
      setIsRunning(false);
    }
  };

  return (
    <main className="h-screen flex flex-col bg-bg-base overflow-hidden">
      <Navbar onRun={handleRun} isRunning={isRunning} language={language} onLanguageChange={setLanguage} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex overflow-hidden">
          <CodeEditor code={code} language={language} onChange={(v) => setCode(v || "")} />
          <OutputPanel result={socketResult} isRunning={isRunning} />
        </div>
      </div>
    </main>
  );
}
