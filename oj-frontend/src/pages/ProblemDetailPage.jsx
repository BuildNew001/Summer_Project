import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, ArrowLeft, Sparkles, X, Users, Copy, LogOut } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { fetchProblemById, submitCode, getAIReview, fetchSubmissionById } from '../context/problemfetch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import CodeEditor from '../components/CodeEditor';
import ChatPanel from '../components/ChatPanel';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import { getAvatarUrl, cn } from '../lib/utils';

// Boilerplate code per language
const boilerplate = {
  cpp: `#include <iostream>
int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}`,
  c: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
  py: `# Your Python code here
print("Hello, World!")`,
};

const difficultyColorMap = {
  Easy: 'bg-emerald-500',
  Medium: 'bg-amber-500',
  Hard: 'bg-rose-500',
};

const AIReviewModal = ({ isOpen, onClose, isLoading, reviewContent }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-[#111827] rounded-2xl p-8 shadow-2xl border border-cyan-700 max-w-3xl w-full relative max-h-[90vh] flex flex-col">
        <Button onClick={onClose} className="absolute top-3 right-3 text-slate-400 hover:text-black" variant="ghost" size="icon">
          <X className="h-5 w-5" />
        </Button>
        <h2 className="text-2xl font-bold mb-4 text-cyan-400 flex items-center gap-2">
          <Sparkles className="h-6 w-6" />
          <span>AI For Edge Case</span>
        </h2>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center flex-grow min-h-[200px]">
            <Loader2 className="h-12 w-12 animate-spin text-cyan-400" />
            <p className="mt-4 text-slate-300">Analyzing your code... This may take a moment.</p>
          </div>
        ) : (
          <div className="prose prose-invert max-w-none text-slate-300 overflow-y-auto pr-4">
            <ReactMarkdown>{reviewContent}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};
const MainContent = React.memo(({
  problem,
  language,
  setLanguage,
  code,
  handleCodeChange,
  handleCursorChange,
  cursors,
  submissionResult,
  isInCollabSession,
  activeCollabSession,
  handleCopyLink,
  handleEndCollaboration,
  handleLeaveCollaboration,
  handleAiReview,
  isAiReviewing,
  isSubmitting,
  handleSubmit,
  sessionId,
  handleCollaboration,
}) => (
    <div className="flex flex-col gap-10 h-full overflow-y-auto pr-2">
        {/* Problem Description */}
        <div className="bg-[#111827] rounded-3xl p-8 shadow-[0_0_40px_rgba(0,255,255,0.1)] border border-cyan-900 overflow-auto">
          <Link to="/problems" className="inline-flex items-center text-cyan-400 hover:text-cyan-300 mb-5">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Problem List
          </Link>

          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-extrabold text-white drop-shadow-md tracking-tight">
              {problem.title}
            </h1>
            <Badge className={`text-white px-3 py-1 rounded-xl text-sm ${difficultyColorMap[problem.difficulty]}`}>
              {problem.difficulty}
            </Badge>
          </div>

          <div className="prose prose-invert text-slate-300 mb-6 max-w-none prose-p:leading-relaxed prose-p:my-2">
            <ReactMarkdown>{problem.description}</ReactMarkdown>
          </div>

          {problem.examples?.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-white mb-3">Examples</h3>
              <div className="space-y-4">
                {problem.examples.map((ex, index) => (
                  <div key={index} className="bg-gray-800/40 p-4 rounded-xl shadow-inner border border-gray-700">
                    <p className="text-white font-semibold">Example {index + 1}</p>
                    <pre className="text-sm text-slate-300 mt-2 whitespace-pre-wrap">
                      <strong>Input:</strong> {ex.input}
                      <br />
                      <strong>Output:</strong> {ex.output}
                      {ex.explanation && (
                        <>
                          <br />
                          <strong>Explanation:</strong> {ex.explanation}
                        </>
                      )}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}

          {problem.sampleTestCases?.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-white mb-3">Sample Test Cases</h3>
              <div className="space-y-3">
                {problem.sampleTestCases.map((test, index) => (
                  <div key={test._id || index} className="bg-gray-800/40 p-4 rounded-lg border border-gray-700">
                    <p className="text-sm text-slate-200"><strong>Input:</strong> {test.input}</p>
                    <p className="text-sm text-slate-200"><strong>Expected Output:</strong> {test.output}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {problem.constraints && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-white mb-3">Constraints</h3>
              <ul className="list-disc pl-6 text-slate-300 space-y-1">
                {Array.isArray(problem.constraints) ? (
                  problem.constraints.map((c, i) => <li key={i}>{c}</li>)
                ) : (
                  <li>{problem.constraints}</li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Code Editor */}
        <div className="flex flex-col gap-6 bg-[#111827] rounded-3xl p-6 border border-[#2f3542] shadow-2xl">
          {isInCollabSession && (
            <div className={cn(
              "bg-gradient-to-r from-purple-900/30 to-indigo-900/30 p-4 rounded-xl border border-purple-700 animate-fade-in shadow-lg shadow-purple-500/10",
              activeCollabSession?.isHost && "animate-pulse"
            )}>
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Users className="h-7 w-7 text-purple-300" />
                    <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-[#111827] animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-purple-200">Live Collaboration Active</h3>
                    <p className="text-sm text-slate-400">You are in a live coding session.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button onClick={handleCopyLink} variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                          <Copy className="mr-2 h-4 w-4" /> Copy Invite Link
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-800 text-white border-slate-700">
                        <p>Copy a link to invite others to this session.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {activeCollabSession?.isHost ? (
                    <Button onClick={handleEndCollaboration} variant="destructive" size="sm"><X className="mr-2 h-4 w-4" /> End Session</Button>
                  ) : (
                    <Button onClick={handleLeaveCollaboration} variant="destructive" size="sm"><LogOut className="mr-2 h-4 w-4" /> Leave Session</Button>
                  )}
                </div>
              </div>
            </div>
          )}
          <CodeEditor
            language={language}
            onLanguageChange={setLanguage}
            code={code}
            onCodeChange={handleCodeChange}
            onCursorChange={handleCursorChange}
            cursors={cursors}
            submissionResult={submissionResult}
          />

          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <Button
              onClick={handleAiReview}
              disabled={isAiReviewing || isSubmitting || !code.trim() || isInCollabSession}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-xl text-sm font-semibold px-6 py-3 rounded-xl"
            >
              {isAiReviewing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Getting Review...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> AI For Edge Case
                </>
              )}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || isAiReviewing || !code.trim() || isInCollabSession}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-xl text-sm font-semibold px-6 py-3 rounded-xl"
            >
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
              ) : (
                'Submit Solution'
              )}
            </Button>
            {!sessionId && (
              <Button
                onClick={handleCollaboration}
                disabled={isSubmitting || isAiReviewing}
                className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-xl text-sm font-semibold px-6 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                title={activeCollabSession ? 'You appear to be in a session. Please refresh if this is an error.' : 'Start a live collaboration session'}
              >
                <><Users className="mr-2 h-4 w-4" /> Start Collab</>
              </Button>
            )}
          </div>
        </div>
    </div>
));

const ProblemDetailPage = () => {
  const { id, sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, socket, startCollabSession, activeCollabSession, endCollabSession, leaveCollabSession } = useAuth();
  const [problem, setProblem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState('');
  const [participants, setParticipants] = useState({});
  const prevParticipantsRef = useRef({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiReviewing, setIsAiReviewing] = useState(false);
  const [aiReviewContent, setAiReviewContent] = useState('');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [submissionResult, setSubmissionResult] = useState('');
  const [currentSubmissionId, setCurrentSubmissionId] = useState(null);
  const [cursors, setCursors] = useState({});
  const [chatMessages, setChatMessages] = useState([]);
  const [hostId, setHostId] = useState(null);

  const isInCollabSession = !!sessionId && activeCollabSession && activeCollabSession.roomId === sessionId;
  useEffect(() => {
    if (sessionId && user && socket && id && !activeCollabSession) {
      startCollabSession(sessionId, id, false);
    }
  }, [sessionId, user, socket, id, activeCollabSession, startCollabSession]);

  useEffect(() => {
    const getProblem = async () => {
      try {
        setIsLoading(true);
        const data = await fetchProblemById(id);
        setProblem(data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch problem details.');
      } finally {
        setIsLoading(false);
      }
    };

    getProblem();
  }, [id]);

  useEffect(() => {
    if (!problem || isInCollabSession) return;

    const savedCode = localStorage.getItem(`code-${id}-${language}`);
    if (savedCode) {
      setCode(savedCode);
      return;
    }

    const defaultCode = problem.defaultCode?.[language];
    setCode(defaultCode && defaultCode.trim() ? defaultCode : boilerplate[language]);
  }, [id, language, problem, isInCollabSession]);

  useEffect(() => {
    if (!sessionId || !socket) { 
      if (Object.keys(participants).length > 0) setParticipants({});
      setCursors({});
      if (chatMessages.length > 0) setChatMessages([]);
      prevParticipantsRef.current = {};
      return;
    }
    if (isInCollabSession && socket) {
      socket.emit('join-room', { roomId: sessionId });
    }

    const handleUsersUpdate = ({ users, hostId: newHostId }) => {
      const prevUsers = prevParticipantsRef.current;
      if (Object.keys(prevUsers).length > 0) {
        const prevUserSocketIds = Object.keys(prevUsers);
        const newUserSocketIds = Object.keys(users);
        const joinedSocketIds = newUserSocketIds.filter(id => !prevUserSocketIds.includes(id));
        joinedSocketIds.forEach(socketId => {
          const newUser = users[socketId];
          if (newUser && newUser._id !== user?._id) { 
            toast.success(`${newUser.UserName} has joined the session.`, {
              style: { background: '#16a34a', color: 'white', border: '1px solid #15803d' },
            });
          }
        });
        const leftSocketIds = prevUserSocketIds.filter(id => !newUserSocketIds.includes(id));
        leftSocketIds.forEach(socketId => {
          const leftUser = prevUsers[socketId];
          if (leftUser) {
            toast.warning(`${leftUser.UserName} has left the session.`, {
              style: { background: '#dc2626', color: 'white', border: '1px solid #b91c1c' },
            });
          }
        });
      }

      setParticipants(users);
      setHostId(newHostId);
      prevParticipantsRef.current = users;
    };

    const handleCodeUpdate = (newCode) => setCode(newCode);

    const handleCursorUpdate = (data) => {
      if (data.socketId !== socket.id) {
        setCursors((prev) => ({ ...prev, [data.socketId]: data }));
      }
    };

    const handleNewChatMessage = (message) => {
      setChatMessages((prev) => [...prev, message]);
    };

    socket.on('users-update', handleUsersUpdate);
    socket.on('code-update', handleCodeUpdate);
    socket.on('cursor-update', handleCursorUpdate);
    socket.on('new-chat-message', handleNewChatMessage);

    return () => {
      socket.off('users-update', handleUsersUpdate);
      socket.off('code-update', handleCodeUpdate);
      socket.off('cursor-update', handleCursorUpdate);
      socket.off('new-chat-message', handleNewChatMessage);
    };
  }, [sessionId, socket, user?._id]);
  useEffect(() => {
    if (!isInCollabSession && chatMessages.length > 0 && !chatMessages.find(m => m.isSystem)) {
      setChatMessages(prev => [...prev, { isSystem: true, text: 'Session has ended.' }]);
    }
  }, [isInCollabSession, chatMessages]);

  const fetchFullSubmissionDetails = async (submissionId) => {
    try {
      const submission = await fetchSubmissionById(submissionId);
      const { status, executionTime, memoryUsed, output } = submission;

      setIsSubmitting(false);

      let resultText = `Verdict: ${status}\n`;
      if (executionTime != null) resultText += `Execution Time: ${executionTime.toFixed(2)} ms\n`;
      if (memoryUsed != null) resultText += `Memory Used: ${(memoryUsed / 1024).toFixed(2)} KB\n`;
      if (status !== 'Accepted') {
        resultText += `\nDetails:\n`;
        if (output) {
          try {
            const details = JSON.parse(output);
            if (typeof details === 'object' && details !== null && (details.input || details.userOutput)) {
              resultText += (details.message || `Failed on a test case`) + '\n\n';
              resultText += `Input:\n${details.input}\n\n`;
              resultText += `Your Output:\n${details.userOutput}\n\n`;
              resultText += `Expected Output:\n${details.expectedOutput}\n`;
            } else {
              resultText += output;
            }
          } catch (e) {
            resultText += output;
          }
        } else {
          resultText += 'No output available.';
        }
      }
      setSubmissionResult(resultText);

      if (status === 'Accepted') {
        toast.success('Congratulations! Your solution was accepted!');
      } else {
        toast.error(`Submission failed: ${status}`);
      }
    } catch (err) {
      setIsSubmitting(false);
      setSubmissionResult('Error fetching submission status. Please check "My Submissions" page.');
      toast.error('Could not get submission result.');
    } finally {
      setCurrentSubmissionId(null);
    }
  };
  useEffect(() => {
    if (!socket) return;

    const handleSubmissionUpdate = (data) => {
      if (data._id === currentSubmissionId) {
        const { status } = data;
        if (status && status !== 'Pending' && status !== 'In Queue') {
          fetchFullSubmissionDetails(data._id);
        } else {
          setSubmissionResult(`Status: ${status || 'In Queue'}...`);
        }
      }
    };

    socket.on('submission-update', handleSubmissionUpdate);

    return () => {
      socket.off('submission-update', handleSubmissionUpdate);
    };
  }, [socket, currentSubmissionId]);

  const handleSubmit = useCallback(async () => {
    if(!user){
      toast.error('Please log in to submit solutions.');
      navigate('/login', { state: { from: location } });
      return;
    }
    setIsSubmitting(true);
    setCurrentSubmissionId(null); 
    setSubmissionResult('Submitting your solution...');
    try {
      localStorage.setItem(`code-${id}-${language}`, code);
      const submissionResponse = await submitCode({
        problemId: id,
        language,
        code,
      });
      toast.success('Solution submitted! Waiting for verdict...');
      setSubmissionResult('Status: In Queue...');
      setCurrentSubmissionId(submissionResponse.submissionId);
    } catch (err) {
      toast.error(err.message || 'Failed to submit solution.');
      setIsSubmitting(false);
      setSubmissionResult(`Submission failed: ${err.message}`);
    }
  }, [user, navigate, location, id, language, code]);

  const handleAiReview = useCallback(async () => {
    if(!user){
      toast.error('Please log in to submit solutions.');
      navigate('/login', { state: { from: location } });
      return;
    }
    if (!code.trim()) {
      toast.warning('Please write some code to review.');
      return;
    }
    setIsAiReviewing(true);
    setIsAiModalOpen(true);
    setAiReviewContent('');
    try {
      const result = await getAIReview({ problemId: id, code });
      setAiReviewContent(result.review);
    } catch (err) {
      toast.error(err.message || 'An error occurred during AI review.');
      setAiReviewContent('Could not retrieve AI review. Please try again.');
    } finally {
      setIsAiReviewing(false);
    }
  }, [user, navigate, location, id, code]);

  const handleCollaboration = useCallback(() => {
    if (!user) {
      toast.error('Please log in to start a collaboration session.');
      navigate('/login', { state: { from: location } });
      return;
    }
    const newSessionId = uuidv4();
    const initialCode = boilerplate[language] || '';
    setCode(initialCode);
    startCollabSession(newSessionId, id, true); 
    navigate(`/problems/${id}/collab/${newSessionId}`);
  }, [user, navigate, location, id, startCollabSession, language, activeCollabSession]);

  const handleEndCollaboration = useCallback(() => {
  
    localStorage.setItem(`code-${id}-${language}`, code);
    endCollabSession();
  }, [endCollabSession, id, language, code]);

  const handleLeaveCollaboration = useCallback(() => {
    localStorage.setItem(`code-${id}-${language}`, code);
    leaveCollabSession();
  }, [leaveCollabSession, id, language, code]);

  const handleCodeChange = useCallback((newCode) => {
    setCode(newCode);
    if (isInCollabSession && socket) {
      socket.emit('code-change', { roomId: sessionId, code: newCode });
    }
  }, [isInCollabSession, socket, sessionId]);

  const handleCursorChange = useCallback((cursorPosition) => {
    if (isInCollabSession && socket) {
      socket.emit('cursor-move', { roomId: sessionId, cursorPosition });
    }
  }, [isInCollabSession, socket, sessionId]);

  const handleSendMessage = useCallback((text) => {
    if (isInCollabSession && socket) {
      socket.emit('chat-message', { roomId: sessionId, text });
    }
  }, [isInCollabSession, socket, sessionId]);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Invite link copied to clipboard!');
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#0a0f1e] to-[#101b3f]">
        <Loader2 className="h-16 w-16 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0f1e] text-center p-6">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-3xl font-bold text-white mb-2">Problem Not Found</h2>
        <p className="text-red-300 mb-6">{error || 'Unable to load the problem.'}</p>
        <Link to="/problems">
          <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Problems
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1e] to-[#111b30] text-white font-sans px-6 py-10 animate-fade-in-up">
      <AIReviewModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        isLoading={isAiReviewing}
        reviewContent={aiReviewContent}
      />
      {isInCollabSession ? (
        <ResizablePanelGroup direction="horizontal" className="max-w-full mx-auto rounded-lg h-[calc(100vh-80px)]">
          <ResizablePanel defaultSize={65}>
            <div className="h-full p-1">
              <MainContent
                problem={problem}
                language={language}
                setLanguage={setLanguage}
                code={code}
                handleCodeChange={handleCodeChange}
                handleCursorChange={handleCursorChange}
                cursors={cursors}
                submissionResult={submissionResult}
                isInCollabSession={isInCollabSession}
                activeCollabSession={activeCollabSession}
                handleCopyLink={handleCopyLink}
                handleEndCollaboration={handleEndCollaboration}
                handleLeaveCollaboration={handleLeaveCollaboration}
                handleAiReview={handleAiReview}
                isAiReviewing={isAiReviewing}
                isSubmitting={isSubmitting}
                handleSubmit={handleSubmit}
                sessionId={sessionId}
                handleCollaboration={handleCollaboration} />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={35}>
            <div className="h-full p-1 pl-2">
              <ChatPanel
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                isSessionActive={isInCollabSession}
                participants={participants}
                hostId={hostId} />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        <div className="max-w-7xl mx-auto">
          <MainContent
            problem={problem}
            language={language}
            setLanguage={setLanguage}
            code={code}
            handleCodeChange={handleCodeChange}
            handleCursorChange={handleCursorChange}
            cursors={cursors}
            submissionResult={submissionResult}
            isInCollabSession={isInCollabSession}
            activeCollabSession={activeCollabSession}
            handleCopyLink={handleCopyLink}
            handleEndCollaboration={handleEndCollaboration}
            handleLeaveCollaboration={handleLeaveCollaboration}
            handleAiReview={handleAiReview}
            isAiReviewing={isAiReviewing}
            isSubmitting={isSubmitting}
            handleSubmit={handleSubmit}
            sessionId={sessionId}
            handleCollaboration={handleCollaboration} />
        </div>
      )}
    </div>
  );
};

export default ProblemDetailPage;
