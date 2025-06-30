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

// Monaco language map (VSCode language identifiers)
const languageMap = {
  cpp: 'cpp',
  c: 'c',
  java: 'java',
  py: 'python',
  javascript: 'javascript',
};

const CodeEditor = ({ code, onCodeChange, language, onLanguageChange }) => {
  const [output, setOutput] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('editor');

  const handleRunCode = async () => {
    if (!code.trim()) {
      toast.warning('Please write some code before running.');
      return;
    }

    setIsRunning(true);
    setOutput('');
    setActiveTab('output');

    try {
      const data = await runCode(language, code, customInput);
      setOutput(data.output);
      toast.success('Code ran successfully!');
    } catch (error) {
      let outputMessage = 'An unknown error occurred.';
      let toastMessage = 'Execution Failed';

      const fullErrorString = error?.error || error?.stderr;
      if (typeof fullErrorString === 'string') {
        const parts = fullErrorString.split(': error: ');
        if (parts.length > 1) {
          const errorType = parts[0].split(':')[0].trim();
          const errorDetails = `error: ${parts.slice(1).join(': error: ')}`;
          outputMessage = `${errorType}:\n\n${errorDetails}`;
          toastMessage = errorType;
        } else {
          outputMessage = fullErrorString;
        }
      } else {
        outputMessage = error?.message || JSON.stringify(error);
        toastMessage = error?.message || 'Execution Failed';
      }

      setOutput(outputMessage);
      toast.error(toastMessage);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] w-full rounded-2xl border border-[#2f3542] bg-gradient-to-br from-[#0e111a] to-[#1a1f2e] shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-2 bg-[#161b22] border-b border-[#30363d]">
        <div className="flex items-center gap-3">
          <Terminal className="text-[#00ffa3] w-5 h-5" />
          <Select value={language} onValueChange={onLanguageChange}>
            <SelectTrigger className="w-36 h-8 bg-[#21262d] border border-[#30363d] text-white text-sm">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent className="bg-[#161b22] text-white border border-[#30363d]">
              <SelectItem value="c">C</SelectItem>
              <SelectItem value="cpp">C++</SelectItem>
              <SelectItem value="java">Java</SelectItem>
              <SelectItem value="py">Python</SelectItem>
              <SelectItem value="javascript">JavaScript</SelectItem>
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

      {/* Tabs */}
      <div className="flex bg-[#0f1117] text-sm text-white border-b border-[#30363d]">
        {['editor', 'input', 'output'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 transition-all duration-200 border-b-2 font-semibold uppercase tracking-wide text-xs sm:text-sm md:text-base lg:text-sm xl:text-base ${
              activeTab === tab ? 'border-[#00ffa3] text-[#00ffa3]' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Panels */}
      <div className="flex-grow bg-[#0e111a]">
        {activeTab === 'editor' && (
          <MonacoEditor
            height="100%"
            language={languageMap[language] || 'plaintext'}
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
        )}

        {activeTab === 'input' && (
          <div className="p-6">
            <div className="text-sm font-bold text-blue-400 mb-2">CUSTOM INPUT</div>
            <textarea
              rows={8}
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              className="w-full h-full bg-[#1a1d25] text-white text-sm font-mono rounded-md p-3 border border-[#2f3542] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Enter input for your program here..."
            />
          </div>
        )}

        {activeTab === 'output' && (
          <div className="p-6">
            <div className="text-sm font-bold text-[#00ffa3] mb-2">OUTPUT</div>
            <div className="bg-[#1a1d25] text-white text-sm font-mono rounded-md p-3 whitespace-pre-wrap break-words leading-relaxed border border-[#2f3542] shadow-inner min-h-[120px]">
              {output || '// Click "Run Code" to see output.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeEditor;
