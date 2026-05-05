"use client";

import React from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  language?: string;
  code?: string;
  onChange?: (value: string | undefined) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ 
  language = 'cpp', 
  code = '// Write your code here...\n\n#include <iostream>\n\nint main() {\n    std::cout << "Hello Engine!" << std::endl;\n    return 0;\n}', 
  onChange 
}) => {
  return (
    <div className="flex-1 h-full overflow-hidden bg-[#1e1e1e]">
      <Editor
        height="100%"
        defaultLanguage={language}
        defaultValue={code}
        theme="vs-dark"
        onChange={onChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: 'var(--font-mono)',
          lineHeight: 1.6,
          padding: { top: 20 },
          smoothScrolling: true,
          cursorSmoothCaretAnimation: "on",
          cursorBlinking: "expand",
          renderLineHighlight: "all",
          scrollbar: {
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
          }
        }}
      />
    </div>
  );
};

export default CodeEditor;
