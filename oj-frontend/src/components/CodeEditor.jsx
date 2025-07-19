import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { runCode } from '../context/problemfetch';
import { Loader2, PlayCircle, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
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
  c: 'c',
  java: 'java',
  py: 'python',
};

const CodeEditor = ({
  code,
  onCodeChange,
  language,
  onLanguageChange,
  submissionResult,
  readOnly = false,
  onMount, // This prop can be handleCodeEditorMount or null from ProblemDetailPage
  height = 'calc(100vh - 120px)',
  isInCollabSession // Ensure this is destructured
}) => {
  const [output, setOutput] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [customInput, setCustomInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('input');
  const { user } = useAuth(); // Assuming this is used for runCode auth

  useEffect(() => {
    if (submissionResult) {
      setOutput(submissionResult);
      setActiveTab('output');
    }
  }, [submissionResult]);

  const handleRunCode = async () => {
    if(!user){
      toast.error('Please log in to run code.');
      navigate('/login', { state: { from: location } });
      return;
    }
    if (!code.trim()) {
      toast.warning('Please write some code before running.');
      return;
    }

    setIsRunning(true);
    setOutput('');
    setActiveTab('output');

    try {
      const currentCode = code;
      const data = await runCode(language, currentCode, customInput);
      setOutput(data.output);
      toast.success('Code ran successfully!');
    } catch (error) {
      let outputMessage = error?.error || error?.stderr || error?.message || 'An unknown error occurred.';
      setOutput(outputMessage);
      toast.error('Execution Failed');
    } finally {
      setIsRunning(false);
    }
  };

  // --- CRITICAL FIX for onMount prop ---
  // Ensure onMount passed to MonacoEditor is always a function, never null.
  // If the prop `onMount` from parent is null, use a no-op function instead.
  const monacoEditorOnMount = typeof onMount === 'function' ? onMount : () => {}; // <--- EXACT CHANGE HERE

  return (
    <div style={{ height }} className="flex flex-col w-full rounded-2xl border border-[#2f3542] bg-gradient-to-br from-[#0e111a] to-[#1a1f2e] shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden">
      {/* Editor Controls */}
      {!readOnly && (
        <div className="flex justify-between items-center px-4 py-2 bg-[#161b22] border-b border-[#30363d]">
          {/* Language Selector */}
          <div className="flex items-center gap-3">
            <Code className="text-[#00ffa3] w-5 h-5" />
            <Select value={language} onValueChange={onLanguageChange}>
              <SelectTrigger className="w-36 h-8 bg-[#21262d] border border-[#30363d] text-white text-sm">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent className="bg-[#161b22] text-white border border-[#30363d]">
                <SelectItem value="c">C</SelectItem>
                <SelectItem value="cpp">C++</SelectItem>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="py">Python</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Run Code Button */}
          <Button onClick={handleRunCode} disabled={isRunning} className="h-8 px-4 text-sm bg-gradient-to-r from-[#00d4ff] to-[#00ffa3] hover:from-[#00ffa3] hover:to-[#00d4ff] text-black font-semibold">
            {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
            <span className="ml-2">{isRunning ? 'Running...' : 'Run Code'}</span>
          </Button>
        </div>
      )}
      {/* Editor and IO Panel */}
      <div className="flex flex-row flex-grow overflow-hidden">
        <div className={readOnly ? "w-full h-full" : "w-3/5 h-full"}>
          <MonacoEditor
            height="100%"
            language={languageMap[language] || 'plaintext'}
            {...(!isInCollabSession && { value: code, onChange: onCodeChange })}
            onMount={monacoEditorOnMount} // <--- USE THE NEW LOCAL VARIABLE HERE
            theme="vs-dark"
            options={{ readOnly, fontSize: 15 }}
          />
        </div>
        {!readOnly && (
           <div className="w-2/5 h-full flex flex-col border-l border-[#30363d]">
            <div className="flex-shrink-0 flex bg-[#0f1117] text-sm text-white border-b border-[#30363d]">
              {['input', 'output'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 transition-all duration-200 border-b-2 font-semibold uppercase tracking-wide text-xs ${
                    activeTab === tab ? 'border-[#00ffa3]' : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex-grow overflow-y-auto bg-[#0e111a]">
              {activeTab === 'input' && (
                <div className="p-4 h-full">
                  <label className="text-sm font-bold text-blue-400 mb-2 block">CUSTOM INPUT</label>
                  <textarea
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    className="w-full h-[calc(100%-24px)] bg-[#1a1d25] text-white text-sm font-mono rounded-md p-3 border border-[#2f3542] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Enter input for your program here..."
                  />
                </div>
              )}
              {activeTab === 'output' && (
                <div className="p-4">
                  <div className="text-sm font-bold text-[#00ffa3] mb-2">OUTPUT</div>
                  <div className="bg-[#1a1d25] text-white text-sm font-mono rounded-md p-3 whitespace-pre-wrap break-words leading-relaxed border border-[#2f3542] shadow-inner min-h-[100px]">
                    {output || '// Click "Run Code" to see output.'}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeEditor;