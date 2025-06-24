import React, { useState } from 'react';
import { toast } from 'sonner';
import { runCode } from '../context/problemfetch';
import { Loader2, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    <div className="flex flex-col h-full w-full rounded-2xl border border-[#2f3542] bg-gradient-to-br from-[#0e111a] to-[#1a1f2e] shadow-[0_0_20px_rgba(0,0,0,0.3)] backdrop-blur-md overflow-hidden">

      {/* Header */}
      <div className="flex justify-between items-center px-4 py-2 bg-[#161b22] border-b border-[#30363d]">
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

        <Button
          onClick={handleRunCode}
          disabled={isRunning}
          className="h-8 px-4 text-sm bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-all duration-200 ease-in-out flex items-center gap-2 rounded-md"
        >
          {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
          {isRunning ? 'Running...' : 'Run Code'}
        </Button>
      </div>

      {/* Code Editor */}
      <div className="flex-grow min-h-[300px]">
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
            padding: { top: 10 },
          }}
        />
      </div>

      {/* Output Panel */}
      <div className="bg-[#1c1f26] px-4 py-3 border-t border-[#30363d] max-h-60 overflow-auto">
        <div className="text-sm font-semibold mb-1 text-slate-400">Output:</div>
        <pre className="text-sm text-slate-200 whitespace-pre-wrap break-words font-mono leading-relaxed">
          {output || '// Click "Run Code" to see output.'}
        </pre>
      </div>
    </div>
  );
};

export default CodeEditor;
