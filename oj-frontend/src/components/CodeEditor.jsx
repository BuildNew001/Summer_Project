import React, { useState } from 'react';
import { toast } from 'sonner';
import { runCode } from '../context/problemfetch';
import { Loader2, PlayCircle, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import MonacoEditor from '@monaco-editor/react';

const languageMap = {
  cpp: 'cpp',
  python: 'python',
  javascript: 'javascript',
};

const CodeEditor = ({ code, onCodeChange, language, onLanguageChange }) => {
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const handleRunCode = async () => {
    if (!code.trim()) {
      toast.warning('Please write some code before running.');
      return;
    }

    setIsRunning(true);
    setOutput('');
    try {
      const data = await runCode(language, code);
      setOutput(data.output);
      toast.success('Code ran successfully!');
    } catch (error) {
      const errorMessage = error.output || error.message || 'Failed to run code.';
      setOutput(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full rounded-2xl border border-[#2f3542] bg-gradient-to-br from-[#0e111a] to-[#1a1f2e] shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-md overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-2 bg-[#161b22] border-b border-[#30363d]">
        <div className="flex items-center gap-3">
          <Terminal className="text-[#00ffa3] w-5 h-5" />
          <Select value={language} onValueChange={onLanguageChange}>
            <SelectTrigger className="w-36 h-8 bg-[#21262d] border border-[#30363d] text-white text-sm">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent className="bg-[#161b22] text-white border border-[#30363d]">
              <SelectItem value="cpp">C++</SelectItem>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleRunCode}
          disabled={isRunning}
          className="h-8 px-4 text-sm bg-gradient-to-r from-[#00d4ff] to-[#00ffa3] hover:from-[#00ffa3] hover:to-[#00d4ff] text-black font-semibold transition-all duration-200 ease-in-out flex items-center gap-2 rounded-xl shadow-md hover:shadow-lg"
        >
          {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
          {isRunning ? 'Running...' : 'Run Code'}
        </Button>
      </div>

      {/* Code Editor */}
      <div className="flex-grow min-h-[300px] border-b border-[#30363d]">
        <MonacoEditor
          height="100%"
          language={languageMap[language]}
          value={code}
          onChange={(value) => onCodeChange(value)}
          theme="vs-dark"
          options={{
            fontSize: 14,
            fontFamily: 'Fira Code, monospace',
            fontLigatures: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            tabSize: 2,
            automaticLayout: true,
            padding: { top: 12, bottom: 12 },
            lineNumbers: 'on',
            roundedSelection: false,
            cursorSmoothCaretAnimation: true,
            scrollbar: {
              verticalScrollbarSize: 5,
              horizontalScrollbarSize: 5,
            },
          }}
        />
      </div>

      {/* Output Panel */}
      <div className="bg-[#0f1117] px-6 py-4 max-h-64 overflow-auto border-t border-[#30363d] animate-in fade-in duration-300">
        <div className="text-sm font-bold text-[#00ffa3] mb-2 tracking-wide flex items-center gap-2">
          <span className="bg-[#00ffa3]/10 px-2 py-0.5 rounded text-xs text-[#00ffa3]">OUTPUT</span>
        </div>
        <div className="bg-[#1a1d25] text-white text-sm font-mono rounded-md p-3 whitespace-pre-wrap break-words leading-relaxed border border-[#2f3542] shadow-inner">
          {output || '// Click "Run Code" to see output.'}
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;